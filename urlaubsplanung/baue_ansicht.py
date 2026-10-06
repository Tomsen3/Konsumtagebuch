"""Baut Urlaubsansicht.html aus ansicht/urlaubsansicht.src.html und bettet SheetJS (Excel-Leser) ein.

Aufruf:  python3 baue_ansicht.py
Ergebnis ist eine einzelne HTML-Datei, die ohne Internet und ohne Server funktioniert.
"""
from pathlib import Path

hier = Path(__file__).parent
src = (hier / "ansicht" / "urlaubsansicht.src.html").read_text(encoding="utf-8")
lib = (hier / "ansicht" / "vendor" / "xlsx.mini.min.js").read_text(encoding="utf-8")
assert "</script" not in lib.lower()
platzhalter = "/*__SHEETJS__*/"
assert src.count(platzhalter) == 1
(hier / "Urlaubsansicht.html").write_text(src.replace(platzhalter, lib), encoding="utf-8")
print("gespeichert: Urlaubsansicht.html")
