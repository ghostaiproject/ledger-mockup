# Solva (ledger-mockup) · handoff

## LATEST (2026-10-25, branch ccr-05297e01-5ze1ek, not merged to main yet)
- Palette: green toned down. Brand tint `#DAF1DE` (user's pick) on neutral white/ink; primary buttons = ink with mint text; green only for "done"/progress (`--ring`).
- Light is the default theme now (storage key bumped to `solva-v3`). Dark = charcoal `#0e1110` + mint accent, not deep green.
- Tokens in `style.css`: `--tint` (#DAF1DE fills), `--soft` (neutral tracks: progress, ring, seg, drop zone), `--raised` (selected seg/filter tab), `--frame` (phone mockup).
- Hero art: `hero.jpg` background shifted to exactly #DAF1DE (= light `--hero`); `hero-dark.jpg` green room desaturated to charcoal #151918 (= dark `--hero`). Edges fade via CSS mask → no visible box.
- Landing: phone mockup scaled (.52 phone / .62 ≥720) hanging off the bottom-left so the plant stays visible. Feature cards = mint "peek" panel with a mini live screen (expenses sorted, next deadline, clients, month-end 3/5), FR/EN in `t().peek`; 2×2 grid ≥720.
- Today: late task first, only the first open task has the filled button, rest `soft`.
- Small: phone nav labels 12px (no truncation), Autopilot 3rd stat spans the row on phones, Deadlines "C'est fait" auto-width ≥720, theme-color meta follows the theme.
- Verified: engine test OK; Playwright all 7 screens × phone/desktop × light/dark: no overflow, no JS errors, targets ≥44 px. NOT verified on a real phone.

## Open
- Merge the branch to main (GitHub Pages serves main).
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
