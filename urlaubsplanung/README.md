# Urlaubswünsche Kreativtherapie – Jahresplanung

Werkzeug für ca. 35 Therapeut:innen aus fünf Fachrichtungen (Ergo-, Musik-, Bewegungs-, Physio- und Theatertherapie),
die auf mehreren Stationen arbeiten. Alle tragen ihre **Urlaubswünsche** für das Jahr ein, mehrere pro Person.
Eine Ansicht zeigt per Ampel, wo es **im Fachteam** oder **auf einer Station** eng wird, und listet die
Konflikte mit Namen, Zeitraum und Umfang auf, als Grundlage für Absprachen und für die Leitung.

Das ist **keine Genehmigung**. Die abgestimmten Wünsche überträgt die Planung anschließend ins ATOSS.

## Dateien

| Datei | Für wen | Zweck |
|---|---|---|
| `Urlaubswuensche_Kreativtherapie.xlsx` | alle | **Eingabe.** Wünsche eintragen, Team und Regeln pflegen. Enthält Beispieldaten (grau) |
| `Urlaubsansicht.html` | alle, v. a. Leitung | **Auswertung.** Kalender, Ampel, Filter, Konfliktliste. Liest die Excel-Datei nur |
| `erzeuge_urlaubsplaner.py` | Technik | Erzeugt die Excel-Datei neu (z. B. mit mehr Zeilen oder neuem Startjahr) |
| `baue_ansicht.py` | Technik | Baut `Urlaubsansicht.html` aus `ansicht/urlaubsansicht.src.html` + SheetJS |
| `ansicht/` | Technik | Quelltext der Ansicht und eingebettete Bibliothek (`vendor/`, Lizenz Apache 2.0) |

Die Bedienung für das Team steht im Blatt **»Anleitung«** der Excel-Datei.

## Ablauf

1. Verantwortliche Person richtet die Excel-Datei ein (Blätter »Einstellungen« und »Team«, Beispieldaten löschen).
2. Beide Dateien in denselben Ordner legen, z. B. Teams/SharePoint der Klinik.
3. Alle tragen bis zu einem Stichtag ihre Wünsche ins Blatt »Wünsche« ein, eine Zeile je Urlaubsblock.
4. Jede:r kann jederzeit `Urlaubsansicht.html` öffnen, die Excel-Datei auswählen und Engpässe sehen.
5. Die Leitung nutzt den Reiter **Konflikte**: Wer ist betroffen, wann, wie stark, wer ist verschiebbar.
   Die Liste lässt sich drucken oder für eine E-Mail kopieren.
6. Nach den Absprachen überträgt die Planung die Wünsche ins ATOSS und trägt das Datum in Spalte J ein (die Zeile wird grau).

## Ampel

Gezählt wird **pro Arbeitstag** (Mo–Fr ohne Feiertage), wie viele Mitglieder einer Station bzw. eines Fachteams einen
Wunsch eingetragen haben. Wer auf mehreren Stationen arbeitet, zählt auf jeder davon. Im Blatt »Einstellungen« steht
pro Station und Fachteam, **ab wie vielen gleichzeitig Abwesenden** eine Stufe gilt.

| Stufe | Bedeutung |
|---|---|
| Hellgrün | jemand ist weg, unkritisch |
| Gelb | Achtung, keiner mehr dazu |
| Hellrot | Vorwarnstufe, Station bzw. Team deutlich ausgedünnt |
| Dunkelrot | alle weg bzw. nicht vertretbar |

**Standardregel für Stationen** (gilt, wenn die Felder in »Einstellungen« leer sind), abgeleitet aus den Vorgaben
vom 06.10.2026:

- 1 Person weg = kein Warnsignal
- Gelb ab 2 Personen weg
- Hellrot, wenn nur noch 2 Personen da sind, **nur bei Stationen ab 4 Therapeut:innen**
  (Beispiel: 4er-Station, 2 weg → hellrot; 3er-Station, 2 weg → gelb)
- Dunkelrot, wenn alle weg sind

Eine eigene Zahl im Feld überschreibt die Regel für diese Station. Die Regel steht als Konstante `STANDARD` in
`ansicht/urlaubsansicht.src.html` und kann dort zentral geändert werden. Danach `python3 baue_ansicht.py` ausführen.

**Fachteams** bekommen nur dann gelb, hellrot oder dunkelrot, wenn Werte eingetragen sind, denn die Teamgrößen sind
sehr unterschiedlich.

**Konflikt** = zusammenhängende Arbeitstage, an denen eine Station oder ein Fachteam mindestens gelb ist. Pro Konflikt
zeigt die Ansicht: Bereich, Zeitraum, Anzahl Arbeitstage, Spitze („3 von 4 weg, noch 1 da“) mit Datum, alle
Beteiligten mit ihren eingetragenen Wünschen, Bemerkung und Flexibilität. Außerdem einen Vorschlag, wen man zuerst
ansprechen sollte (die als „verschiebbar: ja/etwas“ markierten Personen).

## Entscheidungen und Begründungen

| Frage | Entscheidung | Begründung |
|---|---|---|
| Kein Server, keine externe IT | Excel-Datei + lokale HTML-Datei, keine Makros | Läuft mit Bordmitteln jedes Klinik-PCs; Makros werden oft blockiert |
| Eine oder zwei Dateien? | Zwei: Excel = Eingabe, HTML = Ansicht | Eingabe bleibt einfach und stabil (wenige Formeln, gut für gleichzeitiges Bearbeiten in Excel Online). Die Ansicht kann filtern und Konflikte benennen, was Excel nur mit sehr schweren Formeln könnte |
| Schreibt die HTML-Datei zurück? | Nein, nur lesen | Ohne Server kann ein Browser keine gemeinsame Datei sicher beschreiben; so gibt es keine Datenverluste |
| Mehrere Wünsche pro Person | Eine Zeile je Urlaubsblock, Wunsch-Nr. automatisch | Jahresplanung besteht aus mehreren Blöcken |
| Status (genehmigt o. ä.) | Entfällt; nur »Verschiebbar?« (ja/etwas/nein) und »In ATOSS übertragen am« | Genehmigt wird im ATOSS. Die Flexibilitätsangabe hilft der Absprache |
| Alle Wünsche zählen | Ja, auch bereits übertragene | Engpässe sollen vollständig sichtbar sein |
| Feiertage | Gesetzliche Feiertage Baden-Württemberg vorbelegt (inkl. Heilige Drei Könige, Fronleichnam, Allerheiligen), Schließtage manuell | Klinik liegt in Baden-Württemberg; Heiligabend/Silvester sind keine gesetzlichen Feiertage |
| Bibliothek zum Lesen von Excel | SheetJS 0.18.5 (Community-Version), eingebettet | Funktioniert ohne Internet. Bekannte Schwachstellen betreffen nur absichtlich manipulierte Dateien, hier liest man nur die eigene Teamdatei |

## Technische Hinweise

- **Layout fest:** Die Ansicht liest Blätter per Name und feste Spalten/Startzeilen (Konstante `LAYOUT` in
  `ansicht/urlaubsansicht.src.html`). In Excel deshalb **keine Spalten einfügen/löschen**; Zeilen nur leeren, nicht löschen.
  Die Ansicht liest nur Eingabezellen, keine Formelergebnisse.
- **Neu laden:** In Edge/Chrome merkt sich die Ansicht die zuletzt gewählte Datei (Button »Neu laden« / »wieder laden«).
  In Firefox muss man die Datei jedes Mal neu auswählen.
- **SharePoint:** Eine HTML-Datei öffnet SharePoint im Browser nicht direkt. Entweder den Ordner per OneDrive
  synchronisieren und `Urlaubsansicht.html` im Explorer doppelklicken, oder die HTML-Datei einmal herunterladen.
  Die Excel-Datei dann aus dem synchronisierten Ordner auswählen.
- **Kapazität Excel:** 60 Personen, 10 Fachrichtungen, 30 Stationen, 600 Wunschzeilen, 4 Stationen je Person.
  Mehr: Konstanten oben in `erzeuge_urlaubsplaner.py` ändern, `python3 erzeuge_urlaubsplaner.py [JJJJ-MM-TT]`
  ausführen, Eingaben aus der alten Datei herüberkopieren. Die Ansicht liest automatisch alle befüllten Zeilen.
- **Neues Jahr:** Excel-Datei kopieren, Startdatum (Einstellungen B3) ändern, alte Wünsche leeren, Feiertage aktualisieren.
- **Voraussetzungen für die Skripte:** Python 3 mit `openpyxl` und `python-dateutil`.

## Echte Arbeitsdatei mit Namen erzeugen

Die Datei `Urlaubswuensche_Kreativtherapie.xlsx` im Repository ist eine **Vorlage mit erfundenen Beispieldaten**.
Die echte Arbeitsdatei mit den Namen des Teams wird lokal erzeugt und **nicht** ins Repository gelegt:

```
python3 erzeuge_urlaubsplaner.py --namen team_namen.txt --aus Urlaubswuensche_2027.xlsx
```

`team_namen.txt` enthält eine Person pro Zeile (z. B. `Nachname, Vorname`). Die Datei enthält dann keine
Beispieldaten, und die Ampel-Werte der Fachteams sind leer, damit die Leitung sie selbst festlegt.
Fachrichtungen und Stationen trägt die verantwortliche Person danach im Blatt »Team« ein.
`team_namen*.txt` und `Urlaubswuensche_20*.xlsx` stehen in `.gitignore`.

## Datenschutz

Urlaubszeiten sind personenbezogene Daten. Beide Dateien nur im Klinik-System ablegen und den Zugriff auf das Team
beschränken. Die Ansicht verschickt keine Daten, alles bleibt im Browser des jeweiligen Rechners. Ob ein solcher
gemeinsamer Plan mit dem Personalrat/Betriebsrat abzustimmen ist, sollte die Leitung klären.
