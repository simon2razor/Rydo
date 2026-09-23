import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's replace the whole gmapsWpts block
bad_block_pattern = r'const gmapsWpts = \[routeStartCoords, endCoords, \.\.\.\(returnLoop\.passes\.map\(p => \[p\.lat, p\.lng\]\)\)\].*?travelmode=driving`;'

correct_block = '''const allPts = [routeStartCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng])), endCoords];
  const gmapsWpts = allPts.slice(1, -1).slice(0, 8).map(pt => `${pt[0]},${pt[1]}`).join("|");
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${allPts[0][0]},${allPts[0][1]}&destination=${allPts[allPts.length-1][0]},${allPts[allPts.length-1][1]}&waypoints=${encodeURIComponent(gmapsWpts)}&travelmode=driving`;'''

new_content = re.sub(bad_block_pattern, correct_block, content, flags=re.DOTALL)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Modal link updated")
