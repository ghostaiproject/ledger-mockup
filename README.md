# Solva

Phone-first mock app for a Québec accounting firm (cabinet comptable), made for someone who doesn't love tech:
one clear thing per screen, big buttons, plain words. Pale mint (#DAF1DE) on white and ink; light by default, charcoal dark mode. Bilingual FR-CA / EN-CA, light and dark.
Live: https://ghostaiproject.github.io/ledger-mockup/

Built with the `webd` skill (Ghostskills). Static HTML/CSS/JS, fake data, nothing is filed or sent.

Screens (one page, hash routes):
- `#/` landing page: what Solva does, "Open my dashboard"
- `#/today`: what's left to do today, one button per task
- `#/auto`: **Autopilot**: drop a bank statement + invoice list (CSV), it does the bookkeeping (see below)
- `#/deadlines`: CRA / Revenu Québec dates (real rules, computed from today; weekends move to Monday)
- `#/clients`: to do / in progress / ready, tap a client to act
- `#/money`: what clients owe, reminders, bank matching
- `#/close`: month-end checklist

Every action shows a toast with Undo.

## Autopilot (`engine.js`)

Feed it files, it does the work in a background Web Worker and hands back the output. Nothing leaves the browser.

1. **Reads** any bank CSV (Desjardins `;` + `1 234,56`, or `,` + `1,234.56`; Amount or Withdrawal/Deposit columns; day- or month-first dates detected per file) and any invoice list.
2. **Sorts expenses** into a small chart of accounts: your past choices, then vendor rules (Hydro-Québec, Bell, RONA…), then the closest vendor it learned. Unknown vendors are asked once and remembered.
3. **Matches deposits to invoices**: exact amount + client name + date, one payment for several invoices (subset sum), partial payments.
4. **GST/QST**: takes 5 % + 9.975 % out of every taxable amount (meals at 50 %, exempt items none), FPZ-500 lines 101/103/106/109 and 203/206/209, due date.
5. **Journal**: double-entry for every invoice and bank line; checks debits = credits and the statement's running balance.
6. **Flags** what a careful bookkeeper would: charged twice, unusual amount (robust z-score → maybe equipment), deposit with no invoice, part payment, missing statement line. One tap each, with Undo.

Output: profit and loss, tax return figures, who still owes what (aging), a client summary to copy, and CSV downloads (journal, sorted bank, GST/QST, trial balance).
The client's file and the month-end checklist update themselves. Try it with the sample files button.

Test: `node tools/engine_test.js`

Run locally: `python -m http.server 5174` then open http://localhost:5174

Screenshots: `python tools/shots.py http://localhost:5174/` writes `shots/sheet.jpg` (one contact sheet).
Icons: `python tools/vendor_icons.py` vendors the Lucide icons into `assets/icons.js` (no CDN).

![Contact sheet](shots/sheet.jpg)
