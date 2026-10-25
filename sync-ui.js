/* App only: Google Drive sync button + panel (connect, sync now, conflicts). Null on the web demo.
   Runs on open, every 5 min while open and on "Sync now". */
const SyncUI = (() => {
  const S = typeof StoreNative !== 'undefined' ? StoreNative : null;
  if (!S) return { start() {} };
  const tx = () => SYNC_T[state.lang === 'en' ? 'en' : 'fr'];
  const CLOUD = '<svg class="lucide" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>';
  let st = { configured: false, connected: false, last: 0 }, conflicts = [], note = '', busy = false, panel = null, btn = null;

  const when = (ms) => new Date(ms).toLocaleString(state.lang === 'en' ? 'en-CA' : 'fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
  const kind = (c) => { try { const r = JSON.parse(c.rec); return `${r.col} · ${r.id}`; } catch (e) { return c.rel; } };
  const msg = (e) => String(e).replace(/^Error:\s*/, '');

  async function refresh() {
    try { st = await S.sync.status(); conflicts = await S.sync.conflicts(); } catch (e) { /* locked */ }
    if (btn) btn.dataset.badge = conflicts.length ? String(conflicts.length) : '';
    draw();
  }

  async function run(quiet) {
    if (busy || !st.connected) return;
    busy = true;
    if (!quiet) { note = tx().syncing; draw(); }
    try {
      const r = await S.sync.run();
      r.changed.forEach((s) => Store.ingest(JSON.parse(s)));
      note = r.bad.length ? tx().bad(r.bad.length) : tx().done(r);
    } catch (e) { note = msg(e); }
    busy = false;
    await refresh();
  }

  async function connect() {
    busy = true; note = tx().connecting; draw();
    try { await S.sync.connect(); busy = false; await refresh(); await run(); } catch (e) { busy = false; note = msg(e); draw(); }
  }

  async function restore(id) {
    const c = conflicts.find((x) => x.id === id);
    if (!c) return;
    const r = JSON.parse(c.rec);
    await Store.put(r.col, r.id, JSON.parse(r.json));
    Store.emit(r.col, r.id, await Store.get(r.col, r.id));
    await S.sync.dismiss(id);
    note = tx().restored;
    await refresh();
    run(true);
  }

  function draw() {
    if (!panel || panel.hidden) return;
    const T = tx(), dis = busy ? 'disabled' : '';
    panel.querySelector('.sync-card').innerHTML = `
      <h2 id="sync-h">${T.title}</h2><p class="muted">${T.lead}</p>
      <p><b>${st.connected ? T.on : T.off}</b> · <span class="muted">${st.last ? T.last(when(st.last)) : T.never}</span></p>
      ${!st.configured ? `<p class="sync-warn">${T.setup}</p>` : ''}
      ${note ? `<p class="sync-note" role="status">${esc(note)}</p>` : ''}
      ${st.connected
        ? `<button class="btn primary block" type="button" data-sync="run" ${dis}>${T.now}</button>
           <button class="btn soft block" type="button" data-sync="off" ${dis}>${T.disconnect}</button>`
        : `<button class="btn primary block" type="button" data-sync="on" ${dis || (st.configured ? '' : 'disabled')}>${T.connect}</button>`}
      <h3>${T.cH}</h3><p class="muted">${T.cLead}</p>
      ${conflicts.length ? `<ul class="list">${conflicts.map((c) => `<li class="row"><div><b>${esc(kind(c))}</b></div>
        <button class="btn soft" type="button" data-sync-restore="${esc(c.id)}">${T.restore}</button>
        <button class="btn" type="button" data-sync-dismiss="${esc(c.id)}">${T.dismiss}</button></li>`).join('')}</ul>` : `<p class="muted">${T.cNone}</p>`}
      <button class="btn soft block" type="button" data-sync="close">${T.close}</button>`;
  }

  function start() {
    const bar = document.querySelector('.bar .settings');
    if (!bar || bar.querySelector('[data-sync-open]')) return;
    bar.insertAdjacentHTML('afterbegin', `<button class="icon-btn sync-btn" type="button" data-sync-open>${CLOUD}</button>`);
    btn = bar.querySelector('[data-sync-open]');
    btn.title = tx().btn; btn.setAttribute('aria-label', tx().btn);
    document.body.insertAdjacentHTML('beforeend', '<div class="sync-panel" hidden role="dialog" aria-modal="true" aria-labelledby="sync-h"><div class="sync-card"></div></div>');
    panel = document.querySelector('.sync-panel');
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-sync-open]')) { panel.hidden = false; note = ''; refresh(); return; }
      if (t === panel || t.closest('[data-sync="close"]')) { panel.hidden = true; return; }
      const a = t.closest('[data-sync]')?.dataset.sync;
      if (a === 'on') connect(); else if (a === 'run') run(); else if (a === 'off') S.sync.disconnect().then(refresh);
      const rs = t.closest('[data-sync-restore]'), ds = t.closest('[data-sync-dismiss]');
      if (rs) restore(rs.dataset.syncRestore); else if (ds) S.sync.dismiss(ds.dataset.syncDismiss).then(refresh);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) panel.hidden = true; });
    refresh().then(() => run(true));
    setInterval(() => run(true), 5 * 60000);
  }
  return { start };
})();
