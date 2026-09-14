(()=>{'use strict';
const $=s=>document.querySelector(s);
const KEYS=['fin','scale','bite','dartfish','shell','cleaner','ray','school','ink','puffer','current','heal','electric','octoguard','remora','jelly','tidewall','reefstance','shellgrowth','shoalguard','followbite','moltscale','venombloom','shoalstep','venomfang','toxicarmor','weakambush','scalecharge','hunterfocus','marlin','whale','mimic','tsunami','manta','leviathan','abyssarmor','seamiracle','abyssdance','lantern','voidjaw','coelacanth','shadoweel','cthulhu','curseward','seaurchin','pufferguard','treasuremap','rustkey','harpoon','crackshell','weakpoint','kabutowari'];
KEYS.push(...Object.keys(window.ABYSS_ASCENSION_CARDS||{}));
const PHOTO_ART={
  ink:'assets/cards/plush-ink.webp',
  puffer:'assets/cards/plush-puffer.webp',
  octoguard:'assets/cards/plush-octoguard.webp',
  jelly:'assets/cards/plush-jelly.webp',
  whale:'assets/cards/card-whale-roar.webp',
  voidjaw:'assets/cards/card-voidjaw.webp',
  coelacanth:'assets/cards/plush-coelacanth.webp',
  shadoweel:'assets/cards/plush-shadoweel.webp',
  weakambush:'assets/cards/card-weakambush-hammerhead.webp',
  tidewall:'assets/cards/card-tidewall-bowhead.webp',
  cthulhu:'assets/cards/card-cthulhu-dream.webp',
  marlin:'assets/cards/card-marlin-lance.webp',
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
  ray:'assets/cards/plush-ray.webp',
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
  scalecharge:'assets/cards/plush-scalecharge.webp',
  shoalguard:'assets/cards/plush-shoalguard.webp'
};
function photoOf(k){return PHOTO_ART[keyOf(k)]||''}
function keyOf(k){return String(k||'').replace(/~\d+$/,'').replace(/[+*]+$/,'')}
function data(k,up=false){let getter=window.getAbyssIntrinsicCardStats||window.getAbyssCardStats;return getter?.(keyOf(k)+(up?'+':''))||window.getAbyssCardData?.(keyOf(k))||{n:k,i:'❔',c:0,t:'効果情報なし'} }
function typeOf(k){let c=window.getAbyssCardData?.(keyOf(k))||{};return c.p?'poison':c.b&&c.d?'counter':c.b?'block':c.he?'heal':c.dr||c.en?'flow':c.s||c.def?'power':'attack'}
function art(k,cl='codex-art'){let key=keyOf(k),c=data(key),photo=photoOf(key);return `<div class="${cl}${photo?' plush-photo-art':''}" data-card-art="${key}" data-art-type="${typeOf(key)}"${photo?` style="--card-photo:url('${photo}')"`:''}>${photo?'':`<span>${c.i||'🐟'}</span>`}</div>`}
window.getAbyssCardArtType=typeOf;
window.getAbyssCardArtHtml=art;
function decorate(root=document){root.querySelectorAll?.('.card .art').forEach(a=>{let card=a.closest('.card'),key=keyOf(card?.dataset.k),photo=photoOf(key);if(!key)return;if(a.dataset.decoratedKey===key&&a.classList.contains('card-art'))return;a.dataset.decoratedKey=key;a.className=`art card-art${photo?' plush-photo-art':''}`;a.dataset.cardArt=key;a.dataset.artType=typeOf(key);if(photo){a.style.setProperty('--card-photo',`url('${photo}')`);a.style.removeProperty('background-image');a.innerHTML=''}else{a.style.removeProperty('--card-photo');a.style.removeProperty('background-image');if(!a.querySelector('span'))a.innerHTML=`<span>${data(key).i||'🐟'}</span>`}})}
window.decorateAbyssCardArt=decorate;

let button=$('#titleCardCodex');
if(!button){button=document.createElement('button');button.id='titleCardCodex';button.hidden=true;($('#titleLegacyActions')||document.body).appendChild(button)}
let modal=document.createElement('div');modal.className='modal';modal.id='cardCodexModal';modal.innerHTML=`<div class="panel card-codex-panel modal-shell"><header class="modal-shell-head card-codex-head"><div><small>ABYSS CARD ARCHIVE</small><h2>カード図鑑</h2><p>全${KEYS.length}枚。カードを押すと強化後の表示に切り替わり、もう一度押すと元に戻ります。</p></div></header><div class="modal-shell-body card-codex-body"><div class="codex-filters"><button class="on" data-filter="all">すべて</button><button data-filter="normal">コモン</button><button data-filter="uncommon">アンコモン</button><button data-filter="rare">レア</button><button data-filter="abyss">深淵</button></div><div class="card-codex-grid" id="cardCodexGrid"></div></div><footer class="modal-shell-foot"><button class="btn" id="cardCodexClose">閉じる</button></footer></div>`;document.body.appendChild(modal);
function rarity(c){return c.a?'abyss':c.r?'rare':c.u?'uncommon':'normal'}
function cardFace(k,upgraded=false){let base=data(k),c=data(k,upgraded),r=rarity(base),label=r==='abyss'?'深淵':r==='rare'?'レア':r==='uncommon'?'アンコモン':'コモン',text=String(c.t||'').replace(/^強化済み：/,'');return `${art(k)}<div class="codex-card-body"><span class="codex-cost">${c.c}</span><b>${c.n}</b>${window.ABYSS_ASCENSION_CARDS?.[k]?`<span class="card-unlock-status">${window.isAbyssCardUnlocked(k)?'解放済み':`A${base.unlock}クリアで解放`}</span>`:''}<small>${upgraded?'<em class="codex-upgraded-mark">強化後</em> ':''}</small><p>${text}</p></div>`}
function render(filter='all'){let grid=$('#cardCodexGrid');grid.innerHTML=KEYS.map(k=>{let r=rarity(data(k));if(filter!=='all'&&filter!==r)return'';return `<button class="codex-card ${r}" data-codex-card="${k}" aria-pressed="false">${cardFace(k)}</button>`}).join('');grid.querySelectorAll('.codex-card').forEach(card=>card.onclick=()=>{let upgraded=card.classList.toggle('show-upgrade');card.setAttribute('aria-pressed',String(upgraded));card.innerHTML=cardFace(card.dataset.codexCard,upgraded);window.applyFuri?.(card)});window.applyFuri?.(modal)}
button.onclick=()=>{render();modal.classList.add('on');window.applyFuri?.(modal)};
$('#cardCodexClose').onclick=()=>modal.classList.remove('on');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('on')};
modal.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{modal.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('on',x===b));render(b.dataset.filter)});
let decorateQueued=false;const observer=new MutationObserver(()=>{if(decorateQueued)return;decorateQueued=true;requestAnimationFrame(()=>{decorateQueued=false;decorate(document)})});observer.observe(document.body,{subtree:true,childList:true});decorate(document);window.applyFuri?.($('#title'));
})();
