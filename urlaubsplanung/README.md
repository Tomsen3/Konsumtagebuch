# Urlaubsplanung Kreativtherapie

- `Urlaubsansicht.html` – **Leitungsansicht** (Dashboard) der Urlaubswünsche (Doppelklick, Excel-Datei wählen). Nur lesend, offline, keine Datenübertragung. Nur im Ordner der Leitung ablegen.
- `Teamansicht.html` – **Übersicht für die Kolleg:innen** (Teamurlaubsplanung je Fachteam/Einsatzort, gleiche Ampel, ohne Bemerkungen/Anspruch/Verschiebbarkeit).
- `Dokumentation_Teamansicht.md` – Bedienung, was bewusst nicht angezeigt wird, Ablage, automatisches Laden.
- `Dokumentation_Urlaubsansicht_Dashboard.md` – Bedienung, Rechenregeln, Entscheidungen, Wartung der Ansicht.
- `Dokumentation_Mein_Urlaub.md` – Excel-Datei `Urlaubswuensche_2027.xlsx` (Blatt »Mein Urlaub«, Teilzeit, freie Tage, Makro-Fassung).
- `makro/` – Makros »WunschEintragen«, »PlanungFreigeben«, »EinrichtungBearbeiten« für die Makro-Fassung (`.bas` zum Importieren, `.txt` zum Einfügen).
- `excel/` – Skript für Änderungen an der Excel-Datei (08.10.2026: StäB entfernt, »Einsatzort 1–5«, Anleitung).
- `ansicht/` – Quelltexte beider Seiten, gemeinsamer Kern `kern.js` und Build-Skript (`python3 ansicht/baue_ansicht.py`).

Die Excel-Dateien selbst liegen bewusst **nicht** hier (Personaldaten), sondern am gemeinsamen Ablageort in Teams/SharePoint.
