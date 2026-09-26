const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {spawn}=require('child_process');

const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const indexPath=path.join(dist,'index.html');
const index=fs.readFileSync(indexPath,'utf8');

function assert(value,message){if(!value)throw new Error(message)}

assert(index.includes('id="tapStartGate"'),'TAP START gate is missing from index.html');
assert(index.includes('id="title"'),'title screen is missing from index.html');
assert(index.includes("boot-recovery.js?v=1"),'startup recovery script is missing');

const inlineScripts=[...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
 .filter(match=>!/<script\s[^>]*\bsrc=/i.test(match[0]))
 .map(match=>match[1]);
inlineScripts.forEach((code,i)=>new vm.Script(code,{filename:`index-inline-${i+1}.js`}));

const scriptSources=[...index.matchAll(/<script\s[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)]
 .map(match=>match[1].split('?')[0]);
for(const source of scriptSources){
 const file=path.join(dist,source);
 assert(fs.existsSync(file),`startup script is missing: ${source}`);
 new vm.Script(fs.readFileSync(file,'utf8'),{filename:source});
}

const responsive=fs.readFileSync(path.join(dist,'responsive-shell.js'),'utf8');
assert(responsive.includes("root.style.setProperty('--abyss-vv-width',width+'px')"),
 'visual viewport width is not synchronized to the landscape root');
assert(responsive.includes("root.style.setProperty('--abyss-vv-height',height+'px')"),
 'visual viewport height is not synchronized to the landscape root');
assert(!responsive.includes('installLandscapeTouchCalibration'),
 'touch remapping is still installed');
assert(!responsive.includes('abyssLandscapeTouchCalibration'),
 'obsolete touch calibration storage is still active');
assert(!responsive.includes('dispatchingSyntheticClick'),
 'touches can still be resent as synthetic clicks');
assert(responsive.includes("if(!landscapeLayout){existingHint?.remove();return}"),
 'portrait end-turn still receives the controller X hint');
const landscapeCss=fs.readFileSync(path.join(dist,'responsive-landscape.css'),'utf8');
const desktopCss=fs.readFileSync(path.join(dist,'responsive-desktop.css'),'utf8');
const shellJs=fs.readFileSync(path.join(dist,'responsive-shell.js'),'utf8');
const enhanceJs=fs.readFileSync(path.join(dist,'enhance.js'),'utf8');
const refinementJs=fs.readFileSync(path.join(dist,'refinement.js'),'utf8');
const economyJs=fs.readFileSync(path.join(dist,'economy.js'),'utf8');
const relicsEventsJs=fs.readFileSync(path.join(dist,'relics-events.js'),'utf8');
const strategyPolishJs=fs.readFileSync(path.join(dist,'strategy-polish.js'),'utf8');
assert(landscapeCss.includes('width:var(--abyss-vv-width,100%)!important'),
 'landscape root does not use the measured visual viewport width');
assert(landscapeCss.includes('height:var(--abyss-vv-height,100%)!important'),
 'landscape root does not use the measured visual viewport height');
assert(index.includes('responsive-desktop.css?v=5'),
 'PC layout stylesheet is not loaded after the landscape layout');
assert(desktopCss.trim().startsWith('/* PC landscape layout.')&&desktopCss.includes('@media (orientation:landscape) and (hover:hover) and (pointer:fine) and (min-width:1000px) and (min-height:600px)'),
 'PC layout is not isolated from touch and portrait layouts');
for(const selector of ['#battle .arena','#battle .hand','#map>.path','#eventModal','#shopModal','.reward-panel','.boss-relic-choices']){
 assert(desktopCss.includes(selector),`PC layout does not cover ${selector}`);
}
assert(shellJs.includes("desktop.href='responsive-desktop.css?v=5'"),
 'dynamically loaded game shells do not receive the PC layout');
assert((desktopCss.match(/{/g)||[]).length===(desktopCss.match(/}/g)||[]).length,
 'PC stylesheet has unbalanced blocks');
for(const [width,height]of [[1000,600],[1366,768],[1920,1080]]){
 const mapCenter=width-255-258;
 assert(mapCenter>=487,`PC map center is too narrow at ${width}x${height}`);
 const battleCenter=width-216-180-48;
 assert(battleCenter>=556,`PC battle center is too narrow at ${width}x${height}`);
 const shopContent=Math.min(1500,width*.96)-64;
 const cardWidth=Math.min(200,Math.max(170,width*.115));
 assert(cardWidth*4+22*3<=shopContent,`four PC shop cards do not fit at ${width}x${height}`);
 assert(height-96>=504,`PC event panel is too short at ${width}x${height}`);
}
assert(landscapeCss.includes('html.tv-mode .app,\nhtml.tv-mode body.scene-title #title,\nhtml.tv-mode .modal,'),
 'full-screen landscape layers are not kept in one positioning context');
assert(landscapeCss.includes('--abyss-safe-left:max(0px,env(safe-area-inset-left))'),
 'landscape layout does not detect the camera-side safe area');
assert(landscapeCss.includes('right:var(--abyss-safe-right)!important'),
 'landscape windows do not avoid the right-side camera safe area');
assert(landscapeCss.includes('left:var(--abyss-safe-left)!important'),
 'landscape windows do not avoid the left-side camera safe area');
assert(landscapeCss.includes('clamp(48px,14vh,58px)'),
 'installed iPhone landscape has no fallback when safe-area values are zero');
assert(landscapeCss.includes(':is(#multiDeckChoiceModal,#deckChoiceModal,#markSelectModal)>.panel'),
 'landscape card-picking events do not reserve the viewport for cards');
assert(landscapeCss.includes('font-size:clamp(28px,8vh,42px)!important'),
 'landscape card-picking event emblem is still portrait-sized');
assert(landscapeCss.includes('html.tv-mode .modal>.panel{box-sizing:border-box!important;width:100%!important;max-width:100%!important}'),
 'landscape modal panels can still overflow the camera-safe container');
assert(landscapeCss.includes('html.tv-mode #shopGrid{'),
 'landscape shop has no bounded stock scroller');
assert(landscapeCss.includes('html.tv-mode #firstBlessingModal>.panel{'),
 'first blessing has no short-landscape layout');
assert(landscapeCss.includes('html.tv-mode #rewardModal>.reward-panel{'),
 'combat rewards have no short-landscape layout');
assert(landscapeCss.includes('html.tv-mode .modal,\nhtml.tv-mode #tapStartGate{width:auto!important;height:auto!important}'),
 'safe-area landscape modals still retain a conflicting full viewport width');
assert(landscapeCss.includes('html.tv-mode #cardRevealModal>.panel{'),
 'card reveal has no non-scrolling short-landscape layout');
assert(landscapeCss.includes('html.tv-mode .reward-panel .rewardCard{'),
 'reward cards have no readable short-landscape dimensions');
assert(landscapeCss.includes('grid-template-columns:repeat(4,minmax(0,1fr))!important'),
 'short-landscape shop does not keep four products within the safe width');
assert(landscapeCss.includes('html.tv-mode #rewardHome:not([hidden]){'),
 'reward actions are still rendered as full-width banners');
assert(landscapeCss.includes('right:calc(min(126px,25vw) + 20px)!important'),
 'enemy name is not separated from the fixed forecast panel');
assert(landscapeCss.includes('top:52px!important;bottom:auto!important;left:auto!important;right:8px!important'),
 'short-landscape enemy forecast is not anchored below the HUD');
assert(landscapeCss.includes('transform:none!important;justify-content:flex-start!important;overflow-y:auto!important'),
 'enemy forecast cannot grow downward from its top edge');
assert(landscapeCss.includes('top:5px!important;left:clamp(155px,22vw,310px)!important;right:clamp(245px,32vw,480px)!important'),
 'shopkeeper is not placed in the landscape shop header gap');
assert(landscapeCss.includes('html.tv-mode #map>.mapHead .map-node-legend{width:8.8vw!important}'),
 'map side tabs still consume too much horizontal space');
assert(landscapeCss.includes('grid-template-rows:repeat(3,minmax(0,1fr))!important'),
 'boss relic choices are not kept in three vertical rows');
assert(landscapeCss.includes('html.tv-mode .debug-panel>footer #debugDisable{'),
 'debug exit chrome is not compact on short landscape phones');
assert(landscapeCss.includes('html.tv-mode body:has(#battle.on) .quick-nav{'),
 'battle utility actions are still occupying the top HUD');
assert(landscapeCss.includes('padding:7px 2vw 0 76px!important'),
 'battle arena does not reserve a left-side utility rail');
assert(landscapeCss.includes('html.tv-mode #battle .card{width:min(120px,18vw)!important;height:min(142px,39vh)!important}'),
 'unified landscape battle cards have not gained the requested display space');
assert(landscapeCss.includes('html.tv-mode body:has(#battle.on) .hud .res{'),
 'battle HP and gold are not grouped into the left utility rail');
assert(landscapeCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),
 'battle utility rail is not arranged in two columns');
assert(landscapeCss.includes('padding:10px 170px 10px 210px!important'),
 'desktop hand does not reserve independent left and right control regions');
assert(landscapeCss.includes('flex-basis:180px!important;width:180px!important;min-width:180px!important;max-width:180px!important;height:270px!important'),
 'desktop hand cards do not use stable portrait-like dimensions');
assert(landscapeCss.includes('top:10px!important;right:12px!important;width:146px!important'),
 'desktop end-turn action is not anchored at the upper right of the hand region');
assert(landscapeCss.includes('--enemy-scale:1.22!important;margin-top:18px!important'),
 'landscape boss artwork is not protected from upper-edge clipping');
assert(landscapeCss.includes('html.tv-mode #battle .handArea{padding-left:10px!important}'),
 'desktop card area does not reclaim the lower-left viewport');
assert(landscapeCss.includes('top:214px!important;min-height:30px!important;height:30px!important'),
 'desktop debug actions do not fit beneath the left utility group');
assert(landscapeCss.includes('height:min(31vh,220px)!important;--enemy-scale:1.28!important;margin-top:24px!important'),
 'desktop characters were not enlarged within the protected arena');
assert(landscapeCss.includes('html.tv-mode #shopGrid .unified-market-item.sale-card,'),
 'shop sale and synergy frames are not explicitly removed');
assert(landscapeCss.includes('left:calc(var(--abyss-safe-left,0px) + 106px)!important'),
 'debug actions are not aligned to the camera-safe utility columns');
assert(landscapeCss.includes('justify-content:space-between!important;gap:0!important;padding-left:160px!important;padding-right:82px!important'),
 'landscape fighters are not separated into left and right regions');
assert(landscapeCss.includes('left:58%!important;right:auto!important;top:50px!important'),
 'enemy forecast is not anchored in the enemy-side centre gap');
assert(shellJs.includes("intentEl.style.setProperty('transform','translateX(-50%)','important')"),
 'dynamic enemy forecast positioning does not preserve horizontal centring');
assert(shellJs.includes('const safeTop=Math.max(0,battleRect.top)+10')&&shellJs.includes('bottomLimit-intentHeight'),
 'enemy forecast is not top-anchored inside the visible battle area');
assert(landscapeCss.includes('height:min(33vh,232px)!important;--enemy-scale:1.4!important;margin-top:24px!important'),
 'desktop boss artwork does not use the larger protected size');
assert(landscapeCss.includes('@media (orientation:landscape) and (pointer:fine) and (min-height:601px){'),
 'desktop landscape does not enlarge the shared phone composition');
assert(shellJs.includes("root.style.setProperty('--abyss-phone-ui-scale',phoneUiScale.toFixed(4))"),
 'desktop phone-layout scale is not synchronized with viewport height');
assert(landscapeCss.includes('html.tv-mode #battle #enemySprite.boss-enemy{'),
 'boss artwork has no short-landscape containment rule');
assert(landscapeCss.includes(':is(#multiDeckResultModal,#outcomeModal)>.panel'),
 'landscape result scenes are not bounded to one viewport');
assert(landscapeCss.includes('#multiResultList .multi-result-card:only-child .unified-card'),
 'single-card event results do not preserve readable card dimensions');
assert(landscapeCss.includes(':is(#multiDeckResultModal,#outcomeModal)>.panel>small{display:none!important}'),
 'decorative English captions still consume landscape result space');
assert(landscapeCss.includes('#rewardRelicOption[hidden]{display:none!important}'),
 'landscape rewards override the hidden no-relic state');
assert(landscapeCss.includes('width:min(100%,520px)!important;max-width:520px!important'),
 'landscape reward panel is still unnecessarily wide');
assert(landscapeCss.includes('min-height:64px!important;height:64px!important;max-height:64px!important'),
 'landscape reward rows do not share one height');
assert(landscapeCss.includes('width:180px!important;max-width:48%!important'),
 'landscape confirmation buttons are still unnecessarily wide');
assert(landscapeCss.includes('justify-content:center!important;gap:8px!important'),
 'landscape hand spacing still changes with the number of cards');
assert(landscapeCss.includes('flex-direction:column!important;justify-content:center!important'),
 'landscape reward labels are not contained within their rows');
assert(landscapeCss.includes('.btn.gold ruby rt'),
 'gold landscape buttons do not use dark furigana');
assert(landscapeCss.includes('.keeper-speech ruby rt'),
 'light landscape speech bubbles do not use dark furigana');
assert(landscapeCss.includes('grid-template-columns:15px auto!important;align-items:center!important'),
 'shop life and gold counters are not aligned to one grid');
assert(!economyJs.includes('ABYSS BAZAAR'),
 'obsolete English shop caption is still rendered');
assert(!economyJs.includes('深海階級：価格＋15%'),
 'ascension price adjustment is still exposed in the shop');
assert(economyJs.includes("getAbyssShopPriceMultiplier?.(g)||1"),
 'ascension shop price adjustment is no longer applied to prices');
assert(shellJs.includes('visibleEnemyLeft(enemyRect.left,r.left,innerWidth)-enemyClearance'),
 'enemy forecast does not compensate for artwork whose visible body is inset');
assert(shellJs.includes('enemyForecastClearance(enemyEl,innerWidth)'),
 'enemy forecast clearance does not respond to enemy size and rank');
assert(shellJs.includes("intentEl.style.setProperty('left',(centerX-containerLeft)+'px','important')"),
 'enemy forecast is not positioned from the measured enemy edge');
assert(shellJs.includes('intentPlacementBetweenFighters(playerRect.right,enemyRect.left-enemyClearance,preferredWidth,innerWidth)'),
 'touch layout does not place the forecast between both fighters');
assert(shellJs.includes('intentPlacementBeforeEnemy(playerRect.right,visibleLeft,preferredWidth,innerWidth)'),
 'PC layout does not place the forecast beside the enemy');
assert(landscapeCss.includes('align-self:center!important;aspect-ratio:1/1!important;height:auto!important'),
 'landscape event artwork is still cropped into a tall cell');
assert(landscapeCss.includes('object-fit:contain!important;object-position:center!important'),
 'landscape event artwork does not preserve its complete composition');
assert(landscapeCss.includes('grid-template-columns:minmax(175px,31%) minmax(0,1fr)!important'),
 'opening gift does not place its title beside the dialogue');
assert(landscapeCss.includes('grid-template-rows:repeat(3,minmax(0,1fr))!important'),
 'opening gift choices do not expand evenly into the available panel height');
assert(landscapeCss.includes('grid-template-rows:auto auto!important;align-content:center!important'),
 'opening gift choice text is not vertically contained');
assert(landscapeCss.includes('padding-top:42px!important')&&landscapeCss.includes('width:min(92%,430px)!important'),
 'PC enemy name does not have a dedicated band above the artwork');
assert(landscapeCss.includes('.enemy-unit>.enemyName ruby rt')&&landscapeCss.includes('color:#000!important'),
 'enemy-name furigana is not fixed to black in landscape');
assert(landscapeCss.includes('grid-template-columns:minmax(170px,29%) minmax(0,1fr)!important'),
 'opening gift choices do not use the landscape width for title and prose');
assert(landscapeCss.includes('font-size:.42em!important')&&landscapeCss.includes('ruby-align:center'),
 'landscape prose furigana can still spread sentence fragments apart');
assert(landscapeCss.includes('html.tv-mode ruby rt{')&&landscapeCss.includes('color:#000!important;text-shadow:0 0 2px #d9ffff!important'),
 'landscape furigana is not consistently black across changing backgrounds');
assert(landscapeCss.includes('#multiDeckResultModal:has(#multiResultList>.stat-result-card:only-child)>.panel')&&landscapeCss.includes('width:min(480px,86vw)!important;height:auto!important'),
 'single-effect result window is not compact and content-sized');
assert(landscapeCss.includes('width:116px!important;height:108px!important'),
 'opening gift spirit is not enlarged beside the title');
const giftMinimumInnerHeight=320-12-14;
const giftMinimumChoiceHeight=(giftMinimumInnerHeight-92-5-10)/3;
const giftTwoLineRubyHeight=2*(13*1.2+13*.55)+2+14;
assert(giftTwoLineRubyHeight<giftMinimumChoiceHeight,
 'opening gift ruby text cannot fit inside a choice row');
assert(refinementJs.includes('assets/events/${art}.webp?v=2'),
 'corrected event illustrations are not cache-busted');
const intentPositionSource=shellJs.split('\n').find(line=>line.startsWith('function intentCenterBeforeEnemy('));
const visibleEnemySource=shellJs.split('\n').find(line=>line.startsWith('function visibleEnemyLeft('));
const visiblePcEnemySource=shellJs.split('\n').find(line=>line.startsWith('function visiblePcEnemyLeft('));
const enemyClearanceSource=shellJs.match(/function enemyForecastClearance\([\s\S]*?\n\}/)?.[0];
const fighterGapSource=shellJs.match(/function intentPlacementBetweenFighters\([\s\S]*?\n\}/)?.[0];
const enemySideSource=shellJs.match(/function intentPlacementBeforeEnemy\([\s\S]*?\n\}/)?.[0];
assert(intentPositionSource,'enemy forecast gap calculator is missing');
assert(visibleEnemySource,'enemy visible-edge calculator is missing');
assert(visiblePcEnemySource,'PC enemy visible-edge calculator is missing');
assert(enemyClearanceSource,'size-aware enemy clearance calculator is missing');
assert(fighterGapSource,'touch fighter-gap calculator is missing');
assert(enemySideSource,'PC enemy-side forecast calculator is missing');
const intentPositionContext={};
vm.runInNewContext(`${visibleEnemySource};${intentPositionSource};this.visibleEnemyLeft=visibleEnemyLeft;this.intentCenterBeforeEnemy=intentCenterBeforeEnemy`,intentPositionContext);
assert(intentPositionContext.visibleEnemyLeft(532,569,844)===532,
 'Mordigan-style artwork should keep its existing forecast anchor');
assert(intentPositionContext.visibleEnemyLeft(497,569,844)>497,
 'Oni Kinme-style inset artwork should move the forecast toward the enemy');
for(const [enemyLeft,intentWidth,viewportWidth]of [[992,238,1536],[620,136,844],[1050,220,1920]]){
 const center=intentPositionContext.intentCenterBeforeEnemy(enemyLeft,intentWidth,viewportWidth);
 const edgeDifference=enemyLeft-(center+intentWidth/2);
 assert(Math.abs(edgeDifference)<.01,
  `enemy forecast right edge is not aligned at ${viewportWidth}px (difference ${edgeDifference})`);
}
const fighterGapContext={};
vm.runInNewContext(`${fighterGapSource};this.place=intentPlacementBetweenFighters`,fighterGapContext);
for(const [playerRight,enemyLeft,preferredWidth,viewportWidth]of [[370,540,136,844],[405,532,136,844],[720,1010,136,1536]]){
 const placed=fighterGapContext.place(playerRight,enemyLeft,preferredWidth,viewportWidth),margin=Math.max(6,Math.min(10,viewportWidth*.01));
 assert(placed.center-placed.width/2>=playerRight+margin-.01,'touch forecast overlaps the player');
 assert(placed.center+placed.width/2<=enemyLeft-margin+.01,'touch forecast overlaps the enemy');
}
const enemySideContext={};
vm.runInNewContext(`${visiblePcEnemySource};${enemySideSource};this.visible=visiblePcEnemyLeft;this.place=intentPlacementBeforeEnemy`,enemySideContext);
assert(enemySideContext.visible(710,980,1920)>850,
 'PC forecast still anchors to the transparent left edge of enemy artwork');
const enemyClearanceContext={};
vm.runInNewContext(`${enemyClearanceSource};this.clearance=enemyForecastClearance`,enemyClearanceContext);
const enemyMock=(rank,width,height)=>({offsetWidth:width,offsetHeight:height,classList:{contains:name=>name===`${rank}-enemy`}});
const normalClearance=enemyClearanceContext.clearance(enemyMock('normal',260,190),1536);
const eliteClearance=enemyClearanceContext.clearance(enemyMock('elite',340,230),1536);
const bossClearance=enemyClearanceContext.clearance(enemyMock('boss',470,315),1536);
assert(normalClearance<eliteClearance&&eliteClearance<bossClearance,
 'enemy forecast clearance does not increase from normal to elite to boss');
for(const [playerRight,enemyLeft,preferredWidth,viewportWidth]of [[610,980,230,1366],[760,1150,260,1920],[450,760,210,1000]]){
 const placed=enemySideContext.place(playerRight,enemyLeft,preferredWidth,viewportWidth),margin=Math.max(10,Math.min(16,viewportWidth*.01));
 assert(placed.center+placed.width/2<=enemyLeft-margin+.01,'PC forecast overlaps the enemy');
 assert(placed.center-placed.width/2>=playerRight+margin-.01,'PC forecast overlaps the player');
 assert(Math.abs(placed.center+placed.width/2-(enemyLeft-margin))<.01,'PC forecast is not aligned to the enemy side');
}
assert(desktopCss.includes('--pc-card-width:clamp(168px,11.5vw,206px)')&&desktopCss.includes('--pc-card-height:clamp(210px,38vh,300px)'),
 'PC card size does not share one battle-based scale');
assert(desktopCss.includes('.modal .card:not(.card-use-ghost)')&&desktopCss.includes('width:var(--pc-card-width)!important'),
 'PC modal cards do not use the battle card size');
assert(desktopCss.includes('#cardRevealModal .unified-card')&&desktopCss.includes('#multiResultList .unified-card'),
 'legacy reveal/result card sizes still override the unified PC card size');
assert(desktopCss.includes('#battle .intent{width:clamp(210px,14vw,260px)!important;min-width:0!important'),
 'PC forecast cannot shrink to remain between the fighters');
assert(desktopCss.includes('width:min(1080px,88vw)!important')&&desktopCss.includes('width:min(1220px,92vw)!important'),
 'PC reward home and card selection are still phone-sized');
assert(desktopCss.includes('#rewardHome:not([hidden]){box-sizing:border-box!important;width:100%!important;max-width:none!important'),
 'legacy landscape rules still cap the PC reward home width');
assert(desktopCss.includes('#rewardHome :is(.reward-gold,.reward-row)')&&desktopCss.includes('height:clamp(72px,9vh,92px)!important;max-height:none!important'),
 'legacy landscape rules still compress PC reward rows');
assert(desktopCss.includes('grid-template-columns:repeat(3,var(--pc-card-width))!important')&&desktopCss.includes('height:auto!important;min-height:var(--pc-card-height)!important;max-height:none!important'),
 'PC reward cards still inherit the clipped 204px phone container');
assert(desktopCss.includes('grid-template-rows:none!important;grid-auto-rows:minmax(88px,1fr)!important;align-content:stretch!important'),
 'PC event choices do not distribute over the available content column');
assert(enhanceJs.includes('SFX_OUTPUT_GAIN=.5,BGM_OUTPUT_GAIN=.5,AUDIO_PREFS_VERSION=6'),
 'BGM and sound-effect master output gains are not both fifty percent');
assert(enhanceJs.includes('DEFAULT_AUDIO_PREFS={version:AUDIO_PREFS_VERSION,bgm:1,sfx:1}'),
 'saved audio preference migration prevents the fifty-percent master levels');
assert(desktopCss.includes('#map>.path{position:absolute!important;inset:12px 258px 12px 255px!important'),
 'PC map track has no explicit drawable area');
assert(desktopCss.includes('.map-node-legend{position:fixed!important;left:auto!important;right:20px!important;top:88px!important'),
 'PC map legend can still overlap the top-right HP display');
assert(enhanceJs.includes('window.playAbyssBattleMusic=playBattleMusic'),
 'battle music has no immediate screen-entry trigger');
assert(relicsEventsJs.includes("window.isAbyssBossRelic=name=>"),
 'events have no authoritative boss-relic exclusion check');
assert(!relicsEventsJs.includes('遺物「深淵の瞳」を得る'),
 'a normal event still grants the boss-only Abyss Eye relic');
assert(!strategyPolishJs.includes("addRelic('竜の逆鱗')"),
 'a story event still grants the boss-only Dragon Scale relic');
assert(index.includes('window.isAbyssBossRelic?.(n)&&c[1].includes(n)'),
 'event choices do not reject future boss-relic rewards');
assert(landscapeCss.includes('html.tv-mode #outcomeText ruby{display:inline!important'),
 'event outcome ruby can still split a sentence into separate grid rows');
assert(landscapeCss.includes('width:min(14vw,230px)!important'),
 'desktop map explanations do not grow with the phone-layout scale');
assert(landscapeCss.includes('font-size:calc(8px * var(--abyss-phone-ui-scale,1))!important'),
 'desktop battle secondary text is not tied to the viewport scale');
assert(index.includes("if(id==='battle'&&G?.enemy)window.playAbyssBattleMusic?.(G.enemy)"),
 'battle screen still waits for DOM observation before changing music');
assert(!landscapeCss.includes('.touch-auto-catcher'),
 'obsolete touch interception overlay is still present');

function verifyTapStartRecovery(){
 const classList=initial=>{
  const values=new Set(initial);
  return{add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
 };
 const listeners={};
 const gate={
  isConnected:true,style:{},
  addEventListener:(type,handler)=>{listeners[type]=handler},
  querySelector:()=>({textContent:''}),
  remove(){this.isConnected=false}
 };
 const title={classList:classList([])},other={classList:classList(['on'])};
 const document={
  body:{classList:classList([])},
  getElementById:id=>id==='tapStartGate'?gate:id==='title'?title:null,
  querySelectorAll:selector=>selector==='.screen.on'?[other]:[]
 };
 const window={setTimeout:handler=>{handler();return 1},addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync(path.join(dist,'boot-recovery.js'),'utf8'),{document,window});
 assert(typeof listeners.touchend==='function','TAP START recovery has no touch handler');
 listeners.touchend();
 assert(!gate.isConnected,'TAP START recovery did not remove the startup gate');
 assert(title.classList.contains('on'),'TAP START recovery did not reveal the title');
 assert(document.body.classList.contains('scene-title'),'TAP START recovery did not restore title state');
}

verifyTapStartRecovery();

async function verifyServer(){
 const server=spawn(process.execPath,[path.join(__dirname,'local-server.cjs')],{
  cwd:root,stdio:['ignore','pipe','pipe']
 });
 try{
  let response;
  for(let attempt=0;attempt<30;attempt++){
   try{response=await fetch('http://127.0.0.1:8119/');if(response.ok)break}catch(e){}
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert(response?.ok,`local server did not return index.html (${response?.status||'no response'})`);
  const html=await response.text();
  assert(html.includes('id="tapStartGate"'),'served page has no TAP START gate');
  assert(html.includes('responsive-shell.js?v=39'),'served page has a stale responsive script version');
  assert(html.includes('responsive-landscape.css?v=48'),'served page has a stale responsive stylesheet version');
  assert(html.includes('responsive-desktop.css?v=5'),'served page has no PC layout stylesheet');
  assert(html.includes('relics-events.js?v=155'),'served page has a stale relic event script version');
  assert(html.includes('strategy-polish.js?v=186'),'served page has a stale strategy event script version');
  assert(html.includes('economy.js?v=158'),'served page has a stale economy script version');
  assert(html.includes('refinement.js?v=70'),'served page has a stale event script version');
  assert(html.includes('enhance.js?v=268'),'served page has a stale audio script version');
 }finally{
  server.kill('SIGTERM');
 }
}

verifyServer().then(()=>{
 console.log(JSON.stringify({
  startupGate:true,
  tapStartRecovery:true,
  titleScreen:true,
  inlineScripts:inlineScripts.length,
  externalScripts:scriptSources.length,
  syntheticTouchRemapping:false,
  visualViewportRoot:true,
  absoluteFullscreenLayers:true,
  localServer:true
 },null,2));
}).catch(error=>{
 console.error(error.stack||error);
 process.exitCode=1;
});
