import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 page.on('pageerror',error=>console.error(error));
 await page.goto('http://localhost:5173');
 await page.waitForFunction(()=>typeof window.__exportGreeting==='function');
 const bytes=await page.evaluate(async()=>{
   const url=await window.__exportGreeting();
   return Array.from(new Uint8Array(await (await fetch(url)).arrayBuffer()));
 });
 const buffer=Buffer.from(bytes);
 if(buffer.toString('ascii',0,4)!=='glTF') throw new Error('Invalid GLB');
 const jsonLength=buffer.readUInt32LE(12);
 const gltf=JSON.parse(buffer.toString('utf8',20,20+jsonLength));
 if(!gltf.animations?.[0]?.channels?.length) throw new Error('Missing flight animations');
 await writeFile(new URL('../public/greeting.glb',import.meta.url),buffer);
 const usdz=await page.evaluate(async()=>{
   const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
   const {USDZExporter}=await import('/node_modules/three/examples/jsm/exporters/USDZExporter.js');
   const url=await window.__exportGreeting();
   const model=await new GLTFLoader().loadAsync(url);
   return Array.from(await new USDZExporter().parseAsync(model.scene));
 });
 const usdzBuffer=Buffer.from(usdz);
 if(usdzBuffer.toString('ascii',0,2)!=='PK') throw new Error('Invalid USDZ archive');
 await writeFile(new URL('../public/greeting.usdz',import.meta.url),usdzBuffer);
 console.log(`Exported GLB ${buffer.length} bytes with ${gltf.animations[0].channels.length} flight channels; USDZ ${usdzBuffer.length} bytes.`);
} finally {await browser.close();}
