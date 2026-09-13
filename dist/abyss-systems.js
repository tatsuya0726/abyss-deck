(()=>{'use strict';
const $=s=>document.querySelector(s),KEY='abyssAchievements';
const MODIFIERS=[
 {id:'red_tide',icon:'🌘',name:'赤い月潮',benefit:'自分の攻撃カードのダメージ＋1。',cost:'敵の攻撃も1回ごとに＋1。',playerDamage:1,enemyDamage:1},
 {id:'shell_rain',icon:'🐚',name:'甲殻の雨',benefit:'まもりカードのブロック＋1。',cost:'敵の防御行動のブロック＋1。',playerBlock:1,enemyBlock:1},
 {id:'luminous',icon:'🪼',name:'発光海流',benefit:'戦闘の最初にカードを追加で1枚引く。',cost:'敵のHPが4％増える。',firstDraw:1,enemyHpPct:.04},
 {id:'pearl_storm',icon:'🪙',name:'黄金潮',benefit:'戦闘勝利でもらえるゴールド＋5。',cost:'カードの回復量−1。',rewardPearl:5,healPenalty:1},
 {id:'void_breath',icon:'🌀',name:'虚無の呼吸',benefit:'戦闘の最初のターンだけエナジー＋1。',cost:'最大HPが4少ない状態で始まる。',firstEnergy:1,maxHp:-4}
];
const SYNERGIES=[
 {icon:'🜏',name:'呪いと供物',tag:'呪い・廃棄・回収',text:'「深海の誘い灯」や「虚空顎」で呪いを増やし、「影喰いウツボ」で攻防へ変換する。手札に残した呪いの傷は「反転術式」で回復へ変えられる。',cards:['深海の誘い灯','虚空顎','影喰いウツボ','反転術式']},
 {icon:'☠️',name:'毒潮コンボ',tag:'毒を育てる',cards:['猛毒フグ','痺れクラゲ','毒花の開花','毒牙の追撃'],text:'先に毒をためてから「毒花の開花」で半分を追加（最大8）。毒牙の追撃や毒鱗のよろいにつなげると、蓄えた毒を攻撃と防御の両方に利用できる。'},
 {icon:'🦈',name:'連撃コンボ',tag:'攻撃をつなぐ',cards:['魚群連撃','追従する牙','コバンザメの力'],text:'攻撃力アップは多段攻撃の1発ごとに加わる。「追従する牙」は攻撃カードの直後に使うと2回攻撃。'},
 {icon:'🐚',name:'甲殻コンボ',tag:'守るほど強い',cards:['育つ甲殻','珊瑚の構え','群泳の守り','大潮の城壁'],text:'「珊瑚の構え」で敵の行動後に残るブロックを持ち越す。「大潮の城壁」は次ターンの防御を予約し、鱗盾チャージへつなげられる。'},
 {icon:'🌊',name:'手札循環コンボ',tag:'たくさん引く',cards:['逆巻く海流','飛魚の一閃','擬態の極意','群泳の守り'],text:'「擬態の極意」で山札の上3枚から1枚を選び、残りを捨て札へ。「群泳の守り」は手札が多いほどブロックが大きくなる。'},
 {icon:'◆',name:'深淵刻印コンボ',tag:'エナジーを戻す',cards:['深淵刻印','擬態の極意','追従する牙','深淵の舞'],text:'刻印したカードは使うとエナジーが1戻る。ドローや連携カードへ刻むと、長いコンボを作りやすい。'}
];
const ACH=[
 {id:'first',icon:'🐟',title:'駆け出しの狩人',desc:'戦闘に初めて勝つ。',test:s=>s.wins>=1},
 {id:'hunter',icon:'🦈',title:'深海狩人',desc:'戦闘に合計10回勝つ。',test:s=>s.wins>=10},
 {id:'veteran',icon:'⚔️',title:'歴戦の潜水者',desc:'戦闘に合計25回勝つ。',test:s=>s.wins>=25},
 {id:'legend',icon:'🌊',title:'百戦の航海王',desc:'戦闘に合計50回勝つ。',test:s=>s.wins>=50},
 {id:'elite',icon:'💀',title:'精鋭喰らい',desc:'エリートに合計3回勝つ。',test:s=>s.elites>=3},
 {id:'elite_master',icon:'☠️',title:'強者を狩る者',desc:'エリートに合計10回勝つ。',test:s=>s.elites>=10},
 {id:'boss_hunter',icon:'👑',title:'王殺し',desc:'各層のボスに合計3回勝つ。',test:s=>s.bosses>=3},
 {id:'boss_legend',icon:'🔱',title:'深海の王殺し',desc:'各層のボスに合計9回勝つ。',test:s=>s.bosses>=9},
 {id:'poison',icon:'☠️',title:'毒潮の主',desc:'敵の毒を一度に20以上にする。',test:s=>s.maxPoison>=20},
 {id:'poison_master',icon:'🧪',title:'猛毒の錬成者',desc:'敵の毒を一度に40以上にする。',test:s=>s.maxPoison>=40},
 {id:'block',icon:'🛡️',title:'不沈の甲殻',desc:'ブロックを一度に30以上にする。',test:s=>s.maxBlock>=30},
 {id:'fortress',icon:'🏰',title:'歩く海底城',desc:'ブロックを一度に60以上にする。',test:s=>s.maxBlock>=60},
 {id:'deck',icon:'🎴',title:'百魚の戦術家',desc:'デッキを20枚以上にする。',test:s=>s.maxDeck>=20},
 {id:'collector',icon:'📚',title:'深淵の収集家',desc:'デッキを30枚以上にする。',test:s=>s.maxDeck>=30},
 {id:'clear',icon:'◉',title:'底を見た者',desc:'第3層の深海の主を倒す。',test:s=>s.clears>=1},
 {id:'clear_three',icon:'🌟',title:'三度底を見た者',desc:'深淵を合計3回踏破する。',test:s=>s.clears>=3}
];
function fresh(){return{unlocked:[],selected:null,stats:{wins:0,elites:0,bosses:0,clears:0,maxPoison:0,maxBlock:0,maxDeck:0}}}
function read(){try{let x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&Array.isArray(x.unlocked)){x.stats=Object.assign(fresh().stats,x.stats||{});return x}}catch(e){}return fresh()}
let meta=read();
function write(){try{localStorage.setItem(KEY,JSON.stringify(meta))}catch(e){}}
function notify(a,delay=0){setTimeout(()=>{let n=document.createElement('div');n.className='achievement-pop';n.innerHTML=`<i>${a.icon}</i><div><small>称号を獲得</small><b>${a.title}</b></div>`;document.body.appendChild(n);window.applyFuri?.(n);setTimeout(()=>n.classList.add('show'),20);setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),350)},2600)},delay)}
function evaluate(announce=true){let newly=ACH.filter(a=>!meta.unlocked.includes(a.id)&&a.test(meta.stats));if(!newly.length)return false;newly.forEach(a=>meta.unlocked.push(a.id));meta.selected=newly[newly.length-1].id;write();if(announce)newly.forEach((a,i)=>notify(a,i*500));return true}
window.trackAbyssAchievement=(type,data={})=>{let g=window.getAbyssGame?.(),s=meta.stats,dirty=false;if(type==='win'){s.wins++;if(data.elite)s.elites++;if(data.boss)s.bosses++;dirty=true}if(type==='clear'&&g&&!g.achievementClearRecorded){s.clears++;g.achievementClearRecorded=true;dirty=true;window.abyssSave?.()}if(g){let p=g.poison||0,b=g.block||0,d=g.deck?.length||0;if(p>s.maxPoison){s.maxPoison=p;dirty=true}if(b>s.maxBlock){s.maxBlock=b;dirty=true}if(d>s.maxDeck){s.maxDeck=d;dirty=true}}if(dirty){write();evaluate(true);sync()}};
function currentModifier(m){const latest=m&&MODIFIERS.find(x=>x.id===m.id);return latest?JSON.parse(JSON.stringify(latest)):m}
window.pickAbyssRunModifier=()=>currentModifier(MODIFIERS[Math.random()*MODIFIERS.length|0]);
window.applyAbyssRunModifier=(enemy,{game})=>{let m=currentModifier(game?.runModifier);if(!m)return enemy;if(game)game.runModifier=m;if(m.enemyHpPct)enemy.hp=Math.max(1,Math.round(enemy.hp*(1+m.enemyHpPct)));if(m.enemyDamage)enemy.m=enemy.m.map(x=>({...x,a:x.a?x.a+m.enemyDamage:x.a}));if(m.enemyBlock)enemy.m=enemy.m.map(x=>({...x,b:x.b?x.b+m.enemyBlock:x.b}));return enemy};
let reveal=document.createElement('div');reveal.className='modal';reveal.id='runModifierModal';reveal.innerHTML='<div class="panel modifier-panel"><div class="bigicon" id="modifierIcon"></div><small>ABYSSAL CURRENT</small><h2 id="modifierName"></h2><p>今回の潜航を包む深海異変</p><div class="modifier-rules"><div><b>味方の変化</b><span id="modifierBenefit"></span></div><div class="danger-rule"><b>深海の代償</b><span id="modifierCost"></span></div></div><button class="btn gold" id="modifierClose">異変を受け入れる</button></div>';document.body.appendChild(reveal);
function showModifier(m=window.getAbyssGame?.()?.runModifier){if(!m)return;$('#modifierIcon').textContent=m.icon;$('#modifierName').textContent=m.name;$('#modifierBenefit').textContent=m.benefit;$('#modifierCost').textContent=m.cost;reveal.classList.add('on');window.applyFuri?.(reveal)}
function closeModifier(){reveal.classList.remove('on');setTimeout(()=>window.playPendingAbyssLayerIntro?.(),120)}window.showAbyssRunModifier=showModifier;$('#modifierClose').onclick=closeModifier;reveal.onclick=e=>{if(e.target===reveal)closeModifier()};
let badge=document.createElement('button');badge.id='runModifierBadge';badge.className='run-modifier-badge';badge.hidden=true;document.querySelector('.mapHead')?.appendChild(badge);badge.onclick=()=>showModifier();
let guide=document.createElement('div');guide.className='modal';guide.id='strategyModal';guide.innerHTML='<div class="panel strategy-panel modal-shell"><header class="modal-shell-head"><div><small>ABYSS ARCHIVE</small><h2>戦術図鑑・称号</h2></div><nav class="archive-tabs" id="archiveTabs"><button type="button" data-tab="strategy" class="active">⚓ 戦術</button><button type="button" data-tab="achievements">🏆 実績</button><button type="button" data-tab="memory">◉ 深淵の記憶</button></nav></header><div class="modal-shell-body" id="strategyContent"></div><footer class="modal-shell-foot"><button class="btn" id="strategyClose">閉じる</button></footer></div>';document.body.appendChild(guide);
function modifierMarkup(m){return m?`<section class="current-modifier"><h3>${m.icon} 現在の深海異変「${m.name}」</h3><p class="good">${m.benefit}</p><p class="bad">${m.cost}</p></section>`:'<section class="current-modifier"><h3>🌊 深海異変</h3><p>新しく潜ると、毎回ちがう有利効果と代償が発生します。</p></section>'}
function renderGuide(){let m=window.getAbyssGame?.()?.runModifier,unlocked=new Set(meta.unlocked);$('#strategyContent').innerHTML='<div id="strategyArchive">'+modifierMarkup(m)+'<h3 class="archive-heading">⚓ シナジー図鑑</h3><div class="synergy-grid">'+SYNERGIES.map(s=>`<article class="synergy-card"><i>${s.icon}</i><div><b>${s.name}</b><small>${s.tag}</small><p>${s.text}</p><div class="combo-cards">${s.cards.map(c=>`<span>${c}</span>`).join('')}</div></div></article>`).join('')+'</div></div><div id="achievementArchive" hidden><h3 class="archive-heading">🏆 称号・実績 <small>'+unlocked.size+'/'+ACH.length+'</small></h3><div class="achievement-grid">'+ACH.map(a=>`<article class="achievement-card ${unlocked.has(a.id)?'unlocked':'locked'} ${meta.selected===a.id?'selected':''}"><i>${unlocked.has(a.id)?a.icon:'？'}</i><div><b>${unlocked.has(a.id)?a.title:'未解放の称号'}</b><p>${a.desc}</p><small>${meta.selected===a.id?'最新の称号':unlocked.has(a.id)?'獲得済み':'条件を達成すると解放'}</small></div></article>`).join('')+'</div></div><div id="memoryArchive" hidden><div class="memory-grid">'+(window.getAbyssMemoryMarkup?.()||'')+'</div></div>';window.applyFuri?.(guide)}
function selectArchiveTab(section){guide.querySelectorAll('#archiveTabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===section));const ids={strategy:'strategyArchive',achievements:'achievementArchive',memory:'memoryArchive'};Object.entries(ids).forEach(([key,id])=>{let el=document.getElementById(id);if(el)el.hidden=key!==section});let body=$('#strategyContent');if(body)body.scrollTop=0}
function openGuide(section='strategy'){renderGuide();guide.classList.add('on');selectArchiveTab(section)}window.openAbyssStrategy=openGuide;guide.querySelectorAll('#archiveTabs button').forEach(b=>b.onclick=()=>selectArchiveTab(b.dataset.tab));$('#titleCodex').onclick=()=>openGuide('strategy');$('#strategyClose').onclick=()=>guide.classList.remove('on');guide.onclick=e=>{if(e.target===guide)guide.classList.remove('on')};
function sync(){let g=window.getAbyssGame?.();if(g?.runModifier)g.runModifier=currentModifier(g.runModifier);let m=g?.runModifier;if(g&&g.deck?.length>meta.stats.maxDeck){meta.stats.maxDeck=g.deck.length;write();evaluate(true)}badge.hidden=!m;if(m)badge.textContent=`${m.icon} 深海異変：${m.name}`;let a=ACH.find(x=>x.id===meta.selected),title=$('#equippedTitle');if(title)title.textContent=a?`称号「${a.title}」`:'';let list=$('#effectModal .effect-list'),row=$('#activeModifierEffect');if(list&&!row){list.insertAdjacentHTML('beforeend','<div class="effect-item" id="activeModifierEffect"><i id="activeModifierIcon">🌊</i><b id="activeModifierName">深海異変</b><span id="activeModifierText"></span></div>');row=$('#activeModifierEffect')}if(row){row.hidden=!m;if(m){$('#activeModifierIcon').textContent=m.icon;$('#activeModifierName').textContent=`深海異変・${m.name}`;$('#activeModifierText').textContent=`${m.benefit} ${m.cost}`}}}
window.syncAbyssSystems=sync;evaluate(false);sync();window.applyFuri?.($('#title'));
})();
