(()=>{'use strict';
const RELICS={
 '漂流者の糸':['🧵','各ターン、カード効果で初めてカードを捨てた時、1枚引く。ターン終了時は発動しない。'],
 '供物の真珠':['⚫','各ターン、手札から初めてカードを廃棄した時、4ブロック。'],
 '蓄潮石':['💎','ターン終了時の余ったエナジー1につき、次のターン開始時に3ブロック（最大6・他の予約と合計上限12）。'],
 '呪紋の貝殻':['🐚','戦闘開始時、戦闘中の呪い1枚につき2ブロック（最大6）。'],
 '深海の鍵':['🔱','第一海域のボスを倒した証。第二海域への道を開く。'],
 '深淵の紋章':['🌑','第二層のボスを倒した証。第三層への道を開き、最大HPを5増やす。'],
 '航海羅針盤':['🧭','戦闘に勝つたび、もらえるゴールドが8増える。'],
 '黄金炉':['🔥','戦闘の最初のターンだけ、エナジーが1増える。'],
 '潮流の牙':['🦷','すべての攻撃カードのダメージが1増える。'],
 '珊瑚の護符':['🪸','カードで回復するHPが2増える。'],
 '古代の甲殻':['🛡️','戦闘開始時に4ブロックを得る。'],
 '深海時計':['⏱️','戦闘の最初のターンに、カードを追加で1枚引く。'],
 '黒潮の鱗':['🌊','3の倍数のターンに、エナジーが1増える。'],
 '捕食者の眼':['👁️','毒を受けている敵への攻撃ダメージが2増える。'],
 '毒腺の指輪':['💍','カードで敵に与える毒が1増える。'],
 '深海金貨':['🔮','各戦闘で初めてレアまたは深淵カードを使うと、ゴールドを4得る。'],
 'オウムガイの護殻':['🐚','まもりカードを使うたび、得られるブロックが1増える。'],
 '皇帝の骨片':['🦴','入手時に最大HPとHPが2増える。'],
 '商人アンコウの提灯':['🏮','ショップのすべての価格が20%安くなる。']
};
const BOSS_RELICS={
 '呪海の炉':['🕯️','毎ターンのエナジー＋1。ただし、毎戦闘の開始時に捨て札へ呪いを1枚追加する。'],
 '六眼の王冠':['👁️','毎ターンのエナジー＋1。ただし、手札の上限が6枚になる。'],
 '深淵炉心':['🔥','毎ターンのエナジーが1増える。ただし、1ターンに使えるカードは3枚まで。'],
 '捕食王の冠':['👑','攻撃カードのダメージが3増える。ただし、カードの回復量が2減る。'],
 '巨鯨の心臓':['🫀','入手時に最大HPとHPが18増える。ただし、戦闘開始時にHPを4失う。'],
 '反転鱗':['🔃','まもりカードのブロックが3増える。ただし、攻撃カードのダメージが2減る。'],
 '沈鐘':['🔔','最初のターンにカードを2枚追加で引く。ただし、そのターンのエナジーが1減る。'],
 '黄金王座':['🫧','戦闘勝利でもらえるゴールドが10増える。ただし、入手時に最大HPが8減る。']
};
const NORMAL_RELICS=Object.keys(RELICS);
const REWARD_BLOCKED=new Set(['深海の鍵','深淵の紋章']);
Object.assign(RELICS,BOSS_RELICS);
window.ABYSS_RELICS=RELICS;
function game(){return window.getAbyssGame?.()}
function addRelic(name,announce=true){let g=game(),r=RELICS[name];if(!g||!r||g.relic.some(x=>x[1]===name))return false;g.relic.push([r[0],name]);if(name==='皇帝の骨片'){g.max+=2;g.hp+=2}if(announce)window.showRelicAcquired?.(name);return true}window.acquireAbyssRelic=addRelic;
function addCard(pool,title='イベントで獲得'){pool=window.extendAbyssCardPool(pool,pool===rare?'rare':'abyss');let g=game();if(g){let k=pool[Math.random()*pool.length|0];g.deck.push(k);window.showCardAcquired?.(k,title)}}
function showRelics(){let g=game(),owned=new Set((g?.relic||[]).map(r=>r[1])),titleOpen=document.getElementById('title')?.classList.contains('on'),ownedOnly=!titleOpen,entries=Object.entries(RELICS).filter(([name])=>!ownedOnly||owned.has(name)),modal=document.getElementById('collectionModal'),grid=document.getElementById('collectionGrid');document.getElementById('collectionTitle').textContent=ownedOnly?'所持レリック':'レリック図鑑・深淵の記憶';document.getElementById('collectionSub').textContent=ownedOnly?`現在の潜航で入手したレリック ${owned.size}個`:`レリックの効果を確認できます。入手 ${owned.size}/${Object.keys(RELICS).length}`;grid.className='modal-shell-body relic-grid';grid.innerHTML=entries.length?'<h3 class="collection-section">🔱 レリック</h3>'+entries.map(([name,[icon,effect]])=>`<article class="relic-card owned ${BOSS_RELICS[name]?'boss-relic-card':''}"><div class="relic-icon">${icon}</div><div><div class="relic-name">${name}${BOSS_RELICS[name]?'<span class="boss-relic-mark">👑 ボスレリック</span>':''}</div><div class="relic-effect">${effect}</div><div class="relic-lock">入手済み</div></div></article>`).join('')+(ownedOnly?'':window.getAbyssMemoryMarkup?.()||''):`<p class="empty-relic-list">まだレリックを入手していません。</p>`;modal.classList.add('on');window.applyFuri?.(modal)}window.openAbyssRelicCollection=showRelics;
let relicReveal=document.createElement('div');relicReveal.className='modal';relicReveal.id='relicRevealModal';relicReveal.innerHTML='<div class="panel relic-reveal"><div class="bigicon" id="relicRevealIcon"></div><h2 id="relicRevealName"></h2><p id="relicRevealEffect"></p><button class="btn gold" id="relicRevealClose">効果を確認</button></div>';document.body.appendChild(relicReveal);window.showRelicAcquired=name=>{let r=RELICS[name];if(!r)return;document.getElementById('relicRevealIcon').textContent=r[0];document.getElementById('relicRevealName').textContent=`レリック「${name}」を獲得`;document.getElementById('relicRevealEffect').textContent=r[1];relicReveal.classList.add('on');window.applyFuri?.(relicReveal)};function closeRelicReveal(){relicReveal.classList.remove('on');setTimeout(()=>window.playPendingAbyssLayerIntro?.(),120)}document.getElementById('relicRevealClose').onclick=closeRelicReveal;relicReveal.onclick=e=>{if(e.target===relicReveal)closeRelicReveal()};
let bossNext=null,bossModal=document.createElement('div');bossModal.className='modal';bossModal.id='bossRelicModal';bossModal.innerHTML='<div class="panel boss-relic-panel"><small id="relicChoiceEyebrow">ABYSSAL TROPHY</small><h2 id="relicChoiceTitle">ボスレリック</h2><p id="relicChoiceText">深海の主から奪う力を1つ選べ。強い力には代償がある。</p><div class="boss-relic-choices" id="bossRelicChoices"></div></div>';document.body.appendChild(bossModal);
function grantBossRelic(name){let g=game(),r=BOSS_RELICS[name];if(!g||!r||g.relic.some(x=>x[1]===name))return false;g.relic.push([r[0],name]);g.pendingBossRelic=false;if(name==='巨鯨の心臓'){g.max+=18;g.hp+=18}if(name==='黄金王座'){g.max=Math.max(20,g.max-8);g.hp=Math.min(g.hp,g.max)}return true}
window.openAbyssRewardRelics=(kind,next)=>{let g=game(),boss=kind==='boss',owned=new Set((g?.relic||[]).map(r=>r[1])),source=boss?Object.keys(BOSS_RELICS):NORMAL_RELICS.filter(n=>!REWARD_BLOCKED.has(n)),pool=source.filter(n=>!owned.has(n)).sort(()=>Math.random()-.5).slice(0,3);if(!g||!pool.length){window.abyssSave?.();return next?.(null)}if(!boss){let name=pool[0],ok=addRelic(name,false);window.abyssSave?.();if(ok)window.showRelicAcquired?.(name);return next?.(ok?name:null)}bossNext=next;document.getElementById('relicChoiceEyebrow').textContent='ABYSSAL TROPHY';document.getElementById('relicChoiceTitle').textContent='ボスレリック';document.getElementById('relicChoiceText').textContent='深海の主から奪う力を1つ選べ。強い力には代償がある。';document.getElementById('bossRelicChoices').innerHTML=pool.map(name=>{let [icon,effect]=RELICS[name],[power,cost]=effect.split('ただし、');return `<button class="boss-relic-choice" data-name="${name}"><i>${icon}</i><b>${name}</b><span class="boss-power">${power}</span>${cost?`<span class="boss-cost">⚠ ${cost}</span>`:''}</button>`}).join('');document.querySelectorAll('#bossRelicChoices .boss-relic-choice').forEach(b=>b.onclick=()=>{let name=b.dataset.name,ok=grantBossRelic(name);if(!ok)return;bossModal.classList.remove('on');let done=bossNext;bossNext=null;done?.(name);window.abyssSave?.();window.showRelicAcquired?.(name)});bossModal.classList.add('on');window.applyFuri?.(bossModal)};
const chooseRewardRelics=window.openAbyssRewardRelics;window.openAbyssRewardRelics=(kind,next)=>{if(kind==='boss')return chooseRewardRelics(kind,next);let g=game(),owned=new Set((g?.relic||[]).map(r=>r[1])),pool=NORMAL_RELICS.filter(n=>!REWARD_BLOCKED.has(n)&&!owned.has(n)).sort(()=>Math.random()-.5);if(!g||!pool.length){window.abyssSave?.();return next?.(null)}let name=pool[0];addRelic(name,false);next?.(name);window.abyssSave?.();window.showRelicAcquired?.(name)};
window.openAbyssBossRelics=next=>window.openAbyssRewardRelics('boss',()=>next?.());
let relicViewButton=document.getElementById('relicView');if(relicViewButton){relicViewButton.disabled=false;relicViewButton.onclick=showRelics}
document.getElementById('deckView')?.addEventListener('click',()=>{document.getElementById('collectionGrid').className='modal-shell-body collection-grid'});
const rare=['marlin','whale','mimic','tsunami','manta','leviathan','abyssarmor'],abyss=['lantern','voidjaw','coelacanth','shadoweel','cthulhu'];
window.ABYSS_EVENTS?.push(
 ['🦴','鯨骨の墓場','巨大な鯨の骨が海底に横たわり、その内側で古い力が脈打っている。',[['骨の中へ入る','HPを10失い、遺物「古代の甲殻」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-10);addRelic('古代の甲殻')}],['ゴールドだけ拾う','ゴールドを55得る',()=>game().pearl+=55],['静かに祈る','HPを10回復',()=>{let g=game();g.hp=Math.min(g.max,g.hp+10)}]]],
 ['🪼','月光クラゲの群れ','青白いクラゲたちが、傷を癒す光の輪を作っている。',[['光に包まれる','遺物「珊瑚の護符」を得る',()=>addRelic('珊瑚の護符')],['群れと泳ぐ','HPを16回復',()=>{let g=game();g.hp=Math.min(g.max,g.hp+16)}],['光を結晶化する','ゴールド35を払い、レアカードを得る',()=>{let g=game();if(g.pearl>=35){g.pearl-=35;addCard(rare)}}]]],
 ['🧪','沈んだ研究所','割れた水槽と機械の中に、カードを作り変える装置が残っている。',[['装置を動かす','指定した未強化カードを1枚強化する',()=>window.chooseAbyssUpgrades?.(1,'装置で強化するカードを選ぶ')],['古いカードを溶かす','指定した基本カードを1枚削除する',()=>window.chooseAbyssRemovals?.(1,'溶かす基本カードを選ぶ',k=>['fin','scale'].includes(k.replace(/[+*]+$/,'')))],['部品を売る','HPを6失い、ゴールド45を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-6);g.pearl+=45}]]],
 ['🥚','リヴァイアサンの卵','鼓動する巨大な卵。殻の奥から、深淵の力が呼びかけてくる。',[['力を受け取る','HPを12失い、レアカードを得る',()=>{let g=game();g.hp=Math.max(1,g.hp-12);addCard(rare)}],['殻を身につける','最大HPが5増え、HPを5回復',()=>{let g=game();g.max+=5;g.hp+=5}],['牙を抜く','最大HPを4失い、遺物「潮流の牙」を得る',()=>{let g=game();g.max=Math.max(20,g.max-4);g.hp=Math.min(g.hp,g.max);addRelic('潮流の牙')}]]],
 ['🔥','黄金炉の祭壇','ゴールドを炎に変える古代の炉。熱い泡が周囲を包んでいる。',[['炉にゴールドを捧げる','ゴールド45を払い、遺物「黄金炉」を得る',()=>{let g=game();if(g.pearl>=45){g.pearl-=45;addRelic('黄金炉')}}],['命の炎を浴びる','HPを全回復するが、最大HPを5失う',()=>{let g=game();g.max=Math.max(20,g.max-5);g.hp=g.max}],['立ち去る','何も起こらない',()=>{}]]],
 ['👻','幽霊船の航路','霧の中から幽霊船が現れた。船長は三つの航路を指し示す。',[['安全な航路','遺物「航海羅針盤」を得る',()=>addRelic('航海羅針盤')],['宝の航路','HPを9失い、ゴールド70を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-9);g.pearl+=70}],['禁じられた航路','HPを12失い、深淵カードを得る',()=>{let g=game();g.hp=Math.max(1,g.hp-12);addCard(abyss)}]]],
 ['⏱️','沈んだ観測所','壊れた時計だけが、海底でまだ正確に時を刻んでいる。',[['時計を持ち帰る','HPを8失い、遺物「深海時計」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-8);addRelic('深海時計')}],['黒い鱗を拾う','ゴールド35を払い、遺物「黒潮の鱗」を得る',()=>{let g=game();if(g.pearl>=35){g.pearl-=35;addRelic('黒潮の鱗')}}],['時間を乱さない','何も起こらない',()=>{}]]],
 ['👁️','捕食者の祭壇','無数の牙に囲まれた祭壇で、三つの遺物が獲物を待っている。',[['眼を受け入れる','最大HPを4失い、遺物「捕食者の眼」を得る',()=>{let g=game();g.max=Math.max(20,g.max-4);g.hp=Math.min(g.hp,g.max);addRelic('捕食者の眼')}],['指輪をはめる','HPを10失い、遺物「毒腺の指輪」を得る',()=>{let g=game();g.hp=Math.max(1,g.hp-10);addRelic('毒腺の指輪')}],['眠る玉を起こす','ゴールド45を払い、遺物「深海金貨」を得る',()=>{let g=game();if(g.pearl>=45){g.pearl-=45;addRelic('深海金貨')}}]]],
 ['🗼','目のない灯台','海底に立つ灯台が、光ではなく黒い影を放っている。影の中から自分の声が聞こえる。',[['影を見つめる','最大HPを3失い、深淵カードを得る',()=>{let g=game();g.max=Math.max(20,g.max-3);g.hp=Math.min(g.hp,g.max);addCard(abyss)}],['灯りを消す','HPを14回復する',()=>{let g=game();g.hp=Math.min(g.max,g.hp+14)}],['声から逃げる','ゴールドを20失う',()=>{let g=game();g.pearl=Math.max(0,g.pearl-20)}]]],
 ['🌟','墜星の亡骸','空から落ちたはずの巨大な星が、海底で腐りながら呼吸している。触れた者の未来を食べるという。',[['核に触れる','50%でレアカード。失敗するとHPを15失う',()=>{let g=game();if(Math.random()<.5)addCard(rare,'成功！ レアカードを獲得');else{g.hp=Math.max(1,g.hp-15);window.showAbyssOutcome?.(false,'抽選結果：外れ','星の核は砕け、HPを15失った。')}}],['欠片を売る','最大HPを3失い、ゴールドを70得る',()=>{let g=game();g.max=Math.max(20,g.max-3);g.hp=Math.min(g.hp,g.max);g.pearl+=70}],['亡骸を埋める','HPを8回復する',()=>{let g=game();g.hp=Math.min(g.max,g.hp+8)}]]],
 ['🪞','反転する海溝','海溝の底に、上へ向かって落ち続けるもう一つの海が見える。供物を落とせば力が返る。',[['カードを捧げる','指定したカード1枚を失い、最大HP＋7',()=>window.chooseAbyssRemovals?.(1,'海溝へ捧げるカードを選ぶ',()=>true,()=>{let g=game();g.max+=7;g.hp+=7})],['ゴールドを落とす','ゴールド40を失い、HPを全回復',()=>{let g=game();if(g.pearl>=40){g.pearl-=40;g.hp=g.max}}],['何も落とさない','海溝がHPを5奪う',()=>{let g=game();g.hp=Math.max(1,g.hp-5)}]]],
 ['🤿','もう一人の潜水者','暗闇から、未来のあなたが泳いでくる。「一枚だけ変えろ。でなければ同じ場所で死ぬ」',[['未来を信じる','指定した未強化カード1枚を強化',()=>window.chooseAbyssUpgrades?.(1,'未来を変えるカードを選ぶ')],['未来を奪う','HPを10失い、深淵カードを得る',()=>{let g=game();g.hp=Math.max(1,g.hp-10);addCard(abyss)}],['目をそらす','何も起こらない',()=>{}]]]
);
})();
