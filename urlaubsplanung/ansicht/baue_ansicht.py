#!/usr/bin/env python3
"""Baut aus dem Quelltext die fertige, einzelne Datei Urlaubsansicht.html.

Aufruf (aus dem Ordner urlaubsplanung/):
    python3 ansicht/baue_ansicht.py

Was passiert: In ansicht/urlaubsansicht.src.html wird der Platzhalter <!--SHEETJS-->
durch die Bibliothek ansicht/xlsx.full.min.js (SheetJS 0.18.5, Apache-2.0) ersetzt.
Ergebnis: ../Urlaubsansicht.html – eine Datei, die ohne Internet funktioniert.
"""
from pathlib import Path

hier = Path(__file__).resolve().parent
src = (hier / "urlaubsansicht.src.html").read_text(encoding="utf-8")
lib = (hier / "xlsx.full.min.js").read_text(encoding="utf-8")
platzhalter = "<!--SHEETJS-->"
if src.count(platzhalter) != 1:
    raise SystemExit(f"Platzhalter {platzhalter} muss genau einmal im Quelltext stehen.")
if "</script" in lib.lower():
    raise SystemExit("Bibliothek enthält '</script' – Einbetten würde die Seite zerstören.")
ziel = hier.parent / "Urlaubsansicht.html"
ziel.write_text(src.replace(platzhalter, "<script>" + lib + "</script>"), encoding="utf-8")
print(f"geschrieben: {ziel} ({ziel.stat().st_size // 1024} KB)")
