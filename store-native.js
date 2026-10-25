/* App backend for store.js: records and documents go to Rust (src-tauri/src/disk.rs), sealed with AES-256-GCM.
   Not used on the web (GitHub Pages): there NATIVE is false and this stays null. */
const StoreNative = window.__TAURI_INTERNALS__ ? (() => {
  const inv = (cmd, args, opts) => window.__TAURI__.core.invoke(cmd, args, opts);
  const hex = (s) => [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, '0')).join('');
  let q = Promise.resolve(); // one write at a time, in order: a newer rev never lands before an older one
  const queue = (fn) => (q = q.then(fn).catch((e) => { console.error('Solva: save failed', e); StoreNative.failed++; }));

  let opened; const isOpen = new Promise((r) => { opened = r; });
  const done = (p) => p.then(() => opened());
  // Until the lock / onboarding screens land (APP-PLAN step 4 screens): device key first, else plain prompts.
  async function interimUnlock() {
    for (;;) {
      const s = await inv('vault_status');
      if (s.state === 'open') return opened();
      const test = s.device === 'file'; // tools/app_check.mjs: never block on a prompt
      try {
        if (s.state === 'locked' && s.deviceReady) { await done(inv('vault_unlock')); continue; }
        if (test) return;
        const pass = prompt(s.state === 'new' ? `Nouvelle voûte : phrase secrète (${s.minPass}+ caractères)` : 'Phrase secrète');
        if (pass === null) return; // stays locked; StoreNative.vault.* can still open it (tools/app_check.mjs)
        if (s.state === 'new' && prompt('Encore une fois') !== pass) continue;
        await done(inv(s.state === 'new' ? 'vault_create' : 'vault_unlock', { pass }));
      } catch (e) { alert(e); }
    }
  }

  return {
    failed: 0,
    status: () => inv('vault_status'),
    vault: {
      create: (pass) => done(inv('vault_create', { pass })),
      unlock: (pass) => done(inv('vault_unlock', pass == null ? {} : { pass })), // no pass = Windows Hello
      lock: () => inv('vault_lock'),
    },
    /** Resolves once the vault is open (the store loads only then). */
    open: () => { interimUnlock(); return isOpen; },
    load: async () => {
      const r = await inv('rec_all');
      if (r.bad) console.warn(`Solva: ${r.bad} record file(s) could not be read (kept on disk)`);
      return r.recs.map((s) => JSON.parse(s));
    },
    save: (rec) => queue(() => inv('rec_put', { rec: JSON.stringify(rec) })),
    flushed: () => q,
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
