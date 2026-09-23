with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix openInGoogleMaps (around line 3562)
# We will use regex to replace the function body
import re
new_func = '''function openInGoogleMaps(route) {
  const r = route || window._lastRoute;
  if (!r || !r.pois || !r.pois.length) return;
  const pois = r.pois;
  const origin = ${pois[0].lat},;
  const dest = ${pois[pois.length - 1].lat},;
  const wpts = pois.slice(1, -1).slice(0, 8).map(p => ${p.lat},).join("|");
  const url = https://www.google.com/maps/dir/?api=1&origin=&destination=&waypoints=&travelmode=driving;
  window.open(url, "_blank");
}'''
content = re.sub(r'function openInGoogleMaps\(route\) \{.*?window\.open\(url, "_blank"\);\n\}', new_func, content, flags=re.DOTALL)

# 2. Fix the Modal gmaps link (around line 6518)
new_modal = '''const allPts = [routeStartCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng])), endCoords];
  const gmapsWpts = allPts.slice(1, -1).slice(0, 8).map(pt => ${pt[0]},).join("|");
  const googleMapsUrl = https://www.google.com/maps/dir/?api=1&origin=,&destination=,&waypoints=&travelmode=driving;'''
content = re.sub(r'const allPts = \[routeStartCoords.*?travelmode=driving;', new_modal, content, flags=re.DOTALL)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied final Google Maps API format")
