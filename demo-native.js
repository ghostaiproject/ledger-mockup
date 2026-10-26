/* Web demo only (GitHub Pages): a pretend backend so vault-ui.js and sync-ui.js can show the lock and cloud screens.
   Nothing is encrypted and nothing leaves the browser: the passphrase hash and the fake Drive state stay in this tab
   (sessionStorage). Same shape as StoreNative's vault/sync parts. Null in the app, where store-native.js is real. */
const DemoNative = typeof StoreNative !== 'undefined' && !StoreNative ? (() => {
  const KEY = 'folio-demo';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } };
  let d = { vault: 'new', hash: '', connected: false, last: 0, runs: 0, conflicts: [], ...read() };
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private window: tab memory only */ } };
  const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`folio-demo:${s}`)))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');

  let opened, isOpen;
  const fresh = () => { isOpen = new Promise((r) => { opened = r; }); };
  fresh();
  if (d.vault === 'open') d.vault = 'locked'; // a reload is a restart: the vault comes back locked

  // the other version of a real engagement, as if the second computer had moved it one stage on
  function sampleConflict() {
    const e = typeof state !== 'undefined' && state.firm && state.firm.eng[0];
    if (!e) return null;
    const other = { ...e, stage: Math.min((e.stage || 0) + 1, 6) };
    return { id: `c${Date.now().toString(36)}`, rel: `eng/${e.id}`, rec: JSON.stringify({ col: 'eng', id: e.id, json: JSON.stringify(other) }) };
  }

  return {
    demo: true,
    idleMin: 2, // the app waits 10 min; the demo locks sooner so visitors see it
    status: async () => ({ state: d.vault, device: 'hello', deviceReady: d.vault !== 'new', minPass: 10 }),
    vault: {
      create: async (pass) => { await wait(700); d.hash = await sha(pass); d.vault = 'open'; save(); },
      unlock: async (pass) => {
        await wait(pass == null ? 1100 : 600); // simulated Windows Hello prompt / key stretching
        if (pass != null && (await sha(pass)) !== d.hash) throw new Error('wrong passphrase');
        d.vault = 'open'; save();
      },
      lock: async () => { d.vault = 'locked'; save(); fresh(); },
    },
    open: (start) => { if (start === 'empty' && typeof Bind !== 'undefined') Bind.emptyFirm(); opened(); },
    get isOpen() { return isOpen; },
    firstStart: () => null,
    flushed: () => Promise.resolve(),
    reset: () => { try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
    sync: {
      status: async () => ({ configured: true, connected: d.connected, last: d.last, demo: true }),
      connect: async () => { await wait(1400); d.connected = true; save(); },
      disconnect: async () => { d.connected = false; save(); },
      run: async () => {
        await wait(900);
        d.runs += 1; d.last = Date.now();
        const c = d.runs === 1 && !d.conflicts.length ? sampleConflict() : null; // first sync: one sample conflict
        if (c) d.conflicts.push(c);
        save();
        return { changed: [], bad: [], up: d.runs === 1 ? 14 : 1, down: d.runs === 1 ? 3 : 0, conflicts: c ? 1 : 0 };
      },
      conflicts: async () => d.conflicts,
      dismiss: async (id) => { d.conflicts = d.conflicts.filter((c) => c.id !== id); save(); },
    },
  };
})() : null;
