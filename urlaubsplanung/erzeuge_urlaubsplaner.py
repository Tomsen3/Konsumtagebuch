"""Erzeugt Urlaubswuensche_Kreativtherapie.xlsx – die Eingabedatei für die Jahresurlaubsplanung.

Die grafische Auswertung (Ampel, Filter, Engpässe) macht Urlaubsansicht.html, die diese Datei nur liest.

Aufruf:
  python3 erzeuge_urlaubsplaner.py                         → Vorlage mit Beispieldaten (Start 01.01.2027)
  python3 erzeuge_urlaubsplaner.py --start 2028-01-01      → anderes Planungsjahr
  python3 erzeuge_urlaubsplaner.py --namen team_namen.txt --aus Urlaubswuensche_2027.xlsx
        → echte Arbeitsdatei: Namen (eine Zeile pro Person) ins Blatt Team, ohne Beispieldaten

Echte Namen sind personenbezogene Daten: Namensliste und erzeugte Arbeitsdatei NICHT ins Repository legen
(team_namen*.txt und Urlaubswuensche_20*.xlsx stehen in .gitignore).

WICHTIG: Urlaubsansicht.html findet die Daten über Blattnamen und feste Zeilen/Spalten (siehe Konstanten unten
und README.md). Wer hier das Layout ändert, muss die Konstanten LAYOUT in Urlaubsansicht.html mit anpassen.
"""
import argparse
from datetime import date, timedelta

from dateutil.easter import easter
from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter as col
from openpyxl.worksheet.datavalidation import DataValidation

ap = argparse.ArgumentParser(description="Erzeugt die Excel-Eingabedatei für die Urlaubswünsche.")
ap.add_argument("--start", default="2027-01-01", help="Startdatum des Planungszeitraums (JJJJ-MM-TT)")
ap.add_argument("--namen", help="Textdatei mit den Namen des Teams, eine Person pro Zeile (ohne Beispieldaten)")
ap.add_argument("--aus", default="Urlaubswuensche_Kreativtherapie.xlsx", help="Name der erzeugten Datei")
ARGS = ap.parse_args()
START = date.fromisoformat(ARGS.start)
NAMEN = None
if ARGS.namen:
    with open(ARGS.namen, encoding="utf-8") as fh:
        NAMEN = [z.strip() for z in fh if z.strip() and not z.lstrip().startswith("#")]
TAGE = 366

# Kapazitäten
N_PERS, N_FACH, N_STAT, N_FEIER, N_WUNSCH, N_ST_PRO_PERS = 60, 10, 30, 34, 600, 4

S_A, S_W, S_T, S_E = "Anleitung", "Wünsche", "Team", "Einstellungen"


def q(s):
    return f"'{s}'!"


W, T, E = q(S_W), q(S_T), q(S_E)

# ---------- Layout (muss zu LAYOUT in Urlaubsansicht.html passen) ----------
P0, P1 = 5, 5 + N_PERS - 1          # Team: Datenzeilen
U0, U1 = 6, 6 + N_WUNSCH - 1        # Wünsche: Datenzeilen
E0 = 7                              # Einstellungen: erste Datenzeile der Listen
COL_ANSPRUCH = 3 + N_ST_PRO_PERS    # Team: Spalte G

E_START, E_ENDE = f"{E}$B$3", f"{E}$B$4"
E_FEIER = f"{E}$N${E0}:$N${E0 + N_FEIER - 1}"
TEAM_NAMEN = f"{T}$A${P0}:$A${P1}"

# ---------- Stil ----------
FONT = "Arial"
NAVY = "1F3864"
f_norm = Font(name=FONT, size=10)
f_bold = Font(name=FONT, size=10, bold=True)
f_head = Font(name=FONT, size=10, bold=True, color="FFFFFF")
f_title = Font(name=FONT, size=16, bold=True, color=NAVY)
f_sub = Font(name=FONT, size=9, color="595959")
f_small = Font(name=FONT, size=8, color="595959")
f_input = Font(name=FONT, size=10, color="0000FF")
f_calc = Font(name=FONT, size=10, color="404040")
f_sec = Font(name=FONT, size=11, bold=True, color=NAVY)
fill_head = PatternFill("solid", fgColor=NAVY)
fill_input = PatternFill("solid", fgColor="FFF8E1")
fill_calc = PatternFill("solid", fgColor="F4F4F4")
fill_ex = PatternFill("solid", fgColor="E7E6E6")
fill_sec = PatternFill("solid", fgColor="D9E1F2")
thin = Side(style="thin", color="D0D0D0")
box = Border(left=thin, right=thin, top=thin, bottom=thin)
center = Alignment(horizontal="center", vertical="center")


def fill(hex_):
    return PatternFill("solid", fgColor=hex_, bgColor=hex_)


# Gleiche Reihenfolge wie FACH_FARBEN in Urlaubsansicht.html
FACH_FARBEN = ["4E79A7", "B07AA1", "76B7B2", "9C755F", "F28E2B",
               "59A1A0", "D37295", "8E8CD8", "6A9FCB", "A08C7D"]
ROT, GELB, GRUEN = fill("FFC7CE"), fill("FFEB9C"), fill("C6EFCE")
F_ROT, F_GELB, F_GRUEN = Font(color="9C0006", bold=True), Font(color="9C5700"), Font(color="006100")


def head(ws, row, labels, start_col=1, widths=None, height=None):
    for i, text in enumerate(labels):
        c = ws.cell(row=row, column=start_col + i, value=text)
        c.font, c.fill, c.border = f_head, fill_head, box
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        if widths:
            ws.column_dimensions[col(start_col + i)].width = widths[i]
    if height:
        ws.row_dimensions[row].height = height


def cells(ws, rng, fnt, fll):
    for row in ws[rng]:
        for c in row:
            c.font, c.fill, c.border = fnt, fll, box


def titel(ws, text, sub):
    ws.sheet_view.showGridLines = False
    ws["A1"], ws["A2"] = text, sub
    ws["A1"].font, ws["A2"].font = f_title, f_sub
    ws.row_dimensions[1].height = 26


wb = Workbook()

# =====================================================================
# Anleitung
# =====================================================================
wa = wb.active
wa.title = S_A
wa.sheet_view.showGridLines = False
wa.column_dimensions["A"].width = 3
wa.column_dimensions["B"].width = 118
zeilen = [
    ("t", "Urlaubswünsche Kreativtherapie – Jahresplanung"),
    ("s", "In dieser Datei sammeln wir unsere Urlaubswünsche für das ganze Jahr. Das ist keine Genehmigung: Die Planung "
          "überträgt die Wünsche später ins ATOSS. Wer sehen will, wo es im Fachteam oder auf einer Station eng wird, "
          "öffnet die Ansicht »Urlaubsansicht.html« (liegt im selben Ordner)."),
    ("h", "So trage ich meine Wünsche ein"),
    ("p", "1.  Blatt »Wünsche« öffnen. Für JEDEN Urlaubsblock eine eigene Zeile – z. B. 3 Zeilen für "
          "»2 Wochen Sommer, 1 Woche Herbst, Brückentag im Mai«."),
    ("p", "2.  Spalte A: eigenen Namen aus der Liste wählen (bitte nicht tippen)."),
    ("p", "3.  Von / Bis eintragen, z. B. 12.07.2027. Ein einzelner Tag: Von = Bis."),
    ("p", "4.  Verschiebbar? ja = ich bin flexibel · etwas = ein paar Tage gehen · nein = Termin steht fest "
          "(z. B. gebuchte Reise). Das hilft bei der Absprache."),
    ("p", "5.  Die grauen Spalten rechnen von selbst (Wunsch-Nr., Arbeitstage, Hinweis). »ok« heißt: Eingabe ist "
          "vollständig. Ob es einen Engpass gibt, zeigt die Urlaubsansicht."),
    ("p", "6.  Wunsch ändern: Von/Bis überschreiben. Wunsch fällt weg: Zellen A–E der Zeile markieren → Entf."),
    ("p", "7.  Speichern und schließen."),
    ("h", "So nutze ich die Urlaubsansicht (Urlaubsansicht.html)"),
    ("p", "1.  Datei Urlaubsansicht.html doppelklicken – sie öffnet sich im Browser (Edge, Chrome oder Firefox)."),
    ("p", "2.  »Excel-Datei laden« klicken und diese Datei auswählen (oder per Maus ins Fenster ziehen)."),
    ("p", "3.  Filtern nach Fachrichtung, Station oder Person; Wochen- oder Tagesansicht wählen."),
    ("p", "4.  Ampel: Grün = noch Platz · Gelb = Grenze erreicht, keiner mehr dazu · Rot = Grenze überschritten. "
          "Ein Klick auf ein Feld zeigt, wer in dieser Zeit weg ist."),
    ("p", "5.  Die Ansicht liest nur – sie verändert die Excel-Datei nicht. Nach neuen Einträgen auf »Neu laden« klicken."),
    ("h", "Für die Planung: Übernahme ins ATOSS"),
    ("p", "•  Filter in der Kopfzeile von »Wünsche« nutzen (z. B. nach Name oder Datum sortieren)."),
    ("p", "•  Nach dem Übertragen in Spalte J das Datum eintragen. Die Zeile wird grau – so sieht man, was erledigt ist."),
    ("p", "•  Stichtag für die Wünsche im Team bekannt geben (z. B. 30.11.), danach übertragen."),
    ("h", "Einrichtung (einmalig, durch die verantwortliche Person)"),
    ("p", "1.  »Einstellungen«: Startdatum (B3), Fachrichtungen und Stationen mit ihren Ampel-Werten (ab wie vielen Abwesenden gelb/hellrot/dunkelrot), "
          "Feiertage. Die Feiertage für Baden-Württemberg sind vorbelegt – Schließtage bei Bedarf ergänzen. Ampel-Werte leer: "
          "Station = Standardregel, Fachteam = keine Ampel."),
    ("p", "2.  »Team«: alle Therapeut:innen mit Fachrichtung, bis zu 4 Stationen und (optional) Urlaubsanspruch. "
          "Jeder Name nur einmal."),
    ("p", "3.  Beispieldaten (graue Zeilen) in »Team« und »Wünsche« markieren → Entf. NICHT ›Zeilen löschen‹ und keine "
          "Zeilen/Spalten einfügen: Die Urlaubsansicht liest feste Zeilen und Spalten."),
    ("p", "4.  Neues Jahr: Datei kopieren, Startdatum ändern, alte Wünsche löschen, Feiertage aktualisieren."),
    ("h", "Ablage"),
    ("p", "•  Am besten in Teams / SharePoint / OneDrive der Klinik: Dann können mehrere gleichzeitig eintragen. "
          "Für die Urlaubsansicht die Datei über den synchronisierten Ordner (OneDrive im Explorer) auswählen oder "
          "vorher herunterladen."),
    ("p", "•  Nur Netzlaufwerk: Excel sperrt die Datei, solange jemand sie offen hat. Also: öffnen, eintragen, "
          "speichern, sofort schließen. Die Urlaubsansicht kann die Datei trotzdem jederzeit lesen."),
    ("p", "•  Urlaubszeiten sind personenbezogene Daten: nur im Klinik-System ablegen, Zugriff nur fürs Team."),
]
r = 1
for typ, text in zeilen:
    if typ == "h":
        r += 1
    c = wa.cell(r, 2, text)
    c.alignment = Alignment(wrap_text=True, vertical="top")
    if typ == "t":
        c.font = f_title
        wa.row_dimensions[r].height = 28
    elif typ == "s":
        c.font = Font(name=FONT, size=10, italic=True, color="404040")
        wa.row_dimensions[r].height = 42
    elif typ == "h":
        c.font, c.fill = f_sec, fill_sec
        wa.row_dimensions[r].height = 20
    elif len(text) > 120:
        wa.row_dimensions[r].height = 27
    r += 1

# =====================================================================
# Wünsche
# =====================================================================
ww = wb.create_sheet(S_W)
titel(ww, "Urlaubswünsche", "Für jeden Urlaubsblock eine eigene Zeile – mehrere Wünsche pro Person sind erwünscht. "
                            "Hellgelb ausfüllen, grau rechnet von selbst.")
ww["A3"] = "Nur Wünsche, keine Genehmigung. Engpässe zeigt die Urlaubsansicht (Urlaubsansicht.html)."
ww["A3"].font = f_small
ww["A4"], ww["F4"], ww["J4"] = "Ich trage ein", "wird berechnet", "Planung"
for c in ("A4", "F4", "J4"):
    ww[c].font = f_small
head(ww, 5, ["Name", "Von", "Bis", "Verschiebbar?", "Bemerkung / Absprache", "Fachrichtung", "Wunsch\nNr.",
             "Arbeits-\ntage", "Hinweis", "In ATOSS\nübertragen am"],
     1, [22, 12, 12, 13, 34, 18, 10, 9, 34, 14], height=34)
cells(ww, f"A{U0}:E{U1}", f_input, fill_input)
cells(ww, f"F{U0}:I{U1}", f_calc, fill_calc)
cells(ww, f"J{U0}:J{U1}", f_input, fill_input)
y = START.year
beispiel_w = [] if NAMEN else [
    ("Beispiel Anna", date(y, 7, 5), date(y, 7, 23), "etwas", "mit Ben getauscht"),
    ("Beispiel Anna", date(y, 10, 25), date(y, 10, 29), "ja", ""),
    ("Beispiel Anna", date(y, 12, 27), date(y, 12, 31), "nein", ""),
    ("Beispiel Ben", date(y, 7, 26), date(y, 8, 13), "ja", ""),
    ("Beispiel Ben", date(y, 5, 7), date(y, 5, 7), "ja", "Brückentag"),
    ("Beispiel Clara", date(y, 8, 2), date(y, 8, 20), "etwas", ""),
    ("Beispiel David", date(y, 7, 12), date(y, 7, 30), "nein", "Reise gebucht"),
    ("Beispiel David", date(y, 3, 30), date(y, 4, 2), "ja", ""),
    ("Beispiel Eva", date(y, 10, 11), date(y, 10, 22), "etwas", ""),
    ("Beispiel Finn", date(y, 7, 19), date(y, 7, 30), "ja", "Station 1 wäre dann zu dünn – klären"),
    ("Beispiel Gül", date(y, 8, 16), date(y, 9, 3), "nein", ""),
    ("Beispiel Hana", date(y, 5, 24), date(y, 6, 4), "ja", "Pfingstferien"),
]
for i, rowv in enumerate(beispiel_w):
    for j, v in enumerate(rowv):
        ww.cell(U0 + i, 1 + j, v if v != "" else None)
    for cc in range(1, 6):
        ww.cell(U0 + i, cc).fill = fill_ex

for r in range(U0, U1 + 1):
    for cc in (2, 3, 10):
        ww.cell(r, cc).number_format = "DD.MM.YYYY"
    leer = f'OR($A{r}="",$B{r}="",$C{r}="",$C{r}<$B{r})'
    ww.cell(r, 6, f'=IF($A{r}="","",IFERROR(INDEX({T}$B${P0}:$B${P1},MATCH($A{r},{TEAM_NAMEN},0)),"?"))')
    ww.cell(r, 7, f'=IF($A{r}="","",COUNTIF($A${U0}:$A{r},$A{r})&". Wunsch")')
    ww.cell(r, 8, f'=IF({leer},"",NETWORKDAYS($B{r},$C{r},{E_FEIER}))')
    eigen = f'COUNTIFS($A${U0}:$A${U1},$A{r},$B${U0}:$B${U1},"<="&$C{r},$C${U0}:$C${U1},">="&$B{r})>1'
    ww.cell(r, 9, (f'=IF($A{r}="","",IF(OR($B{r}="",$C{r}=""),"Von und Bis eintragen",'
                   f'IF($C{r}<$B{r},"Bis liegt vor Von",'
                   f'IF(ISNA(MATCH($A{r},{TEAM_NAMEN},0)),"Name fehlt im Blatt Team",'
                   f'IF({eigen},"Überschneidet sich mit eigenem Wunsch",'
                   f'IF(OR($B{r}<{E_START},$C{r}>{E_ENDE}),"Teils außerhalb des Planungsjahres","ok"))))))'))
    for cc in (7, 8):
        ww.cell(r, cc).alignment = center

dv_name = DataValidation(type="list", formula1=f"={TEAM_NAMEN}", allow_blank=True, showErrorMessage=True,
                         error="Bitte den Namen aus der Liste wählen. Neue Personen zuerst im Blatt »Team« anlegen.")
dv_flex = DataValidation(type="list", formula1='"ja,etwas,nein"', allow_blank=True)
dv_date = DataValidation(type="date", operator="between", formula1="DATE(2020,1,1)", formula2="DATE(2100,12,31)",
                         showErrorMessage=True, error="Bitte ein Datum eintragen, z. B. 12.07.2027.")
dv_bis = DataValidation(type="custom", formula1=f"AND(ISNUMBER(C{U0}),C{U0}>=B{U0})", showErrorMessage=True,
                        error="»Bis« muss ein Datum sein und darf nicht vor »Von« liegen.")
for dv in (dv_name, dv_flex, dv_date, dv_bis):
    ww.add_data_validation(dv)
dv_name.add(f"A{U0}:A{U1}")
dv_flex.add(f"D{U0}:D{U1}")
dv_date.add(f"B{U0}:B{U1}")
dv_date.add(f"J{U0}:J{U1}")
dv_bis.add(f"C{U0}:C{U1}")
cfw = ww.conditional_formatting
cfw.add(f"A{U0}:I{U1}", FormulaRule(formula=[f'$J{U0}<>""'], fill=fill("D9D9D9"),
                                    font=Font(color="808080", italic=True), stopIfTrue=True))
cfw.add(f"I{U0}:I{U1}", FormulaRule(formula=[f'$I{U0}="ok"'], fill=GRUEN, font=F_GRUEN))
cfw.add(f"I{U0}:I{U1}", FormulaRule(formula=[f'AND($I{U0}<>"",$I{U0}<>"ok")'], fill=GELB, font=F_GELB))
for i, farbe in enumerate(FACH_FARBEN[:N_FACH]):
    cfw.add(f"F{U0}:F{U1}", FormulaRule(
        formula=[f'AND($F{U0}<>"",IFERROR(MATCH($F{U0},{E}$A${E0}:$A${E0 + N_FACH - 1},0),0)={i + 1})'],
        fill=fill(farbe), font=Font(color="FFFFFF", bold=True)))
ww.freeze_panes = f"B{U0}"
ww.auto_filter.ref = f"A5:J{U1}"

# =====================================================================
# Team
# =====================================================================
wt = wb.create_sheet(S_T)
titel(wt, "Team", "Eine Zeile pro Person, Name eindeutig (z. B. »Anna M.«). Fachrichtung und Stationen aus der Liste "
                  "wählen. Nur die verantwortliche Person pflegt dieses Blatt.")
head(wt, 4, ["Name", "Fachrichtung"] + [f"Station {i + 1}" for i in range(N_ST_PRO_PERS)]
     + ["Urlaubs-\nanspruch (Tage)", "Bemerkung", "Anzahl\nWünsche", "Gewünschte\nArbeitstage", "Rest"],
     1, [22, 20] + [14] * N_ST_PRO_PERS + [11, 26, 9, 11, 8], height=34)
cells(wt, f"A{P0}:{col(COL_ANSPRUCH + 1)}{P1}", f_input, fill_input)
cells(wt, f"{col(COL_ANSPRUCH + 2)}{P0}:{col(COL_ANSPRUCH + 4)}{P1}", f_calc, fill_calc)
beispiel_team = [(n, None, [], None) for n in NAMEN] if NAMEN else [
    ("Beispiel Anna", "Ergotherapie", ["Station 1", "Station 2"], 30),
    ("Beispiel Ben", "Ergotherapie", ["Station 3", "StäB"], 30),
    ("Beispiel Clara", "Ergotherapie", ["TK Depression", "TK Sucht", "Station 1"], 24),
    ("Beispiel David", "Musiktherapie", ["Station 1", "Station 3"], 30),
    ("Beispiel Eva", "Musiktherapie", ["Station 2", "TK Depression"], 30),
    ("Beispiel Finn", "Bewegungstherapie", ["Station 1", "TK Sucht"], 30),
    ("Beispiel Gül", "Bewegungstherapie", ["Station 2", "Station 3", "TK Depression"], 28),
    ("Beispiel Hana", "Physiotherapie", ["Station 4", "Station 5", "TK 55+"], 30),
]
for i, (n, fr, sts, ans) in enumerate(beispiel_team):
    r = P0 + i
    wt.cell(r, 1, n)
    wt.cell(r, 2, fr)
    for j, s in enumerate(sts):
        wt.cell(r, 3 + j, s)
    wt.cell(r, COL_ANSPRUCH, ans)
    if not NAMEN:
        for cc in range(1, COL_ANSPRUCH + 2):
            wt.cell(r, cc).fill = fill_ex
ca, cn, cd, cr = (col(COL_ANSPRUCH + k) for k in (0, 2, 3, 4))
for r in range(P0, P1 + 1):
    wt[f"{cn}{r}"] = f'=IF($A{r}="","",COUNTIF({W}$A${U0}:$A${U1},$A{r}))'
    wt[f"{cd}{r}"] = f'=IF($A{r}="","",SUMIF({W}$A${U0}:$A${U1},$A{r},{W}$H${U0}:$H${U1}))'
    wt[f"{cr}{r}"] = f'=IF(OR($A{r}="",{ca}{r}=""),"",{ca}{r}-{cd}{r})'
    for k in (cn, cd, cr):
        wt[f"{k}{r}"].alignment = center
wt.conditional_formatting.add(f"{cr}{P0}:{cr}{P1}", FormulaRule(formula=[f'AND({cr}{P0}<>"",{cr}{P0}<0)'],
                                                                 fill=ROT, font=F_ROT))
dv_fach = DataValidation(type="list", formula1=f"={E}$A${E0}:$A${E0 + N_FACH - 1}", allow_blank=True)
dv_stat = DataValidation(type="list", formula1=f"={E}$H${E0}:$H${E0 + N_STAT - 1}", allow_blank=True)
wt.add_data_validation(dv_fach)
wt.add_data_validation(dv_stat)
dv_fach.add(f"B{P0}:B{P1}")
dv_stat.add(f"C{P0}:{col(2 + N_ST_PRO_PERS)}{P1}")
wt.conditional_formatting.add(f"A{P0}:A{P1}", FormulaRule(
    formula=[f'AND(A{P0}<>"",COUNTIF($A${P0}:$A${P1},A{P0})>1)'], fill=ROT, font=F_ROT))
wt.freeze_panes = f"B{P0}"

# =====================================================================
# Einstellungen
# Ampel-Schwellen = Anzahl gleichzeitig ABWESENDER Personen. Leer lassen = Standardregel (siehe Kommentar/README).
# =====================================================================
we = wb.create_sheet(S_E)
titel(we, "Einstellungen", "Nur die verantwortliche Person ändert dieses Blatt. Hellgelb = Eingabe. "
                           "Ampel-Werte = ab wie vielen gleichzeitig Abwesenden die Farbe gilt.")
we["A3"], we["A4"] = "Startdatum Planungszeitraum", "Letzter Tag (berechnet)"
we["B3"] = START
we["B4"] = f"=B3+{TAGE - 1}"
for c in ("B3", "B4"):
    we[c].number_format = "DD.MM.YYYY"
    we[c].border = box
cells(we, "B3:B3", f_input, fill_input)
we["D3"] = "← Die Urlaubsansicht zeigt ab hier 366 Tage."
we["D3"].font = f_small
we["A3"].font = we["A4"].font = f_bold
ampel = ["Gelb\nab … weg", "Hellrot\nab … weg", "Dunkelrot\nab … weg"]
head(we, 6, ["Fachrichtung"] + ampel + ["Personen", "Farbe"], 1, [24, 9, 9, 10, 9, 7], height=30)
head(we, 6, ["Station"] + ampel + ["Therapeut:\ninnen"], 8, [20, 9, 9, 10, 11])
head(we, 6, ["Feiertag", "Bezeichnung"], 14, [13, 26])
we.column_dimensions["G"].width = we.column_dimensions["M"].width = 3
we["B5"] = "Fachteam: leer = keine Ampel"
we["I5"] = "Station: leer = Standardregel"
for c in ("B5", "I5"):
    we[c].font = Font(name=FONT, size=8, bold=True, color=NAVY)
FACHRICHTUNGEN = ["Ergotherapie", "Musiktherapie", "Bewegungstherapie", "Physiotherapie", "Theatertherapie"]
# Beispielwerte nur in der Vorlage; in der echten Arbeitsdatei legt die Leitung die Ampel-Werte selbst fest
BEISPIEL_AMPEL = {"Ergotherapie": (2, None, 3), "Musiktherapie": (None, None, 2), "Bewegungstherapie": (None, None, 2)}
fach = [(f, *((None, None, None) if NAMEN else BEISPIEL_AMPEL.get(f, (None, None, None)))) for f in FACHRICHTUNGEN]
for i in range(N_FACH):
    r = E0 + i
    if i < len(fach):
        for j, v in enumerate(fach[i]):
            we.cell(r, 1 + j, v)
    we.cell(r, 5, f'=IF(A{r}="","",COUNTIF({T}$B${P0}:$B${P1},A{r}))').border = box
    we.cell(r, 6).fill = fill(FACH_FARBEN[i])
    we.cell(r, 6).border = box
cells(we, f"A{E0}:D{E0 + N_FACH - 1}", f_input, fill_input)
st = ["StäB", "Station 1", "Station 2", "Station 3", "Station 4", "Station 5", "Station 6", "Station 7",
      "TK Migration", "TK Sucht", "TK Depression", "TK Psychosomatik", "TK Allgemeinpsychiatrie", "TK 55+"]
st_cols = f"{T}$C${P0}:${col(2 + N_ST_PRO_PERS)}${P1}"
for i in range(N_STAT):
    r = E0 + i
    if i < len(st):
        we.cell(r, 8, st[i])
    we.cell(r, 12, f'=IF(H{r}="","",COUNTIF({st_cols},H{r}))').border = box
cells(we, f"H{E0}:K{E0 + N_STAT - 1}", f_input, fill_input)
for r in range(E0, E0 + max(N_FACH, N_STAT)):
    for cc in (2, 3, 4, 9, 10, 11, 5, 12):
        we.cell(r, cc).alignment = center
o = easter(START.year)
feiertage = [
    (date(y, 1, 1), "Neujahr"), (date(y, 1, 6), "Heilige Drei Könige"), (o - timedelta(days=2), "Karfreitag"), (o + timedelta(days=1), "Ostermontag"),
    (date(y, 5, 1), "Tag der Arbeit"), (o + timedelta(days=39), "Christi Himmelfahrt"),
    (o + timedelta(days=50), "Pfingstmontag"), (o + timedelta(days=60), "Fronleichnam"), (date(y, 10, 3), "Tag der Deutschen Einheit"), (date(y, 11, 1), "Allerheiligen"),
    (date(y, 12, 25), "1. Weihnachtstag"), (date(y, 12, 26), "2. Weihnachtstag"),
]
for i, (d, n) in enumerate(feiertage):
    we.cell(E0 + i, 14, d)
    we.cell(E0 + i, 15, n)
cells(we, f"N{E0}:O{E0 + N_FEIER - 1}", f_input, fill_input)
for r in range(E0, E0 + N_FEIER):
    we.cell(r, 14).number_format = "DD.MM.YYYY"
we["N5"] = "Feiertage Baden-Württemberg vorbelegt – Schließtage ggf. ergänzen"
we["N5"].font = Font(name=FONT, size=8, bold=True, color="C00000")
we["B6"].comment = Comment("Ab wie vielen gleichzeitig Abwesenden aus dieser Fachrichtung soll die Ampel gelb / "
                           "hellrot / dunkelrot zeigen? Leer = Stufe wird nicht verwendet.", "Urlaubsplanung")
we["I6"].comment = Comment("Leer = Standardregel:\n• 1 weg = grün (kein Warnsignal)\n• Gelb ab 2 weg\n"
                           "• Hellrot, wenn nur noch 2 da sind (nur bei Stationen ab 4 Therapeut:innen)\n"
                           "• Dunkelrot, wenn alle weg sind.\nEigene Zahl eintragen = überschreibt die Regel "
                           "für diese Station.", "Urlaubsplanung")
we["I6"].comment.width, we["I6"].comment.height = 320, 140
dv_num = DataValidation(type="whole", operator="between", formula1="1", formula2="99", showErrorMessage=True,
                        error="Bitte eine ganze Zahl (1–99) eintragen oder leer lassen.")
we.add_data_validation(dv_num)
dv_num.add(f"B{E0}:D{E0 + N_FACH - 1}")
dv_num.add(f"I{E0}:K{E0 + N_STAT - 1}")
we.freeze_panes = f"A{E0}"

# ---------- Feinschliff ----------
wa.sheet_properties.tabColor = "808080"
ww.sheet_properties.tabColor = "F2C200"
wt.sheet_properties.tabColor = "A5A5A5"
we.sheet_properties.tabColor = "A5A5A5"
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            if c.font.name != FONT:
                c.font = Font(name=FONT, size=c.font.size or 10, bold=c.font.bold, italic=c.font.italic,
                              color=c.font.color)
wb.active = wb.worksheets.index(ww)
for ws in wb.worksheets:
    ws.sheet_view.tabSelected = ws is ww

out = ARGS.aus
wb.save(out)
print("gespeichert:", out)
