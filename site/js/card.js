/* ============================================================
   THE CARD — shared furniture for both artboards (CatchLabs)

   Same skeleton as the Denna's Trading agenda, which is the point:
   the rules about type as a fraction of the row, the date leading
   every show, the measured columns and the header that yields to a
   crowded list were all worked out there, and they are the reason
   fifteen shows fit on a phone and still read at arm's length.

   WHAT IS DIFFERENT HERE
   · THE MARGIN IS WIDER. The red sweep owns the left edge and the
     Japanese label rides beside it, so content starts at 132px and
     not 72. That costs 120px of measure, which the two-column
     split absorbs; the story format has the depth to pay for it.
   · THE HEADLINE IS THE WORD. The reference sets BEURZEN in a
     wide black face with the red line WAAR JE ONS VINDT under it,
     so the small line sits BELOW the heading here, in red, tracked
     wide — the reverse of the Denna's order.
   · THE DATE IS RED. Red is the one loud colour, and "when" is the
     one thing a collector scans for, so they are the same thing.
   · THE CITY MARK IS A BALL. The lozenge was the Denna's banner
     divider; here the system's own glyph for "here" is the tile's
     pokéball, drawn small in red.

   Every colour is read from the theme in the store. `useTheme` is
   called once at the top of a build and everything draws from `T`.
   ============================================================ */
(function (global) {
  'use strict';

  var B = global.Brand, S = global.Store;
  var W = 1080, SIDE = 132, CW = W - SIDE * 2;

  var FORMATS = {
    story: { key: 'story', h: 1920, logoW: 340, top: 74, head: 150, small: 36, sub: 50,
             footRule: 1672, closing: 54, note: 30, sign: 22, qr: 180,
             pitchMax1: 176, pitchMax2: 176 },
    post:  { key: 'post',  h: 1350, logoW: 250, top: 54, head: 108, small: 28, sub: 38,
             footRule: 1152, closing: 42, note: 25, sign: 20, qr: 152,
             pitchMax1: 150, pitchMax2: 150 }
  };
  function formatOf(st) { return FORMATS[st.meta.format] || FORMATS.story; }

  var T = S.DEFAULTS ? JSON.parse(JSON.stringify(S.DEFAULTS.theme)) : {};
  function useTheme(st) { T = st.theme; return T; }

  /* Type and baselines as fractions of the row. Archivo Black is a
     wider, heavier face than Anton, so the date fraction is a touch
     smaller than on the Denna's card — at 0.40 the digits were
     touching the weekday in the wide measure. */
  var SZ = {
    wide:   { date: 0.34,  name: 0.27,  city: 0.23,
              dateTop: 0.16, nameTop: 0.58 },
    narrow: { date: 0.30,  name: 0.25,  city: 0.23,
              dateTop: 0.12, nameTop: 0.46, cityTop: 0.71 },
    bandYear: 0.40, bandSub: 0.165
  };
  var CAP = { date: 84, name: 66, city: 40, bandYear: 84 };

  var FACE = {
    date:  ['Archivo Black', 400, 0.01],
    name:  ['Oswald', 600, 0.03],
    small: ['Inter', 600, 0.16],
    city:  ['Inter', 500, 0]
  };

  /* ---------- the city ---------- */
  function cityText(v) {
    v = String(v == null ? '' : v);
    if (/^‹/.test(v) || /[a-z]/.test(v)) return v;
    return v.toLowerCase().replace(/(^|[\s\-\/(])([a-zà-ÿ])/g, function (m, p, ch) { return p + ch.toUpperCase(); });
  }
  var BALL_EM = 1.05;   /* mark + its gap, in ems of the city size */
  function ballMark(fc) {
    var d = fc * 0.62;
    return '<svg' + dp('cityMark') + ' style="flex:none;width:' + px(d) + ';height:' + px(d) +
      ';margin-right:' + px(fc * 0.42) + ';transform:translateY(' + px(fc * 0.02) + ')" viewBox="0 0 20 20">' +
      '<circle cx="10" cy="10" r="8.5" fill="none" stroke="' + T.cityMark + '" stroke-width="2.4"/>' +
      '<path d="M1.5 10 H6.5 M13.5 10 H18.5" stroke="' + T.cityMark + '" stroke-width="2.4"/>' +
      '<circle cx="10" cy="10" r="3.2" fill="' + T.cityMark + '"/></svg>';
  }
  function cityHTML(e, fc, align) {
    return '<span style="display:inline-flex;align-items:center;flex:none;max-width:100%;' +
      (align === 'right' ? 'justify-content:flex-end;' : '') + '">' + ballMark(fc) +
      '<span class="body-med"' + evf(e, 'city') + dp('city') + ' style="font-size:' + px(fc) + ';line-height:1;color:' + T.city +
      ';white-space:nowrap;overflow:hidden">' + marker(cityText(e.city)) + '</span></span>';
  }

  /* ---------- measuring ---------- */
  var _mctx = null;
  function mctx() {
    if (!_mctx) _mctx = document.createElement('canvas').getContext('2d');
    return _mctx;
  }
  function widthAt100(text, face) {
    if (!text) return 0;
    var c2 = mctx(), extra = 0;
    c2.font = face[1] + ' 100px "' + face[0] + '", sans-serif';
    if ('letterSpacing' in c2) c2.letterSpacing = face[2] + 'em';
    else extra = face[2] * 100 * String(text).length;
    var w = c2.measureText(String(text)).width + extra;
    if ('letterSpacing' in c2) c2.letterSpacing = '0px';
    return w;
  }
  function widest(rows, pick, face) {
    var m = 0;
    for (var i = 0; i < rows.length; i++) m = Math.max(m, widthAt100(pick(rows[i]), face));
    return m;
  }

  function sizesFor(pitch, colW, wide, rows) {
    var Z = wide ? SZ.wide : SZ.narrow, GAP = 18;
    if (!rows.length) return { fd: pitch * Z.date, fn: pitch * Z.name, fc: pitch * Z.city };

    var dateW = widest(rows, function (e) { return S.dateLabel(e); }, FACE.date);
    var nameW = widest(rows, function (e) { return e.name; }, FACE.name);
    var cityW = widest(rows, function (e) { return cityText(e.city); }, FACE.city) + BALL_EM * 100;
    var dayW  = widest(rows, function (e) { return S.dayLabel(e); }, FACE.small);

    var fc = Math.min(pitch * Z.city, CAP.city);
    if (!wide && cityW + dayW > 0) {
      fc = Math.min(fc, (colW - GAP) * 100 / (cityW + dayW));
    }
    var dateRoom = wide ? colW - GAP - dayW * fc / 100 : colW;
    var nameRoom = wide ? colW - GAP - cityW * fc / 100 : colW;

    var fd = Math.min(pitch * Z.date, CAP.date);
    if (dateW > 0) fd = Math.min(fd, dateRoom * 100 / dateW);
    var fn = Math.min(pitch * Z.name, CAP.name);
    if (nameW > 0) fn = Math.min(fn, nameRoom * 100 / nameW);

    return { fd: Math.max(fd, 6), fn: Math.max(fn, 6), fc: Math.max(fc, 6) };
  }

  function betterPlan(a, b) {
    if (!b) return a;
    if (!a) return b;
    return b.sizes.fn > a.sizes.fn * 1.08 ? b : a;
  }
  var BAND_RATIO = 0.64;
  var WIDE = 700;

  function px(n) { return n.toFixed(1) + 'px'; }
  function cap(v, m) { return Math.min(v, m); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function marker(v) {
    return /^‹/.test(String(v))
      ? '<span style="color:' + T.marker + '">' + esc(v) + '</span>' : esc(v);
  }
  function ed(p) { return ' data-edit="' + p + '"'; }
  function dp(part) { return part ? ' data-part="' + part + '"' : ''; }
  function evf(e, f) { return ' data-ev="' + e._id + '" data-field="' + f + '"'; }
  function rule(x, y, w, color, h, part) {
    return '<div' + dp(part) + ' style="position:absolute;left:' + x + 'px;top:' + y.toFixed(1) +
      'px;width:' + w + 'px;height:' + (h || 1.5) + 'px;background:' +
      (color || T.rowRule) + '"></div>';
  }

  /* ---------- planes 1, 2 and 4 ----------
     The field, the tile at 5%, the sweep at full strength, and the
     two Japanese labels on top of it. The upper label sits in a
     white pill on the black corner, as the reference has it; the
     lower one runs down the white beside the band, level with the
     top of the list. Both are editable from the Tekst tab. */
  function ground(F, st) {
    var H = F.h, story = F.key === 'story';
    return '<div class="plane-1"' + dp('bg') + ' style="background:' + T.bg + '">' +
      '<div' + dp('pattern') + ' style="position:absolute;inset:0">' +
        B.streaks(H, { ink: T.pattern, paper: T.bg, seed: st.meta.bgSeed }) + '</div></div>' +
      '<div class="plane-2"' + dp('sweep') + '>' + B.sweep(H, { red: T.sweep, dark: T.sweepDark, paper: T.bg }) + '</div>' +
      '<div class="plane-4"></div>';
  }

  /* ---------- the header ----------
     Lockup, the knot on its hairline, the word, the red line under
     it, the span. Same yielding behaviour as before: the header is
     linear in its scale, so the scale that leaves the list a
     readable pitch is solved for, not searched. */
  var COMFORT_PITCH = 96, HEAD_MAX = 0.88, HEAD_MIN = 0.72;
  /* air between the header's lines, top to bottom: after the logo,
     the knot line, after the word, after the red line, after the span */
  var AIR = { logo: 30, knot: 18 + 30, head: 28, sub: 24, small: 34, rule: 28 };

  function headerDepth(F, s) {
    return (s == null ? 1 : s) *
      (F.top + B.logoHeight(F.logoW) + AIR.logo + AIR.knot +
       F.head * 0.92 + AIR.head + F.sub + AIR.sub + F.small + AIR.small + AIR.rule);
  }
  function headerScale(F, units) {
    var room = F.footRule - 28 - COMFORT_PITCH * Math.max(units, 1);
    return Math.max(HEAD_MIN, Math.min(HEAD_MAX, room / headerDepth(F, 1)));
  }

  function knotLine(y, s) {
    var half = 150 * s, r = 8 * s;
    var cx = W / 2;
    return '<svg' + dp('knot') + ' style="position:absolute;left:' + (cx - half) + 'px;top:' + px(y - r * 1.7) +
      ';width:' + (half * 2) + 'px;height:' + px(r * 3.4) + '" viewBox="' + (-half) + ' ' + (-r * 1.7) +
      ' ' + (half * 2) + ' ' + (r * 3.4) + '">' +
      '<path d="M' + (-half) + ' 0 H' + (-r * 2.4) + ' M' + (r * 2.4) + ' 0 H' + half +
      '" stroke="' + T.knot + '" stroke-width="' + (1.5 * s) + '"/>' +
      B.knot({ color: T.knot, r: r, sw: 1.5 * s }) + '</svg>';
  }

  function header(st, F, copy, s) {
    s = s == null ? 1 : s;
    var logoW = F.logoW * s, head = F.head * s, small = F.small * s, sub = F.sub * s;
    var logoH = B.logoHeight(logoW);
    var y = F.top * s;
    var h = B.logo({ w: logoW, x: (W - logoW) / 2, y: y, theme: T });
    var cx = W / 2, cy = y + logoH / 2;
    y += logoH + AIR.logo * s;

    h += knotLine(y + 9 * s, s);
    y += AIR.knot * s;

    /* The word, measured so it always fills the measure and never
       runs past it: BEURZEN is the default but the client can type
       AGENDA or EVENTS and the size follows. */
    var headW = widthAt100(copy.heading, ['Archivo Black', 400, 0.01]);
    var fh = headW > 0 ? Math.min(head, CW * 100 / headW) : head;
    h += '<div class="display"' + ed(copy.headingPath) + dp('heading') + ' style="position:absolute;left:' + SIDE +
      'px;top:' + px(y) + ';width:' + CW + 'px;text-align:center;font-size:' + px(fh) +
      ';color:' + T.heading + ';white-space:nowrap">' + esc(copy.heading) + '</div>';
    y += fh * 0.92 + AIR.head * s;

    /* Tracked at 0.24em, not 0.34: the wider tracking cost a third
       of the size once the line was measured against the column. */
    var subW = widthAt100(copy.eyebrow, ['Inter', 600, 0.24]);
    var fs = subW > 0 ? Math.min(sub, CW * 100 / subW) : sub;
    h += '<div class="label"' + ed(copy.eyebrowPath) + dp('eyebrow') + ' style="position:absolute;left:' + SIDE +
      'px;top:' + px(y) + ';width:' + CW + 'px;text-align:center;font-size:' + px(fs) +
      ';letter-spacing:0.24em;text-indent:0.24em;color:' + T.eyebrow + ';white-space:nowrap">' + esc(copy.eyebrow) + '</div>';
    y += fs + AIR.sub * s;

    var spanW = widthAt100(copy.range, ['Inter', 600, 0.18]);
    var fsm = spanW > 0 ? Math.min(small, CW * 100 / spanW) : small;
    h += '<div class="label"' + dp('span') + ' style="position:absolute;left:' + SIDE + 'px;top:' + px(y) +
      ';width:' + CW + 'px;text-align:center;font-size:' + px(fsm) + ';color:' +
      T.span + ';white-space:nowrap">' + esc(copy.range) + '</div>';
    y += fsm + AIR.small * s;

    h += rule(SIDE, y, CW, T.headRule, 1.5, 'headRule');

    return { html: h, rule: y, bodyTop: y + AIR.rule * s, logoCx: cx, logoCy: cy };
  }

  /* ---------- one show ---------- */
  function eventRow(x, y, w, e, pitch, sz) {
    var wide = w >= WIDE, Z = wide ? SZ.wide : SZ.narrow;
    sz = sz || sizesFor(pitch, w, wide, [e]);
    var fd = sz.fd, fn = sz.fn, fc = sz.fc;
    var row = function (top, left, right) {
      return '<div style="position:absolute;left:' + x + 'px;top:' + px(y + pitch * top) +
        ';width:' + w + 'px;display:flex;justify-content:space-between;' +
        'align-items:baseline;gap:18px">' + left + (right || '') + '</div>';
    };
    var date = '<span class="display"' + dp('date') + ' style="font-size:' + px(fd) + ';color:' + T.date +
      ';white-space:nowrap">' + esc(S.dateLabel(e)) + '</span>';
    var day = '<span class="label"' + dp('day') + ' style="font-size:' + px(fc) + ';color:' + T.day +
      ';letter-spacing:0.16em;white-space:nowrap;flex:none">' + esc(S.dayLabel(e)) + '</span>';
    var name = '<span class="cond"' + evf(e, 'name') + dp('name') + ' style="font-size:' + px(fn) +
      ';color:' + T.name + ';white-space:nowrap;overflow:hidden">' +
      esc(e.name) + '</span>';
    var city = cityHTML(e, fc, wide ? 'right' : 'left');

    return rule(x, y, w, T.rowRule, null, 'rowRule') + (wide
      ? row(Z.dateTop, date, day) + row(Z.nameTop, name, city)
      : row(Z.dateTop, date) + row(Z.nameTop, name) + row(Z.cityTop, city, day));
  }

  /* The band label is measured like everything else: SEPTEMBER in
     Archivo Black is 5.9em wide, and in a 384px column at the
     fraction alone it ran into the year beside it. */
  /* The size a band label sets at: the fraction of the pitch, held
     back by the room beside its sub-label. Exposed so two bands side
     by side (SEPTEMBER next to OKTOBER) can share the smaller one. */
  function bandSize(pitch, w, label, sub) {
    var fy = cap(pitch * SZ.bandYear, CAP.bandYear), fs = cap(pitch * SZ.bandSub, CAP.city);
    var room = w - 24;
    var lw = widthAt100(label, FACE.date), sw = widthAt100(sub || '', FACE.small);
    if (lw > 0) fy = Math.min(fy, (room - sw * fs / 100) * 100 / lw);
    return fy;
  }
  function band(x, y, w, o, pitch, textW) {
    var h = pitch * BAND_RATIO;
    var fs = cap(pitch * SZ.bandSub, CAP.city);
    var fy = bandSize(pitch, textW || w, o.label, o.sub);
    if (o.fy) fy = Math.min(fy, o.fy);
    return rule(x, y, w, T.bandRule, 3, 'bandRule') +
      (o.tick ? '<div' + dp('bandTick') + ' style="position:absolute;left:' + (x - 16) + 'px;top:' + px(y + h * 0.20) +
        ';width:6px;height:' + px(h * 0.55) + ';background:' + T.bandTick + '"></div>' : '') +
      '<div style="position:absolute;left:' + x + 'px;top:' + px(y + h * 0.20) + ';width:' +
      (textW || w) + 'px;display:flex;justify-content:space-between;align-items:baseline">' +
      '<span class="display"' + dp('bandYear') + ' style="font-size:' + px(fy) + ';color:' + T.bandYear +
      '">' + esc(o.label) + '</span>' +
      '<span class="label"' + (o.subPath ? ed(o.subPath) : '') + dp('bandLabel') + ' style="font-size:' + px(fs) +
      ';color:' + T.bandLabel + ';letter-spacing:0.18em">' + esc(o.sub) + '</span></div>';
  }
  function bandHeight(pitch) { return pitch * BAND_RATIO; }

  function qrBlock(x, y, box, url) {
    var quiet = Math.round(box * 0.11), code = box - quiet * 2;
    return '<div' + dp('qrFrame') + ' style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + box +
      'px;height:' + box + 'px;background:' + T.qrLight + ';border:2px solid ' + T.qrFrame +
      ';display:flex;align-items:center;justify-content:center">' +
      '<div' + dp('qrDark') + ' style="width:' + code + 'px;height:' + code + 'px">' +
      B.qrSVG(url, { dark: T.qrDark, light: T.qrLight }) + '</div></div>' +
      '<svg style="position:absolute;left:' + (x - 10) + 'px;top:' + (y - 10) +
      'px;width:38px;height:38px" viewBox="0 0 60 60"><g transform="translate(3 3)">' +
      B.bracket({ len: 40, sw: 3.2, color: T.qrFrame }) + '</g></svg>' +
      '<svg style="position:absolute;left:' + (x + box - 28) + 'px;top:' + (y + box - 28) +
      'px;width:38px;height:38px" viewBox="-60 -60 60 60"><g transform="translate(-3 -3)">' +
      B.bracket({ len: 40, sw: 3.2, corner: 'br', color: T.qrFrame }) + '</g></svg>';
  }

  var QR_IN = 48;   /* the QR sits this much inside the right margin: the sweep is widest at the foot */
  function footer(st, F) {
    var qrX = W - SIDE - F.qr - QR_IN, qrY = F.footRule + 22;
    var textW = CW - F.qr - QR_IN - 48;
    /* The closing line is measured like the heading, so a longer line
       ("TOT ZIENS OP DE BEURS") sets smaller instead of wrapping into
       the note under it. */
    var closeW = widthAt100(st.meta.closing, FACE.date);
    var fClose = closeW > 0 ? Math.min(F.closing, textW * 100 / closeW) : F.closing;
    /* the note and the handle row are single lines, sized to the
       column: the footer has a fixed depth and cannot grow downward */
    var noteW = widthAt100(st.meta.note, ['Inter', 400, 0]);
    var fNote = noteW > 0 ? Math.max(18, Math.min(F.note, textW * 2 * 100 / (noteW * 1.15))) : F.note;
    var signW = widthAt100(st.meta.handle, FACE.small) + widthAt100(st.meta.region, FACE.small) + 120;
    var fSign = signW > 0 ? Math.max(16, Math.min(F.sign, textW * 100 / signW)) : F.sign;
    return rule(SIDE, F.footRule, CW - QR_IN, T.footRule, 3, 'footRule') +
      '<div style="position:absolute;left:' + SIDE + 'px;top:' + (F.footRule + 38) +
      'px;width:' + textW + 'px">' +
      '<div class="display"' + ed('meta.closing') + dp('closing') + ' style="font-size:' + px(fClose) +
      ';color:' + T.closing + ';line-height:1.02;white-space:nowrap">' + esc(st.meta.closing) + '</div>' +
      '<div class="body"' + ed('meta.note') + dp('note') + ' style="font-size:' + px(fNote) + ';color:' +
      T.note + ';margin-top:12px;line-height:1.3;text-wrap:balance">' + esc(st.meta.note) + '</div>' +
      '<div style="display:flex;gap:' + px(fSign * 1.2) + ';align-items:baseline;margin-top:18px;white-space:nowrap">' +
      '<span class="label"' + ed('meta.handle') + dp('handle') + ' style="font-size:' + px(fSign) + ';color:' +
      T.handle + '">' + marker(st.meta.handle) + '</span>' +
      '<span class="label"' + ed('meta.region') + dp('region') + ' style="font-size:' + px(fSign) + ';color:' +
      T.region + '">' + esc(st.meta.region) + '</span></div></div>' +
      qrBlock(qrX, qrY, F.qr, st.meta.qrUrl);
  }

  function emptyRow(y, pitch, x, w) {
    x = x == null ? SIDE : x; w = w == null ? CW : w;
    var fc = cap(pitch * 0.175, CAP.city);
    var text = w >= WIDE ? 'NO SHOWS THIS MONTH' : 'NO SHOWS';
    var wAt100 = widthAt100(text, FACE.small);
    if (wAt100 > 0) fc = Math.min(fc, w * 100 / wAt100);
    return rule(x, y, w, T.rowRule, null, 'rowRule') +
      '<div class="label"' + dp('city') + ' style="position:absolute;left:' + x + 'px;top:' +
      px(y + pitch * 0.30) + ';width:' + w + 'px;font-size:' + px(fc) + ';color:' + T.city +
      ';letter-spacing:0.16em">' + text + '</div>';
  }

  global.Card = {
    W: W, SIDE: SIDE, CW: CW, FORMATS: FORMATS, formatOf: formatOf,
    BAND_RATIO: BAND_RATIO, WIDE: WIDE, useTheme: useTheme,
    esc: esc, marker: marker, ed: ed, evf: evf, rule: rule,
    ground: ground, header: header, eventRow: eventRow, band: band, bandSize: bandSize,
    bandHeight: bandHeight, footer: footer, qrBlock: qrBlock, emptyRow: emptyRow,
    sizesFor: sizesFor, betterPlan: betterPlan,
    headerScale: headerScale, headerDepth: headerDepth
  };
})(window);
