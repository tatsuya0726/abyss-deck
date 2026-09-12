(()=>{'use strict';
const $=s=>document.querySelector(s);
const BEASTS=[
 {n:'飢えたウツボ',file:'moray-eel.webp',face:1,desc:'岩穴にかくれ、長い体で急におそってくる。口を大きく開くが、守りを固めるターンもある。'},
 {n:'甲冑ガニ',file:'armored-crab.webp',face:0,desc:'とても固いこうらと大きなハサミを持つ。先に守りを作るので、強い一撃で割ろう。'},
 {n:'毒針ミノカサゴ',file:'lionfish.webp',face:1,desc:'きれいなひれに毒のトゲをかくしている。毒針はその場の追加ダメージで、次のターンには残らない。'},
 {n:'銀牙バラクーダ',file:'barracuda.webp',face:1,desc:'銀色に光る高速ハンター。守らず何度もかみつくため、早めに倒すのが安全。'},
 {n:'墓守オオグソクムシ',file:'giant-isopod.webp',face:0,desc:'深海のそうじ屋。何重ものこうらで身を守り、じっくり大きな攻撃をねらう。'},
 {n:'奈落のチョウチンアンコウ',file:'anglerfish.webp',face:1,desc:'光るちょうちんで獲物を近づける。大きな歯と毒を持つ、深海の待ちぶせ名人。'},
 {n:'青光ホウライエソ',file:'viperfish.webp',face:1,desc:'体の青い光で仲間に合図する。体より長い牙で、守りのすき間をねらってくる。'},
 {n:'紅腕ダイオウイカ',file:'giant-squid.webp',face:0,desc:'長い腕で相手をつかむ巨大なイカ。小さな攻撃のあと、強い一撃をくり出す。'},
 {n:'深海ミツクリザメ',file:'goblin-shark.webp',face:1,desc:'長い鼻と、前へ飛び出すあごを持つ珍しいサメ。次の攻撃が大きいときは必ず守ろう。'},
 {n:'古代魚シーラカンス',file:'coelacanth.webp',face:1,desc:'太古から姿がほとんど変わらない「生きた化石」。体力と守りが高く、長い戦いになる。'},
 {n:'竜宮の使者',file:'oarfish.webp',face:0,desc:'リュウグウノツカイに似た神秘の魚。赤いひれで海流を操り、攻撃と守りを切り替える。'},
 {n:'UMA・海坊主',file:'umi-bozu.webp',face:0,desc:'正体不明の黒い海の怪物。船乗りの昔話に出てくるUMAで、大きな壁のように立ちはだかる。'},
 {n:'白骨鮫・モルディガン',file:'bone-shark-wide-v101.webp',face:0,gen:1,desc:'フジツボの王冠をまとった白い巨大ザメ。強烈なかみつきの前に、十分なブロックを作ろう。'},
 {n:'深淵王クラーケン',file:'kraken-wide-v101.webp',face:0,gen:1,desc:'深海神殿で眠る最後の王。何本もの腕、毒、鉄壁の守りを使うクトゥルフ風の大怪物。'},
 {n:'奈落牙オニキンメ',file:'fangtooth.webp',face:0,gen:1,desc:'体に似合わない長い牙を持つ深海魚。攻撃のあとに毒牙を重ねるため、行動予測をよく見よう。'},
 {n:'大口フクロウナギ',file:'pelican-eel.webp',face:0,gen:1,desc:'袋のように大きく開く口で獲物を包む。大口を何度も閉じる連続攻撃をしかける。'},
 {n:'透頭デメニギス',file:'barreleye.webp',face:0,gen:1,desc:'透明な頭の中に上向きの目を持つ。こちらの動きを読み、防御と攻撃を切り替える。'},
 {n:'夢耳メンダコ',file:'flapjack-octopus-transparent-v110.webp',face:0,gen:1,desc:'耳のようなひれで暗い海を漂う。かわいらしい姿だが、腕を広げた二段攻撃を使う。'},
 {n:'古代鮫ラブカ',file:'frilled-shark-transparent-v110.webp',face:0,gen:1,desc:'原始的な姿を残す細長いサメ。六対のえらと鋭い歯を持ち、四回連続で獲物へ噛みつく。'},
 {n:'暴食ボウエンギョ',file:'black-swallower-transparent-v110.webp',face:0,gen:1,desc:'自分より大きな獲物をのみ込める伸びる腹を持つ。奈落で力をため、強烈な攻撃を放つ。'},
 {n:'三脚ミツマタヤリウオ',file:'tripod-fish-transparent-v110.webp',face:0,gen:1,desc:'長く伸びたひれで海底に立ち、流れてくる獲物を待つ。防御が高く、三本のひれで連続攻撃する。'},
 {n:'灯喰いアンコウ・ネブラ',file:'boss-nebula-transparent-v86.webp',face:1,gen:1,desc:'光そのものを食べる巨大アンコウ。守りを固めて力をため、暗闇から重い一撃を放つ。'},
 {n:'鎧王ダイオウグソクムシ',file:'boss-isopod-king.webp',face:0,gen:1,desc:'海底城を背負う甲殻の王。高いブロックと甲殻反射で長期戦を仕掛ける。'},
 {n:'夢喰いダイオウイカ・ノクス',file:'boss-nox-squid.webp',face:1,gen:1,desc:'眠りの霧をまとう巨大イカ。脱力でこちらの攻撃を鈍らせ、夢を食べるほど強くなる。'},
 {n:'沈没艦ザメ・アビサル',file:'boss-warship-shark.webp',face:1,gen:1,desc:'沈没戦艦と融合したシュモクザメ。装甲突撃でブロックを削り、多段砲撃を浴びせる。'},
 {n:'星喰らいクトゥルム',file:'boss-star-cthulum.webp',face:0,gen:1,desc:'星核を抱く宇宙クラゲの古神。星を飲み込むたびに力を蓄え、守りから猛攻へ転じる。'},
 {n:'終焉竜ヒュドラ・アビス',file:'boss-hydra-transparent-v86.webp',face:1,gen:1,desc:'三つの頭を持つ奈落の海竜。三連撃、二連撃、防御破砕を休みなく切り替える。'},
 {n:'深海皇リヴァイアサン',file:'abyss-emperor-leviathan-clean.webp',face:0,gen:1,desc:'奈落海を支配する最後の皇帝。古代の鎧、猛毒、巨大な牙を持つ最強の深海怪物。'},
 {n:'深淵の監視者・フグ店長',file:'abyss-watcher-puffer-v2.webp',face:0,gen:1,desc:'黒い操り糸に侵食されたフグ店長。制服を突き破る棘と虚海の亀裂をまとい、残った意識で必死に抵抗している。'},
 {n:'深淵の守護者・クトゥル＝アビス',file:'abyss-guardian-cthulhu-v2.webp',face:0,gen:1,desc:'沈没都市を甲殻として背負う巨大な深海邪神。六つの儀式で潮圧、毒喰い、反応攻撃を重ね、虚無を抱く胸から深海崩壊を放つ。'},
 {n:'鎖顎鮫・グラウド',file:'elite-chain-shark-graud.webp',face:0,gen:1,desc:'朽ちた鎖を全身に巻きつけたサメ。噛みつくたびに鎖が軋み、こちらの守りごと引きちぎる。'},
 {n:'閃光蝦・ライジェル',file:'elite-mantis-shrimp-raizeru.webp',face:0,gen:1,desc:'発光する一対の巨大な鋏を持つ深海のシャコ。拳を重ねるほど衝撃が育ち、大きな一撃が飛んでくる。'},
 {n:'鋼骸鮫・ゾルグ',file:'elite-steel-shark-zorugu.webp',face:0,gen:1,desc:'鋼の装甲と青い雷紋をまとうサメ。装甲が帯びる余波が、こちらのエナジーを乱す。装甲の棘に攻撃を当てると反撃を受ける。'},
 {n:'白霜大蟹・スノウクロウ',file:'elite-snow-crab-snowclaw.webp',face:0,gen:1,desc:'白い体毛と巨大な鋏を持つ大蟹。凍てつく鋏の一撃は、力そのものを凍らせる。'},
 {n:'電紋鮟鱇・ヴォルティア',file:'elite-volt-anglerfish-voltia.webp',face:0,gen:1,desc:'雷紋の光を放つ王冠状のヒレを持つ深海魚。放電の灯りが毒すら喰らい、殻へと変える。'},
 {n:'古骸主・ノーティラム',file:'elite-nautilus-lord-nautilam.webp',face:0,gen:1,desc:'古い甲殻に触腕を宿すアンモナイトの主。分厚い殻に受けた衝撃を、そのまま撃ち返してくる。'},
 {n:'灯呪蛇王・ルミナグ',file:'elite-lantern-serpent-luminagu.webp',face:0,gen:1,desc:'灯りの飾りを纏う大蛇の王。噛みつくたびに古い呪いの毒を注ぎ込んでくる。'},
 {n:'深紅女王・ヴェスパルナ',file:'elite-crimson-queen-vesparna.webp',face:0,gen:1,desc:'紅い瞳と王冠を戴くコウモリ状の魔物。羽ばたいて守るたび、紅い力が際限なく膨れ上がる。'},
 {n:'燭海主・ルクスメドゥーサ',file:'elite-chandelier-jelly-luxmedusa.webp',face:0,gen:1,desc:'燭台のような傘を持つ巨大クラゲの主。無数の触手が連撃を放ち、命中のたび生命を吸い上げる。'}
];
// Only warm explicitly requested enemies; the title no longer downloads every boss.
const warmedEnemies=new Set();
window.preloadEnemyAssets=(names=[])=>BEASTS.filter(b=>names.includes(b.n)).forEach(b=>{if(warmedEnemies.has(b.file))return;warmedEnemies.add(b.file);const img=new Image();img.decoding='async';img.fetchPriority='low';img.src=`assets/enemies/${b.file}?v=79`});
const normalizeBeastName=n=>String(n||'').replace(/^(精鋭|深淵強化)・/,'').replace('深淵の守護者・アトラク＝ナクア','深淵の守護者・クトゥル＝アビス').trim();
const findBeast=n=>{n=normalizeBeastName(n);return BEASTS.find(x=>x.n===n)};
const LAYER_1=new Set(['飢えたウツボ','甲冑ガニ','毒針ミノカサゴ','銀牙バラクーダ','墓守オオグソクムシ','奈落のチョウチンアンコウ','鎖顎鮫・グラウド','閃光蝦・ライジェル','鋼骸鮫・ゾルグ']);
const LAYER_2=new Set(['青光ホウライエソ','紅腕ダイオウイカ','深海ミツクリザメ','古代魚シーラカンス','竜宮の使者','UMA・海坊主','白霜大蟹・スノウクロウ','電紋鮟鱇・ヴォルティア','古骸主・ノーティラム']);
const LAYER_3=new Set(['奈落牙オニキンメ','大口フクロウナギ','透頭デメニギス','夢耳メンダコ','古代鮫ラブカ','暴食ボウエンギョ','三脚ミツマタヤリウオ','灯呪蛇王・ルミナグ','深紅女王・ヴェスパルナ','燭海主・ルクスメドゥーサ']);
const BOSS_PLACES={'白骨鮫・モルディガン':'第1層・1680m（ボス）','灯喰いアンコウ・ネブラ':'第1層・1680m（ボス）','鎧王ダイオウグソクムシ':'第1層・1680m（ボス）','深淵王クラーケン':'第2層・3600m（ボス）','夢喰いダイオウイカ・ノクス':'第2層・3600m（ボス）','沈没艦ザメ・アビサル':'第2層・3600m（ボス）','深海皇リヴァイアサン':'第3層・5520m（ボス）','星喰らいクトゥルム':'第3層・5520m（ボス）','終焉竜ヒュドラ・アビス':'第3層・5520m（ボス）','深淵の監視者・フグ店長':'深淵領域（ボス）','深淵の守護者・クトゥル＝アビス':'深淵領域（ボス）'};
const BEAST_GROUPS=[
 ['第1層','薄明の沈降海',[...LAYER_1,'白骨鮫・モルディガン','灯喰いアンコウ・ネブラ','鎧王ダイオウグソクムシ']],
 ['第2層','忘れられた深海',[...LAYER_2,'深淵王クラーケン','夢喰いダイオウイカ・ノクス','沈没艦ザメ・アビサル']],
 ['第3層','奈落の王域',[...LAYER_3,'深海皇リヴァイアサン','星喰らいクトゥルム','終焉竜ヒュドラ・アビス']],
 ['深淵領域','四つの欠片が開く海',['深淵の監視者・フグ店長','深淵の守護者・クトゥル＝アビス']]
];
function beastPlace(n){if(BOSS_PLACES[n])return BOSS_PLACES[n];if(LAYER_1.has(n))return '第1層・0〜1440m';if(LAYER_2.has(n))return '第2層・1920〜3360m';if(LAYER_3.has(n))return '第3層・3840〜5280m';return '出現深度不明'}
window.syncEnemyArt=()=>{let enemy=window.getAbyssGame?.()?.enemy,s=$('#enemySprite');if(!s||!enemy)return;let b=findBeast(enemy.n);if(!b){s.style.backgroundImage='';s.classList.remove('direct-enemy','boss-enemy','elite-enemy','secret-keeper','secret-guardian');s.parentElement?.classList.remove('boss-unit','elite-unit');return}if(s.dataset.enemyArtKey===b.n&&!s.textContent&&s.classList.contains('direct-enemy'))return;s.dataset.enemyArtKey=b.n;let isBoss=!!BOSS_PLACES[b.n],isElite=!isBoss&&!!enemy.elite,flip=BESTIARY_FLIP.has(b.file);s.style.setProperty('--face',flip?-1:1);['creature','enemy-art','direct-enemy'].forEach(c=>{if(!s.classList.contains(c))s.classList.add(c)});s.classList.toggle('generated-enemy',!!b.gen);s.classList.toggle('face-left',flip);s.classList.toggle('face-front',!flip);s.classList.toggle('boss-enemy',isBoss);s.classList.toggle('elite-enemy',isElite);s.classList.toggle('secret-keeper',b.n==='深淵の監視者・フグ店長');s.classList.toggle('secret-guardian',b.n==='深淵の守護者・クトゥル＝アビス');s.parentElement?.classList.toggle('boss-unit',isBoss);s.parentElement?.classList.toggle('elite-unit',isElite);let bg=`url("assets/enemies/${b.file}?v=79")`;if(s.style.backgroundImage!==bg)s.style.backgroundImage=bg;if(s.textContent)s.textContent=''};
window.recordDefeat=n=>{let d=JSON.parse(localStorage.abyssDefeated||'{}'),key=n.replace(/^(精鋭|深淵強化)・/,'');d[key]=(d[key]||0)+1;localStorage.abyssDefeated=JSON.stringify(d)};
function inject(){let nav=document.createElement('div');nav.className='quick-nav';nav.innerHTML='<button id="deckView">🎴 デッキ</button><button id="beastView">🐟 図鑑</button><button id="effectView">？ 効果</button><button id="relicView">🔱 レリック</button>';document.querySelector('.hud')?.insertBefore(nav,document.querySelector('.res'));let m=document.createElement('div');m.className='modal';m.id='collectionModal';m.innerHTML='<div class="panel collection-panel modal-shell"><header class="modal-shell-head"><div><h2 id="collectionTitle">デッキ</h2><p id="collectionSub"></p></div></header><div class="modal-shell-body collection-grid" id="collectionGrid"></div><footer class="modal-shell-foot"><button class="btn" id="collectionClose">閉じる</button></footer></div>';document.body.appendChild(m);$('#deckView').onclick=showDeck;$('#beastView').onclick=showBeasts;$('#collectionClose').onclick=()=>m.classList.remove('on');m.onclick=e=>{if(e.target===m)m.classList.remove('on')}}
function showDeck(){let g=window.getAbyssGame?.(),deck=g?.deck||[],$g=$('#collectionGrid');$g.className='modal-shell-body collection-grid unified-card-grid';$('#collectionTitle').textContent='いまのデッキ';$('#collectionSub').textContent=`ぜんぶで ${deck.length} 枚。戦闘中と同じ表示で確認できます。`;let counts={};deck.forEach(k=>counts[k]=(counts[k]||0)+1);$g.innerHTML=Object.entries(counts).map(([k,num])=>window.renderAbyssCardView?.(k,{quantity:num,live:true})||'').join('')||'<p>潜水を始めるとカードが表示されます。</p>';$('#collectionModal').classList.add('on')}
function cardData(k){let c=window.getAbyssCardStats?.(k)||window.getAbyssCardData?.(k);if(c)return{name:c.n,text:c.t,cost:c.c,cl:c.r?'rare':c.a?'abyss':c.u?'uncommon':''};return{name:k,text:'',cost:0,cl:''}}
// Source artwork facing right; flip only the illustration in the bestiary.
const BESTIARY_FLIP=new Set(['moray-eel.webp','lionfish.webp','barracuda.webp','giant-isopod.webp','anglerfish.webp','viperfish.webp','goblin-shark.webp','coelacanth.webp','boss-nebula-transparent-v86.webp','boss-warship-shark.webp','boss-hydra-transparent-v86.webp','boss-star-cthulum.webp']);
function showBeasts(){let dead=JSON.parse(localStorage.abyssDefeated||'{}'),grid=$('#collectionGrid'),g=window.getAbyssGame?.(),abyssOpen=localStorage.getItem('abyssRegionUnlocked')==='1'||g?.act===4||g?.secretMap||g?.secretCleared||dead['深淵の監視者・フグ店長']||dead['深淵の守護者・クトゥル＝アビス'],deepNames=new Set(['深淵の監視者・フグ店長','深淵の守護者・クトゥル＝アビス']),card=b=>{if(deepNames.has(b.n)&&!abyssOpen)return '<article class="beast-card locked abyss-sealed"><div class="beast-img"><span>？</span></div><h3>？？？？？</h3><p class="beast-location">📍 ？？？？？</p><p>？？？？？？？？？？</p></article>';let seen=dead[b.n];return `<article class="beast-card ${seen?'':'locked'}"><div class="beast-img direct-enemy ${b.gen?'generated-enemy':''}" style="--bestiary-facing:${BESTIARY_FLIP.has(b.file)?-1:1};background-image:url('assets/enemies/${b.file}?v=101')"></div><h3>${seen?b.n:'？？？？？'}</h3><p class="beast-location">📍 ${beastPlace(b.n)}</p><p>${seen?b.desc:'たおすと特徴がわかります。'}</p>${seen?`<p class="beast-count">討伐 ${dead[b.n]}回</p>`:''}</article>`};grid.className='modal-shell-body collection-grid beast-legacy-grid';$('#collectionTitle').textContent='深海生物図鑑';$('#collectionSub').textContent=`見つけた生き物 ${BEASTS.filter(b=>dead[b.n]).length} / ${BEASTS.length}`;grid.innerHTML=BEAST_GROUPS.map(([title,subtitle,names])=>`<header class="beast-layer-heading"><span>${title}</span><small>${subtitle}</small></header>${names.map(name=>BEASTS.find(b=>b.n===name)).filter(Boolean).map(card).join('')}`).join('');$('#collectionModal').classList.add('on');window.applyFuri?.($('#collectionModal'))}
window.openAbyssBestiary=showBeasts;
inject();
})();
