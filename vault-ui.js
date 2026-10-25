/* App only: first run (create the vault, then empty firm or sample), unlock (Windows Hello first, passphrase second),
   lock button and auto-lock after 10 min idle. Locking saves, closes the vault in Rust, then reloads the page so no
   client data stays in memory. Web demo (GitHub Pages): StoreNative is null, this stays null. Words: vault-i18n.js. */
const VaultUI = typeof StoreNative !== 'undefined' && StoreNative ? (() => {
  const S = StoreNative, IDLE_MIN = 10;
  const SVG = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  const ic = (n) => `<svg class="lucide lucide-${n}" ${SVG}>${(window.ICONS || {})[n] || ''}</svg>`;
  const pref = () => { try { return JSON.parse(localStorage.getItem('solva-v3') || '{}') || {}; } catch (e) { return {}; } };
  const idleMin = () => { const v = parseFloat(localStorage.getItem('solva-idle-min')); return v > 0 ? v : IDLE_MIN; };
  let lang = pref().lang === 'en' ? 'en' : 'fr';
  let root = null, st = null, view = '', reason = '', busy = false, shown = false, locking = false;
  const tx = () => VAULT_T[lang];
  const $v = (sel) => root && root.querySelector(sel);
  const msg = (e) => { const s = String(e).replace(/^Error:\s*/, ''); const m = tx().errs.find(([re]) => re.test(s)); return m ? m[1] : s; };

  /** 0 too short · 1 fair · 2 good · 3 strong (long beats clever: 4+ words or 20+ characters is strong). */
  function strength(p) {
    if (p.length < st.minPass) return 0;
    const words = p.trim().split(/\s+/).length;
    const kinds = [/[a-zà-ÿ]/, /[A-ZÀ-Ý]/, /\d/, /[^\w\sà-ÿÀ-Ý]/].filter((r) => r.test(p)).length;
    if (p.length >= 20 || words >= 4) return 3;
    return p.length >= 14 || kinds >= 3 ? 2 : 1;
  }

  function field(id, label, hint) {
    return `<div class="vault-field"><label for="${id}">${label}</label>
      <div class="vault-input"><input id="${id}" data-pass type="${shown ? 'text' : 'password'}" spellcheck="false" autocapitalize="off"
        autocomplete="${view === 'create' ? 'new-password' : 'current-password'}"${hint ? ` aria-describedby="${id}-hint"` : ''}>
      <button type="button" class="vault-eye" data-v="eye" aria-pressed="${shown}" aria-label="${shown ? tx().hide : tx().show}">${ic(shown ? 'eye-off' : 'eye')}</button></div>
      ${hint || ''}</div>`;
  }
  const errLine = () => '<p class="vault-err" role="alert"></p>';
  const lockHead = (lead) => `<div class="vault-badge">${ic('lock')}</div><h1 id="vault-h" tabindex="-1">${tx().lockedH}</h1><p class="vault-lead">${lead}</p>`;
  const why = () => (reason === 'idle' ? tx().idle(Math.round(idleMin() * 10) / 10) : reason === 'manual' ? tx().manual : tx().lockedP);

  const VIEWS = {
    create: () => `<h1 id="vault-h" tabindex="-1">${tx().createH}</h1><p class="vault-lead">${tx().createP}</p>
      <form data-form="create" novalidate>
        ${field('vp1', tx().pass1, `<p class="vault-hint" id="vp1-hint">${tx().pass1Hint(st.minPass)}</p>
          <div class="vault-meter" data-level="0" aria-hidden="true"><i></i><i></i><i></i></div><p class="vault-hint vault-meter-txt" aria-live="polite"></p>`)}
        ${field('vp2', tx().pass2)}
        <div class="vault-warn" role="note">${ic('triangle-alert')}<div><b>${tx().warnH}</b><p>${tx().warnP}</p></div></div>
        ${st.device ? `<p class="vault-hint">${tx().helloNext}</p>` : ''}
        ${errLine()}<button class="btn primary big block" type="submit" data-busy="${tx().creating}">${tx().create}</button>
      </form>`,
    start: () => `<h1 id="vault-h" tabindex="-1">${tx().startH}</h1><p class="vault-lead">${tx().startP}</p>
      <div class="vault-choice">${[['empty', 'folder-plus'], ['sample', 'sparkles']].map(([k, i]) => `<button type="button" class="vault-opt" data-v="start" data-k="${k}">
        <span class="vault-opt-ic">${ic(i)}</span><span><b>${tx()[k]}</b><small>${tx()[`${k}P`]}</small></span>${ic('arrow-right')}</button>`).join('')}</div>`,
    unlock: () => `${lockHead(why())}${errLine()}
      <button class="btn primary big block" type="button" data-v="hello" data-busy="${tx().checking}">${ic('fingerprint')}${tx().hello}</button>
      <button class="vault-link" type="button" data-v="view" data-to="pass">${tx().usePass}</button>`,
    pass: () => `${lockHead(st.device && !st.deviceReady ? tx().newDevice : why())}
      <form data-form="unlock" novalidate>${field('vp1', tx().pass1)}${errLine()}
        <button class="btn primary big block" type="submit" data-busy="${tx().checking}">${tx().unlock}</button></form>
      ${st.deviceReady ? `<button class="vault-link" type="button" data-v="view" data-to="unlock">${tx().useHello}</button>` : ''}`,
  };

  function render(focus) {
    root.innerHTML = `<div class="vault-card"><div class="vault-top"><span class="brand"><span class="logo">${ic('sprout')}</span><b>Folio</b></span>
      <div class="seg" role="radiogroup" aria-label="${tx().lang}">${['fr', 'en'].map((l) => `<button type="button" role="radio" data-v="lang" data-l="${l}"
        lang="${l}-CA" aria-checked="${l === lang}" tabindex="${l === lang ? 0 : -1}" aria-label="${tx()[l]}">${l.toUpperCase()}</button>`).join('')}</div></div>
      ${VIEWS[view]()}</div>`;
    root.querySelector('.vault-card').lang = `${lang}-CA`;
    ($v(focus) || $v('input') || $v('.btn, .vault-opt') || $v('#vault-h')).focus();
  }

  function setBusy(on) {
    busy = on;
    root.querySelectorAll('[data-busy]').forEach((b) => {
      if (on) { b.dataset.idle = b.innerHTML; b.textContent = b.dataset.busy; } else if (b.dataset.idle) b.innerHTML = b.dataset.idle;
      b.disabled = on; b.setAttribute('aria-busy', on);
    });
  }
  function fail(e) {
    setBusy(false);
    const p = $v('.vault-err'); if (p) p.textContent = msg(e); // Rust errors come as plain strings
    const i = $v('input'); if (i) { i.focus(); i.select(); }
  }
  async function act(fn) {
    if (busy) return;
    setBusy(true);
    try { await fn(); } catch (e) { fail(e); return; }
    setBusy(false);
  }

  const go = (v, focus) => { view = v; render(focus); };
  const hello = () => act(async () => {
    try { await S.vault.unlock(); } catch (e) { if (/use the passphrase/.test(String(e))) { go('pass'); } throw e; }
    S.open();
  });

  function onClick(e) {
    const b = e.target.closest('[data-v]');
    if (!b || busy) return;
    const k = b.dataset.v;
    if (k === 'lang') {
      lang = b.dataset.l;
      try { localStorage.setItem('solva-v3', JSON.stringify({ ...pref(), lang })); } catch (er) { /* ignore */ }
      if (typeof state !== 'undefined') state.lang = lang; // app.js already read its prefs
      render(`[data-l="${lang}"]`);
    } else if (k === 'eye') {
      shown = !shown;
      root.querySelectorAll('input[data-pass]').forEach((i) => { i.type = shown ? 'text' : 'password'; });
      root.querySelectorAll('.vault-eye').forEach((x) => {
        x.setAttribute('aria-pressed', shown); x.setAttribute('aria-label', shown ? tx().hide : tx().show); x.innerHTML = ic(shown ? 'eye-off' : 'eye');
      });
    } else if (k === 'hello') hello();
    else if (k === 'view') go(b.dataset.to);
    else if (k === 'start') S.open(b.dataset.k);
  }
  function onSubmit(e) {
    e.preventDefault();
    const p1 = $v('#vp1').value, p2 = $v('#vp2') && $v('#vp2').value;
    if (e.target.dataset.form === 'unlock') return act(async () => { await S.vault.unlock(p1); S.open(); });
    if (p1.length < st.minPass) return fail(tx().errs.find(([re]) => re.test('at least'))[1]);
    if (p1 !== p2) { fail(tx().mismatch); $v('#vp2').focus(); return undefined; }
    return act(async () => { await S.vault.create(p1); go('start'); });
  }
  function onInput(e) {
    if (e.target.id !== 'vp1' || view !== 'create') return;
    const lv = e.target.value ? strength(e.target.value) : -1, m = $v('.vault-meter');
    m.dataset.level = Math.max(lv, 0);
    $v('.vault-meter-txt').textContent = lv < 0 ? '' : tx().strength[lv];
  }

  async function lock(why) {
    if (locking) return;
    locking = true;
    try { if (typeof Bind !== 'undefined') Bind.flushNow(); await S.flushed(); } finally {
      await S.vault.lock().catch(() => {});
      try { sessionStorage.setItem('solva-lock', why); } catch (e) { /* ignore */ }
      location.reload(); // drops every decrypted record from memory
    }
  }
  function armIdle() {
    let last = Date.now();
    const seen = () => { last = Date.now(); };
    ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, seen, { passive: true, capture: true }));
    const check = () => { if (Date.now() - last >= idleMin() * 60000) lock('idle'); };
    setInterval(check, 5000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  }
  function addLockButton() {
    const s = document.querySelector('.bar .settings');
    if (!s || s.querySelector('[data-vault-lock]')) return;
    s.insertAdjacentHTML('afterbegin', `<button class="icon-btn" type="button" data-vault-lock>${ic('lock')}</button>`);
    const b = s.querySelector('[data-vault-lock]');
    const label = () => { const w = VAULT_T[document.documentElement.lang === 'en-CA' ? 'en' : 'fr'].lockBtn; b.setAttribute('aria-label', w); b.title = w; };
    label();
    new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    b.addEventListener('click', () => lock('manual'));
  }

  async function start() {
    if (root) return;
    try { reason = sessionStorage.getItem('solva-lock') || ''; sessionStorage.removeItem('solva-lock'); } catch (e) { /* ignore */ }
    document.documentElement.dataset.theme = pref().theme === 'dark' ? 'dark' : 'light';
    root = document.createElement('div');
    Object.assign(root, { className: 'vault', id: 'vault' });
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'vault-h');
    root.dataset.reason = reason;
    root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit); root.addEventListener('input', onInput);
    document.body.append(root);
    const app = document.querySelector('.app');
    if (app) app.inert = true; // keyboard and screen readers stay on the lock screen
    S.isOpen.then(() => { root.remove(); if (app) app.inert = false; armIdle(); addLockButton(); });
    st = await S.status();
    if (st.state === 'open') return S.open();
    go(st.state === 'new' ? 'create' : st.deviceReady ? 'unlock' : 'pass');
    if (view === 'unlock' && !reason) hello(); // at start the Hello prompt opens by itself; after a lock you ask for it
    return undefined;
  }

  return { start, lock };
})() : null;
