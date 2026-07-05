/* Safety Detective — first-person product-safety investigation for ages 8–12.
 * Explore a 3D house, inspect products (labels, CE marks, EU Safety Gate recalls),
 * then beat the dodgy online shop on the study laptop. */
import * as THREE from 'three';
import { EffectComposer } from '../vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from '../vendor/jsm/postprocessing/ShaderPass.js';
import { RoomEnvironment } from '../vendor/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/jsm/geometries/RoundedBoxGeometry.js';
import { UI, PRODUCTS, LISTINGS } from './data.js';

const lang = () => PSG.getLang();
const t = (k) => (UI[lang()] && UI[lang()][k]) !== undefined ? UI[lang()][k] : UI.en[k];
const pick = (obj) => (typeof obj === 'object' && obj !== null && ('en' in obj)) ? (obj[lang()] || obj.en) : obj;
const $ = (id) => document.getElementById(id);
const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
/* ?lowfx=1 forces the light render path (also used by automated tests) */
const LOW_FX = new URLSearchParams(location.search).has('lowfx');

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
renderer.setPixelRatio(LOW_FX ? 1 : Math.min(devicePixelRatio, IS_TOUCH ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1120);
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 60);

/* image-based lighting: gives every PBR surface soft studio reflections */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.22;

/* post-processing: MSAA render target + bloom + tone-mapped output */
const composerTarget = new THREE.WebGLRenderTarget(1, 1, {
  samples: (IS_TOUCH || LOW_FX) ? 0 : 4,
  type: THREE.HalfFloatType
});
const composer = new EffectComposer(renderer, composerTarget);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.16, 0.5, 0.92);
bloom.enabled = !LOW_FX;
composer.addPass(bloom);
/* cinematic grade: gentle S-curve, saturation lift, warm-highlight split tone */
composer.addPass(new ShaderPass({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 x = clamp(c.rgb, 0.0, 1.0);
      c.rgb = mix(c.rgb, x * x * (3.0 - 2.0 * x), 0.35);
      float l = clamp(dot(c.rgb, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
      c.rgb = mix(vec3(l), c.rgb, 1.12);
      c.rgb += (l - 0.5) * vec3(0.030, 0.012, -0.024);
      gl_FragColor = c;
    }`
}));
composer.addPass(new OutputPass());

/* ---------- lighting: daylight through the windows + warm interior ---------- */
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x8a7660, 0.42));
const sun = new THREE.DirectionalLight(0xffeeda, 2.4);
sun.position.set(5, 9, -7);
sun.castShadow = true;
sun.shadow.mapSize.set(IS_TOUCH ? 1024 : 2048, IS_TOUCH ? 1024 : 2048);
sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 32;
sun.shadow.bias = -0.0004;
scene.add(sun);
[[-5, -3.2], [5, -3.2], [-5, 3.6], [5, 3.6]].forEach(([x, z]) => {
  const pl = new THREE.PointLight(0xffd9a8, 5, 9, 1.8);
  pl.position.set(x, 2.45, z);
  scene.add(pl);
});

/* ---------- procedural textures ---------- */
function canvasTex(size, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  return t;
}
const woodTex = canvasTex(512, (x, s) => {
  x.fillStyle = '#a8825c'; x.fillRect(0, 0, s, s);
  const ph = s / 8;
  for (let p = 0; p < 8; p++) {
    const y0 = p * ph;
    x.fillStyle = `hsl(${25 + Math.random() * 7}, ${36 + Math.random() * 12}%, ${44 + Math.random() * 12}%)`;
    x.fillRect(0, y0, s, ph - 2);
    x.strokeStyle = 'rgba(80,48,26,.35)';
    for (let g = 0; g < 7; g++) {
      x.beginPath();
      const gy = y0 + Math.random() * ph;
      x.moveTo(0, gy);
      for (let gx = 0; gx <= s; gx += 64) x.lineTo(gx, gy + (Math.random() - .5) * 6);
      x.stroke();
    }
    x.fillStyle = 'rgba(50,30,16,.55)';
    x.fillRect(0, y0 + ph - 2, s, 2);
    x.fillRect(Math.random() * s, y0, 2, ph);
  }
}, 5, 3.6);
const plasterTex = canvasTex(256, (x, s) => {
  x.fillStyle = '#efe6d7'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(${170 + Math.random() * 60},${160 + Math.random() * 50},${140 + Math.random() * 40},.16)`;
    x.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}, 3, 1.2);
function rugTex(base, border) {
  return canvasTex(256, (x, s) => {
    x.fillStyle = border; x.fillRect(0, 0, s, s);
    x.fillStyle = base; x.fillRect(14, 14, s - 28, s - 28);
    x.strokeStyle = border; x.lineWidth = 3;
    x.globalAlpha = .5;
    for (let i = 44; i < s - 30; i += 34) { x.strokeRect(i, i, s - 2 * i, s - 2 * i); }
    x.globalAlpha = 1;
  });
}
const skyTex = canvasTex(256, (x, s) => {
  const g = x.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#5fb2ff'); g.addColorStop(.7, '#bfe2ff'); g.addColorStop(1, '#e8f6e8');
  x.fillStyle = g; x.fillRect(0, 0, s, s);
  x.fillStyle = 'rgba(255,255,255,.9)';
  [[60, 70, 26], [110, 62, 18], [180, 110, 22], [210, 100, 14]].forEach(([cx, cy, r]) => {
    x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  });
  x.fillStyle = '#fff7d6';
  x.beginPath(); x.arc(210, 40, 20, 0, 7); x.fill();
});
/* derive a tangent-space normal map from a grayscale height canvas (Sobel) */
function normalFromHeight(draw, size, strength, rx, ry) {
  const hc = document.createElement('canvas');
  hc.width = hc.height = size;
  const hx = hc.getContext('2d');
  draw(hx, size);
  const src = hx.getImageData(0, 0, size, size).data;
  const h = (x, y) => src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  const nc = document.createElement('canvas');
  nc.width = nc.height = size;
  const nx = nc.getContext('2d');
  const out = nx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x - 1, y) - h(x + 1, y)) * strength;
      const dy = (h(x, y - 1) - h(x, y + 1)) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * size + x) * 4;
      out.data[i] = (dx / len * 0.5 + 0.5) * 255;
      out.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
      out.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  nx.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(nc);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  return t;
}
const woodNormal = normalFromHeight((x, s) => {
  x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
  const ph = s / 8;
  for (let p = 0; p < 8; p++) {
    /* dark seams between planks read as grooves */
    x.fillStyle = '#2a2a2a';
    x.fillRect(0, p * ph + ph - 3, s, 3);
    x.fillStyle = 'rgba(255,255,255,.10)';
    x.fillRect(0, p * ph, s, 2);
    x.strokeStyle = 'rgba(96,96,96,.5)';
    for (let g = 0; g < 6; g++) {
      x.beginPath();
      const gy = p * ph + Math.random() * ph;
      x.moveTo(0, gy);
      for (let gx = 0; gx <= s; gx += 64) x.lineTo(gx, gy + (Math.random() - .5) * 5);
      x.stroke();
    }
  }
}, 256, 2.2, 5, 3.6);
const plasterNormal = normalFromHeight((x, s) => {
  x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 1400; i++) {
    const v = 110 + Math.random() * 60;
    x.fillStyle = `rgb(${v},${v},${v})`;
    x.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}, 128, 1.1, 3, 1.2);

const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(255,214,110,.85)');
  g.addColorStop(.4, 'rgba(255,196,80,.28)');
  g.addColorStop(1, 'rgba(255,180,60,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

/* ---------- construction helpers ---------- */
const colliders = []; // {minX,maxX,minZ,maxZ}
function addCollider(cx, cz, sx, sz) {
  colliders.push({ minX: cx - sx / 2, maxX: cx + sx / 2, minZ: cz - sz / 2, maxZ: cz + sz / 2 });
}
function addBox(cx, cz, sx, sz, h, color, y = null, solid = true, opts = {}) {
  /* furniture gets soft rounded edges; walls (sharp:true) stay crisp */
  const matOpts = Object.assign({ color, roughness: 0.82, metalness: 0.04 }, opts);
  delete matOpts.sharp;
  const r = opts.sharp ? 0 : Math.min(0.045, sx * 0.42, sz * 0.42, h * 0.42);
  const geo = r > 0.008
    ? new RoundedBoxGeometry(sx, h, sz, 2, r)
    : new THREE.BoxGeometry(sx, h, sz);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(matOpts));
  m.position.set(cx, y === null ? h / 2 : y, cz);
  m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
  if (solid) addCollider(cx, cz, sx, sz);
  return m;
}

/* ---------- floor, ceiling, rugs ---------- */
/* streaky roughness variation so window light glints unevenly off the boards */
const floorRoughTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#7d7d7d'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    const v = 70 + Math.random() * 120;
    x.fillStyle = `rgba(${v},${v},${v},.5)`;
    x.fillRect(Math.random() * 256, Math.random() * 256, 30 + Math.random() * 90, 3 + Math.random() * 10);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 3.6);
  return t;
})();
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20.6, 14.6),
  new THREE.MeshStandardMaterial({
    map: woodTex, normalMap: woodNormal, normalScale: new THREE.Vector2(0.7, 0.7),
    roughnessMap: floorRoughTex, roughness: 0.9, metalness: 0.06
  }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
function rug(cx, cz, sx, sz, base, border) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz),
    new THREE.MeshStandardMaterial({ map: rugTex(base, border), roughness: 0.95 }));
  r.rotation.x = -Math.PI / 2; r.position.set(cx, 0.012, cz);
  r.receiveShadow = true;
  scene.add(r);
}
rug(-5, -3.2, 5.4, 3.6, '#5c7fae', '#3d5a85');   // living room
rug(5, -2.6, 4.2, 3.2, '#d8d3c8', '#9d9484');    // kitchen
rug(-5.2, 3.6, 5.2, 3.4, '#b287a0', '#8a5f7b');  // bedroom
rug(6, 4, 4.6, 3.2, '#7dae8c', '#548a66');       // study
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20.6, 14.6),
  new THREE.MeshStandardMaterial({ color: 0xe4dfd3, roughness: 1 }));
ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 2.8;
ceiling.receiveShadow = true;
scene.add(ceiling);
/* ceiling light fixtures */
[[-5, -3.2], [5, -3.2], [-5, 3.6], [5, 3.6]].forEach(([x, z]) => {
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 20),
    new THREE.MeshStandardMaterial({ color: 0xfffbe8, emissive: 0xffe9b0, emissiveIntensity: 1.6, roughness: .4 }));
  disk.position.set(x, 2.74, z);
  scene.add(disk);
});

/* ---------- walls: outer shell + dividers with door gaps ---------- */
const H = 2.8;
const wallOpts = {
  map: plasterTex, normalMap: plasterNormal, normalScale: new THREE.Vector2(0.4, 0.4),
  roughness: 0.94, metalness: 0, sharp: true
};
function wall(cx, cz, sx, sz) { return addBox(cx, cz, sx, sz, H, 0xf0e6d6, null, true, wallOpts); }
wall(0, -7.15, 20.6, 0.3);
wall(0, 7.15, 20.6, 0.3);
wall(-10.15, 0, 0.3, 14.6);
wall(10.15, 0, 0.3, 14.6);
wall(0, -5.5, 0.3, 3);    // x=0, z -7..-4
wall(0, 0, 0.3, 4);       // x=0, z -2..2
wall(0, 5.5, 0.3, 3);     // x=0, z 4..7
wall(-8, 0, 4, 0.3);      // z=0, x -10..-6
wall(0, 0, 8, 0.3);       // z=0, x -4..4
wall(8, 0, 4, 0.3);       // z=0, x 6..10
const wallColliderCount = colliders.length;

/* skirting boards along the outer walls */
const skirtOpts = { roughness: 0.5, sharp: true };
addBox(0, -6.96, 20, 0.06, 0.14, 0xded3c0, 0.07, false, skirtOpts);
addBox(0, 6.96, 20, 0.06, 0.14, 0xded3c0, 0.07, false, skirtOpts);
addBox(-9.96, 0, 0.06, 14, 0.14, 0xded3c0, 0.07, false, skirtOpts);
addBox(9.96, 0, 0.06, 14, 0.14, 0xded3c0, 0.07, false, skirtOpts);

/* ---------- windows: bright daylight lightboxes on the outer walls ---------- */
function windowBox(cx, cy, cz, w, h, facing) {
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: skyTex }));
  sky.position.set(cx, cy, cz);
  sky.rotation.y = facing > 0 ? 0 : Math.PI;
  scene.add(sky);
  const f = 0.09, d = 0.06, fz = cz + facing * 0.02;
  const frameMat = { roughness: 0.5, metalness: 0.1 };
  addBox(cx, fz, w + f * 2, d, f, 0xf7f7f2, cy + h / 2 + f / 2, false, frameMat);
  addBox(cx, fz, w + f * 2, d, f, 0xf7f7f2, cy - h / 2 - f / 2, false, frameMat);
  addBox(cx - w / 2 - f / 2, fz, f, d, h + f * 2, 0xf7f7f2, cy, false, frameMat);
  addBox(cx + w / 2 + f / 2, fz, f, d, h + f * 2, 0xf7f7f2, cy, false, frameMat);
  addBox(cx, fz, f * 0.6, d, h, 0xf7f7f2, cy, false, frameMat);      // mullion
  addBox(cx, fz, w, d, f * 0.6, 0xf7f7f2, cy, false, frameMat);      // transom
  /* sill */
  addBox(cx, cz + facing * 0.12, w + 0.3, 0.22, 0.06, 0xefe9dd, cy - h / 2 - f, false, frameMat);
  /* curtain rod + fabric panels */
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, w + 0.7, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a6a3c, metalness: 0.6, roughness: 0.35 }));
  rod.rotation.z = Math.PI / 2;
  rod.position.set(cx, cy + h / 2 + 0.22, cz + facing * 0.16);
  scene.add(rod);
  for (const side of [-1, 1]) {
    addBox(cx + side * (w / 2 + 0.16), cz + facing * 0.16, 0.34, 0.09, h + 0.5,
      0x9a5f6e, cy + 0.05, false, { roughness: 0.95 });
  }
  /* volumetric-style sun shaft angling into the room */
  const shaftLen = 3.6;
  for (const [op, wf] of [[0.055, 1], [0.03, 0.6]]) {
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(w * wf, shaftLen),
      new THREE.MeshBasicMaterial({
        color: 0xfff3d6, transparent: true, opacity: op,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      }));
    const tilt = 0.9; // radians from vertical
    shaft.position.set(cx, cy - Math.cos(tilt) * shaftLen / 2 + h * 0.3,
      cz + facing * (Math.sin(tilt) * shaftLen / 2 + 0.05));
    shaft.rotation.x = facing > 0 ? -tilt : tilt;
    scene.add(shaft);
  }
}
windowBox(-5.5, 1.7, -6.98, 2.4, 1.35, 1);   // living room
windowBox(4.5, 1.9, -6.98, 1.9, 1.0, 1);     // kitchen, above the counter
windowBox(-6, 1.7, 6.98, 2.4, 1.35, -1);     // bedroom
windowBox(6.2, 1.7, 6.98, 1.9, 1.35, -1);    // study

/* ---------- wall art ---------- */
const ART_STYLES = {
  abstract(x, s, hue) {
    x.fillStyle = `hsl(${hue}, 42%, 78%)`; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 5; i++) {
      x.fillStyle = `hsla(${hue + i * 28}, 55%, ${40 + i * 8}%, .8)`;
      x.beginPath();
      x.arc(20 + Math.random() * 88, 20 + Math.random() * 88, 10 + Math.random() * 22, 0, 7);
      x.fill();
    }
  },
  sea(x, s) {
    const g = x.createLinearGradient(0, 0, 0, s * 0.62);
    g.addColorStop(0, '#ffd9a3'); g.addColorStop(1, '#ff9d76');
    x.fillStyle = g; x.fillRect(0, 0, s, s * 0.62);
    x.fillStyle = '#fff3c4';
    x.beginPath(); x.arc(s * 0.62, s * 0.4, s * 0.12, 0, 7); x.fill();
    const w = x.createLinearGradient(0, s * 0.62, 0, s);
    w.addColorStop(0, '#3f7fae'); w.addColorStop(1, '#28567c');
    x.fillStyle = w; x.fillRect(0, s * 0.62, s, s * 0.38);
    x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      const y = s * (0.68 + i * 0.06);
      x.moveTo(s * Math.random() * 0.3, y);
      x.lineTo(s * (0.55 + Math.random() * 0.4), y);
      x.stroke();
    }
  },
  boats(x, s) {
    x.fillStyle = '#cde9f2'; x.fillRect(0, 0, s, s * 0.6);
    x.fillStyle = '#4f93b8'; x.fillRect(0, s * 0.6, s, s * 0.4);
    /* two luzzu-coloured hulls with sails */
    for (const [bx, sc, hull] of [[s * 0.32, 1, '#d9534f'], [s * 0.68, 0.7, '#e8b430']]) {
      x.fillStyle = hull;
      x.beginPath();
      x.moveTo(bx - 22 * sc, s * 0.62); x.lineTo(bx + 22 * sc, s * 0.62);
      x.lineTo(bx + 14 * sc, s * 0.62 + 12 * sc); x.lineTo(bx - 14 * sc, s * 0.62 + 12 * sc);
      x.closePath(); x.fill();
      x.strokeStyle = '#3d2f22'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(bx, s * 0.62); x.lineTo(bx, s * 0.62 - 34 * sc); x.stroke();
      x.fillStyle = '#f6f2e7';
      x.beginPath();
      x.moveTo(bx, s * 0.62 - 34 * sc); x.lineTo(bx + 20 * sc, s * 0.6); x.lineTo(bx, s * 0.6);
      x.closePath(); x.fill();
    }
  },
  leaves(x, s) {
    x.fillStyle = '#f2ead8'; x.fillRect(0, 0, s, s);
    x.strokeStyle = '#4f7d55'; x.lineWidth = 4; x.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const bx = s * (0.25 + i * 0.17);
      x.beginPath(); x.moveTo(bx, s * 0.9);
      x.quadraticCurveTo(bx + (i % 2 ? 18 : -18), s * 0.5, bx + (i % 2 ? 8 : -8), s * 0.18);
      x.stroke();
      x.fillStyle = i % 2 ? '#6da173' : '#4f7d55';
      for (let l = 0; l < 4; l++) {
        const t = 0.3 + l * 0.16;
        x.beginPath();
        x.ellipse(bx + (i % 2 ? 12 : -12) * t, s * (0.9 - t * 0.7), 9, 4, (i % 2 ? -0.6 : 0.6), 0, 7);
        x.fill();
      }
    }
  }
};
function picture(cx, cy, cz, w, h, facing, hue, style = 'abstract') {
  const art = canvasTex(128, (x, s) => ART_STYLES[style](x, s, hue));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: art, roughness: 0.85 }));
  /* nudge the art off the wall so it sits proud of its frame */
  p.position.set(
    cx + (facing === 'e' ? 0.012 : facing === 'w' ? -0.012 : 0),
    cy,
    cz + (facing === 'n' ? 0.012 : facing === 's' ? -0.012 : 0));
  p.rotation.y = facing === 'n' ? 0 : facing === 's' ? Math.PI : facing === 'e' ? Math.PI / 2 : -Math.PI / 2;
  scene.add(p);
  addBox(cx + (facing === 'e' ? -0.02 : facing === 'w' ? 0.02 : 0),
    cz + (facing === 'n' ? -0.02 : facing === 's' ? 0.02 : 0),
    facing === 'e' || facing === 'w' ? 0.04 : w + 0.12,
    facing === 'e' || facing === 'w' ? w + 0.12 : 0.04,
    h + 0.12, 0x3d2f22, cy, false, { roughness: 0.5 });
}
picture(-8.5, 1.8, -6.98, 1.1, 0.85, 'n', 200, 'sea');
picture(-9.98, 1.75, 4.5, 1.0, 0.8, 'e', 320, 'leaves');
picture(9.98, 1.8, -3.5, 1.0, 0.8, 'w', 140, 'boats');
picture(2.5, 1.85, 6.98, 0.9, 0.75, 's', 40, 'abstract');
/* gallery wall above the sofa */
picture(-9.97, 2.0, -1.7, 0.62, 0.5, 'e', 20, 'boats');
picture(-9.97, 1.95, -2.55, 0.55, 0.68, 'e', 200, 'sea');
picture(-9.97, 2.05, -3.4, 0.62, 0.5, 'e', 120, 'leaves');

/* ---------- accent walls ---------- */
function accent(cx, cy, cz, w, h, ry, color) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ color, roughness: 0.93 }));
  p.position.set(cx, cy, cz);
  p.rotation.y = ry;
  p.receiveShadow = true;
  scene.add(p);
}
accent(-9.99, 1.4, -3.5, 6.9, 2.8, Math.PI / 2, 0x44618f);  // living, behind the sofa
accent(-5, 1.4, 6.995, 9.9, 2.8, Math.PI, 0xa8768c);        // bedroom head wall

/* ---------- decor ---------- */
/* wall clock in the kitchen */
{
  const clockTex = canvasTex(128, (x, s) => {
    x.fillStyle = '#faf6ec'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill();
    x.strokeStyle = '#3d2f22'; x.lineWidth = 7; x.stroke();
    x.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      x.beginPath();
      x.moveTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48);
      x.lineTo(64 + Math.cos(a) * 54, 64 + Math.sin(a) * 54);
      x.stroke();
    }
    x.lineWidth = 5; x.beginPath(); x.moveTo(64, 64); x.lineTo(64 + 24, 64 - 14); x.stroke();
    x.lineWidth = 4; x.beginPath(); x.moveTo(64, 64); x.lineTo(64 - 8, 64 - 38); x.stroke();
    x.strokeStyle = '#d9534f'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(64, 64); x.lineTo(64 + 34, 64 + 22); x.stroke();
  });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.28, 28),
    new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.6, transparent: true }));
  clock.position.set(7.6, 2.05, -6.97);
  scene.add(clock);
}
/* mirror in the study hall */
{
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xcfdfeb, metalness: 1, roughness: 0.04, envMapIntensity: 2.2 }));
  mirror.position.set(9.97, 1.6, 5.4);
  mirror.rotation.y = -Math.PI / 2;
  scene.add(mirror);
  addBox(9.98, 5.4, 0.03, 0.72, 1.22, 0x8a6a3c, 1.6, false, { roughness: 0.4 });
}
/* floor lamp beside the sofa */
{
  addBox(-9.2, -5.9, 0.34, 0.34, 0.04, 0x3d2f22, 0.02, false, { roughness: 0.5 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x3d2f22, metalness: 0.5, roughness: 0.4 }));
  pole.position.set(-9.2, 0.79, -5.9);
  scene.add(pole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.3, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xf3e2c0, emissive: 0xffd9a0, emissiveIntensity: 1.3,
      side: THREE.DoubleSide, roughness: 0.9
    }));
  shade.position.set(-9.2, 1.62, -5.9);
  scene.add(shade);
  const lampLight = new THREE.PointLight(0xffd9a8, 3, 5, 1.8);
  lampLight.position.set(-9.2, 1.55, -5.9);
  scene.add(lampLight);
}
/* pendant lamps over the kitchen table */
for (const px of [4.5, 5.5]) {
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b }));
  cord.position.set(px, 2.45, -2.8);
  scene.add(cord);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.17, 0.16, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x3f6155, emissive: 0xffe2b0, emissiveIntensity: 1.1,
      side: THREE.DoubleSide, roughness: 0.6
    }));
  shade.position.set(px, 2.05, -2.8);
  scene.add(shade);
}
/* upper kitchen cabinets flanking the window */
addBox(2.4, -6.82, 2.2, 0.5, 0.75, 0xe6ebf0, 2.05, false, { roughness: 0.5 });
addBox(7.9, -6.82, 1.6, 0.5, 0.75, 0xe6ebf0, 2.05, false, { roughness: 0.5 });
/* vase of flowers on the kitchen table */
{
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x7fa8c9, roughness: 0.25 }));
  vase.position.set(4.55, 1.08, -2.55);
  scene.add(vase);
  for (const [ox, oy, oz, col] of [[0, 0.3, 0, 0xe0455a], [0.06, 0.26, 0.04, 0xffd166], [-0.06, 0.27, -0.03, 0xb06ef2]]) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 }));
    f.position.set(4.55 + ox, 1.08 + oy, -2.55 + oz);
    scene.add(f);
  }
}
/* fruit bowl on the counter */
{
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.09, 0.09, 16),
    new THREE.MeshStandardMaterial({ color: 0x39404d, roughness: 0.3 }));
  bowl.position.set(5.6, 1.08, -6.42);
  scene.add(bowl);
  for (const [ox, oz, col] of [[-0.05, 0, 0xff9f43], [0.06, 0.02, 0xd9534f], [0, -0.05, 0x8fc75a]]) {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.55 }));
    fruit.position.set(5.6 + ox, 1.15, -6.42 + oz);
    scene.add(fruit);
  }
}
/* throw blanket over the sofa arm + books on the coffee table */
addBox(-8.8, -4.25, 1.2, 0.36, 0.06, 0xd8b64c, 1.09, false, { roughness: 0.95 });
addBox(-6.35, -2.95, 0.3, 0.22, 0.05, 0xb5484d, 0.81, false, { roughness: 0.8 });
addBox(-6.35, -2.95, 0.26, 0.19, 0.045, 0x3f6f8f, 0.86, false, { roughness: 0.8 });
/* small photo frame on the bedroom desk */
addBox(-2.2, 6.5, 0.16, 0.03, 0.2, 0x8a6a3c, 1.12, false, { roughness: 0.4 });

/* ---------- furniture (composite, PBR) ---------- */
const WOOD_D = 0x6b4a32, WOOD_M = 0x8a6242, FABRIC = 0x46628f;
/* sofa */
addCollider(-8.8, -2.5, 1.4, 3.4);
addBox(-8.8, -2.5, 1.15, 3.25, 0.42, FABRIC, null, false, { roughness: 0.95 });
addBox(-9.42, -2.5, 0.28, 3.45, 1.15, 0x3c5580, null, false, { roughness: 0.95 });
addBox(-8.8, -0.72, 1.35, 0.3, 0.7, 0x3c5580, null, false, { roughness: 0.95 });
addBox(-8.8, -4.28, 1.35, 0.3, 0.7, 0x3c5580, null, false, { roughness: 0.95 });
[-3.3, -2.5, -1.7].forEach(z => addBox(-8.72, z, 1.0, 0.72, 0.2, 0x54759f, 0.53, false, { roughness: 0.95 }));
addBox(-8.9, -1.9, 0.5, 0.5, 0.14, 0xd8b64c, 0.66, false, { roughness: 0.9 }); // throw cushion
/* coffee table: slab + legs */
function table(cx, cz, sx, sz, h, color) {
  addCollider(cx, cz, sx, sz);
  addBox(cx, cz, sx, sz, 0.07, color, h - 0.035, false, { roughness: 0.35 });
  const lx = sx / 2 - 0.09, lz = sz / 2 - 0.09;
  [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(([ox, oz]) =>
    addBox(cx + ox, cz + oz, 0.09, 0.09, h - 0.07, color, (h - 0.07) / 2, false, { roughness: 0.5 }));
}
table(-5.8, -2.7, 1.8, 1.1, 0.78, WOOD_M);   // coffee table
table(5, -2.8, 2.2, 1.6, 0.95, 0x9a7350);    // kitchen table
table(-3, 6.3, 2.6, 1.1, 1.0, WOOD_D);       // bedroom desk
table(7, 6.3, 2.8, 1.1, 1.0, 0x3f5148);      // study desk
/* chairs at the kitchen table */
[[3.9, -2.2], [6.1, -3.4]].forEach(([x, z]) => {
  addBox(x, z, 0.5, 0.5, 0.5, 0x7a5a40, null, false, { roughness: 0.7 });
  addBox(x + (x < 5 ? -0.21 : 0.21), z, 0.08, 0.5, 1.05, 0x7a5a40, null, false, { roughness: 0.7 });
});
/* tv unit + screen */
addBox(-5, -6.55, 3, 0.7, 0.6, 0x4a3826, null, true, { roughness: 0.4 });
addBox(-5, -6.62, 2.3, 0.1, 1.25, 0x0a0d14, 1.35, false,
  { roughness: 0.2, metalness: 0.4, emissive: 0x24406e, emissiveIntensity: 0.7 });
addBox(-5, -6.55, 0.5, 0.3, 0.09, 0x1a1d24, 0.65, false, { roughness: 0.4 }); // soundbar
/* shelves with books */
function shelfUnit(cx, cz, sx, sz, h, alongX) {
  addCollider(cx, cz, sx, sz);
  const frame = { roughness: 0.55 };
  addBox(cx, cz, sx, sz, 0.05, 0x5c432e, h - 0.025, false, frame);
  addBox(cx, cz, sx, sz, 0.05, 0x5c432e, 0.05, false, frame);
  [0.5, 1.0].forEach(y => addBox(cx, cz, alongX ? sx : sx, alongX ? sz : sz, 0.04, 0x5c432e, y, false, frame));
  if (alongX) {
    addBox(cx - sx / 2 + 0.03, cz, 0.06, sz, h, 0x5c432e, null, false, frame);
    addBox(cx + sx / 2 - 0.03, cz, 0.06, sz, h, 0x5c432e, null, false, frame);
  } else {
    addBox(cx, cz - sz / 2 + 0.03, sx, 0.06, h, 0x5c432e, null, false, frame);
    addBox(cx, cz + sz / 2 - 0.03, sx, 0.06, h, 0x5c432e, null, false, frame);
  }
  /* books */
  for (let i = 0; i < 14; i++) {
    const bh = 0.24 + Math.random() * 0.12, bw = 0.055 + Math.random() * 0.03;
    const t = (i / 14 - 0.5) * ((alongX ? sx : sz) - 0.5);
    addBox(alongX ? cx + t : cx, alongX ? cz : cz + t,
      alongX ? bw : sz * 0.55, alongX ? sx * 0 + 0.22 : bw,
      bh, [0xb5484d, 0x3f6f8f, 0x4f8a5a, 0xc9a24b, 0x7a5a8f][i % 5],
      (i % 2 ? 0.5 : 1.0) + 0.025 + bh / 2, false, { roughness: 0.8 });
  }
}
shelfUnit(-1.7, -6.55, 2.6, 0.6, 1.5, true);   // living shelf
shelfUnit(9.55, 2.5, 0.6, 2.2, 1.6, false);    // study shelf
/* kitchen counter: cabinets + stone top + sink + hob */
addCollider(5, -6.5, 8, 0.9);
addBox(5, -6.5, 8, 0.88, 0.96, 0xdde2e8, null, false, { roughness: 0.6 });
addBox(5, -6.5, 8.1, 0.96, 0.07, 0x39404d, 1.0, false, { roughness: 0.25, metalness: 0.15 });
addBox(6.8, -6.5, 0.95, 0.55, 0.05, 0xbdc6cf, 1.045, false, { metalness: 0.85, roughness: 0.25 });
addBox(6.8, -6.72, 0.08, 0.08, 0.28, 0xbdc6cf, 1.15, false, { metalness: 0.85, roughness: 0.25 }); // tap
addBox(1.8, -6.5, 1.1, 0.6, 0.02, 0x14161c, 1.05, false, { roughness: 0.2, metalness: 0.3 });      // hob
[[1.55, -6.62], [2.05, -6.62], [1.55, -6.38], [2.05, -6.38]].forEach(([x, z]) =>
  addBox(x, z, 0.26, 0.18, 0.015, 0x2b2f38, 1.065, false, { roughness: 0.3 }));
[2.6, 4.1, 5.6].forEach(x => addBox(x, -6.06, 0.5, 0.03, 0.04, 0x9aa3ad, 0.62, false, { metalness: 0.7, roughness: 0.3 })); // handles
/* fridge */
addCollider(9.4, -1.0, 1.0, 1.0);
addBox(9.4, -1.0, 1.0, 0.95, 2.0, 0xcfd7de, null, false, { metalness: 0.55, roughness: 0.3 });
addBox(8.94, -1.25, 0.05, 0.06, 0.7, 0x8f979f, 1.45, false, { metalness: 0.8, roughness: 0.25 });
addBox(8.94, -1.25, 0.05, 0.06, 0.5, 0x8f979f, 0.55, false, { metalness: 0.8, roughness: 0.25 });
/* bed */
addCollider(-8.3, 4.5, 2.6, 3.6);
addBox(-8.3, 4.5, 2.6, 3.6, 0.32, 0x5c432e, null, false, { roughness: 0.6 });
addBox(-9.52, 4.5, 0.16, 3.6, 1.1, 0x5c432e, null, false, { roughness: 0.6 });
addBox(-8.3, 4.5, 2.35, 3.35, 0.26, 0xf0ece2, 0.45, false, { roughness: 0.95 });
addBox(-8.05, 4.9, 1.9, 2.5, 0.16, 0x9a6f8f, 0.62, false, { roughness: 0.95 });
[[-8.7, 3.35], [-7.9, 3.35]].forEach(([x, z]) =>
  addBox(x, z, 0.62, 0.4, 0.14, 0xffffff, 0.64, false, { roughness: 0.95 }));
/* nightstand + lamp */
addCollider(-6.7, 4.5, 0.8, 0.8);
addBox(-6.7, 4.5, 0.78, 0.78, 0.62, 0x6e523a, null, false, { roughness: 0.55 });
addBox(-6.7, 4.15, 0.05, 0.05, 0.3, 0x8f979f, 0.78, false, { metalness: 0.7 });
addBox(-6.7, 4.15, 0.24, 0.24, 0.2, 0xffe9c0, 1.0, false,
  { emissive: 0xffd9a0, emissiveIntensity: 1.4, roughness: 0.6 });
/* wardrobe */
addCollider(-9.5, 1.2, 0.9, 1.8);
addBox(-9.5, 1.2, 0.9, 1.8, 2.2, 0x5c432e, null, false, { roughness: 0.5 });
addBox(-9.04, 1.2, 0.02, 0.03, 1.9, 0x3d2f22, 1.15, false, {});
[[1.05], [1.35]].forEach(([z]) =>
  addBox(-9.03, z, 0.03, 0.05, 0.22, 0xc9a24b, 1.1, false, { metalness: 0.6, roughness: 0.3 }));
/* plants */
function plant(cx, cz) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.32, 14),
    new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: 0.8 }));
  pot.position.set(cx, 0.16, cz); pot.castShadow = true;
  scene.add(pot);
  [[0, 0.62, 0, 0.3], [0.14, 0.5, 0.1, 0.2], [-0.13, 0.52, -0.08, 0.22]].forEach(([ox, oy, oz, r]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x3f7d44, roughness: 0.9 }));
    leaf.position.set(cx + ox, oy, cz + oz); leaf.castShadow = true;
    scene.add(leaf);
  });
}
plant(-9.4, -6.4);
plant(9.35, 5.9);
plant(0.85, -0.85);

/* baked-style ambient occlusion: darkening strips where walls meet the floor */
const aoTex = (() => {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 64;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, 'rgba(20,14,8,.30)');
  g.addColorStop(1, 'rgba(20,14,8,0)');
  x.fillStyle = g; x.fillRect(0, 0, 8, 64);
  return new THREE.CanvasTexture(c);
})();
function aoStrip(cx, cz, len, axis, dir) {
  const geo = new THREE.PlaneGeometry(len, 0.42);
  geo.rotateZ(axis === 'x' ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2));
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(axis === 'x' ? cx : cx + dir * 0.22, 0.018, axis === 'x' ? cz + dir * 0.22 : cz);
  scene.add(m);
}
aoStrip(0, -6.98, 20, 'x', 1);
aoStrip(0, 6.98, 20, 'x', -1);
aoStrip(-9.98, 0, 14, 'z', 1);
aoStrip(9.98, 0, 14, 'z', -1);
for (const [cz, len] of [[-5.5, 3], [0, 4], [5.5, 3]]) {
  aoStrip(0.15, cz, len, 'z', 1);
  aoStrip(-0.15, cz, len, 'z', -1);
}
for (const [cx, len] of [[-8, 4], [0, 8], [8, 4]]) {
  aoStrip(cx, 0.15, len, 'x', 1);
  aoStrip(cx, -0.15, len, 'x', -1);
}

/* soft contact shadows under every piece of furniture */
const blobTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 8, 64, 64, 62);
  g.addColorStop(0, 'rgba(0,0,0,.42)');
  g.addColorStop(0.7, 'rgba(0,0,0,.18)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
for (const c of colliders.slice(wallColliderCount)) {
  const w = (c.maxX - c.minX) + 0.5, d = (c.maxZ - c.minZ) + 0.5;
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.set((c.minX + c.maxX) / 2, 0.02, (c.minZ + c.maxZ) / 2);
  scene.add(blob);
}

/* ============================ product sprites ============================ */
function emojiTexture(emoji, bg = true) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  if (bg) {
    x.fillStyle = 'rgba(226,231,238,0.95)';
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
  /* warm halo behind undecided products */
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  glow.scale.set(1.25, 1.25, 1);
  glow.position.set(p.pos[0], p.pos[1], p.pos[2]);
  scene.add(s); scene.add(mark); scene.add(glow);
  p._glow = glow;
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
  p._glow.visible = false;
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

/* dynamic quality scaling: drop bloom and resolution if the device can't keep up */
let slowFrames = 0, qualityStep = 0;
function autoQuality(rawDt) {
  if (LOW_FX || qualityStep >= 2) return;
  if (rawDt > 0.045) slowFrames++;
  else slowFrames = Math.max(0, slowFrames - 2);
  if (slowFrames > 45) {
    slowFrames = 0;
    qualityStep++;
    if (qualityStep === 1) {
      renderer.setPixelRatio(1);
      resize();
    } else {
      bloom.enabled = false;
    }
  }
}

function frame() {
  const rawDt = clock.getDelta();
  autoQuality(rawDt);
  const dt = Math.min(rawDt, 0.05);

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

  /* product bobbing + halo pulse */
  const tm = performance.now() / 1000;
  for (const p of PRODUCTS) {
    p._mark.position.y = p.pos[1] + 0.62 + Math.sin(tm * 2 + p.pos[0]) * 0.04;
    if (p._glow.visible) {
      const gs = 1.25 + Math.sin(tm * 2.4 + p.pos[2]) * 0.12;
      p._glow.scale.set(gs, gs, 1);
    }
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

  composer.render();
}

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
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
