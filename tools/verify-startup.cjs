const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {spawn}=require('child_process');

const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const indexPath=path.join(dist,'index.html');
const index=fs.readFileSync(indexPath,'utf8');

function assert(value,message){if(!value)throw new Error(message)}

assert(index.includes('id="tapStartGate"'),'TAP START gate is missing from index.html');
assert(index.includes('id="title"'),'title screen is missing from index.html');
assert(index.includes("boot-recovery.js?v=1"),'startup recovery script is missing');

const inlineScripts=[...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
 .filter(match=>!/<script\s[^>]*\bsrc=/i.test(match[0]))
 .map(match=>match[1]);
inlineScripts.forEach((code,i)=>new vm.Script(code,{filename:`index-inline-${i+1}.js`}));

const scriptSources=[...index.matchAll(/<script\s[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)]
 .map(match=>match[1].split('?')[0]);
for(const source of scriptSources){
 const file=path.join(dist,source);
 assert(fs.existsSync(file),`startup script is missing: ${source}`);
 new vm.Script(fs.readFileSync(file,'utf8'),{filename:source});
}

const responsive=fs.readFileSync(path.join(dist,'responsive-shell.js'),'utf8');
assert(responsive.includes('if(el.textContent!==summary)el.textContent=summary'),
 'touch calibration can retrigger the MutationObserver continuously');
assert(!responsive.includes('RAW_PRIORITY_SELECTOR'),
 'some landscape controls still bypass the global correction');
assert(!responsive.includes("scope.id==='touchCalibrationModal'||"),
 'saved correction is disabled inside the touch calibration modal');
assert(!responsive.includes("[data-touch-adjust],[data-touch-reset],#touchCalibrationTest'"),
 'calibration controls incorrectly prefer uncorrected touch coordinates');
assert(!responsive.includes("||(!touchCalibration.x&&!touchCalibration.y)||"),
 'landscape visual hit testing is disabled when calibration is centered');
assert(responsive.includes("TOUCH_CAL_BACKUP_KEY='abyssLandscapeTouchCalibrationBackupV1'"),
 'touch calibration does not have a persistent backup');
assert(responsive.includes("window.addEventListener('pagehide',persistTouchCalibration"),
 'touch calibration is not persisted when the page closes');
assert(responsive.includes("document.addEventListener('visibilitychange'"),
 'touch calibration is not restored after app suspension');
assert(responsive.includes('restoreTouchCalibration();\n syncOrientationLayout();'),
 'touch calibration is not restored after orientation changes');
assert(responsive.includes("reset.dataset.confirmReset==='1'"),
 'touch calibration reset can be triggered accidentally with one tap');
assert(responsive.includes('showTouchCalibrationTrace(t.clientX,t.clientY,intended'),
 'touch calibration does not visualize the corrected target');
assert(responsive.includes('bottomCloseTarget(scope,t.clientY)'),
 'landscape close buttons still depend on Safari hit-test rectangles');
assert(responsive.includes('setTouchCalibration(r.left+r.width/2-t.clientX,r.top+r.height/2-t.clientY)'),
 'automatic touch calibration does not measure Safari rectangle displacement');
const landscapeCss=fs.readFileSync(path.join(dist,'responsive-landscape.css'),'utf8');
assert(landscapeCss.includes('-webkit-backdrop-filter:none!important'),
 'Safari landscape modals still create a backdrop compositor layer');
assert(landscapeCss.includes('-webkit-overflow-scrolling:auto!important'),
 'Safari landscape modals still create a momentum-scrolling hit-test layer');
assert(landscapeCss.includes('html.tv-mode .modal.on>.panel.modal-shell'),
 'landscape modal shells are not fixed directly to the viewport');
assert(landscapeCss.includes('.touch-calibration-marker.corrected'),
 'touch calibration markers are missing');

function verifyTapStartRecovery(){
 const classList=initial=>{
  const values=new Set(initial);
  return{add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
 };
 const listeners={};
 const gate={
  isConnected:true,style:{},
  addEventListener:(type,handler)=>{listeners[type]=handler},
  querySelector:()=>({textContent:''}),
  remove(){this.isConnected=false}
 };
 const title={classList:classList([])},other={classList:classList(['on'])};
 const document={
  body:{classList:classList([])},
  getElementById:id=>id==='tapStartGate'?gate:id==='title'?title:null,
  querySelectorAll:selector=>selector==='.screen.on'?[other]:[]
 };
 const window={setTimeout:handler=>{handler();return 1},addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync(path.join(dist,'boot-recovery.js'),'utf8'),{document,window});
 assert(typeof listeners.touchend==='function','TAP START recovery has no touch handler');
 listeners.touchend();
 assert(!gate.isConnected,'TAP START recovery did not remove the startup gate');
 assert(title.classList.contains('on'),'TAP START recovery did not reveal the title');
 assert(document.body.classList.contains('scene-title'),'TAP START recovery did not restore title state');
}

verifyTapStartRecovery();

async function verifyServer(){
 const server=spawn(process.execPath,[path.join(__dirname,'local-server.cjs')],{
  cwd:root,stdio:['ignore','pipe','pipe']
 });
 try{
  let response;
  for(let attempt=0;attempt<30;attempt++){
   try{response=await fetch('http://127.0.0.1:8119/');if(response.ok)break}catch(e){}
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert(response?.ok,`local server did not return index.html (${response?.status||'no response'})`);
  const html=await response.text();
  assert(html.includes('id="tapStartGate"'),'served page has no TAP START gate');
  assert(html.includes('responsive-shell.js?v=21'),'served page has a stale responsive script version');
  assert(html.includes('responsive-landscape.css?v=23'),'served page has a stale responsive stylesheet version');
 }finally{
  server.kill('SIGTERM');
 }
}

verifyServer().then(()=>{
 console.log(JSON.stringify({
  startupGate:true,
  tapStartRecovery:true,
  titleScreen:true,
  inlineScripts:inlineScripts.length,
  externalScripts:scriptSources.length,
  touchObserverLoop:false,
  protectedCloseButtons:true,
  calibratedCalibrationControls:true,
  centeredHitRepair:true,
  localServer:true
 },null,2));
}).catch(error=>{
 console.error(error.stack||error);
 process.exitCode=1;
});
