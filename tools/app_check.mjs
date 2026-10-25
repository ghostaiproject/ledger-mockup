// App check (Windows, debug build): data survives a restart and nothing on disk is readable.
// Run after `npx tauri build --debug --no-bundle`:  node tools/app_check.mjs
// Uses a throwaway data folder (SOLVA_DATA_DIR, debug builds only) so your real app data is never touched.
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
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
        if (m.result.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description);
        return m.result.result.value;
      }
    } catch (e) { if (String(e).includes('Error:')) throw e; }
    await wait(500);
  }
  throw new Error('app did not start');
}
async function session(expr) {
  const p = spawn(exe, [], { env: { ...process.env, SOLVA_DATA_DIR: data, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}` } });
  try { await wait(1500); await evalIn('new Promise(r => { const t = setInterval(() => { if (!document.documentElement.classList.contains("booting")) { clearInterval(t); r(); } }, 100); })'); return await evalIn(expr); }
  finally { p.kill(); await wait(1500); }
}
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

rmSync(data, { recursive: true, force: true }); // fresh throwaway vault (its dev key lives inside it)
const a = await session(`(async () => {
  state.firm.pbc[2].st = 'waived'; state.firm.time.push({ id: 'tCHECK', eng: 'pins-comp', who: 'JT', date: new Date(), h: 2.25, note: 'restart check', billed: false });
  render(); const id = await Store.doc.add({ name: 'releve-juin.pdf', type: 'application/pdf' }, new TextEncoder().encode('%PDF-1.7 Banque').buffer);
  await StoreNative.flushed(); return { native: Store.native, failed: StoreNative.failed, id };
})()`);
ok(a.native && a.failed === 0, `app saves through the native store (failed writes: ${a.failed})`);

const files = walk(data).filter((f) => !f.endsWith('vault.dev.key'));
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

rmSync(data, { recursive: true, force: true });
console.log(failed ? `${failed} FAILED` : 'ALL OK');
process.exit(failed ? 1 : 0);
