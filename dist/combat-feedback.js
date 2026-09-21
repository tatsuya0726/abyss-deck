(()=>{'use strict';
const profiles={slash:['#8cfff2',900,.10,'sawtooth'],bite:['#ffba80',170,.15,'triangle'],water:['#53bdff',340,.24,'sine'],thunder:['#ffea75',1300,.10,'square'],poison:['#b2fa74',470,.19,'sine'],abyss:['#d48bff',100,.32,'sine'],guard:['#8ceaff',700,.18,'triangle'],heal:['#89ffd2',660,.32,'sine'],power:['#ffc971',440,.24,'triangle'],draw:['#d8f7ff',980,.09,'sine'],crush:['#ff967f',90,.25,'triangle'],tentacle:['#db91ed',210,.22,'sine']};
window.abyssAttackKind=(c={},k='')=>c.a?'abyss':/electric|jelly/.test(k)?'thunder':/bite|shark|fang|leviathan/.test(k)?'bite':/whale|tsunami|current|ray|manta/.test(k)?'water':'slash';
window.abyssEnemyKind=e=>/クトゥル|ノクス/.test(e?.n)?'abyss':/イカ|クラーケン/.test(e?.n)?'tentacle':/ヒュドラ|リヴァイアサン|マッコウクジラ|ゾウギンザメ/.test(e?.n)?'water':/カニ/.test(e?.n)?'crush':'bite';
let noise,rapidVariant=0;
const impactUrls={attack:'assets/audio/heavy-attack-v104.ogg',shield:'assets/audio/heavy-block-v104.ogg',block:'assets/audio/clashing-swords-1.mp3'},impactRaw={},impactBuffers={},impactDecoding={};
for(const key of ['strike','impact','explosion','rapid1','rapid2','apparition','metal','dark','slash3','slash11','firewind'])impactUrls[key]=`assets/audio/user-${key}-v107.mp3`;
const activeSamples=new Set();
for(const [key,url] of Object.entries(impactUrls))fetch(url).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(data=>impactRaw[key]=data).catch(()=>{});
document.addEventListener('pointerdown',()=>{const a=window.abyssFeedbackAudio?.();if(!a)return;for(const key of Object.keys(impactUrls))if(impactRaw[key]&&!impactDecoding[key])impactDecoding[key]=a.decodeAudioData(impactRaw[key].slice(0)).then(buffer=>impactBuffers[key]=buffer).catch(()=>{})},{once:true,capture:true});
function sampledImpact(a,key,level,rate=1,maxDuration=0){if(!impactBuffers[key]){if(impactRaw[key]&&!impactDecoding[key])impactDecoding[key]=a.decodeAudioData(impactRaw[key].slice(0)).then(buffer=>impactBuffers[key]=buffer).catch(()=>{});return false}while(activeSamples.size>=6){const oldest=activeSamples.values().next().value;activeSamples.delete(oldest);try{oldest.stop()}catch(e){}}const src=a.createBufferSource(),gain=a.createGain(),now=a.currentTime;src.buffer=impactBuffers[key];src.playbackRate.value=rate;gain.gain.setValueAtTime(level,now);if(maxDuration){gain.gain.setValueAtTime(level,now+Math.max(.04,maxDuration-.11));gain.gain.exponentialRampToValueAtTime(.0001,now+maxDuration)}src.connect(gain);gain.connect(window.abyssSfxOutput?.()||a.destination);activeSamples.add(src);src.start();if(maxDuration)src.stop(now+maxDuration+.02);src.onended=()=>{activeSamples.delete(src);src.disconnect();gain.disconnect()};return true}
function sound(kind,hit,total,boss){const a=window.abyssFeedbackAudio?.();if(!a)return;a.resume?.().catch(()=>{});window.duckAbyssBgm?.(boss?620:total>1?420:340,boss?.18:.26);const p=profiles[kind]||profiles.slash,t=a.currentTime,fin=total>1&&hit===total,volume=(boss?.11:.085)*(fin?1.2:1)*(window.abyssSfxVolume?.()??1),shift=1+Math.min(hit-1,6)*.07;
 function tone(freq,end,duration,level,wave,delay=0){const o=a.createOscillator(),g=a.createGain();o.type=wave;o.frequency.setValueAtTime(freq,t+delay);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+delay+duration);g.gain.setValueAtTime(.0001,t+delay);g.gain.exponentialRampToValueAtTime(level,t+delay+.008);g.gain.exponentialRampToValueAtTime(.0001,t+delay+duration);o.connect(g);g.connect(window.abyssSfxOutput?.()||a.destination);o.start(t+delay);o.stop(t+delay+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
 const sample=kind==='slash'?(total>1?(hit===1&&++rapidVariant%2?'rapid1':'rapid2'):'slash3'):({bite:'strike',crush:'explosion',thunder:'impact',water:'firewind',tentacle:'slash11',abyss:'dark',poison:'apparition',power:'metal'})[kind];
 // Shield sounds lead with a low shell impact, keeping the supplied sword clash as a short bright tail.
 if(kind==='guard'){
  const shield=sampledImpact(a,'shield',volume*4.15,.76,.78),clash=sampledImpact(a,'block',volume*.85,.58,.42);
  if(!shield&&!clash)tone(240,48,.46,volume*2.25,'triangle');
  tone(74,31,.42,volume*1.35,'sine');tone(520,96,.16,volume*.34,'square',.025);return
 }
 // Boss blows always gain a separate abyssal signature instead of sounding like larger normal attacks.
 if(boss){
  const omen=/abyss|tentacle/.test(kind)?'apparition':'dark',weight=/crush|bite/.test(kind)?'explosion':kind==='water'?'firewind':'impact';
  if(hit===1||total===1)sampledImpact(a,omen,volume*2.35,/abyss|tentacle/.test(kind)?.58:.72,1.08);
  sampledImpact(a,weight,volume*(fin?3.5:total>1?2.25:3.25),/crush|bite/.test(kind)?.62:.78,fin?.92:total>1?.48:.82);
  if(total>1&&hit>1&&!fin){tone(125+hit*12,46,.2,volume*.55,'triangle');return}
  tone(/abyss|tentacle/.test(kind)?63:88,24,.72,volume*1.5,'sine');
  tone(kind==='thunder'?1180:185,kind==='thunder'?95:42,.38,volume*.72,kind==='thunder'?'square':'sawtooth',.035);
  if(fin)tone(52,22,.58,volume*1.2,'triangle',.09);return
 }
 // Rapid recordings already contain several slashes: avoid stacking full sequences per hit.
 if(sample&&kind==='slash'&&total>1&&hit>1)return;
 if(sample&&sampledImpact(a,sample,volume*(total>1?3:4),1))return;
 if(['heal','power','draw'].includes(kind))tone(p[1]*shift,p[1]*(kind==='heal'?1.6:.38),p[2],volume,p[3]);
 if(['heal','power','draw'].includes(kind)){tone(p[1]*1.5,p[1]*2,p[2],volume*.55,'sine',.045);return}
 if(sampledImpact(a,'attack',volume*4.1,kind==='crush'?.72:kind==='bite'?.82:kind==='abyss'?.68:1.02)){if(boss||fin)tone(boss?82:125,34,.28,volume,'sine');return}
 if(!noise){noise=a.createBuffer(1,Math.ceil(a.sampleRate*.35),a.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1}
 tone(kind==='thunder'?170:kind==='slash'?145:105,34,boss?.55:.36,volume*1.65,'sine');tone(kind==='abyss'?68:220,kind==='abyss'?28:65,.24,volume*.48,'triangle',.015);
 const src=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();src.buffer=noise;filter.type='lowpass';filter.frequency.setValueAtTime(kind==='thunder'?2200:kind==='slash'?1800:850,t);filter.frequency.exponentialRampToValueAtTime(120,t+.3);filter.Q.value=.8;gain.gain.setValueAtTime(volume*1.1,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.3);src.connect(filter);filter.connect(gain);gain.connect(window.abyssSfxOutput?.()||a.destination);src.start(t);src.stop(t+.34);src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};
 if(boss||fin||kind==='crush')tone(boss?95:150,38,.22,volume*.9,'sine');
}
window.previewAbyssImpact=()=>sound('crush',1,1,false);
window.abyssImpact=(sel,kind='slash',amount=null,label='',boss=false)=>{const el=document.querySelector(sel);if(!el||!document.querySelector('#battle.on')||document.hidden)return;const [hit=1,total=1]=label?label.split('/').map(Number):[1,1];if(amount===0)kind='guard';const p=profiles[kind]||profiles.slash; sound(kind,hit,total,boss);const layer=document.createElement('div');layer.className='combat-fx fx-'+kind+(boss?' fx-boss':'');layer.style.setProperty('--fx-color',p[0]);layer.setAttribute('aria-hidden','true');el.appendChild(layer);
 for(let i=0;i<(boss?10:6);i++){const dot=document.createElement('i');dot.style.setProperty('--angle',(i*(boss?36:60)+hit*19)+'deg');dot.style.setProperty('--travel',(boss?76:48)+'px');layer.appendChild(dot)}
 const core=document.createElement('em');layer.appendChild(core);
 if(label){if(hit===1){el.dataset.comboTotal='0';el.querySelector('.combat-total')?.remove()}el.dataset.comboTotal=String(Number(el.dataset.comboTotal||0)+(Number(amount)||0));if(hit===total){const sum=document.createElement('b');sum.className='combat-total';sum.textContent='TOTAL '+el.dataset.comboTotal;el.appendChild(sum);setTimeout(()=>sum.remove(),950)}el.querySelector('.combat-combo')?.remove();const badge=document.createElement('b');badge.className='combat-combo';badge.textContent=hit+'/'+total+' HIT'+(hit===total?'!':'');el.appendChild(badge);setTimeout(()=>badge.remove(),650)}
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&boss)document.querySelector('.arena')?.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:190});setTimeout(()=>layer.remove(),620);
};
window.abyssCardFeedback=(c,k)=>{window.abyssFeedbackAudio?.();if(c.b||c.def)window.abyssImpact('#playerSprite','guard');if(c.he)window.abyssImpact('#playerSprite','heal');if(c.p||c.doublePoison||c.w)window.abyssImpact('#enemySprite','poison');if(c.s)window.abyssImpact('#playerSprite','power');if(!c.d&&!c.p&&!c.b&&!c.he&&!c.s&&!c.def&&!c.w&&!c.doublePoison&&(c.dr||c.en))window.abyssImpact('#playerSprite','draw')};
})();
