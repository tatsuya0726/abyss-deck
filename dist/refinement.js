(()=>{'use strict';
const paths={mystery:'M16 3 29 16 16 29 3 16Z M11 12a5 5 0 0 1 10 0c0 4-5 3-5 7 M16 23v1',forge:'M6 8h13v6H6z M13 14v13 M20 5l6 6 M24 5l-4 6',mirror:'M8 5h16v22H8z M11 21 21 11 M11 14l5-5',treasure:'M5 12h22v15H5z M5 12l4-7h14l4 7 M5 18h22 M14 16h4v5h-4z',tide:'M3 12q6-8 13 0t13 0 M3 20q6-8 13 0t13 0',star:'m16 3 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z',chart:'M4 7l8-3 8 3 8-3v21l-8 3-8-3-8 3Z M12 4v21 M20 7v21',key:'M19 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12 M15 15 4 27 M7 24l-3-3 M10 21l-3-3',heart:'M16 27 5 16C-3 5 11 0 16 9 21 0 35 5 27 16Z',eye:'M3 16q13-19 26 0-13 19-26 0Z M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10'};
const eventArt={
'歌う珊瑚礁':'singing-coral','沈没船の晩餐':'sunken-banquet','深海の魔女':'deep-witch','熱水噴出孔':'hydrothermal-vent',
'傷ついた海図師':'wounded-cartographer','海図師の秘密航路':'secret-route','眠る珊瑚の種':'sleeping-coral-seed','芽吹いた記憶珊瑚':'memory-coral',
'欠片を抱く蒼い魚影':'blue-shard-fish','ほどけた黒糸':'black-threads','逆流する記憶庫':'memory-vault','虚海の天秤':'void-scales',
'深海鍛冶の炉':'abyss-forge','記憶喰いの二枚貝':'memory-clam','沈没船の宝の地図':'treasure-map','地図が示す黄金墓標':'golden-tomb',
'封鎖された研究区画':'sealed-lab','幽閉された深海研究者':'imprisoned-researcher','漂流する補給庫':'supply-cache','沈没船の回収装置':'salvage-device',
'記憶を映す潮だまり':'memory-tidepool','鯨骨の墓場':'whale-graveyard','月光クラゲの群れ':'moon-jellies','沈んだ研究所':'sunken-lab',
'リヴァイアサンの卵':'leviathan-egg','黄金炉の祭壇':'golden-furnace','幽霊船の航路':'ghost-route','沈んだ観測所':'observatory',
'捕食者の祭壇':'predator-altar','目のない灯台':'eyeless-lighthouse','墜星の亡骸':'fallen-star','反転する海溝':'inverted-trench',
'もう一人の潜水者':'future-diver','漂流者の遺品':'castaway-bag','深海から見つめる眼':'abyss-eye','星喰いの死骸':'star-eater',
'形のない海溝':'formless-trench','光る珊瑚の休息':'coral-rest','鏡鱗に写すカード':'mirror-card','忘れさせるカード':'forget-clam',
'刻印するカードを選ぶ':'mark-forge','深海の門':'abyss-gate'
};
window.abyssEventIcon=(icon='',title='')=>{const art=eventArt[title];if(art)return `<img class="event-illustration" src="assets/events/${art}.webp?v=3" alt="" aria-hidden="true">`;const k=/鍛|炉|磨|強化/.test(title)?'forge':/鏡|写|複製/.test(title)?'mirror':/地図|航路/.test(title)?'chart':/鍵|研究|牢/.test(title)?'key':/宝|回収|補給/.test(title)?'treasure':/眼|見つめ/.test(title)?'eye':/星|核/.test(title)?'star':/休|回復|珊瑚|生命/.test(title)?'heart':/海溝|流|潮/.test(title)?'tide':'mystery';return `<svg class="event-seal seal-${k}" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[k]}"/></svg>`};
window.polishShop=grid=>{const panel=grid.closest('.shop-panel');let nav=panel.querySelector('.shop-tabs');if(!nav){nav=document.createElement('nav');nav.className='shop-tabs';nav.setAttribute('aria-label','売り場');for(const [key,name]of [['all','すべて'],['cards','カード'],['relics','レリック'],['service','整備']]){let b=document.createElement('button');b.textContent=name;b.dataset.tab=key;b.onclick=()=>{panel.dataset.shopTab=key;apply();grid.scrollTop=0};nav.appendChild(b)}grid.before(nav)}
function apply(){const tab=panel.dataset.shopTab||'all';nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));grid.querySelectorAll(':scope > .shop-stock-section').forEach((s,i)=>s.hidden=tab!=='all'&&tab!==(i?'relics':'cards'));grid.querySelectorAll(':scope > .shop-item').forEach(s=>s.hidden=tab!=='all'&&tab!=='service')}
apply();const g=window.getAbyssGame?.();grid.querySelectorAll('.market-item').forEach(b=>{let small=b.querySelector('small'),cost=Number(small?.textContent.match(/🪙\s*(\d+)/)?.[1]);if(cost>g.pearl&&!b.disabled){b.classList.add('unaffordable');small.append(document.createTextNode(` / あと🪙 ${cost-g.pearl}`))}});};
const g=()=>window.getAbyssGame?.(),result=(ok,t,s)=>window.showAbyssOutcome?.(ok,t,s),gain=k=>{g().deck.push(k);window.showCardAcquired?.(k,'補給カードを獲得')};
const events=[
['','漂流する補給庫','防御を整えるか、連撃を狙うか。次の戦いに必要な一枚だけ持ち出せる。',[
 ['守りを補給','大潮の城壁を1枚得る。15ブロック。',()=>gain('tidewall')],['連撃を補給','魚群連撃を1枚得る。3ダメージを3回。',()=>gain('school')],['物資を換金','カードを増やさず、39ゴールドを得る。',()=>{g().pearl+=39;result(true,'物資の売却','39ゴールドを得た。')}]]],
['','沈没船の回収装置','宝を引き上げるほど船体がきしむ。安全な小箱か、危険な金庫か。',[
 ['小箱を回収','確実に28ゴールドを得る。',()=>{g().pearl+=28;result(true,'小箱を回収','28ゴールドを得た。')}],['金庫を回収','50%で110ゴールド。失敗するとHPを最大12失う（HP1は残る）。',()=>{if(Math.random()<.5){g().pearl+=110;result(true,'金庫が開いた','110ゴールドを得た！')}else{const loss=Math.min(12,g().hp-1);g().hp-=loss;result(false,'船体が崩れた',`HPを${loss}失った。`)}}],['救命物資を回収','HPを10回復する。',()=>{const n=Math.min(10,g().max-g().hp);g().hp+=n;result(true,'救命物資を回収',`HPを${n}回復した。`)}]]],
['','記憶を映す潮だまり','水面には手持ちのカードが映っている。お気に入りを増やすか、別の一枚に賭けるか。',[
 ['同じ一枚を写す','指定したカードを複製。HPを最大10失う（HP1は残る）。',()=>window.openAbyssDuplicate?.()],['違う一枚に変える','指定したカードをランダムに変化。HPを最大6失う（HP1は残る）。',()=>window.openAbyssTransform?.()],['水面を静める','カードを変えず、HPを6回復する。',()=>{const n=Math.min(6,g().max-g().hp);g().hp+=n;result(true,'静かな水面',`HPを${n}回復した。`)}]]]
];
events.forEach((ev,i)=>{const original=ev[3];ev.storyWhen=s=>!s.polishEvents?.includes(i);ev[3]=original.map(o=>[o[0],o[1],()=>{g().polishEvents||=[];g().polishEvents.push(i);o[2]()}]);window.ABYSS_EVENTS?.push(ev)});
})();
