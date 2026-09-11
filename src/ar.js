import { Box3, Group, Vector3 } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// Hosted GLB enables native Android Scene Viewer. Runtime exports are for
// development and support WebXR + automatically generated iOS Quick Look USDZ.
export function setupAR(group, { animations = [], modelSrc, iosSrc } = {}) {
  const trigger = document.querySelector('#launch-ar');
  const status = document.querySelector('#ar-status');
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-labelledby', 'ar-dialog-title');
  dialog.style.cssText = 'width:min(620px,calc(100% - 32px));max-height:90dvh;overflow:auto;padding:24px;border:1px solid #a4b5a2;border-radius:20px;background:#f4f4e9;color:#142725;box-shadow:0 30px 100px #0008';
  dialog.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px"><h2 id="ar-dialog-title" style="font-size:26px;margin:0">En liten värld på ditt bord.</h2><button type="button" data-close aria-label="Stäng AR-förhandsvisning" style="font-size:24px;background:none;border:0;cursor:pointer">×</button></div><p data-help role="status">Förbereder din hälsning i 3D…</p><div data-model></div><button type="button" data-start hidden style="padding:14px 22px;border:0;border-radius:30px;background:#193c36;color:white;cursor:pointer">Placera i mitt rum ↗</button><p style="font-size:13px;line-height:1.5">På iPhone öppnas en stillbild i 3D i AR Quick Look. På en Android-enhet med WebXR kan flygningen fortsätta i AR.</p>`;
  const viewer = document.querySelector('#ar-viewer') || document.createElement('model-viewer');
  viewer.id = 'ar-viewer';
  viewer.hidden = false;
  viewer.setAttribute('alt', 'Williams personliga hälsning: en kodfabrik, CRM-stad och flygplan som en bordsmodell');
  for (const attr of ['ar', 'camera-controls']) viewer.setAttribute(attr, '');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) viewer.setAttribute('autoplay', '');
  viewer.setAttribute('ar-modes', modelSrc ? 'webxr scene-viewer quick-look' : 'webxr quick-look');
  viewer.setAttribute('loading', 'eager');
  if (iosSrc) viewer.setAttribute('ios-src', new URL(iosSrc, document.baseURI).href);
  viewer.setAttribute('shadow-intensity', '1');
  viewer.setAttribute('camera-orbit', '35deg 65deg auto');
  viewer.style.cssText = 'display:block;width:100%;height:340px;background:#e3e9dd;border-radius:12px;margin:16px 0';
  dialog.querySelector('[data-model]').append(viewer);
  document.body.append(dialog);
  const help = dialog.querySelector('[data-help]');
  const start = dialog.querySelector('[data-start]');
  let promise, objectURL;
  const say = (message) => { help.textContent = message; if (status) status.textContent = message; };

  async function prepare() {
    if (promise) return promise;
    promise = (async () => {
      await import('@google/model-viewer');
      await customElements.whenDefined('model-viewer');
      let blob;
      let source = modelSrc ? new URL(modelSrc, document.baseURI).href : null;
      if (!source) {
        const copy = group.clone(true);
        // Remove nonportable/hidden objects before bounds calculation as Box3
        // includes hidden geometry (such as parked celebration particles).
        const excluded = [];
        copy.traverse(child => {
          if (child !== copy && (!child.visible || child.userData.excludeFromAR || child.isSprite || child.isLine || child.isPoints)) excluded.push(child);
        });
        excluded.forEach(child => child.removeFromParent());
        copy.updateMatrixWorld(true);
        const box = new Box3().setFromObject(copy);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        const scale = 0.65 / Math.max(size.x, size.z, 0.001);
        const placement = new Group();
        placement.name = 'GreetingTabletop';
        placement.scale.setScalar(scale);
        copy.position.sub(new Vector3(center.x, box.min.y, center.z));
        placement.add(copy);
        placement.updateMatrixWorld(true);
        const bytes = await new GLTFExporter().parseAsync(placement, { binary: true, animations, onlyVisible: true, maxTextureSize: 1024 });
        blob = new Blob([bytes], { type: 'model/gltf-binary' });
        objectURL = URL.createObjectURL(blob);
        source = objectURL;
      }
      await new Promise((resolve, reject) => {
        const cleanup = () => { viewer.removeEventListener('load', loaded); viewer.removeEventListener('error', failed); clearTimeout(timeout); };
        const loaded = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error('Modellen kunde inte laddas.')); };
        const timeout = setTimeout(() => { cleanup(); reject(new Error('Modellen tog för lång tid att ladda. Försök igen.')); }, 45000);
        viewer.addEventListener('load', loaded);
        viewer.addEventListener('error', failed);
        viewer.src = source;
      });
      return { viewer, url: source, blob };
    })().catch(error => { promise = undefined; if (objectURL) URL.revokeObjectURL(objectURL); throw error; });
    return promise;
  }
  async function open() {
    if (!dialog.open) dialog.showModal();
    say('Förbereder din hälsning i 3D…');
    try {
      await prepare();
      start.hidden = !viewer.canActivateAR;
      say(viewer.canActivateAR ? 'Snurra på modellen här. Tryck sedan nedan och hitta en fri yta för hälsningen.' : 'Snurra på modellen här. Öppna samma länk i Safari på iPhone eller Chrome på en Android-telefon med AR-stöd för att placera den i rummet.');
    } catch (error) {
      say('AR-modellen kunde inte förberedas. Stäng och försök igen; hälsningen går fortfarande att utforska på sidan.');
      console.error('AR preparation failed', error);
    }
  }
  async function launch() {
    try { await viewer.activateAR(); }
    catch (error) { say('AR kunde inte starta. Kontrollera kamerabehörighet och prova i telefonens vanliga webbläsare.'); console.error(error); }
  }
  viewer.addEventListener('ar-status', (event) => {
    if (event.detail.status === 'failed') say('AR kunde inte starta på den här enheten. Du kan fortfarande snurra på modellen här.');
  });
  trigger?.addEventListener('click', open);
  start.addEventListener('click', launch);
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  return { prepare, open, dispose() { trigger?.removeEventListener('click', open); if (objectURL) URL.revokeObjectURL(objectURL); dialog.remove(); } };
}
