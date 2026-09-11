import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
let partyUntil = 0;
const motionButton = document.querySelector('#motion');
function updateMotion() {
  motionButton.textContent = paused ? '▷' : 'Ⅱ';
  motionButton.setAttribute('aria-label', paused ? 'Starta animation' : 'Pausa animation');
  motionButton.setAttribute('aria-pressed', String(paused));
}
updateMotion();
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
document.querySelector('#coffee').addEventListener('click', () => {
  partyUntil = performance.now() + 6500;
  document.querySelector('#coffee-message').textContent = 'Fikapeppen är igång! Skriv till mig på LinkedIn så hittar vi en tid. ☕';
});
function updateClock() { document.querySelector('#clock').textContent = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Stockholm',hour:'2-digit',minute:'2-digit'}).format(new Date()); }
updateClock(); setInterval(updateClock, 60000);

try { initScene(); } catch (error) {
  document.querySelector('#scene-fallback').hidden = false;
  motionButton.hidden = true;
  console.warn('3D visualization unavailable:', error);
}
function initScene() {
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x172827);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x172827, 32, 65);
const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
camera.position.set(22, 19, 25);
const controls = new OrbitControls(camera,canvas);
controls.target.set(0,1,0);
controls.enablePan = false; controls.enableZoom = false;
controls.minPolarAngle = .5; controls.maxPolarAngle = 1.35;
controls.enableDamping = true; controls.autoRotate = !reducedMotion; controls.autoRotateSpeed = .16;
controls.update();
scene.add(new THREE.AmbientLight(0xb5dcca, 1.5));
const sun = new THREE.DirectionalLight(0xffe1ad, 4); sun.position.set(4,15,8);sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:16,bottom:-16});sun.shadow.bias=-.001;scene.add(sun);
const fill = new THREE.PointLight(0x74e9e5,35,20);fill.position.set(-9,5,3);scene.add(fill);
const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
const dark = mat(0x24433e), edge=mat(0x426457), road=mat(0x142924), mint=mat(0xbad9a6), glass=mat(0x365f58,{metalness:.5,roughness:.3}), gold=mat(0xebbc78,{emissive:0x8c6026,emissiveIntensity:.25}), glow=mat(0xc4f29c,{emissive:0xa6ee67,emissiveIntensity:1}), aqua=mat(0x87e5de,{emissive:0x43bfb6,emissiveIntensity:.8});
function box(w,h,d,m,x,y,z,parent=scene) {const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function label(text,x,y,z,size=1.5,color='#d9e8cc') {const c=document.createElement('canvas');c.width=512;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='500 45px monospace';ctx.textAlign='center';ctx.fillText(text,256,64);const texture=new THREE.CanvasTexture(c);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(size,size/5.12,1);scene.add(sprite);}
box(23,.6,11,dark,0,-.4,0);box(23.2,.12,11.2,edge,0,-.75,0);
box(22,.09,2.3,road,0,-.04,3.3);
for(let x=-10;x<11;x+=1.2)box(.55,.02,.035,mint,x,.02,3.3);
// Raised production line and luminous rails.
box(14,.28,1.45,dark,-4,.8,0);
for(const z of [-.78,.78])box(14,.075,.07,aqua,-4,1,z);
for(let x=-10;x<3;x+=2){box(.12,1,.95,edge,x,.25,0);box(.07,.06,1.45,edge,x,1,0);}
const factory=new THREE.Group();factory.position.set(-7,2,0);scene.add(factory);
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.35,.35,12,48),dark);ring.rotation.y=Math.PI/2;ring.castShadow=true;factory.add(ring);
const inner=new THREE.Mesh(new THREE.TorusGeometry(1.08,.065,8,48),aqua);inner.rotation.y=Math.PI/2;inner.position.x=.36;factory.add(inner);
box(2,.5,3,dark,-7,.55,0);box(1.5,.16,2.8,gold,-7,.85,0);
for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box(.7,.18,.18,edge,-7,2+Math.cos(a)*1.35,Math.sin(a)*1.35);}
label('THE BUILD ENGINE',-7,4,0,3.2);
label('GC2 + GC3',-10.2,2,0,2,'#96e5e1');
// Six delivered CRM modules form the little product city.
const buildings=[['DEALS',5,-2.7,5.1,2.1],['CONTACTS',8,-2.5,3.8,2.1],['ACTIVITIES',9.1,.3,2.8,1.8],['DASHBOARD',2.5,-2.2,2.7,2],['SEARCH',5.1,.5,2.3,1.8],['TIMELINES',7.7,1.1,1.6,1.8]];
for(const [name,x,z,h,w] of buildings){
 box(w+.35,.23,w+.35,edge,x,.12,z);box(w,h,w,glass,x,h/2+.25,z);
 box(w+.12,.12,w+.12,mint,x,h+.3,z);
 for(let y=.6;y<h;y+=.65){for(let dx=-w/2+.22;dx<w/2;dx+=.43){box(.23,.34,.025,gold,x+dx,y,z+w/2+.02);box(.025,.34,.23,gold,x+w/2+.02,y,z+dx);}}
 box(w+.05,.07,.04,gold,x,h+.34,z+w/2);
 label(name,x,h+.85,z,2.2);
 // Small roof garden.
 box(w*.7,.12,w*.55,dark,x,h+.43,z);
 for(let n=0;n<3;n++)tree(x-.45+n*.4,z,h+.45,.45);
}
function tree(x,z,base=0,scale=1){box(.1*scale,.65*scale,.1*scale,gold,x,base+.33*scale,z);const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.45*scale,0),mat(0x729765));mesh.position.set(x,base+.9*scale,z);mesh.castShadow=true;scene.add(mesh);}
for(const [x,z] of [[1,-4],[3,-4.5],[6.6,-4.4],[10,-4],[10,2],[3,2],[1,1.7],[-2,-3],[-4,-3.7],[-9,4.5],[0,4.7],[4,4.6],[8,4.7]])tree(x,z,0,.7+Math.random()*.35);
// Commit bars: added and removed code, represented illustratively.
for(let i=0;i<17;i++){const h=.3+((i*7)%11)*.095;box(.32,h,.4,mint,-4.5+i*.38,h/2+1,-2.4);box(.32,.15+(i%4)*.12,.4,gold,-4.5+i*.38,.75-(i%4)*.06,-2.4);}
label('CODE IN MOTION',-1.5,3,-2.4,3);
const packets=[];
for(let i=0;i<32;i++){const mesh=box(.22,.22,.22,i<15?aqua:glow,0,0,0);packets.push({mesh,offset:i/32});}
const confetti=[];for(let i=0;i<70;i++){const mesh=box(.09,.14,.06,i%2?gold:glow,0,-5,0);confetti.push({mesh,x:(Math.random()-.5)*18,z:(Math.random()-.5)*8,speed:1+Math.random()*2,phase:Math.random()*8});}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),mat(0x172827));ground.rotation.x=-Math.PI/2;ground.position.y=-.86;ground.receiveShadow=true;scene.add(ground);
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<600?49:35;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
let elapsed=0,last=performance.now();
renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(!paused){elapsed+=dt;controls.autoRotate=!reducedMotion;for(const {mesh,offset} of packets){const p=(elapsed*.055+offset)%1;mesh.position.set(-11+p*14,1.25+Math.sin(p*15+elapsed)*.07,0);mesh.rotation.set(elapsed,elapsed*.7,0);}for(const c of confetti){c.mesh.visible=now<partyUntil&&!reducedMotion;c.mesh.position.set(c.x,((elapsed*c.speed+c.phase)%8)+1,c.z);c.mesh.rotation.set(elapsed,elapsed,c.phase);}}else{controls.autoRotate=false;for(const c of confetti)c.mesh.visible=false;}controls.update();renderer.render(scene,camera);});
// Position packets even when reduced motion starts the scene paused.
packets.forEach(({mesh,offset})=>mesh.position.set(-11+offset*14,1.25,0));
}
