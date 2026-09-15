/* ============================================================
   BRAND KIT — CatchLabs

   The motifs, the logo slot and the QR. Everything the artboards
   draw that is "brand" rather than "layout" lives here, so when
   the real logo file arrives or the red shifts a shade, this is
   the one file that changes.

   WHAT WAS TAKEN FROM THE REFERENCE
   The client's own agenda (the one this replaces) has four things
   worth keeping: the red sweep down the left edge with a black
   corner behind it, the mirrored sweep up the right, the vertical
   Japanese labels riding on it, and a faint pokéball tile on the
   off-white ground. Those are drawn here as vector, so they scale
   to both formats and can be recoloured from the panel.

   THE LOGO
   Not supplied yet. `LOGO_FILE` is null, so the slot draws a
   placeholder — an emblem in the spirit of the reference (a red C
   wrapping a ball) with the wordmark set in Jost. When the file
   arrives, drop it in `assets/` and set LOGO_FILE to its path and
   its height-to-width ratio; the header's arithmetic reads the
   ratio, so the lockup is sized by its real proportions and never
   by the artboard around it.
   ============================================================ */
(function (global) {
  'use strict';

  var C = {
    red: '#C8161D', ink: '#111111', paper: '#F7F6F3', white: '#FFFFFF',
    grey: '#6E6E6E', rose: '#E3C2C3', marker: '#1E5BD8'
  };

  /* ---------- THE LOGO FILE ----------
     null  → draw the placeholder below
     { src: 'assets/catchlabs-logo.png', ratio: 0.64 }
           → place the supplied file; `ratio` is height / width of
             the file's VISIBLE artwork (measure it — an export with
             padding around the mark overstates the lockup). */
  /* the supplied lockup, cropped to its visible artwork: 676 × 472 */
  var LOGO_FILE = { src: 'assets/catchlabs-logo.png', ratio: 472 / 676 };

  /* ---------- THE STREAKS ----------
     The ground texture: a handful of wide diagonal bands, a shade
     darker than the paper, running from top right to bottom left
     the way light falls across a printed sheet. They fade to nothing
     towards the middle of the card, so the list sits on clean paper
     and the texture only shows at the edges. Each band carries a
     hairline of lighter paper along one side, which is what makes
     it read as a fold in the sheet and not a stripe.

     Positions and widths come from a small seeded generator, so the
     card is "random" but the same random every time it is exported.
     `seed` lives in the store; the panel can roll it. */
  function rng(seed) {
    var s = (seed * 9301 + 49297) % 233280;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }
  function streaks(H, o) {
    o = o || {};
    var ink = o.ink || C.ink, paper = o.paper || C.paper, seed = o.seed == null ? 7 : o.seed;
    var r = rng(seed), W = 1080;
    /* Three weights of band, mixed: a few broad and barely there,
       most medium, some narrow and a touch firmer. Together they
       read as folds in the sheet at different depths. */
    var n = 13 + Math.floor(r() * 5);
    var g = '';
    for (var i = 0; i < n; i++) {
      var x = -W * 0.6 + r() * (W * 2.2);            /* along the rotated axis */
      var kind = r();
      var w, op;
      if (kind < 0.25)      { w = 160 + r() * 180; op = 0.006 + r() * 0.008; }   /* broad, faint   */
      else if (kind < 0.8)  { w = 50 + r() * 120;  op = 0.010 + r() * 0.012; }   /* medium         */
      else                  { w = 14 + r() * 40;   op = 0.016 + r() * 0.014; }   /* narrow, firmer */
      g += '<rect x="' + x.toFixed(0) + '" y="-1500" width="' + w.toFixed(0) + '" height="' + (H + 3000) +
           '" fill="' + ink + '" opacity="' + op.toFixed(3) + '"/>';
      if (r() < 0.7) {
        g += '<rect x="' + (x + w).toFixed(0) + '" y="-1500" width="' + (2 + r() * 2).toFixed(1) + '" height="' + (H + 3000) +
             '" fill="' + paper + '" opacity="' + (0.5 + r() * 0.4).toFixed(2) + '"/>';
      }
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H +
      '" style="position:absolute;left:0;top:0">' +
      '<defs>' +
        /* the mask: black in the middle (hidden), white at the edges (shown) */
        '<radialGradient id="stFade" cx="0.5" cy="0.46" r="0.62">' +
          '<stop offset="0" stop-color="#000"/><stop offset="0.5" stop-color="#000"/>' +
          '<stop offset="1" stop-color="#fff"/></radialGradient>' +
        '<mask id="stMask"><rect width="' + W + '" height="' + H + '" fill="url(#stFade)"/></mask>' +
      '</defs>' +
      '<g mask="url(#stMask)"><g transform="rotate(38 540 ' + (H / 2) + ')">' + g + '</g></g>' +
      '</svg>';
  }

  /* ---------- THE SWEEP ----------
     Two ribbons, one down the left edge and one up the right, each
     built from four layers back to front:

       1. the black base wedge in the outer corner, with a fine
          diagonal hatch so it reads as a surface and not a hole
       2. the red band, shaded a step darker towards the outer edge
          so it has a little volume without becoming a gradient
       3. a paper pinstripe running inside the band, 14px in from
          its inner edge: the line that makes the ribbon a ribbon
       4. a faint red echo just outside the band on the paper, the
          same curve once more at a quarter strength

     The left band is an S: wide at the shoulder, it whips in under
     the heading and then holds a near-constant width down the list,
     so the vertical label and the content both have a straight
     edge to sit against. The right band is the mirror in spirit,
     rising from the foot.

     The inner edges are the numbers that matter. Left: ~64px at a
     third of the height, ~44 at the foot, which leaves the vertical
     label room beside it. Right: at the QR's lowest edge (y = 0.96H)
     the band is ~144px wide, and the QR is set 40px in from the
     margin, so the echo clears the QR by ten and the band itself by
     nearly thirty. Widen either and something in plane 3 goes under.

     Every layer is drawn from the same curve, shifted sideways:
     for an edge this close to vertical a horizontal shift is a
     good enough offset curve and a lot cheaper than a real one. */
  function shade(hex, f) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return hex;
    var n = parseInt(m[1], 16), out = '#';
    [(n >> 16) & 255, (n >> 8) & 255, n & 255].forEach(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v * (1 + f))));
      out += (v < 16 ? '0' : '') + v.toString(16);
    });
    return out;
  }
  function sweep(h, o) {
    o = o || {};
    var red = o.red || C.red, dark = o.dark || C.ink, paper = o.paper || C.paper;
    var H = h, deep = shade(red, -0.22);
    var f = function (n) { return (Math.round(n * 10) / 10); };

    /* inner edge of the left band, top to foot, shifted by dx */
    var leftEdge = function (dx) {
      return 'M' + (300 + dx) + ' 0 C' + (130 + dx) + ' ' + f(H * 0.10) + ' ' + (46 + dx) + ' ' + f(H * 0.22) +
             ' ' + (52 + dx) + ' ' + f(H * 0.36) + ' C' + (56 + dx) + ' ' + f(H * 0.52) + ' ' + (42 + dx) +
             ' ' + f(H * 0.76) + ' ' + (36 + dx) + ' ' + H;
    };
    /* inner edge of the right band, shoulder to foot, shifted by dx */
    var rightEdge = function (dx) {
      return 'M' + (1080 + dx) + ' ' + f(H * 0.30) + ' C' + (1050 + dx) + ' ' + f(H * 0.56) + ' ' +
             (1020 + dx) + ' ' + f(H * 0.80) + ' ' + (930 + dx) + ' ' + H;
    };
    var left = leftEdge(0) + ' H0 V0 Z';   /* V0: close up the edge, not diagonally back to the start */
    var right = rightEdge(0) + ' H1080 Z';
    var leftDark = 'M0 0 H170 C40 ' + f(H * 0.09) + ' 0 ' + f(H * 0.24) + ' 0 ' + f(H * 0.40) + ' Z';
    var rightDark = 'M1080 ' + f(H * 0.68) + ' C1080 ' + f(H * 0.83) + ' 1068 ' + f(H * 0.94) + ' 985 ' + H + ' H1080 Z';

    return '<svg width="1080" height="' + H + '" viewBox="0 0 1080 ' + H + '" style="position:absolute;left:0;top:0">' +
      '<defs>' +
        '<linearGradient id="swL" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + deep + '"/><stop offset="0.55" stop-color="' + red + '"/></linearGradient>' +
        '<linearGradient id="swR" x1="1" y1="0" x2="0" y2="0">' +
          '<stop offset="0" stop-color="' + deep + '"/><stop offset="0.55" stop-color="' + red + '"/></linearGradient>' +
        '<pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
          '<path d="M0 0 V10" stroke="' + paper + '" stroke-width="1.2" opacity="0.13"/></pattern>' +
        /* the right band starts at nothing on the shoulder; its
           pinstripe and echo only begin once there is a band to
           sit in, or they read as stray hairs off the edge */
        '<clipPath id="swRclip"><rect x="0" y="' + f(H * 0.42) + '" width="1080" height="' + H + '"/></clipPath>' +
      '</defs>' +
      /* left ribbon */
      '<path d="' + leftEdge(17) + '" fill="none" stroke="' + red + '" stroke-width="5" opacity="0.24"/>' +
      '<path d="' + left + '" fill="url(#swL)"/>' +
      '<path d="' + leftDark + '" fill="' + dark + '"/>' +
      '<path d="' + leftDark + '" fill="url(#hatch)"/>' +
      '<path d="' + leftEdge(-14) + '" fill="none" stroke="' + paper + '" stroke-width="3" opacity="0.9"/>' +
      /* right ribbon */
      '<path d="' + rightEdge(-17) + '" fill="none" stroke="' + red + '" stroke-width="5" opacity="0.24" clip-path="url(#swRclip)"/>' +
      '<path d="' + right + '" fill="url(#swR)"/>' +
      '<path d="' + rightDark + '" fill="' + dark + '"/>' +
      '<path d="' + rightDark + '" fill="url(#hatch)"/>' +
      '<path d="' + rightEdge(14) + '" fill="none" stroke="' + paper + '" stroke-width="3" opacity="0.9" clip-path="url(#swRclip)"/>' +
      '</svg>';
  }

  /* ---------- THE KNOT ----------
     The small red ornament under the wordmark in the reference: six
     overlapping rings on a hairline. The one piece of decoration in
     the system, so it stays small. */
  function knot(o) {
    o = o || {};
    var color = o.color || C.red, sw = o.sw || 1.6, r = o.r || 8;
    var out = '<g fill="none" stroke="' + color + '" stroke-width="' + sw + '">';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      out += '<circle cx="' + (Math.cos(a) * r * 0.62).toFixed(2) + '" cy="' +
        (Math.sin(a) * r * 0.62).toFixed(2) + '" r="' + r + '"/>';
    }
    return out + '</g>';
  }

  /* ---------- CORNER BRACKET — the QR frame ---------- */
  function bracket(o) {
    o = o || {};
    var len = o.len || 40, sw = o.sw || 1.4,
        color = o.color || C.red, corner = o.corner || 'tl';
    var fx = corner.indexOf('r') >= 0 ? -1 : 1;
    var fy = corner.indexOf('b') >= 0 ? -1 : 1;
    return '<g transform="scale(' + fx + ' ' + fy + ')">' +
           '<path d="M0 ' + len + ' L0 0 L' + len + ' 0" fill="none" stroke="' +
           color + '" stroke-width="' + sw + '"/></g>';
  }

  /* ---------- THE EMBLEM (placeholder) ----------
     A red C, open to the right, wrapping a ball. Drawn in a 100x100
     box. Replaced wholesale by the supplied file — nothing else in
     the system references its geometry. */
  function emblem(o) {
    o = o || {};
    var red = o.red || C.red, ink = o.ink || C.ink, light = o.light || C.paper;
    /* the supplied mark: a thick C open to the right, its upper half
       red and its lower half white, both outlined in black; a ball at
       the centre; a black bar running out of the ball to the right */
    var R = 46, w = 21, a0 = 0.70, a1 = 2 * Math.PI - 0.70, cx = 48, cy = 50;
    function pt(r, a) { return (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2); }
    function ring(from, to, sweepFlag) {
      return 'M' + pt(R, from) + ' A' + R + ' ' + R + ' 0 0 ' + sweepFlag + ' ' + pt(R, to) +
             ' L' + pt(R - w, to) + ' A' + (R - w) + ' ' + (R - w) + ' 0 0 ' + (1 - sweepFlag) + ' ' + pt(R - w, from) + ' Z';
    }
    var top = ring(a1, Math.PI, 0);          /* from the upper opening round to the left */
    var bottom = ring(Math.PI, a0, 0);       /* from the left round to the lower opening */
    return '<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block">' +
      '<path d="' + top + '" fill="' + red + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="' + bottom + '" fill="' + light + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="' + light + '" stroke="' + ink + '" stroke-width="4"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="5.5" fill="' + ink + '"/>' +
      '<path d="M' + (cx + 13) + ' ' + cy + ' H' + (cx + 46) + '" stroke="' + ink + '" stroke-width="5.5" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ---------- THE LOCKUP ----------
     Emblem over wordmark, centred, `w` wide. The placeholder's
     proportions follow the reference: the wordmark is the full
     width and the emblem is ~0.40 of it. */
  var EMB_FRAC = 0.40, GAP_FRAC = 0.05, WM_FRAC = 0.205;
  function placeholderHeight(w) { return w * (EMB_FRAC + GAP_FRAC + WM_FRAC * 0.98); }

  function logoHeight(w) {
    return LOGO_FILE ? w * LOGO_FILE.ratio : placeholderHeight(w);
  }

  function logo(opts) {
    opts = opts || {};
    var w = opts.w || 300, x = opts.x, y = opts.y;
    var T = opts.theme || {};
    var pos = (x == null && y == null) ? 'position:relative;'
            : 'position:absolute;left:' + x + 'px;top:' + y + 'px;';
    if (LOGO_FILE) {
      return '<div class="logo-slot" style="' + pos + 'width:' + w + 'px">' +
        '<img class="logo-img" src="' + LOGO_FILE.src + '" alt="CatchLabs"/></div>';
    }
    var embW = w * EMB_FRAC, fWm = w * WM_FRAC;
    return '<div class="logo-slot" style="' + pos + 'width:' + w +
      'px;display:flex;flex-direction:column;align-items:center">' +
      '<div style="width:' + embW.toFixed(2) + 'px;height:' + embW.toFixed(2) + 'px">' +
        emblem({ red: T.logoRed || C.red, ink: T.logoInk || C.ink, light: T.bg || C.paper }) + '</div>' +
      '<div class="wordmark" style="margin-top:' + (w * GAP_FRAC).toFixed(2) + 'px;font-size:' +
        fWm.toFixed(2) + 'px;white-space:nowrap">' +
        '<span style="color:' + (T.logoInk || C.ink) + '">catch</span>' +
        '<span style="color:' + (T.logoRed || C.red) + '">labs</span></div></div>';
  }

  /* ---------- THE QR ----------
     Black modules on white — the ground is white, not off-white,
     because the QR is the one thing on the card a machine reads and
     it gets every point of contrast. No quiet zone baked in; the
     layout adds it as padding so it stays measurable. */
  function qrSVG(text, o) {
    o = o || {};
    var dark = o.dark || C.ink, light = o.light || C.white;
    var qr = global.qrcode(0, 'M');
    qr.addData(String(text || ''));
    qr.make();
    var n = qr.getModuleCount(), d = '', r, c;
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n +
           '" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" ' +
           'style="width:100%;height:100%;display:block">' +
           '<rect width="' + n + '" height="' + n + '" fill="' + light + '"/>' +
           '<path d="' + d + '" fill="' + dark + '"/></svg>';
  }
  function qrModuleCount(text) {
    var qr = global.qrcode(0, 'M');
    qr.addData(String(text || '')); qr.make();
    return qr.getModuleCount();
  }

  global.Brand = {
    C: C, LOGO_FILE: LOGO_FILE,
    streaks: streaks, sweep: sweep, shade: shade, knot: knot, bracket: bracket, emblem: emblem,
    logo: logo, logoHeight: logoHeight, qrSVG: qrSVG, qrModuleCount: qrModuleCount
  };
})(window);
