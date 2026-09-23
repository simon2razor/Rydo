with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'openInGoogleMaps' in line or 'maps/dir' in line:
        for j in range(-2, 10):
            if 0 <= i+j < len(lines):
                print(f'{i+j}: {lines[i+j].encode("ascii", "ignore").decode("ascii").rstrip()}')
        print('---')
