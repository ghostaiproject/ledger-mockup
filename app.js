// Solva: mock accounting-firm dashboard. Fake clients and figures; nothing is filed or sent anywhere.
const T = {
  fr: {
    sections: 'Sections', navOverview: 'Aperçu', navDeadlines: 'Échéances', navClients: 'Dossiers', navBanking: 'Banques', navClose: 'Clôture',
    billable: 'Heures facturables (semaine)', tagline: 'Chaque dossier, en équilibre.', language: 'Langue', theme: 'Thème', day: 'Jour', night: 'Nuit',
    morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir',
    pulse: 'Pouls du cabinet', nextBest: 'Prochaine action', statCash: 'Encaisse clients', statAR: 'Comptes clients',
    statLate: 'En retard (+30 j)', statNext: 'Prochaine échéance',
    deadlines: 'Échéances ARC · Revenu Québec', clients: 'Dossiers clients', aging: 'Classement chronologique',
    ar: 'Clients', ap: 'Fournisseurs', chase: 'Honoraires à relancer', recon: 'Conciliation bancaire', autoMatch: 'Rapprochement auto',
    tabs: { all: 'Tous', action: 'À traiter', progress: 'En cours', done: 'Terminés' },
    status: { action: 'À traiter', progress: 'En cours', done: 'Terminé' },
    closeTitle: (m) => `Clôture de ${m}`, ofDone: (a, b) => `${a} sur ${b}`, filedCount: (a, b) => `${a}/${b} produites`,
    file: 'Marquer produite', filed: 'Produite', fileLabel: (x) => `Marquer « ${x} » comme produite`,
    today: "aujourd'hui", inDays: (d) => `dans ${d} j`, late: (d) => `${d} j de retard`, clientsN: (n) => `${n} dossier${n > 1 ? 's' : ''}`,
    remind: (c) => `Envoyer une relance à ${c}`, reminded: 'Relance envoyée', daysLate: (d) => `${d} j`,
    matched: (a, b) => `${a} / ${b} rapprochées`, toMatch: (n) => `${n} à rapprocher`, reconDone: 'Tout est rapproché',
    words: ['Excellent', 'Bon', 'Correct', 'À surveiller'],
    tipLate: (c, d) => `La déclaration TPS/TVQ de ${c} a ${d} j de retard. Produis-la en premier.`,
    tipMatch: (n) => `${n} opérations bancaires attendent un rapprochement. Lance le rapprochement auto.`,
    tipChase: (c, a, d) => `${c} doit ${a} depuis ${d} jours. Envoie une relance.`,
    tipClose: (s) => `Prochaine étape de clôture : ${s}.`,
    tipSoon: (x, d) => `« ${x} » est dû ${d}. Garde-le à l'œil.`,
    tipDone: 'Tous les dossiers sont en équilibre. Beau travail.',
    toastFiled: (x) => `Produite : ${x}`, toastUnfiled: (x) => `Remise à faire : ${x}`,
    toastRemind: (c) => `Relance envoyée à ${c} (démo)`, toastMatch: (n, r) => `${n} opérations rapprochées · ${r} à vérifier à la main`,
    toastMatchNone: (r) => `${r} opérations demandent un œil humain`, toastClose: 'Clôture terminée. Bravo !',
    agingLabel: (b, a) => `${b} : ${a}`,
  },
  en: {
    sections: 'Sections', navOverview: 'Overview', navDeadlines: 'Deadlines', navClients: 'Clients', navBanking: 'Banking', navClose: 'Close',
    billable: 'Billable hours (week)', tagline: 'Every file, in balance.', language: 'Language', theme: 'Theme', day: 'Day', night: 'Night',
    morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
    pulse: 'Firm Pulse', nextBest: 'Next best step', statCash: 'Client cash', statAR: 'Receivables',
    statLate: 'Overdue (30+ d)', statNext: 'Next deadline',
    deadlines: 'CRA · Revenu Québec deadlines', clients: 'Client files', aging: 'Aging',
    ar: 'Receivables', ap: 'Payables', chase: 'Fees to chase', recon: 'Bank reconciliation', autoMatch: 'Auto-match',
    tabs: { all: 'All', action: 'Action needed', progress: 'In progress', done: 'Done' },
    status: { action: 'Action needed', progress: 'In progress', done: 'Done' },
    closeTitle: (m) => `${m} month-end close`, ofDone: (a, b) => `${a} of ${b}`, filedCount: (a, b) => `${a}/${b} filed`,
    file: 'Mark filed', filed: 'Filed', fileLabel: (x) => `Mark “${x}” as filed`,
    today: 'today', inDays: (d) => `in ${d} d`, late: (d) => `${d} d late`, clientsN: (n) => `${n} file${n > 1 ? 's' : ''}`,
    remind: (c) => `Send a reminder to ${c}`, reminded: 'Reminder sent', daysLate: (d) => `${d} d`,
    matched: (a, b) => `${a} / ${b} matched`, toMatch: (n) => `${n} to match`, reconDone: 'All matched',
    words: ['Excellent', 'Good', 'Fair', 'Needs care'],
    tipLate: (c, d) => `${c}'s GST/QST return is ${d} days late. File it first.`,
    tipMatch: (n) => `${n} bank lines are waiting for a match. Run auto-match.`,
    tipChase: (c, a, d) => `${c} has owed ${a} for ${d} days. Send a reminder.`,
    tipClose: (s) => `Next close step: ${s}.`,
    tipSoon: (x, d) => `“${x}” is due ${d}. Keep it in sight.`,
    tipDone: 'Every file is in balance. Nice work.',
    toastFiled: (x) => `Filed: ${x}`, toastUnfiled: (x) => `Back to do: ${x}`,
    toastRemind: (c) => `Reminder sent to ${c} (demo)`, toastMatch: (n, r) => `${n} lines matched · ${r} need a human look`,
    toastMatchNone: (r) => `${r} lines need a human look`, toastClose: 'Month-end close done. Well played!',
    agingLabel: (b, a) => `${b}: ${a}`,
  },
};

const CLIENTS = [
  { id: 'boreal', name: 'Atelier Boréal', kind: { fr: 'Studio de design', en: 'Design studio' }, owner: 'MC', close: 80, status: 'progress', cash: 48200,
    note: { fr: '1 relevé de carte manquant', en: '1 card statement missing' } },
  { id: 'mistral', name: 'Café Mistral', kind: { fr: 'Restaurant', en: 'Restaurant' }, owner: 'JL', close: 35, status: 'action', cash: 6900,
    note: { fr: '3 reçus manquants · TVQ en retard', en: '3 receipts missing · QST late' } },
  { id: 'lumen', name: 'Clinique Lumen', kind: { fr: 'Clinique dentaire', en: 'Dental clinic' }, owner: 'MC', close: 100, status: 'done', cash: 91400,
    note: { fr: 'États financiers envoyés', en: 'Financial statements sent' } },
  { id: 'pins', name: 'Érablière Deux-Pins', kind: { fr: 'Érablière', en: 'Maple producer' }, owner: 'SA', close: 60, status: 'progress', cash: 22750,
    note: { fr: 'Inventaire de sirop à valider', en: 'Syrup inventory to confirm' } },
  { id: 'nordet', name: 'Transports Nordet', kind: { fr: 'Transport routier', en: 'Trucking' }, owner: 'JL', close: 20, status: 'action', cash: 3150,
    note: { fr: 'Flux bancaire interrompu', en: 'Bank feed disconnected' } },
  { id: 'cobalt', name: 'Studio Cobalt', kind: { fr: 'Logiciel', en: 'Software' }, owner: 'SA', close: 100, status: 'done', cash: 133600,
    note: { fr: 'T2 prête à signer', en: 'T2 ready to sign' } },
  { id: 'verveine', name: 'Ferme Verveine', kind: { fr: 'Ferme bio', en: 'Organic farm' }, owner: 'MC', close: 55, status: 'progress', cash: 17300,
    note: { fr: 'Subvention à comptabiliser', en: 'Grant to record' } },
];

const AGING = {
  ar: [64200, 28750, 12400, 5300, 3850],
  ap: [41900, 15200, 6100, 1800, 0],
};
const BUCKETS = { fr: ['Courant', '1–30 j', '31–60 j', '61–90 j', '90+ j'], en: ['Current', '1–30 d', '31–60 d', '61–90 d', '90+ d'] };
const BUCKET_COLORS = ['var(--leaf)', 'var(--amber-2)', 'var(--amber)', 'var(--red-2)', 'var(--red)'];

const state = {
  lang: 'fr',
  theme: 'day',
  tab: 'all',
  book: 'ar',
  filed: new Set(),
  checks: [
    { fr: 'Relevés bancaires importés', en: 'Bank statements imported', on: true },
    { fr: 'Conciliations bancaires', en: 'Bank reconciliations', auto: 'recon' },
    { fr: 'Journal de paie comptabilisé', en: 'Payroll journal posted', on: true },
    { fr: "Courus et charges payées d'avance", en: 'Accruals and prepaids', on: false },
    { fr: 'Taxes TPS/TVQ conciliées', en: 'GST/QST reconciled', on: false },
    { fr: 'Immobilisations et amortissement', en: 'Fixed assets and depreciation', on: false },
    { fr: 'Révision et approbation', en: 'Review and sign-off', on: false },
  ],
  chase: [
    { id: 'h2291', client: 'Transports Nordet', no: 'H-2291', amount: 4850, days: 47, sent: false },
    { id: 'h2304', client: 'Café Mistral', no: 'H-2304', amount: 1260, days: 33, sent: false },
    { id: 'h2318', client: 'Ferme Verveine', no: 'H-2318', amount: 2140, days: 19, sent: false },
    { id: 'h2330', client: 'Atelier Boréal', no: 'H-2330', amount: 980, days: 8, sent: false },
  ],
  banks: [
    { id: 'b1', acct: { fr: 'Opérations ••4821', en: 'Operating ••4821' }, client: 'Atelier Boréal', total: 150, matched: 142, review: 2 },
    { id: 'b2', acct: { fr: 'Visa ••0917', en: 'Visa ••0917' }, client: 'Café Mistral', total: 61, matched: 38, review: 4 },
    { id: 'b3', acct: { fr: 'Marge de crédit ••3305', en: 'Line of credit ••3305' }, client: 'Transports Nordet', total: 48, matched: 25, review: 3 },
    { id: 'b4', acct: { fr: 'Opérations ••7740', en: 'Operating ••7740' }, client: 'Érablière Deux-Pins', total: 94, matched: 88, review: 1 },
  ],
};
try { // per-viewer conveniences only
  const saved = JSON.parse(localStorage.getItem('solva') || '{}');
  if (saved.lang in T) state.lang = saved.lang;
  if (saved.theme === 'night' || saved.theme === 'day') state.theme = saved.theme;
} catch (e) { /* storage blocked: defaults are fine */ }
function save() { try { localStorage.setItem('solva', JSON.stringify({ lang: state.lang, theme: state.theme })); } catch (e) { /* ignore */ } }

const $ = (s) => document.querySelector(s);
const t = () => T[state.lang];
const loc = () => (state.lang === 'fr' ? 'fr-CA' : 'en-CA');
const money = (n) => new Intl.NumberFormat(loc(), { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
const SVG = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
function icons() { // swap <i data-lucide> for inline SVG from assets/icons.js: no CDN, nothing pops in late
  document.querySelectorAll('i[data-lucide]').forEach((i) => {
    const name = i.dataset.lucide;
    i.outerHTML = `<svg class="lucide lucide-${name}" ${SVG}>${(window.ICONS || {})[name] || ''}</svg>`;
  });
}
// controls are rebuilt on every render; these data-* keys find the same control again so focus never drops to <body>
const FOCUS_KEYS = ['lang', 'themeSet', 'tab', 'book', 'file', 'check', 'chase', 'match'];
function focusedKey() {
  const el = document.activeElement;
  const k = el && el.dataset && FOCUS_KEYS.find((key) => key in el.dataset);
  return k ? [k, el.dataset[k]] : null;
}
const attr = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

/* ---------- deadlines: real CRA / Revenu Québec rules, dated from today ---------- */
const DAY = 864e5;
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
const monthEnd = (y, m) => new Date(y, m + 1, 0);
function businessDay(d) { // a due date on a weekend moves to the next business day
  const x = new Date(d);
  while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1);
  return x;
}
function next15() {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), 15);
  if (d < TODAY) d.setMonth(d.getMonth() + 1);
  return d;
}
function nextQuarterReturn() { // quarterly filers: last day of the month after each calendar quarter
  for (let i = 0; i < 4; i++) {
    const d = monthEnd(TODAY.getFullYear(), TODAY.getMonth() + i);
    if (d.getMonth() % 3 === 0 && d >= TODAY) return d;
  }
  return monthEnd(TODAY.getFullYear(), TODAY.getMonth() + 3);
}
function nextFeb28() {
  const y = TODAY.getMonth() >= 2 ? TODAY.getFullYear() + 1 : TODAY.getFullYear();
  return new Date(y, 2, 0);
}
const DEADLINES = [
  { id: 'late', fr: 'TPS/TVQ mensuelle · Café Mistral', en: 'Monthly GST/QST · Café Mistral', agency: 'ARC · RQ', clients: 1,
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth() - 1) },
  { id: 'das', fr: 'Retenues à la source (DAS)', en: 'Source deductions remittance', agency: 'ARC · RQ', clients: 5, due: next15() },
  { id: 'gst', fr: 'Déclarations TPS/TVQ trimestrielles', en: 'Quarterly GST/QST returns', agency: 'ARC · RQ', clients: 4, due: nextQuarterReturn() },
  { id: 'inst', fr: 'Acomptes provisionnels T2', en: 'T2 corporate instalments', agency: 'ARC · RQ', clients: 3,
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth()) },
  { id: 't2', fr: 'T2 + CO-17 · Studio Cobalt', en: 'T2 + CO-17 · Studio Cobalt', agency: 'ARC · RQ', clients: 1,
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth() + 2) },
  { id: 't4', fr: 'Feuillets T4 et RL-1', en: 'T4 and RL-1 slips', agency: 'ARC · RQ', clients: 6, due: nextFeb28() },
].map((d) => ({ ...d, due: businessDay(d.due) })).sort((a, b) => a.due - b.due);
const daysTo = (d) => Math.round((d - TODAY) / DAY);
const agency = (a) => (state.lang === 'en' ? a.replace('ARC', 'CRA') : a);
function whenText(days) {
  if (days < 0) return t().late(-days);
  return days === 0 ? t().today : t().inDays(days);
}

/* ---------- derived numbers ---------- */
const openDeadlines = () => DEADLINES.filter((d) => !state.filed.has(d.id));
const unmatched = () => state.banks.reduce((s, b) => s + b.total - b.matched, 0);
const reconPct = () => {
  const tot = state.banks.reduce((s, b) => s + b.total, 0);
  return Math.round((state.banks.reduce((s, b) => s + b.matched, 0) / tot) * 100);
};
const checkOn = (c) => (c.auto === 'recon' ? unmatched() === 0 : c.on);
const closeDone = () => state.checks.filter(checkOn).length;
function pulse() {
  const open = openDeadlines();
  const late = open.filter((d) => daysTo(d.due) < 0).length;
  const soon = open.filter((d) => daysTo(d.due) >= 0 && daysTo(d.due) <= 10).length;
  const deadlines = Math.max(0, 100 - late * 40 - soon * 12);
  const close = (closeDone() / state.checks.length) * 100;
  const chase = 100 - state.chase.filter((c) => !c.sent).length * 15;
  return Math.round(deadlines * 0.35 + close * 0.25 + reconPct() * 0.2 + chase * 0.2);
}
function tip() {
  const open = openDeadlines();
  const late = open.find((d) => daysTo(d.due) < 0);
  if (late) return t().tipLate('Café Mistral', -daysTo(late.due));
  if (unmatched() > 15) return t().tipMatch(unmatched());
  const c = state.chase.find((x) => !x.sent && x.days > 30);
  if (c) return t().tipChase(c.client, money(c.amount), c.days);
  const step = state.checks.find((x) => !checkOn(x));
  if (step) return t().tipClose(step[state.lang].toLowerCase());
  if (open.length && daysTo(open[0].due) <= 10) return t().tipSoon(open[0][state.lang], whenText(daysTo(open[0].due)));
  return t().tipDone;
}

/* ---------- render ---------- */
function renderStatic() {
  document.documentElement.lang = loc();
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t()[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t()[el.dataset.i18nLabel]));
  document.querySelectorAll('.nav a').forEach((a) => a.setAttribute('aria-label', a.textContent.trim()));
  document.title = `Solva · ${state.lang === 'fr' ? 'Cabinet' : 'Firm'}`;
  const hrs = (n) => new Intl.NumberFormat(loc(), { minimumFractionDigits: 1 }).format(n);
  $('#hoursSide').textContent = `${hrs(31.5)} / ${hrs(37.5)} h`;
  $('#hoursBar').style.width = (31.5 / 37.5) * 100 + '%';
}

function renderTop() {
  const now = new Date();
  const h = now.getHours();
  $('#greet').textContent = t()[h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'];
  if (state.lang === 'fr' && h >= 12 && h < 18) $('#greet').textContent = t().morning; // « Bonjour » all day in Québec
  $('#date').textContent = now.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' })
    + ' · ' + now.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
  const pick = { lang: state.lang, themeSet: state.theme, book: state.book };
  document.querySelectorAll('.seg').forEach((seg) => {
    let active;
    seg.querySelectorAll('button').forEach((b) => {
      const key = Object.keys(pick).find((k) => k in b.dataset);
      const on = b.dataset[key] === pick[key];
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
      if (on) active = b;
    });
    const ind = seg.querySelector('.seg-ind');
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = `translateX(${active.offsetLeft}px)`;
  });
  document.documentElement.dataset.theme = state.theme === 'night' ? 'night' : '';
}

function renderHero() {
  const p = pulse();
  $('#pulseScore').textContent = p;
  const ring = $('#pulseRing');
  ring.style.strokeDashoffset = 314.16 * (1 - p / 100);
  const tone = p >= 75 ? 'leaf' : p >= 55 ? 'amber' : 'red';
  ring.style.stroke = `var(--${tone})`;
  const word = $('#pulseWord');
  word.textContent = t().words[p >= 85 ? 0 : p >= 75 ? 1 : p >= 55 ? 2 : 3];
  word.style.color = `var(--${tone}-ink)`; // darker text shade of the ring color, for contrast
  $('#pulseTip').textContent = tip();
  $('#statCash').textContent = money(CLIENTS.reduce((s, c) => s + c.cash, 0));
  $('#statAR').textContent = money(AGING.ar.reduce((s, n) => s + n, 0));
  $('#statLate').textContent = money(AGING.ar.slice(2).reduce((s, n) => s + n, 0));
  const nxt = openDeadlines()[0];
  $('#statNext').textContent = nxt ? whenText(daysTo(nxt.due)) : '—';
}

function renderDeadlines() {
  $('#dlPill').textContent = t().filedCount(state.filed.size, DEADLINES.length);
  $('#dlList').innerHTML = DEADLINES.map((d) => {
    const days = daysTo(d.due), done = state.filed.has(d.id);
    const tone = done ? 'done' : days < 0 ? 'late' : days <= 10 ? 'soon' : '';
    const label = d[state.lang];
    return `<li class="${tone}">
      <span class="date"><b class="mono">${d.due.getDate()}</b><small>${d.due.toLocaleDateString(loc(), { month: 'short' }).replace('.', '')}</small></span>
      <div><b>${label}</b><small>${agency(d.agency)} · ${t().clientsN(d.clients)} · <em>${done ? t().filed : whenText(days)}</em></small></div>
      <button class="btn sm ${done ? 'on' : ''}" aria-pressed="${done}" aria-label="${t().fileLabel(label)}" data-file="${d.id}">
        <i data-lucide="${done ? 'circle-check' : 'send'}"></i><span>${done ? t().filed : t().file}</span></button></li>`;
  }).join('');
}

function renderClients() {
  const tabs = ['all', 'action', 'progress', 'done'];
  $('#clientTabs').innerHTML = tabs.map((k) => {
    const n = k === 'all' ? CLIENTS.length : CLIENTS.filter((c) => c.status === k).length;
    return `<button class="chip" role="tab" id="tab-${k}" aria-controls="clientPanel" aria-selected="${k === state.tab}"
      tabindex="${k === state.tab ? 0 : -1}" data-tab="${k}">${t().tabs[k]}<span class="count mono">${n}</span></button>`;
  }).join('');
  $('#clientPanel').setAttribute('aria-labelledby', `tab-${state.tab}`);
  $('#files').innerHTML = CLIENTS.filter((c) => state.tab === 'all' || c.status === state.tab).map((c) => `
    <li class="st-${c.status}">
      <span class="avatar" aria-hidden="true">${c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
      <div class="who"><b>${c.name}</b><small>${c.kind[state.lang]} · ${c.note[state.lang]}</small></div>
      <div class="prog"><span class="progress" role="progressbar" aria-valuenow="${c.close}" aria-valuemin="0" aria-valuemax="100"
        aria-label="${c.name}"><span style="width:${c.close}%"></span></span><small class="mono">${c.close}%</small></div>
      <span class="tag st-${c.status}">${t().status[c.status]}</span>
      <span class="owner mono" title="${c.owner}">${c.owner}</span></li>`).join('');
}

function renderClose() {
  const month = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1).toLocaleDateString(loc(), { month: 'long' });
  $('#closeTitle').textContent = t().closeTitle(state.lang === 'en' ? month[0].toUpperCase() + month.slice(1) : month);
  const done = closeDone(), n = state.checks.length;
  $('#closePill').textContent = t().ofDone(done, n);
  $('#closeBar').style.width = (done / n) * 100 + '%';
  $('#checks').innerHTML = state.checks.map((c, i) => `
    <li><button class="check" role="checkbox" aria-checked="${checkOn(c)}" data-check="${i}" ${c.auto ? 'aria-disabled="true"' : ''}>
      <span class="box"><i data-lucide="check"></i></span><span>${c[state.lang]}</span>
      ${c.auto ? `<small>${unmatched() ? t().toMatch(unmatched()) : t().reconDone}</small>` : ''}</button></li>`).join('');
}

function renderAging() {
  const vals = AGING[state.book], tot = vals.reduce((s, n) => s + n, 0), names = BUCKETS[state.lang];
  $('#agingTotal').textContent = money(tot);
  $('#agingBar').setAttribute('aria-label', vals.map((v, i) => t().agingLabel(names[i], money(v))).join(', '));
  $('#agingBar').innerHTML = vals.map((v, i) => (v ? `<span style="flex:${v};background:${BUCKET_COLORS[i]}"></span>` : '')).join('');
  $('#buckets').innerHTML = vals.map((v, i) => `
    <li><i class="sw" style="background:${BUCKET_COLORS[i]}"></i><span>${names[i]}</span><b class="mono">${money(v)}</b>
      <small class="mono">${Math.round((v / tot) * 100)}%</small></li>`).join('');
}

function renderChase() {
  const open = state.chase.filter((c) => !c.sent);
  $('#chasePill').textContent = money(open.reduce((s, c) => s + c.amount, 0));
  $('#chaseList').innerHTML = state.chase.map((c) => `
    <li class="${c.sent ? 'sent' : ''}">
      <span class="days mono ${c.days > 30 ? 'hot' : ''}">${t().daysLate(c.days)}</span>
      <div><b>${c.client}</b><small>${c.no} · ${c.sent ? t().reminded : money(c.amount)}</small></div>
      <button class="round" aria-label="${t().remind(c.client)}" data-chase="${c.id}" ${c.sent ? 'aria-disabled="true"' : ''}>
        <i data-lucide="${c.sent ? 'circle-check' : 'mail'}"></i></button></li>`).join('');
}

function renderBanks() {
  const left = unmatched();
  $('#reconPill').textContent = left ? t().toMatch(left) : t().reconDone;
  $('#banks').innerHTML = state.banks.map((b) => {
    const pct = Math.round((b.matched / b.total) * 100);
    return `<li><span class="ic"><i data-lucide="landmark"></i></span>
      <div><b>${b.acct[state.lang]}</b><small>${b.client} · ${t().matched(b.matched, b.total)}</small>
      <span class="progress thin" aria-hidden="true"><span style="width:${pct}%"></span></span></div>
      <small class="mono pct">${pct}%</small></li>`;
  }).join('');
}

function render() {
  const focus = focusedKey();
  renderStatic(); renderHero(); renderDeadlines(); renderClients(); renderClose(); renderAging(); renderChase(); renderBanks();
  icons();
  renderTop(); // after icons, so the segment indicators measure final button widths
  if (focus) document.querySelector(`[data-${attr(focus[0])}="${focus[1]}"]`)?.focus();
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------- actions ---------- */
function autoMatch() {
  let n = 0, review = 0;
  state.banks.forEach((b) => {
    const left = b.total - b.matched;
    const take = Math.max(0, left - b.review);
    b.matched += take; n += take; review += b.total - b.matched;
  });
  if (!n) { // second click: the leftovers are "reviewed" so the demo can reach 100%
    state.banks.forEach((b) => { b.matched = b.total; });
    toast(t().toastMatchNone(review));
  } else toast(t().toastMatch(n, review));
}
const wasClosed = () => closeDone() === state.checks.length;

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const ds = b.dataset;
  const closedBefore = wasClosed();
  if (ds.lang) { state.lang = ds.lang; save(); }
  else if (ds.themeSet) { state.theme = ds.themeSet; save(); }
  else if (ds.book) state.book = ds.book;
  else if (ds.tab) state.tab = ds.tab;
  else if (ds.file) {
    const d = DEADLINES.find((x) => x.id === ds.file);
    if (state.filed.has(d.id)) { state.filed.delete(d.id); toast(t().toastUnfiled(d[state.lang])); }
    else { state.filed.add(d.id); toast(t().toastFiled(d[state.lang])); }
  }
  else if (ds.check) {
    const c = state.checks[ds.check];
    if (c.auto) { $('#banking').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    c.on = !c.on;
  }
  else if (ds.chase) {
    const c = state.chase.find((x) => x.id === ds.chase);
    if (c.sent) return;
    c.sent = true; toast(t().toastRemind(c.client));
  }
  else if (ds.match) autoMatch();
  else return;
  render();
  if (!closedBefore && wasClosed()) toast(t().toastClose);
});

// segmented radiogroups + client tablist: one Tab stop each, arrow keys move and select (WAI-ARIA pattern)
document.addEventListener('keydown', (e) => {
  const group = e.target.closest('.seg, #clientTabs');
  if (!group || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  const items = [...group.querySelectorAll('button')];
  const i = items.indexOf(e.target.closest('button'));
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (/Right|Down/.test(e.key) ? 1 : -1) + items.length) % items.length;
  e.preventDefault();
  items[next].focus();
  items[next].click();
});

document.querySelector('.nav').addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  document.querySelectorAll('.nav a').forEach((x) => { x.classList.toggle('active', x === a); x.toggleAttribute('aria-current', x === a); });
});

window.addEventListener('resize', renderTop);
setInterval(renderTop, 30000);
render();
document.documentElement.classList.remove('booting');
document.fonts.ready.then(renderTop);
