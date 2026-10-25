/* Binds app state to the store: after every render, records that changed are saved (one record per
   engagement, time entry, request…), so screens keep mutating state as they always did, undo included. */
const Bind = (() => {
  // list collections: arrays of records with an id, kept in place so undo closures keep their objects
  const LISTS = {
    eng: () => state.firm.eng,
    time: () => state.firm.time,
    invoices: () => state.firm.invoices,
    pbc: () => state.firm.pbc,
    aje: () => state.firm.ye.aje,
    chase: () => state.chase,
    mine: () => state.cal.mine,
  };
  // single records (col 'one'): [get, set]
  const ONES = {
    yeSign: [() => state.firm.ye.sign, (v) => { state.firm.ye.sign = v; }],
    memory: [() => state.auto.memory, (v) => { state.auto.memory = v; }],
    settings: [() => state.settings, (v) => { state.settings = v; }],
    setLog: [() => state.setLog.slice(-200), (v) => { state.setLog = v; }],
    who: [() => state.rv.who, (v) => { state.rv.who = v; }],
    filed: [() => [...state.filed], (v) => { state.filed = new Set(v); }],
    checks: [() => state.checks.map((c) => !!c.on), (v) => { v.forEach((on, i) => { if (state.checks[i]) state.checks[i].on = on; }); }],
  };
  const lastJson = new Map(); // `${col}/${id}` → JSON last saved or loaded
  let loaded = false, queued = false;

  function remember(col, id, data) { lastJson.set(`${col}/${id}`, JSON.stringify(data)); }

  async function load() {
    // app first run: 'empty' or 'sample' from the first-run screen (vault-ui.js); no record yet = sample
    const picked = Store.native && StoreNative.firstStart();
    if (picked) await Store.put('one', 'start', picked);
    const empty = (await Store.get('one', 'start')) === 'empty';
    for (const [col, get] of Object.entries(LISTS)) {
      if (!Store.seen(col)) { if (empty) get().length = 0; continue; } // nothing stored yet: seed, or empty firm
      const arr = get(), recs = await Store.all(col);
      arr.splice(0, arr.length, ...recs);
    }
    for (const [id, [, set]] of Object.entries(ONES)) {
      const v = await Store.get('one', id);
      if (v !== null) set(v);
    }
    Store.on('change', apply);
    loaded = true;
    flushNow(); // first save of the seeds (web: memory only)
  }

  function flushNow() {
    queued = false;
    if (!loaded) return;
    for (const [col, get] of Object.entries(LISTS)) {
      const ids = new Set();
      for (const x of get()) {
        ids.add(x.id);
        const k = `${col}/${x.id}`, j = JSON.stringify(x);
        if (lastJson.get(k) !== j) { lastJson.set(k, j); Store.put(col, x.id, x); }
      }
      for (const k of lastJson.keys()) {
        const id = k.slice(col.length + 1);
        if (k.startsWith(`${col}/`) && !ids.has(id)) { lastJson.delete(k); Store.del(col, id); }
      }
    }
    for (const [id, [get]] of Object.entries(ONES)) {
      const v = get(), k = `one/${id}`, j = JSON.stringify(v);
      if (lastJson.get(k) !== j) { lastJson.set(k, j); Store.put('one', id, v); }
    }
  }
  function flush() { if (!queued) { queued = true; queueMicrotask(flushNow); } }

  // a change that came from sync: put it into state in place, then redraw
  function apply(col, id, data) {
    if (col === 'one') { if (ONES[id] && data !== null) { ONES[id][1](data); remember(col, id, ONES[id][0]()); } }
    else if (LISTS[col]) {
      const arr = LISTS[col](), i = arr.findIndex((x) => x.id === id);
      if (data === null) { if (i >= 0) arr.splice(i, 1); lastJson.delete(`${col}/${id}`); }
      else { if (i >= 0) Object.assign(arr[i], data); else arr.push(data); remember(col, id, data); }
    }
    render();
  }

  return { load, flush, flushNow };
})();
