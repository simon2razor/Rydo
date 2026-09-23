with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()
sw = sw.replace('rydo-cache-v32', 'rydo-cache-v33')
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('?v=2', '?v=3')
if '?v=3' not in html:
    # Just in case it wasn't there
    html = html.replace('src="js/app.js"', 'src="js/app.js?v=3"')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Bumped cache to v33 and v=3")
