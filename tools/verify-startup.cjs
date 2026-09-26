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
const upgradeJs=fs.readFileSync(path.join(dist,'upgrade.js'),'utf8');
const titleToolsJs=fs.readFileSync(path.join(dist,'title-tools.js'),'utf8');
const refinementCss=fs.readFileSync(path.join(dist,'refinement.css'),'utf8');
const enhanceJs=fs.readFileSync(path.join(dist,'enhance.js'),'utf8');
const refinementJs=fs.readFileSync(path.join(dist,'refinement.js'),'utf8');
const economyJs=fs.readFileSync(path.join(dist,'economy.js'),'utf8');
const relicsEventsJs=fs.readFileSync(path.join(dist,'relics-events.js'),'utf8');
const strategyPolishJs=fs.readFileSync(path.join(dist,'strategy-polish.js'),'utf8');
const gamePolishCss=fs.readFileSync(path.join(dist,'game-polish.css'),'utf8');
assert(enhanceJs.includes("document.getElementById('battle')?.classList.contains('on')&&window.getAbyssGame?.()?.enemy"),
 'combat sound effects still lower the active battle BGM');
assert(titleToolsJs.includes('id="pcBgmVolume"')&&titleToolsJs.includes('id="pcSfxVolume"')&&titleToolsJs.includes('setAbyssAudioPrefs'),
 'PC settings do not expose persistent BGM and sound-effect volume controls');
assert(titleToolsJs.includes('value="50"')&&titleToolsJs.includes('{bgm:.5,sfx:.5}')&&enhanceJs.includes('DEFAULT_AUDIO_PREFS={version:AUDIO_PREFS_VERSION,bgm:.5,sfx:.5}'),
 'BGM and sound-effect settings do not default to 50 percent');
assert(upgradeJs.includes('id="battleSettingsView"')&&titleToolsJs.includes("$('#battleSettingsView')?.addEventListener('click',openSettings)"),
 'battle quick navigation cannot open the settings menu');
for(const combatHtml of [index,fs.readFileSync(path.join(dist,'game.html'),'utf8')]){
 assert(combatHtml.includes('if(fixed.stealBlock){fixed.denyDraw=Math.max')&&combatHtml.includes('delete fixed.stealBlock'),
  'conditional block theft is not converted into reliable draw denial');
 assert(combatHtml.includes('if(fixed.randomizeTop){fixed.topCostUp=Math.max')&&combatHtml.includes('delete fixed.randomizeTop'),
  'random top-card cost changes are not converted into a guaranteed cost increase');
 assert(combatHtml.includes('G.topCostPenalty=Math.max')&&combatHtml.includes('if(G.topCostPenalty>0)')&&combatHtml.includes('if(G.turn===1)G.topCostPenalty=0'),
  'the guaranteed next-card cost increase is not resolved and consumed');
 assert(combatHtml.includes('視界妨害：次のターンの手札−')&&combatHtml.includes('攪乱：次に引くカードのコスト＋'),
  'replacement enemy actions are missing from the combat forecast');
}
assert(upgradeJs.includes('視界妨害：次のターンの手札−${m.denyDraw}')&&upgradeJs.includes('攪乱：次に引くカードのコスト＋${m.topCostUp}'),
 'the bestiary does not explain the replacement enemy actions');
assert(!upgradeJs.includes('m.stealBlock')&&!upgradeJs.includes('m.randomizeTop'),
 'the bestiary still advertises ineffective enemy actions');
for(const combatHtml of [index,fs.readFileSync(path.join(dist,'game.html'),'utf8')]){
 assert(combatHtml.includes("['THE SEA FALLS SILENT','静けさが戻る','守護者は崩れ、黒い糸も消えた。")&&combatHtml.includes("['THANK YOU','また会う日まで','「ありがとう。"),
  'the concise four-page abyss ending is missing');
 assert(combatHtml.includes("[['THE DEEP LORD FALLS','深海の主、沈む','最後の一撃で深海の主は沈み")&&combatHtml.includes("['A VOICE FROM THE DARK','闇の底からの声','亡骸の下で巨大な瞳が開く。"),
  'the concise two-page layer-three ending is missing');
 assert(!combatHtml.includes("['THE SPIRIT RETURNS'")&&!combatHtml.includes("['SOMETHING STIRS BELOW'"),
  'obsolete long ending pages are still present');
}
assert(!strategyPolishJs.includes("steps.length===3&&steps[0]?.[0]==='THE DEEP LORD FALLS'"),
 'strategy polish still replaces the concise ending with long copy');
assert(desktopCss.includes('.quick-nav .pc-battle-settings{display:block!important}')&&desktopCss.includes('.pc-audio-settings'),
 'PC layout does not reveal the battle settings button and audio mixer');
assert(landscapeCss.includes('width:var(--abyss-vv-width,100%)!important'),
 'landscape root does not use the measured visual viewport width');
assert(landscapeCss.includes('height:var(--abyss-vv-height,100%)!important'),
 'landscape root does not use the measured visual viewport height');
assert(index.includes('responsive-desktop.css?v=33'),
 'PC layout stylesheet is not loaded after the landscape layout');
assert(desktopCss.trim().startsWith('/* PC landscape layout.')&&desktopCss.includes('@media (orientation:landscape) and (min-width:1000px) and (min-height:600px)'),
 'PC layout is not isolated from touch and portrait layouts');
for(const selector of ['#battle .arena','#battle .hand','#map>.path','#eventModal','#shopModal','.reward-panel','.boss-relic-choices']){
 assert(desktopCss.includes(selector),`PC layout does not cover ${selector}`);
}
assert(desktopCss.includes("grid-template-areas:'icon name power' 'icon name cost'"),
 'PC boss relic choices do not use the available horizontal space');
assert(desktopCss.includes('#outcomeModal #outcomeText ruby{display:ruby!important'),
 'PC result furigana can still split the outcome sentence');
assert(shellJs.includes("desktop.href='responsive-desktop.css?v=33'")&&shellJs.includes("link.href='responsive-landscape.css?v=48'"),
 'dynamically loaded game shells do not receive the PC layout');
assert(shellJs.includes("TV_CANVAS_KEY='abyssTvFixedCanvas'")&&shellJs.includes('TV_CANVAS_WIDTH=1600,TV_CANVAS_HEIGHT=900')&&shellJs.includes("add('titleTvDisplay'")&&shellJs.includes("add('titleTvScale'"),
 'TV fixed-canvas controls are missing from settings');
assert(desktopCss.includes('html.tv-mode.tv-fixed-canvas body{position:fixed!important;left:50%!important;top:50%!important')&&desktopCss.includes('scale(var(--tv-canvas-scale,1))!important'),
 'TV layout does not uniformly scale a centered 16:9 canvas');
assert(desktopCss.includes('#titleSettingsModal>.settings-hub-panel{box-sizing:border-box!important;position:absolute!important;left:50%!important;top:50%!important')&&desktopCss.includes('transform:translate(-50%,-50%) scale(.92)!important')&&desktopCss.includes('#titleSettingsModal .modal-shell-foot{display:block!important'),
 'TV settings are not proportionally fitted with the close footer inside the canvas');
assert(!shellJs.includes('installTvModalWheel'),
 'TV settings still depend on a special wheel-scroll workaround');
assert(shellJs.includes('function closeSettingsForDisplayChange()')&&shellJs.includes('function settleDisplayViewport()')&&shellJs.includes('for(const delay of [0,60,180,420])')&&shellJs.includes("document.addEventListener('fullscreenchange',()=>{handleOrientation();settleDisplayViewport()"),
 'fullscreen and TV fixed mode do not remeasure after the native viewport settles');
assert(gamePolishCss.includes('#deckChoiceList{box-sizing:border-box;flex:1 1 auto;min-height:0;max-height:none')&&desktopCss.includes('#deckChoiceModal>.panel{display:flex!important;flex-direction:column!important;width:min(1180px,94vw)!important;height:min(820px,90vh)!important'),
 'single-card event picker can still collapse or hide its card list');
assert(shellJs.includes('input[type=range]:not([disabled])')&&shellJs.includes('function adjustFocusedRange(dir)')&&shellJs.includes("focusEl.dispatchEvent(new Event('input',{bubbles:true}))"),
 'controller navigation cannot focus and adjust the audio sliders');
assert(shellJs.includes('.relic-grid .relic-card,.beast-legacy-grid .beast-card'),
 'controller focus cannot traverse creature and relic archive entries');
assert(shellJs.includes("activeModal?.querySelector('.modal-shell-body')"),
 'controller scrolling does not prioritize the active modal body');
assert(shellJs.includes("if(el.matches?.(':disabled,[hidden]'))return false"),
 'controller focus can remain on completed reward actions');
assert(shellJs.includes("pendingHandFocusIndex=Math.max(0,(Number(focusEl.dataset.i)||0)-1)"),
 'controller focus does not move to the card left of a played card');
assert(shellJs.includes("topModal?.matches?.('#shopModal')?topModal.querySelector('.shop-choose #shopBack'):null"),
 'controller cancel does not return card upgrade/removal choices to the market');
assert(shellJs.includes('function scrollShopListBeforeLeaving(dir)')&&shellJs.includes('if(scrollShopListBeforeLeaving(dir))return'),
 'shop navigation can leave the scrolling list before reaching its edge');
assert(shellJs.includes("centerShopChoice=!!el.closest?.('#shopModal .shop-choose .shop-card-list')")&&shellJs.includes("block:centerShopChoice?'center':'nearest'"),
 'focused shop upgrade/removal rows are not centered in the scroller');
assert(!shellJs.includes(".shop-card-list .unified-shop-choice,#shopGrid .market-item"),
 'shop upgrade/removal navigation still scrolls instead of moving between rows');
assert(shellJs.includes('function applyPcMapEdgePadding(track)')&&shellJs.includes('const remap=value=>pcMap?6+value*.88:value'),
 'PC map nodes do not keep safe space above the first row and below the boss row');
assert(shellJs.includes("track.querySelectorAll('svg .route')"),
 'PC map routes are not kept aligned with padded map nodes');
assert(shellJs.includes("const fixedPcForecast=d.documentElement.classList.contains('tv-fixed-canvas')||matchMedia?.('(hover:hover) and (pointer:fine) and (min-width:1000px) and (min-height:600px)')?.matches"),
 'PC enemy forecast still follows animated enemy geometry');
assert(desktopCss.includes('.enemy-unit>#intent{position:fixed!important;left:67vw!important')&&desktopCss.includes('.enemy-unit.elite-unit>#intent{left:65vw!important}')&&desktopCss.includes('.enemy-unit.boss-unit>#intent{left:61vw!important}')&&desktopCss.includes('top:29vh!important')&&desktopCss.includes('transform:translate(-100%,-100%)!important'),
 'PC enemy forecast is not fixed in the marked space immediately left of the enemy');
assert(desktopCss.includes('tv-fixed-canvas #battle .enemy-unit>#intent{left:1024px!important;top:243px!important}')&&desktopCss.includes('tv-fixed-canvas #battle .enemy-unit.elite-unit>#intent{left:992px!important}')&&desktopCss.includes('tv-fixed-canvas #battle .enemy-unit.boss-unit>#intent{left:928px!important}'),
 'TV fixed display does not shift every enemy forecast left 3 and up 2');
assert(desktopCss.includes('.arena>.unit:first-child>.enemyName,')&&desktopCss.includes('.arena>.enemy-unit>.enemyName{position:relative!important;top:auto!important')&&desktopCss.includes('.unit>.creature{margin-top:0!important}'),
 'PC combatant names can still overlap their artwork');
assert(index.indexOf('id="enemySprite"')<index.indexOf('id="enemyName"')&&index.indexOf('id="enemyName"')<index.indexOf('id="enemyHpFill"'),
 'enemy name is not positioned between the artwork and HP bar');
assert(index.indexOf('id="playerSprite"')<index.indexOf('潮騎士・アオ')&&index.indexOf('潮騎士・アオ')<index.indexOf('id="playerHpFill"'),
 'player name is not positioned between the artwork and HP bar');
assert(desktopCss.includes(':is(#playerStatus,#enemyStatus){box-sizing:border-box!important')&&desktopCss.includes('height:clamp(78px,9vh,96px)!important')&&desktopCss.includes('min-height:78px!important;max-height:96px!important'),
 'PC status area does not reserve enough room for three effect rows');
assert(desktopCss.includes('#shopModal:has(.shop-choose) .shop-card-list')&&desktopCss.includes('overflow-y:scroll!important')&&desktopCss.includes('flex:1 1 0!important'),
 'PC shop card choices cannot scroll with a mouse wheel');
assert(desktopCss.includes('#relicRevealModal>.relic-reveal')&&desktopCss.includes('width:min(680px,60vw)!important'),
 'PC relic reward reveal is still stretched across the screen');
assert(desktopCss.includes('.boss-unit>#enemySprite.boss-enemy')&&desktopCss.includes('height:min(41vh,390px)!important'),
 'PC boss artwork is not enlarged independently from ordinary enemies');
assert(desktopCss.includes('#collectionGrid.beast-legacy-grid{grid-template-columns:repeat(auto-fill,minmax(clamp(340px,24vw,440px),1fr))')&&desktopCss.includes('#beastDetailModal .beast-detail-portrait')&&desktopCss.includes('width:min(520px,58vw)!important;height:min(300px,34vh)!important'),
 'PC bestiary cards or the centred detail portrait are still too small');
assert(strategyPolishJs.includes("normalKeeperPortrait.src='assets/ui/puffer-shopkeeper-v2.webp?v=73'"),
 'the normal puffer shopkeeper portrait is not preloaded before the first abyss story');
assert(refinementJs.includes('assets/events/${art}.webp?v=3'),
 'event illustrations do not use the refreshed high-resolution assets');
assert(refinementJs.includes('const art=eventArt[title];if(art)return `<img class="event-illustration"'),
 'portrait events still fall back to small seal icons instead of illustrations');
assert(refinementJs.includes('function syncPortraitEventArt()')&&refinementJs.includes("const portraitEventObserver=new MutationObserver(syncPortraitEventArt)")&&refinementJs.includes("['eventIcon','eventTitle','mapChoiceIcon','mapChoiceTitle','deckChoiceIcon','deckChoiceTitle']"),
 'portrait event artwork has no fallback when a stale seal icon is rendered');
assert(refinementCss.includes('@media (orientation:portrait) and (max-width:700px)')&&refinementCss.includes('.bigicon:has(.event-illustration)')&&refinementCss.includes('height:clamp(150px,24dvh,220px)')&&refinementCss.includes('object-fit:cover'),
 'portrait event illustrations do not have a bounded mobile layout');
assert(desktopCss.includes('width:min(1500px,94vw)!important;height:min(700px,78vh)!important')&&desktopCss.includes('grid-template-columns:minmax(460px,52%) minmax(0,1fr)!important')&&desktopCss.includes('.event-illustration{width:100%!important;height:100%!important;object-fit:contain!important'),
 'PC event illustrations are cropped or do not use the widened short-panel layout');
assert(desktopCss.includes('#strategyModal .achievement-card b{font-size:18px!important')&&desktopCss.includes('#strategyModal .achievement-card p{margin:7px 0!important;font-size:15px!important')&&desktopCss.includes('.achievement-card.locked{opacity:.68!important'),
 'PC achievements are still too small or faint to read');
assert(!landscapeCss.includes('.guardian-reveal.story-normal-keeper{'),
 'the first puffer shopkeeper story page still uses a different side-by-side layout');
assert(gamePolishCss.includes('top:max(72px,12dvh);bottom:auto;width:min(760px,84vw)')&&gamePolishCss.includes('background:linear-gradient(180deg,#170712ed,#09040ceb)'),
 'the guardian half-HP dialogue is not positioned in its readable upper overlay');
for(const name of ['black-threads.webp','memory-vault.webp','void-scales.webp']){
 const image=fs.readFileSync(path.join(dist,'assets/events',name));
 assert(image.length>100000,`high-resolution abyss event art is unexpectedly small: ${name}`);
}
assert(desktopCss.includes('.debug-panel h2{margin:4px 0 0!important;font-size:32px!important'),
 'PC debug panel text is still using the compact landscape scale');
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
assert(desktopCss.includes('--pc-hand-height:clamp(320px,34vh,360px)')&&desktopCss.includes('height:calc(100% - var(--pc-hand-height))!important'),
 'tall PC battle layout still leaves excessive space above the cards');
assert(desktopCss.includes('height:26px!important')&&desktopCss.includes('#battle .hptext{font-size:clamp(13px,.82vw,16px)!important'),
 'PC HP bar does not fully contain its enlarged value text');
assert(desktopCss.includes('#battle .enemyName{font-size:clamp(16px,1vw,20px)!important')&&desktopCss.includes(':is(.state-pill,.state-none){font-size:clamp(12px,.76vw,15px)!important'),
 'PC battle names and status text were not enlarged');
assert(desktopCss.includes('#shopModal:has(.shop-choose) .shop-card-list')&&desktopCss.includes('grid-template-columns:repeat(4,minmax(0,1fr))!important'),
 'PC shop upgrade choices are not arranged four cards per row');
assert(desktopCss.includes('#shopGrid .shop-item b{font-size:17px!important')&&desktopCss.includes('#shopGrid .shop-item span{font-size:14px!important'),
 'PC shop service text still inherits the compact landscape scale');
assert(desktopCss.includes('.shop-tabs button{min-height:48px!important')&&desktopCss.includes('font-size:18px!important'),
 'PC shop tabs remain too small to read from a monitor');
assert(desktopCss.includes('.modal :is(button,p,span,small,label,b,strong):not(.card *):not(.unified-card *){font-size:max(13px,1em)!important'),
 'PC dialogs can still inherit unreadable phone-sized helper text');
assert(desktopCss.includes('.multi-result-card>.result-action')&&desktopCss.includes('font-size:clamp(24px,1.65vw,32px)!important'),
 'PC card result actions are not displayed at a readable size');
assert(fs.readFileSync(path.join(dist,'game-polish.js'),'utf8').includes('class="result-action result-action-${r.kind'),
 'card result labels still repeat card names above the cards');
assert(upgradeJs.includes('assets/enemies/${file}?v=80')&&upgradeJs.includes("assets/enemies/${b.file}?v=102"),
 'corrected enemy cutouts are not cache-busted in battle and bestiary views');
assert(desktopCss.includes('min-height:calc(var(--pc-card-height) + 54px)!important'),
 'PC shop card rows can overlap each other');
assert(desktopCss.includes('max-width:1220px!important')&&desktopCss.includes('grid-auto-rows:max-content!important'),
 'PC reward and card-choice dialogs still inherit clipped landscape sizing');
assert(desktopCss.includes('#cardRevealModal:has(.shop-upgrade-card-pair)>.panel')&&desktopCss.includes('max-width:680px!important'),
 'PC upgrade result does not reserve room for both cards');
assert(landscapeCss.includes('html.tv-mode #shopGrid .unified-market-item.sale-card,'),
 'shop sale and synergy frames are not explicitly removed');
assert(landscapeCss.includes('left:calc(var(--abyss-safe-left,0px) + 106px)!important'),
 'debug actions are not aligned to the camera-safe utility columns');
assert(landscapeCss.includes('justify-content:space-between!important;gap:0!important;padding-left:160px!important;padding-right:82px!important'),
 'landscape fighters are not separated into left and right regions');
assert(landscapeCss.includes('left:50%!important;right:auto!important;top:50px!important'),
 'enemy forecast is not anchored in the upper centre gap');
assert(shellJs.includes("intentEl.style.setProperty('transform','translate(-50%,-50%)','important')"),
 'dynamic enemy forecast positioning does not preserve horizontal centring');
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
assert(landscapeCss.includes('font-size:clamp(22px,min(1.8vw,3.8vh),34px)!important'),
 'landscape gold/stat result text remains too small');
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
assert(landscapeCss.includes('grid-template-columns:15px auto!important;align-items:center!important'),
 'shop life and gold counters are not aligned to one grid');
assert(!economyJs.includes('ABYSS BAZAAR'),
 'obsolete English shop caption is still rendered');
assert(!economyJs.includes('深海階級：価格＋15%'),
 'ascension price adjustment is still exposed in the shop');
assert(economyJs.includes("getAbyssShopPriceMultiplier?.(g)||1"),
 'ascension shop price adjustment is no longer applied to prices');
assert(shellJs.includes('visibleEnemyLeft(enemyRect.left,r.left,innerWidth)'),
 'enemy forecast does not compensate for artwork whose visible body is inset');
assert(shellJs.includes("intentEl.style.setProperty('left',(centerX-containerLeft)+'px','important')"),
 'enemy forecast is not positioned from the measured enemy edge');
assert(shellJs.includes('intentPlacementBetweenFighters(playerRect.right,enemyRect.left,preferredWidth,innerWidth)'),
 'touch layout does not place the forecast between both fighters');
assert(shellJs.includes('intentPlacementBeforeEnemy(playerRect.right,visibleLeft,preferredWidth,innerWidth)'),
 'PC layout does not place the forecast beside the enemy');
assert(landscapeCss.includes('align-self:center!important;aspect-ratio:1/1!important;height:auto!important'),
 'landscape event artwork is still cropped into a tall cell');
assert(landscapeCss.includes('object-fit:contain!important;object-position:center!important'),
 'landscape event artwork does not preserve its complete composition');
assert(landscapeCss.includes('grid-template-columns:minmax(175px,31%) minmax(0,1fr)!important'),
 'opening gift does not place its title beside the dialogue');
assert(landscapeCss.includes('grid-template-rows:repeat(3,74px)!important'),
 'opening gift choices still expand to fill the entire panel');
assert(landscapeCss.includes('grid-template-rows:auto auto!important;align-content:center!important'),
 'opening gift choice text is not vertically contained');
assert(landscapeCss.includes('width:70px!important;height:58px!important'),
 'opening gift spirit is not enlarged beside the title');
const giftLayoutHeight=58+5+74*3;
const giftMinimumInnerHeight=320-12-14;
assert(giftLayoutHeight<=giftMinimumInnerHeight,
 'opening gift rows overflow the shortest supported landscape viewport');
const giftTwoLineRubyHeight=2*(13*1.2+13*.55)+2+14;
assert(giftTwoLineRubyHeight<74,
 'opening gift ruby text cannot fit inside a choice row');
assert(refinementJs.includes('assets/events/${art}.webp?v=3'),
 'corrected event illustrations are not cache-busted');
const intentPositionSource=shellJs.split('\n').find(line=>line.startsWith('function intentCenterBeforeEnemy('));
const visibleEnemySource=shellJs.split('\n').find(line=>line.startsWith('function visibleEnemyLeft('));
const visiblePcEnemySource=shellJs.split('\n').find(line=>line.startsWith('function visiblePcEnemyLeft('));
const fighterGapSource=shellJs.match(/function intentPlacementBetweenFighters\([\s\S]*?\n\}/)?.[0];
const enemySideSource=shellJs.match(/function intentPlacementBeforeEnemy\([\s\S]*?\n\}/)?.[0];
assert(intentPositionSource,'enemy forecast gap calculator is missing');
assert(visibleEnemySource,'enemy visible-edge calculator is missing');
assert(visiblePcEnemySource,'PC enemy visible-edge calculator is missing');
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
assert(enhanceJs.includes('DEFAULT_AUDIO_PREFS={version:AUDIO_PREFS_VERSION,bgm:.5,sfx:.5}'),
 'audio preference defaults are not both fifty percent');
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
  assert(html.includes('responsive-shell.js?v=51'),'served page has a stale responsive script version');
  assert(html.includes('responsive-landscape.css?v=48'),'served page has a stale responsive stylesheet version');
  assert(html.includes('responsive-desktop.css?v=33'),'served page has no PC layout stylesheet');
  assert(html.includes('relics-events.js?v=155'),'served page has a stale relic event script version');
  assert(html.includes('strategy-polish.js?v=188'),'served page has a stale strategy event script version');
  assert(html.includes('economy.js?v=158'),'served page has a stale economy script version');
  assert(html.includes('refinement.css?v=69'),'served page has a stale event stylesheet version');
  assert(html.includes('refinement.js?v=73'),'served page has a stale event script version');
  assert(html.includes('enhance.js?v=270'),'served page has a stale audio script version');
  assert(html.includes('title-tools.js?v=114'),'served page has a stale settings script version');
  assert(html.includes('game-polish.css?v=154'),'served page has a stale game polish stylesheet version');
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
