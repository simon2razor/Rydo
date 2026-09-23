with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will just replace the exact line using regex or a simpler replace
# Let's target the exact string: .join("|"); in combination with waypoints
content = content.replace('waypoints = pois.slice(1, -1).map(p => ${p.lat},).join("|");', 'waypoints = pois.slice(1, -1).map(p => ${p.lat},).join("/");')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replace executed")
