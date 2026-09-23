with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const gmapsWpts = [routeStartCoords, endCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng]))].map(pt => `${pt[0]},${pt[1]}`).join("/");',
    'const gmapsWpts = [routeStartCoords, endCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng]))].map(pt => `${pt[0]},${pt[1]}`).join("|");'
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted line 6518")
