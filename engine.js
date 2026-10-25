// Solva autopilot: feed it a bank export and an invoice list, it does the bookkeeping and hands back the output.
// Pure functions, no network. app.js runs it in a Web Worker (falls back to the page); node can require it for tests.
(function (root) {
  'use strict';
  const r2 = (n) => Math.round((n + (n < 0 ? -1 : 1) * Number.EPSILON) * 100) / 100;
  const sum = (a, f = (x) => x) => r2(a.reduce((s, x) => s + f(x), 0));
  const dn = (iso) => Date.parse(iso + 'T00:00:00Z') / 864e5; // day number, for day gaps
  const isoOf = (d) => d.toISOString().slice(0, 10);

  /* ---------- plan comptable (simplified small-business chart) ---------- */
  const ACCOUNTS = {
    1010: ['Banque', 'Bank'],
    1200: ['Comptes clients', 'Accounts receivable'],
    1250: ['Remboursement à recevoir', 'Refund receivable'],
    1310: ['TPS à recevoir (CTI)', 'GST receivable (ITC)'],
    1320: ['TVQ à recevoir (RTI)', 'QST receivable (ITR)'],
    1500: ['Équipement', 'Equipment'],
    2310: ['TPS à payer', 'GST payable'],
    2320: ['TVQ à payer', 'QST payable'],
    2330: ['TPS/TVQ versées', 'GST/QST paid'],
    2700: ["Avance de l'actionnaire", 'Owner loan'],
    2999: ['À classer', 'To sort'],
    4000: ['Ventes', 'Sales'],
    4900: ['Intérêts gagnés', 'Interest earned'],
    5100: ['Matériaux et fournitures', 'Materials and supplies'],
    5200: ['Loyer', 'Rent'],
    5240: ['Électricité', 'Electricity'],
    5260: ['Téléphone et internet', 'Phone and internet'],
    5300: ['Essence et véhicule', 'Fuel and vehicle'],
    5400: ['Repas (50 %)', 'Meals (50%)'],
    5500: ['Assurances', 'Insurance'],
    5600: ['Salaires', 'Wages'],
    5700: ['Frais bancaires', 'Bank fees'],
    5800: ['Logiciels', 'Software'],
    5900: ['Sous-traitance et honoraires', 'Subcontracting and fees'],
  };
  // share of GST/QST paid that comes back as input tax credits: meals only half, exempt supplies none
  const ITC = { 1500: 1, 5100: 1, 5200: 1, 5240: 1, 5260: 1, 5300: 1, 5400: 0.5, 5800: 1, 5900: 1 };

  // vendor rules, tested on folded text (upper case, no accents); first hit wins. Plain regex text so a person can read and edit them
  const RULES = [
    ['\\b(REVENU QUEBEC|ARC|CRA|RECEVEUR GENERAL|RECEIVER GENERAL)\\b', 2330],
    ['HYDRO QUEBEC|\\bENERGIR\\b', 5240],
    ['\\b(BELL|VIDEOTRON|TELUS|ROGERS|FIZZ|COGECO)\\b', 5260],
    ['\\b(ESSO|SHELL|PETRO CANADA|ULTRAMAR|COUCHE TARD|IRVING|CREVIER)\\b', 5300],
    ['\\b(RESTAURANT|RESTO|BISTRO|BRASSERIE|TIM HORTONS|STARBUCKS|MCDONALD S?|PIZZERIA|SUSHI|UBER EATS|DOORDASH)\\b', 5400],
    ['\\b(LOYER|RENT|GESTION IMMOBILIERE|IMMEUBLES)\\b', 5200],
    ['\\b(ASSURANCES?|INSURANCE|INTACT|LA CAPITALE|BELAIR|PROMUTUEL)\\b', 5500],
    ['\\b(PAIE|PAYROLL|NETHRIS|SALAIRES?|ADP)\\b', 5600],
    ['\\b(FRAIS (MENSUELS|BANCAIRES|DE SERVICE)|SERVICE CHARGE|BANK FEES?)\\b', 5700],
    ['\\b(MICROSOFT|GOOGLE|ADOBE|QUICKBOOKS|INTUIT|SAGE|SHOPIFY|ZOOM|DROPBOX)\\b', 5800],
    ['\\b(RONA|CANAC|BMR|HOME DEPOT|PATRICK MORIN|COSTCO|BUREAU EN GROS|STAPLES|AMAZON|WALMART|CANADIAN TIRE)\\b', 5100],
    ['\\b(AVOCATS?|NOTAIRES?|HONORAIRES|CPA)\\b', 5900],
  ];
  const IN_RULES = [['\\b(INTERETS? (CREDITEURS?|GAGNES?)|INTEREST)\\b', 4900]];

  /* ---------- every knob the run uses; the app shows them all on the Engine screen ---------- */
  const DEFAULTS = {
    gst: 0.05, qst: 0.09975, // Québec: TPS 5 % + TVQ 9,975 %
    itc: { ...ITC }, // share of the tax paid that comes back, per account
    rules: RULES.map(([re, acct]) => ({ re, acct })), inRules: IN_RULES.map(([re, acct]) => ({ re, acct })),
    similar: 0.5, // share of a learned vendor's words a new line needs to reuse its account
    match: { tolerance: 0.01, earlyDays: 3, staleDays: 120, nameMin: 0.5, maxCombo: 4 },
    duplicateDays: 5,
    outlier: { z: 3.5, min: 1000, minCount: 4, skip: [2330, 5200, 5600] },
    filing: 'monthly', // monthly | quarterly | annual (GST/QST reporting period)
    terms: 30, // invoice due days when the file has no due date
    aging: [30, 60, 90],
    lowConf: 0.75, // below this, a line goes to the review queue even when nothing looks wrong
  };
  function settingsOf(s = {}) { // a partial settings object over the defaults, one level deep
    const out = JSON.parse(JSON.stringify(DEFAULTS));
    for (const [k, v] of Object.entries(s || {})) {
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) Object.assign(out[k], v);
      else if (v != null) out[k] = v;
    }
    return out;
  }
  function compile(list) { // bad patterns are skipped and reported, never fatal
    const ok = [], bad = [];
    (list || []).forEach((r, i) => { try { ok.push({ i, re: new RegExp(r.re), src: r.re, acct: +r.acct }); } catch (e) { bad.push({ i, src: r.re, error: e.message }); } });
    return { ok, bad };
  }

  const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  const NOISE = new Set(('ACHAT PAIEMENT PREAUTORISE PREAUT POS INTERAC VIREMENT VIR DEPOT MOBILE RETRAIT CARTE DEBIT TPV TRANSFER TRANSFERT PAYMENT DEPOSIT '
    + 'INC LTEE ENR SENC LTD CIE DE DU DES LA LE LES ET M MME').split(' '));
  const tokens = (s) => fold(s).split(' ').filter((w) => w.length > 1 && !NOISE.has(w) && !/\d/.test(w));
  const vendorKey = (s) => tokens(s).slice(0, 2).join(' ');
  const overlap = (a, b) => (a.length ? a.filter((w) => b.includes(w)).length / a.length : 0); // share of a found in b

  /* ---------- reading files ---------- */
  function parseCSV(text) { // RFC 4180 quotes; the delimiter (; , or tab) is guessed from the header line
    text = String(text).replace(/^﻿/, '');
    const first = text.split(/\r?\n/, 1)[0];
    const delim = [';', '\t', ','].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c !== '"') cell += c; else if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else if (c === '"') q = true;
      else if (c === delim) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.map((r) => r.map((x) => x.trim())).filter((r) => r.some(Boolean));
  }

  function num(s) { // "1 234,56 $", "1,234.56", "(12.00)", "-5" → number; blank → null
    let x = String(s == null ? '' : s).replace(/[\s  $]|CAD/g, '');
    if (!x) return null;
    const neg = /^\(.*\)$/.test(x) || /^-|-$/.test(x);
    x = x.replace(/[()+-]/g, '');
    const lc = x.lastIndexOf(','), ld = x.lastIndexOf('.');
    if (lc > ld) x = ld < 0 && ((x.match(/,/g) || []).length > 1 || x.length - lc - 1 === 3) ? x.replace(/,/g, '') : x.replace(/\./g, '').replace(',', '.');
    else x = x.replace(/,/g, '');
    const n = parseFloat(x);
    return isNaN(n) ? null : neg ? -n : n;
  }

  function isoDate(s, monthFirst = false) { // 2026-09-03, 2026/09/03, 03/09/2026 (day first, as in Québec) or 09/30/2026 when the file says month first
    const iso = (y, m, d) => (m >= 1 && m <= 12 && d >= 1 && d <= 31 ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null);
    s = String(s || '').trim();
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (m) return iso(+m[1], +m[2], +m[3]);
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (!m) return null;
    let [d, mo, y] = [+m[1], +m[2], +m[3]];
    if (y < 100) y += 2000;
    if (monthFirst || mo > 12) [d, mo] = [mo, d];
    return iso(y, mo, d);
  }

  const COLS = { // header names, folded to lower case; searched in this order so "date d'échéance" goes to due, not date
    due: /(echeance|due)/, balance: /(solde|balance)/, date: /^(date|posted|transaction date)/,
    desc: /(description|libelle|details?|payee|beneficiaire|memo)/, out: /(debit|retrait|withdrawal|sortie)/,
    inn: /(credit|depot|deposit|entree)/, amount: /^(amount|montant)/, no: /^(no|n|numero|invoice|facture|ref|#)\b/,
    client: /(client|customer|nom|name)/, total: /^(total|montant|amount)/,
  };
  function readFile(name, text, fi, terms = 30) {
    const rows = parseCSV(text);
    const head = (rows[0] || []).map((h) => fold(h).toLowerCase());
    const col = {}, used = new Set();
    for (const k of Object.keys(COLS)) {
      const i = head.findIndex((h, j) => !used.has(j) && COLS[k].test(h));
      if (i >= 0) { col[k] = i; used.add(i); }
    }
    const body = rows.slice(1), cell = (r, k) => (col[k] == null ? '' : r[col[k]]);
    const parts = body.map((r) => (cell(r, 'date').match(/^(\d{1,2})[-/.](\d{1,2})[-/.]\d{2,4}/) || []).map(Number));
    const monthFirst = parts.some((m) => m[2] > 12) && !parts.some((m) => m[1] > 12); // the whole file uses one order
    if (col.client != null && col.date != null && (col.total != null || col.amount != null)) {
      const inv = body.map((r) => {
        const date = isoDate(cell(r, 'date'), monthFirst), total = num(cell(r, 'total') || cell(r, 'amount'));
        const due = isoDate(cell(r, 'due'), monthFirst) || (date && isoOf(new Date((dn(date) + terms) * 864e5)));
        return { no: cell(r, 'no') || '', client: cell(r, 'client'), date, due, total };
      }).filter((v) => v.date && v.total > 0 && v.client);
      return { name, kind: 'invoices', rows: inv };
    }
    if (col.date != null && col.desc != null && (col.amount != null || col.out != null || col.inn != null)) {
      const tx = body.map((r, i) => {
        const amount = col.amount != null ? num(cell(r, 'amount')) : r2((num(cell(r, 'inn')) || 0) - Math.abs(num(cell(r, 'out')) || 0));
        return { id: `${fi}.${i}`, ref: `BQ-${fi + 1}-${String(i + 1).padStart(3, '0')}`, date: isoDate(cell(r, 'date'), monthFirst), desc: cell(r, 'desc'), amount, balance: num(cell(r, 'balance')) };
      }).filter((x) => x.date && x.amount);
      return { name, kind: 'bank', rows: tx };
    }
    return { name, kind: 'unknown', rows: [] };
  }

  /* ---------- helpers ---------- */
  function split(gross, GST = DEFAULTS.gst, QST = DEFAULTS.qst) { // tax-included amount → before tax + GST + QST (QST takes the rounding cent)
    const pre = r2(gross / (1 + GST + QST)), gst = r2(pre * GST);
    return { pre, gst, qst: r2(gross - pre - gst) };
  }
  function subsets(items, min, max) { // every combination of min..max items (items are few: one client's open invoices)
    const out = [];
    const walk = (start, pick) => {
      if (pick.length >= min) out.push(pick);
      if (pick.length === max) return;
      for (let i = start; i < items.length; i++) walk(i + 1, pick.concat([items[i]]));
    };
    walk(0, []);
    return out;
  }
  const median = (a) => { const s = [...a].sort((x, y) => x - y), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
  function filingDue(period, freq = 'monthly') { // monthly / quarterly: last day of the month after the period; annual: 3 months after year end. A weekend moves to Monday
    const [y, m] = period.split('-').map(Number);
    const end = freq === 'quarterly' ? Math.ceil(m / 3) * 3 : freq === 'annual' ? 12 : m; // last month of the reporting period
    const d = new Date(Date.UTC(y, end + (freq === 'annual' ? 3 : 1), 0));
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
    return isoOf(d);
  }

  /* ---------- the run: files in, books out ---------- */
  function run({ files = [], memory = {}, decisions = {}, asOf = isoOf(new Date()), settings = {} } = {}) {
    const t0 = Date.now(), S = settingsOf(settings), M = S.match;
    const GST = +S.gst, QST = +S.qst, ITCs = S.itc, sp = (g) => split(g, GST, QST);
    const RULESc = compile(S.rules), INc = compile(S.inRules);
    const read = files.map((f, i) => readFile(f.name, f.text, i, +S.terms));
    const bank = read.filter((f) => f.kind === 'bank').flatMap((f) => f.rows);
    const invoices = read.filter((f) => f.kind === 'invoices').flatMap((f) => f.rows).map((v) => ({ ...v, paid: 0 }));
    const fileInfo = read.map((f) => ({ name: f.name, kind: f.kind, rows: f.rows.length }));
    if (!bank.length) return { ok: false, error: 'nobank', files: fileInfo };
    const inFile = [...bank]; // statement order, for the running-balance check
    bank.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const months = {};
    bank.forEach((x) => { const k = x.date.slice(0, 7); months[k] = (months[k] || 0) + 1; });
    const period = Object.keys(months).sort((a, b) => months[b] - months[a])[0];

    // 1. sort every expense into an account: your choice > what you taught me > rules > a similar vendor
    for (const tx of bank) {
      const f = fold(tx.desc), d = decisions[tx.id] || {};
      tx.key = vendorKey(tx.desc);
      if (d.account) { Object.assign(tx, { account: +d.account, how: 'you', conf: 1, why: {} }); continue; }
      if (tx.amount > 0) { const r = INc.ok.find((x) => x.re.test(f)); if (r) Object.assign(tx, { account: r.acct, how: 'rule', conf: 0.95, why: { rule: r.i, re: r.src, inRule: 1 } }); continue; }
      if (memory[tx.key]) { Object.assign(tx, { account: +memory[tx.key], how: 'memory', conf: 0.95, why: { key: tx.key } }); continue; }
      const r = RULESc.ok.find((x) => x.re.test(f));
      if (r) { Object.assign(tx, { account: r.acct, how: 'rule', conf: 0.9, why: { rule: r.i, re: r.src } }); continue; }
      const tk = tokens(tx.desc);
      let best = null, bs = 0, bk = '';
      for (const [k, a] of Object.entries(memory)) { const s = overlap(k.split(' '), tk); if (s > bs) { bs = s; best = a; bk = k; } }
      Object.assign(tx, bs >= +S.similar ? { account: +best, how: 'similar', conf: r2(0.5 + bs * 0.3), why: { key: bk, score: r2(bs) } } : { account: 2999, how: 'none', conf: 0, why: {} });
    }

    // 2. link each deposit to the invoice(s) it pays: exact amount, one payment for several invoices, or a partial payment
    const pairs = [];
    for (const tx of bank.filter((x) => x.amount > 0 && !x.account)) {
      const tk = tokens(tx.desc);
      const cand = invoices.map((v) => ({ v, name: overlap(tokens(v.client), tk), lag: dn(tx.date) - dn(v.date) })).filter((c) => c.lag >= -M.earlyDays);
      const fresh = (lag) => 1 - Math.min(Math.max(lag, 0), M.staleDays) / M.staleDays;
      for (const c of cand) {
        if (Math.abs(c.v.total - tx.amount) <= M.tolerance) pairs.push({ tx, inv: [c.v], kind: 'exact', name: c.name, lag: c.lag, score: 0.6 + 0.3 * c.name + 0.1 * fresh(c.lag) });
        else if (c.name >= M.nameMin && tx.amount < c.v.total) pairs.push({ tx, inv: [c.v], kind: 'partial', name: c.name, lag: c.lag, score: 0.3 * c.name + 0.1 * fresh(c.lag) });
      }
      const mine = cand.filter((c) => c.name >= M.nameMin).map((c) => c.v).slice(0, 12);
      for (const combo of subsets(mine, 2, Math.max(2, +M.maxCombo))) {
        if (Math.abs(sum(combo, (v) => v.total) - tx.amount) <= M.tolerance) pairs.push({ tx, inv: combo, kind: 'multi', name: 1, score: 0.85 - 0.01 * combo.length });
      }
    }
    pairs.sort((a, b) => b.score - a.score);
    const usedTx = new Set(), usedInv = new Set(), partials = [];
    for (const p of pairs) { // greedy: the most certain link first, each deposit and invoice used once
      if (usedTx.has(p.tx) || p.inv.some((v) => usedInv.has(v))) continue;
      usedTx.add(p.tx); p.inv.forEach((v) => usedInv.add(v));
      Object.assign(p.tx, { account: 1200, how: p.kind, invoices: p.inv.map((v) => v.no), sure: p.name >= M.nameMin, conf: r2(Math.min(1, p.score)), why: { name: r2(p.name), lag: p.lag, score: r2(p.score) } });
      if (p.kind === 'partial') { p.inv[0].paid = p.tx.amount; partials.push(p); } else p.inv.forEach((v) => { v.paid = v.total; });
    }
    for (const tx of bank) if (!tx.account) Object.assign(tx, { account: 2999, how: 'none', conf: 0, why: {} });

    // 3. journal entries, with GST/QST taken out of every taxable amount
    const J = [];
    const entry = (date, ref, memo, lines, src) => { // src: the bank line id or invoice number it comes from (audit trail)
      const l = lines.filter(([, a]) => Math.abs(a) >= 0.005).map(([acct, a]) => ({ acct: +acct, dr: a > 0 ? r2(a) : 0, cr: a < 0 ? r2(-a) : 0 }));
      J.push({ date, ref, memo, lines: l, src });
    };
    for (const v of invoices.filter((x) => x.date.startsWith(period))) {
      const s = sp(v.total);
      entry(v.date, v.no, v.client, [[1200, v.total], [4000, -s.pre], [2310, -s.gst], [2320, -s.qst]], 'inv:' + v.no);
    }
    for (const tx of bank) {
      const a = tx.amount, acct = tx.account;
      if (a > 0 && acct === 4000) { const s = sp(a); entry(tx.date, tx.ref, tx.desc, [[1010, a], [4000, -s.pre], [2310, -s.gst], [2320, -s.qst]], tx.id); }
      else if (a > 0) entry(tx.date, tx.ref, tx.desc, [[1010, a], [acct, -a]], tx.id);
      else if (+ITCs[acct]) {
        const s = sp(-a), gst = r2(s.gst * ITCs[acct]), qst = r2(s.qst * ITCs[acct]);
        tx.tax = { gst, qst };
        entry(tx.date, tx.ref, tx.desc, [[acct, -a - gst - qst], [1310, gst], [1320, qst], [1010, a]], tx.id);
      } else entry(tx.date, tx.ref, tx.desc, [[acct, -a], [1010, a]], tx.id);
    }
    const tb = {};
    J.forEach((e) => e.lines.forEach((l) => { tb[l.acct] = r2((tb[l.acct] || 0) + l.dr - l.cr); }));
    const dr = sum(J.flatMap((e) => e.lines), (l) => l.dr), cr = sum(J.flatMap((e) => e.lines), (l) => l.cr);
    const bal = (acct) => tb[acct] || 0;

    // 4. results: profit and loss, sales taxes (FPZ-500 / GST34 lines)
    const expenses = Object.keys(tb).filter((a) => a >= 5000).map((a) => ({ acct: +a, amount: bal(a) })).sort((a, b) => b.amount - a.amount);
    const revenue = r2(-bal(4000) - bal(4900)), spent = sum(expenses, (e) => e.amount);
    const taxes = {
      sales: r2(-bal(4000)), gst: r2(-bal(2310)), itc: bal(1310), qst: r2(-bal(2320)), itr: bal(1320), due: filingDue(period, S.filing), freq: S.filing,
    };
    taxes.gstNet = r2(taxes.gst - taxes.itc); taxes.qstNet = r2(taxes.qst - taxes.itr); taxes.net = r2(taxes.gstNet + taxes.qstNet);

    // 5. checks a careful bookkeeper would do
    const review = [], ok = (id) => decisions[id] && (decisions[id].ok || decisions[id].account);
    const outs = bank.filter((x) => x.amount < 0);
    outs.forEach((x, i) => { // the same charge twice within 5 days
      const twin = outs.slice(0, i).find((y) => y.key === x.key && y.amount === x.amount && dn(x.date) - dn(y.date) <= +S.duplicateDays);
      if (twin && !ok(x.id)) review.push({ type: 'duplicate', id: x.id, tx: x, twin: twin.date });
    });
    const groups = {};
    const O = S.outlier, skip = (O.skip || []).map(Number);
    outs.forEach((x) => { if (!skip.includes(x.account)) (groups[x.account] = groups[x.account] || []).push(x); });
    for (const g of Object.values(groups)) { // far above the usual for its account (robust z-score on the median)
      if (g.length < +O.minCount) continue;
      const amts = g.map((x) => -x.amount), med = median(amts), mad = median(amts.map((a) => Math.abs(a - med)));
      if (!mad) continue;
      g.forEach((x) => {
        const z = (0.6745 * (-x.amount - med)) / mad;
        if (z > +O.z && -x.amount > +O.min && !ok(x.id) && !review.some((r) => r.id === x.id)) review.push({ type: 'outlier', id: x.id, tx: x, times: Math.round(-x.amount / med), z: r2(z) });
      });
    }
    bank.filter((x) => x.account === 2999).forEach((x) => review.push({ type: x.amount > 0 ? 'deposit' : 'unknown', id: x.id, tx: x }));
    partials.forEach((p) => { if (!decisions[p.tx.id]) review.push({ type: 'partial', id: p.tx.id, tx: p.tx, inv: p.inv[0].no, total: p.inv[0].total, left: r2(p.inv[0].total - p.tx.amount) }); });
    const gaps = []; // each running balance = previous balance + this line; a jump means a missing line
    inFile.forEach((x, i) => {
      const prev = inFile[i - 1];
      if (prev && x.balance != null && prev.balance != null && Math.abs(r2(prev.balance + x.amount) - x.balance) > 0.01) gaps.push({ after: prev.date, before: x.date, amount: r2(x.balance - prev.balance - x.amount) });
    });
    gaps.forEach((g, i) => { if (!(decisions['gap' + i] || {}).ok) review.push({ type: 'gap', id: 'gap' + i, ...g }); });
    bank.forEach((x) => { // sorted, but not sure enough: a person looks once
      if (x.how !== 'none' && x.how !== 'you' && x.conf < +S.lowConf && !ok(x.id) && !review.some((r) => r.id === x.id)) review.push({ type: 'lowconf', id: x.id, tx: x });
    });
    const withBal = inFile.filter((x) => x.balance != null);
    const balance = withBal.length ? { opening: r2(withBal[0].balance - withBal[0].amount), closing: withBal[withBal.length - 1].balance, ok: !gaps.length } : null;

    // 6. who still owes what (aging as of today)
    const owed = invoices.filter((v) => v.total - v.paid > 0.005).map((v) => ({ no: v.no, client: v.client, due: v.due, left: r2(v.total - v.paid), late: Math.max(0, dn(asOf) - dn(v.due)) }))
      .sort((a, b) => b.left * (b.late + 1) - a.left * (a.late + 1));
    const [a1, a2, a3] = S.aging.map(Number);
    const aging = [[0, 0], [1, a1], [a1 + 1, a2], [a2 + 1, a3], [a3 + 1, Infinity]].map(([lo, hi]) => sum(owed.filter((o) => o.late >= lo && o.late <= hi), (o) => o.left));

    // 7. tie-outs a reviewer signs off on: each says what it compared (a = books, b = expected) so a person can redo it by hand
    const salesInv = invoices.filter((x) => x.date.startsWith(period));
    const expectGst = r2(sum(salesInv, (v) => sp(v.total).gst) + sum(bank.filter((x) => x.amount > 0 && x.account === 4000), (x) => sp(x.amount).gst));
    const expectItc = r2(sum(bank.filter((x) => x.tax), (x) => x.tax.gst) + sum(bank.filter((x) => x.tax), (x) => x.tax.qst));
    const nos = invoices.map((v) => v.no).filter(Boolean), dupNos = [...new Set(nos.filter((n, i) => nos.indexOf(n) !== i))];
    const off = bank.filter((x) => !x.date.startsWith(period));
    const chk = (id, ok, a, b, extra) => ({ id, ok, a, b, ...extra });
    const checks = [
      chk('balanced', Math.abs(dr - cr) < 0.005, dr, cr),
      chk('entries', J.every((e) => Math.abs(sum(e.lines, (l) => l.dr - l.cr)) < 0.005), J.length, J.length),
      balance ? chk('bankTie', Math.abs(bal(1010) - r2(balance.closing - balance.opening)) < 0.005, bal(1010), r2(balance.closing - balance.opening)) : chk('bankTie', null, bal(1010), null),
      chk('running', balance ? !gaps.length : null, gaps.length, 0),
      chk('sorted', !bank.some((x) => x.account === 2999), bank.filter((x) => x.account === 2999).length, 0),
      chk('gst', Math.abs(taxes.gst - expectGst) < 0.005, taxes.gst, expectGst),
      chk('itc', Math.abs(r2(taxes.itc + taxes.itr) - expectItc) < 0.005, r2(taxes.itc + taxes.itr), expectItc),
      chk('invoiceNos', !dupNos.length, dupNos.length, 0, { list: dupNos }),
      chk('period', !off.length, off.length, 0),
      chk('rules', !RULESc.bad.length && !INc.bad.length, RULESc.bad.length + INc.bad.length, 0, { list: RULESc.bad.concat(INc.bad).map((b) => b.src) }),
    ];

    const deps = bank.filter((x) => x.amount > 0 && x.account !== 4900);
    return {
      ok: true, period, files: fileInfo, ms: Date.now() - t0,
      bank, invoices: invoices.length, journal: J, tb, balanced: Math.abs(dr - cr) < 0.005, totals: { dr, cr },
      sorted: { auto: outs.filter((x) => ['rule', 'memory', 'similar'].includes(x.how)).length, outs: outs.length },
      matched: { deps: deps.filter((x) => x.account === 1200).length, of: deps.length, paid: invoices.filter((v) => v.paid >= v.total).length },
      pnl: { revenue, spent, profit: r2(revenue - spent), expenses }, taxes, balance, owed, aging, review, checks, settings: S,
    };
  }

  /* ---------- downloads (CSV opens in Excel; BOM keeps accents) ---------- */
  const q = (v) => (/[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const csv = (rows) => '﻿' + rows.map((r) => r.map(q).join(',')).join('\r\n');
  const name = (acct, lang) => (ACCOUNTS[acct] || ['?', '?'])[lang === 'en' ? 1 : 0];
  const exportsFor = (res, lang) => {
    const en = lang === 'en';
    return {
      journal: csv([en ? ['Date', 'Ref', 'Account', 'Account name', 'Debit', 'Credit', 'Memo'] : ['Date', 'Réf.', 'Compte', 'Nom du compte', 'Débit', 'Crédit', 'Note'],
        ...res.journal.flatMap((e) => e.lines.map((l) => [e.date, e.ref, l.acct, name(l.acct, lang), l.dr ? l.dr.toFixed(2) : '', l.cr ? l.cr.toFixed(2) : '', e.memo]))]),
      bank: csv([en ? ['Date', 'Description', 'Amount', 'Account', 'How', 'Invoices'] : ['Date', 'Description', 'Montant', 'Compte', 'Comment', 'Factures'],
        ...res.bank.map((x) => [x.date, x.desc, x.amount.toFixed(2), `${x.account} ${name(x.account, lang)}`, x.how, (x.invoices || []).join(' + ')])]),
      taxes: csv([en ? ['Line', 'What', 'Amount'] : ['Ligne', 'Quoi', 'Montant'],
        ['101', en ? 'Sales (before tax)' : 'Ventes (avant taxes)', res.taxes.sales.toFixed(2)],
        ['103', en ? 'GST collected' : 'TPS perçue', res.taxes.gst.toFixed(2)], ['106', en ? 'GST input tax credits' : 'CTI', res.taxes.itc.toFixed(2)],
        ['109', en ? 'Net GST' : 'TPS nette', res.taxes.gstNet.toFixed(2)], ['203', en ? 'QST collected' : 'TVQ perçue', res.taxes.qst.toFixed(2)],
        ['206', en ? 'QST input tax refunds' : 'RTI', res.taxes.itr.toFixed(2)], ['209', en ? 'Net QST' : 'TVQ nette', res.taxes.qstNet.toFixed(2)],
        ['', en ? 'Due' : 'Échéance', res.taxes.due]]),
      trial: csv([en ? ['Account', 'Account name', 'Debit', 'Credit'] : ['Compte', 'Nom du compte', 'Débit', 'Crédit'],
        ...Object.keys(res.tb).sort().map((a) => [a, name(a, lang), res.tb[a] > 0 ? res.tb[a].toFixed(2) : '', res.tb[a] < 0 ? (-res.tb[a]).toFixed(2) : ''])]),
    };
  };

  /* ---------- sample files: last month of a small woodworking shop, with the usual surprises ---------- */
  function sample(asOf = isoOf(new Date())) {
    const [y, m] = asOf.split('-').map(Number);
    const ym = (back) => { const d = new Date(Date.UTC(y, m - 1 - back, 1)); return isoOf(d).slice(0, 7); };
    const p = ym(1), pp = ym(2);
    const fr = (n) => n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const lines = [ // day, description, amount (+ in, − out)
      ['01', 'LOYER GESTION IMMOBILIERE LAVAL', -2299.5], ['02', 'HYDRO-QUEBEC PREAUTORISE', -312.48],
      ['03', 'VIREMENT INTERAC CLINIQUE DENTAIRE SOURIRE', 3449.25], ['04', 'BELL CANADA PAIEMENT', -126.47],
      ['05', 'ACHAT RONA #4512 LAVAL', -864.31], ['06', 'BELL CANADA PAIEMENT', -126.47], ['08', 'ESSO 3321 STE-ROSE', -94.12],
      ['09', 'DEPOT MOBILE RESTAURANT LE FILON', 5748.75], ['10', 'NETHRIS PAIE', -3105], ['11', 'CANAC MATERIAUX', -1437.19],
      ['12', 'TIM HORTONS 1182', -18.4], ['15', 'INTACT ASSURANCE', -418], ['15', 'MICROSOFT 365', -34.49],
      ['16', 'VIREMENT CONDOS RIVE-NORD', 1500], ['17', 'BUREAU EN GROS 221', -68.97], ['18', 'ACHAT RONA #4512 LAVAL', -9875],
      ['19', 'PETRO-CANADA 1180', -88.6], ['22', 'DEPOT INTERAC M TREMBLAY', 850], ['23', 'COSTCO GROSSISTE 512', -212.74],
      ['24', 'NETHRIS PAIE', -3105], ['25', 'ATELIER DUBE SOUDURE', -1149.75], ['26', 'RESTAURANT CHEZ ROGER', -86.23],
      ['29', 'REVENU QUEBEC TPS/TVQ', -3104.33], ['30', 'VIREMENT PROMOTIONS LACHUTE INC', 2874.38],
      ['30', 'FRAIS MENSUELS PLAN', -19.95], ['30', 'INTERETS CREDITEURS', 4.12],
    ];
    let solde = 24180.55;
    const bank = ['Date;Description;Retrait;Dépôt;Solde', ...lines.map(([d, desc, a]) => {
      solde = r2(solde + a);
      return `${p}-${d};${desc};${a < 0 ? fr(-a) : ''};${a > 0 ? fr(a) : ''};${fr(solde)}`;
    })].join('\n');
    const inv = [['B-1038', 'Ferme Ouellet', `${pp}-15`, 1724.63], ['B-1041', 'Clinique dentaire Sourire', `${pp}-28`, 3449.25],
      ['B-1043', 'Restaurant Le Filon', `${p}-02`, 2299.5], ['B-1044', 'Ferme Ouellet', `${p}-05`, 919.8],
      ['B-1045', 'Restaurant Le Filon', `${p}-06`, 3449.25], ['B-1046', 'Condos Rive-Nord', `${p}-10`, 6898.5],
      ['B-1047', 'Promotions Lachute inc.', `${p}-12`, 2874.38], ['B-1048', 'Clinique dentaire Sourire', `${p}-28`, 2874.38]];
    const invoices = ['No,Client,Date,Total', ...inv.map(([no, c, d, t]) => `${no},${c},${d},${t.toFixed(2)}`)].join('\n');
    return [{ name: `releve-${p}.csv`, text: bank }, { name: 'factures.csv', text: invoices }];
  }

  const api = { run, sample, exportsFor, ACCOUNTS, ITC, DEFAULTS, settingsOf, compile, fold, filingDue, parseCSV, num, isoDate, split };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SolvaEngine = api;
  if (typeof importScripts === 'function' && typeof document === 'undefined') root.onmessage = (e) => root.postMessage(run(e.data));
})(typeof self !== 'undefined' ? self : this);
