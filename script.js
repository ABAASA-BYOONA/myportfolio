document.addEventListener('DOMContentLoaded', () => {

  // ── Footer year ──────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  });


  // ── Sticky Nav + Scroll Class ────────────────
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ── Smooth Active Nav Link ───────────────────
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active-link'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => observerNav.observe(sec));

  // ── Scroll Reveal ────────────────────────────
  const revealTargets = document.querySelectorAll(
    '.about-grid, .project-row, .service-card, .contact-item, .section-heading, .section-label'
  );

  // Wrap in reveal class
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealTargets.forEach(el => revealObserver.observe(el));

  // ── Staggered service cards ──────────────────
  const serviceCards = document.querySelectorAll('.service-card');
  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index) || 1;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, (index - 1) * 100);
        serviceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  serviceCards.forEach(card => {
    card.classList.add('reveal');
    serviceObserver.observe(card);
  });

  // ── Counter Animation ────────────────────────
  function animateCount(el, target, duration = 1200) {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        el.textContent = '+' + target;
        clearInterval(timer);
      } else {
        el.textContent = '+' + start;
      }
    }, 16);
  }

  const counterEls = document.querySelectorAll('.stat-num[data-count]');
  let countersStarted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counterEls.forEach(el => {
          const target = parseInt(el.dataset.count);
          animateCount(el, target);
        });
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  // ── Project image hover tilt ─────────────────
  const projectVisuals = document.querySelectorAll('.project-img-placeholder');

  projectVisuals.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `translateY(-6px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ── Skill pill pop ───────────────────────────
  const skillPills = document.querySelectorAll('.skill-pill');
  skillPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.style.background = 'var(--primary)';
      pill.style.color = 'var(--white)';
      setTimeout(() => {
        pill.style.background = '';
        pill.style.color = '';
      }, 600);
    });
  });

  // ── Page loader fade-in ──────────────────────
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });

});
