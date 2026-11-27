import sys
LIVE='live' in sys.argv
MAN='\n<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0f1430"><link rel="apple-touch-icon" href="icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Csillagkör">'
FB=('\n<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>\n<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>\n<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>') if LIVE else ''
css=open('base.css',encoding='utf8').read()+open('extra.css',encoding='utf8').read()
head='''<!DOCTYPE html>
<html lang="hu"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Csillagkör</title>
<meta name="description" content="Mit súgnak a csillagok a kapcsolataidról? Nézd meg, hogyan illesz a párodhoz, a családodhoz és a barátaidhoz.">
<meta property="og:title" content="Csillagkör – a kapcsolataid a csillagok szerint">
<meta property="og:description" content="Két születésnap, és megmutatjuk, mit súgnak a csillagok rólatok.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus&family=Nunito+Sans:wght@400;600;700&display=swap">
<style>'''
head=head.replace('<title>Csillagkör</title>','<title>Csillagkör</title>'+(MAN if LIVE else ''),1)
html=head+css+'</style></head><body>\n'+open('body.html',encoding='utf8').read()+open('places.json.html',encoding='utf8').read()+'\n<script src="https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js"></script>'+FB+'\n<script>\n{\n'+open('lib.js',encoding='utf8').read()+'\n'+open('daily.js',encoding='utf8').read()+'\n'+open('places.js',encoding='utf8').read()+'\n'+open('app.js',encoding='utf8').read()+'\n}\n</script>\n</body></html>'
open(('dist/index.html' if LIVE else 'index.html'),'w',encoding='utf8').write(html)
