import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Just find the function and replace the specific block
start = content.find('function openInGoogleMaps(route) {')
end = content.find('}', start)
if start != -1 and end != -1:
    block = content[start:end]
    new_block = block.replace('.join("|")', '.join("/")')
    content = content[:start] + new_block + content[end:]
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Block replace executed")
else:
    print("Function not found")
