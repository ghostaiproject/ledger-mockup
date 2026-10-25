"""Screenshot the running dashboard: python tools/shots.py [url] [out_dir]

Writes full-size PNGs (README assets) plus sheet.jpg: one small labeled contact sheet
of every view. Review and share sheet.jpg only; it is ~10x cheaper to look at.
"""
import base64
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / 'shots'
OUT.mkdir(exist_ok=True)
SHEET_W = 1600


def sheet(page, shots):
    """Tile (label, png bytes) pairs side by side and save as one compact JPEG."""
    cells = ''.join(
        f'<figure><figcaption>{label}</figcaption>'
        f'<img src="data:image/png;base64,{base64.b64encode(png).decode()}"></figure>'
        for label, png in shots)
    page.set_viewport_size({'width': SHEET_W, 'height': 400})
    page.set_content(f'''<style>
      body {{ margin: 0; padding: 12px; background: #222; font: 600 15px system-ui; color: #eee;
              display: flex; gap: 12px; align-items: flex-start; }}
      figure {{ margin: 0; flex: var(--f); }} img {{ width: 100%; display: block; border-radius: 6px; }}
      figcaption {{ margin-bottom: 6px; }}
      figure {{ --f: .5; }} figure:nth-child(-n+2) {{ --f: 1.1; }}
    </style>{cells}''')
    page.wait_for_load_state('load')
    page.screenshot(path=OUT / 'sheet.jpg', full_page=True, type='jpeg', quality=60)


def shot(b, route, w, h, dark=False, full=False, mobile=False, sample=False):
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
    pg.goto(URL + route, wait_until='networkidle')
    if dark:  # light is the default; the toggle switches to dark
        pg.click('[data-theme-toggle]')
    if sample:  # Autopilot: feed it the sample files and wait for the output
        pg.click('[data-sample]')
        pg.wait_for_selector('#autoAnswer')
    pg.wait_for_timeout(600)
    name = (route.strip('#/') or 'home') + ('-dark' if dark else '') + ('-phone' if mobile else '') + ('-done' if sample else '')
    return pg.screenshot(path=OUT / f'{name}.png', full_page=full)


with sync_playwright() as p:
    b = p.chromium.launch()
    shots = [('Landing', shot(b, '', 1440, 900)),
             ('Desktop · Autopilot', shot(b, '#/auto', 1440, 900, sample=True)),
             ('Phone · Autopilot', shot(b, '#/auto', 390, 844, mobile=True)),
             ('Phone · Autopilot · dark', shot(b, '#/auto', 390, 844, dark=True, mobile=True, sample=True)),
             ('Phone · Today', shot(b, '#/today', 390, 844, mobile=True)),
             ('Phone · Clients · dark', shot(b, '#/clients', 390, 844, dark=True, mobile=True)),
             ('Phone · Money', shot(b, '#/money', 390, 844, mobile=True))]
    sheet(b.new_page(), shots)
    b.close()

for f in sorted(OUT.glob('*.*')):
    print(f'{f}  {f.stat().st_size // 1024} KB')
