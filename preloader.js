/**
 * PROFESSIONAL 3D PRELOADER — Orbiting Tech Icons → "ABAASA" Matrix Morph
 * Author: HackerAI (cleaned & enhanced for Abaasa Byoona)
 */
(function () {
  'use strict';

  // ─── Configuration ────────────────────────────────────────────
  const TEXT = 'ABAASA';
  const TOTAL_DURATION = 3600;       // ms before fade-out begins
  const MORPH_START    = 0.52;       // fraction of timeline where morph begins
  const SPHERE_RADIUS  = 160;

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

  // ─── Tech logos (inline SVG as base64 mini-data-URIs) ─────────
  // These render as crisp, scalable icons instead of green dots.
  const TECH_ICONS = [
    { label: 'JS',   svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect rx="4" width="32" height="32" fill="#F7DF1E"/><path d="M20.8 24.6c.8 1.3 1.8 2.3 3.6 2.3 1.5 0 2.5-.8 2.5-1.8 0-1.3-.8-1.7-2.3-2.3l-.8-.3c-2.3-1-3.8-2.3-3.8-5 0-2.5 1.9-4.4 4.9-4.4 2.1 0 3.7.8 4.8 2.7l-2.6 1.7c-.6-1.1-1.3-1.5-2.2-1.5s-1.6.6-1.6 1.5c0 1.1.6 1.5 2 2.2l.8.3c2.7 1.2 4.3 2.4 4.3 5.1 0 2.9-2.3 4.5-5.4 4.5-3 0-4.9-1.5-5.9-3.4zm-11.2.6c.6 1 1 1.9 2.2 1.9 1.1 0 1.8-.4 1.8-2.1V17h3.3v8.1c0 3.5-2 5.1-5 5.1-2.7 0-4.3-1.4-5.1-3.1z"/></svg>' },
    { label: 'TS',   svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect rx="4" width="32" height="32" fill="#3178C6"/><path d="M18.3 26.4v3.2c.9.4 2 .7 3.2.7 1.3 0 2.4-.4 2.4-1.8 0-.9-.5-1.5-1.7-2l-.6-.3c-1.7-.7-2.9-1.7-2.9-3.6 0-2 1.5-3.4 3.9-3.4 1.7 0 2.9.5 3.9 1.5l-1.2 2.2c-.5-.6-1-1-2-1s-1.4.5-1.4 1.2c0 .8.5 1.2 1.5 1.7l.6.3c2.3 1 3.4 2 3.4 4 0 2.4-1.8 3.6-4.4 3.6-2 0-3.6-.6-4.7-1.8zM13 18h4.7v2.8h-2.5v9.2h-2.2v-9.2H13z" fill="#fff"/></svg>' },
    { label: 'PHP',  svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#777BB3"/><path d="M9 11h3.2c1.5 0 2.5.3 3.1 1 .6.7.8 1.6.5 3-.2.9-.7 1.6-1.3 2.1-.6.5-1.5.7-2.6.7h-1.8l-.8 3.6H9zm2.3 2.2L10 18h1.4c.7 0 1.2-.2 1.6-.5.3-.3.6-.8.7-1.4.2-.8 0-1.4-.4-1.8-.3-.3-.9-.5-1.5-.5h-.5zm7.6-2.2h3.2c1.5 0 2.5.3 3.1 1 .6.7.8 1.6.5 3-.2.9-.7 1.6-1.3 2.1-.6.5-1.5.7-2.6.7h-1.8l-.8 3.6h-2.3zm2.3 2.2L19 18h1.4c.7 0 1.2-.2 1.6-.5.3-.3.6-.8.7-1.4.2-.8 0-1.4-.4-1.8-.3-.3-.9-.5-1.5-.5h-.5z" fill="#fff"/></svg>' },
    { label: 'NODE', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L3 9.5v13L16 30l13-7.5v-13zm0 2.3L26.2 10 16 15.7 5.8 10zM4.5 20.8V11.2L15 17v9.6zm23 0L17 26.6V17l10.5-5.8z" fill="#339933"/></svg>' },
    { label: 'REACT',svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="3" fill="#61DAFB"/><path d="M16 8.5c4.5 0 8.5.8 11.5 2.2 3 1.4 4.8 3.3 4.8 5.3 0 2-1.8 3.9-4.8 5.3-3 1.4-7 2.2-11.5 2.2s-8.5-.8-11.5-2.2C1.5 19.9-.3 18-.3 16c0-2 1.8-3.9 4.8-5.3C7.5 9.3 11.5 8.5 16 8.5z" stroke="#61DAFB" stroke-width=".8" fill="none"/><path d="M16 8.5c4.5 0 8.5.8 11.5 2.2 3 1.4 4.8 3.3 4.8 5.3 0 2-1.8 3.9-4.8 5.3-3 1.4-7 2.2-11.5 2.2s-8.5-.8-11.5-2.2C1.5 19.9-.3 18-.3 16c0-2 1.8-3.9 4.8-5.3C7.5 9.3 11.5 8.5 16 8.5z" stroke="#61DAFB" stroke-width=".8" fill="none" transform="rotate(60 16 16)"/><path d="M16 8.5c4.5 0 8.5.8 11.5 2.2 3 1.4 4.8 3.3 4.8 5.3 0 2-1.8 3.9-4.8 5.3-3 1.4-7 2.2-11.5 2.2s-8.5-.8-11.5-2.2C1.5 19.9-.3 18-.3 16c0-2 1.8-3.9 4.8-5.3C7.5 9.3 11.5 8.5 16 8.5z" stroke="#61DAFB" stroke-width=".8" fill="none" transform="rotate(-60 16 16)"/></svg>' },
    { label: 'C++',  svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L3 9.5v13L16 30l13-7.5v-13zm0 2.3L26.2 10 16 15.7 5.8 10zM4.5 20.8V11.2L15 17v9.6zm23 0L17 26.6V17l10.5-5.8z" fill="#00599C"/><path d="M14.5 14.5h3v-3h2v3h3v2h-3v3h-2v-3h-3z" fill="#fff"/></svg>' },
    { label: 'JAVA', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M11.6 24.3s-1.2.7.8.9c2.2.2 3.4.2 5.9-.2 0 0 .7.4 1.6.8-5.7 2.4-12.9-.1-8.3-1.5zm-.8-3.6s-1.3 1 .7 1.1c2.6.1 4.6.1 8.1-.4 0 0 .5.5 1.3.7-6.9 2-12.6.1-10.1-1.4z" fill="#EA2D2E"/><path d="M20.5 18.6c-2.8 1.3-4.6 2.3-6.8 2.3-2.1 0-3.3-1.3-3.3-2.8 0-1.5.7-2.8 2-3.7l.1-.1c-1.2.6-2.2 1.4-2.5 2.5-.4 1.3.2 2.9 2.1 3.3 2.4.5 5.1-.6 7.9-2.1l-.3-.1c.2.1.4.2.5.3.2.1.4.2.6.3" fill="#F8981D"/><path d="M16.2 12.7c2.3 2.7-2.1 5-2.1 5s3.4-1.7 2-4.5c-.1-.2-.5-.6-1.1-1.1 0 0 .2.2.3.3.6.3.9.6.9.6" fill="#F8981D"/><path d="M22.3 27.5s.9.7-1 1.3c-3.6 1-14.9 1.3-18.1 0-1.1-.5 1-.8 1.7-.9l.7-.1c-1.1-.8-7 1.5-3 2.2 10.9 1.8 19.8-.8 19.7-2.5zM16.1 18.6c.1 0 .2 0 .2.1-2.3.7-4.8 1.3-5.9 2.5-1.1 1.2-.1 2.1-.1 2.1s-1.4-1.1-.1-2.4c1.3-1.3 4.4-2 5.9-2.3z" fill="#EA2D2E"/><path d="M23.6 22.2c-.6 1.2-2.2 1.6-2.2 1.6s.9-.4 1.2-1.2c.4-1-.1-2.4-.7-3.2-.6-.9-1.1-1.6-1.1-1.6s1.7.9 2.9 2.7c.6.9 1.1 2.7-.1 1.7z" fill="#F8981D"/></svg>' },
    { label: 'LINUX',svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12-5.4 12-12 12z" fill="#FCC624"/><path d="M8 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm16 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-5 7c0 1.7-1.3 3-3 3s-3-1.3-3-3v-2h6v2z" fill="#FCC624"/></svg>' },
    { label: 'AWS',  svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10.6 15.2c0 .2.2.3.4.2l7.5-2.5c.2-.1.3-.3.1-.5l-2.5-3.5c-.1-.2-.3-.2-.5-.1l-4.7 5.5c-.1.1-.2.4-.3.9z" fill="#FF9900"/><path d="M21.5 11.5c.2.1.3.4.1.6l-6.5 8.5c-.2.2-.5.2-.6-.1l-2-3.5c-.1-.3 0-.5.2-.6l7.5-4.9c.2-.1.5-.1.6 0z" fill="#FF9900"/><path d="M12.8 20.9c.2.2.5.1.6-.1l3.5-4.5c.1-.2 0-.5-.2-.6l-1.5-.5c-.2-.1-.5 0-.6.2l-1.8 5.5z" fill="#FF9900"/></svg>' },
    { label: 'DB',   svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="8.5" rx="11" ry="3.5" fill="#4479A1"/><path d="M5 8.5v4c0 1.9 4.9 3.5 11 3.5s11-1.6 11-3.5v-4c0 1.9-4.9 3.5-11 3.5S5 10.4 5 8.5z" fill="#4479A1"/><path d="M5 12.5v4c0 1.9 4.9 3.5 11 3.5s11-1.6 11-3.5v-4c0 1.9-4.9 3.5-11 3.5S5 14.4 5 12.5z" fill="#4479A1"/><ellipse cx="16" cy="20.5" rx="11" ry="3.5" fill="#4479A1"/></svg>' },
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

  // ─── Draw an SVG icon onto canvas at (cx, cy) with scale ─────
  function drawIcon(cx, cy, size, svgStr, alpha) {
    size = Math.max(size, 8);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
      ctx.restore();
      URL.revokeObjectURL(url);
    };
    img.src = url;
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

  // Each tech node is anchored at a point on the sphere; icons orbit it
  const nodes = TECH_ICONS.map((tech, i) => {
    const phi   = Math.acos(-1 + (2 * i) / TECH_ICONS.length);
    const theta = Math.sqrt(TECH_ICONS.length * Math.PI) * phi;
    const ic = Math.random() * 2 + 1; // slight random offset per icon
    return {
      ...tech,
      ox: SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
      oy: SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta),
      oz: SPHERE_RADIUS * Math.cos(phi),
      orbitRad: 8 + Math.random() * 18,
      orbitSpeed: 0.008 + Math.random() * 0.015,
      orbitPhase: Math.random() * Math.PI * 2,
      // For the morph: we also hold a target offset for final text position
      tx: 0, ty: 0,
    };
  });

  // Particles = the scattered glowing dots
  const particles = [];
  nodes.forEach((n) => {
    for (let i = 0; i < 40; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi   = Math.acos(2 * Math.random() - 1);
      const rOff  = 10 + Math.random() * 30;
      particles.push({
        x3d: n.ox + rOff * Math.sin(phi) * Math.cos(theta),
        y3d: n.oy + rOff * Math.sin(phi) * Math.sin(theta),
        z3d: n.oz + rOff * Math.cos(phi),
        x: 0, y: 0,
        alpha: 0.15 + Math.random() * 0.6,
        size: 1 + Math.random() * 2,
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
    const ax = 0.012, ay = 0.015;

    ctx.clearRect(0, 0, W, H);

    // ── Status text ──
    if (statusEl) {
      statusEl.textContent =
        progress < 0.25
          ? '✦ Assembling Core Dependencies...'
          : progress < MORPH_START
            ? '✦ Mapping Tech Stack Universe...'
            : '✦ Compiling [ABAASA] Build...';
    }

    // ── Morph trigger ──
    let textTargets = [];
    if (progress >= MORPH_START && phase === 'sphere') {
      phase = 'morphing';
      textTargets = extractTextTargets();
      particles.forEach((p, i) => {
        if (textTargets[i]) {
          p.targetX = textTargets[i].x;
          p.targetY = textTargets[i].y;
        } else {
          p.targetX = W / 2 + (Math.random() - 0.5) * W * 0.6;
          p.targetY = H / 2 + (Math.random() - 0.5) * H * 0.2;
        }
      });
      // Also assign text targets to nodes for their final positions
      nodes.forEach((n, i) => {
        if (textTargets[i * 30]) {
          n.tx = textTargets[i * 30].x;
          n.ty = textTargets[i * 30].y;
        } else {
          n.tx = W / 2 + (Math.random() - 0.5) * W * 0.4;
          n.ty = H / 2 + (Math.random() - 0.5) * H * 0.2;
        }
      });
    }

    // ── SPHERE PHASE ──────────────────────────────────────────────
    if (phase === 'sphere') {
      const focal = 300;

      // Update node positions and project
      nodes.forEach((n) => {
        // Orbit sub-motion
        const oAngle = now * n.orbitSpeed + n.orbitPhase;
        const oxOff = Math.cos(oAngle) * n.orbitRad;
        const oyOff = Math.sin(oAngle) * n.orbitRad;

        let x3 = n.ox + oxOff;
        let y3 = n.oy + oyOff;
        let z3 = n.oz;

        // Rotate whole sphere
        const rot = rotate3D(x3, y3, z3, ax, ay);
        n._x3 = rot.x; n._y3 = rot.y; n._z3 = rot.z;

        const sc = focal / (focal - n._z3);
        n._px = W / 2 + n._x3 * sc;
        n._py = H / 2 + n._y3 * sc;
        n._sc = sc;
      });

      // ── Draw connecting lines ──
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i]._px - nodes[j]._px;
          const dy = nodes[i]._py - nodes[j]._py;
          const dist = Math.hypot(dx, dy);
          if (dist < 200) {
            const a = (1 - dist / 200) * 0.15;
            ctx.strokeStyle = `rgba(130, 255, 184, ${a})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i]._px, nodes[i]._py);
            ctx.lineTo(nodes[j]._px, nodes[j]._py);
            ctx.stroke();
          }
        }
      }

      // ── Draw particles ──
      particles.forEach((p) => {
        const rot = rotate3D(p.x3d, p.y3d, p.z3d, ax, ay);
        p.x3d = rot.x; p.y3d = rot.y; p.z3d = rot.z;
        const sc = focal / (focal - p.z3d);
        const wave = Math.sin(now * 0.003 + p.seed) * 3;
        const sx = W / 2 + (p.x3d + wave) * sc;
        const sy = H / 2 + (p.y3d + wave) * sc;
        ctx.fillStyle = `rgba(130, 255, 184, ${p.alpha * sc * 0.8})`;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.6, p.size * sc), 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Draw SVG icons at projected node positions ──
      nodes.forEach((n) => {
        if (n._z3 < 80) {
          const sc = n._sc;
          const iconSize = Math.max(14, 22 * sc);
          const alpha = clamp(sc - 0.3, 0.3, 1);
          drawIcon(n._px, n._py, iconSize, n.svg, alpha);
        }
      });

      // Gradually increase spin speed slightly
      if (progress < MORPH_START - 0.05) {
        // subtle extra rotation speed increase toward end of sphere phase
      }
    }

    // ── MORPHING PHASE ────────────────────────────────────────────
    if (phase === 'morphing') {
      const morphPct = (progress - MORPH_START) / (1 - MORPH_START);
      const ease = easeInOutCubic(morphPct);

      // Lerp particles toward text targets
      particles.forEach((p) => {
        if (p.targetX !== null) {
          p.x += (p.targetX - p.x) * (0.05 + ease * 0.12);
          p.y += (p.targetY - p.y) * (0.05 + ease * 0.12);
        }
        const r = Math.round(130 + 125 * ease);
        const g = 255;
        const b = Math.round(184 + 71 * ease);
        ctx.fillStyle = `rgba(${r},${g},${b},${clamp(p.alpha + ease, 0.1, 1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.size * (1 - ease * 0.2)), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw icons also moving toward their text targets
      nodes.forEach((n) => {
        const targetX = n.tx || W / 2;
        const targetY = n.ty || H / 2;

        // Simple lerp for the icon positions
        if (!n._startX) {
          n._startX = n._px || W / 2;
          n._startY = n._py || H / 2;
        }
        n._curX = n._startX + (targetX - n._startX) * ease;
        n._curY = n._startY + (targetY - n._startY) * ease;

        const iconSize = Math.max(16, 26 * (1 - ease * 0.35));
        const alpha = 0.6 + ease * 0.4;
        drawIcon(n._curX, n._curY, iconSize, n.svg, alpha);
      });

      if (progress >= 0.98) {
        phase = 'complete';
        setTimeout(unmount, 250);
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
