/* "+ New engagement" form under the Engagements list. Saved like any engagement (Bind collection 'eng'). */
const EngAdd = (() => {
  const TX = {
    fr: { h: 'Nouveau mandat', client: 'Client', kind: 'Type de mandat', period: 'Fin de la période', due: 'À livrer le', fee: 'Honoraires ($)', budget: 'Budget (heures)', prep: 'Préparation', rev: 'Révision', partner: 'Associé', save: 'Créer le mandat', none: 'Ajoutez d’abord un client', added: 'Mandat créé' },
    en: { h: 'New engagement', client: 'Client', kind: 'Engagement type', period: 'Period end', due: 'Due on', fee: 'Fee ($)', budget: 'Budget (hours)', prep: 'Preparer', rev: 'Reviewer', partner: 'Partner', save: 'Create engagement', none: 'Add a client first', added: 'Engagement created' },
  };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const opts = (rows, sel) => rows.map(([v, l]) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(l)}</option>`).join('');
  const fld = (id, label, inner) => `<label class="field"><span>${label}</span>${inner}</label>`;
  let built = '', sig = '';

  function after() {
    const list = document.getElementById('engList');
    if (!list) return;
    let box = document.getElementById('engAdd');
    if (!box) { box = document.createElement('details'); box.id = 'engAdd'; box.className = 'add'; list.after(box); }
    const T = TX[state.lang], clients = CLIENTS.map((c) => c.id + c.name).join('|');
    if (built === state.lang && sig === clients) return; // keep what was typed while screens redraw
    built = state.lang; sig = clients;
    const open = box.open, K = tf().kind, people = STAFF.map((s) => [s.id, s.name]);
    box.innerHTML = `<summary><i data-lucide="plus"></i>${T.h}</summary>
      ${fld('eClient', T.client, `<select id="eClient">${opts(CLIENTS.map((c) => [c.id, c.name]))}</select>`)}
      ${fld('eKind', T.kind, `<select id="eKind">${opts(Object.entries(K))}</select>`)}
      ${fld('ePeriod', T.period, `<input class="input" type="date" id="ePeriod" value="${iso(new Date(TODAY.getFullYear(), 11, 31))}">`)}
      ${fld('eDue', T.due, `<input class="input" type="date" id="eDue" value="${iso(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 60))}">`)}
      ${fld('eFee', T.fee, '<input class="input" type="number" id="eFee" min="0" step="50" value="1500">')}
      ${fld('eBudget', T.budget, '<input class="input" type="number" id="eBudget" min="1" step="1" value="10">')}
      ${fld('ePrep', T.prep, `<select id="ePrep">${opts(people, 'AL')}</select>`)}
      ${fld('eRev', T.rev, `<select id="eRev">${opts(people, 'JT')}</select>`)}
      ${fld('ePartner', T.partner, `<select id="ePartner">${opts(people, 'MB')}</select>`)}
      <button class="btn primary block" type="button" data-eng-add="1"><i data-lucide="plus"></i>${T.save}</button>`;
    box.open = open;
    if (!CLIENTS.length) box.querySelector('summary').insertAdjacentHTML('afterend', `<p class="muted">${T.none}</p>`);
    icons();
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-eng-add]')) return;
    const v = (id) => document.getElementById(id).value, T = TX[state.lang];
    if (!v('eClient') || !v('ePeriod') || !v('eDue')) return;
    const due = new Date(v('eDue') + 'T00:00:00'); // like the sample engagements: a Date at midnight
    const eng = {
      id: `${v('eClient')}-${v('eKind')}-${Date.now().toString(36)}`, client: v('eClient'), kind: v('eKind'), period: v('ePeriod'), due,
      prep: v('ePrep'), rev: v('eRev'), partner: v('ePartner'), budget: Math.max(1, +v('eBudget') || 1), fee: Math.max(0, +v('eFee') || 0),
      stage: 0, letter: false, indep: false, mine: true,
    };
    state.firm.eng.push(eng); state.firm.engFilter = 'open'; state.firm.open = eng.id;
    document.getElementById('engAdd').open = false;
    render();
    toast(T.added, () => { state.firm.eng = state.firm.eng.filter((x) => x !== eng); render(); });
  });
  return { after };
})();
