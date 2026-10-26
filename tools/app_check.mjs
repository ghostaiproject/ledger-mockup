// App check (Windows, debug build): first-run screen (create, empty firm or sample), device unlock, passphrase screen,
// idle auto-lock, data survives a restart, nothing on disk is readable, every screen runs on an empty firm.
// The device key is a test key file here (FOLIO_DEVICE=file), so no Hello prompt.
// Run after `npx tauri build --debug --no-bundle`:  node tools/app_check.mjs
// Uses throwaway data folders (FOLIO_DATA_DIR, debug builds only) so your real app data is never touched.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = join(import.meta.dirname, '..');
const exe = join(root, 'src-tauri/target/debug/folio.exe');
const data = join(tmpdir(), `folio-check-${process.pid}`);
const PORT = 9223, wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${what}`); if (!cond) failed++; };

async function evalIn(expr) {
  for (let i = 0; i < 40; i++) { // wait for the webview to come up
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((x) => x.type === 'page');
      if (page) {
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((r) => ws.addEventListener('open', r));
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } }));
        const m = await new Promise((r) => ws.addEventListener('message', (e) => r(JSON.parse(e.data))));
        ws.close();
        if (!m.result) { await wait(500); continue; } // page still loading (context replaced): ask again
        if (m.result.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description);
        return m.result.result.value;
      }
    } catch (e) { if (String(e).includes('Error:')) throw e; }
    await wait(500);
  }
  throw new Error('app did not start');
}

// in-page helpers for the lock / first-run screens (vault-ui.js)
const PASS = 'check passphrase 1';
const UI = `const w = (sel) => new Promise((r) => { const t = setInterval(() => { const e = document.querySelector(sel); if (e) { clearInterval(t); r(e); } }, 50); });
  const set = (id, v) => { const i = document.getElementById(id); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); };
  const submit = () => document.querySelector('#vault [type=submit]').click();
  const err = async () => { await w('#vault .vault-err:not(:empty)'); return document.querySelector('#vault .vault-err').textContent; };
  const create = async (start) => { await w('#vault form[data-form=create]'); set('vp1', '${PASS}'); set('vp2', '${PASS}'); submit();
    (await w('#vault [data-k=' + start + ']')).click(); };
`;

/** One app run: `pre` drives the lock screen, then waits until the app is open, runs `expr`, and `post` after a pause. */
async function session(expr, { pre, post, dir = data } = {}) {
  const p = spawn(exe, [], { env: { ...process.env, FOLIO_DATA_DIR: dir, FOLIO_DEVICE: 'file', WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}` } });
  try {
    await wait(1500);
    const first = pre ? await evalIn(`(async () => { ${UI} return (${pre})(); })()`) : null;
    await evalIn('new Promise(r => { const t = setInterval(() => { if (!document.documentElement.classList.contains("booting") && !document.getElementById("vault")) { clearInterval(t); r(); } }, 100); })');
    const out = { first, ...(await evalIn(expr)) };
    if (post) { await wait(post.after); out.post = await evalIn(post.expr); }
    return out;
  } finally { p.kill(); await wait(1500); }
}
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

rmSync(data, { recursive: true, force: true }); // fresh throwaway vault
const a = await session(`(async () => {
  state.firm.pbc[2].st = 'waived'; state.firm.time.push({ id: 'tCHECK', eng: 'pins-comp', who: 'JT', date: new Date(), h: 2.25, note: 'restart check', billed: false });
  state.myClients.push({ id: 'mine:chk', mine: true, name: 'Boulangerie Check', short: 'Boulangerie', profile: { type: 'corp', gst: 'quarterly', fye: 12, payroll: false }, team: '—', close: 0, status: 'progress', note: { fr: 'x', en: 'x' } });
  state.firm.eng.push({ id: 'chk-comp', client: 'mine:chk', kind: 'comp', period: '2026-12-31', due: new Date(Date.now() + 60 * 864e5), prep: 'AL', rev: 'JT', partner: 'MB', budget: 10, fee: 1500, stage: 0, letter: false, indep: false, mine: true });
  render(); const id = await Store.doc.add({ name: 'releve-juin.pdf', type: 'application/pdf' }, new TextEncoder().encode('%PDF-1.7 Banque').buffer);
  await StoreNative.flushed(); return { native: Store.native, failed: StoreNative.failed, id, lockBtn: !!document.querySelector('[data-vault-lock]') };
})()`, { pre: `async () => { const s = await StoreNative.status(); await w('#vault form[data-form=create]');
  set('vp1', 'short'); set('vp2', 'short'); submit(); const short = await err();
  set('vp1', '${PASS}'); set('vp2', '${PASS}x'); submit(); const mismatch = document.querySelector('#vault .vault-err').textContent;
  const meter = document.querySelector('#vault .vault-meter').dataset.level; set('vp2', '${PASS}'); submit();
  (await w('#vault [data-k=sample]')).click(); return { s, short, mismatch, meter }; }` });
ok(a.first.s.state === 'new' && /courte/.test(a.first.short) && /concordent/.test(a.first.mismatch), 'first-run screen: new vault, short and mismatched passphrases refused');
ok(a.first.meter === '2', `strength meter reacts (level ${a.first.meter})`);
ok(a.native && a.failed === 0 && a.lockBtn, `sample firm saves through the native store, lock button shown (failed writes: ${a.failed})`);

const files = walk(data);
const leaks = files.filter((f) => /pins|CHECK|restart|PDF|Banque|releve/i.test(f.slice(data.length) + readFileSync(f).toString('latin1')));
ok(files.length > 20, `${files.length} sealed files on disk`);
ok(leaks.length === 0, `no readable client data in file names or contents${leaks.length ? `: ${leaks[0]}` : ''}`);

const b = await session(`(async () => {
  const t = state.firm.time.find((x) => x.id === 'tCHECK'), d = (await Store.doc.list())[0];
  const sy = await StoreNative.sync.status();
  return { mineClient: CLIENTS.some((c) => c.id === 'mine:chk'), mineEng: state.firm.eng.some((e) => e.id === 'chk-comp'), sy, syncBtn: !!document.querySelector('[data-sync-open]'), note: t?.note, isDate: t?.date instanceof Date, pbc: state.firm.pbc[2].st, doc: d && await (await Store.doc.open(d.id)).text() };
})()`);
ok(b.note === 'restart check' && b.isDate, 'device key opens at start; time entry back (date revived)');
ok(b.pbc === 'waived', 'request status back after restart');
ok(b.mineClient && b.mineEng, 'client and engagement added by hand are back after restart');
ok(b.syncBtn && b.sy.connected === false && b.sy.last === 0, `sync button shown, not connected (Google id set: ${b.sy.configured})`);
ok(b.doc === '%PDF-1.7 Banque', 'document opens after restart, same bytes');

rmSync(join(data, 'vault.local.json')); // as on a new device: only the passphrase wrap is there
const c = await session(`(async () => ({ docs: (await Store.doc.list()).length, pbc: state.firm.pbc[2].st }))()`,
  { pre: `async () => { const s = await StoreNative.status(); await w('#vault form[data-form=unlock]');
  set('vp1', 'wrong passphrase!'); submit(); const wrong = await err(); set('vp1', '${PASS}'); submit(); return { s, wrong }; }` });
ok(c.first.s.state === 'locked' && !c.first.s.deviceReady && /incorrecte/.test(c.first.wrong), 'passphrase screen: wrong passphrase refused');
ok(c.docs === 1 && c.pbc === 'waived', 'passphrase opens the same data');
ok(existsSync(join(data, 'vault.local.json')), 'passphrase unlock re-wraps the key for this device');

const d = await session(`(async () => { localStorage.setItem('solva-idle-min', '0.05'); return {}; })()`, { post: { after: 11000, expr: `(async () => {
  localStorage.removeItem('solva-idle-min'); const v = document.getElementById('vault');
  return { st: (await StoreNative.status()).state, reason: v?.dataset.reason, hello: !!v?.querySelector('[data-v=hello]'),
    rec: await window.__TAURI__.core.invoke('rec_all').catch(String), firm: state.firm.time.some((x) => x.id === 'tCHECK') }; })()` } });
ok(d.post.st === 'locked' && d.post.reason === 'idle' && d.post.hello && d.post.rec === 'locked', 'idle auto-lock: vault closed, unlock screen waits (no auto prompt)');
ok(d.post.firm === false, 'after the lock no client data is left in page memory');

const data2 = `${data}-empty`;
rmSync(data2, { recursive: true, force: true });
const ROUTES = ['today', 'engagements', 'yearend', 'requests', 'time', 'more', 'auto', 'review', 'calendar', 'engine', 'deadlines', 'clients', 'money', 'close', 'home'];
const walkRoutes = `(async () => { const errs = []; addEventListener('error', (e) => errs.push(String(e.error?.stack || e.message).slice(0, 400)));
  for (const r of ${JSON.stringify(ROUTES)}) { state.route = r; try { render(); } catch (x) { errs.push(r + ': ' + String(x.stack).slice(0, 300)); } await new Promise((x) => setTimeout(x, 100)); }
  const boot = document.querySelector('main.vault-err'); if (boot) errs.unshift('boot: ' + boot.textContent);
  return { errs, n: state.firm.eng.length + state.firm.time.length + state.firm.pbc.length, start: await Store.get('one', 'start') }; })()`;
const e = await session(walkRoutes, { dir: data2, pre: `async () => { await create('empty'); return {}; }` });
ok(e.start === 'empty' && e.n === 0, 'empty firm: no sample engagements, hours or requests');
ok(e.errs.length === 0, `empty firm: ${ROUTES.length} screens without errors${e.errs.length ? `: ${JSON.stringify(e.errs[0])}` : ''}`);
const f = await session(walkRoutes, { dir: data2 });
ok(f.n === 0 && f.errs.length === 0, 'empty firm stays empty after restart');

rmSync(data, { recursive: true, force: true });
rmSync(data2, { recursive: true, force: true });
console.log(failed ? `${failed} FAILED` : 'ALL OK');
process.exit(failed ? 1 : 0);
