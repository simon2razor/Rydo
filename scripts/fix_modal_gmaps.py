import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '''const gmapsWpts = [routeStartCoords, endCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng]))].map(pt => ${pt[0]},).join("|");
  const googleMapsUrl = https://www.google.com/maps/dir/?api=1&origin=,&destination=,&waypoints=&travelmode=driving;'''

new_code = '''const allPts = [routeStartCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng])), endCoords];
  const pathParts = allPts.slice(0, 8).map(pt => ${pt[0]},).join("/");
  const googleMapsUrl = https://www.google.com/maps/dir/,//;'''

content = content.replace(old_code, new_code)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal Maps link fixed")
