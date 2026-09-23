import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix openInGoogleMaps (it currently looks like const origin = ${pois[0].lat},; which is broken)
# We will use regex to find the broken function and replace it with the correct one.
bad_func_pattern = r'function openInGoogleMaps\(route\) \{.*?window\.open\(url, "_blank"\);\n\}'
correct_func = '''function openInGoogleMaps(route) {
  const r = route || window._lastRoute;
  if (!r || !r.pois || !r.pois.length) return;
  const pois = r.pois;
  const origin = `${pois[0].lat},${pois[0].lng}`;
  const dest = `${pois[pois.length - 1].lat},${pois[pois.length - 1].lng}`;
  const wpts = pois.slice(1, -1).slice(0, 8).map(p => `${p.lat},${p.lng}`).join("|");
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${encodeURIComponent(wpts)}&travelmode=driving`;
  window.open(url, "_blank");
}'''
content = re.sub(bad_func_pattern, correct_func, content, flags=re.DOTALL)

# 2. Fix the Modal link which is also broken!
# Let's find where the modal URL is. It probably says const googleMapsUrl = https://www.google.com/maps/dir/?api=1&origin=&destination=&waypoints=&travelmode=driving;
bad_modal_pattern = r'const allPts = \[routeStartCoords.*?travelmode=driving;'
correct_modal = '''const allPts = [routeStartCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng])), endCoords];
  const gmapsWpts = allPts.slice(1, -1).slice(0, 8).map(pt => `${pt[0]},${pt[1]}`).join("|");
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${allPts[0][0]},${allPts[0][1]}&destination=${allPts[allPts.length-1][0]},${allPts[allPts.length-1][1]}&waypoints=${encodeURIComponent(gmapsWpts)}&travelmode=driving`;'''
content = re.sub(bad_modal_pattern, correct_modal, content, flags=re.DOTALL)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed JS syntax errors")
