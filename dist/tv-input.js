(()=>{'use strict';
const BASE_W=430,BASE_H=932;
const stage=document.getElementById('stage'),ring=document.getElementById('gp-focus-ring'),hint=document.getElementById('hint'),fsBtn=document.getElementById('fullscreen-btn');
const SELECTOR="#newGame,#continueGame,#titleSettingsMenu,.title-hub-grid button:not(:disabled),[data-hub-close],#titleBestiary,#titleCardCodex,#titleRelicCodex,#titleBgmGallery:not(:disabled),#titleCodex,#resetAllData,#resetCancel,#resetConfirm,#modifierClose,#strategyClose,#runModifierBadge,#mapHelpView,#mapHelpClose,#rewardGoldOption,#rewardCardOption,#rewardRelicOption,#rewardContinue,#rewardBack,#skipReward,.boss-relic-choice,.achievement-card:not(:disabled),.market-item:not(:disabled),.node.available,.choice,.card[data-i],.pileBtn,#collectionClose,button:not([disabled]),.codex-card-wrap,[data-setting],[data-filter],[data-tab],a[href]";

function fitStage(){
 const scale=Math.min(window.innerWidth/BASE_W,window.innerHeight/BASE_H)*0.96;
 stage.style.width=BASE_W+'px';stage.style.height=BASE_H+'px';stage.style.transform=`scale(${scale})`;
}
window.addEventListener('resize',fitStage);
fitStage();

fsBtn.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})};

let focusEl=null,gpConnected=false;
function doc(){try{return stage.contentDocument}catch(e){return null}}
function win(){try{return stage.contentWindow}catch(e){return null}}

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
 const r=el.getBoundingClientRect(),f=stage.getBoundingClientRect(),sx=f.width/BASE_W,sy=f.height/BASE_H;
 const left=f.left+r.left*sx,top=f.top+r.top*sy,width=r.width*sx,height=r.height*sy;
 return{left,top,width,height,cx:left+width/2,cy:top+height/2};
}

function updateRing(){
 if(!focusEl||!visible(focusEl)){ring.style.display='none';return}
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
 const list=candidates();
 if(!list.length){focusEl=null;updateRing();return}
 if(focusEl&&list.includes(focusEl))return;
 focusEl=pickDefault(list);updateRing();
}

function moveFocus(dir){
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
 if(best){focusEl=best;updateRing();hint.classList.add('hide')}
}

function doConfirm(){if(!focusEl)return;focusEl.click();hint.classList.add('hide')}
function doBack(){
 const d=doc();if(!d)return;
 const modals=[...d.querySelectorAll('.modal.on')];
 if(modals.length)modals[modals.length-1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:win()}));
}

window.addEventListener('keydown',e=>{
 const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
 if(map[e.key]){e.preventDefault();moveFocus(map[e.key])}
 else if(e.key==='Enter'){e.preventDefault();doConfirm()}
 else if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();doBack()}
});

const heldSince={};
const REPEAT_DELAY=380,REPEAT_RATE=140;
function pollGamepad(){
 const pads=navigator.getGamepads?navigator.getGamepads():[];
 let pad=null;
 for(const p of pads)if(p){pad=p;break}
 if(pad){
  if(!gpConnected){gpConnected=true;hint.textContent='🎮 コントローラー接続中';setTimeout(()=>hint.classList.add('hide'),1800)}
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
 setTimeout(ensureFocus,300);
 try{
  const d=stage.contentDocument;
  const mo=new MutationObserver(()=>{if(rescanQueued)return;rescanQueued=true;requestAnimationFrame(()=>{rescanQueued=false;ensureFocus()})});
  mo.observe(d.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','disabled']});
 }catch(e){}
});

window.abyssTvDebug={candidates,moveFocus,doConfirm,doBack,ensureFocus,get focusEl(){return focusEl}};
})();
