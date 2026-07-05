/**
 * Simple text-based glitch preloader for ABAASA.
 */
(function () {
  'use strict';

  const preloader = document.getElementById('preloader');
  const hintEl = document.getElementById('preloaderHint');
  const statusEl = document.getElementById('preloaderStatus');
  const titleEl = preloader ? preloader.querySelector('.preloader-title') : null;

  if (!preloader) return;

  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  let glitchCycle = null;

  function startGlitch() {
    if (!titleEl) return;
    titleEl.classList.add('glitch-active');
    glitchCycle = setTimeout(() => {
      titleEl.classList.remove('glitch-active');
      glitchCycle = setTimeout(startGlitch, 420);
    }, 120);
  }

  function endPreloader() {
    clearTimeout(glitchCycle);
    if (titleEl) titleEl.classList.remove('glitch-active');
    preloader.style.opacity = '0';
    if (hintEl) hintEl.classList.add('hidden');
    if (statusEl) statusEl.classList.add('hidden');

    setTimeout(() => {
      preloader.classList.add('hidden');
      preloader.style.display = 'none';
      document.body.style.overflow = '';
      document.dispatchEvent(new CustomEvent('preloaderComplete'));
    }, 700);
  }

  window.addEventListener('load', () => {
    setTimeout(endPreloader, 950);
  });

  startGlitch();
})();
