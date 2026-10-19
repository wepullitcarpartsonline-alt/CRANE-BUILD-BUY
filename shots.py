from playwright.sync_api import sync_playwright
import os
url='file://'+os.path.abspath('dist/index.html')
shots=[('hero0','top',0),('hero1','top',0.45),('eng0','engine',0.02),('eng3','engine',0.5),('eng4','engine',0.66),('eng5','engine',0.82),('eng6','engine',0.99),('turn','turn',0.3),('mkt4','market',0.95),('tr2','trailer',0.5),('tr3','trailer',0.7),('fly','flywheel',0.3),('status','status',0)]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,vp in [('d',{'width':1440,'height':900}),('m',{'width':390,'height':844})]:
        pg=b.new_page(viewport=vp, device_scale_factor=1)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.goto(url); pg.wait_for_timeout(1500)
        for sn,id,f in shots:
            if name=='m' and sn not in ('hero0','eng4','eng6','mkt4','tr3','status'): continue
            pg.evaluate("""([id,f])=>{const el=document.getElementById(id);const top=el.getBoundingClientRect().top+scrollY;const span=Math.max(0,el.offsetHeight-innerHeight);window.scrollTo(0,top+f*span)}""",[id,f])
            pg.wait_for_timeout(900)
            pg.screenshot(path=f'shots/{name}-{sn}.png')
        sw=pg.evaluate("document.documentElement.scrollWidth"); print(name,'scrollWidth',sw,'errors',errs[:5])
    b.close()
