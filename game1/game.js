/* Safety Stars — product-safety arcade for ages 4–6.
 * Three mini-games: Spot the Danger, Sort the Toys, Catch the Safe Toys.
 * All graphics are emoji; narration uses the Web Speech API when available. */
(function () {
  'use strict';

  /* ============================== STRINGS ============================== */
  var STRINGS = {
    en: {
      hubTitle: 'Safety Stars',
      hubSub: 'Hi! I’m Ziggy. Help me keep everyone safe!',
      lblSpot: 'Spot the Danger',
      lblSort: 'Sort the Toys',
      lblCatch: 'Catch the Safe Toys',
      spotTitle: 'Tap the dangers!',
      sortTitle: 'Where does it go?',
      catchTitle: 'Catch only safe toys!',
      binSafe: 'Safe to play',
      binDanger: 'Tell a grown-up',
      found: 'found',
      score: 'Score',
      hint: 'Move the basket with your finger or the arrow keys',
      ok: 'OK!',
      next: 'Next!',
      playAgain: 'Play again',
      backHome: 'Home',
      greatJob: 'Great job!',
      sceneDone: 'You found all the dangers!',
      sortDone: 'All toys sorted!',
      catchWin: 'Your basket is full of safe toys!',
      catchLose: 'Ouch! Too many dangerous things in the basket.',
      tryAgain: 'Try again!',
      thatsSafe: 'That’s safe!',
      keepLooking: 'Keep looking for dangers.',
      wellDone: 'Well done!',
      oops: 'Oops!',
      newBadge: 'You earned a new badge!',
      ziggyHello: 'Hello! Tap a game to play!',
      levelUp: 'Level up! Faster!',
      streak: 'streak',
      /* hazard explanations */
      r_battery: 'A button battery! These are very dangerous if swallowed. Tell a grown-up right away!',
      r_smallparts: 'A broken toy! Small pieces can choke you. Give it to a grown-up.',
      r_cord: 'A long cord! Cords and strings can get stuck around your neck. Play away from them.',
      r_water_elec: 'Electric things near water are very dangerous! Never touch them with wet hands.',
      r_bag: 'A plastic bag is not a toy. Never put it over your head!',
      r_meds: 'Medicines are not sweets! Only grown-ups may touch them.',
      r_balloon: 'Burst balloon bits! They can choke little mouths. Ask a grown-up to bin them.',
      r_magnets: 'Tiny magnets! Super dangerous if swallowed. Not for little kids!',
      r_age03: 'See this sign? “Not for under 3!” Keep it away from the baby.',
      r_hot: 'That’s hot! Hot things like straighteners can burn you badly.',
      /* item names for sort tags */
      n_teddy: 'Teddy', n_ball: 'Ball', n_blocks: 'Blocks', n_duck: 'Duck',
      n_book: 'Book', n_crayons: 'Crayons', n_train: 'Train', n_paint: 'Paints',
      n_battery: 'Button battery', n_magnets: 'Tiny magnets', n_broken: 'Broken toy',
      n_balloon: 'Burst balloon', n_plug: 'Broken plug', n_meds: 'Medicine', n_beads: 'Tiny beads',
      s_safe: 'is safe to play with!',
      s_danger: 'is for grown-ups to sort out!'
    },
    mt: {
      hubTitle: 'Stilel tas-Sigurtà',
      hubSub: 'Aħwa! Jien Ziggy. Għinni nżommu lil kulħadd sikur!',
      lblSpot: 'Sib il-Periklu',
      lblSort: 'Issortja l-Ġugarelli',
      lblCatch: 'Aqbad il-Ġugarelli Sikuri',
      spotTitle: 'Għafas fuq il-perikli!',
      sortTitle: 'Fejn imur?',
      catchTitle: 'Aqbad biss ġugarelli sikuri!',
      binSafe: 'Sikur biex tilgħab',
      binDanger: 'Għid lil adult',
      found: 'misjuba',
      score: 'Punti',
      hint: 'Mexxi l-qoffa b’sebgħek jew bil-vleġġez',
      ok: 'OK!',
      next: 'Li jmiss!',
      playAgain: 'Erġa’ ilgħab',
      backHome: 'Id-dar',
      greatJob: 'Prosit ħafna!',
      sceneDone: 'Sibt il-perikli kollha!',
      sortDone: 'Il-ġugarelli kollha ssortjati!',
      catchWin: 'Il-qoffa mimlija ġugarelli sikuri!',
      catchLose: 'Ajma! Wisq affarijiet perikolużi fil-qoffa.',
      tryAgain: 'Erġa’ pprova!',
      thatsSafe: 'Dak sikur!',
      keepLooking: 'Kompli fittex il-perikli.',
      wellDone: 'Prosit!',
      oops: 'Ojj!',
      newBadge: 'Rebaħt badġ ġdida!',
      ziggyHello: 'Aħwa! Għafas fuq logħba biex tilgħab!',
      levelUp: 'Livell ġdid! Aktar mgħaġġel!',
      streak: 'streak',
      r_battery: 'Batterija tal-buttuna! Perikoluża ħafna jekk tinbela’. Għid lil adult minnufih!',
      r_smallparts: 'Ġugarell miksur! Biċċiet żgħar jistgħu jifgawk. Agħtih lil adult.',
      r_cord: 'Ħabel twil! Ħbula u spag jistgħu jitgeżwru ma’ għonqok. Ilgħab ’il bogħod minnhom.',
      r_water_elec: 'Affarijiet tal-elettriku ħdejn l-ilma huma perikolużi ħafna! Qatt tmisshom b’idejk imxarrbin.',
      r_bag: 'Borża tal-plastik mhix ġugarell. Qatt tpoġġiha fuq rasek!',
      r_meds: 'Il-mediċini mhumiex ħelu! L-adulti biss jistgħu jmissuhom.',
      r_balloon: 'Biċċiet ta’ bużżieqa mifqugħa! Jistgħu jifgaw ħluq żgħar. Itlob lil adult jarmihom.',
      r_magnets: 'Kalamiti żgħar! Perikolużi ħafna jekk jinbelgħu. Mhux għat-tfal żgħar!',
      r_age03: 'Tara dan is-sinjal? “Mhux għal taħt it-3 snin!” Żommu ’l bogħod mit-tarbija.',
      r_hot: 'Dak jaħraq! Affarijiet sħan jaħarqu ħafna.',
      n_teddy: 'Teddy', n_ball: 'Ballun', n_blocks: 'Blokok', n_duck: 'Papra',
      n_book: 'Ktieb', n_crayons: 'Krejons', n_train: 'Ferrovija', n_paint: 'Żebgħa',
      n_battery: 'Batterija tal-buttuna', n_magnets: 'Kalamiti żgħar', n_broken: 'Ġugarell miksur',
      n_balloon: 'Bużżieqa mifqugħa', n_plug: 'Plagg miksur', n_meds: 'Mediċina', n_beads: 'Żibeġ żgħar',
      s_safe: 'huwa sikur biex tilgħab bih!',
      s_danger: 'huwa xogħol l-adulti!'
    }
  };
  var t = PSG.makeT(STRINGS);
  PSG.applyStatic(STRINGS);

  /* ============================== STATE ============================== */
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; }
    catch (e) { return fallback; }
  }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ } }

  var stars = load('psg1-stars', { spot: 0, sort: 0, catch: 0 });
  var soundOn = load('psg1-sound', true);
  var spotSceneIdx = load('psg1-scene', 0);

  /* ============================== AUDIO ============================== */
  var actx = null;
  function audio() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, delay, type, vol) {
    var ctx = audio(); if (!ctx || !soundOn) return;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, ctx.currentTime + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + dur + 0.05);
  }
  var sfx = {
    good: function () { tone(523, .12, 0); tone(659, .12, .1); tone(784, .2, .2); },
    bad: function () { tone(196, .25, 0, 'sawtooth', .1); tone(147, .3, .18, 'sawtooth', .1); },
    star: function () { tone(659, .1, 0); tone(784, .1, .09); tone(988, .1, .18); tone(1319, .35, .27); },
    tap: function () { tone(880, .06, 0, 'triangle', .08); },
    pop: function () { tone(440, .08, 0, 'square', .06); }
  };
  function speak(text) {
    if (!soundOn || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = PSG.getLang() === 'mt' ? 'mt-MT' : 'en-GB';
      u.rate = 0.92; u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  /* ============================== CONFETTI ============================== */
  var fx = document.getElementById('fx'), fctx = fx.getContext('2d'), parts = [];
  function sizeFx() { fx.width = innerWidth; fx.height = innerHeight; }
  sizeFx(); addEventListener('resize', sizeFx);
  var COLORS = ['#ff5d73', '#ffde59', '#2eb872', '#4aa3ff', '#b06ef2'];
  function runFx() {
    if (!runFx.running) { runFx.running = true; requestAnimationFrame(stepFx); }
  }
  function confetti(n) {
    for (var i = 0; i < n; i++) {
      parts.push({ x: Math.random() * fx.width, y: -20 - Math.random() * 120,
        vy: 2 + Math.random() * 3, vx: (Math.random() - .5) * 2, g: 0,
        s: 6 + Math.random() * 8, c: COLORS[i % COLORS.length], r: Math.random() * Math.PI, life: 999 });
    }
    runFx();
  }
  /* radial particle burst at a screen position — tap/catch feedback */
  function burstAt(x, y, n) {
    for (var i = 0; i < (n || 18); i++) {
      var a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 5;
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: 0.25,
        s: 5 + Math.random() * 7, c: COLORS[i % COLORS.length], r: Math.random() * Math.PI, life: 40 });
    }
    runFx();
  }
  function stepFx() {
    fctx.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter(function (p) { return p.y < fx.height + 30 && p.life > 0; });
    parts.forEach(function (p) {
      p.y += p.vy; p.x += p.vx; p.vy += p.g; p.r += .08; p.life--;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r);
      fctx.globalAlpha = p.life < 12 ? p.life / 12 : 1;
      fctx.fillStyle = p.c; fctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); fctx.restore();
    });
    if (parts.length) requestAnimationFrame(stepFx); else runFx.running = false;
  }
  /* quick floating toast (level-ups etc.) */
  function toastMsg(text) {
    var el = document.getElementById('toast1');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast1';
      document.getElementById('app').appendChild(el);
    }
    el.textContent = text;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* ============================== UI HELPERS ============================== */
  function $(id) { return document.getElementById(id); }
  var screens = ['hub', 'spot', 'sort', 'catch'];
  function show(id) {
    screens.forEach(function (s) { $(s).classList.toggle('hidden', s !== id); });
    if (id === 'hub') renderHub();
    if (id !== 'catch') stopCatch();
    if (id !== 'spot') clearTimeout(hintTimer);
  }
  function showCard(icon, title, text, btnLabel, onClose) {
    $('cardIcon').textContent = icon;
    $('cardTitle').textContent = title;
    $('cardText').textContent = text;
    $('cardBtn').textContent = btnLabel;
    $('overlay').classList.remove('hidden');
    speak(title + '. ' + text);
    $('cardBtn').onclick = function () {
      $('overlay').classList.add('hidden');
      if (window.speechSynthesis) speechSynthesis.cancel();
      if (onClose) onClose();
    };
  }
  function totalStars() { return stars.spot + stars.sort + stars.catch; }
  function starStr(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '⭐' : '☆'; return s; }
  function renderHub() {
    $('hubTitle').textContent = t('hubTitle');
    $('hubSub').textContent = t('hubSub');
    $('lblSpot').textContent = t('lblSpot');
    $('lblSort').textContent = t('lblSort');
    $('lblCatch').textContent = t('lblCatch');
    $('starsSpot').textContent = starStr(stars.spot);
    $('starsSort').textContent = starStr(stars.sort);
    $('starsCatch').textContent = starStr(stars.catch);
    $('starCount').textContent = '⭐ ' + totalStars();
    var badges = '';
    if (totalStars() >= 3) badges += '🎖️';
    if (totalStars() >= 6) badges += '🏅';
    if (totalStars() >= 9) badges += '🏆';
    $('badges').textContent = badges;
    $('soundBtn').textContent = soundOn ? '🔊' : '🔇';
  }
  function award(game, newStars) {
    if (newStars > stars[game]) { stars[game] = newStars; save('psg1-stars', stars); }
  }

  /* ============================== SPOT THE DANGER ============================== */
  /* Each scene: background, decorative emoji, and tappable items.
   * Positions are percentages of the scene box. */
  var SCENES = [
    { /* bedroom */
      bg: 'linear-gradient(180deg,#ffe9c9 0%,#ffd9a3 55%,#c98d5a 55%,#b57843 100%)',
      deco: [
        { e: '🛏️', x: 18, y: 62, s: 15 }, { e: '🪟', x: 78, y: 26, s: 13 },
        { e: '🖼️', x: 40, y: 20, s: 8 }, { e: '🧸', x: 18, y: 44, s: 7 }
      ],
      items: [
        { e: '🔋', x: 62, y: 82, s: 6, hazard: 'r_battery' },
        { e: '🤖💔', x: 36, y: 80, s: 7, hazard: 'r_smallparts' },
        { e: '🧶', x: 88, y: 62, s: 7, hazard: 'r_cord' },
        { e: '⚽', x: 50, y: 88, s: 6 },
        { e: '📚', x: 68, y: 55, s: 6 },
        { e: '🚂', x: 22, y: 88, s: 6 },
        { e: '🧩', x: 80, y: 86, s: 6 }
      ]
    },
    { /* bathroom */
      bg: 'linear-gradient(180deg,#d9f4ff 0%,#bfe9ff 50%,#9fd4e8 50%,#8ec7dd 100%)',
      deco: [
        { e: '🛁', x: 25, y: 72, s: 17 }, { e: '🚽', x: 82, y: 70, s: 10 },
        { e: '🪥', x: 60, y: 22, s: 8 }, { e: '🧼', x: 45, y: 42, s: 5 }
      ],
      items: [
        { e: '💨🔌', x: 42, y: 60, s: 7, hazard: 'r_water_elec' },
        { e: '🛍️', x: 68, y: 86, s: 7, hazard: 'r_bag' },
        { e: '💊', x: 88, y: 40, s: 6, hazard: 'r_meds' },
        { e: '🦆', x: 25, y: 58, s: 6 },
        { e: '⛵', x: 14, y: 60, s: 5 },
        { e: '🪥', x: 12, y: 30, s: 6 },
        { e: '🧴', x: 58, y: 46, s: 5 }
      ]
    },
    { /* playroom */
      bg: 'linear-gradient(180deg,#e8ffe0 0%,#d2f5c8 55%,#8fce7d 55%,#7cbf6a 100%)',
      deco: [
        { e: '🛋️', x: 75, y: 70, s: 16 }, { e: '🧸', x: 75, y: 52, s: 8 },
        { e: '👶', x: 30, y: 74, s: 11 }, { e: '🪟', x: 20, y: 24, s: 12 }
      ],
      items: [
        { e: '🎈💥', x: 55, y: 86, s: 7, hazard: 'r_balloon' },
        { e: '🧲', x: 88, y: 88, s: 6, hazard: 'r_magnets' },
        { e: '🚫👶', x: 40, y: 60, s: 7, hazard: 'r_age03' },
        { e: '🧩', x: 14, y: 88, s: 6 },
        { e: '🧸', x: 62, y: 62, s: 6 },
        { e: '🥁', x: 30, y: 90, s: 6 },
        { e: '🚗', x: 70, y: 90, s: 5 }
      ]
    }
  ];

  var spotState = null, hintTimer = 0;
  function startSpot() {
    var scene = SCENES[spotSceneIdx % SCENES.length];
    scene.items.forEach(function (i) {
      i._found = false;
      /* jitter positions a little each play so scenes stay fresh */
      i._jx = Math.max(6, Math.min(94, i.x + (Math.random() - .5) * 6));
      i._jy = Math.max(8, Math.min(93, i.y + (Math.random() - .5) * 5));
    });
    spotState = { scene: scene, found: 0, wrong: 0,
      total: scene.items.filter(function (i) { return i.hazard; }).length };
    $('spotTitle').textContent = t('spotTitle');
    renderScene();
    show('spot');
    speak(t('spotTitle'));
    armHint();
  }
  /* if the player is stuck for a while, wiggle one unfound hazard */
  function armHint() {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      if (!spotState || $('spot').classList.contains('hidden')) return;
      var left = spotState.scene.items.filter(function (i) { return i.hazard && !i._found; });
      if (left.length) {
        var it = left[Math.floor(Math.random() * left.length)];
        if (it._el) {
          it._el.classList.add('hint');
          tone(988, .1, 0, 'triangle', .07); tone(1175, .14, .12, 'triangle', .07);
          setTimeout(function () { it._el && it._el.classList.remove('hint'); }, 2200);
        }
      }
      armHint();
    }, 9000);
  }
  function renderScene() {
    var sceneEl = $('scene');
    sceneEl.innerHTML = '';
    sceneEl.style.background = spotState.scene.bg;
    var w = sceneEl.clientWidth || 600;
    spotState.scene.deco.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'item deco';
      el.textContent = d.e;
      el.style.left = d.x + '%'; el.style.top = d.y + '%';
      el.style.fontSize = (d.s * w / 100) + 'px';
      sceneEl.appendChild(el);
    });
    spotState.scene.items.forEach(function (it) {
      var el = document.createElement('button');
      el.className = 'item' + (it._found ? ' found' : '');
      el.innerHTML = '<span class="ring"></span>' + it.e;
      el.style.left = (it._jx || it.x) + '%'; el.style.top = (it._jy || it.y) + '%';
      el.style.fontSize = (it.s * w / 100) + 'px';
      el.addEventListener('click', function () { tapItem(it, el); });
      it._el = el;
      sceneEl.appendChild(el);
    });
    updateSpotProgress();
  }
  function updateSpotProgress() {
    $('spotProgress').textContent = '⚠️ ' + spotState.found + '/' + spotState.total;
  }
  function tapItem(it, el) {
    if (it._found) return;
    armHint();
    if (it.hazard) {
      it._found = true;
      el.classList.add('found');
      spotState.found++;
      sfx.good();
      var c = centerOf(el);
      burstAt(c.x, c.y, 22);
      updateSpotProgress();
      showCard('⚠️', t('wellDone'), t(it.hazard), spotState.found >= spotState.total ? t('ok') : t('next'), function () {
        if (spotState.found >= spotState.total) finishSpot();
      });
    } else {
      spotState.wrong++;
      el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong');
      sfx.pop();
      speak(t('thatsSafe') + ' ' + t('keepLooking'));
    }
  }
  function finishSpot() {
    var earned = spotState.wrong === 0 ? 3 : (spotState.wrong <= 2 ? 2 : 1);
    award('spot', earned);
    spotSceneIdx++; save('psg1-scene', spotSceneIdx);
    sfx.star(); confetti(120);
    showCard('🎉', t('greatJob'), t('sceneDone') + ' ' + starStr(earned), t('ok'), function () { show('hub'); });
  }

  /* ============================== SORT THE TOYS ============================== */
  var SORT_POOL = [
    { e: '🧸', n: 'n_teddy' }, { e: '⚽', n: 'n_ball' },
    { e: '🧩', n: 'n_blocks' }, { e: '🦆', n: 'n_duck' },
    { e: '📖', n: 'n_book' }, { e: '🖍️', n: 'n_crayons' },
    { e: '🚂', n: 'n_train' }, { e: '🎨', n: 'n_paint' },
    { e: '🔋', n: 'n_battery', hazard: 'r_battery' },
    { e: '🧲', n: 'n_magnets', hazard: 'r_magnets' },
    { e: '🤖💔', n: 'n_broken', hazard: 'r_smallparts' },
    { e: '🎈💥', n: 'n_balloon', hazard: 'r_balloon' },
    { e: '🔌⚡', n: 'n_plug', hazard: 'r_water_elec' },
    { e: '💊', n: 'n_meds', hazard: 'r_meds' },
    { e: '📿', n: 'n_beads', hazard: 'r_age03' }
  ];
  var sortState = null;
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function startSort() {
    var safe = shuffle(SORT_POOL.filter(function (x) { return !x.hazard; })).slice(0, 5);
    var danger = shuffle(SORT_POOL.filter(function (x) { return x.hazard; })).slice(0, 5);
    sortState = { queue: shuffle(safe.concat(danger)), idx: 0, correct: 0, streak: 0, busy: false };
    $('sortTitle').textContent = t('sortTitle');
    $('binSafeLbl').textContent = t('binSafe');
    $('binDangerLbl').textContent = t('binDanger');
    show('sort');
    nextSortItem();
    speak(t('sortTitle'));
  }
  function nextSortItem() {
    if (sortState.idx >= sortState.queue.length) return finishSort();
    var it = sortState.queue[sortState.idx];
    $('convItem').innerHTML = it.e + '<span class="tag">' + t(it.n) + '</span>';
    var streakTxt = sortState.streak >= 2 ? ' 🔥×' + sortState.streak : '';
    $('sortProgress').textContent = (sortState.idx + 1) + '/' + sortState.queue.length + ' ⭐' + sortState.correct + streakTxt;
    sortState.busy = false;
  }
  function pickBin(isDangerBin, binEl) {
    if (!sortState || sortState.busy) return;
    sortState.busy = true;
    var it = sortState.queue[sortState.idx];
    var correct = (!!it.hazard) === isDangerBin;
    binEl.classList.remove('correct', 'incorrect'); void binEl.offsetWidth;
    if (correct) {
      sortState.correct++;
      sortState.streak++;
      binEl.classList.add('correct');
      /* pitch rises with the streak — classic arcade escalation */
      var m = 1 + Math.min(sortState.streak, 8) * 0.07;
      tone(523 * m, .12, 0); tone(659 * m, .12, .1); tone(784 * m, .2, .2);
      var c = centerOf(binEl);
      burstAt(c.x, c.y - 20, 12 + Math.min(sortState.streak * 3, 20));
      sortState.idx++;
      setTimeout(nextSortItem, 550);
    } else {
      sortState.streak = 0;
      binEl.classList.add('incorrect');
      sfx.bad();
      var msg = it.hazard ? t(it.hazard) : (t(it.n) + ' ' + t('s_safe'));
      showCard(it.e, t('oops'), msg, t('next'), function () {
        sortState.idx++;
        nextSortItem();
      });
    }
  }
  function finishSort() {
    var c = sortState.correct;
    var earned = c >= 10 ? 3 : (c >= 8 ? 2 : 1);
    award('sort', earned);
    sfx.star(); confetti(120);
    showCard('🎉', t('greatJob'), t('sortDone') + ' ' + c + '/10 ' + starStr(earned), t('ok'), function () { show('hub'); });
  }

  /* ============================== CATCH ============================== */
  var CATCH_SAFE = ['🧸', '⚽', '🦆', '🚂', '🧩', '📖'];
  var CATCH_BAD = ['🔋', '🧲', '🔌', '💊', '🪤'];
  var catchState = null, catchRAF = 0;
  var canvas = $('catchCanvas'), cctx = canvas.getContext('2d');

  function startCatch() {
    $('catchTitle').textContent = t('catchTitle');
    $('catchHint').textContent = t('hint');
    show('catch');
    sizeCatch();
    catchState = {
      x: canvas.width / 2, items: [], lives: 3, caught: 0, target: 15,
      speed: 1.05, spawnIn: 0, over: false, keys: {}, flash: 0, level: 1
    };
    updateCatchHud();
    speak(t('catchTitle'));
    cancelAnimationFrame(catchRAF);
    catchRAF = requestAnimationFrame(stepCatch);
  }
  function sizeCatch() {
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(300, r.width);
    canvas.height = Math.max(240, r.height);
  }
  addEventListener('resize', function () { if (catchState && !$('catch').classList.contains('hidden')) sizeCatch(); });
  function stopCatch() { cancelAnimationFrame(catchRAF); catchState = null; }
  function updateCatchHud() {
    if (!catchState) return;
    $('catchScore').textContent = '🧺 ' + catchState.caught + '/' + catchState.target;
    var h = ''; for (var i = 0; i < 3; i++) h += i < catchState.lives ? '❤️' : '🤍';
    $('catchLives').textContent = h;
  }
  function stepCatch() {
    if (!catchState) return;
    var st = catchState, W = canvas.width, H = canvas.height;
    var basketW = Math.max(80, W * 0.14), basketH = 26, basketY = H - 48;

    /* input */
    if (st.keys.ArrowLeft) st.x -= 9;
    if (st.keys.ArrowRight) st.x += 9;
    st.x = Math.max(basketW / 2, Math.min(W - basketW / 2, st.x));

    /* spawn */
    st.spawnIn -= 1;
    if (st.spawnIn <= 0 && !st.over) {
      /* danger ratio ramps up gently as the round progresses */
      var badChance = Math.min(0.42, 0.22 + st.caught * 0.013);
      var bad = Math.random() < badChance;
      var pool = bad ? CATCH_BAD : CATCH_SAFE;
      st.items.push({ e: pool[Math.floor(Math.random() * pool.length)], bad: bad,
        x: 40 + Math.random() * (W - 80), y: -30, vy: (2 + Math.random() * 1.4) * st.speed,
        drift: (Math.random() - .5) * 1.2 });
      st.spawnIn = Math.max(24, 64 - st.caught * 2.4);
    }

    /* update items */
    var fontSize = Math.max(30, W * 0.05);
    st.items = st.items.filter(function (it) {
      it.y += it.vy; it.x += it.drift;
      /* catch detection */
      if (it.y > basketY - fontSize * 0.4 && it.y < basketY + basketH + 10 &&
          Math.abs(it.x - st.x) < basketW / 2 + fontSize * 0.25) {
        var rect = canvas.getBoundingClientRect();
        var sx = rect.left + it.x / W * rect.width;
        var sy = rect.top + it.y / H * rect.height;
        if (it.bad) {
          st.lives--; sfx.bad(); st.flash = 10;
          if (st.lives <= 0) { st.over = true; endCatch(false); }
        } else {
          st.caught++; sfx.tap(); st.speed += 0.035;
          burstAt(sx, sy, 10);
          /* level-up beat every 5 catches — visible escalation */
          if (st.caught % 5 === 0 && st.caught < st.target) {
            st.level++; st.speed += 0.12;
            toastMsg('🚀 ' + t('levelUp'));
            tone(659, .1, 0); tone(880, .1, .1); tone(1109, .22, .2);
          }
          if (st.caught >= st.target) { st.over = true; endCatch(true); }
        }
        updateCatchHud();
        return false;
      }
      return it.y < H + 40;
    });

    /* draw */
    cctx.clearRect(0, 0, W, H);
    /* soft parallax hills */
    cctx.fillStyle = 'rgba(140, 200, 130, .45)';
    cctx.beginPath();
    cctx.moveTo(0, H);
    cctx.quadraticCurveTo(W * 0.22, H - H * 0.22, W * 0.5, H - H * 0.10);
    cctx.quadraticCurveTo(W * 0.75, H - H * 0.02, W, H - H * 0.14);
    cctx.lineTo(W, H); cctx.closePath(); cctx.fill();
    cctx.fillStyle = 'rgba(110, 180, 105, .55)';
    cctx.beginPath();
    cctx.moveTo(0, H);
    cctx.quadraticCurveTo(W * 0.3, H - H * 0.09, W * 0.62, H - H * 0.05);
    cctx.quadraticCurveTo(W * 0.85, H - H * 0.02, W, H - H * 0.06);
    cctx.lineTo(W, H); cctx.closePath(); cctx.fill();
    cctx.font = fontSize + 'px serif';
    cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
    st.items.forEach(function (it) { cctx.fillText(it.e, it.x, it.y); });
    /* basket */
    cctx.font = (basketW * 0.9) + 'px serif';
    cctx.fillText('🧺', st.x, basketY + 6);
    /* red flash when a dangerous item lands in the basket */
    if (st.flash > 0) {
      cctx.fillStyle = 'rgba(255,60,60,' + (st.flash / 10 * 0.35) + ')';
      cctx.fillRect(0, 0, W, H);
      st.flash--;
    }

    if (!st.over) catchRAF = requestAnimationFrame(stepCatch);
  }
  function endCatch(won) {
    var st = catchState;
    var earned = won ? (st.lives >= 3 ? 3 : (st.lives === 2 ? 2 : 1)) : 0;
    if (won) { award('catch', earned); sfx.star(); confetti(140); }
    showCard(won ? '🎉' : '😅',
      won ? t('greatJob') : t('oops'),
      (won ? t('catchWin') + ' ' + starStr(earned) : t('catchLose') + ' ' + t('tryAgain')),
      won ? t('ok') : t('playAgain'),
      function () { if (won) show('hub'); else startCatch(); });
    catchState = null;
  }
  /* pointer + keyboard input for catch */
  function pointerMove(clientX) {
    if (!catchState) return;
    var r = canvas.getBoundingClientRect();
    catchState.x = (clientX - r.left) / r.width * canvas.width;
  }
  canvas.addEventListener('pointermove', function (e) { pointerMove(e.clientX); });
  canvas.addEventListener('pointerdown', function (e) { pointerMove(e.clientX); });
  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault(); pointerMove(e.touches[0].clientX);
  }, { passive: false });
  addEventListener('keydown', function (e) { if (catchState) catchState.keys[e.key] = true; });
  addEventListener('keyup', function (e) { if (catchState) catchState.keys[e.key] = false; });

  /* ============================== WIRING ============================== */
  document.querySelectorAll('.game-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      audio();
      var g = b.getAttribute('data-game');
      if (g === 'spot') startSpot();
      if (g === 'sort') startSort();
      if (g === 'catch') startCatch();
    });
  });
  $('homeBtn').addEventListener('click', function () {
    if (!$('hub').classList.contains('hidden')) { location.href = '../'; }
    else show('hub');
  });
  $('soundBtn').addEventListener('click', function () {
    soundOn = !soundOn; save('psg1-sound', soundOn); renderHub();
    if (soundOn) sfx.tap();
  });
  $('binSafe').addEventListener('click', function () { pickBin(false, this); });
  $('binDanger').addEventListener('click', function () { pickBin(true, this); });
  $('mascot').addEventListener('click', function () { audio(); sfx.good(); speak(t('ziggyHello')); });
  addEventListener('resize', function () {
    if (spotState && !$('spot').classList.contains('hidden')) renderScene();
  });

  renderHub();
  show('hub');
})();
