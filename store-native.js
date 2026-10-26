/* App backend for store.js: records and documents go to Rust (src-tauri/src/disk.rs), sealed with AES-256-GCM.
   Not used on the web (GitHub Pages): there NATIVE is false and this stays null. */
const StoreNative = window.__TAURI_INTERNALS__ ? (() => {
  const inv = (cmd, args, opts) => window.__TAURI__.core.invoke(cmd, args, opts);
  const hex = (s) => [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, '0')).join('');
  let q = Promise.resolve(); // one write at a time, in order: a newer rev never lands before an older one
  const queue = (fn) => (q = q.then(fn).catch((e) => { console.error('Folio: save failed', e); StoreNative.failed++; }));

  let opened; const isOpen = new Promise((r) => { opened = r; });
  let first = null; // 'empty' | 'sample', picked on the first-run screen

  return {
    failed: 0,
    status: () => inv('vault_status'),
    vault: {
      create: (pass) => inv('vault_create', { pass }),
      unlock: (pass) => inv('vault_unlock', pass == null ? {} : { pass }), // no pass = Windows Hello
      lock: () => inv('vault_lock'),
    },
    /** Called once the vault is unlocked (vault-ui.js, or tools/app_check.mjs): the store loads after this. */
    open: (start) => { if (start) first = start; opened(); },
    isOpen,
    firstStart: () => first,
    /** For store.js: shows the lock / first-run screens and resolves when the vault is open. */
    whenOpen: () => { if (typeof VaultUI !== 'undefined' && VaultUI) VaultUI.start(); return isOpen; },
    load: async () => {
      const r = await inv('rec_all');
      if (r.bad) console.warn(`Folio: ${r.bad} record file(s) could not be read (kept on disk)`);
      return r.recs.map((s) => JSON.parse(s));
    },
    save: (rec) => queue(() => inv('rec_put', { rec: JSON.stringify(rec) })),
    flushed: () => q,
    sync: {
      status: () => inv('sync_status'),
      connect: () => inv('sync_connect'),
      disconnect: () => inv('sync_disconnect'),
      run: async () => { await q; return inv('sync_run'); }, // pending saves land on disk first
      conflicts: () => inv('conflicts_list'),
      dismiss: (id) => inv('conflict_del', { id }),
    },
    doc: {
      add: async (meta, bytes, id) => {
        await queue(() => inv('doc_add', new Uint8Array(bytes), { headers: { id, meta: hex(JSON.stringify(meta)) } }));
        return id;
      },
      open: async (id, type) => new Blob([await inv('doc_open', { id })], { type: type || 'application/octet-stream' }),
      list: async () => (await inv('doc_list')).map((s) => JSON.parse(s)),
      del: (id) => queue(() => inv('doc_del', { id })),
    },
  };
})() : null;
