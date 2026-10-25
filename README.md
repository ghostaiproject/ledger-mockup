# Solva

Phone-first mock of an accountant's workbench for a Québec firm (cabinet comptable): Autopilot prepares the books,
the accountant reviews every decision with its reason, tunes the engine, signs off, and files on time. Dark green. Bilingual FR-CA / EN-CA, light and dark.
Live: https://ghostaiproject.github.io/ledger-mockup/

Built with the `webd` skill (Ghostskills). Static HTML/CSS/JS, fake data, nothing is filed or sent.

Screens (one page, hash routes):
- `#/` landing page: what Solva does, "Open my dashboard"
- `#/today`: what's left to do today, one button per task
- `#/auto`: **Autopilot**: drop a bank statement + invoice list (CSV), it does the bookkeeping (see below)
- `#/review`: **Review**: every bank line with its method (rule, learned, matched invoice, by hand), its reason and a confidence score;
  override the account, approve in batches, ten tie-outs that show what they compared, preparer + reviewer sign-off (any later change voids it),
  review log, journal entries, audit trail CSV
- `#/engine`: **Engine**: every Autopilot setting (GST/QST rates, ITC % per account, filing frequency, terms, aging buckets, matching tolerances,
  similarity and confidence thresholds, duplicate/outlier flags, vendor rules with a live tester, learned vendors), each change logged and rerun; export/import JSON
- `#/calendar`: **Calendar**: GST/QST, source deductions, instalments, T2/CO-17, T1/TP-1, T4/RL-1 worked out from each client's profile
  (type, GST/QST frequency, year end, payroll); filter by client/type, mark filed, add reminders, export .ics, arrow-key date grid
- **Guided sample** (the "try with sample files" button): the whole job, step by step with the real actions: files in → Autopilot → exceptions
  cleared → a setting changed → batch review → tie-outs + preparer sign-off → reviewer sign-off → GST/QST filed on the calendar → client summary
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

Test: `node tools/engine_test.js` (books, parsing, settings, tie-outs)

Files: `engine.js` (books), `app.js` (screens), `desk.js` + `desk.css` (review, engine, calendar), `tour.js` (guided sample)

Run locally: `python -m http.server 5174` then open http://localhost:5174

Screenshots: `python tools/shots.py http://localhost:5174/` writes `shots/sheet.jpg` (one contact sheet).
Icons: `python tools/vendor_icons.py` vendors the Lucide icons into `assets/icons.js` (no CDN).

![Contact sheet](shots/sheet.jpg)
