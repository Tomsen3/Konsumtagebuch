# Urlaubsplanung Kreativtherapie – Teamansicht (für die Kolleg:innen)

Stand: 08.10.2026 · Verantwortlich: Tom · gehört zu `Urlaubswuensche_2027.xlsx` (siehe `Dokumentation_Mein_Urlaub.md`)

## Worum geht es?
`Teamansicht.html` ist die Übersichtsseite für die Teamurlaubsplanung. Die Kolleg:innen sehen damit, **wer im eigenen Team wann Urlaub wünscht und wo es schon eng wird** – bevor sie selbst einen Wunsch eintragen.

Sie ist eine **eigene Datei**, getrennt von der Leitungsansicht `Urlaubsansicht.html`. Die Kolleg:innen bekommen nur die Teamansicht; die Leitungsansicht liegt nur bei der Leitung (Wunsch Tom, 08.10.2026).

- Liest **dieselbe Excel-Datei** wie die Leitungsansicht (`Urlaubswuensche_2027.xlsx` bzw. `.xlsm`) – alle bisher eingetragenen Daten erscheinen sofort.
- Läuft komplett lokal im Browser: kein Internet, kein Server, keine Daten werden verschickt. Die Excel-Datei wird nur gelesen.
- **Gleiche Ampel wie die Leitungsansicht** (gemeinsamer Programmteil `ansicht/kern.js`).

## Bedienung
1. `Teamansicht.html` doppelklicken (öffnet im Browser, Edge oder Chrome empfohlen).
2. Excel-Datei auswählen oder **besser einmal ins Fenster ziehen** (dann merkt sich die Seite die Datei, siehe unten »Automatisch laden«).
3. Oben das **Team** wählen: ein Fachteam (z. B. Ergotherapie) **oder** einen Einsatzort (z. B. Station 2, TK Sucht). »alle« zeigt alle zusammen.
4. Zeitraum und Raster (Wochen/Tage) bei Bedarf einstellen.
5. Auf einen Tag oder eine Woche klicken → rechts erscheint, **wer weg ist** (Name und Zeitraum).
6. Nach neuen Einträgen in Excel: Excel speichern, hier **»Neu laden«**.
7. **Zurück-Taste des Browsers** (oder Alt+←): schließt zuerst das Seitenfenster »Wer ist weg«, sonst springt sie zum vorher gewählten Team. Erst beim ersten Team nach dem Laden verlässt sie die Seite.

Drucken: **»Drucken (A4 quer)«**. Im Druckdialog ggf. »Hintergrundgrafiken« einschalten, damit die Farben erscheinen.

## Was die Seite zeigt
| Bereich | Inhalt |
|---|---|
| **Lage in einem Satz** | Wie viele Wünsche das Team hat und an wie vielen Arbeitstagen es knapp (gelb) oder eng (rot) ist |
| **Jahresübersicht** | Monat × Tag. Zahl = so viele aus dem Team haben Urlaub gewünscht. Farbe = Ampel |
| **Kalender** | Oberste Zeile »Team gesamt« mit Ampel, darunter je Person ihre Wünsche (Wochen: Zahl = Urlaubs-Arbeitstage, Tage: blau) |
| **Alle Urlaubswünsche nach Datum** | Von, Bis, Name, Arbeitstage, Lage im Team |

Ampelfarben (Wortlaut für die Kolleg:innen): grün = jemand weg, noch Platz · gelb = knapp, keiner mehr dazu · hellrot = eng · dunkelrot = niemand mehr da.

## Was die Seite bewusst NICHT zeigt (und warum)
| Nicht sichtbar | Grund |
|---|---|
| Bemerkung zum Wunsch | kann Privates enthalten (Arzttermin, Familie) |
| »Verschiebbar ja/etwas/nein« | dient der Leitung zum Klären von Engpässen, soll im Team keinen Druck erzeugen |
| Urlaubsanspruch und Rest | persönliche Personaldaten |
| Datenhinweise, Ampel-Einstellungen, Konfliktliste, Personen ohne Wunsch | Aufgaben der Leitung |
| Teilzeit-Arbeitstage | persönlich; sie fließen aber korrekt in die Ampel und die Arbeitstage ein |

**Wichtig zum Datenschutz:** Die Teamansicht ist eine *Darstellung*. Wer die Excel-Datei öffnen kann, sieht dort weiterhin alles, was in den sichtbaren Blättern steht. Deshalb blendet das Makro »PlanungFreigeben« die Blätter *Team* und *Einstellungen* aus (siehe `Dokumentation_Mein_Urlaub.md`). Echter Schutz entsteht nur über die Zugriffsrechte am Ablageort.

## Ampel – woher kommen die Werte?
- Die Teamansicht rechnet **genau wie die Leitungsansicht** (gleicher Code: `ansicht/kern.js`).
- Sie nimmt **nur die Werte aus Excel** (Blatt *Einstellungen*: Fachteams Spalten B–D, Einsatzorte Spalten I–K; leer = Standardregel bei Einsatzorten, keine Ampel bei Fachteams).
- Werte, die die Leitung in der Leitungsansicht nur **im Browser** ausprobiert hat, gelten hier **nicht** – sie liegen nur auf dem PC der Leitung. Damit die Kolleg:innen dieselbe Ampel sehen, müssen die endgültigen Werte (von Cora festgelegt) in **Excel → Einstellungen** stehen. In der Leitungsansicht gibt es dafür »Für Excel kopieren« (Reiter »Regeln & Ampel«).
- Fachteams ohne Ampelwerte: Die Seite sagt das ausdrücklich (»Für dieses Team ist keine Ampel hinterlegt«), grün heißt dann nur »jemand ist weg«.

## Automatisch laden
Die Excel-Datei **ganz ohne Klick** zu laden, erlaubt kein Browser: Eine per Doppelklick geöffnete HTML-Datei darf aus Sicherheitsgründen keine Dateien vom PC lesen, die der Mensch nicht ausgewählt hat. Das lässt sich in der Seite nicht abschalten, auch nicht, wenn die Excel immer am selben Ort liegt.

Das Machbare ist eingebaut (Edge/Chrome):
1. Die Excel-Datei **einmal per Ziehen-und-Ablegen** aus dem Explorer ins Fenster ziehen.
2. Beim nächsten Öffnen lädt die Seite die Datei **von selbst**, solange der Browser das Lesen noch erlaubt (gleiche Sitzung oder wenn der Browser »Bei jedem Besuch zulassen« angeboten hat und das gewählt wurde).
3. Sonst erscheint ein grüner Knopf **»Urlaubswuensche_2027.xlsx laden«** → ein Klick, ggf. »Zulassen«.

Wird die Datei über den Knopf »Excel-Datei auswählen« geöffnet, merkt sich die Seite nichts (Browser-Einschränkung).

Geprüfte und verworfene Alternativen: Datei per Pfad nachladen (`fetch`) wird von Edge/Chrome/Firefox bei lokalen Dateien blockiert; HTML aus SharePoint öffnen geht nicht, weil SharePoint .html-Dateien nur herunterlädt; HTA-Anwendung (mshta) ist veraltet und in Kliniken meist von der IT gesperrt.

## Ablage (Empfehlung)
| Datei | Wohin | Wer hat Zugriff |
|---|---|---|
| `Urlaubswuensche_2027.xlsm` | gemeinsamer Team-Ordner (Teams/SharePoint) | Team + Leitung |
| `Teamansicht.html` | derselbe Team-Ordner | Team + Leitung |
| `Urlaubsansicht.html` | eigener Ordner der Leitung | nur Leitung |

## Bekannte Grenzen
- Gleiche Grenzen wie die Leitungsansicht: Planungszeitraum 366 Tage ab Einstellungen B3, nur Wünsche (keine Genehmigungen), ganze Tage.
- Die Seite muss per Doppelklick im Browser geöffnet werden; in Vorschau-Fenstern (Teams, Outlook) funktionieren Dateidialoge nicht.
- Die Auswahl (Team, Raster) merkt sich der Browser lokal (`localStorage`, Schlüssel `teamansicht.state`) – getrennt von der Leitungsansicht.

## Für Änderungen (Technik)
- Quelltext: `ansicht/teamansicht.src.html` (Darstellung), `ansicht/kern.js` (Einlesen + Ampel, gemeinsam mit der Leitungsansicht).
- Bauen: im Ordner `urlaubsplanung/` → `python3 ansicht/baue_ansicht.py` erzeugt `Teamansicht.html` und `Urlaubsansicht.html`.
- Zurück-Taste: gemeinsamer Baustein in `ansicht/kern.js` (`verlaufStart` … siehe dort). Ein »Bildschirm« ist hier das gewählte Team; Zeitraum und Raster legen keinen eigenen Eintrag an.
- `build(wb, { nurExcel: true })` sorgt dafür, dass im Browser gespeicherte Ampelwerte ignoriert werden.
- Prüfen mit einer **Testkopie** der Excel (keine echten Namen ins Repository, `.gitignore` schließt `*.xlsx`/`*.xlsm` aus).

## Änderungsprotokoll
| Datum | Änderung |
|---|---|
| 08.10.2026 | Zurück-Taste schließt nicht mehr die Datei, sondern schließt das Seitenfenster bzw. springt zum vorher gewählten Team (Rückmeldung Tom). |
| 08.10.2026 | Teamansicht neu erstellt: Auswahl Fachteam/Einsatzort, Lage-Satz, Jahresübersicht, Kalender, Wunschliste, »Wer ist weg«, Druck A4 quer, automatisches Laden der zuletzt gezogenen Datei. |
