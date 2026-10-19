import re,sys
s=open('dist/index.html').read()
head=re.search(r'<head>(.*?)</head>',s,re.S).group(1)
body=re.search(r'<body>(.*?)</body>',s,re.S).group(1)
scripts=re.findall(r'<script type="module"[^>]*>.*?</script>',head,re.S)
styles=re.findall(r'<style[^>]*>.*?</style>',head,re.S)
links=re.findall(r'<link[^>]*>',head)
out='<title>BUBs Build &amp; Buy (Crane)</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+'\n'.join(links)+'\n'+'\n'.join(styles)+'\n'+body.strip()+'\n'+'\n'.join(scripts)+'\n'
open(sys.argv[1],'w').write(out)
print(len(out), len(scripts), len(styles), len(links))
