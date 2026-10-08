/* Gemeinsamer Kern der Urlaubsansicht (Leitung) und der Teamansicht (Kolleg:innen):
   Excel-Layout, Standardregel, Hilfsfunktionen und build() = Excel einlesen und Ampel berechnen.
   Wird von baue_ansicht.py an der Stelle <!--KERN--> in beide Quelltexte eingesetzt.
   Änderungen hier wirken auf BEIDE Seiten – danach beide im Browser prüfen. */
/* ===================== Layout der Excel-Datei =====================
   Muss zur Excel-Datei passen (siehe Dokumentation_Mein_Urlaub.md). Spalten als Buchstaben, Zeilen wie in Excel (ab 1). */
const LAYOUT = {
  tage: 366,
  wuensche: { sheet: "Wünsche", firstRow: 6, cols: { name: "A", von: "B", bis: "C", flex: "D", bem: "E" } },
  team: { sheet: "Team", firstRow: 5, cols: { name: "A", fach: "B", st: ["C", "D", "E", "F", "R"], anspruch: "G", tage: ["L", "M", "N", "O", "P"] } },
  einst: {
    sheet: "Einstellungen", start: "B3", firstRow: 7,
    fach: { name: "A", g: "B", h: "C", d: "D" },
    stat: { name: "H", g: "I", h: "J", d: "K" },
    feier: { datum: "N", name: "O" }
  }
};
/* Standardregel für Stationen, wenn in Einstellungen nichts eingetragen ist (Vorgabe –
   kann im Reiter »Regeln« für diesen Browser überschrieben werden, siehe AMPEL_KEY) */
const STANDARD = {
  gelbAb: 2,                       // ab 2 Abwesenden gelb (1 weg = kein Warnsignal)
  hellrotWennNochDa: 2,            // hellrot, wenn nur noch 2 anwesend sind …
  hellrotAbGroesse: 4,             // … aber nur bei Stationen ab 4 Therapeut:innen
  dunkelrot: "alle"                // dunkelrot, wenn alle weg sind (die an dem Tag arbeiten würden)
};
/* Ampel-Einstellungen aus dem Reiter »Regeln«: nur in diesem Browser gespeichert (localStorage), nie in der Excel-Datei.
   Vorrang: hier eingestellt  >  Excel → Einstellungen  >  Standardregel */
const AMPEL_KEY = "urlaubsansicht.ampel";
const ampelGet = () => { const a = lsGet(AMPEL_KEY, {}) || {}; return { std: a.std || {}, units: a.units || {} }; };
const ampelSet = (a) => lsSet(AMPEL_KEY, a);
const ukey = (u) => u.type + ":" + u.name;
/* Top-5-Wochen: Punkte je Arbeitstag und Bereich nach Ampelstufe (Index = Stufe 0–4) */
const WOCHEN_PUNKTE = [0, 0, 1, 3, 9];
const FACH_FARBEN = ["#4E79A7","#B07AA1","#76B7B2","#9C755F","#F28E2B","#59A1A0","#D37295","#8E8CD8","#6A9FCB","#A08C7D"];
const LV_NAME = ["", "unkritisch", "Gelb", "Hellrot", "Dunkelrot"];
const MON = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const MON_L = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const WD = ["So","Mo","Di","Mi","Do","Fr","Sa"];
const FLEX_ORDER = { ja: 0, etwas: 1, "": 2, nein: 3 };

/* ===================== Hilfsfunktionen ===================== */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ser2date = (s) => new Date(Math.round((s - 25569) * 86400000));
const date2ser = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / 86400000) + 25569;
const wday = (s) => ser2date(s).getUTCDay();
const fmt = (s) => { const d = ser2date(s); return String(d.getUTCDate()).padStart(2, "0") + "." + String(d.getUTCMonth() + 1).padStart(2, "0") + "."; };
const fmtY = (s) => fmt(s) + ser2date(s).getUTCFullYear();
const fmtW = (s) => WD[wday(s)] + " " + fmt(s);
const range = (a, b) => (a === b ? fmtW(a) + ser2date(a).getUTCFullYear() : fmtW(a) + " – " + fmtW(b) + ser2date(b).getUTCFullYear());
const monthKey = (s) => { const d = ser2date(s); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
function isoWeek(s) { const th = s - ((wday(s) + 6) % 7) + 3; const y = ser2date(th).getUTCFullYear(); return Math.floor((th - date2ser(y, 1, 1)) / 7) + 1; }
const todaySer = () => { const d = new Date(); return date2ser(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

function cell(ws, addr) { const c = ws[addr]; return c ? c.v : null; }
function str(v) { return v == null ? "" : String(v).trim(); }
function num(v) { if (v == null || v === "") return null; const n = Number(v); return Number.isFinite(n) ? Math.round(n) : null; }
function toSer(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Math.floor(v);
  if (v instanceof Date) return date2ser(v.getFullYear(), v.getMonth() + 1, v.getDate());
  const m = String(v).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (m) { let y = +m[3]; if (y < 100) y += 2000; return date2ser(y, +m[2], +m[1]); }
  return null;
}
function lastRow(ws) { return ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]).e.r + 1 : 0; }

/* ===================== Einlesen & Berechnen ===================== */
/* opt.nurExcel = true: im Browser eingestellte Ampelwerte ignorieren (Teamansicht – dort gilt nur, was in Excel steht) */
function build(wb, opt = {}) {
  const L = LAYOUT, warn = [];
  const E = wb.Sheets[L.einst.sheet], T = wb.Sheets[L.team.sheet], W = wb.Sheets[L.wuensche.sheet];
  const missing = [[E, L.einst.sheet], [T, L.team.sheet], [W, L.wuensche.sheet]].filter((x) => !x[0]).map((x) => "»" + x[1] + "«");
  if (missing.length) throw new Error("In der Datei fehlen die Blätter " + missing.join(", ") + ". Ist das die richtige Excel-Datei?");

  // Einstellungen
  const fachs = [], stats = [], fachIdx = new Map(), statIdx = new Map(), holidays = new Map();
  for (let r = L.einst.firstRow, n = lastRow(E); r <= n; r++) {
    const f = L.einst.fach, s = L.einst.stat, h = L.einst.feier;
    const fn = str(cell(E, f.name + r));
    if (fn && !fachIdx.has(fn)) { fachIdx.set(fn, fachs.length); fachs.push({ type: "fach", inExcel: true, name: fn, custom: { g: num(cell(E, f.g + r)), h: num(cell(E, f.h + r)), d: num(cell(E, f.d + r)) } }); }
    const sn = str(cell(E, s.name + r));
    if (sn && !statIdx.has(sn)) { statIdx.set(sn, stats.length); stats.push({ type: "stat", inExcel: true, name: sn, custom: { g: num(cell(E, s.g + r)), h: num(cell(E, s.h + r)), d: num(cell(E, s.d + r)) } }); }
    const hd = toSer(cell(E, h.datum + r));
    if (hd) holidays.set(hd, str(cell(E, h.name + r)) || "Feiertag");
  }

  // Team (inkl. Teilzeit-Arbeitstage Mo–Fr in Spalten L–P)
  const persons = [], pIdx = new Map();
  for (let r = L.team.firstRow, n = lastRow(T); r <= n; r++) {
    const c = L.team.cols, name = str(cell(T, c.name + r));
    if (!name) continue;
    if (pIdx.has(name)) { warn.push({ k: "team", t: `»${name}« steht mehrfach im Blatt Team (Zeile ${r}). Nur der erste Eintrag zählt.` }); continue; }
    const fach = str(cell(T, c.fach + r));
    let fi = fachIdx.has(fach) ? fachIdx.get(fach) : -1;
    if (!fach) warn.push({ k: "team", t: `${name}: keine Fachrichtung eingetragen (Team, Zeile ${r}).` });
    else if (fi < 0) { warn.push({ k: "team", t: `${name}: Fachrichtung »${fach}« fehlt im Blatt Einstellungen – wurde ergänzt.` }); fi = fachs.length; fachIdx.set(fach, fi); fachs.push({ type: "fach", name: fach, custom: { g: null, h: null, d: null } }); }
    const st = [];
    for (const sc of c.st) {
      const s = str(cell(T, sc + r));
      if (!s || st.includes(s)) continue;
      if (!statIdx.has(s)) { warn.push({ k: "team", t: `${name}: Einsatzort »${s}« fehlt im Blatt Einstellungen – wurde mit Standardregel ergänzt.` }); statIdx.set(s, stats.length); stats.push({ type: "stat", name: s, custom: { g: null, h: null, d: null } }); }
      st.push(s);
    }
    if (!st.length) warn.push({ k: "team", t: `${name}: kein Einsatzort eingetragen.` });
    // Arbeitstage: wie in Excel (Spalte Q »Muster«) zählt nur »x«; alle leer = Vollzeit Mo–Fr
    const raw = c.tage.map((col) => str(cell(T, col + r)).toLowerCase());
    raw.forEach((v, k) => { if (v && v !== "x") warn.push({ k: "team", t: `${name}: in Team, Spalte ${c.tage[k]} steht »${v}« – als Arbeitstag zählt nur »x« (Zeile ${r}).` }); });
    const marked = raw.map((v) => v === "x");
    const tz = marked.some(Boolean);
    const wk = tz ? marked : [true, true, true, true, true];   // Index 0 = Mo … 4 = Fr
    pIdx.set(name, persons.length);
    persons.push({ name, fach, fi, st, anspruch: num(cell(T, c.anspruch + r)), wk, tz, wishes: [] });
  }

  // Wünsche
  const wishes = [];
  let minVon = null;
  for (let r = L.wuensche.firstRow, n = lastRow(W); r <= n; r++) {
    const c = L.wuensche.cols, name = str(cell(W, c.name + r));
    const von = toSer(cell(W, c.von + r)), bis = toSer(cell(W, c.bis + r));
    if (!name && !von && !bis) continue;
    if (!name) { warn.push({ k: "wunsch", t: `Wünsche, Zeile ${r}: Name fehlt.` }); continue; }
    if (!pIdx.has(name)) { warn.push({ k: "wunsch", t: `Wünsche, Zeile ${r}: »${name}« steht nicht im Blatt Team – nicht berücksichtigt.` }); continue; }
    if (!von || !bis) { warn.push({ k: "wunsch", t: `Wünsche, Zeile ${r} (${name}): Von oder Bis fehlt bzw. ist kein Datum.` }); continue; }
    if (bis < von) { warn.push({ k: "wunsch", t: `Wünsche, Zeile ${r} (${name}): Bis liegt vor Von.` }); continue; }
    const flex = str(cell(W, c.flex + r)).toLowerCase();
    const w = { p: pIdx.get(name), von, bis, flex: ["ja", "etwas", "nein"].includes(flex) ? flex : "", bem: str(cell(W, c.bem + r)), row: r };
    wishes.push(w); persons[w.p].wishes.push(w);
    if (minVon == null || von < minVon) minVon = von;
  }

  // Zeitraum
  let start = toSer(cell(E, L.einst.start));
  if (!start) {
    const y = minVon ? ser2date(minVon).getUTCFullYear() : new Date().getFullYear();
    start = date2ser(y, 1, 1);
    warn.push({ k: "einst", t: `Kein Startdatum in Einstellungen (B3) – verwendet wird 01.01.${y}.` });
  }
  const N = L.tage, ser = new Int32Array(N), work = new Uint8Array(N), hol = new Array(N);
  for (let i = 0; i < N; i++) { ser[i] = start + i; const w = wday(ser[i]); hol[i] = holidays.get(ser[i]) || ""; work[i] = w !== 0 && w !== 6 && !hol[i] ? 1 : 0; }
  // Arbeitet Person p am Datum s? (Wochenende, Feiertag und Teilzeit-freie Tage = nein)
  const worksOn = (p, s) => { const w = wday(s); return w >= 1 && w <= 5 && !holidays.has(s) && p.wk[w - 1]; };

  // Abwesenheit je Person: wish = Tag liegt in einem Wunsch · abs = an diesem Tag wäre sie im Dienst und fehlt
  for (const p of persons) {
    p.wish = new Uint8Array(N); p.abs = new Uint8Array(N); p.on = new Uint8Array(N);
    for (let i = 0; i < N; i++) p.on[i] = worksOn(p, ser[i]) ? 1 : 0;
    p.wishes.sort((a, b) => a.von - b.von);
    let prev = null;
    for (const w of p.wishes) {
      w.wd = 0; for (let s = w.von; s <= w.bis; s++) if (worksOn(p, s)) w.wd++;
      if (!w.wd) warn.push({ k: "wunsch", t: `${p.name}: Wunsch ${fmt(w.von)}–${fmtY(w.bis)} enthält keinen eigenen Arbeitstag (Wochenende/Feiertag/Teilzeit-frei).` });
      if (prev && w.von <= prev.bis) warn.push({ k: "wunsch", t: `${p.name}: Wünsche überschneiden sich (${fmt(prev.von)}–${fmt(prev.bis)} und ${fmt(w.von)}–${fmt(w.bis)}).` });
      if (w.von < start || w.bis > start + N - 1) warn.push({ k: "wunsch", t: `${p.name}: Wunsch ${fmtY(w.von)}–${fmtY(w.bis)} liegt ganz oder teilweise außerhalb des Planungszeitraums.` });
      for (let s = Math.max(w.von, start); s <= Math.min(w.bis, start + N - 1); s++) { const i = s - start; p.wish[i] = 1; if (p.on[i]) p.abs[i] = 1; }
      if (!prev || w.bis > prev.bis) prev = w;
    }
    p.total = p.wishes.reduce((a, w) => a + w.wd, 0);
    p.rest = p.anspruch != null ? p.anspruch - p.total : null;
    if (p.anspruch != null && p.total > p.anspruch) warn.push({ k: "wunsch", t: `${p.name}: ${p.total} Arbeitstage gewünscht, Anspruch ${p.anspruch}.` });
  }

  // Einheiten (Stationen + Fachteams) mit Schwellen
  // Reihenfolge je Wert: im Reiter »Regeln« eingestellt (lokal) > Excel → Einstellungen > Standardregel
  const AMP = opt.nurExcel ? { std: {}, units: {} } : ampelGet(), std = {};
  for (const k of ["gelbAb", "hellrotWennNochDa", "hellrotAbGroesse"]) std[k] = AMP.std[k] != null ? AMP.std[k] : STANDARD[k];
  const applyLocal = (u) => {
    u.excel = Object.assign({}, u.custom);
    const o = AMP.units[ukey(u)] || {};
    u.local = { g: o.g ?? null, h: o.h ?? null, d: o.d ?? null };
    u.custom = { g: u.local.g ?? u.excel.g, h: u.local.h ?? u.excel.h, d: u.local.d ?? u.excel.d };
    u.orig = {}; for (const k of ["g", "h", "d"]) u.orig[k] = u.local[k] != null ? "lokal" : u.excel[k] != null ? "Excel" : u.type === "stat" ? "Standard" : "";
  };
  const units = [];
  for (const s of stats) {
    applyLocal(s);
    s.members = persons.map((p, i) => (p.st.includes(s.name) ? i : -1)).filter((i) => i >= 0);
    const n = s.members.length, c = s.custom;
    s.th = {
      g: c.g ?? std.gelbAb,
      h: c.h ?? (n >= std.hellrotAbGroesse ? n - std.hellrotWennNochDa : null),
      d: c.d ?? (n > 0 ? n : null)
    };
    s.src = { g: c.g != null, h: c.h != null, d: c.d != null };
    units.push(s);
  }
  for (const f of fachs) {
    applyLocal(f);
    f.members = persons.map((p, i) => (p.fi === fachIdx.get(f.name) ? i : -1)).filter((i) => i >= 0);
    f.th = { g: f.custom.g, h: f.custom.h, d: f.custom.d };
    f.src = { g: true, h: true, d: true };
    units.push(f);
  }
  const localCount = Object.keys(AMP.std).filter((k) => AMP.std[k] != null).length + units.reduce((a, u) => a + ["g", "h", "d"].filter((k) => u.local[k] != null).length, 0);
  const level = (a, th) => (a <= 0 ? 0 : th.d != null && a >= th.d ? 4 : th.h != null && a >= th.h ? 3 : th.g != null && a >= th.g ? 2 : 1);
  for (const [ui, u] of units.entries()) {
    u.ui = ui; u.n = u.members.length;
    u.cnt = new Uint8Array(N); u.lv = new Uint8Array(N); u.nday = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      let a = 0, on = 0; for (const m of u.members) { a += persons[m].abs[i]; on += persons[m].on[i]; }
      u.cnt[i] = a; u.nday[i] = on;
      if (!work[i]) continue;
      // Teilzeit: Standardregel (»nur noch 2 da« / »alle weg«) bezieht sich auf die, die an diesem Tag arbeiten würden
      let th = u.th;
      if (u.type === "stat" && (!u.src.h || !u.src.d)) {
        th = { g: u.th.g,
          h: u.src.h ? u.th.h : (u.n >= std.hellrotAbGroesse && on > 0 ? Math.max(1, on - std.hellrotWennNochDa) : null),
          d: u.src.d ? u.th.d : (on > 0 ? on : null) };
      }
      u.lv[i] = level(a, th);
    }
  }
  persons.forEach((p, pi) => {
    p.units = units.filter((u) => u.members.includes(pi)).map((u) => u.ui);
    p.lv = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (p.abs[i]) { let m = 0; for (const ui of p.units) m = Math.max(m, units[ui].lv[i]); p.lv[i] = m; }
  });

  // Konflikte: zusammenhängende Arbeitstage mit Stufe >= Gelb je Einheit
  const conflicts = [];
  for (const u of units) {
    let cur = null;
    const flush = () => {
      if (!cur) return;
      const d = cur.days;
      cur.maxLv = Math.max(...d.map((i) => u.lv[i]));
      cur.peak = Math.max(...d.map((i) => u.cnt[i]));
      let a = -1, b = -1;
      for (let k = 0; k < d.length; k++) { if (u.cnt[d[k]] === cur.peak) { if (a < 0) a = k; b = k; } else if (a >= 0) break; }
      cur.peakFrom = ser[d[a]]; cur.peakTo = ser[d[b]]; cur.peakOn = u.nday[d[a]];
      cur.from = ser[d[0]]; cur.to = ser[d[d.length - 1]]; cur.wd = d.length;
      cur.people = u.members.filter((m) => d.some((i) => persons[m].abs[i])).map((m) => {
        const p = persons[m], hit = d.filter((i) => p.abs[i]);
        const ws = p.wishes.filter((w) => w.von <= cur.to && w.bis >= cur.from);
        const flex = ws.map((w) => w.flex).sort((x, y) => FLEX_ORDER[x] - FLEX_ORDER[y])[0] ?? "";
        return { p: m, from: ser[hit[0]], to: ser[hit[hit.length - 1]], days: hit.length, wishes: ws, flex };
      }).sort((x, y) => FLEX_ORDER[x.flex] - FLEX_ORDER[y.flex] || x.from - y.from);
      conflicts.push(cur); cur = null;
    };
    for (let i = 0; i < N; i++) {
      if (!work[i]) continue;
      if (u.lv[i] >= 2) { if (!cur) cur = { u: u.ui, days: [] }; cur.days.push(i); } else flush();
    }
    flush();
  }
  conflicts.sort((a, b) => b.maxLv - a.maxLv || a.from - b.from);
  // Wunsch → höchste Konfliktstufe (für Markierung in der Personenliste)
  for (const w of wishes) { let m = 0; const p = persons[w.p]; for (let s = Math.max(w.von, start); s <= Math.min(w.bis, start + N - 1); s++) m = Math.max(m, p.lv[s - start]); w.lv = m; }
  for (const p of persons) p.maxLv = p.wishes.reduce((a, w) => Math.max(a, w.lv), 0);

  const example = persons.some((p) => /^beispiel/i.test(p.name));
  return { persons, units, fachs, stats, wishes, conflicts, warn, N, start, ser, work, hol, fachIdx, example, std, localCount };
}

/* ===================== Zurück-Taste des Browsers =====================
   Beide Seiten wechseln ihre Bildschirme, ohne eine neue Seite zu laden. Ohne diesen Teil kennt der
   Browser nur »Seite verlassen« – die Zurück-Taste würde die Datei schließen (Rückmeldung Tom, 08.10.2026).
   Darum bekommt jeder Bildschirmwechsel einen Eintrag im Browserverlauf (history.pushState), das
   Seitenfenster rechts (»Wer fehlt« / »Wer ist weg«) ebenfalls:
     Zurück = Seitenfenster zu, sonst vorheriger Bildschirm (mit den damaligen Filtern).
   Erst auf dem ersten Bildschirm nach dem Laden der Excel-Datei verlässt Zurück die Seite.
   Nutzung in der Seite: einmal verlaufStart({ schluessel, zustand, wiederherstellen }),
   am Ende von render() verlaufMerken(), Seitenfenster nur über detailOeffnen()/detailSchliessen(). */
const Verlauf = { key: null, z: null, opt: null, ueberspringen: false };
const detailOffen = () => $("detail").classList.contains("open");
function verlaufStart(opt) {
  Verlauf.opt = opt;
  window.addEventListener("popstate", (e) => {
    $("detail").classList.remove("open");
    if (Verlauf.ueberspringen) {             // Fenster wurde per × geschlossen: nur dessen Eintrag entfernen
      Verlauf.ueberspringen = false;
      try { history.replaceState({ k: Verlauf.key, z: Verlauf.z }, ""); } catch (err) {}
      return;
    }
    const st = e.state;
    if (!st || !st.z || !M) return;
    Verlauf.key = st.k;                      // gleicher Schlüssel → render() legt keinen neuen Eintrag an
    opt.wiederherstellen(st.z);
  });
}
/* Am Ende von render(): neuer Bildschirm (anderer Schlüssel) = neuer Eintrag, sonst Eintrag aktualisieren */
function verlaufMerken() {
  if (!Verlauf.opt) return;
  const k = Verlauf.opt.schluessel(), z = Verlauf.opt.zustand(), alt = history.state, neu = { k, z };
  if (alt && alt.detail && k === Verlauf.key && detailOffen()) neu.detail = true;
  try {
    if (Verlauf.key === null || k === Verlauf.key || (alt && alt.detail)) history.replaceState(neu, "");
    else history.pushState(neu, "");
  } catch (err) {}
  Verlauf.key = k; Verlauf.z = z;
}
function detailOeffnen() {
  if (detailOffen()) return;
  $("detail").classList.add("open");
  try { history.pushState(Object.assign({}, history.state, { detail: true }), ""); } catch (err) {}
}
function detailSchliessen() {
  if (!detailOffen()) return;
  $("detail").classList.remove("open");
  if (history.state && history.state.detail) { Verlauf.ueberspringen = true; history.back(); }
}
