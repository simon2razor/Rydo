with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.join("|");', '.join("/");')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replace executed using literal string")
