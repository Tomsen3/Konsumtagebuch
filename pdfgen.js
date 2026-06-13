/* pdfgen.js — Minimaler PDF-Generator für Konsumtagebuch
   Erzeugt A4-PDFs mit Helvetica-Schriften und WinAnsiEncoding (deutsche Umlaute).
   Keine externe Bibliothek erforderlich — alle Daten bleiben lokal. */
(function (global) {
  'use strict';

  /* ── WinAnsiEncoding: Unicode → einzelnes Byte ─────────────────────────── */
  const WIN = {
    0x20AC:128,0x201A:130,0x0192:131,0x201E:132,0x2026:133,0x2020:134,
    0x2021:135,0x02C6:136,0x2030:137,0x0160:138,0x2039:139,0x0152:140,
    0x017D:142,0x2018:145,0x2019:146,0x201C:147,0x201D:148,0x2022:149,
    0x2013:150,0x2014:151,0x02DC:152,0x2122:153,0x0161:154,0x203A:155,
    0x0153:156,0x017E:158,0x0178:159,
  };
  function toWin(ch) {
    const c = ch.codePointAt(0);
    if (c < 32)  return 32;
    if (c < 128) return c;
    if (c >= 160 && c <= 255) return c;
    return WIN[c] || 63;
  }
  /* PDF-String: Inhalt als oktale Escapes, ASCII direkt */
  function pdfStr(s) {
    let r = '(';
    for (const ch of String(s)) {
      const b = toWin(ch);
      if (b === 40 || b === 41 || b === 92) r += '\\' + String.fromCharCode(b);
      else if (b >= 32 && b <= 126)         r += String.fromCharCode(b);
      else                                   r += '\\' + b.toString(8).padStart(3,'0');
    }
    return r + ')';
  }

  /* ── Helvetica-Zeichenbreiten (Einheiten per 1000 em) ──────────────────── */
  const HW = {
    ' ':278,'!':333,'"':474,'#':556,'$':556,'%':889,'&':722,"'":238,
    '(':333,')':333,'*':389,'+':584,',':278,'-':333,'.':278,'/':278,
    '0':556,'1':556,'2':556,'3':556,'4':556,'5':556,'6':556,'7':556,'8':556,'9':556,
    ':':278,';':278,'<':584,'=':584,'>':584,'?':556,'@':1015,
    'A':667,'B':667,'C':722,'D':722,'E':667,'F':611,'G':778,'H':722,'I':278,
    'J':500,'K':667,'L':611,'M':833,'N':722,'O':778,'P':667,'Q':778,'R':722,
    'S':667,'T':611,'U':722,'V':667,'W':944,'X':667,'Y':667,'Z':611,
    '[':278,'\\':278,']':278,'^':469,'_':556,
    'a':556,'b':556,'c':500,'d':556,'e':556,'f':278,'g':556,'h':556,'i':222,
    'j':222,'k':556,'l':222,'m':833,'n':556,'o':556,'p':556,'q':556,'r':333,
    's':500,'t':278,'u':556,'v':500,'w':722,'x':500,'y':500,'z':500,
  };
  function pdfTw(str, sz) {
    let w = 0;
    for (const ch of String(str)) w += (HW[ch] || 556);
    return w * sz / 1000;
  }

  /* ── Farb-Hilfsfunktionen ──────────────────────────────────────────────── */
  function rgbOp(hex, type) { // type: 'rg' (fill) | 'RG' (stroke)
    if (!hex) return `0 0 0 ${type}`;
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16)/255;
    const g = parseInt(h.slice(2,4),16)/255;
    const b = parseInt(h.slice(4,6),16)/255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${type}`;
  }
  function lightenHex(hex, f = 0.82) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    const x = c => Math.round(c+(255-c)*f).toString(16).padStart(2,'0');
    return `#${x(r)}${x(g)}${x(b)}`;
  }

  /* ── PDFDoc ────────────────────────────────────────────────────────────── */
  class PDFDoc {
    constructor() {
      this._n = 0; this._objs = []; this._pids = [];
      this.W = 595.28; this.H = 841.89; // A4 in pt
      this._cid = ++this._n; // Catalog-ID reservieren
      this._tid = ++this._n; // Pages-Tree-ID reservieren
      this._fids = {}; this._imgs = [];
      // Schriften registrieren
      for (const [alias, name] of [['F1','Helvetica'],['F2','Helvetica-Bold']]) {
        const id = ++this._n;
        this._fids[alias] = id;
        this._objs.push({ id, dict:
          `/Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding` });
      }
    }

    newPage() { return new PDFPage(this); }

    /* JPEG-Bild registrieren (jpegBytes = Uint8Array). Gibt name zurück. */
    addJpegImage(name, jpegBytes, width, height) {
      const id = ++this._n;
      let hex = '';
      for (let i = 0; i < jpegBytes.length; i++) hex += jpegBytes[i].toString(16).padStart(2,'0');
      hex += '>'; // ASCIIHexDecode-Terminator
      this._imgs.push({ id, name, hex, width, height });
      return name;
    }

    _commit(page) {
      const cid = ++this._n, pid = ++this._n;
      this._pids.push(pid);
      const fr = Object.entries(this._fids).map(([a,id]) => `/${a} ${id} 0 R`).join(' ');
      const xr = this._imgs.map(img => `/${img.name} ${img.id} 0 R`).join(' ');
      const xo = xr ? ` /XObject << ${xr} >>` : '';
      this._objs.push({ id: cid, stream: page._ops.join('\n') });
      this._objs.push({ id: pid, dict:
        `/Type /Page /Parent ${this._tid} 0 R ` +
        `/MediaBox [0 0 ${this.W.toFixed(2)} ${this.H.toFixed(2)}] ` +
        `/Contents ${cid} 0 R /Resources << /Font << ${fr} >>${xo} >>` });
    }

    generate() {
      // Bild-XObjects registrieren (vor dem Sortieren)
      for (const img of this._imgs) {
        this._objs.push({
          id: img.id,
          dict: `/Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height}` +
                ` /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode]`,
          stream: img.hex,
        });
      }

      // Catalog und Pages-Tree hinzufügen
      this._objs.push({ id: this._cid,
        dict: `/Type /Catalog /Pages ${this._tid} 0 R` });
      this._objs.push({ id: this._tid,
        dict: `/Type /Pages /Kids [${this._pids.map(i=>`${i} 0 R`).join(' ')}] /Count ${this._pids.length}` });

      this._objs.sort((a,b) => a.id - b.id);

      // Byte-String aufbauen (reines ASCII dank Oktal-Escapes)
      let s = '%PDF-1.4\n';
      const off = new Array(this._n + 1).fill(0);

      for (const o of this._objs) {
        off[o.id] = s.length;
        if (o.stream !== undefined) {
          // o.dict vorhanden → Bild-XObject; sonst → einfacher Content-Stream
          const d = o.dict
            ? `${o.dict} /Length ${o.stream.length}`
            : `/Length ${o.stream.length}`;
          s += `${o.id} 0 obj\n<< ${d} >>\nstream\n${o.stream}\nendstream\nendobj\n`;
        } else {
          s += `${o.id} 0 obj\n<< ${o.dict} >>\nendobj\n`;
        }
      }

      // XRef-Tabelle (genau 20 Bytes pro Eintrag: 10+1+5+1+1+1+1 = 20)
      const xs = s.length;
      s += `xref\n0 ${this._n+1}\n0000000000 65535 f \n`;
      for (let i = 1; i <= this._n; i++) {
        s += `${String(off[i]).padStart(10,'0')} 00000 n \n`;
      }
      s += `trailer\n<< /Size ${this._n+1} /Root ${this._cid} 0 R >>\nstartxref\n${xs}\n%%EOF\n`;

      // String → Uint8Array (1 char = 1 byte, ASCII-sicher)
      const bytes = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xFF;
      return bytes;
    }

    save(filename) {
      const bytes = this.generate();
      const blob  = new Blob([bytes], { type: 'application/pdf' });
      const url   = URL.createObjectURL(blob);
      const a     = Object.assign(document.createElement('a'), { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 15_000);
    }
  }

  /* ── PDFPage ───────────────────────────────────────────────────────────── */
  class PDFPage {
    constructor(doc) { this._doc = doc; this._ops = []; }

    // y-Koordinaten: intern immer TOP-Ursprung → PDF-Koordinate = H - y
    _py(y) { return this._doc.H - y; }

    /* Text zeichnen (y = Grundlinie, von oben gemessen) */
    text(str, x, y, { bold=false, size=10, color='#000000' }={}) {
      const fn = bold ? 'F2' : 'F1';
      this._ops.push(
        `${rgbOp(color,'rg')} BT /${fn} ${size} Tf ` +
        `${x.toFixed(2)} ${this._py(y).toFixed(2)} Td ${pdfStr(str)} Tj ET`
      );
    }

    /* Text mit Zeilenumbruch; gibt nächstes y zurück */
    textWrap(str, x, y, maxW, { bold=false, size=10, color='#000000', lh=1.45 }={}) {
      const lineH = size * lh;
      const words = String(str).split(' ');
      const lines = [];
      let cur = '';
      for (const w of words) {
        const t = cur ? `${cur} ${w}` : w;
        if (pdfTw(t, size) > maxW && cur) { lines.push(cur); cur = w; }
        else cur = t;
      }
      if (cur) lines.push(cur);
      lines.forEach((l, i) => this.text(l, x, y + i * lineH, { bold, size, color }));
      return y + lines.length * lineH;
    }

    /* Horizontale Linie */
    hline(y, { x1=40, x2=555, color='#dce6ec', lw=0.5 }={}) {
      const py = this._py(y);
      this._ops.push(
        `${rgbOp(color,'RG')} ${lw} w ` +
        `${x1.toFixed(2)} ${py.toFixed(2)} m ${x2.toFixed(2)} ${py.toFixed(2)} l S`
      );
    }

    /* Vertikale Linie */
    vline(x, y1, y2, { color='#dce6ec', lw=0.5 }={}) {
      this._ops.push(
        `${rgbOp(color,'RG')} ${lw} w ` +
        `${x.toFixed(2)} ${this._py(y1).toFixed(2)} m ` +
        `${x.toFixed(2)} ${this._py(y2).toFixed(2)} l S`
      );
    }

    /* Gefülltes Rechteck (y = obere Kante) */
    rect(x, y, w, h, { fill='#f2f6fb', stroke=null }={}) {
      const py = this._py(y + h); // untere linke Ecke in PDF-Koordinaten
      let op = `${rgbOp(fill,'rg')} ${x.toFixed(2)} ${py.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`;
      op += stroke ? ` ${rgbOp(stroke,'RG')} B` : ' f';
      this._ops.push(op);
    }

    /* Bild zeichnen (x, y = obere linke Ecke; w, h in pt) */
    drawImage(name, x, y, w, h) {
      const py = this._py(y + h); // untere linke Ecke in PDF-Koordinaten
      this._ops.push(
        `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${py.toFixed(2)} cm /${name} Do Q`
      );
    }

    /* Seite abschließen und dem Dokument übergeben */
    finish() { this._doc._commit(this); }
  }

  /* Globale Exporte */
  global.PDFDoc       = PDFDoc;
  global._pdfTw       = pdfTw;
  global._pdfLighten  = lightenHex;

}(window));
