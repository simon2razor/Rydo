import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the join('|') with join('/') in the openInGoogleMaps function
content = re.sub(
    r'const waypoints = pois\.slice\(1, -1\)\.map\(p => \$\{p\.lat\},\$\{p\.lng\}\)\.join\("\|"\);',
    r'const waypoints = pois.slice(1, -1).map(p => ${p.lat},).join("/");',
    content
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replace executed")
