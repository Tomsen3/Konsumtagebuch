# Mein Konsumtagebuch

Eine offlinefaehige, statische Progressive Web App fuer die persoenliche Patientendokumentation.

## Datenschutz

- Eintraege, Wochenziele und optionale Profildaten werden ausschliesslich in `localStorage` des verwendeten Browsers gespeichert.
- Es gibt kein Benutzerkonto, keine Datenbank, kein Tracking und keine externen Bibliotheken.
- Die Content Security Policy erlaubt Netzwerkverbindungen nur zur eigenen Herkunft.
- Eine JSON-Sicherung inklusive Profildaten kann lokal exportiert und wieder importiert werden.

Die lokalen Daten sowie exportierte Sicherungen und PDFs sind nicht zusaetzlich verschluesselt. Das Geraet sollte mit einer Displaysperre geschuetzt und nicht gemeinsam verwendet werden. Das Loeschen von Browserdaten oder das Deinstallieren der App kann lokale Eintraege entfernen. Deshalb sollte regelmaessig eine geschuetzt aufbewahrte Sicherung exportiert werden.

## GitHub Pages

1. Dieses Verzeichnis als GitHub-Repository veroeffentlichen.
2. In GitHub unter **Settings > Pages** als Quelle **GitHub Actions** waehlen.
3. Nach jedem Push auf `main` wird die App automatisch bereitgestellt.

## Neue Version veroeffentlichen

1. Versionsnummer in `app.js`, `sw.js`, `version.json` und der Anzeige in `index.html` erhoehen.
2. Aenderungen nach `main` pushen.
3. Nutzer koennen unter **Daten & App > Auf neue Version pruefen** aktualisieren.

App-Dateien liegen im Service-Worker-Cache, Patientendaten separat in `localStorage`. Ein App-Update ueberschreibt daher keine gespeicherten Eintraege.

## Lokal testen

Die App muss ueber HTTP(S) geoeffnet werden, damit der Service Worker funktioniert:

```powershell
python -m http.server 8080
```

Dann `http://localhost:8080` aufrufen.
