/* ABYSS DECK startup safety net.
 * This deliberately has no dependencies so a later optional module cannot
 * leave players on a black screen. It never clears or rewrites save data.
 */
(() => {
  'use strict';

  const gate = document.getElementById('tapStartGate');
  if (!gate) return;

  let recoveryQueued = false;
  const showTitle = () => {
    if (recoveryQueued) return;
    recoveryQueued = true;

    // Give the normal audio-aware handler time to finish first. If it did not
    // load, reveal the already-rendered title without touching localStorage.
    window.setTimeout(() => {
      if (!gate.isConnected) return;
      const title = document.getElementById('title');
      document.querySelectorAll('.screen.on').forEach(screen => {
        if (screen !== title) screen.classList.remove('on');
      });
      title?.classList.add('on');
      document.body.classList.add('scene-title');
      gate.style.opacity = '0';
      window.setTimeout(() => gate.remove(), 240);
    }, 700);
  };

  gate.addEventListener('pointerup', showTitle, { passive: true });
  gate.addEventListener('touchend', showTitle, { passive: true });
  gate.addEventListener('click', showTitle);
  gate.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') showTitle();
  });

  // If a later script fails, tell the player that tapping still recovers the
  // title instead of presenting an unexplained black screen.
  const explainRecovery = () => {
    if (!gate.isConnected) return;
    const note = gate.querySelector('.tsg-note');
    if (note) note.textContent = 'タップするとタイトルを表示します';
  };
  window.addEventListener('error', explainRecovery);
  window.addEventListener('unhandledrejection', explainRecovery);
  window.setTimeout(explainRecovery, 5000);
})();
