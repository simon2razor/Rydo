# Rydo – Alpine Passes & Adventure Routes

Rydo ist eine weltweite Abenteuer- und Pässe-Datenbank für Motorrad, Bikepacking und Wohnmobil. Die Progressive Web App (PWA) bietet kuratierte Routen, Hochgebirgspässe, einen Reiseplaner und GPX-Tracks.

## Features
- **Umfangreiche Datenbank:** 315 Gebirgspässe, 159 kuratierte Touren.
- **Offline-fähig:** Als PWA installierbar und zu 100% offline nutzbar.
- **Zielgruppen:** Motorradfahrer, Bikepacker, Campervans, Vanlife und Overlanding.
- **Planung:** Reiseplaner mit GPX-Unterstützung und Kurviger-Integration.

## Projektstruktur
- `index.html` - Hauptseite der App
- `css/` - Stylesheets
- `js/` - JavaScript Logik
- `data/` - JSON Daten (Pässe, Touren etc.)
- `assets/` - Bilder und Icons
- `scripts/` - Python-Hilfsskripte (für Datenverarbeitung und Wartung)
- `manifest.json` & `sw.js` - Service Worker und Manifest für die PWA-Funktionalität

## Lokale Entwicklung
Um die App lokal zu testen, kann einfach ein lokaler Webserver gestartet werden, z.B. mit Python:
```bash
python -m http.server 8000
```
Anschließend die App im Browser unter `http://localhost:8000` öffnen.
