(()=>{'use strict';
const KEY='abyssAscensionMeta',BACKUP='abyssAscensionMetaBackup';
const RANKS=[
 ['静かな入口','変化なし。深淵への最初の挑戦。','◌','水面の光が、まだ届いていた。'],
 ['薄れる恩恵','ボスを倒した時の回復量が最大HPの80%になる。','恵','満ちるはずの光が、静かに削られていく。'],
 ['精鋭の甲殻','エリートのHPが5%増える。','◆','強者の殻には、古い傷が刻まれている。'],
 ['飢えた深み','敵と宝箱から得られるゴールドが20%減る。','飢','満ちるはずの財も、闇に呑まれていく。'],
 ['浅い呼吸','最大HPが5少ない状態で始まる。','泡','吐いた泡の一つ一つに、記憶が宿った。'],
 ['増える脅威','エリートの出現率が上がる。','脅','深く進むほど、影はいっそう色濃くなる。'],
 ['色褪せる恵み','レアカードや強化済みカードが出現しにくくなる。','褪','貴重な煌めきは、深淵の中でますます見えづらくなる。'],
 ['研がれた牙','敵の攻撃が1増える。','牙','深海の牙は、光ではなく恐怖を噛む。'],
 ['王の巨体','ボスのHPが10%増える。','冠','海の王は、自らの名を忘れてなお肥大する。'],
 ['耳元の声','初期デッキに呪いが1枚入る。','眼','声は外からではなく、胸の奥から聞こえた。'],
 ['双生の王','第3層の最後に戦うボスが2体になる。','双','一つの玉座に、二つの影が並んで座っていた。'],
 ['死海','アセンションの果てにある、名も無い深淵。自分のターンが5秒に制限される。','海','時間さえ潮に呑まれ、届かなくなった場所があった。']
];
const DEAD_SEA_RANK=RANKS.length-1;
window.ABYSS_DEAD_SEA_ASCENSION=DEAD_SEA_RANK;
function fresh(){return{unlocked:0,selected:0,clears:[]}}
function valid(x){return x&&Number.isInteger(x.unlocked)&&Array.isArray(x.clears)}
function read(){for(const key of [KEY,BACKUP])try{let x=JSON.parse(localStorage.getItem(key)||'null');if(valid(x)){x.unlocked=Math.min(DEAD_SEA_RANK,Math.max(0,x.unlocked));x.selected=Math.min(x.unlocked,Math.max(0,x.selected||0));return x}}catch(e){}return fresh()}
function write(m){try{let raw=JSON.stringify(m);localStorage.setItem(KEY,raw);localStorage.setItem(BACKUP,raw)}catch(e){}}
let meta=read();
const rank=()=>meta.selected;
window.getSelectedAbyssRank=rank;
window.getAbyssAscensionMeta=()=>({...meta,clears:[...meta.clears]});
window.applyAbyssAscension=(enemy,{boss,elite,game})=>{let a=game?.ascension??rank();if(a>=2&&elite)enemy.hp=Math.round(enemy.hp*1.05);if(a>=7)enemy.m=enemy.m.map(m=>({...m,a:m.a?m.a+1:m.a}));if(a>=8&&boss)enemy.hp=Math.round(enemy.hp*1.10);return enemy};
window.getAbyssGoldPenalty=game=>(game?.ascension??rank())>=3?.8:1;
window.recordAbyssClear=a=>{a=Math.min(DEAD_SEA_RANK,Math.max(0,a||0));let first=!meta.clears.includes(a);if(first)meta.clears.push(a);if(first&&a===0)try{localStorage.setItem('abyssShardGuidePending','1')}catch(e){}let old=meta.unlocked;if(a===meta.unlocked&&a<DEAD_SEA_RANK)meta.unlocked=a+1;if(meta.unlocked>old)meta.selected=meta.unlocked;write(meta);render();return{first,cards:first?(window.getAbyssUnlockCards?.(a)||[]):[],newRank:meta.unlocked>old?meta.unlocked:null,deadSeaUnlocked:meta.unlocked>old&&meta.unlocked===DEAD_SEA_RANK,memory:RANKS[a][3]}};
window.getAbyssMemoryMarkup=()=>'<h3 class="collection-section memory-heading">◉ 深海の記憶</h3>'+RANKS.map((r,i)=>{let clear=meta.clears.includes(i),open=i<=meta.unlocked,rankLabel=i===DEAD_SEA_RANK?'死海':`A${i}`;return `<article class="memory-card ${clear?'cleared':''} ${open?'':'sealed'}"><div class="memory-rank">${rankLabel}</div><div><b>${open?r[0]:'封印された記憶'}</b><p>${open?r[1]:'前の深海階級をクリアすると解放。'}</p>${clear?`<p class="memory-flavor">${r[3]}</p>`:''}<small>${clear?'討伐済み':open?'挑戦可能':'未解放'}</small>${window.getAbyssUnlockCards?.(i).length?`<p>カード解放：${window.getAbyssUnlockCards(i).map(k=>window.ABYSS_ASCENSION_CARDS[k].n).join('・')} ${clear?'（解放済み）':'（クリアで解放）'}</p>`:''}</div></article>`}).join('');
function render(){let n=document.getElementById('ascensionNumber'),name=document.getElementById('ascensionName'),rule=document.getElementById('ascensionRule'),prev=document.getElementById('ascensionPrev'),next=document.getElementById('ascensionNext'),progress=document.getElementById('memoryProgress'),prefix=document.getElementById('ascensionPrefix');if(!n)return;let r=RANKS[meta.selected],isDeadSea=meta.selected===DEAD_SEA_RANK;prefix.hidden=isDeadSea;n.textContent=isDeadSea?'':meta.selected;name.textContent=isDeadSea?'死海':r[0];rule.textContent=r[1];prev.disabled=meta.selected<=0;next.disabled=meta.selected>=meta.unlocked;progress.textContent=`深海の記憶 ${meta.clears.length}/${RANKS.length}`;window.applyFuri?.(document.getElementById('ascensionPanel'))}
let panel=document.createElement('div');panel.id='ascensionPanel';panel.className='ascension-panel';panel.innerHTML='<div class="ascension-select"><button id="ascensionPrev" aria-label="前の深海階級">‹</button><div><small>深海階級</small><strong><span id="ascensionPrefix">A</span><span id="ascensionNumber">0</span>　<span id="ascensionName"></span></strong></div><button id="ascensionNext" aria-label="次の深海階級">›</button></div><p id="ascensionRule"></p><button class="memory-open" id="memoryOpen"><span>◉ 討伐記録</span><b id="memoryProgress"></b></button>';
document.querySelector('.title-actions')?.before(panel);
let modal=document.createElement('div');modal.className='modal';modal.id='memoryModal';modal.innerHTML='<div class="panel memory-panel modal-shell"><header class="modal-shell-head"><div><h2>深海の記憶</h2><p>第3層ボスを倒すたび、沈んだ記憶が一つずつ目を覚ます。</p></div></header><div class="modal-shell-body memory-grid" id="memoryGrid"></div><footer class="modal-shell-foot"><button class="btn" id="memoryClose">閉じる</button></footer></div>';document.body.appendChild(modal);
document.getElementById('ascensionPrev').onclick=()=>{meta.selected=Math.max(0,meta.selected-1);write(meta);render()};document.getElementById('ascensionNext').onclick=()=>{meta.selected=Math.min(meta.unlocked,meta.selected+1);write(meta);render()};document.getElementById('memoryOpen').onclick=()=>{document.getElementById('memoryGrid').innerHTML=window.getAbyssMemoryMarkup();modal.classList.add('on');window.applyFuri?.(modal)};document.getElementById('memoryClose').onclick=()=>modal.classList.remove('on');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('on')};render();
})();
