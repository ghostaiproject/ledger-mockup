// Copies the web files into dist/ for the Tauri app (same list as .github/workflows/pages.yml)
// and stamps every ?v= with the build so the app never serves stale files.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');
let v;
try { v = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch (e) { v = Date.now().toString(36); }

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const f of readdirSync(root)) {
  if (f === 'index.html' || /^[\w-]+\.(js|css)$/.test(f)) cpSync(join(root, f), join(dist, f));
}
cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
const html = join(dist, 'index.html');
writeFileSync(html, readFileSync(html, 'utf8').replace(/\?v=[A-Za-z0-9]+"/g, `?v=${v}"`));
console.log(`dist/ ready (v=${v})`);
