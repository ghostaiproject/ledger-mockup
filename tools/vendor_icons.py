"""Vendor the Lucide icons the page uses into assets/icons.js (no CDN at runtime).

python tools/vendor_icons.py   (needs Playwright; reads the icons from the pinned lucide@0.460.0 build)
Lucide is ISC licensed: https://lucide.dev/license
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

NAMES = ('arrow-right calendar-clock check chevron-down circle-check landmark list-checks mail moon party-popper '
         'send sprout sun users wallet wand-sparkles file-up download copy rotate-ccw sparkles triangle-alert '
         'calendar-days chevron-left chevron-right shield-check sliders-horizontal pen-line circle-x circle-minus plus trash-2 '
         'upload history scale info search calendar-plus file-check '
         'briefcase folder-open timer inbox printer file-text layout-grid receipt play square clock').split()
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'icons.js'

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page()
    page.set_content('<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>')
    page.wait_for_function('window.lucide')
    icons = page.evaluate('''(names) => Object.fromEntries(names.map(n => {
        const key = n.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('');
        return [n, lucide.createElement(lucide.icons[key]).innerHTML];
    }))''', NAMES)
    b.close()

OUT.write_text('// Lucide icons (ISC license, lucide.dev), vendored by tools/vendor_icons.py\n'
               f'window.ICONS = {json.dumps(icons, separators=(",", ":"))};\n', 'utf-8')
print(f'{OUT}  {len(icons)} icons  {OUT.stat().st_size // 1024} KB')
