#!/usr/bin/env python3
"""Umbau vom 08.10.2026 (abends) an Urlaubswuensche_2027_Makro-Vorlage.xlsx – nachvollziehbar und wiederholbar.

Aufruf (Windows mit Excel und pywin32), nach einsatzorte_umstellen.py:
    python vorlage_umbauen.py <quelle.xlsx> <ziel.xlsx>

Anders als die übrigen Skripte arbeitet dieses Skript über das echte Excel (COM). Grund: Es fügt eine Zeile ein,
legt Knöpfe und Namen an und ändert Formeln – das XML von Hand anzupassen wäre fehleranfällig (siehe die
Reparatur vom selben Tag). Excel verschiebt alle Bezüge selbst und schreibt eine saubere Datei.

Was passiert (Entscheidungen Tom, 08.10.2026):
  1. »Mein Urlaub«: neue Zeile 13 »Wunsch Nr.« mit Auswahlliste der eigenen Nummern und Knopf
     »Laden«; Knöpfe »Änderung speichern« und »Wunsch löschen« neben »Wunsch eintragen«. Die Prüfung (J19/B19)
     rechnet beim Ändern den geladenen Wunsch nicht als Überschneidung mit sich selbst.
  2. Namen MU_… für alle Felder, die das Makro braucht (Makro und Blatt bleiben so unabhängig vom Layout).
  3. ATOSS raus: Spalte »In ATOSS übertragen am« in »Mein Urlaub« entfernt, in »Wünsche« Spalte J geleert und
     ausgeblendet (nicht gelöscht – sonst verschieben sich Filter- und Formelbereiche), Graufärbung entfernt,
     Abschnitt in der Anleitung ersetzt.
  4. Anleitung: Planungsinstrument statt Genehmigung, Ändern/Löschen selbst, automatisch speichern, Datei schließen,
     »schreibgeschützt«-Hinweis, Ablage Netzlaufwerk, Sicherung, Makros für die Leitung.
Das Skript prüft vorher, ob die Datei so aussieht wie erwartet, und bricht sonst ohne Änderung ab.
"""
import os
import sys
import win32com.client

quelle, ziel = (os.path.abspath(p) for p in sys.argv[1:3])
if os.path.exists(ziel):
    raise SystemExit(f"{ziel} gibt es schon – bitte anderen Namen wählen, nichts geändert.")

XL_LIST, XL_FORMATS, XL_XLSX = 3, -4122, 51
xl = win32com.client.DispatchEx("Excel.Application")
xl.Visible = False
xl.DisplayAlerts = False
wb = None
try:
    wb = xl.Workbooks.Open(quelle, 0, True)
    mu, wu, an = wb.Worksheets("Mein Urlaub"), wb.Worksheets("Wünsche"), wb.Worksheets("Anleitung")

    # --- Prüfungen: sieht die Datei aus wie erwartet? ---
    erwartet = [(mu, "A12", "2.  Neuen Wunsch eintragen"), (mu, "A13", "Von"), (mu, "A18", "Prüfung"),
                (mu, "H22", "In ATOSS\nübertragen am"), (mu, "A21", "3.  Meine Wünsche im Blatt »Wünsche« (nach Datum sortiert)"),
                (wu, "J5", "In ATOSS\nübertragen am"), (an, "B20", "Für die Planung: Übernahme ins ATOSS")]
    for ws, ref, text in erwartet:
        if ws.Range(ref).Value != text:
            raise SystemExit(f"{ws.Name} {ref}: erwartet »{text}«, gefunden »{ws.Range(ref).Value}« – nichts geändert.")

    # ================= 1. Mein Urlaub =================
    mu.Unprotect("")
    mu.Rows(13).Insert()
    mu.Rows(15).Copy()                      # Format wie »Bis« (gelbes Eingabefeld, Hinweis rechts)
    mu.Rows(13).PasteSpecial(XL_FORMATS)
    xl.CutCopyMode = False
    mu.Range("A12").Value = "2.  Wunsch eintragen, ändern oder löschen"
    mu.Range("A13").Value = "Wunsch Nr."
    mu.Range("C13").Value = ""
    mu.Range("D13").Value = "← nur zum Ändern oder Löschen: Nr. aus »3. Meine Wünsche« wählen, dann »Laden«"
    mu.Range("D13").Font.Color = mu.Range("C15").Font.Color
    mu.Range("D13").Font.Size = mu.Range("C15").Font.Size
    mu.Range("D13").Font.Italic = mu.Range("C15").Font.Italic
    b13 = mu.Range("B13")
    b13.Locked = False
    b13.NumberFormat = "@"                  # Text: »2.« darf nicht als Datum gelesen werden
    b13.HorizontalAlignment = -4108         # zentriert
    b13.Validation.Delete()
    b13.Validation.Add(XL_LIST, 1, 1, "=$A$24:$A$53")
    b13.Validation.IgnoreBlank = True
    b13.Validation.ErrorMessage = "Bitte eine Nummer aus der Liste wählen (siehe »3. Meine Wünsche«)."

    # Hilfszellen (Spalte J/K ist ausgeblendet wie J4, J12, J19)
    mu.Range("J13").Formula = '=IF(OR($B$13="",$J$4=""),"",IFERROR(INDEX($K$24:$K$53,MATCH($B$13,$A$24:$A$53,0)),""))'
    mu.Range("K13").Formula = '=IF($J$13="",0,N(INDEX(Wünsche!$H:$H,$J$13)))'

    # Prüfcode: beim Ändern zählt der geladene Wunsch nicht als »schon eingetragen« bzw. Überschneidung
    mu.Range("J19").Formula = (
        '=IF($B$4="",1,IF(AND(B14="",B15=""),2,IF(OR(NOT(ISNUMBER(B14)),NOT(ISNUMBER(B15))),3,IF(B15<B14,4,'
        'IF(OR(B14<Einstellungen!$B$3,B15>Einstellungen!$B$3+365),5,'
        'IF(COUNTIFS(Wünsche!$A$6:$A$605,$B$4,Wünsche!$B$6:$B$605,B14,Wünsche!$C$6:$C$605,B15)'
        '-IF($J$13="",0,AND(INDEX(Wünsche!$B:$B,$J$13)=B14,INDEX(Wünsche!$C:$C,$J$13)=B15)*1)>0,6,'
        'IF(B18=0,7,'
        'IF(COUNTIFS(Wünsche!$A$6:$A$605,$B$4,Wünsche!$B$6:$B$605,"<="&B15,Wünsche!$C$6:$C$605,">="&B14)'
        '-IF($J$13="",0,AND(INDEX(Wünsche!$B:$B,$J$13)<=B15,INDEX(Wünsche!$C:$C,$J$13)>=B14)*1)>0,8,9))))))))')
    f = mu.Range("B19").Formula
    alt_ok = '"✔ Eingabe ok – jetzt auf »Wunsch eintragen« klicken."'
    if f.count("$B$9-$B$8-$B$18") != 2 or f.count(alt_ok) != 1:
        raise SystemExit("Mein Urlaub B19: Formel sieht anders aus als erwartet – nichts gespeichert.")
    f = f.replace("$B$9-$B$8-$B$18", "$B$9-$B$8+$K$13-$B$18")
    f = f.replace(alt_ok, 'IF($J$13="",' + alt_ok + ',"✔ Eingabe ok – jetzt auf »Änderung speichern« klicken.")')
    f = f.replace("Überschneidet sich mit einem meiner bisherigen Wünsche. Eintragen ist trotzdem möglich.",
                  "Überschneidet sich mit einem meiner anderen Wünsche. Speichern ist trotzdem möglich.")
    f = f.replace("✔ Dieser Wunsch ist schon eingetragen (siehe 3.).", "Genau diesen Zeitraum gibt es schon als eigenen Wunsch (siehe 3.).")
    mu.Range("B19").Formula = f

    # Knöpfe: »Wunsch eintragen« liegt in Zeile 20 (B–C); neue Knöpfe als Kopie davon
    knopf = mu.Shapes("KnopfWunschEintragen")
    def neuer_knopf(name, text, makro, zelle, breite, farbe=None):
        k = knopf.Duplicate()
        k.Name = name
        k.Left = mu.Range(zelle).Left + 2
        k.Width = breite
        if zelle == "C13":   # kleiner Knopf in der Zeile »Wunsch Nr.«
            k.Height = max(mu.Range(zelle).Height - 4, 14)
            k.Top = mu.Range(zelle).Top + 2
        else:                # neben »Wunsch eintragen«
            k.Top = knopf.Top
        k.TextFrame2.TextRange.Text = text
        k.OnAction = makro
        if farbe is not None:
            k.Fill.ForeColor.RGB = farbe
        k.Placement = 2  # verschieben, aber nicht mit Zellen skalieren
        return k
    breite = knopf.Width
    neuer_knopf("KnopfLaden", "Laden", "WunschLaden", "C13", min(mu.Range("C13").Width - 4, 70))
    neuer_knopf("KnopfAendern", "Änderung speichern", "WunschAendern", "D20", breite)
    k = neuer_knopf("KnopfLoeschen", "Wunsch löschen", "WunschLoeschen", "D20", breite, farbe=0x2B2BA8)  # BGR: dunkelrot
    k.Left = mu.Range("D20").Left + breite + 10
    mu.Range("D20").Value = ""
    mu.Range("B21").Value = "Ändern: »Wunsch Nr.« wählen → »Laden« → Felder ändern → »Änderung speichern«. Die Datei wird jedes Mal gespeichert."
    mu.Range("C15").Copy()
    mu.Range("B21").PasteSpecial(XL_FORMATS)
    xl.CutCopyMode = False
    mu.Range("B21").WrapText = False

    # ATOSS-Spalte in der Übersicht und ihre Graufärbung entfernen
    mu.Range("H23:H53").Clear()
    fc = mu.Range("A24:H53").FormatConditions
    for i in range(fc.Count, 0, -1):
        try:
            if "$H" in fc(i).Formula1:
                fc(i).Delete()
        except Exception:
            pass

    # Namen für das Makro
    for name, ref in (("MU_Name", "$B$4"), ("MU_Gewuenscht", "$B$8"), ("MU_Anspruch", "$B$9"), ("MU_Nr", "$B$13"),
                      ("MU_Zeile", "$J$13"), ("MU_AltAT", "$K$13"), ("MU_Von", "$B$14"), ("MU_Bis", "$B$15"),
                      ("MU_Flex", "$B$16"), ("MU_Bem", "$B$17"), ("MU_AT", "$B$18"), ("MU_Text", "$B$19"), ("MU_Code", "$J$19")):
        wb.Names.Add(name, "='Mein Urlaub'!" + ref)

    mu.Protect("", True, True, True)

    # ================= 2. Wünsche: ATOSS-Spalte J leeren und ausblenden =================
    wu.Unprotect("")
    wu.Range("J4:J605").ClearContents()
    wu.Columns("J").Hidden = True
    fc = wu.Range("A6:I605").FormatConditions
    for i in range(fc.Count, 0, -1):
        try:
            if "$J" in fc(i).Formula1:
                fc(i).Delete()
        except Exception:
            pass
    wu.Range("A3").Value = "Nur Wünsche, keine Genehmigung. Engpässe zeigt die Teamansicht (Teamansicht.html). Ändern und löschen über »Mein Urlaub«."

    # ================= 3. Anleitung =================
    texte = {
        "B2": "In dieser Datei planen wir im Team unsere Urlaubswünsche für das ganze Jahr. Sie ist unser Planungsinstrument und "
              "ersetzt nicht den Urlaubsantrag. Wer sehen will, wo es im Fachteam oder an einem Einsatzort eng wird, öffnet die "
              "»Teamansicht.html« (liegt im selben Ordner).",
        "B8": "4.  Auf »Wunsch eintragen« klicken. Die Datei wird dabei gespeichert. Der Wunsch steht dann im Blatt »Wünsche« – "
              "dort sieht man alle Wünsche, ändern kann man dort nichts.",
        "B10": "6.  Wunsch ändern oder löschen (nach Absprache im Team): bei »Wunsch Nr.« die Nummer aus der eigenen Liste wählen, "
               "»Laden« klicken, Felder ändern und »Änderung speichern« klicken – oder »Wunsch löschen«.",
        "B11": "7.  Danach die Datei schließen, damit andere eintragen können. Meldet Excel beim Öffnen »schreibgeschützt« oder "
               "»gesperrt«, hat gerade jemand anderes die Datei offen: schließen (nicht als Kopie speichern) und später noch einmal versuchen.",
        "B20": "Für die verantwortliche Person",
        "B22": "•  Team oder Einstellungen ändern: Alt+F8 → »EinrichtungBearbeiten«, danach Alt+F8 → »PlanungFreigeben«. "
               "Daten aus einer älteren Fassung übernehmen: Alt+F8 → »TeamUebernehmen«.",
        "B23": "•  Sicherung: Vor jedem Eintragen, Ändern und Löschen legt die Datei eine Tageskopie im Ordner »Sicherung« an "
               "(die letzten 7 Tage). Den Ordner legt die Leitung im Makro fest (SICHERUNG_ORDNER).",
        "B32": "•  Ablage im gemeinsamen Ordner der Fachtherapien. Excel sperrt die Datei, solange jemand sie offen hat.",
        "B33": "•  Also: öffnen, eintragen (speichert automatisch), sofort schließen. Die Ansichten können die Datei trotzdem jederzeit lesen.",
        "B37": "1.  Reiter »Mein Urlaub« (grün) öffnen und den eigenen Namen wählen. Darunter stehen sofort alle eigenen Wünsche "
               "(nach Datum, mit Nummer), die gewünschten Arbeitstage und – falls hinterlegt – der Resturlaub.",
        "B39": "3.  Auf »Wunsch eintragen« klicken. Der Wunsch wird in die nächste freie Zeile im Blatt »Wünsche« geschrieben, die "
               "Datei gespeichert und die gelben Felder (auch der Name) geleert. Beim Öffnen der Datei ggf. »Inhalt aktivieren« klicken (Makros).",
    }
    an.Unprotect("")
    for ref, t in texte.items():
        an.Range(ref).Value = t

    xl.CalculateFull()
    mu.Activate()
    mu.Range("B4").Select()
    wb.SaveAs(ziel, XL_XLSX)
    print(f"geschrieben: {ziel}")
finally:
    if wb is not None:
        wb.Close(False)
    xl.Quit()
