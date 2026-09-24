(()=>{'use strict';
window.ABYSS_TACTICAL_CARDS={
rampage:{u:0,r:1},
bettarevenge:{n:'ベタの逆襲',i:'🐟',c:1,revengeDamage:1,upgrade:{c:-1},t:'この戦闘でHPに受けたダメージと同じ値を敵に与える。ブロックで防いだ分は含まない。',g:'こうげき'},
cleaner:{c:1,he:3,dr:0,fullHealBlock:8,upgrade:{he:2},t:'HP3回復。使用前からHP満タンなら、代わりに8ブロック。使い切り。'},
ink:{c:1,b:6,w:1,quietDraw:2,upgrade:{b:2,w:1},t:'6ブロック。脱力1。敵が攻撃を予定していなければ2枚引く。',upgradeText:'8ブロック。脱力2。敵が攻撃を予定していなければ2枚引く。'},
electric:{c:1,d:7,surge:7,upgrade:{d:3},t:'7ダメージ。残りエナジーを最大2消費し、1につき追加7ダメージ。'},
remora:{c:1,s:1,futureEnergy:1,upgrade:{c:-1},t:'攻撃力＋1。次のターンのエナジー＋1。'},
tidewall:{c:2,b:10,futureBlock:6,upgrade:{b:4},t:'10ブロック。次のターン開始時に6ブロック。'},
reefstance:{c:1,def:0,b:5,bankBlock:Infinity,upgrade:{b:4},t:'5ブロック。敵の行動後に残ったブロックを次のターンへ持ち越す。'},
mimic:{c:1,s:0,dr:0,choice:'dredge',upgrade:{c:-1},t:'山札の上3枚から1枚を選んで手札へ。残りは捨て札へ。'},
lantern:{c:1,en:0,dr:1,hu:0,futureEnergy:1,generateCurse:1,upgrade:{generateCurse:1},t:'捨て札に呪いを1枚生成。カードを1枚引く。次のターンのエナジー＋1。',upgradeText:'捨て札に呪いを2枚生成。カードを1枚引く。次のターンのエナジー＋1。'},
shadoweel:{c:2,p:0,b:0,spendPoison:0,curseScale:6,upgrade:{curseScale:2},t:'戦闘中の呪い1枚につき6ダメージと6ブロック。',upgradeText:'戦闘中の呪い1枚につき8ダメージと8ブロック。'},
coelacanth:{c:3,s:0,he:0,doubleFirstPower:1,retain:0,exhaust:1,upgrade:{retain:1},t:'この戦闘中、次のターンから各ターン最初に使う別のカードが、1回分のコストで2回発動する。使い切り。',upgradeText:'この戦闘中、次のターンから各ターン最初に使う別のカードが、1回分のコストで2回発動する。保留。使い切り。'},
cthulhu:{c:2,d:0,s:0,graveSize:0,turnDrawPower:1,exhaust:1,upgrade:{c:-1},t:'この戦闘中、毎ターン開始時にカードを追加で1枚引く。使い切り。'},
venombloom:{c:1,b:4,doublePoison:0,poisonBloom:8,upgrade:{b:3},t:'4ブロック。現在の毒の半分を追加で与える。'},
moltscale:{c:0,b:3,exhaust:0,retain:1,upgrade:{b:2},t:'3ブロック。使わずにターンを終えると、このカードは手札に残る。'}
};
const has=(g,n)=>g.relic?.some(r=>r[1]===n),data=k=>window.getAbyssCardData?.(k)||{},attack=c=>!!(c.d||c.perBlock),block=(g,n)=>{g.block+=n;if(g.runStats)g.runStats.blockGained+=n};
window.prepareAbyssTactics=(c,g,draw)=>{
 const prev=data(g.lastCard),attacking=!!g.enemy?.intent?.a;
 if((c.exhaust||c.perExhaustCard&&g.hand.length)&&!c.randomExhaustHand)window.tacticalCardMoved?.(g,'exhaust');
 if(c.c>=2&&has(g,'圧力真珠')&&!g.pressurePearlUsed){g.pressurePearlUsed=true;block(g,6);window.abyssImpact?.('#playerSprite','guard')}
 g.damageBlockCardEligible=!!(c.d||c.perBlock||c.perExhaustCard);
 g.damageBlockCardTriggered=false;
 if(c.revengeDamage){c.d=Math.max(0,(g.battleDamageTaken||0)-(g.str||0));c.t=c.t.replace('同じ値',`同じ値（現在${g.battleDamageTaken||0}）`)}
 if(c.fullHealBlock&&g.hp>=g.max){c.he=0;c.b=c.fullHealBlock}
 if(c.readAttackBlock&&attacking)c.b+=c.readAttackBlock;if(c.readAttackDraw&&attacking)draw(c.readAttackDraw);if(c.quietEnergy&&!attacking)g.energy+=c.quietEnergy;
 if(c.quietDraw&&!attacking)draw(c.quietDraw);
 if(c.surge){const used=Math.min(2,g.energy);g.energy-=used;c.d+=used*c.surge}if(c.lowHpBonus&&g.hp<=g.max*.5)c.d+=c.lowHpBonus;
 if(c.graveAttack)c.d+=Math.min(3,g.discard.filter(k=>attack(data(k))).length)*c.graveAttack;
 if(c.graveSize)c.d+=Math.min(6,g.discard.length)*c.graveSize;
 if(c.alternate){if(prev.b||prev.def)c.d+=c.alternate;if(attack(prev))c.b+=c.alternate}
 if(c.spendPoison){const n=Math.min(c.spendPoison,g.poison);g.poison-=n;c.b=n*3}
 if(c.poisonBloom)c.p=Math.min(c.poisonBloom,Math.ceil(g.poison/2));
 if(c.generateCurse)for(let i=0;i<c.generateCurse;i++)g.discard.push('abysscurse');if(c.redrawHand){const n=g.hand.length;g.discard.push(...g.hand.splice(0));if(n)window.tacticalCardMoved?.(g,'discard');draw(n)}
 if(c.randomExhaustHand){if(g.hand.length){const index=Math.random()*g.hand.length|0,removed=g.hand.splice(index,1)[0];(g.exhausted||=[]).push(removed);window.tacticalCardMoved?.(g,'exhaust')}c.choice=null}
 if(c.curseScale){const n=window.countAbyssCurses?.(g)||0;c.d=n*c.curseScale;c.b=n*c.curseScale}
 if(c.d&&g.primedAttack){c.d+=g.primedAttack;g.primedAttack=0}
 if(c.primeAttack)g.primedAttack=Math.min(8,(g.primedAttack||0)+c.primeAttack);
 if(c.futureEnergy)g.futureEnergy=Math.min(2,(g.futureEnergy||0)+c.futureEnergy);
 if(c.futureBlock)g.nextTurnBlock=Math.min(12,(g.nextTurnBlock||0)+c.futureBlock);
 if(c.bankBlock)g.bankBlock=Math.max(g.bankBlock||0,c.bankBlock);
 if(c.doubleFirstPower){g.doubleFirstPending=(g.doubleFirstPending||0)+c.doubleFirstPower;g.doubleFirstStartsTurn=Math.min(g.doubleFirstStartsTurn||Infinity,(g.turn||1)+1)}
 if(c.turnDrawPower)g.extraTurnDraw=(g.extraTurnDraw||0)+c.turnDrawPower;
 if(c.turnPoisonPower)g.turnPoisonGain=(g.turnPoisonGain||0)+c.turnPoisonPower;
 if(c.turnStrGain)g.turnStrGain=(g.turnStrGain||0)+c.turnStrGain;
 if(c.overdriveDrain)g.overdriveDrain=(g.overdriveDrain||0)+c.overdriveDrain;
 if(c.overdriveEnergy)g.overdriveEnergy=(g.overdriveEnergy||0)+c.overdriveEnergy;
 if(c.overdriveDraw)g.overdriveDraw=(g.overdriveDraw||0)+c.overdriveDraw;
 if(c.curseInvert)g.curseInversion=(g.curseInversion||0)+c.curseInvert;
};
window.resetAbyssTactics=g=>{g.primedAttack=0;g.futureEnergy=0;g.bankBlock=0;g.doubleFirstCard=0;g.doubleFirstPending=0;g.doubleFirstStartsTurn=0;g.firstCardEchoReady=0;g.extraTurnDraw=0;g.turnPoisonGain=0;g.curseInversion=0;g.tacticalDiscardUsed=false;g.tacticalExhaustUsed=false;g.relicDiscardUsed=false;g.relicExhaustUsed=false;g.relicRecoveryUsed=false;g.pressurePearlUsed=false;g.tidalEnergyCarry=0;g.relicCostRestores=[];g.overdriveDrain=0;g.overdriveEnergy=0;g.overdriveDraw=0;if(has(g,'巨鯨の心臓'))g.hp=Math.max(1,g.hp-1);if(has(g,'呪海の炉'))g.hand.push('abysscurse');if(has(g,'サイドパック'))window.drawAbyssCards?.(2);if(has(g,'呪紋の外殻'))g.thorns=(g.thorns||0)+3;if(has(g,'供物の真珠')&&g.enemy)g.enemy.vulnerable=(g.enemy.vulnerable||0)+1;if(has(g,'漂流者の糸')&&g.enemy)g.enemy.weak=(g.enemy.weak||0)+1;if(has(g,'巨獣の顎'))g.str=(g.str||0)+1;if(has(g,'オウムガイの護殻'))g.guard=(g.guard||0)+1};
window.beginAbyssTactics=g=>{g.primedAttack=0;if((g.doubleFirstPending||0)&&(g.turn||1)>=(g.doubleFirstStartsTurn||1)){g.doubleFirstCard=(g.doubleFirstCard||0)+g.doubleFirstPending;g.doubleFirstPending=0;g.doubleFirstStartsTurn=0}g.firstCardEchoReady=g.doubleFirstCard||0;g.tacticalDiscardUsed=false;g.tacticalExhaustUsed=false;g.relicDiscardUsed=false;g.relicExhaustUsed=false;g.relicRecoveryUsed=false;g.pressurePearlUsed=false;g.energy+=(g.futureEnergy||0)+(has(g,'呪海の炉')?1:0)+(has(g,'四皇の王冠')?1:0)+(has(g,'紫炎の呪符')?1:0)+(g.tidalEnergyCarry||0);g.futureEnergy=0;g.tidalEnergyCarry=0;if(g.turnPoisonGain&&g.enemy){g.poison=(g.poison||0)+g.turnPoisonGain;if(g.runStats)g.runStats.poisonApplied=(g.runStats.poisonApplied||0)+g.turnPoisonGain;let log=document.getElementById('battlelog');if(log)log.textContent=`ベノムフィールド：敵に毒${g.turnPoisonGain}`;window.abyssImpact?.('#enemySprite','poison')}};
window.triggerAbyssPurpleFlame=g=>{if(!has(g,'紫炎の呪符'))return;let blocked=Math.min(g.block||0,2),damage=2-blocked,before=g.hp;g.block-=blocked;g.hp=Math.max(1,g.hp-damage);damage=before-g.hp;if(damage){window.recordAbyssSelfHpLoss?.(damage);if(g.runStats)g.runStats.damageTaken=(g.runStats.damageTaken||0)+damage}let log=document.getElementById('battlelog');if(log)log.textContent=`紫炎の呪符：2ダメージ${blocked?`（ブロックで${blocked}軽減）`:''}`;window.abyssImpact?.('#playerSprite',damage?'poison':'guard');let toast=document.getElementById('toast');if(toast){toast.textContent=`紫炎の呪符：エナジー＋1・${damage}ダメージ`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400)}};
window.checkAbyssEmptyHandRelic=g=>{if(!g?.enemy||g.hand?.length||!has(g,'永久機関'))return false;let before=g.hand.length;window.drawAbyssCards?.(1);if(g.hand.length>before){window.abyssImpact?.('#playerSprite','draw');let log=document.getElementById('battlelog');if(log)log.textContent='永久機関：手札が0枚になり、カードを1枚引いた';return true}return false};
window.shouldEchoAbyssCard=(g,c,k)=>{if(!g.doubleFirstCard||!g.firstCardEchoReady||String(k).replace(/~\d+$/,'').replace(/[+*]+$/,'')==='coelacanth')return 0;const count=g.firstCardEchoReady;g.firstCardEchoReady=0;return count};
window.showAbyssCardEcho=(c,index=1)=>new Promise(done=>{
 const old=document.querySelector('.memory-echo');if(old)old.remove();
 const fx=document.createElement('div');fx.className='memory-echo';fx.setAttribute('role','status');fx.setAttribute('aria-live','assertive');
 const source=document.createElement('small'),name=document.createElement('b'),state=document.createElement('strong');
 source.textContent='古代魚の記憶';name.textContent=c?.n||'最初のカード';state.textContent='記憶が反響……';fx.append(source,name,state);document.body.appendChild(fx);
 requestAnimationFrame(()=>fx.classList.add('show'));
 const activation=index+1;setTimeout(()=>{state.textContent=`${activation}回目発動！`;fx.classList.add('second');let log=document.getElementById('battlelog');if(log)log.textContent=`古代魚の記憶：${name.textContent}が${activation}回目の発動！`;done()},360);
 setTimeout(()=>fx.remove(),1050);
});
function restoreRelicCosts(g){for(const change of g.relicCostRestores||[]){for(const pile of [g.hand,g.draw,g.discard,g.exhausted]){let i=pile?.indexOf(change.to)??-1;if(i>=0){pile[i]=change.from;break}}}g.relicCostRestores=[]}
window.endAbyssTactics=g=>{if(has(g,'エナジーボトル'))g.tidalEnergyCarry=Math.max(0,g.energy||0);restoreRelicCosts(g);let curses=(g.hand||[]).filter(k=>data(k).g==='呪い').length;if(curses&&g.curseInversion){let amount=curses*g.curseInversion,healed=Math.min(amount,g.max-g.hp);g.hp+=healed;if(healed&&g.runStats)g.runStats.healing=(g.runStats.healing||0)+healed;let log=document.getElementById('battlelog');if(log)log.textContent=`反転術式：呪い${curses}枚を${g.curseInversion}倍の生命へ反転し、HPを${healed}回復`;window.abyssImpact?.('#playerSprite','heal')}else if(curses){let blocked=Math.min(g.block||0,curses),damage=curses-blocked;g.block-=blocked;g.hp-=damage;if(damage)window.recordAbyssSelfHpLoss?.(damage);if(damage&&g.runStats)g.runStats.damageTaken+=damage;let log=document.getElementById('battlelog');if(log)log.textContent=`呪いが疼く！ ${curses}ダメージ${blocked?`（ブロックで${blocked}軽減）`:''}`;if(damage)window.abyssImpact?.('#playerSprite','poison');else window.abyssImpact?.('#playerSprite','guard');if(g.hp<=0&&g.enemy)g.enemy.intent={}}};
window.carryAbyssTactics=g=>{if(g.bankBlock){g.nextTurnBlock=(g.nextTurnBlock||0)+Math.min(g.bankBlock,g.block);g.bankBlock=0}};
window.abyssTacticalStatus=g=>[[g.primedAttack,'次の攻撃＋'],[g.futureEnergy,'次ターン⚡＋'],[g.nextTurnBlock,'次ターン🛡'],[g.bankBlock,'🛡️持ち越し'],[g.doubleFirstCard?1:0,`初手を${(g.doubleFirstCard||0)+1}重発動`],[g.extraTurnDraw?1:0,`毎ターン＋${g.extraTurnDraw||0}枚`],[g.turnPoisonGain?1:0,`毎ターン毒＋${g.turnPoisonGain||0}`],[g.curseInversion?1:0,`呪いを${g.curseInversion||0}倍回復へ反転`],[g.overdriveDrain?1:0,`オーバードライブ：毎ターンHP-${g.overdriveDrain||0}/⚡+${g.overdriveEnergy||0}/🎴+${g.overdriveDraw||0}`]].filter(([n])=>n).map(([n,label])=>'<span class="state-pill">'+label+(typeof n==='number'&&n!==1&&n!==Infinity?n:'')+'</span>').join('');
window.abyssHandLimit=g=>10;
window.tacticalCardMoved=(g,kind)=>{window.checkAbyssEmptyHandRelic?.(g);if(kind==='discard'&&has(g,'潮捨ての貝殻')&&!g.relicDiscardUsed){g.relicDiscardUsed=true;window.drawAbyssCards?.(1);window.abyssImpact?.('#playerSprite','draw')}if(kind==='exhaust'&&!g.relicExhaustUsed){g.relicExhaustUsed=true;if(has(g,'灰珊瑚')){block(g,5);window.abyssImpact?.('#playerSprite','guard')}if(has(g,'喰らう海溝')){g.energy+=1;window.drawAbyssCards?.(1);window.abyssImpact?.('#playerSprite','draw')}}};
window.adjustAbyssRecoveredCard=(g,k)=>{if(!has(g,'海溝の滑車')||g.relicRecoveryUsed)return k;g.relicRecoveryUsed=true;const from=String(k),cost=Math.max(0,(window.getAbyssCardStats?.(from)?.c||0)-1),to=from.replace(/~\d+$/,'')+'~'+cost;(g.relicCostRestores||=[]).push({from,to});window.abyssImpact?.('#playerSprite','draw');return to};
let trackedEnemy=null,lastHp=null;
const recordBattleDamage=()=>{let g=window.getAbyssGame?.();if(!g?.enemy){if(g)g.battleDamageTaken=0;trackedEnemy=null;lastHp=g?.hp;return}if(g.enemy!==trackedEnemy){if(trackedEnemy)g.battleDamageTaken=0;trackedEnemy=g.enemy;lastHp=g.hp;return}if(typeof lastHp==='number'&&g.hp<lastHp)g.battleDamageTaken=(g.battleDamageTaken||0)+(lastHp-g.hp);lastHp=g.hp};
const hpText=document.getElementById('playerHpText');if(hpText)new MutationObserver(recordBattleDamage).observe(hpText,{subtree:true,childList:true,characterData:true});
const finishEnemyHpBar=window.win;window.win=function(){const g=window.getAbyssGame?.();if(g?.enemy){g.enemy.hp=0;const fill=document.getElementById('enemyHpFill'),text=document.getElementById('enemyHpText');if(fill)fill.style.width='0%';if(text)text.textContent=`0/${g.enemy.max}`}return finishEnemyHpBar?.()};
})();
