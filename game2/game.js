/* Safety Detective — first-person product-safety investigation for ages 8–12.
 * Explore a 3D house, inspect products (labels, CE marks, EU Safety Gate recalls),
 * then beat the dodgy online shop on the study laptop. */
import * as THREE from '../vendor/three.module.min.js';
import { UI, PRODUCTS, LISTINGS } from './data.js';

const lang = () => PSG.getLang();
const t = (k) => (UI[lang()] && UI[lang()][k]) !== undefined ? UI[lang()][k] : UI.en[k];
const pick = (obj) => (typeof obj === 'object' && obj !== null && ('en' in obj)) ? (obj[lang()] || obj.en) : obj;
const $ = (id) => document.getElementById(id);
const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ============================ audio ============================ */
let actx = null;
function tone(freq, dur, delay = 0, type = 'sine', vol = 0.15) {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, actx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(vol, actx.currentTime + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + delay + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(actx.currentTime + delay); o.stop(actx.currentTime + delay + dur + 0.05);
  } catch (e) { /* no audio */ }
}
const sfx = {
  good() { tone(523, .1); tone(784, .18, .09); },
  bad() { tone(180, .25, 0, 'sawtooth', .09); },
  scan() { tone(700, .07); tone(900, .07, .09); tone(1100, .07, .18); },
  alarm() { tone(880, .15, 0, 'square', .06); tone(880, .15, .22, 'square', .06); },
  open() { tone(440, .07, 0, 'triangle', .08); }
};

/* ============================ state ============================ */
const state = {
  started: false,
  score: 0,
  done: 0,
  total: PRODUCTS.length,
  shopIdx: 0,
  overlayOpen: true,      // start overlay is open initially
  target: null,           // product currently looked at
  keys: {},
  yaw: Math.PI / 2 + 0.5, // facing into the living room
  pitch: 0,
  pos: new THREE.Vector3(-4, 1.55, -4.6),
  joy: { x: 0, y: 0 },
  startTime: 0,           // set when investigation begins
  houseSeconds: 0,        // set when the last product is decided
  bobPhase: 0,
  stepAcc: 0
};

function loadBest() { try { return Number(localStorage.getItem('psg2-best')) || 0; } catch (e) { return 0; } }
function saveBest(v) { try { if (v > loadBest()) localStorage.setItem('psg2-best', String(v)); } catch (e) { /* ignore */ } }

/* ============================ three.js scene ============================ */
const canvas = $('c3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101527);
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 60);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const sun = new THREE.DirectionalLight(0xfff2dd, 1.1);
sun.position.set(6, 10, 4);
scene.add(sun);
const warm = new THREE.PointLight(0xffd9a0, 30, 18);
warm.position.set(0, 2.5, 0);
scene.add(warm);

const colliders = []; // {minX,maxX,minZ,maxZ}
function addBox(cx, cz, sx, sz, h, color, y = null, solid = true) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(sx, h, sz),
    new THREE.MeshLambertMaterial({ color })
  );
  m.position.set(cx, y === null ? h / 2 : y, cz);
  scene.add(m);
  if (solid) colliders.push({ minX: cx - sx / 2, maxX: cx + sx / 2, minZ: cz - sz / 2, maxZ: cz + sz / 2 });
  return m;
}

/* floor + room rugs */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20.6, 14.6), new THREE.MeshLambertMaterial({ color: 0xc9b291 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
function rug(cx, cz, sx, sz, color) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshLambertMaterial({ color }));
  r.rotation.x = -Math.PI / 2; r.position.set(cx, 0.01, cz);
  scene.add(r);
}
rug(-5, -3.5, 8.5, 5.5, 0x7d9ec7);  // living room
rug(5, -3.5, 8.5, 5.5, 0xd8d3c8);   // kitchen
rug(-5, 3.5, 8.5, 5.5, 0xc7a3b2);   // bedroom
rug(5, 3.5, 8.5, 5.5, 0x9dc7a8);    // study
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20.6, 14.6), new THREE.MeshLambertMaterial({ color: 0xe8e4da }));
ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 2.8;
scene.add(ceiling);

/* walls: outer shell + dividers with door gaps */
const WALL = 0xf0e6d6, H = 2.8;
addBox(0, -7.15, 20.6, 0.3, H, WALL);
addBox(0, 7.15, 20.6, 0.3, H, WALL);
addBox(-10.15, 0, 0.3, 14.6, H, WALL);
addBox(10.15, 0, 0.3, 14.6, H, WALL);
addBox(0, -5.5, 0.3, 3, H, WALL);   // x=0, z -7..-4
addBox(0, 0, 0.3, 4, H, WALL);      // x=0, z -2..2
addBox(0, 5.5, 0.3, 3, H, WALL);    // x=0, z 4..7
addBox(-8, 0, 4, 0.3, H, WALL);     // z=0, x -10..-6
addBox(0, 0, 8, 0.3, H, WALL);      // z=0, x -4..4
addBox(8, 0, 4, 0.3, H, WALL);      // z=0, x 6..10

/* furniture */
addBox(-8.8, -2.5, 1.4, 3.4, 1.0, 0x3f5f8f);            // sofa
addBox(-5.8, -2.7, 1.8, 1.1, 0.78, 0x8a6242);           // coffee table
addBox(-5, -6.55, 3, 0.7, 0.6, 0x5a4632);               // tv stand
addBox(-5, -6.6, 2.2, 0.15, 1.2, 0x11131a, 1.35, false); // tv screen
addBox(-1.7, -6.55, 2.6, 0.6, 1.5, 0x74563c);           // living shelf
addBox(5, -6.5, 8, 0.9, 1.05, 0xd9dee6);                // kitchen counter
addBox(9.4, -1.0, 1.0, 1.0, 2.0, 0xbfc7d1);             // fridge
addBox(5, -2.8, 2.2, 1.6, 0.95, 0x9a7350);              // kitchen table
addBox(-8.3, 4.5, 2.6, 3.6, 0.7, 0x7a4f6d);             // bed
addBox(-8.3, 4.5, 2.6, 3.4, 0.25, 0xe8e2f0, 0.82, false); // duvet
addBox(-6.7, 4.5, 0.8, 0.8, 0.65, 0x6e523a);            // nightstand
addBox(-3, 6.3, 2.6, 1.1, 1.0, 0x6e523a);               // bedroom desk
addBox(-9.5, 1.2, 0.9, 1.8, 2.2, 0x5a4632);             // wardrobe
addBox(7, 6.3, 2.8, 1.1, 1.0, 0x4d6157);                // study desk
addBox(9.55, 2.5, 0.6, 2.2, 1.6, 0x74563c);             // study shelf

/* ============================ product sprites ============================ */
function emojiTexture(emoji, bg = true) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  if (bg) {
    x.fillStyle = 'rgba(255,255,255,0.92)';
    x.beginPath();
    x.roundRect ? x.roundRect(16, 16, 224, 224, 40) : x.rect(16, 16, 224, 224);
    x.fill();
    x.strokeStyle = 'rgba(30,50,90,0.35)'; x.lineWidth = 6; x.stroke();
  }
  x.font = '150px serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(emoji, 128, 140);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}
function makeSprite(emoji, scale, bg = true) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(emoji, bg), transparent: true }));
  s.scale.set(scale, scale, 1);
  return s;
}

const productMeshes = [];
for (const p of PRODUCTS) {
  const s = makeSprite(p.emoji, 0.72);
  s.position.set(p.pos[0], p.pos[1], p.pos[2]);
  s.userData.product = p;
  const mark = makeSprite('❗', 0.3, false);
  mark.position.set(p.pos[0], p.pos[1] + 0.62, p.pos[2]);
  /* markers show through walls so players always have a lead to follow */
  mark.material.depthTest = false;
  mark.renderOrder = 999;
  scene.add(s); scene.add(mark);
  s.userData.baseScale = 0.72;
  p._mesh = s; p._mark = mark; p._decided = false;
  productMeshes.push(s);
}
/* the laptop for level 2 */
const laptop = makeSprite('💻', 0.8);
laptop.position.set(7.8, 1.25, 6.2);
laptop.userData.laptop = true;
laptop.userData.baseScale = 0.8;
scene.add(laptop);
productMeshes.push(laptop);

/* ============================ movement & collision ============================ */
const PLAYER_R = 0.35, SPEED = 3.6;
function collide(px, pz) {
  for (const c of colliders) {
    const nx = Math.max(c.minX, Math.min(px, c.maxX));
    const nz = Math.max(c.minZ, Math.min(pz, c.maxZ));
    const dx = px - nx, dz = pz - nz;
    const d2 = dx * dx + dz * dz;
    if (d2 < PLAYER_R * PLAYER_R) {
      const d = Math.sqrt(d2) || 0.0001;
      const push = (PLAYER_R - d) / d;
      px += dx * push; pz += dz * push;
    }
  }
  px = Math.max(-9.6, Math.min(9.6, px));
  pz = Math.max(-6.6, Math.min(6.6, pz));
  return [px, pz];
}

/* ============================ input ============================ */
addEventListener('keydown', (e) => {
  state.keys[e.code] = true;
  if (e.code === 'KeyE' && state.target && !state.overlayOpen) interact();
});
addEventListener('keyup', (e) => { state.keys[e.code] = false; });

canvas.addEventListener('click', () => {
  if (state.overlayOpen) return;
  if (!IS_TOUCH && document.pointerLockElement !== canvas) { canvas.requestPointerLock(); return; }
  if (state.target) interact();
});
document.addEventListener('pointerlockchange', () => {
  if (!IS_TOUCH && state.started && !state.overlayOpen && document.pointerLockElement !== canvas) {
    showStart(true); // paused
  }
});
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  state.yaw -= e.movementX * 0.0023;
  state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch - e.movementY * 0.0023));
});

/* touch: joystick (left) + look drag (rest of screen) */
if (IS_TOUCH) {
  $('joystick').classList.remove('hidden');
  const joyEl = $('joystick'), stick = $('stick');
  let joyId = null, lookId = null, lx = 0, ly = 0;
  joyEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joyId = e.changedTouches[0].identifier;
  }, { passive: false });
  addEventListener('touchstart', (e) => {
    for (const tc of e.changedTouches) {
      if (tc.identifier !== joyId && lookId === null && tc.clientX > innerWidth * 0.35) {
        lookId = tc.identifier; lx = tc.clientX; ly = tc.clientY;
      }
    }
  });
  addEventListener('touchmove', (e) => {
    for (const tc of e.changedTouches) {
      if (tc.identifier === joyId) {
        const r = joyEl.getBoundingClientRect();
        let dx = tc.clientX - (r.left + r.width / 2), dy = tc.clientY - (r.top + r.height / 2);
        const max = r.width / 2, len = Math.hypot(dx, dy) || 1;
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        state.joy.x = dx / max; state.joy.y = dy / max;
      } else if (tc.identifier === lookId) {
        state.yaw -= (tc.clientX - lx) * 0.005;
        state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch - (tc.clientY - ly) * 0.005));
        lx = tc.clientX; ly = tc.clientY;
      }
    }
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  addEventListener('touchend', (e) => {
    for (const tc of e.changedTouches) {
      if (tc.identifier === joyId) {
        joyId = null; state.joy.x = 0; state.joy.y = 0;
        stick.style.transform = 'translate(-50%, -50%)';
      }
      if (tc.identifier === lookId) lookId = null;
    }
  });
  $('inspectBtn').addEventListener('click', () => { if (state.target) interact(); });
}

/* ============================ HUD ============================ */
function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function elapsed() { return state.startTime ? (performance.now() - state.startTime) / 1000 : 0; }
function hud() {
  $('hudScore').textContent = `⭐ ${t('score')}: ${state.score}`;
  $('hudProducts').textContent = `📦 ${state.done} ${t('ofLbl')} ${state.total} · ⏱ ${fmtTime(elapsed())}`;
}
/* floating +100 / −50 popup */
function scorePop(txt, ok) {
  const el = document.createElement('div');
  el.className = 'score-pop ' + (ok ? 'ok' : 'no');
  el.textContent = txt;
  $('hud').appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
let toastTimer = 0;
function toast(msg, ms = 3200) {
  $('toast').textContent = msg;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), ms);
}

/* ============================ start overlay ============================ */
function showStart(paused = false) {
  state.overlayOpen = true;
  $('ovTitle').textContent = paused ? t('paused') : t('title');
  $('ovSub').textContent = t('subtitle');
  $('howTitle').textContent = t('howTitle');
  $('how1').textContent = IS_TOUCH ? t('how1Touch') : t('how1');
  $('how2').textContent = IS_TOUCH ? t('how2Touch') : t('how2');
  $('how3').textContent = t('how3');
  $('how4').textContent = t('how4');
  $('startBtn').textContent = paused ? t('resume') : t('startBtn');
  $('startOverlay').classList.remove('hidden');
}
$('startBtn').addEventListener('click', () => {
  $('startOverlay').classList.add('hidden');
  state.overlayOpen = false;
  if (!state.started) state.startTime = performance.now();
  state.started = true;
  $('hud').classList.remove('hidden');
  hud();
  sfx.open();
  if (!IS_TOUCH) canvas.requestPointerLock();
});

/* ============================ inspection ============================ */
let current = null;
function interact() {
  const mesh = state.target;
  if (!mesh) return;
  if (mesh.userData.laptop) { openLaptop(); return; }
  const p = mesh.userData.product;
  if (p._decided) return;
  openInspect(p);
}

function labelRow(k, v, cls) {
  return `<li><span>${k}</span><span class="lv ${cls}">${v}</span></li>`;
}
function openInspect(p) {
  current = p;
  state.overlayOpen = true;
  if (document.pointerLockElement) document.exitPointerLock();
  sfx.open();
  $('ipEmoji').textContent = p.emoji;
  $('ipName').textContent = pick(p.name);
  $('ipPrice').textContent = p.price;
  $('ipLabelTitle').textContent = t('labelInfo');
  const ceMap = { yes: [t('ceYes'), 'good'], no: [t('ceNo'), 'bad'], fake: [t('ceFake'), 'warn'] };
  $('ipLabelList').innerHTML =
    labelRow(t('ce'), ceMap[p.ce][0], ceMap[p.ce][1]) +
    labelRow(t('age'), p.age ? t('yes') : t('no'), p.age ? 'good' : 'warn') +
    labelRow(t('importer'), p.importer ? t('yes') : t('missing'), p.importer ? 'good' : 'bad') +
    labelRow(t('instructions'), p.instructions ? t('yes') : t('missing'), p.instructions ? 'good' : 'bad');
  $('ipScanBtn').textContent = t('scanBtn');
  $('ipScanBtn').disabled = false;
  $('ipScanResult').classList.add('hidden');
  $('ipScanResult').className = 'hidden';
  $('ipKeep').textContent = t('decideKeep');
  $('ipReport').textContent = t('decideReport');
  $('ipKeep').disabled = false;
  $('ipReport').disabled = false;
  $('ipFeedback').classList.add('hidden');
  $('ipDecide').classList.remove('hidden');
  $('ipScanZone').classList.remove('hidden');
  $('inspectOverlay').classList.remove('hidden');
}
$('ipScanBtn').addEventListener('click', () => {
  $('ipScanBtn').disabled = true;
  $('ipScanResult').textContent = t('scanning');
  $('ipScanResult').className = '';
  sfx.scan();
  setTimeout(() => {
    if (current.recalled) {
      $('ipScanResult').className = 'recall';
      $('ipScanResult').innerHTML = `<strong>${t('recallFound')}</strong><br>${pick(current.recallNote)}`;
      sfx.alarm();
    } else {
      $('ipScanResult').className = 'clear';
      $('ipScanResult').textContent = t('recallNone');
    }
  }, 900);
});
function decide(choice) {
  const p = current;
  const correct = (choice === 'keep') === (p.verdict === 'keep');
  state.score += correct ? 100 : -50;
  if (state.score < 0) state.score = 0;
  scorePop(correct ? '+100' : '−50', correct);
  p._decided = true;
  state.done++;
  if (state.done >= state.total && !state.houseSeconds) state.houseSeconds = elapsed();
  p._mark.material.map = emojiTexture(p.verdict === 'keep' ? '✅' : '❌', false);
  p._mark.material.needsUpdate = true;
  $('ipDecide').classList.add('hidden');
  $('ipScanZone').classList.add('hidden');
  $('ipVerdict').textContent = (correct ? '✔ ' : '✘ ') + t(correct ? 'correct' : 'wrong') + `  ${correct ? '+100' : '−50'} ${t('points')}`;
  $('ipVerdict').className = correct ? 'ok' : 'no';
  $('ipWhy').textContent = pick(p.why);
  $('ipContinue').textContent = t('continueBtn');
  $('ipFeedback').classList.remove('hidden');
  correct ? sfx.good() : sfx.bad();
  hud();
}
$('ipKeep').addEventListener('click', () => decide('keep'));
$('ipReport').addEventListener('click', () => decide('report'));
$('ipContinue').addEventListener('click', () => {
  $('inspectOverlay').classList.add('hidden');
  state.overlayOpen = false;
  if (state.done >= state.total) toast(t('goLaptop'), 5000);
  if (!IS_TOUCH) canvas.requestPointerLock();
});

/* ============================ online shop (level 2) ============================ */
function openLaptop() {
  if (state.done < state.total) {
    toast(t('laptopLocked') + (state.total - state.done));
    sfx.bad();
    return;
  }
  state.overlayOpen = true;
  if (document.pointerLockElement) document.exitPointerLock();
  sfx.open();
  $('shopTitle').textContent = t('laptopTitle');
  $('shopIntro').textContent = t('laptopIntro');
  $('shopOverlay').classList.remove('hidden');
  renderListing();
}
function renderListing() {
  const i = state.shopIdx;
  if (i >= LISTINGS.length) { endGame(); return; }
  const L = LISTINGS[i];
  $('shopProgress').textContent = `${i + 1} / ${LISTINGS.length}`;
  $('shopFeedback').classList.add('hidden');
  $('listing').innerHTML = `
    <div class="listing-card">
      <div class="listing-top">
        <div class="listing-emoji">${L.emoji}</div>
        <div>
          <div class="listing-title">${pick(L.title)}</div>
          <div class="listing-price">${L.price}${L.rrp ? `<span class="listing-rrp">${L.rrp}</span>` : ''}</div>
          <div class="listing-meta">
            ${t('seller')}: <strong>${L.seller}</strong><br>
            ${t('shipsFrom')}: ${pick(L.ships)} · ${L.reviews.count} ${t('reviews')} (${pick(L.reviews.note)})
          </div>
        </div>
      </div>
      <ul class="listing-details">${pick(L.details).map(d => `<li>${d}</li>`).join('')}</ul>
      <div class="listing-btns">
        <button class="btn-buy" id="btnBuy">${t('buy')}</button>
        <button class="btn-avoid" id="btnAvoid">${t('avoid')}</button>
      </div>
    </div>`;
  $('btnBuy').addEventListener('click', () => decideListing('buy'));
  $('btnAvoid').addEventListener('click', () => decideListing('avoid'));
}
function decideListing(choice) {
  const L = LISTINGS[state.shopIdx];
  const correct = choice === L.verdict;
  state.score += correct ? 100 : -50;
  if (state.score < 0) state.score = 0;
  scorePop(correct ? '+100' : '−50', correct);
  hud();
  correct ? sfx.good() : sfx.bad();
  $('listing').querySelectorAll('button').forEach(b => b.disabled = true);
  $('shopVerdict').textContent = (correct ? '✔ ' : '✘ ') + t(correct ? 'correct' : 'wrong') + `  ${correct ? '+100' : '−50'} ${t('points')}`;
  $('shopVerdict').className = correct ? 'ok' : 'no';
  $('shopWhy').textContent = pick(L.why);
  $('shopContinue').textContent = t('continueBtn');
  $('shopFeedback').classList.remove('hidden');
  $('shopFeedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
$('shopContinue').addEventListener('click', () => {
  state.shopIdx++;
  renderListing();
});

/* ============================ end screen ============================ */
function endGame() {
  $('shopOverlay').classList.add('hidden');
  /* speed bonus for clearing the house quickly */
  let bonus = 0;
  if (state.houseSeconds > 0) {
    if (state.houseSeconds < 300) bonus = 200;
    else if (state.houseSeconds < 480) bonus = 100;
  }
  state.score += bonus;
  saveBest(state.score);
  const s = state.score;
  const bonusLine = bonus ? ` · ${t('speedBonus')}: +${bonus} (${t('houseTime')} ${fmtTime(state.houseSeconds)})` : '';
  const rank = s >= 1750 ? 3 : s >= 1400 ? 2 : s >= 950 ? 1 : 0;
  $('endEmoji').textContent = ['🎓', '🕵️', '🥈', '🏆'][rank];
  $('endTitle').textContent = t('finalTitle');
  $('endRank').textContent = t('rank' + rank);
  $('endScore').textContent = `${t('finalScore')}: ${s}${bonusLine} · ${t('best')}: ${loadBest()}`;
  $('endOutro').textContent = t('outro');
  $('againBtn').textContent = t('playAgain');
  $('endHome').textContent = t('home');
  $('endOverlay').classList.remove('hidden');
  sfx.good();
}
$('againBtn').addEventListener('click', () => location.reload());

/* ============================ main loop ============================ */
const raycaster = new THREE.Raycaster();
raycaster.far = 3.2;
const center = new THREE.Vector2(0, 0);
const clock = new THREE.Clock();

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.started && !state.overlayOpen) {
    let mx = 0, mz = 0;
    if (state.keys.KeyW || state.keys.ArrowUp) mz -= 1;
    if (state.keys.KeyS || state.keys.ArrowDown) mz += 1;
    if (state.keys.KeyA || state.keys.ArrowLeft) mx -= 1;
    if (state.keys.KeyD || state.keys.ArrowRight) mx += 1;
    mx += state.joy.x; mz += state.joy.y;
    const len = Math.hypot(mx, mz);
    if (len > 0.01) {
      mx /= Math.max(1, len); mz /= Math.max(1, len);
      const sin = Math.sin(state.yaw), cos = Math.cos(state.yaw);
      const wx = mx * cos + mz * sin;
      const wz = -mx * sin + mz * cos;
      let nx = state.pos.x + wx * SPEED * dt;
      let nz = state.pos.z + wz * SPEED * dt;
      [nx, nz] = collide(nx, nz);
      state.pos.x = nx; state.pos.z = nz;
      /* head bob + soft footsteps while walking */
      state.bobPhase += dt * 9;
      state.bobAmp = Math.min(0.035, (state.bobAmp || 0) + dt * 0.1);
      state.stepAcc += dt;
      if (state.stepAcc > 0.42) {
        state.stepAcc = 0;
        tone(state.bobStep ? 95 : 82, .05, 0, 'triangle', .05);
        state.bobStep = !state.bobStep;
      }
    } else {
      state.bobAmp = (state.bobAmp || 0) * 0.88;
    }
  }

  camera.position.copy(state.pos);
  camera.position.y = 1.55 + Math.sin(state.bobPhase) * (state.bobAmp || 0);
  camera.rotation.set(0, 0, 0);
  camera.rotateY(state.yaw);
  camera.rotateX(state.pitch);

  /* product bobbing */
  const tm = performance.now() / 1000;
  for (const p of PRODUCTS) {
    p._mark.position.y = p.pos[1] + 0.62 + Math.sin(tm * 2 + p.pos[0]) * 0.04;
  }
  laptop.position.y = 1.25 + Math.sin(tm * 2) * 0.04;

  /* targeting */
  if (state.started && !state.overlayOpen) {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObjects(productMeshes, false);
    let tgt = null;
    for (const h of hits) {
      const o = h.object;
      if (o.userData.laptop) { tgt = o; break; }
      if (o.userData.product && !o.userData.product._decided) { tgt = o; break; }
    }
    if (tgt !== state.target) {
      if (state.target && state.target.userData.baseScale) {
        const b = state.target.userData.baseScale;
        state.target.scale.set(b, b, 1);
      }
      state.target = tgt;
      $('crosshair').classList.toggle('lock', !!tgt);
      if (tgt) {
        sfx.open();
        const label = tgt.userData.laptop ? '💻 TazzaDeals.mt' : pick(tgt.userData.product.name);
        $('prompt').textContent = `${label} — ${IS_TOUCH ? t('tapInspect') : t('pressE')}`;
        $('prompt').classList.remove('hidden');
        if (IS_TOUCH) { $('inspectBtn').textContent = '🔎 ' + t('inspect'); $('inspectBtn').classList.remove('hidden'); }
      } else {
        $('prompt').classList.add('hidden');
        $('inspectBtn').classList.add('hidden');
      }
    }
  } else if (state.target) {
    if (state.target.userData.baseScale) {
      const b = state.target.userData.baseScale;
      state.target.scale.set(b, b, 1);
    }
    state.target = null;
    $('crosshair').classList.remove('lock');
    $('prompt').classList.add('hidden');
    $('inspectBtn').classList.add('hidden');
  }

  /* targeted sprite gently pulses */
  if (state.target && state.target.userData.baseScale) {
    const b = state.target.userData.baseScale * (1 + 0.08 * Math.sin(tm * 6));
    state.target.scale.set(b, b, 1);
  }

  /* refresh the HUD timer about once a second */
  if (state.started && (!frame._hudAt || tm - frame._hudAt > 1)) {
    frame._hudAt = tm;
    hud();
  }

  renderer.render(scene, camera);
}

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(frame);

/* language buttons already handled by shared i18n (reload) */
PSG.applyStatic({ en: {}, mt: {} });
showStart(false);

/* debug/testing hook */
window.__psg = state;
