// Solva: simple, phone-first mock for a Québec accounting firm. Fake clients and figures; nothing is filed or sent anywhere.
const T = {
  fr: {
    home: 'Accueil Solva', language: 'Langue', sections: 'Sections', dark: 'Mode sombre', light: 'Mode clair',
    nav: { today: "Aujourd'hui", deadlines: 'Échéances', clients: 'Clients', money: 'Argent', close: 'Fin de mois' },
    kicker: 'Pour les cabinets comptables du Québec',
    landTitle: 'Ta journée de comptable, en toute simplicité.',
    landLead: "Solva te montre quoi faire aujourd'hui : les échéances à respecter, les clients à relancer, la fin de mois à boucler. Rien de plus.",
    open: 'Voir ma journée', how: 'Comment ça marche',
    benefits: [
      ['calendar-clock', 'Les échéances, sans stress', "ARC et Revenu Québec : Solva te rappelle chaque date, au bon moment."],
      ['users', "Tes clients, d'un coup d'œil", 'Qui doit envoyer des documents, qui est prêt. En mots simples, pas en tableaux.'],
      ['list-checks', 'La fin de mois, pas à pas', 'Une liste à cocher. Une étape à la fois.'],
    ],
    demo: "Maquette de démonstration · données fictives · rien n'est envoyé",
    phRow1: 'TPS/TVQ · Café Mistral', phRow2: 'Relancer Transports Nordet', phRow3: 'Relier la banque', phBtn: "C'est fait",
    todayTitle: "Aujourd'hui", morning: 'Bonjour', evening: 'Bonsoir',
    leftToday: (n) => (n ? `chose${n > 1 ? 's' : ''} à faire aujourd'hui` : 'Tout est fait pour aujourd\'hui. Bravo !'),
    allDone: 'Profite de ta soirée.',
    deadlines: 'Échéances', deadlinesLead: 'Les dates à respecter avec l’ARC et Revenu Québec.', later: 'Ensuite', nothingDue: 'Aucune échéance en attente.',
    clients: 'Clients', money: 'Argent', owed: 'Les clients te doivent',
    onTime: (a) => `${a} à temps`, lateAmt: (a) => `${a} en retard`, chase: 'Factures à relancer',
    bankLine: (n) => (n ? `${n} opérations bancaires à relier` : 'Toutes les opérations sont reliées'),
    bankHint: 'Relier chaque paiement à sa facture.',
    matchBtn: (r) => (r ? `J'ai vérifié les ${r} dernières` : 'Relier pour moi'), matchDone: 'Terminé',
    closeTitle: (m) => `Fin de mois : ${m}`, closeLead: 'Coche chaque étape quand elle est faite.', ofN: (a, b) => `${a} sur ${b}`,
    filters: { action: 'À faire', progress: 'En cours', done: 'Prêts' },
    done: 'Fait', filedBtn: "C'est fait", fileLabel: (x) => `Marquer « ${x} » comme produit`,
    today: "aujourd'hui", inDays: (d) => `dans ${d} jour${d > 1 ? 's' : ''}`, late: (d) => `${d} jours de retard`,
    pct: (n) => `${n} % fait`, ask: 'Demander les documents', asked: 'Demande envoyée', ready: 'Marquer comme prêt', allReady: 'Dossier prêt. Rien à faire.',
    remind: (c) => `Envoyer un rappel à ${c}`, reminded: 'Rappel envoyé', unpaid: (d) => `impayée depuis ${d} jours`,
    tasks: {
      payroll: ['Fait', 'Inscrire les paies de la semaine', () => 'Fait ce matin, 7 employés', ''],
      late: ['En retard', 'Produire la TPS/TVQ de Café Mistral', (d) => `Taxes de vente du mois dernier · ${d} jours de retard`, "C'est fait"],
      remind: ['À relancer', 'Relancer Transports Nordet', (a) => `Facture H-2291 · ${a} impayée depuis 47 jours`, 'Envoyer un rappel'],
      match: ['Banque', 'Relier les opérations bancaires', (n) => `${n} paiements à relier à leur facture. Solva peut le faire pour toi.`, 'Relier pour moi'],
    },
    toastFiled: 'Marqué comme produit', toastRemind: (c) => `Rappel envoyé à ${c}`, toastMatch: (n, r) => `${n} opérations reliées · ${r} à vérifier`,
    toastMatched: 'Banque à jour', toastAsk: (c) => `Demande envoyée à ${c}`, toastReady: (c) => `${c} est prêt`, toastClose: 'Fin de mois bouclée. Bravo !',
    undo: 'Annuler', undone: 'Annulé',
  },
  en: {
    home: 'Solva home', language: 'Language', sections: 'Sections', dark: 'Dark mode', light: 'Light mode',
    nav: { today: 'Today', deadlines: 'Deadlines', clients: 'Clients', money: 'Money', close: 'Month-end' },
    kicker: 'For Québec accounting firms',
    landTitle: 'Your accounting day, made simple.',
    landLead: 'Solva tells you what to do today: deadlines to meet, clients to follow up, the month to close. Nothing more.',
    open: 'See my day', how: 'How it works',
    benefits: [
      ['calendar-clock', 'Deadlines, without the stress', 'CRA and Revenu Québec: Solva reminds you of every date, right on time.'],
      ['users', 'Your clients at a glance', 'Who owes you documents, who is ready. In plain words, not spreadsheets.'],
      ['list-checks', 'Month-end, step by step', 'One checklist. One step at a time.'],
    ],
    demo: 'Demo mockup · fake data · nothing is sent',
    phRow1: 'GST/QST · Café Mistral', phRow2: 'Follow up Transports Nordet', phRow3: 'Match the bank', phBtn: 'Done',
    todayTitle: 'Today', morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
    leftToday: (n) => (n ? `thing${n > 1 ? 's' : ''} to do today` : 'All done for today. Well done!'),
    allDone: 'Enjoy your evening.',
    deadlines: 'Deadlines', deadlinesLead: 'Dates to meet with the CRA and Revenu Québec.', later: 'Next', nothingDue: 'No deadlines waiting.',
    clients: 'Clients', money: 'Money', owed: 'Clients owe you',
    onTime: (a) => `${a} on time`, lateAmt: (a) => `${a} late`, chase: 'Invoices to follow up',
    bankLine: (n) => (n ? `${n} bank transactions to match` : 'All transactions are matched'),
    bankHint: 'Match = link each payment to its invoice.',
    matchBtn: (r) => (r ? `I checked the last ${r}` : 'Match them for me'), matchDone: 'Done',
    closeTitle: (m) => `Month-end: ${m}`, closeLead: 'Tick each step when it is done.', ofN: (a, b) => `${a} of ${b}`,
    filters: { action: 'To do', progress: 'In progress', done: 'Ready' },
    done: 'Done', filedBtn: 'Mark as filed', fileLabel: (x) => `Mark “${x}” as filed`,
    today: 'today', inDays: (d) => `in ${d} day${d > 1 ? 's' : ''}`, late: (d) => `${d} days late`,
    pct: (n) => `${n}% done`, ask: 'Ask for documents', asked: 'Request sent', ready: 'Mark as ready', allReady: 'File ready. Nothing to do.',
    remind: (c) => `Send a reminder to ${c}`, reminded: 'Reminder sent', unpaid: (d) => `unpaid for ${d} days`,
    tasks: {
      payroll: ['Done', "Record this week's payroll", () => 'Done this morning, 7 employees', ''],
      late: ['Late', 'File the GST/QST for Café Mistral', (d) => `Last month's sales tax · ${d} days late`, 'Mark as filed'],
      remind: ['Follow up', 'Follow up with Transports Nordet', (a) => `Invoice H-2291 · ${a} unpaid for 47 days`, 'Send a reminder'],
      match: ['Bank', 'Match bank transactions', (n) => `${n} payments to link to their invoice. Solva can do it for you.`, 'Match them for me'],
    },
    toastFiled: 'Marked as filed', toastRemind: (c) => `Reminder sent to ${c}`, toastMatch: (n, r) => `${n} matched · ${r} to check`,
    toastMatched: 'Bank up to date', toastAsk: (c) => `Request sent to ${c}`, toastReady: (c) => `${c} is ready`, toastClose: 'Month closed. Well done!',
    undo: 'Undo', undone: 'Undone',
  },
};

const CLIENTS = [
  { id: 'mistral', name: 'Café Mistral', close: 35, status: 'action', note: { fr: 'Il manque 3 reçus de septembre', en: '3 September receipts missing' } },
  { id: 'nordet', name: 'Transports Nordet', close: 20, status: 'action', note: { fr: 'Relevé bancaire à recevoir', en: 'Bank statement to receive' } },
  { id: 'boreal', name: 'Atelier Boréal', close: 80, status: 'progress', note: { fr: 'Presque fini', en: 'Almost done' } },
  { id: 'pins', name: 'Érablière Deux-Pins', close: 60, status: 'progress', note: { fr: 'Inventaire de sirop à confirmer', en: 'Syrup inventory to confirm' } },
  { id: 'verveine', name: 'Ferme Verveine', close: 55, status: 'progress', note: { fr: 'Subvention à inscrire', en: 'Grant to record' } },
  { id: 'lumen', name: 'Clinique Lumen', close: 100, status: 'done', note: { fr: 'États financiers envoyés', en: 'Financial statements sent' } },
  { id: 'cobalt', name: 'Studio Cobalt', close: 100, status: 'done', note: { fr: 'Déclaration prête à signer', en: 'Tax return ready to sign' } },
];

const state = {
  lang: 'fr',
  theme: 'light',
  route: 'home',
  filter: 'action',
  open: null,
  asked: new Set(),
  filed: new Set(),
  chase: [
    { id: 'h2291', client: 'Transports Nordet', no: 'H-2291', amount: 4850, days: 47, sent: false },
    { id: 'h2304', client: 'Café Mistral', no: 'H-2304', amount: 1260, days: 33, sent: false },
    { id: 'h2318', client: 'Ferme Verveine', no: 'H-2318', amount: 2140, days: 19, sent: false },
    { id: 'h2330', client: 'Atelier Boréal', no: 'H-2330', amount: 980, days: 8, sent: false },
  ],
  bank: { total: 353, matched: 299, review: 10 },
  checks: [
    { fr: 'Relevés bancaires reçus', en: 'Bank statements received', on: true },
    { fr: 'Banque reliée', en: 'Bank matched', auto: true },
    { fr: 'Paies inscrites', en: 'Payroll recorded', on: true },
    { fr: 'Factures du mois inscrites', en: "Month's invoices recorded", on: false },
    { fr: 'Taxes TPS/TVQ vérifiées', en: 'GST/QST checked', on: false },
    { fr: 'Amortissement calculé', en: 'Depreciation calculated', on: false },
    { fr: 'Révision finale', en: 'Final review', on: false },
  ],
};
try { // per-viewer conveniences only
  const saved = JSON.parse(localStorage.getItem('solva') || '{}');
  if (saved.lang in T) state.lang = saved.lang;
  if (saved.theme === 'dark' || saved.theme === 'light') state.theme = saved.theme;
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
const FOCUS_KEYS = ['lang', 'themeToggle', 'filter', 'file', 'open', 'ask', 'ready', 'chase', 'match', 'check', 'task'];
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
const nextFeb28 = () => new Date(TODAY.getMonth() >= 2 ? TODAY.getFullYear() + 1 : TODAY.getFullYear(), 2, 0);
const DEADLINES = [
  { id: 'late', fr: ['Taxes de vente · Café Mistral', 'TPS/TVQ du mois dernier'], en: ['Sales tax · Café Mistral', "Last month's GST/QST"],
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth() - 1) },
  { id: 'das', fr: ['Retenues sur les paies', 'Impôt retenu sur les paies (DAS) · 5 clients'], en: ['Payroll deductions', 'Tax held from paycheques · 5 clients'], due: next15() },
  { id: 'gst', fr: ['Taxes de vente du trimestre', 'TPS/TVQ · 4 clients'], en: ['Quarterly sales tax', 'GST/QST · 4 clients'], due: nextQuarterReturn() },
  { id: 'inst', fr: ["Acomptes d'impôt", 'Paiements mensuels des sociétés · 3 clients'], en: ['Tax instalments', 'Monthly corporate payments · 3 clients'],
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth()) },
  { id: 't2', fr: ['Déclaration · Studio Cobalt', 'Impôt des sociétés (T2 + CO-17)'], en: ['Tax return · Studio Cobalt', 'Corporate tax (T2 + CO-17)'],
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth() + 2) },
  { id: 't4', fr: ["Relevés de fin d'année", 'T4 et RL-1 · 6 clients'], en: ['Year-end slips', 'T4 and RL-1 · 6 clients'], due: nextFeb28() },
].map((d) => ({ ...d, due: businessDay(d.due) })).sort((a, b) => a.due - b.due);
const daysTo = (d) => Math.round((d - TODAY) / DAY);
const whenText = (days) => (days < 0 ? t().late(-days) : days === 0 ? t().today : t().inDays(days));

/* ---------- derived ---------- */
const unmatched = () => state.bank.total - state.bank.matched;
const checkOn = (c) => (c.auto ? unmatched() === 0 : c.on);
const closeDone = () => state.checks.filter(checkOn).length;
const TASKS = [
  { id: 'payroll', done: () => true, arg: () => '', tone: '' }, // already done this morning, so the ring never starts empty
  { id: 'late', done: () => state.filed.has('late'), arg: () => -daysTo(DEADLINES.find((d) => d.id === 'late').due), tone: 'red' },
  { id: 'remind', done: () => state.chase[0].sent, arg: () => money(4850), tone: 'amber' },
  { id: 'match', done: () => unmatched() <= state.bank.review, arg: () => unmatched(), tone: '' },
];

/* ---------- render ---------- */
function renderShell() {
  document.documentElement.lang = loc();
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.classList.toggle('is-home', state.route === 'home');
  document.title = state.route === 'home' ? 'Solva' : `${t().nav[state.route]} · Solva`;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t()[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t()[el.dataset.i18nLabel]));
  document.querySelectorAll('.seg [data-lang]').forEach((b) => {
    const on = b.dataset.lang === state.lang;
    b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
  });
  const dark = state.theme === 'dark';
  const tb = $('#themeBtn');
  tb.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`;
  tb.setAttribute('aria-label', dark ? t().light : t().dark);
  const NAV = { today: 'sun', deadlines: 'calendar-clock', clients: 'users', money: 'wallet', close: 'list-checks' };
  $('.nav').innerHTML = Object.entries(NAV).map(([id, ic]) => `<a href="#/${id}" ${state.route === id ? 'aria-current="page"' : ''}>
    <i data-lucide="${ic}"></i><span>${t().nav[id]}</span></a>`).join('');
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.dataset.screen === state.route));
}

function renderHome() {
  $('#how').innerHTML = t().benefits.map(([ic, b, p]) => `<li><span class="ic"><i data-lucide="${ic}"></i></span><div><b>${b}</b><p>${p}</p></div></li>`).join('');
  $('#phDate').textContent = TODAY.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' });
}

function renderToday() {
  const h = new Date().getHours();
  $('#greet').textContent = h >= 18 ? t().evening : state.lang === 'en' && h >= 12 ? t().afternoon : t().morning;
  $('#date').textContent = TODAY.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' });
  const left = TASKS.filter((x) => !x.done()).length;
  $('#todayCount').textContent = left || '✓';
  $('#todayLine').textContent = t().leftToday(left);
  $('#ring').style.strokeDashoffset = 314.16 * (left / TASKS.length);
  $('#tasks').innerHTML = [...TASKS].sort((a, b) => a.done() - b.done()).map((x) => {
    const [tag, title, desc, btn] = t().tasks[x.id];
    const done = x.done();
    return `<li class="card task ${done ? 'done' : ''}">
      <span class="pill ${done ? '' : x.tone}">${done ? t().done : tag}</span>
      <b>${title}</b><p>${desc(x.arg())}</p>
      <button class="btn ${done ? '' : 'primary'} block" data-task="${x.id}" ${done ? 'aria-disabled="true"' : ''}>
        <i data-lucide="${done ? 'circle-check' : x.id === 'remind' ? 'mail' : x.id === 'match' ? 'wand-sparkles' : 'check'}"></i>${done ? t().done : btn}</button></li>`;
  }).join('');
}

function dateTile(d) {
  return `<span class="date"><b class="num">${d.getDate()}</b><small>${d.toLocaleDateString(loc(), { month: 'short' }).replace('.', '')}</small></span>`;
}
function renderDeadlines() {
  const open = DEADLINES.filter((d) => !state.filed.has(d.id));
  const next = open[0];
  $('#dlNext').innerHTML = next ? `<div class="card next-card ${daysTo(next.due) < 0 ? 'late' : ''}">
      <div class="top">${dateTile(next.due)}<div><b>${next[state.lang][0]}</b><p>${next[state.lang][1]}</p></div></div>
      <p><span class="pill ${daysTo(next.due) < 0 ? 'red' : daysTo(next.due) <= 10 ? 'amber' : ''}">${whenText(daysTo(next.due))}</span></p><br>
      <button class="btn primary block" data-file="${next.id}"><i data-lucide="check"></i>${t().filedBtn}</button></div>`
    : `<div class="card empty"><i data-lucide="party-popper"></i><p>${t().nothingDue}</p></div>`;
  $('#dlList').innerHTML = DEADLINES.filter((d) => d !== next).map((d) => {
    const done = state.filed.has(d.id), days = daysTo(d.due);
    return `<li class="row ${done ? 'done' : ''} ${!done && days < 0 ? 'late' : ''}">${dateTile(d.due)}
      <div><b>${d[state.lang][0]}</b><small>${done ? t().done : whenText(days)} · ${d[state.lang][1]}</small></div>
      <button class="round" aria-pressed="${done}" aria-label="${t().fileLabel(d[state.lang][0])}" data-file="${d.id}"><i data-lucide="check"></i></button></li>`;
  }).join('');
}

function renderClients() {
  $('#clientFilter').innerHTML = Object.entries(t().filters).map(([k, label]) => `
    <button role="radio" aria-checked="${k === state.filter}" tabindex="${k === state.filter ? 0 : -1}" data-filter="${k}">${label}<span class="count num">${CLIENTS.filter((c) => c.status === k).length}</span></button>`).join('');
  $('#files').innerHTML = CLIENTS.filter((c) => c.status === state.filter).map((c) => {
    const open = state.open === c.id;
    const action = c.status === 'action'
      ? `<button class="btn ${state.asked.has(c.id) ? 'soft' : 'primary'} block" data-ask="${c.id}" ${state.asked.has(c.id) ? 'aria-disabled="true"' : ''}>
          <i data-lucide="${state.asked.has(c.id) ? 'circle-check' : 'send'}"></i>${state.asked.has(c.id) ? t().asked : t().ask}</button>`
      : c.status === 'progress' ? `<button class="btn soft block" data-ready="${c.id}"><i data-lucide="check"></i>${t().ready}</button>`
      : `<p class="muted">${t().allReady}</p>`;
    return `<li class="row file">
      <button class="file-head" aria-expanded="${open}" aria-controls="f-${c.id}" data-open="${c.id}">
        <span class="avatar" aria-hidden="true">${c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
        <div><b>${c.name}</b><small>${c.note[state.lang]}</small></div><i data-lucide="chevron-down"></i></button>
      <div class="file-body" id="f-${c.id}" ${open ? '' : 'hidden'}>
        <div class="meter"><span class="progress" role="progressbar" aria-valuenow="${c.close}" aria-valuemin="0" aria-valuemax="100" aria-label="${c.name}">
          <span style="width:${c.close}%"></span></span><span class="num">${t().pct(c.close)}</span></div>${action}</div></li>`;
  }).join('');
}

function renderMoney() {
  const open = state.chase.filter((c) => !c.sent);
  const total = state.chase.reduce((s, c) => s + c.amount, 0);
  const late = state.chase.filter((c) => c.days > 30).reduce((s, c) => s + c.amount, 0);
  $('#owed').textContent = money(total);
  $('#split').innerHTML = `<span style="flex:${total - late};background:var(--ring)"></span><span style="flex:${late};background:var(--red)"></span>`;
  $('#onTime').textContent = t().onTime(money(total - late));
  $('#lateAmt').textContent = t().lateAmt(money(late));
  $('#split').setAttribute('aria-label', `${t().onTime(money(total - late))}, ${t().lateAmt(money(late))}`);
  $('#chaseList').innerHTML = state.chase.map((c) => `
    <li class="row ${c.days > 30 && !c.sent ? 'late' : ''}">
      <div><b>${c.client}</b><small>${c.sent ? t().reminded : `${money(c.amount)} · ${t().unpaid(c.days)}`}</small></div>
      <button class="round" aria-pressed="${c.sent}" aria-label="${t().remind(c.client)}" data-chase="${c.id}" ${c.sent ? 'aria-disabled="true"' : ''}>
        <i data-lucide="${c.sent ? 'check' : 'mail'}"></i></button></li>`).join('');
  $('#bankLine').textContent = t().bankLine(unmatched());
  const left = unmatched();
  const mb = $('#matchBtn');
  mb.className = `btn ${left ? 'primary' : 'soft'}`;
  mb.innerHTML = left ? `<i data-lucide="wand-sparkles"></i>${t().matchBtn(left <= state.bank.review ? left : 0)}` : `<i data-lucide="circle-check"></i>${t().matchDone}`;
  mb.toggleAttribute('aria-disabled', !left);
}

function renderClose() {
  const month = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1).toLocaleDateString(loc(), { month: 'long' });
  $('#closeTitle').textContent = t().closeTitle(month);
  const done = closeDone(), n = state.checks.length;
  $('#closeCount').textContent = t().ofN(done, n);
  $('#closeBar').setAttribute('aria-valuenow', Math.round((done / n) * 100));
  $('#closeBar').setAttribute('aria-label', t().closeTitle(month));
  $('#closeBar > span').style.width = (done / n) * 100 + '%';
  $('#checks').innerHTML = state.checks.map((c, i) => `
    <li><button class="check" role="checkbox" aria-checked="${checkOn(c)}" data-check="${i}">
      <span class="box"><i data-lucide="check"></i></span><span>${c[state.lang]}
      ${c.auto ? `<small>${unmatched() ? t().bankLine(unmatched()) : t().bankLine(0)}</small>` : ''}</span></button></li>`).join('');
}

function render() {
  const focus = focusedKey();
  renderShell(); renderHome(); renderToday(); renderDeadlines(); renderClients(); renderMoney(); renderClose();
  icons();
  if (focus) document.querySelector(`[data-${attr(focus[0])}="${focus[1]}"]`)?.focus();
}

/* ---------- toast with undo ---------- */
let toastTimer, undoFn = null;
function toast(msg, undo) {
  $('#toastMsg').textContent = msg;
  undoFn = undo || null;
  const u = $('#toastUndo');
  u.hidden = !undo; u.textContent = t().undo;
  $('#toast').classList.toggle('plain', !undo);
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), undo ? 5000 : 2600);
}
$('#toastUndo').addEventListener('click', () => {
  if (undoFn) { undoFn(); undoFn = null; render(); }
  toast(t().undone);
});

/* ---------- actions ---------- */
const closedNow = () => closeDone() === state.checks.length;
function fileDeadline(id) {
  if (state.filed.has(id)) { state.filed.delete(id); return; }
  state.filed.add(id);
  toast(t().toastFiled, () => state.filed.delete(id));
}
function sendReminder(c) {
  if (c.sent) return;
  c.sent = true;
  toast(t().toastRemind(c.client), () => { c.sent = false; });
}
function match() {
  const b = state.bank, before = b.matched;
  if (!unmatched()) return;
  if (unmatched() > b.review) { b.matched = b.total - b.review; toast(t().toastMatch(b.matched - before, b.review), () => { b.matched = before; }); }
  else { b.matched = b.total; toast(t().toastMatched, () => { b.matched = before; }); }
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.id === 'toastUndo') return;
  const ds = b.dataset;
  const wasClosed = closedNow();
  if (ds.lang) { state.lang = ds.lang; save(); }
  else if (ds.themeToggle) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); }
  else if (ds.filter) { state.filter = ds.filter; state.open = null; }
  else if (ds.open) state.open = state.open === ds.open ? null : ds.open;
  else if (ds.task) {
    if (b.getAttribute('aria-disabled') === 'true') return;
    if (ds.task === 'late') fileDeadline('late');
    else if (ds.task === 'remind') sendReminder(state.chase[0]);
    else match();
  }
  else if (ds.file) fileDeadline(ds.file);
  else if (ds.chase) sendReminder(state.chase.find((x) => x.id === ds.chase));
  else if (ds.match) match();
  else if (ds.ask) {
    if (state.asked.has(ds.ask)) return;
    state.asked.add(ds.ask);
    const c = CLIENTS.find((x) => x.id === ds.ask);
    toast(t().toastAsk(c.name), () => state.asked.delete(c.id));
  }
  else if (ds.ready) {
    const c = CLIENTS.find((x) => x.id === ds.ready);
    const prev = { status: c.status, close: c.close };
    Object.assign(c, { status: 'done', close: 100 }); state.open = null;
    toast(t().toastReady(c.name), () => Object.assign(c, prev));
  }
  else if (ds.check) {
    const c = state.checks[ds.check];
    if (c.auto) { location.hash = '#/money'; return; }
    c.on = !c.on;
  }
  else return;
  render();
  if (!wasClosed && closedNow()) toast(t().toastClose);
});

// radiogroups: one Tab stop each, arrow keys move and select (WAI-ARIA pattern)
document.addEventListener('keydown', (e) => {
  const group = e.target.closest('.seg');
  if (!group || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  const items = [...group.querySelectorAll('button')];
  const i = items.indexOf(e.target.closest('button'));
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (/Right|Down/.test(e.key) ? 1 : -1) + items.length) % items.length;
  e.preventDefault();
  items[next].focus();
  items[next].click();
});

/* ---------- router: #/today, #/clients… ; plain #anchors stay on the page ---------- */
const ROUTES = ['home', 'today', 'deadlines', 'clients', 'money', 'close'];
function route(first) {
  const h = location.hash;
  if (h && !h.startsWith('#/')) return;
  const r = h.slice(2) || 'home';
  state.route = ROUTES.includes(r) ? r : 'home';
  render();
  if (!first) { window.scrollTo(0, 0); $(`[data-screen="${state.route}"] h1`).focus({ preventScroll: true }); }
}
window.addEventListener('hashchange', () => route(false));
route(true);
document.documentElement.classList.remove('booting');
