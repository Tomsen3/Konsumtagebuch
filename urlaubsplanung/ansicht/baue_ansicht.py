#!/usr/bin/env python3
"""Baut aus den Quelltexten die fertigen, einzelnen HTML-Dateien.

Aufruf (aus dem Ordner urlaubsplanung/):
    python3 ansicht/baue_ansicht.py

Ergebnis (je eine Datei, die ohne Internet funktioniert):
    ../Urlaubsansicht.html  – Leitung (aus ansicht/urlaubsansicht.src.html)
    ../Teamansicht.html     – Kolleg:innen (aus ansicht/teamansicht.src.html)

Was passiert in jedem Quelltext:
    <!--KERN-->   → ansicht/kern.js (Excel einlesen + Ampel berechnen, gemeinsam für beide Seiten)
    <!--SHEETJS--> → ansicht/xlsx.full.min.js (SheetJS 0.18.5, Apache-2.0)
    <!--LOGO-->   → ansicht/logo.svg bzw. logo.png als eingebettetes Bild (optional)
"""
import base64
from pathlib import Path

hier = Path(__file__).resolve().parent
lib = (hier / "xlsx.full.min.js").read_text(encoding="utf-8")
kern = (hier / "kern.js").read_text(encoding="utf-8")
for name, inhalt in (("xlsx.full.min.js", lib), ("kern.js", kern)):
    if "</script" in inhalt.lower():
        raise SystemExit(f"{name} enthält '</script' – Einbetten würde die Seite zerstören.")

# Logo (optional): wird als data:-URI eingebettet, damit jede Seite eine einzelne Datei ohne Internet bleibt.
logo_html = ""
for name, mime in (("logo.svg", "image/svg+xml"), ("logo.png", "image/png")):
    f = hier / name
    if f.exists():
        logo_html = f'<img class="logo" alt="PP.rt – Klinik für Psychiatrie und Psychosomatik Reutlingen" src="data:{mime};base64,{base64.b64encode(f.read_bytes()).decode()}">'
        print(f"Logo eingebettet: {name} ({f.stat().st_size // 1024} KB)")
        break
else:
    print("Kein Logo gefunden (ansicht/logo.svg oder ansicht/logo.png) – Kopf ohne Logo.")

SEITEN = (("urlaubsansicht.src.html", "Urlaubsansicht.html"), ("teamansicht.src.html", "Teamansicht.html"))
for quelle, ziel_name in SEITEN:
    src = (hier / quelle).read_text(encoding="utf-8")
    for platzhalter in ("<!--SHEETJS-->", "<!--KERN-->"):
        if src.count(platzhalter) != 1:
            raise SystemExit(f"{quelle}: Platzhalter {platzhalter} muss genau einmal im Quelltext stehen.")
    src = src.replace("<!--LOGO-->", logo_html)
    src = src.replace("<!--KERN-->", kern)
    src = src.replace("<!--SHEETJS-->", "<script>" + lib + "</script>")
    ziel = hier.parent / ziel_name
    ziel.write_text(src, encoding="utf-8")
    print(f"geschrieben: {ziel} ({ziel.stat().st_size // 1024} KB)")
