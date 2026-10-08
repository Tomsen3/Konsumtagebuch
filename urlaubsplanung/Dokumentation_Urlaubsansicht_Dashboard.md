# Urlaubsplanung Kreativtherapie – Urlaubsansicht (Dashboard)

Stand: 08.10.2026 · Verantwortlich: Tom · gehört zu `Urlaubswuensche_2027.xlsx` (siehe `Dokumentation_Mein_Urlaub.md`)

> **Nur für die Leitung.** Für die Kolleg:innen gibt es seit 08.10.2026 die getrennte `Teamansicht.html` (siehe `Dokumentation_Teamansicht.md`). Die Urlaubsansicht bitte **nicht** in den Team-Ordner legen, sondern nur in einen Ordner, auf den die Leitung Zugriff hat.

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
3. Es öffnet sich immer zuerst die **Übersicht** (Ampel-Status, »Zu tun«, Liste der Einsatzorte und Teams). Für Einzelheiten auf einen Einsatzort/ein Team oder auf »ansehen →« klicken – das führt in die ausführliche **Auswertung**.
4. In der Auswertung mit den **Filtern** (Fachrichtung, Einsatzort, Name, Zeitraum, »nur Personen mit Wünschen«) eingrenzen – alle Ansichten und Kennzahlen folgen dem Filter.
5. Nach Änderungen in Excel: **speichern**, dann hier **»Neu laden«**.
6. **Zurück-Taste des Browsers** (oder Alt+←): schließt zuerst das Seitenfenster »Wer fehlt«, sonst geht sie zur vorherigen Registerkarte bzw. Person, mit den Filtern von damals. Erst auf dem ersten Bildschirm nach dem Laden verlässt sie die Seite.

Drucken: Knopf **»Drucken (A4 quer)«** druckt die gerade offene Registerkarte. Im Druckdialog ggf. »Hintergrundgrafiken« einschalten, damit die Ampelfarben erscheinen.

## Übersicht (Startseite)
Einfache Komplettübersicht **ohne Filter und ohne Tabellen** über den ganzen Planungszeitraum, aufgebaut nach Mockup-Entwurf B »In Klartext« plus Ampel (Wunsch Tom, 08.10.2026 – für Leitung ohne Technikkenntnisse):

| Bereich | Inhalt | Klick |
|---|---|---|
| **Ampel** (links, bleibt beim Scrollen sichtbar) | **Rot** = mindestens ein hellroter/dunkelroter Engpass · **Gelb** = nur knappe (gelbe) Zeiträume · **Grün** = keine Engpässe · keine Lampe = noch keine Wünsche. Darunter ein kurzer Satz zur Lage | rote Lampe = Konfliktliste nur rot · gelbe Lampe = Konfliktliste mit gelben · grüne Lampe = Auswertung |
| **Die Lage in Kürze** | zwei, drei Sätze, automatisch aus den Daten: wie viele Stellen kritisch/knapp sind, wie viele Personen noch keinen Wunsch abgegeben haben | – |
| **Darum sollten wir uns kümmern** | je kritischem Engpass eine Karte in Klartext: Bereich + Zeitraum (»Station 1, 9.–20. August«), wer gleichzeitig weg ist, »nur noch X von Y da« bzw. »unbesetzt«, wer »verschiebbar« angegeben hat. Höchstens 6 Karten, Rest als Link. Gelbe Zeiträume in einer Sammelkarte | Karte = Konfliktliste dieses Bereichs |
| **Noch offen** | Personen ohne Wunsch, überzogene Ansprüche, Datenhinweise; Einsatzorte ohne Engpass als »alles in Ordnung« | »Liste →« = passende ausführliche Liste |
| **Alle Einsatzorte und Teams im Überblick** | eingeklappt; Liste mit Status je Bereich | Zeile = Auswertung gefiltert auf diesen Bereich |

Namen werden im Fließtext als »Vorname Nachname« geschrieben (aus »Nachname, Vorname« in Excel). Filterleiste und Kennzahlen-Leiste sind auf der Übersicht bewusst ausgeblendet. Sind im Browser eigene Ampelwerte eingestellt, erscheint ein blauer Hinweis.

## Was zeigt die Auswertung (früher »Dashboard«)?

| Bereich | Inhalt | Klick |
|---|---|---|
| **Kennzahlen-Leiste** (oben, auf allen Registerkarten außer Übersicht) | 1) Urlaubswünsche im Zeitraum + gewünschte Arbeitstage · 2) Personen ohne Wunsch · 3) Engpasstage (Arbeitstage ab Gelb, aufgeteilt dunkelrot/hellrot/gelb) · 4) Resturlaub (Summe Anspruch − gewünscht; Anzahl überzogen / ohne Anspruch) · 5) Hinweise zu den Daten | jede Kachel springt zur passenden Liste (z. B. »ohne Wunsch« → Personentabelle mit genau diesen Personen) |
| **Jahresübersicht (Heatmap)** | Zeile = Monat, Spalte = Tag 1–31. Farbe = höchste Ampelstufe der gefilterten Einsatzorte/Fachteams an diesem Tag, Zahl = wie viele Personen fehlen. Grau = Wochenende, lila = Feiertag/frei (inkl. Heiligabend/Silvester), oranger Rahmen = heute, senkrechter Strich = Wochenbeginn (Montag) | Tag anklicken → rechts **»Wer fehlt«**: Personen mit Wunsch, Verschiebbarkeit, betroffene Bereiche, wer an dem Wochentag ohnehin frei hat (Teilzeit) |
| **Top 5 kritische Wochen** | Die fünf schwierigsten Kalenderwochen im Filter, mit den betroffenen Einsatzorte/Fachteams | Woche anklicken → »Wer fehlt in der Woche« |
| **Urlaub je Monat** | Umschalter **je Fachrichtung / je Einsatzort**. Balken = Anteil Urlaub an den Soll-Arbeitstagen des Bereichs (gleiche Skala für alle Zeilen), Zahl darüber = Urlaubs-Arbeitstage, farbiger Strich darunter = höchste Ampelstufe im Monat, rechts Jahressumme | Maus über Balken = genaue Werte |

## Weitere Registerkarten
| Karte | Inhalt |
|---|---|
| **Kalender** | wie bisher: Ampel je Einsatzort/Fachteam und Personenzeilen, Raster Wochen oder Tage. Neu: Teilzeit-freie Tage schraffiert, Wunschtage an freien Tagen blass |
| **Konflikte** | wie bisher: zusammenhängende Engpässe je Bereich mit »Zuerst ansprechen« (wer »verschiebbar« angegeben hat), Liste kopieren für E-Mail |
| **Personen** | **sortierbare** Tabelle (Klick auf Spaltenkopf, nochmal = umgekehrt): Name, Fachrichtung, Einsatzorte, Arbeitstage (TZ = Teilzeit), Wünsche, gewünschte AT, Anspruch, Rest, Engpass. Schnellfilter »alle / ohne Wunsch«. Name anklicken → Personenansicht |
| **Personenansicht** | eine Person wählen: Kennzahlen (Wünsche, AT, Anspruch, Rest, höchster Engpass), eigenes Jahresraster (U = Urlaub, Farbe = Engpass, schraffiert = Teilzeit-frei), Tabelle aller Wünsche mit Excel-Zeilennummer |
| **Regeln & Ampel** | vier **eingeklappte** Abschnitte (Klick auf die Überschrift klappt auf): **Ampel einstellen** (siehe unten), So rechnet die Ampel, Hinweise zu den Daten, Planungszeitraum und Feiertage |

## Ampel einstellen (Reiter »Regeln & Ampel«)
Drei Wege, von »gilt für alle« bis »nur zum Ausprobieren«:

| Weg | Wo | Gilt für | Wann nehmen |
|---|---|---|---|
| **1. Excel** (empfohlen) | Blatt *Einstellungen*: Einsatzorte Spalten I/J/K, Fachrichtungen Spalten B/C/D | alle, die diese Excel-Datei laden | dauerhafte Regeln |
| **2. In der Ansicht** | Reiter »Regeln & Ampel« → »Ampel einstellen«: Zahl eintragen, Enter | **nur dieser Browser auf diesem PC** (`localStorage`) | ausprobieren, eigene Sicht |
| **3. Standardregel** | ebenda, oberste Zeile (Gelb ab · Hellrot wenn nur noch … da · Hellrot ab Größe des Einsatzorts) | nur dieser Browser | Einsatzorte ohne eigene Werte |

- **Vorrang je Wert:** in der Ansicht eingestellt > Excel > Standardregel. Leeres Feld = nächste Stufe gilt (grauer Platzhalter zeigt den Wert). Spalte »Gilt jetzt« zeigt das Ergebnis und woher es kommt (»hier eingestellt«, »aus Excel«, »Standardregel«).
- **Ausprobierte Werte für alle übernehmen:** »Einsatzorte für Excel kopieren« → in Excel *Einstellungen* Zelle **H7** anklicken → Strg+V (füllt H–K, Namen werden mit überschrieben, damit die Zeilen sicher passen). Fachteams: »Fachteams für Excel kopieren« → Zelle **A7** → Strg+V (füllt A–D). Danach in der Ansicht »Alle Werte hier löschen«, Excel speichern, »Neu laden«.
- **Stufe abschalten:** Zahl größer als die Personenzahl eintragen (leer lassen geht nicht, leer = nächste Stufe).
- Die Vorgabe der Standardregel (2 / 2 / 4) steht im Quelltext in `STANDARD`; die Einstellung in der Ansicht überschreibt sie nur im Browser.

## So wird gerechnet (wichtig für Rückfragen)
- **Ampel (unverändert):** Pro Arbeitstag wird je Einsatzort/Fachteam gezählt, wie viele Mitglieder einen Urlaubswunsch haben. Schwellen aus Excel → *Einstellungen* (Gelb/Hellrot/Dunkelrot »ab … weg«). Leer bei Einsatzorte = Standardregel: Gelb ab 2 weg · Hellrot, wenn nur noch 2 da sind (nur Einsatzorte ab 4 Personen) · Dunkelrot, wenn alle weg sind. Fachteams ohne Werte haben keine Ampel. Eine Person mit mehreren Einsatzorte zählt auf jeder.
- **Teilzeit (neu):** Spalten L–P (Mo–Fr) im Blatt *Team*, `x` = Arbeitstag, alle leer = Vollzeit (wie Excel-Spalte Q »Muster«).
  - Ein Wunsch zählt nur an **eigenen Arbeitstagen** als »weg« und als Urlaubstag (gleich wie `NETTOARBEITSTAGE.INTL` in Excel).
  - Bei der **Standardregel** beziehen sich »nur noch 2 da« und »alle weg« auf die Personen, die **an diesem Wochentag arbeiten würden**. Beispiel: Einsatzort mit 4 Personen, zwei davon arbeiten nur Mo–Mi. Am Donnerstag ist eine Vollzeitkraft im Urlaub → 1 von 2 im Dienst weg, nur noch 1 da → **Hellrot**. Am Montag wäre derselbe Fall unkritisch (1 von 4 weg).
  - **Fest eingetragene Schwellen** (Einstellungen) gelten unverändert.
- **Heiligabend/Silvester** stehen in Excel in der Feiertagsliste und zählen deshalb nie als Arbeitstag.
- **Engpasstage** = Arbeitstage im Zeitraum, an denen mindestens ein gefilterter Bereich Gelb oder höher ist (gezählt wird die höchste Stufe des Tages).
- **Top 5 Wochen** – Rangfolge: 1. höchste Stufe der Woche, 2. Punkte, 3. meiste gleichzeitig Abwesende. Punkte = Summe über alle Arbeitstage und alle gefilterten Bereiche: Gelb 1 · Hellrot 3 · Dunkelrot 9. Wochen ohne Gelb erscheinen nicht.
- **Resturlaub** = Anspruch (*Team*, Spalte G) − gewünschte Arbeitstage. Personen ohne Anspruch werden nicht mitgerechnet, sondern gezählt (»ohne Anspruch«).
- **Monatsbalken:** Soll-Arbeitstage = Summe der Personen, die an jedem Arbeitstag des Monats im Dienst wären (Teilzeit berücksichtigt).

## Entscheidungen und Begründungen
- **Eine Datei, Bibliothek eingebettet** (SheetJS 0.18.5): funktioniert auf Klinik-PCs ohne Internet und ohne Installation; keine Daten verlassen den Rechner (Datenschutz – Urlaubsdaten sind Personaldaten).
- **Heatmap als Monat × Tag** statt GitHub-Wochenraster: liest sich wie ein Wandkalender und passt auf eine A4-Seite quer.
- **Monatsbalken als Anteil statt absoluter Tage**: Ergotherapie (18 Personen) würde sonst alle kleinen Teams optisch erdrücken; der Anteil ist zwischen Bereichen vergleichbar. Die absolute Zahl steht trotzdem über jedem Balken.
- **Balken einfarbig, Ampel als separater Strich**: Ampelfarben bleiben für »Engpass« reserviert und werden nicht für Mengen verwendet.
- **Teilzeit nur bei der Standardregel tagesbezogen**: Fest eingetragene Schwellen sind bewusste Vorgaben der Leitung und werden nicht automatisch verändert. Planmäßig freie Teilzeit-Tage zählen *nicht* als »weg«, sonst wäre z. B. jeder Freitag gelb, obwohl niemand Urlaub hat.
- **Einsatzorte mit 1 Person** werden nach Standardregel dunkelrot, sobald diese Person Urlaub hat (= Einsatzort unbesetzt). Wenn das zu viel Rot erzeugt: in *Einstellungen* bei diesem Einsatzort »Dunkelrot ab … weg« = `2` eintragen – dann zeigt sie bei 1 Abwesenheit nur »weg, unkritisch« (leer lassen reicht nicht, leer = Standardregel).
- **Filter und Ampel-Logik** der bisherigen Ansicht wurden unverändert übernommen (Wunsch Tom, 06.10.2026).
- **ATOSS komplett entfernt** (Wunsch Tom, 08.10.2026): Ob ein Wunsch in ATOSS übertragen ist, wird in der Ansicht nicht gebraucht. Die Ansicht liest Spalte J »In ATOSS übertragen am« im Blatt *Wünsche* nicht mehr; die Spalte in Excel bleibt unverändert und kann weiter genutzt werden.
- **»Einsatzort« statt »Station«** (Wunsch Tom, 08.10.2026): Nicht alle Bereiche sind Stationen (z. B. TK Sucht, Ambulanz). Excel (»Einsatzort 1–5«), Teamansicht und Leitungsansicht nutzen jetzt denselben Begriff. Im Programmcode heißen Einsatzorte weiterhin `stat` (nur intern, nicht sichtbar). Das Blatt *Einstellungen* heißt in Spalte H noch »Station« – die Ansicht liest nach Spaltenbuchstaben, der Name dort ist egal.
- **Zurück-Taste führt zum vorherigen Bildschirm** (Rückmeldung Tom, 08.10.2026): Vorher schloss sie die ganze Datei, weil die Seite ihre Registerkarten ohne Seitenwechsel umschaltet und der Browser davon nichts wusste. Jetzt bekommt jeder Bildschirmwechsel einen Eintrag im Browserverlauf. Als »Bildschirm« zählt die Registerkarte (in der Personenansicht zusätzlich die Person). Filteränderungen innerhalb einer Karte legen keinen eigenen Eintrag an, sonst bräuchte man viele Klicks, um zurückzukommen.
- **Gemeinsamer Kern mit der Teamansicht** (08.10.2026): Excel einlesen und Ampel berechnen steht in `ansicht/kern.js` und wird in beide Seiten eingebaut. So rechnen Leitung und Team garantiert gleich.
- Filter, Sortierung und gewählte Person merkt sich der Browser lokal (`localStorage`), nicht in der Excel-Datei. Nach dem Laden einer Datei startet die Ansicht immer mit der Übersicht.
- **Übersicht vor der Auswertung** (Wunsch Tom, 08.10.2026): Wer nur wissen will »passt alles?«, soll nicht zuerst Heatmap und Filter sehen. Die Auswertung bleibt unverändert dahinter.
- **Ampel in der Ansicht einstellbar, aber nur lokal** (08.10.2026): Die Ansicht darf die Excel-Datei nicht verändern (nur lesend, Datenschutz/Sicherheit). Deshalb speichert sie eigene Werte im Browser und bietet »Für Excel kopieren«, damit dauerhafte Regeln in Excel landen und für alle gelten.
- **Regeln eingeklappt** (08.10.2026): Die Erklärtexte sind für den Alltag zu lang; aufgeklappte Abschnitte bleiben bis zum Schließen der Seite offen.

## Bekannte Grenzen
- Der Planungszeitraum ist fest **366 Tage ab Einstellungen B3**.
- In der Ansicht eingestellte Ampelwerte gelten nur im jeweiligen Browser. Wer einen anderen PC/Browser nutzt, sieht die Excel-Werte.
- Bereits **genehmigter/abgelehnter** Urlaub wird nicht unterschieden – es sind Wünsche.
- Halbe Tage gibt es nicht; ein Tag im Wunsch ist ein ganzer Tag.
- Teilzeit-Anspruch muss in *Team* Spalte G bereits anteilig stehen (wird nicht umgerechnet).
- **Automatisch laden geht nur eingeschränkt** (Browser-Sicherheit: eine per Doppelklick geöffnete Seite darf keine Datei ohne Zutun lesen – das lässt sich in der Seite nicht abschalten). Was geht (nur Edge/Chrome): Die Excel-Datei **einmal per Ziehen-und-Ablegen** ins Fenster ziehen. Danach merkt sich die Seite die Datei. Beim nächsten Öffnen lädt sie sie **von selbst**, wenn der Browser das Lesen noch erlaubt (gleiche Browsersitzung oder »Bei jedem Besuch zulassen«, falls der Browser das anbietet); sonst erscheint ein grüner Knopf »… laden« – **ein Klick**, ggf. »Zulassen«. Nach Auswahl über den Knopf »Excel-Datei auswählen« merkt sich die Seite nichts.
- »Neu laden« ohne Dialog geht nur, wenn die Datei per Ziehen-und-Ablegen geöffnet wurde (Edge/Chrome). Nach Auswahl über den Knopf öffnet »Neu laden« den Dateidialog erneut – einfach dieselbe Datei wählen.
- Die Seite muss per Doppelklick im Browser geöffnet werden. In Vorschau-Fenstern (Teams, Outlook, Claude-App) sind Dateidialoge gesperrt.
- Druck: Browser-Einstellung »Hintergrundgrafiken« muss an sein, sonst fehlen die Farben.

## Für Änderungen (Technik)
Ordner `urlaubsplanung/`:

| Datei | Zweck |
|---|---|
| `Urlaubsansicht.html` | **fertige Datei für die Leitung** (wird erzeugt – nicht direkt bearbeiten) |
| `Teamansicht.html` | fertige Datei für die Kolleg:innen (wird erzeugt) – siehe `Dokumentation_Teamansicht.md` |
| `ansicht/urlaubsansicht.src.html` | Quelltext der Leitungsansicht (Darstellung) – **hier ändern** |
| `ansicht/teamansicht.src.html` | Quelltext der Teamansicht (Darstellung) |
| `ansicht/kern.js` | **gemeinsam für beide Seiten:** Excel-Layout (`LAYOUT`), Standardregel (`STANDARD`), Hilfsfunktionen, Einlesen + Ampel (`build`), Zurück-Taste (`verlaufStart`, `verlaufMerken`, `detailOeffnen`/`detailSchliessen`). Änderungen wirken auf beide Seiten. |
| `ansicht/xlsx.full.min.js` | Bibliothek SheetJS 0.18.5 (Apache-2.0) zum Lesen von Excel |
| `ansicht/baue_ansicht.py` | baut beide Seiten zusammen (setzt `kern.js`, Bibliothek und Logo ein) |
| `ansicht/logo.svg` oder `ansicht/logo.png` (optional) | Logo der Klinik (PP.rt) für den Seitenkopf. Liegt die Datei dort, bettet das Build-Skript sie automatisch ein (als Teil der HTML-Datei, kein Internet nötig). SVG bevorzugt (bleibt scharf). Höhe im Kopf: 42 px auf weißem Feld. Nutzung des Logos vorher mit der Öffentlichkeitsarbeit der Klinik abstimmen. |

Ablauf: Quelltext ändern → `python3 ansicht/baue_ansicht.py` (im Ordner `urlaubsplanung/`) → `Urlaubsansicht.html` **und** `Teamansicht.html` im Browser mit einer **Testkopie** der Excel prüfen → weitergeben.

Häufige Anpassungen:
- **Excel-Spalten verschoben?** → `LAYOUT` in `ansicht/kern.js` (Blattnamen, erste Datenzeile, Spaltenbuchstaben; Einsatzorte `st: ["C","D","E","F","R"]` – R = »Einsatzort 5«; Teilzeit-Spalten `tage: ["L"…"P"]`).
- **Standardregel ändern** → `STANDARD` in `ansicht/kern.js` (gilt für beide Seiten).
- **Gewichtung Top-5-Wochen** → `WOCHEN_PUNKTE` in `ansicht/kern.js` (Index = Stufe 0–4).
- **Farben** → CSS-Variablen `--l1` … `--l4` (Ampel), `--bar` (Monatsbalken), `FACH_FARBEN`.

**Datenschutz:** Die echte Excel-Datei (Namen der Mitarbeitenden) gehört **nicht** ins Git-Repository – `urlaubsplanung/.gitignore` schließt `*.xlsx`/`*.xlsm` aus. Zum Testen eine Kopie mit erfundenen Namen verwenden.

## Änderungsprotokoll
| Datum | Änderung |
|---|---|
| 08.10.2026 | **Zurück-Taste** schließt nicht mehr die Datei, sondern geht zum vorherigen Bildschirm bzw. schließt das Seitenfenster »Wer fehlt« (gemeinsamer Baustein in `ansicht/kern.js`, gilt auch für die Teamansicht). |
| 08.10.2026 | **»Station« heißt jetzt »Einsatzort«** in allen Texten der Leitungsansicht (Filter, Übersicht, Monatsbalken, Kalender, Konflikte, Personen, Regeln & Ampel, Knopf »Einsatzorte für Excel kopieren«) – gleiche Begriffe wie Excel und Teamansicht. Einsatzorte erscheinen nur mit ihrem Namen (»Ambulanz« statt »Station Ambulanz«). Rechnung und Ampel unverändert. |
| 08.10.2026 | **ATOSS komplett entfernt** (Kennzahl, Zu-tun-Punkt, Spalte und Filter in Personen, Personenansicht, »Wer fehlt«). Einlese- und Ampel-Logik in `ansicht/kern.js` ausgelagert (gemeinsam mit der neuen **Teamansicht**). Zuletzt geöffnete Datei wird beim Start automatisch geladen, wenn der Browser es erlaubt, sonst grüner Knopf. Hinweise sprechen von »Einsatzort« statt »Station«. |
| 08.10.2026 | Startseite neu nach Mockup B (Klartext) mit funktionierender Ampel links; Stationsliste eingeklappt darunter. |
| 08.10.2026 | **Fehler behoben:** Auf manchen PCs öffnete der Knopf »Excel-Datei auswählen« keinen Dialog (moderner Browser-Dialog per Richtlinie gesperrt, Ersatzdialog wurde dann vom Browser blockiert). Jetzt immer der einfache Dateidialog; zusätzlich Hinweis auf Ziehen-und-Ablegen auf der Startseite. |
| 08.10.2026 | Titel jetzt »Urlaubsplanung Kreativtherapie«; Platz für das Klinik-Logo im Kopf (`ansicht/logo.svg|png` wird beim Bauen eingebettet). Logo eingebaut: `ansicht/logo.svg` = offizielles PP.rt-Logo von https://www.pprt.de (abgerufen 08.10.2026, nur der leere Rand beschnitten, sonst unverändert). |
| 08.10.2026 | Neue Startseite **Übersicht** (Status, Zu tun, Stationen/Teams, Klick → Auswertung); bisheriges Dashboard heißt jetzt **Auswertung**; Reiter **Regeln & Ampel** mit eingeklappten Abschnitten und Ampel-Einstellung (lokal + »Für Excel kopieren«); Excel-Spalte R »Station 5« wird mitgelesen. |
| 06.10.2026 | Umbau zum Dashboard: Kennzahlen-Leiste neu, Jahres-Heatmap mit »wer fehlt«, Top-5-Wochen, Monatsbalken, sortierbare Personentabelle, Personenansicht, Teilzeit in Ampel und Arbeitstagen, Druck A4 quer. Quelltext + Build-Skript ins Repository. |
| vorher | Kalender, Konflikte, Personenliste, Regeln; .xlsm-Unterstützung |
