#!/usr/bin/env python3
"""Reparatur vom 08.10.2026 für Dateien, die mit der ersten Fassung von einsatzorte_umstellen.py erzeugt wurden.

Aufruf:  python3 einstellungen_reparieren.py <kaputt.xlsx|.xlsm> <ziel.xlsx|.xlsm>

Fehler: Ein zu gieriger Suchausdruck im Skript hat beim Nachrücken der Stationsliste in »Einstellungen«
die Zellen I22:L36 gelöscht (leere Ampelzellen I–K und die Formel »Therapeut:innen je Station« in L).
Die Berechnungskette (xl/calcChain.xml) verwies weiter auf die Formeln L22:L36 → Excel meldete beim Öffnen
»Problem mit einigen Inhalten … reparieren?«. Außerdem enthielt die ZIP-Datei Ordner-Einträge (»xl/« usw.),
die in Excel-Dateien nicht vorkommen.

Was passiert:
  - In »Einstellungen« bekommt jede Zeile 22–36, in der I–L fehlen, die Zellen zurück – Stil wie Zeile 21,
    Formel wie in L21 (nur die Zeilennummer angepasst). Nur fehlende Zellen werden ergänzt, nichts überschrieben.
  - Ordner-Einträge werden aus der ZIP-Datei entfernt.
  - Alles andere bleibt Byte für Byte (Knopf, Makro bei .xlsm, Datenüberprüfung, bedingte Formatierung).
Das Skript prüft vorher, ob die Datei so aussieht wie erwartet, und bricht sonst ohne Änderung ab.
"""
import re
import sys
import zipfile

quelle, ziel = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(quelle)
namen = [n for n in z.namelist() if not n.endswith("/")]
teile = {n: z.read(n) for n in namen}
infos = {i.filename: i for i in z.infolist()}

wb = teile["xl/workbook.xml"].decode("utf-8")
rels = teile["xl/_rels/workbook.xml.rels"].decode("utf-8")
rid = re.search(r'<sheet name="Einstellungen" sheetId="\d+" r:id="(rId\d+)"', wb).group(1)
P = "xl/" + re.search(r'Id="%s"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="%s"' % (rid, rid), rels).group(1)
x = teile[P].decode("utf-8")

def zeile(r):
    m = re.search(r'<row r="%d"[^>]*>.*?</row>' % r, x, re.S)
    if not m: raise SystemExit(f"Einstellungen Zeile {r} nicht gefunden – nichts geändert.")
    return m

# Vorlage aus Zeile 21: Stil von I–K und L, Formel von L
z21 = zeile(21).group(0)
stil = {}
for sp in "IJKL":
    m = re.search(r'<c r="%s21"(?: s="(\d+)")?' % sp, z21)
    if not m: raise SystemExit(f"Einstellungen {sp}21 fehlt – Datei sieht anders aus als erwartet, nichts geändert.")
    stil[sp] = f' s="{m.group(1)}"' if m.group(1) else ""
formel = re.search(r'<c r="L21"[^>]*><f>(.*?)</f>', z21)
if not formel or "H21" not in formel.group(1):
    raise SystemExit("Einstellungen L21 hat nicht die erwartete Formel – nichts geändert.")
formel = formel.group(1)

ergaenzt = []
for r in range(22, 37):
    m = zeile(r); alt = m.group(0)
    vorhanden = set(re.findall(r'<c r="([IJKL])%d"' % r, alt))
    if vorhanden == set("IJKL"): continue
    if vorhanden: raise SystemExit(f"Einstellungen Zeile {r}: nur teilweise vorhanden ({sorted(vorhanden)}) – bitte von Hand prüfen, nichts geändert.")
    h = re.search(r'<c r="H%d"(?: [^>/]*)?(?:/>|>.*?</c>)' % r, alt, re.S)
    if not h: raise SystemExit(f"Einstellungen H{r} fehlt – nichts geändert.")
    neu_c = "".join(f'<c r="{sp}{r}"{stil[sp]}/>' for sp in "IJK")
    neu_c += f'<c r="L{r}"{stil["L"]} t="str"><f>{formel.replace("H21", f"H{r}")}</f><v></v></c>'
    neu = alt[:h.end()] + neu_c + alt[h.end():]
    x = x[:m.start()] + neu + x[m.end():]
    ergaenzt.append(r)

ordner = [n for n in z.namelist() if n.endswith("/")]
if not ergaenzt and not ordner:
    raise SystemExit("Datei ist bereits in Ordnung – nichts geändert.")
teile[P] = x.encode("utf-8")

with zipfile.ZipFile(ziel, "w") as out:
    for n in namen:
        out.writestr(infos[n], teile[n], compress_type=zipfile.ZIP_DEFLATED)
print(f"Zeilen ergänzt: {ergaenzt or 'keine'} · Ordner-Einträge entfernt: {len(ordner)}")
print(f"geschrieben: {ziel}")
