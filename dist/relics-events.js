(()=>{'use strict';
const RELICS={
 '漂流者の糸':['🧵','戦闘開始時、敵に脱力1を付与する。','uncommon'],
 '供物の真珠':['⚫','戦闘開始時、敵に弱体1を付与する。','uncommon'],
 'サイドパック':['🎒','戦闘開始時、カードを追加で2枚引く。','uncommon'],
 '呪紋の外殻':['🦔','戦闘開始時、トゲ＋3を得る（この戦闘中ずっと）。','uncommon'],
 '深海の血脈':['🩹','戦闘に勝利するたびHPを3回復する。','common'],
 '分厚い甲殻':['🐢','ターン開始時、ブロックを最大6引き継ぐ（残りは失う）。','uncommon'],
 '警鐘の巻貝':['🔔','各戦闘で最初にHPを失った次のターン、カードを2枚引く。','uncommon'],
 '深海の呼吸':['🐬','毎ターン、カードを追加で1枚引く。','rare'],
 '深海の鍵':['🔱','第一海域のボスを倒した証。第二海域への道を開く。','boss'],
 '深海の紋章':['🌑','第二層のボスを倒した証。第三層への道を開き、最大HPを5増やす。','boss'],
 '航海羅針盤':['🧭','戦闘に勝つたび、もらえるゴールドが8増える。','common'],
 '黄金炉':['🔥','戦闘の最初のターンだけ、エナジーが1増える。','common'],
 '珊瑚の護符':['🪸','カードで回復するHPが2増える。','common'],
 '古代の盾':['🛡️','戦闘開始時に10ブロックを得る。','uncommon'],
 '深海時計':['⏱️','3ターンごとに、カードを追加で1枚引く。','common'],
 '黒潮の鱗':['🌊','3の倍数のターンに、エナジーが1増える。','uncommon'],
 '捕食者の眼':['👁️','毒を受けている敵への攻撃ダメージが2増える。','uncommon'],
 '毒腺の指輪':['💍','カードで敵に与える毒が1増える。','uncommon'],
 'スラッシュブースト':['🗡️','「フィン・スラッシュ」のダメージが3増える。','common'],
 'オウムガイの護殻':['🐚','戦闘開始時、防御力＋1。','uncommon'],
 '皇帝の骨片':['🦴','入手時に最大HPとHPが7増える。','rare'],
 '防毒ジャケット':['🦺','敵の毒針の追加ダメージをブロックできるようになる。','common'],
 '巨獣の顎':['🦈','戦闘開始時、攻撃力＋1（この戦闘中ずっと）。','uncommon'],
 'VIPカード':['💳','ショップのすべての価格が30%安くなる。','rare'],
 'グリズリースーツ':['🐻','相手から受けるダメージを1減らす。連続攻撃は1回ごとに減らす。','rare'],
 '再生ウロコ':['🩹','各戦闘で初めて自分のターン中にHPを失った時、HPを3回復する。','uncommon']
};
const BOSS_RELICS={
 '呪海の炉':['🕯️','毎ターンのエナジー＋1。ただし、戦闘開始時に手札へ呪いを1枚追加する。','boss'],
 '四皇の王冠':['👑','毎ターンのエナジー＋1。ただし、毎ターン引けるカードが1枚少なくなる。','boss'],
 '深淵炉心':['🌋','毎ターンのエナジーが1増える。ただし、1ターンに使えるカードは5枚まで。','boss'],
 '次元圧縮':['♋️','入手時、デッキ内のすべての「フィン・スラッシュ」と「鱗の守り」をランダムなカードに変える。','boss'],
 '巨鯨の心臓':['🫀','入手時に最大HPとHPが18増える。ただし、戦闘開始時にHPを3失う。','boss'],
 '水圧変異':['🧬','ターン終了時、手札を捨てなくなる。','boss'],
 '黄金王座':['🫧','エリートを倒すと、追加でレリックを1個入手する。','boss'],
 '深淵の瞳':['🌌','ターン開始時、追加でカードを2枚引く。ただし、すべてのカードのコストは引くたびにランダムになる。','boss']
};
const NORMAL_RELICS=Object.keys(RELICS);
const REWARD_BLOCKED=new Set(['深海の鍵','深海の紋章']);
Object.assign(RELICS,BOSS_RELICS);
window.ABYSS_RELICS=RELICS;
function game(){return window.getAbyssGame?.()}
function addRelic(name,announce=true){let g=game(),r=RELICS[name];if(!g||!r||g.relic.some(x=>x[1]===name))return false;g.relic.push([r[0],name]);if(name==='皇帝の骨片'){g.max+=7;g.hp+=7}if(announce)window.showRelicAcquired?.(name);return true}window.acquireAbyssRelic=addRelic;
function addCard(pool,title='イベントで獲得'){pool=window.extendAbyssCardPool(pool,pool===rare?'rare':'abyss');let g=game();if(g){let k=pool[Math.random()*pool.length|0];g.deck.push(k);window.showCardAcquired?.(k,title)}}
function randomRelicGrant(){let g=game(),owned=new Set((g?.relic||[]).map(r=>r[1])),pool=NORMAL_RELICS.filter(n=>!REWARD_BLOCKED.has(n)&&!owned.has(n));if(!g||!pool.length){if(g)g.pearl+=33;return}addRelic(pickRelicByRarity(pool))}
const RARITY_ORDER={common:0,uncommon:1,rare:2,boss:3};
function showRelics(){let g=game(),owned=new Set((g?.relic||[]).map(r=>r[1])),titleOpen=document.getElementById('title')?.classList.contains('on'),ownedOnly=!titleOpen,entries=Object.entries(RELICS).filter(([name])=>!ownedOnly||owned.has(name)).sort((a,b)=>(RARITY_ORDER[a[1][2]]??1)-(RARITY_ORDER[b[1][2]]??1)),modal=document.getElementById('collectionModal'),grid=document.getElementById('collectionGrid');document.getElementById('collectionTitle').textContent=ownedOnly?'所持レリック':'レリック図鑑';document.getElementById('collectionSub').textContent=ownedOnly?`現在の潜航で入手したレリック ${owned.size}個`:`レリックの効果を確認できます。入手 ${owned.size}/${Object.keys(RELICS).length}`;grid.className='modal-shell-body relic-grid';grid.innerHTML=entries.length?'<h3 class="collection-section">🔱 レリック</h3>'+entries.map(([name,[icon,effect,rarity]])=>{let boss=rarity==='boss',label={common:'コモン',uncommon:'アンコモン',rare:'レア'}[rarity],badge=boss?'<span class="boss-relic-mark">👑 ボスレリック</span>':(label?`<span class="relic-rarity rarity-${rarity}">${label}</span>`:'');return `<article class="relic-card owned ${boss?'boss-relic-card':''}"><div class="relic-icon">${icon}</div><div><div class="relic-name">${name}${badge}</div><div class="relic-effect">${effect}</div><div class="relic-lock">入手済み</div></div></article>`}).join(''):`<p class="empty-relic-list">まだレリックを入手していません。</p>`;modal.classList.add('on');window.applyFuri?.(modal)}window.openAbyssRelicCollection=showRelics;
let relicReveal=document.createElement('div');relicReveal.className='modal';relicReveal.id='relicRevealModal';relicReveal.innerHTML='<div class="panel relic-reveal"><div class="bigicon" id="relicRevealIcon"></div><h2 id="relicRevealName"></h2><p id="relicRevealEffect"></p><button class="btn gold" id="relicRevealClose">効果を確認</button></div>';document.body.appendChild(relicReveal);window.showRelicAcquired=name=>{let r=RELICS[name];if(!r)return;document.getElementById('relicRevealIcon').textContent=r[0];document.getElementById('relicRevealName').textContent=`レリック「${name}」を獲得`;document.getElementById('relicRevealEffect').textContent=r[1];relicReveal.classList.add('on');window.applyFuri?.(relicReveal)};let pendingBossRelicDone=null;
function closeRelicReveal(){relicReveal.classList.remove('on');setTimeout(()=>window.playPendingAbyssLayerIntro?.(),120);if(pendingBossRelicDone){let fn=pendingBossRelicDone;pendingBossRelicDone=null;fn()}}document.getElementById('relicRevealClose').onclick=closeRelicReveal;relicReveal.onclick=e=>{if(e.target===relicReveal)closeRelicReveal()};
let bossNext=null,bossModal=document.createElement('div');bossModal.className='modal';bossModal.id='bossRelicModal';bossModal.innerHTML='<div class="panel boss-relic-panel"><small id="relicChoiceEyebrow">ABYSSAL TROPHY</small><h2 id="relicChoiceTitle">ボスレリック</h2><p id="relicChoiceText">深海の主から奪う力を1つ選べ。強い力には代償がある。</p><div class="boss-relic-choices" id="bossRelicChoices"></div></div>';document.body.appendChild(bossModal);
function grantBossRelic(name,onTransformed){let g=game(),r=BOSS_RELICS[name];if(!g||!r||g.relic.some(x=>x[1]===name))return false;g.relic.push([r[0],name]);g.pendingBossRelic=false;if(name==='巨鯨の心臓'){g.max+=18;g.hp+=18}if(name==='次元圧縮')window.transformAbyssBasicCards?.(onTransformed);return true}
window.openAbyssRewardRelics=(kind,next)=>{let g=game(),boss=kind==='boss',owned=new Set((g?.relic||[]).map(r=>r[1])),source=boss?Object.keys(BOSS_RELICS):NORMAL_RELICS.filter(n=>!REWARD_BLOCKED.has(n)),pool=source.filter(n=>!owned.has(n)).sort(()=>Math.random()-.5).slice(0,3);if(!g||!pool.length){window.abyssSave?.();return next?.(null)}if(!boss){let name=pool[0],ok=addRelic(name,false);window.abyssSave?.();if(ok)window.showRelicAcquired?.(name);return next?.(ok?name:null)}bossNext=next;document.getElementById('relicChoiceEyebrow').textContent='ABYSSAL TROPHY';document.getElementById('relicChoiceTitle').textContent='ボスレリック';document.getElementById('relicChoiceText').textContent='深海の主から奪う力を1つ選べ。強い力には代償がある。';document.getElementById('bossRelicChoices').innerHTML=pool.map(name=>{let [icon,effect]=RELICS[name],[power,cost]=effect.split('ただし、');return `<button class="boss-relic-choice" data-name="${name}"><i>${icon}</i><b>${name}</b><span class="boss-power">${power}</span>${cost?`<span class="boss-cost">⚠ ${cost}</span>`:''}</button>`}).join('');document.querySelectorAll('#bossRelicChoices .boss-relic-choice').forEach(b=>b.onclick=()=>{let name=b.dataset.name,done=bossNext;bossNext=null;let ok=grantBossRelic(name,name==='次元圧縮'?(()=>{pendingBossRelicDone=()=>done?.(name);window.showRelicAcquired?.(name)}):null);if(!ok)return;bossModal.classList.remove('on');window.abyssSave?.();if(name!=='次元圧縮'){window.showRelicAcquired?.(name);done?.(name)}});bossModal.classList.add('on');window.applyFuri?.(bossModal)};
const RARITY_WEIGHT={common:3,uncommon:2,rare:1};
function pickRelicByRarity(names){let weighted=[];names.forEach(n=>{let w=RARITY_WEIGHT[RELICS[n]?.[2]]||2;for(let i=0;i<w;i++)weighted.push(n)});return weighted[Math.random()*weighted.length|0]}
window.pickAbyssRelicByRarity=pickRelicByRarity;
const chooseRewardRelics=window.openAbyssRewardRelics;window.openAbyssRewardRelics=(kind,next)=>{if(kind==='boss')return chooseRewardRelics(kind,next);let g=game(),owned=new Set((g?.relic||[]).map(r=>r[1])),pool=NORMAL_RELICS.filter(n=>!REWARD_BLOCKED.has(n)&&!owned.has(n));if(!g||!pool.length){window.abyssSave?.();return next?.(null)}let name=pickRelicByRarity(pool);addRelic(name,false);next?.(name);window.abyssSave?.();window.showRelicAcquired?.(name)};
window.openAbyssBossRelics=next=>window.openAbyssRewardRelics('boss',()=>next?.());
let relicViewButton=document.getElementById('relicView');if(relicViewButton){relicViewButton.disabled=false;relicViewButton.onclick=showRelics}
document.getElementById('deckView')?.addEventListener('click',()=>{document.getElementById('collectionGrid').className='modal-shell-body collection-grid'});
const rare=['marlin','whale','mimic','tsunami','manta','leviathan','abyssarmor','coelacanth','zeroshift'],abyss=['lantern','voidjaw','shadoweel','curseward','abyssflame','bloodprice'];
window.ABYSS_EVENTS?.push(
 ['🦴','鯨骨の墓場','巨大な鯨の骨が海底に横たわり、その内側で古い力が脈打っている。',[['骨の中へ入る','HPを10失い、遺物「古代の盾」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-10);addRelic('古代の盾')}],['ゴールドだけ拾う','ゴールドを61得る',()=>game().pearl+=61],['静かに祈る','HPを10回復',()=>{let g=game();g.hp=Math.min(g.max,g.hp+10)}]]],
 ['🪼','月光クラゲの群れ','青白いクラゲたちが、傷を癒す光の輪を作っている。',[['光に包まれる','遺物「珊瑚の護符」を得る',()=>addRelic('珊瑚の護符')],['群れと泳ぐ','HPを16回復',()=>{let g=game();g.hp=Math.min(g.max,g.hp+16)}],['光を結晶化する','ゴールド35を払い、レアカードを得る',()=>{let g=game();if(g.pearl>=35){g.pearl-=35;addCard(rare)}}]]],
 ['🧪','沈んだ研究所','割れた水槽と機械の中に、カードを作り変える装置が残っている。',[['装置を動かす','指定した未強化カードを1枚強化する',()=>window.chooseAbyssUpgrades?.(1,'装置で強化するカードを選ぶ')],['古いカードを溶かす','指定した基本カードを1枚削除する',()=>window.chooseAbyssRemovals?.(1,'溶かす基本カードを選ぶ',k=>['fin','scale'].includes(k.replace(/[+*]+$/,'')))],['部品を売る','HPを6失い、ゴールド50を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-6);g.pearl+=50}]]],
 ['🥚','リヴァイアサンの卵','鼓動する巨大な卵。殻の奥から、深海の力が呼びかけてくる。',[['力を受け取る','HPを12失い、レアカードを得る',()=>{let g=game();g.hp=Math.max(1,g.hp-12);addCard(rare)}],['殻を身につける','最大HPが5増え、HPを5回復',()=>{let g=game();g.max+=5;g.hp+=5}],['瞳を抉る','最大HPを4失い、遺物「深淵の瞳」を得る',()=>{let g=game();g.max=Math.max(20,g.max-4);g.hp=Math.min(g.hp,g.max);addRelic('深淵の瞳')}]]],
 ['🔥','黄金炉の祭壇','ゴールドを炎に変える古代の炉。熱い泡が周囲を包んでいる。',[['炉にゴールドを捧げる','ゴールド45を払い、遺物「黄金炉」を得る',()=>{let g=game();if(g.pearl>=45){g.pearl-=45;addRelic('黄金炉')}}],['命の炎を浴びる','HPを全回復するが、最大HPを5失う',()=>{let g=game();g.max=Math.max(20,g.max-5);g.hp=g.max}],['立ち去る','何も起こらない',()=>{}]]],
 ['👻','幽霊船の航路','霧の中から幽霊船が現れた。船長は三つの航路を指し示す。',[['安全な航路','遺物「防毒ジャケット」を得る',()=>addRelic('防毒ジャケット')],['宝の航路','HPを9失い、ゴールド77を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-9);g.pearl+=77}],['禁じられた航路','HPを12失い、深海カードを得る',()=>{let g=game();g.hp=Math.max(1,g.hp-12);addCard(abyss)}]]],
 ['⏱️','沈んだ観測所','壊れた時計だけが、海底でまだ正確に時を刻んでいる。',[['時計を持ち帰る','HPを8失い、遺物「深海時計」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-8);addRelic('深海時計')}],['黒い鱗を拾う','ゴールド35を払い、遺物「黒潮の鱗」を得る',()=>{let g=game();if(g.pearl>=35){g.pearl-=35;addRelic('黒潮の鱗')}}],['時間を乱さない','何も起こらない',()=>{}]]],
 ['👁️','捕食者の祭壇','無数の牙に囲まれた祭壇で、三つの遺物が獲物を待っている。',[['眼を受け入れる','最大HPを4失い、遺物「捕食者の眼」を得る',()=>{let g=game();g.max=Math.max(20,g.max-4);g.hp=Math.min(g.hp,g.max);addRelic('捕食者の眼')}],['指輪をはめる','HPを10失い、遺物「毒腺の指輪」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-10);addRelic('毒腺の指輪')}],['眠る玉を起こす','ゴールド45を払い、遺物「スラッシュブースト」を得る',()=>{let g=game();if(g.pearl>=45){g.pearl-=45;addRelic('スラッシュブースト')}}]]],
 ['🗼','目のない灯台','海底に立つ灯台が、光ではなく黒い影を放っている。影の中から自分の声が聞こえる。',[['影を見つめる','最大HPを3失い、遺物「警鐘の巻貝」を得る',()=>{let g=game();g.max=Math.max(20,g.max-3);g.hp=Math.min(g.hp,g.max);addRelic('警鐘の巻貝')}],['灯りを消す','HPを14回復する',()=>{let g=game();g.hp=Math.min(g.max,g.hp+14)}],['声から逃げる','ゴールドを20失う',()=>{let g=game();g.pearl=Math.max(0,g.pearl-20)}]]],
 ['🌟','墜星の亡骸','空から落ちたはずの巨大な星が、海底で腐りながら呼吸している。触れた者の未来を食べるという。',[['核に触れる','50%でレアカード。失敗するとHPを15失う',()=>{let g=game();if(Math.random()<.5)addCard(rare,'成功！ レアカードを獲得');else{g.hp=Math.max(1,g.hp-15);window.showAbyssOutcome?.(false,'抽選結果：外れ','星の核は砕け、HPを15失った。')}}],['欠片を売る','最大HPを3失い、ゴールドを77得る',()=>{let g=game();g.max=Math.max(20,g.max-3);g.hp=Math.min(g.hp,g.max);g.pearl+=77}],['亡骸を埋める','HPを8回復する',()=>{let g=game();g.hp=Math.min(g.max,g.hp+8)}]]],
 ['🪞','反転する海溝','海溝の底に、上へ向かって落ち続けるもう一つの海が見える。供物を落とせば力が返る。',[['カードを捧げる','指定したカード1枚を失い、最大HP＋7',()=>window.chooseAbyssRemovals?.(1,'海溝へ捧げるカードを選ぶ',()=>true,()=>{let g=game();g.max+=7;g.hp+=7})],['ゴールドを落とす','ゴールド40を失い、遺物「分厚い甲殻」を得る',()=>{let g=game();if(g.pearl>=40){g.pearl-=40;addRelic('分厚い甲殻')}}],['何も落とさない','海溝がHPを5奪う',()=>{let g=game();g.hp=Math.max(1,g.hp-5)}]]],
 ['🤿','もう一人の潜水者','暗闇から、未来のあなたが泳いでくる。「一枚だけ変えろ。でなければ同じ場所で死ぬ」',[['未来を信じる','指定した未強化カード1枚を強化',()=>window.chooseAbyssUpgrades?.(1,'未来を変えるカードを選ぶ')],['荷を託される','HPを10失い、遺物「サイドパック」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-10);addRelic('サイドパック')}],['目をそらす','何も起こらない',()=>{}]]],
 ['🏺','漂着した宝物入れ','波間に漂う古い箱には、名も知らぬ遺物が眠っている。',[['箱を開ける','ランダムな遺物を1つ得る',()=>randomRelicGrant()],['そっと売り払う','ゴールドを55得る',()=>game().pearl+=55],['触れずに立ち去る','何も起こらない',()=>{}]]],
 ['🧳','漂流者の遺品','海底に沈んだ鞄の中に、まだ使える道具が残っている。',[['遺品を受け取る','HPを6失い、ランダムな遺物を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-6);randomRelicGrant()}],['そのまま埋葬する','HPを10回復',()=>{let g=game();g.hp=Math.min(g.max,g.hp+10)}],['中身だけ確認する','ゴールドを33得る',()=>game().pearl+=33]]]
);
})();
