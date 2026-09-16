(()=>{'use strict';
const $=s=>document.querySelector(s);
if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true)return;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
const seenKey='abyssA2hsSeen';
function seen(){try{return localStorage.getItem(seenKey)==='1'}catch(e){return true}}
function markSeen(){try{localStorage.setItem(seenKey,'1')}catch(e){}}
if(seen())return;
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;showBanner()});
let banner=document.createElement('div');banner.id='a2hsBanner';banner.hidden=true;banner.innerHTML='<span>♆</span><b>ABYSS DECKをホーム画面に追加</b><button type="button" id="a2hsAdd">追加</button><button type="button" id="a2hsClose" aria-label="閉じる">✕</button>';document.body.appendChild(banner);
let iosModal=document.createElement('div');iosModal.className='modal';iosModal.id='a2hsIosModal';iosModal.innerHTML='<div class="panel reset-panel"><div class="bigicon">📲</div><h2>ホーム画面に追加</h2><p class="reset-warning">Safariの共有ボタン<i>□↑</i>をタップし、一覧から「ホーム画面に追加」を選んでください。</p><div class="reset-actions"><button class="btn gold" id="a2hsIosClose">わかった</button></div></div>';document.body.appendChild(iosModal);
function showBanner(){if(seen())return;banner.hidden=false;window.applyFuri?.(banner)}
function closeBanner(){banner.hidden=true;markSeen()}
$('#a2hsClose').onclick=closeBanner;
$('#a2hsAdd').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();try{await deferredPrompt.userChoice}catch(e){}deferredPrompt=null;closeBanner();return}if(isIOS){banner.hidden=true;iosModal.classList.add('on');window.applyFuri?.(iosModal);return}closeBanner()};
$('#a2hsIosClose').onclick=()=>{iosModal.classList.remove('on');markSeen()};
iosModal.onclick=e=>{if(e.target===iosModal){iosModal.classList.remove('on');markSeen()}};
if(isIOS)setTimeout(showBanner,1200);
})();
