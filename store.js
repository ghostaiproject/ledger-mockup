/* Folio store: the one save/load API the screens use (docs/APP-PLAN.md §3).
   Web (GitHub Pages) = demo: firm data lives in memory and resets on reload; only the accountant's own
   settings (Autopilot memory, engine settings, reminders) stay in this browser, as before.
   App (Tauri) = every record and document sealed on the device through store-native.js (Rust side). */
const NATIVE = !!window.__TAURI_INTERNALS__;

const Store = (() => {
  const KEEP = new Set(['one/memory', 'one/settings', 'one/setLog', 'one/who', 'mine']); // web: kept in localStorage
  const LS = 'solva-store-web';
  const recs = new Map(); // `${col}/${id}` → { col, id, rev, at, born, dev, del, json }
  const subs = [];
  let last = 0;
  const dev = (() => {
    try { let d = localStorage.getItem('folio-dev'); if (!d) { d = Math.random().toString(36).slice(2, 10); localStorage.setItem('folio-dev', d); } return d; } catch (e) { return 'web'; }
  })();
  const clock = () => (last = Math.max(Date.now(), last + 1)); // hybrid clock: never goes back, never repeats
  const kept = (r) => KEEP.has(r.col) || KEEP.has(`${r.col}/${r.id}`);
  const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const revive = (k, v) => (typeof v === 'string' && ISO.test(v) ? new Date(v) : v); // Dates go in as ISO, come back as Date

  function persist() {
    try { localStorage.setItem(LS, JSON.stringify([...recs.values()].filter(kept))); } catch (e) { /* storage blocked or full */ }
  }
  function boot() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS) || 'null');
      if (saved) { saved.forEach((r) => { recs.set(`${r.col}/${r.id}`, r); last = Math.max(last, r.at); }); return; }
      // first run of this version: bring over what older builds kept
      const mem = JSON.parse(localStorage.getItem('solva-memory') || 'null');
      const desk = JSON.parse(localStorage.getItem('solva-desk') || 'null');
      if (mem) write('one', 'memory', mem);
      if (desk) {
        if (desk.settings) write('one', 'settings', desk.settings);
        if (Array.isArray(desk.setLog)) write('one', 'setLog', desk.setLog);
        if (desk.who) write('one', 'who', desk.who);
        (desk.mine || []).forEach((x) => write('mine', x.id, x));
      }
      persist();
    } catch (e) { /* defaults are fine */ }
  }
  async function bootNative() {
    await StoreNative.whenOpen();
    (await StoreNative.load()).forEach((r) => { recs.set(`${r.col}/${r.id}`, r); last = Math.max(last, r.at); });
  }
  function saved(r) { if (StoreNative) StoreNative.save(r); else if (kept(r)) persist(); }
  function write(col, id, data, del) {
    const k = `${col}/${id}`, old = recs.get(k);
    const r = { col, id, rev: (old ? old.rev : 0) + 1, at: clock(), born: old ? old.born : last, dev, del: !!del, json: del ? null : JSON.stringify(data) };
    recs.set(k, r);
    return r;
  }

  const api = {
    native: NATIVE,
    ready: () => (StoreNative ? bootNative() : Promise.resolve(boot())).then(() => api),
    status: () => (StoreNative && StoreNative.failed ? 'error' : 'open'),
    seen: (col) => [...recs.values()].some((r) => r.col === col), // ever written (tombstones count)
    get: async (col, id) => { const r = recs.get(`${col}/${id}`); return r && !r.del ? JSON.parse(r.json, revive) : null; },
    all: async (col) => [...recs.values()].filter((r) => r.col === col && !r.del).sort((a, b) => a.born - b.born)
      .map((r) => JSON.parse(r.json, revive)),
    put: async (col, id, data) => { saved(write(col, id, data)); },
    del: async (col, id) => { if (recs.has(`${col}/${id}`)) saved(write(col, id, null, true)); },
    on: (ev, fn) => { if (ev === 'change') subs.push(fn); }, // sync pulled new data: fn(col, id, data | null)
    emit: (col, id, data) => subs.forEach((fn) => fn(col, id, data)),
    /** A record that sync brought down (already saved on disk by Rust): take it into memory and tell the screens. */
    ingest: (r) => { recs.set(`${r.col}/${r.id}`, r); last = Math.max(last, r.at || 0); api.emit(r.col, r.id, r.del ? null : JSON.parse(r.json, revive)); },
    lock: () => {},
    // documents (bank statements, invoices, PBC docs): sealed on disk in the app, in memory on the web
    doc: StoreNative ? {
      add: (meta, bytes) => { const id = `d${clock().toString(36)}${dev}`; return StoreNative.doc.add({ ...meta, id, size: bytes.byteLength, added: new Date() }, bytes, id); },
      open: async (id) => { const m = (await StoreNative.doc.list()).find((x) => x.id === id); return m ? StoreNative.doc.open(id, m.type) : null; },
      list: async (filter) => (await StoreNative.doc.list()).filter((m) => !filter || Object.entries(filter).every(([k, v]) => m[k] === v)),
      del: (id) => StoreNative.doc.del(id),
    } : (() => {
      const docs = new Map();
      return {
        add: async (meta, bytes) => { const id = `d${clock().toString(36)}`; docs.set(id, { meta: { ...meta, id, size: bytes.byteLength, added: new Date() }, bytes }); return id; },
        open: async (id) => { const d = docs.get(id); return d ? new Blob([d.bytes], { type: d.meta.type || 'application/octet-stream' }) : null; },
        list: async (filter) => [...docs.values()].map((d) => d.meta).filter((m) => !filter || Object.entries(filter).every(([k, v]) => m[k] === v)),
        del: async (id) => { docs.delete(id); },
      };
    })(),
  };
  return api;
})();
