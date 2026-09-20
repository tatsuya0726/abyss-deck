(()=>{'use strict';
const $=s=>document.querySelector(s);
const KEYS=['abysscurse','fin','scale','bite','rampage','dartfish','shell','cleaner','ray','school','ink','puffer','current','heal','electric','octoguard','remora','jelly','tidewall','reefstance','shellgrowth','shoalguard','followbite','moltscale','venombloom','venomfang','toxicarmor','weakambush','scalecharge','hunterfocus','marlin','whale','mimic','tsunami','manta','leviathan','abyssarmor','seamiracle','predation','abyssdance','lantern','voidjaw','coelacanth','shadoweel','cthulhu','curseward','abyssflame','seaurchin','pufferguard','treasuremap','rustkey','harpoon','crackshell','weakpoint','kabutowari','bettarevenge','overdrive','madness','abysssonar','tideforesight','hungryshoal','recklesscharge','abyssescape','zeroshift','surpriseattack','bloodprice','graverobber','trick','venomfield','invisiblehand','heavybomb'];
KEYS.push(...Object.keys(window.ABYSS_ASCENSION_CARDS||{}));
const PHOTO_ART={
  bettarevenge:'assets/cards/card-betta-revenge.webp',
  zeroshift:'assets/cards/card-zero-shift-v3.webp',surpriseattack:'assets/cards/card-surprise-attack-v5.webp',bloodprice:'assets/cards/card-blood-price.webp',graverobber:'assets/cards/card-grave-robber-v2.webp',heavybomb:'assets/cards/card-heavy-bomb.webp',
  madness:'assets/cards/card-madness.webp',abysssonar:'assets/cards/card-abyss-sonar.webp',tideforesight:'assets/cards/card-rage-v3.webp',hungryshoal:'assets/cards/card-hungry-shoal.webp',recklesscharge:'assets/cards/card-reckless-charge-v3.webp',abyssescape:'assets/cards/card-abyss-escape.webp',
  trick:'assets/cards/card-trick-v2.webp',venomfield:'assets/cards/card-venom-field.webp',invisiblehand:'assets/cards/card-invisible-hand.webp',
  overdrive:'assets/cards/card-overdrive.webp',
  ink:'assets/cards/plush-ink.webp',
  rampage:'assets/cards/plush-rampage.webp',
  puffer:'assets/cards/plush-puffer.webp',
  octoguard:'assets/cards/plush-octoguard.webp',
  jelly:'assets/cards/plush-jelly.webp',
  whale:'assets/cards/card-whale-roar.webp',
  voidjaw:'assets/cards/card-voidjaw.webp',
  coelacanth:'assets/cards/card-ancient-memory-v2.webp',
  shadoweel:'assets/cards/plush-shadoweel.webp',
  weakambush:'assets/cards/plush-weakambush.webp',
  tidewall:'assets/cards/card-tidewall-bowhead.webp',
  cthulhu:'assets/cards/card-cthulhu-dream.webp',
  marlin:'assets/cards/card-multi-thrust-v3.webp',
  tsunami:'assets/cards/card-tsunami-whale.webp',
  manta:'assets/cards/card-manta-dance.webp',
  leviathan:'assets/cards/card-leviathan-dragon.webp',
  abyssdance:'assets/cards/card-abyssdance.webp',
  heal:'assets/cards/plush-heal.webp',
  lantern:'assets/cards/plush-lantern.webp',
  bite:'assets/cards/plush-bite.webp',
  toxicarmor:'assets/cards/plush-toxicarmor.webp',
  shellgrowth:'assets/cards/plush-shellgrowth.webp',
  venomfang:'assets/cards/plush-venomfang.webp',
  shell:'assets/cards/plush-shell.webp',
  ray:'assets/cards/card-ray-counter-v2.webp',
  mimic:'assets/cards/plush-mimic.webp',
  reefstance:'assets/cards/plush-reefstance.webp',
  curseward:'assets/cards/plush-curseward.webp',
  treasuremap:'assets/cards/plush-treasuremap.webp',
  current:'assets/cards/plush-current.webp',
  abyssarmor:'assets/cards/plush-abyssarmor.webp',
  hunterfocus:'assets/cards/plush-hunterfocus.webp',
  moltscale:'assets/cards/plush-moltscale.webp',
  rustkey:'assets/cards/plush-rustkey.webp',
  followbite:'assets/cards/plush-followbite.webp',
  scalecharge:'assets/cards/card-scale-charge-v3.webp',
  shoalguard:'assets/cards/card-shoal-guard-v2.webp',
  abysscurse:'assets/cards/plush-abysscurse.webp',
  fin:'assets/cards/plush-fin.webp',
  scale:'assets/cards/plush-scale.webp',
  dartfish:'assets/cards/plush-dartfish.webp',
  cleaner:'assets/cards/card-cleaner-heal-v2.webp',
  school:'assets/cards/card-school-assault-v2.webp',
  electric:'assets/cards/card-electric-eel-v2.webp',
  remora:'assets/cards/card-remora-power-v2.webp',
  venombloom:'assets/cards/plush-venombloom.webp',
  seamiracle:'assets/cards/plush-seamiracle.webp',
  predation:'assets/cards/plush-predation.webp',
  abyssflame:'assets/cards/plush-abyssflame.webp',
  seaurchin:'assets/cards/plush-seaurchin.webp',
  pufferguard:'assets/cards/plush-pufferguard.webp',
  harpoon:'assets/cards/plush-harpoon.webp',
  crackshell:'assets/cards/plush-crackshell.webp',
  weakpoint:'assets/cards/plush-weakpoint.webp',
  kabutowari:'assets/cards/plush-kabutowari.webp',
  armoredshrimp:'assets/cards/card-cursed-scale-guard.webp',
  sunfishcalm:'assets/cards/plush-sunfishcalm.webp',
  lanternpact:'assets/cards/plush-lanternpact.webp',
  gobysweep:'assets/cards/plush-gobysweep.webp',
  cleanerflow:'assets/cards/plush-cleanerflow.webp',
  nautilusreturn:'assets/cards/plush-nautilusreturn.webp',
  voidtribute:'assets/cards/plush-voidtribute.webp',
  flyingbreath:'assets/cards/card-release-burden-v2.webp'
};
function photoOf(k){return PHOTO_ART[keyOf(k)]||''}
function keyOf(k){return String(k||'').replace(/~\d+$/,'').replace(/[+*]+$/,'')}
function data(k,up=false){let getter=window.getAbyssIntrinsicCardStats||window.getAbyssCardStats;return getter?.(keyOf(k)+(up?'+':''))||window.getAbyssCardData?.(keyOf(k))||{n:k,i:'❔',c:0,t:'効果情報なし'} }
function typeOf(k){let c=window.getAbyssCardData?.(keyOf(k))||{};return c.p?'poison':c.b&&c.d?'counter':c.b?'block':c.he?'heal':c.dr||c.en||c.choice||c.redrawHand?'flow':c.s||c.def?'power':'attack'}
function art(k,cl='codex-art'){let key=keyOf(k),c=data(key),photo=photoOf(key);return `<div class="${cl}${photo?' plush-photo-art':''}" data-card-art="${key}" data-art-type="${typeOf(key)}"${photo?` style="--card-photo:url('${photo}')"`:''}>${photo?'':`<span>${c.i||'🐟'}</span>`}</div>`}
window.getAbyssCardArtType=typeOf;
window.getAbyssCardArtHtml=art;
function decorate(root=document){root.querySelectorAll?.('.card .art').forEach(a=>{let card=a.closest('.card'),key=keyOf(card?.dataset.k),photo=photoOf(key);if(!key)return;if(a.dataset.decoratedKey===key&&a.classList.contains('card-art'))return;a.dataset.decoratedKey=key;a.className=`art card-art${photo?' plush-photo-art':''}`;a.dataset.cardArt=key;a.dataset.artType=typeOf(key);if(photo){a.style.setProperty('--card-photo',`url('${photo}')`);a.style.removeProperty('background-image');a.innerHTML=''}else{a.style.removeProperty('--card-photo');a.style.removeProperty('background-image');if(!a.querySelector('span'))a.innerHTML=`<span>${data(key).i||'🐟'}</span>`}})}
window.decorateAbyssCardArt=decorate;

let button=$('#titleCardCodex');
if(!button){button=document.createElement('button');button.id='titleCardCodex';button.hidden=true;($('#titleLegacyActions')||document.body).appendChild(button)}
let modal=document.createElement('div');modal.className='modal';modal.id='cardCodexModal';modal.innerHTML=`<div class="panel card-codex-panel modal-shell"><header class="modal-shell-head card-codex-head"><div><small>ABYSS CARD ARCHIVE</small><h2>カード図鑑</h2><p>全${KEYS.length}枚。カードを押すと強化後の表示に切り替わり、もう一度押すと元に戻ります。</p><div class="codex-filters"><button class="on" data-filter="all">すべて</button><button data-filter="normal">コモン</button><button data-filter="uncommon">アンコモン</button><button data-filter="rare">レア</button><button data-filter="abyss">深淵</button><button data-filter="special">特殊</button></div></div></header><div class="modal-shell-body card-codex-body"><div class="card-codex-grid unified-card-grid" id="cardCodexGrid"></div></div><footer class="modal-shell-foot"><button class="btn" id="cardCodexClose">閉じる</button></footer></div>`;document.body.appendChild(modal);
function rarity(c){return c.special?'special':c.a?'abyss':c.r?'rare':c.u?'uncommon':'normal'}
function cardFace(k,upgraded=false){let base=data(k),view=window.renderAbyssCardView?.(upgraded?k+'+':k)||'',unlock=window.ABYSS_ASCENSION_CARDS?.[k]?(window.isAbyssCardUnlocked(k)?'解放済み':`A${base.unlock}クリアで解放`):'';return `${view}${unlock?`<span class="codex-unlock-label">${unlock}</span>`:''}${upgraded?'<em class="codex-upgraded-mark">強化後</em>':''}`}
const RARITY_ORDER={normal:0,uncommon:1,rare:2,abyss:3,special:4};
function render(filter='all'){let grid=$('#cardCodexGrid'),keys=filter==='all'?[...KEYS].sort((a,b)=>RARITY_ORDER[rarity(data(a))]-RARITY_ORDER[rarity(data(b))]):KEYS;grid.innerHTML=keys.map(k=>{let r=rarity(data(k));if(filter!=='all'&&filter!==r)return'';return `<button type="button" class="codex-card-wrap" data-codex-card="${k}" aria-pressed="false">${cardFace(k)}</button>`}).join('');grid.querySelectorAll('.codex-card-wrap').forEach(card=>card.onclick=()=>{let upgraded=card.classList.toggle('show-upgrade');card.setAttribute('aria-pressed',String(upgraded));card.innerHTML=cardFace(card.dataset.codexCard,upgraded);window.applyFuri?.(card)});window.applyFuri?.(modal)}
const FILTER_ORDER=['all','normal','uncommon','rare','abyss','special'];
let currentFilter='all';
function setFilter(filter){currentFilter=filter;modal.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('on',x.dataset.filter===filter));render(filter);modal.querySelector(`[data-filter="${filter}"]`)?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}
button.onclick=()=>{setFilter('all');modal.classList.add('on');window.applyFuri?.(modal)};
$('#cardCodexClose').onclick=()=>modal.classList.remove('on');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('on')};
modal.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>setFilter(b.dataset.filter));
let swipeX=0,swipeY=0,swiping=false;const codexBody=modal.querySelector('.card-codex-body');
codexBody.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;swipeX=e.touches[0].clientX;swipeY=e.touches[0].clientY;swiping=true},{passive:true});
codexBody.addEventListener('touchend',e=>{if(!swiping)return;swiping=false;let t=e.changedTouches[0];if(!t)return;let dx=t.clientX-swipeX,dy=t.clientY-swipeY;if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.3)return;let idx=Math.max(0,FILTER_ORDER.indexOf(currentFilter));idx=dx<0?Math.min(FILTER_ORDER.length-1,idx+1):Math.max(0,idx-1);setFilter(FILTER_ORDER[idx])},{passive:true});
let decorateQueued=false;const observer=new MutationObserver(()=>{if(decorateQueued)return;decorateQueued=true;requestAnimationFrame(()=>{decorateQueued=false;decorate(document)})});observer.observe(document.body,{subtree:true,childList:true});decorate(document);window.applyFuri?.($('#title'));
})();
