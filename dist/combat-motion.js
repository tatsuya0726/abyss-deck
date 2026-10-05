(() => {
  'use strict';

  // Individual transforms compose with the existing idle transform, facing and
  // responsive scale. Only the two sprites move; their unit/HUD never moves.
  const battle = document.getElementById('battle');
  const player = document.getElementById('playerSprite');
  const enemy = document.getElementById('enemySprite');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map();
  const supported = window.CSS?.supports('translate', '1px') &&
    window.CSS.supports('rotate', '1deg');

  function cancel(sprite) {
    const animation = active.get(sprite);
    if (!animation) return;
    active.delete(sprite);
    animation.onfinish = animation.oncancel = null;
    animation.cancel();
  }

  function reset() {
    for (const sprite of active.keys()) cancel(sprite);
  }

  function unavailable(sprite) {
    return !sprite?.isConnected || sprite.classList.contains('enemy-defeated') ||
      sprite.classList.contains('enemy-finishing') ||
      sprite.classList.contains('guardian-phase2-tremor') ||
      sprite.classList.contains('guardian-phase2-burst');
  }

  function move(sprite, distance, tilt, duration) {
    cancel(sprite);
    if (unavailable(sprite) || typeof sprite.animate !== 'function') return;
    // A new hit replaces the previous one. No timers, DOM particles, layout
    // reads, filter animation or persistent will-change layers are added.
    const animation = sprite.animate([
      { translate: '0px 0px', rotate: '0deg', offset: 0 },
      { translate: `${distance}px 0px`, rotate: `${tilt}deg`, offset: .3 },
      { translate: `${distance * .16}px 0px`, rotate: `${tilt * .15}deg`, offset: .7 },
      { translate: '0px 0px', rotate: '0deg', offset: 1 }
    ], { duration, easing: 'ease-out', fill: 'none' });
    active.set(sprite, animation);
    const release = () => {
      if (active.get(sprite) !== animation) return;
      active.delete(sprite);
      animation.onfinish = animation.oncancel = null;
      animation.cancel();
    };
    animation.onfinish = animation.oncancel = release;
  }

  // Explicit attack metadata keeps poison, thorns and reflected damage from
  // incorrectly making the other character perform an attack.
  window.abyssCombatMotion = (selector, amount, label = '', attack = null) => {
    if (!supported || reduced.matches || document.hidden || !battle?.classList.contains('on') ||
      document.getElementById('endModal')?.classList.contains('on') ||
      enemy?.classList.contains('guardian-phase2-tremor') || enemy?.classList.contains('guardian-phase2-burst')) {
      reset();
      return;
    }
    const target = selector === '#playerSprite' ? player : selector === '#enemySprite' ? enemy : null;
    if (!target) return;
    const [hit = 1, hits = 1] = label ? label.split('/').map(Number) : [1, 1];
    const rapid = hits > 1 && hit < hits;
    const heavy = !!attack && (attack.heavy || attack.power >= 20);
    const direction = target === enemy ? 1 : -1;
    if (attack) {
      const attacker = attack.side === 'player' ? player : attack.side === 'enemy' ? enemy : null;
      if (attacker) move(attacker, direction * (heavy ? 24 : 16), direction * (heavy ? 4 : 2.5), rapid ? 115 : heavy ? 300 : 240);
    }
    if (Number.isFinite(amount) && amount >= 0) {
      move(target, direction * (amount === 0 ? 3 : heavy ? 10 : 7), direction * (amount === 0 ? .4 : 1.4), rapid ? 115 : 210);
    }
  };

  window.cancelAbyssCombatMotion = reset;
  window.isAbyssCombatMotionActive = () => active.size > 0;
  reduced.addEventListener?.('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  window.addEventListener('pagehide', reset);
  window.addEventListener('resize', reset, { passive: true });
  // Observe only lifecycle classes, not the changing battle subtree or styles.
  const observer = new MutationObserver(() => {
    if (!battle?.classList.contains('on') || document.getElementById('endModal')?.classList.contains('on')) reset();
    else if (enemy?.classList.contains('guardian-phase2-tremor') || enemy?.classList.contains('guardian-phase2-burst')) reset();
    else if (unavailable(enemy)) cancel(enemy);
  });
  for (const node of [battle, enemy, document.getElementById('endModal')]) {
    if (node) observer.observe(node, { attributes: true, attributeFilter: ['class'] });
  }
})();
