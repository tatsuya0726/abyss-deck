(()=>{'use strict';
const $=s=>document.querySelector(s),KEY='abyssDebugEnabled',SNAP='abyssDebugSnapshot';
const typeLabel={battle:'通常戦',elite:'エリート',event:'イベント',anomaly:'深淵',rest:'休憩',treasure:'宝箱',shop:'ショップ',boss:'ボス',secretBoss:'ボス'};
const typeIcon={battle:'⚔',elite:'☠',event:'?',anomaly:'◈',rest:'♨',treasure:'◇',shop:'◉',boss:'♛',secretBoss:'◆'};
let enabled=localStorage.getItem(KEY)==='1';

const titleButton=document.createElement('button');
titleButton.type='button';titleButton.id='debugTitleToggle';titleButton.hidden=true;
(document.querySelector('#titleLegacyActions')||document.body).appendChild(titleButton);

const launcher=document.createElement('button');
launcher.type='button';launcher.id='debugLauncher';launcher.setAttribute('aria-label','デバッグパネルを開く');launcher.innerHTML='<span>🛠</span><b>DEBUG</b>';
document.body.appendChild(launcher);
const killNow=document.createElement('button');
killNow.type='button';killNow.id='debugKillNow';killNow.setAttribute('aria-label','現在の敵を即時撃破');killNow.innerHTML='<span>☠</span><b>今の敵を倒す</b>';killNow.hidden=true;
document.body.appendChild(killNow);

const modal=document.createElement('div');modal.className='modal debug-modal';modal.id='debugModal';
modal.innerHTML=`<div class="panel debug-panel">
  <header><div><small>ABYSS DECK DEVELOPER TOOLS</small><h2>デバッグモード</h2></div><button type="button" id="debugClose" aria-label="閉じる">×</button></header>
  <div class="debug-warning">デバッグ中の操作はセーブに反映されます。開始時点へ戻す場合は「スナップショット復元」を使用してください。</div>
  <div id="debugNoRun" class="debug-empty" hidden>先に「最初から潜る」または「つづきから」でゲームを開始してください。</div>
  <div id="debugTools">
    <section><h3>クイック操作</h3><div class="debug-grid quick">
      <button data-action="heal">♥ HP全回復</button><button data-action="gold">● 500ゴールド</button>
      <button data-action="energy">⚡ エナジー9</button><button data-action="shards">◆ 欠片を全入手</button>
      <button class="danger" data-action="kill">⚔ 敵を即時撃破</button><button data-action="restore">↺ スナップショット復元</button>
    </div></section>
    <section><h3>戦闘を開始</h3><div class="debug-grid combat">
      <button data-battle="normal">⚔ 通常戦</button><button data-battle="elite">☠ エリート戦</button><button data-battle="boss">♛ 現在層のボス</button>
    </div></section>
    <section><h3>階層へ移動</h3><div class="debug-grid acts">
      <button data-act="1">第1層</button><button data-act="2">第2層</button><button data-act="3">第3層</button><button data-act="4">深淵領域</button>
    </div></section>
    <section class="debug-map-section"><h3>現在のマップ <small id="debugMapState"></small></h3><p>押したマスへ直接移動して、その内容を開始します。</p><div id="debugNodeList" class="debug-node-list"></div></section>
  </div>
  <footer><button type="button" id="debugDisable">デバッグモードを終了</button></footer>
</div>`;document.body.appendChild(modal);

function game(){return window.getAbyssGame?.()}
function hasRun(){const g=game();return !!(g&&Array.isArray(g.deck)&&g.deck.length)}
function saveSnapshot(){if(!hasRun()||sessionStorage.getItem(SNAP))return;try{sessionStorage.setItem(SNAP,JSON.stringify(game()))}catch(e){}}
function toast(message){let t=$('#toast');if(!t)return;t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1400)}
function closeOtherModals(){document.querySelectorAll('.modal.on').forEach(x=>{if(x!==modal)x.classList.remove('on')})}
function syncLauncher(){const onTitle=$('#title')?.classList.contains('on'),inBattle=$('#battle')?.classList.contains('on')&&!!game()?.enemy;launcher.hidden=!enabled||onTitle;killNow.hidden=!enabled||!inBattle;launcher.classList.toggle('setup',!enabled);launcher.querySelector('b').textContent=enabled?'DEBUG':'デバッグ開始'}
function sync(){titleButton.textContent=enabled?'🛠 デバッグ ON':'🛠 デバッグ OFF';titleButton.classList.toggle('active',enabled);syncLauncher()}
function refresh(){const g=game(),run=hasRun();$('#debugNoRun').hidden=run;$('#debugTools').hidden=!run;if(!run)return;$('#debugMapState').textContent=`第${g.act||1}層・深度${g.floor||0}`;const list=$('#debugNodeList'),nodes=Array.isArray(g.map)?g.map:[];list.innerHTML=nodes.map((n,i)=>`<button type="button" data-node="${i}" class="debug-node ${n.done?'done':''} ${i===g.currentNode?'current':''}"><i>${typeIcon[n.type]||'•'}</i><span><b>${n.row+1}段目・${n.col+1}</b><small>${typeLabel[n.type]||n.type}${n.redShardElite?'・赤い欠片':''}</small></span></button>`).join('')||'<span class="debug-no-nodes">マップを生成するとマスが表示されます。</span>'}
function open(){if(!enabled)return;saveSnapshot();refresh();modal.classList.add('on');window.applyFuri?.(modal)}
function setEnabled(next){enabled=next;localStorage.setItem(KEY,next?'1':'0');if(next){saveSnapshot();sync();open()}else{modal.classList.remove('on');sync()}}
window.toggleAbyssDebug=()=>setEnabled(!enabled);window.isAbyssDebugEnabled=()=>enabled;

let lastTouch=0;
function bindTap(el,handler){el.addEventListener('touchend',e=>{e.preventDefault();lastTouch=Date.now();handler(e)},{passive:false});el.addEventListener('click',e=>{if(Date.now()-lastTouch<500)return;handler(e)})}
bindTap(titleButton,()=>setEnabled(!enabled));bindTap(launcher,()=>enabled?open():setEnabled(true));
bindTap(killNow,()=>{const g=game();if(!enabled||!g?.enemy)return;killNow.hidden=true;g.enemy.hp=0;window.debugAbyssWin?.()});
function handlePanel(e){const b=e.target.closest('button');if(!b||!modal.contains(b))return;
  if(b.id==='debugClose'){modal.classList.remove('on');return}
  if(b.id==='debugDisable'){setEnabled(false);return}
  const action=b.dataset.action,g=game();
  if(action&&g){
    if(action==='heal'){g.hp=g.max;window.debugAbyssRefresh?.();toast('HPを全回復しました')}
    if(action==='gold'){g.pearl=(g.pearl||0)+500;window.debugAbyssRefresh?.();toast('500ゴールドを追加しました')}
    if(action==='energy'){g.energy=9;window.debugAbyssRefresh?.();toast('エナジーを9にしました')}
    if(action==='shards'){['red','blue','yellow','purple'].forEach(k=>{(g.abyssShards||(g.abyssShards={}))[k]=true});window.debugAbyssRefresh?.();toast('4色の欠片を入手しました')}
    if(action==='kill'){if(!g.enemy)return toast('戦闘中に使用してください');modal.classList.remove('on');g.enemy.hp=0;window.debugAbyssWin?.()}
    if(action==='restore'){let raw=sessionStorage.getItem(SNAP);if(!raw)return toast('復元データがありません');try{let old=JSON.parse(raw);Object.keys(g).forEach(k=>delete g[k]);Object.assign(g,old);window.abyssSave?.();sessionStorage.removeItem(SNAP);location.reload()}catch(err){toast('復元に失敗しました')}}
    refresh();window.abyssSave?.();return
  }
  if(b.dataset.battle&&hasRun()){closeOtherModals();modal.classList.remove('on');window.debugAbyssStartBattle?.(b.dataset.battle);return}
  if(b.dataset.act&&hasRun()){closeOtherModals();modal.classList.remove('on');let act=+b.dataset.act;if(act===4){let run=game();run.ascension=Math.max(1,run.ascension||0);['red','blue','yellow','purple'].forEach(k=>(run.abyssShards||(run.abyssShards={}))[k]=true);window.enterAbyssMap?.()}else window.debugAbyssBuildMap?.(act);return}
  if(b.dataset.node&&hasRun()){closeOtherModals();modal.classList.remove('on');window.debugAbyssEnterNode?.(+b.dataset.node)}
}
let panelTouch=null;
modal.addEventListener('touchstart',e=>{const t=e.changedTouches[0];panelTouch=t?{id:t.identifier,x:t.clientX,y:t.clientY,moved:false}:null},{passive:true});
modal.addEventListener('touchmove',e=>{if(!panelTouch)return;const t=Array.from(e.changedTouches).find(x=>x.identifier===panelTouch.id)||e.changedTouches[0];if(t&&Math.hypot(t.clientX-panelTouch.x,t.clientY-panelTouch.y)>10)panelTouch.moved=true},{passive:true});
modal.addEventListener('touchcancel',()=>panelTouch=null,{passive:true});
modal.addEventListener('touchend',e=>{const moved=panelTouch?.moved;panelTouch=null;if(moved||!e.target.closest('button'))return;e.preventDefault();lastTouch=Date.now();handlePanel(e)},{passive:false});
modal.addEventListener('click',e=>{if(Date.now()-lastTouch<500)return;if(e.target===modal){modal.classList.remove('on');return}handlePanel(e)});
document.addEventListener('keydown',e=>{if(enabled&&e.key==='F2'){e.preventDefault();modal.classList.contains('on')?modal.classList.remove('on'):open()}});
new MutationObserver(()=>{syncLauncher();if(enabled&&modal.classList.contains('on'))refresh()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
sync();
})();
