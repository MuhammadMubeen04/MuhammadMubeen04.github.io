/**
 * Mubeen Salman — Portfolio
 *
 * Performance notes
 *  - No scroll listeners that read layout. Everything scroll-driven (navbar state,
 *    scroll-spy, reveals, back-to-top, orb pausing) uses IntersectionObserver.
 *  - Pointer effects run through ONE delegated, rAF-throttled handler.
 *  - A tiny frame-rate probe lowers the effects tier on slow devices (see "Performance tier").
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var win = window;

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  var store = {
    get: function (k) { try { return win.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { win.localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del: function (k) { try { win.localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  };

  var reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = win.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in win;

  /* ------------------------------------------------------------------ */
  /* Performance tier                                                    */
  /* ------------------------------------------------------------------ */
  var TIERS = ['low', 'mid', 'high'];
  function getTier() { return root.getAttribute('data-tier') || 'mid'; }
  function setTier(t) { root.setAttribute('data-tier', t); }

  // Frame-rate probe: sample rAF intervals; if the device is struggling, step the tier down once.
  var probeLocked = !!(new URLSearchParams(win.location.search).get('tier'));
  function sampleFrames(count, done) {
    var last = 0, n = 0, sum = 0, slow = 0;
    function tick(t) {
      if (doc.hidden) { last = 0; requestAnimationFrame(tick); return; }
      if (last) {
        var dt = t - last;
        if (dt < 250) { sum += dt; n++; if (dt > 34) slow++; }
      }
      last = t;
      if (n >= count) done(sum / n, slow / n); else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function stepDown(avg, slowRatio) {
    if (probeLocked) return;
    if (avg > 26 || slowRatio > 0.3) {
      var i = TIERS.indexOf(getTier());
      if (i > 0) {
        setTier(TIERS[i - 1]);
        store.set('portfolio-tier', TIERS[i - 1]);
        store.set('portfolio-tier-ts', String(Date.now()));
      }
    }
  }
  win.addEventListener('load', function () {
    setTimeout(function () { sampleFrames(80, stepDown); }, 2400);
  });
  var scrollProbed = false;
  win.addEventListener('scroll', function onFirstScroll() {
    if (scrollProbed) return;
    scrollProbed = true;
    win.removeEventListener('scroll', onFirstScroll);
    sampleFrames(60, stepDown);
  }, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Toast                                                               */
  /* ------------------------------------------------------------------ */
  var toastEl = $('#toast');
  var toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  /* ------------------------------------------------------------------ */
  /* Theme (with circular reveal where View Transitions are available)   */
  /* ------------------------------------------------------------------ */
  var themeBtn = $('#themeToggle');
  var metaTheme = $('meta[name="theme-color"]');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#f4f6fb' : '#070b14');
  }
  applyTheme(root.getAttribute('data-theme') || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function (e) {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      store.set('portfolio-theme', next);
      var swap = function () { applyTheme(next); };
      if (doc.startViewTransition && !reduceMotion && getTier() !== 'low') {
        var rect = themeBtn.getBoundingClientRect();
        var x = e.clientX || rect.left + rect.width / 2;
        var y = e.clientY || rect.top + rect.height / 2;
        var r = Math.hypot(Math.max(x, win.innerWidth - x), Math.max(y, win.innerHeight - y));
        var vt = doc.startViewTransition(swap);
        vt.ready.then(function () {
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
          );
        }).catch(function () { /* transition skipped */ });
      } else {
        swap();
      }
    });
  }
  var schemeMQ = win.matchMedia('(prefers-color-scheme: light)');
  var onScheme = function (e) {
    var saved = store.get('portfolio-theme');
    if (saved !== 'light' && saved !== 'dark') applyTheme(e.matches ? 'light' : 'dark');
  };
  if (schemeMQ.addEventListener) schemeMQ.addEventListener('change', onScheme);

  /* ------------------------------------------------------------------ */
  /* Navigation: scrolled state, mobile menu, scroll-spy, liquid pill    */
  /* ------------------------------------------------------------------ */
  var navbar = $('#navbar');
  var menuBtn = $('#menuBtn');
  var mobileMenu = $('#mobileMenu');
  var navLinksWrap = $('#navLinks');
  var indicator = $('#navIndicator');
  var navLinks = $$('.nav-link');
  var mobileLinks = $$('.mobile-link');
  var currentId = '';

  // "Scrolled" state via a sentinel — no scroll handler
  var sentinel = doc.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
  doc.body.appendChild(sentinel);
  if (hasIO && navbar) {
    new IntersectionObserver(function (entries) {
      navbar.classList.toggle('scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!mobileMenu.classList.contains('open')); });
    doc.addEventListener('pointerdown', function (e) {
      if (mobileMenu.classList.contains('open') && !e.target.closest('.nav-shell')) setMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    win.matchMedia('(min-width: 64rem)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  var indicatorPlaced = false;
  function moveIndicator(link) {
    if (!indicator || !navLinksWrap) return;
    if (!link || !link.offsetWidth) { indicator.classList.remove('ready'); return; }
    var first = !indicatorPlaced;
    if (first) indicator.style.transition = 'none';
    indicator.style.setProperty('--ix', link.offsetLeft + 'px');
    indicator.style.setProperty('--iw', link.offsetWidth + 'px');
    indicator.classList.add('ready');
    if (first) {
      void indicator.offsetWidth;            // commit position without animating from 0
      indicator.style.transition = '';
      indicatorPlaced = true;
    }
  }
  function setActive(id) {
    if (id === currentId) return;
    currentId = id;
    var activeLink = null;
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) { a.setAttribute('aria-current', 'true'); activeLink = a; } else a.removeAttribute('aria-current');
    });
    mobileLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
    moveIndicator(activeLink);
  }
  function refreshIndicator() {
    var a = $('.nav-link.active');
    indicatorPlaced = false;
    moveIndicator(a);
  }
  win.addEventListener('resize', (function () {
    var t = 0;
    return function () { clearTimeout(t); t = setTimeout(refreshIndicator, 120); };
  })());
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refreshIndicator);

  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id === 'home' ? '' : en.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main > section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* Smooth in-page links. content-visibility can shift layout mid-scroll, so settle once after. */
  function scrollToId(id, push) {
    var el = doc.getElementById(id);
    if (!el) return;
    if (id === 'main') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (push !== false && win.history && history.replaceState) history.replaceState(null, '', '#' + id);
    setTimeout(function () {
      var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      if (Math.abs(el.getBoundingClientRect().top - pad) > 14) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, reduceMotion ? 60 : 950);
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || id.indexOf('project-') === 0 || !doc.getElementById(id)) return;
    e.preventDefault();
    setMenu(false);
    scrollToId(id);
  });

  /* Scroll progress: CSS scroll-timeline where supported, otherwise a cheap transform fallback */
  var progress = $('#progress');
  if (progress && !(win.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'))) {
    var progTick = false;
    var updateProgress = function () {
      progTick = false;
      var h = root.scrollHeight - root.clientHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, root.scrollTop / h) : 0) + ')';
    };
    win.addEventListener('scroll', function () {
      if (!progTick) { progTick = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();
  }

  /* ------------------------------------------------------------------ */
  /* Hero visibility: pause orbs off-screen, back-to-top button          */
  /* ------------------------------------------------------------------ */
  var toTop = $('#toTop');
  var heroVisible = true;
  var dialogsOpen = 0;
  var orbs = $$('.orb');
  function syncOrbs() {
    var pause = !heroVisible || dialogsOpen > 0 || doc.hidden;
    if (pause === root.classList.contains('orbs-paused')) return;
    if (pause) {
      // Freeze each orb where it currently is, then drop the animation entirely
      var pos = orbs.map(function (o) {
        var m = new DOMMatrix(getComputedStyle(o).transform);
        return [m.m41, m.m42];
      });
      orbs.forEach(function (o, i) {
        o.style.setProperty('--fx', pos[i][0].toFixed(1) + 'px');
        o.style.setProperty('--fy', pos[i][1].toFixed(1) + 'px');
      });
    }
    root.classList.toggle('orbs-paused', pause);
  }
  var hero = $('#home');
  if (hasIO && hero) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      if (toTop) toTop.classList.toggle('show', !heroVisible);
      syncOrbs();
    }, { threshold: 0 }).observe(hero);
  }
  doc.addEventListener('visibilitychange', syncOrbs);
  if (toTop) toTop.addEventListener('click', function () { scrollToId('home'); });

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                       */
  /* ------------------------------------------------------------------ */
  var revealEls = $$('[data-reveal]');
  if (hasIO && !reduceMotion) {
    root.classList.add('reveal-on');
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
    win.addEventListener('beforeprint', function () { revealEls.forEach(function (el) { el.classList.add('is-in'); }); });
  }

  /* ------------------------------------------------------------------ */
  /* Pointer: spotlight on glass cards, gentle tilt on the hero card     */
  /* ------------------------------------------------------------------ */
  if (finePointer) {
    var spotEl = null, spotX = 0, spotY = 0, spotRaf = 0;
    doc.addEventListener('pointermove', function (e) {
      if (getTier() === 'low') return;
      var t = e.target.closest && e.target.closest('[data-spot]');
      spotEl = t; spotX = e.clientX; spotY = e.clientY;
      if (t && !spotRaf) {
        spotRaf = requestAnimationFrame(function () {
          spotRaf = 0;
          if (!spotEl) return;
          var r = spotEl.getBoundingClientRect();
          spotEl.style.setProperty('--mx', (spotX - r.left) + 'px');
          spotEl.style.setProperty('--my', (spotY - r.top) + 'px');
        });
      }
    }, { passive: true });

    var card = $('.hero-card');
    if (card && !reduceMotion) {
      var cr = null, tiltRaf = 0, tx = 0, ty = 0;
      card.addEventListener('pointerenter', function () { cr = card.getBoundingClientRect(); });
      card.addEventListener('pointermove', function (e) {
        if (getTier() !== 'high' || !cr) return;
        tx = (e.clientX - cr.left) / cr.width - 0.5;
        ty = (e.clientY - cr.top) / cr.height - 0.5;
        if (!tiltRaf) {
          tiltRaf = requestAnimationFrame(function () {
            tiltRaf = 0;
            card.style.transform = 'perspective(900px) rotateX(' + (-ty * 5).toFixed(2) + 'deg) rotateY(' + (tx * 5).toFixed(2) + 'deg)';
          });
        }
      }, { passive: true });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Projects: filters, tool filter, show more                           */
  /* ------------------------------------------------------------------ */
  var DATA = win.PROJECTS || [];
  var grid = $('#projectsGrid');
  var cards = grid ? $$('.project-card', grid) : [];
  var filterBtns = $$('.filter[data-filter]');
  var showMore = $('#showMore');
  var countEl = $('#projectsCount');
  var emptyEl = $('#projectsEmpty');
  var toolPill = $('#toolPill');
  var toolPillLabel = $('#toolPillLabel');
  var heroRows = $$('.hc-row');
  var mobileMQ = win.matchMedia('(max-width: 43.69rem)');
  var state = { group: 'all', tool: '', limit: 0 };

  function pageSize() { return mobileMQ.matches ? 6 : 9; }
  state.limit = pageSize();

  function cardMatches(c) {
    var okGroup = state.group === 'all' || c.getAttribute('data-groups').split(' ').indexOf(state.group) > -1;
    var okTool = !state.tool || c.getAttribute('data-tools').split('|').indexOf(state.tool) > -1;
    return okGroup && okTool;
  }
  function renderProjects() {
    if (!cards.length) return;
    var shown = 0, total = 0;
    cards.forEach(function (c) {
      var m = cardMatches(c);
      if (m) total++;
      var vis = m && shown < state.limit;
      if (vis) shown++;
      c.classList.toggle('is-hidden', !vis);
    });
    if (countEl) {
      countEl.textContent = total === cards.length && shown === total
        ? 'All ' + total + ' projects'
        : 'Showing ' + shown + ' of ' + total + ' project' + (total === 1 ? '' : 's');
    }
    if (showMore) {
      showMore.hidden = shown >= total;
      showMore.textContent = 'Show ' + Math.min(pageSize(), total - shown) + ' more';
    }
    if (emptyEl) emptyEl.hidden = total > 0;
    if (toolPill) {
      toolPill.hidden = !state.tool;
      if (state.tool) toolPillLabel.textContent = 'Tool: ' + state.tool;
    }
    filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === state.group)); });
    heroRows.forEach(function (r) { r.setAttribute('aria-pressed', String(r.getAttribute('data-tool') === state.tool)); });
  }
  function resetPaging() { state.limit = pageSize(); }

  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      state.group = b.getAttribute('data-filter');
      resetPaging();
      renderProjects();
    });
  });
  heroRows.forEach(function (r) {
    r.addEventListener('click', function () {
      var tool = r.getAttribute('data-tool');
      state.tool = state.tool === tool ? '' : tool;
      state.group = 'all';
      resetPaging();
      renderProjects();
      if (state.tool) scrollToId('projects', false);
    });
  });
  var clearTool = $('#toolPillClear');
  if (clearTool) clearTool.addEventListener('click', function () { state.tool = ''; resetPaging(); renderProjects(); });
  var resetBtn = $('#resetFilters');
  if (resetBtn) resetBtn.addEventListener('click', function () { state.group = 'all'; state.tool = ''; resetPaging(); renderProjects(); });
  if (showMore) {
    showMore.addEventListener('click', function () {
      var before = cards.filter(function (c) { return !c.classList.contains('is-hidden'); }).length;
      state.limit += pageSize();
      renderProjects();
      var vis = cards.filter(function (c) { return !c.classList.contains('is-hidden'); });
      var next = vis[before];
      if (next) { var b = $('.project-detail-btn', next); if (b) b.focus({ preventScroll: true }); }
    });
  }
  renderProjects();

  /* ------------------------------------------------------------------ */
  /* Dialogs                                                             */
  /* ------------------------------------------------------------------ */
  function openDialog(d) {
    if (d.open) return;
    d.showModal();
    dialogsOpen++;
    root.classList.add('modal-open');
    syncOrbs();
  }
  function onDialogClosed() {
    dialogsOpen = Math.max(0, dialogsOpen - 1);
    if (!dialogsOpen) root.classList.remove('modal-open');
    syncOrbs();
  }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', onDialogClosed);
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
  });

  /* Project details */
  var modal = $('#projectModal');
  var modalIndex = -1;
  var lastFocus = null;
  function clearProjectHash() {
    if (/^#project-/.test(win.location.hash) && history.replaceState) {
      history.replaceState(null, '', win.location.pathname + win.location.search);
    }
  }
  function fillProject(i) {
    var p = DATA[i];
    if (!p) return;
    modalIndex = i;
    $('#modalTitle').textContent = p.title;
    $('#modalDesc').textContent = p.desc;
    $('#modalBadges').innerHTML = '<span class="badge">' + esc(p.badge) + '</span><span class="badge badge-soft">' + esc(p.category) + '</span>';
    $('#modalHighlights').innerHTML = (p.highlights || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');
    $('#modalTools').innerHTML = (p.tools || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
    var gh = $('#modalGithub');
    if (p.github) { gh.hidden = false; gh.href = p.github; } else { gh.hidden = true; gh.removeAttribute('href'); }
    $('#modalCount').textContent = (i + 1) + ' / ' + DATA.length;
    $('.modal-body', modal).scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', '#project-' + p.slug);
  }
  function openProject(i) {
    if (!modal || !DATA[i]) return;
    if (!modal.open) lastFocus = doc.activeElement;
    fillProject(i);
    openDialog(modal);
  }
  if (modal) {
    modal.addEventListener('close', function () {
      clearProjectHash();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    });
    $('#modalPrev').addEventListener('click', function () { fillProject((modalIndex - 1 + DATA.length) % DATA.length); });
    $('#modalNext').addEventListener('click', function () { fillProject((modalIndex + 1) % DATA.length); });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); fillProject((modalIndex - 1 + DATA.length) % DATA.length); }
      if (e.key === 'ArrowRight') { e.preventDefault(); fillProject((modalIndex + 1) % DATA.length); }
    });
  }
  if (grid) {
    grid.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var card = e.target.closest('.project-card');
      if (card) openProject(parseInt(card.getAttribute('data-project'), 10));
    });
  }
  function openFromHash() {
    var m = /^#project-(.+)$/.exec(win.location.hash);
    if (!m) return;
    for (var i = 0; i < DATA.length; i++) {
      if (DATA[i].slug === m[1]) { openProject(i); return; }
    }
  }
  win.addEventListener('hashchange', function () { if (modal && !modal.open) openFromHash(); });
  openFromHash();

  /* Certificate viewer */
  var lightbox = $('#lightbox');
  $$('[data-lightbox]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!lightbox || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      var img = $('#lightboxImg');
      img.src = a.getAttribute('data-lightbox');
      img.alt = a.getAttribute('data-caption') || 'Certificate';
      $('#lightboxCaption').textContent = a.getAttribute('data-caption') || '';
      var dl = $('#lightboxDownload');
      dl.href = a.getAttribute('data-download');
      dl.setAttribute('download', a.getAttribute('data-download-name') || '');
      openDialog(lightbox);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Contact                                                             */
  /* ------------------------------------------------------------------ */
  var copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var done = function () { toast('Email copied to clipboard'); };
      var fallback = function () {
        var ta = doc.createElement('textarea');
        ta.value = email; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        doc.body.appendChild(ta); ta.select();
        try { doc.execCommand('copy'); done(); } catch (err) { toast(email); }
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, fallback);
      else fallback();
    });
  }

  var form = $('#contactForm');
  if (form) {
    var note = $('#formNote');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      if (data.get('company')) return;               // honeypot
      var name = String(data.get('name')).trim();
      var from = String(data.get('email')).trim();
      var msg = String(data.get('message')).trim();
      var endpoint = form.getAttribute('data-endpoint');
      var openMail = function () {
        var subject = 'Portfolio message from ' + name;
        var body = msg + '\n\n— ' + name + ' (' + from + ')';
        win.location.href = 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      };
      if (!endpoint) { openMail(); toast('Opening your email app…'); return; }
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: name, email: from, message: msg }) })
        .then(function (r) { if (!r.ok) throw new Error('bad status'); form.reset(); toast('Message sent — thank you!'); if (note) note.textContent = 'Sent. I will reply as soon as I can.'; })
        .catch(function () { toast('Could not send — opening your email app instead'); openMail(); })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Small touches                                                       */
  /* ------------------------------------------------------------------ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mark an experience as current when today falls inside its date range
  var now = new Date();
  $$('.timeline-item[data-start][data-end]').forEach(function (it) {
    var s = it.getAttribute('data-start').split('-'), e = it.getAttribute('data-end').split('-');
    var start = new Date(+s[0], +s[1] - 1, 1);
    var end = new Date(+e[0], +e[1], 0, 23, 59, 59);
    if (now >= start && now <= end) {
      it.classList.add('current');
      var d = $('.exp-date', it);
      if (d) d.insertAdjacentHTML('afterbegin', '<span class="now-pill">Current</span>');
    }
  });

  /* ------------------------------------------------------------------ */
  /* Offline support (needs https or localhost)                          */
  /* ------------------------------------------------------------------ */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    win.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* optional */ }); });
  }
})();
