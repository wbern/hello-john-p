import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setupAR } from './ar.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
const motionButton = document.querySelector('#motion');
function updateMotion() {
  motionButton.textContent = paused ? '▷' : 'Ⅱ';
  motionButton.setAttribute('aria-label', paused ? 'Starta animation' : 'Pausa animation');
  motionButton.setAttribute('aria-pressed', String(paused));
}
updateMotion();
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
try { initScene(); } catch (error) {
  document.querySelector('#scene-fallback').hidden = false;
  motionButton.hidden = true;
  console.warn('3D visualization unavailable:', error);
}

function initScene() {
  const canvas = document.querySelector('#scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x18212b);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x18212b, .019);
  const world = new THREE.Group();
  world.name = 'GreetingWorld';
  scene.add(world);
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 160);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 3.2, 0);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = .72;
  controls.maxPolarAngle = 1.34;
  controls.minAzimuthAngle = -.45;
  controls.maxAzimuthAngle = .65;
  controls.enableDamping = true;
  controls.autoRotate = false;
  scene.add(new THREE.HemisphereLight(0xbacde1, 0x4b3324, 2.2));
  const sun = new THREE.DirectionalLight(0xffdfaa, 4.4);
  sun.position.set(-9, 14, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 15, bottom: -15 });
  sun.shadow.bias = -.001;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x779dc9, 2.5);
  rim.position.set(9, 8, -10);
  scene.add(rim);
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .75, ...extra });
  const slate = mat(0x334454), charcoal = mat(0x202b35), concrete = mat(0x9e907b);
  const cream = mat(0xe7d7b5), rust = mat(0xa24f36), brass = mat(0xc5955a, { metalness: .55, roughness: .4 });
  const road = mat(0x2b3036), glass = mat(0x2e4a60, { metalness: .45, roughness: .32 });
  const amber = mat(0xffc176, { emissive: 0xff9b3d, emissiveIntensity: .8 });
  const blue = mat(0x8eb9d2, { emissive: 0x4b83a4, emissiveIntensity: .45 });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  function box(w, h, d, material, x, y, z, parent = world) {
    const mesh = new THREE.Mesh(boxGeometry, material);
    mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function cylinder(radius, height, material, x, y, z, parent = world, segments = 48) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function textPanel(lines, w, h, x, y, z, options = {}) {
    const c = document.createElement('canvas'); c.width = 1536; c.height = Math.round(1536 * h / w);
    const ctx = c.getContext('2d');
    ctx.fillStyle = options.background || '#23303b'; ctx.fillRect(0, 0, c.width, c.height);
    if (options.border !== false) { ctx.strokeStyle = '#bd9664'; ctx.lineWidth = 8; ctx.strokeRect(16, 16, c.width - 32, c.height - 32); }
    for (const line of lines) {
      ctx.fillStyle = line.color || '#f3e2bf';
      ctx.textAlign = line.align || 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${line.weight || 700} ${line.size * c.width}px ${line.font || 'Arial, sans-serif'}`;
      ctx.fillText(line.text, (line.x ?? .5) * c.width, line.y * c.height);
    }
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: 1, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: .25, side: THREE.DoubleSide }));
    mesh.position.set(x, y, z); world.add(mesh); return mesh;
  }
  // A single engineered island: the road, factory and city share its oval footprint.
  const base = cylinder(1, .7, charcoal, 0, -.42, 0); base.scale.set(11.8, 1, 6.2);
  const lip = cylinder(1, .1, brass, 0, -.04, 0); lip.scale.set(11.78, 1, 6.18);
  const terrain = cylinder(1, .16, concrete, 0, .06, 0); terrain.scale.set(11.62, 1, 6.02);
  const ringShape = new THREE.Shape(); ringShape.absellipse(0, 0, 11, 5.45, 0, Math.PI * 2, false, 0);
  const inner = new THREE.Path(); inner.absellipse(0, 0, 9.35, 3.95, 0, Math.PI * 2, true, 0); ringShape.holes.push(inner);
  const roadMesh = new THREE.Mesh(new THREE.ShapeGeometry(ringShape, 100), road);
  roadMesh.rotation.x = -Math.PI / 2; roadMesh.position.y = .16; roadMesh.receiveShadow = true; world.add(roadMesh);
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * Math.PI * 2;
    const marking = box(.25, .014, .035, cream, 10.2 * Math.cos(a), .18, 4.7 * Math.sin(a));
    marking.rotation.y = Math.atan2(-4.7 * Math.cos(a), -10.2 * Math.sin(a));
  }
  // One greeting, with generous space around the lettering.
  for (const x of [-5.3, 3.2]) {
    box(.13, 5.1, .16, rust, x, 2.7, -3.15);
    box(.75, .18, .8, charcoal, x, .22, -3.15);
  }
  box(9.2, 2.2, .24, rust, -1.05, 6.17, -3.2);
  textPanel([{ text: 'HEJ JOHN.', y: .52, size: .11 }], 8.95, 1.98, -1.05, 6.17, -3.055);
  for (let i = 0; i < 19; i++) box(.06, .065, .08, amber, -5.35 + i * .48, 7.2, -3.03);
  // The build engine sits on one factory pad, feeding a continuous assembly line.
  box(7.4, .25, 4.2, slate, -5.4, .27, -.25);
  box(3.6, 1.15, 3.05, charcoal, -7.1, .92, -.4);
  box(3.8, .16, 3.2, rust, -7.1, 1.56, -.4);
  for (const z of [-1.2, .4]) {
    const pipe = cylinder(.24, 2.8, brass, -8.2, 2.1, z); box(.6, .12, .6, charcoal, pipe.position.x, 3.54, z);
  }
  const engine = new THREE.Group(); engine.position.set(-6.8, 2.2, .2); world.add(engine);
  const housing = cylinder(1.13, 1.55, slate, 0, 0, 0, engine); housing.rotation.z = Math.PI / 2;
  for (const x of [-.8, .8]) {
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(1.13, .12, 10, 48), brass);
    rimMesh.rotation.y = Math.PI / 2; rimMesh.position.x = x; engine.add(rimMesh);
  }
  const core = new THREE.Mesh(new THREE.TorusGeometry(.79, .075, 10, 48), blue); core.rotation.y = Math.PI / 2; core.position.x = .83; engine.add(core);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const fin = box(1.6, .08, .18, charcoal, 0, Math.cos(a) * 1.12, Math.sin(a) * 1.12, engine); fin.rotation.x = a;
  }
  box(8.2, .3, 1.25, charcoal, -2.8, .65, .2);
  for (const z of [-.46, .86]) box(8.25, .055, .065, brass, -2.8, .88, z);
  for (let x = -6.3; x < 1.1; x += .44) {
    const roller = cylinder(.09, 1.17, slate, x, .84, .2, world, 12); roller.rotation.x = Math.PI / 2;
  }
  const packets = [];
  for (let i = 0; i < 18; i++) {
    const packet = box(.23, .25, .25, i % 3 ? amber : blue, -6 + i / 18 * 7.5, 1.12, .2);
    packets.push({ mesh: packet, offset: i / 18 });
  }
  // One connected city block with stepped heights and a shared central boulevard.
  box(8.5, .32, 6.1, slate, 5, .31, -.55);
  box(8.15, .13, 5.85, concrete, 5, .52, -.55);
  const buildings = [
    [4.05, -2.05, 4.7, 1.9], [6.5, -1.9, 3.65, 1.95],
    [1.85, -1.65, 2.65, 1.65], [8.15, .35, 2.75, 1.75],
    [4.05, .7, 2.05, 1.7], [6.2, 1.15, 1.5, 1.7],
  ];
  for (const [x, z, h, w] of buildings) {
    box(w + .22, .2, w + .22, brass, x, .66, z);
    box(w, h, w, slate, x, h / 2 + .75, z);
    box(w + .16, .13, w + .16, cream, x, h + .8, z);
    box(w * .76, .23, w * .72, charcoal, x, h + .96, z);
    for (let y = 1.05; y < h + .35; y += .56) {
      for (let dx = -w / 2 + .23; dx < w / 2 - .1; dx += .4) {
        box(.24, .34, .045, amber, x + dx, y, z + w / 2 + .025);
        box(.045, .34, .24, glass, x + w / 2 + .025, y, z + dx);
      }
    }
    for (const dx of [-w / 2 + .08, w / 2 - .08]) box(.065, h, .06, brass, x + dx, h / 2 + .75, z + w / 2 + .06);
  }
  // Graphic bars are mounted behind the conveyor, not scattered around the world.
  box(5.7, 1.55, .12, charcoal, -2.55, 1.38, -1.15);
  for (let i = 0; i < 20; i++) {
    const h = .2 + ((i * 7) % 11) * .073;
    box(.16, h, .1, blue, -5.12 + i * .27, 1.17 + h / 2, -1.06);
    box(.16, .09 + (i % 4) * .065, .1, rust, -5.12 + i * .27, 1.08 - (i % 4) * .0325, -1.06);
  }
  // Roadside lights and restrained dry landscaping share the perimeter rhythm.
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const x = Math.cos(a) * 11.2, z = Math.sin(a) * 5.7;
    box(.065, .72, .065, charcoal, x, .53, z);
    box(.14, .12, .14, amber, x, .94, z);
  }
  const shrubMaterial = mat(0x8d7356);
  for (const [x, z] of [[-9, -2.7], [-8.8, 2.35], [-3.9, -3.2], [.1, -2.4], [8.8, -2.6], [9, 2.2], [2.4, 2.5]]) {
    cylinder(.42, .13, rust, x, .28, z, world, 12);
    const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(.34, 1), shrubMaterial);
    shrub.scale.y = 1.5; shrub.position.set(x, .53, z); world.add(shrub);
  }
  const trucks = [];
  for (let i = 0; i < 4; i++) {
    const truck = new THREE.Group(); world.add(truck);
    box(.55, .32, .34, i % 2 ? cream : rust, -.1, .3, 0, truck);
    box(.23, .25, .32, slate, .3, .27, 0, truck);
    box(.06, .08, .22, amber, .43, .25, 0, truck);
    for (const x of [-.24, .24]) for (const z of [-.19, .19]) { const wheel = cylinder(.085, .045, charcoal, x, .12, z, truck, 10); wheel.rotation.x = Math.PI / 2; }
    trucks.push(truck);
  }
  // Unadorned aircraft follow one smooth air corridor.
  const flightTracks = [], propellers = [];
  function airplane(name, material, phase, height) {
    const plane = new THREE.Group(); plane.name = name; world.add(plane);
    const fuselage = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), material); fuselage.scale.set(.94, .18, .2); plane.add(fuselage);
    box(.48, .055, 2.05, cream, -.02, .08, 0, plane);
    box(.32, .06, .8, material, -.69, .05, 0, plane);
    box(.32, .42, .055, material, -.69, .18, 0, plane);
    box(.3, .16, .22, glass, .15, .17, 0, plane);
    propellers.push(box(.04, .75, .055, charcoal, .98, 0, 0, plane));
    const times = [], positions = [], rotations = [];
    for (let i = 0; i <= 200; i++) {
      const a = phase + i / 200 * Math.PI * 2;
      times.push(i / 200 * 48);
      positions.push(Math.cos(a) * 9.4, height + Math.sin(a * 2) * .24, Math.sin(a) * 3.9);
      const yaw = Math.atan2(-3.9 * Math.cos(a), -9.4 * Math.sin(a));
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, -.06)); rotations.push(q.x, q.y, q.z, q.w);
    }
    flightTracks.push(new THREE.VectorKeyframeTrack(`${name}.position`, times, positions));
    flightTracks.push(new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, rotations));
  }
  airplane('JohnFlight', rust, Math.PI * 1.42, 10.6);
  airplane('CompanionFlight', slate, Math.PI * .42, 11.1);
  const flightClip = new THREE.AnimationClip('En flygande halsning', 48, flightTracks);
  const mixer = new THREE.AnimationMixer(world); mixer.clipAction(flightClip).play(); mixer.update(0);
  // Ground and atmospheric dust are outside the portable AR miniature.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), mat(0x283039));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.8; ground.receiveShadow = true; scene.add(ground);
  const dustPositions = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) { dustPositions[i * 3] = Math.sin(i * 17.3) * 21; dustPositions[i * 3 + 1] = (i % 29) * .43; dustPositions[i * 3 + 2] = Math.cos(i * 9.7) * 14; }
  const dustGeometry = new THREE.BufferGeometry(); dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xd3ae7c, size: .038, transparent: true, opacity: .38, depthWrite: false })); scene.add(dust);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    ground.visible = w >= 700;
    // Preserve the whole greeting on portrait screens while letting the island fill desktop.
    const distance = Math.max(31, 37 / camera.aspect);
    camera.position.set(distance * .19, distance * .42 + 3.2, distance * .89);
    scene.fog.density = .019 * 28 / distance;
    camera.updateProjectionMatrix(); controls.update();
  }
  new ResizeObserver(resize).observe(canvas); resize();
  const ar = setupAR(world, { animations: [flightClip], modelSrc: import.meta.env.DEV ? undefined : './greeting.glb', iosSrc: import.meta.env.DEV ? undefined : './greeting.usdz' });
  if (import.meta.env.DEV) window.__exportGreeting = async () => { await ar.open(); return (await ar.prepare()).url; };
  let elapsed = 0, last = performance.now();
  function positionTraffic() {
    for (const { mesh, offset } of packets) { const p = (elapsed * .09 + offset) % 1; mesh.position.set(-6 + p * 7.5, 1.11, .2); mesh.rotation.y = elapsed * .25; }
    trucks.forEach((truck, i) => { const a = elapsed * .075 + i * Math.PI / 2; truck.position.set(10.2 * Math.cos(a), .18, 4.7 * Math.sin(a)); truck.rotation.y = Math.atan2(-4.7 * Math.cos(a), -10.2 * Math.sin(a)); });
  }
  positionTraffic();
  renderer.setAnimationLoop(now => {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (!paused) {
      elapsed += dt; mixer.update(dt); propellers.forEach(p => { p.rotation.x += dt * 27; }); positionTraffic();
      dust.rotation.y = Math.sin(elapsed * .02) * .08;
    }
    controls.update(); renderer.render(scene, camera);
  });
}
