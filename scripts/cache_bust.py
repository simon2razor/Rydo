with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('src="js/app.js"', 'src="js/app.js?v=2"')
content = content.replace('src="js/data.js"', 'src="js/data.js?v=2"')
content = content.replace('src="js/routeTracks.js"', 'src="js/routeTracks.js?v=2"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Cache busted in index.html")
