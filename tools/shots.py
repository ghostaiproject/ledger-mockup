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
              display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }}
      figure {{ margin: 0; flex: 0 0 calc(25% - 9px); }} img {{ width: 100%; display: block; border-radius: 6px; }}
      figcaption {{ margin-bottom: 6px; }}
    </style>{cells}''')
    page.wait_for_load_state('load')
    page.screenshot(path=OUT / 'sheet.jpg', full_page=True, type='jpeg', quality=60)


def shot(b, route, w, h, light=False, full=False, mobile=False, sample=False, tour=0):
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
    pg.goto(URL + route, wait_until='networkidle')
    if light:  # dark is the default; the toggle switches to light
        pg.click('[data-theme-toggle]')
    if sample:  # guided sample: run the tour to step `tour` (0 = only Autopilot), then show `route`
        pg.click('.screen.on [data-sample]')
        for _ in range(max(1, tour)):
            pg.click('#tour [data-tour="go"]')
            pg.wait_for_function("!document.querySelector('#tour [data-tour=go][aria-disabled]')", timeout=20000)
            pg.wait_for_timeout(300)
        pg.evaluate(f"location.hash = '{route}'")
        if tour == 0:
            pg.evaluate("state.tour = null; render()")
    pg.wait_for_timeout(600)
    name = (route.strip('#/') or 'home') + ('-light' if light else '') + ('-phone' if mobile else '') + ('-done' if sample else '')
    return pg.screenshot(path=OUT / f'{name}.png', full_page=full)


with sync_playwright() as p:
    b = p.chromium.launch()
    shots = [('Landing', shot(b, '', 1440, 900)),
             ('Desktop · Review (tour step 5)', shot(b, '#/review', 1440, 900, sample=True, tour=4)),
             ('Desktop · Calendar · light', shot(b, '#/calendar', 1440, 900, light=True)),
             ('Desktop · Engine', shot(b, '#/engine', 1440, 900)),
             ('Phone · Tour step 3', shot(b, '#/auto', 390, 844, mobile=True, sample=True, tour=2)),
             ('Phone · Calendar', shot(b, '#/calendar', 390, 844, mobile=True)),
             ('Phone · Review · light', shot(b, '#/review', 390, 844, light=True, mobile=True, sample=True, tour=7)),
             ('Phone · Today', shot(b, '#/today', 390, 844, mobile=True))]
    sheet(b.new_page(), shots)
    b.close()

for f in sorted(OUT.glob('*.*')):
    print(f'{f}  {f.stat().st_size // 1024} KB')
