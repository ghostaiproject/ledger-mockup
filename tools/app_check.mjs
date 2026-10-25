// App check (Windows, debug build): vault create / device unlock / passphrase unlock, data survives a restart,
// nothing on disk is readable. The device key is a test key file here (SOLVA_DEVICE=file), so no Hello prompt.
// Run after `npx tauri build --debug --no-bundle`:  node tools/app_check.mjs
// Uses a throwaway data folder (SOLVA_DATA_DIR, debug builds only) so your real app data is never touched.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = join(import.meta.dirname, '..');
const exe = join(root, 'src-tauri/target/debug/solva.exe');
const data = join(tmpdir(), `solva-check-${process.pid}`);
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
async function session(expr, pre) {
  const p = spawn(exe, [], { env: { ...process.env, SOLVA_DATA_DIR: data, SOLVA_DEVICE: 'file', WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}` } });
  try { await wait(1500); const first = pre ? await evalIn(pre) : null; await evalIn('new Promise(r => { const t = setInterval(() => { if (!document.documentElement.classList.contains("booting")) { clearInterval(t); r(); } }, 100); })'); return { first, ...(await evalIn(expr)) }; }
  finally { p.kill(); await wait(1500); }
}
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

const PASS = 'check passphrase 1';
rmSync(data, { recursive: true, force: true }); // fresh throwaway vault
const a = await session(`(async () => {
  state.firm.pbc[2].st = 'waived'; state.firm.time.push({ id: 'tCHECK', eng: 'pins-comp', who: 'JT', date: new Date(), h: 2.25, note: 'restart check', billed: false });
  render(); const id = await Store.doc.add({ name: 'releve-juin.pdf', type: 'application/pdf' }, new TextEncoder().encode('%PDF-1.7 Banque').buffer);
  await StoreNative.flushed(); return { native: Store.native, failed: StoreNative.failed, id };
})()`, `(async () => { const s = await StoreNative.status(); const short = await StoreNative.vault.create('short').catch(String);
  await StoreNative.vault.create('${PASS}'); return { s, short }; })()`);
ok(a.first.s.state === 'new' && /10/.test(a.first.short), 'first run = new vault; short passphrase refused');
ok(a.native && a.failed === 0, `app saves through the native store (failed writes: ${a.failed})`);

const files = walk(data);
const leaks = files.filter((f) => /pins|CHECK|restart|PDF|Banque|releve/i.test(f.slice(data.length) + readFileSync(f).toString('latin1')));
ok(files.length > 20, `${files.length} sealed files on disk`);
ok(leaks.length === 0, `no readable client data in file names or contents${leaks.length ? `: ${leaks[0]}` : ''}`);

const b = await session(`(async () => {
  const t = state.firm.time.find((x) => x.id === 'tCHECK'), d = (await Store.doc.list())[0];
  return { note: t?.note, isDate: t?.date instanceof Date, pbc: state.firm.pbc[2].st, doc: d && await (await Store.doc.open(d.id)).text() };
})()`);
ok(b.note === 'restart check' && b.isDate, 'time entry back after restart (date revived)');
ok(b.pbc === 'waived', 'request status back after restart');
ok(b.doc === '%PDF-1.7 Banque', 'document opens after restart, same bytes');

rmSync(join(data, 'vault.local.json')); // as on a new device: only the passphrase wrap is there
const c = await session(`(async () => ({ docs: (await Store.doc.list()).length, pbc: state.firm.pbc[2].st }))()`,
  `(async () => { const s = await StoreNative.status(); const wrong = await StoreNative.vault.unlock('wrong passphrase!').catch(String);
  await StoreNative.vault.unlock('${PASS}'); return { s, wrong }; })()`);
ok(c.first.s.state === 'locked' && !c.first.s.deviceReady && /wrong passphrase/.test(c.first.wrong), 'no device wrap: wrong passphrase refused');
ok(c.docs === 1 && c.pbc === 'waived', 'passphrase opens the same data');
ok(existsSync(join(data, 'vault.local.json')), 'passphrase unlock re-wraps the key for this device');
const d = await session(`(async () => { await StoreNative.vault.lock(); const r = await window.__TAURI__.core.invoke('rec_all').catch(String);
  return { locked: r, st: (await StoreNative.status()).state }; })()`);
ok(d.first === null && d.locked === 'locked' && d.st === 'locked', 'device key opens at start; lock closes the vault');

rmSync(data, { recursive: true, force: true });
console.log(failed ? `${failed} FAILED` : 'ALL OK');
process.exit(failed ? 1 : 0);
