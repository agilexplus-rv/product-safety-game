/* Safety Stars — hand-drawn SVG art library (BabyBus-style chunky cartoon look).
 * Everything shares one style: thick warm-brown outlines, saturated candy
 * colours, rounded shapes, simple two-tone shading and white highlights. */
(function () {
  'use strict';

  var S = 'stroke="#4a3130" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"';
  var Sthin = 'stroke="#4a3130" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

  function svg(vb, body) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }

  /* ============================ ICONS (viewBox 0 0 100 100) ============================ */
  var ICONS = {
    teddy: svg('0 0 100 100',
      '<circle cx="30" cy="26" r="12" fill="#b97b4e" ' + S + '/><circle cx="70" cy="26" r="12" fill="#b97b4e" ' + S + '/>' +
      '<circle cx="30" cy="26" r="5" fill="#e8b48a"/><circle cx="70" cy="26" r="5" fill="#e8b48a"/>' +
      '<ellipse cx="50" cy="72" rx="24" ry="21" fill="#b97b4e" ' + S + '/>' +
      '<ellipse cx="50" cy="78" rx="12" ry="10" fill="#e8b48a"/>' +
      '<circle cx="50" cy="42" r="22" fill="#b97b4e" ' + S + '/>' +
      '<ellipse cx="50" cy="50" rx="10" ry="8" fill="#e8b48a"/>' +
      '<circle cx="42" cy="38" r="2.8" fill="#4a3130"/><circle cx="58" cy="38" r="2.8" fill="#4a3130"/>' +
      '<ellipse cx="50" cy="47" rx="3.5" ry="2.8" fill="#4a3130"/>' +
      '<path d="M46 53 Q50 56 54 53" fill="none" ' + Sthin + '/>' +
      '<path d="M38 88 q-8 4 -14 0" fill="none" ' + S + '/><path d="M62 88 q8 4 14 0" fill="none" ' + S + '/>' +
      '<path d="M40 60 l-5 8 M60 60 l5 8" fill="none" ' + S + '/>' +
      '<circle cx="45" cy="34" r="2" fill="#fff" opacity=".8"/>'),
    ball: svg('0 0 100 100',
      '<circle cx="50" cy="52" r="34" fill="#ff6b6b" ' + S + '/>' +
      '<path d="M50 18 A34 34 0 0 1 50 86 A50 50 0 0 0 50 18" fill="#ffd93d"/>' +
      '<path d="M50 18 A34 34 0 0 0 50 86 A50 50 0 0 1 50 18" fill="#4aa3ff"/>' +
      '<circle cx="50" cy="52" r="34" fill="none" ' + S + '/>' +
      '<circle cx="50" cy="52" r="11" fill="#fff" ' + S + '/>' +
      '<ellipse cx="38" cy="34" rx="7" ry="4" fill="#fff" opacity=".7" transform="rotate(-30 38 34)"/>'),
    blocks: svg('0 0 100 100',
      '<rect x="16" y="50" width="34" height="34" rx="6" fill="#ff8fab" ' + S + '/>' +
      '<rect x="52" y="50" width="34" height="34" rx="6" fill="#6fd08c" ' + S + '/>' +
      '<rect x="34" y="16" width="34" height="34" rx="6" fill="#ffd93d" ' + S + '/>' +
      '<text x="33" y="75" font-size="20" font-weight="bold" fill="#4a3130" font-family="sans-serif" text-anchor="middle">A</text>' +
      '<text x="69" y="75" font-size="20" font-weight="bold" fill="#4a3130" font-family="sans-serif" text-anchor="middle">B</text>' +
      '<text x="51" y="41" font-size="20" font-weight="bold" fill="#4a3130" font-family="sans-serif" text-anchor="middle">C</text>'),
    duck: svg('0 0 100 100',
      '<ellipse cx="48" cy="66" rx="30" ry="20" fill="#ffd93d" ' + S + '/>' +
      '<circle cx="36" cy="38" r="17" fill="#ffd93d" ' + S + '/>' +
      '<path d="M20 38 q-10 2 -12 6 q6 5 14 3z" fill="#ff9f43" ' + S + '/>' +
      '<circle cx="38" cy="34" r="3" fill="#4a3130"/>' +
      '<path d="M62 56 q14 -8 12 -20 q12 12 2 26z" fill="#ffc93d" ' + S + '/>' +
      '<ellipse cx="42" cy="60" rx="6" ry="4" fill="#fff" opacity=".6"/>' +
      '<circle cx="42" cy="30" r="2" fill="#fff" opacity=".8"/>'),
    book: svg('0 0 100 100',
      '<path d="M50 26 Q30 16 14 22 L14 74 Q30 68 50 78 Q70 68 86 74 L86 22 Q70 16 50 26z" fill="#6fb1ff" ' + S + '/>' +
      '<path d="M50 26 L50 78" fill="none" ' + S + '/>' +
      '<path d="M22 32 Q34 28 44 33 M22 44 Q34 40 44 45 M56 33 Q66 28 78 32 M56 45 Q66 40 78 44" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>'),
    crayons: svg('0 0 100 100',
      '<rect x="18" y="42" width="64" height="42" rx="8" fill="#ffb84c" ' + S + '/>' +
      '<path d="M30 42 L34 20 L40 42z" fill="#ff6b6b" ' + S + '/>' +
      '<path d="M46 42 L50 16 L56 42z" fill="#4aa3ff" ' + S + '/>' +
      '<path d="M62 42 L66 22 L72 42z" fill="#6fd08c" ' + S + '/>' +
      '<circle cx="50" cy="63" r="9" fill="#fff" ' + Sthin + '/>' +
      '<path d="M46 63 q4 4 8 0" fill="none" ' + Sthin + '/><circle cx="47" cy="60" r="1.6" fill="#4a3130"/><circle cx="53" cy="60" r="1.6" fill="#4a3130"/>'),
    train: svg('0 0 100 100',
      '<rect x="10" y="38" width="34" height="30" rx="6" fill="#4aa3ff" ' + S + '/>' +
      '<rect x="16" y="44" width="12" height="10" rx="3" fill="#cfeaff" ' + Sthin + '/>' +
      '<rect x="44" y="48" width="44" height="20" rx="5" fill="#ff6b6b" ' + S + '/>' +
      '<rect x="20" y="24" width="10" height="14" rx="3" fill="#ffd93d" ' + S + '/>' +
      '<circle cx="24" cy="74" r="8" fill="#ffd93d" ' + S + '/><circle cx="56" cy="74" r="8" fill="#ffd93d" ' + S + '/><circle cx="78" cy="74" r="8" fill="#ffd93d" ' + S + '/>' +
      '<circle cx="24" cy="74" r="2.5" fill="#4a3130"/><circle cx="56" cy="74" r="2.5" fill="#4a3130"/><circle cx="78" cy="74" r="2.5" fill="#4a3130"/>' +
      '<circle cx="34" cy="18" r="5" fill="#fff" opacity=".85"/><circle cx="42" cy="12" r="3.5" fill="#fff" opacity=".6"/>'),
    paint: svg('0 0 100 100',
      '<path d="M50 18 C24 18 12 38 16 56 C20 74 36 84 52 82 C60 81 58 74 54 70 C50 66 52 60 60 60 L74 60 C84 60 88 48 84 38 C78 24 64 18 50 18z" fill="#e8d5b5" ' + S + '/>' +
      '<circle cx="36" cy="36" r="6" fill="#ff6b6b" ' + Sthin + '/><circle cx="56" cy="30" r="6" fill="#4aa3ff" ' + Sthin + '/><circle cx="30" cy="56" r="6" fill="#6fd08c" ' + Sthin + '/><circle cx="70" cy="44" r="6" fill="#ffd93d" ' + Sthin + '/>'),
    drum: svg('0 0 100 100',
      '<ellipse cx="50" cy="70" rx="30" ry="12" fill="#e5533d" ' + S + '/>' +
      '<path d="M20 46 L20 70 A30 12 0 0 0 80 70 L80 46" fill="#ff8fab" ' + S + '/>' +
      '<ellipse cx="50" cy="46" rx="30" ry="12" fill="#fff4d6" ' + S + '/>' +
      '<path d="M28 60 L38 74 M50 58 L50 76 M72 60 L62 74" stroke="#ffd93d" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="30" y1="26" x2="46" y2="42" ' + S + '/><line x1="70" y1="26" x2="54" y2="42" ' + S + '/>' +
      '<circle cx="28" cy="24" r="5" fill="#ffd93d" ' + Sthin + '/><circle cx="72" cy="24" r="5" fill="#ffd93d" ' + Sthin + '/>'),
    car: svg('0 0 100 100',
      '<path d="M14 62 q0 -14 12 -16 l6 -12 q2 -5 8 -5 l22 0 q6 0 8 5 l6 12 q12 2 12 16 l0 6 q0 4 -4 4 l-66 0 q-4 0 -4 -4z" fill="#6fd08c" ' + S + '/>' +
      '<path d="M38 34 l-4 12 l14 0 0 -12z M52 34 l0 12 14 0 -4 -12z" fill="#cfeaff" ' + Sthin + '/>' +
      '<circle cx="32" cy="72" r="9" fill="#4a3130"/><circle cx="32" cy="72" r="4" fill="#cfd6e0"/>' +
      '<circle cx="68" cy="72" r="9" fill="#4a3130"/><circle cx="68" cy="72" r="4" fill="#cfd6e0"/>'),
    boat: svg('0 0 100 100',
      '<path d="M16 62 L84 62 L70 80 L30 80z" fill="#ff6b6b" ' + S + '/>' +
      '<line x1="50" y1="18" x2="50" y2="62" ' + S + '/>' +
      '<path d="M50 20 L74 44 L50 44z" fill="#ffd93d" ' + S + '/>' +
      '<path d="M8 84 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0 q8 -6 16 0" fill="none" stroke="#4aa3ff" stroke-width="4.5" stroke-linecap="round"/>'),
    toothbrush: svg('0 0 100 100',
      '<rect x="14" y="52" width="60" height="12" rx="6" fill="#4aa3ff" ' + S + '/>' +
      '<rect x="66" y="40" width="20" height="24" rx="6" fill="#4aa3ff" ' + S + '/>' +
      '<path d="M70 44 l0 -8 M76 44 l0 -8 M82 44 l0 -8" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="24" cy="58" r="2" fill="#fff" opacity=".8"/>'),
    soap: svg('0 0 100 100',
      '<rect x="34" y="34" width="32" height="48" rx="8" fill="#b28ff2" ' + S + '/>' +
      '<rect x="42" y="20" width="16" height="14" rx="4" fill="#8f6fd0" ' + S + '/>' +
      '<rect x="40" y="48" width="20" height="18" rx="4" fill="#fff" opacity=".85"/>' +
      '<circle cx="72" cy="26" r="4" fill="none" ' + Sthin + '/><circle cx="82" cy="16" r="3" fill="none" ' + Sthin + '/>'),
    /* ---------- hazards ---------- */
    battery: svg('0 0 100 100',
      '<ellipse cx="50" cy="58" rx="28" ry="24" fill="#cfd6e0" ' + S + '/>' +
      '<ellipse cx="50" cy="50" rx="28" ry="22" fill="#eef2f7" ' + S + '/>' +
      '<path d="M40 50 l20 0 M50 40 l0 20" stroke="#e5533d" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M78 22 l6 -8 M84 30 l10 -4 M70 16 l2 -10" stroke="#ffb84c" stroke-width="5" stroke-linecap="round"/>'),
    magnets: svg('0 0 100 100',
      '<circle cx="36" cy="42" r="13" fill="#9aa7b8" ' + S + '/><circle cx="62" cy="38" r="13" fill="#c3ceda" ' + S + '/>' +
      '<circle cx="48" cy="64" r="13" fill="#7e8da1" ' + S + '/><circle cx="72" cy="62" r="13" fill="#aab7c6" ' + S + '/>' +
      '<circle cx="32" cy="38" r="4" fill="#fff" opacity=".8"/><circle cx="58" cy="34" r="4" fill="#fff" opacity=".8"/>' +
      '<circle cx="44" cy="60" r="4" fill="#fff" opacity=".8"/>' +
      '<path d="M14 24 l8 6 M14 34 l6 2" stroke="#e5533d" stroke-width="4.5" stroke-linecap="round"/>'),
    broken: svg('0 0 100 100',
      '<rect x="28" y="40" width="44" height="36" rx="8" fill="#8fb7d9" ' + S + '/>' +
      '<rect x="34" y="16" width="32" height="26" rx="8" fill="#aacdea" ' + S + '/>' +
      '<circle cx="44" cy="28" r="4" fill="#4a3130"/><circle cx="58" cy="28" r="4" fill="#4a3130"/>' +
      '<path d="M44 36 q6 -4 12 0" fill="none" ' + Sthin + ' transform="rotate(180 50 35)"/>' +
      '<path d="M40 52 L52 58 L44 66 L58 72" fill="none" stroke="#e5533d" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="16" cy="82" r="8" fill="#ffd93d" ' + S + '/>' +
      '<path d="M84 78 q6 -6 2 -12 q8 2 8 10" fill="#9aa7b8" ' + Sthin + '/>' +
      '<line x1="72" y1="44" x2="86" y2="30" ' + S + '/><circle cx="88" cy="26" r="5" fill="#ffd93d" ' + Sthin + '/>'),
    balloon: svg('0 0 100 100',
      '<path d="M50 20 C34 20 28 34 32 44 C36 54 30 56 26 52 C30 64 44 62 48 52 C52 62 66 64 70 52 C66 56 60 54 64 44 C68 34 62 20 50 20z" fill="#ff6b6b" ' + S + '/>' +
      '<path d="M42 30 q-4 4 -2 10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M50 62 q-2 10 4 18 q-8 -2 -10 -8" fill="#ff9f9f" ' + Sthin + '/>' +
      '<path d="M22 30 l-6 -6 M78 30 l6 -6 M50 12 l0 -6" stroke="#ffb84c" stroke-width="4.5" stroke-linecap="round"/>'),
    plug: svg('0 0 100 100',
      '<rect x="30" y="26" width="40" height="34" rx="10" fill="#f2f2ee" ' + S + '/>' +
      '<circle cx="43" cy="43" r="4" fill="#4a3130"/><circle cx="57" cy="43" r="4" fill="#4a3130"/>' +
      '<path d="M50 60 q0 12 -10 16" fill="none" stroke="#4a3130" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M40 76 q-8 4 -16 2" fill="none" stroke="#4a3130" stroke-width="6" stroke-linecap="round" stroke-dasharray="8 7"/>' +
      '<path d="M56 72 l8 8 M64 72 l-8 8" stroke="#ffb84c" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M74 60 l8 -2 M74 68 l8 2" stroke="#ffb84c" stroke-width="4.5" stroke-linecap="round"/>'),
    meds: svg('0 0 100 100',
      '<rect x="26" y="34" width="34" height="44" rx="8" fill="#ff9f43" ' + S + '/>' +
      '<rect x="24" y="22" width="38" height="14" rx="5" fill="#fff" ' + S + '/>' +
      '<rect x="32" y="48" width="22" height="16" rx="3" fill="#fff" opacity=".9"/>' +
      '<ellipse cx="72" cy="66" rx="9" ry="6" fill="#ff6b6b" ' + Sthin + ' transform="rotate(-24 72 66)"/>' +
      '<ellipse cx="82" cy="80" rx="9" ry="6" fill="#4aa3ff" ' + Sthin + ' transform="rotate(18 82 80)"/>' +
      '<path d="M66 63 l10 5" stroke="#fff" stroke-width="3" stroke-linecap="round" transform="rotate(-24 72 66)"/>'),
    beads: svg('0 0 100 100',
      '<path d="M18 64 Q34 44 50 56 Q66 68 82 50" fill="none" ' + Sthin + '/>' +
      '<circle cx="18" cy="64" r="8" fill="#ff8fab" ' + Sthin + '/><circle cx="34" cy="52" r="8" fill="#ffd93d" ' + Sthin + '/>' +
      '<circle cx="50" cy="56" r="8" fill="#6fd08c" ' + Sthin + '/><circle cx="66" cy="60" r="8" fill="#4aa3ff" ' + Sthin + '/>' +
      '<circle cx="82" cy="50" r="8" fill="#b28ff2" ' + Sthin + '/>' +
      '<path d="M24 28 l6 6 M36 24 l2 8" stroke="#e5533d" stroke-width="4" stroke-linecap="round"/>'),
    bag: svg('0 0 100 100',
      '<path d="M26 34 Q22 88 30 90 L70 90 Q78 88 74 34 L62 34 L62 24 Q62 16 50 16 Q38 16 38 24 L38 34z" fill="#dff0fa" opacity=".92" ' + S + '/>' +
      '<path d="M38 34 L38 24 Q38 16 50 16 Q62 16 62 24 L62 34" fill="none" ' + S + '/>' +
      '<path d="M36 48 q10 8 28 2 M34 64 q12 8 32 2" fill="none" ' + Sthin + ' opacity=".5"/>' +
      '<path d="M14 24 l8 8 M86 24 l-8 8" stroke="#e5533d" stroke-width="4.5" stroke-linecap="round"/>'),
    hairdryer: svg('0 0 100 100',
      '<path d="M22 30 Q50 22 64 30 L64 54 Q50 62 22 54 Q14 42 22 30z" fill="#ff8fab" ' + S + '/>' +
      '<circle cx="24" cy="42" r="8" fill="#fff" ' + Sthin + '/>' +
      '<path d="M56 54 L64 76 Q60 84 50 80 L46 58" fill="#ff8fab" ' + S + '/>' +
      '<path d="M68 34 l12 -4 M70 42 l14 0 M68 50 l12 4" stroke="#9fd4e8" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M50 84 q-2 8 -10 10" fill="none" stroke="#4a3130" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M22 78 q-3 6 3 9 q6 3 9 -3 q2 -5 -6 -12 q-4 3 -6 6z" fill="#7fd4ff" ' + Sthin + '/>'),
    yarn: svg('0 0 100 100',
      '<circle cx="46" cy="46" r="28" fill="#ff8fab" ' + S + '/>' +
      '<path d="M22 36 q24 -12 48 0 M20 50 q26 -10 52 0 M24 62 q22 -10 44 0" fill="none" stroke="#e5648f" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M70 62 Q86 70 82 84 Q78 94 64 92" fill="none" ' + S + '/>' +
      '<path d="M64 92 q-18 2 -34 -4" fill="none" ' + S + '/>'),
    age03: svg('0 0 100 100',
      '<circle cx="50" cy="50" r="38" fill="#fff" stroke="#e5533d" stroke-width="8"/>' +
      '<circle cx="38" cy="46" r="11" fill="#ffd9b5" ' + Sthin + '/>' +
      '<circle cx="35" cy="44" r="1.8" fill="#4a3130"/><circle cx="42" cy="44" r="1.8" fill="#4a3130"/>' +
      '<path d="M35 50 q3.5 3 7 0" fill="none" stroke="#4a3130" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M30 38 q8 -8 16 0" fill="none" ' + Sthin + '/>' +
      '<text x="64" y="56" font-size="21" font-weight="bold" fill="#4a3130" font-family="sans-serif" text-anchor="middle">0-3</text>' +
      '<line x1="22" y1="78" x2="78" y2="22" stroke="#e5533d" stroke-width="8" stroke-linecap="round"/>'),
    /* magnifier for the spot game button */
    magnifier: svg('0 0 100 100',
      '<circle cx="42" cy="42" r="26" fill="#cfeaff" ' + S + '/>' +
      '<circle cx="42" cy="42" r="17" fill="#eaf7ff" ' + Sthin + '/>' +
      '<line x1="61" y1="61" x2="84" y2="84" stroke="#4a3130" stroke-width="12" stroke-linecap="round"/>' +
      '<line x1="61" y1="61" x2="82" y2="82" stroke="#ffb84c" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M32 34 q4 -6 12 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'),
    basket: svg('0 0 100 100',
      '<path d="M20 46 L80 46 L72 84 Q50 90 28 84z" fill="#e0a458" ' + S + '/>' +
      '<path d="M26 56 L74 56 M28 68 L72 68 M34 46 L36 84 M50 46 L50 86 M66 46 L64 84" stroke="#b97b3e" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M30 46 Q50 16 70 46" fill="none" ' + S + '/>'),
    bins: svg('0 0 100 100',
      '<rect x="14" y="40" width="32" height="40" rx="6" fill="#6fd08c" ' + S + '/>' +
      '<rect x="10" y="32" width="40" height="10" rx="5" fill="#57b374" ' + S + '/>' +
      '<rect x="54" y="40" width="32" height="40" rx="6" fill="#ff6b6b" ' + S + '/>' +
      '<rect x="50" y="32" width="40" height="10" rx="5" fill="#e5533d" ' + S + '/>' +
      '<path d="M24 52 l4 18 M36 52 l-4 18 M64 52 l4 18 M76 52 l-4 18" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>')
  };

  /* ============================ MASCOT: Ziggy the Safety Star ============================ */
  var MASCOT = svg('0 0 120 120',
    '<g class="zig-body">' +
    '<path d="M60 8 L74 38 L106 42 L82 64 L88 96 L60 80 L32 96 L38 64 L14 42 L46 38z" fill="#ffd93d" stroke="#4a3130" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M60 16 L70 40 L48 40z" fill="#fff" opacity=".35"/>' +
    '<g class="zig-eyes"><circle cx="50" cy="52" r="4.5" fill="#4a3130"/><circle cx="70" cy="52" r="4.5" fill="#4a3130"/>' +
    '<circle cx="52" cy="50" r="1.6" fill="#fff"/><circle cx="72" cy="50" r="1.6" fill="#fff"/></g>' +
    '<circle cx="43" cy="61" r="4.5" fill="#ff9f9f" opacity=".8"/><circle cx="77" cy="61" r="4.5" fill="#ff9f9f" opacity=".8"/>' +
    '<path d="M52 62 Q60 70 68 62" fill="none" stroke="#4a3130" stroke-width="4" stroke-linecap="round"/>' +
    '<g class="zig-arm-l"><path d="M20 48 q-10 4 -12 14" fill="none" stroke="#4a3130" stroke-width="5" stroke-linecap="round"/><circle cx="8" cy="64" r="6" fill="#ffd93d" stroke="#4a3130" stroke-width="4"/></g>' +
    '<g class="zig-arm-r"><path d="M100 48 q10 -6 10 -16" fill="none" stroke="#4a3130" stroke-width="5" stroke-linecap="round"/><circle cx="111" cy="30" r="6" fill="#ffd93d" stroke="#4a3130" stroke-width="4"/></g>' +
    '</g>');

  /* ============================ SCENE BACKDROPS (viewBox 0 0 800 500) ============================ */
  var W = 'stroke="#4a3130" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';

  function windowArt(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="170" height="130" rx="14" fill="#7fd4ff" ' + W + '/>' +
      '<circle cx="42" cy="34" r="18" fill="#ffd93d" stroke="#f0b429" stroke-width="4"/>' +
      '<ellipse cx="110" cy="40" rx="26" ry="12" fill="#fff"/><ellipse cx="130" cy="52" rx="20" ry="10" fill="#fff"/>' +
      '<line x1="85" y1="0" x2="85" y2="130" ' + W + '/><line x1="0" y1="65" x2="170" y2="65" ' + W + '/>' +
      '<path d="M-8 -6 q30 46 0 142 l-14 0 0 -142z" fill="#ff8fab" ' + W + '/>' +
      '<path d="M178 -6 q-30 46 0 142 l14 0 0 -142z" fill="#ff8fab" ' + W + '/>' +
      '</g>';
  }
  function shelfArt(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="150" height="16" rx="8" fill="#b97b4e" ' + W + '/>' +
      '<rect x="14" y="-34" width="24" height="34" rx="5" fill="#6fd08c" ' + W + '/>' +
      '<rect x="46" y="-28" width="24" height="28" rx="5" fill="#4aa3ff" ' + W + '/>' +
      '<circle cx="98" cy="-16" r="16" fill="#ff8fab" ' + W + '/>' +
      '<rect x="122" y="-24" width="18" height="24" rx="5" fill="#ffd93d" ' + W + '/>' +
      '</g>';
  }

  var SCENE_ART = {
    bedroom:
      '<rect x="0" y="0" width="800" height="330" fill="#ffe3ec"/>' +
      '<g fill="#ffc9da">' +
      '<circle cx="80" cy="60" r="9"/><circle cx="220" cy="120" r="7"/><circle cx="340" cy="50" r="8"/><circle cx="700" cy="120" r="8"/><circle cx="480" cy="90" r="6"/><circle cx="760" cy="40" r="6"/>' +
      '</g>' +
      '<rect x="0" y="330" width="800" height="170" fill="#e8b478"/>' +
      '<path d="M0 330 L800 330" ' + W + '/>' +
      '<g stroke="#cf975c" stroke-width="4" opacity=".7"><line x1="100" y1="340" x2="80" y2="500"/><line x1="260" y1="340" x2="250" y2="500"/><line x1="420" y1="340" x2="420" y2="500"/><line x1="580" y1="340" x2="590" y2="500"/><line x1="720" y1="340" x2="740" y2="500"/></g>' +
      windowArt(540, 40) +
      /* bed */
      '<g transform="translate(40,180)">' +
      '<rect x="0" y="0" width="46" height="150" rx="12" fill="#b97b4e" ' + W + '/>' +
      '<rect x="30" y="60" width="230" height="70" rx="16" fill="#fff" ' + W + '/>' +
      '<rect x="30" y="86" width="230" height="66" rx="14" fill="#4aa3ff" ' + W + '/>' +
      '<path d="M30 110 q116 18 230 0" fill="none" stroke="#2f7fd4 " stroke-width="4" opacity=".6"/>' +
      '<ellipse cx="70" cy="82" rx="34" ry="18" fill="#ffd93d" ' + W + '/>' +
      '<rect x="244" y="30" width="30" height="122" rx="10" fill="#b97b4e" ' + W + '/>' +
      '</g>' +
      /* rug */
      '<ellipse cx="440" cy="440" rx="180" ry="42" fill="#ff8fab" ' + W + '/>' +
      '<ellipse cx="440" cy="440" rx="130" ry="28" fill="#ffc9da"/>' +
      shelfArt(600, 250) +
      /* toy box */
      '<g transform="translate(690,360)"><rect x="0" y="0" width="95" height="70" rx="10" fill="#6fd08c" ' + W + '/><rect x="-5" y="-14" width="105" height="20" rx="8" fill="#57b374" ' + W + '/><circle cx="47" cy="34" r="12" fill="#ffd93d" ' + W + '/></g>',
    bathroom:
      '<rect x="0" y="0" width="800" height="330" fill="#d4f1fb"/>' +
      '<g stroke="#aednf5" stroke-width="3" opacity=".8" fill="none">' +
      '<path d="M0 80 L800 80 M0 160 L800 160 M0 240 L800 240 M100 0 L100 330 M240 0 L240 330 M380 0 L380 330 M520 0 L520 330 M660 0 L660 330" stroke="#a5dbec"/>' +
      '</g>' +
      '<rect x="0" y="330" width="800" height="170" fill="#9fd4e8"/>' +
      '<path d="M0 330 L800 330" ' + W + '/>' +
      /* mirror + sink */
      '<g transform="translate(70,50)">' +
      '<ellipse cx="70" cy="70" rx="58" ry="70" fill="#eaf9ff" ' + W + '/>' +
      '<ellipse cx="70" cy="70" rx="42" ry="54" fill="#fff" opacity=".7"/>' +
      '<path d="M40 40 q10 -14 26 -14" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>' +
      '</g>' +
      '<g transform="translate(60,240)">' +
      '<path d="M10 0 L150 0 Q160 44 80 48 Q0 44 10 0z" fill="#fff" ' + W + '/>' +
      '<rect x="60" y="48" width="40" height="90" fill="#fff" ' + W + '/>' +
      '<path d="M66 -18 q14 -12 28 0" fill="none" ' + W + '/><circle cx="94" cy="-16" r="6" fill="#9fd4e8" ' + W + '/>' +
      '</g>' +
      /* bathtub */
      '<g transform="translate(420,220)">' +
      '<path d="M0 30 L330 30 Q334 96 260 110 L70 110 Q-4 96 0 30z" fill="#fff" ' + W + '/>' +
      '<path d="M8 30 Q10 80 74 94 L256 94 Q320 80 322 30" fill="#dff0fa"/>' +
      '<circle cx="40" cy="14" r="13" fill="#fff" opacity=".95" ' + W + '/><circle cx="72" cy="4" r="10" fill="#fff" opacity=".9" ' + W + '/><circle cx="100" cy="14" r="8" fill="#fff" opacity=".85" ' + W + '/>' +
      '<rect x="46" y="110" width="18" height="26" rx="8" fill="#ffd93d" ' + W + '/><rect x="266" y="110" width="18" height="26" rx="8" fill="#ffd93d" ' + W + '/>' +
      '<path d="M300 30 L300 -30 Q300 -46 282 -46 L266 -46" fill="none" stroke="#9aa7b8" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M258 -38 l0 -16 16 0" fill="none" stroke="#9aa7b8" stroke-width="9" stroke-linecap="round"/>' +
      '</g>' +
      /* bath mat */
      '<ellipse cx="280" cy="450" rx="120" ry="30" fill="#ffd93d" ' + W + '/>',
    playroom:
      '<rect x="0" y="0" width="800" height="330" fill="#e2f7e2"/>' +
      /* rainbow */
      '<g transform="translate(180,140)" fill="none" stroke-linecap="round">' +
      '<path d="M-90 60 A90 90 0 0 1 90 60" stroke="#ff6b6b" stroke-width="16"/>' +
      '<path d="M-74 60 A74 74 0 0 1 74 60" stroke="#ffd93d" stroke-width="16"/>' +
      '<path d="M-58 60 A58 58 0 0 1 58 60" stroke="#6fd08c" stroke-width="16"/>' +
      '<path d="M-42 60 A42 42 0 0 1 42 60" stroke="#4aa3ff" stroke-width="16"/>' +
      '<ellipse cx="-96" cy="62" rx="26" ry="14" fill="#fff"/><ellipse cx="96" cy="62" rx="26" ry="14" fill="#fff"/>' +
      '</g>' +
      windowArt(560, 40) +
      '<rect x="0" y="330" width="800" height="170" fill="#f2cf8d"/>' +
      '<path d="M0 330 L800 330" ' + W + '/>' +
      '<g stroke="#d9b46e" stroke-width="4" opacity=".7"><line x1="120" y1="340" x2="100" y2="500"/><line x1="300" y1="340" x2="290" y2="500"/><line x1="480" y1="340" x2="480" y2="500"/><line x1="660" y1="340" x2="680" y2="500"/></g>' +
      /* rug */
      '<ellipse cx="380" cy="450" rx="200" ry="42" fill="#8fd0f2" ' + W + '/>' +
      '<ellipse cx="380" cy="450" rx="150" ry="29" fill="#c1e6f9"/>' +
      /* baby on a blanket */
      '<g transform="translate(196,300)">' +
      '<ellipse cx="40" cy="96" rx="76" ry="22" fill="#ffc9da" ' + W + '/>' +
      '<ellipse cx="40" cy="74" rx="26" ry="20" fill="#8fd0f2" ' + W + '/>' +
      '<circle cx="40" cy="38" r="24" fill="#ffd9b5" ' + W + '/>' +
      '<path d="M28 20 q12 -10 24 0" fill="none" ' + W + '/>' +
      '<circle cx="32" cy="36" r="3" fill="#4a3130"/><circle cx="48" cy="36" r="3" fill="#4a3130"/>' +
      '<path d="M34 46 q6 5 12 0" fill="none" stroke="#4a3130" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="24" cy="43" r="4" fill="#ff9f9f" opacity=".8"/><circle cx="56" cy="43" r="4" fill="#ff9f9f" opacity=".8"/>' +
      '<path d="M16 70 q-10 6 -8 16 M64 70 q10 6 8 16" fill="none" ' + W + '/>' +
      '</g>' +
      /* toy box */
      '<g transform="translate(600,330)">' +
      '<rect x="0" y="0" width="130" height="86" rx="12" fill="#ffb84c" ' + W + '/>' +
      '<rect x="-6" y="-18" width="142" height="24" rx="10" fill="#ff9f43" ' + W + '/>' +
      '<circle cx="65" cy="42" r="16" fill="#fff" ' + W + '/><path d="M58 42 l6 6 10 -12" fill="none" stroke="#6fd08c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</g>' +
      shelfArt(60, 250)
  };

  /* ============================ API ============================ */
  window.ART = {
    icon: function (id, sizePx) {
      var body = ICONS[id];
      if (!body) return null;
      return '<span class="art" style="width:' + sizePx + 'px;height:' + sizePx + 'px">' + body + '</span>';
    },
    raw: function (id) { return ICONS[id] || null; },
    scene: function (id) { return SCENE_ART[id] ? svg('0 0 800 500', SCENE_ART[id]) : null; },
    mascot: MASCOT,
    /* data-URI Image for canvas drawing (catch game) */
    image: function (id) {
      var body = ICONS[id];
      if (!body) return null;
      var img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(body);
      return img;
    }
  };
})();
