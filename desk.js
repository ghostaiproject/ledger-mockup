// Solva desk: the accountant's side of Autopilot. Review every decision with its reason, override, approve in batches, sign off;
// tune every engine setting with a change log; one calendar of CRA / Revenu Québec dates across the whole client list.
// Loaded before app.js; everything here runs at render time, when app.js's state, t() and helpers exist.
const TP = {
  fr: {
    review: {
      title: 'Révision', lead: 'Chaque décision du pilote auto, avec sa raison. Corrige, approuve par lot, puis signe.',
      none: 'Rien à réviser pour l’instant. Lance le pilote auto sur un dossier, ou essaie les fichiers exemples.', run: 'Ouvrir le pilote auto',
      stats: { lines: 'opérations', auto: 'classées seules', conf: 'confiance moyenne', open: 'exceptions ouvertes', done: 'révisées' },
      role: 'Je travaille comme', roles: { prep: 'Préparateur', rev: 'Réviseur' }, initials: 'Initiales',
      filters: { flags: 'Exceptions', all: 'Tout', changed: 'Changées', todo: 'Pas révisées' },
      selAll: 'Tout sélectionner', selNone: 'Tout désélectionner', approve: (n) => `Approuver (${n})`, moveTo: 'Classer dans', move: 'Classer',
      sel: (d) => `Sélectionner ${d}`, mark: (d) => `Marquer révisé : ${d}`, acct: (d) => `Compte pour ${d}`,
      how: { rule: 'Règle', memory: 'Appris', similar: 'Ressemble', exact: 'Facture', multi: 'Factures', partial: 'Partiel', you: 'À la main', none: 'Aucune' },
      why: {
        rule: (w) => (w.inRule ? `Règle de revenu : ${w.re}` : `Règle n° ${w.rule + 1} : ${w.re}`), memory: (w) => `Fournisseur appris : « ${w.key} »`,
        similar: (w) => `Ressemble à « ${w.key} » (${Math.round(w.score * 100)} % des mots)`,
        match: (x) => `${x.invoices.join(' + ')} · nom ${Math.round((x.why.name || 0) * 100)} %${x.why.lag != null ? ` · ${x.why.lag} j après la facture` : ''}`,
        you: () => 'Compte choisi à la main', none: () => 'Aucune règle ne s’applique',
      },
      tax: (g, q) => `CTI ${g} · RTI ${q}`,
      empty: 'Rien dans ce filtre.',
      checksH: 'Contrôles', checksLead: 'Chaque contrôle montre ce qu’il compare : tu peux le refaire à la main.',
      ck: {
        balanced: ['Débits = crédits', 'Total des débits comparé au total des crédits'],
        entries: ['Chaque écriture équilibrée', 'Écritures vérifiées une par une'],
        bankTie: ['Banque = relevé', 'Compte 1010 comparé à la variation du solde du relevé'],
        running: ['Solde courant suivi', 'Lignes où le solde saute (ligne manquante ?)'],
        sorted: ['Tout est classé', 'Opérations encore dans « À classer »'],
        gst: ['TPS perçue recalculée', 'Compte 2310 comparé à la TPS recalculée facture par facture'],
        itc: ['CTI + RTI recalculés', 'Comptes 1310 + 1320 comparés au total ligne par ligne'],
        invoiceNos: ['Numéros de facture uniques', 'Numéros en double'],
        period: ['Une seule période', 'Opérations hors du mois traité'],
        rules: ['Règles valides', 'Règles qui ne se lisent pas (ignorées)'],
      },
      pass: 'Conforme', fail: 'Écart', na: 'Sans objet', explain: 'Explication de l’écart', explained: (w) => `Expliqué par ${w}`,
      signH: 'Signatures', prepSign: 'Signer la préparation', revSign: 'Signer la révision', signed: (w, d) => `Signé par ${w} · ${d}`, unsign: 'Retirer',
      block: { flags: (n) => `${n} exception${n > 1 ? 's' : ''} à régler`, checks: (n) => `${n} écart${n > 1 ? 's' : ''} sans explication`, prep: 'La préparation doit être signée d’abord', marks: (n) => `${n} exception${n > 1 ? 's' : ''} pas révisée${n > 1 ? 's' : ''}`, role: 'Passe en mode Réviseur pour signer' },
      ready: 'Prêt à signer.',
      logH: 'Journal de révision', logEmpty: 'Aucune action encore.',
      act: { acct: (d, a) => `${d} → ${a}`, approve: (n) => `${n} opération${n > 1 ? 's' : ''} approuvée${n > 1 ? 's' : ''}`, mark: (d) => `Révisé : ${d}`, unmark: (d) => `Révision retirée : ${d}`, explain: (c) => `Écart expliqué : ${c}`, sign: (r) => `Signature : ${r}`, unsign: (r) => `Signature retirée : ${r}`, void: 'Signatures retirées : changement après signature', set: (k, a, b) => `Réglage ${k} : ${a} → ${b}` },
      journalH: 'Écritures de journal', exportAudit: 'Piste de vérification (CSV)',
      toastApproved: (n, s) => `${n} approuvée${n > 1 ? 's' : ''}${s ? ` · ${s} demandent un compte` : ''}`, toastMoved: (n) => `${n} opération${n > 1 ? 's' : ''} reclassée${n > 1 ? 's' : ''}`,
      toastSigned: 'Signé', toastVoid: 'Changement après signature : les signatures sont retirées',
    },
    eng: {
      title: 'Moteur', lead: 'Tous les réglages du pilote auto. Chaque changement est noté et relance le calcul.',
      def: (v) => `défaut ${v}`, changed: 'modifié', reset: 'Tout remettre par défaut', exp: 'Exporter les réglages', imp: 'Importer des réglages',
      sec: { tax: 'Taxes', itc: 'Crédits de taxe par compte', filing: 'Production et comptes clients', match: 'Rapprochement des paiements', sort: 'Classement', flags: 'Signalements', rules: 'Règles de fournisseurs', memory: 'Fournisseurs appris', log: 'Journal des réglages' },
      f: {
        gst: ['TPS', 'Taux fédéral'], qst: ['TVQ', 'Taux du Québec'],
        filing: ['Fréquence TPS/TVQ', 'Période de déclaration du client'], terms: ['Délai de paiement', 'Quand le fichier n’a pas de date d’échéance'],
        'aging.0': ['Âge des comptes · palier 1', 'jours'], 'aging.1': ['Palier 2', 'jours'], 'aging.2': ['Palier 3', 'jours'],
        'match.tolerance': ['Écart toléré', 'Entre le dépôt et la facture'], 'match.earlyDays': ['Paiement avant la facture', 'jours permis'],
        'match.staleDays': ['Facture trop vieille', 'après, elle compte moins'], 'match.nameMin': ['Nom du client reconnu', 'part des mots qui doivent se retrouver'],
        'match.maxCombo': ['Factures par paiement', 'maximum combiné'],
        similar: ['Ressemblance minimale', 'pour réutiliser un fournisseur appris'], lowConf: ['Confiance minimale', 'en dessous, la ligne va en révision'],
        duplicateDays: ['Doublon si dans les', 'jours'], 'outlier.z': ['Montant inhabituel : écart', 'score z robuste'], 'outlier.min': ['… et au moins', 'montant'],
        'outlier.minCount': ['… sur au moins', 'opérations du même compte'], 'outlier.skip': ['Comptes jamais signalés', 'numéros séparés par des virgules'],
      },
      freq: { monthly: 'Mensuelle', quarterly: 'Trimestrielle', annual: 'Annuelle' },
      itcLead: 'Part de la TPS/TVQ payée qui revient en crédit. Repas : 50 %. 0 % = fourniture exonérée.',
      rulesLead: 'Lues dans l’ordre; la première qui s’applique gagne. Texte en majuscules, sans accents.',
      pattern: 'Motif', account: 'Compte', del: (n) => `Supprimer la règle ${n}`, add: 'Ajouter une règle', test: 'Tester une description', testPh: 'ex. PETRO-CANADA 1180 LAVAL',
      hit: (n, a) => `Règle n° ${n} → ${a}`, miss: 'Aucune règle : la ligne ira en révision', badRe: 'Motif illisible : il sera ignoré',
      memLead: 'Ce que tu as appris au pilote auto. Change le compte ou oublie un fournisseur.', memEmpty: 'Rien d’appris encore.', forget: (k) => `Oublier ${k}`,
      logEmpty: 'Aucun réglage changé.', toastSet: (k) => `${k} changé · calcul relancé`, toastReset: 'Réglages par défaut', toastImp: 'Réglages importés', toastBad: 'Fichier de réglages illisible',
    },
    cal: {
      title: 'Calendrier', lead: 'Toutes les échéances ARC et Revenu Québec de tes clients, calculées selon leur profil.',
      prev: 'Mois précédent', next: 'Mois suivant', today: 'Aujourd’hui', all: 'Tous les clients', who: 'Client', kinds: 'Types',
      kind: { tax: 'TPS/TVQ', das: 'Retenues (DAS)', inst: 'Acomptes', corp: 'T2 / CO-17', pers: 'T1 / TP-1', slips: 'T4 / RL-1', mine: 'Rappels' },
      ev: {
        tax: (p) => `TPS/TVQ · ${p}`, das: () => 'Retenues à la source (DAS)', inst: () => 'Acompte d’impôt', corpBal: () => 'Solde d’impôt T2 / CO-17',
        corpRet: () => 'Déclaration T2 + CO-17', pers: () => 'T1 + TP-1 · solde et déclaration', persSelf: () => 'T1 + TP-1 · travailleur autonome', slips: () => 'T4, RL-1 et sommaires',
      },
      dayLabel: (d, n) => `${d}${n ? `, ${n} échéance${n > 1 ? 's' : ''}` : ''}`, nothing: 'Aucune échéance ce jour-là.',
      month: (n, f, l) => `${n} échéance${n > 1 ? 's' : ''} ce mois-ci · ${f} produite${f > 1 ? 's' : ''}${l ? ` · ${l} en retard` : ''}`,
      filed: 'Produit', toFile: 'Marquer comme produit', waiting: 'Documents manquants', addH: 'Ajouter un rappel', addTitle: 'Quoi', addDate: 'Date', add: 'Ajouter',
      ics: 'Exporter vers mon agenda (.ics)', toastAdd: 'Rappel ajouté', del: 'Supprimer le rappel', open: 'Voir au calendrier',
      profile: (c) => `TPS/TVQ ${c} · fin d’exercice ${c}`,
    },
    prof: { freq: 'TPS/TVQ', fye: 'Fin d’exercice', next: 'Prochaine échéance', team: 'Équipe' },
  },
  en: {
    review: {
      title: 'Review', lead: 'Every Autopilot decision, with its reason. Fix, approve in batches, then sign off.',
      none: 'Nothing to review yet. Run Autopilot on a client file, or try the sample files.', run: 'Open Autopilot',
      stats: { lines: 'lines', auto: 'sorted on their own', conf: 'average confidence', open: 'open exceptions', done: 'reviewed' },
      role: 'I am working as', roles: { prep: 'Preparer', rev: 'Reviewer' }, initials: 'Initials',
      filters: { flags: 'Exceptions', all: 'All', changed: 'Changed', todo: 'Not reviewed' },
      selAll: 'Select all', selNone: 'Select none', approve: (n) => `Approve (${n})`, moveTo: 'Move to', move: 'Move',
      sel: (d) => `Select ${d}`, mark: (d) => `Mark reviewed: ${d}`, acct: (d) => `Account for ${d}`,
      how: { rule: 'Rule', memory: 'Learned', similar: 'Similar', exact: 'Invoice', multi: 'Invoices', partial: 'Partial', you: 'By hand', none: 'None' },
      why: {
        rule: (w) => (w.inRule ? `Income rule: ${w.re}` : `Rule #${w.rule + 1}: ${w.re}`), memory: (w) => `Learned vendor: "${w.key}"`,
        similar: (w) => `Looks like "${w.key}" (${Math.round(w.score * 100)}% of words)`,
        match: (x) => `${x.invoices.join(' + ')} · name ${Math.round((x.why.name || 0) * 100)}%${x.why.lag != null ? ` · ${x.why.lag} d after invoice` : ''}`,
        you: () => 'Account picked by hand', none: () => 'No rule applies',
      },
      tax: (g, q) => `ITC ${g} · ITR ${q}`,
      empty: 'Nothing in this filter.',
      checksH: 'Tie-outs', checksLead: 'Each tie-out shows what it compares, so you can redo it by hand.',
      ck: {
        balanced: ['Debits = credits', 'Total debits against total credits'],
        entries: ['Every entry balances', 'Entries checked one by one'],
        bankTie: ['Bank = statement', 'Account 1010 against the change in the statement balance'],
        running: ['Running balance follows', 'Lines where the balance jumps (missing line?)'],
        sorted: ['Everything sorted', 'Lines still in "To sort"'],
        gst: ['GST collected recomputed', 'Account 2310 against GST recomputed invoice by invoice'],
        itc: ['ITC + ITR recomputed', 'Accounts 1310 + 1320 against the line-by-line total'],
        invoiceNos: ['Unique invoice numbers', 'Duplicate numbers'],
        period: ['One period only', 'Lines outside the month processed'],
        rules: ['Rules valid', 'Rules that cannot be read (skipped)'],
      },
      pass: 'Ties', fail: 'Difference', na: 'N/A', explain: 'Why the difference', explained: (w) => `Explained by ${w}`,
      signH: 'Sign-off', prepSign: 'Sign as preparer', revSign: 'Sign as reviewer', signed: (w, d) => `Signed by ${w} · ${d}`, unsign: 'Remove',
      block: { flags: (n) => `${n} exception${n > 1 ? 's' : ''} to clear`, checks: (n) => `${n} difference${n > 1 ? 's' : ''} not explained`, prep: 'The preparer signs first', marks: (n) => `${n} exception${n > 1 ? 's' : ''} not reviewed`, role: 'Switch to Reviewer to sign' },
      ready: 'Ready to sign.',
      logH: 'Review log', logEmpty: 'No actions yet.',
      act: { acct: (d, a) => `${d} → ${a}`, approve: (n) => `${n} line${n > 1 ? 's' : ''} approved`, mark: (d) => `Reviewed: ${d}`, unmark: (d) => `Review removed: ${d}`, explain: (c) => `Difference explained: ${c}`, sign: (r) => `Signed: ${r}`, unsign: (r) => `Signature removed: ${r}`, void: 'Signatures removed: change after sign-off', set: (k, a, b) => `Setting ${k}: ${a} → ${b}` },
      journalH: 'Journal entries', exportAudit: 'Audit trail (CSV)',
      toastApproved: (n, s) => `${n} approved${s ? ` · ${s} need an account` : ''}`, toastMoved: (n) => `${n} line${n > 1 ? 's' : ''} moved`,
      toastSigned: 'Signed', toastVoid: 'Changed after sign-off: signatures removed',
    },
    eng: {
      title: 'Engine', lead: 'Every Autopilot setting. Each change is logged and reruns the books.',
      def: (v) => `default ${v}`, changed: 'changed', reset: 'Reset everything to defaults', exp: 'Export settings', imp: 'Import settings',
      sec: { tax: 'Sales taxes', itc: 'Tax credits by account', filing: 'Filing and receivables', match: 'Payment matching', sort: 'Sorting', flags: 'Flags', rules: 'Vendor rules', memory: 'Learned vendors', log: 'Settings log' },
      f: {
        gst: ['GST', 'Federal rate'], qst: ['QST', 'Québec rate'],
        filing: ['GST/QST frequency', "Client's reporting period"], terms: ['Payment terms', 'When the file has no due date'],
        'aging.0': ['Aging · bucket 1', 'days'], 'aging.1': ['Bucket 2', 'days'], 'aging.2': ['Bucket 3', 'days'],
        'match.tolerance': ['Allowed difference', 'Between deposit and invoice'], 'match.earlyDays': ['Paid before the invoice', 'days allowed'],
        'match.staleDays': ['Invoice gets stale', 'after this it counts less'], 'match.nameMin': ['Client name found', 'share of words that must appear'],
        'match.maxCombo': ['Invoices per payment', 'most combined'],
        similar: ['Minimum likeness', 'to reuse a learned vendor'], lowConf: ['Minimum confidence', 'below this a line goes to review'],
        duplicateDays: ['Duplicate if within', 'days'], 'outlier.z': ['Unusual amount: spread', 'robust z-score'], 'outlier.min': ['… and at least', 'amount'],
        'outlier.minCount': ['… out of at least', 'lines in the same account'], 'outlier.skip': ['Accounts never flagged', 'numbers, comma separated'],
      },
      freq: { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' },
      itcLead: 'Share of GST/QST paid that comes back as a credit. Meals: 50%. 0% = exempt supply.',
      rulesLead: 'Read in order; the first that applies wins. Upper case text, no accents.',
      pattern: 'Pattern', account: 'Account', del: (n) => `Delete rule ${n}`, add: 'Add a rule', test: 'Test a description', testPh: 'e.g. PETRO-CANADA 1180 LAVAL',
      hit: (n, a) => `Rule #${n} → ${a}`, miss: 'No rule: the line will go to review', badRe: 'Pattern cannot be read: it will be skipped',
      memLead: 'What you taught Autopilot. Change the account or forget a vendor.', memEmpty: 'Nothing learned yet.', forget: (k) => `Forget ${k}`,
      logEmpty: 'No setting changed.', toastSet: (k) => `${k} changed · books rerun`, toastReset: 'Default settings', toastImp: 'Settings imported', toastBad: 'Settings file cannot be read',
    },
    cal: {
      title: 'Calendar', lead: "Every CRA and Revenu Québec date for your clients, worked out from each client's profile.",
      prev: 'Previous month', next: 'Next month', today: 'Today', all: 'All clients', who: 'Client', kinds: 'Types',
      kind: { tax: 'GST/QST', das: 'Source deductions', inst: 'Instalments', corp: 'T2 / CO-17', pers: 'T1 / TP-1', slips: 'T4 / RL-1', mine: 'Reminders' },
      ev: {
        tax: (p) => `GST/QST · ${p}`, das: () => 'Source deductions remittance', inst: () => 'Tax instalment', corpBal: () => 'T2 / CO-17 balance due',
        corpRet: () => 'T2 + CO-17 return', pers: () => 'T1 + TP-1 · balance and return', persSelf: () => 'T1 + TP-1 · self-employed', slips: () => 'T4, RL-1 and summaries',
      },
      dayLabel: (d, n) => `${d}${n ? `, ${n} deadline${n > 1 ? 's' : ''}` : ''}`, nothing: 'No deadline that day.',
      month: (n, f, l) => `${n} deadline${n > 1 ? 's' : ''} this month · ${f} filed${l ? ` · ${l} late` : ''}`,
      filed: 'Filed', toFile: 'Mark as filed', waiting: 'Documents missing', addH: 'Add a reminder', addTitle: 'What', addDate: 'Date', add: 'Add',
      ics: 'Export to my calendar (.ics)', toastAdd: 'Reminder added', del: 'Delete reminder', open: 'See on calendar',
    },
    prof: { freq: 'GST/QST', fye: 'Year end', next: 'Next deadline', team: 'Team' },
  },
};
const tp = () => TP[state.lang];
const E_ = () => SolvaEngine;

/* ---------- state (app.js merges this in) ---------- */
function deskInit() {
  const d = { settings: {}, setLog: [], rv: freshReview(), cal: { y: TODAY.getFullYear(), m: TODAY.getMonth(), sel: isoOf(TODAY), client: 'all', off: [], mine: [] } };
  return d;
}
function deskSeed() { // a firm's real calendar: what was due before today is already filed, except Café Mistral's late return
  for (let i = -3; i <= 0; i++) monthEvents(TODAY.getFullYear(), TODAY.getMonth() + i).forEach((e) => { if (e.date < TODAY && e.client && e.client.id !== 'mistral') state.filed.add(e.id); });
}
function freshReview(who) { return { filter: 'flags', sel: [], marks: {}, explained: {}, sign: { prep: null, rev: null }, role: 'prep', who: who || { prep: 'JT', rev: 'MB' }, log: [] }; }
function deskSave() { Bind.flush(); } // settings, log, reminders, initials: saved through the store (store-bind.js)
const isoOf = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((x) => String(x).padStart(2, '0')).join('-');
const stamp = () => new Date().toLocaleString(loc(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const me = () => state.rv.who[state.rv.role] || '—';
const pctTxt = (v) => new Intl.NumberFormat(loc(), { style: 'percent', maximumFractionDigits: 3 }).format(v);
const eff = () => E_().settingsOf(state.settings);

/* ---------- review ---------- */
function rvLog(text, change) {
  const rv = state.rv;
  if (change && (rv.sign.prep || rv.sign.rev)) { rv.sign = { prep: null, rev: null }; rv.log.push({ at: stamp(), who: me(), text: tp().review.act.void }); toast(tp().review.toastVoid); }
  rv.log.push({ at: stamp(), who: me(), text });
}
const flagsById = (r) => Object.fromEntries(r.review.filter((x) => x.tx).map((x) => [x.id, x.type]));
function isException(x, r, flags) { return flags[x.id] || x.how === 'none' || x.conf < +r.settings.lowConf; }
function reasonOf(x) {
  const W = tp().review.why;
  return x.how === 'rule' ? W.rule(x.why) : x.how === 'memory' ? W.memory(x.why) : x.how === 'similar' ? W.similar(x.why)
    : ['exact', 'multi', 'partial'].includes(x.how) ? W.match(x) : x.how === 'you' ? W.you() : W.none();
}
function acctOptions(sel) {
  return Object.keys(E_().ACCOUNTS).map((a) => `<option value="${a}" ${+a === +sel ? 'selected' : ''}>${a} · ${acctName(a)}</option>`).join('');
}
function signBlockers(r) {
  const R = tp().review.block, rv = state.rv, flags = flagsById(r), out = { prep: [], rev: [] };
  const open = r.review.length, unexplained = r.checks.filter((c) => c.ok === false && !rv.explained[c.id]).length;
  const unmarked = r.bank.filter((x) => isException(x, r, flags) && !rv.marks[x.id]).length;
  if (open) out.prep.push(R.flags(open));
  if (unexplained) out.prep.push(R.checks(unexplained));
  if (rv.role !== 'prep') out.prep.push(R.role.replace(/Réviseur|Reviewer/, tp().review.roles.prep));
  if (!rv.sign.prep) out.rev.push(R.prep);
  if (unmarked) out.rev.push(R.marks(unmarked));
  if (unexplained) out.rev.push(R.checks(unexplained));
  if (rv.role !== 'rev') out.rev.push(R.role);
  return out;
}
function renderReview() {
  const el = $('#rvOut'); if (!el) return;
  const R = tp().review, r = state.auto.result, rv = state.rv;
  if (!r || !r.ok) {
    el.innerHTML = `<div class="card empty"><i data-lucide="shield-check"></i><p>${R.none}</p>
      <div class="acts"><a class="btn primary" href="#/auto"><i data-lucide="wand-sparkles"></i>${R.run}</a><button class="btn soft" data-sample="1"><i data-lucide="sparkles"></i>${t().auto.sample}</button></div></div>`;
    return;
  }
  const flags = flagsById(r), client = CLIENTS.find((c) => c.id === state.auto.client).name;
  const ex = r.bank.filter((x) => isException(x, r, flags));
  const avg = r.bank.reduce((s, x) => s + x.conf, 0) / r.bank.length;
  const changed = (x) => x.how === 'you' || state.auto.decisions[x.id];
  const shown = r.bank.filter((x) => (rv.filter === 'flags' ? isException(x, r, flags) : rv.filter === 'changed' ? changed(x) : rv.filter === 'todo' ? !rv.marks[x.id] : true));
  const nSel = rv.sel.filter((id) => shown.some((x) => x.id === id)).length;
  const blk = signBlockers(r);
  const sigRow = (k) => {
    const s = rv.sign[k], can = !blk[k].length;
    return `<li class="sig ${s ? 'on' : ''}"><span class="ic"><i data-lucide="${s ? 'file-check' : 'pen-line'}"></i></span>
      <div><b>${R.roles[k]}</b><small>${s ? R.signed(esc(s.by), s.at) : can ? R.ready : blk[k].join(' · ')}</small></div>
      ${s ? `<button class="btn soft" data-rv-unsign="${k}">${R.unsign}</button>`
        : `<button class="btn ${can ? 'primary' : 'soft'}" data-rv-sign="${k}" ${can ? '' : 'aria-disabled="true"'}>${k === 'prep' ? R.prepSign : R.revSign}</button>`}</li>`;
  };
  el.innerHTML = `
    <p class="kicker">${esc(client)} · ${periodName(r.period)}</p>
    <ul class="stats five">
      <li class="card"><b class="num">${r.bank.length}</b><small>${R.stats.lines}</small></li>
      <li class="card"><b class="num">${r.sorted.auto} / ${r.sorted.outs}</b><small>${R.stats.auto}</small></li>
      <li class="card"><b class="num">${Math.round(avg * 100)} %</b><small>${R.stats.conf}</small></li>
      <li class="card ${r.review.length ? 'warn' : ''}"><b class="num">${r.review.length}</b><small>${R.stats.open}</small></li>
      <li class="card"><b class="num">${Object.keys(rv.marks).length} / ${r.bank.length}</b><small>${R.stats.done}</small></li>
    </ul>
    <div class="card who">
      <div class="seg" role="radiogroup" aria-label="${R.role}">${['prep', 'rev'].map((k) => `<button role="radio" aria-checked="${rv.role === k}" tabindex="${rv.role === k ? 0 : -1}" data-rv-role="${k}">${R.roles[k]}</button>`).join('')}</div>
      <label class="field inline"><span>${R.initials}</span><input class="input" maxlength="4" value="${esc(rv.who[rv.role])}" data-rv-who="${rv.role}" autocomplete="off"></label>
    </div>
    ${r.review.length ? `<h2>${t().auto.checkH}</h2><ul class="reviews">${r.review.map(reviewCard).join('')}</ul>` : ''}
    <h2>${R.title}</h2>
    <div class="seg wide rv" role="radiogroup" aria-label="${R.title}">${Object.entries(R.filters).map(([k, l]) => `<button role="radio" aria-checked="${rv.filter === k}" tabindex="${rv.filter === k ? 0 : -1}" data-rv-filter="${k}">${l}<span class="count num">${
      (k === 'flags' ? ex : k === 'changed' ? r.bank.filter(changed) : k === 'todo' ? r.bank.filter((x) => !rv.marks[x.id]) : r.bank).length}</span></button>`).join('')}</div>
    <div class="batch card">
      <button class="btn soft" data-rv-all="${nSel === shown.length && shown.length ? 0 : 1}">${nSel === shown.length && shown.length ? R.selNone : R.selAll}</button>
      <button class="btn primary" data-rv-approve="1" ${nSel ? '' : 'aria-disabled="true"'}><i data-lucide="circle-check"></i>${R.approve(nSel)}</button>
      <label class="field inline"><span>${R.moveTo}</span><select id="rvMoveTo">${acctOptions(5100)}</select></label>
      <button class="btn soft" data-rv-move="1" ${nSel ? '' : 'aria-disabled="true"'}>${R.move}</button>
    </div>
    ${shown.length ? `<ul class="txs">${shown.map((x) => {
      const d = esc(x.desc), mk = rv.marks[x.id], f = flags[x.id], low = x.conf < +r.settings.lowConf;
      return `<li class="tx ${f || x.how === 'none' ? 'flag' : low ? 'low' : ''} ${mk ? 'ok' : ''}">
        <label class="sel"><input type="checkbox" data-rv-sel="${esc(x.id)}" ${rv.sel.includes(x.id) ? 'checked' : ''} aria-label="${R.sel(d)}"></label>
        <div class="tx-main"><b>${d}</b><small>${day(x.date)} · ${esc(x.ref)}${f ? ` · <span class="pill amber">${t().auto.tag[f]}</span>` : ''}</small></div>
        <b class="num amt ${x.amount > 0 ? 'in' : ''}">${cents(x.amount)}</b>
        <select class="tx-acct" data-rv-acct="${esc(x.id)}" aria-label="${R.acct(d)}">${acctOptions(x.account)}</select>
        <div class="tx-why"><span class="pill how how-${x.how}">${R.how[x.how]}</span><small>${esc(reasonOf(x))}${x.tax ? ` · ${R.tax(cents(x.tax.gst), cents(x.tax.qst))}` : ''}</small></div>
        <div class="conf ${low ? 'low' : ''}"><span class="bar" role="img" aria-label="${Math.round(x.conf * 100)} %"><i style="width:${Math.round(x.conf * 100)}%"></i></span><span class="num">${Math.round(x.conf * 100)} %</span></div>
        <button class="round" aria-pressed="${!!mk}" data-rv-mark="${esc(x.id)}" aria-label="${R.mark(d)}" ${mk ? `title="${esc(mk.by)} · ${mk.at}"` : ''}><i data-lucide="check"></i></button></li>`;
    }).join('')}</ul>` : `<p class="muted empty-line">${R.empty}</p>`}
    <h2>${R.checksH}</h2><p class="lead small">${R.checksLead}</p>
    <ul class="checks-out">${r.checks.map((c) => {
      const [name, what] = R.ck[c.id], st = c.ok === null ? 'na' : c.ok ? 'pass' : rv.explained[c.id] ? 'expl' : 'fail';
      const val = (v) => (v == null ? '—' : ['balanced', 'bankTie', 'gst', 'itc'].includes(c.id) ? cents(v) : v);
      return `<li class="card ck ${st}"><span class="ic"><i data-lucide="${st === 'pass' ? 'circle-check' : st === 'na' ? 'circle-minus' : st === 'expl' ? 'info' : 'circle-x'}"></i></span>
        <div><b>${name}</b><small>${what}${c.list && c.list.length ? ` : ${esc(c.list.join(', '))}` : ''}</small>
        ${st === 'fail' || st === 'expl' ? `<label class="field"><span>${R.explain}</span><input class="input" data-rv-explain="${c.id}" value="${esc((rv.explained[c.id] || {}).text || '')}"></label>${rv.explained[c.id] ? `<small>${R.explained(esc(rv.explained[c.id].by))}</small>` : ''}` : ''}</div>
        <div class="vs"><span class="pill ${st === 'pass' ? '' : st === 'na' ? 'grey' : 'amber'}">${st === 'pass' ? R.pass : st === 'na' ? R.na : R.fail}</span><small class="num">${val(c.a)} · ${val(c.b)}</small></div></li>`;
    }).join('')}</ul>
    <h2>${R.signH}</h2><ul class="sigs card">${sigRow('prep')}${sigRow('rev')}</ul>
    ${more('journal', R.journalH, `<div class="jr"><table><thead><tr><th>Date</th><th>${state.lang === 'fr' ? 'Réf.' : 'Ref'}</th><th>${tp().eng.account}</th><th class="num">${state.lang === 'fr' ? 'Débit' : 'Debit'}</th><th class="num">${state.lang === 'fr' ? 'Crédit' : 'Credit'}</th></tr></thead><tbody>${
      r.journal.map((e) => e.lines.map((l, i) => `<tr class="${i ? '' : 'top'}"><td>${i ? '' : e.date}</td><td>${i ? '' : esc(e.ref)}</td><td>${l.acct} · ${acctName(l.acct)}</td><td class="num">${l.dr ? cents(l.dr) : ''}</td><td class="num">${l.cr ? cents(l.cr) : ''}</td></tr>`).join('')).join('')}</tbody></table></div>`)}
    ${more('rvlog', R.logH, rv.log.length ? `<ol class="log">${[...rv.log].reverse().map((l) => `<li><small>${l.at} · <b>${esc(l.who)}</b></small><span>${esc(l.text)}</span></li>`).join('')}</ol>` : `<p class="muted pad">${R.logEmpty}</p>`)}
    <div class="dl"><button class="btn soft" data-rv-audit="1"><i data-lucide="download"></i>${R.exportAudit}</button>${Object.keys(t().auto.dl).map((k) => `<button class="btn soft" data-dl="${k}"><i data-lucide="download"></i>${t().auto.dl[k]}</button>`).join('')}</div>`;
}
async function setAccount(ids, acct) {
  const a = state.auto, R = tp().review, prev = { ...a.decisions };
  ids.forEach((id) => { a.decisions[id] = { account: +acct }; });
  const descs = ids.map((id) => a.result.bank.find((x) => x.id === id)).filter(Boolean);
  descs.forEach((x) => rvLog(R.act.acct(x.desc, `${acct} ${acctName(acct)}`), true));
  await rerun();
  toast(ids.length > 1 ? R.toastMoved(ids.length) : t().auto.toastSaved, () => { a.decisions = prev; rerun(); });
}
async function approve(ids) {
  const a = state.auto, rv = state.rv, R = tp().review, flags = flagsById(a.result), prev = { d: { ...a.decisions }, m: { ...rv.marks } };
  let n = 0, skip = 0;
  ids.forEach((id) => {
    const f = flags[id];
    if (f === 'unknown' || f === 'deposit') { skip++; return; } // these need an account, not a yes
    if (f) a.decisions[id] = { ok: true };
    rv.marks[id] = { by: me(), at: stamp() }; n++;
  });
  if (n) rvLog(R.act.approve(n), true);
  rv.sel = [];
  await rerun();
  toast(R.toastApproved(n, skip), () => { a.decisions = prev.d; rv.marks = prev.m; rerun(); });
}
function auditCSV() {
  const r = state.auto.result, rv = state.rv, fr = state.lang === 'fr', flags = flagsById(r);
  const q = (v) => (/[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const rows = [fr ? ['Date', 'Réf.', 'Description', 'Montant', 'Compte', 'Méthode', 'Raison', 'Confiance', 'Signalement', 'Révisé par', 'Quand']
    : ['Date', 'Ref', 'Description', 'Amount', 'Account', 'Method', 'Reason', 'Confidence', 'Flag', 'Reviewed by', 'When'],
  ...r.bank.map((x) => [x.date, x.ref, x.desc, x.amount.toFixed(2), `${x.account} ${acctName(x.account)}`, x.how, reasonOf(x), Math.round(x.conf * 100) + '%', flags[x.id] || '', (rv.marks[x.id] || {}).by || '', (rv.marks[x.id] || {}).at || '']),
  [], [fr ? 'Contrôle' : 'Tie-out', fr ? 'Résultat' : 'Result', fr ? 'Livres' : 'Books', fr ? 'Attendu' : 'Expected', fr ? 'Explication' : 'Explanation'],
  ...r.checks.map((c) => [tp().review.ck[c.id][0], c.ok === null ? 'n/a' : c.ok ? 'ok' : 'diff', c.a ?? '', c.b ?? '', (rv.explained[c.id] || {}).text || '']),
  [], [fr ? 'Quand' : 'When', fr ? 'Qui' : 'Who', fr ? 'Action' : 'Action'], ...rv.log.map((l) => [l.at, l.who, l.text]),
  [], ...['prep', 'rev'].map((k) => [tp().review.roles[k], (rv.sign[k] || {}).by || '', (rv.sign[k] || {}).at || ''])];
  saveFile(`${state.auto.client}-${r.period}-audit.csv`, '﻿' + rows.map((x) => x.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
function saveFile(name, text, type) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/* ---------- engine settings ---------- */
const FIELDS = {
  tax: [['gst', 'pct'], ['qst', 'pct']],
  filing: [['filing', 'freq'], ['terms', 'int'], ['aging.0', 'int'], ['aging.1', 'int'], ['aging.2', 'int']],
  match: [['match.tolerance', 'money'], ['match.earlyDays', 'int'], ['match.staleDays', 'int'], ['match.nameMin', 'pct'], ['match.maxCombo', 'int']],
  sort: [['similar', 'pct'], ['lowConf', 'pct']],
  flags: [['duplicateDays', 'int'], ['outlier.z', 'num'], ['outlier.min', 'money'], ['outlier.minCount', 'int'], ['outlier.skip', 'list']],
};
const getP = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
function setP(o, p, v) { const ks = p.split('.'); let x = o; ks.slice(0, -1).forEach((k) => { x = x[k]; }); x[ks[ks.length - 1]] = v; }
function showVal(v, kind) {
  return kind === 'pct' ? pctTxt(+v) : kind === 'money' ? cents(+v) : kind === 'list' ? (v || []).join(', ') : kind === 'freq' ? tp().eng.freq[v] : String(v);
}
function fieldHtml(path, kind) {
  const E = tp().eng, S = eff(), v = getP(S, path), d = getP(E_().DEFAULTS, path), [label, help] = E.f[path] || [path, ''];
  const on = JSON.stringify(v) !== JSON.stringify(d), id = 'set-' + path.replace(/\./g, '-');
  const input = kind === 'freq'
    ? `<select id="${id}" data-set="${path}" data-kind="${kind}">${Object.entries(E.freq).map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`
    : `<span class="unit-in"><input class="input num" id="${id}" data-set="${path}" data-kind="${kind}" inputmode="decimal" value="${kind === 'pct' ? +(v * 100).toFixed(3) : kind === 'list' ? (v || []).join(', ') : v}">${kind === 'pct' ? '<i>%</i>' : kind === 'money' ? '<i>$</i>' : ''}</span>`;
  return `<li class="set ${on ? 'on' : ''}"><label for="${id}"><b>${label}</b><small>${help} · ${E.def(showVal(d, kind))}${on ? ` · <em>${E.changed}</em>` : ''}</small></label>${input}</li>`;
}
function ruleTest(text) {
  const E = tp().eng, S = eff(), c = E_().compile(S.rules), f = E_().fold(text);
  if (!f) return '';
  const hit = c.ok.find((x) => x.re.test(f));
  return hit ? E.hit(hit.i + 1, `${hit.acct} · ${acctName(hit.acct)}`) : E.miss;
}
function renderEngine() {
  const el = $('#engOut'); if (!el) return;
  const E = tp().eng, S = eff(), bad = new Set(E_().compile(S.rules).bad.map((b) => b.i));
  const sec = (k, body, lead = '') => `<section class="card eng"><h2>${E.sec[k]}</h2>${lead ? `<p class="muted">${lead}</p>` : ''}${body}</section>`;
  const list = (k) => `<ul class="sets">${FIELDS[k].map(([p, kind]) => fieldHtml(p, kind)).join('')}</ul>`;
  const itcAccts = Object.keys(E_().ACCOUNTS).filter((a) => +a === 1500 || +a >= 5000);
  const mem = Object.entries(state.auto.memory);
  el.innerHTML = `
    <div class="eng-tools"><button class="btn soft" data-eng-exp="1"><i data-lucide="download"></i>${E.exp}</button>
      <button class="btn soft" data-eng-imp="1"><i data-lucide="upload"></i>${E.imp}</button>
      <button class="btn soft" data-eng-reset="1"><i data-lucide="rotate-ccw"></i>${E.reset}</button></div>
    <div class="eng-grid">
    ${sec('tax', list('tax'))}
    ${sec('filing', list('filing'))}
    ${sec('itc', `<ul class="sets two">${itcAccts.map((a) => {
      const v = +(S.itc[a] || 0), d = +(E_().DEFAULTS.itc[a] || 0), id = `set-itc-${a}`;
      return `<li class="set ${v !== d ? 'on' : ''}"><label for="${id}"><b>${a} · ${acctName(a)}</b><small>${E.def(pctTxt(d))}${v !== d ? ` · <em>${E.changed}</em>` : ''}</small></label>
        <span class="unit-in"><input class="input num" id="${id}" data-set="itc.${a}" data-kind="pct" inputmode="decimal" value="${+(v * 100).toFixed(2)}"><i>%</i></span></li>`;
    }).join('')}</ul>`, E.itcLead)}
    ${sec('match', list('match'))}
    ${sec('sort', list('sort'))}
    ${sec('flags', list('flags'))}
    </div>
    ${sec('rules', `<ol class="rules">${S.rules.map((x, i) => `<li class="${bad.has(i) ? 'bad' : ''}"><span class="no num">${i + 1}</span>
        <label class="field"><span class="sr">${E.pattern} ${i + 1}</span><input class="input mono" data-rule-re="${i}" value="${esc(x.re)}" spellcheck="false"></label>
        <label class="field"><span class="sr">${E.account} ${i + 1}</span><select data-rule-acct="${i}">${acctOptions(x.acct)}</select></label>
        <button class="round" data-rule-del="${i}" aria-label="${E.del(i + 1)}"><i data-lucide="trash-2"></i></button>${bad.has(i) ? `<small class="warn-line">${E.badRe}</small>` : ''}</li>`).join('')}</ol>
      <button class="btn soft" data-rule-add="1"><i data-lucide="plus"></i>${E.add}</button>
      <label class="field test"><span>${E.test}</span><span class="test-row"><i data-lucide="search"></i><input class="input" id="ruleTest" placeholder="${E.testPh}" autocomplete="off"></span></label>
      <p class="test-out" id="ruleTestOut" aria-live="polite"></p>`, E.rulesLead)}
    ${sec('memory', mem.length ? `<ul class="sets">${mem.map(([k, a]) => `<li class="set"><label for="mem-${esc(k)}"><b>${esc(k)}</b></label>
        <span class="mem-row"><select id="mem-${esc(k)}" data-mem="${esc(k)}">${acctOptions(a)}</select><button class="round" data-mem-del="${esc(k)}" aria-label="${E.forget(esc(k))}"><i data-lucide="trash-2"></i></button></span></li>`).join('')}</ul>`
      : `<p class="muted">${E.memEmpty}</p>`, E.memLead)}
    ${sec('log', state.setLog.length ? `<ol class="log">${[...state.setLog].reverse().slice(0, 40).map((l) => `<li><small>${l.at} · <b>${esc(l.who)}</b></small><span>${esc(l.text)}</span></li>`).join('')}</ol>` : `<p class="muted">${E.logEmpty}</p>`)}
    <input type="file" id="setIn" accept=".json,application/json" hidden>`;
}
async function changeSetting(mutate, label, from, to) {
  const prev = JSON.parse(JSON.stringify(state.settings)), S = eff();
  mutate(S);
  state.settings = S;
  const text = tp().review.act.set(label, from, to);
  state.setLog.push({ at: stamp(), who: me(), text });
  if (state.auto.result && state.auto.result.ok) rvLog(text, true);
  deskSave();
  if (state.auto.result && state.auto.result.ok) await rerun(); else render();
  toast(tp().eng.toastSet(label), () => { state.settings = prev; deskSave(); state.auto.result?.ok ? rerun() : render(); });
}
function parseVal(raw, kind) {
  if (kind === 'freq') return raw;
  if (kind === 'list') return raw.split(/[\s,;]+/).filter(Boolean).map(Number).filter((n) => !isNaN(n));
  const n = SolvaEngine.num(raw);
  if (n == null || n < 0) return null;
  return kind === 'pct' ? Math.round(n * 1000) / 100000 : kind === 'int' ? Math.round(n) : n;
}

/* ---------- calendar: dates worked out from each client's profile ---------- */
const KCOL = { tax: 'var(--ring)', das: 'var(--amber)', inst: '#7d8ea3', corp: 'var(--red)', pers: '#a07c94', slips: '#7fa889', mine: 'var(--muted)' };
const me2 = (y, m) => new Date(y, m + 1, 0); // month end, months may overflow
function rawEvents(y, m) { // what is due in month m (0-11) of year y, before weekend moves
  const out = [], K = tp().cal.ev, mm = ((m % 12) + 12) % 12;
  const push = (c, kind, d, text) => out.push({ id: `${kind}:${c ? c.id : 'x'}:${isoOf(d)}`, kind, client: c, date: d, text });
  for (const c of CLIENTS) {
    const p = c.profile, f = p.fye - 1; // fiscal year end, 0-11
    if (p.gst === 'monthly') push(c, 'tax', me2(y, m), K.tax(new Date(y, m - 1, 1).toLocaleDateString(loc(), { month: 'long' })));
    if (p.gst === 'quarterly' && mm % 3 === 0) push(c, 'tax', me2(y, m), K.tax(`T${((mm + 11) % 12) / 3 + 1 | 0}`.replace('T', state.lang === 'fr' ? 'T' : 'Q')));
    if (p.gst === 'annual' && mm === (f + 3) % 12) push(c, 'tax', me2(y, m), K.tax(String(mm <= f ? y - 1 : y)));
    if (p.payroll) push(c, 'das', new Date(y, m, 15), K.das());
    if (p.payroll && mm === 1) push(c, 'slips', me2(y, m), K.slips());
    if (p.type === 'corp') {
      if (p.inst === 'monthly') push(c, 'inst', me2(y, m), K.inst());
      if (p.inst === 'quarterly' && (mm - f + 12) % 3 === 0) push(c, 'inst', me2(y, m), K.inst());
      if (mm === (f + 3) % 12) push(c, 'corp', me2(y, m), K.corpBal());
      if (mm === (f + 6) % 12) push(c, 'corp', me2(y, m), K.corpRet());
    } else {
      if (mm === 3) push(c, 'pers', new Date(y, 3, 30), K.pers());
      if (mm === 5) push(c, 'pers', new Date(y, 5, 15), K.persSelf());
    }
  }
  return out;
}
function monthEvents(y, m) {
  const cal = state.cal;
  const all = rawEvents(y, m - 1).concat(rawEvents(y, m)).map((e) => ({ ...e, date: businessDay(e.date) }))
    .filter((e) => e.date.getFullYear() === new Date(y, m, 1).getFullYear() && e.date.getMonth() === new Date(y, m, 1).getMonth())
    .map((e) => ({ ...e, id: `${e.kind}:${e.client.id}:${isoOf(e.date)}` }));
  const mine = cal.mine.filter((x) => x.date.slice(0, 7) === isoOf(new Date(y, m, 1)).slice(0, 7))
    .map((x) => ({ id: x.id, kind: 'mine', client: CLIENTS.find((c) => c.id === x.client) || null, date: new Date(x.date + 'T12:00:00'), text: x.text, mine: 1 }));
  return all.concat(mine).filter((e) => (cal.client === 'all' || (e.client && e.client.id === cal.client)) && !cal.off.includes(e.kind))
    .sort((a, b) => a.date - b.date || a.kind.localeCompare(b.kind));
}
function upcoming(days) { // next n days, all clients, nothing hidden
  const keep = { client: state.cal.client, off: state.cal.off };
  state.cal.client = 'all'; state.cal.off = [];
  const end = new Date(TODAY.getTime() + days * DAY), out = [];
  for (let i = 0; i < 2; i++) out.push(...monthEvents(TODAY.getFullYear(), TODAY.getMonth() + i));
  Object.assign(state.cal, keep);
  return out.filter((e) => e.date >= TODAY && e.date <= end);
}
function renderCalendar() {
  const el = $('#calOut'); if (!el) return;
  const C = tp().cal, cal = state.cal, first = new Date(cal.y, cal.m, 1), evs = monthEvents(cal.y, cal.m);
  const lead = (first.getDay() + 6) % 7, days = me2(cal.y, cal.m).getDate(), cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(cal.y, cal.m, d));
  while (cells.length % 7) cells.push(null);
  const dow = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'short' }).replace('.', ''));
  const isLate = (e) => e.date < TODAY && !state.filed.has(e.id);
  const sel = new Date(cal.sel + 'T12:00:00'), selEv = evs.filter((e) => isoOf(e.date) === cal.sel);
  const filedN = evs.filter((e) => state.filed.has(e.id)).length, lateN = evs.filter(isLate).length;
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  el.innerHTML = `
    <div class="cal-head"><button class="round" data-cal-nav="-1" aria-label="${C.prev}"><i data-lucide="chevron-left"></i></button>
      <h2 id="calTitle" aria-live="polite">${first.toLocaleDateString(loc(), { month: 'long', year: 'numeric' })}</h2>
      <button class="round" data-cal-nav="1" aria-label="${C.next}"><i data-lucide="chevron-right"></i></button>
      <button class="btn soft" data-cal-nav="0">${C.today}</button></div>
    <div class="cal-tools">
      <label class="field inline"><span>${C.who}</span><select data-cal-client="1">${[['all', C.all], ...CLIENTS.map((c) => [c.id, c.name])].map(([k, l]) => `<option value="${k}" ${k === cal.client ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <div class="kinds" role="group" aria-label="${C.kinds}">${Object.entries(C.kind).map(([k, l]) => `<button class="chip" aria-pressed="${!cal.off.includes(k)}" data-cal-kind="${k}" style="--k:${KCOL[k]}"><i class="dot"></i>${l}</button>`).join('')}</div>
    </div>
    <p class="muted month-line">${C.month(evs.length, filedN, lateN)}</p>
    <div class="cal-wrap">
      <table class="cal" role="grid" aria-labelledby="calTitle"><thead><tr>${dow.map((d) => `<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>
      ${rows.map((r) => `<tr>${r.map((d) => {
        if (!d) return '<td class="pad"></td>';
        const iso = isoOf(d), de = evs.filter((e) => isoOf(e.date) === iso), today = iso === isoOf(TODAY), late = de.some(isLate);
        const label = C.dayLabel(d.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' }), de.length);
        return `<td><button class="cal-day ${today ? 'today' : ''} ${late ? 'late' : ''} ${de.length && de.every((e) => state.filed.has(e.id)) ? 'clear' : ''}" data-cal-day="${iso}" aria-pressed="${iso === cal.sel}" aria-label="${label}" tabindex="${iso === cal.sel ? 0 : -1}">
          <span class="dn num">${d.getDate()}</span>
          ${de.length ? `<span class="evs">${de.slice(0, 3).map((e) => `<i style="--k:${KCOL[e.kind]}" class="${state.filed.has(e.id) ? 'f' : ''}"><em>${esc(e.client ? e.client.short : e.text)}</em></i>`).join('')}${de.length > 3 ? `<small>+${de.length - 3}</small>` : ''}</span>` : ''}</button></td>`;
      }).join('')}</tr>`).join('')}</tbody></table>
      <aside class="card agenda" aria-live="polite">
        <h3>${sel.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
        ${selEv.length ? `<ul class="ag">${selEv.map((e) => {
          const done = state.filed.has(e.id);
          return `<li class="${done ? 'done' : ''} ${isLate(e) ? 'late' : ''}" style="--k:${KCOL[e.kind]}"><i class="bar"></i><div><b>${esc(e.text)}</b><small>${e.client ? esc(e.client.name) : ''}${e.client && e.client.status === 'action' && !done ? ` · <span class="pill amber">${C.waiting}</span>` : ''}</small></div>
            ${e.mine ? `<button class="round" data-cal-del="${esc(e.id)}" aria-label="${C.del}"><i data-lucide="trash-2"></i></button>` : ''}
            <button class="round" aria-pressed="${done}" data-cal-done="${esc(e.id)}" aria-label="${C.toFile} : ${esc(e.text)}"><i data-lucide="check"></i></button></li>`;
        }).join('')}</ul>` : `<p class="muted">${C.nothing}</p>`}
        <details class="add" ${cal.adding ? 'open' : ''}><summary><i data-lucide="calendar-plus"></i>${C.addH}</summary>
          <label class="field"><span>${C.addTitle}</span><input class="input" id="calText" maxlength="80"></label>
          <label class="field"><span>${C.addDate}</span><input class="input" type="date" id="calDate" value="${cal.sel}"></label>
          <label class="field"><span>${C.who}</span><select id="calWho"><option value="">—</option>${CLIENTS.map((c) => `<option value="${c.id}" ${c.id === cal.client ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <button class="btn primary block" data-cal-add="1"><i data-lucide="plus"></i>${C.add}</button></details>
      </aside>
    </div>
    <button class="btn soft" data-cal-ics="1"><i data-lucide="download"></i>${C.ics}</button>`;
}
function calIcs() { // the next 12 months, for the client filter in use
  const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Solva//Calendrier//FR', 'CALSCALE:GREGORIAN'];
  const d8 = (d) => isoOf(d).replace(/-/g, '');
  for (let i = 0; i < 12; i++) monthEvents(TODAY.getFullYear(), TODAY.getMonth() + i).forEach((e) => {
    const n = new Date(e.date.getTime() + DAY);
    out.push('BEGIN:VEVENT', `UID:${e.id}@solva`, `DTSTAMP:${d8(TODAY)}T000000Z`, `DTSTART;VALUE=DATE:${d8(e.date)}`, `DTEND;VALUE=DATE:${d8(n)}`,
      `SUMMARY:${(e.text + (e.client ? ' · ' + e.client.name : '')).replace(/[,;]/g, (c) => '\\' + c)}`, 'END:VEVENT');
  });
  out.push('END:VCALENDAR');
  saveFile('solva-echeances.ics', out.join('\r\n'), 'text/calendar;charset=utf-8');
}
function nextDue(c) {
  const keep = { client: state.cal.client, off: state.cal.off };
  state.cal.client = c.id; state.cal.off = [];
  let e = null;
  for (let i = 0; i < 13 && !e; i++) e = monthEvents(TODAY.getFullYear(), TODAY.getMonth() + i).find((x) => x.date >= TODAY && !state.filed.has(x.id));
  Object.assign(state.cal, keep);
  return e;
}
function calGo(iso) {
  const d = new Date(iso + 'T12:00:00');
  Object.assign(state.cal, { sel: iso, y: d.getFullYear(), m: d.getMonth() });
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const ds = b.dataset, rv = state.rv, r = state.auto.result;
  if (b.getAttribute('aria-disabled') === 'true' && (ds.rvSign || ds.rvApprove || ds.rvMove)) return;
  if (ds.rvRole) { rv.role = ds.rvRole; }
  else if (ds.rvFilter) { rv.filter = ds.rvFilter; rv.sel = []; }
  else if (ds.rvAll) {
    const flags = flagsById(r);
    rv.sel = ds.rvAll === '1' ? r.bank.filter((x) => (rv.filter === 'flags' ? isException(x, r, flags) : rv.filter === 'changed' ? x.how === 'you' : rv.filter === 'todo' ? !rv.marks[x.id] : true)).map((x) => x.id) : [];
  }
  else if (ds.rvApprove) { approve(rv.sel.slice()); return; }
  else if (ds.rvMove) { const ids = rv.sel.slice(); rv.sel = []; setAccount(ids, +$('#rvMoveTo').value); return; }
  else if (ds.rvMark) {
    const x = r.bank.find((v) => v.id === ds.rvMark);
    if (rv.marks[x.id]) { delete rv.marks[x.id]; rvLog(tp().review.act.unmark(x.desc), true); }
    else { rv.marks[x.id] = { by: me(), at: stamp() }; rvLog(tp().review.act.mark(x.desc)); }
  }
  else if (ds.rvSign) { rv.sign[ds.rvSign] = { by: me(), at: stamp() }; rvLog(tp().review.act.sign(tp().review.roles[ds.rvSign])); toast(tp().review.toastSigned); }
  else if (ds.rvUnsign) { if (ds.rvUnsign === 'prep') rv.sign.rev = null; rv.sign[ds.rvUnsign] = null; rvLog(tp().review.act.unsign(tp().review.roles[ds.rvUnsign])); }
  else if (ds.rvAudit) { auditCSV(); return; }
  else if (ds.engReset) {
    const prev = state.settings; state.settings = {};
    state.setLog.push({ at: stamp(), who: me(), text: tp().eng.reset }); deskSave();
    (r && r.ok ? rerun() : Promise.resolve(render())).then(() => toast(tp().eng.toastReset, () => { state.settings = prev; deskSave(); r && r.ok ? rerun() : render(); }));
    return;
  }
  else if (ds.engExp) { saveFile('solva-reglages.json', JSON.stringify({ settings: eff(), memory: state.auto.memory }, null, 2), 'application/json'); return; }
  else if (ds.engImp) { $('#setIn').click(); return; }
  else if (ds.ruleAdd) { changeSetting((S) => S.rules.push({ re: '\\bNOUVEAU FOURNISSEUR\\b', acct: 5100 }), tp().eng.sec.rules, S0(), S0() + 1); return; }
  else if (ds.ruleDel) { const i = +ds.ruleDel, old = eff().rules[i]; changeSetting((S) => S.rules.splice(i, 1), `${tp().eng.sec.rules} ${i + 1}`, old.re, '—'); return; }
  else if (ds.memDel) {
    const k = ds.memDel, prev = { ...state.auto.memory };
    delete state.auto.memory[k]; saveMemory();
    state.setLog.push({ at: stamp(), who: me(), text: tp().eng.forget(k) }); deskSave();
    (r && r.ok ? rerun() : Promise.resolve(render())).then(() => toast(tp().eng.forget(k), () => { state.auto.memory = prev; saveMemory(); r && r.ok ? rerun() : render(); }));
    return;
  }
  else if (ds.calNav) {
    const n = +ds.calNav, c = state.cal;
    if (!n) calGo(isoOf(TODAY));
    else { const d = new Date(c.y, c.m + n, 1); Object.assign(c, { y: d.getFullYear(), m: d.getMonth(), sel: isoOf(d) }); }
  }
  else if (ds.calKind) { const c = state.cal; c.off = c.off.includes(ds.calKind) ? c.off.filter((k) => k !== ds.calKind) : c.off.concat(ds.calKind); }
  else if (ds.calDay) state.cal.sel = ds.calDay;
  else if (ds.calDone) {
    const id = ds.calDone;
    if (state.filed.has(id)) state.filed.delete(id);
    else { state.filed.add(id); toast(t().toastFiled, () => state.filed.delete(id)); }
  }
  else if (ds.calAdd) {
    const text = $('#calText').value.trim(), date = $('#calDate').value;
    if (!text || !date) { $(text ? '#calDate' : '#calText').focus(); return; }
    const x = { id: 'mine:' + Date.now(), text, date, client: $('#calWho').value };
    state.cal.mine.push(x); deskSave(); calGo(date); state.cal.adding = false;
    toast(tp().cal.toastAdd, () => { state.cal.mine = state.cal.mine.filter((v) => v !== x); deskSave(); });
  }
  else if (ds.calDel) { state.cal.mine = state.cal.mine.filter((v) => v.id !== ds.calDel); deskSave(); }
  else if (ds.calIcs) { calIcs(); return; }
  else if (ds.calGo) { state.cal.client = ds.calGo; const e = nextDue(CLIENTS.find((c) => c.id === ds.calGo)); if (e) calGo(isoOf(e.date)); location.hash = '#/calendar'; return; }
  else return;
  render();
});
const S0 = () => eff().rules.length;
document.addEventListener('change', (e) => {
  const el = e.target, ds = el.dataset;
  if (ds.set) {
    const kind = ds.kind, path = ds.set, v = parseVal(el.value, kind), old = getP(eff(), path);
    const label = (tp().eng.f[path] || [path.startsWith('itc.') ? `${tp().eng.sec.itc} ${path.slice(4)}` : path])[0];
    if (v == null || JSON.stringify(v) === JSON.stringify(old)) { render(); return; }
    changeSetting((S) => setP(S, path, v), label, showVal(old, kind), showVal(v, kind));
  }
  else if (ds.ruleRe != null) { const i = +ds.ruleRe, old = eff().rules[i].re, v = el.value.trim(); if (v && v !== old) changeSetting((S) => { S.rules[i].re = v; }, `${tp().eng.pattern} ${i + 1}`, old, v); }
  else if (ds.ruleAcct != null) { const i = +ds.ruleAcct, old = eff().rules[i].acct; changeSetting((S) => { S.rules[i].acct = +el.value; }, `${tp().eng.account} ${i + 1}`, old, el.value); }
  else if (ds.mem) {
    const k = ds.mem; state.auto.memory[k] = +el.value; saveMemory();
    state.setLog.push({ at: stamp(), who: me(), text: `${k} → ${el.value} ${acctName(el.value)}` }); deskSave();
    state.auto.result?.ok ? rerun() : render();
  }
  else if (ds.rvAcct) setAccount([ds.rvAcct], +el.value);
  else if (ds.rvSel) { const rv = state.rv; rv.sel = el.checked ? rv.sel.concat(ds.rvSel) : rv.sel.filter((x) => x !== ds.rvSel); render(); }
  else if (ds.rvWho) { state.rv.who[ds.rvWho] = el.value.trim().toUpperCase().slice(0, 4) || '—'; deskSave(); render(); }
  else if (ds.rvExplain) {
    const text = el.value.trim(), rv = state.rv;
    if (text) { rv.explained[ds.rvExplain] = { text, by: me(), at: stamp() }; rvLog(tp().review.act.explain(tp().review.ck[ds.rvExplain][0] + ' · ' + text)); }
    else delete rv.explained[ds.rvExplain];
    render();
  }
  else if (ds.calClient) { state.cal.client = el.value; render(); }
  else if (el.id === 'setIn' && el.files[0]) {
    el.files[0].text().then((txt) => {
      try {
        const j = JSON.parse(txt), prev = state.settings;
        state.settings = E_().settingsOf(j.settings || j);
        if (j.memory && typeof j.memory === 'object') { state.auto.memory = j.memory; saveMemory(); }
        state.setLog.push({ at: stamp(), who: me(), text: tp().eng.imp }); deskSave();
        (state.auto.result?.ok ? rerun() : Promise.resolve(render())).then(() => toast(tp().eng.toastImp, () => { state.settings = prev; deskSave(); render(); }));
      } catch (err) { toast(tp().eng.toastBad); }
      el.value = '';
    });
  }
});
document.addEventListener('input', (e) => { if (e.target.id === 'ruleTest') $('#ruleTestOut').textContent = ruleTest(e.target.value); });
document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.add')) state.cal.adding = e.target.open; }, true);
// calendar grid: arrows move a day / a week, Home/End the week edges, PageUp/PageDown a month (APG date grid)
document.addEventListener('keydown', (e) => {
  const b = e.target.closest && e.target.closest('[data-cal-day]');
  if (!b) return;
  const d = new Date(b.dataset.calDay + 'T12:00:00'), wd = (d.getDay() + 6) % 7;
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -wd, End: 6 - wd }[e.key];
  if (step == null && !['PageUp', 'PageDown'].includes(e.key)) return;
  e.preventDefault();
  if (step != null) d.setDate(d.getDate() + step); else d.setMonth(d.getMonth() + (e.key === 'PageUp' ? -1 : 1));
  calGo(isoOf(d)); render();
  document.querySelector(`[data-cal-day="${isoOf(d)}"]`)?.focus();
});
