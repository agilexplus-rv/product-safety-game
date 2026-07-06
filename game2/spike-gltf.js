/* Spike B — CC0 GLTF living room.
 * Same room layout as spike-procedural, but furniture is loaded from CC0-licensed
 * GLTF assets (Kenney Furniture Kit 2.0, CC0) via THREE.GLTFLoader.
 * See game2/SPIKE-ASSET-LICENSES.md for provenance of every asset. */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from '../vendor/jsm/loaders/GLTFLoader.js';

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

{
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x3d5a85, roughness: 0.95 });
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

/* ============================ CC0 GLTF FURNITURE ============================ */
const loader = new GLTFLoader();
const ASSET_DIR = 'assets/gltf/';

function addGltf(file, x, z, ry, scale, onLoaded) {
  const url = ASSET_DIR + file;
  loader.load(url, function (gltf) {
    const root = gltf.scene;
    root.position.set(x, 0, z);
    root.rotation.y = ry;
    root.scale.setScalar(scale);
    root.traverse(function (o) {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          o.material.envMapIntensity = 1.0;
        }
      }
    });
    scene.add(root);
    if (onLoaded) onLoaded(root);
  }, undefined, function (err) {
    console.error('GLTF load failed for', url, err);
  });
}

addGltf('loungeSofa.glb', -9.0, -2.5, Math.PI / 2, 1.4);
addGltf('tableCoffee.glb', -5.8, -2.7, 0, 1.2);
addGltf('lampSquareFloor.glb', -9.2, -5.9, 0, 1.0);
addGltf('bookcaseOpen.glb', -1.7, -6.55, 0, 1.5);
addGltf('televisionModern.glb', -5, 0.55, 0, 1.6, function (root) {
  root.position.y = 0.6;
});
addGltf('pillow.glb', -8.6, -2.7, 0, 1.0, function (root) { root.position.y = 0.55; });
addGltf('pillowBlue.glb', -9.0, -2.0, 0, 1.0, function (root) { root.position.y = 0.55; });
addGltf('plantSmall1.glb', -9.4, -6.4, 0, 1.0);
addGltf('loungeChair.glb', -2.4, -4.0, Math.PI, 1.2);

setTimeout(function () {
  const el = document.getElementById('load');
  if (el) el.style.display = 'none';
}, 600);

/* ============================ camera / controls ============================ */
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
