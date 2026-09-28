(()=>{'use strict';
const $=s=>document.querySelector(s);
if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true)return;
const ua=navigator.userAgent||'',isIOS=(/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))&&!window.MSStream;
const isHandheld=isIOS||/Android.+Mobile|Mobile.+Android/i.test(ua);
if(!isHandheld)return;
const seenKey='abyssA2hsSeenV2';
function seen(){try{return localStorage.getItem(seenKey)==='1'}catch(e){return false}}
function markSeen(){try{localStorage.setItem(seenKey,'1')}catch(e){}}
if(seen())return;
let deferredPrompt=null,dismissedThisSession=false,noticeQueued=false;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});
let modal=document.createElement('div');modal.className='modal';modal.id='a2hsModal';modal.innerHTML='<div class="panel reset-panel"><div class="bigicon">📲</div><h2>ホーム画面に追加してください</h2><p class="reset-warning">アドレスバーがあると、戦闘の際にHPバーとカードウィンドウが重なってしまうため、ホーム画面に追加した後にそちらから起動してください。</p><div class="reset-actions"><button class="btn" id="a2hsLater">あとで</button><button class="btn gold" id="a2hsAdd">ホーム画面に追加</button></div></div>';document.body.appendChild(modal);
let iosModal=document.createElement('div');iosModal.className='modal';iosModal.id='a2hsIosModal';iosModal.innerHTML='<div class="panel reset-panel"><div class="bigicon">📲</div><h2>ホーム画面に追加</h2><p class="reset-warning">Safariの共有ボタン<i>□↑</i>をタップし、一覧から「ホーム画面に追加」を選んでください。</p><div class="reset-actions"><button class="btn gold" id="a2hsIosClose">わかった</button></div></div>';document.body.appendChild(iosModal);
function openNotice(){noticeQueued=false;if(seen()||dismissedThisSession)return;modal.classList.add('on');window.applyFuri?.(modal)}
function closeNotice(permanent=false){modal.classList.remove('on');dismissedThisSession=true;if(permanent)markSeen()}
function queueNotice(){if(noticeQueued||seen()||dismissedThisSession)return;noticeQueued=true;setTimeout(openNotice,550)}
$('#a2hsLater').onclick=()=>closeNotice(false);
$('#a2hsAdd').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();let accepted=false;try{accepted=(await deferredPrompt.userChoice)?.outcome==='accepted'}catch(e){}deferredPrompt=null;closeNotice(accepted);return}if(isIOS){modal.classList.remove('on');iosModal.classList.add('on');window.applyFuri?.(iosModal);return}closeNotice(false)};
modal.onclick=e=>{if(e.target===modal)closeNotice(false)};
$('#a2hsIosClose').onclick=()=>{iosModal.classList.remove('on');markSeen()};
iosModal.onclick=e=>{if(e.target===iosModal){iosModal.classList.remove('on');markSeen()}};
let gate=document.getElementById('tapStartGate');
if(gate){['pointerdown','touchend','click','keydown'].forEach(evt=>gate.addEventListener(evt,queueNotice,{once:true}))}else queueNotice();
})();
