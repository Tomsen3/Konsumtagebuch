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
3. Oben **entweder ein Fachteam** (Knöpfe, z. B. Ergotherapie) **oder einen Einsatzort** (Auswahlmenü, z. B. Station 2) wählen. »alle« zeigt alle zusammen. Eine Kombination (Fachteam *auf* Einsatzort) gibt es bewusst nicht: Ampelwerte stehen in Excel nur je Fachteam oder je Einsatzort (Entscheidung Tom, 08.10.2026).
4. **Zeitleiste** einstellen: Startmonat (»ab«) und Länge mit dem Schieberegler (1 bis 12 Monate) oder den Knöpfen 1 Monat / 3 Monate / 6 Monate / ganzes Jahr.
5. Auf eine **Kachel** im Jahresüberblick klicken → rechts neben der Zeitleiste steht, **wer an dem Tag weg ist**, und die Zeitleiste springt dorthin. Ein Klick **in die Zeitleiste** zeigt die ganze Woche (Mo–Fr) an dieser Stelle.
6. **Alle Urlaubswünsche nach Datum** ist eingeklappt; ein Klick klappt die Liste auf. Sie zeigt immer die oben gewählten Personen (ganzer Planungszeitraum) und hat ein Suchfeld für Namen.
7. Nach neuen Einträgen in Excel: hier **»Neu laden«**.
8. **Zurück-Taste des Browsers** (oder Alt+←): schließt zuerst »Wer ist weg«, sonst springt sie zum vorher gewählten Team. Erst beim ersten Team nach dem Laden verlässt sie die Seite.

Drucken: **»Drucken«** (A4 quer). Seite 1: Auswahl, Kennzahlen, Jahresüberblick und die gerade eingestellte Zeitleiste; danach die Liste aller Wünsche (immer ausgeklappt, ohne Suchfilter). Im Druckdialog ggf. »Hintergrundgrafiken« einschalten, damit die Farben erscheinen.

## Was die Seite zeigt
| Bereich | Inhalt |
|---|---|
| **Kopf** | Klinikfarben (dunkelblau) mit Logo, Dateiname und Stand der Excel-Datei |
| **Auswahl** | Fachteam-Knöpfe, Einsatzort-Menü; darunter eine Zeile, was gerade gezeigt wird (z. B. »Station 2 · alle Fachgruppen (3) · 5 Personen«) und ob für das Team eine Ampel hinterlegt ist |
| **Kennzahlen** | Wünsche (im Planungszeitraum), knappe Arbeitstage (gelb), enge Arbeitstage (rot), jeweils mit der ersten betroffenen Kalenderwoche |
| **Das Jahr auf einen Blick** | Kacheln: Spalte = Kalenderwoche, Zeile = Mo–Fr, Farbe = Ampel. Feiertage schraffiert, heute orange umrandet. Ein blauer Strich unter den Wochen zeigt den Ausschnitt der Zeitleiste |
| **Zeitleiste** | Oben »Team gesamt« als Ampel je Arbeitstag, darunter je Person ein Balken pro Wunsch (Datum im Balken, wenn Platz ist; sonst beim Darüberfahren). Unterkante gelb/rot, wenn der Wunsch in eine knappe/enge Zeit fällt. Bei kurzen Ausschnitten sind Wochenenden und Feiertage grau hinterlegt. Bei Auswahl eines **Einsatzorts** steht hinter jedem Namen die **Fachgruppe** (farbiges Plättchen) |
| **Wer ist weg** | rechts neben der Zeitleiste: Tag bzw. Woche, Ampel (»knapp · bis zu 3 von 7 weg«), Personen mit Initialen und Zeitraum |
| **Alle Urlaubswünsche nach Datum** | eingeklappt; Von, Bis, Name (bei Einsatzort mit Fachgruppe), Arbeitstage, Lage im Team; Suchfeld |

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
| `Urlaubswuensche_2027.xlsm` | gemeinsamer Ordner der Fachtherapien | Team + Leitung |
| `Teamansicht.html` | derselbe Ordner der Fachtherapien | Team + Leitung |
| `Urlaubsansicht.html` | eigener Ordner der Leitung | nur Leitung |

## Bekannte Grenzen
- Gleiche Grenzen wie die Leitungsansicht: Planungszeitraum 366 Tage ab Einstellungen B3, nur Wünsche (keine Genehmigungen), ganze Tage.
- Die Seite muss per Doppelklick im Browser geöffnet werden; in Vorschau-Fenstern (Teams, Outlook) funktionieren Dateidialoge nicht.
- Die Auswahl (Team, Startmonat und Länge der Zeitleiste) merkt sich der Browser lokal (`localStorage`, Schlüssel `teamansicht.state`), getrennt von der Leitungsansicht. Die Liste ist nach jedem Laden wieder eingeklappt.
- Die Markierung des gewählten Tags bzw. der Woche nutzt CSS `:has()` (Edge/Chrome ab 2022). In sehr alten Browsern fehlt nur diese Markierung.

## Für Änderungen (Technik)
- Quelltext: `ansicht/teamansicht.src.html` (Darstellung), `ansicht/kern.js` (Einlesen + Ampel, gemeinsam mit der Leitungsansicht).
- Bauen: im Ordner `urlaubsplanung/` → `python3 ansicht/baue_ansicht.py` erzeugt `Teamansicht.html` und `Urlaubsansicht.html`.
- Zurück-Taste: gemeinsamer Baustein in `ansicht/kern.js` (`verlaufStart` … siehe dort). Ein »Bildschirm« ist hier das gewählte Team; Startmonat und Länge der Zeitleiste legen keinen eigenen Eintrag an.
- `build(wb, { nurExcel: true })` sorgt dafür, dass im Browser gespeicherte Ampelwerte ignoriert werden.
- Prüfen mit einer **Testkopie** der Excel (keine echten Namen ins Repository, `.gitignore` schließt `*.xlsx`/`*.xlsm` aus).

## Änderungsprotokoll
| Datum | Änderung |
|---|---|
| 08.10.2026 | **Neue Oberfläche** (Mockup mit Tom abgestimmt): Klinikfarben; Fachteam-Knöpfe oder Einsatzort-Menü; Kennzahlen statt Lage-Satz; »Das Jahr auf einen Blick« als Kacheln (Woche × Mo–Fr) statt Monat × Tag; Zeitleiste mit Balken statt Kalender-Tabelle, Startmonat und Länge 1–12 Monate frei einstellbar; »Wer ist weg« fest neben der Zeitleiste statt Seitenfenster; Fachgruppe hinter den Namen bei Einsatzort-Auswahl; Liste eingeklappt, folgt der Auswahl, mit Suche. Daten, Ampel (`kern.js`), Datenschutz-Auswahl und automatisches Laden unverändert. |
| 08.10.2026 | Startseite: Hinweis auf Teams/SharePoint/OneDrive entfernt – Ablageort ist der gemeinsame Ordner der Fachtherapien (Rückmeldung Tom). |
| 08.10.2026 | Zurück-Taste schließt nicht mehr die Datei, sondern schließt das Seitenfenster bzw. springt zum vorher gewählten Team (Rückmeldung Tom). |
| 08.10.2026 | Teamansicht neu erstellt: Auswahl Fachteam/Einsatzort, Lage-Satz, Jahresübersicht, Kalender, Wunschliste, »Wer ist weg«, Druck A4 quer, automatisches Laden der zuletzt gezogenen Datei. |
