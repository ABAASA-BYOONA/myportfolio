
document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // -- Footer year
  // ============================================================
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  // ============================================================
  // 1. SMOOTH PAGE-ENTER STAGGER
  // ============================================================
  function runHeroStagger() {
    const heroName  = document.querySelector('.hero-bigname');
    const heroPhoto = document.querySelector('.hero-photo-wrap');
    const heroBar   = document.querySelector('.hero-bar');
    const marquee   = document.querySelector('.marquee-wrap');
    const heroCta   = document.querySelector('.hero-cta-row');

    [heroName, heroPhoto, heroBar, marquee, heroCta].forEach(el => {
      if (!el) return;
      el.style.opacity = '0';
      if (el === heroName) {
        el.style.transform = 'translate(-50%, -50%) translateY(24px)';
      } else if (el === heroPhoto) {
        el.style.transform = 'translateX(-50%) translateY(28px)';
      } else {
        el.style.transform = 'translateY(24px)';
      }
      el.style.transition = 'none';
      el.style.animation = 'none';
    });

    const staggerItems = [
      { el: heroName,  delay: 120,  yFrom: 24 },
      { el: heroPhoto, delay: 280,  yFrom: 28, isPhoto: true },
      { el: heroCta,   delay: 420,  yFrom: 20 },
      { el: heroBar,   delay: 540,  yFrom: 16 },
      { el: marquee,   delay: 680,  yFrom: 12 },
    ];

    staggerItems.forEach(({ el, delay, yFrom, isPhoto }) => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition = 'opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)';
        el.style.opacity    = '1';
        if (el === heroName) {
          el.style.transform = 'translate(-50%, -50%)';
        } else if (isPhoto) {
          el.style.transform = 'translateX(-50%) translateY(0)';
        } else {
          el.style.transform = 'translateY(0)';
        }
      }, delay);
    });
  }

  // Run hero stagger after preloader (if present) or immediately
  if (document.getElementById('preloader')) {
    document.addEventListener('preloaderComplete', runHeroStagger);
  } else {
    runHeroStagger();
  }


  // ============================================================
  // -- 2. STICKY NAV + SLIDING PILL
  // ============================================================
  const nav      = document.getElementById('nav');
  const navInner = nav ? nav.querySelector('.nav-inner') : null;
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  let slidingPill = null;
  if (navInner) {
    slidingPill = document.createElement('span');
    slidingPill.className = 'nav-sliding-pill';
    navInner.style.position = 'relative';
    navInner.insertBefore(slidingPill, navInner.firstChild);
  }

  function movePillTo(linkEl) {
    if (!slidingPill || !linkEl) return;
    const navRect  = navInner.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    slidingPill.style.width  = linkRect.width  + 'px';
    slidingPill.style.left   = (linkRect.left - navRect.left) + 'px';
    slidingPill.style.top    = (linkRect.top  - navRect.top)  + 'px';
    slidingPill.style.height = linkRect.height + 'px';
  }

  const homeLink = document.querySelector('.nav-links a[href="#hero"]');
  if (homeLink) {
    requestAnimationFrame(() => {
      slidingPill.style.transition = 'none';
      movePillTo(homeLink);
      requestAnimationFrame(() => {
        slidingPill.style.transition = 'left 0.38s cubic-bezier(0.4,0,0.2,1), width 0.38s cubic-bezier(0.4,0,0.2,1), top 0.38s cubic-bezier(0.4,0,0.2,1)';
      });
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active-link'));
      link.classList.add('active-link');
      movePillTo(link);
    });
  });

  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.remove('active-link'));
      const sel = '.nav-links a[href="#' + entry.target.id + '"]';
      const active = document.querySelector(sel);
      if (active) {
        active.classList.add('active-link');
        movePillTo(active);
      }
    });
  }, {
    rootMargin: '-45% 0px -55% 0px'
  });

  sections.forEach(sec => observerNav.observe(sec));


  // ============================================================
  // -- 3. DARK MODE TOGGLE
  // ============================================================
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) htmlEl.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }


  // ============================================================
  // -- 4. MAGNETIC BUTTONS
  // ============================================================
  function initMagnetic(el) {
    const strength = parseFloat(el.dataset.magnetic) || 0.35;

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * strength;
      const dy = (e.clientY - (r.top  + r.height / 2)) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = 'transform 0.15s ease';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform  = 'translate(0, 0)';
      el.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
    });
  }

  document.querySelectorAll('[data-magnetic]').forEach(initMagnetic);
  document.querySelectorAll('.contact-item, .project-link').forEach(el => {
    if (!el.dataset.magnetic) {
      el.dataset.magnetic = '0.28';
      initMagnetic(el);
    }
  });


  // ============================================================
  // -- 5. STATS COUNTER ANIMATION
  // ============================================================
  function animateCount(el, target, duration = 1400) {
    let start = 0;
    const step  = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { el.textContent = '+' + target; clearInterval(timer); }
      else                   { el.textContent = '+' + start; }
    }, 16);
  }

  const counterEls = document.querySelectorAll('.stat-num[data-count]');
  let countersStarted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counterEls.forEach(el => animateCount(el, parseInt(el.dataset.count)));
      }
    });
  }, { threshold: 0.4 });

  counterEls.forEach(el => counterObserver.observe(el));


  // ============================================================
  // -- 6. PROJECT REVEAL ANIMATION
  // ============================================================
  const projectRows = document.querySelectorAll('.project-row[data-reveal="project"]');

  const projectRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        projectRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  projectRows.forEach(row => {
    row.classList.add('reveal');
    projectRevealObserver.observe(row);
  });

  // ============================================================
  // -- 7. PROCESS STEP REVEAL
  // ============================================================
  const processSteps = document.querySelectorAll('.process-step[data-reveal="step"]');

  const stepRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const idx = Array.from(processSteps).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 120);
        stepRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  processSteps.forEach(step => stepRevealObserver.observe(step));


  // ============================================================
  // -- 8. TESTIMONIALS CAROUSEL
  // ============================================================
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('testimonialsDots');
  if (track && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');
    if (cards.length > 0) {
      let currentIndex = 0;
      let autoplayInterval;

      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });

      const dots = dotsContainer.querySelectorAll('.testimonial-dot');

      function goToSlide(index) {
        currentIndex = index;
        const cardWidth = cards[0].offsetWidth + 24;
        const maxTranslate = Math.max(0, (cards.length * (cards[0].offsetWidth + 24) - 24 - track.parentElement.offsetWidth));
        const translate = Math.min(index * cardWidth, maxTranslate);
        track.style.transform = `translateX(-${translate}px)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
      }

      function nextSlide() {
        goToSlide((currentIndex + 1) % cards.length);
      }

      function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 4000);
      }

      function stopAutoplay() {
        clearInterval(autoplayInterval);
      }

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => goToSlide(currentIndex), 200);
      });

      track.addEventListener('mouseenter', stopAutoplay);
      track.addEventListener('mouseleave', startAutoplay);

      startAutoplay();
    }
  }


  // ============================================================
  // -- 9. CONTACT FORM
  // ============================================================
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);

      const submitBtn = contactForm.querySelector('.form-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const subject = formData.get('subject') || 'Portfolio Inquiry';
      const message = formData.get('message') || '';
      const waText = encodeURIComponent(
        `*New Portfolio Inquiry*\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
      );
      const waLink = `https://wa.me/256701122665?text=${waText}`;
      window.open(waLink, '_blank');

      formStatus.textContent = 'Thanks! WhatsApp should open with your message.';
      formStatus.className = 'form-status success';
      contactForm.reset();

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }, 6000);
    });
  }


  // ============================================================
  // -- 10. BACK TO TOP
  // ============================================================
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ============================================================
  // -- 11. SCROLL REVEAL
  // ============================================================
  const revealTargets = document.querySelectorAll(
    '.about-grid, .project-row, .service-card, .contact-item, .section-heading, .section-label'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealTargets.forEach(el => revealObserver.observe(el));


  // ============================================================
  // -- 12. STAGGERED SERVICE CARDS
  // ============================================================
  const serviceCards = document.querySelectorAll('.service-card');
  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index) || 1;
        setTimeout(() => entry.target.classList.add('visible'), (index - 1) * 100);
        serviceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  serviceCards.forEach(card => {
    card.classList.add('reveal');
    serviceObserver.observe(card);
  });


  // ============================================================
  // -- 13. PROJECT IMAGE HOVER TILT
  // ============================================================
  document.querySelectorAll('.project-image-wrap').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      const img = el.querySelector('.project-image');
      if (img) {
        img.style.transform = `scale(1.06) rotateY(${dx * 3}deg) rotateX(${-dy * 3}deg)`;
      }
    });
    el.addEventListener('mouseleave', () => {
      const img = el.querySelector('.project-image');
      if (img) {
        img.style.transform = '';
      }
    });
  });


  // ============================================================
  // -- 14. SKILL PILL POP
  // ============================================================
  document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.style.background = 'var(--primary)';
      pill.style.color      = 'var(--white)';
      setTimeout(() => {
        pill.style.background = '';
        pill.style.color      = '';
      }, 600);
    });
  });


  // ============================================================
  // -- 15. PAGE FADE-IN
  // ============================================================
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.45s ease';
    document.body.style.opacity    = '1';
  });

});
