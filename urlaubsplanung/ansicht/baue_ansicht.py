#!/usr/bin/env python3
"""Baut aus dem Quelltext die fertige, einzelne Datei Urlaubsansicht.html.

Aufruf (aus dem Ordner urlaubsplanung/):
    python3 ansicht/baue_ansicht.py

Was passiert: In ansicht/urlaubsansicht.src.html wird der Platzhalter <!--SHEETJS-->
durch die Bibliothek ansicht/xlsx.full.min.js (SheetJS 0.18.5, Apache-2.0) ersetzt.
Optional: ansicht/logo.svg bzw. logo.png wird als Logo in den Kopf eingebettet.
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
# Logo (optional): ansicht/logo.svg oder ansicht/logo.png wird als data:-URI eingebettet,
# damit die Seite eine einzelne Datei ohne Internet bleibt. Fehlt die Datei, bleibt der Kopf ohne Logo.
import base64
logo_html = ""
for name, mime in (("logo.svg", "image/svg+xml"), ("logo.png", "image/png")):
    f = hier / name
    if f.exists():
        logo_html = f'<img class="logo" alt="Logo" src="data:{mime};base64,{base64.b64encode(f.read_bytes()).decode()}">'
        print(f"Logo eingebettet: {name} ({f.stat().st_size // 1024} KB)")
        break
else:
    print("Kein Logo gefunden (ansicht/logo.svg oder ansicht/logo.png) – Kopf ohne Logo.")
src = src.replace("<!--LOGO-->", logo_html)
ziel = hier.parent / "Urlaubsansicht.html"
ziel.write_text(src.replace(platzhalter, "<script>" + lib + "</script>"), encoding="utf-8")
print(f"geschrieben: {ziel} ({ziel.stat().st_size // 1024} KB)")
