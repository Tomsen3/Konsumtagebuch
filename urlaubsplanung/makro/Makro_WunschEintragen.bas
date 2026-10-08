Attribute VB_Name = "ModulWunschEintragen"
Option Explicit

' =====================================================================
'  Makro "WunschEintragen" fuer Urlaubswuensche_2027 (Fassung B, .xlsm)
'  Stand: 08.10.2026 - Verantwortlich: Tom
'
'  Was es tut:
'   1. Liest die Eingabemaske im Blatt "Mein Urlaub" (B4 Name, B13 Von,
'      B14 Bis, B15 Verschiebbar, B16 Bemerkung).
'   2. Nutzt die Pruefung der Vorlage (J18 = Code 1-9, B18 = Text),
'      damit Maske und Makro immer dasselbe sagen.
'   3. Schreibt den Wunsch in die naechste freie Zeile im Blatt
'      "Wuensche" (Spalten A-E; die grauen Formelspalten F-I bleiben).
'   4. Leert die Eingabefelder und bietet an, die Datei zu speichern.
'
'  Umlaute stehen im Quelltext als Platzhalter, z. B. {ue} = ue-Umlaut,
'  und werden von der Funktion D() ersetzt. So laesst sich der Code
'  auf jedem PC fehlerfrei importieren oder einfuegen.
'
'  Der Knopf "Wunsch eintragen" muss auf das Makro "WunschEintragen"
'  zeigen (Rechtsklick auf den Knopf -> Makro zuweisen).
' =====================================================================

Private Const ERSTE_ZEILE As Long = 6      ' erste Datenzeile im Blatt Wuensche
Private Const LETZTE_ZEILE As Long = 605   ' letzte Datenzeile im Blatt Wuensche

Public Sub WunschEintragen()
    Dim wsM As Worksheet, wsW As Worksheet
    Dim code As Long, r As Long, z As Long
    Dim sName As String, sFlex As String, sBem As String, sTitel As String
    Dim dVon As Date, dBis As Date
    Dim at As Variant, rest As Variant, antwort As VbMsgBoxResult

    On Error GoTo Fehler
    sTitel = D("Urlaubsw{ue}nsche")
    Set wsM = ThisWorkbook.Worksheets("Mein Urlaub")
    Set wsW = ThisWorkbook.Worksheets(D("W{ue}nsche"))

    Application.Calculate
    code = Val(CStr(wsM.Range("J18").Value))

    ' --- Pruefung (Codes aus Zelle J18 der Vorlage)
    Select Case code
        Case 1 To 5
            MsgBox wsM.Range("B18").Text, vbExclamation, sTitel
            Exit Sub
        Case 6
            MsgBox D("Dieser Wunsch ist schon eingetragen (siehe Abschnitt 3 im Blatt {>>}Mein Urlaub{<<})."), vbInformation, sTitel
            Exit Sub
        Case 7
            antwort = MsgBox(D("Im Zeitraum liegt keiner deiner Arbeitstage {-} daf{ue}r braucht es keinen Urlaub.") & vbCrLf & vbCrLf & _
                             D("Trotzdem eintragen?"), vbQuestion + vbYesNo + vbDefaultButton2, sTitel)
            If antwort = vbNo Then Exit Sub
        Case 8
            antwort = MsgBox(D("Der Wunsch {ue}berschneidet sich mit einem deiner bisherigen W{ue}nsche.") & vbCrLf & vbCrLf & _
                             D("Trotzdem eintragen?"), vbQuestion + vbYesNo + vbDefaultButton2, sTitel)
            If antwort = vbNo Then Exit Sub
        Case 9
            ' alles in Ordnung
        Case Else
            MsgBox D("Die Pr{ue}fung konnte nicht gelesen werden (Zelle J18). Bitte die verantwortliche Person informieren."), vbCritical, sTitel
            Exit Sub
    End Select

    sName = Trim$(CStr(wsM.Range("B4").Value))
    dVon = CDate(wsM.Range("B13").Value)
    dBis = CDate(wsM.Range("B14").Value)
    sFlex = LCase$(Trim$(CStr(wsM.Range("B15").Value)))
    sBem = Trim$(CStr(wsM.Range("B16").Value))
    at = wsM.Range("B17").Value

    If sFlex <> "" And sFlex <> "ja" And sFlex <> "etwas" And sFlex <> "nein" Then
        MsgBox D("Bei {>>}Verschiebbar?{<<} bitte ja, etwas oder nein w{ae}hlen (oder leer lassen)."), vbExclamation, sTitel
        Exit Sub
    End If

    ' --- Resturlaub danach (nur wenn ein Anspruch hinterlegt ist)
    If IsNumeric(wsM.Range("B9").Value) And Not IsEmpty(wsM.Range("B9").Value) And IsNumeric(at) Then
        rest = wsM.Range("B9").Value - wsM.Range("B8").Value - at
        If rest < 0 Then
            antwort = MsgBox(D("Mit diesem Wunsch w{ae}ren es ") & -rest & D(" Tag(e) mehr als der Urlaubsanspruch.") & vbCrLf & vbCrLf & _
                             D("Trotzdem eintragen?"), vbQuestion + vbYesNo + vbDefaultButton2, sTitel)
            If antwort = vbNo Then Exit Sub
        End If
    Else
        rest = Empty
    End If

    ' --- naechste freie Zeile im Blatt Wuensche (Name und Von leer)
    r = 0
    For z = ERSTE_ZEILE To LETZTE_ZEILE
        If Trim$(CStr(wsW.Cells(z, 1).Value)) = "" And IsEmpty(wsW.Cells(z, 2).Value) Then r = z: Exit For
    Next z
    If r = 0 Then
        MsgBox D("Im Blatt {>>}W{ue}nsche{<<} ist keine freie Zeile mehr (bis Zeile ") & LETZTE_ZEILE & D("). Bitte die verantwortliche Person informieren."), vbCritical, sTitel
        Exit Sub
    End If

    ' --- eintragen (Blatt Wuensche ist normalerweise nicht geschuetzt; falls doch: ohne Kennwort aufheben)
    If wsW.ProtectContents Then wsW.Unprotect
    wsW.Cells(r, 1).Value = sName
    wsW.Cells(r, 2).Value = dVon
    wsW.Cells(r, 3).Value = dBis
    If sFlex <> "" Then wsW.Cells(r, 4).Value = sFlex
    If sBem <> "" Then wsW.Cells(r, 5).Value = sBem

    ' --- Eingabefelder leeren (sind entsperrt, gehen auch bei Blattschutz)
    wsM.Range("B13").ClearContents
    wsM.Range("B14").ClearContents
    wsM.Range("B15").ClearContents
    wsM.Range("B16").MergeArea.ClearContents
    Application.Calculate

    ' --- Rueckmeldung
    antwort = MsgBox(D("Eingetragen in Zeile ") & r & D(" im Blatt {>>}W{ue}nsche{<<}:") & vbCrLf & vbCrLf & _
                     sName & vbCrLf & _
                     Format$(dVon, "dd.mm.yyyy") & D(" {-} ") & Format$(dBis, "dd.mm.yyyy") & _
                     IIf(IsNumeric(at), "  (" & at & " Arbeitstage)", "") & vbCrLf & _
                     IIf(IsEmpty(rest), "", D("Rest danach: ") & rest & " Tage" & vbCrLf) & vbCrLf & _
                     D("Datei jetzt speichern?"), vbInformation + vbYesNo, sTitel)
    If antwort = vbYes Then ThisWorkbook.Save
    Exit Sub

Fehler:
    MsgBox D("Der Wunsch konnte nicht eingetragen werden.") & vbCrLf & vbCrLf & _
           D("Fehler: ") & Err.Description & vbCrLf & vbCrLf & _
           D("Bitte pr{ue}fen: Blattnamen {>>}Mein Urlaub{<<} und {>>}W{ue}nsche{<<} unver{ae}ndert? Datei nicht schreibgesch{ue}tzt?"), _
           vbCritical, D("Urlaubsw{ue}nsche")
End Sub

' Ersetzt Platzhalter durch Sonderzeichen (Quelltext bleibt reines ASCII)
Private Function D(ByVal s As String) As String
    s = Replace(s, "{ae}", ChrW(228)): s = Replace(s, "{oe}", ChrW(246)): s = Replace(s, "{ue}", ChrW(252))
    s = Replace(s, "{Ae}", ChrW(196)): s = Replace(s, "{Oe}", ChrW(214)): s = Replace(s, "{Ue}", ChrW(220))
    s = Replace(s, "{ss}", ChrW(223)): s = Replace(s, "{-}", ChrW(8211))
    s = Replace(s, "{>>}", ChrW(187)): s = Replace(s, "{<<}", ChrW(171))
    D = s
End Function
