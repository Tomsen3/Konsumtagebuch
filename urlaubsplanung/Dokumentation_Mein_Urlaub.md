# Urlaubswünsche 2027 – Blatt »Mein Urlaub«, Teilzeit und freie Tage

Stand: 08.10.2026 · Verantwortlich: Tom

## Worum geht es?
Jede Person soll in der Excel-Datei
1. ihren Namen wählen und sofort **alle eigenen Urlaubswünsche** sehen (nach Datum sortiert, mit Arbeitstagen, Hinweis und ATOSS-Status), und
2. **einfach einen neuen Wunsch eintragen** können.

Zusätzlich:
- Teilzeitkräfte arbeiten nur an bestimmten Wochentagen. Ein Urlaubswunsch zählt deshalb nur **ihre** Arbeitstage.
- **Heiligabend (24.12.) und Silvester (31.12.) sind immer frei** und zählen nie als Urlaubstag.

## Zwei Fassungen – welche nehme ich?
| | Fassung A: `Urlaubswuensche_2027.xlsx` | Fassung B: Makro (`…_Makro-Vorlage.xlsx` + Makro-Code) |
|---|---|---|
| Eintragen | Link springt zur nächsten freien Zeile im Blatt »Wünsche«, dort direkt eintragen, Link zurück | Eingabemaske auf »Mein Urlaub« + Knopf **»Wunsch eintragen«** |
| Prüfung vor dem Eintragen | Spalte »Hinweis« in »Wünsche« + Überschneidungs-Markierung in der Übersicht | ausführlich (Datum, Zeitraum, Arbeitstage, Überschneidung, Rest danach) |
| Voraussetzung | keine | Makros müssen erlaubt sein, Datei ist .xlsm |
| Excel im Browser | ja | nein (Knopf funktioniert nur in Excel Desktop) |

Beide Fassungen enthalten dieselben Änderungen für Teilzeit und freie Tage.

## Was wurde an der Datei geändert?
| Blatt | Änderung |
|---|---|
| **Mein Urlaub** (neu, 2. Reiter, grün) | Name wählen → Fachrichtung, Arbeitstage der Woche, Anzahl Wünsche, gewünschte Arbeitstage, Anspruch, Rest; Bereich »Neuen Wunsch eintragen«; Übersicht der eigenen Wünsche (max. 30). Blattschutz ohne Kennwort. Versteckte Hilfsspalten J/K nicht löschen. |
| **Team** | Neue Spalten **L–P (Mo–Fr)**: Arbeitstage mit `x` markieren. Alle leer = Vollzeit Mo–Fr. Spalte Q »Muster« (ausgeblendet) rechnet daraus das Arbeitstage-Muster. Sortier-/Filterknöpfe im Spaltenkopf nur noch bei Name, Fachrichtung, Gewünschte Arbeitstage und Rest (Wunsch Tom, 06.10.2026); die anderen Knöpfe sind ausgeblendet. Sortieren nach anderen Spalten geht weiterhin über Daten → Sortieren. |
| **Team** (08.10.2026) | Neue Spalte **R »Station 5«** – fünfte Station/Einsatzort je Person, gleiche Auswahlliste wie C–F. Sie steht bewusst **hinter** den Wochentagen (die versteckte Spalte Q liegt dazwischen): Eine eingeschobene Spalte hätte über 1.800 Formelbezüge und ggf. das Makro verschoben. Die Team-Tabelle reicht jetzt bis R; »Einstellungen« Spalte L (Therapeut:innen je Station) zählt R mit. |
| **Einstellungen** (08.10.2026) | Station **»Ambulanz«** in H21 ergänzt (Ampel = Standardregel, bis eigene Werte in I21–K21 eingetragen werden). Die Stationsliste darf bis H36 wachsen – so weit reicht die Auswahlliste in »Team«. |
| **Einstellungen + Team** (08.10.2026, Skript `excel/einsatzorte_umstellen.py`) | **»StäB« aus der Stationsliste entfernt** (H7; die Einträge darunter sind eine Zeile nachgerückt, Liste endet jetzt mit »Ambulanz« in H20). Bei »Hensch, Kevin« (Team C17) war StäB eingetragen – die Zelle wurde geleert (Entscheidung Tom), bitte bei Bedarf einen Einsatzort wählen. **Spaltenüberschriften in »Team«: »Station 1–5« heißen jetzt »Einsatzort 1–5«** (C4:F4 und R4, auch in der Excel-Tabelle). Das Blatt *Einstellungen* heißt in Spalte H weiterhin »Station« (nicht verlangt; Ansichten lesen nach Spaltenbuchstaben, Name egal). |
| **Anleitung** (08.10.2026) | Verweist für Kolleg:innen auf die neue **Teamansicht.html** statt auf die Leitungsansicht. »So trage ich meine Wünsche ein« beschreibt nur noch den Weg über »Mein Urlaub« + Knopf, weil »Wünsche« nach der Freigabe schreibgeschützt ist; Ändern/Streichen über die Leitung. Hinweis: Leitungsansicht liegt nicht im Team-Ordner. |
| **Wünsche** | Spalte H »Arbeitstage« rechnet jetzt mit `NETWORKDAYS.INTL` (deutsch: `NETTOARBEITSTAGE.INTL`) nach dem persönlichen Muster aus »Team«. In E1 steht der Link »← zurück zu Mein Urlaub«. Sonst nichts geändert. |
| **Einstellungen** | Feiertagsliste N19/N20: Heiligabend und Silvester als Formel `=DATUM(JAHR($B$3);12;24)` bzw. `…;12;31)` → das Jahr passt sich automatisch an das Startdatum an. |
| **Anleitung** | Neuer Abschnitt ab Zeile 36. |
| `Urlaubsansicht.html` | Öffnet auch .xlsm-Dateien (für Fassung B). **Seit 06.10.2026 Dashboard** mit Teilzeit-Berücksichtigung – siehe `Dokumentation_Urlaubsansicht_Dashboard.md`. |

## Einrichtung Fassung A (ohne Makro)
1. Datei `Urlaubswuensche_2027.xlsx` an den bisherigen Ort legen (alte Datei ersetzen, wenn niemand sie geöffnet hat).
2. Im Blatt »Team« bei Teilzeitkräften die Arbeitstage ankreuzen (`x`).
3. Fertig.

## Einrichtung Fassung B (mit Makro) – auf dem Arbeits-PC
Hintergrund: Eine .xlsm-Datei kann nicht per Mail auf die Arbeit geschickt werden, Makros dürfen dort aber laufen. Deshalb wird die Makro-Datei **erst auf dem Arbeits-PC zusammengebaut**.

Mitnehmen: `Urlaubswuensche_2027_Makro-Vorlage.xlsx` und `Makro_WunschEintragen.bas` (liegt im Repository unter `urlaubsplanung/makro/`, neu erstellt am 08.10.2026, weil die erste Fassung nicht mehr auffindbar war) (falls .bas-Dateien blockiert werden: `Makro_WunschEintragen_zum_Kopieren.txt` oder den Text in den Mail-Text kopieren).

1. `Urlaubswuensche_2027_Makro-Vorlage.xlsx` in Excel öffnen (ggf. »Bearbeitung aktivieren«).
2. **Alt+F11** drücken → der VBA-Editor öffnet sich.
3. Menü **Datei → Datei importieren…** → `Makro_WunschEintragen.bas` wählen.
   *Alternative:* Menü **Einfügen → Modul**, dann den Inhalt von `Makro_WunschEintragen_zum_Kopieren.txt` hineinkopieren.
4. VBA-Editor schließen.
5. **Datei → Speichern unter →** Dateityp **»Excel-Arbeitsmappe mit Makros (*.xlsm)«**, Name z. B. `Urlaubswuensche_2027.xlsm`, an den gemeinsamen Ablageort.
6. Test: Namen wählen, Von/Bis eintragen, auf **»Wunsch eintragen«** klicken → Meldung »Eingetragen … Zeile …«. Den Testeintrag danach im Blatt »Wünsche« wieder leeren (Zellen A–E markieren → Entf).
7. Falls der Knopf nicht reagiert: Blattschutz aufheben (Überprüfen → Blattschutz aufheben), Rechtsklick auf den Knopf → **Makro zuweisen** → `WunschEintragen` → OK, Blattschutz wieder einschalten (Überprüfen → Blatt schützen, ohne Kennwort).
8. Im Blatt »Team« Teilzeit-Arbeitstage ankreuzen.

Beim Öffnen der .xlsm zeigt Excel ggf. eine gelbe Leiste »Inhalt aktivieren« – einmal klicken. Erscheint eine rote Leiste »Makros wurden blockiert«, muss der Speicherort als vertrauenswürdig gelten → IT fragen.

### Planung freigeben / Einrichtung bearbeiten (für die Leitung, ab 08.10.2026)
Wunsch Tom: Wenn Einstellungen und Team fertig sind, sollen die Kolleg:innen nur noch **»Mein Urlaub« bearbeiten** und **»Wünsche« und »Anleitung« nur lesen** können; *Team* und *Einstellungen* sollen nicht sichtbar sein.

Dafür enthält `Makro_WunschEintragen.bas` zwei weitere Makros (Start über **Alt+F8**, Makro wählen, »Ausführen«):

| Makro | Wirkung |
|---|---|
| **PlanungFreigeben** | *Team* und *Einstellungen* ganz ausgeblendet (»sehr ausgeblendet« – erscheinen nicht unter »Einblenden«), *Wünsche* und *Anleitung* schreibgeschützt (Filtern in *Wünsche* bleibt erlaubt), *Mein Urlaub* wie bisher (nur gelbe Felder), Arbeitsmappenstruktur geschützt. Fragt vorher nach und bietet Speichern an. |
| **EinrichtungBearbeiten** | alles wieder sichtbar und bearbeitbar (Team pflegen, Ampelwerte ändern, Wunsch ändern/löschen, ATOSS-Datum in *Wünsche* Spalte J eintragen). Danach wieder **PlanungFreigeben**. |

- »Wunsch eintragen« funktioniert auch nach der Freigabe: Das Makro hebt den Schutz von *Wünsche* kurz auf, trägt ein und schützt wieder.
- Die Ansichten (Team- und Leitungsansicht) lesen ausgeblendete und geschützte Blätter ohne Einschränkung.
- **Kennwort:** Standard ist *ohne Kennwort* (Konstante `KENNWORT = ""` oben im Makro) – das schützt vor Versehen, nicht vor Absicht (wer sich auskennt, kann über Überprüfen → Arbeitsmappe schützen den Schutz aufheben). Wer ein Kennwort möchte: in der Zeile `Private Const KENNWORT As String = ""` zwischen die Anführungszeichen eintragen, dann zusätzlich das VBA-Projekt sperren (VBA-Editor → Extras → Eigenschaften von VBAProject → Schutz), sonst ist das Kennwort im Code lesbar. Kennwort an einem für die Nachfolge auffindbaren Ort dokumentieren (z. B. Passwortverwaltung der Leitung).
- **Folge für die Kolleg:innen:** Wünsche ändern oder streichen geht nach der Freigabe nicht mehr selbst, sondern über die Leitung (steht so in der Anleitung).
- Gilt nur für die Makro-Fassung (.xlsm). Fassung A (.xlsx ohne Makro) braucht beschreibbares *Wünsche* und wird deshalb nicht freigegeben.

### Was das Makro tut (Stand 08.10.2026)
- Nutzt die Prüfung der Vorlage (»Mein Urlaub« J18 = Code 1–9, B18 = Text), damit Maske und Makro dasselbe sagen.
- Code 1–5 (Name/Datum fehlt oder falsch, außerhalb Zeitraum) und 6 (schon eingetragen): Meldung, nichts wird eingetragen.
- Code 7 (keine eigenen Arbeitstage) und 8 (Überschneidung): Rückfrage »Trotzdem eintragen?«; ebenso, wenn der Anspruch überschritten würde.
- Schreibt Name, Von, Bis, Verschiebbar, Bemerkung in die nächste freie Zeile in »Wünsche« (Spalten A–E, bis Zeile 605; ist das Blatt geschützt, wird der Schutz dafür kurz aufgehoben und danach wieder gesetzt), leert die Eingabefelder, zeigt Zeile, Arbeitstage und Rest und bietet »Datei jetzt speichern?« an.
- Modulname `ModulWunschEintragen` (bewusst anders als das Makro `WunschEintragen`, sonst findet der Knopf es nicht). Umlaute im Quelltext als Platzhalter `{ue}` usw., ersetzt durch die Funktion `D()`.

## Ablauf für Mitarbeitende
**Fassung A:** Reiter »Mein Urlaub« → Namen wählen → blauen Link »Hier klicken: neuen Wunsch … eintragen« → in der markierten Zeile Name, Von, Bis, Verschiebbar, Bemerkung eintragen → oben »← zurück zu Mein Urlaub«.
**Fassung B:** Reiter »Mein Urlaub« → Namen wählen → gelbe Felder ausfüllen → »Prüfung« grün/gelb → **Wunsch eintragen** → speichern.

## Entscheidungen und Begründungen
- **Kopieren + »Werte einfügen« verworfen** (erste Version), weil im Alltag nicht praktikabel (Rückmeldung Tom, 06.10.2026).
- **Zwei Fassungen**, weil Makros auf der Arbeit laufen dürfen, sich aber nicht hinschicken lassen. Fassung A funktioniert überall sofort, Fassung B ist bequemer.
- **Teilzeit über Wochentage (Mo–Fr ankreuzen)** statt »Stunden pro Woche«, weil für den Urlaub zählt, *an welchen Tagen* jemand fehlt. Wochenenden sind nie Arbeitstage.
- **Heiligabend/Silvester als Formel in der Feiertagsliste**, damit sie bei jedem neuen Jahr automatisch stimmen und auch NETWORKDAYS/die Urlaubsansicht sie kennen.
- **Formeln ab Excel 2010** (AGGREGAT, NETTOARBEITSTAGE.INTL, ZÄHLENWENNS – kein FILTER/XVERWEIS), damit auch ältere Office-Versionen in der Klinik funktionieren.
- **Makro-Code ohne Umlaute im Quelltext** (Umlaute als `ChrW(…)`), damit Import/Kopieren auf jedem PC sauber klappt.

## Bekannte Grenzen
- Der gewählte Name wird mit der Datei gespeichert; wer als Nächstes öffnet, wählt einfach den eigenen Namen. Bei gleichzeitiger Bearbeitung sehen beide dieselbe Auswahl.
- Übersicht zeigt max. 30 Wünsche pro Person (dann erscheint ein Hinweis).
- ~~Die Urlaubsansicht (HTML) zählt Teilzeitkräfte auch an freien Tagen als »weg«.~~ Behoben am 06.10.2026: Die Urlaubsansicht liest jetzt Team L–P und zählt nur eigene Arbeitstage (Details in `Dokumentation_Urlaubsansicht_Dashboard.md`).
- Urlaubsanspruch für Teilzeitkräfte bitte in »Team« Spalte G bereits anteilig eintragen (Excel rechnet ihn nicht um).

## Neues Jahr
Vorher **EinrichtungBearbeiten** ausführen (sonst sind Team/Einstellungen nicht sichtbar), danach wieder **PlanungFreigeben**.

Wie bisher: Datei kopieren, Startdatum in »Einstellungen« B3 ändern, alte Wünsche leeren, Feiertage aktualisieren. Heiligabend/Silvester passen sich selbst an. »Mein Urlaub« und die Teilzeit-Kreuze bleiben erhalten.

## Technisches
Änderung vom 08.10.2026 (StäB, Einsatzort-Überschriften, Anleitung): `python3 excel/einsatzorte_umstellen.py <quelle.xlsx> <ziel.xlsx>` – ändert nur die genannten Zellen direkt im XML (Knopf, Datenüberprüfung und bedingte Formatierung bleiben erhalten) und bricht ohne Änderung ab, wenn die Datei anders aussieht als erwartet. Für die Makro-Fassung gedacht (Anleitung beschreibt Eintragen über »Mein Urlaub«).

**Reparatur (08.10.2026, abends):** Die erste Fassung des Skripts hatte einen Fehler im Suchausdruck. Eine leere Zelle (`<c r="H22" s="10"/>`) »fraß« beim Nachrücken der Stationsliste alles bis zur nächsten Formelzelle mit. Dadurch fehlten in »Einstellungen« die Zellen **I22:L36**, also auch die Formel »Therapeut:innen je Station« in L22:L36. Die Berechnungskette verwies weiter auf diese Formeln, deshalb wollte Excel die Datei bei jedem Öffnen reparieren. Zusätzlich enthielt die ZIP-Datei Ordner-Einträge.
- Skript korrigiert. Es prüft jetzt am Ende, ob in jedem geänderten Blatt gleich viele Zellen und Formeln stehen wie vorher, und schreibt keine Ordner-Einträge mehr.
- Bereits betroffene Dateien (auch eine schon gebaute .xlsm): `python3 excel/einstellungen_reparieren.py <kaputt.xlsx|.xlsm> <ziel.xlsx|.xlsm>` setzt genau die fehlenden Zellen I–L in den Zeilen 22–36 wieder ein (Stil und Formel wie Zeile 21) und entfernt die Ordner-Einträge. Sonst wird nichts geändert. Läuft das Skript auf eine intakte Datei, bricht es mit »bereits in Ordnung« ab.
- Hat Excel eine Datei schon »repariert« und gespeichert, öffnet sie sich wieder ohne Meldung, aber L22:L36 bleiben leer. Dann ebenfalls das Reparatur-Skript ausführen oder in Excel die Formel aus L21 nach unten bis L36 ziehen.

Erzeugt mit `baue_mein_urlaub.py` (Python; ändert die .xlsx direkt im XML, damit Datenüberprüfungen, bedingte Formatierung und Tabelle erhalten bleiben):
`python3 baue_mein_urlaub.py <original.xlsx> <ziel.xlsx> link` bzw. `… makro <makro.bas>`.
Für kleine Änderungen reicht es, direkt in Excel zu arbeiten (vorher Blattschutz aufheben).
