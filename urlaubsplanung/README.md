# Urlaubsplaner Kreativtherapie-Team

Excel-Datei für ca. 35 Therapeut:innen aus verschiedenen Fachrichtungen (Ergo-, Musik-, Bewegungstherapie u. a.),
die auf mehreren Stationen arbeiten. Alle tragen ihre Urlaubswünsche selbst ein. Die Datei zeigt, ob an einem Tag
**im eigenen Fachteam** oder **auf einer der eigenen Stationen** schon zu viele Personen weg sind.

Es handelt sich ausdrücklich **nicht** um ein Genehmigungsverfahren. Die Datei dient der Absprache untereinander.

## Dateien

| Datei | Zweck |
|---|---|
| `Urlaubsplaner_Kreativtherapie.xlsx` | Die eigentliche Arbeitsdatei, mit Beispieldaten (grau, vor dem Start löschen) |
| `erzeuge_urlaubsplaner.py` | Generator-Skript. Nur nötig, um die Datei neu zu erzeugen (z. B. mit mehr Zeilen) |
| `README.md` | Diese Dokumentation |

Die Bedienungsanleitung für das Team steht im Blatt **»Anleitung«** der Excel-Datei selbst.

## Rahmenbedingungen und Entscheidungen

| Vorgabe / Frage | Entscheidung | Begründung |
|---|---|---|
| Kein Server, keine externe IT | Eine einzige Excel-Datei, keine Makros, keine Add-ins | Läuft überall, wo Excel vorhanden ist; Makros werden in Kliniknetzen oft blockiert |
| Mehrere Personen tragen ein | Ablage in Teams/SharePoint/OneDrive der Klinik (gleichzeitiges Bearbeiten). Notlösung: Netzlaufwerk | Auf dem Netzlaufwerk sperrt Excel die Datei für andere, solange sie offen ist |
| Zwei Ebenen: Fachteam und Station | Je Fachrichtung und je Station eine Grenze »max. gleichzeitig im Urlaub« | Eine einfache Zahl ist für alle verständlich und leicht anzupassen |
| Eine Person auf mehreren Stationen | Bis zu 4 Stationen je Person; jede Station zählt die Person voll | Wer im Urlaub ist, fehlt auf allen seinen Stationen |
| Welche Einträge zählen? | Alle, egal welcher Status (Wunsch/abgesprochen/eingereicht) | Ziel ist, Engpässe früh zu sehen – auch bei bloßen Wünschen |
| Eingabe | Liste »Urlaub« (eine Zeile pro Zeitraum), Kalender rechnet daraus | Einfache Eingabe, keine Formeln im Kalender überschreibbar |
| HTML-/Web-Lösung? | Verworfen | Ein Browser kann ohne Server keine gemeinsame Datei zuverlässig beschreiben |
| Alte »Arbeitsmappe freigeben«-Funktion von Excel | Nicht verwendet | Veraltet, fehleranfällig, von Microsoft nicht mehr empfohlen |

## Aufbau der Datei

| Blatt | Wer bearbeitet? | Inhalt |
|---|---|---|
| Anleitung | – | Bedienung für das Team, Einrichtung, Ablage |
| Urlaub | alle | Eingabe: Name, Von, Bis, Status, Bemerkung. Rechnet Arbeitstage, Engpass-Tage, Hinweis |
| Kalender | niemand (schreibgeschützt ohne Passwort) | Eine Zeile pro Person, eine Spalte pro Tag (366 Tage), darunter Summen je Fachrichtung und Station mit Ampel |
| Team | verantwortliche Person | Name, Fachrichtung, Station 1–4 |
| Einstellungen | verantwortliche Person | Startdatum, Fachrichtungen + Grenze, Stationen + Grenze, Feiertage |
| Konflikt | niemand (ausgeblendet) | Hilfsrechnung: je Person und Tag 0 = ok, 1 = Fachteam über Grenze, 2 = Station über Grenze, 3 = beides |

**Ampel im Kalender (Summenzeilen):** Grün = unter Grenze · Gelb = Grenze erreicht · Rot = Grenze überschritten.
In den Personenzeilen ist »U« blau (Urlaub) oder rot (Urlaub an einem Tag mit Engpass).

**Grenze leer** = keine Grenze für dieses Team bzw. diese Station.

## Kapazität

60 Personen, 10 Fachrichtungen, 30 Stationen, 600 Urlaubseinträge, 4 Stationen je Person, 34 Feiertage, 366 Tage.
Mehr nötig: Konstanten oben in `erzeuge_urlaubsplaner.py` erhöhen, Skript ausführen, Daten aus der alten Datei in die
neue kopieren (Blätter Einstellungen, Team, Urlaub – jeweils nur die gelben Eingabebereiche).

```
python3 erzeuge_urlaubsplaner.py 2028-01-01   # Startdatum optional, Standard 01.01.2027
```

Benötigt Python 3 mit `openpyxl` und `python-dateutil`.

## Jahreswechsel

1. Datei kopieren und umbenennen (z. B. `Urlaubsplaner_2028.xlsx`).
2. Blatt »Einstellungen«: Startdatum (B3) ändern, Feiertage aktualisieren.
3. Blatt »Urlaub«: alte Einträge markieren → Entf (Inhalte löschen, nicht Zeilen löschen).

## Bekannte Grenzen

- Excel-Datei auf einem Netzlaufwerk: immer nur eine Person gleichzeitig kann speichern.
- Doppelte Namen im Blatt »Team« werden rot markiert, aber nicht verhindert. Sie verfälschen die Zählung.
- Einträge, die außerhalb des Planungszeitraums liegen, werden nur innerhalb des Zeitraums gezählt (Hinweis erscheint).
- Teilzeit, halbe Tage oder Fortbildungen werden nicht gesondert berücksichtigt. Fortbildungen kann man als eigenen
  Eintrag mit Bemerkung »Fortbildung« erfassen – sie zählen dann wie Urlaub als Abwesenheit.
- Landesspezifische Feiertage sind nicht vorbelegt (nur bundesweite), da das Bundesland nicht festgelegt ist.

## Datenschutz

Urlaubszeiten sind personenbezogene Daten. Datei nur im Klinik-System ablegen und den Zugriff auf das Team
beschränken. Ob ein solcher gemeinsamer Plan mit dem Personalrat/Betriebsrat abzustimmen ist, sollte die Leitung klären.
