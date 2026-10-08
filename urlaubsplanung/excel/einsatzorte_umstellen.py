#!/usr/bin/env python3
"""Änderung vom 08.10.2026 an Urlaubswuensche_2027(_Makro-Vorlage).xlsx – nachvollziehbar und wiederholbar.

Aufruf:  python3 einsatzorte_umstellen.py <quelle.xlsx> <ziel.xlsx>

Was passiert (Wunsch Tom, 08.10.2026):
  1. »StäB« wird aus der Stationsliste (Einstellungen H7:H36) entfernt; die Einträge darunter rücken eine Zeile nach oben.
     Bei »Hensch, Kevin« (Team C17) war StäB eingetragen – die Zelle wird geleert (Entscheidung Tom).
  2. Spaltenüberschriften im Blatt »Team«: »Station 1 … 5« (C4:F4, R4) heißen jetzt »Einsatzort 1 … 5«
     (auch in der Excel-Tabelle »Tabelle1«).
  3. Blatt »Anleitung« und Hinweis im Blatt »Team« verweisen für Kolleg:innen auf die neue »Teamansicht.html«
     statt auf die Leitungsansicht »Urlaubsansicht.html«.
  4. Anleitung »So trage ich meine Wünsche ein« (B5–B11) beschreibt nur noch »Mein Urlaub« + Knopf, weil das Blatt
     »Wünsche« nach dem Makro »PlanungFreigeben« schreibgeschützt ist (gilt für die Makro-Fassung B).

Warum direkt im XML und nicht mit openpyxl: openpyxl würde Knopf (Makro-Fassung), erweiterte Datenüberprüfung
und bedingte Formatierung verwerfen. Hier werden nur die genannten Zellen/Texte geändert, alles andere bleibt Byte für Byte.
Das Skript prüft vorher, ob die Datei so aussieht wie erwartet, und bricht sonst ohne Änderung ab.
"""
import re
import sys
import zipfile
from xml.sax.saxutils import escape

quelle, ziel = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(quelle)
teile = {n: z.read(n) for n in z.namelist()}
infos = {i.filename: i for i in z.infolist()}

wb = teile["xl/workbook.xml"].decode("utf-8")
rels = teile["xl/_rels/workbook.xml.rels"].decode("utf-8")
def blatt(name):
    rid = re.search(r'<sheet name="%s" sheetId="\d+" r:id="(rId\d+)"' % re.escape(name), wb).group(1)
    return "xl/" + re.search(r'Id="%s"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="%s"' % (rid, rid), rels).group(1)
P_ANL, P_TEAM, P_EINST = blatt("Anleitung"), blatt("Team"), blatt("Einstellungen")
X = {p: teile[p].decode("utf-8") for p in (P_ANL, P_TEAM, P_EINST, "xl/sharedStrings.xml", "xl/tables/table1.xml")}

sst = X["xl/sharedStrings.xml"]
si = re.findall(r"<si>.*?</si>", sst, re.S)
def text(i): return "".join(re.findall(r"<t[^>]*>(.*?)</t>", si[i], re.S)).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
neu = []
def neuer_text(t):
    neu.append('<si><t xml:space="preserve">%s</t></si>' % escape(t))
    return len(si) + len(neu) - 1

def zelle(p, ref):
    m = re.search(r'<c r="%s"(?: [^>]*)?(?:/>|>.*?</c>)' % ref, X[p], re.S)
    if not m: raise SystemExit(f"Zelle {ref} in {p} nicht gefunden – Datei hat ein anderes Layout, nichts geändert.")
    return m
def str_index(p, ref):
    m = re.search(r't="s"><v>(\d+)</v>', zelle(p, ref).group(0))
    return int(m.group(1)) if m else None
def setze_index(p, ref, idx):
    m = zelle(p, ref); s = re.search(r' s="(\d+)"', m.group(0))
    stil = f' s="{s.group(1)}"' if s else ""
    neu_c = f'<c r="{ref}"{stil} t="s"><v>{idx}</v></c>' if idx is not None else f'<c r="{ref}"{stil}/>'
    X[p] = X[p][:m.start()] + neu_c + X[p][m.end():]

# --- Prüfungen: sieht die Datei aus wie erwartet? ---
erwartet = {("H7", P_EINST): "StäB", ("C17", P_TEAM): "StäB", ("C4", P_TEAM): "Station 1", ("D4", P_TEAM): "Station 2",
            ("E4", P_TEAM): "Station 3", ("F4", P_TEAM): "Station 4", ("R4", P_TEAM): "Station 5"}
for (ref, p), t in erwartet.items():
    i = str_index(p, ref)
    if i is None or text(i) != t: raise SystemExit(f"{p} {ref}: erwartet »{t}«, gefunden »{text(i) if i is not None else 'leer'}« – nichts geändert.")
if re.search(r"<c r=\"[IJK]7\"[^>]*>", X[P_EINST]) and re.search(r'<c r="[IJK]7"[^/]*><v>', X[P_EINST]):
    raise SystemExit("Einstellungen I7:K7 (Ampelwerte StäB) sind nicht leer – bitte von Hand prüfen, nichts geändert.")

# --- 1. StäB aus der Stationsliste: H8:H36 rücken nach H7:H35 (Ampelwerte I–K sind in diesen Zeilen leer) ---
werte = [str_index(P_EINST, f"H{r}") for r in range(8, 37)]
for r, v in zip(range(7, 36), werte): setze_index(P_EINST, f"H{r}", v)
setze_index(P_EINST, "H36", None)
setze_index(P_TEAM, "C17", None)

# --- 2. Spaltenüberschriften Team ---
for ref, n in (("C4", 1), ("D4", 2), ("E4", 3), ("F4", 4), ("R4", 5)):
    setze_index(P_TEAM, ref, neuer_text(f"Einsatzort {n}"))
    X["xl/tables/table1.xml"] = X["xl/tables/table1.xml"].replace(f'name="Station {n}"', f'name="Einsatzort {n}"', 1)

# --- 3. Texte: Anleitung → Teamansicht, Einsatzorte ---
def ersetze(p, ref, alt, neu_t):
    t = text(str_index(p, ref))
    if alt not in t: raise SystemExit(f"{p} {ref}: Text »{alt}« nicht gefunden – nichts geändert.")
    setze_index(p, ref, neuer_text(t.replace(alt, neu_t)))
ersetze(P_ANL, "B2", "auf einer Station eng wird, öffnet die Ansicht »Urlaubsansicht.html«", "an einem Einsatzort eng wird, öffnet die »Teamansicht.html«")
ersetze(P_ANL, "B9", "zeigt die Urlaubsansicht", "zeigt die Teamansicht")
ersetze(P_ANL, "B13", "die Urlaubsansicht (Urlaubsansicht.html)", "die Teamansicht (Teamansicht.html)")
ersetze(P_ANL, "B14", "Datei Urlaubsansicht.html", "Datei Teamansicht.html")
ersetze(P_ANL, "B16", "Filtern nach Fachrichtung, Station oder Person; Wochen- oder Tagesansicht wählen.", "Oben das eigene Team wählen (Fachteam oder Einsatzort), dann Zeitraum und Wochen- oder Tagesraster.")
ersetze(P_ANL, "B27", "bis zu 4 Stationen", "bis zu 5 Einsatzorten (Spalten C–F und R)")
ersetze(P_ANL, "B28", "Die Urlaubsansicht liest", "Die Ansichten (Team- und Urlaubsansicht) lesen")
ersetze(P_ANL, "B32", "Für die Urlaubsansicht", "Für die Ansichten")
ersetze(P_ANL, "B33", "Die Urlaubsansicht kann", "Die Ansichten können")
ersetze(P_ANL, "B34", "Zugriff nur fürs Team.", "Zugriff nur fürs Team. Die Leitungsansicht »Urlaubsansicht.html« liegt nicht im Team-Ordner, sondern nur bei der Leitung.")
# 4. Eintragen nur noch über »Mein Urlaub« (Blatt »Wünsche« ist nach der Freigabe nur lesbar)
def setze_text(p, ref, t): setze_index(p, ref, neuer_text(t))
if not text(str_index(P_ANL, "B6")).startswith("2.  Spalte A: eigenen Namen"):
    raise SystemExit("Anleitung B6 sieht anders aus als erwartet – nichts geändert.")
setze_text(P_ANL, "B5", "1.  Reiter »Mein Urlaub« (grün) öffnen und den eigenen Namen wählen. Für JEDEN Urlaubsblock einen eigenen Wunsch eintragen – z. B. 3 Wünsche für »2 Wochen Sommer, 1 Woche Herbst, Brückentag im Mai«.")
setze_text(P_ANL, "B6", "2.  In den gelben Feldern Von / Bis eintragen, z. B. 12.07.2027. Ein einzelner Tag: Von = Bis.")
setze_text(P_ANL, "B7", "3.  Verschiebbar? ja = ich bin flexibel · etwas = ein paar Tage gehen · nein = Termin steht fest (z. B. gebuchte Reise). Das hilft bei der Absprache.")
setze_text(P_ANL, "B8", "4.  Auf »Wunsch eintragen« klicken. Der Wunsch steht dann im Blatt »Wünsche« – dort sieht man alle Wünsche, ändern kann man dort nichts.")
setze_text(P_ANL, "B9", "5.  Ob es im Team eng wird, zeigt die Teamansicht (siehe unten) – am besten vor dem Eintragen nachsehen.")
setze_text(P_ANL, "B10", "6.  Wunsch ändern oder streichen: bitte der Leitung Bescheid geben.")
ersetze(P_TEAM, "A2", "Fachrichtung und Stationen aus der Liste", "Fachrichtung und Einsatzorte aus der Liste")

# Shared Strings: neue Texte anhängen, Zähler anpassen (count = Anzahl Verweise; Excel korrigiert ihn sonst selbst)
sst = sst.replace("</sst>", "".join(neu) + "</sst>")
uc = len(si) + len(neu)
cnt = sum(len(re.findall(r't="s"><v>', X[p])) for p in (P_ANL, P_TEAM, P_EINST)) + sum(
    len(re.findall(r't="s"><v>', teile[n].decode("utf-8"))) for n in teile if n.startswith("xl/worksheets/sheet") and n not in (P_ANL, P_TEAM, P_EINST))
sst = re.sub(r'count="\d+" uniqueCount="\d+"', f'count="{cnt}" uniqueCount="{uc}"', sst, count=1)
X["xl/sharedStrings.xml"] = sst

with zipfile.ZipFile(ziel, "w") as out:
    for n in z.namelist():
        daten = X[n].encode("utf-8") if n in X else teile[n]
        out.writestr(infos[n], daten, compress_type=zipfile.ZIP_DEFLATED)
print(f"geschrieben: {ziel}")
