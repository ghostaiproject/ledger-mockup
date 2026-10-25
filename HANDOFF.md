# Solva (ledger-mockup) · handoff

## LATEST (2026-10-25, public accounting + computer first)
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
