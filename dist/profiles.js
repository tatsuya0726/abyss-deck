(()=>{'use strict';
const REG_KEY='abyssProfiles',ACTIVE_KEY='abyssActiveProfile';
const SCOPED_KEYS=['abyssDeck','abyssDeckBackup','abyssAscensionMeta','abyssAscensionMetaBackup','abyssRunModifierEnabled','abyssAchievements','abyssDefeated','abyssRegionUnlocked','abyssBgmGalleryUnlocked','abyssShardGuidePending','abyssTutorialSeen','abyssFirstDeathHappened','abyssPendingFirstBonus','abyssFirstBlessingIntroSeen','abyssRunClearedAt','abyssFuriEnabled'];
function readProfiles(){try{let x=JSON.parse(localStorage.getItem(REG_KEY)||'null');if(Array.isArray(x)&&x.length)return x}catch(e){}return[]}
function writeProfiles(list){try{localStorage.setItem(REG_KEY,JSON.stringify(list))}catch(e){}}
function readActive(){try{return localStorage.getItem(ACTIVE_KEY)||''}catch(e){return''}}
function writeActive(id){try{localStorage.setItem(ACTIVE_KEY,id)}catch(e){}}
function hasLegacyData(){try{return SCOPED_KEYS.some(k=>localStorage.getItem(k)!=null)}catch(e){return false}}
function migrateLegacyInto(id){try{let touchedFuri=false;for(const k of SCOPED_KEYS){let v=localStorage.getItem(k);if(v!=null){localStorage.setItem(k+'::'+id,v);if(k==='abyssFuriEnabled')touchedFuri=true}}if(!touchedFuri)localStorage.setItem('abyssFuriEnabled::'+id,'1')}catch(e){}}
let profiles=readProfiles(),active=readActive();
if(!profiles.length){
 let id='p1',legacy=hasLegacyData();
 profiles=[{id,name:'プレイヤー1',createdAt:Date.now()}];
 writeProfiles(profiles);
 if(legacy)migrateLegacyInto(id);
 active=id;
 writeActive(active);
}else if(!active||!profiles.some(p=>p.id===active)){
 active=profiles[0].id;
 writeActive(active);
}
function nextId(){let n=1,ids=new Set(profiles.map(p=>p.id));while(ids.has('p'+n))n++;return'p'+n}
function scoped(key){return key+'::'+active}
window.abyssStorageGet=key=>{try{return localStorage.getItem(scoped(key))}catch(e){return null}};
window.abyssStorageSet=(key,val)=>{try{localStorage.setItem(scoped(key),val)}catch(e){}};
window.abyssStorageRemove=key=>{try{localStorage.removeItem(scoped(key))}catch(e){}};
window.abyssActiveProfileId=()=>active;
window.abyssActiveProfileName=()=>profiles.find(p=>p.id===active)?.name||'プレイヤー1';
window.abyssListProfiles=()=>profiles.map(p=>({...p}));
window.abyssSwitchProfile=id=>{if(!profiles.some(p=>p.id===id))return false;writeActive(id);location.reload();return true};
window.abyssCreateProfile=name=>{let id=nextId();profiles.push({id,name:(name||'').trim()||('プレイヤー'+id.slice(1)),createdAt:Date.now()});writeProfiles(profiles);writeActive(id);location.reload();return id};
window.abyssRenameProfile=(id,name)=>{let p=profiles.find(x=>x.id===id);if(!p||!(name||'').trim())return false;p.name=name.trim();writeProfiles(profiles);return true};
window.abyssDeleteProfile=id=>{if(profiles.length<=1)return false;profiles=profiles.filter(p=>p.id!==id);writeProfiles(profiles);try{let suffix='::'+id,toRemove=[];for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(k&&k.endsWith(suffix))toRemove.push(k)}toRemove.forEach(k=>localStorage.removeItem(k))}catch(e){}if(active===id){active=profiles[0].id;writeActive(active)}return true};
window.abyssResetActiveProfileData=()=>{try{let suffix='::'+active,toRemove=[];for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(k&&k.endsWith(suffix))toRemove.push(k)}toRemove.forEach(k=>localStorage.removeItem(k))}catch(e){}};
window.abyssProfileDbSuffix=()=>'::'+active;
})();
