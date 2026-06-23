/**
 * PRELOADER � Option B: Car drives in, stops, and exhaust spells the hero name
 */
(function () {
  'use strict';

  const PARTICLE_MAX = 1100;
  const EMIT_RATE = 14;
  const TEXT = 'ABAASA\u00A9';
  const FORM_DURATION = 1100;
  const DRIVE_DURATION = 900;
  const TOTAL_DURATION = 3000;
  const AUTO_START_DELAY = 0;

  const preloader = document.getElementById('preloader');
  const hintEl = document.getElementById('preloaderHint');
  const statusEl = document.getElementById('preloaderStatus');

  if (!preloader) return;

  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  const inner = document.createElement('div');
  inner.className = 'preloader-inner';
  preloader.appendChild(inner);

  const car = document.createElement('div');
  car.className = 'preloader-car';
  car.innerHTML = `
    <div class="preloader-car-body"></div>
    <div class="preloader-car-hood"></div>
    <div class="preloader-car-cabin"></div>
    <div class="preloader-car-window"></div>
    <div class="preloader-car-grill"></div>
    <div class="preloader-car-headlight left"></div>
    <div class="preloader-car-headlight right"></div>
    <div class="preloader-car-exhaust"></div>
    <span class="preloader-car-wheel left"></span>
    <span class="preloader-car-wheel right"></span>
  `;
  preloader.appendChild(car);

  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:10000;pointer-events:none;opacity:1;width:100%;height:100%;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let emitterX = 0;
  let emitterY = 0;
  let touchStartY = 0;
  let startTime = performance.now();
  let driveStart = startTime;
  let phase = 'drive';
  let formStart = 0;
  let particles = [];
  let textTargets = [];
  let rafId = null;
  let isRunning = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateEmitter();
  }

  function updateEmitter() {
    const rect = car.getBoundingClientRect();
    emitterX = rect.left + rect.width * 0.1;
    emitterY = rect.top + rect.height * 0.46;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createTextTargets() {
    const w = canvas.width;
    const h = canvas.height;
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const oc = off.getContext('2d');

    oc.clearRect(0, 0, w, h);
    oc.fillStyle = '#ffffff';
    oc.textAlign = 'center';
    oc.textBaseline = 'middle';

    const maxTextWidth = w * 0.86;
    const maxTextHeight = h * 0.24;
    let fontSize = Math.min(w * 0.56, h * 0.26);
    oc.font = `900 ${fontSize}px 'DM Sans', sans-serif`;

    while (fontSize > 28) {
      const measured = oc.measureText(TEXT);
      const textWidth = measured.width;
      if (textWidth <= maxTextWidth && fontSize <= maxTextHeight) break;
      fontSize -= 6;
      oc.font = `900 ${fontSize}px 'DM Sans', sans-serif`;
    }

    oc.fillText(TEXT, w / 2, h / 2.15);

    const data = oc.getImageData(0, 0, w, h).data;
    const points = [];
    const step = 5;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4;
        if (data[idx] > 180) {
          points.push({ x, y });
        }
      }
    }

    if (points.length > PARTICLE_MAX) {
      shuffle(points);
      return points.slice(0, PARTICLE_MAX);
    }

    return points;
  }

  function spawnParticle() {
    if (particles.length >= PARTICLE_MAX) return;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    const speed = 1.8 + Math.random() * 2;
    particles.push({
      x: emitterX + (Math.random() - 0.5) * 8,
      y: emitterY + (Math.random() - 0.5) * 6,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.18,
      vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.18,
      size: 1.8 + Math.random() * 2.6,
      alpha: 0,
      state: 'stream',
      life: 0,
      tx: null,
      ty: null,
      color: 'rgba(130,255,134,1)',
    });
  }

  function startFormation() {
    if (phase !== 'stream') return;
    phase = 'forming';
    formStart = performance.now();
    textTargets = createTextTargets();
    const availableTargets = shuffle([...textTargets]);
    const activeCount = Math.min(availableTargets.length, particles.length);

    for (let i = 0; i < activeCount; i += 1) {
      const target = availableTargets[i];
      const particle = particles[i];
      particle.state = 'forming';
      particle.tx = target.x;
      particle.ty = target.y;
      particle.vx *= 0.18;
      particle.vy *= 0.18;
      particle.size = Math.max(1.1, particle.size * 0.85);
      particle.alpha = 0.15;
    }

    for (let i = activeCount; i < particles.length; i += 1) {
      particles[i].state = 'fading';
    }
  }

  function updateParticles(progress) {
    const now = performance.now();

    if (phase === 'stream') {
      if (particles.length < 200 || particles.length < progress * 650) {
        for (let i = 0; i < EMIT_RATE; i += 1) spawnParticle();
      }

      particles.forEach(p => {
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy -= 0.02;
        p.alpha = Math.min(1, p.alpha + 0.04);
        p.size = Math.max(0.9, p.size - 0.002);
        if (p.life > 120 || p.y < -40 || p.x > canvas.width + 40) {
          p.x = emitterX + (Math.random() - 0.5) * 8;
          p.y = emitterY + (Math.random() - 0.5) * 6;
          p.vx = Math.cos(-Math.PI / 2 + (Math.random() - 0.5) * 0.7) * (1.8 + Math.random() * 2);
          p.vy = Math.sin(-Math.PI / 2 + (Math.random() - 0.5) * 0.7) * (1.8 + Math.random() * 2);
          p.life = 0;
          p.alpha = 0;
        }
      });
    }

    if (phase === 'forming') {
      const elapsed = Math.min(1, (now - formStart) / FORM_DURATION);
      const ease = easeOutCubic(elapsed);

      particles.forEach(p => {
        if (p.state === 'forming' && p.tx !== null) {
          p.x += (p.tx - p.x) * 0.08 * (1 + ease * 1.2);
          p.y += (p.ty - p.y) * 0.08 * (1 + ease * 1.2);
          p.alpha = 0.35 + ease * 0.65;
          p.size = Math.max(0.8, p.size * 0.994);
        }
        if (p.state === 'fading') {
          p.alpha = Math.max(0, p.alpha - 0.03);
        }
      });

      if (elapsed >= 1) {
        phase = 'done';
        setTimeout(finish, 420);
      }
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(emitterX, emitterY, 0, emitterX, emitterY, 120);
    glow.addColorStop(0, 'rgba(130,255,134,0.22)');
    glow.addColorStop(1, 'rgba(130,255,134,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(emitterX, emitterY, 118, 0, Math.PI * 2);
    ctx.fill();

    for (const p of particles) {
      if (p.alpha < 0.02) continue;
      ctx.globalAlpha = p.alpha * 0.18;
      ctx.fillStyle = 'rgba(130,255,134,1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, p.size * 3), 0, Math.PI * 2);
      ctx.fill();
    }

    for (const p of particles) {
      if (p.alpha < 0.02) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = 'rgba(220,255,195,1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function updateHints(progress) {
    if (hintEl) hintEl.style.opacity = `${clamp(1 - progress * 2.2, 0, 1)}`;
    if (statusEl) {
      const msg =
        phase === 'forming' ? '? Exhaust letters forming�' :
        phase === 'done' ? '? Ready' :
        progress < 0.35 ? '✦ Engine warming up…' :
        progress < 0.75 ? '✦ Car arriving now…' :
        '? Letters are about to appear�';
      statusEl.textContent = msg;
      statusEl.style.opacity = `${clamp(1 - progress * 1.05, 0, 1)}`;
    }
  }

  function finish() {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', resizeCanvas);

    preloader.style.transition = 'opacity 0.9s ease';
    preloader.style.opacity = '0';
    if (hintEl) hintEl.style.opacity = '0';
    if (statusEl) statusEl.style.opacity = '0';

    setTimeout(() => {
      preloader.classList.add('hidden');
      preloader.style.display = 'none';
      canvas.remove();
      document.body.style.overflow = '';
      document.dispatchEvent(new CustomEvent('preloaderComplete'));
    }, 960);
  }

  function startLoop() {
    if (isRunning) return;
    isRunning = true;
    rafId = requestAnimationFrame(render);
  }

  function render() {
    isRunning = false;
    const now = performance.now();
    const progress = clamp((now - startTime) / TOTAL_DURATION, 0, 1);

    inner.style.transform = `scale(${1 + progress * 0.03})`;
    updateHints(progress);

    const driveElapsed = clamp((now - driveStart) / DRIVE_DURATION, 0, 1);
    if (phase === 'drive' && driveElapsed >= 1) {
      phase = 'stream';
      car.classList.add('arrived');
      updateEmitter();
    }

    if (phase === 'stream' && progress >= 0.55) {
      startFormation();
    }

    updateParticles(progress);
    drawParticles();

    if (phase !== 'done') {
      rafId = requestAnimationFrame(render);
      isRunning = true;
    }
  }

  function onWheel(event) {
    if (phase === 'done') return;
    event.preventDefault();
    if (!isRunning) startLoop();
  }

  function onTouchStart(event) {
    touchStartY = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (phase === 'done') return;
    event.preventDefault();
    if (!isRunning) startLoop();
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });

  render();
})();
