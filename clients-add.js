/* Add / remove your own clients (Clients screen). The sample clients stay as they are; yours live in state.myClients,
   are saved by Bind (collection 'myclients') and are merged into CLIENTS before every render. */
const ClientsAdd = (() => {
  const TX = {
    fr: { add: 'Ajouter un client', name: 'Nom du client', type: 'Type', corp: 'Société', sole: 'Entreprise individuelle', gst: 'TPS/TVQ', fye: 'Fin d’exercice', payroll: 'Il a des employés (paies)', note: 'Note (facultatif)', save: 'Ajouter', del: 'Retirer ce client', added: 'Client ajouté', removed: 'Client retiré', fresh: 'Nouveau client', empty: 'Aucun client ici.' },
    en: { add: 'Add a client', name: 'Client name', type: 'Type', corp: 'Corporation', sole: 'Sole proprietor', gst: 'GST/QST', fye: 'Year end', payroll: 'Has employees (payroll)', note: 'Note (optional)', save: 'Add', del: 'Remove this client', added: 'Client added', removed: 'Client removed', fresh: 'New client', empty: 'No clients here.' },
  };
  const x = () => TX[state.lang];

  function sync() {
    for (let i = CLIENTS.length - 1; i >= 0; i--) if (CLIENTS[i].mine) CLIENTS.splice(i, 1);
    for (const c of state.myClients) CLIENTS.push(c);
  }

  const months = () => Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i === 11 ? 'selected' : ''}>${new Date(2026, i, 1).toLocaleDateString(loc(), { month: 'long' })}</option>`).join('');
  const freqs = () => Object.entries(tp().eng.freq).filter(([k]) => ['monthly', 'quarterly', 'annual'].includes(k)).map(([k, l]) => `<option value="${k}" ${k === 'quarterly' ? 'selected' : ''}>${esc(l)}</option>`).join('');

  let built = '';
  function form() {
    let box = document.getElementById('clientAdd');
    if (!box) {
      box = document.createElement('details');
      box.id = 'clientAdd'; box.className = 'add';
      document.getElementById('files').after(box);
    }
    if (built === state.lang) return; // keep what the user typed while screens redraw
    built = state.lang;
    const open = box.open, T = x();
    box.innerHTML = `<summary><i data-lucide="user-plus"></i>${T.add}</summary>
      <label class="field"><span>${T.name}</span><input class="input" id="cName" maxlength="60" autocomplete="off"></label>
      <label class="field"><span>${T.type}</span><select id="cType"><option value="corp">${T.corp}</option><option value="sole">${T.sole}</option></select></label>
      <label class="field"><span>${T.gst}</span><select id="cGst">${freqs()}</select></label>
      <label class="field"><span>${T.fye}</span><select id="cFye">${months()}</select></label>
      <label class="field"><span>${T.note}</span><input class="input" id="cNote" maxlength="80" autocomplete="off"></label>
      <label class="field" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" id="cPay"> ${T.payroll}</label>
      <button class="btn primary block" type="button" data-client-add="1"><i data-lucide="plus"></i>${T.save}</button>`;
    box.open = open;
    icons();
  }

  function removeBtns() {
    document.querySelectorAll('#files .file-body').forEach((b) => {
      const id = b.id.slice(2), c = CLIENTS.find((v) => v.id === id);
      if (!c || !c.mine || b.querySelector('[data-client-del]')) return;
      b.insertAdjacentHTML('beforeend', `<button class="btn soft block" type="button" data-client-del="${esc(id)}"><i data-lucide="trash-2"></i>${x().del}</button>`);
    });
    icons();
  }

  const after = () => { form(); removeBtns(); };

  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-client-add]'), del = e.target.closest('[data-client-del]');
    if (add) {
      const name = document.getElementById('cName').value.trim();
      if (!name) { document.getElementById('cName').focus(); return; }
      const note = document.getElementById('cNote').value.trim() || x().fresh;
      const c = {
        id: 'mine:' + Date.now().toString(36), mine: true, name, short: name.split(' ')[0],
        profile: { type: document.getElementById('cType').value, gst: document.getElementById('cGst').value, fye: +document.getElementById('cFye').value, payroll: document.getElementById('cPay').checked },
        team: '—', close: 0, status: 'progress', note: { fr: note, en: note },
      };
      state.myClients.push(c); state.filter = 'progress'; state.open = c.id;
      ['cName', 'cNote'].forEach((i) => { document.getElementById(i).value = ''; });
      document.getElementById('clientAdd').open = false;
      render();
      toast(x().added, () => { state.myClients = state.myClients.filter((v) => v !== c); render(); });
    } else if (del) {
      const c = state.myClients.find((v) => v.id === del.dataset.clientDel);
      if (!c) return;
      state.myClients = state.myClients.filter((v) => v !== c);
      render();
      toast(x().removed, () => { state.myClients.push(c); render(); });
    }
  });
  return { sync, after };
})();
