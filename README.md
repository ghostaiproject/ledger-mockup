# Solva

Phone-first mock app for a Québec accounting firm (cabinet comptable), made for someone who doesn't love tech:
one clear thing per screen, big buttons, plain words, dark green. Bilingual FR-CA / EN-CA, light and dark.
Built with the `webd` skill (Ghostskills). Static HTML/CSS/JS, fake data, nothing is filed or sent.

Screens (one page, hash routes):
- `#/` landing page: what Solva does, "Open my dashboard"
- `#/today`: what's left to do today, one button per task
- `#/deadlines`: CRA / Revenu Québec dates (real rules, computed from today; weekends move to Monday)
- `#/clients`: to do / in progress / ready, tap a client to act
- `#/money`: what clients owe, reminders, bank matching
- `#/close`: month-end checklist

Every action shows a toast with Undo.

Run locally: `python -m http.server 5174` then open http://localhost:5174

Screenshots: `python tools/shots.py http://localhost:5174/` writes `shots/sheet.jpg` (one contact sheet).
Icons: `python tools/vendor_icons.py` vendors the Lucide icons into `assets/icons.js` (no CDN).

![Contact sheet](shots/sheet.jpg)
