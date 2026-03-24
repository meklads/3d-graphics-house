/* ============================================================
   3D GRAPHICS HOUSE — MAIN JAVASCRIPT
   Animations | Counters | Navigation | Interactions
   ============================================================ */

'use strict';

/* ─── Utility ─────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* ─── Navbar Scroll Effect ────────────────────────────── */
function initNavbar() {
  const navbar = $('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);

    // Hide on scroll down, show on scroll up (optional UX)
    if (y > 200 && y > lastScroll) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  }, { passive: true });

  // Active link highlighting
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link[href^="#"], .nav-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* ─── Mobile Navigation ───────────────────────────────── */
function initMobileNav() {
  const hamburger = $('.hamburger');
  const mobileNav = $('.mobile-nav');
  const closeBtn = $('.mobile-nav-close');

  if (!hamburger || !mobileNav) return;

  const toggle = (open) => {
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    hamburger.classList.toggle('open', open);
  };

  on(hamburger, 'click', () => toggle(!mobileNav.classList.contains('open')));
  on(closeBtn, 'click', () => toggle(false));

  $$('.mobile-nav .nav-link').forEach(link => {
    on(link, 'click', () => toggle(false));
  });

  on(document, 'keydown', e => {
    if (e.key === 'Escape') toggle(false);
  });
}

/* ─── Scroll Reveal Animations ────────────────────────── */
function initScrollReveal() {
  const targets = $$('.reveal');
  if (!targets.length) return;

  // Enable CSS animations now that JS is running
  document.body.classList.add('js-ready');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
}

/* ─── Animated Stat Counters ──────────────────────────── */
function animateCounter(el, target, duration = 2000, suffix = '') {
  let start = null;
  const startVal = 0;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = Math.floor(eased * (target - startVal) + startVal);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  };

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.count, 10);
        const suffix = e.target.dataset.suffix || '';
        animateCounter(e.target, target, 2200, suffix);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

/* ─── Parallax Effect on Hero ─────────────────────────── */
function initParallax() {
  const heroVisual = $('.hero-visual');
  if (!heroVisual) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroVisual.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
}

/* ─── Portfolio Filter ────────────────────────────────── */
function initPortfolioFilter() {
  const filterBtns = $$('.filter-btn');
  const items = $$('.portfolio-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    on(btn, 'click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.opacity = match ? '1' : '0.2';
        item.style.transform = match ? 'scale(1)' : 'scale(0.97)';
        item.style.pointerEvents = match ? 'auto' : 'none';
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      });
    });
  });
}

/* ─── Before/After Slider ─────────────────────────────── */
function initBeforeAfter() {
  const sliders = $$('.before-after-slider');

  sliders.forEach(slider => {
    const handle = $('.ba-handle', slider);
    const afterLayer = $('.ba-after', slider);
    if (!handle || !afterLayer) return;

    let dragging = false;

    const setPosition = (x) => {
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
      handle.style.left = pct + '%';
      afterLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
    };

    on(handle, 'mousedown', () => dragging = true);
    on(document, 'mousemove', e => dragging && setPosition(e.clientX));
    on(document, 'mouseup', () => dragging = false);

    on(handle, 'touchstart', () => dragging = true, { passive: true });
    on(document, 'touchmove', e => dragging && setPosition(e.touches[0].clientX), { passive: true });
    on(document, 'touchend', () => dragging = false);

    // Init at 50%
    setPosition(slider.getBoundingClientRect().left + slider.offsetWidth / 2);
  });
}

/* ─── Showreel Popup ──────────────────────────────────── */
function initShowreel() {
  const trigger = $('.showreel-trigger');
  const modal = $('.showreel-modal');
  const closeBtn = $('.showreel-close');

  if (!trigger || !modal) return;

  const open = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const iframe = $('iframe', modal);
    if (iframe && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
    }
  };

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    const iframe = $('iframe', modal);
    if (iframe) iframe.src = '';
  };

  on(trigger, 'click', open);
  on(closeBtn, 'click', close);
  on(modal, 'click', e => e.target === modal && close());
  on(document, 'keydown', e => e.key === 'Escape' && close());
}

/* ─── Project Cost Estimator ──────────────────────────── */
function initCostEstimator() {
  const estimator = $('.cost-estimator');
  if (!estimator) return;

  const ranges = {
    // [service][scale][quality]
    viz: { small: { standard: [5000, 12000], premium: [12000, 25000], ultra: [25000, 60000] },
           medium: { standard: [15000, 35000], premium: [35000, 75000], ultra: [75000, 150000] },
           large: { standard: [40000, 80000], premium: [80000, 180000], ultra: [180000, 400000] } },
    media: { small: { standard: [8000, 20000], premium: [20000, 45000], ultra: [45000, 100000] },
             medium: { standard: [20000, 50000], premium: [50000, 110000], ultra: [110000, 250000] },
             large: { standard: [50000, 120000], premium: [120000, 280000], ultra: [280000, 600000] } },
    interactive: { small: { standard: [20000, 50000], premium: [50000, 120000], ultra: [120000, 280000] },
                   medium: { standard: [60000, 150000], premium: [150000, 350000], ultra: [350000, 800000] },
                   large: { standard: [150000, 400000], premium: [400000, 900000], ultra: [900000, 2000000] } }
  };

  const fmt = (n) => 'SAR ' + n.toLocaleString();
  const result = $('.estimator-result');

  const update = () => {
    const service = $('[name="est-service"]', estimator)?.value;
    const scale = $('[name="est-scale"]', estimator)?.value;
    const quality = $('[name="est-quality"]', estimator)?.value;

    if (!service || !scale || !quality || !result) return;
    const range = ranges[service]?.[scale]?.[quality];
    if (!range) return;

    result.innerHTML = `
      <div class="est-range">
        <span>${fmt(range[0])}</span>
        <span class="est-sep">—</span>
        <span>${fmt(range[1])}</span>
      </div>
      <div class="est-note">Indicative range · Final quote after consultation</div>
    `;
    result.style.opacity = '1';
  };

  $$('select, input', estimator).forEach(el => on(el, 'change', update));
}

/* ─── Language Switcher (EN ↔ AR) ─────────────────────── */
function initLanguageSwitcher() {
  const btn = $('.lang-toggle');
  if (!btn) return;

  const langData = window.LANG_DATA || {};

  const applyLang = (lang) => {
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.body.dir = isAr ? 'rtl' : 'ltr';
    btn.textContent = isAr ? 'EN' : 'عربي';
    localStorage.setItem('gh_lang', lang);

    // Swap text nodes using data attributes
    $$('[data-en]').forEach(el => {
      el.innerHTML = isAr ? (el.dataset.ar || el.dataset.en) : el.dataset.en;
    });

    // Update document title
    if (langData.title) {
      document.title = isAr ? langData.title.ar : langData.title.en;
    }
  };

  on(btn, 'click', () => {
    const current = document.body.dir === 'rtl' ? 'ar' : 'en';
    applyLang(current === 'ar' ? 'en' : 'ar');
  });

  // Restore saved lang
  const saved = localStorage.getItem('gh_lang');
  if (saved) applyLang(saved);
}

/* ─── Smooth Internal Links ───────────────────────────── */
function initSmoothLinks() {
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', e => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ─── Contact Form ─────────────────────────────────────── */
function initContactForm() {
  const form = $('.quote-form form, #contact-form');
  if (!form) return;

  on(form, 'submit', e => {
    e.preventDefault();
    const btn = $('[type="submit"]', form);
    if (!btn) return;

    btn.textContent = btn.dataset.sending || 'Sending…';
    btn.disabled = true;

    // Simulated submission (replace with actual API endpoint)
    setTimeout(() => {
      const successMsg = form.parentElement.querySelector('.form-success');
      form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'flex';
      else {
        const msg = document.createElement('div');
        msg.className = 'form-success';
        msg.innerHTML = `
          <div style="text-align:center;padding:40px;">
            <div style="font-size:2rem;margin-bottom:16px;">✓</div>
            <h3 style="color:#c9a452;margin-bottom:12px;">Request Received</h3>
            <p style="color:#9a9080;">Our team will respond within 24 hours.</p>
          </div>`;
        form.parentElement.appendChild(msg);
      }
    }, 1800);
  });
}

/* ─── Testimonial Auto-carousel ───────────────────────── */
function initTestimonialCarousel() {
  const carousel = $('.testimonial-auto-carousel');
  if (!carousel) return;

  const items = $$('.testimonial-slide', carousel);
  if (items.length <= 1) return;

  let current = 0;

  const show = (idx) => {
    items.forEach((item, i) => {
      item.style.opacity = i === idx ? '1' : '0';
      item.style.transform = i === idx ? 'translateX(0)' : 'translateX(20px)';
    });
  };

  show(0);
  setInterval(() => {
    current = (current + 1) % items.length;
    show(current);
  }, 5000);
}

/* ─── Cursor Glow Effect ──────────────────────────────── */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip mobile

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,164,82,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

/* ─── Page Load Animation ─────────────────────────────── */
function initPageLoader() {
  const loader = $('.page-loader');
  if (!loader) return;

  const hideLoader = () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => { if (loader.parentNode) loader.remove(); }, 600);
    }, 600);
  };

  // If page already loaded, hide immediately
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    // Fallback: force-remove after 3 seconds no matter what
    setTimeout(hideLoader, 3000);
  }
}

/* ─── Sticky Quote Button Pulse ───────────────────────── */
function initStickyQuote() {
  const btn = $('.sticky-quote-btn');
  if (!btn) return;

  // Add pulse after 4 seconds
  setTimeout(() => {
    btn.style.boxShadow = '0 0 0 0 rgba(201,164,82,0.6)';
    btn.style.animation = 'quotePulse 2s infinite';
  }, 4000);
}

/* ─── Init ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initParallax();
  initPortfolioFilter();
  initBeforeAfter();
  initShowreel();
  initCostEstimator();
  initLanguageSwitcher();
  initSmoothLinks();
  initContactForm();
  initTestimonialCarousel();
  initCursorGlow();
  initPageLoader();
  initStickyQuote();

  // Lazy load images
  if ('loading' in HTMLImageElement.prototype) {
    $$('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  } else {
    // Fallback: intersection observer lazy load
    const lazyIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && e.target.dataset.src) {
          e.target.src = e.target.dataset.src;
          e.target.removeAttribute('data-src');
          lazyIO.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px' });

    $$('img[data-src]').forEach(img => lazyIO.observe(img));
  }
});

/* ─── CSS Injection for quote pulse ──────────────────── */
const style = document.createElement('style');
style.textContent = `
@keyframes quotePulse {
  0% { box-shadow: 0 0 0 0 rgba(201,164,82,0.5); }
  70% { box-shadow: 0 0 0 12px rgba(201,164,82,0); }
  100% { box-shadow: 0 0 0 0 rgba(201,164,82,0); }
}
`;
document.head.appendChild(style);
