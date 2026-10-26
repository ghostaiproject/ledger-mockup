"""Web demo check: pretend vault + sync (demo-native.js) and the "desktop site" layout on a phone.
python tools/demo_check.py [url] [out_dir]  →  prints one line per check, writes demo-sheet.jpg (contact sheet).
"""
import base64
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5177/'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / 'shots'
OUT.mkdir(exist_ok=True)
PASS = 'cèdre bleu sur la rive nord'
DESK_UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) '
           'Chrome/141.0.0.0 Safari/537.36')
PHONE_UA = ('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/141.0.0.0 Mobile Safari/537.36')
fails, shots = [], []


def sheet(page, cells):
    """Tile (label, png) pairs, 4 per row, into one labeled page (same look as tools/shots.py)."""
    figs = ''.join(f'<figure><figcaption>{t}</figcaption><img src="data:image/png;base64,{base64.b64encode(png).decode()}"></figure>'
                   for t, png in cells)
    page.set_viewport_size({'width': 1600, 'height': 400})
    page.set_content('<style>body{margin:0;padding:12px;background:#222;font:600 15px system-ui;color:#eee;display:flex;'
                     'flex-wrap:wrap;gap:12px;align-items:flex-start}figure{margin:0;flex:0 0 calc(25% - 9px)}'
                     f'img{{width:100%;display:block;border-radius:6px}}figcaption{{margin-bottom:6px}}</style>{figs}')
    page.wait_for_load_state('load')


def ok(name, cond):
    print(('OK   ' if cond else 'FAIL ') + name)
    if not cond:
        fails.append(name)


def snap(page, label):
    shots.append((label, page.screenshot()))


with sync_playwright() as p:
    b = p.chromium.launch()
    for theme in ('light', 'dark'):
        ctx = b.new_context(viewport={'width': 1440, 'height': 900}, color_scheme=theme)
        ctx.add_init_script("sessionStorage.setItem('folio-welcome', '1')")  # the entry welcome is checked on the phone below
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.goto(URL + '#/today')
        page.evaluate(f"localStorage.setItem('solva-v3', JSON.stringify({{theme: '{theme}', lang: 'fr'}}))")
        page.reload()
        page.wait_for_selector('[data-vault-lock]')
        if theme == 'light':
            ok('lock + cloud buttons in the header', page.locator('[data-sync-open]').count() == 1)
            page.click('[data-vault-lock]')
            page.wait_for_selector('form[data-form="create"]')
            ok('first press = create screen with demo label', page.locator('.vault-demo').count() == 1)
            page.fill('#vp1', PASS)
            page.fill('#vp2', PASS)
            snap(page, 'Démo · créer la phrase')
            page.click('form[data-form="create"] button[type="submit"]')
            page.wait_for_selector('[data-v="start"]')
            snap(page, 'Démo · par où commencer')
            page.click('[data-v="start"][data-k="sample"]')
            page.wait_for_selector('#vault', state='detached')
            page.click('[data-vault-lock]')
            page.wait_for_selector('[data-v="hello"]')
            ok('lock = Hello screen, app inert', page.evaluate("document.querySelector('.app').inert"))
            snap(page, 'Démo · verrouillé (Hello)')
            page.click('[data-v="hello"]')
            page.wait_for_selector('#vault', state='detached', timeout=5000)
            ok('simulated Hello opens', not page.evaluate("document.querySelector('.app').inert"))
            page.click('[data-vault-lock]')
            page.click('[data-to="pass"]')
            page.fill('#vp1', 'mauvaise phrase de passe')
            page.click('form[data-form="unlock"] button[type="submit"]')
            page.wait_for_function("document.querySelector('.vault-err').textContent.length > 0")
            ok('wrong passphrase refused', 'incorrecte' in page.inner_text('.vault-err'))
            page.fill('#vp1', PASS)
            page.click('form[data-form="unlock"] button[type="submit"]')
            page.wait_for_selector('#vault', state='detached', timeout=5000)
            page.reload()
            page.wait_for_selector('[data-v="hello"]')
            ok('reload = vault comes back locked', True)
            page.click('[data-v="hello"]')
            page.wait_for_selector('#vault', state='detached', timeout=5000)
            page.evaluate("localStorage.setItem('solva-idle-min', '0.05')")  # 3 s
            page.wait_for_selector('[data-v="hello"]', timeout=15000)
            ok('idle lock', 'activité' in page.inner_text('.vault-lead'))
            page.evaluate("localStorage.removeItem('solva-idle-min')")
            page.click('[data-v="hello"]')
            page.wait_for_selector('#vault', state='detached', timeout=5000)
            # sync
            page.click('[data-sync-open]')
            page.wait_for_selector('[data-sync="on"]')
            ok('sync panel with demo label', page.locator('.sync-demo').count() == 1)
            page.click('[data-sync="on"]')
            page.wait_for_selector('[data-sync-restore]', timeout=8000)
            ok('first sync shows a sample conflict', page.locator('[data-sync-restore]').count() == 1)
            ok('cloud badge = 1', page.get_attribute('[data-sync-open]', 'data-badge') == '1')
            snap(page, 'Démo · synchro + conflit')
            before = page.evaluate("state.firm.eng[0].stage")
            page.click('[data-sync-restore]')
            page.wait_for_function("!document.querySelector('[data-sync-restore]')")
            ok('restore takes the other version', page.evaluate("state.firm.eng[0].stage") == before + 1)
            page.click('[data-sync="close"]')
        else:
            page.click('[data-vault-lock]')
            page.wait_for_selector('form[data-form="create"]')
            snap(page, 'Démo · créer (nuit)')
            page.keyboard.press('Escape')
            page.evaluate("sessionStorage.clear()")
            page.reload()
            page.wait_for_selector('[data-sync-open]')
            page.click('[data-sync-open]')
            page.click('[data-sync="on"]')
            page.wait_for_selector('[data-sync-restore]', timeout=8000)
            snap(page, 'Démo · synchro (nuit)')
        ok(f'no JS errors ({theme}) {errs[:2]}', not errs)
        ctx.close()

    # phone in "desktop site" mode, and a normal phone
    for label, ua, mobile in (('Téléphone · site pour ordinateur', DESK_UA, False), ('Téléphone · normal', PHONE_UA, True)):
        ctx = b.new_context(viewport={'width': 412, 'height': 915}, screen={'width': 412, 'height': 915},
                            device_scale_factor=2.6, is_mobile=True, has_touch=True, user_agent=ua)
        page = ctx.new_page()
        page.add_init_script(f"Object.defineProperty(navigator, 'userAgentData', {{get: () => ({{mobile: {str(mobile).lower()}}})}})")
        page.goto(URL + '#/today')
        page.wait_for_selector('.nav a')
        w = page.evaluate('innerWidth')
        side = page.evaluate("getComputedStyle(document.querySelector('.app')).gridTemplateColumns.split(' ').length > 1")
        if mobile:
            ok(f'normal phone keeps the phone layout ({w}, side {side})', w < 500 and not side)
        else:
            ok(f'desktop site = 1560 px layout with side bar (innerWidth {w})', w == 1560 and side)
        page.wait_for_selector('#welcome')
        ok('entry offers the guided demo (play / step / skip)', page.locator('[data-welcome]').count() == 3)
        snap(page, label + ' · accueil démo')
        if mobile:  # autoplay: step 1 runs by itself, then Start over is at the top of the result
            page.click('[data-welcome="play"]')
            page.wait_for_selector('#tour .tour-clock')
            page.wait_for_function('state.tour && state.tour.i === 1', timeout=20000)
            ok('autoplay moves on by itself', True)
            ok('Start over sits on the result card', page.locator('#autoAnswer .again-top').is_visible())
            snap(page, label + ' · démo auto')
            page.click('#autoAnswer .again-top')
            ok('Start over leaves the tour and clears the result', page.evaluate('!state.tour && !state.auto.result'))
        else:
            page.click('[data-welcome="skip"]')
        ok('second visit in the tab: no welcome', (page.reload(), page.wait_for_selector('.nav a'), page.locator('#welcome').count() == 0)[2])
        snap(page, label)
        ctx.close()

    sp = b.new_page()
    sheet(sp, shots)
    sp.screenshot(path=str(OUT / 'demo-sheet.jpg'), type='jpeg', quality=60, full_page=True)
    b.close()

print('ALL OK' if not fails else f'{len(fails)} FAILED')
sys.exit(1 if fails else 0)
