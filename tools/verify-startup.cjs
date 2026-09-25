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
assert(responsive.includes("root.style.setProperty('--abyss-vv-width',width+'px')"),
 'visual viewport width is not synchronized to the landscape root');
assert(responsive.includes("root.style.setProperty('--abyss-vv-height',height+'px')"),
 'visual viewport height is not synchronized to the landscape root');
assert(!responsive.includes('installLandscapeTouchCalibration'),
 'touch remapping is still installed');
assert(!responsive.includes('abyssLandscapeTouchCalibration'),
 'obsolete touch calibration storage is still active');
assert(!responsive.includes('dispatchingSyntheticClick'),
 'touches can still be resent as synthetic clicks');
const landscapeCss=fs.readFileSync(path.join(dist,'responsive-landscape.css'),'utf8');
const enhanceJs=fs.readFileSync(path.join(dist,'enhance.js'),'utf8');
assert(landscapeCss.includes('width:var(--abyss-vv-width,100%)!important'),
 'landscape root does not use the measured visual viewport width');
assert(landscapeCss.includes('height:var(--abyss-vv-height,100%)!important'),
 'landscape root does not use the measured visual viewport height');
assert(landscapeCss.includes('html.tv-mode .app,\nhtml.tv-mode body.scene-title #title,\nhtml.tv-mode .modal,'),
 'full-screen landscape layers are not kept in one positioning context');
assert(landscapeCss.includes('--abyss-safe-left:max(0px,env(safe-area-inset-left))'),
 'landscape layout does not detect the camera-side safe area');
assert(landscapeCss.includes('right:var(--abyss-safe-right)!important'),
 'landscape windows do not avoid the right-side camera safe area');
assert(landscapeCss.includes('left:var(--abyss-safe-left)!important'),
 'landscape windows do not avoid the left-side camera safe area');
assert(landscapeCss.includes('clamp(48px,14vh,58px)'),
 'installed iPhone landscape has no fallback when safe-area values are zero');
assert(landscapeCss.includes(':is(#multiDeckChoiceModal,#deckChoiceModal,#markSelectModal)>.panel'),
 'landscape card-picking events do not reserve the viewport for cards');
assert(landscapeCss.includes('font-size:clamp(28px,8vh,42px)!important'),
 'landscape card-picking event emblem is still portrait-sized');
assert(landscapeCss.includes('html.tv-mode .modal>.panel{box-sizing:border-box!important;width:100%!important;max-width:100%!important}'),
 'landscape modal panels can still overflow the camera-safe container');
assert(landscapeCss.includes('html.tv-mode #shopGrid{'),
 'landscape shop has no bounded stock scroller');
assert(landscapeCss.includes('html.tv-mode #firstBlessingModal>.panel{'),
 'first blessing has no short-landscape layout');
assert(landscapeCss.includes('html.tv-mode #rewardModal>.reward-panel{'),
 'combat rewards have no short-landscape layout');
assert(landscapeCss.includes('html.tv-mode .modal,\nhtml.tv-mode #tapStartGate{width:auto!important;height:auto!important}'),
 'safe-area landscape modals still retain a conflicting full viewport width');
assert(landscapeCss.includes('html.tv-mode #cardRevealModal>.panel{'),
 'card reveal has no non-scrolling short-landscape layout');
assert(landscapeCss.includes('html.tv-mode .reward-panel .rewardCard{'),
 'reward cards have no readable short-landscape dimensions');
assert(landscapeCss.includes('grid-template-columns:repeat(4,minmax(0,1fr))!important'),
 'short-landscape shop does not keep four products within the safe width');
assert(landscapeCss.includes('html.tv-mode #rewardHome:not([hidden]){'),
 'reward actions are still rendered as full-width banners');
assert(landscapeCss.includes('right:calc(min(126px,25vw) + 20px)!important'),
 'enemy name is not separated from the fixed forecast panel');
assert(enhanceJs.includes('window.playAbyssBattleMusic=playBattleMusic'),
 'battle music has no immediate screen-entry trigger');
assert(index.includes("if(id==='battle'&&G?.enemy)window.playAbyssBattleMusic?.(G.enemy)"),
 'battle screen still waits for DOM observation before changing music');
assert(!landscapeCss.includes('.touch-auto-catcher'),
 'obsolete touch interception overlay is still present');

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
  assert(html.includes('responsive-shell.js?v=24'),'served page has a stale responsive script version');
  assert(html.includes('responsive-landscape.css?v=30'),'served page has a stale responsive stylesheet version');
  assert(html.includes('enhance.js?v=264'),'served page has a stale audio script version');
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
  syntheticTouchRemapping:false,
  visualViewportRoot:true,
  absoluteFullscreenLayers:true,
  localServer:true
 },null,2));
}).catch(error=>{
 console.error(error.stack||error);
 process.exitCode=1;
});
