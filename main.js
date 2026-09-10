/**
 * Mubeen Salman — Portfolio
 * Refined interactions: theme, scroll, tilt, ripple, smooth nav
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  var themeToggle = document.getElementById('themeToggle');
  function getPreferredTheme() {
    var stored = localStorage.getItem('portfolio-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#070b14');
  }
  setTheme(getPreferredTheme());
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* Solid scroll progress (single color) */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
    });
    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Navbar */
  var navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 16);
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* Active section */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  function setActiveNav() {
    var current = '';
    var scrollY = window.scrollY;
    sections.forEach(function (section) {
      if (scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  /* Stagger */
  function applyStagger(selector) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add('d' + ((i % 10) + 1));
    });
  }
  applyStagger('.projects-grid .project-card');
  applyStagger('.skills-grid .skill-card');
  applyStagger('.timeline-items .timeline-item');
  applyStagger('.edu-list .edu-card');
  document.querySelectorAll('.section-header').forEach(function (el) {
    el.classList.add('reveal');
  });

  /* Reveal */
  var revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(function (el) { io.observe(el); });
  } else {
    function revealOnScroll() {
      var h = window.innerHeight;
      revealElements.forEach(function (el) {
        if (el.getBoundingClientRect().top < h - 60) el.classList.add('visible');
      });
    }
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();
  }

  /* Pointer spotlight + light tilt on cards */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cards = document.querySelectorAll('.skill-card, .project-card, .exp-card, .edu-card, .facts-card');
  cards.forEach(function (card) {
    card.classList.add('tilt-card');
    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (reduceMotion || !canHover) return;
      var rx = ((y / rect.height) - 0.5) * -6;
      var ry = ((x / rect.width) - 0.5) * 6;
      card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px) scale(1.015)';
    });
    card.addEventListener('pointerleave', function () {
      card.style.transform = '';
    });
  });

  /* Ripple */
  document.querySelectorAll('.btn, .theme-toggle, .nav-cta').forEach(function (btn) {
    btn.classList.add('ripple');
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.2;
      var span = document.createElement('span');
      span.className = 'ripple-effect';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 600);
    });
  });

  /* About paragraphs + timeline line */
  var aboutText = document.querySelector('.about-text');
  if (aboutText && 'IntersectionObserver' in window) {
    var aboutIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          aboutIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    aboutIo.observe(aboutText);
  }
  var timeline = document.querySelector('.timeline');
  if (timeline && 'IntersectionObserver' in window) {
    var tlIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          tlIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    tlIo.observe(timeline);
  }

  /* Footer in view */
  var footer = document.querySelector('.footer');
  if (footer && 'IntersectionObserver' in window) {
    var footIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          footIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    footIo.observe(footer);
  }

  /* Smooth anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
