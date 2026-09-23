with open('sw.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('rydo-cache-v31', 'rydo-cache-v32')

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Cache bumped")
