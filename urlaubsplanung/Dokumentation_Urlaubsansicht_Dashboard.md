# Urlaubsansicht Kreativtherapie – Dashboard

Stand: 06.10.2026 · Verantwortlich: Tom · gehört zu `Urlaubswuensche_2027.xlsx` (siehe `Dokumentation_Mein_Urlaub.md`)

## Worum geht es?
`Urlaubsansicht.html` ist eine **einzelne Datei**, die man per Doppelklick im Browser (Edge/Chrome/Firefox) öffnet. Sie liest die Excel-Datei mit den Urlaubswünschen und zeigt auf einen Blick, **wann es eng wird, wer fehlt und wer noch nichts eingetragen hat**.

- Läuft **komplett lokal**: kein Internet nötig, kein Server, **es werden keine Daten verschickt**.
- Die Excel-Datei wird **nur gelesen**, nie verändert.
- Liest `.xlsx` (Fassung A) und `.xlsm` (Makro-Fassung B).
- Zeigt **nur Wünsche**, keine Genehmigungen.

## Bedienung in 5 Schritten
1. `Urlaubsansicht.html` doppelklicken (öffnet im Browser).
2. **»Excel-Datei auswählen«** → `Urlaubswuensche_2027.xlsx` (bzw. `.xlsm`) wählen oder Datei ins Fenster ziehen.
   Liegt die Datei in Teams/SharePoint: über den synchronisierten OneDrive-Ordner im Explorer auswählen.
3. Registerkarte **Dashboard** ansehen (Standard).
4. Mit den **Filtern** (Fachrichtung, Station, Name, Zeitraum, »nur Personen mit Wünschen«) eingrenzen – alle Ansichten und Kennzahlen folgen dem Filter.
5. Nach Änderungen in Excel: **speichern**, dann hier **»Neu laden«**.

Drucken: Knopf **»Drucken (A4 quer)«** druckt die gerade offene Registerkarte. Im Druckdialog ggf. »Hintergrundgrafiken« einschalten, damit die Ampelfarben erscheinen.

## Was zeigt das Dashboard?

| Bereich | Inhalt | Klick |
|---|---|---|
| **Kennzahlen-Leiste** (oben, auf allen Registerkarten) | 1) Urlaubswünsche im Zeitraum + gewünschte Arbeitstage · 2) Personen ohne Wunsch · 3) Engpasstage (Arbeitstage ab Gelb, aufgeteilt dunkelrot/hellrot/gelb) · 4) offene ATOSS-Übertragungen · 5) Resturlaub (Summe Anspruch − gewünscht; Anzahl überzogen / ohne Anspruch) · 6) Hinweise zu den Daten | jede Kachel springt zur passenden Liste (z. B. »ohne Wunsch« → Personentabelle mit genau diesen Personen) |
| **Jahresübersicht (Heatmap)** | Zeile = Monat, Spalte = Tag 1–31. Farbe = höchste Ampelstufe der gefilterten Stationen/Fachteams an diesem Tag, Zahl = wie viele Personen fehlen. Grau = Wochenende, lila = Feiertag/frei (inkl. Heiligabend/Silvester), oranger Rahmen = heute, senkrechter Strich = Wochenbeginn (Montag) | Tag anklicken → rechts **»Wer fehlt«**: Personen mit Wunsch, Verschiebbarkeit, ATOSS-Status, betroffene Bereiche, wer an dem Wochentag ohnehin frei hat (Teilzeit) |
| **Top 5 kritische Wochen** | Die fünf schwierigsten Kalenderwochen im Filter, mit den betroffenen Stationen/Fachteams | Woche anklicken → »Wer fehlt in der Woche« |
| **Urlaub je Monat** | Umschalter **je Fachrichtung / je Station**. Balken = Anteil Urlaub an den Soll-Arbeitstagen des Bereichs (gleiche Skala für alle Zeilen), Zahl darüber = Urlaubs-Arbeitstage, farbiger Strich darunter = höchste Ampelstufe im Monat, rechts Jahressumme | Maus über Balken = genaue Werte |

## Weitere Registerkarten
| Karte | Inhalt |
|---|---|
| **Kalender** | wie bisher: Ampel je Station/Fachteam und Personenzeilen, Raster Wochen oder Tage. Neu: Teilzeit-freie Tage schraffiert, Wunschtage an freien Tagen blass |
| **Konflikte** | wie bisher: zusammenhängende Engpässe je Bereich mit »Zuerst ansprechen« (wer »verschiebbar« angegeben hat), Liste kopieren für E-Mail |
| **Personen** | **sortierbare** Tabelle (Klick auf Spaltenkopf, nochmal = umgekehrt): Name, Fachrichtung, Stationen, Arbeitstage (TZ = Teilzeit), Wünsche, gewünschte AT, Anspruch, Rest, ATOSS offen, Engpass. Schnellfilter »alle / ohne Wunsch / ATOSS offen«. Name anklicken → Personenansicht |
| **Personenansicht** | eine Person wählen: Kennzahlen (Wünsche, AT, Anspruch, Rest, ATOSS offen, höchster Engpass), eigenes Jahresraster (U = Urlaub, Farbe = Engpass, schraffiert = Teilzeit-frei), Tabelle aller Wünsche mit Excel-Zeilennummer |
| **Regeln & Hinweise** | Ampelwerte je Station/Fachteam, Teilzeit-Erklärung, Datenhinweise (fehlende Namen, Überschneidungen, Anspruch überschritten …), Feiertage |

## So wird gerechnet (wichtig für Rückfragen)
- **Ampel (unverändert):** Pro Arbeitstag wird je Station/Fachteam gezählt, wie viele Mitglieder einen Urlaubswunsch haben. Schwellen aus Excel → *Einstellungen* (Gelb/Hellrot/Dunkelrot »ab … weg«). Leer bei Stationen = Standardregel: Gelb ab 2 weg · Hellrot, wenn nur noch 2 da sind (nur Stationen ab 4 Personen) · Dunkelrot, wenn alle weg sind. Fachteams ohne Werte haben keine Ampel. Eine Person mit mehreren Stationen zählt auf jeder.
- **Teilzeit (neu):** Spalten L–P (Mo–Fr) im Blatt *Team*, `x` = Arbeitstag, alle leer = Vollzeit (wie Excel-Spalte Q »Muster«).
  - Ein Wunsch zählt nur an **eigenen Arbeitstagen** als »weg« und als Urlaubstag (gleich wie `NETTOARBEITSTAGE.INTL` in Excel).
  - Bei der **Standardregel** beziehen sich »nur noch 2 da« und »alle weg« auf die Personen, die **an diesem Wochentag arbeiten würden**. Beispiel: Station mit 4 Personen, zwei davon arbeiten nur Mo–Mi. Am Donnerstag ist eine Vollzeitkraft im Urlaub → 1 von 2 im Dienst weg, nur noch 1 da → **Hellrot**. Am Montag wäre derselbe Fall unkritisch (1 von 4 weg).
  - **Fest eingetragene Schwellen** (Einstellungen) gelten unverändert.
- **Heiligabend/Silvester** stehen in Excel in der Feiertagsliste und zählen deshalb nie als Arbeitstag.
- **Engpasstage** = Arbeitstage im Zeitraum, an denen mindestens ein gefilterter Bereich Gelb oder höher ist (gezählt wird die höchste Stufe des Tages).
- **Top 5 Wochen** – Rangfolge: 1. höchste Stufe der Woche, 2. Punkte, 3. meiste gleichzeitig Abwesende. Punkte = Summe über alle Arbeitstage und alle gefilterten Bereiche: Gelb 1 · Hellrot 3 · Dunkelrot 9. Wochen ohne Gelb erscheinen nicht.
- **Offene ATOSS-Übertragung** = Wunsch ohne Datum in *Wünsche*, Spalte J »In ATOSS übertragen am«.
- **Resturlaub** = Anspruch (*Team*, Spalte G) − gewünschte Arbeitstage. Personen ohne Anspruch werden nicht mitgerechnet, sondern gezählt (»ohne Anspruch«).
- **Monatsbalken:** Soll-Arbeitstage = Summe der Personen, die an jedem Arbeitstag des Monats im Dienst wären (Teilzeit berücksichtigt).

## Entscheidungen und Begründungen
- **Eine Datei, Bibliothek eingebettet** (SheetJS 0.18.5): funktioniert auf Klinik-PCs ohne Internet und ohne Installation; keine Daten verlassen den Rechner (Datenschutz – Urlaubsdaten sind Personaldaten).
- **Heatmap als Monat × Tag** statt GitHub-Wochenraster: liest sich wie ein Wandkalender und passt auf eine A4-Seite quer.
- **Monatsbalken als Anteil statt absoluter Tage**: Ergotherapie (18 Personen) würde sonst alle kleinen Teams optisch erdrücken; der Anteil ist zwischen Bereichen vergleichbar. Die absolute Zahl steht trotzdem über jedem Balken.
- **Balken einfarbig, Ampel als separater Strich**: Ampelfarben bleiben für »Engpass« reserviert und werden nicht für Mengen verwendet.
- **Teilzeit nur bei der Standardregel tagesbezogen**: Fest eingetragene Schwellen sind bewusste Vorgaben der Leitung und werden nicht automatisch verändert. Planmäßig freie Teilzeit-Tage zählen *nicht* als »weg«, sonst wäre z. B. jeder Freitag gelb, obwohl niemand Urlaub hat.
- **Stationen mit 1 Person** werden nach Standardregel dunkelrot, sobald diese Person Urlaub hat (= Station unbesetzt). Wenn das zu viel Rot erzeugt: in *Einstellungen* bei dieser Station »Dunkelrot ab … weg« = `2` eintragen – dann zeigt sie bei 1 Abwesenheit nur »weg, unkritisch« (leer lassen reicht nicht, leer = Standardregel).
- **Filter und Ampel-Logik** der bisherigen Ansicht wurden unverändert übernommen (Wunsch Tom, 06.10.2026).
- Filter, Sortierung, Registerkarte und gewählte Person merkt sich der Browser lokal (`localStorage`), nicht in der Excel-Datei.

## Bekannte Grenzen
- Der Planungszeitraum ist fest **366 Tage ab Einstellungen B3**.
- Bereits **genehmigter/abgelehnter** Urlaub wird nicht unterschieden – es sind Wünsche.
- Halbe Tage gibt es nicht; ein Tag im Wunsch ist ein ganzer Tag.
- Teilzeit-Anspruch muss in *Team* Spalte G bereits anteilig stehen (wird nicht umgerechnet).
- »Zuletzt geöffnet – wieder laden« funktioniert nur in Edge/Chrome; in Firefox die Datei jedes Mal auswählen.
- Druck: Browser-Einstellung »Hintergrundgrafiken« muss an sein, sonst fehlen die Farben.

## Für Änderungen (Technik)
Ordner `urlaubsplanung/`:

| Datei | Zweck |
|---|---|
| `Urlaubsansicht.html` | **fertige Datei zum Weitergeben** (wird erzeugt – nicht direkt bearbeiten) |
| `ansicht/urlaubsansicht.src.html` | Quelltext (HTML, CSS, JavaScript) – **hier ändern** |
| `ansicht/xlsx.full.min.js` | Bibliothek SheetJS 0.18.5 (Apache-2.0) zum Lesen von Excel |
| `ansicht/baue_ansicht.py` | baut beides zu `Urlaubsansicht.html` zusammen |

Ablauf: Quelltext ändern → `python3 ansicht/baue_ansicht.py` (im Ordner `urlaubsplanung/`) → `Urlaubsansicht.html` im Browser mit einer **Testkopie** der Excel prüfen → weitergeben.

Häufige Anpassungen (alle oben im `<script>` des Quelltexts):
- **Excel-Spalten verschoben?** → `LAYOUT` (Blattnamen, erste Datenzeile, Spaltenbuchstaben, Teilzeit-Spalten `tage: ["L"…"P"]`).
- **Standardregel ändern** → `STANDARD`.
- **Gewichtung Top-5-Wochen** → `WOCHEN_PUNKTE` (Index = Stufe 0–4).
- **Farben** → CSS-Variablen `--l1` … `--l4` (Ampel), `--bar` (Monatsbalken), `FACH_FARBEN`.

**Datenschutz:** Die echte Excel-Datei (Namen der Mitarbeitenden) gehört **nicht** ins Git-Repository – `urlaubsplanung/.gitignore` schließt `*.xlsx`/`*.xlsm` aus. Zum Testen eine Kopie mit erfundenen Namen verwenden.

## Änderungsprotokoll
| Datum | Änderung |
|---|---|
| 06.10.2026 | Umbau zum Dashboard: Kennzahlen-Leiste neu, Jahres-Heatmap mit »wer fehlt«, Top-5-Wochen, Monatsbalken, sortierbare Personentabelle, Personenansicht, Teilzeit in Ampel und Arbeitstagen, Druck A4 quer. Quelltext + Build-Skript ins Repository. |
| vorher | Kalender, Konflikte, Personenliste, Regeln; .xlsm-Unterstützung |
