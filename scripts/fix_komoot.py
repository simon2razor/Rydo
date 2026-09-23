with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('https://www.komoot.com/import', 'https://www.komoot.com/upload')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed Komoot URL")
