/**
 * ADVANCED FULL-STACK PRELOADER: 3D Orbiting Tech Sphere Morphing into Brand Matrix
 */
(function () {
  'use strict';
 
  // --- Configuration ---
  const TEXT = 'ABAASA';
  const CORE_TECH = ['JS', 'TS', 'PHP', 'NODE', 'REACT', 'C++', 'JAVA', 'LINUX', 'AWS', 'DB'];
  
  const BASE_PARTICLES_PER_NODE = 90; 
  const TOTAL_DURATION = 3200; // Total runtime before fade out
  const MORPH_START_PCT = 0.50; // Morph begins at 50% timeline progress
  const FOCAL_LENGTH = 300;     // 3D camera focal perspective depth
  const SPHERE_RADIUS = 160;    // Size of the tech sphere

  const preloader = document.getElementById('preloader');
  const hintEl = document.getElementById('preloaderHint');
  const statusEl = document.getElementById('preloaderStatus');

  if (!preloader) return;

  // Lock scroll during experience
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  const inner = document.createElement('div');
  inner.className = 'preloader-inner';
  preloader.appendChild(inner);

  const canvas = document.createElement('canvas');
  canvas.id = 'techCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:10000;pointer-events:none;width:100%;height:100%;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let width = 0, height = 0;
  let startTime = performance.now();
  let phase = 'sphere'; // 'sphere' | 'morphing' | 'complete'
  let particles = [];
  let techNodes = [];
  let textTargets = [];
  let angleX = 0.015; // Continuous spin speeds
  let angleY = 0.018;
  let rafId = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Utility Mathematics ---
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  
  function rotate3D(x, y, z, ax, ay) {
    // Rotate Y axis
    let cosY = Math.cos(ay), sinY = Math.sin(ay);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    // Rotate X axis
    let cosX = Math.cos(ax), sinX = Math.sin(ax);
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
  }

  // --- Text Matrix Extraction ---
  function extractTextTargets() {
    const off = document.createElement('canvas');
    off.width = width; off.height = height;
    const octx = off.getContext('2d');
    
    octx.fillStyle = '#ffffff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    
    let fontSize = Math.min(width * 0.16, height * 0.22);
    octx.font = `900 ${fontSize}px 'DM Sans', system-ui, sans-serif`;
    octx.fillText(TEXT, width / 2, height / 2);

    const imgData = octx.getImageData(0, 0, width, height).data;
    const targets = [];
    const samplingStep = width < 600 ? 4 : 5; // Denser matrix on smaller viewports

    for (let y = 0; y < height; y += samplingStep) {
      for (let x = 0; x < width; x += samplingStep) {
        if (imgData[(y * width + x) * 4] > 150) {
          targets.push({ x, y });
        }
      }
    }
    
    // Shuffle targets to prevent localized filling patterns
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    return targets;
  }

  // --- Component Initialization ---
  function initSystem() {
    // 1. Initialize Tech Anchor Nodes distributed evenly across a virtual sphere
    CORE_TECH.forEach((label, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / CORE_TECH.length);
      const theta = Math.sqrt(CORE_TECH.length * Math.PI) * phi;
      techNodes.push({
        label: label,
        x3d: SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
        y3d: SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta),
        z3d: SPHERE_RADIUS * Math.cos(phi),
        projX: 0, projY: 0, scale: 1
      });
    });

    // 2. Initialize Core Particle Pool distributed dynamically around anchor nodes
    techNodes.forEach((node) => {
      for (let i = 0; i < BASE_PARTICLES_PER_NODE; i++) {
        // Offset range surrounding individual tech nodes
        const radiusOffset = 10 + Math.random() * 35;
        const u = Math.random(), v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        
        particles.push({
          // Absolute 3D positioning
          x3d: node.x3d + radiusOffset * Math.sin(phi) * Math.cos(theta),
          y3d: node.y3d + radiusOffset * Math.sin(phi) * Math.sin(theta),
          z3d: node.z3d + radiusOffset * Math.cos(phi),
          // Runtime values
          x: 0, y: 0,
          alpha: 0.1 + Math.random() * 0.7,
          size: 1.0 + Math.random() * 2.0,
          seed: Math.random() * 100,
          targetX: null, targetY: null
        });
      }
    });
  }

  initSystem();

  // --- Main Animation Frame Engine ---
  function render(now) {
    const elapsed = now - startTime;
    const progress = clamp(elapsed / TOTAL_DURATION, 0, 1);

    ctx.clearRect(0, 0, width, height);

    // Context Evaluation State
    if (progress >= MORPH_START_PCT && phase === 'sphere') {
      phase = 'morphing';
      textTargets = extractTextTargets();
      
      // Assign particle locks to mapped font text layout vectors
      particles.forEach((p, idx) => {
        if (textTargets[idx]) {
          p.targetX = textTargets[idx].x;
          p.targetY = textTargets[idx].y;
        } else {
          // Extra excess particles wrap clean ambient borders around text layout boundaries
          p.targetX = width / 2 + (Math.random() - 0.5) * (width * 0.7);
          p.targetY = height / 2 + (Math.random() - 0.5) * (height * 0.2);
        }
      });
    }

    // Phase Status Message Outputs
    if (statusEl) {
      if (phase === 'sphere') {
        statusEl.textContent = progress < 0.25 ? '⚡ Mounting Full-Stack Environments...' : '🛸 Mapping Core Tech Repositories...';
      } else if (phase === 'morphing') {
        statusEl.textContent = '🪐 Compiling Production Build [ABAASA]';
      }
    }

    if (phase === 'sphere') {
      // --- Standard 3D Sphere Pipeline Operations ---
      
      // Rotate Node Matrix positions
      techNodes.forEach(node => {
        const rot = rotate3D(node.x3d, node.y3d, node.z3d, angleX, angleY);
        node.x3d = rot.x; node.y3d = rot.y; node.z3d = rot.z;

        // Render project calculations onto 2D viewport standard space
        node.scale = FOCAL_LENGTH / (FOCAL_LENGTH - node.z3d);
        node.projX = width / 2 + node.x3d * node.scale;
        node.projY = height / 2 + node.y3d * node.scale;
      });

      // Connect Node Mesh lines based on dynamic spatial distance calculation parameters
      ctx.lineWidth = 0.5;
      for (let i = 0; i < techNodes.length; i++) {
        for (let j = i + 1; j < techNodes.length; j++) {
          const dx = techNodes[i].projX - techNodes[j].projX;
          const dy = techNodes[i].projY - techNodes[j].projY;
          const distance = Math.hypot(dx, dy);

          if (distance < 190) {
            const alphaFactor = (1 - (distance / 190)) * 0.18;
            ctx.strokeStyle = `rgba(130, 255, 184, ${alphaFactor * techNodes[i].scale})`;
            ctx.beginPath();
            ctx.moveTo(techNodes[i].projX, techNodes[i].projY);
            ctx.lineTo(techNodes[j].projX, techNodes[j].projY);
            ctx.stroke();
          }
        }
      }

      // Track individual particles attached to specific nodes
      particles.forEach(p => {
        const rot = rotate3D(p.x3d, p.y3d, p.z3d, angleX, angleY);
        p.x3d = rot.x; p.y3d = rot.y; p.z3d = rot.z;

        const scale = FOCAL_LENGTH / (FOCAL_LENGTH - p.z3d);
        // Map ambient micro-swimming wave offset via math functions
        const waveOffset = Math.sin(now * 0.003 + p.seed) * 3;
        p.x = width / 2 + (p.x3d + waveOffset) * scale;
        p.y = height / 2 + (p.y3d + waveOffset) * scale;

        // Visual projection setup
        ctx.fillStyle = `rgba(130, 255, 184, ${p.alpha * scale * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.size * scale), 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Floating Core Text Tags on top of Node coordinates
      techNodes.forEach(node => {
        if (node.z3d < 60) { // Only render foreground elements cleanly
          ctx.fillStyle = `rgba(255, 255, 255, ${clamp(node.scale - 0.4, 0.2, 1)})`;
          ctx.font = `bold ${Math.max(10, 12 * node.scale)}px 'Fira Code', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(`<${node.label}/>`, node.projX, node.projY + 4);
        }
      });

    } else if (phase === 'morphing') {
      // --- Vector Linear Interpolation (Morphing Sequence) Pipeline ---
      const morphProgress = (progress - MORPH_START_PCT) / (1 - MORPH_START_PCT);
      const easeFactor = easeInOutCubic(morphProgress);

      particles.forEach(p => {
        if (p.targetX !== null) {
          // Dynamic tracking vector math towards hero brand characters
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.x += dx * (0.05 + easeFactor * 0.12);
          p.y += dy * (0.05 + easeFactor * 0.12);
        }

        // Shift color profile dynamically from tech neon greens into pure developer white layout matrix
        const red = Math.round(130 + (125 * easeFactor));
        const green = 255;
        const blue = Math.round(184 + (71 * easeFactor));

        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${clamp(p.alpha + easeFactor, 0.1, 1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.size * (1 - easeFactor * 0.2)), 0, Math.PI * 2);
        ctx.fill();
      });

      if (progress >= 0.98) {
        phase = 'complete';
        setTimeout(unmountPreloader, 300);
      }
    }

    if (phase !== 'complete') {
      rafId = requestAnimationFrame(render);
    }
  }

  function unmountPreloader() {
    window.removeEventListener('resize', resize);
    preloader.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
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

  // Fire execution cycle loops
  rafId = requestAnimationFrame(render);
})();
