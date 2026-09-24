(()=>{'use strict';
const stage=document.getElementById('stage'),ring=document.getElementById('gp-focus-ring'),fsBtn=document.getElementById('fullscreen-btn'),ctrlBtn=document.getElementById('controller-toggle');
const settingsBtn=document.getElementById('tv-settings-btn'),settingsPanel=document.getElementById('tv-settings-panel'),settingsBackdrop=document.getElementById('tv-settings-backdrop');
function setSettingsOpen(open){settingsPanel.hidden=!open;settingsBackdrop.classList.toggle('on',open)}
settingsBtn.onclick=e=>{e.stopPropagation();setSettingsOpen(settingsPanel.hidden)};
settingsBackdrop.onclick=()=>setSettingsOpen(false);
document.addEventListener('click',e=>{if(!settingsPanel.hidden&&!settingsPanel.contains(e.target)&&e.target!==settingsBtn)setSettingsOpen(false)});
const SELECTOR="#newGame,#continueGame,#titleSettingsMenu,.title-hub-grid button:not(:disabled),[data-hub-close],#titleBestiary,#titleCardCodex,#titleRelicCodex,#titleBgmGallery:not(:disabled),#titleCodex,#resetAllData,#resetCancel,#resetConfirm,#modifierClose,#strategyClose,#runModifierBadge,#mapHelpView,#mapHelpClose,#rewardGoldOption,#rewardCardOption,#rewardRelicOption,#rewardContinue,#rewardBack,#skipReward,.boss-relic-choice,.achievement-card:not(:disabled),.market-item:not(:disabled),.node.available,.choice,.card[data-i],.pileBtn,#collectionClose,button:not([disabled]),.codex-card-wrap,[data-setting],[data-filter],[data-tab],a[href]";

fsBtn.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})};

const soundBtn=document.getElementById('sound-toggle');
function syncSoundBtn(){try{let b=doc()?.getElementById('soundBtn');if(b)soundBtn.textContent=`♫ 音楽：${b.classList.contains('muted')?'OFF':'ON'}`}catch(e){}}
soundBtn.onclick=()=>{try{doc()?.getElementById('soundBtn')?.click()}catch(e){}syncSoundBtn()};

const CTRL_KEY='abyssTvControllerEnabled';
let enabled=true;
try{enabled=localStorage.getItem(CTRL_KEY)!=='0'}catch(e){}
function syncCtrlBtn(){ctrlBtn.textContent=`🎮 コントローラー操作：${enabled?'ON':'OFF'}`;ctrlBtn.classList.toggle('off',!enabled);if(!enabled)ring.style.display='none'}
syncCtrlBtn();
ctrlBtn.onclick=()=>{enabled=!enabled;try{localStorage.setItem(CTRL_KEY,enabled?'1':'0')}catch(e){}syncCtrlBtn();if(enabled)ensureFocus()};

let focusEl=null,cssInjected=false;
function doc(){try{return stage.contentDocument}catch(e){return null}}
function win(){try{return stage.contentWindow}catch(e){return null}}

function injectLandscapeCss(){
 const d=doc();if(!d||cssInjected)return;
 try{
  d.documentElement.classList.add('tv-mode');
  const link=d.createElement('link');
  link.rel='stylesheet';link.href='tv-landscape.css?v=8';
  d.head.appendChild(link);
  cssInjected=true;
 }catch(e){}
}

function visible(el){
 if(!el)return false;
 if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')return false;
 const modal=el.closest?.('.modal');
 if(modal&&!modal.classList.contains('on'))return false;
 if(!modal){const screen=el.closest?.('.screen');if(screen&&!screen.classList.contains('on'))return false}
 const rect=el.getBoundingClientRect();
 return rect.width>0&&rect.height>0;
}

function candidates(){
 const d=doc();if(!d)return[];
 const modals=[...d.querySelectorAll('.modal.on')];
 const scope=modals.length?modals[modals.length-1]:d;
 return[...scope.querySelectorAll(SELECTOR)].filter(visible);
}

function rectOf(el){
 const r=el.getBoundingClientRect(),f=stage.getBoundingClientRect();
 const left=f.left+r.left,top=f.top+r.top;
 return{left,top,width:r.width,height:r.height,cx:left+r.width/2,cy:top+r.height/2};
}

function updateRing(){
 if(!enabled||!focusEl||!visible(focusEl)){ring.style.display='none';return}
 const r=rectOf(focusEl);
 ring.style.display='block';
 ring.style.left=(r.left-4)+'px';ring.style.top=(r.top-4)+'px';ring.style.width=(r.width+8)+'px';ring.style.height=(r.height+8)+'px';
}

const PRIORITY_GROUPS=['.node.available','.card[data-i]','.choice,.boss-relic-choice','#newGame,#continueGame','.achievement-card:not(:disabled),.market-item:not(:disabled)'];
function pickDefault(list){
 for(const sel of PRIORITY_GROUPS){const hit=list.find(el=>el.matches?.(sel));if(hit)return hit}
 return list[0];
}
function ensureFocus(){
 if(!enabled)return;
 const list=candidates();
 if(!list.length){focusEl=null;updateRing();return}
 if(focusEl&&list.includes(focusEl))return;
 focusEl=pickDefault(list);updateRing();
}

function moveFocus(dir){
 if(!enabled)return;
 const list=candidates();
 if(!list.length){focusEl=null;return}
 if(!focusEl||!list.includes(focusEl)){focusEl=pickDefault(list);updateRing();return}
 const cur=rectOf(focusEl);
 let best=null,bestScore=Infinity;
 for(const el of list){
  if(el===focusEl)continue;
  const r=rectOf(el),dx=r.cx-cur.cx,dy=r.cy-cur.cy;
  let ok,primary,ortho;
  if(dir==='down'){ok=dy>4;primary=dy;ortho=Math.abs(dx)}
  else if(dir==='up'){ok=dy<-4;primary=-dy;ortho=Math.abs(dx)}
  else if(dir==='right'){ok=dx>4;primary=dx;ortho=Math.abs(dy)}
  else{ok=dx<-4;primary=-dx;ortho=Math.abs(dy)}
  if(!ok)continue;
  const score=primary+ortho*2.2;
  if(score<bestScore){bestScore=score;best=el}
 }
 if(best){focusEl=best;updateRing()}
}

function doConfirm(){if(!enabled||!focusEl)return;focusEl.click()}
function doBack(){
 if(!enabled)return;
 const d=doc();if(!d)return;
 const modals=[...d.querySelectorAll('.modal.on')];
 if(modals.length)modals[modals.length-1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:win()}));
}

window.addEventListener('keydown',e=>{
 if(!enabled)return;
 const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
 if(map[e.key]){e.preventDefault();moveFocus(map[e.key])}
 else if(e.key==='Enter'){e.preventDefault();doConfirm()}
 else if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();doBack()}
});

const heldSince={};
const REPEAT_DELAY=380,REPEAT_RATE=140;
function pollGamepad(){
 if(!enabled){requestAnimationFrame(pollGamepad);return}
 const pads=navigator.getGamepads?navigator.getGamepads():[];
 let pad=null;
 for(const p of pads)if(p){pad=p;break}
 if(pad){
  const now=performance.now();
  const dirs=[
   ['up',!!pad.buttons[12]?.pressed||pad.axes[1]<-0.5],
   ['down',!!pad.buttons[13]?.pressed||pad.axes[1]>0.5],
   ['left',!!pad.buttons[14]?.pressed||pad.axes[0]<-0.5],
   ['right',!!pad.buttons[15]?.pressed||pad.axes[0]>0.5]
  ];
  for(const[dir,pressed]of dirs){
   if(pressed){
    if(!heldSince[dir]){heldSince[dir]=now;heldSince[dir+'_r']=now;moveFocus(dir)}
    else if(now-heldSince[dir]>REPEAT_DELAY&&now-heldSince[dir+'_r']>REPEAT_RATE){heldSince[dir+'_r']=now;moveFocus(dir)}
   }else{heldSince[dir]=0;heldSince[dir+'_r']=0}
  }
  if(pad.buttons[0]?.pressed){if(!heldSince.a){heldSince.a=true;doConfirm()}}else heldSince.a=false;
  if(pad.buttons[1]?.pressed){if(!heldSince.b){heldSince.b=true;doBack()}}else heldSince.b=false;
 }
 ensureFocus();
 updateRing();
 requestAnimationFrame(pollGamepad);
}
requestAnimationFrame(pollGamepad);

let rescanQueued=false;
stage.addEventListener('load',()=>{
 try{stage.contentWindow.localStorage.setItem('abyssA2hsSeen','1')}catch(e){}
 injectLandscapeCss();
 syncSoundBtn();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{stage.classList.add('ready');ensureFocus()}));
 try{
  const d=stage.contentDocument;
  const mo=new MutationObserver(()=>{syncSoundBtn();if(rescanQueued)return;rescanQueued=true;requestAnimationFrame(()=>{rescanQueued=false;ensureFocus()})});
  mo.observe(d.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','disabled']});
 }catch(e){}
});
window.addEventListener('resize',()=>{ensureFocus();updateRing()});

window.abyssTvDebug={candidates,moveFocus,doConfirm,doBack,ensureFocus,get focusEl(){return focusEl},get enabled(){return enabled},setEnabled(v){enabled=v;syncCtrlBtn();if(enabled)ensureFocus();else updateRing()}};
})();
