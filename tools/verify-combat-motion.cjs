const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Deterministic behavioral tests of the shipped scripts. This fake DOM does not
// establish browser paint/compositor quality or Safari compatibility.
const dist = path.resolve(__dirname, '..', 'dist');
const motionSource = fs.readFileSync(path.join(dist, 'combat-motion.js'), 'utf8');
const responsiveSource = fs.readFileSync(path.join(dist, 'responsive-shell.js'), 'utf8');
const entrySources = Object.fromEntries(['index.html', 'game.html'].map(file =>
  [file, fs.readFileSync(path.join(dist, file), 'utf8')]));

function section(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert(a >= 0 && b > a, `Cannot find source section: ${start}`);
  return source.slice(a, b);
}

function environment(options = {}) {
  let now = 0, sequence = 0, dirty = false;
  const timers = [], observers = [], observed = [], events = {}, created = [];
  const metrics = { styleWrites: 0, classWrites: 0, rectReads: 0, elements: 0 };
  function schedule(fn, delay = 0) {
    const timer = { fn, time: now + (Number(delay) || 0), sequence: ++sequence };
    timers.push(timer);
    return timer;
  }
  function classes(initial) {
    const values = new Set(initial);
    return {
      contains: value => values.has(value),
      add(...items) { items.forEach(x => values.add(x)); metrics.classWrites++; dirty = true; },
      remove(...items) { items.forEach(x => values.delete(x)); metrics.classWrites++; dirty = true; },
      toggle(item, force) {
        const add = force ?? !values.has(item);
        if (add) values.add(item); else values.delete(item);
        metrics.classWrites++; dirty = true;
        return add;
      }
    };
  }
  function element(id, initialClasses = []) {
    const styleValues = { '--face': '-1', '--enemy-scale': '1.4', transform: 'scaleX(-1) scale(1.4)' };
    const style = new Proxy({
      setProperty(key, value) { metrics.styleWrites++; styleValues[key] = value; },
      removeProperty(key) { metrics.styleWrites++; delete styleValues[key]; },
      getPropertyValue: key => styleValues[key] || ''
    }, { set(target, key, value) { metrics.styleWrites++; styleValues[key] = value; return true; } });
    return {
      id, isConnected: true, classList: classes(initialClasses), dataset: {}, style, styleValues,
      rect: { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 },
      parentElement: { appendChild() {} }, animations: [],
      appendChild() {}, remove() {}, setAttribute() {}, addEventListener() {},
      querySelector() { return null; }, querySelectorAll() { return []; },
      getBoundingClientRect() { metrics.rectReads++; return { ...this.rect }; },
      animate(frames, timing) {
        const animation = {
          frames, timing, cancelled: false, onfinish: null, oncancel: null,
          cancel() { this.cancelled = true; this.oncancel?.(); }
        };
        this.animations.push(animation);
        created.push({ sprite: id, animation, time: now, afterEnd: elements.endModal.classList.contains('on') });
        schedule(() => { if (!animation.cancelled) animation.onfinish?.(); }, timing.duration);
        return animation;
      }
    };
  }
  const ids = ['battle', 'enemySprite', 'playerSprite', 'endModal', 'endTurn', 'enemyName', 'battlelog', 'intent', 'hud', 'handArea'];
  const elements = Object.fromEntries(ids.map(id => [id, element(id, id === 'battle' ? ['on'] : [])]));
  const game = {
    enemy: { n: '飢えたウツボ', hp: 100, max: 100, block: 0, thorns: 0, weak: 0, move: 0, intent: { a: 4 } },
    hp: 100, max: 100, relic: [], hand: [], draw: [], discard: [], block: 0, str: 0,
    turn: 1, poison: 0, thorns: 0, cardPlayCounts: {}, energy: 3
  };
  const stats = { damageDealt: 0, damageTaken: 0, maxHit: 0, maxCombo: 0, blockGained: 0, cards: 0, attackCards: 0, defenseCards: 0, poisonApplied: 0 };
  const reduced = { matches: !!options.reduced, addEventListener: (type, fn) => { events[`media:${type}`] = fn; } };
  const document = {
    hidden: false, documentElement: element('html'),
    getElementById: id => elements[id] || null,
    querySelector(selector) {
      if (selector === '#battle.on') return elements.battle.classList.contains('on') ? elements.battle : null;
      if (selector === '.hud') return elements.hud;
      if (selector === '.handArea') return elements.handArea;
      return elements[selector.replace(/^#/, '')] || null;
    },
    querySelectorAll: () => [], body: { appendChild() {} },
    createElement() { metrics.elements++; return element('generated'); },
    addEventListener: (type, fn) => { events[`document:${type}`] = fn; }
  };
  const window = {
    CSS: { supports: () => options.supported !== false },
    addEventListener: (type, fn) => { events[`window:${type}`] = fn; },
    abyssImpact() {}, getAbyssGame: () => game
  };
  const context = {
    window, document, G: game, $: selector => document.querySelector(selector),
    matchMedia: query => query.includes('prefers-reduced-motion') ? reduced : {
      matches: query.includes('pointer:coarse') ? options.coarse !== false : !!options.fixedPc
    },
    MutationObserver: class {
      constructor(fn) { observers.push(fn); }
      observe(node, config) { observed.push({ id: node.id, config }); }
    },
    setTimeout: schedule, clearTimeout: timer => { timer.cancelled = true; },
    render() {}, save() {}, hud() {}, toast() {}, stopDeadSeaTimer() {}, recordSelfHpLoss() {},
    draw() {}, heal() {}, hurt() {}, begin() {}, intent() {}, runStats: () => stats,
    cardStats: () => ({}), baseKey: key => String(key).replace('+', ''),
    over() { elements.endModal.classList.add('on'); },
    win() { window.cancelAbyssCombatMotion?.(); game.enemy = null; },
    doc: () => document, landscapeLayout: true, innerWidth: 900, innerHeight: 360,
    navigator: { maxTouchPoints: options.coarse === false ? 0 : 1 },
    getComputedStyle: () => ({ transform: 'none' }), console
  };
  vm.createContext(context);
  vm.runInContext(motionSource, context, { filename: 'combat-motion.js' });
  if (options.entry) {
    const flow = section(entrySources[options.entry], 'function resolve(', '\nconst rare=');
    vm.runInContext(flow, context, { filename: `${options.entry}:combat` });
  }
  if (options.forecast) {
    const forecast = section(responsiveSource, 'function visibleEnemyLeft(', '\nfunction visible(el)');
    vm.runInContext(forecast, context, { filename: 'responsive-shell.js:forecast' });
    Object.assign(elements.enemyName.rect, { left: 650, top: 80, width: 140, height: 20 });
    Object.assign(elements.battle.rect, { width: 900, height: 360, bottom: 360 });
    Object.assign(elements.hud.rect, { bottom: 50 });
    Object.assign(elements.handArea.rect, { top: 280 });
    Object.assign(elements.intent.rect, { width: 100, height: 50 });
    Object.assign(elements.playerSprite.rect, { left: 100, right: 250 });
    Object.assign(elements.enemySprite.rect, { left: 650, right: 800 });
  }
  function flush() {
    if (dirty) { dirty = false; observers.forEach(fn => fn()); }
  }
  function advance(milliseconds) {
    const end = now + milliseconds;
    flush();
    let steps = 0;
    for (;;) {
      timers.sort((a, b) => a.time - b.time || a.sequence - b.sequence);
      const timer = timers.find(item => !item.done && !item.cancelled && item.time <= end);
      if (!timer) break;
      assert(++steps < 10000, 'Unexpected timer loop');
      timer.done = true; now = timer.time; timer.fn(); flush();
    }
    now = end; flush();
  }
  return {
    context, window, document, game, stats, elements, reduced, events, created, metrics, observed, flush, advance,
    count: id => created.filter(item => item.sprite === id).length,
    active: id => elements[id].animations.filter(animation => !animation.cancelled).length,
    move: (...args) => window.abyssCombatMotion(...args)
  };
}

let passed = 0;
function test(name, run) {
  try { run(); passed++; console.log(`PASS ${name}`); }
  catch (error) { console.error(`FAIL ${name}\n${error.stack}`); process.exitCode = 1; }
}
const pair = t => [t.active('playerSprite'), t.active('enemySprite')];
const counts = t => [t.count('playerSprite'), t.count('enemySprite')];
const peak = (t, id) => t.elements[id].animations.at(-1).frames[1];
const normal = t => t.move('#enemySprite', 6, '', { side: 'player', power: 6 });

test('directions, short return, heavy strength, and blocked recoil', () => {
  const t = environment(); normal(t);
  assert.equal(peak(t, 'playerSprite').translate, '16px 0px');
  assert.equal(peak(t, 'enemySprite').translate, '7px 0px');
  t.move('#playerSprite', 25, '', { side: 'enemy', power: 25 });
  assert.equal(peak(t, 'enemySprite').translate, '-24px 0px');
  assert.equal(peak(t, 'playerSprite').translate, '-10px 0px');
  t.move('#playerSprite', 0, '', { side: 'enemy', power: 6 });
  assert.equal(peak(t, 'playerSprite').translate, '-3px 0px');
  for (const { animation } of t.created) {
    assert(animation.timing.duration <= 300);
    assert.equal(animation.timing.fill, 'none');
    assert.equal(animation.frames.at(-1).translate, '0px 0px');
    assert.equal(animation.frames.at(-1).rotate, '0deg');
  }
  t.advance(350); assert.deepEqual(pair(t), [0, 0]);
  assert.equal(t.window.isAbyssCombatMotionActive(), false);
});

test('individual keyframes preserve flip/scale and do not touch styles, layout, or nodes', () => {
  const t = environment(), original = JSON.stringify(t.elements.enemySprite.styleValues);
  normal(t); t.advance(350);
  assert.equal(JSON.stringify(t.elements.enemySprite.styleValues), original);
  assert.deepEqual(t.metrics, { styleWrites: 0, classWrites: 0, rectReads: 0, elements: 0 });
  for (const { animation } of t.created) for (const frame of animation.frames) {
    assert.deepEqual(Object.keys(frame).sort(), ['offset', 'rotate', 'translate']);
  }
  assert.equal(t.observed.length, 3);
  for (const { config } of t.observed) {
    assert.deepEqual(Array.from(config.attributeFilter), ['class']);
    assert.equal(config.subtree, undefined);
  }
});

test('repeated attacks keep at most one animation per sprite', () => {
  const t = environment();
  for (let i = 0; i < 20; i++) {
    normal(t); t.advance(25); assert.deepEqual(pair(t), [1, 1]);
  }
  assert.equal(t.created.filter(item => !item.animation.cancelled).length, 2);
  t.advance(350); assert.deepEqual(pair(t), [0, 0]);
});

for (const setting of ['reduced', 'supported']) test(`${setting} fallback adds no motion`, () => {
  const t = environment({ [setting]: setting === 'reduced' }); normal(t);
  assert.deepEqual(counts(t), [0, 0]);
});
test('missing WAAPI degrades without persistent effects', () => {
  const t = environment(); delete t.elements.enemySprite.animate; delete t.elements.playerSprite.animate;
  normal(t); assert.deepEqual(counts(t), [0, 0]); assert.equal(t.window.isAbyssCombatMotionActive(), false);
});

for (const event of ['window:resize', 'window:pagehide', 'document:visibilitychange', 'media:change']) {
  test(`${event} cancels the active pair`, () => {
    const t = environment(); normal(t);
    if (event === 'document:visibilitychange') t.document.hidden = true;
    if (event === 'media:change') t.reduced.matches = true;
    t.events[event](); assert.deepEqual(pair(t), [0, 0]);
    assert.equal(t.window.isAbyssCombatMotionActive(), false);
    if (t.document.hidden || t.reduced.matches) { normal(t); assert.deepEqual(counts(t), [1, 1]); }
  });
}

test('external animation cancellation releases ownership', () => {
  const t = environment(); normal(t);
  t.elements.enemySprite.animations[0].cancel();
  t.elements.playerSprite.animations[0].cancel();
  assert.equal(t.window.isAbyssCombatMotionActive(), false);
});
test('scene exit and explicit reset release both sprites', () => {
  const t = environment(); normal(t); t.window.cancelAbyssCombatMotion(); assert.deepEqual(pair(t), [0, 0]);
  normal(t); t.elements.battle.classList.remove('on'); t.flush(); assert.deepEqual(pair(t), [0, 0]);
  normal(t); assert.deepEqual(counts(t), [2, 2]);
});
for (const state of ['endModal', 'guardian-phase2-tremor', 'guardian-phase2-burst']) {
  test(`${state} cancels and rejects later queued motion`, () => {
    const t = environment(); normal(t);
    if (state === 'endModal') t.elements.endModal.classList.add('on');
    else t.elements.enemySprite.classList.add(state);
    t.flush(); normal(t); t.move('#playerSprite', 5, '2/3', { side: 'enemy', power: 5 });
    assert.deepEqual(pair(t), [0, 0]); assert.deepEqual(counts(t), [1, 1]);
  });
}
test('enemy death cancels corpse recoil while living attacker finishes', () => {
  const t = environment(); normal(t); t.elements.enemySprite.classList.add('enemy-defeated'); t.flush();
  assert.deepEqual(pair(t), [1, 0]);
  normal(t); assert.deepEqual(counts(t), [2, 1]);
  t.advance(350); assert.deepEqual(pair(t), [0, 0]);
});

for (const entry of Object.keys(entrySources)) {
  const create = () => environment({ entry });
  test(`${entry}: actual damage, block, stats and ordinary motion`, () => {
    const t = create(); t.game.enemy.block = 2; t.context.deal(6);
    assert.equal(t.game.enemy.hp, 96); assert.equal(t.game.enemy.block, 0);
    assert.equal(t.stats.damageDealt, 4); assert.deepEqual(counts(t), [1, 1]);
    t.advance(350); assert.deepEqual(pair(t), [0, 0]);
  });
  test(`${entry}: lethal multi-hit keeps attacker lunge without corpse recoil`, () => {
    const t = create(); t.game.enemy.hp = 15;
    for (let hit = 1; hit <= 3; hit++) t.context.deal(6, hit, 3);
    t.advance(400); assert.deepEqual(counts(t), [3, 0]);
    t.advance(350); assert.deepEqual(pair(t), [0, 0]);
  });
  for (const passive of ['thorns', 'reflection']) test(`${entry}: simultaneous lethal ${passive} cannot restart motion after death`, () => {
    const t = create(); t.game.hp = 1; t.game.enemy.intent = { a: 4, h: 2 };
    if (passive === 'thorns') { t.game.enemy.hp = 6; t.game.thorns = 3; }
    else { t.game.enemy.hp = 4; t.game.block = 4; t.game.reflectBlockArmed = true; }
    t.context.enemyTurn(); t.advance(950);
    assert.equal(t.elements.endModal.classList.contains('on'), true);
    assert.equal(t.created.filter(item => item.afterEnd).length, 0);
    assert.equal(t.count('playerSprite'), 0); assert.deepEqual(pair(t), [0, 0]);
  });
  test(`${entry}: stale player and enemy callbacks cannot cross into a new enemy`, () => {
    for (const side of ['player', 'enemy']) {
      const t = create();
      if (side === 'player') for (let hit = 1; hit <= 3; hit++) t.context.deal(6, hit, 3);
      else t.context.multiFx('#playerSprite', [4, 4, 4], { side: 'enemy', power: 4 });
      t.window.cancelAbyssCombatMotion(); t.game.enemy = { ...t.game.enemy };
      t.advance(400); assert.deepEqual(counts(t), [0, 0]);
    }
    assert.match(entrySources[entry], /function battle\([^\n]*\{window\.cancelAbyssCombatMotion\?\.\(\);/);
    assert.match(entrySources[entry], /function win\(\)\{if\(!G\.enemy\)return;window\.cancelAbyssCombatMotion\?\.\(\);/);
  });
  test(`${entry}: stun cancels enemy attack while poison tick stays recoil-only`, () => {
    const t = create(); t.game.enemy.intent = { a: 30, stunThreshold: 10 }; t.game.dmgDealtThisTurn = 12;
    t.context.enemyTurn(); t.advance(850); assert.deepEqual(counts(t), [0, 0]); assert.equal(t.game.hp, 100);
    const p = create(); p.game.poison = 3; p.game.enemy.intent = { b: 4 };
    p.context.enemyTurn(); p.advance(800); assert.deepEqual(counts(p), [0, 1]);
  });
  test(`${entry}: poison-only card and enemy needles explicitly animate attacker`, () => {
    const t = create(); t.context.resolve({ n: 'Test poison', t: 'Poison', p: 3 }, 'testpoison');
    assert.deepEqual(counts(t), [1, 1]); assert.equal(t.game.poison, 3); assert.equal(t.game.enemy.hp, 100);
    const n = create(); n.game.enemy.intent = { p: 5, needleRelease: 1 }; n.context.enemyTurn(); n.advance(1000);
    assert.deepEqual(counts(n), [1, 1]); assert.equal(n.game.hp, 95);
  });
  test(`${entry}: rapid actual-hit scheduling never stacks sprite animations`, () => {
    const t = create(); for (let hit = 1; hit <= 3; hit++) t.context.deal(6, hit, 3);
    for (let step = 0; step < 70; step++) { t.advance(10); assert(t.active('playerSprite') <= 1); assert(t.active('enemySprite') <= 1); }
    assert.deepEqual(counts(t), [3, 3]); assert.deepEqual(pair(t), [0, 0]);
  });
}

for (const coarse of [true, false]) test(`forecast freeze/resume in ${coarse ? 'phone landscape' : 'small desktop'}`, () => {
  const t = environment({ forecast: true, coarse });
  t.context.syncIntentPosition();
  const before = JSON.stringify(t.elements.intent.styleValues), reads = t.metrics.rectReads;
  normal(t); t.elements.playerSprite.rect.right += 40; t.elements.enemySprite.rect.left += 35;
  t.context.syncIntentPosition();
  assert.equal(JSON.stringify(t.elements.intent.styleValues), before); assert.equal(t.metrics.rectReads, reads);
  t.advance(350); t.context.syncIntentPosition();
  assert.notEqual(JSON.stringify(t.elements.intent.styleValues), before);
  const settled = JSON.stringify(t.elements.intent.styleValues);
  normal(t); t.elements.enemySprite.rect.left += 20; t.events['window:resize'](); t.context.syncIntentPosition();
  assert.notEqual(JSON.stringify(t.elements.intent.styleValues), settled);
});

for (const mode of ['portrait', 'tv-fixed', 'large-desktop']) test(`forecast retains ${mode} cleanup during motion`, () => {
  const t = environment({ forecast: true, fixedPc: mode === 'large-desktop' });
  if (mode === 'portrait') t.context.landscapeLayout = false;
  if (mode === 'tv-fixed') t.document.documentElement.classList.add('tv-fixed-canvas');
  t.elements.intent.style.setProperty('left', '123px'); normal(t); t.context.syncIntentPosition();
  assert.equal(t.elements.intent.style.getPropertyValue('left'), '');
  assert.equal(t.metrics.rectReads, 0);
});

console.log(`\n${passed} combat motion checks passed${process.exitCode ? '; failures above' : ''}.`);
console.log('VM checks cover behavior and integration only; real-browser visual and performance checks remain separate.');
