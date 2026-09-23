import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the openInGoogleMaps function implementation
old_func = '''function openInGoogleMaps(route) {
  const r = route || window._lastRoute;
  if (!r || !r.pois || !r.pois.length) return;
  const pois = r.pois;
  const origin = ${pois[0].lat},;
  const dest = ${pois[pois.length - 1].lat},;
  const waypoints = pois.slice(1, -1).map(p => ${p.lat},).join("|");
  const url = https://www.google.com/maps/dir///;
  window.open(url, "_blank");
}'''

new_func = '''function openInGoogleMaps(route) {
  const r = route || window._lastRoute;
  if (!r || !r.pois || !r.pois.length) return;
  
  const pois = r.pois;
  const origin = ${pois[0].lat},;
  const dest = ${pois[pois.length - 1].lat},;
  const waypoints = pois.slice(1, -1).map(p => ${p.lat},).join("/");
  
  const url = https://www.google.com/maps/dir///;
  window.open(url, "_blank");
}'''

content = content.replace(old_func, new_func)

# There is also line 6519: const googleMapsUrl = https://www.google.com/maps/dir/?api=1&origin=,&destination=,&waypoints=&travelmode=driving;
# Wait, let's make sure it handles both. The api=1 URL with waypoints=| is correct for query parameter format. The screenshot is definitely path format, which failed due to | instead of /.

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed!")
