with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const waypoints = pois.slice(1, -1).map(p => ${p.lat},).join("/");',
    'const waypoints = pois.slice(1, -1).slice(0, 8).map(p => ${p.lat},).join("/");'
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Limited waypoints")
