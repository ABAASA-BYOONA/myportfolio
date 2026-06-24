/**
 * Author: Abaasa Byoona
 */
(function () {
  'use strict';

  // ─── Configuration ────────────────────────────────────────────
  const TEXT = 'ABAASA';
  const TOTAL_DURATION = 3800;       // ms before fade-out begins
  const MORPH_START    = 0.50;       // fraction of timeline where morph begins
  const SPHERE_RADIUS  = 170;
  const FOCAL_LENGTH   = 320;

  const preloader = document.getElementById('preloader');
  const hintEl    = document.getElementById('preloaderHint');
  const statusEl  = document.getElementById('preloaderStatus');

  if (!preloader) return;

  // ─── Lock scroll ──────────────────────────────────────────────
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  // ─── Canvas setup ─────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'techCanvas';
  canvas.style.cssText =
    'position:fixed;inset:0;z-index:10000;pointer-events:none;width:100%;height:100%;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ─── Solid SVG Icon Definitions (path data — sync rendering!) ─
  // Each icon has a draw function that renders directly to canvas context
  const TECH_ICONS = [
    {
      label: 'JS',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Yellow rounded rect background
        ctx.fillStyle = '#F7DF1E';
        ctx.beginPath();
        ctx.roundRect(x - s/2, y - s/2, s, s, s * 0.12);
        ctx.fill();
        // JS text
        ctx.fillStyle = '#000';
        ctx.font = `bold ${s * 0.55}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('JS', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'TS',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#3178C6';
        ctx.beginPath();
        ctx.roundRect(x - s/2, y - s/2, s, s, s * 0.12);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.55}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TS', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'PHP',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#777BB3';
        ctx.beginPath();
        ctx.arc(x, y, s/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.42}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PHP', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'NODE',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Hexagon
        ctx.fillStyle = '#339933';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180;
          const px = x + (s/2) * Math.cos(a);
          const py = y + (s/2) * Math.sin(a);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.32}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('NODE', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'REACT',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Circle background
        ctx.fillStyle = '#20232A';
        ctx.beginPath();
        ctx.arc(x, y, s/2, 0, Math.PI * 2);
        ctx.fill();
        // React atom rings
        ctx.strokeStyle = '#61DAFB';
        ctx.lineWidth = 1.5;
        const r = s * 0.35;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(x, y, r, r * 0.3, i * Math.PI / 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Center dot
        ctx.fillStyle = '#61DAFB';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    {
      label: 'C++',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00599C';
        ctx.beginPath();
        ctx.roundRect(x - s/2, y - s/2, s, s, s * 0.15);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.5}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C++', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'JAVA',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ED8B00';
        ctx.beginPath();
        ctx.arc(x, y, s/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.45}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('JAVA', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'LINUX',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Penguin head silhouette
        ctx.fillStyle = '#FCC624';
        ctx.beginPath();
        ctx.arc(x, y - s * 0.1, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = `bold ${s * 0.28}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TUX', x, y + s * 0.2);
        ctx.restore();
      }
    },
    {
      label: 'AWS',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FF9900';
        ctx.beginPath();
        ctx.roundRect(x - s/2, y - s/2, s, s, s * 0.1);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.38}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AWS', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'DB',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        // Database cylinder shape
        ctx.fillStyle = '#4479A1';
        ctx.beginPath();
        ctx.ellipse(x, y - s * 0.25, s * 0.35, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - s * 0.35, y - s * 0.25, s * 0.7, s * 0.5);
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.25, s * 0.35, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.3}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SQL', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'GIT',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#F1502F';
        ctx.beginPath();
        ctx.roundRect(x - s/2, y - s/2, s, s, s * 0.15);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s * 0.48}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GIT', x, y + 1);
        ctx.restore();
      }
    },
    {
      label: 'PY',
      draw: function(ctx, x, y, s, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#3776AB';
        ctx.beginPath();
        ctx.arc(x, y, s/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD43B';
        ctx.font = `bold ${s * 0.55}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Py', x, y + 1);
        ctx.restore();
      }
    }
  ];

  // ─── Helpers ──────────────────────────────────────────────────
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function rotate3D(x, y, z, ax, ay) {
    const cosY = Math.cos(ay), sinY = Math.sin(ay);
    let x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
    const cosX = Math.cos(ax), sinX = Math.sin(ax);
    return {
      x: x1,
      y: y * cosX - z1 * sinX,
      z: y * sinX + z1 * cosX,
    };
  }

  // ─── Text matrix extraction ───────────────────────────────────
  function extractTextTargets() {
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const octx = off.getContext('2d');
    octx.fillStyle = '#ffffff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    const fontSize = Math.min(W * 0.16, H * 0.22);
    octx.font = `900 ${fontSize}px 'DM Sans', system-ui, sans-serif`;
    octx.fillText(TEXT, W / 2, H / 2);
    const data = octx.getImageData(0, 0, W, H).data;
    const targets = [];
    const step = W < 600 ? 4 : 5;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4] > 150) targets.push({ x, y });
      }
    }
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    return targets;
  }

  // ─── State ────────────────────────────────────────────────────
  const startTime = performance.now();
  let phase = 'sphere';
  let rafId = null;
  let ax = 0, ay = 0;

  // ─── Build 3D sphere nodes (icons positioned on sphere surface) ─
  const nodes = TECH_ICONS.map((tech, i) => {
    const phi   = Math.acos(-1 + (2 * i) / TECH_ICONS.length);
    const theta = Math.sqrt(TECH_ICONS.length * Math.PI) * phi;
    return {
      ...tech,
      x3d: SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
      y3d: SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta),
      z3d: SPHERE_RADIUS * Math.cos(phi),
      orbitRad: 6 + Math.random() * 14,
      orbitSpeed: 0.006 + Math.random() * 0.012,
      orbitPhase: Math.random() * Math.PI * 2,
      tx: 0, ty: 0, // text morph targets
      // Runtime
      _px: 0, _py: 0, _sc: 1, _z: 0,
      _startX: 0, _startY: 0,
      _curX: 0, _curY: 0,
    };
  });

  // ─── Glow particles (fewer, smaller — just ambiance) ─────────
  const particles = [];
  nodes.forEach((n) => {
    for (let i = 0; i < 25; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi   = Math.acos(2 * Math.random() - 1);
      const rOff  = 8 + Math.random() * 25;
      particles.push({
        x3d: n.x3d + rOff * Math.sin(phi) * Math.cos(theta),
        y3d: n.y3d + rOff * Math.sin(phi) * Math.sin(theta),
        z3d: n.z3d + rOff * Math.cos(phi),
        x: 0, y: 0,
        alpha: 0.1 + Math.random() * 0.4,
        size: 0.8 + Math.random() * 1.5,
        seed: Math.random() * 100,
        targetX: null,
        targetY: null,
      });
    }
  });

  // ─── Render Loop ──────────────────────────────────────────────
  function render(now) {
    const elapsed = now - startTime;
    const progress = clamp(elapsed / TOTAL_DURATION, 0, 1);

    // Gentle auto-rotation speeds
    ax = 0.008 + Math.sin(now * 0.0001) * 0.004;
    ay = 0.01 + Math.cos(now * 0.00012) * 0.004;

    ctx.clearRect(0, 0, W, H);

    // ── Status text ──
    if (statusEl) {
      statusEl.textContent =
        progress < 0.25
          ? '✦ Initializing Tech Stack...'
          : progress < MORPH_START
            ? '✦ Mapping Core Dependencies...'
            : '✦ Compiling [ABAASA] Build...';
    }

    // ── Morph trigger ──
    let textTargets = [];
    if (progress >= MORPH_START && phase === 'sphere') {
      phase = 'morphing';
      textTargets = extractTextTargets();
      // Assign particle targets
      particles.forEach((p, i) => {
        if (textTargets[i]) {
          p.targetX = textTargets[i].x;
          p.targetY = textTargets[i].y;
        } else {
          p.targetX = W / 2 + (Math.random() - 0.5) * W * 0.6;
          p.targetY = H / 2 + (Math.random() - 0.5) * H * 0.2;
        }
      });
      // Assign icon targets to text letter positions
      nodes.forEach((n, i) => {
        if (textTargets[i * 25]) {
          n.tx = textTargets[i * 25].x;
          n.ty = textTargets[i * 25].y;
        } else {
          n.tx = W / 2 + (Math.random() - 0.5) * W * 0.4;
          n.ty = H / 2 + (Math.random() - 0.5) * H * 0.2;
        }
      });
    }

    // ── SPHERE PHASE ──────────────────────────────────────────────
    if (phase === 'sphere') {
      // Update node positions
      nodes.forEach((n) => {
        const oAngle = now * n.orbitSpeed + n.orbitPhase;
        const oxOff = Math.cos(oAngle) * n.orbitRad;
        const oyOff = Math.sin(oAngle) * n.orbitRad;

        let x3 = n.x3d + oxOff;
        let y3 = n.y3d + oyOff;
        let z3 = n.z3d;

        const rot = rotate3D(x3, y3, z3, ax, ay);
        n._z = rot.z;
        const sc = FOCAL_LENGTH / (FOCAL_LENGTH - rot.z);
        n._px = W / 2 + rot.x * sc;
        n._py = H / 2 + rot.y * sc;
        n._sc = sc;
      });

      // ── Connecting lines ──
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i]._px - nodes[j]._px;
          const dy = nodes[i]._py - nodes[j]._py;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const a = (1 - dist / 180) * 0.12;
            ctx.strokeStyle = `rgba(130, 255, 184, ${a})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i]._px, nodes[i]._py);
            ctx.lineTo(nodes[j]._px, nodes[j]._py);
            ctx.stroke();
          }
        }
      }

      // ── Glow particles ──
      particles.forEach((p) => {
        const rot = rotate3D(p.x3d, p.y3d, p.z3d, ax, ay);
        p.x3d = rot.x; p.y3d = rot.y; p.z3d = rot.z;
        const sc = FOCAL_LENGTH / (FOCAL_LENGTH - rot.z);
        const wave = Math.sin(now * 0.003 + p.seed) * 2;
        const sx = W / 2 + (rot.x + wave) * sc;
        const sy = H / 2 + (rot.y + wave) * sc;
        ctx.fillStyle = `rgba(100, 220, 180, ${p.alpha * sc * 0.6})`;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, p.size * sc * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Draw SOLID ICONS at projected positions ──
      nodes.forEach((n) => {
        if (n._z < 100) {
          const iconSize = Math.max(16, 26 * n._sc);
          const alpha = clamp(n._sc - 0.3, 0.4, 1);
          n.draw(ctx, n._px, n._py, iconSize, alpha);
        }
      });
    }

    // ── MORPHING PHASE ────────────────────────────────────────────
    if (phase === 'morphing') {
      const morphPct = (progress - MORPH_START) / (1 - MORPH_START);
      const ease = easeInOutCubic(morphPct);

      // Lerp particles toward text targets
      particles.forEach((p) => {
        if (p.targetX !== null) {
          p.x += (p.targetX - p.x) * (0.04 + ease * 0.14);
          p.y += (p.targetY - p.y) * (0.04 + ease * 0.14);
        }
        const r = Math.round(100 + 155 * ease);
        const g = 255;
        const b = Math.round(180 + 75 * ease);
        ctx.fillStyle = `rgba(${r},${g},${b},${clamp(p.alpha + ease * 0.3, 0.05, 0.7)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.size * (1 - ease * 0.3)), 0, Math.PI * 2);
        ctx.fill();
      });

      // Move icons toward their text positions
      nodes.forEach((n) => {
        if (!n._startX) {
          n._startX = n._px || W / 2;
          n._startY = n._py || H / 2;
        }
        n._curX = n._startX + (n.tx - n._startX) * ease;
        n._curY = n._startY + (n.ty - n._startY) * ease;
        // Icons fade from colored to white as they settle
        const iconSize = Math.max(14, 24 * (1 - ease * 0.3));
        const alpha = 0.5 + ease * 0.5;
        n.draw(ctx, n._curX, n._curY, iconSize, alpha);
      });

      if (progress >= 0.97) {
        phase = 'complete';
        setTimeout(unmount, 200);
      }
    }

    if (phase !== 'complete') {
      rafId = requestAnimationFrame(render);
    }
  }

  function unmount() {
    window.removeEventListener('resize', resize);
    preloader.style.transition =
      'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    preloader.style.opacity = '0';
    if (hintEl) hintEl.style.opacity = '0';
    if (statusEl) statusEl.style.opacity = '0';

    setTimeout(() => {
      preloader.classList.add('hidden');
      preloader.style.display = 'none';
      canvas.remove();
      document.body.style.overflow = '';
      document.dispatchEvent(new CustomEvent('preloaderComplete'));
    }, 850);
  }

  // ─── Fire ─────────────────────────────────────────────────────
  rafId = requestAnimationFrame(render);
})();
