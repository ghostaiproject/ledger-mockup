// Folio guided sample: the whole job on fake files, one real step at a time (files in → Autopilot → exceptions → engine setting →
// batch review → tie-outs + preparer sign-off → reviewer sign-off → calendar filing → client delivery). Every step uses the real actions.
const TOUR = {
  fr: {
    step: (i, n) => `Étape ${i} sur ${n}`, quit: 'Quitter la visite', pause: 'Pause', play: 'Lecture', restart: 'Recommencer la visite',
    wH: 'Voir Folio faire un mois complet', wP: 'Une démo guidée de 2 minutes sur des fichiers fictifs : pilote auto, exceptions, réglages du moteur, révision et signatures, échéances, livraison au client.',
    wPlay: 'Lancer la démo', wStep: 'Avancer étape par étape', wSkip: 'Explorer par moi-même', toastEnd: 'Visite terminée : le dossier est prêt, signé et produit.',
    s: [
      ['Le client envoie ses fichiers', 'Atelier Boréal t’envoie son relevé Desjardins de septembre (26 lignes, « ; » et « 1 234,56 ») et sa liste de 8 factures. Rien ne quitte ton appareil.', 'Lancer le pilote auto'],
      ['Le pilote auto a fait la préparation', (r) => `${r.bank.length} opérations et ${r.invoices} factures lues · ${r.sorted.auto} dépenses sur ${r.sorted.outs} classées seules · ${r.matched.deps} dépôts reliés à leur facture · débits = crédits. Il ne te laisse que ${r.review.length} exceptions.`, 'Voir les exceptions'],
      ['Régler les exceptions', 'Un doublon Bell, un achat RONA de 9 875 $ (équipement ?), un dépôt sans facture, un paiement partiel et un fournisseur inconnu. Je réponds comme un préparateur le ferait; le fournisseur inconnu est retenu pour la prochaine fois.', 'Les régler'],
      ['Ajuster le moteur', 'Tout le moteur est réglable : taux, CTI par compte, seuils, règles. Ici, la fenêtre des doublons passe de 5 à 7 jours. Le changement est noté au journal et les livres sont recalculés.', 'Changer le réglage'],
      ['Réviser ligne par ligne', 'Chaque ligne montre sa méthode (règle, appris, facture), sa raison et sa confiance. Je sélectionne toutes les lignes pas encore révisées et je les approuve en un seul lot.', 'Approuver en lot'],
      ['Les contrôles', 'Dix contrôles comparent les livres à un calcul refait : banque = relevé, TPS recalculée facture par facture, CTI + RTI, débits = crédits… Tout est conforme. Le préparateur JT signe.', 'Signer la préparation'],
      ['Le réviseur signe', 'MB passe en mode Réviseur. Exceptions révisées, contrôles conformes : la révision peut être signée. Tout changement après coup retirerait les signatures.', 'Signer la révision'],
      ['Produire à temps', (r) => `La TPS/TVQ de septembre est due le ${day(r.taxes.due)}. Elle est au calendrier avec toutes les autres échéances du portefeuille. Je la marque comme produite.`, 'Marquer comme produite'],
      ['Livrer au client', 'Écritures de journal, banque classée, déclaration TPS/TVQ, balance de vérification et piste de vérification en CSV, plus un résumé en mots simples pour le client.', 'Copier le résumé et terminer'],
    ],
    web: [ // web demo only: the lock and the cloud are pretend here (demo-native.js); the app has the real ones
      ['Verrouiller le coffre', 'Dans l’app, les dossiers sont chiffrés sur l’appareil et le coffre se verrouille après 10 min sans activité. Ici c’est simulé : je verrouille, puis Windows Hello (simulé) rouvre.', 'Verrouiller et rouvrir'],
      ['Synchroniser avec Google Drive', 'Dans l’app, le coffre chiffré se synchronise avec ton Google Drive entre ordinateur et téléphone. Ici c’est simulé : je connecte, je synchronise et un conflit exemple apparaît.', 'Synchroniser et terminer'],
    ],
    deliverNext: 'Copier le résumé',
  },
  en: {
    step: (i, n) => `Step ${i} of ${n}`, quit: 'Leave the tour', pause: 'Pause', play: 'Play', restart: 'Restart the tour',
    wH: 'Watch Folio do a full month', wP: 'A 2-minute guided demo on made-up files: Autopilot, exceptions, engine settings, review and sign-offs, deadlines, client delivery.',
    wPlay: 'Play the demo', wStep: 'Step through it myself', wSkip: 'Explore on my own', toastEnd: 'Tour done: the file is ready, signed off and filed.',
    s: [
      ['The client sends their files', 'Atelier Boréal sends its September Desjardins statement (26 lines, ";" and "1 234,56") and its list of 8 invoices. Nothing leaves your device.', 'Run Autopilot'],
      ['Autopilot did the preparation', (r) => `${r.bank.length} lines and ${r.invoices} invoices read · ${r.sorted.auto} of ${r.sorted.outs} expenses sorted on their own · ${r.matched.deps} deposits matched to invoices · debits = credits. Only ${r.review.length} exceptions are left for you.`, 'See the exceptions'],
      ['Clear the exceptions', 'A Bell charge twice, a $9,875 RONA purchase (equipment?), a deposit with no invoice, a part payment and an unknown vendor. I answer the way a preparer would; the unknown vendor is remembered for next time.', 'Clear them'],
      ['Tune the engine', 'The whole engine can be set: rates, ITC by account, thresholds, rules. Here the duplicate window goes from 5 to 7 days. The change is logged and the books rerun.', 'Change the setting'],
      ['Review line by line', 'Every line shows its method (rule, learned, invoice), its reason and its confidence. I select every line not reviewed yet and approve them in one batch.', 'Approve in a batch'],
      ['Tie-outs', 'Ten tie-outs compare the books to a recomputation: bank = statement, GST recomputed invoice by invoice, ITC + ITR, debits = credits… Everything ties. Preparer JT signs.', 'Sign as preparer'],
      ['The reviewer signs', 'MB switches to Reviewer. Exceptions reviewed, tie-outs pass: the review can be signed. Any later change would remove the signatures.', 'Sign as reviewer'],
      ['File on time', (r) => `September GST/QST is due ${day(r.taxes.due)}. It sits on the calendar with every other date for the client list. I mark it filed.`, 'Mark as filed'],
      ['Deliver to the client', 'Journal entries, sorted bank, GST/QST return, trial balance and audit trail as CSV, plus a plain-words summary for the client.', 'Copy the summary and finish'],
    ],
    web: [
      ['Lock the vault', 'In the app, files are encrypted on the device and the vault locks after 10 min of no activity. Here it is pretend: I lock it, then Windows Hello (simulated) opens it again.', 'Lock and reopen'],
      ['Sync with Google Drive', 'In the app, the encrypted vault syncs through your Google Drive between computer and phone. Here it is pretend: I connect, sync, and a sample conflict shows up.', 'Sync and finish'],
    ],
    deliverNext: 'Copy the summary',
  },
};
const TOUR_ROUTE = ['auto', 'auto', 'auto', 'engine', 'review', 'review', 'review', 'calendar', 'auto', 'auto', 'auto'];
const TOUR_SPOT = ['#autoFeed .chips', '#autoOut .stats', '#autoOut .reviews', '#set-duplicateDays', '#rvOut .batch', '#rvOut .checks-out', '#rvOut .sigs', '#calOut .agenda', '#autoOut .dl', '[data-vault-lock]', '[data-sync-open]'];
const webDemo = () => typeof DemoNative !== 'undefined' && !!DemoNative;
function tourSteps() { // app: the 9 real steps; web demo: + pretend lock and cloud
  const T = TOUR[state.lang];
  if (!webDemo()) return T.s;
  const s = T.s.slice(); s[s.length - 1] = [...s[s.length - 1].slice(0, 2), T.deliverNext];
  return [...s, ...T.web];
}
const hold = (ms) => new Promise((ok) => setTimeout(ok, ms)); // pretend screens need real time, even with reduced motion
async function tourLock() {
  const D = DemoNative;
  if ((await D.status()).state === 'new') await D.vault.create(`folio-demo-${Date.now()}`); // the tour's own pretend vault
  await VaultUI.lock('manual');
  await hold(1800);
  document.querySelector('#vault [data-v="hello"]')?.click();
  await Promise.race([D.isOpen, hold(6000)]);
  await hold(500);
}
async function tourSync() {
  const q = (s) => document.querySelector(s);
  q('[data-sync-open]')?.click(); await hold(900);
  if (q('[data-sync="on"]')) { q('[data-sync="on"]').click(); await hold(3200); } else { q('[data-sync="run"]')?.click(); await hold(1800); }
  await hold(2600);
  q('[data-sync="close"]')?.click();
}
const wait = (ms) => new Promise((ok) => setTimeout(ok, calm ? 0 : ms));
let tourTimer = null;
function tourStart(auto = false) {
  tourStop(); resetAuto(); state.auto.client = 'boreal';
  state.auto.files = FolioEngine.sample(isoToday());
  state.tour = { i: 0, busy: false, auto };
  if (location.hash !== '#/auto') location.hash = '#/auto'; else render();
  tourSpot(); tourNext();
}
function tourStop() { clearTimeout(tourTimer); tourTimer = null; if (state.tour) state.tour = null; }
function tourNext() { // autoplay: time to read the card, then the step runs by itself
  clearTimeout(tourTimer);
  const tr = state.tour; if (!tr || !tr.auto) return;
  tourTimer = setTimeout(tourGo, tourDelay());
}
function tourDelay() {
  const [h, p] = tourSteps()[state.tour.i], r = state.auto.result;
  return Math.min(9000, 2600 + (h + (typeof p === 'function' ? (r && r.ok ? p(r) : '') : p)).length * 28);
}
function tourSpot() {
  setTimeout(() => {
    document.querySelectorAll('.spot').forEach((x) => x.classList.remove('spot'));
    const el = state.tour && document.querySelector(TOUR_SPOT[state.tour.i]);
    if (!el) return;
    const box = el.closest('li.set') || el;
    box.classList.add('spot');
    tourFit(box);
  }, 160);
}
function tourFit(box) { // the spot goes in the clear space above the coach card, never under it
  const card = $('#tour'); if (!card || !box.isConnected) return;
  const cardTop = card.getBoundingClientRect().top, gap = 16;
  document.documentElement.style.setProperty('--tour-h', `${innerHeight - cardTop + gap}px`); // room to scroll the last spot up
  const r = box.getBoundingClientRect(), room = cardTop - gap * 2;
  const wide = innerWidth >= 1080 && r.right < card.getBoundingClientRect().left - gap; // desktop: card beside it, no overlap
  if (wide || (r.top >= gap && r.bottom <= cardTop - gap)) return; // already in view and clear
  const top = r.height >= room ? gap : gap + (room - r.height) / 2;
  scrollTo({ top: scrollY + r.top - top, behavior: calm ? 'auto' : 'smooth' });
}
addEventListener('resize', () => { const b = document.querySelector('.spot'); if (b && state.tour) tourFit(b); });
function renderTour() {
  let el = $('#tour');
  document.documentElement.classList.toggle('touring', !!state.tour);
  if (!state.tour) { if (el) el.remove(); document.querySelectorAll('.spot').forEach((x) => x.classList.remove('spot')); return; }
  if (!el) { el = document.createElement('aside'); el.id = 'tour'; el.className = 'tour'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  const T = TOUR[state.lang], S = tourSteps(), i = state.tour.i, [h, p, btn] = S[i], r = state.auto.result;
  el.innerHTML = `<div class="tour-top"><span class="pill">${T.step(i + 1, S.length)}</span><span class="dots" aria-hidden="true">${S.map((_, k) => `<i class="${k < i ? 'd' : k === i ? 'on' : ''}"></i>`).join('')}</span>
      <button class="round" data-tour="restart" aria-label="${T.restart}" title="${T.restart}"><i data-lucide="rotate-ccw"></i></button>
      <button class="round" data-tour="quit" aria-label="${T.quit}" title="${T.quit}"><i data-lucide="circle-x"></i></button></div>
    <b>${h}</b><p>${typeof p === 'function' ? (r && r.ok ? p(r) : '') : p}</p>
    <div class="tour-acts"><button class="btn soft" data-tour="${state.tour.auto ? 'pause' : 'resume'}"><i data-lucide="${state.tour.auto ? 'pause' : 'play'}"></i>${state.tour.auto ? T.pause : T.play}</button>
    <button class="btn primary" data-tour="go" ${state.tour.busy ? 'aria-disabled="true"' : ''}>${state.tour.busy ? '…' : btn}<i data-lucide="arrow-right"></i></button></div>
    ${state.tour.auto && !state.tour.busy ? `<span class="tour-clock" style="--t:${tourDelay()}ms" aria-hidden="true"></span>` : ''}`;
}
async function tourGo() {
  const tr = state.tour, a = state.auto, rv = state.rv;
  if (!tr || tr.busy) return;
  clearTimeout(tourTimer);
  tr.busy = true; render();
  const T = TOUR[state.lang], i = tr.i;
  if (i === 0) await autopilot();
  else if (i === 2) { // each exception answered with the first (most likely) choice, one at a time so it can be followed
    for (const x of [...a.result.review]) {
      if (x.type === 'unknown') { a.decisions[x.id] = { account: 5900 }; a.memory[x.tx.key] = 5900; saveMemory(); }
      else a.decisions[x.id] = t().auto.rv[x.type][1][0][1];
      rv.marks[x.id] = { by: me(), at: stamp() };
      rvLog(`${t().auto.tag[x.type]} · ${x.tx ? x.tx.desc : ''}`, true);
      await rerun(); toast(`${t().auto.tag[x.type]} · ${t().auto.toastSaved}`); await wait(500);
    }
  }
  else if (i === 3) { const S = eff(); if (+S.duplicateDays !== 7) await changeSetting((s) => { s.duplicateDays = 7; }, tp().eng.f.duplicateDays[0], S.duplicateDays, 7); }
  else if (i === 4) {
    rv.role = 'prep'; rv.filter = 'todo';
    rv.sel = a.result.bank.filter((x) => !rv.marks[x.id]).map((x) => x.id);
    render(); await wait(600);
    await approve(rv.sel.slice());
  }
  else if (i === 5) { rv.role = 'prep'; rv.sign.prep = { by: me(), at: stamp() }; rvLog(tp().review.act.sign(tp().review.roles.prep)); toast(tp().review.toastSigned); }
  else if (i === 6) { rv.role = 'rev'; render(); await wait(500); rv.sign.rev = { by: me(), at: stamp() }; rvLog(tp().review.act.sign(tp().review.roles.rev)); toast(tp().review.toastSigned); }
  else if (i === 7) {
    const due = new Date(a.result.taxes.due + 'T12:00:00');
    const ev = monthEvents(due.getFullYear(), due.getMonth()).find((e) => e.kind === 'tax' && e.client && e.client.id === 'boreal');
    if (ev) state.filed.add(ev.id);
    toast(t().toastFiled);
  }
  else if (i === 9) await tourLock();
  else if (i === 10) await tourSync();
  else if (i === 8) { try { await navigator.clipboard.writeText($('#sumText').textContent); } catch (e) { /* clipboard blocked: the text is on screen */ } }
  tr.busy = false;
  if (tr.after) { const k = tr.after; tourStop(); if (k === 'quit') render(); else tourStart(k === 'play' || tr.auto); return; } // asked mid-step
  if (state.tour !== tr) return;
  if (i === tourSteps().length - 1) { state.tour = null; render(); toast(T.toastEnd); return; }
  tr.i = i + 1;
  if (TOUR_ROUTE[tr.i] === 'calendar') { state.cal.client = 'boreal'; state.cal.off = []; calGo(a.result.taxes.due); }
  if (location.hash !== '#/' + TOUR_ROUTE[tr.i]) location.hash = '#/' + TOUR_ROUTE[tr.i]; else render();
  tourSpot(); tourNext();
}
/** Web demo entry: first visit in this tab (or a ?demo / #demo link) offers the guided demo. Not in the app. */
function tourWelcome() {
  const ask = /[?&#]demo\b/.test(location.search + location.hash);
  let seen = false; try { seen = !!sessionStorage.getItem('folio-welcome'); sessionStorage.setItem('folio-welcome', '1'); } catch (e) { /* private window */ }
  if (!(typeof DemoNative !== 'undefined' && DemoNative) || state.tour || (seen && !ask)) return;
  if (/[?&]demo=play\b/.test(location.search)) { tourStart(true); return; }
  const T = TOUR[state.lang], el = document.createElement('div');
  el.className = 'welcome'; el.id = 'welcome';
  el.innerHTML = `<div class="welcome-card" role="dialog" aria-modal="true" aria-labelledby="welcome-h">
    <span class="welcome-ic"><i data-lucide="play"></i></span><b id="welcome-h">${T.wH}</b><p>${T.wP}</p>
    <button class="btn primary block" data-welcome="play"><i data-lucide="play"></i>${T.wPlay}</button>
    <button class="btn soft block" data-welcome="step"><i data-lucide="list-checks"></i>${T.wStep}</button>
    <button class="link" data-welcome="skip">${T.wSkip}</button></div>`;
  document.body.appendChild(el); icons();
  el.querySelector('[data-welcome="play"]').focus();
  const close = (k) => { el.remove(); removeEventListener('keydown', onKey); if (k === 'play' || k === 'step') tourStart(k === 'play'); };
  const onKey = (e) => { if (e.key === 'Escape') close('skip'); };
  addEventListener('keydown', onKey);
  el.addEventListener('click', (e) => { const b = e.target.closest('[data-welcome]'); if (b) close(b.dataset.welcome); else if (e.target === el) close('skip'); });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-tour]'); if (!b) return;
  const k = b.dataset.tour, tr = state.tour;
  if (tr && tr.busy && k !== 'pause') { if (k !== 'go' && k !== 'resume') tr.after = k; return; } // a step is running: act once it is done
  if (k === 'quit') { tourStop(); render(); }
  else if (k === 'play' || k === 'restart') tourStart(k === 'play' || !!(tr && tr.auto));
  else if (k === 'pause') { tr.auto = false; clearTimeout(tourTimer); render(); }
  else if (k === 'resume') { tr.auto = true; render(); tourNext(); }
  else tourGo();
});
