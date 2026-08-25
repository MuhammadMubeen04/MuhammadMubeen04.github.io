/**
 * Mubeen Salman — Portfolio Scripts
 * Theme toggle + nav + reveal
 */

(function () {
  'use strict';

  // ---------- Theme (light / dark) ----------
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem('portfolio-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#070b14');
    }
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

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

  // ---------- Navbar scroll ----------
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ---------- Active nav link ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActiveNav() {
    let current = '';
    const scrollY = window.scrollY;
    sections.forEach(function (section) {
      if (scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  // ---------- Reveal on scroll ----------
  const revealElements = document.querySelectorAll('.reveal');
  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(function (el) {
      if (el.getBoundingClientRect().top < windowHeight - 80) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  window.addEventListener('load', revealOnScroll);
  revealOnScroll();
})();
