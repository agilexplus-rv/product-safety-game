/* Spike A — procedural middle-path living room.
 * Pushes game2's existing procedural approach WITHOUT external assets:
 *  - LatheGeometry for the turned table lamp / vase / table leg silhouettes
 *  - ExtrudeGeometry for the sofa frame and shelf profiles
 *  - TubeGeometry for the floor-lamp stand and the curtain rod
 *  - procedurally generated canvas normal maps (Sobel) for wood grain & fabric weave
 *  - a real THREE.PointLight with PCFSoftShadowMap soft shadows
 *  - PMREMGenerator + RoomEnvironment (already vendored) for plausible reflections
 * Same room layout as game2's living room so the comparison is apples-to-apples. */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/jsm/geometries/RoundedBoxGeometry.js';

const canvas = document.getElementById('c3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1120);
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 60);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

function canvasTex(size, draw, rx, ry, srgb) {
  if (rx === undefined) rx = 1;
  if (ry === undefined) ry = 1;
  if (srgb === undefined) srgb = true;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  return t;
}
function normalFromHeight(draw, size, strength, rx, ry) {
  const hc = document.createElement('canvas');
  hc.width = hc.height = size;
  draw(hc.getContext('2d'), size);
  const src = hc.getContext('2d').getImageData(0, 0, size, size).data;
  const h = function (x, y) { return src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255; };
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
  t.anisotropy = 8;
  return t;
}

const woodTex = canvasTex(512, function (x, s) {
  x.fillStyle = '#a8825c'; x.fillRect(0, 0, s, s);
  const ph = s / 8;
  for (let p = 0; p < 8; p++) {
    const y0 = p * ph;
    x.fillStyle = 'hsl(' + (25 + Math.random() * 7) + ', ' + (36 + Math.random() * 12) + '%, ' + (44 + Math.random() * 12) + '%)';
    x.fillRect(0, y0, s, ph - 2);
    x.strokeStyle = 'rgba(80,48,26,.35)';
    for (let g = 0; g < 7; g++) {
      x.beginPath();
      const gy = y0 + Math.random() * ph;
      x.moveTo(0, gy);
      for (let gx = 0; gx <= s; gx += 64) x.lineTo(gx, gy + (Math.random() - 0.5) * 6);
      x.stroke();
    }
    x.fillStyle = 'rgba(50,30,16,.55)';
    x.fillRect(0, y0 + ph - 2, s, 2);
    x.fillRect(Math.random() * s, y0, 2, ph);
  }
}, 4, 2.8);
const woodNormal = normalFromHeight(function (x, s) {
  x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
  const ph = s / 8;
  for (let p = 0; p < 8; p++) {
    x.fillStyle = '#2a2a2a'; x.fillRect(0, p * ph + ph - 3, s, 3);
    x.fillStyle = 'rgba(255,255,255,.10)'; x.fillRect(0, p * ph, s, 2);
    x.strokeStyle = 'rgba(96,96,96,.5)';
    for (let g = 0; g < 6; g++) {
      x.beginPath();
      const gy = p * ph + Math.random() * ph;
      x.moveTo(0, gy);
      for (let gx = 0; gx <= s; gx += 64) x.lineTo(gx, gy + (Math.random() - 0.5) * 5);
      x.stroke();
    }
  }
}, 256, 2.2, 4, 2.8);

const plasterTex = canvasTex(256, function (x, s) {
  x.fillStyle = '#efe6d7'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = 'rgba(' + (170 + Math.random() * 60) + ',' + (160 + Math.random() * 50) + ',' + (140 + Math.random() * 40) + ',.16)';
    x.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}, 3, 1.2);
const plasterNormal = normalFromHeight(function (x, s) {
  x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 1400; i++) {
    const v = 110 + Math.random() * 60;
    x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
    x.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}, 128, 1.1, 3, 1.2);

const fabricNormal = normalFromHeight(function (x, s) {
  x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
  x.strokeStyle = 'rgba(40,40,40,.7)'; x.lineWidth = 1;
  for (let i = 0; i < s; i += 4) {
    x.beginPath(); x.moveTo(0, i); x.lineTo(s, i); x.stroke();
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, s); x.stroke();
  }
  x.fillStyle = 'rgba(255,255,255,.15)';
  for (let i = 0; i < s; i += 4) x.fillRect(i, 0, 2, s);
  for (let i = 0; i < s; i += 4) x.fillRect(0, i, s, 2);
}, 128, 2.5, 3, 1.5);

const skyTex = canvasTex(256, function (x, s) {
  const g = x.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#5fb2ff'); g.addColorStop(0.7, '#bfe2ff'); g.addColorStop(1, '#e8f6e8');
  x.fillStyle = g; x.fillRect(0, 0, s, s);
  x.fillStyle = 'rgba(255,255,255,.9)';
  const clouds = [[60, 70, 26], [110, 62, 18], [180, 110, 22], [210, 100, 14]];
  for (let i = 0; i < clouds.length; i++) {
    x.beginPath(); x.arc(clouds[i][0], clouds[i][1], clouds[i][2], 0, 7); x.fill();
  }
  x.fillStyle = '#fff7d6';
  x.beginPath(); x.arc(210, 40, 20, 0, 7); x.fill();
});

const ROOM_W = 10, ROOM_D = 7, H = 2.8;
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D),
  new THREE.MeshStandardMaterial({
    map: woodTex, normalMap: woodNormal, normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.9, metalness: 0.06
  }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D),
  new THREE.MeshStandardMaterial({ color: 0xe4dfd3, roughness: 1 }));
ceiling.rotation.x = Math.PI / 2; ceiling.position.y = H;
ceiling.receiveShadow = true;
scene.add(ceiling);

const wallMat = new THREE.MeshStandardMaterial({
  map: plasterTex, normalMap: plasterNormal, normalScale: new THREE.Vector2(0.4, 0.4),
  roughness: 0.94, metalness: 0
});
function wallMesh(w, h, x, y, z, ry) {
  if (ry === undefined) ry = 0;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
  scene.add(m);
}
wallMesh(ROOM_W, H, -5, H / 2, -ROOM_D / 2, 0);
const accentMat = new THREE.MeshStandardMaterial({ color: 0x44618f, roughness: 0.93 });
const southWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, H), accentMat);
southWall.position.set(-5, H / 2, ROOM_D / 2); southWall.rotation.y = Math.PI;
southWall.receiveShadow = true; scene.add(southWall);
wallMesh(ROOM_D, H, -10, H / 2, 0, Math.PI / 2);
wallMesh(ROOM_D * 0.35, H, 0, H / 2, -ROOM_D * 0.18, -Math.PI / 2);
wallMesh(ROOM_D * 0.35, H, 0, H / 2, ROOM_D * 0.18, -Math.PI / 2);

function skirting(w, x, z, ry) {
  if (ry === undefined) ry = 0;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xded3c0, roughness: 0.5 }));
  m.position.set(x, 0.07, z); m.rotation.y = ry; m.receiveShadow = true;
  scene.add(m);
}
skirting(ROOM_W - 0.06, -5, -ROOM_D / 2 + 0.03);
skirting(ROOM_D - 0.06, -10 + 0.03, 0, Math.PI / 2);
skirting(ROOM_W - 0.06, -5, ROOM_D / 2 - 0.03);

{
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.35),
    new THREE.MeshBasicMaterial({ map: skyTex }));
  sky.position.set(-5.5, 1.7, -ROOM_D / 2 + 0.01);
  scene.add(sky);
  const fMat = { roughness: 0.5, metalness: 0.1 };
  const fz = -ROOM_D / 2 + 0.06;
  function addF(w, h, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06),
      new THREE.MeshStandardMaterial(fMat));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
  }
  addF(2.58, 0.09, -5.5, 1.7 + 0.675 + 0.045, fz);
  addF(2.58, 0.09, -5.5, 1.7 - 0.675 - 0.045, fz);
  addF(0.09, 1.35, -5.5 - 1.245, 1.7, fz);
  addF(0.09, 1.35, -5.5 + 1.245, 1.7, fz);
  addF(0.05, 1.35, -5.5, 1.7, fz);
  addF(2.4, 0.05, -5.5, 1.7, fz);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xefe9dd, roughness: 0.5 }));
  sill.position.set(-5.5, 1.7 - 0.675 - 0.09, -ROOM_D / 2 + 0.1);
  sill.castShadow = true; sill.receiveShadow = true; scene.add(sill);
}

scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x8a7660, 0.35));
const sun = new THREE.DirectionalLight(0xffeeda, 2.0);
sun.position.set(4, 8, -6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -8; sun.shadow.camera.right = 2;
sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 22;
sun.shadow.bias = -0.0004;
scene.add(sun);

const warmLight = new THREE.PointLight(0xffd9a8, 8, 9, 1.8);
warmLight.position.set(-6.5, 2.4, -3.0);
warmLight.castShadow = true;
warmLight.shadow.mapSize.set(1024, 1024);
warmLight.shadow.bias = -0.004;
warmLight.shadow.radius = 4;
scene.add(warmLight);

{
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 20),
    new THREE.MeshStandardMaterial({ color: 0xfffbe8, emissive: 0xffe9b0, emissiveIntensity: 2.0, roughness: 0.4 }));
  disk.position.set(-6.5, 2.74, -3.0);
  scene.add(disk);
}

const WOOD_D = 0x6b4a32, WOOD_M = 0x8a6242, FABRIC = 0x46628f;

function stdMat(color, opts) {
  if (opts === undefined) opts = {};
  const base = { color: color, roughness: 0.82, metalness: 0.04 };
  for (const k in opts) base[k] = opts[k];
  return new THREE.MeshStandardMaterial(base);
}

{
  const grp = new THREE.Group();
  grp.position.set(-9.0, 0, -2.5);
  grp.rotation.y = Math.PI / 2;
  scene.add(grp);

  const shape = new THREE.Shape();
  shape.moveTo(-0.7, 0); shape.lineTo(0.7, 0);
  shape.lineTo(0.7, 0.42); shape.lineTo(-0.55, 0.42);
  shape.lineTo(-0.55, 1.15); shape.lineTo(-0.7, 1.15);
  shape.closePath();
  const baseGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 3.25, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2
  });
  baseGeo.translate(0, 0, -3.25 / 2);
  const fabricMat = new THREE.MeshStandardMaterial({
    color: FABRIC, roughness: 0.95, metalness: 0.0,
    normalMap: fabricNormal, normalScale: new THREE.Vector2(0.6, 0.6)
  });
  const base = new THREE.Mesh(baseGeo, fabricMat);
  base.castShadow = true; base.receiveShadow = true;
  grp.add(base);

  const cushMat = new THREE.MeshStandardMaterial({
    color: 0x54759f, roughness: 0.95,
    normalMap: fabricNormal, normalScale: new THREE.Vector2(0.5, 0.5)
  });
  const cushZ = [-1.05, -0.35, 0.35, 1.05];
  for (let i = 0; i < cushZ.length; i++) {
    const c = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.22, 0.62, 3, 0.06), cushMat);
    c.position.set(0.05, 0.53, cushZ[i]); c.castShadow = true; c.receiveShadow = true;
    grp.add(c);
  }
  const backZ = [-0.7, 0, 0.7];
  for (let i = 0; i < backZ.length; i++) {
    const c = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.5, 0.6, 3, 0.05), cushMat);
    c.position.set(-0.42, 0.72, backZ[i]); c.castShadow = true; c.receiveShadow = true;
    grp.add(c);
  }
  const tc = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.14, 0.5, 3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xd8b64c, roughness: 0.9 }));
  tc.position.set(-0.1, 0.66, -1.6); tc.castShadow = true; tc.receiveShadow = true;
  grp.add(tc);

  const footMat = stdMat(WOOD_D, { roughness: 0.5 });
  const footProfile = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, y = t * 0.16;
    const r = 0.035 + 0.015 * Math.sin(t * Math.PI * 3);
    footProfile.push(new THREE.Vector2(r, y));
  }
  const footGeo = new THREE.LatheGeometry(footProfile, 16);
  const footPos = [[0.6, -1.5], [0.6, 1.5], [-0.6, -1.5], [-0.6, 1.5]];
  for (let i = 0; i < footPos.length; i++) {
    const f = new THREE.Mesh(footGeo, footMat);
    f.position.set(footPos[i][0], 0, footPos[i][1]); f.castShadow = true; f.receiveShadow = true;
    grp.add(f);
  }
}

{
  const grp = new THREE.Group();
  grp.position.set(-5.8, 0, -2.7);
  scene.add(grp);
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.07, 1.1, 2, 0.02),
    stdMat(WOOD_M, { roughness: 0.35 }));
  top.position.y = 0.745; top.castShadow = true; top.receiveShadow = true;
  grp.add(top);
  const legProfile = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, y = t * 0.74;
    let r = 0.05;
    r += 0.025 * Math.sin(t * Math.PI * 2.5);
    r += 0.015 * Math.sin(t * Math.PI * 6);
    legProfile.push(new THREE.Vector2(Math.max(0.02, r), y));
  }
  const legGeo = new THREE.LatheGeometry(legProfile, 20);
  const legMat = stdMat(WOOD_D, { roughness: 0.45 });
  const legPos = [[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.45], [0.8, 0.45]];
  for (let i = 0; i < legPos.length; i++) {
    const lg = new THREE.Mesh(legGeo, legMat);
    lg.position.set(legPos[i][0], 0, legPos[i][1]); lg.castShadow = true; lg.receiveShadow = true;
    grp.add(lg);
  }
  const books = [[0, 0, 0.81, 0xb5484d], [0.05, 0.02, 0.845, 0x3f6f8f]];
  for (let i = 0; i < books.length; i++) {
    const p = books[i];
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.19),
      stdMat(p[3], { roughness: 0.8 }));
    b.position.set(p[0], p[2], p[1]); b.castShadow = true; b.receiveShadow = true;
    grp.add(b);
  }
}

{
  const grp = new THREE.Group();
  grp.position.set(-9.2, 0, -5.9);
  scene.add(grp);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 20),
    stdMat(0x3d2f22, { metalness: 0.5, roughness: 0.4 }));
  base.position.y = 0.02; base.castShadow = true; base.receiveShadow = true;
  grp.add(base);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.04, 0),
    new THREE.Vector3(0.02, 0.5, 0),
    new THREE.Vector3(-0.05, 1.0, 0.02),
    new THREE.Vector3(0, 1.45, 0)
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.022, 12, false);
  const tube = new THREE.Mesh(tubeGeo, stdMat(0x3d2f22, { metalness: 0.6, roughness: 0.35 }));
  tube.castShadow = true; tube.receiveShadow = true;
  grp.add(tube);
  const shadeProf = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, y = t * 0.3;
    const r = 0.14 + t * 0.06;
    shadeProf.push(new THREE.Vector2(r, y));
  }
  const shadeGeo = new THREE.LatheGeometry(shadeProf, 24, 0, Math.PI * 2);
  const shade = new THREE.Mesh(shadeGeo, new THREE.MeshStandardMaterial({
    color: 0xf3e2c0, emissive: 0xffd9a0, emissiveIntensity: 1.3,
    side: THREE.DoubleSide, roughness: 0.9
  }));
  shade.position.y = 1.55; shade.castShadow = true;
  grp.add(shade);
  const ll = new THREE.PointLight(0xffd9a8, 4, 5, 1.8);
  ll.position.y = 1.55; ll.castShadow = true;
  ll.shadow.mapSize.set(512, 512); ll.shadow.bias = -0.004; ll.shadow.radius = 3;
  grp.add(ll);
}

{
  const grp = new THREE.Group();
  grp.position.set(-5, 0, -6.55);
  scene.add(grp);
  const unit = new THREE.Mesh(new RoundedBoxGeometry(3.0, 0.6, 0.7, 2, 0.03),
    stdMat(0x4a3826, { roughness: 0.4 }));
  unit.position.y = 0.3; unit.castShadow = true; unit.receiveShadow = true;
  grp.add(unit);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.25, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.2, metalness: 0.4,
      emissive: 0x24406e, emissiveIntensity: 0.7 }));
  screen.position.set(0, 1.35, -0.07); screen.castShadow = true;
  grp.add(screen);
  const sb = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.09, 0.3, 2, 0.02),
    stdMat(0x1a1d24, { roughness: 0.4 }));
  sb.position.set(0, 0.65, 0.0); sb.castShadow = true; sb.receiveShadow = true;
  grp.add(sb);
}

{
  const grp = new THREE.Group();
  grp.position.set(-1.7, 0, -6.55);
  scene.add(grp);
  const shelfMat = stdMat(0x5c432e, { roughness: 0.55 });
  const shelfW = 2.6, shelfH = 1.5, shelfD = 0.6;
  const sideShape = new THREE.Shape();
  sideShape.moveTo(0, 0); sideShape.lineTo(shelfD, 0);
  sideShape.lineTo(shelfD, shelfH); sideShape.lineTo(0, shelfH);
  sideShape.lineTo(0, shelfH - 0.05); sideShape.lineTo(shelfD - 0.05, shelfH - 0.05);
  sideShape.lineTo(shelfD - 0.05, 0.05); sideShape.lineTo(0, 0.05);
  sideShape.closePath();
  const sideGeo = new THREE.ExtrudeGeometry(sideShape, { depth: 0.06, bevelEnabled: false });
  const sideL = new THREE.Mesh(sideGeo, shelfMat);
  sideL.position.set(-shelfW / 2, 0, 0); sideL.castShadow = true; sideL.receiveShadow = true;
  grp.add(sideL);
  const sideR = new THREE.Mesh(sideGeo, shelfMat);
  sideR.position.set(shelfW / 2 - 0.06, 0, 0); sideR.castShadow = true; sideR.receiveShadow = true;
  grp.add(sideR);
  const shelfY = [0, 0.5, 1.0, shelfH - 0.05];
  for (let i = 0; i < shelfY.length; i++) {
    const sh = new THREE.Mesh(new THREE.BoxGeometry(shelfW, 0.04, shelfD), shelfMat);
    sh.position.set(0, shelfY[i] + 0.02, shelfD / 2); sh.castShadow = true; sh.receiveShadow = true;
    grp.add(sh);
  }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(shelfW, shelfH),
    stdMat(0x4a3526, { roughness: 0.7 }));
  back.position.set(0, shelfH / 2, 0); back.receiveShadow = true;
  grp.add(back);
  const bookColors = [0xb5484d, 0x3f6f8f, 0x4f8a5a, 0xc9a24b, 0x7a5a8f];
  for (let i = 0; i < 14; i++) {
    const bh = 0.24 + Math.random() * 0.12, bw = 0.055 + Math.random() * 0.03;
    const t = (i / 14 - 0.5) * (shelfW - 0.5);
    const shelf = (i % 3 === 0) ? 0.5 : (i % 3 === 1) ? 1.0 : 0.05;
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, shelfD * 0.55),
      stdMat(bookColors[i % 5], { roughness: 0.8 }));
    b.position.set(t, shelf + bh / 2 + 0.04, shelfD / 2);
    b.castShadow = true; b.receiveShadow = true;
    grp.add(b);
  }
}

{
  const grp = new THREE.Group();
  grp.position.set(-9.4, 0, -6.4);
  scene.add(grp);
  const potProf = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, y = t * 0.32;
    const r = 0.2 - t * 0.05;
    potProf.push(new THREE.Vector2(Math.max(0.02, r), y));
  }
  const pot = new THREE.Mesh(new THREE.LatheGeometry(potProf, 18),
    stdMat(0xb5651d, { roughness: 0.8 }));
  pot.castShadow = true; pot.receiveShadow = true;
  grp.add(pot);
  const leaves = [[0, 0.62, 0, 0.3], [0.14, 0.5, 0.1, 0.2], [-0.13, 0.52, -0.08, 0.22]];
  for (let i = 0; i < leaves.length; i++) {
    const p = leaves[i];
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(p[3], 12, 10),
      stdMat(0x3f7d44, { roughness: 0.9 }));
    leaf.position.set(p[0], p[1], p[2]); leaf.castShadow = true; leaf.receiveShadow = true;
    grp.add(leaf);
  }
}

{
  const borderMat = stdMat(0x3d5a85, { roughness: 0.95 });
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.8), borderMat);
  outer.rotation.x = -Math.PI / 2; outer.position.set(-5, 0.011, -3.2);
  outer.receiveShadow = true;
  scene.add(outer);
  const rugMat = new THREE.MeshStandardMaterial({ color: 0x5c7fae, roughness: 0.95 });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.6), rugMat);
  rug.rotation.x = -Math.PI / 2; rug.position.set(-5, 0.012, -3.2);
  rug.receiveShadow = true;
  scene.add(rug);
}

{
  const artTex = canvasTex(128, function (x, s) {
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
  });
  const art = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.85),
    new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.85 }));
  art.position.set(-8.5, 1.8, -ROOM_D / 2 + 0.012);
  scene.add(art);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.97, 0.05),
    stdMat(0x3d2f22, { roughness: 0.5 }));
  frame.position.set(-8.5, 1.8, -ROOM_D / 2 - 0.01);
  frame.castShadow = true; scene.add(frame);
}

const state = {
  yaw: Math.PI / 2 + 0.3,
  pitch: -0.05,
  pos: new THREE.Vector3(-6, 1.55, -0.5),
  keys: {}
};
const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

addEventListener('keydown', function (e) { state.keys[e.code] = true; });
addEventListener('keyup', function (e) { state.keys[e.code] = false; });
canvas.addEventListener('click', function () {
  if (!IS_TOUCH && document.pointerLockElement !== canvas) canvas.requestPointerLock();
});
document.addEventListener('mousemove', function (e) {
  if (document.pointerLockElement !== canvas) return;
  state.yaw -= e.movementX * 0.0023;
  state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch - e.movementY * 0.0023));
});
if (IS_TOUCH) {
  let lookId = null, lx = 0, ly = 0;
  addEventListener('touchstart', function (e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const tc = e.changedTouches[i];
      if (lookId === null) { lookId = tc.identifier; lx = tc.clientX; ly = tc.clientY; }
    }
  });
  addEventListener('touchmove', function (e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const tc = e.changedTouches[i];
      if (tc.identifier === lookId) {
        state.yaw -= (tc.clientX - lx) * 0.005;
        state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch - (tc.clientY - ly) * 0.005));
        lx = tc.clientX; ly = tc.clientY;
      }
    }
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  addEventListener('touchend', function (e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const tc = e.changedTouches[i];
      if (tc.identifier === lookId) lookId = null;
    }
  });
}

const SPEED = 3.6;
function update(dt) {
  const fwd = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
  const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
  const move = new THREE.Vector3();
  if (state.keys.KeyW || state.keys.ArrowUp) move.add(fwd);
  if (state.keys.KeyS || state.keys.ArrowDown) move.sub(fwd);
  if (state.keys.KeyD || state.keys.ArrowRight) move.add(right);
  if (state.keys.KeyA || state.keys.ArrowLeft) move.sub(right);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(SPEED * dt);
    state.pos.add(move);
  }
  state.pos.x = Math.max(-9.6, Math.min(-0.4, state.pos.x));
  state.pos.z = Math.max(-6.4, Math.min(6.4, state.pos.z));
  state.pos.y = 1.55;
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  update(dt);
  camera.position.copy(state.pos);
  const dir = new THREE.Vector3(
    Math.cos(state.pitch) * Math.sin(state.yaw),
    Math.sin(state.pitch),
    -Math.cos(state.pitch) * Math.cos(state.yaw)
  );
  camera.lookAt(state.pos.clone().add(dir));
  renderer.render(scene, camera);
}
frame();
