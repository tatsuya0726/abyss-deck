(()=>{'use strict';
const stage=document.getElementById('stage'),directMode=!stage,ring=document.getElementById('gp-focus-ring'),fsBtn=document.getElementById('fullscreen-btn'),ctrlBtn=document.getElementById('controller-toggle');
let landscapeLayout=matchMedia('(orientation:landscape)').matches||innerWidth>innerHeight;
const stageWrap=document.getElementById('stage-wrap');
function syncStageViewport(){
 const root=document.documentElement;
 const viewport=window.visualViewport;
 const useVisualViewport=viewport&&Math.abs(viewport.scale-1)<.01;
 const width=Math.max(1,Math.round(useVisualViewport?viewport.width:window.innerWidth));
 const height=Math.max(1,Math.round(useVisualViewport?viewport.height:window.innerHeight));
 const phoneUiScale=Math.max(1,Math.min(1.8,height/390));
 root.style.setProperty('--abyss-vv-width',width+'px');
 root.style.setProperty('--abyss-vv-height',height+'px');
 root.style.setProperty('--abyss-phone-ui-scale',phoneUiScale.toFixed(4));
 if(directMode&&landscapeLayout)root.style.setProperty('--abyss-event-height',height+'px');
 else root.style.removeProperty('--abyss-event-height');
 if(directMode){
  return;
 }
 stageWrap.style.setProperty('width',width+'px');
 stageWrap.style.setProperty('height',height+'px');
 stageWrap.style.setProperty('right','auto');
 stageWrap.style.setProperty('bottom','auto');
 stage.style.setProperty('width','100%');
 stage.style.setProperty('height','100%');
}
const SELECTOR="#newGame,#continueGame,#titleSettingsMenu,.title-hub-grid button:not(:disabled),[data-hub-close],#titleBestiary,#titleCardCodex,#titleRelicCodex,#titleBgmGallery:not(:disabled),#titleCodex,#resetAllData,#resetCancel,#resetConfirm,#modifierClose,#strategyClose,#runModifierBadge,#mapHelpView,#mapHelpClose,#rewardGoldOption,#rewardCardOption,#rewardRelicOption,#rewardContinue,#rewardBack,#skipReward,.boss-relic-choice,.achievement-card:not(:disabled),.market-item:not(:disabled),.node.available,.choice,.card[data-i],.pileBtn,#collectionClose,.relic-grid .relic-card,.beast-legacy-grid .beast-card,button:not([disabled]),.codex-card-wrap,[data-setting],[data-filter],[data-tab],a[href]";

fsBtn.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})};

const soundBtn=document.getElementById('sound-toggle');
function syncSoundBtn(){try{let b=doc()?.getElementById('soundBtn');if(!b)return;let on=!b.classList.contains('muted'),buttonText=`♫ 音楽：${on?'ON':'OFF'}`;if(soundBtn.textContent!==buttonText)soundBtn.textContent=buttonText;let label=doc()?.querySelector('#titleTvSound small'),text=`音楽 ${on?'ON':'OFF'}`;if(label&&label.textContent!==text)label.textContent=text}catch(e){}}
soundBtn.onclick=()=>{try{doc()?.getElementById('soundBtn')?.click()}catch(e){}syncSoundBtn()};

const CTRL_KEY='abyssTvControllerEnabled';
let enabled=true;
try{enabled=localStorage.getItem(CTRL_KEY)!=='0'}catch(e){}
function syncControllerUi(){
 const d=doc();if(!d)return;
 d.documentElement.classList.toggle('controller-mode',enabled&&landscapeLayout);
 const end=d.getElementById('endTurn');
 const existingHint=end?.querySelector('.controller-end-hint');
 if(!landscapeLayout){existingHint?.remove();return}
 if(end&&!existingHint){
  const hint=d.createElement('span');hint.className='controller-end-hint';hint.setAttribute('aria-hidden','true');hint.textContent='X';end.prepend(hint);
 }
}
function syncCtrlBtn(){let buttonText=`🎮 コントローラー操作：${enabled?'ON':'OFF'}`;if(ctrlBtn.textContent!==buttonText)ctrlBtn.textContent=buttonText;ctrlBtn.classList.toggle('off',!enabled);let label=doc()?.querySelector('#titleTvController small'),text=`コントローラー ${enabled?'ON':'OFF'}`;if(label&&label.textContent!==text)label.textContent=text;if(!enabled)ring.style.display='none';syncControllerUi()}
syncCtrlBtn();
ctrlBtn.onclick=()=>{enabled=!enabled;try{localStorage.setItem(CTRL_KEY,enabled?'1':'0')}catch(e){}syncCtrlBtn();if(enabled)ensureFocus()};

let focusEl=null,cssInjected=directMode&&!!document.querySelector('link[href*="responsive-landscape.css"]');
function doc(){try{return directMode?document:stage.contentDocument}catch(e){return null}}
function win(){try{return directMode?window:stage.contentWindow}catch(e){return null}}

function installTitleSettings(){
 const d=doc(),grid=d?.querySelector('#titleSettingsModal .settings-hub-grid');if(!grid)return;
 const add=(id,icon,title,detail,action)=>{let b=d.createElement('button');b.id=id;b.type='button';b.className='tv-title-setting';b.innerHTML=`<i>${icon}</i><span><b>${title}</b><small>${detail}</small></span>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();action()});grid.appendChild(b);return b};
 if(!d.getElementById('titleTvSound')){
  add('titleTvSound','♫','音楽','音楽 ON',()=>soundBtn.click());
  add('titleTvController','🎮','コントローラー','コントローラー ON',()=>ctrlBtn.click());
  add('titleTvFullscreen','⛶','フルスクリーン','画面いっぱいに表示',()=>fsBtn.click());
 }
 const hide=!landscapeLayout;d.querySelectorAll('.tv-title-setting').forEach(b=>{if(b.hidden!==hide)b.hidden=hide});
 syncSoundBtn();syncCtrlBtn();
}
function syncOrientationLayout(){
 const d=doc();if(!d)return;
 landscapeLayout=matchMedia('(orientation:landscape)').matches||innerWidth>innerHeight;
 d.documentElement.classList.toggle('tv-mode',landscapeLayout);
 syncControllerUi();
 installTitleSettings();
 if(!landscapeLayout){focusEl=null;ring.style.display='none'}
 else ensureFocus();
 clearTimeout(syncOrientationLayout._bgmTimer);
 syncOrientationLayout._bgmTimer=setTimeout(()=>win()?.resyncAbyssBgmForCurrentScreen?.(),140);
}

function injectLandscapeCss(){
 const d=doc();if(!d)return;
 if(!cssInjected){
  try{
   const link=d.createElement('link');
   link.rel='stylesheet';link.href='responsive-landscape.css?v=45';
   d.head.appendChild(link);cssInjected=true;
  }catch(e){}
 }
 if(!d.querySelector('link[data-abyss-event-layout]')){
  const events=d.createElement('link');
  events.rel='stylesheet';events.href='responsive-events.css?v=1';
  events.dataset.abyssEventLayout='1';d.head.appendChild(events);
 }
 if(!d.querySelector('link[data-abyss-desktop-layout],link[href*="responsive-desktop.css"]')){
  const desktop=d.createElement('link');
  desktop.rel='stylesheet';desktop.href='responsive-desktop.css?v=8';
  desktop.dataset.abyssDesktopLayout='1';d.head.appendChild(desktop);
 }
}

/* The enemy's intent panel should always line up with the enemy's name label,
   whatever the viewport size or creature art does to the surrounding layout.
   Rather than keep guessing a static top offset in CSS, read the name's real
   position every frame and pin the panel's vertical center to it directly.
   #battle picks up a residual (identity) transform matrix from motion.css's
   screen-transition animation even once it's finished — and any transform,
   even a no-op one, makes that element the containing block for its
   position:fixed descendants instead of the real viewport. So #intent's
   `top` ends up relative to #battle's box, not the viewport; subtract
   #battle's own viewport offset to compensate. */
function visibleEnemyLeft(enemyLeft,nameLeft,viewportWidth){const nameInset=Math.max(34,Math.min(44,viewportWidth*.045));return Math.max(enemyLeft,nameLeft-nameInset)}
function visiblePcEnemyLeft(enemyLeft,nameLeft,viewportWidth){const nameInset=Math.max(76,Math.min(112,viewportWidth*.055));return Math.max(enemyLeft,nameLeft-nameInset)}
function intentCenterBeforeEnemy(enemyLeft,intentWidth){return Math.max(intentWidth/2+8,enemyLeft-intentWidth/2)}
function intentPlacementBetweenFighters(playerRight,enemyLeft,preferredWidth,viewportWidth){
 const margin=Math.max(6,Math.min(10,viewportWidth*.01)),left=Math.max(margin,playerRight+margin),right=Math.min(viewportWidth-margin,enemyLeft-margin),available=Math.max(1,right-left),width=Math.min(preferredWidth,available);
 return{center:left+available/2,width};
}
function intentPlacementBeforeEnemy(playerRight,enemyLeft,preferredWidth,viewportWidth){
 const margin=Math.max(10,Math.min(16,viewportWidth*.01)),left=Math.max(margin,playerRight+margin),right=Math.min(viewportWidth-margin,enemyLeft-margin),available=Math.max(1,right-left),width=Math.min(preferredWidth,available);
 return{center:right-width/2,width};
}
function syncIntentPosition(){
 const d=doc();if(!d)return;
 const nameEl=d.getElementById('enemyName'),intentEl=d.getElementById('intent'),battleEl=d.getElementById('battle'),enemyEl=d.getElementById('enemySprite'),playerEl=d.getElementById('playerSprite');
 if(!intentEl)return;
 if(!landscapeLayout){intentEl.style.removeProperty('top');intentEl.style.removeProperty('left');intentEl.style.removeProperty('width');intentEl.style.removeProperty('transform');return}
 const fixedPcForecast=matchMedia?.('(hover:hover) and (pointer:fine) and (min-width:1000px) and (min-height:600px)')?.matches;
 if(fixedPcForecast){intentEl.style.removeProperty('top');intentEl.style.removeProperty('left');intentEl.style.removeProperty('width');intentEl.style.removeProperty('transform');return}
 if(!nameEl||!battleEl)return;
 const r=nameEl.getBoundingClientRect();
 if(!r.height)return;
 const battleRect=battleEl.getBoundingClientRect(),transformed=getComputedStyle(battleEl).transform!=='none';
 const containerTop=transformed?battleRect.top:0;
 const hudBottom=d.querySelector('.hud')?.getBoundingClientRect().bottom||0;
 const handTop=d.querySelector('.handArea')?.getBoundingClientRect().top||innerHeight;
 const intentHeight=Math.max(1,intentEl.getBoundingClientRect().height||intentEl.offsetHeight||1);
 const minCenter=Math.max(battleRect.top,hudBottom)+8+intentHeight/2;
 const maxCenter=Math.max(minCenter,Math.min(battleRect.bottom,handTop)-8-intentHeight/2);
 const center=Math.max(minCenter,Math.min(maxCenter,r.top+r.height/2));
 const enemyRect=enemyEl?.getBoundingClientRect(),playerRect=playerEl?.getBoundingClientRect(),intentWidth=Math.max(1,intentEl.getBoundingClientRect().width||intentEl.offsetWidth||1);
 if(enemyRect?.width){
  const containerLeft=transformed?battleRect.left:0,coarse=matchMedia?.('(pointer:coarse)')?.matches||navigator.maxTouchPoints>0;
  let centerX;
  if(coarse&&playerRect?.width){
   const preferredWidth=Math.min(136,innerWidth*.25),placement=intentPlacementBetweenFighters(playerRect.right,enemyRect.left,preferredWidth,innerWidth);
   centerX=placement.center;intentEl.style.setProperty('width',placement.width+'px','important');
  }else if(playerRect?.width){
   const visibleLeft=visiblePcEnemyLeft(enemyRect.left,r.left,innerWidth),preferredWidth=Math.max(210,Math.min(260,innerWidth*.14)),placement=intentPlacementBeforeEnemy(playerRect.right,visibleLeft,preferredWidth,innerWidth);
   centerX=placement.center;intentEl.style.setProperty('width',placement.width+'px','important');
  }else{
   const visibleLeft=visibleEnemyLeft(enemyRect.left,r.left,innerWidth);centerX=intentCenterBeforeEnemy(visibleLeft,intentWidth,innerWidth);
   intentEl.style.removeProperty('width');
  }
  intentEl.style.setProperty('left',(centerX-containerLeft)+'px','important');
 }
 intentEl.style.setProperty('top',(center-containerTop)+'px','important');
 intentEl.style.setProperty('transform','translate(-50%,-50%)','important');
}

function visible(el){
 if(!el)return false;
 if(el.matches?.(':disabled,[hidden]'))return false;
 if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')return false;
 const modal=el.closest?.('.modal');
 if(modal&&!modal.classList.contains('on'))return false;
 if(!modal){const screen=el.closest?.('.screen');if(screen&&!screen.classList.contains('on'))return false}
 const rect=el.getBoundingClientRect();
 return rect.width>0&&rect.height>0;
}

/* Reject an imprecise native touch click; never forward it to another button.
   Some touch browsers expand targets into the gap between adjacent choices.
   Compare the original finger position with this button's current border box. */
function installLandscapeTapGuard(){
 const d=doc();if(!d||d.__abyssTapGuardInstalled)return;
 d.__abyssTapGuardInstalled=true;
 const scopeSelector='#eventModal.on,#mapChoiceModal.on';
 const actionSelector='#eventModal .choice,#mapChoiceModal .choice,#eventQuickNav button';
 let gesture=null,lastTouch=null;
 d.addEventListener('touchstart',e=>{
  lastTouch=null;
  const modal=e.target.closest?.(scopeSelector);
  if(!d.documentElement.classList.contains('tv-mode')||!modal||e.touches.length!==1){gesture=null;return}
  const t=e.touches[0];gesture={id:t.identifier,x:t.clientX,y:t.clientY,modal,moved:false};
 },{capture:true,passive:true});
 d.addEventListener('touchmove',e=>{
  if(!gesture)return;
  const t=Array.from(e.touches).find(t=>t.identifier===gesture.id);
  if(!t||e.touches.length!==1||Math.hypot(t.clientX-gesture.x,t.clientY-gesture.y)>10)gesture.moved=true;
 },{capture:true,passive:true});
 d.addEventListener('touchend',e=>{
  if(!gesture)return;
  const t=Array.from(e.changedTouches).find(t=>t.identifier===gesture.id);
  if(t)lastTouch={x:t.clientX,y:t.clientY,at:Date.now(),modal:gesture.modal,
   moved:gesture.moved||Math.hypot(t.clientX-gesture.x,t.clientY-gesture.y)>10};
  gesture=null;
 },{capture:true,passive:true});
 d.addEventListener('touchcancel',()=>{gesture=null;lastTouch=null},{capture:true,passive:true});
 d.addEventListener('click',e=>{
  const touch=lastTouch;
  if(!e.isTrusted||!touch||e.detail===0||Date.now()-touch.at>800)return;
  if((e.pointerType&&e.pointerType!=='touch')||e.sourceCapabilities?.firesTouchEvents===false)return;
  lastTouch=null;
  if(!d.documentElement.classList.contains('tv-mode'))return;
  const button=e.target.closest?.(actionSelector);if(!button)return;
  const r=button.getBoundingClientRect();
  const x=touch.x,y=touch.y;
  const inside=x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
  if(touch.moved||!inside||button.closest(scopeSelector)!==touch.modal){
   e.preventDefault();e.stopImmediatePropagation();
  }
 },{capture:true});
}

function candidates(){
 const d=doc();if(!d)return[];
 const modals=[...d.querySelectorAll('.modal.on')];
 const scope=modals.length?modals[modals.length-1]:d;
 return[...scope.querySelectorAll(SELECTOR)].filter(visible);
}

function rectOf(el){
 const r=el.getBoundingClientRect(),f=directMode?{left:0,top:0}:stage.getBoundingClientRect();
 const left=f.left+r.left,top=f.top+r.top;
 return{left,top,width:r.width,height:r.height,cx:left+r.width/2,cy:top+r.height/2};
}

function updateRing(){
 if(!landscapeLayout||!enabled||activeAdvanceOverlay()||!focusEl||!visible(focusEl)){ring.style.display='none';return}
 const r=rectOf(focusEl);
 ring.style.display='block';
 ring.style.left=(r.left-4)+'px';ring.style.top=(r.top-4)+'px';ring.style.width=(r.width+8)+'px';ring.style.height=(r.height+8)+'px';
}

function activeAdvanceOverlay(){
 const d=doc();if(!d)return null;
 return d.querySelector('#tapStartGate,.story-reveal.on,.abyss-gate-reveal.on');
}

const PRIORITY_GROUPS=['.node.available','.card[data-i]','.choice,.boss-relic-choice','#newGame,#continueGame','.achievement-card:not(:disabled),.market-item:not(:disabled)'];
function pickDefault(list){
 for(const sel of PRIORITY_GROUPS){const hit=list.find(el=>el.matches?.(sel));if(hit)return hit}
 return list[0];
}
function ensureFocus(){
 if(!landscapeLayout||!enabled){focusEl=null;updateRing();return}
 if(activeAdvanceOverlay()){focusEl=null;updateRing();return}
 const list=candidates();
 if(!list.length){focusEl=null;updateRing();return}
 if(focusEl&&list.includes(focusEl))return;
 focusEl=pickDefault(list);updateRing();
}

let bandMemory={top:null,bottom:null};
function focusBand(el){return el?.closest?.('.hud')||el?.matches?.('.quick-nav button,.suspend-run,#mapHelpView')?'top':'bottom'}
function toggleFocusBand(){
 if(!enabled||activeAdvanceOverlay())return;
 const list=candidates(),top=list.filter(el=>focusBand(el)==='top'),bottom=list.filter(el=>focusBand(el)==='bottom');
 if(!top.length||!bottom.length)return;
 const from=focusEl&&list.includes(focusEl)?focusEl:null,fromBand=focusBand(from),nextBand=fromBand==='top'?'bottom':'top',pool=nextBand==='top'?top:bottom;
 if(from)bandMemory[fromBand]=from;
 let target=bandMemory[nextBand];
 if(!target||!pool.includes(target)){
  const fromRect=from?rectOf(from):null;
  target=pool.slice().sort((a,b)=>{
   if(!fromRect)return 0;
   return Math.abs(rectOf(a).cx-fromRect.cx)-Math.abs(rectOf(b).cx-fromRect.cx);
  })[0];
 }
 if(target){focusEl=target;bandMemory[nextBand]=target;revealFocus(target);updateRing()}
}

function scrollParent(el){
 const d=doc();
 for(let p=el?.parentElement;p&&p!==d?.body;p=p.parentElement){const s=getComputedStyle(p);if(/auto|scroll/.test(s.overflowY+s.overflowX)&&(p.scrollHeight>p.clientHeight+2||p.scrollWidth>p.clientWidth+2))return p}
 const modals=[...(d?.querySelectorAll('.modal.on')||[])],activeModal=modals[modals.length-1];
 return activeModal?.querySelector('.modal-shell-body,.panel')||d?.querySelector('#map.on .path,#battle.on .hand');
}
function revealFocus(el){
 if(!el)return;
 try{el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'})}catch(e){el.scrollIntoView(false)}
 requestAnimationFrame(updateRing);
}
function scrollActive(amount){
 const d=doc();if(!d)return false;
 let target=null,eventModal=d.querySelector('#eventModal.on,#mapChoiceModal.on');
 if(eventModal){
  const focusedRegion=focusEl?.closest?.('#eventChoices,#eventText,#mapChoiceButtons,#mapChoiceText');
  const eventTargets=[focusedRegion,eventModal.querySelector('.choices'),eventModal.querySelector('#eventText,#mapChoiceText')].filter(Boolean);
  target=eventTargets.find(el=>el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)||null;
 }
 if(!target){
  const modals=[...d.querySelectorAll('.modal.on')],activeModal=modals[modals.length-1];
  const modalTargets=[focusEl?.closest?.('.modal-shell-body'),activeModal?.querySelector('.modal-shell-body'),activeModal?.querySelector('.panel')].filter(Boolean);
  target=modalTargets.find(el=>el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)||null;
 }
 if(!target)target=scrollParent(focusEl);
 if(!target){const modal=[...d.querySelectorAll('.modal.on')].pop();target=modal?.querySelector('.modal-shell-body,.panel')||d.querySelector('#map.on .path,#battle.on .hand,.screen.on')}
 if(!target)return false;
 const vertical=target.scrollHeight>target.clientHeight+2;
 if(vertical)target.scrollBy({top:amount,behavior:'auto'});else if(target.scrollWidth>target.clientWidth+2)target.scrollBy({left:amount,behavior:'auto'});else return false;
 requestAnimationFrame(updateRing);return true;
}

let mapPositionQueued=false;
function positionMapByProgress(){
 const d=doc(),map=d?.getElementById('map'),path=d?.getElementById('path'),track=d?.getElementById('pathTrack');
 if(!landscapeLayout||!map?.classList.contains('on')||!path||!track)return;
 track.style.marginTop='0px';track.style.marginBottom='0px';
 const current=track.querySelector('.node.current');
 if(!current){path.scrollTop=0;return}
 const topPercent=Math.max(0,Math.min(100,parseFloat(current.style.top)||0))/100;
 const maxScroll=Math.max(0,track.scrollHeight-path.clientHeight);
 const progress=topPercent<=.12?0:topPercent>=.88?1:topPercent;
 path.scrollTop=Math.round(maxScroll*progress);
}
function queueMapPosition(){
 if(mapPositionQueued)return;mapPositionQueued=true;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{mapPositionQueued=false;positionMapByProgress()}));
}
function installMapProgressPositioning(){
 const d=doc(),track=d?.getElementById('pathTrack');if(!track||track.__abyssProgressPositioning)return;
 track.__abyssProgressPositioning=true;
 new MutationObserver(queueMapPosition).observe(track,{childList:true});
}
function installMapNodeLegend(){
 const d=doc(),head=d?.querySelector('#map>.mapHead');if(!head||d.getElementById('mapNodeLegend'))return;
 const legend=d.createElement('div');legend.id='mapNodeLegend';legend.className='map-node-legend';legend.setAttribute('aria-label','マスの種類');
 legend.innerHTML='<span><i>⚔️</i><b>通常戦</b></span><span><i>💀</i><b>エリート</b></span><span><i>?</i><b>イベント</b></span><span><i class="legend-abyss"><em></em></i><b>深海異変</b></span><span><i>🪸</i><b>休憩</b></span><span><i>🎁</i><b>宝箱</b></span><span><i>🐚</i><b>ショップ</b></span><span><i>👑</i><b>ボス</b></span>';
 head.appendChild(legend);
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
 if(best){focusEl=best;revealFocus(best);updateRing()}
 else if(dir==='up'||dir==='down')scrollActive(dir==='up'?-110:110);
}

let pendingHandFocusIndex=null;
function settleCardPlayFocus(){
 if(pendingHandFocusIndex==null)return false;
 const d=doc();if(!d)return false;
 if(d.querySelector('.modal.on'))return false;
 const battle=d.getElementById('battle');
 if(!battle?.classList.contains('on')){pendingHandFocusIndex=null;return false}
 const cards=[...d.querySelectorAll('#battle.on #hand .card[data-i]')];
 if(!cards.length){pendingHandFocusIndex=null;return false}
 const target=cards[Math.min(pendingHandFocusIndex,cards.length-1)];
 pendingHandFocusIndex=null;focusEl=target;bandMemory.bottom=target;revealFocus(target);updateRing();return true;
}
function doConfirm(){
 if(!enabled)return;
 const overlay=activeAdvanceOverlay();if(overlay){ring.style.display='none';overlay.click();return}
 if(focusEl?.matches?.('#hand .card[data-i]'))pendingHandFocusIndex=Math.max(0,(Number(focusEl.dataset.i)||0)-1);
 if(focusEl)focusEl.click();
}
function doBack(){
 if(!enabled)return;
 const d=doc();if(!d)return;
 const modals=[...d.querySelectorAll('.modal.on')];
 const topModal=modals[modals.length-1];
 const shopBack=topModal?.matches?.('#shopModal')?topModal.querySelector('.shop-choose #shopBack'):null;
 if(shopBack&&visible(shopBack)){focusEl=shopBack;shopBack.click();requestAnimationFrame(()=>{ensureFocus();updateRing()});return}
 if(modals.length)modals[modals.length-1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:win()}));
}
let returnToFirstCardAfterTurn=false;
function settleTurnFocus(){
 if(!returnToFirstCardAfterTurn)return false;
 const d=doc(),battle=d?.getElementById('battle'),end=d?.getElementById('endTurn');
 if(!battle?.classList.contains('on')){returnToFirstCardAfterTurn=false;return false}
 if(end?.disabled){focusEl=null;ring.style.display='none';return true}
 const first=d.querySelector('#battle.on #hand .card[data-i]');
 if(!first)return true;
 returnToFirstCardAfterTurn=false;focusEl=first;bandMemory.bottom=first;revealFocus(first);updateRing();return true;
}
function doEndTurn(){
 if(!enabled)return;
 const d=doc(),battle=d?.getElementById('battle'),end=d?.getElementById('endTurn');
 if(!battle?.classList.contains('on')||!end||end.disabled||d.querySelector('.modal.on'))return;
 focusEl=end;bandMemory.bottom=end;revealFocus(end);updateRing();returnToFirstCardAfterTurn=true;
 requestAnimationFrame(()=>{if(!end.disabled)end.click()});
}

window.addEventListener('keydown',e=>{
 if(!landscapeLayout||!enabled)return;
 const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
 if(map[e.key]){e.preventDefault();moveFocus(map[e.key])}
 else if(e.key==='Enter'){e.preventDefault();doConfirm()}
 else if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();doBack()}
 else if(e.key.toLowerCase()==='x'){e.preventDefault();doEndTurn()}
 else if(e.key.toLowerCase()==='y'){e.preventDefault();toggleFocusBand()}
});

const heldSince={};
const REPEAT_DELAY=380,REPEAT_RATE=140;
let lastLayoutSync=0;
function pollGamepad(frameTime=0){
 if(!landscapeLayout||!enabled){ring.style.display='none';requestAnimationFrame(pollGamepad);return}
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
  if(pad.buttons[2]?.pressed){if(!heldSince.x){heldSince.x=true;doEndTurn()}}else heldSince.x=false;
  if(pad.buttons[3]?.pressed){if(!heldSince.y){heldSince.y=true;toggleFocusBand()}}else heldSince.y=false;
  const scrollAxis=Math.abs(pad.axes[3]||0)>.32?(pad.axes[3]||0):0;
  const scrollButtons=(pad.buttons[5]?.pressed?1:0)-(pad.buttons[4]?.pressed?1:0);
  if(scrollAxis||scrollButtons)scrollActive((scrollAxis||scrollButtons)*12);
 }
 if(frameTime-lastLayoutSync>=120){
  lastLayoutSync=frameTime;
  if(!settleCardPlayFocus()&&!settleTurnFocus())ensureFocus();
  updateRing();
  syncIntentPosition();
 }
 requestAnimationFrame(pollGamepad);
}
requestAnimationFrame(pollGamepad);

let rescanQueued=false;
function initializeResponsive(){
 landscapeLayout=matchMedia('(orientation:landscape)').matches||innerWidth>innerHeight;
 try{if(landscapeLayout)win().localStorage.setItem('abyssA2hsSeen','1')}catch(e){}
 injectLandscapeCss();
 installLandscapeTapGuard();
 installMapProgressPositioning();
 installMapNodeLegend();
 installTitleSettings();
 syncOrientationLayout();
 syncSoundBtn();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!directMode)stage.classList.add('ready');ensureFocus()}));
 try{
  const d=doc();
  const mo=new MutationObserver(()=>{installTitleSettings();syncSoundBtn();syncControllerUi();if(rescanQueued)return;rescanQueued=true;requestAnimationFrame(()=>{rescanQueued=false;ensureFocus()})});
  mo.observe(d.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','disabled']});
 }catch(e){}
}
if(directMode){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeResponsive,{once:true});
 else initializeResponsive();
}else stage.addEventListener('load',initializeResponsive);
const handleOrientation=()=>{
 syncOrientationLayout();
 syncStageViewport();
 syncIntentPosition();
 updateRing();
 queueMapPosition();
};
syncStageViewport();
window.addEventListener('resize',handleOrientation,{passive:true});
window.addEventListener('pageshow',handleOrientation,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(handleOrientation,80),{passive:true});
window.visualViewport?.addEventListener('resize',handleOrientation,{passive:true});
window.visualViewport?.addEventListener('scroll',syncStageViewport,{passive:true});

window.abyssResponsiveDebug={candidates,moveFocus,toggleFocusBand,doConfirm,doBack,doEndTurn,scrollActive,positionMapByProgress,ensureFocus,get focusEl(){return focusEl},get enabled(){return enabled},setEnabled(v){enabled=v;syncCtrlBtn();if(enabled)ensureFocus();else updateRing()}};
})();
