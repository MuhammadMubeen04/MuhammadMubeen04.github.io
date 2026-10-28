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
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#F2EEE5' : '#0D1110');
  }
  applyTheme(root.getAttribute('data-theme') || 'light');

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

  // "Scrolled" state via a sentinel, no scroll handler
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
  /* Hero visibility: back-to-top button                                 */
  /* ------------------------------------------------------------------ */
  var toTop = $('#toTop');
  var heroVisible = true;
  var dialogsOpen = 0;
  var hero = $('#home');
  if (hasIO && hero) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      if (toTop) toTop.classList.toggle('show', !heroVisible);
    }, { threshold: 0 }).observe(hero);
  }
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
  /* Pointer: highlight that follows the cursor on glass cards           */
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
  var state = { group: 'all', tool: '', search: '', limit: 0 };
  var searchInput = $('#projectSearch');

  function pageSize() { return mobileMQ.matches ? 6 : 9; }
  state.limit = pageSize();

  function cardMatches(c) {
    var okGroup = state.group === 'all' || c.getAttribute('data-groups').split(' ').indexOf(state.group) > -1;
    var okTool = !state.tool || c.getAttribute('data-tools').split('|').indexOf(state.tool) > -1;
    var okSearch = !state.search || (c._hay || (c._hay = c.textContent.toLowerCase())).indexOf(state.search) > -1;
    return okGroup && okTool && okSearch;
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
  if (resetBtn) resetBtn.addEventListener('click', function () { state.group = 'all'; state.tool = ''; state.search = ''; if (searchInput) searchInput.value = ''; resetPaging(); renderProjects(); });
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
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value.trim().toLowerCase();
      resetPaging();
      renderProjects();
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchInput.value) { e.stopPropagation(); searchInput.value = ''; state.search = ''; resetPaging(); renderProjects(); }
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
  }
  function onDialogClosed() {
    dialogsOpen = Math.max(0, dialogsOpen - 1);
    if (!dialogsOpen) root.classList.remove('modal-open');
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
    $('#modalTools').innerHTML = (p.tools || []).map(function (t) { return '<button type="button" class="chip chip-btn" data-tool="' + esc(t) + '" title="Show every project that uses ' + esc(t) + '">' + esc(t) + '</button>'; }).join('');
    var gh = $('#modalGithub');
    if (p.github) { gh.hidden = false; gh.href = p.github; } else { gh.hidden = true; gh.removeAttribute('href'); }
    $('#modalCount').textContent = (i + 1) + ' / ' + DATA.length;
    $('.modal-body', modal).scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', '#project-' + p.slug);
  }
  function openProject(i, opener) {
    if (!modal || !DATA[i]) return;
    if (!modal.open) lastFocus = opener || doc.activeElement;
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
        var body = msg + '\n\n' + name + ' (' + from + ')';
        win.location.href = 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      };
      if (!endpoint) { openMail(); toast('Opening your email app…'); return; }
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      var payload = { name: name, email: from, message: msg };
      var accessKey = form.getAttribute('data-access-key');
      if (accessKey) { payload.access_key = accessKey; payload.subject = 'Portfolio message from ' + name; }
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('bad status'); form.reset(); toast('Message sent. Thank you!'); if (note) note.textContent = 'Sent. I will reply as soon as I can.'; })
        .catch(function () { toast('Could not send. Opening your email app instead'); openMail(); })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Services -> contact: prefill the message with the chosen service    */
  /* ------------------------------------------------------------------ */
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var msg = $('#cf-msg');
      if (!msg) return;
      if (!msg.value.trim()) msg.value = "Hi Mubeen, I'd like to talk about: " + a.getAttribute('data-service') + '.';
      setTimeout(function () { msg.focus({ preventScroll: true }); }, reduceMotion ? 120 : 1100);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Search / command palette (Ctrl or Cmd + K)                          */
  /* ------------------------------------------------------------------ */
  var palette = $('#palette');
  if (palette) {
    var pInput = $('#paletteInput');
    var pList = $('#paletteList');
    var pEmpty = $('#paletteEmpty');
    var pAll = null, pShown = [], pIndex = 0, pOpener = null, pPending = null;
    var SECTIONS = [['home', 'Home'], ['about', 'About me'], ['skills', 'Skills'], ['projects', 'Projects'], ['services', 'Services'],
                    ['experience', 'Experience'], ['education', 'Education'], ['certificates', 'Certificates'], ['contact', 'Contact']];

    var socialHref = function (label) { var a = $('.hero-socials a[aria-label="' + label + '"]'); return a ? a.href : ''; };
    var openLink = function (url) { return function () { if (url) win.open(url, '_blank', 'noopener'); }; };

    var buildPalette = function () {
      pAll = [];
      SECTIONS.forEach(function (s) {
        pAll.push({ group: 'Go to', label: s[1], hint: 'Section', keys: s[1] + ' ' + s[0], run: function () { scrollToId(s[0]); } });
      });
      [
        ['Switch light / dark theme', 'Action', 'theme dark light mode', function () { if (themeBtn) themeBtn.click(); }],
        ['Download resume', 'Action', 'resume cv download pdf', function () { var a = $('.hero-actions a[download]'); if (a) a.click(); }],
        ['Email me', 'Action', 'email mail contact', function () { win.location.href = 'mailto:' + (form ? form.getAttribute('data-to') : ''); }],
        ['Copy email address', 'Action', 'copy email', function () { if (copyBtn) copyBtn.click(); }],
        ['Open GitHub', 'Link', 'github code repositories', openLink(socialHref('GitHub'))],
        ['Open LinkedIn', 'Link', 'linkedin profile', openLink(socialHref('LinkedIn'))],
        ['Open Fiverr', 'Link', 'fiverr freelance gigs', openLink(socialHref('Fiverr'))]
      ].forEach(function (a) { pAll.push({ group: 'Actions', label: a[0], hint: a[1], keys: a[2], run: a[3] }); });
      DATA.forEach(function (p, i) {
        pAll.push({
          group: 'Projects', label: p.title, hint: p.category,
          keys: [p.category, p.badge, (p.tools || []).join(' '), (p.groups || []).join(' ')].join(' '),
          run: function () { openProject(i, pOpener); }
        });
      });
    };

    var filterPalette = function (q) {
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      pShown = [];
      pAll.forEach(function (it, order) {
        var hay = (it.label + ' ' + it.keys).toLowerCase();
        for (var w = 0; w < words.length; w++) if (hay.indexOf(words[w]) === -1) return;
        var score = 0;
        if (words.length) {
          var lab = it.label.toLowerCase();
          score = lab.indexOf(words[0]) === 0 ? 2 : lab.indexOf(words[0]) > -1 ? 1 : 0;
        }
        pShown.push({ it: it, score: score, order: order });
      });
      if (words.length) pShown.sort(function (a, b) { return b.score - a.score || a.order - b.order; });
      pShown = pShown.slice(0, 40).map(function (x) { return x.it; });
      pIndex = 0;
      renderPalette(words.length > 0);
    };

    var renderPalette = function (flat) {
      var html = '', last = '';
      pShown.forEach(function (it, i) {
        if (!flat && it.group !== last) { html += '<li class="palette-group" role="presentation">' + esc(it.group) + '</li>'; last = it.group; }
        html += '<li class="palette-item" role="option" id="pi-' + i + '" data-i="' + i + '" aria-selected="' + (i === pIndex) + '"><span>' + esc(it.label) + '</span><small>' + esc(it.hint) + '</small></li>';
      });
      pList.innerHTML = html;
      pEmpty.hidden = pShown.length > 0;
      pList.hidden = pShown.length === 0;
      pInput.setAttribute('aria-activedescendant', pShown.length ? 'pi-' + pIndex : '');
    };

    var moveSel = function (to) {
      if (!pShown.length) return;
      pIndex = (to + pShown.length) % pShown.length;
      $$('.palette-item', pList).forEach(function (el, i) { el.setAttribute('aria-selected', String(i === pIndex)); });
      var cur = $('#pi-' + pIndex);
      if (cur) cur.scrollIntoView({ block: 'nearest' });
      pInput.setAttribute('aria-activedescendant', 'pi-' + pIndex);
    };

    var choose = function (i) {
      var it = pShown[i];
      if (!it) return;
      pPending = it.run;
      palette.close();
    };

    var openPalette = function () {
      if (palette.open || $('dialog[open]')) return;
      pOpener = doc.activeElement;
      if (!pAll) buildPalette();
      pInput.value = '';
      filterPalette('');
      openDialog(palette);
      pInput.focus();
    };

    palette.addEventListener('close', function () {
      var run = pPending; pPending = null;
      if (run) setTimeout(run, 60);                 // run once the dialog has fully closed (scroll lock released)
    });
    pInput.addEventListener('input', function () { filterPalette(pInput.value); });
    pInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(pIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(pIndex - 1); }
      else if (e.key === 'Home') { e.preventDefault(); moveSel(0); }
      else if (e.key === 'End') { e.preventDefault(); moveSel(pShown.length - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(pIndex); }
    });
    pList.addEventListener('click', function (e) {
      var li = e.target.closest('.palette-item');
      if (li) choose(parseInt(li.getAttribute('data-i'), 10));
    });
    pList.addEventListener('pointermove', function (e) {
      var li = e.target.closest('.palette-item');
      if (li) { var i = parseInt(li.getAttribute('data-i'), 10); if (i !== pIndex) moveSel(i); }
    });

    doc.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (palette.open) palette.close(); else openPalette();
      }
    });
    var searchBtn = $('#searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', openPalette);
  }

  /* ------------------------------------------------------------------ */
  /* GitHub activity card (public API, cached; hidden if unavailable)    */
  /* ------------------------------------------------------------------ */
  var ghCard = $('#ghCard');
  if (ghCard && hasIO && win.fetch) {
    var ghUser = ghCard.getAttribute('data-user');
    var GH_KEY = 'portfolio-gh', GH_TTL = 30 * 60 * 1000;

    var timeAgo = function (iso) {
      var s = (Date.parse(iso) - Date.now()) / 1000;
      var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
      var rtf = win.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }) : null;
      for (var i = 0; i < units.length; i++) {
        if (Math.abs(s) >= units[i][1]) {
          var v = Math.round(s / units[i][1]);
          return rtf ? rtf.format(v, units[i][0]) : Math.abs(v) + ' ' + units[i][0] + 's ago';
        }
      }
      return 'just now';
    };

    var paintGh = function (d) {
      $('#ghRepos').textContent = d.repos;
      $('#ghFollowers').textContent = d.followers;
      var ul = $('#ghList');
      ul.innerHTML = '';
      d.list.forEach(function (r) {
        if (!/^https:\/\/github\.com\//.test(r.url)) return;
        var li = doc.createElement('li');
        var a = doc.createElement('a');
        a.className = 'gh-repo'; a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        var name = doc.createElement('span'); name.className = 'gh-repo-name'; name.textContent = r.name;
        var when = doc.createElement('span'); when.className = 'gh-when'; when.textContent = 'Updated ' + timeAgo(r.pushed);
        var meta = doc.createElement('span'); meta.className = 'gh-repo-meta';
        if (r.lang) { var l = doc.createElement('span'); var dot = doc.createElement('i'); l.appendChild(dot); l.appendChild(doc.createTextNode(r.lang)); meta.appendChild(l); }
        if (r.stars) { var st = doc.createElement('span'); st.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><use href="#i-star"/></svg>'; st.appendChild(doc.createTextNode(String(r.stars))); meta.appendChild(st); }
        a.appendChild(name); a.appendChild(when); if (meta.childNodes.length) a.appendChild(meta);
        li.appendChild(a); ul.appendChild(li);
      });
      ghCard.hidden = false;
    };

    var loadGh = function () {
      var cached = null;
      try { cached = JSON.parse(store.get(GH_KEY) || 'null'); } catch (e) { cached = null; }
      if (cached && Date.now() - cached.t < GH_TTL) { paintGh(cached.d); return; }
      var base = 'https://api.github.com/users/' + encodeURIComponent(ghUser);
      Promise.all([fetch(base), fetch(base + '/repos?sort=pushed&per_page=12')])
        .then(function (rs) {
          if (!rs[0].ok || !rs[1].ok) throw new Error('github unavailable');
          return Promise.all([rs[0].json(), rs[1].json()]);
        })
        .then(function (res) {
          var d = {
            repos: res[0].public_repos, followers: res[0].followers,
            list: res[1].filter(function (r) { return !r.fork; }).slice(0, 3).map(function (r) {
              return { name: r.name, url: r.html_url, lang: r.language, stars: r.stargazers_count, pushed: r.pushed_at };
            })
          };
          store.set(GH_KEY, JSON.stringify({ t: Date.now(), d: d }));
          paintGh(d);
        })
        .catch(function () { if (cached) paintGh(cached.d); });   // offline / rate-limited: show last known data, else stay hidden
    };

    var aboutSec = $('#about');
    if (aboutSec) {
      var ghIO = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { ghIO.disconnect(); loadGh(); }
      }, { rootMargin: '700px 0px' });
      ghIO.observe(aboutSec);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Visitor stats (GoatCounter), off until an address is set in <meta> */
  /* ------------------------------------------------------------------ */
  var statsMeta = $('meta[name="stats-endpoint"]');
  var statsUrl = statsMeta ? (statsMeta.getAttribute('content') || '').trim() : '';
  if (/^https:\/\/[^\s"'<>]+$/.test(statsUrl) && /^https?:$/.test(location.protocol) &&
      !/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && navigator.doNotTrack !== '1') {
    var gs = doc.createElement('script');
    gs.async = true;
    gs.src = 'https://gc.zgo.at/count.js';
    gs.setAttribute('data-goatcounter', statsUrl);
    doc.head.appendChild(gs);
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
  /* ------------------------------------------------------------------ */
  /* Small helpers that connect sections                                  */
  /* ------------------------------------------------------------------ */
  var copyText = function (text, message) {
    var done = function () { toast(message); };
    var fallback = function () {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy'); done(); } catch (err) { toast(text); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  };

  var filterByTool = function (tool) {
    state.tool = tool; state.group = 'all'; state.search = '';
    if (searchInput) searchInput.value = '';
    resetPaging();
    renderProjects();
    scrollToId('projects', false);
  };

  /* Skills that match a project tool become filters, with the real project count */
  var toolCounts = {};
  DATA.forEach(function (p) { (p.tools || []).forEach(function (t) { toolCounts[t] = (toolCounts[t] || 0) + 1; }); });
  $$('.stack-row dd span').forEach(function (sp) {
    var name = sp.textContent.trim();
    if (!toolCounts[name]) return;
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'tool-link'; b.setAttribute('data-tool', name);
    b.setAttribute('aria-label', name + ': used in ' + toolCounts[name] + ' projects. Show them.');
    b.appendChild(doc.createTextNode(name));
    var sup = doc.createElement('sup'); sup.textContent = String(toolCounts[name]); b.appendChild(sup);
    sp.textContent = ''; sp.appendChild(b);
  });
  var stackEl = $('.stack');
  if (stackEl) stackEl.addEventListener('click', function (e) {
    var b = e.target.closest('.tool-link');
    if (b) filterByTool(b.getAttribute('data-tool'));
  });

  /* Tools in the project dialog are filters too */
  var modalTools = $('#modalTools');
  if (modalTools && modal) modalTools.addEventListener('click', function (e) {
    var b = e.target.closest('.chip-btn');
    if (!b) return;
    var tool = b.getAttribute('data-tool');
    modal.close();
    setTimeout(function () { filterByTool(tool); }, 80);
  });

  /* Copy the link to the open project */
  var shareBtn = $('#modalShare');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    var p = DATA[modalIndex];
    if (!p) return;
    var url = win.location.href.split('#')[0] + '#project-' + p.slug;
    if (navigator.share && win.matchMedia('(pointer: coarse)').matches) {
      navigator.share({ title: p.title, url: url }).catch(function () { /* cancelled */ });
    } else copyText(url, 'Link to this project copied');
  });

  /* One tap copies a certificate or student ID */
  $$('.cert-meta li').forEach(function (li) {
    var label = li.querySelector('strong');
    if (!label || !/(Certificate|Student) ID/.test(label.textContent)) return;
    var value = li.textContent.replace(label.textContent, '').trim();
    if (!value) return;
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'copy-id'; b.textContent = value;
    b.title = 'Copy ID'; b.setAttribute('aria-label', 'Copy ' + label.textContent.replace(':', '') + ' ' + value);
    b.addEventListener('click', function () { copyText(value, 'ID copied'); });
    li.textContent = '';
    li.appendChild(label); li.appendChild(doc.createTextNode(' ')); li.appendChild(b);
  });

  /* Section counters ("18 projects") count the real elements on the page */
  $$('[data-count]').forEach(function (el) {
    var n = $$(el.getAttribute('data-count')).length;
    if (n) el.textContent = n + ' ' + el.getAttribute('data-label');
  });

  /* "Example: ..." links in Services open that project's dialog */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-open-project]');
    if (!a) return;
    e.preventDefault();
    var slug = a.getAttribute('data-open-project');
    for (var i = 0; i < DATA.length; i++) {
      if (DATA[i].slug === slug) { openProject(i, a); return; }
    }
  });

  /* ------------------------------------------------------------------ */
  /* Offline support (needs https or localhost)                          */
  /* ------------------------------------------------------------------ */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    win.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* optional */ }); });
  }
})();
