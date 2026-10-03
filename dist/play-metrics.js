(()=>{'use strict';
const MEASUREMENT_ID='G-JEBJP0KM5L';
const clean=value=>typeof value==='string'?value.slice(0,80):typeof value==='number'||typeof value==='boolean'?value:undefined;
function deviceMode(){
 let tv=false;
 try{tv=localStorage.getItem('abyssTvFixedCanvas')==='1'}catch(e){}
 if(tv&&matchMedia('(orientation:landscape)').matches)return'tv';
 if(matchMedia('(pointer:coarse)').matches||Math.min(innerWidth,innerHeight)<700)return'mobile';
 return'pc';
}
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){dataLayer.push(arguments)};
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());
gtag('config',MEASUREMENT_ID,{send_page_view:true,allow_google_signals:false,allow_ad_personalization_signals:false});
const script=document.createElement('script');
script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
script.onerror=()=>{window.__abyssAnalyticsUnavailable=true};
document.head.appendChild(script);
window.abyssTrack=(name,params={})=>{
 if(!/^[a-z][a-z0-9_]{0,39}$/.test(name))return;
 const payload={device_mode:deviceMode()};
 for(const [key,value] of Object.entries(params)){const safe=clean(value);if(safe!==undefined)payload[key]=safe}
 try{gtag('event',name,payload)}catch(e){}
};
window.abyssTrack('game_open',{standalone:matchMedia('(display-mode:standalone)').matches});
})();
