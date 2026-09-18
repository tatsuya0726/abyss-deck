(()=>{'use strict';
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const base=k=>String(k||'').replace(/~\d+$/,'').replace(/[+*]+$/,'');
function shuffleDiscard(g){if(g.draw.length||!g.discard.length)return;g.draw=g.discard.sort(()=>Math.random()-.5);g.discard=[]}
async function reveal(k,index,total,usable=true){
 document.querySelector('.madness-cast')?.remove();
 const c=window.getAbyssCardStats?.(k)||{},fx=document.createElement('div');fx.className='madness-cast';fx.setAttribute('role','status');fx.setAttribute('aria-live','assertive');
 fx.innerHTML=`<div class="madness-cast-shell"><small>発狂 ${index} / ${total}</small><strong>${usable?'山札からめくれた！':'使用できないカード'}</strong><div class="madness-card-preview">${window.renderAbyssCardView?.(k,{live:true,hideTag:true})||`<b>${c.n||base(k)}</b>`}</div><em>${c.n||base(k)}</em><span>${usable?'コストなしで使用！':'発動せず捨て札へ'}</span></div>`;
 document.body.appendChild(fx);requestAnimationFrame(()=>fx.classList.add('show'));await sleep(380);fx.classList.add(usable?'cast':'failed');await sleep(360);fx.classList.remove('show');await sleep(180);fx.remove();
}
async function waitForChoice(g){while(g.cardChoice&&g.enemy&&g.enemy.hp>0)await sleep(80)}
async function useOne(g,k,index,total){
 const c=window.getAbyssCardStats?.(k),usable=!!c&&c.c<99;
 await reveal(k,index,total,usable);
 if(!usable){g.discard.push(k);window.abyssSave?.();window.debugAbyssRefresh?.();return}
 window.resolveAbyssCardEffect?.(c,k);
 if(c.autoPlayTop&&g.enemy?.hp>0)await window.playAbyssMadnessCards(c.autoPlayTop);
 if(c.choice&&g.enemy?.hp>0){window.openAbyssCardChoice?.(c,g,k);await waitForChoice(g);g.cardBusy=true;g.cardBusyAt=Date.now()}
 else if(c.exhaust)(g.exhausted||=[]).push(k);else g.discard.push(k);
 window.abyssSave?.();window.debugAbyssRefresh?.();
}
window.playAbyssMadnessCards=async count=>{
 const g=window.getAbyssGame?.();if(!g||!g.enemy)return;
 const total=Math.max(0,count|0);let used=0;
 for(let i=1;i<=total;i++){
  g.cardBusy=true;g.cardBusyAt=Date.now();
  shuffleDiscard(g);if(!g.draw.length){let log=document.getElementById('battlelog');if(log)log.textContent=`発狂：山札に使用できるカードがない`;break}
  const k=g.draw.pop();used++;await useOne(g,k,i,total);if(!g.enemy||g.enemy.hp<=0)break;
 }
 if(!used){let toast=document.getElementById('toast');if(toast){toast.textContent='発狂：山札が空だった';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400)}}
};
})();
