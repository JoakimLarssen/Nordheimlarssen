"""Offline Chromium checks. Uses set_content; does not test a deployed origin."""
from pathlib import Path
import json
import os
import shutil
import tempfile
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('QA_OUTPUT') or tempfile.mkdtemp(prefix='jnl-qa-'))
pages=[ROOT/p for p in ['404.html','about/index.html','ctf/index.html','index.html','portfolio/index.html','uses/index.html','writing/index.html']]
results=[]
failures=[]

def check(label, ok, detail=''):
    results.append({'check':label,'passed':bool(ok),'detail':detail})
    if not ok: failures.append(label+' '+str(detail))

def inline(path, scripting=True):
    s=path.read_text()
    s=s.replace('<link rel="stylesheet" href="/site.css">','<style>'+ (ROOT/'site.css').read_text()+'</style>')
    s=s.replace('<script src="/theme.js"></script>','<script>'+ (ROOT/'theme.js').read_text()+'</script>' if scripting else '')
    s=s.replace('<script src="/site.js" defer></script>','')
    return s.replace('</body>','<script>'+ (ROOT/'site.js').read_text()+'</script></body>' if scripting else '</body>')

routes={('/' if p==ROOT/'index.html' else '/'+str(p.relative_to(ROOT)).removesuffix('/index.html')):p for p in pages}
legacy=set(['/cv','/cv.pdf','/thesis.pdf','/networking-final-project.pdf','/og.png']+[f'/writing/{n}' for n in ['does-ai-write-insecure-code','marking-the-machine','the-economics-of-a-zero-day','the-power-grid-is-the-battlefield','too-dangerous-to-release']]+[f'/images/ctf/nns-2026/nns-ctf-2026-{n}.png' for n in ['scoreboard','firstblood-keyboard-encryptor','firstblood-php-passion','firstblood-small-guy','firstblood-crypto-party-2','firstblood-feedback']])
for path in pages:
    label=str(path.relative_to(ROOT)); soup=BeautifulSoup(path.read_text(),'html.parser')
    ids=[x['id'] for x in soup.select('[id]')]
    check(label+': unique IDs', len(ids)==len(set(ids)))
    check(label+': one H1', len(soup.find_all('h1'))==1)
    check(label+': language',soup.html.get('lang')=='en')
    check(label+': metadata', bool(soup.title and soup.select_one('meta[name=description]') and soup.select_one('link[rel=canonical]')))
    check(label+': skip link', bool(soup.select_one('a[href="#main"]') and soup.select_one('#main')))
    for a in soup.select('a[href]'):
        u=urlsplit(a['href'])
        if u.scheme or u.netloc: continue
        dest=u.path or ('/' if label=='index.html' else '/'+label.removesuffix('/index.html'))
        known=dest in routes or dest in legacy
        if dest in routes and u.fragment:
            target=BeautifulSoup(routes[dest].read_text(),'html.parser')
            known=bool(target.find(id=unquote(u.fragment)))
        check(label+': local link '+a['href'],known,'Legacy routes checked against repository inventory, not downloaded files.' if dest in legacy else '')
    for img in soup.find_all('img'):check(label+': image alt '+img.get('src',''),img.has_attr('alt'))
    for a in soup.select('a[target="_blank"]'):check(label+': external rel', 'noopener' in a.get('rel',[]))

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
    for path in pages:
        for width in [320,390,768,1440]:
            for theme in ['light','dark']:
                ctx=browser.new_context(viewport={'width':width,'height':900},color_scheme=theme)
                page=ctx.new_page(); errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
                page.set_content(inline(path)); page.wait_for_timeout(20)
                label=f'{path.relative_to(ROOT)} {width}px {theme}'
                size=page.evaluate('({doc:document.documentElement.scrollWidth,view:innerWidth})')
                check(label+': no horizontal overflow',size['doc']<=size['view'],size)
                check(label+': no script exceptions',not errors,errors)
                check(label+': expected theme',page.locator('html').get_attribute('data-theme')==theme)
                check(label+': meaningful H1 visible',page.locator('h1').is_visible())
                ctx.close()
    ctx=browser.new_context(viewport={'width':390,'height':844},color_scheme='light',reduced_motion='reduce')
    page=ctx.new_page();page.set_content(inline(ROOT/'portfolio/index.html'))
    check('Portfolio: all visible initially',page.locator('.case:visible').count()==3)
    page.locator('[data-filter=research]').click()
    check('Portfolio: research filter',page.locator('.case:visible').count()==1 and page.locator('#saif').is_visible())
    check('Portfolio: live count',page.locator('[data-filter-count]').inner_text()=='1 project')
    check('Portfolio: pressed state',page.locator('[data-filter=research]').get_attribute('aria-pressed')=='true')
    page.evaluate('window.location.hash="riposte"');page.wait_for_timeout(70)
    check('Portfolio: hash reveals hidden project',page.locator('#riposte').is_visible() and page.locator('[data-filter=all]').get_attribute('aria-pressed')=='true')
    page.locator('[data-filter=software]').click()
    check('Portfolio: software filter',page.locator('.case:visible').count()==2 and not page.locator('#saif').is_visible())
    page.locator('[data-filter=all]').click()
    check('Portfolio: reset',page.locator('.case:visible').count()==3)
    toggle=page.locator('[data-theme-toggle]'); toggle.click()
    check('Theme: toggle dark',page.locator('html').get_attribute('data-theme')=='dark' and toggle.get_attribute('aria-pressed')=='true')
    check('Theme: accessible label',toggle.get_attribute('aria-label')=='Switch to light theme')
    check('Theme: browser chrome meta',page.locator('meta[name=theme-color]').get_attribute('content')=='#181a18')
    toggle.click();check('Theme: toggle light',page.locator('html').get_attribute('data-theme')=='light')
    check('Motion: transition disabled',page.locator('.arrow').first.evaluate('el=>getComputedStyle(el).transitionDuration')=='0s')
    page.set_content(inline(ROOT/'about/index.html'))
    check('Email: mailto fallback',page.locator('a[href="mailto:joakimnordheimlarssen@gmail.com"]').count()>0)
    check('Email: unavailable clipboard button hidden',not page.locator('[data-copy-email]').is_visible())
    detail=page.locator('details').first; detail.locator('summary').click();check('Education: native details opens',detail.get_attribute('open') is not None)
    page.keyboard.press('Tab');check('Keyboard: visible focus target',page.evaluate('document.activeElement!==document.body'))
    ctx.close()
    for path in pages:
        ctx=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844});page=ctx.new_page();page.set_content(inline(path,False))
        check(str(path.relative_to(ROOT))+': no-JS heading',page.locator('h1').is_visible())
        check(str(path.relative_to(ROOT))+': no-JS navigation',page.locator('.site-nav').is_visible())
        if path==ROOT/'portfolio/index.html':
            check('No-JS portfolio: all projects visible',page.locator('.case:visible').count()==3)
            check('No-JS portfolio: filters hidden',not page.locator('[data-filters]').is_visible())
        ctx.close()
    browser.close()

def luminance(h):
    c=[int(h[i:i+2],16)/255 for i in [1,3,5]]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]
    return .2126*v[0]+.7152*v[1]+.0722*v[2]
for mode,foregrounds,backgrounds in [('light',['#242521','#55574e','#64675b'],['#f7f7f2','#ffffff','#e4eaf4','#eeeaf6','#e6ebda']),('dark',['#f1f2e9','#c1c5b8','#a0a695'],['#181a18','#20231f','#26303d','#302b3d','#29352a'])]:
    for fg in foregrounds:
        for bg in backgrounds:
            a,b=sorted([luminance(fg),luminance(bg)])
            ratio=(b+.05)/(a+.05)
            check(f'Contrast {mode} {fg} on {bg}',ratio>=4.5,round(ratio,2))
report={'summary':{'passed':sum(r['passed'] for r in results),'failed':len(failures),'viewport_theme_combinations':len(pages)*8},'limits':['Offline Chromium with inline CSS and JS; no live deployment or HTTP routing tests.','Legacy URLs checked against repository inventory, not rendered or fetched locally.','System-font rendering only; no Safari/Firefox, full WCAG audit, Lighthouse or axe scan.','Clipboard permission success and persistent storage/cross-tab behavior not exercised on a secure origin.','Contrast checks cover defined text/background tokens, not every possible composited pixel.'],'checks':results}
OUT.mkdir(exist_ok=True);(OUT/'checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report['summary']));print('\n'.join(failures))
if failures:raise SystemExit(1)
