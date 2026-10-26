# Folio (ledger-mockup) · handoff

## LATEST (2026-10-25, web demo = Folio, desktop-site layout, demo lock + cloud)
- main now carries app-tauri (Pages shows Folio). Pages workflow unchanged (copies index.html, *.js, *.css, assets; store-native.js stays null on the web).
- `demo-native.js` (web only, null in the app): pretend backend with the StoreNative vault/sync shape. Vault: create passphrase (SHA-256 in sessionStorage), simulated Hello (1.1 s), wrong passphrase refused, reload = locked again, idle lock after 2 min (`solva-idle-min` still overrides). Sync: fake Drive connect, sync now (14 sent / 3 received), first sync adds one sample conflict (engagement one stage on) that restore applies. Labeled "Démo web" on the lock card and sync panel, plus "Réinitialiser la démo".
- vault-ui.js / sync-ui.js run on `StoreNative || DemoNative`. Demo lock = overlay, no reload; first lock press opens the create screen; `VaultUI.demo()` is called from app.js boot. `Bind.emptyFirm()` for the demo "Cabinet vide" choice.
- index.html head: phone/tablet in "desktop site" mode (userAgentData.mobile false or no mobile UA + touch + screen < 900) → viewport `width=1560` (computer layout, side bar groups). Normal phones unchanged.
- Check: `python tools/demo_check.py http://localhost:5177/` (16 checks, contact sheet `shots/demo-sheet.jpg`); `npm run check` ALL OK.

## Before (2026-10-25, Google Drive sync + warm forest green + new-engagement form)
- Colors: mint `#DAF1DE` is gone from the tokens. Light: buttons `--accent` #234233, `--tint` #e1e9d6, `--on-accent` #e8efdc, `--accent-ink` #2d5139. Dark: `--accent` #b7cfa3, `--tint` #222a1f. Walnut stays the ring/progress color. Icon and hero art not recolored.
- `engagement-add.js` ("Nouveau mandat" form under the list; `due` must be a Date like the samples, a number crashes engRow).
- Sync (plan §6), Rust: `sync.rs` (3-way per sealed file, base hash in sealed `sync/state.json`; both changed = higher (at, dev) wins, loser kept in `sync/conflicts/`; delete travels; foreign-key file refused; unit test with 2 devices), `drive.rs` (Drive v3 appDataFolder via ureq, sha256 in appProperties), `oauth.rs` (PKCE loopback, scope drive.appdata, opens browser with tauri-plugin-opener). Commands `sync_status/connect/disconnect/run`, `conflicts_list`, `conflict_del`. Disk gained `sync_files/raw_get/raw_put/raw_del/side_*`.
- JS: `sync-ui.js` + `sync-i18n.js` (cloud button in the header, panel: connect, sync now, conflicts restore/dismiss; auto sync on open + every 5 min), `Store.ingest(rec)` merges downloaded records, `StoreNative.sync.*`.
- NEEDS from the owner: a Google Cloud OAuth client (type Desktop app, Drive API enabled, drive.appdata scope) → `%APPDATA%\ca.folio.app\google.json` {"client_id","client_secret"} (or env FOLIO_GOOGLE_CLIENT_ID/SECRET). NOT tried against real Google yet; only the merge logic is tested (in-memory remote). Android: loopback sign-in untested, deep link not done.
- `npm run check` ALL OK, incl. new checks (hand-added client + engagement survive restart, sync button).

## Before (2026-10-25, app icon + add clients by hand)
- Icon: /ceig (Gemini) walnut F with mint page edge + ledger lines on charcoal, `src-tauri/app-icon.png` → `npx tauri icon` regenerated `src-tauri/icons/*` (incl. android).
- Clients screen: "Ajouter un client" form (`clients-add.js`, loaded before app.js; `ClientsAdd.sync()/after()` called from `render()`). Own clients live in `state.myClients`, saved as collection `myclients` (Bind LISTS), merged into `CLIENTS`; remove button + undo toast. Only clients; engagements/deadlines/autopilot still have no manual add (follow-up).
- Checked in browser (add + remove) and `npm run check` ALL OK. Not yet tested: add client then restart in the Tauri app.

## Before (2026-10-25, Android keystore plugin + CI)
- `src-tauri/plugins/keystore/` (Rust + Kotlin): Keystore HMAC-SHA256 key, per-use auth via BiometricPrompt + CryptoObject (fingerprint/face/PIN, minSdk 30). Same `secret(name, challenge)` contract as Hello; `device.rs` kind = "keystore" on Android. Registered in lib.rs under `cfg(target_os = "android")`.
- UI: on keystore the "Windows Hello" strings become "phone lock" (`dev()` in vault-ui.js); locks after 30 s in the background (`bg` reason).
- CI: `.github/workflows/app.yml` = Windows (tests + unsigned msi/nsis) + Android (`tauri android init` + debug apk) artifacts. Kotlin/Android NOT compiled locally: first CI run is the real test; fix from its log. Not tried on a phone.
- `npm run check`: ALL OK (desktop unchanged).

## Before (2026-10-25, Tauri app: lock + first-run screens; brand renamed Solva → Folio)
- Rename: Solva → Folio everywhere (exe `folio.exe`, id `ca.folio.app`, env `FOLIO_DATA_DIR` / `FOLIO_DEVICE`). Storage keys kept (`solva-v3`, `solva-store-web`, `solva-idle-min`, `solva-lock`, HMAC label `solva-name`) so nothing needs migrating.
- Screens: `vault-ui.js` + `vault-ui.css` + `vault-i18n.js` (FR/EN), app only (null on the web demo). First run = create (passphrase twice, min 10, strength meter, "keep it safe" warning, Hello note) → "Par où commencer?" (Cabinet vide / Charger l'exemple). Locked = Windows Hello button first (opens by itself at start, not after a lock) + "Utiliser ma phrase secrète"; no device copy = passphrase form ("Première ouverture sur cet appareil…"). Rust errors shown in FR/EN.
- Lock: header lock button + auto-lock after 10 min idle (`localStorage solva-idle-min` overrides). Lock = save → `vault_lock` → page reload, so no decrypted data stays in memory. `.app` is `inert` under the lock screen.
- Empty firm: record `one/start` = 'empty' clears the firm lists (engagements, hours, invoices, requests, AJEs, reminders, own calendar items) on every start. Clients, deadlines, autopilot bank sample and the Deux-Pins trial balance are still sample data in an empty firm (they need real empty states: follow-up). Fixed crashes: Today letter/reminder tasks, year-end screen (new empty state).
- `interimUnlock()` prompts are gone: `StoreNative.open(start)` is the gate, `whenOpen()` shows the screens.
- `tools/app_check.mjs` drives the real screens: 18 checks (create form errors, meter, sample, restart, passphrase form, re-wrap, idle lock wipes memory, empty firm on 15 routes, empty stays empty). Contact sheet of the 16 views (light/dark × phone/desktop): `shots/vault-sheet.jpg`. Hand test of the new screens with real Hello: NOT done yet.

## Before (2026-10-25, Tauri app: step 4 vault keys)
- Vault: random DEK wrapped twice: Windows Hello (`hello_win.rs`, sign → HKDF) in `vault.local.json` + Argon2id passphrase in `vault.json` (goes to the cloud in step 5). Dev key file gone (adopted as DEK on create). Release builds now open too.
- Tauri: `vault_status` {state new|locked|open, device, deviceReady, minPass}, `vault_create(pass)`, `vault_unlock(pass?)` (none = Hello), `vault_lock`. JS: `StoreNative.vault.*`, `Store.ready()` waits for open.
- Until the screens: `store-native.js` `interimUnlock()` uses Hello, else `prompt()` (create asks twice). Replace with lock/onboarding screens (Next 2, /crew) + idle auto-lock.
- `tools/app_check.mjs` runs with `FOLIO_DEVICE=file` (debug-only test device key, no prompt): 11 checks (create, short pass, restart, wrong pass, re-wrap, lock). Real Hello tried by hand 2026-10-25: create (passphrase + Hello), restart opens with Hello only, data back, nothing readable on disk.

## Before (2026-10-25, Tauri app: Next 1 scaffold)
- Plan: `docs/APP-PLAN.md` (layout, Store API, keys/unlock, disk format, sync, CI, order of work). Decided: Google Drive first, unsigned builds for now, Windows tools local / Android in CI.
- Scaffold: `package.json` (@tauri-apps/cli), `tools/build_web.mjs` (web files → `dist/`, stamps ?v=), `src-tauri/` (conf, Cargo, lib.rs with `app_info`, capabilities, icons from `app-icon.png` placeholder). Pages workflow untouched.
- Toolchain on this PC: rustup stable (MSVC) + VS 2022 C++ Build Tools. Cargo is in `%USERPROFILE%\.cargo\bin` (new shells only).
- Build: `npx tauri build --debug --no-bundle` → `src-tauri/target/debug/folio.exe`. Next: plan step 4 (vault: Windows Hello device key, passphrase, lock/unlock + onboarding screens; use /crew for the screens, the `grapp` skill for defaultable choices).
- Step 3 done: encrypted records + documents on disk (`src-tauri/src/crypt.rs`, `disk.rs`, `vault.rs` dev key, `store-native.js`). Check everything with `npm run check` (cargo on PATH: `%USERPROFILE%\.cargo\bin`).
- Step 2 done: `store.js` (Store API, web backend: firm data in memory, own settings in localStorage `solva-store-web`, migrates old `solva-memory`/`solva-desk`) + `store-bind.js` (`render()` → `Bind.flush()` diffs and saves changed records). Checked: no errors on 15 routes × phone/desktop × light/dark; desktop dense rows (pbcAsk/pbcSt/task/eng buttons) are <44 px on main too (not new).
- Local preview: launch config `folio-app` (port 5177) in Desktop\New folder\.claude\launch.json; 5174 is often taken.

## Before (2026-10-25, public accounting + computer first)
- Built for a CPA firm first. New screens: `#/engagements` (compilation NCSC 4200, review NCME 2400, T2/CO-17, T1/TP-1, bookkeeping; 7 stages with gates: letter, independence, client docs, year-end sign-offs), `#/yearend` (Deux-Pins at 2026-06-30: trial balance, 4 proposed AJEs incl. tax 12.2 %, lead sheets with variance flags, compiled statements + compilation report, preparer → reviewer → partner sign-off, print, CSV), `#/requests` (PBC list per engagement), `#/time` (timer, entries, budget vs actual, WIP, bill → invoice, CSV), `#/more` (phone index).
- Code: `firm-data.js` (staff, engagements, time, PBC, TB), `firm-i18n.js` + `firm-i18n-en.js` (`tf()`), `firm.js` (engagements, requests, more, Today tasks), `firm-time.js`, `yearend.js`, `firm.css` (firm styles + computer-first layout: 1560px app, grouped side bar, dense rows).
- Phone bar = Today, Engagements, Calendar, Review, More. Computer = every section in 3 groups.
- Hero art: /ceig desk + laptop (light `hero.jpg`, dusk `hero-dark.jpg`); phone mockup hidden at ≥1080.
- Deploy: `.github/workflows/pages.yml` stamps `?v=` with the commit on every push (phones never keep old files). Worker loads the versioned `engine.js`.
- Firm state is not saved (resets on reload).

## Before (2026-10-25, main a70240a)
- Accountant workbench: `#/review` (method + reason + confidence per line, override, batch approve, 10 tie-outs, preparer/reviewer sign-off voided by later changes, audit CSV), `#/engine` (every engine setting, rule tester, change log, JSON export/import), `#/calendar` (deadlines from client `profile`, .ics). Code: `desk.js` + `desk.css`.
- Sample button = 9-step guided tour (`tour.js`) doing the real actions end to end.
- Palette: black/white + walnut brown (`--ring` #8a6244 / dark #c9a27e) + #DAF1DE; buttons ink with mint text. New /ceig hero art (desk, charcoal + walnut).
- Engine: `run({settings})`, `DEFAULTS`, `settingsOf`; each bank line has `how/why/conf`, entries have `src`, result has `checks`.

## Earlier (branch ccr-05297e01-5ze1ek, merged)
- Palette: green toned down. Brand tint `#DAF1DE` (user's pick) on neutral white/ink; primary buttons = ink with mint text; green only for "done"/progress (`--ring`).
- Light is the default theme now (storage key bumped to `solva-v3`). Dark = charcoal `#0e1110` + mint accent, not deep green.
- Tokens in `style.css`: `--tint` (#DAF1DE fills), `--soft` (neutral tracks: progress, ring, seg, drop zone), `--raised` (selected seg/filter tab), `--frame` (phone mockup).
- Hero art: `hero.jpg` background shifted to exactly #DAF1DE (= light `--hero`); `hero-dark.jpg` green room desaturated to charcoal #151918 (= dark `--hero`). Edges fade via CSS mask → no visible box.
- Landing: phone mockup scaled (.52 phone / .62 ≥720) hanging off the bottom-left so the plant stays visible. Feature cards = mint "peek" panel with a mini live screen (expenses sorted, next deadline, clients, month-end 3/5), FR/EN in `t().peek`; 2×2 grid ≥720.
- Today: late task first, only the first open task has the filled button, rest `soft`.
- Small: phone nav labels 12px (no truncation), Autopilot 3rd stat spans the row on phones, Deadlines "C'est fait" auto-width ≥720, theme-color meta follows the theme.
- Verified: engine test OK; Playwright all 7 screens × phone/desktop × light/dark: no overflow, no JS errors, targets ≥44 px. NOT verified on a real phone.

## Open
- Autopilot review titles are raw bank text (UPPERCASE) → clean name + bank text small.
- Clients screen sparse (2 clients) → next-step line per client, empty state for "Prêts".
- Money split bar mostly red → show late amount as a number, smaller bar.
- Wide screens: Today/Deadlines could go two columns.
- Dark hero is a recolor; a /ceig image made for charcoal would be better.

## Project
Phone-first mock app for a Québec accounting firm, non-tech user. Static HTML/CSS/JS, fake data, FR-CA/EN-CA, light + dark. Built with the `webd` skill. Live: https://ghostaiproject.github.io/ledger-mockup/

## How it works
- `index.html` shell + screens (hash routes), `app.js` i18n + render per screen + toasts/undo, `engine.js` Autopilot (Web Worker), `style.css` tokens on `:root` / `[data-theme="dark"]`.
- Run: `python -m http.server 5174`. Test: `node tools/engine_test.js`. Shots: `python tools/shots.py http://localhost:5174/` → `shots/sheet.jpg` (PNGs gitignored). Default is light; `dark=True` toggles.
- Cloud session: pip `playwright` + `chromium.launch(executable_path=/opt/pw-browsers/chromium-*/chrome-linux64/chrome)` (pip version doesn't match the preinstalled browser).

## History
- v4 2026-10-25 less green: #DAF1DE tint, light default, landing art/cards, app-wide review fixes
- v3 Autopilot: bank statement + invoices → bookkeeping
- v2 darker look, Gemini hero art
- v1 webd redesign: phone-first landing + 5 screens, undo toasts
