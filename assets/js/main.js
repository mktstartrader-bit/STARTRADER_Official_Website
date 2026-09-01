/* =============================================================
   STARTRADER — interactions & animations
   ============================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  // site root resolved from this script's own URL so runtime-built asset paths
  // stay valid when the site is served from a subfolder or opened from disk
  var ROOT = (function () {
    var s = document.currentScript, list, src;
    if (!s) { list = document.getElementsByTagName('script'); s = list[list.length - 1]; }
    src = (s && s.src) || '';
    var i = src.lastIndexOf('/assets/');
    return i > -1 ? src.slice(0, i + 1) : '';
  })();
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // touch devices get static backdrops: scrub/parallax effects cost frames there
  var COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = typeof window.ScrollTrigger !== 'undefined';
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasGSAP && hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  function initLenis() {
    // touch devices scroll best natively — Lenis's rAF loop fights the
    // platform scroller and reads as glitching on phones
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || coarse || typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.05, lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    if (hasGSAP && hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); });
    }
    // The refreshes ScrollTrigger runs on its own (resize, the deferred
    // load event) measured garbage while the page was scrolled, because
    // html carried scroll-behavior:smooth and its measuring scrolls came
    // back animated — that rule is now stood down in the stylesheet. What
    // remains here: after a resize settles, point Lenis at where the page
    // actually is (the browser adjusts native scroll on its own and Lenis
    // never learns of moves it did not make), then measure once more on
    // agreed ground.
    var rsT = null;
    window.addEventListener('resize', function () {
      clearTimeout(rsT);
      rsT = setTimeout(function () {
        if (!hasGSAP || !hasST) return;
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        ScrollTrigger.refresh();
      }, 220);
    });
  }

  function scrollToTarget(target, offset) {
    if (lenis) { lenis.scrollTo(target, { offset: offset || 0, duration: 1.1 }); }
    else if (typeof target === 'number') { window.scrollTo({ top: target, behavior: 'smooth' }); }
    else { var el = typeof target === 'string' ? document.querySelector(target) : target; if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  }

  /* ---------------- Live ticker ---------------- */
  var tickerData = [
    { sym: 'XAU/USD', price: '3,279.96', chg: '+1.18%', dir: 'up' },
    { sym: 'XAG/USD', price: '39.23', chg: '+2.11%', dir: 'up' },
    { sym: 'US500', price: '5,732.3', chg: '+0.90%', dir: 'up' },
    { sym: 'NAS100', price: '29,971.32', chg: '-0.62%', dir: 'down' },
    { sym: 'US30', price: '42,503', chg: '+0.76%', dir: 'up' },
    { sym: 'EUR/USD', price: '1.0842', chg: '+0.13%', dir: 'up' },
    { sym: 'BTC/USD', price: '64,230', chg: '+2.14%', dir: 'up' },
    { sym: 'USD/JPY', price: '156.82', chg: '+0.24%', dir: 'up' },
    { sym: 'GER40', price: '18,411', chg: '+0.34%', dir: 'up' },
    { sym: 'AAPL', price: '228.11', chg: '-0.21%', dir: 'down' }
  ];
  var heroPairs = [
    { c: 'EURCHF', n: 'Euro vs Swiss Franc', a: 'eu', b: 'ch', p: '0.92963', chg: -0.14, dir: 'down' },
    { c: 'EURAUD', n: 'Euro vs Australian Dollar', a: 'eu', b: 'au', p: '1.62889', chg: 0.31, dir: 'up' },
    { c: 'GBPCHF', n: 'Great Britain Pound vs Swiss Franc', a: 'gb', b: 'ch', p: '1.08842', chg: -0.09, dir: 'down' },
    { c: 'NZDCHF', n: 'New Zealand Dollar vs Swiss Franc', a: 'nz', b: 'ch', p: '0.47272', chg: 0.22, dir: 'up' },
    { c: 'GBPCAD', n: 'Great Britain Pound vs Canadian Dollar', a: 'gb', b: 'ca', p: '1.88057', chg: -0.18, dir: 'down' },
    { c: 'USDJPY', n: 'US Dollar vs Japanese Yen', a: 'us', b: 'jp', p: '163.562', chg: 0.24, dir: 'up' },
    { c: 'EURUSD', n: 'Euro vs US Dollar', a: 'eu', b: 'us', p: '1.08420', chg: 0.13, dir: 'up' },
    { c: 'GBPUSD', n: 'Great Britain Pound vs US Dollar', a: 'gb', b: 'us', p: '1.27180', chg: -0.11, dir: 'down' }
  ];
  function initHeroTicker() {
    var track = document.getElementById('heroTicker');
    if (!track) return;
    var diag = { up: 'M7 17 17 7M17 7H9M17 7v8', down: 'M7 7l10 10M17 17H9M17 17V9' };
    var html = heroPairs.map(function (m) {
      return '<a class="mkt-cell ' + m.dir + '" href="https://www.startrader.com/live-account/" data-c="' + m.c + '" aria-label="Trade ' + m.c + ' — ' + m.n + '">' +
        '<span class="mkt-cell-ic"><img src="' + ROOT + 'assets/img/flags/' + m.a + '.svg" alt="" loading="lazy"><img src="' + ROOT + 'assets/img/flags/' + m.b + '.svg" alt="" loading="lazy"></span>' +
        '<span class="mkt-cell-tx"><b>' + m.c + '</b>' +
          '<span class="mkt-cell-q"><em data-ht-px>' + m.p + '</em>' +
          '<i><span data-ht-chg>' + (m.chg >= 0 ? '+' : '') + m.chg.toFixed(2) + '%</span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + diag[m.dir] + '"/></svg></i></span>' +
        '</span>' +
        '<span class="mkt-cell-trade">Trade</span>' +
        '</a>';
    }).join('');
    track.innerHTML = html + html; // duplicate for seamless loop

    // live ticking across both marquee copies
    var live = {};
    heroPairs.forEach(function (m) {
      var dec = (m.p.split('.')[1] || '').length;
      live[m.c] = { base: parseFloat(m.p), cur: parseFloat(m.p), d: dec, chg0: m.chg };
    });
    if (!prefersReduced) {
      setInterval(function () {
        heroPairs.forEach(function (m) {
          if (Math.random() > 0.45) return;
          var st = live[m.c];
          var step = st.base * 0.0006 * (Math.random() * 2 - 1);
          st.cur = st.cur + step + (st.base - st.cur) * 0.06;
          var chg = st.chg0 + ((st.cur - st.base) / st.base) * 100;
          var ps = st.cur.toFixed(st.d);
          var cs = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
          var cells = track.querySelectorAll('[data-c="' + m.c + '"]');
          Array.prototype.forEach.call(cells, function (cell) {
            var pe = cell.querySelector('[data-ht-px]'), ce = cell.querySelector('[data-ht-chg]');
            if (pe) { pe.textContent = ps; pe.classList.remove('flash-up', 'flash-down'); void pe.offsetWidth; pe.classList.add(step >= 0 ? 'flash-up' : 'flash-down'); }
            if (ce) ce.textContent = cs;
          });
        });
      }, 1700);
    }

    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    var speed = 38; // px/s
    var tween = gsap.to(track, {
      x: -half, duration: half / speed, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { tween.timeScale(0.1); });
    track.addEventListener('mouseleave', function () { tween.timeScale(1); });
  }

  function buildTicker() {
    var track = document.getElementById('tickerTrack');
    if (!track) return;
    var html = tickerData.map(function (t) {
      var caret = t.dir === 'up' ? 'i-caret-up' : 'i-caret-down';
      return '<span class="ticker-item">' +
        '<span class="t-dot ' + t.dir + '"></span>' +
        '<span class="t-sym">' + t.sym + '</span>' +
        '<span class="t-price">' + t.price + '</span>' +
        '<span class="t-chg ' + t.dir + '"><svg><use href="#' + caret + '"/></svg>' + t.chg + '</span>' +
        '</span>';
    }).join('');
    track.innerHTML = html + html; // duplicate for seamless loop

    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    var speed = 55; // px/s
    var tween = gsap.to(track, {
      x: -half, duration: half / speed, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { tween.timeScale(0.15); });
    track.addEventListener('mouseleave', function () { tween.timeScale(1); });
  }

  /* ---------------- Header behaviour ---------------- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    var toTop = document.getElementById('toTop');
    var topbar = document.querySelector('.topbar');
    function setTopbarH() {
      if (topbar) document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
      if (hasST) ScrollTrigger.refresh();
    }
    setTopbarH();
    window.addEventListener('resize', setTopbarH);
    window.addEventListener('load', setTopbarH);
    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 24);
      if (toTop) toTop.classList.toggle('show', y > 760);
    }
    window.addEventListener('scroll', update, { passive: true });
    if (lenis) lenis.on('scroll', update);
    update();
    if (toTop) toTop.addEventListener('click', function () { scrollToTarget(0); });
  }

  /* ---------------- Mobile menu ---------------- */
  /* Rebuild the mobile menu from the page's own mega menu: every desktop
     sub-category becomes an accordion group (same links, same depth-correct
     hrefs), and the language grid becomes a chip switcher. The static links
     in the markup remain as the no-JS fallback. */
  /* Rebuild the mobile menu as a full sheet from the page's own mega menu:
     logo + close header, a search field that filters the links, every desktop
     sub-category as a drill group with depth-correct hrefs, pinned pill CTAs
     and a folded language switcher fed by the header's language grid. The
     static links in the markup remain as the no-JS fallback. */
  function buildMobileMenuV2(menu) {
    var nav = menu.querySelector('nav');
    var items = document.querySelectorAll('.nav-menu .nav-item');
    if (!nav || !items.length) return;
    var chevR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // header row: brand + close
    var head = document.createElement('div');
    head.className = 'mm-head-row';
    var brandImg = document.querySelector('.brand img');
    head.innerHTML = (brandImg ? '<img src="' + brandImg.getAttribute('src') + '" alt="STARTRADER" width="150" height="29">' : '<span></span>') +
      '<button type="button" class="mm-x" aria-label="Close menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';

    // search that filters the menu
    var search = document.createElement('div');
    search.className = 'mm-search';
    search.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<input type="text" placeholder="Search" autocomplete="off" spellcheck="false" aria-label="Search menu">';

    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var link = item.querySelector('.nav-link');
      var mega = item.querySelector('.mega');
      if (!link) return;
      var label = link.childNodes[0] ? String(link.childNodes[0].textContent).trim() : link.textContent.trim();
      if (!label) return;
      if (!mega) {
        if (link.tagName === 'A' && link.getAttribute('href')) {
          var top = document.createElement('a');
          top.href = link.getAttribute('href');
          top.textContent = label;
          top.className = 'mm-top';
          frag.appendChild(top);
        }
        return;
      }
      var acc = document.createElement('div');
      acc.className = 'mm-acc';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mm-top';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span></span>' + chevR;
      btn.firstChild.textContent = label;
      var panel = document.createElement('div');
      panel.className = 'mm-panel';

      // one nested level: the label keeps its own page, the caret opens the
      // children. deliberately not .mm-panel — the parent accordion's rule
      // would otherwise reveal every nested list the moment it opened
      function addSub(label, href, fill) {
        var wrap = document.createElement('div');
        wrap.className = 'mm-sub';
        var row = document.createElement('div');
        row.className = 'mm-sub-row';
        var head = document.createElement('a');
        head.href = href || '#';
        head.textContent = label;
        var tbtn = document.createElement('button');
        tbtn.type = 'button';
        tbtn.className = 'mm-sub-chev';
        tbtn.setAttribute('aria-expanded', 'false');
        tbtn.setAttribute('aria-label', label + ' submenu');
        tbtn.innerHTML = chevR;
        row.appendChild(head);
        row.appendChild(tbtn);
        var spanel = document.createElement('div');
        spanel.className = 'mm-subpanel';
        fill(spanel);
        if (!spanel.children.length) return false;
        tbtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var on = wrap.classList.toggle('open');
          tbtn.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
        wrap.appendChild(row);
        wrap.appendChild(spanel);
        panel.appendChild(wrap);
        return true;
      }
      function plainLink(a) {
        var txt = a.querySelector('.mega-txt b');
        var isNew = !!a.querySelector('.mega-badge');
        var lbl = (txt ? txt.textContent : a.textContent).replace(/\s+/g, ' ').trim().replace(/\s*New$/, '');
        if (!lbl) return null;
        var m = document.createElement('a');
        m.href = a.getAttribute('href') || '#';
        m.textContent = lbl;
        if (isNew) {
          var em = document.createElement('em');
          em.className = 'mm-new';
          em.textContent = 'New';
          m.appendChild(em);
        }
        return m;
      }

      // .fly-group is no longer walked at this level: it belongs to the flyout
      // parent that owns it, and is emitted inside that parent's dropdown
      mega.querySelectorAll('.mega-col').forEach(function (col) {
        var headEl = col.querySelector('.mega-head, h5');
        if (headEl) {
          var h = document.createElement('span');
          h.className = 'mm-group';
          h.textContent = headEl.textContent.trim();
          panel.appendChild(h);
        }
        // blocks and links walked together so document order survives
        col.querySelectorAll('.mega-sub, a').forEach(function (node) {
          if (node.classList.contains('mega-sub')) {
            var tog = node.querySelector('.mega-sub-toggle');
            var kids = node.querySelectorAll('.mega-subitems a');
            if (!tog || !kids.length) return;
            var tb = tog.querySelector('.mega-txt b');
            var tlbl = (tb ? tb.textContent : tog.textContent).replace(/\s+/g, ' ').trim();
            if (tlbl) {
              addSub(tlbl, tog.getAttribute('href'), function (sp) {
                kids.forEach(function (k) {
                  var ka = document.createElement('a');
                  ka.href = k.getAttribute('href') || '#';
                  ka.textContent = k.textContent.replace(/\s+/g, ' ').trim();
                  sp.appendChild(ka);
                });
              });
            }
            return;
          }
          if (headEl && headEl.contains(node)) return;
          if (node.closest('.mega-sub')) return;

          // a desktop flyout parent (Commodities) keeps its panel as a level
          var key = node.getAttribute('data-fly');
          var fly = key ? mega.querySelector('[data-fly-panel="' + key + '"]') : null;
          if (fly) {
            var fb = node.querySelector('.mega-txt b');
            var flbl = (fb ? fb.textContent : node.textContent).replace(/\s+/g, ' ').trim();
            var built = flbl && addSub(flbl, node.getAttribute('href'), function (sp) {
              fly.querySelectorAll('.fly-group').forEach(function (g) {
                var gh = g.querySelector('h5, .fly-head, .mega-head');
                if (gh) {
                  // a heading that links on desktop stays a link here —
                  // Energies, Metals and Agriculture navigate, not label
                  var ga = gh.querySelector('a');
                  var gs = document.createElement(ga ? 'a' : 'span');
                  gs.className = 'mm-group';
                  gs.textContent = (ga || gh).textContent.replace(/\s+/g, ' ').trim();
                  if (ga) gs.href = ga.getAttribute('href') || '#';
                  sp.appendChild(gs);
                }
                g.querySelectorAll('a').forEach(function (fa) {
                  if (gh && gh.contains(fa)) return;
                  var el = plainLink(fa);
                  if (el) sp.appendChild(el);
                });
              });
            });
            if (built) return;
          }

          var m = plainLink(node);
          if (m) panel.appendChild(m);
        });
      });
      if (!panel.children.length) return;

      btn.addEventListener('click', function () {
        var open = acc.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      acc.appendChild(btn);
      acc.appendChild(panel);
      frag.appendChild(acc);
    });
    if (!frag.children.length) return;

    // pinned pill CTAs from the static menu's login / account links
    var cta = document.createElement('div');
    cta.className = 'mm-cta';
    var loginSrc = nav.querySelector('a.login');
    var btnSrc = nav.querySelector('a.btn');
    if (loginSrc) {
      var lg = document.createElement('a');
      lg.href = loginSrc.getAttribute('href') || '#';
      lg.className = 'mm-login';
      lg.textContent = loginSrc.textContent.trim() || 'Login';
      cta.appendChild(lg);
    }
    if (btnSrc) cta.appendChild(btnSrc.cloneNode(true));

    // folded language switcher fed by the header's language grid
    var langWrap = null;
    var grid = document.getElementById('langGrid');
    var codeEl = document.getElementById('langCode');
    if (grid) {
      langWrap = document.createElement('div');
      langWrap.className = 'mm-lang';
      var lbtn = document.createElement('button');
      lbtn.type = 'button';
      lbtn.className = 'mm-lang-btn';
      var current = codeEl ? codeEl.textContent.trim() : 'EN';
      lbtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span></span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var chips = document.createElement('div');
      chips.className = 'mm-langs';
      grid.querySelectorAll('.lp-item').forEach(function (it) {
        var code = it.getAttribute('data-code') || '';
        if (!code) return;
        var nameEl = it.querySelector('b');
        var name = nameEl ? nameEl.textContent.trim() : code;
        var c = document.createElement('button');
        c.type = 'button';
        c.textContent = name;
        c.setAttribute('aria-label', 'Switch language to ' + name);
        if (code === current) c.classList.add('is-on');
        c.addEventListener('click', function () {
          var ruHome = document.documentElement.hasAttribute('data-ru-home');
          var isRu = (document.documentElement.lang || '').toLowerCase().indexOf('ru') === 0;
          if (ruHome && code === 'RU' && !isRu) { window.location.href = ROOT + 'ru/'; return; }
          if (ruHome && code === 'EN' && isRu) { window.location.href = ROOT || '/'; return; }
          chips.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-on'); });
          c.classList.add('is-on');
          if (codeEl) codeEl.textContent = code;
          lbtn.querySelector('span').textContent = code;
        });
        chips.appendChild(c);
      });
      lbtn.querySelector('span').textContent = current;
      lbtn.addEventListener('click', function () { langWrap.classList.toggle('open'); });
      langWrap.appendChild(lbtn);
      langWrap.appendChild(chips);
    }

    var empty = document.createElement('p');
    empty.className = 'mm-empty';
    empty.textContent = 'Nothing matches that search.';
    empty.hidden = true;

    nav.innerHTML = '';
    nav.appendChild(head);
    nav.appendChild(search);
    nav.appendChild(frag);
    nav.appendChild(empty);
    nav.appendChild(cta);
    if (langWrap) nav.appendChild(langWrap);

    // search filter: matching links stay, groups open on match, rest fold away
    var input = search.querySelector('input');
    input.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      var any = false;
      nav.querySelectorAll('.mm-acc').forEach(function (acc) {
        var hit = false;
        acc.querySelectorAll('.mm-panel a, .mm-subpanel a').forEach(function (a) {
          var match = !q || a.textContent.toLowerCase().indexOf(q) > -1;
          a.style.display = match ? '' : 'none';
          if (q && match) hit = true;
        });
        // a nested dropdown opens when the search reaches inside it. The
        // group shows or hides as one unit: a hidden head link must take
        // its chevron with it — a caret with no label reads as debris
        // (IT screenshot, 8.24) — and a head whose child matched comes
        // back as the context line above the hit.
        acc.querySelectorAll('.mm-sub').forEach(function (sub) {
          var head = sub.querySelector('.mm-sub-row a');
          var chev = sub.querySelector('.mm-sub-chev');
          var inner = Array.prototype.some.call(sub.querySelectorAll('.mm-subpanel a'),
            function (a) { return a.style.display !== 'none'; });
          var headMatch = head && head.style.display !== 'none';
          if (chev) chev.style.display = q ? 'none' : '';
          if (head && q && inner) head.style.display = '';
          sub.style.display = (!q || inner || headMatch) ? '' : 'none';
          sub.classList.toggle('open', !!q && inner);
        });
        acc.querySelectorAll('.mm-group').forEach(function (g) { g.style.display = q ? 'none' : ''; });
        acc.classList.toggle('open', !!q && hit);
        acc.style.display = !q || hit ? '' : 'none';
        if (hit) any = true;
      });
      empty.hidden = !q || any;
    });
  }

  /* Smart app banner — phones only (CSS gates at 768px), one per visit */
  function initSmartBanner() {
    try { if (sessionStorage.getItem('sb-dismissed')) return; } catch (e) {}
    if (document.querySelector('.sb-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'sb-bar';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Get the STARTRADER app');
    var star = '<img src="' + ROOT + 'assets/img/sb-star.svg" alt="" width="11" height="10">';
    bar.innerHTML = '<span class="sb-ico"><img src="' + ROOT + 'assets/img/sb-mark.svg" alt="" width="24" height="31"></span>' +
      '<span class="sb-txt"><b>STARTRADER</b><span>' +
      (((document.documentElement.lang || '').indexOf('ru') === 0) ? 'Приложение для трейдинга' : 'Online Trading App') +
      '</span><span class="sb-stars" aria-label="Rated 4.5 out of 5">' + star + star + star + star +
      '<img src="' + ROOT + 'assets/img/sb-star-half.svg" alt="" width="11" height="10"></span></span>' +
      '<a class="sb-get" href="' + ROOT + 'trading-app.html">' +
      (((document.documentElement.lang || '').indexOf('ru') === 0) ? 'Установить' : 'Install') + '</a>' +
      '<button class="sb-x" type="button" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>';
    document.body.appendChild(bar);
    document.body.classList.add('has-sb');
    // the close control: dismissed for the rest of the session (IT 8.31,
    // global row 7) — the body padding and the fab/to-top stack re-measure
    bar.querySelector('.sb-x').addEventListener('click', function () {
      try { sessionStorage.setItem('sb-dismissed', '1'); } catch (e) {}
      if (bar.parentNode) bar.parentNode.removeChild(bar);
      document.body.classList.remove('has-sb');
      layoutSb();
      layoutBottomPad();
    });
    // sit a measured 10px above the cookie while it shows, not a guessed offset;
    // the chat bubble then rides a measured 12px above whichever surface is
    // topmost, and the back-to-top disc rides 10px above the bubble — the gap
    // the pair keeps on desktop, where CSS puts them at 24px and 94px.
    // Only a surface that is on screen AND shares the buttons' column counts:
    // the banner is display:none above 768px, where its rect reads 0,0,0,0,
    // and the cookie is a centred pill there that never reaches the corner.
    function isOn(el) {
      if (!el || !el.getClientRects().length) return false;
      return getComputedStyle(el).visibility !== 'hidden';
    }
    function layoutSb() {
      var ck = document.getElementById('cookie');
      var ckOn = ck && ck.classList.contains('show') && isOn(ck);
      var sbOn = isOn(bar);
      if (ckOn && sbOn) {
        bar.style.bottom = Math.round(window.innerHeight - ck.getBoundingClientRect().top + 10) + 'px';
      } else {
        bar.style.bottom = '';
      }
      // the highest surface sitting under el's own column, or null for a clear run
      function ceiling(el) {
        var r = el.getBoundingClientRect(), t = null;
        [sbOn ? bar : null, ckOn ? ck : null].forEach(function (o) {
          if (!o) return;
          var ob = o.getBoundingClientRect();
          if (ob.right < r.left || ob.left > r.right) return;
          if (t === null || ob.top < t) t = ob.top;
        });
        return t;
      }
      var fab = document.getElementById('chatFab');
      var fabOn = isOn(fab);
      if (fab) {
        var c = ceiling(fab);
        fab.style.bottom = c !== null ? Math.round(window.innerHeight - c + 12) + 'px' : '';
      }
      var top = document.getElementById('toTop');
      if (top) {
        var above = null;
        if (fabOn) above = fab.getBoundingClientRect().top - 10;
        else { var c2 = ceiling(top); if (c2 !== null) above = c2 - 12; }
        top.style.bottom = above !== null ? Math.round(window.innerHeight - above) + 'px' : '';
      }
    }
    document.addEventListener('st:cookie', function () { setTimeout(layoutSb, 60); });
    window.addEventListener('resize', layoutSb);
    setTimeout(layoutSb, 1600);
  }

  /* the fixed bottom stack (app banner + cookie) floats over the end of the
     page, so the footer's last lines could never scroll clear of it on
     phones (IT 8.24 round, global row 11). The body reserves the covered
     height while any of the stack is on screen, and hands it back when the
     surfaces are dismissed. */
  function layoutBottomPad() {
    var pad = 0, vh = window.innerHeight;
    [document.querySelector('.sb-bar'), document.getElementById('cookie')].forEach(function (el) {
      if (!el || !el.getClientRects().length) return;
      if (el.id === 'cookie' && !el.classList.contains('show')) return;
      if (getComputedStyle(el).visibility === 'hidden') return;
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.height > 0) pad = Math.max(pad, vh - r.top);
    });
    document.body.style.paddingBottom = pad ? Math.round(pad + 14) + 'px' : '';
  }
  // registered here, not inside initSmartBanner — the banner init returns
  // early once dismissed, and the cookie alone still covers the footer
  document.addEventListener('st:cookie', function () { setTimeout(layoutBottomPad, 80); });
  window.addEventListener('resize', layoutBottomPad);
  setTimeout(layoutBottomPad, 1700);

  function initMobileMenu() {
    var burger = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
    try { buildMobileMenuV2(menu); } catch (e) { /* static links remain */ }
    var backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);

    function setOpen(open) {
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      backdrop.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      document.body.style.overflow = open ? 'hidden' : '';
    }
    menu.setAttribute('data-lenis-prevent', '');
    burger.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
    var mmX = menu.querySelector('.mm-x');
    if (mmX) mmX.addEventListener('click', function () { setOpen(false); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    // when the viewport grows past the hamburger breakpoint, the sheet closes
    // itself — otherwise it lingers open after devtools/rotation resizes
    var mq = window.matchMedia('(min-width: 1081px)');
    var onWide = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onWide);
    else if (mq.addListener) mq.addListener(onWide);
  }

  /* ---------------- Smooth anchor links ---------------- */
  function initAnchors() {
    var tb = document.querySelector('.topbar'), hd = document.getElementById('siteHeader');
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      a.addEventListener('click', function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var off = (tb ? tb.offsetHeight : 0) + (hd ? hd.offsetHeight : 0) + 14;
        // resolve the absolute document position ourselves — offsetTop-based
        // resolution under-shoots for targets nested in positioned containers
        var y = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - off;
        scrollToTarget(Math.max(0, y));
      });
    });
  }

  /* ---------------- Scroll reveal + counters ---------------- */
  function animateCount(el) {
    var end = parseFloat(el.dataset.count);
    if (isNaN(end)) return;
    var dec = parseInt(el.dataset.dec || '0', 10);
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    var comma = el.hasAttribute('data-comma');
    var obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.7, ease: 'power2.out',
      onUpdate: function () {
        var n = dec ? obj.v.toFixed(dec) : Math.round(obj.v);
        if (comma) n = Number(n).toLocaleString('en-US');
        el.textContent = pre + n + suf;
      }
    });
  }

  /* ---------------- Page reveals (AOS) ----------------
     Entry animations are AOS's job now (data-aos attributes in the markup).
     The js-aos class gates the hidden initial state, so a visitor without
     JavaScript still sees every section. Once an element has animated in,
     its data-aos attribute is stripped — AOS would otherwise pin a
     transform on it forever and defeat the shared card hover lift. */
  function initAOS() {
    if (typeof AOS === 'undefined' || prefersReduced) return;
    doc.classList.add('js-aos');
    document.addEventListener('aos:in', function (e) {
      var el = e.detail;
      if (!el || el.nodeType !== 1 || !el.hasAttribute('data-aos')) return;
      var delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10) || 0;
      setTimeout(function () {
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
        el.classList.remove('aos-init', 'aos-animate');
      }, 800 + delay + 120);
    });
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });

    // late media (lazy images, video posters) moves the layout after AOS has
    // cached its trigger offsets — recalculate once everything has loaded
    window.addEventListener('load', function () { AOS.refresh(); });

    // safety net: no section may stay hidden. If an element reaches the
    // viewport and AOS still hasn't animated it (stale offsets), reveal it.
    if ('IntersectionObserver' in window) {
      var net = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          net.unobserve(el);
          setTimeout(function () {
            if (el.hasAttribute('data-aos') && !el.classList.contains('aos-animate')) {
              el.classList.add('aos-animate');
              setTimeout(function () {
                el.removeAttribute('data-aos');
                el.removeAttribute('data-aos-delay');
                el.classList.remove('aos-init', 'aos-animate');
              }, 920);
            }
          }, 350);
        });
      }, { threshold: 0.05 });
      Array.prototype.forEach.call(document.querySelectorAll('[data-aos]'), function (el) {
        net.observe(el);
      });
    }
  }

  function initReveals() {
    if (prefersReduced || !hasGSAP || !hasST) { doc.classList.remove('is-animate'); return; }

    // anything already on screen at boot reveals straight away — a trigger line
    // at 88% leaves content in the lower part of the first screen invisible
    // until the visitor scrolls, which on a short laptop can hide a whole block
    function onScreen(el) {
      var r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || 0) && r.bottom > 0;
    }

    gsap.utils.toArray('[data-count]').forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { animateCount(el); } });
    });

    // stepper progress line
    var line = document.querySelector('.stp-line i');
    if (line) {
      gsap.to(line, {
        scaleX: 1, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.stepper', start: 'top 80%', once: true }
      });
    }

    // hero parallax
    var glow = document.querySelector('.hero-glow');
    var shape = document.querySelector('.hero-shape');
    if (glow && !COARSE) gsap.to(glow, { yPercent: 26, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (shape && !COARSE) gsap.to(shape, { yPercent: 18, rotate: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------------- Marquee rails (Swiper) ----------------
     Every auto-scrolling rail is a `.swiper.st-marquee` whose track is the
     `.swiper-wrapper`; speed comes from data-marquee-speed (px/s). Optional
     data-marquee-prev/next selectors wire navigation arrows. */
  function initMarqueeSwipers() {
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll('.st-marquee').forEach(function (el) {
      if (el.swiper) return; // already initialised
      var wrapper = el.querySelector('.swiper-wrapper');
      if (!wrapper) return;
      var slides = wrapper.children.length;
      if (!slides) return;
      // loop mode stutters unless the track covers twice the visible width,
      // but extra DOM beyond that only costs frames — so clone one slide at
      // a time (cycling the set) and stop the moment 2x is reached
      var originals = Array.prototype.slice.call(wrapper.children);
      var need = (el.getBoundingClientRect().width || window.innerWidth) * 2;
      var ci = 0;
      while (wrapper.scrollWidth < need && ci < originals.length * 6) {
        wrapper.appendChild(originals[ci % originals.length].cloneNode(true));
        ci++;
      }
      var pxPerSec = parseFloat(el.getAttribute('data-marquee-speed')) || 45;
      var gap = parseFloat(getComputedStyle(wrapper).gap) || 18;
      var first = wrapper.children[0];
      var slideW = (first ? first.getBoundingClientRect().width : 300) + gap;
      // data-marquee-static rails never drift on their own — they only move
      // by their arrows or a drag, at a normal per-slide speed
      var isStatic = el.hasAttribute('data-marquee-static');
      var opts = {
        slidesPerView: 'auto',
        spaceBetween: gap,
        loop: !prefersReduced,
        speed: isStatic ? 450 : Math.max(400, Math.round(slideW / pxPerSec * 1000)),
        grabCursor: true,
        a11y: { enabled: true }
      };
      if (!prefersReduced && !isStatic) {
        opts.autoplay = { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true };
      }
      var prevSel = el.getAttribute('data-marquee-prev');
      var nextSel = el.getAttribute('data-marquee-next');
      if (prevSel && nextSel) opts.navigation = { prevEl: prevSel, nextEl: nextSel };
      var sw = new Swiper(el, opts);
      // continuous autoplay stalls for good after a drag or a click — the
      // interrupted linear transition never hands back to the autoplay
      // chain. Re-arm it whenever the hand leaves the rail.
      if (opts.autoplay) {
        var rekick = function () {
          setTimeout(function () {
            if (sw.autoplay && !sw.destroyed) { sw.autoplay.stop(); sw.autoplay.start(); }
          }, 250);
        };
        sw.on('touchEnd', rekick);
        el.addEventListener('mouseleave', rekick);
        el.addEventListener('click', rekick);
      }
    });
  }

  /* ---------------- Drag-to-scroll (country + awards) ---------------- */
  function enableDrag(el) {
    var isDown = false, startX = 0, startScroll = 0, moved = false, pid = null;
    el.addEventListener('pointerdown', function (e) {
      isDown = true; moved = false; startX = e.clientX; startScroll = el.scrollLeft; pid = e.pointerId;
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      // capture only once a real drag starts — capturing on pointerdown makes
      // Chrome retarget the ensuing click at the rail, killing taps on children
      if (Math.abs(dx) > 4 && !moved) {
        moved = true;
        try { el.setPointerCapture(pid); } catch (_) {}
      }
      el.scrollLeft = startScroll - dx;
    });
    function end() { isDown = false; el.classList.remove('dragging'); }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', end);
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); } }, true);
  }

  /* (country + reviews marquees are handled by initMarqueeSwipers) */

  /* ---------------- Live market data (simulated) ---------------- */
  var mkxData = [
    { s: 'GBPUSD', n: 'Great Britain Pound vs US Dollar', c: 'forex', ic: { t: 'flags', a: 'gb', b: 'us' }, p: 1.3355, d: 4, chg: 0.26, pop: true, po: 0 },
    { s: 'EURUSD', n: 'Euro vs US Dollar', c: 'forex', ic: { t: 'flags', a: 'eu', b: 'us' }, p: 1.0842, d: 4, chg: 0.13, pop: true, po: 1 },
    { s: 'USDCAD', n: 'US Dollar vs Canadian Dollar', c: 'forex', ic: { t: 'flags', a: 'us', b: 'ca' }, p: 1.40855, d: 5, chg: -0.08 },
    { s: 'AUDUSD', n: 'Australian Dollar vs US Dollar', c: 'forex', ic: { t: 'flags', a: 'au', b: 'us' }, p: 0.6612, d: 4, chg: -0.08 },
    { s: 'USDJPY', n: 'US Dollar vs Japanese Yen', c: 'forex', ic: { t: 'flags', a: 'us', b: 'jp' }, p: 156.82, d: 2, chg: 0.24 },
    { s: 'NZDCHF', n: 'New Zealand Dollar vs Swiss Franc', c: 'forex', ic: { t: 'flags', a: 'nz', b: 'ch' }, p: 0.47272, d: 5, chg: 0.32 },
    { s: 'USDCHF', n: 'US Dollar vs Swiss Franc', c: 'forex', ic: { t: 'flags', a: 'us', b: 'ch' }, p: 0.8842, d: 4, chg: 0.11 },
    { s: 'US500', n: 'US 500 Cash Index', c: 'indices', ic: { t: 'flag', a: 'us' }, p: 5732.3, d: 1, chg: 0.90 },
    { s: 'CAC40', n: 'France 40 Cash Index', c: 'indices', ic: { t: 'flag', a: 'fr' }, p: 8438.7, d: 1, chg: 0.93, pop: true, po: 2 },
    { s: 'GER40', n: 'Germany 40 Cash Index', c: 'indices', ic: { t: 'flag', a: 'de' }, p: 18411, d: 0, chg: 0.34 },
    { s: 'NAS100', n: 'US Tech 100 Cash Index', c: 'indices', ic: { t: 'flag', a: 'us' }, p: 29971.3, d: 1, chg: -0.62 },
    { s: 'UK100', n: 'UK 100 Cash Index', c: 'indices', ic: { t: 'flag', a: 'gb' }, p: 8241.4, d: 1, chg: 0.42 },
    { s: 'JP225', n: 'Japan 225 Cash Index', c: 'indices', ic: { t: 'flag', a: 'jp' }, p: 38614, d: 0, chg: -0.28 },
    { s: 'HK50', n: 'Hong Kong 50 Cash Index', c: 'indices', ic: { t: 'flag', a: 'hk' }, p: 17492, d: 0, chg: 0.65 },
    { s: 'AAPL', n: 'Apple Inc', c: 'shares', ic: { t: 'sym', v: 'A', bg: '#111418' }, p: 228.11, d: 2, chg: 0.63 },
    { s: 'TSLA', n: 'Tesla Inc', c: 'shares', ic: { t: 'sym', v: 'T', bg: '#e82127' }, p: 334.09, d: 2, chg: -1.02 },
    { s: 'NVDA', n: 'NVIDIA Corp', c: 'shares', ic: { t: 'sym', v: 'N', bg: '#76b900' }, p: 126.40, d: 2, chg: 2.18 },
    { s: 'MSFT', n: 'Microsoft Corp', c: 'shares', ic: { t: 'sym', v: 'M', bg: '#0078d4' }, p: 428.2, d: 2, chg: 0.41 },
    { s: 'AMZN', n: 'Amazon.com Inc', c: 'shares', ic: { t: 'sym', v: 'A', bg: '#ff9900' }, p: 186.3, d: 2, chg: 0.96 },
    { s: 'META', n: 'Meta Platforms Inc', c: 'shares', ic: { t: 'sym', v: 'M', bg: '#0866ff' }, p: 512.4, d: 2, chg: -0.53 },
    { s: 'GOOG', n: 'Alphabet Inc', c: 'shares', ic: { t: 'sym', v: 'G', bg: '#4285f4' }, p: 176.3, d: 2, chg: 0.72 },
    { s: 'SPY.ETF', n: 'SPDR S&P 500 ETF Trust', c: 'etfs', ic: { t: 'etf' }, p: 571.28, d: 2, chg: 0.55 },
    { s: 'LQD.ETF', n: 'iShares iBoxx IG Corp Bond ETF', c: 'etfs', ic: { t: 'etf' }, p: 106.35, d: 2, chg: 0.05, pop: true, po: 4 },
    { s: 'RSP.ETF', n: 'Invesco S&P 500 Equal Weight ETF', c: 'etfs', ic: { t: 'etf' }, p: 213.7, d: 1, chg: 1.03, pop: true, po: 5 },
    { s: 'SPXS.ETF', n: 'Direxion Daily S&P 500 Bear 3x Shares', c: 'etfs', ic: { t: 'etf' }, p: 27.61, d: 2, chg: -0.61, pop: true, po: 6 },
    { s: 'QQQ.ETF', n: 'Invesco QQQ Trust', c: 'etfs', ic: { t: 'etf' }, p: 486.9, d: 2, chg: 0.88 },
    { s: 'VOO.ETF', n: 'Vanguard S&P 500 ETF', c: 'etfs', ic: { t: 'etf' }, p: 526.4, d: 2, chg: 0.54 },
    { s: 'GLD.ETF', n: 'SPDR Gold Shares', c: 'etfs', ic: { t: 'etf' }, p: 214.8, d: 2, chg: 0.29 },
    { s: 'XAUUSD', n: 'Gold vs US Dollar', c: 'metals', ic: { t: 'inst', a: 'xau' }, p: 3241.80, d: 2, chg: 0.82, pop: true, po: 3 },
    { s: 'XAGUSD', n: 'Silver vs US Dollar', c: 'metals', ic: { t: 'inst', a: 'xag' }, p: 38.42, d: 2, chg: 1.14 },
    { s: 'WTI', n: 'US Crude Oil Spot', c: 'commodities', ic: { t: 'inst', a: 'xti' }, p: 71.28, d: 2, chg: -0.34 },
    { s: 'UKOUSD', n: 'Brent Crude Oil Spot', c: 'commodities', ic: { t: 'inst', a: 'xbr' }, p: 75.6, d: 2, chg: -0.22 },
    { s: 'NATGAS', n: 'US Natural Gas Spot', c: 'commodities', ic: { t: 'inst', a: 'xng' }, p: 2.84, d: 3, chg: 1.66 },
    { s: 'COPPER', n: 'Copper Spot', c: 'metals', ic: { t: 'inst', a: 'copper' }, p: 4.32, d: 3, chg: 0.38 },
    { s: 'XPTUSD', n: 'Platinum vs US Dollar', c: 'metals', ic: { t: 'inst', a: 'xpt' }, p: 978.4, d: 2, chg: -0.45 },
    { s: 'XPDUSD', n: 'Palladium vs US Dollar', c: 'metals', ic: { t: 'inst', a: 'xpd' }, p: 1024.6, d: 2, chg: 0.58 },
    { s: 'XAUAUD', n: 'Gold vs Australian Dollar', c: 'metals', ic: { t: 'inst', a: 'xau' }, p: 4903.2, d: 2, chg: 0.66 },
    { s: 'WHEAT', n: 'US Wheat Futures', c: 'commodities', ic: { t: 'inst', a: 'wheat' }, p: 598.4, d: 1, chg: 0.72 },
    { s: 'CORN', n: 'US Corn Futures', c: 'commodities', ic: { t: 'inst', a: 'corn' }, p: 442.6, d: 1, chg: -0.31 },
    { s: 'COFFEE', n: 'Coffee C Futures', c: 'commodities', ic: { t: 'inst', a: 'coffee' }, p: 228.9, d: 1, chg: 1.24 },
    { s: 'SUGAR', n: 'Sugar No. 11 Futures', c: 'commodities', ic: { t: 'inst', a: 'sugar' }, p: 19.42, d: 2, chg: 0.44 }
  ];
  var mkxFeat = { popular: 'GBPUSD', forex: 'GBPUSD', indices: 'US500', commodities: 'WTI', etfs: 'SPY.ETF', metals: 'XAUUSD', shares: 'AAPL' };
  function mkxSpark(sym, up) {
    var seed = 0, i;
    for (i = 0; i < sym.length; i++) seed = (seed * 31 + sym.charCodeAt(i)) >>> 0;
    function rnd() { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; }
    var N = 13, W = 100, H = 40, pad = 6, vals = [], v = 0.5, drift = up ? 0.032 : -0.032;
    for (i = 0; i < N; i++) { v += drift + (rnd() - 0.5) * 0.22; vals.push(v); }
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rng = (mx - mn) || 1, xs = [], ys = [];
    for (i = 0; i < N; i++) { xs.push((i / (N - 1)) * W); ys.push(H - pad - ((vals[i] - mn) / rng) * (H - 2 * pad)); }
    // smooth curve (Catmull-Rom -> cubic bezier) for a modern rounded look
    var line = 'M' + xs[0].toFixed(1) + ' ' + ys[0].toFixed(1);
    for (i = 0; i < N - 1; i++) {
      var x0 = xs[i > 0 ? i - 1 : 0], y0 = ys[i > 0 ? i - 1 : 0], x1 = xs[i], y1 = ys[i];
      var x2 = xs[i + 1], y2 = ys[i + 1], x3 = xs[i + 2 < N ? i + 2 : N - 1], y3 = ys[i + 2 < N ? i + 2 : N - 1];
      var c1x = x1 + (x2 - x0) / 6, c1y = y1 + (y2 - y0) / 6, c2x = x2 - (x3 - x1) / 6, c2y = y2 - (y3 - y1) / 6;
      line += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }
    return { line: line, area: line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z', baseY: ys[0].toFixed(1), lx: xs[N - 1].toFixed(1), ly: ys[N - 1].toFixed(1) };
  }
  function mkxIcon(m) {
    var ic = m.ic;
    if (ic.t === 'flags') return '<span class="mkx-ic mkx-ic-flags"><img src="' + ROOT + 'assets/img/flags/' + ic.a + '.svg" alt="" loading="lazy"><img src="' + ROOT + 'assets/img/flags/' + ic.b + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'flag') return '<span class="mkx-ic mkx-ic-flag"><img src="' + ROOT + 'assets/img/flags/' + ic.a + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'inst') return '<span class="mkx-ic mkx-ic-inst"><img src="' + ROOT + 'assets/img/commodities/' + ic.a + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'etf') return '<span class="mkx-ic mkx-ic-etf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l5-6 3.5 3.5L20 7"/><path d="M4 20h16"/></svg></span>';
    return '<span class="mkx-ic mkx-ic-sym" style="background:' + (ic.bg || '#0a2a6b') + '">' + ic.v + '</span>';
  }
  function mkxPrice(m) { return m.p.toLocaleString('en-US', { minimumFractionDigits: m.d, maximumFractionDigits: m.d }); }
  function mkbSvg(m, seedSuffix, big) {
    var up = m.chg >= 0, col = up ? '#12b76a' : '#e5484d', sp = mkxSpark(m.s + (seedSuffix || ''), up);
    var gid = 'gsp-' + (big ? 'f-' : '') + m.s.replace(/[^A-Za-z0-9]/g, '');
    return '<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".24"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
      (big ? '<line class="mkx-base" x1="0" y1="' + sp.baseY + '" x2="100" y2="' + sp.baseY + '"/>' : '') +
      '<path d="' + sp.area + '" fill="url(#' + gid + ')"/>' +
      '<path d="' + sp.line + '" fill="none" stroke="' + col + '" stroke-width="' + (big ? 1.6 : 1.4) + '" vector-effect="non-scaling-stroke"/>' +
      (big ? '<circle cx="' + sp.lx + '" cy="' + sp.ly + '" r="1.6" fill="' + col + '"/>' : '') +
      '</svg>';
  }
  function mkbMini(m) {
    var up = m.chg >= 0;
    return '<article class="mkb-card" data-sym="' + m.s + '">' +
      '<div class="mkx-top">' + mkxIcon(m) + '<div class="mkx-name"><b>' + m.s + '</b><em>' + m.n + '</em></div></div>' +
      '<div class="mkb-mid"><div class="mkb-nums"><span class="mkb-p">' + mkxPrice(m) + '</span><span class="mkx-chg ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + m.chg.toFixed(2) + '%</span></div>' +
      '<div class="mkb-spark">' + mkbSvg(m) + '</div></div>' +
      '<a class="mkb-trade" href="#">Trade <svg><use href="#i-arrow-right"/></svg></a>' +
      '</article>';
  }
  function mkbFeatCard(m) {
    var up = m.chg >= 0;
    var delta = (m.p * m.chg / 100), ds = (delta >= 0 ? '+' : '') + delta.toLocaleString('en-US', { minimumFractionDigits: m.d, maximumFractionDigits: m.d });
    var tfs = ['1D', '1W', '1M', '3M', '1Y'].map(function (t, i) {
      return '<button class="mkb-tf' + (i === 0 ? ' is-on' : '') + '" type="button">' + t + '</button>';
    }).join('');
    return '<article class="mkb-feat" data-sym="' + m.s + '">' +
      '<span class="mkb-featchip"><svg><use href="#i-star"/></svg>Featured</span>' +
      '<div class="mkx-top">' + mkxIcon(m) + '<div class="mkx-name"><b>' + m.s + '</b><em>' + m.n + '</em></div></div>' +
      '<span class="mkb-price mkb-p">' + mkxPrice(m) + '</span>' +
      '<span class="mkb-chgrow"><span class="mkx-chg ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + m.chg.toFixed(2) + '%</span><em class="mkb-delta">(' + ds + ')</em></span>' +
      '<div class="mkb-feat-spark" data-mkb-spark>' + mkbSvg(m, '', true) + '</div>' +
      '<div class="mkb-feat-foot"><a class="mkb-trade mkb-trade--lg" href="#">Trade <svg><use href="#i-arrow-right"/></svg></a><div class="mkb-tfs">' + tfs + '</div></div>' +
      '</article>';
  }
  var mkxLive = {};
  function initMarkets() {
    var board = document.getElementById('mkxBoard');
    if (!board) return;
    mkxData.forEach(function (m) { if (!mkxLive[m.s]) mkxLive[m.s] = { base: m.p, cur: m.p, d: m.d }; });
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.mkx-tab'));

    function render(cat) {
      var items = mkxData.filter(function (m) { return cat === 'popular' ? m.pop : m.c === cat; });
      if (cat === 'popular') items.sort(function (a, b) { return (a.po || 0) - (b.po || 0); });
      var featSym = mkxFeat[cat], feat = null, minis = [];
      items.forEach(function (m) { if (!feat && m.s === featSym) feat = m; else minis.push(m); });
      if (!feat) { feat = items[0]; minis = items.slice(1); }
      board.innerHTML = mkbFeatCard(feat) + '<div class="mkx-minis">' + minis.slice(0, 6).map(mkbMini).join('') + '</div>';
      var tfBtns = Array.prototype.slice.call(board.querySelectorAll('.mkb-tf'));
      var sparkBox = board.querySelector('[data-mkb-spark]');
      tfBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          tfBtns.forEach(function (x) { x.classList.toggle('is-on', x === b); });
          if (sparkBox) sparkBox.innerHTML = mkbSvg(feat, b.textContent === '1D' ? '' : b.textContent, true);
        });
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        render(t.dataset.cat);
      });
    });
    render('popular');

    // live prices tick across the board
    if (!prefersReduced) {
      setInterval(function () {
        var cards = board.querySelectorAll('[data-sym]');
        if (!cards.length) return;
        Array.prototype.forEach.call(cards, function (c) {
          var s = c.getAttribute('data-sym'), st = mkxLive[s];
          if (!st || Math.random() > 0.5) return;
          var step = st.base * 0.0009 * (Math.random() * 2 - 1);
          st.cur = st.cur + step + (st.base - st.cur) * 0.05;
          var chg = ((st.cur - st.base) / st.base) * 100;
          var ps = st.cur.toLocaleString('en-US', { minimumFractionDigits: st.d, maximumFractionDigits: st.d });
          var cs = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
          var pe = c.querySelector('.mkb-p'), ce = c.querySelector('.mkx-chg');
          if (pe) { pe.textContent = ps; pe.classList.remove('mkx-flash-up', 'mkx-flash-down'); void pe.offsetWidth; pe.classList.add(step >= 0 ? 'mkx-flash-up' : 'mkx-flash-down'); }
          if (ce) { ce.textContent = cs; ce.classList.toggle('up', chg >= 0); ce.classList.toggle('down', chg < 0); }
        });
      }, 1600);
    }
  }

  function initLiveMarkets() {
    var grid = document.querySelector('[data-live-markets]');
    if (!grid) return;
    var rows = [];
    grid.querySelectorAll('.mkt-list li').forEach(function (li) {
      var priceEl = li.querySelector('.mkt-price');
      var chgEl = li.querySelector('.chg');
      if (!priceEl || !chgEl) return;
      var raw = priceEl.textContent.replace(/,/g, '');
      var base = parseFloat(raw);
      if (isNaN(base)) return;
      var parts = priceEl.textContent.split('.');
      rows.push({ priceEl: priceEl, chgEl: chgEl, base: base, cur: base, decimals: parts[1] ? parts[1].length : 0 });
    });
    if (!rows.length) return;
    function fmt(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
    function tick() {
      rows.forEach(function (r) {
        if (Math.random() > 0.5) return; // only some rows move each tick
        var step = r.base * 0.0011 * (Math.random() * 2 - 1);
        r.cur = r.cur + step + (r.base - r.cur) * 0.04; // random walk + mean reversion
        var chg = ((r.cur - r.base) / r.base) * 100;
        r.priceEl.textContent = fmt(r.cur, r.decimals);
        r.chgEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
        r.chgEl.classList.toggle('up', chg >= 0);
        r.chgEl.classList.toggle('down', chg < 0);
        if (!prefersReduced) {
          r.priceEl.classList.remove('price-flash-up', 'price-flash-down');
          void r.priceEl.offsetWidth;
          r.priceEl.classList.add(step >= 0 ? 'price-flash-up' : 'price-flash-down');
        }
      });
    }
    setInterval(tick, 1900);
  }

  /* ---------------- How it works — pinned scroll scrub ---------------- */
  function initHowtoScrub() {
    var section = document.querySelector('.howto');
    var stepper = document.getElementById('stepper');
    var stepsWrap = document.getElementById('steps');
    if (!section || !stepper || !stepsWrap) return;
    var stps = Array.prototype.slice.call(stepper.querySelectorAll('.stp'));
    var lines = Array.prototype.slice.call(stepper.querySelectorAll('.stp-line i'));
    var steps = Array.prototype.slice.call(stepsWrap.querySelectorAll('.step'));
    var n = steps.length;

    function setState(active, lp) {
      stps.forEach(function (el, i) { el.classList.toggle('done', i < active); el.classList.toggle('active', i === active); });
      steps.forEach(function (el, i) { el.classList.toggle('step-active', i === active); });
      lines.forEach(function (el, i) { el.style.transform = 'scaleX(' + Math.max(0, Math.min(1, lp - i)) + ')'; });
    }

    // Fallback: no pin on mobile / very short viewports / reduced motion —
    // show all steps as clean, equal cards (no scroll animation).
    if (prefersReduced || !hasGSAP || !hasST || window.innerWidth < 900 || window.innerHeight < 560) {
      section.classList.add('howto-static');
      setState(-1, 0);
      return;
    }

    setState(0, 0);
    // short pin + snap so each scroll gesture advances one step (1 -> 2 -> 3)
    var snapPts = [];
    for (var s = 0; s < n; s++) snapPts.push(s / (n - 1)); // [0, 0.5, 1]
    ScrollTrigger.create({
      trigger: section, start: 'top top', end: '+=' + (n - 1) * 320, pin: true, scrub: 0.35, anticipatePin: 1,
      snap: { snapTo: snapPts, duration: { min: 0.18, max: 0.4 }, delay: 0.03, ease: 'power2.inOut' },
      onUpdate: function (self) {
        var p = self.progress;
        var active = Math.min(n - 1, Math.floor(p * n + 0.0001));
        setState(active, p * n);
      }
    });
  }

  /* ---------------- Sparkline dot (why-cards) ---------------- */
  // The leverage chart fills its card with preserveAspectRatio="none", so the
  // viewBox is scaled unevenly and a round dot renders as an ellipse. Even the
  // radii back out against the actual scale, on load and on resize.
  function initLvDots() {
    var svgs = Array.prototype.slice.call(document.querySelectorAll('.fx-lv svg'));
    if (!svgs.length) return;

    function size() {
      svgs.forEach(function (svg) {
        var dot = svg.querySelector('.dot');
        var vb = svg.viewBox && svg.viewBox.baseVal;
        if (!dot || !vb || !vb.width || !vb.height) return;
        var box = svg.getBoundingClientRect();
        if (!box.width || !box.height) return;
        var sx = box.width / vb.width;
        var sy = box.height / vb.height;
        var r = 5;
        dot.setAttribute('rx', (r * (sy / sx)).toFixed(2));
        dot.setAttribute('ry', r);
      });
    }

    size();
    window.addEventListener('resize', size);
    window.addEventListener('load', size);
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    return; // disabled — buttons stay static for a professional feel
    /* eslint-disable no-unreachable */
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: mx * 0.28, y: my * 0.34, duration: 0.5, ease: 'power3.out' });
      });
      btn.addEventListener('pointerleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  /* ---------------- Nav dropdown a11y ---------------- */
  function initDropdowns() {
    document.querySelectorAll('.nav-item.has-drop').forEach(function (item) {
      var btn = item.querySelector('.nav-link');
      if (!btn) return;
      item.addEventListener('mouseenter', function () { btn.setAttribute('aria-expanded', 'true'); });
      item.addEventListener('mouseleave', function () { btn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------------- Mega menu — item flyouts (Commodities, Web Trader) ---------------- */
  function initMega() {
    document.querySelectorAll('.mega').forEach(function (p) { p.setAttribute('data-lenis-prevent', ''); });
    document.querySelectorAll('.nav-item.has-mega').forEach(function (item) {
      var mega = item.querySelector('.mega');
      // hold the panel open across hover micro-breaks; tap/click toggles too
      var hideT = null;
      function show() {
        if (hideT) { clearTimeout(hideT); hideT = null; }
        document.querySelectorAll('.nav-item.has-mega.is-open').forEach(function (o) {
          if (o !== item) o.classList.remove('is-open');
        });
        item.classList.add('is-open');
      }
      function scheduleHide() {
        hideT = setTimeout(function () { item.classList.remove('is-open'); }, 240);
      }
      item.addEventListener('mouseenter', show);
      item.addEventListener('mouseleave', scheduleHide);
      var topBtn = item.querySelector(':scope > .nav-link');
      if (topBtn) topBtn.addEventListener('click', function () {
        item.classList.contains('is-open') && hideT === null
          ? item.classList.remove('is-open') : show();
      });
      var parents = Array.prototype.slice.call(item.querySelectorAll('.mega-item-parent'));
      if (!mega || !parents.length) return;
      var fly = mega.querySelector('.mega-flyout');
      // one panel per parent, paired by key; a flyout with no keyed panels is
      // a single-panel menu and keeps working untouched
      var panels = fly ? Array.prototype.slice.call(fly.querySelectorAll('[data-fly-panel]')) : [];
      var current = null;

      function openFly(parent) {
        current = parent;
        var key = parent.getAttribute('data-fly');
        mega.classList.add('flyout-open');
        parents.forEach(function (p) { p.classList.toggle('active', p === parent); });
        panels.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-fly-panel') === key); });
        if (fly) fly.setAttribute('aria-hidden', 'false');
      }
      function closeFly() {
        current = null;
        mega.classList.remove('flyout-open');
        parents.forEach(function (p) { p.classList.remove('active'); });
        if (fly) fly.setAttribute('aria-hidden', 'true');
      }

      parents.forEach(function (parent) {
        // open on hovering the parent; keep open while over the flyout itself
        parent.addEventListener('mouseenter', function () { openFly(parent); });
        parent.addEventListener('focus', function () { openFly(parent); });
        // The parent is a link to its own hub page: clicking the label navigates,
        // clicking the chevron toggles the flyout instead. Non-link parents always toggle.
        parent.addEventListener('click', function (e) {
          var chev = e.target && e.target.closest ? e.target.closest('.mega-chev') : null;
          if (parent.tagName === 'A' && parent.getAttribute('href') && !chev) return;
          e.preventDefault();
          (mega.classList.contains('flyout-open') && parent.classList.contains('active')) ? closeFly() : openFly(parent);
        });
      });
      if (fly) fly.addEventListener('mouseenter', function () { if (current) openFly(current); });
      // close when hovering any other menu item
      mega.querySelectorAll('.mega-item').forEach(function (it) {
        if (parents.indexOf(it) === -1) it.addEventListener('mouseenter', closeFly);
      });
      // reset when leaving the whole Trading menu
      item.addEventListener('mouseleave', closeFly);
    });
  }

  /* ---------------- Language popup ---------------- */
  function initLangPop() {
    var btn = document.getElementById('langBtn');
    var pop = document.getElementById('langPop');
    if (!btn || !pop) return;
    pop.setAttribute('data-lenis-prevent', '');
    var closeBtn = document.getElementById('langClose');
    var search = document.getElementById('langSearch');
    var codeEl = document.getElementById('langCode');
    var items = Array.prototype.slice.call(pop.querySelectorAll('.lp-item'));
    var empty = pop.querySelector('.lp-empty');

    function open() {
      pop.classList.add('open');
      pop.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      setTimeout(function () { if (search) search.focus(); }, 80);
    }
    function close() {
      pop.classList.remove('open');
      pop.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      pop.classList.contains('open') ? close() : open();
    });

    // desktop: open on hover like the other nav menus. The panel hangs 12px
    // under the bar while the button sits inside it, so 37px of dead space
    // separates the two — a pointer resting there is between the button and
    // the panel, not leaving. The close timer keeps re-arming while the
    // pointer stays inside that corridor, and only a move beyond it closes.
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var hoverT = null;
      var mx = -1, my = -1;
      document.addEventListener('mousemove', function (ev) { mx = ev.clientX; my = ev.clientY; }, { passive: true });
      var inCorridor = function () {
        if (!pop.classList.contains('open')) return false;
        var b = btn.getBoundingClientRect(), p = pop.getBoundingClientRect();
        return mx >= b.left - 16 && mx <= b.right + 16 && my >= b.top && my <= p.top + 2;
      };
      var scheduleClose = function () {
        hoverT = setTimeout(function () {
          hoverT = null;
          if (inCorridor()) { scheduleClose(); return; }
          close();
        }, 160);
      };
      var cancelClose = function () { if (hoverT) { clearTimeout(hoverT); hoverT = null; } };
      [btn, pop].forEach(function (el) {
        el.addEventListener('mouseenter', function () { cancelClose(); if (!pop.classList.contains('open')) open(); });
        el.addEventListener('mouseleave', scheduleClose);
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('click', function (e) {
      if (pop.classList.contains('open') && !pop.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pop.classList.contains('open')) { close(); btn.focus(); }
    });

    if (search) search.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase(), any = false;
      items.forEach(function (it) {
        var match = it.textContent.toLowerCase().indexOf(q) > -1;
        it.style.display = match ? '' : 'none';
        if (match) any = true;
      });
      if (empty) empty.hidden = any;
    });

    /* A page that declares its translations with hreflang alternates turns the
       picker into real navigation: every language it has becomes a link, and
       every language it does not becomes unavailable rather than pretending to
       switch. Pages that declare none keep the old behaviour, where picking a
       language only marks a preference. */
    var CODE_HREFLANG = {
      'EN': 'en', 'ZH-CN': 'zh-hans', 'ZH-TW': 'zh-hant', 'JA': 'ja', 'KO': 'ko',
      'MS': 'ms', 'VI': 'vi', 'TH': 'th', 'ID': 'id', 'FR': 'fr', 'ES': 'es',
      'PL': 'pl', 'PT': 'pt', 'RU': 'ru', 'AR': 'ar', 'IT': 'it', 'FA': 'fa',
      'TR': 'tr', 'DE': 'de', 'HI': 'hi', 'NL': 'nl'
    };
    /* the button shows a two-letter badge; the Chinese codes are five characters
       and wrapped at their hyphen in a slot sized for two */
    var CODE_BADGE = { 'ZH-CN': 'CN', 'ZH-TW': 'TW' };
    function badge(code) { return CODE_BADGE[code] || code; }

    var alts = {}, routed = false;
    Array.prototype.forEach.call(
      document.querySelectorAll('link[rel="alternate"][hreflang]'),
      function (l) {
        var h = (l.getAttribute('hreflang') || '').toLowerCase();
        var href = l.getAttribute('href');
        if (!h || h === 'x-default' || !href) return;
        // the alternates carry production URLs; navigate by path so the menu
        // works on any host, localhost and preview builds included
        try { alts[h] = new URL(href, window.location.href).pathname; }
        catch (e) { alts[h] = href; }
        routed = true;
      }
    );

    var here = (document.documentElement.lang || 'en').toLowerCase();
    function isHere(hl) {
      if (hl === here) return true;
      // zh-hans / zh-hant against a zh-CN or zh-TW document
      if (hl.indexOf('zh-') === 0 && here.indexOf('zh') === 0) {
        return (hl === 'zh-hant') === (here.indexOf('tw') > -1 || here.indexOf('hant') > -1);
      }
      return hl === here.split('-')[0];
    }

    if (routed) {
      items.forEach(function (it) {
        var hl = CODE_HREFLANG[it.getAttribute('data-code') || ''];
        var path = hl ? alts[hl] : null;
        it.classList.remove('is-active');
        if (!path) {
          it.disabled = true;
          it.classList.add('is-off');
          it.setAttribute('aria-disabled', 'true');
          return;
        }
        it.setAttribute('data-href', path);
        if (isHere(hl)) {
          it.classList.add('is-active');
          if (codeEl) codeEl.textContent = badge(it.getAttribute('data-code'));
          btn.setAttribute('aria-label', 'Language: ' + it.textContent.trim());
        }
      });
    }

    var RU_HOME = document.documentElement.hasAttribute('data-ru-home');
    var IS_RU = (document.documentElement.lang || '').toLowerCase().indexOf('ru') === 0;
    items.forEach(function (it) {
      it.addEventListener('click', function () {
        var code = it.getAttribute('data-code') || '';
        var path = it.getAttribute('data-href');
        if (path && path !== window.location.pathname) { window.location.href = path; return; }
        // the homepage exists in two languages — switching navigates for real
        if (RU_HOME && code === 'RU' && !IS_RU) { window.location.href = ROOT + 'ru/'; return; }
        if (RU_HOME && code === 'EN' && IS_RU) { window.location.href = ROOT || '/'; return; }
        if (path) { close(); return; }          // already on this language
        items.forEach(function (x) { x.classList.remove('is-active'); });
        it.classList.add('is-active');
        if (codeEl) codeEl.textContent = badge(code) || codeEl.textContent;
        btn.setAttribute('aria-label', 'Language: ' + it.textContent.trim());
        close();
      });
    });
  }

  /* ---------------- Cookie consent ---------------- */
  function initCookie() {
    var el = document.getElementById('cookie');
    if (!el) return;
    var stored;
    try { stored = localStorage.getItem('st_cookie_consent'); } catch (e) { stored = null; }
    if (stored) return;
    setTimeout(function () { el.classList.add('show'); document.body.classList.add('ck-open'); document.dispatchEvent(new Event('st:cookie')); }, 1300);
    function dismiss() {
      try { localStorage.setItem('st_cookie_consent', 'accepted'); } catch (e) {}
      el.classList.remove('show');
      document.body.classList.remove('ck-open');
      document.dispatchEvent(new Event('st:cookie'));
    }
    var x = document.getElementById('cookieClose');
    if (x) x.addEventListener('click', dismiss);
  }

  /* ---------------- Chat widget ---------------- */
  function initChat() {
    // Real support chat: the Zendesk snippet (requested via the feedback
    // sheet) replaces the demo chat panel site-wide. The snippet is loaded
    // lazily after the page settles so it never competes with LCP; the
    // demo fab/panel are removed so only one chat exists.
    var ZE_KEY = '1f3bcd95-0e9c-4848-aa01-f290f4a3a36d';
    if (ZE_KEY) {
      var panel = document.getElementById('chatPanel');
      if (panel) panel.remove();
      var fab = document.getElementById('chatFab');
      var loadZe = function () {
        if (document.getElementById('ze-snippet')) return;
        // brand the widget before it boots (honoured by the classic widget;
        // the messaging widget takes its colours from Admin Center)
        window.zESettings = {
          webWidget: {
            color: {
              theme: '#0047bb',
              launcher: '#0047bb',
              launcherText: '#ffffff',
              header: '#0047bb',
              button: '#0047bb'
            }
          }
        };
        var s = document.createElement('script');
        s.id = 'ze-snippet';
        s.src = 'https://static.zdassets.com/ekr/snippet.js?key=' + ZE_KEY;
        document.head.appendChild(s);
      };
      if (document.readyState === 'complete') setTimeout(loadZe, 1500);
      else window.addEventListener('load', function () { setTimeout(loadZe, 1500); });

      // our brand bubble is the launcher; Zendesk's stays hidden
      var whenZE = function (cb) {
        if (window.zE) cb();
        else setTimeout(function () { whenZE(cb); }, 300);
      };
      // the account may boot either Zendesk API — messaging ('messenger')
      // or the classic web widget ('webWidget'). Try both forms and never
      // remove the fab: it is the site's only launcher, so if Zendesk is
      // slow or unreachable the bubble stays put and retries on click.
      var zeApi = function (variants) {
        for (var i = 0; i < variants.length; i++) {
          try { zE.apply(null, variants[i]); return true; } catch (e) {}
        }
        return false;
      };
      var restoreFab = function () { if (fab) fab.style.visibility = ''; };
      whenZE(function () {
        zeApi([['messenger', 'hide'], ['webWidget', 'hide']]);
        zeApi([
          ['messenger:on', 'close', function () { zeApi([['messenger', 'hide']]); restoreFab(); }],
          ['webWidget:on', 'close', function () { zeApi([['webWidget', 'hide']]); restoreFab(); }]
        ]);
      });
      if (fab) fab.addEventListener('click', function () {
        whenZE(function () {
          var shown = zeApi([['messenger', 'show'], ['webWidget', 'show']]);
          var opened = zeApi([['messenger', 'open'], ['webWidget', 'open']]);
          if (shown || opened) fab.style.visibility = 'hidden';
        });
      });
      return;
    }
    var fab = document.getElementById('chatFab'), panel = document.getElementById('chatPanel'), close = document.getElementById('chatClose');
    if (!fab || !panel) return;
    var ck = document.getElementById('cookie');
    function setOpen(open) {
      fab.classList.toggle('open', open);
      panel.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (ck) { // avoid overlap on small screens
        if (open && ck.classList.contains('show')) { ck.dataset.wasShown = '1'; ck.classList.remove('show'); }
        else if (!open && ck.dataset.wasShown === '1') { ck.dataset.wasShown = ''; ck.classList.add('show'); }
      }
      if (open) { var t = document.getElementById('chatText'); if (t) setTimeout(function () { t.focus(); }, 220); }
    }
    fab.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    panel.querySelectorAll('.chat-chip').forEach(function (c) { c.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    var form = document.getElementById('chatForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = document.getElementById('chatText'); if (!t || !t.value.trim()) return;
      var body = panel.querySelector('.chat-body');
      var u = document.createElement('div'); u.className = 'chat-msg chat-msg-user'; u.textContent = t.value; body.appendChild(u);
      t.value = ''; body.scrollTop = body.scrollHeight;
      var typing = document.createElement('div'); typing.className = 'chat-typing'; typing.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(typing); body.scrollTop = body.scrollHeight;
      setTimeout(function () {
        typing.remove();
        var r = document.createElement('div'); r.className = 'chat-msg';
        r.textContent = 'Thanks for reaching out! A support agent will be with you shortly. For anything urgent, try the quick links above.';
        body.appendChild(r); body.scrollTop = body.scrollHeight;
      }, 1100);
    });
  }

  /* ---------------- Trading-account interactive panel ---------------- */
  function initTradingAccount() {
    var panel = document.querySelector('[data-ta-panel]');
    if (!panel) return;

    var accounts = {
      standard: { name: 'Standard', comm: '$0.00', commNote: 'commission-free*', spreadAdd: 1.0 },
      ecn:      { name: 'ECN',       comm: '$3.50', commNote: 'per lot / side',   spreadAdd: 0.3 },
      prime:    { name: 'Prime ECN', comm: '$2.00', commNote: 'per lot / side',   spreadAdd: 0.0 }
    };
    var products = {
      forex:       { sym: 'EUR/USD',  name: 'Euro / US Dollar', price: '1.0842',   dir: 'up',   chg: '+0.13%', base: 0.0,  lev: '1:500', dec: 4 },
      indices:     { sym: 'US500',    name: 'S&P 500 Index',    price: '5,732.3',  dir: 'up',   chg: '+0.90%', base: 0.4,  lev: '1:200', dec: 1 },
      metals:      { sym: 'XAU/USD',  name: 'Gold / US Dollar', price: '3,279.96', dir: 'up',   chg: '+1.18%', base: 0.12, lev: '1:500', dec: 2 },
      commodities: { sym: 'WTI',      name: 'Crude Oil',        price: '78.42',    dir: 'down', chg: '-0.32%', base: 0.03, lev: '1:200', dec: 2 },
      shares:      { sym: 'AAPL',     name: 'Apple Inc.',       price: '228.11',   dir: 'down', chg: '-0.21%', base: 0.05, lev: '1:20',  dec: 2 }
    };

    var state = { acct: 'prime', prod: 'forex' };

    var segBtns = Array.prototype.slice.call(panel.querySelectorAll('[data-acct]'));
    var tabBtns = Array.prototype.slice.call(panel.querySelectorAll('[data-prod]'));
    var elSym   = panel.querySelector('[data-el="sym"]');
    var elName  = panel.querySelector('[data-el="name"]');
    var elPrice = panel.querySelector('[data-el="price"]');
    var elChg   = panel.querySelector('[data-el="chg"]');
    var elSpread = panel.querySelector('[data-el="spread"]');
    var elComm  = panel.querySelector('[data-el="comm"]');
    var elCommNote = panel.querySelector('[data-el="comm-note"]');
    var elLev   = panel.querySelector('[data-el="lev"]');
    var elSpark = panel.querySelector('[data-el="spark"]');
    var elCta   = panel.querySelector('[data-el="cta"]');
    var mSpread = panel.querySelector('[data-metric="spread"]');
    var mComm   = panel.querySelector('[data-metric="comm"]');

    function flash(el) {
      if (!el || prefersReduced) return;
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    }

    function render(changed) {
      var a = accounts[state.acct], p = products[state.prod];
      var spread = (p.base + a.spreadAdd);
      var spreadTxt = spread <= 0.001 ? 'from 0.0' : spread.toFixed(1);
      if (elSym) elSym.textContent = p.sym;
      if (elName) elName.textContent = p.name;
      if (elPrice) elPrice.textContent = p.price;
      if (elChg) { elChg.textContent = p.chg; elChg.className = 'ta-quote-chg ' + p.dir; }
      if (elSpread) elSpread.innerHTML = spreadTxt + ' <em>pips</em>';
      if (elComm) elComm.textContent = a.comm;
      if (elCommNote) elCommNote.textContent = a.commNote;
      if (elLev) elLev.textContent = p.lev;
      if (elCta) elCta.innerHTML = 'Open ' + a.name + ' Account <svg class="ico"><use href="#i-arrow-right"/></svg>';
      if (elSpark) {
        elSpark.setAttribute('stroke', p.dir === 'up' ? '#34d99b' : '#ff6b6b');
        // re-trigger draw animation
        var np = elSpark.cloneNode(true); elSpark.parentNode.replaceChild(np, elSpark); elSpark = np;
      }
      segBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.acct === state.acct); });
      tabBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.prod === state.prod); });
      if (changed === 'prod' || changed === 'both') flash(mSpread);
      if (changed === 'acct' || changed === 'both') { flash(mSpread); flash(mComm); }
    }

    segBtns.forEach(function (b) { b.addEventListener('click', function () { state.acct = b.dataset.acct; render('acct'); }); });
    tabBtns.forEach(function (b) { b.addEventListener('click', function () { state.prod = b.dataset.prod; render('prod'); }); });
    render();

    // gentle live price tick on the currently shown instrument
    if (!prefersReduced) {
      var bases = {};
      Object.keys(products).forEach(function (k) { bases[k] = parseFloat(products[k].price.replace(/,/g, '')); });
      var cur = {}; Object.keys(bases).forEach(function (k) { cur[k] = bases[k]; });
      setInterval(function () {
        var p = products[state.prod], k = state.prod, b = bases[k];
        var step = b * 0.0009 * (Math.random() * 2 - 1);
        cur[k] = cur[k] + step + (b - cur[k]) * 0.05;
        var val = cur[k].toLocaleString('en-US', { minimumFractionDigits: p.dec, maximumFractionDigits: p.dec });
        if (elPrice) {
          elPrice.textContent = val;
          elPrice.classList.remove('fup', 'fdown'); void elPrice.offsetWidth;
          elPrice.classList.add(step >= 0 ? 'fup' : 'fdown');
        }
      }, 2200);
    }
  }

  /* ---------------- Prime ECN page interactions ---------------- */
  function initPrimeEcn() {
    // Live execution widget — tick the bid/ask and vary the fill latency
    var exec = document.querySelector('[data-pe-exec]');
    if (exec && !prefersReduced) {
      var bidEl = exec.querySelector('[data-el="bid"]');
      var askEl = exec.querySelector('[data-el="ask"]');
      var msEl = exec.querySelector('[data-el="ms"]');
      var base = 3279.95;
      var fmt = function (n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
      setInterval(function () {
        var mid = base + (Math.random() * 2 - 1) * 0.12;
        var up = Math.random() > 0.5;
        if (bidEl) bidEl.textContent = fmt(mid - 0.01);
        if (askEl) askEl.textContent = fmt(mid + 0.01);
        [bidEl, askEl].forEach(function (el) {
          if (!el) return;
          el.classList.remove('up', 'down'); void el.offsetWidth; el.classList.add(up ? 'up' : 'down');
        });
        if (msEl) msEl.textContent = 'Executed in ' + (32 + Math.floor(Math.random() * 13)) + ' ms';
      }, 1900);
    }

    // Vertical progress line through the upgrade steps
    var steps = document.querySelector('.pe-steps');
    if (steps) {
      var fill = steps.querySelector('.pe-steps-line i');
      var nums = Array.prototype.slice.call(steps.querySelectorAll('.pe-step-n'));
      if (prefersReduced || COARSE || !hasGSAP || !hasST) {
        if (fill) fill.style.transform = 'scaleY(1)';
        nums.forEach(function (n) { n.classList.add('is-on'); });
      } else {
        if (nums[0]) nums[0].classList.add('is-on');
        gsap.to(fill, {
          scaleY: 1, ease: 'none',
          scrollTrigger: {
            trigger: steps, start: 'top 72%', end: 'bottom 62%', scrub: 0.5,
            onUpdate: function (self) {
              var k = Math.ceil(self.progress * nums.length);
              nums.forEach(function (n, i) { n.classList.toggle('is-on', i < Math.max(1, k)); });
            }
          }
        });
      }
    }
  }

  /* ---------------- Styled dropdowns ----------------
     iOS gives a <select>'s popup to the OS and none of it can be styled, so
     every one on the site opened as a control the design does not own. The
     native element stays exactly where it is — same markup, same CSS, same
     name and value, so forms submit and every existing change listener still
     fires — but it stops taking pointer events, an invisible button over it
     takes the interaction, and the list is drawn as a panel we can style.
     Options are read at open time, so the selects that build their own list
     (webinars sessions, the calendar's instruments) need no hook. */
  function initSelects() {
    var list = Array.prototype.slice.call(document.querySelectorAll('select:not([data-native])'));
    if (!list.length) return;
    var openOne = null;

    function labelFor(sel) {
      if (sel.getAttribute('aria-label')) return sel.getAttribute('aria-label');
      var by = sel.getAttribute('aria-labelledby');
      if (by) {
        var t = document.getElementById(by.split(' ')[0]);
        if (t) return (t.textContent || '').trim();
      }
      if (sel.id) {
        var l = document.querySelector('label[for="' + sel.id + '"]');
        if (l) return (l.textContent || '').trim();
      }
      return sel.name || 'Select an option';
    }

    // a dark control wants a dark list; read it off the control's own text
    function isDark(sel) {
      var c = getComputedStyle(sel).color.match(/[\d.]+/g);
      if (!c) return false;
      var lum = (0.299 * +c[0] + 0.587 * +c[1] + 0.114 * +c[2]) / 255;
      return lum > 0.5;
    }

    function enhance(sel) {
      if (sel.closest('.stsel')) return;
      var wrap = document.createElement('span');
      wrap.className = 'stsel';
      sel.parentNode.insertBefore(wrap, sel);
      wrap.appendChild(sel);
      sel.classList.add('stsel-native');
      sel.setAttribute('tabindex', '-1');
      sel.setAttribute('aria-hidden', 'true');

      var hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'stsel-hit';
      hit.setAttribute('role', 'combobox');
      hit.setAttribute('aria-haspopup', 'listbox');
      hit.setAttribute('aria-expanded', 'false');
      hit.setAttribute('aria-label', labelFor(sel));
      wrap.appendChild(hit);
      if (sel.disabled) hit.disabled = true;

      var panel = null, opts = [], active = -1, typed = '', typedAt = 0;

      function close(focusBack) {
        if (!panel) return;
        panel.remove(); panel = null; opts = []; active = -1;
        hit.setAttribute('aria-expanded', 'false');
        wrap.classList.remove('is-open');
        openOne = null;
        document.removeEventListener('mousedown', onOutside, true);
        window.removeEventListener('resize', onReflow);
        window.removeEventListener('scroll', onReflow, true);
        if (focusBack) hit.focus();
      }

      function onOutside(e) { if (!panel.contains(e.target) && e.target !== hit) close(false); }
      function onReflow() { place(); }

      // the panel hangs under the control, flips above it when the room is
      // there instead, and is clamped inside the viewport either way — a
      // smooth-scroll library settling mid-open must not push it off screen
      var placedBelow = true; // side chosen at open time; reflows keep it
      function place(initial) {
        if (!panel) return;
        var vh = window.innerHeight, vw = window.innerWidth;
        var r = sel.getBoundingClientRect();
        // a resize or scroll that carries the control out of the viewport
        // must take the list with it — the clamp below would otherwise leave
        // the panel pinned to the viewport edge, floating detached over
        // whatever content reflowed into its place
        if (r.bottom < -4 || r.top > vh + 4) { close(false); return; }
        var w = Math.max(r.width, 180);
        panel.style.width = w + 'px';
        panel.style.left = Math.max(8, Math.min(r.left, vw - w - 8)) + 'px';
        var below = vh - r.bottom - 12, above = r.top - 12;
        if (initial) placedBelow = below > 180 || below >= above;
        var room = placedBelow ? below : above;
        // mid-scroll the panel never switches sides — re-anchoring to the
        // other edge of the control mid-gesture reads as a detached panel
        // hovering over unrelated fields (IT 8.24 round, style row 70). when
        // the opened side runs out of room, the list closes instead.
        if (!initial && room < Math.min(140, panel.scrollHeight)) { close(false); return; }
        // the sticky chrome owns the top of the viewport. The panel already
        // sits below it in the stacking order (styles.css, 8.26 round), so a
        // list clamped to y=8 would hide behind the menu rather than over it
        // — it is pinned under the chrome instead, and trimmed to the gap the
        // chrome leaves, so every option stays reachable (IT 9.01 round).
        var ceil = 8, chrome = [document.querySelector('.topbar'), document.querySelector('.site-header')];
        for (var ci = 0; ci < chrome.length; ci++) {
          var cel = chrome[ci];
          if (!cel || !cel.getClientRects().length) continue;
          var cpos = getComputedStyle(cel).position;
          if (cpos !== 'sticky' && cpos !== 'fixed') continue;
          var crect = cel.getBoundingClientRect();
          if (crect.top < vh && crect.bottom + 6 > ceil) ceil = crect.bottom + 6;
        }
        var max = Math.max(140, Math.min(300, Math.max(room, 140)));
        max = Math.min(max, Math.max(140, vh - ceil - 8));
        panel.style.maxHeight = max + 'px';
        panel.style.bottom = 'auto';
        var h = Math.min(max, panel.scrollHeight);
        var top = placedBelow ? r.bottom + 6 : r.top - 6 - h;
        panel.style.top = Math.max(ceil, Math.min(top, vh - h - 8)) + 'px';
      }

      function setActive(i) {
        if (!opts.length) return;
        active = Math.max(0, Math.min(opts.length - 1, i));
        opts.forEach(function (o, n) {
          o.el.classList.toggle('is-active', n === active);
          o.el.setAttribute('aria-selected', n === active ? 'true' : 'false');
        });
        var el = opts[active].el;
        var pr = panel.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (er.bottom > pr.bottom) panel.scrollTop += er.bottom - pr.bottom;
        else if (er.top < pr.top) panel.scrollTop -= pr.top - er.top;
      }

      function choose(i) {
        var o = opts[i];
        if (!o) return;
        if (sel.value !== o.value) {
          sel.value = o.value;
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        close(true);
      }

      function open() {
        if (panel) { close(true); return; }
        if (openOne) openOne();
        panel = document.createElement('div');
        panel.className = 'stsel-panel' + (isDark(sel) ? ' stsel-panel--dark' : '');
        panel.setAttribute('role', 'listbox');
        panel.tabIndex = -1;
        opts = [];
        Array.prototype.forEach.call(sel.options, function (o, i) {
          var el = document.createElement('div');
          el.className = 'stsel-opt' + (o.disabled ? ' is-disabled' : '');
          el.setAttribute('role', 'option');
          el.textContent = o.textContent;
          el.title = o.textContent;
          if (!o.disabled) {
            el.addEventListener('click', function () { choose(opts.indexOf(rec)); });
            el.addEventListener('mousemove', function () { setActive(opts.indexOf(rec)); });
          }
          var rec = { el: el, value: o.value, text: o.textContent, disabled: o.disabled, i: i };
          opts.push(rec);
          panel.appendChild(el);
        });
        document.body.appendChild(panel);
        hit.setAttribute('aria-expanded', 'true');
        wrap.classList.add('is-open');
        place(true);
        if (!panel) return; // place() closes when the control sits off-screen
        var cur = sel.selectedIndex;
        setActive(cur > -1 ? cur : 0);
        panel.focus();
        openOne = function () { close(false); };
        document.addEventListener('mousedown', onOutside, true);
        window.addEventListener('resize', onReflow);
        window.addEventListener('scroll', onReflow, true);
        panel.addEventListener('keydown', onKeys);
      }

      function jump(ch) {
        var now = Date.now();
        typed = (now - typedAt < 900 ? typed : '') + ch.toLowerCase();
        typedAt = now;
        for (var n = 0; n < opts.length; n++) {
          var k = (active + 1 + n) % opts.length;
          if (!opts[k].disabled && opts[k].text.toLowerCase().indexOf(typed) === 0) { setActive(k); return; }
        }
      }

      function onKeys(e) {
        var k = e.key;
        if (k === 'Escape') { e.preventDefault(); close(true); }
        else if (k === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
        else if (k === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
        else if (k === 'Home') { e.preventDefault(); setActive(0); }
        else if (k === 'End') { e.preventDefault(); setActive(opts.length - 1); }
        else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(active); }
        else if (k === 'Tab') { close(false); }
        else if (k.length === 1) { jump(k); }
      }

      hit.addEventListener('click', function (e) { e.preventDefault(); open(); });
      hit.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); open(); }
        else if (k.length === 1 && /\S/.test(k)) { open(); jump(k); }
      });
    }

    list.forEach(function (sel) { try { enhance(sel); } catch (e) {} });
  }

  /* ---------------- Funding page interactions ---------------- */
  function initFunding() {
    // Deposit / Withdrawal tabs
    var tabs = document.querySelector('[data-fund-tabs]');
    if (tabs) {
      var btns = Array.prototype.slice.call(tabs.querySelectorAll('.fund-tab'));
      var grids = Array.prototype.slice.call(document.querySelectorAll('[data-pay-grid]'));
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var t = b.dataset.tab;
          tabs.classList.toggle('is-withdraw', t === 'withdraw');
          btns.forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
          grids.forEach(function (g) {
            var show = g.dataset.payGrid === t;
            g.hidden = !show;
            if (show && !prefersReduced) { g.classList.remove('pay-in'); void g.offsetWidth; g.classList.add('pay-in'); }
          });
        });
      });
    }

    // Fee-free deposit calculator
    var calc = document.querySelector('[data-calc]');
    if (calc) {
      var input = calc.querySelector('[data-el="amt"]');
      var chips = Array.prototype.slice.call(calc.querySelectorAll('[data-amt]'));
      var out = calc.querySelector('[data-el="credited"]');
      var money = function (n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
      var syncChips = function (v) { chips.forEach(function (c) { c.classList.toggle('active', parseFloat(c.dataset.amt) === v); }); };
      var flash = function () { if (out && !prefersReduced) { out.classList.remove('flash'); void out.offsetWidth; out.classList.add('flash'); } };
      var commit = function (v) {
        v = Math.max(0, Math.round(v || 0));
        if (input) input.value = Number(v).toLocaleString('en-US');
        if (out) out.textContent = money(v);
        syncChips(v); flash();
      };
      if (input) {
        input.addEventListener('input', function () {
          var v = parseFloat(this.value.replace(/[^0-9.]/g, '')) || 0;
          if (out) out.textContent = money(v);
          syncChips(Math.round(v));
        });
        input.addEventListener('blur', function () { commit(parseFloat(this.value.replace(/[^0-9.]/g, '')) || 0); });
      }
      chips.forEach(function (c) { c.addEventListener('click', function () { commit(parseFloat(c.dataset.amt)); }); });
      commit(1000);
    }
  }

  /* ---------------- Forex page interactions ---------------- */
  function initForex() {
    initForexPairs();
    initForexHours();
    initForexHeroQuotes();
    initForexWhy();
  }

  function initForexWhy() {
    var counters = Array.prototype.slice.call(document.querySelectorAll('.fx-why [data-fx-count]'));
    if (!counters.length) return;

    function countUp(el, end, suf) {
      var dur = 1300, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function start(el) {
      var end = parseFloat(el.dataset.fxCount), suf = el.dataset.suffix || '';
      if (isNaN(end)) return;
      if (prefersReduced || !window.requestAnimationFrame) { el.textContent = end + suf; return; }
      countUp(el, end, suf);
      // replay the count on a calm loop so the card never reads as static
      setInterval(function () { el.textContent = '0' + suf; countUp(el, end, suf); }, 4600);
    }

    if (!('IntersectionObserver' in window)) { counters.forEach(start); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { start(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  function initForexPairs() {
    var root = document.querySelector('[data-fx-pairs]');
    if (!root) return;
    var body = root.querySelector('[data-fx-body]');
    var cats = Array.prototype.slice.call(root.querySelectorAll('[data-fx-cat]'));
    if (!body) return;

    // mid price + typical spread per instrument.
    // forex: `spread` is in pips (converted with the pair's pip size).
    // commodities: `spread` is already in price units, so the pip size is 1.
    // currency -> flag file, and commodity symbol -> instrument icon file
    var FLAG = {
      EUR: 'eu', USD: 'us', GBP: 'gb', JPY: 'jp', CHF: 'ch', AUD: 'au', CAD: 'ca',
      NZD: 'nz', TRY: 'tr', ZAR: 'south-africa', MXN: 'mx', SGD: 'sg', HKD: 'hk'
    };
    function flagImg(code) {
      var f = FLAG[code];
      return f ? '<img src="' + ROOT + 'assets/img/flags/' + f + '.svg" alt="" loading="lazy">' : '';
    }

    var SETS = {
      forex: {
        pip: function (p) { return p.sym.indexOf('JPY') > -1 ? 0.01 : 0.0001; },
        badge: function (p) {
          var c = p.sym.split('/');
          return '<span class="fx-pair-flags">' + flagImg(c[0]) + flagImg(c[1]) + '</span>';
        },
        spread: function (s) { return s.toFixed(1); },
        floor: function () { return 0.1; },
        data: null
      },
      commodities: {
        pip: function () { return 1; },
        badge: function (p) {
          return '<span class="fx-inst-ic"><img src="' + ROOT + 'assets/img/commodities/' + p.icon + '.svg" alt="' + p.name + ' icon" loading="lazy"></span>';
        },
        spread: function (s, p) { return s.toFixed(p.sdec); },
        floor: function (p) { return p.spread * 0.6; },
        data: {
          metals: [
            { sym: 'XAU/USD', name: 'Gold Spot / US Dollar', icon: 'xau', badge: 'AU', mid: 2338.50, dec: 2, spread: 0.18, sdec: 2 },
            { sym: 'XAG/USD', name: 'Silver Spot / US Dollar', icon: 'xag', badge: 'AG', mid: 27.420, dec: 3, spread: 0.016, sdec: 3 },
            { sym: 'XPT/USD', name: 'Platinum Spot / US Dollar', icon: 'xpt', badge: 'PT', mid: 985.40, dec: 2, spread: 1.80, sdec: 2 },
            { sym: 'XPD/USD', name: 'Palladium Spot / US Dollar', icon: 'xpd', badge: 'PD', mid: 1012.00, dec: 2, spread: 3.50, sdec: 2 },
            { sym: 'COPPER', name: 'Copper Futures CFD', icon: 'copper', badge: 'CU', mid: 4.4820, dec: 4, spread: 0.0035, sdec: 4 }
          ],
          energy: [
            { sym: 'XTI/USD', name: 'WTI Crude Oil', icon: 'xti', badge: 'WTI', mid: 78.42, dec: 2, spread: 0.030, sdec: 3 },
            { sym: 'XBR/USD', name: 'Brent Crude Oil', icon: 'xbr', badge: 'BRN', mid: 82.15, dec: 2, spread: 0.030, sdec: 3 },
            { sym: 'XNG/USD', name: 'Natural Gas', icon: 'xng', badge: 'GAS', mid: 2.7480, dec: 4, spread: 0.0060, sdec: 4 },
            { sym: 'HOIL', name: 'Heating Oil Futures CFD', icon: 'hoil', badge: 'HO', mid: 2.4180, dec: 4, spread: 0.0045, sdec: 4 }
          ],
          agriculture: [
            { sym: 'WHEAT', name: 'Wheat Futures CFD', icon: 'wheat', badge: 'WHT', mid: 578.25, dec: 2, spread: 1.20, sdec: 2 },
            { sym: 'CORN', name: 'Corn Futures CFD', icon: 'corn', badge: 'CRN', mid: 442.50, dec: 2, spread: 1.00, sdec: 2 },
            { sym: 'SOYBEAN', name: 'Soybean Futures CFD', icon: 'soybean', badge: 'SOY', mid: 1148.50, dec: 2, spread: 1.50, sdec: 2 },
            { sym: 'COFFEE', name: 'Coffee Futures CFD', icon: 'coffee', badge: 'KC', mid: 231.40, dec: 2, spread: 0.90, sdec: 2 },
            { sym: 'SUGAR', name: 'Sugar Futures CFD', icon: 'sugar', badge: 'SB', mid: 19.85, dec: 2, spread: 0.060, sdec: 3 },
            { sym: 'COCOA', name: 'Cocoa Futures CFD', icon: 'cocoa', badge: 'CC', mid: 7420.0, dec: 1, spread: 12.0, sdec: 1 },
            { sym: 'COTTON', name: 'Cotton Futures CFD', icon: 'cotton', badge: 'CT', mid: 68.35, dec: 2, spread: 0.25, sdec: 2 }
          ]
        }
      }
    };

    var data = {
      major: [
        { sym: 'EUR/USD', name: 'Euro / US Dollar', mid: 1.08420, dec: 5, spread: 0.2 },
        { sym: 'GBP/USD', name: 'British Pound / US Dollar', mid: 1.27180, dec: 5, spread: 0.4 },
        { sym: 'USD/JPY', name: 'US Dollar / Japanese Yen', mid: 156.820, dec: 3, spread: 0.5 },
        { sym: 'USD/CHF', name: 'US Dollar / Swiss Franc', mid: 0.89340, dec: 5, spread: 0.6 },
        { sym: 'AUD/USD', name: 'Australian Dollar / US Dollar', mid: 0.66120, dec: 5, spread: 0.5 },
        { sym: 'USD/CAD', name: 'US Dollar / Canadian Dollar', mid: 1.36890, dec: 5, spread: 0.7 }
      ],
      minor: [
        { sym: 'EUR/GBP', name: 'Euro / British Pound', mid: 0.85240, dec: 5, spread: 1.2 },
        { sym: 'EUR/JPY', name: 'Euro / Japanese Yen', mid: 170.040, dec: 3, spread: 1.5 },
        { sym: 'GBP/JPY', name: 'British Pound / Japanese Yen', mid: 199.480, dec: 3, spread: 2.2 },
        { sym: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', mid: 103.690, dec: 3, spread: 1.8 },
        { sym: 'EUR/AUD', name: 'Euro / Australian Dollar', mid: 1.63980, dec: 5, spread: 2.0 },
        { sym: 'NZD/JPY', name: 'NZ Dollar / Japanese Yen', mid: 95.420, dec: 3, spread: 2.4 }
      ],
      exotic: [
        { sym: 'USD/TRY', name: 'US Dollar / Turkish Lira', mid: 32.6400, dec: 4, spread: 18 },
        { sym: 'USD/ZAR', name: 'US Dollar / South African Rand', mid: 18.2400, dec: 4, spread: 22 },
        { sym: 'USD/MXN', name: 'US Dollar / Mexican Peso', mid: 17.0800, dec: 4, spread: 20 },
        { sym: 'USD/SGD', name: 'US Dollar / Singapore Dollar', mid: 1.34860, dec: 5, spread: 6 },
        { sym: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', mid: 7.80910, dec: 5, spread: 8 },
        { sym: 'EUR/TRY', name: 'Euro / Turkish Lira', mid: 35.3900, dec: 4, spread: 28 }
      ]
    };

    // real marks rather than lettered tiles: a commodity glyph, a flag pair for
    // a currency cross, or the listing country's flag
    function instBadge(p) {
      if (p.icon) return '<span class="fx-inst-ic"><img src="' + ROOT + 'assets/img/commodities/' + p.icon + '.svg" alt="" loading="lazy"></span>';
      if (p.pair) {
        var c = p.sym.split('/');
        return '<span class="fx-pair-flags">' + flagImg(c[0]) + flagImg(c[1]) + '</span>';
      }
      if (p.flag) return '<span class="fx-inst-ic"><img src="' + ROOT + 'assets/img/flags/' + p.flag + '.svg" alt="" loading="lazy"></span>';
      return '<span class="fx-inst-tx">' + (p.badge || p.sym) + '</span>';
    }
    function txSet(rows) {
      return {
        pip: function () { return 1; },
        badge: instBadge,
        spread: function (v, p) { return v.toFixed(p.sdec); },
        floor: function (p) { return p.spread * 0.6; },
        data: rows
      };
    }

    SETS.indices = txSet({
      americas: [
        { sym: 'US30', name: 'Dow Jones 30 Index', flag: 'us', mid: 39142.0, dec: 1, spread: 2.0, sdec: 1 },
        { sym: 'US500', name: 'S&P 500 Index', flag: 'us', mid: 5263.40, dec: 2, spread: 0.60, sdec: 2 },
        { sym: 'NAS100', name: 'Nasdaq 100 Index', flag: 'us', mid: 18642.5, dec: 1, spread: 1.20, sdec: 1 },
        { sym: 'US2000', name: 'Russell 2000 Index', flag: 'us', mid: 2085.40, dec: 2, spread: 1.40, sdec: 2 },
        { sym: 'CA60', name: 'Canada 60 Index', flag: 'ca', mid: 1284.60, dec: 2, spread: 1.60, sdec: 2 },
        { sym: 'BRZ60', name: 'Brazil 60 Index', flag: 'br', mid: 126480, dec: 0, spread: 40, sdec: 0 }
      ],
      europe: [
        { sym: 'GER40', name: 'Germany 40 Index', flag: 'de', mid: 18214.7, dec: 1, spread: 1.00, sdec: 1 },
        { sym: 'UK100', name: 'UK 100 Index', flag: 'gb', mid: 8215.40, dec: 2, spread: 1.20, sdec: 2 },
        { sym: 'FRA40', name: 'France 40 Index', flag: 'fr', mid: 8062.50, dec: 2, spread: 1.40, sdec: 2 },
        { sym: 'EUSTX50', name: 'Euro Stoxx 50 Index', flag: 'eu', mid: 5010.20, dec: 2, spread: 1.60, sdec: 2 },
        { sym: 'NETH25', name: 'Netherlands 25 Index', flag: 'nl', mid: 912.40, dec: 2, spread: 1.20, sdec: 2 },
        { sym: 'SWI20', name: 'Switzerland 20 Index', flag: 'ch', mid: 12048.0, dec: 1, spread: 4.00, sdec: 1 }
      ],
      asia: [
        { sym: 'JPN225', name: 'Japan 225 Index', flag: 'jp', mid: 39980.0, dec: 1, spread: 8.00, sdec: 1 },
        { sym: 'HK50', name: 'Hong Kong 50 Index', flag: 'hk', mid: 18320.0, dec: 1, spread: 8.00, sdec: 1 },
        { sym: 'AUS200', name: 'Australia 200 Index', flag: 'au', mid: 7810.50, dec: 2, spread: 1.60, sdec: 2 },
        { sym: 'SGP20', name: 'Singapore 20 Index', flag: 'sg', mid: 3402.80, dec: 2, spread: 1.80, sdec: 2 },
        { sym: 'TWN50', name: 'Taiwan 50 Index', flag: 'tw', mid: 19640.0, dec: 1, spread: 9.00, sdec: 1 }
      ]
    });

    SETS.shares = txSet({
      ustech: [
        { sym: 'AAPL', name: 'Apple Inc.', flag: 'us', mid: 214.20, dec: 2, spread: 0.06, sdec: 2 },
        { sym: 'MSFT', name: 'Microsoft Corporation', flag: 'us', mid: 441.50, dec: 2, spread: 0.09, sdec: 2 },
        { sym: 'NVDA', name: 'NVIDIA Corporation', flag: 'us', mid: 126.40, dec: 2, spread: 0.05, sdec: 2 },
        { sym: 'GOOGL', name: 'Alphabet Inc. Class A', flag: 'us', mid: 178.30, dec: 2, spread: 0.06, sdec: 2 },
        { sym: 'AMZN', name: 'Amazon.com Inc.', flag: 'us', mid: 186.10, dec: 2, spread: 0.06, sdec: 2 }
      ],
      usbroad: [
        { sym: 'TSLA', name: 'Tesla Inc.', flag: 'us', mid: 248.60, dec: 2, spread: 0.11, sdec: 2 },
        { sym: 'JPM', name: 'JPMorgan Chase & Co.', flag: 'us', mid: 204.80, dec: 2, spread: 0.08, sdec: 2 },
        { sym: 'KO', name: 'The Coca-Cola Company', flag: 'us', mid: 63.40, dec: 2, spread: 0.04, sdec: 2 },
        { sym: 'BA', name: 'The Boeing Company', flag: 'us', mid: 178.90, dec: 2, spread: 0.10, sdec: 2 }
      ],
      intl: [
        { sym: 'ASML', name: 'ASML Holding N.V.', flag: 'nl', mid: 982.50, dec: 2, spread: 0.42, sdec: 2 },
        { sym: 'SAP', name: 'SAP SE', flag: 'de', mid: 188.20, dec: 2, spread: 0.12, sdec: 2 },
        { sym: 'MC', name: 'LVMH Moet Hennessy', flag: 'fr', mid: 712.00, dec: 2, spread: 0.38, sdec: 2 },
        { sym: '7203', name: 'Toyota Motor Corporation', flag: 'jp', mid: 2842.0, dec: 1, spread: 1.60, sdec: 1 }
      ]
    });

    SETS.etfs = txSet({
      equity: [
        { sym: 'SPY', name: 'SPDR S&P 500 ETF Trust', flag: 'us', mid: 526.30, dec: 2, spread: 0.07, sdec: 2 },
        { sym: 'QQQ', name: 'Invesco QQQ Trust', flag: 'us', mid: 455.10, dec: 2, spread: 0.07, sdec: 2 },
        { sym: 'IWM', name: 'iShares Russell 2000 ETF', flag: 'us', mid: 208.40, dec: 2, spread: 0.06, sdec: 2 },
        { sym: 'EEM', name: 'iShares MSCI Emerging Markets', flag: 'us', mid: 43.20, dec: 2, spread: 0.04, sdec: 2 }
      ],
      commodity: [
        { sym: 'GLD', name: 'SPDR Gold Shares', icon: 'xau', mid: 216.80, dec: 2, spread: 0.07, sdec: 2 },
        { sym: 'SLV', name: 'iShares Silver Trust', icon: 'xag', mid: 25.10, dec: 2, spread: 0.04, sdec: 2 },
        { sym: 'USO', name: 'United States Oil Fund', icon: 'xti', mid: 78.90, dec: 2, spread: 0.06, sdec: 2 }
      ],
      bond: [
        { sym: 'TLT', name: 'iShares 20+ Year Treasury Bond', flag: 'us', mid: 94.60, dec: 2, spread: 0.05, sdec: 2 },
        { sym: 'AGG', name: 'iShares Core US Aggregate Bond', flag: 'us', mid: 97.20, dec: 2, spread: 0.04, sdec: 2 },
        { sym: 'HYG', name: 'iShares High Yield Corporate Bond', flag: 'us', mid: 78.50, dec: 2, spread: 0.04, sdec: 2 }
      ]
    });

    SETS.cfd = txSet({
      fx: [
        { sym: 'EUR/USD', name: 'Euro / US Dollar', pair: 1, mid: 1.08420, dec: 5, spread: 0.00002, sdec: 5 },
        { sym: 'GBP/USD', name: 'British Pound / US Dollar', pair: 1, mid: 1.27180, dec: 5, spread: 0.00004, sdec: 5 },
        { sym: 'USD/JPY', name: 'US Dollar / Japanese Yen', pair: 1, mid: 156.820, dec: 3, spread: 0.005, sdec: 3 },
        { sym: 'AUD/USD', name: 'Australian Dollar / US Dollar', pair: 1, mid: 0.66120, dec: 5, spread: 0.00005, sdec: 5 }
      ],
      commodities: [
        { sym: 'XAU/USD', name: 'Gold Spot / US Dollar', icon: 'xau', mid: 2338.50, dec: 2, spread: 0.18, sdec: 2 },
        { sym: 'XAG/USD', name: 'Silver Spot / US Dollar', icon: 'xag', mid: 27.420, dec: 3, spread: 0.016, sdec: 3 },
        { sym: 'XTI/USD', name: 'WTI Crude Oil', icon: 'xti', mid: 78.42, dec: 2, spread: 0.030, sdec: 3 },
        { sym: 'XNG/USD', name: 'Natural Gas', icon: 'xng', mid: 2.7480, dec: 4, spread: 0.0060, sdec: 4 }
      ],
      equities: [
        { sym: 'US30', name: 'Dow Jones 30 Index', flag: 'us', mid: 39142.0, dec: 1, spread: 2.0, sdec: 1 },
        { sym: 'GER40', name: 'Germany 40 Index', flag: 'de', mid: 18214.7, dec: 1, spread: 1.00, sdec: 1 },
        { sym: 'AAPL', name: 'Apple Inc.', flag: 'us', mid: 214.20, dec: 2, spread: 0.06, sdec: 2 },
        { sym: 'ASML', name: 'ASML Holding N.V.', flag: 'nl', mid: 982.50, dec: 2, spread: 0.42, sdec: 2 }
      ]
    });

    SETS.forex.data = data;
    var set = SETS[root.dataset.fxPairs] || SETS.forex;
    var firstCat = (cats.filter(function (c) { return c.classList.contains('active'); })[0] || cats[0] || {}).dataset;
    var defaultCat = (firstCat && firstCat.fxCat) || Object.keys(set.data)[0];

    var live = [];
    function fmt(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

    function render(cat) {
      var rows = set.data[cat] || set.data[defaultCat];
      var html = rows.map(function (p) {
        var pip = set.pip(p);
        var half = (p.spread * pip) / 2;
        var bid = p.mid - half, ask = p.mid + half;
        return '<tr>' +
          '<td><span class="spec-feat">' + set.badge(p) +
          '<span class="fx-pair-name">' + p.sym + '<em>' + p.name + '</em></span></span></td>' +
          '<td><span class="fx-px" data-el="bid">' + fmt(bid, p.dec) + '</span></td>' +
          '<td><span class="fx-px" data-el="ask">' + fmt(ask, p.dec) + '</span></td>' +
          '<td><span class="fx-spread-pill" data-el="spread">' + set.spread(p.spread, p) + '</span></td>' +
          '<td class="ta-td-act"><a class="fx-trade" href="https://www.startrader.com/live-account/">' +
          'Trade<svg aria-hidden="true"><use href="#i-arrow-right"/></svg>' +
          '<span class="sr-only"> ' + p.sym + '</span></a></td>' +
          '</tr>';
      }).join('');
      body.innerHTML = html;

      // collect live refs
      live = [];
      var trs = body.querySelectorAll('tr');
      rows.forEach(function (p, i) {
        var tr = trs[i]; if (!tr) return;
        live.push({
          p: p, pip: set.pip(p), cur: p.mid, spread: p.spread,
          bidEl: tr.querySelector('[data-el="bid"]'),
          askEl: tr.querySelector('[data-el="ask"]'),
          spreadEl: tr.querySelector('[data-el="spread"]')
        });
      });
    }

    function tick() {
      if (prefersReduced) return;
      live.forEach(function (r) {
        if (Math.random() > 0.6) return;
        var step = r.p.mid * 0.00035 * (Math.random() * 2 - 1);
        r.cur = r.cur + step + (r.p.mid - r.cur) * 0.06;
        // occasional spread widening for realism (floor is per-set: 0.1 pip on forex,
        // relative on commodities where a spread can legitimately be well under 0.1)
        var sp = Math.max(set.floor(r.p), r.p.spread * (0.85 + Math.random() * 0.5));
        var half = (sp * r.pip) / 2;
        if (r.bidEl) r.bidEl.textContent = fmt(r.cur - half, r.p.dec);
        if (r.askEl) r.askEl.textContent = fmt(r.cur + half, r.p.dec);
        if (r.spreadEl) r.spreadEl.textContent = set.spread(sp, r.p);
        [r.bidEl, r.askEl].forEach(function (el) {
          if (!el) return;
          el.classList.remove('fup', 'fdown'); void el.offsetWidth;
          el.classList.add(step >= 0 ? 'fup' : 'fdown');
        });
      });
    }

    cats.forEach(function (c) {
      c.addEventListener('click', function () {
        cats.forEach(function (x) { x.classList.toggle('active', x === c); x.setAttribute('aria-selected', x === c ? 'true' : 'false'); });
        render(c.dataset.fxCat);
      });
    });

    render(defaultCat);
    setInterval(tick, 1500);
  }

  function initForexHours() {
    var panel = document.querySelector('[data-fx-hours]');
    if (!panel) return;
    var clockEl = panel.querySelector('[data-fx-clock]');
    var sessEls = Array.prototype.slice.call(panel.querySelectorAll('[data-sess]'));
    if (!sessEls.length && !clockEl) return;

    function inSession(h, o, c) { return o < c ? (h >= o && h < c) : (h >= o || h < c); }

    function update() {
      var d = new Date();
      var h = d.getUTCHours(), m = d.getUTCMinutes();
      var frac = h + m / 60;
      sessEls.forEach(function (el) {
        var o = parseFloat(el.dataset.open), c = parseFloat(el.dataset.close);
        el.classList.toggle('is-open', inSession(frac, o, c));
      });
      if (clockEl) clockEl.textContent = 'GMT ' + ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
    }
    update();
    setInterval(update, 30000);
  }

  function initForexHeroQuotes() {
    if (prefersReduced) return;
    var quotes = Array.prototype.slice.call(document.querySelectorAll('[data-fx-quote]'));
    if (!quotes.length) return;
    var refs = quotes.map(function (q) {
      var pxEl = q.querySelector('.q-px');
      var base = parseFloat((pxEl ? pxEl.textContent : '0').replace(/,/g, '')) || 0;
      return { pxEl: pxEl, chgEl: q.querySelector('.q-chg'), base: base, cur: base, dec: (pxEl && pxEl.textContent.split('.')[1] || '').length };
    });
    setInterval(function () {
      refs.forEach(function (r) {
        if (!r.pxEl || Math.random() > 0.7) return;
        var step = r.base * 0.0006 * (Math.random() * 2 - 1);
        r.cur = r.cur + step + (r.base - r.cur) * 0.05;
        r.pxEl.textContent = r.cur.toLocaleString('en-US', { minimumFractionDigits: r.dec, maximumFractionDigits: r.dec });
        var chg = ((r.cur - r.base) / r.base) * 100;
        if (r.chgEl) { r.chgEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%'; r.chgEl.className = 'q-chg ' + (chg >= 0 ? 'up' : 'down'); }
      });
    }, 2000);
  }

  /* ---------------- How-to-trade steps (shared component) ---------------- */
  function initHowToTrade() {
    // every stepper on the page, so a switched panel animates like the visible one
    document.querySelectorAll('[data-htrade]').forEach(htradeList);
  }

  function htradeList(list) {
    var steps = Array.prototype.slice.call(list.querySelectorAll('.htrade-step'));
    if (!steps.length) return;

    function setActive(i) {
      steps.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
    }

    // the connector rail runs from the first pill's centre to the last pill's centre
    function layoutRail() {
      var first = steps[0].querySelector('.htrade-num');
      var last = steps[steps.length - 1].querySelector('.htrade-num');
      if (!first || !last) return;
      var lr = list.getBoundingClientRect(), fr = first.getBoundingClientRect(), sr = last.getBoundingClientRect();
      var top = fr.top - lr.top + fr.height / 2;
      list.style.setProperty('--htrade-x', (fr.left - lr.left + fr.width / 2) + 'px');
      list.style.setProperty('--htrade-y', top + 'px');
      list.style.setProperty('--htrade-h', ((sr.top - lr.top + sr.height / 2) - top) + 'px');
    }
    layoutRail();
    var railT;
    window.addEventListener('resize', function () {
      clearTimeout(railT);
      railT = setTimeout(layoutRail, 150);
    });
    // a hidden panel measures as zero, so re-measure when a tab switch refreshes
    if (hasST) ScrollTrigger.addEventListener('refresh', layoutRail);

    if (prefersReduced || !hasGSAP || !hasST) {
      list.style.setProperty('--htrade-rail', '1');
      return;
    }

    // rail fills as the list scrolls through the viewport
    gsap.to(list, {
      '--htrade-rail': 1, ease: 'none',
      scrollTrigger: { trigger: list, start: 'top 76%', end: 'bottom 74%', scrub: 0.6 }
    });

    // one step highlighted at a time, following the scroll position.
    // touch pointers used to be excluded here, which left the highlight
    // frozen on phones and in responsive-mode testing (IT 8.25, item 5)
    steps.forEach(function (s, i) {
      ScrollTrigger.create({
        trigger: s, start: 'top 66%', end: 'bottom 44%',
        onEnter: function () { setActive(i); },
        onEnterBack: function () { setActive(i); }
      });
    });
    // enter/back only fire on a crossing, so a resize that reflows the
    // steps around the viewport line leaves a stale highlight until the
    // next crossing — recompute it outright after every refresh
    function syncActive() {
      var line = window.innerHeight * 0.55, idx = 0;
      steps.forEach(function (s, i) { if (s.getBoundingClientRect().top < line) idx = i; });
      setActive(idx);
    }
    ScrollTrigger.addEventListener('refresh', syncActive);
  }

  /* ---------------- Commodities page interactions ---------------- */
  function initCommodities() {
    // account-tier visual cycles through Demo → Standard → ECN
    var acc = document.querySelector('.cm-acc');
    if (acc) {
      var rows = Array.prototype.slice.call(acc.querySelectorAll('.cm-acc-row'));
      if (rows.length) {
        var i = 0;
        var mark = function () { rows.forEach(function (r, n) { r.classList.toggle('is-on', n === i); }); };
        mark();
        if (!prefersReduced) {
          setInterval(function () { i = (i + 1) % rows.length; mark(); }, 2200);
        }
      }
    }

    // market cards jump to the instrument table with their category already selected
    document.querySelectorAll('[data-fx-goto]').forEach(function (card) {
      card.addEventListener('click', function () {
        var tab = document.querySelector('[data-fx-cat="' + card.dataset.fxGoto + '"]');
        if (tab && !tab.classList.contains('active')) tab.click();
      });
    });
  }

  /* ---------------- Glossary — A–Z index + live search ---------------- */
  function initGlossary() {
    var root = document.getElementById('glossary');
    if (!root) return;

    var input = document.getElementById('glSearch');
    var clear = document.getElementById('glClear');
    var status = document.getElementById('glStatus');
    var empty = document.getElementById('glEmpty');
    var emptyQ = document.getElementById('glEmptyQ');
    var reset = document.getElementById('glReset');
    var pager = document.getElementById('glPage');
    var letters = Array.prototype.slice.call(root.querySelectorAll('.gl-ltr'));
    var groups = Array.prototype.slice.call(root.querySelectorAll('.gl-group'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('.gl-term'));

    var total = cards.length;
    var totalEl = document.getElementById('glTotal');
    if (totalEl) totalEl.textContent = total;

    var letter = 'all';
    var query = '';
    var PAGE = parseInt(root.getAttribute('data-page-size'), 10) || 12;
    var page = 1;

    // cache the original label markup so highlighting can be undone cleanly
    cards.forEach(function (c) {
      c._t = c.querySelector('.gl-t');
      c._e = c.querySelector('.gl-ex');
      c._tRaw = c._t ? c._t.textContent : '';
      c._eRaw = c._e ? c._e.textContent : '';
    });

    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function mark(el, raw, q) {
      if (!el) return;
      if (!q) { el.textContent = raw; return; }
      var re = new RegExp('(' + esc(q) + ')', 'ig');
      el.innerHTML = raw.replace(re, '<mark>$1</mark>');
    }

    function apply() {
      var q = query.trim().toLowerCase();
      var shown = 0;

      var matched = [];
      cards.forEach(function (c) {
        var okL = letter === 'all' || c.closest('.gl-group').getAttribute('data-l') === letter;
        var okQ = !q || (c.dataset.name || '').indexOf(q) > -1 || (c.dataset.def || '').indexOf(q) > -1;
        var on = okL && okQ;
        c.hidden = !on;
        if (on) { shown++; matched.push(c); }
        mark(c._t, c._tRaw, q);
        mark(c._e, c._eRaw, q);
      });
      // browsing views page through the matches; a search shows every hit at once
      var pages = q ? 1 : Math.max(1, Math.ceil(matched.length / PAGE));
      if (page > pages) page = pages;
      if (!q) matched.forEach(function (c, i) {
        var on = i >= (page - 1) * PAGE && i < page * PAGE;
        if (on && c.hidden === false && c.hasAttribute('data-aos') && page > 1) stripAosOff(c);
        c.hidden = !on;
      });

      // a letter group disappears once every card inside it is filtered out,
      // and its badge counts what is actually on screen
      groups.forEach(function (g) {
        var n = g.querySelectorAll('.gl-term:not([hidden])').length;
        g.hidden = n === 0;
        var badge = g.querySelector('.gl-count');
        if (badge) badge.textContent = n;
      });

      if (empty) empty.hidden = shown !== 0;
      if (emptyQ) emptyQ.textContent = q ? '“' + query.trim() + '”' : 'that filter';
      if (pager) {
        pager.hidden = shown === 0 || !!q || pages < 2;
        if (!pager.hidden) {
          var html = '';
          for (var n = 1; n <= pages; n++) {
            html += '<button class="gl-pg' + (n === page ? ' is-on' : '') + '" type="button"' +
              (n === page ? ' aria-current="page"' : '') + ' data-gl-page="' + n + '">' + n + '</button>';
          }
          pager.innerHTML = html;
        }
      }
      if (clear) clear.hidden = !query;

      if (status) {
        var pageNote = pages > 1 ? ' — page ' + page + ' of ' + pages : '';
        if (q) status.textContent = shown + (shown === 1 ? ' term matches ' : ' terms match ') + '“' + query.trim() + '”';
        else if (letter !== 'all') status.textContent = 'Showing ' + shown + (shown === 1 ? ' term' : ' terms') + ' under ' + letter + pageNote;
        else status.textContent = pages > 1 ? 'Showing ' + shown + ' terms' + pageNote : '';
      }
      if (hasST) ScrollTrigger.refresh();
    }

    if (pager) pager.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-gl-page]') : null;
      if (!b) return;
      page = parseInt(b.getAttribute('data-gl-page'), 10) || 1;
      apply();
      var g0 = root.querySelector('.gl-group:not([hidden])');
      if (g0 && window.scrollY > g0.offsetTop) g0.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });

    letters.forEach(function (b) {
      if (b.classList.contains('is-off')) return;
      b.addEventListener('click', function () {
        letter = b.dataset.l;
        page = 1;
        letters.forEach(function (x) { x.classList.toggle('is-on', x === b); });
        apply();
        // keep the chosen letter in view under the sticky index
        var g = letter !== 'all' && root.querySelector('.gl-group[data-l="' + letter + '"]');
        if (g && window.scrollY > g.offsetTop) g.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      });
    });

    if (input) {
      var t;
      input.addEventListener('input', function () {
        query = input.value;
        page = 1;
        clearTimeout(t);
        t = setTimeout(apply, 120);
      });
      // Esc clears the field the way a search box should
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && input.value) { input.value = ''; query = ''; page = 1; apply(); }
      });
    }
    function clearAll() {
      if (input) { input.value = ''; input.focus(); }
      query = '';
      letter = 'all';
      page = 1;
      letters.forEach(function (x) { x.classList.toggle('is-on', x.dataset.l === 'all'); });
      apply();
    }
    if (clear) clear.addEventListener('click', clearAll);
    if (reset) reset.addEventListener('click', clearAll);

    // ?q= pre-fills the search so a filtered view can be linked to directly
    var q0 = new URLSearchParams(window.location.search).get('q');
    if (q0 && input) { input.value = q0; query = q0; }

    apply();
    stripAosHidden(cards);
  }

  /* ---------------- Glossary — single term view (?term=slug) ---------------- */
  function initGlossaryTerm() {
    var host = document.getElementById('gtDef');
    var DATA = window.STAR_GLOSSARY;
    if (!host || !DATA) return;

    var slugs = Object.keys(DATA).sort(function (a, b) {
      return DATA[a].t.localeCompare(DATA[b].t);
    });
    var slug = (new URLSearchParams(window.location.search).get('term') || '').toLowerCase();
    var term = DATA[slug];

    function txt(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

    if (!term) {
      host.innerHTML = '<p>We couldn’t find that term. It may have been renamed or removed — ' +
        '<a href="index.html">browse the full A–Z</a> to find what you need.</p>';
      txt('gt-title', 'Term not found');
      txt('gtLead', 'That entry isn’t in the glossary.');
      txt('gtCrumbTerm', 'Not found');
      document.title = 'Term not found — Trading Glossary | STARTRADER';
      ['gtPager', 'gtExample', 'gtKeys'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.hidden = true;
      });
      // no term means nothing to relate to — drop the empty card, keep the A–Z link
      var rc = document.querySelector('.gt-relcard'); if (rc) rc.hidden = true;
      // drop the letter crumb and its separator — there is no letter to point at
      var lc = document.getElementById('gtCrumbLetter');
      if (lc) {
        var sep = lc.nextElementSibling;
        if (sep && sep.classList.contains('sep')) sep.remove();
        lc.remove();
      }
      return;
    }

    // head + hero
    document.title = term.t + ' — Trading Glossary | STARTRADER';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', term.lead + ' Part of the STARTRADER trading glossary.');
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', 'https://www.startrader.com/glossary-term.html?term=' + slug);

    txt('gt-title', term.t);
    txt('gtLead', term.lead);
    txt('gtCrumbTerm', term.t);
    var cl = document.getElementById('gtCrumbLetter');
    if (cl) { cl.textContent = term.l; cl.href = 'index.html#gl-h-' + term.l; }

    // body
    host.innerHTML = (term.def || []).map(function (p) { return '<p>' + p + '</p>'; }).join('');

    var ex = document.getElementById('gtExample');
    if (ex && term.ex) { document.getElementById('gtExBody').textContent = term.ex; ex.hidden = false; }

    var keys = document.getElementById('gtKeys');
    if (keys && term.keys && term.keys.length) {
      document.getElementById('gtKeysList').innerHTML =
        term.keys.map(function (k) { return '<li>' + k + '</li>'; }).join('');
      keys.hidden = false;
    }

    // related
    var rel = document.getElementById('gtRelated');
    if (rel) {
      var items = (term.rel || []).filter(function (s) { return DATA[s]; });
      rel.innerHTML = items.length
        ? items.map(function (s) {
            return '<a class="gt-rel" href="glossary-term.html?term=' + s + '"><b>' + DATA[s].t + '</b>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></a>';
          }).join('')
        : '<p class="gt-relempty">No related terms yet.</p>';
    }

    // prev / next through the alphabetical list
    var i = slugs.indexOf(slug);
    [['gtPrev', slugs[i - 1]], ['gtNext', slugs[i + 1]]].forEach(function (pair) {
      var el = document.getElementById(pair[0]), s = pair[1];
      if (!el) return;
      if (!s) { el.hidden = true; return; }
      el.href = 'glossary-term.html?term=' + s;
      el.querySelector('.ttl').textContent = DATA[s].t;
    });

    // structured data
    var ld = document.getElementById('gtLd');
    if (ld) {
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'DefinedTerm',
        name: term.t, description: term.lead + ' ' + (term.def || []).join(' '),
        url: 'https://www.startrader.com/glossary-term.html?term=' + slug,
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'STARTRADER Trading Glossary', url: 'https://www.startrader.com/education/learn/glossary/' }
      });
    }
  }

  /* ---------------- Webinars — schedule, timezone, countdown, subscribe ---------------- */
  function initWebinars() {
    var root = document.getElementById('schedule');
    // the id is generic enough that another page can legitimately use it, so
    // confirm this really is the webinar schedule before touching its children
    if (!root || !root.querySelector('[data-wb-item]')) return;

    var LANGS = { en: 'English', ar: 'العربية', zh: '简体中文', th: 'ไทย' };
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-wb-item]'));
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.wb-tab'));
    var chips = Array.prototype.slice.call(root.querySelectorAll('.wb-chip'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.wb-panel'));
    var statusEl = root.querySelector('[data-wb-status]');
    var emptyEl = root.querySelector('[data-wb-empty]');
    var emptyLang = root.querySelector('[data-wb-empty-lang]');
    var resetBtn = root.querySelector('[data-wb-reset]');
    var tzInput = document.getElementById('wbTz');
    var tzNameEl = root.querySelector('[data-wb-tzname]');
    var sessionSel = document.getElementById('wbSession');

    var cat = 'upcoming';
    var lastShown = -1;
    var lang = 'all';
    var local = !!(tzInput && tzInput.checked);

    /* ---- time helpers ---- */
    var TZ = (function () {
      try {
        var p = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(new Date());
        for (var i = 0; i < p.length; i++) if (p[i].type === 'timeZoneName') return p[i].value;
      } catch (e) { }
      return 'local time';
    })();

    function fmt(d, opts, useLocal) {
      var o = {}, k;
      for (k in opts) o[k] = opts[k];
      if (!useLocal) o.timeZone = 'UTC';
      try { return new Intl.DateTimeFormat('en-GB', o).format(d); }
      catch (e) { return d.toUTCString().slice(5, 16); }
    }
    // "Tue 4 Aug · 15:00 GMT" — or the same instant in the visitor's own zone
    function fmtSession(d, useLocal) {
      var day = fmt(d, { weekday: 'short', day: 'numeric', month: 'short' }, useLocal).replace(/,/g, '');
      var time = fmt(d, { hour: '2-digit', minute: '2-digit', hour12: false }, useLocal);
      return day + ' · ' + time + ' ' + (useLocal ? TZ : 'GMT');
    }
    function fmtDate(d, useLocal) {
      return fmt(d, { day: 'numeric', month: 'short', year: 'numeric' }, useLocal).replace(/,/g, '');
    }
    /* ---- read the schedule out of the markup ---- */
    items.forEach(function (el) {
      var start = new Date(el.getAttribute('data-start'));
      var dur = parseInt(el.getAttribute('data-dur'), 10) || 60;
      el._wb = {
        el: el,
        cat: el.getAttribute('data-cat'),
        lang: el.getAttribute('data-lang') || 'en',
        title: el.getAttribute('data-title') || '',
        host: el.getAttribute('data-host') || 'STARTRADER Analyst',
        topic: el.getAttribute('data-topic') || '',
        level: (el.querySelector('.wb-tag--lvl') || {}).textContent || '',
        start: start,
        end: new Date(start.getTime() + dur * 6e4),
        dur: dur,
        dateOnly: el.getAttribute('data-datefmt') === 'date',
        timeEl: el.querySelector('[data-wb-time]'),
        dayEl: el.querySelector('[data-wb-day]'),
        monEl: el.querySelector('[data-wb-mon]')
      };
    });
    var sessions = items.map(function (el) { return el._wb; }).filter(function (it) { return it.cat !== 'replay'; });
    sessions.sort(function (a, b) { return a.start - b.start; });

    function upcomingSessions() {
      var now = new Date();
      return sessions.filter(function (it) { return it.end > now; });
    }

    /* ---- render times on every card ---- */
    function renderTimes() {
      items.forEach(function (el) {
        var it = el._wb;
        if (it.timeEl) {
          it.timeEl.textContent = it.dateOnly ? fmtDate(it.start, false) : fmtSession(it.start, local);
        }
        if (it.dayEl) it.dayEl.textContent = fmt(it.start, { day: 'numeric' }, local);
        if (it.monEl) it.monEl.textContent = fmt(it.start, { month: 'short' }, local);
      });
      if (tzNameEl) tzNameEl.textContent = local ? 'my timezone (' + TZ + ')' : 'GMT';
    }

    /* ---- filtering ---- */
    function apply() {
      var now = new Date();
      var shown = 0;

      items.forEach(function (el) {
        var it = el._wb;
        var onCat = it.cat === cat;
        var onLang = lang === 'all' || it.lang === lang;
        // a live session that has already finished drops out of the schedule
        var stale = it.cat !== 'replay' && it.end < now;
        var on = onCat && onLang && !stale;
        el.hidden = !on;
        if (on) shown++;
      });

      panels.forEach(function (p) { p.hidden = p.id !== 'wb-panel-' + cat; });

      tabs.forEach(function (t) {
        var c = t.getAttribute('data-wb-tab');
        var on = c === cat;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var badge = t.querySelector('.wb-tab-n');
        if (badge) {
          badge.textContent = items.filter(function (el) {
            var it = el._wb;
            return it.cat === c && (lang === 'all' || it.lang === lang) && !(it.cat !== 'replay' && it.end < now);
          }).length;
        }
      });

      chips.forEach(function (b) {
        var on = b.getAttribute('data-wb-lang') === lang;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (emptyLang) emptyLang.textContent = lang === 'all' ? 'this section' : LANGS[lang] || 'that language';

      if (statusEl) {
        var label = cat === 'replay' ? (shown === 1 ? 'replay' : 'replays') : (shown === 1 ? 'session' : 'sessions');
        statusEl.textContent = shown === 0 ? ''
          : 'Showing ' + shown + ' ' + label + (lang === 'all' ? '' : ' in ' + (LANGS[lang] || lang))
            + (local && cat !== 'replay' ? ' · times in ' + TZ : '');
      }
      if (hasST && shown !== lastShown) ScrollTrigger.refresh();
      lastShown = shown;
    }

    /* ---- tabs (click + keyboard) ---- */
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { cat = t.getAttribute('data-wb-tab'); apply(); });
      t.addEventListener('keydown', function (e) {
        var n = -1;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n < 0) return;
        e.preventDefault();
        cat = tabs[n].getAttribute('data-wb-tab');
        apply();
        tabs[n].focus();
      });
    });

    chips.forEach(function (b) {
      b.addEventListener('click', function () { lang = b.getAttribute('data-wb-lang'); apply(); });
    });
    if (resetBtn) resetBtn.addEventListener('click', function () { lang = 'all'; apply(); });

    if (tzInput) {
      tzInput.addEventListener('change', function () {
        local = tzInput.checked;
        renderTimes();
        if (heroIt) heroFrom(heroIt);
        buildSessionOptions();
        apply();
      });
    }

    /* ("View all previous webinars" is a plain link to the archive page) */

    /* ---- calendar file (.ics) ---- */
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function icsStamp(d) {
      return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
    }
    function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'webinar'; }
    function esc(s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
    function downloadIcs(it) {
      if (!it) return;
      var url = window.location.href.split('#')[0];
      var lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//STARTRADER//Webinars//EN', 'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH', 'BEGIN:VEVENT',
        'UID:' + slug(it.title) + '-' + icsStamp(it.start) + '@startrader.com',
        'DTSTAMP:' + icsStamp(new Date()),
        'DTSTART:' + icsStamp(it.start),
        'DTEND:' + icsStamp(it.end),
        'SUMMARY:' + esc('STARTRADER Webinar: ' + it.title),
        'DESCRIPTION:' + esc('Free live webinar presented by the STARTRADER ' + it.host +
          ' in ' + (LANGS[it.lang] || 'English') + '. Joining link is emailed before the session. ' + url),
        'LOCATION:Online — STARTRADER Webinar',
        'URL:' + url,
        'BEGIN:VALARM', 'TRIGGER:-PT60M', 'ACTION:DISPLAY',
        'DESCRIPTION:' + esc(it.title + ' starts in one hour'),
        'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'
      ];
      var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'startrader-' + slug(it.title) + '.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }
    function flagDone(btn) {
      if (!btn || btn._busy) return;
      btn._busy = true;
      var was = btn.innerHTML;
      btn.classList.add('is-done');
      btn.innerHTML = 'Added to calendar';
      setTimeout(function () { btn.innerHTML = was; btn.classList.remove('is-done'); btn._busy = false; }, 2600);
    }

    /* ---- the hero card mirrors the next live session ---- */
    var hero = document.querySelector('[data-wb-next]');
    var heroIt = null;
    var cd = hero && hero.querySelector('[data-wb-cd]');

    function heroFrom(it) {
      heroIt = it;
      if (!hero || !it) return;
      var set = function (sel, v) { var el = hero.querySelector(sel); if (el) el.textContent = v; };
      set('[data-wb-next-title]', it.title);
      set('[data-wb-next-host]', 'STARTRADER ' + it.host);
      set('[data-wb-next-cat]', it.topic + (it.level ? ' · ' + it.level : ''));
      set('[data-wb-next-time]', fmtSession(it.start, local));
      set('[data-wb-next-dur]', it.dur + ' minutes');
      set('[data-wb-next-lang]', LANGS[it.lang] || 'English');
    }

    function tick() {
      var now = new Date();
      // once a session ends, the hero rolls forward to the next one on the schedule
      if (!heroIt || heroIt.end < now) {
        var next = upcomingSessions()[0];
        if (!next) {
          if (cd) cd.hidden = true;
          var lbl0 = hero.querySelector('[data-wb-next-lbl]');
          if (lbl0) lbl0.textContent = 'New sessions are being scheduled';
          return;
        }
        heroFrom(next);
      }
      var lbl = hero.querySelector('[data-wb-next-lbl]');
      if (lbl) {
        lbl.textContent = (now >= heroIt.start && now <= heroIt.end)
          ? 'Live now — the session is on air' : 'Next live session starts in:';
      }

      if (!cd) return;
      var ms = Math.max(0, heroIt.start - now);
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
      var parts = { d: d, h: h, m: m, s: s % 60 };
      Object.keys(parts).forEach(function (k) {
        var el = cd.querySelector('[data-cd="' + k + '"]');
        if (!el) return;
        var v = pad(parts[k]);
        if (el.textContent === v) return;
        el.textContent = v;
        if (prefersReduced) return;
        el.classList.remove('is-tick');
        void el.offsetWidth;   // restart the lift animation
        el.classList.add('is-tick');
      });
    }

    /* ---- subscribe form ---- */
    function buildSessionOptions() {
      if (!sessionSel) return;
      var keep = sessionSel.value;
      sessionSel.innerHTML = '';
      var any = document.createElement('option');
      any.value = 'all';
      any.textContent = 'Any session — send me the full schedule';
      sessionSel.appendChild(any);
      upcomingSessions().forEach(function (it) {
        var o = document.createElement('option');
        o.value = it.start.toISOString();
        o.textContent = it.title + ' — ' + fmtSession(it.start, local);
        sessionSel.appendChild(o);
      });
      if (keep) sessionSel.value = keep;
      if (!sessionSel.value) sessionSel.value = 'all';
    }
    function sessionByIso(iso) {
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].start.toISOString() === iso) return sessions[i];
      }
      return null;
    }
    function chosenSession() {
      if (!sessionSel || sessionSel.value === 'all') return upcomingSessions()[0] || heroIt;
      return sessionByIso(sessionSel.value) || heroIt;
    }

    // "Register free" pre-selects that session in the form, then the anchor scrolls to it
    document.querySelectorAll('[data-wb-register]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('[data-wb-item]') || btn.closest('[data-wb-next]');
        var it = card === hero ? heroIt : (card && card._wb);
        if (it && sessionSel) {
          buildSessionOptions();
          sessionSel.value = it.start.toISOString();
          if (sessionSel.value !== it.start.toISOString()) sessionSel.value = 'all';
        }
        var name = document.getElementById('wbName');
        if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, prefersReduced ? 0 : 700);
      });
    });

    document.querySelectorAll('[data-wb-ics]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('[data-wb-item]') || btn.closest('[data-wb-next]');
        var it = card === hero ? heroIt : (card && card._wb);
        if (!it) it = chosenSession();
        downloadIcs(it);
        flagDone(btn);
      });
    });

    var form = document.getElementById('wbForm');
    var okBox = document.getElementById('wbOk');
    if (form) {
      var fields = {
        name: { el: document.getElementById('wbName'), test: function (v) { return v.trim().length >= 2; } },
        email: { el: document.getElementById('wbEmail'), test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); } },
        phone: { el: document.getElementById('wbPhone'), test: function (v) { return !v.trim() || /^\+?[\d\s()-]{6,20}$/.test(v.trim()); } }
      };
      var consent = document.getElementById('wbConsent');

      function bad(field, on) {
        var el = field.el;
        if (!el) return;
        var wrap = el.closest('.wb-field');
        var err = document.getElementById(el.id + 'Err');
        if (wrap) wrap.classList.toggle('is-bad', on);
        if (err) err.hidden = !on;
        el.setAttribute('aria-invalid', on ? 'true' : 'false');
      }

      Object.keys(fields).forEach(function (k) {
        var f = fields[k];
        if (!f.el) return;
        // clear the error as soon as the visitor fixes it — never nag mid-typing
        f.el.addEventListener('input', function () { if (f.test(f.el.value)) bad(f, false); });
        f.el.addEventListener('blur', function () { if (f.el.value.trim()) bad(f, !f.test(f.el.value)); });
      });
      if (consent) {
        consent.addEventListener('change', function () {
          var err = document.getElementById('wbConsentErr');
          var wrap = consent.closest('.wb-check');
          if (consent.checked) { if (err) err.hidden = true; if (wrap) wrap.classList.remove('is-bad'); }
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var first = null;
        Object.keys(fields).forEach(function (k) {
          var f = fields[k];
          if (!f.el) return;
          var ok = f.test(f.el.value);
          bad(f, !ok);
          if (!ok && !first) first = f.el;
        });
        var cErr = document.getElementById('wbConsentErr');
        var cWrap = consent && consent.closest('.wb-check');
        var cOk = !consent || consent.checked;
        if (cErr) cErr.hidden = cOk;
        if (cWrap) cWrap.classList.toggle('is-bad', !cOk);
        if (!cOk && !first) first = consent;

        if (first) { first.focus(); return; }

        var it = chosenSession();
        var langSel = document.getElementById('wbLang');
        var langLabel = LANGS[langSel && langSel.value] || 'English';
        var msg = okBox && okBox.querySelector('[data-wb-ok-msg]');
        if (msg) {
          msg.textContent = sessionSel && sessionSel.value !== 'all' && it
            ? 'You’re registered for “' + it.title + '” on ' + fmtSession(it.start, local) +
              '. We’ll email the joining link, plus a reminder an hour before it starts.'
            : 'We’ll email you the full ' + langLabel + ' schedule, a reminder before each session, and every replay as it is published.';
        }
        form.hidden = true;
        if (okBox) {
          okBox.hidden = false;
          var h = okBox.querySelector('h3');
          if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        }
      });

      var again = document.getElementById('wbAgain');
      if (again) {
        again.addEventListener('click', function () {
          form.reset();
          Object.keys(fields).forEach(function (k) { bad(fields[k], false); });
          var cErr = document.getElementById('wbConsentErr');
          if (cErr) cErr.hidden = true;
          buildSessionOptions();
          if (okBox) okBox.hidden = true;
          form.hidden = false;
          var name = document.getElementById('wbName');
          if (name) name.focus();
        });
      }
    }

    /* ---- boot ---- */
    // a looping banner film is decoration — hold it on the poster frame for
    // visitors who asked for less motion
    if (prefersReduced) {
      var film = document.querySelector('.wb-hero-video');
      if (film) { film.autoplay = false; film.removeAttribute('autoplay'); film.pause(); }
    }
    renderTimes();
    buildSessionOptions();
    apply();
    tick();
    setInterval(tick, 1000);
    // cards and the hero re-label themselves as the day rolls on
    setInterval(function () { renderTimes(); apply(); }, 60000);
  }

  /* ---------------- Economic calendar ---------------- */
  // The schedule is a live third-party widget, so there is nothing to drive
  // here beyond holding the banner film still for reduced-motion visitors.
  function initEcon() {
    if (!document.getElementById('calendar')) return;
    if (!prefersReduced) return;
    var film = document.querySelector('.wb-hero-video');
    if (film) { film.removeAttribute('autoplay'); film.pause(); }
  }

  /* items hidden by a pager at init never run their AOS entry; strip the
     attributes so a later reveal shows them instantly instead of invisibly */
  function stripAosOff(el) {
    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-delay');
    el.classList.remove('aos-init');
    el.classList.remove('aos-animate');
  }
  function stripAosHidden(items) {
    setTimeout(function () {
      items.forEach(function (el) { if (el.hidden) stripAosOff(el); });
    }, 120);
  }

  /* ---------------- News room — filter, search, load more ---------------- */
  function initNews() {
    var root = document.getElementById('latest');
    if (!root) return;

    var PAGE = parseInt(root.getAttribute('data-page-size'), 10) || 6;  // stories revealed per step
    var CATS = { ta: 'Technical Analysis', fa: 'Fundamental Analysis', mkt: 'Market news', co: 'Company' };

    var items = Array.prototype.slice.call(root.querySelectorAll('[data-nr-item]'));
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-nr-cat]'));
    var input = document.getElementById('nrSearch');
    var clear = document.getElementById('nrClear');
    var statusEl = root.querySelector('[data-nr-status]');
    var emptyEl = root.querySelector('[data-nr-empty]');
    var emptyQ = root.querySelector('[data-nr-empty-q]');
    var resetBtn = root.querySelector('[data-nr-reset]');
    var moreBtn = root.querySelector('[data-nr-more]');
    var moreRow = root.querySelector('.nr-morerow');

    var cat = 'all', query = '', shown = PAGE;
    stripAosHidden(items);

    // cache the searchable text and the original markup for highlighting
    items.forEach(function (el) {
      el._h = el.querySelector('.nr-h a');
      el._e = el.querySelector('.nr-ex');
      el._hRaw = el._h ? el._h.textContent : '';
      el._eRaw = el._e ? el._e.textContent : '';
      el._hay = ((el.getAttribute('data-title') || '') + ' ' + el._eRaw).toLowerCase();
    });

    function esc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function mark(el, raw, q) {
      if (!el) return;
      if (!q) { el.textContent = raw; return; }
      el.innerHTML = raw.replace(new RegExp('(' + esc(q) + ')', 'ig'), '<mark>$1</mark>');
    }

    function apply() {
      var q = query.trim().toLowerCase();
      var matched = items.filter(function (el) {
        return (cat === 'all' || el.getAttribute('data-cat') === cat) && (!q || el._hay.indexOf(q) > -1);
      });

      items.forEach(function (el) { el.hidden = true; });
      matched.forEach(function (el, i) {
        el.hidden = i >= shown;
        mark(el._h, el._hRaw, q);
        mark(el._e, el._eRaw, q);
      });

      if (emptyEl) emptyEl.hidden = matched.length !== 0;
      if (emptyQ) emptyQ.textContent = q ? '\u201C' + query.trim() + '\u201D' : 'that filter';
      if (moreRow) moreRow.hidden = matched.length <= shown;
      if (clear) clear.hidden = !query;

      chips.forEach(function (b) {
        var on = b.getAttribute('data-nr-cat') === cat;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      if (statusEl) {
        var seen = Math.min(shown, matched.length);
        statusEl.textContent = matched.length
          ? 'Showing ' + seen + ' of ' + matched.length + (matched.length === 1 ? ' story' : ' stories') +
            (cat === 'all' ? '' : ' in ' + CATS[cat]) + (q ? ' matching \u201C' + query.trim() + '\u201D' : '')
          : '';
      }
      if (hasST) ScrollTrigger.refresh();
    }

    chips.forEach(function (b) {
      b.addEventListener('click', function () { cat = b.getAttribute('data-nr-cat'); shown = PAGE; apply(); });
    });

    if (input) {
      var t;
      input.addEventListener('input', function () {
        query = input.value; shown = PAGE;
        clearTimeout(t); t = setTimeout(apply, 120);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && input.value) { input.value = ''; query = ''; shown = PAGE; apply(); }
      });
    }
    function clearAll() {
      if (input) input.value = '';
      query = ''; cat = 'all'; shown = PAGE; apply();
    }
    if (clear) clear.addEventListener('click', function () { clearAll(); if (input) input.focus(); });
    if (resetBtn) resetBtn.addEventListener('click', clearAll);

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        var first = shown;
        shown += PAGE;
        apply();
        // move focus to the first newly revealed story so keyboard users keep their place
        var visible = items.filter(function (el) { return !el.hidden; });
        var target = visible[first];
        if (target) {
          var h = target.querySelector('.nr-h a');
          if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        }
      });
    }

    // ?q= deep-links a filtered view
    var q0 = new URLSearchParams(window.location.search).get('q');
    if (q0 && input) { input.value = q0; query = q0; }

    /* ---- daily briefing sign-up ---- */
    var form = document.getElementById('nrSubForm');
    if (form) {
      var email = document.getElementById('nrEmail');
      var err = document.getElementById('nrEmailErr');
      var ok = document.getElementById('nrSubOk');
      var field = email && email.closest('.nr-sub-field');
      email && email.addEventListener('input', function () {
        if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) {
          if (err) err.hidden = true;
          if (field) field.classList.remove('is-bad');
        }
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var good = email && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim());
        if (err) err.hidden = !!good;
        if (field) field.classList.toggle('is-bad', !good);
        if (!good) { if (email) email.focus(); return; }
        if (ok) ok.hidden = false;
        form.reset();
      });
    }

    if (prefersReduced) {
      var film = document.querySelector('.wb-hero-video');
      if (film) { film.removeAttribute('autoplay'); film.pause(); }
    }
    apply();
  }

  /* ---------------- Article page — progress, TOC, share ---------------- */
  function initArticle() {
    var body = document.querySelector('.ar-body');
    if (!body) return;

    /* reading progress across the article body */
    var bar = document.querySelector('[data-ar-progress]');
    if (bar) {
      var tick = function () {
        var box = body.getBoundingClientRect();
        var total = box.height - window.innerHeight * 0.5;
        var done = -box.top + window.innerHeight * 0.5;
        var pct = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
        bar.style.width = (pct * 100).toFixed(1) + '%';
      };
      tick();
      window.addEventListener('scroll', tick, { passive: true });
      window.addEventListener('resize', tick);
    }

    /* table of contents — highlight the section being read */
    var toc = document.querySelector('[data-ar-toc]');
    if (toc) {
      var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
      var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
      // read the line just below the sticky chrome, which is exactly where an
      // anchor click parks a heading — so clicking a link always lights it up
      var lineOf = function () {
        var tb = document.querySelector('.topbar');
        var hd = document.getElementById('siteHeader');
        var h = (tb ? tb.offsetHeight : 0) + (hd ? hd.offsetHeight : 0);
        return h + 44;
      };
      var mark = function () {
        var line = lineOf();
        var active = 0;
        targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) active = i; });
        links.forEach(function (a, i) { a.classList.toggle('is-on', i === active); });
      };
      mark();
      window.addEventListener('scroll', mark, { passive: true });
    }

    /* copy link, with a spoken confirmation */
    var copyBtn = document.querySelector('[data-ar-copy]');
    var copied = document.querySelector('[data-ar-copied]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var url = window.location.href;
        var done = function () {
          if (!copied) return;
          copied.hidden = false;
          setTimeout(function () { copied.hidden = true; }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = url; ta.setAttribute('readonly', '');
          ta.style.position = 'absolute'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) { }
          document.body.removeChild(ta);
          done();
        }
      });
    }

    var printBtn = document.querySelector('[data-ar-print]');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    if (prefersReduced) {
      var film = document.querySelector('.wb-hero-video');
      if (film) { film.removeAttribute('autoplay'); film.pause(); }
    }
  }

  /* ---------------- Announcements — filter, search, deep links ---------------- */
  function initAnnouncements() {
    var root = document.getElementById('notices');
    if (!root) return;

    var CATS = { closure: 'market closure', rollover: 'rollover', leverage: 'leverage',
                 system: 'system', product: 'product', other: 'other' };
    var MONTHS = { '2026-07': 'July', '2026-06': 'June', '2026-05': 'May' };

    var items = Array.prototype.slice.call(root.querySelectorAll('[data-an-item]'));
    var catBtns = Array.prototype.slice.call(root.querySelectorAll('[data-an-cat]'));
    var monthBtns = Array.prototype.slice.call(root.querySelectorAll('[data-an-month]'));
    var input = document.getElementById('anSearch');
    var clear = document.getElementById('anClear');
    var statusEl = root.querySelector('[data-an-status]');
    var emptyEl = root.querySelector('[data-an-empty]');
    var emptyQ = root.querySelector('[data-an-empty-q]');
    var resetBtn = root.querySelector('[data-an-reset]');
    var totalEl = document.querySelector('[data-an-total]');

    var cat = 'all', month = 'all', query = '';
    var cats = [];            // [] means every type
    var from = '', to = '', sort = 'latest';

    items.forEach(function (el) {
      var t = el.querySelector('.an-title');
      var body = el.querySelector('.an-body');
      el._t = t;
      el._tRaw = t ? t.textContent : '';
      el._hay = ((el._tRaw) + ' ' + (body ? body.textContent : '')).toLowerCase();
    });
    if (totalEl) totalEl.textContent = items.length;

    function esc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function mark(el, raw, q) {
      if (!el) return;
      if (!q) { el.textContent = raw; return; }
      el.innerHTML = raw.replace(new RegExp('(' + esc(q) + ')', 'ig'), '<mark>$1</mark>');
    }
    function catOk(el) {
      return !cats.length || cats.indexOf(el.getAttribute('data-cat')) > -1;
    }
    function dateOk(el) {
      var d = el.getAttribute('data-date') || '';
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    }
    function countOf(c) {
      return items.filter(function (el) {
        return (c === 'all' || el.getAttribute('data-cat') === c) &&
          (month === 'all' || el.getAttribute('data-month') === month) && dateOk(el);
      }).length;
    }
    // pinned notices stay on top; the chosen order applies inside each group
    function order() {
      var list = root.querySelector('.an-list');
      if (!list) return;
      var rows = items.slice();
      var q = query.trim().toLowerCase();
      rows.sort(function (a, b) {
        var pa = a.classList.contains('an-item--pin') ? 0 : 1;
        var pb = b.classList.contains('an-item--pin') ? 0 : 1;
        if (pa !== pb) return pa - pb;
        if (sort === 'relevant' && q) {
          var ia = a._hay.indexOf(q), ib = b._hay.indexOf(q);
          if (ia !== ib) return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib);
        }
        var da = a.getAttribute('data-date') || '', db = b.getAttribute('data-date') || '';
        return sort === 'oldest' ? (da < db ? -1 : da > db ? 1 : 0) : (da > db ? -1 : da < db ? 1 : 0);
      });
      rows.forEach(function (el) { list.appendChild(el); });
    }

    function apply() {
      var q = query.trim().toLowerCase();
      var shown = 0;

      order();
      items.forEach(function (el) {
        var on = catOk(el) &&
          (month === 'all' || el.getAttribute('data-month') === month) && dateOk(el) &&
          (!q || el._hay.indexOf(q) > -1);
        el.hidden = !on;
        if (on) shown++;
        mark(el._t, el._tRaw, q);
      });

      catBtns.forEach(function (b) {
        var c = b.getAttribute('data-an-cat');
        var on = c === 'all' ? !cats.length : (cats.length === 1 && cats[0] === c);
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var n = b.querySelector('.an-n');
        if (n) n.textContent = countOf(c);
      });
      monthBtns.forEach(function (b) {
        var on = b.getAttribute('data-an-month') === month;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (emptyQ) emptyQ.textContent = q ? '\u201C' + query.trim() + '\u201D' : 'those filters';
      if (clear) clear.hidden = !query;

      renderChips();
      if (statusEl) {
        var bits = [];
        if (cats.length) bits.push(cats.map(function (c) { return CATS[c]; }).join(', '));
        if (month !== 'all') bits.push(MONTHS[month]);
        if (from || to) bits.push((from || 'any') + ' to ' + (to || 'any'));
        if (sort !== 'latest') bits.push(sort === 'oldest' ? 'oldest first' : 'most relevant');
        statusEl.textContent = shown
          ? shown + (shown === 1 ? ' notice' : ' notices') + (bits.length ? ' · ' + bits.join(' · ') : '')
          : '';
      }
      if (hasST) ScrollTrigger.refresh();
    }

    catBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-an-cat');
        cats = c === 'all' ? [] : [c];
        syncModal();
        apply();
      });
    });
    monthBtns.forEach(function (b) { b.addEventListener('click', function () { month = b.getAttribute('data-an-month'); apply(); }); });

    if (input) {
      var t;
      input.addEventListener('input', function () { query = input.value; clearTimeout(t); t = setTimeout(apply, 120); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && input.value) { input.value = ''; query = ''; apply(); }
      });
    }
    function clearAll() {
      if (input) input.value = '';
      query = ''; cats = []; month = 'all'; from = ''; to = ''; sort = 'latest';
      syncModal();
      apply();
    }
    if (clear) clear.addEventListener('click', function () { clearAll(); if (input) input.focus(); });
    if (resetBtn) resetBtn.addEventListener('click', clearAll);

    /* a linked notice opens itself — support can share a single announcement */
    function openFromHash() {
      var id = (window.location.hash || '').slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el || !el.hasAttribute('data-an-item')) return;
      var d = el.querySelector('details');
      if (d) d.open = true;
      el.hidden = false;
      setTimeout(function () {
        var off = 0;
        var tb = document.querySelector('.topbar'), hd = document.getElementById('siteHeader');
        off = (tb ? tb.offsetHeight : 0) + (hd ? hd.offsetHeight : 0) + 14;
        var y = el.getBoundingClientRect().top + (window.pageYOffset || 0) - off;
        scrollToTarget(Math.max(0, y));
      }, 60);
    }
    window.addEventListener('hashchange', openFromHash);

    /* copy a permalink to one notice */
    root.querySelectorAll('[data-an-link]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var url = window.location.href.split('#')[0] + a.getAttribute('href');
        var was = a.textContent;
        var done = function () {
          a.textContent = 'Link copied';
          setTimeout(function () { a.textContent = was; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
        else done();
      });
    });

    /* only one notice open at a time keeps the list scannable */
    items.forEach(function (el) {
      var d = el.querySelector('details');
      if (!d) return;
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (other) {
          var od = other.querySelector('details');
          if (od && od !== d) od.open = false;
        });
        if (hasST) ScrollTrigger.refresh();
      });
    });

    /* notice alerts sign-up */
    var form = document.getElementById('anSubForm');
    if (form) {
      var email = document.getElementById('anEmail');
      var err = document.getElementById('anEmailErr');
      var ok = document.getElementById('anSubOk');
      var field = email && email.closest('.nr-sub-field');
      var valid = function () { return email && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim()); };
      if (email) email.addEventListener('input', function () {
        if (valid()) { if (err) err.hidden = true; if (field) field.classList.remove('is-bad'); }
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var good = valid();
        if (err) err.hidden = !!good;
        if (field) field.classList.toggle('is-bad', !good);
        if (!good) { if (email) email.focus(); return; }
        if (ok) ok.hidden = false;
        form.reset();
      });
    }

    /* ---- active-filter chips ---- */
    var chipsEl = root.querySelector('[data-an-chips]');
    function renderChips() {
      if (!chipsEl) return;
      var chips = [];
      cats.forEach(function (c) { chips.push({ label: CATS[c], clear: function () { cats = cats.filter(function (x) { return x !== c; }); } }); });
      if (month !== 'all') chips.push({ label: MONTHS[month], clear: function () { month = 'all'; } });
      if (from || to) chips.push({ label: (from || 'any') + ' \u2192 ' + (to || 'any'), clear: function () { from = ''; to = ''; } });
      if (sort !== 'latest') chips.push({ label: sort === 'oldest' ? 'Oldest first' : 'Most relevant', clear: function () { sort = 'latest'; } });
      if (query.trim()) chips.push({ label: '\u201C' + query.trim() + '\u201D', clear: function () { query = ''; if (input) input.value = ''; } });

      chipsEl.innerHTML = '';
      chips.forEach(function (c) {
        var el = document.createElement('span');
        el.className = 'an-chip';
        el.textContent = c.label;
        var x = document.createElement('button');
        x.type = 'button';
        x.setAttribute('aria-label', 'Remove filter: ' + c.label);
        x.innerHTML = '<svg><use href="#i-close"/></svg>';
        x.addEventListener('click', function () { c.clear(); syncModal(); apply(); });
        el.appendChild(x);
        chipsEl.appendChild(el);
      });
      if (chips.length > 1) {
        var all = document.createElement('button');
        all.type = 'button';
        all.className = 'an-chip an-chip--clear';
        all.textContent = 'Clear all';
        all.addEventListener('click', clearAll);
        chipsEl.appendChild(all);
      }
    }

    /* ---- filter dialog: draft state, applied on Apply ---- */
    var dlg = document.getElementById('anFilter');
    var openBtn = document.querySelector('[data-an-open-filter]');
    var activeEl = document.querySelector('[data-an-active-count]');
    var mCats = dlg ? Array.prototype.slice.call(dlg.querySelectorAll('[data-an-mcat]')) : [];
    var mSorts = dlg ? Array.prototype.slice.call(dlg.querySelectorAll('[data-an-sort]')) : [];
    var mFrom = dlg && dlg.querySelector('[data-an-from]');
    var mTo = dlg && dlg.querySelector('[data-an-to]');

    // reflect the live filters back into the dialog's controls
    function syncModal() {
      if (!dlg) return;
      mCats.forEach(function (c) {
        var v = c.getAttribute('data-an-mcat');
        c.checked = v === 'all' ? !cats.length : cats.indexOf(v) > -1;
      });
      mSorts.forEach(function (r) { r.checked = r.getAttribute('data-an-sort') === sort; });
      if (mFrom) mFrom.value = from;
      if (mTo) mTo.value = to;
      if (activeEl) {
        var n = cats.length + (month !== 'all' ? 1 : 0) + (from || to ? 1 : 0) + (sort !== 'latest' ? 1 : 0);
        activeEl.textContent = n;
        activeEl.hidden = n === 0;
      }
    }

    if (dlg) {
      // "All" and the specific types are mutually exclusive
      mCats.forEach(function (c) {
        c.addEventListener('change', function () {
          var v = c.getAttribute('data-an-mcat');
          if (v === 'all') {
            if (c.checked) mCats.forEach(function (o) { if (o !== c) o.checked = false; });
            else c.checked = true;
          } else if (c.checked) {
            var all = mCats.filter(function (o) { return o.getAttribute('data-an-mcat') === 'all'; })[0];
            if (all) all.checked = false;
          } else if (!mCats.some(function (o) { return o.getAttribute('data-an-mcat') !== 'all' && o.checked; })) {
            var all2 = mCats.filter(function (o) { return o.getAttribute('data-an-mcat') === 'all'; })[0];
            if (all2) all2.checked = true;
          }
        });
      });

      /* one tap anywhere on the date field opens the browser's picker */
      var field = dlg.querySelector('[data-an-datefield]');
      var canPick = !!(mFrom && typeof mFrom.showPicker === 'function');
      if (field && canPick) {
        field.classList.add('has-picker');
        field.addEventListener('click', function (e) {
          var target = e.target === mTo ? mTo : (e.target === mFrom ? mFrom : (mFrom.value && !mTo.value ? mTo : mFrom));
          try { target.showPicker(); } catch (err) { target.focus(); }
        });
      }

      /* the draft state previews how many notices will survive it */
      function preview() {
        var el = dlg.querySelector('[data-an-preview]');
        if (!el) return;
        var dCats = mCats.filter(function (c) { return c.checked && c.getAttribute('data-an-mcat') !== 'all'; })
          .map(function (c) { return c.getAttribute('data-an-mcat'); });
        var dFrom = mFrom ? mFrom.value : '', dTo = mTo ? mTo.value : '';
        var dMonth = (dFrom || dTo) ? 'all' : month;
        var q = query.trim().toLowerCase();
        var n = items.filter(function (it) {
          var d = it.getAttribute('data-date') || '';
          return (!dCats.length || dCats.indexOf(it.getAttribute('data-cat')) > -1) &&
            (dMonth === 'all' || it.getAttribute('data-month') === dMonth) &&
            (!dFrom || d >= dFrom) && (!dTo || d <= dTo) &&
            (!q || it._hay.indexOf(q) > -1);
        }).length;
        el.textContent = n + (n === 1 ? ' notice' : ' notices');
      }
      dlg.addEventListener('change', preview);
      dlg.addEventListener('input', preview);

      if (openBtn) openBtn.addEventListener('click', function () {
        syncModal();
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
        preview();
      });
      var close = function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
      dlg.querySelectorAll('[data-an-close],[data-an-cancel]').forEach(function (b) {
        b.addEventListener('click', close);
      });
      // clicking the backdrop closes, clicking the panel does not
      dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });

      var clearAllBtn = dlg.querySelector('[data-an-clear-all]');
      if (clearAllBtn) clearAllBtn.addEventListener('click', function () {
        mCats.forEach(function (c) { c.checked = c.getAttribute('data-an-mcat') === 'all'; });
        mSorts.forEach(function (r) { r.checked = r.getAttribute('data-an-sort') === 'latest'; });
        if (mFrom) mFrom.value = '';
        if (mTo) mTo.value = '';
        preview();
      });

      var applyBtn = dlg.querySelector('[data-an-apply]');
      if (applyBtn) applyBtn.addEventListener('click', function () {
        cats = mCats.filter(function (c) { return c.checked && c.getAttribute('data-an-mcat') !== 'all'; })
          .map(function (c) { return c.getAttribute('data-an-mcat'); });
        var picked = mSorts.filter(function (r) { return r.checked; })[0];
        sort = picked ? picked.getAttribute('data-an-sort') : 'latest';
        from = mFrom ? mFrom.value : '';
        to = mTo ? mTo.value : '';
        // a range chosen by hand outranks the month shortcut
        if (from || to) month = 'all';
        close();
        apply();
        syncModal();
      });
    }

    /* ---- share a single notice from its row ---- */
    root.querySelectorAll('[data-an-share]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();            // must not toggle the notice
        var item = btn.closest('[data-an-item]');
        if (!item) return;
        var url = window.location.href.split('#')[0] + '#' + item.id;
        var done = function () {
          btn.classList.add('is-done');
          btn.setAttribute('aria-label', 'Link copied');
          setTimeout(function () {
            btn.classList.remove('is-done');
            btn.setAttribute('aria-label', 'Copy a link to this notice');
          }, 2000);
        };
        if (navigator.share) { navigator.share({ title: document.title, url: url }).then(function () { }, done); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
        else done();
      });
    });

    syncModal();
    apply();
    openFromHash();
  }

  /* ---------------- Contact — enquiry form, routing, chat hooks ---------------- */
  function initContact() {
    var form = document.getElementById('ctForm');
    if (!form) return;

    var MAX = 1200;
    var done = document.querySelector('[data-ct-done]');

    var f = {
      name: document.getElementById('ctName'),
      email: document.getElementById('ctEmail'),
      phone: document.getElementById('ctPhone'),
      subject: document.getElementById('ctSubject'),
      msg: document.getElementById('ctMsg'),
      consent: document.getElementById('ctConsent'),
      dept: document.getElementById('ctDept')
    };
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
      phone: function (v) { return !v.trim() || /^\+?[\d\s()-]{6,20}$/.test(v.trim()); },
      subject: function (v) { return v.trim().length >= 3; },
      msg: function (v) { return v.trim().length >= 15 && v.trim().length <= MAX; }
    };

    function bad(el, on) {
      if (!el) return;
      var wrap = el.closest('.ct-field') || el.closest('.ct-check');
      var err = document.getElementById(el.id + 'Err');
      if (wrap) wrap.classList.toggle('is-bad', on);
      if (err) err.hidden = !on;
      el.setAttribute('aria-invalid', on ? 'true' : 'false');
    }
    // clear an error the moment it is fixed, never nag mid-typing
    Object.keys(rules).forEach(function (k) {
      var el = f[k];
      if (!el) return;
      el.addEventListener('input', function () { if (rules[k](el.value)) bad(el, false); });
      el.addEventListener('blur', function () { if (el.value.trim()) bad(el, !rules[k](el.value)); });
    });

    function check(keys) {
      var first = null;
      keys.forEach(function (k) {
        var el = f[k];
        if (!el) return;
        var ok = rules[k](el.value);
        bad(el, !ok);
        if (!ok && !first) first = el;
      });
      return first;
    }

    /* account number only matters for existing clients */
    var acct = document.querySelector('[data-ct-acct]');
    form.querySelectorAll('input[name="client"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (acct) acct.hidden = r.value !== 'yes' || !r.checked;
      });
    });

    /* say where the message goes and when to expect a reply */
    function route() {
      var el = document.querySelector('[data-ct-route]');
      if (!el || !f.dept) return;
      var opt = f.dept.options[f.dept.selectedIndex];
      el.innerHTML = 'Goes to <b>' + opt.getAttribute('data-to') + '</b> · replied ' + opt.getAttribute('data-eta');
    }
    if (f.dept) f.dept.addEventListener('change', route);
    route();

    /* message length */
    var count = document.querySelector('[data-ct-count]');
    if (f.msg && count) {
      var tick = function () {
        var n = f.msg.value.length;
        count.textContent = n + ' / ' + MAX;
        count.classList.toggle('is-over', n > MAX);
      };
      f.msg.addEventListener('input', tick);
      tick();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = check(['name', 'email', 'phone', 'subject', 'msg']);
      var cOk = !f.consent || f.consent.checked;
      if (f.consent) {
        var cWrap = f.consent.closest('.ct-check');
        var cErr = document.getElementById('ctConsentErr');
        if (cWrap) cWrap.classList.toggle('is-bad', !cOk);
        if (cErr) cErr.hidden = cOk;
      }
      if (!cOk && !first) first = f.consent;
      if (first) { first.focus(); return; }

      var opt = f.dept ? f.dept.options[f.dept.selectedIndex] : null;
      var msg = document.querySelector('[data-ct-done-msg]');
      if (msg) {
        msg.innerHTML = 'Your message is with the <b>' + ((opt && opt.getAttribute('data-desk')) || 'client support') +
          '</b> desk and will be answered ' + (opt ? opt.getAttribute('data-eta') : 'within 2 hours') +
          '. We\u2019ll reply to <b>' + (f.email ? f.email.value.trim() : 'your email') + '</b>.';
      }
      form.hidden = true;
      if (done) {
        done.hidden = false;
        var h = done.querySelector('[data-ct-done-h]');
        if (h) h.focus({ preventScroll: true });
      }
    });

    var again = document.querySelector('[data-ct-again]');
    if (again) again.addEventListener('click', function () {
      form.reset();
      Object.keys(rules).forEach(function (k) { bad(f[k], false); });
      var cErr = document.getElementById('ctConsentErr');
      if (cErr) cErr.hidden = true;
      if (acct) acct.hidden = true;
      if (done) done.hidden = true;
      form.hidden = false;
      route();
      if (hasST) ScrollTrigger.refresh();
    });

    /* every "live chat" affordance opens the existing chat panel */
    document.querySelectorAll('[data-ct-chat]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var fab = document.getElementById('chatFab');
        var panel = document.getElementById('chatPanel');
        if (panel && panel.classList.contains('open')) {
          var text = document.getElementById('chatText');
          if (text) text.focus();
          return;
        }
        if (fab) fab.click();
      });
    });

    if (prefersReduced) {
      // contact's banner is a still, so there is nothing to pause here — the
      // guard keeps this working if the banner ever goes back to footage
      var film = document.querySelector('.wb-hero-video');
      if (film && typeof film.pause === 'function') { film.removeAttribute('autoplay'); film.pause(); }
    }
    ctMotion();
  }

  /* Contact — the scroll choreography: hero parallax, masked word reveals,
     card entrances and a pointer-tracked highlight on each glass pane. */
  function ctMotion() {
    if (prefersReduced || !hasGSAP || !hasST) return;

    function onScreen(el) {
      var r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || 0) && r.bottom > 0;
    }

    /* headings rise word by word out of a mask */
    document.querySelectorAll('[data-ct-words]').forEach(function (h) {
      var words = (h.textContent || '').trim().split(/\s+/);
      if (!words.length) return;
      h.textContent = '';
      words.forEach(function (w, i) {
        var mask = document.createElement('span');
        mask.className = 'ct-w';
        var inner = document.createElement('i');
        inner.textContent = w;
        mask.appendChild(inner);
        h.appendChild(mask);
        if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
      });
      var parts = h.querySelectorAll('.ct-w > i');
      // state the start explicitly: GSAP reads the CSS translateY(105%) as a
      // px offset, so tweening yPercent alone would leave that offset behind
      var from = { yPercent: 130, y: 0 };
      var tween = { yPercent: 0, y: 0, duration: 0.95, ease: 'power4.out', stagger: 0.035 };
      if (onScreen(h)) gsap.fromTo(parts, from, tween);
      else gsap.fromTo(parts, from, Object.assign({}, tween, {
        scrollTrigger: { trigger: h, start: 'top 88%', once: true }
      }));
    });

    /* card groups enter as a staggered set rather than all at once */
    gsap.utils.toArray('[data-ct-cards]').forEach(function (group) {
      var tween = { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.085, clearProps: 'transform' };
      if (onScreen(group)) gsap.fromTo(group.children, { y: 30 }, tween);
      else gsap.fromTo(group.children, { y: 30 }, Object.assign({}, tween, {
        scrollTrigger: { trigger: group, start: 'top 86%', once: true }
      }));
    });

    /* banner: film drifts, copy sinks and dims as the page takes over */
    var hero = document.querySelector('.ct-hero');
    if (hero) {
      var track = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      var film = hero.querySelector('.wb-hero-video');
      var inner = hero.querySelector('[data-ct-heroin]');
      var veil = hero.querySelector('.ct-hero-veil');
      // the film is over-height and top-anchored; only an upward drift is safe,
      // moving it down would expose the untreated band under the banner
      if (film) gsap.to(film, { yPercent: -7, ease: 'none', scrollTrigger: track });
      if (inner) gsap.to(inner, { y: 58, opacity: 0.2, ease: 'none', scrollTrigger: track });
      if (veil) gsap.to(veil, { yPercent: 14, ease: 'none', scrollTrigger: track });
    }

    /* the tinted auras behind each section drift at their own rates */
    gsap.utils.toArray('[data-ct-aura]').forEach(function (aura) {
      var amt = parseFloat(aura.getAttribute('data-ct-aura'));
      if (!amt) return;
      gsap.to(aura, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: aura.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------- Regulation — entity filter, licence copy ---------------- */
  function initRegulation() {
    var wrap = document.querySelector('[data-rg-cards]');
    if (!wrap) return;

    var cards = Array.prototype.slice.call(wrap.querySelectorAll('.rg-ent'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-rg-f]'));
    var count = document.querySelector('[data-rg-count]');
    var empty = document.querySelector('[data-rg-empty]');

    function apply(key) {
      var shown = 0;
      cards.forEach(function (c) {
        var hit = key === 'all' || c.getAttribute('data-rg-r') === key;
        c.hidden = !hit;
        if (hit) shown++;
      });
      chips.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-rg-f') === key); });
      if (count) {
        count.textContent = key === 'all'
          ? 'Showing all ' + shown + ' entities'
          : 'Showing ' + shown + ' of ' + cards.length + ' entities';
      }
      if (empty) empty.hidden = shown > 0;
      if (hasST) ScrollTrigger.refresh();
    }

    chips.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-rg-f')); });
    });
    var reset = document.querySelector('[data-rg-reset]');
    if (reset) reset.addEventListener('click', function () { apply('all'); });

    /* a licence number is only useful if you can take it to the register */
    wrap.querySelectorAll('[data-rg-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var host = btn.closest('.rg-num');
        var val = host && host.querySelector('[data-rg-val]');
        if (!val) return;
        var text = val.textContent.trim();
        var done = function () {
          btn.classList.add('is-done');
          var was = btn.getAttribute('aria-label');
          btn.setAttribute('aria-label', 'Copied ' + text);
          setTimeout(function () {
            btn.classList.remove('is-done');
            if (was) btn.setAttribute('aria-label', was);
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; ta.setAttribute('readonly', '');
          ta.style.position = 'absolute'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });

    if (prefersReduced || COARSE || !hasGSAP || !hasST) return;
    gsap.utils.toArray('[data-rg-aura]').forEach(function (aura) {
      var amt = parseFloat(aura.getAttribute('data-rg-aura'));
      if (!amt) return;
      gsap.to(aura, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: aura.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------- Partner pages — tabbed application, form validation ---------------- */
  function initPartner() {
    var form = document.getElementById('ptForm');
    if (!form) return;

    var MAX = 800;
    var done = document.querySelector('[data-pt-done]');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-pt-tab]'));
    var note = document.querySelector('[data-pt-note]');
    var progInput = document.getElementById('ptProgram');

    var f = {
      name: document.getElementById('ptName'),
      email: document.getElementById('ptEmail'),
      phone: document.getElementById('ptPhone'),
      country: document.getElementById('ptCountry'),
      msg: document.getElementById('ptMsg'),
      consent: document.getElementById('ptConsent')
    };
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
      phone: function (v) { return !v.trim() || /^\+?[\d\s()-]{6,20}$/.test(v.trim()); },
      country: function (v) { return !!v; },
      msg: function (v) { return !v.trim() || v.trim().length <= MAX; }
    };

    function bad(el, on) {
      if (!el) return;
      var wrap = el.closest('.ct-field') || el.closest('.ct-check');
      var err = document.getElementById(el.id + 'Err');
      if (wrap) wrap.classList.toggle('is-bad', on);
      if (err) err.hidden = !on;
      el.setAttribute('aria-invalid', on ? 'true' : 'false');
    }
    Object.keys(rules).forEach(function (k) {
      var el = f[k];
      if (!el) return;
      el.addEventListener('input', function () { if (rules[k](el.value)) bad(el, false); });
      el.addEventListener('change', function () { if (rules[k](el.value)) bad(el, false); });
    });
    function check() {
      var first = null;
      Object.keys(rules).forEach(function (k) {
        var el = f[k];
        if (!el) return;
        var ok = rules[k](el.value);
        bad(el, !ok);
        if (!ok && !first) first = el;
      });
      return first;
    }

    /* one form, three programmes — the tab sets what the enquiry is for */
    function select(key) {
      var hit = null;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-pt-tab') === key;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on) hit = t;
      });
      if (hit && note) note.innerHTML = hit.getAttribute('data-pt-desc') || '';
      if (hit && progInput) progInput.value = hit.textContent.trim();
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t.getAttribute('data-pt-tab')); });
      // arrow keys move between tabs, as a tablist should
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t);
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
        if (n < 0 || n >= tabs.length) return;
        e.preventDefault();
        tabs[n].focus();
        select(tabs[n].getAttribute('data-pt-tab'));
      });
    });
    // a page can preselect its own programme, and #form?model= deep links work too
    var initial = form.getAttribute('data-pt-initial') || (tabs[0] && tabs[0].getAttribute('data-pt-tab'));
    var hashModel = (window.location.hash.match(/model=([a-z]+)/) || [])[1];
    if (hashModel && tabs.some(function (t) { return t.getAttribute('data-pt-tab') === hashModel; })) initial = hashModel;
    if (tabs.length) select(initial);

    var count = document.querySelector('[data-pt-count]');
    if (f.msg && count) {
      var tick = function () {
        var n = f.msg.value.length;
        count.textContent = n + ' / ' + MAX;
        count.classList.toggle('is-over', n > MAX);
      };
      f.msg.addEventListener('input', tick);
      tick();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = check();
      var cOk = !f.consent || f.consent.checked;
      if (f.consent) {
        var cWrap = f.consent.closest('.ct-check');
        var cErr = document.getElementById('ptConsentErr');
        if (cWrap) cWrap.classList.toggle('is-bad', !cOk);
        if (cErr) cErr.hidden = cOk;
      }
      if (!cOk && !first) first = f.consent;
      if (first) { first.focus(); return; }

      var msg = document.querySelector('[data-pt-done-msg]');
      if (msg) {
        // the institutional page is an enquiry to a different desk, not an application
        var prog = progInput ? progInput.value : 'partnership';
        var noun = form.getAttribute('data-pt-noun') || 'application';
        var desk = form.getAttribute('data-pt-desk') || 'partnerships';
        msg.innerHTML = 'Your <b>' + prog + '</b> ' + noun + ' is with the ' + desk + ' desk. ' +
          'We\u2019ll reply to <b>' + (f.email ? f.email.value.trim() : 'your email') + '</b> within one business day.';
      }
      form.hidden = true;
      if (done) {
        done.hidden = false;
        var h = done.querySelector('[data-pt-done-h]');
        if (h) h.focus({ preventScroll: true });
      }
      if (hasST) ScrollTrigger.refresh();
    });

    var again = document.querySelector('[data-pt-again]');
    if (again) again.addEventListener('click', function () {
      form.reset();
      Object.keys(rules).forEach(function (k) { bad(f[k], false); });
      var cErr = document.getElementById('ptConsentErr');
      if (cErr) cErr.hidden = true;
      if (done) done.hidden = true;
      form.hidden = false;
      if (tabs.length) select(initial);
      if (hasST) ScrollTrigger.refresh();
    });

    /* country chips drop into the bottom of their box under gravity as the
       tier cards scroll in — each one from a random height, drift and spin */
    document.querySelectorAll('[data-pt-drop]').forEach(function (box, bi) {
      var chips = Array.prototype.slice.call(box.querySelectorAll('.pt-cty'));
      if (!chips.length) return;
      if (prefersReduced || !hasGSAP || !hasST) {
        // nothing to animate: show them where they already sit
        chips.forEach(function (c) { c.style.opacity = '1'; });
        return;
      }
      // deterministic pseudo-random so the layout is identical on every load
      function rnd(i, salt) {
        var x = Math.sin((i + 1) * 12.9898 + bi * 4.1414 + salt * 78.233) * 43758.5453;
        return x - Math.floor(x);
      }
      var tl = gsap.timeline({
        scrollTrigger: { trigger: box, start: 'top 84%', once: true }
      });
      chips.forEach(function (c, i) {
        var drop = -90 - rnd(i, 1) * 130;          // start well above the box
        var drift = (rnd(i, 2) - 0.5) * 46;        // sideways scatter
        var spin = (rnd(i, 3) - 0.5) * 34;         // tumble on the way down
        tl.fromTo(c,
          { opacity: 0, y: drop, x: drift, rotate: spin },
          { opacity: 1, y: 0, x: 0, rotate: 0, duration: 0.9 + rnd(i, 4) * 0.35,
            ease: 'bounce.out' },
          rnd(i, 5) * 0.5);                        // staggered release, not a wave
      });
    });

    if (prefersReduced || COARSE || !hasGSAP || !hasST) return;
    gsap.utils.toArray('[data-pt-aura]').forEach(function (aura) {
      var amt = parseFloat(aura.getAttribute('data-pt-aura'));
      if (!amt) return;
      gsap.to(aura, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: aura.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------- Company — global presence map ---------------- */
  function initCompany() {
    var root = document.getElementById('coGlobal');
    if (!root) return;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.co-reg'));
    var pins = Array.prototype.slice.call(root.querySelectorAll('.co-pin'));

    // Regulator card <-> map pin cross-highlighting
    function setActive(r) {
      if (!r) return;
      cards.forEach(function (c) { c.classList.toggle('is-active', c.dataset.r === r); });
      pins.forEach(function (p) { p.classList.toggle('active', p.dataset.r === r); });
    }
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { setActive(c.dataset.r); });
      c.addEventListener('focusin', function () { setActive(c.dataset.r); });
      c.addEventListener('click', function () { setActive(c.dataset.r); });
    });
    pins.forEach(function (p) {
      p.addEventListener('mouseenter', function () { setActive(p.dataset.r); });
      p.addEventListener('click', function () { setActive(p.dataset.r); });
    });

    // Count-up stats when they scroll into view (key-stats bento + any stat strip)
    var nums = Array.prototype.slice.call(document.querySelectorAll('.num[data-count]'));
    function runCount(el) {
      var end = parseFloat(el.dataset.count);
      if (isNaN(end)) return;
      var dec = parseInt(el.dataset.dec || '0', 10);
      if (prefersReduced || !window.requestAnimationFrame) { el.textContent = end.toFixed(dec); return; }
      var dur = 1400, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var val = end * (1 - Math.pow(1 - p, 3));
        el.textContent = dec ? val.toFixed(dec) : Math.round(val).toString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (nums.length) {
      if (!('IntersectionObserver' in window)) { nums.forEach(runCount); }
      else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } });
        }, { threshold: 0.5 });
        nums.forEach(function (el) { io.observe(el); });
      }
    }
  }


  /* ---------------- Market analysis ---------------- */
  function initMarketAnalysis() {
    var page = document.querySelector('.ma-hero');
    if (!page) return;

    /* --- reveal-driven chart animations (bar widths, trend draw) --- */
    (function () {
      var seen = Array.prototype.slice.call(document.querySelectorAll('.ma-card, .ma-rep'));
      var meth = document.querySelector('[data-ma-meth]');
      if (prefersReduced || !('IntersectionObserver' in window)) {
        seen.forEach(function (el) { el.classList.add('is-seen'); });
        if (meth) meth.setAttribute('data-seen', '');
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (e.target === meth) e.target.setAttribute('data-seen', '');
          else e.target.classList.add('is-seen');
          io.unobserve(e.target);
        });
      }, { threshold: 0.25 });
      seen.forEach(function (el) { io.observe(el); });
      if (meth) io.observe(meth);
    })();

    /* --- report filtering --- */
    (function () {
      var root = document.getElementById('reports');
      if (!root) return;
      var PAGE = parseInt(root.getAttribute('data-page-size'), 10) || 6;
      var NAMES = { ta: 'Technical', fa: 'Fundamental', wk: 'Weekly', mo: 'Monthly' };

      var items = Array.prototype.slice.call(root.querySelectorAll('[data-ma-item]'));
      var chips = Array.prototype.slice.call(root.querySelectorAll('[data-ma-cat]'));
      var input = document.getElementById('maSearch');
      var clear = document.getElementById('maClear');
      var statusEl = root.querySelector('[data-ma-status]');
      var emptyEl = root.querySelector('[data-ma-empty]');
      var emptyQ = root.querySelector('[data-ma-empty-q]');
      var resetBtn = root.querySelector('[data-ma-reset]');
      var moreRow = root.querySelector('[data-ma-morerow]');
      var moreBtn = root.querySelector('[data-ma-more]');
      var cat = 'all', query = '', shown = PAGE;
      stripAosHidden(items);

      items.forEach(function (el) {
        el._h = el.querySelector('h3 a');
        el._p = el.querySelector('p');
        el._hRaw = el._h ? el._h.textContent : '';
        el._pRaw = el._p ? el._p.textContent : '';
        el._hay = ((el.getAttribute('data-title') || '') + ' ' + el._pRaw).toLowerCase();
      });

      function esc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
      function mark(el, raw, q) {
        if (!el) return;
        if (!q) { el.textContent = raw; return; }
        el.innerHTML = raw.replace(new RegExp('(' + esc(q) + ')', 'ig'), '<mark>$1</mark>');
      }

      function apply() {
        var q = query.trim().toLowerCase();
        var matched = items.filter(function (el) {
          return (cat === 'all' || el.getAttribute('data-cat') === cat) && (!q || el._hay.indexOf(q) > -1);
        });
        items.forEach(function (el) { el.hidden = true; });
        matched.forEach(function (el, i) {
          el.hidden = i >= shown;
          mark(el._h, el._hRaw, q);
          mark(el._p, el._pRaw, q);
        });
        if (emptyEl) emptyEl.hidden = matched.length !== 0;
        if (emptyQ) emptyQ.textContent = q ? '“' + query.trim() + '”' : 'that filter';
        if (moreRow) moreRow.hidden = matched.length <= shown;
        if (clear) clear.hidden = !query;
        chips.forEach(function (b) {
          var on = b.getAttribute('data-ma-cat') === cat;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (statusEl) {
          var seen = Math.min(shown, matched.length);
          statusEl.textContent = matched.length
            ? 'Showing ' + seen + ' of ' + matched.length + (matched.length === 1 ? ' report' : ' reports') +
              (cat === 'all' ? '' : ' in ' + NAMES[cat]) + (q ? ' matching “' + query.trim() + '”' : '')
            : '';
        }
        if (hasST) ScrollTrigger.refresh();
      }

      chips.forEach(function (b) {
        b.addEventListener('click', function () { cat = b.getAttribute('data-ma-cat'); shown = PAGE; apply(); });
      });
      if (input) {
        var t;
        input.addEventListener('input', function () {
          query = input.value; shown = PAGE;
          clearTimeout(t); t = setTimeout(apply, 120);
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && input.value) { input.value = ''; query = ''; shown = PAGE; apply(); }
        });
      }
      function reset() { if (input) input.value = ''; query = ''; cat = 'all'; shown = PAGE; apply(); }
      if (clear) clear.addEventListener('click', function () { reset(); if (input) input.focus(); });
      if (resetBtn) resetBtn.addEventListener('click', reset);
      if (moreBtn) moreBtn.addEventListener('click', function () { shown += PAGE; apply(); });

      apply();
    })();

    /* --- method: the sticky visual follows whichever step is in view --- */
    (function () {
      var meth = document.querySelector('[data-ma-meth]');
      if (!meth) return;
      var steps = Array.prototype.slice.call(meth.querySelectorAll('[data-ma-meth-item]'));
      var lbl = meth.querySelector('[data-ma-meth-lbl]');
      var num = meth.querySelector('[data-ma-meth-n]');
      var cap = meth.querySelector('[data-ma-meth-cap]');
      if (!steps.length) return;

      function setActive(i) {
        steps.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
        var s = steps[i];
        if (lbl) lbl.textContent = s.getAttribute('data-lbl');
        if (num) num.textContent = s.getAttribute('data-n');
        if (cap) cap.innerHTML = s.getAttribute('data-cap');
        meth.setAttribute('data-on', String(i + 1));
      }
      setActive(0);

      if (prefersReduced || !hasGSAP || !hasST) {
        // no scroll driver — let a click or focus move the visual instead
        steps.forEach(function (s, i) {
          s.addEventListener('mouseenter', function () { setActive(i); });
          s.addEventListener('focusin', function () { setActive(i); });
        });
        return;
      }
      steps.forEach(function (s, i) {
        ScrollTrigger.create({
          trigger: s, start: 'top 62%', end: 'bottom 42%',
          onEnter: function () { setActive(i); },
          onEnterBack: function () { setActive(i); }
        });
      });
    })();

    /* --- subscribe --- */
    (function () {
      var form = document.querySelector('[data-ma-sub]');
      if (!form) return;
      var note = form.querySelector('[data-ma-sub-note]');
      var input = form.querySelector('input[type="email"]');
      var base = note ? note.textContent : '';
      // the error takes its own line above the note so the compliance hint
      // never leaves the page (IT 8.24, style row 68); it clears as soon as
      // the reader starts correcting the address
      function clearErr() {
        var err = form.querySelector('[data-ma-sub-err]');
        if (err && err.parentNode) err.parentNode.removeChild(err);
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = (input && input.value || '').trim();
        var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (!note) return;
        if (ok) {
          clearErr();
          note.textContent = 'Thanks — the next briefing will land in your inbox before the London open.';
          note.className = 'ma-sub-note is-ok';
          if (input) input.value = '';
          setTimeout(function () { note.textContent = base; note.className = 'ma-sub-note'; }, 6000);
        } else {
          var err = form.querySelector('[data-ma-sub-err]');
          if (!err) {
            err = document.createElement('p');
            err.setAttribute('data-ma-sub-err', '');
            err.className = 'ma-sub-note is-err';
            note.parentNode.insertBefore(err, note);
          }
          err.textContent = 'That email address does not look right. Check it and try again.';
          note.textContent = base;
          note.className = 'ma-sub-note';
        }
      });
      if (input) input.addEventListener('input', clearErr);
    })();
  }

  /* ---------------- Knowledge centre ---------------- */
  function initKnowledge() {
    var page = document.querySelector('.kc-hero');
    if (!page) return;

    /* --- learning path: the line fills and the nodes light as you scroll --- */
    (function () {
      var road = document.querySelector('[data-kc-road]');
      if (!road) return;
      var fill = road.querySelector('[data-kc-road-fill]');
      var nodes = Array.prototype.slice.call(road.querySelectorAll('[data-kc-node]'));

      if (prefersReduced || !hasGSAP || !hasST) {
        nodes.forEach(function (n) { n.classList.add('is-on'); });
        if (fill) fill.style.transform = 'scaleX(1)';
      } else {
        if (fill) {
          gsap.fromTo(fill, { scaleX: 0 }, {
            scaleX: 1, ease: 'none',
            scrollTrigger: { trigger: road, start: 'top 76%', end: 'bottom 70%', scrub: 0.6 }
          });
        }
        nodes.forEach(function (n) {
          ScrollTrigger.create({
            trigger: n, start: 'top 78%', once: true,
            onEnter: function () { n.classList.add('is-on'); }
          });
        });
      }

      // "Start here" jumps to the guides with that level already selected
      Array.prototype.slice.call(road.querySelectorAll('[data-kc-goto]')).forEach(function (b) {
        b.addEventListener('click', function () {
          var lvl = b.getAttribute('data-kc-goto');
          var tab = document.querySelector('[data-kc-level="' + lvl + '"]');
          if (tab) tab.click();
          var target = document.getElementById('guides');
          if (target) scrollToTarget(target, -90);
        });
      });
    })();

    /* --- guides: level tabs + product chips --- */
    (function () {
      var root = document.getElementById('guides');
      if (!root) return;
      var PRODS = { forex: 'Forex', commodities: 'Commodities', indices: 'Indices', shares: 'Shares', crypto: 'Crypto' };
      var LEVELS = { basics: 'Basics', intermediate: 'Intermediate', advanced: 'Advanced' };

      var items = Array.prototype.slice.call(root.querySelectorAll('[data-kc-item]'));
      var levels = Array.prototype.slice.call(root.querySelectorAll('[data-kc-level]'));
      var prods = Array.prototype.slice.call(root.querySelectorAll('[data-kc-prod]'));
      var ind = root.querySelector('[data-kc-ind]');
      var statusEl = root.querySelector('[data-kc-status]');
      var emptyEl = root.querySelector('[data-kc-empty]');
      var resetBtn = root.querySelector('[data-kc-reset]');
      // no level tablist on the page means every level shows (education.html, IT 8.31)
      var level = levels.length ? 'basics' : 'all', prod = 'all';

      function moveInd() {
        if (!ind) return;
        var on = levels.filter(function (b) { return b.classList.contains('is-on'); })[0];
        if (!on) return;
        // the tabs wrap once translations outgrow the bar, so the pill needs
        // the vertical axis too — it follows its tab onto whichever row
        ind.style.width = on.offsetWidth + 'px';
        ind.style.height = on.offsetHeight + 'px';
        ind.style.transform = 'translate(' + on.offsetLeft + 'px,' + on.offsetTop + 'px)';
      }
      var indT = null;
      window.addEventListener('resize', function () {
        clearTimeout(indT);
        indT = setTimeout(moveInd, 140);
      });

      function apply() {
        var matched = items.filter(function (el) {
          return (level === 'all' || el.getAttribute('data-level') === level) &&
                 (prod === 'all' || el.getAttribute('data-prod') === prod);
        });
        items.forEach(function (el) { el.hidden = true; });
        matched.forEach(function (el) { el.hidden = false; });

        // the featured card only earns two columns when it is actually shown
        var feat = matched.filter(function (el) { return el.classList.contains('kc-guide--feat'); })[0];
        items.forEach(function (el) { el.style.gridColumn = ''; });
        if (feat && matched.length < 3) feat.style.gridColumn = 'span 1';

        if (emptyEl) emptyEl.hidden = matched.length !== 0;
        levels.forEach(function (b) {
          var on = b.getAttribute('data-kc-level') === level;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
        });
        prods.forEach(function (b) {
          var on = b.getAttribute('data-kc-prod') === prod;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (statusEl) {
          statusEl.textContent = matched.length
            ? 'Showing ' + matched.length + (matched.length === 1 ? ' guide' : ' guides') +
              (level === 'all' ? '' : ' at ' + LEVELS[level]) + (prod === 'all' ? '' : ' in ' + PRODS[prod])
            : '';
        }
        moveInd();
        if (hasST) ScrollTrigger.refresh();
      }

      levels.forEach(function (b) {
        b.addEventListener('click', function () { level = b.getAttribute('data-kc-level'); apply(); });
      });
      prods.forEach(function (b) {
        b.addEventListener('click', function () { prod = b.getAttribute('data-kc-prod'); apply(); });
      });
      if (resetBtn) resetBtn.addEventListener('click', function () { prod = 'all'; apply(); });

      // arrow-key support on the level tablist
      levels.forEach(function (b, i) {
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var next = levels[(i + d + levels.length) % levels.length];
          next.click(); next.focus();
        });
      });

      apply();
      window.addEventListener('resize', moveInd);
      window.addEventListener('load', moveInd);
    })();
  }


  /* ---------------- Listing filters (CSR / events / media / achievements) ---------------- */
  function initPageList() {
    var root = document.getElementById('latest');
    if (!root || !root.querySelector('[data-pg-item]')) return;
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-pg-item]'));
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-pg-cat]'));
    var statusEl = root.querySelector('[data-pg-status]');
    var emptyEl = root.querySelector('[data-pg-empty]');
    var resetBtn = root.querySelector('[data-pg-reset]');
    var moreRow = root.querySelector('[data-pg-morerow]');
    var moreBtn = root.querySelector('[data-pg-more]');
    var PAGE = parseInt(root.getAttribute('data-page-size'), 10) || 0;
    var cat = 'all';
    var shown = PAGE || Infinity;
    stripAosHidden(items);

    function apply() {
      var matched = items.filter(function (el) {
        return cat === 'all' || el.getAttribute('data-cat') === cat;
      });
      items.forEach(function (el) { el.hidden = true; });
      matched.forEach(function (el, i) { el.hidden = i >= shown; });
      chips.forEach(function (b) {
        var on = b.getAttribute('data-pg-cat') === cat;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (moreRow) moreRow.hidden = matched.length <= shown;
      if (emptyEl) emptyEl.hidden = matched.length !== 0;
      if (statusEl) {
        var seen = Math.min(shown, matched.length);
        statusEl.textContent = matched.length ? 'Showing ' + seen + ' of ' + matched.length + (matched.length === 1 ? ' item' : ' items') : '';
      }
      if (hasST) ScrollTrigger.refresh();
    }
    chips.forEach(function (b) {
      b.addEventListener('click', function () { cat = b.getAttribute('data-pg-cat'); shown = PAGE || Infinity; apply(); });
    });
    if (resetBtn) resetBtn.addEventListener('click', function () { cat = 'all'; shown = PAGE || Infinity; apply(); });
    if (moreBtn) moreBtn.addEventListener('click', function () {
      var first = shown;
      shown += PAGE;
      apply();
      var visible = items.filter(function (el) { return !el.hidden; });
      var target = visible[first];
      if (target) {
        var h = target.querySelector('.nr-h a');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      }
    });
    apply();
  }

  /* ---------------- Generic listing Load more (knowledge centre) ---------------- */
  function initLoadMore() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-lm]'));
    roots.forEach(function (root) {
      var items = Array.prototype.slice.call(root.querySelectorAll(root.getAttribute('data-lm')));
      var moreRow = root.querySelector('[data-lm-morerow]');
      var moreBtn = root.querySelector('[data-lm-more]');
      var PAGE = parseInt(root.getAttribute('data-page-size'), 10) || 6;
      if (!items.length || !moreBtn) return;
      var shown = PAGE;
      function apply() {
        items.forEach(function (el, i) { el.hidden = i >= shown; });
        if (moreRow) moreRow.hidden = items.length <= shown;
        if (hasST) ScrollTrigger.refresh();
      }
      moreBtn.addEventListener('click', function () {
        var first = shown;
        shown += PAGE;
        apply();
        var target = items[first];
        if (target) {
          var h = target.querySelector('h3 a') || target;
          h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
        }
      });
      apply();
      stripAosHidden(items);
    });
  }

  /* ---------------- Help centre topic search ---------------- */
  function initHelpCentre() {
    var input = document.getElementById('hcSearch');
    if (!input) return;
    var wrap = document.querySelector('.hc-topics');
    var topics = Array.prototype.slice.call(document.querySelectorAll('.hc-topic'));
    var clear = document.getElementById('hcClear');
    var statusEl = document.querySelector('[data-hc-status]');
    var emptyEl = document.querySelector('[data-hc-empty]');
    var resetBtn = document.querySelector('[data-hc-reset]');
    topics.forEach(function (t) { t._hay = t.textContent.toLowerCase(); });

    function apply() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      topics.forEach(function (t) {
        var on = !q || t._hay.indexOf(q) > -1;
        t.hidden = !on;
        if (on) shown++;
      });
      if (clear) clear.hidden = !input.value;
      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (wrap) wrap.hidden = shown === 0;
      if (statusEl) statusEl.textContent = q ? (shown ? shown + (shown === 1 ? ' topic' : ' topics') + ' matching “' + input.value.trim() + '”' : '') : '';
      if (hasST) ScrollTrigger.refresh();
    }
    var t;
    input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(apply, 110); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape' && input.value) { input.value = ''; apply(); } });
    if (clear) clear.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
    if (resetBtn) resetBtn.addEventListener('click', function () { input.value = ''; apply(); });
  }

  /* ---------------- PCCME telemetry (this page only) ---------------- */
  function initTelemetry() {
    var root = document.querySelector('[data-tel]');
    if (!root) return;
    // speed / throttle / brake / gear per phase — narrative numbers, not a simulation
    var LAPS = [
      { title: 'Preparation', sub: 'Setup and simulation', v: 90,  thr: 25, brk: 10, gear: 2,
        note: 'Before the lights, the work is already done. The same is true of a trade you have planned.' },
      { title: 'Qualifying',  sub: 'Finding the limit',    v: 205, thr: 82, brk: 34, gear: 5,
        note: 'Qualifying is where you learn where the limit is — cheaply, before it costs you the race.' },
      { title: 'Race start',  sub: 'Committing to the plan', v: 168, thr: 64, brk: 58, gear: 4,
        note: 'The plan survives contact or it was never a plan. Position sizing is decided before the lights, not after.' },
      { title: 'Final lap',   sub: 'Holding the line',     v: 246, thr: 96, brk: 18, gear: 6,
        note: 'Holding a lead is a different skill from taking one. So is holding a winning position.' }
    ];
    var MAX = 300, ARC = 315;
    var els = {
      title: root.querySelector('[data-tel-title]'), sub: root.querySelector('[data-tel-sub]'),
      gear: root.querySelector('[data-tel-gear]'), arc: root.querySelector('[data-tel-arc]'),
      val: root.querySelector('[data-tel-val]'), thr: root.querySelector('[data-tel-thr]'),
      brk: root.querySelector('[data-tel-brk]'), lap: root.querySelector('[data-tel-lapno]'),
      note: root.querySelector('[data-tel-note]')
    };
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-tel-lap]'));
    var tween = null;

    function count(el, to) {
      if (!el) return;
      if (prefersReduced || !hasGSAP) { el.textContent = to; return; }
      var obj = { v: parseFloat(el.textContent) || 0 };
      gsap.to(obj, { v: to, duration: .9, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(obj.v); } });
    }
    function select(i) {
      var L = LAPS[i];
      buttons.forEach(function (b, n) {
        b.classList.toggle('is-on', n === i);
        b.setAttribute('aria-pressed', n === i ? 'true' : 'false');
      });
      if (els.title) els.title.textContent = L.title;
      if (els.sub) els.sub.textContent = L.sub;
      if (els.gear) els.gear.textContent = L.gear;
      if (els.note) els.note.textContent = L.note;
      if (els.lap) els.lap.textContent = i + 1;
      if (els.arc) els.arc.style.strokeDashoffset = String(ARC - ARC * (L.v / MAX));
      count(els.val, L.v); count(els.thr, L.thr); count(els.brk, L.brk);
    }
    buttons.forEach(function (b, i) { b.addEventListener('click', function () { select(i); }); });

    // run the first phase only once the dial is actually on screen
    if (!prefersReduced && hasST) {
      ScrollTrigger.create({ trigger: root, start: 'top 78%', once: true, onEnter: function () { select(0); } });
    } else { select(0); }
  }


  /* ---------------- MT pages: horizontal rail with its own controls ---------------- */
  function initMtRail() {
    var sec = document.querySelector('[data-mt-rail]');
    if (!sec) return;
    var vp = sec.querySelector('[data-mt-rail-vp]');
    var track = sec.querySelector('[data-mt-rail-track]');
    var bar = sec.querySelector('[data-mt-rail-bar]');
    var prev = sec.querySelector('[data-mt-rail-prev]');
    var next = sec.querySelector('[data-mt-rail-next]');
    if (!vp || !track) return;

    function step() {
      var card = track.querySelector('.mt-rail-card');
      var gap = parseFloat(getComputedStyle(track).gap) || 20;
      return card ? card.getBoundingClientRect().width + gap : vp.clientWidth * 0.8;
    }
    function maxScroll() { return Math.max(0, vp.scrollWidth - vp.clientWidth); }
    function sync() {
      var max = maxScroll();
      if (bar) bar.style.transform = 'scaleX(' + (max ? vp.scrollLeft / max : 1) + ')';
      if (prev) prev.disabled = vp.scrollLeft <= 2;
      if (next) next.disabled = vp.scrollLeft >= max - 2;
    }
    function go(dir) {
      // stepping by the first card's width drifted: the video card is wider
      // than the rest, so each press slid the deck a little further out of
      // line until a card sat half-cut at the edge with its text clipped.
      // land on a card's own left edge instead, whichever direction
      var cards = track.querySelectorAll('.mt-rail-card');
      var base = vp.getBoundingClientRect().left +
        (parseFloat(getComputedStyle(track).paddingLeft) || 24);
      var target = null;
      for (var i = 0; i < cards.length; i++) {
        var d = cards[i].getBoundingClientRect().left - base;
        if (dir > 0) { if (d > 6) { target = vp.scrollLeft + d; break; } }
        else if (d < -6) { target = vp.scrollLeft + d; }
      }
      if (target === null) target = vp.scrollLeft + dir * step();
      vp.scrollTo({ left: target, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    vp.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }


  /* ---------------- Copy trading: journey tabs + provider ranking ---------------- */
  function initCopyTrade() {
    var jr = document.getElementById('journey');
    if (jr) {
      var tabs = Array.prototype.slice.call(jr.querySelectorAll('[data-ct-tab]'));
      var panels = Array.prototype.slice.call(jr.querySelectorAll('[data-ct-panel]'));
      var ind = jr.querySelector('[data-ct-ind]');

      function moveInd() {
        if (!ind) return;
        var on = tabs.filter(function (t) { return t.classList.contains('is-on'); })[0];
        if (!on) return;
        ind.style.width = on.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      }
      function select(key) {
        tabs.forEach(function (t) {
          var on = t.getAttribute('data-ct-tab') === key;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
        });
        panels.forEach(function (pn) { pn.hidden = pn.getAttribute('data-ct-panel') !== key; });
        moveInd();
        if (hasST) ScrollTrigger.refresh();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t.getAttribute('data-ct-tab')); });
        t.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var nx = tabs[(i + d + tabs.length) % tabs.length];
          nx.click(); nx.focus();
        });
      });
      moveInd();
      window.addEventListener('resize', moveInd);
      window.addEventListener('load', moveInd);
    }

    // the ranking rail is a Swiper marquee now (see initMarqueeSwipers)
  }

  /* ---------------- STAR Copy: benefit rail + master board ---------------- */
  function initStarCopy() {
    var fan = document.querySelector('[data-sc-fan]');
    if (fan) {
      var panels = Array.prototype.slice.call(fan.querySelectorAll('[data-sc-panel]'));

      var open = function (i) {
        panels.forEach(function (p, k) {
          var on = k === i;
          p.classList.toggle('is-on', on);
          var hit = p.querySelector('[data-sc-hit]');
          if (hit) hit.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      };

      panels.forEach(function (p, i) {
        var hit = p.querySelector('[data-sc-hit]');
        if (hit) {
          hit.addEventListener('click', function () { open(i); });
          hit.addEventListener('focus', function () { open(i); });
        }
        p.addEventListener('mouseenter', function () { open(i); });
        // the dwell bar is the clock: CSS pauses it while the rail is hovered,
        // so the panels wait with it rather than advancing under the pointer
        var bar = p.querySelector('.sc-panel-bar i');
        if (bar) bar.addEventListener('animationend', function () { open((i + 1) % panels.length); });
      });

      // nothing should tick while the rail is off screen
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { fan.classList.toggle('is-live', e.isIntersecting); });
        }, { threshold: 0.25 }).observe(fan);
      } else {
        fan.classList.add('is-live');
      }
    }

    // the master board rides the same rail as the copy-trading ranking
    var board = document.querySelector('[data-sc-board]');
    if (!board) return;
    // (the board rail is a Swiper marquee now)

    // draw the curves and fill the win-rate meters once the board is on screen
    if (prefersReduced || !('IntersectionObserver' in window)) { board.classList.add('is-seen'); return; }
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { board.classList.add('is-seen'); bio.unobserve(e.target); } });
    }, { threshold: 0.2 });
    bio.observe(board);
  }

  /* ---------------- NBA partnership: arc deck, tilt, parallax, HUD ---------------- */
  function initNba() {
    var hero = document.querySelector('.nb-hero');
    if (!hero) return;

    if (!prefersReduced) {
      // the banner drifts up as the hero leaves
      var bg = hero.querySelector('[data-nb-bg]');
      if (bg && hasGSAP && hasST) {
        gsap.to(bg, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }
      // (the ticker rail is a Swiper marquee now)
    }

    /* --- the deck: five cards on an arc, reordering around the one you pick --- */
    var arc = document.querySelector('[data-nb-arc]');
    if (arc) {
      var cards = Array.prototype.slice.call(arc.querySelectorAll('[data-nb-card]'));
      var dots = Array.prototype.slice.call(document.querySelectorAll('[data-nb-dot]'));
      var at = 2, hold = false, spin = null;

      function lay() {
        var wide = window.matchMedia('(min-width:721px)').matches;
        cards.forEach(function (c, i) {
          c.classList.toggle('is-on', i === at);
          if (!wide) { c.style.cssText = ''; return; }
          // shortest way round, so the deck always fans on both sides
          var n = cards.length, d = i - at;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          var ad = Math.abs(d);
          c.style.setProperty('--x', (d * 70) + '%');
          c.style.setProperty('--y', (ad * ad * 18) + 'px');
          c.style.setProperty('--r', (d * 8) + 'deg');
          c.style.setProperty('--z', (-ad * 130) + 'px');
          c.style.setProperty('--s', (1 - ad * 0.08).toFixed(3));
          c.style.opacity = ad > 2 ? 0 : (1 - ad * 0.2);
          c.style.zIndex = 20 - ad;
        });
        dots.forEach(function (d, i) { d.classList.toggle('is-on', i === at); });
      }
      function pick(i) { at = (i + cards.length) % cards.length; lay(); }

      cards.forEach(function (c, i) {
        c.addEventListener('click', function () { hold = true; pick(i); });
        c.addEventListener('focus', function () { hold = true; pick(i); });
      });
      dots.forEach(function (d, i) { d.addEventListener('click', function () { hold = true; pick(i); }); });
      arc.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!k) return;
        e.preventDefault(); hold = true; pick(at + k); cards[at].focus();
      });
      window.addEventListener('resize', lay);
      lay();

      // the deck deals itself until someone reaches for it
      if (!prefersReduced && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting && !spin && !hold) spin = setInterval(function () { if (hold) { clearInterval(spin); spin = null; return; } pick(at + 1); }, 3600);
            else if (!e.isIntersecting && spin) { clearInterval(spin); spin = null; }
          });
        }, { threshold: 0.3 }).observe(arc);
      }
    }

    /* --- the locker: one screen, and a wall of team designs behind it --- */
    var locker = document.querySelector('[data-nb-locker]');
    if (locker) {
      var deck = locker.querySelector('[data-nb-deck]');
      var tiles = Array.prototype.slice.call(locker.querySelectorAll('[data-nb-tile]'));
      var shot = locker.querySelector('[data-nb-shot]');
      var nameEl = locker.querySelector('[data-nb-name]');
      var idxEl = locker.querySelector('[data-nb-idx]');
      var getEl = locker.querySelector('[data-nb-get]');
      var chips = Array.prototype.slice.call(locker.querySelectorAll('.nb-chips i'));
      var phone = locker.querySelector('[data-nb-phone]');
      var wallAt = 0, touched = false, cycle = null;

      tiles.forEach(function (t, i) { if (t.classList.contains('is-on')) wallAt = i; });

      function dress(i) {
        wallAt = (i + tiles.length) % tiles.length;
        var t = tiles[wallAt];
        var pri = t.getAttribute('data-pri'), sec = t.getAttribute('data-sec');
        var src = t.getAttribute('data-src'), name = t.getAttribute('data-name');

        locker.style.setProperty('--pri', pri);
        locker.style.setProperty('--sec', sec);
        tiles.forEach(function (o, k) {
          var on = k === wallAt;
          o.classList.toggle('is-on', on);
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          o.tabIndex = on ? 0 : -1;
        });
        if (nameEl) nameEl.textContent = name;
        if (idxEl) idxEl.textContent = ('0' + (wallAt + 1)).slice(-2);
        if (getEl) getEl.setAttribute('href', src);
        chips.forEach(function (c, k) { c.style.background = k ? sec : pri; });

        // the screen only changes once the next design is decoded, so it never flashes
        if (shot && shot.getAttribute('src') !== src) {
          var pre = new Image();
          var swap = function () {
            shot.src = src;
            shot.alt = name + ' wallpaper';
            requestAnimationFrame(function () { shot.classList.remove('is-swap'); });
          };
          shot.classList.add('is-swap');
          pre.onload = swap;
          pre.onerror = swap;
          pre.src = src;
        }

        // keep the picked tile inside the rail — but only for a pick the
        // reader made: the idle cycle must never scroll the row on its own
        if (touched && deck && deck.scrollWidth > deck.clientWidth + 4) {
          var dr = deck.getBoundingClientRect(), tr = t.getBoundingClientRect();
          var by = (tr.left + tr.width / 2) - (dr.left + dr.width / 2);
          if (deck.scrollTo) deck.scrollTo({ left: deck.scrollLeft + by, behavior: 'smooth' });
          else deck.scrollLeft += by;
        }
      }

      tiles.forEach(function (t, i) {
        t.addEventListener('click', function () { touched = true; dress(i); });
      });
      if (deck) {
        deck.addEventListener('keydown', function (e) {
          var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!k) return;
          e.preventDefault();
          touched = true;
          dress(wallAt + k);
          tiles[wallAt].focus();
        });
        enableDrag(deck);

        // the deck is one scrollable row now, and the arrows page it;
        // they grey out against the ends like every other rail
        var dkPrev = locker.querySelector('[data-nb-prev]');
        var dkNext = locker.querySelector('[data-nb-next]');
        if (dkPrev || dkNext) {
          var syncDeckNav = function () {
            var max = deck.scrollWidth - deck.clientWidth;
            if (dkPrev) dkPrev.disabled = deck.scrollLeft <= 2;
            if (dkNext) dkNext.disabled = deck.scrollLeft >= max - 2;
          };
          var pageDeck = function (dir) {
            deck.scrollBy({ left: dir * deck.clientWidth * 0.8, behavior: prefersReduced ? 'auto' : 'smooth' });
          };
          if (dkPrev) dkPrev.addEventListener('click', function () { pageDeck(-1); });
          if (dkNext) dkNext.addEventListener('click', function () { pageDeck(1); });
          deck.addEventListener('scroll', syncDeckNav, { passive: true });
          window.addEventListener('resize', syncDeckNav);
          syncDeckNav();
        }
      }

      if (!prefersReduced) {
        // the device answers the pointer, gently
        if (phone) {
          var stage = locker.querySelector('.nb-stage') || locker;
          stage.addEventListener('pointermove', function (e) {
            var r = phone.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            phone.style.transform = 'rotateY(' + (x * 13).toFixed(1) + 'deg) rotateX(' + (-y * 9).toFixed(1) + 'deg)';
          });
          stage.addEventListener('pointerleave', function () { phone.style.transform = ''; });
        }
        // the wall deals itself until someone picks
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting && !cycle && !touched) {
                cycle = setInterval(function () {
                  if (touched) { clearInterval(cycle); cycle = null; return; }
                  dress(wallAt + 1);
                }, 4200);
              } else if (!e.isIntersecting && cycle) { clearInterval(cycle); cycle = null; }
            });
          }, { threshold: 0.35 }).observe(locker);
        }
        if (hasGSAP && hasST) {
          gsap.fromTo(tiles, { y: 26, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.035,
            scrollTrigger: { trigger: deck || locker, start: 'top 88%', once: true }
          });
        }
      }
    }

    /* --- the habits take turns, and the cycle repeats --- */
    var reps = document.querySelector('[data-nb-reps]');
    if (!reps) return;
    var repCards = Array.prototype.slice.call(reps.children);
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-nb-bars] i'));
    var loopEl = document.querySelector('[data-nb-loop]');
    var live = 0, loops = 1, beat = null, held = false;

    function light(i) {
      live = i % repCards.length;
      repCards.forEach(function (c, k) { c.classList.toggle('is-live', k === live); });
      bars.forEach(function (b, k) { b.classList.toggle('is-on', k === live); });
    }
    function step() {
      if (held) return;
      var next = live + 1;
      if (next >= repCards.length) { next = 0; loops += 1; if (loopEl) loopEl.textContent = loops; }
      light(next);
    }
    repCards.forEach(function (c, i) {
      c.addEventListener('pointerenter', function () { held = true; light(i); });
      c.addEventListener('pointerleave', function () { held = false; });
    });
    reps.addEventListener('focusin', function () { held = true; });
    light(0);

    if (prefersReduced) return;
    if (hasGSAP && hasST) {
      gsap.fromTo(repCards, { y: 46, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: reps, start: 'top 84%', once: true }
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !beat) beat = setInterval(step, 3200);
          else if (!e.isIntersecting && beat) { clearInterval(beat); beat = null; }
        });
      }, { threshold: 0.35 }).observe(reps);
    } else {
      beat = setInterval(step, 3200);
    }
  }

  var PC_CORNERS = [["Performance", "Performance is the outcome, never the plan. On the grid and on the screen it is what is left over once preparation, discipline and equipment have all been accounted for."], ["Strategy", "Every race is a decision tree — tyres, fuel, when to push and when to hold. Every position is the same problem in a different language."], ["Endurance", "Championships are won across a season, not in a single lap. Consistency under repeated pressure beats one heroic afternoon."], ["Precision", "On this circuit the margin between a good lap and a lost one is measured in tenths. Precision is not a flourish; it is the whole job."], ["Control", "Speed without control ends in the barrier. Risk management is what turns raw pace into a finish, and a position into a return."]];

  /* ---------------- Porsche Carrera Cup Middle East ---------------- */
  function initPccme() {
    var hero = document.querySelector('.pc-hero');
    if (!hero) return;

    if (!prefersReduced) {
      // the banner drifts as it leaves, and the ticker runs along the bottom of it
      var bg = hero.querySelector('[data-pc-bg]');
      if (bg && hasGSAP && hasST) {
        gsap.to(bg, { yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }
    }

    /* --- the circuit: five corners, a pace car and a card that follows --- */
    var cir = document.querySelector('[data-pc-cir]');
    if (cir) {
      var pins = Array.prototype.slice.call(cir.querySelectorAll('[data-pc-pin]'));
      var shots = Array.prototype.slice.call(cir.querySelectorAll('[data-pc-shot]'));
      var titleEl = cir.querySelector('[data-pc-title]');
      var copyEl = cir.querySelector('[data-pc-copy]');
      var numEl = cir.querySelector('[data-pc-num]');
      var ofEl = cir.querySelector('[data-pc-of]');
      var barEl = cir.querySelector('[data-pc-bar]');
      var lap = cir.querySelector('[data-pc-lap]');
      var pace = cir.querySelector('[data-pc-pace]');
      var at = 0, held = false, tour = null;

      function turn(i) {
        at = (i + shots.length) % shots.length;
        pins.forEach(function (p, k) { p.classList.toggle('is-on', k === at); });
        shots.forEach(function (sh, k) { sh.classList.toggle('is-on', k === at); });
        if (numEl) numEl.textContent = ('0' + (at + 1)).slice(-2);
        if (ofEl) ofEl.textContent = ('0' + (at + 1)).slice(-2) + ' / ' + ('0' + shots.length).slice(-2);
        if (barEl) barEl.style.transform = 'scaleX(' + ((at + 1) / shots.length).toFixed(3) + ')';
        // the words change behind a short fade, so the swap reads as one move
        var t = PC_CORNERS[at];
        if (titleEl && copyEl && t) {
          titleEl.classList.add('is-fade');
          copyEl.classList.add('is-fade');
          setTimeout(function () {
            titleEl.textContent = t[0];
            copyEl.textContent = t[1];
            titleEl.classList.remove('is-fade');
            copyEl.classList.remove('is-fade');
          }, 200);
        }
        // the pace car parks at the corner you picked
        if (lap && pace && lap.getTotalLength) {
          var len = lap.getTotalLength();
          var pt = lap.getPointAtLength(len * (at / shots.length));
          pace.setAttribute('cx', pt.x);
          pace.setAttribute('cy', pt.y);
        }
      }

      pins.forEach(function (p, i) {
        p.addEventListener('click', function () { held = true; turn(i); });
        p.addEventListener('focus', function () { held = true; turn(i); });
      });
      turn(0);

      if (!prefersReduced && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting && !tour && !held) {
              tour = setInterval(function () {
                if (held) { clearInterval(tour); tour = null; return; }
                turn(at + 1);
              }, 4600);
            } else if (!e.isIntersecting && tour) { clearInterval(tour); tour = null; }
          });
        }, { threshold: 0.3 }).observe(cir);
      }

      // the lit line draws itself the first time the circuit comes into view
      if (!prefersReduced && lap && lap.getTotalLength && hasGSAP && hasST) {
        var L = lap.getTotalLength();
        lap.style.strokeDasharray = L;
        lap.style.strokeDashoffset = L;
        gsap.to(lap, {
          strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut',
          scrollTrigger: { trigger: cir, start: 'top 78%', once: true }
        });
      }
    }

    /* --- the wallpapers: a rail that keeps moving, and a screen that follows --- */
    var wall = document.querySelector('[data-pc-wall]');
    var track = document.querySelector('[data-pc-track]');
    if (wall && track) {
      var shot = wall.querySelector('[data-pc-wpshot]');
      var idxEl = wall.querySelector('[data-pc-wpidx]');
      var getEl = wall.querySelector('[data-pc-wpget]');
      var total = track.querySelectorAll('[data-pc-wp]').length;

      // delegation, so the marquee's cloned frames answer a click too
      track.addEventListener('click', function (e) {
        var f = e.target.closest ? e.target.closest('[data-pc-wp]') : null;
        if (!f) return;
        var i = parseInt(f.getAttribute('data-pc-wp'), 10);
        if (isNaN(i)) return;
        var src = f.querySelector('img') ? f.querySelector('img').getAttribute('src') : '';
        Array.prototype.forEach.call(track.querySelectorAll('[data-pc-wp]'), function (o) {
          o.classList.toggle('is-on', o.getAttribute('data-pc-wp') === String(i));
        });
        if (idxEl) idxEl.textContent = ('0' + (i + 1)).slice(-2);
        if (getEl && src) getEl.setAttribute('href', src);
        if (shot && src && shot.getAttribute('src') !== src) {
          var pre = new Image();
          var swap = function () {
            shot.src = src;
            shot.alt = 'Porsche Carrera Cup Middle East wallpaper ' + ('0' + (i + 1)).slice(-2);
            requestAnimationFrame(function () { shot.classList.remove('is-swap'); });
          };
          shot.classList.add('is-swap');
          pre.onload = swap;
          pre.onerror = swap;
          pre.src = src;
        }
      });

      // (the wallpaper rail is a Swiper marquee now)
    }
  }


  /* ---------------- UAE National Cricket Team ---------------- */
  function initIcc() {
    var hero = document.querySelector('.ck-hero');
    if (!hero) return;

    if (!prefersReduced && hasGSAP && hasST) {
      // the stadium drifts as the banner leaves
      var bg = hero.querySelector('[data-ck-bg]');
      if (bg) {
        gsap.to(bg, { yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }
      // the run-up stitches fill as the schedule passes
      var run = document.querySelector('[data-ck-run]');
      var fill = document.querySelector('[data-ck-runfill]');
      if (run && fill) {
        gsap.fromTo(fill, { height: '0%' }, {
          height: '100%', ease: 'none',
          scrollTrigger: { trigger: run, start: 'top 78%', end: 'bottom 62%', scrub: 0.4 }
        });
      }
    }

    // the run-rate line draws itself once the card arrives
    var spark = document.querySelector('[data-ck-spark]');
    if (spark) {
      if (prefersReduced) spark.classList.add('is-drawn');
      else if ('IntersectionObserver' in window) {
        var so = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { spark.classList.add('is-drawn'); so.disconnect(); }
          });
        }, { threshold: 0.4 });
        so.observe(spark);
      } else spark.classList.add('is-drawn');
    }

    // the stumps rattle once when the lead cell first arrives
    var lead = document.querySelector('.ck-cell--lead .ck-stumps');
    if (lead && !prefersReduced && hasGSAP && hasST) {
      gsap.fromTo(lead.children, { scaleY: 0.2, opacity: 0 }, {
        scaleY: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.08,
        scrollTrigger: { trigger: lead, start: 'top 92%', once: true }
      });
    }
  }


  /* ---------------- PFL Road to Dubai Champions Series ---------------- */
  var FL_CORNER = [
    ['Knowledge', 'Our knowledge centre equips traders with insights \u2014 the reading a corner does before the walk-out, not during it.'],
    ['Powerful platforms', 'STARTRADER App, STAR Copy and STAR Matrix sharpen execution speed, risk management and strategy tools.'],
    ['Updates', 'Daily insights, market analysis and tailored updates, so a decision is made on information rather than instinct.'],
    ['24/7 support staff', 'Multilingual customer care to guide traders, at whatever hour the market decides to move.'],
    ['Regulators', 'Global licences \u2014 CIMA, ASIC, FSCA, FSA and FSC \u2014 provide a secure, compliant trading environment. Full regulatory disclosures are on our website.']
  ];

  function initPfl() {
    var hero = document.querySelector('.fl-hero');
    if (!hero) return;

    if (!prefersReduced && hasGSAP && hasST) {
      var bg = hero.querySelector('[data-fl-bg]');
      if (bg) {
        gsap.to(bg, { yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }
      var shots = document.querySelectorAll('.fl-strip .fl-shot');
      if (shots.length) {
        gsap.fromTo(shots, { y: 44, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '.fl-strip', start: 'top 84%', once: true }
        });
      }
    }

    /* --- the corner dial: five spokes, one lit at a time --- */
    var dial = document.querySelector('[data-fl-dial]');
    if (!dial) return;
    var nodes = Array.prototype.slice.call(dial.querySelectorAll('[data-fl-node]'));
    var spokes = Array.prototype.slice.call(dial.querySelectorAll('.fl-spoke'));
    var dots = Array.prototype.slice.call(dial.querySelectorAll('[data-fl-dot]'));
    var titleEl = dial.querySelector('[data-fl-title]');
    var copyEl = dial.querySelector('[data-fl-copy]');
    var idxEl = dial.querySelector('[data-fl-idx]');
    var at = 0, held = false, turn = null;

    function light(i) {
      at = (i + FL_CORNER.length) % FL_CORNER.length;
      nodes.forEach(function (n) {
        var k = parseInt(n.getAttribute('data-fl-node'), 10);
        n.classList.toggle('is-on', k === at);
      });
      spokes.forEach(function (sp, k) { sp.classList.toggle('is-on', k === at); });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === at); });
      if (idxEl) idxEl.textContent = ('0' + (at + 1)).slice(-2);
      var row = FL_CORNER[at];
      if (titleEl && copyEl && row) {
        titleEl.classList.add('is-fade');
        copyEl.classList.add('is-fade');
        setTimeout(function () {
          titleEl.textContent = row[0];
          copyEl.textContent = row[1];
          titleEl.classList.remove('is-fade');
          copyEl.classList.remove('is-fade');
        }, 190);
      }
    }

    nodes.forEach(function (n) {
      n.addEventListener('click', function () {
        held = true;
        light(parseInt(n.getAttribute('data-fl-node'), 10));
      });
    });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { held = true; light(i); });
    });
    dial.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      held = true;
      light(at + k);
    });
    light(0);

    // the dial turns on its own until someone takes it
    if (!prefersReduced && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !turn && !held) {
            turn = setInterval(function () {
              if (held) { clearInterval(turn); turn = null; return; }
              light(at + 1);
            }, 3800);
          } else if (!e.isIntersecting && turn) { clearInterval(turn); turn = null; }
        });
      }, { threshold: 0.3 }).observe(dial);
    }
  }


  /* ---------------- MENA Investment Congress ---------------- */
  function initMena() {
    var hero = document.querySelector('.mn-hero');
    if (!hero) return;

    // the plate drifts as the banner leaves
    var bg = hero.querySelector('[data-mn-bg]');
    if (bg && !prefersReduced && hasGSAP && hasST) {
      gsap.to(bg, { yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // (the congress rail is a Swiper marquee now)

    // the rule down the ledger tracks how far you have read
    var ledger = document.querySelector('[data-mn-ledger]');
    var run = document.querySelector('[data-mn-run]');
    if (ledger && run && !prefersReduced && hasGSAP && hasST) {
      gsap.fromTo(run, { height: '0%' }, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: ledger, start: 'top 76%', end: 'bottom 64%', scrub: 0.4 }
      });
    }

    /* --- the figures count themselves up once --- */
    var figs = document.querySelector('[data-mn-figs]');
    if (!figs) return;
    var cells = Array.prototype.slice.call(figs.querySelectorAll('[data-mn-count]'));
    if (prefersReduced || !('IntersectionObserver' in window)) return;

    function run_up(el) {
      var raw = el.getAttribute('data-mn-count') || '';
      var num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
      if (isNaN(num)) return;
      var suffix = raw.replace(/[0-9]/g, '');   // keeps the +, the th, anything else
      var from = 0, dur = 1100, t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (num - from) * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      }
      requestAnimationFrame(step);
    }

    var fo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cells.forEach(function (c, i) { setTimeout(function () { run_up(c); }, i * 110); });
        fo.disconnect();
      });
    }, { threshold: 0.45 });
    fo.observe(figs);
  }


  /* ---------------- Deposit bonus: the switch estimator ---------------- */
  function initDeposit() {
    var box = document.querySelector('[data-db-calc]');
    if (!box) return;
    var wd = box.querySelector('[data-db-wd]');
    var dp = box.querySelector('[data-db-dp]');
    var lots = box.querySelector('[data-db-lots]');
    var accts = Array.prototype.slice.call(box.querySelectorAll('[data-db-acct]'));
    var outAllow = box.querySelector('[data-db-out-allow]');
    var outCash = box.querySelector('[data-db-out-cash]');
    var noteAllow = box.querySelector('[data-db-note-allow]');
    var noteCash = box.querySelector('[data-db-note-cash]');
    var rate = 5, CAP = 200, GATE = 3000;

    function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
    function num(el) { var v = parseFloat(el && el.value); return isNaN(v) || v < 0 ? 0 : v; }

    function paint() {
      var w = num(wd), d = num(dp), l = num(lots);
      // the allowance is one per cent of the smaller of the two amounts
      var base = Math.min(w, d);
      if (outAllow) outAllow.textContent = money(base * 0.01);
      if (noteAllow) {
        noteAllow.textContent = base > 0
          ? '1% of ' + money(base) + ', the lesser of the two'
          : 'Enter what you withdraw and deposit';
      }
      var raw = l * rate;
      var cash = Math.min(raw, CAP);
      var eligible = d >= GATE;
      if (outCash) outCash.textContent = eligible ? money(cash) : money(0);
      if (noteCash) {
        if (!eligible) noteCash.textContent = 'Needs a deposit of ' + money(GATE) + ' or more';
        else if (raw > CAP) noteCash.textContent = l + ' lots at $' + rate + ' reaches the ' + money(CAP) + ' cap';
        else noteCash.textContent = l + ' lots at $' + rate + ' per lot';
      }
    }

    [wd, dp, lots].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', paint);
      el.addEventListener('change', paint);
    });
    accts.forEach(function (b) {
      b.addEventListener('click', function () {
        rate = b.getAttribute('data-db-acct') === 'ecn' ? 2 : 5;
        accts.forEach(function (o) {
          var on = o === b;
          o.classList.toggle('is-on', on);
          o.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        paint();
      });
    });
    paint();
  }


  /* ---------------- The account form on the switch page ---------------- */
  function initSignup() {
    var form = document.querySelector('[data-db-signup]');
    if (!form) return;
    var box = form.closest ? form.closest('[data-db-form]') : null;
    var email = form.querySelector('[data-db-email]');
    var code = form.querySelector('[data-db-code]');
    var pass = form.querySelector('[data-db-pass]');
    var country = form.querySelector('[data-db-country]');
    var send = form.querySelector('[data-db-send]');
    var peek = form.querySelector('[data-db-peek]');
    var more = form.querySelector('[data-db-more]');
    var refWrap = form.querySelector('[data-db-refwrap]');

    function fld(el) { return el && el.closest ? el.closest('[data-db-fld]') : null; }
    function mark(el, bad) {
      var f = fld(el);
      if (!f) return;
      f.classList.toggle('is-bad', !!bad);
      var err = f.querySelector('.ct-err');
      if (err) err.hidden = !bad;
    }
    var okEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || ''); };
    var passRules = {
      len: function (v) { return v.length >= 8 && v.length <= 16; },
      num: function (v) { return /[0-9]/.test(v); },
      case: function (v) { return /[a-z]/.test(v) && /[A-Z]/.test(v); },
      sym: function (v) { return /[^A-Za-z0-9]/.test(v); }
    };
    function passOk(v) {
      return passRules.len(v) && passRules.num(v) && passRules.case(v) && passRules.sym(v);
    }

    if (pass) {
      pass.addEventListener('input', function () {
        if (fld(pass).classList.contains('is-bad') && passOk(pass.value || '')) mark(pass, false);
      });
    }

    // the referral field is asked for, not offered
    if (more && refWrap) {
      more.addEventListener('click', function () {
        var open = more.getAttribute('aria-expanded') === 'true';
        more.setAttribute('aria-expanded', open ? 'false' : 'true');
        refWrap.hidden = open;
        if (!open) { var i = refWrap.querySelector('input'); if (i) i.focus(); }
      });
    }
    if (email) email.addEventListener('input', function () { if (okEmail(email.value)) mark(email, false); });
    if (country) country.addEventListener('change', function () { if (country.value) mark(country, false); });
    if (code) code.addEventListener('input', function () { if (/^[0-9]{6}$/.test(code.value)) mark(code, false); });

    if (peek) {
      peek.addEventListener('click', function () {
        var shown = pass.type === 'text';
        pass.type = shown ? 'password' : 'text';
        peek.textContent = shown ? 'Show' : 'Hide';
        peek.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
      });
    }

    // verification runs on the real flow, so this hands over rather than pretending
    if (send) {
      send.addEventListener('click', function () {
        if (!okEmail(email && email.value)) { mark(email, true); email.focus(); return; }
        send.disabled = true;
        send.textContent = 'Continue on the secure form';
        setTimeout(function () {
          window.location.href = 'https://www.startrader.com/live-account/';
        }, 550);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      if (country && !country.value) { mark(country, true); bad = bad || country; }
      if (email && !okEmail(email.value)) { mark(email, true); bad = bad || email; }
      if (code && !/^[0-9]{6}$/.test(code.value)) { mark(code, true); bad = bad || code; }
      if (pass && !passOk(pass.value || '')) { mark(pass, true); bad = bad || pass; }
      Array.prototype.forEach.call(form.querySelectorAll('[data-db-check]'), function (c) {
        var i = c.querySelector('input');
        var miss = i && !i.checked;
        c.classList.toggle('is-bad', !!miss);
        if (miss) bad = bad || i;
      });
      if (bad) { if (bad.focus) bad.focus(); return; }
      // everything checks out locally; the account itself is created on the secure flow
      var q = email && email.value ? '?email=' + encodeURIComponent(email.value) : '';
      window.location.href = 'https://www.startrader.com/live-account/' + q;
    });
  }


  /* ---------------- 50/20 deposit bonus: the estimator ---------------- */
  function initDeposit5020() {
    var box = document.querySelector('[data-d5-calc]');
    if (!box) return;
    var first = box.querySelector('[data-d5-first]');
    var next = box.querySelector('[data-d5-next]');
    var outFirst = box.querySelector('[data-d5-out-first]');
    var outNext = box.querySelector('[data-d5-out-next]');
    var outTotal = box.querySelector('[data-d5-out-total]');
    var noteFirst = box.querySelector('[data-d5-note-first]');
    var noteTotal = box.querySelector('[data-d5-note-total]');
    var CAP = 500, MIN = 100;

    function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
    function num(el) { var v = parseFloat(el && el.value); return isNaN(v) || v < 0 ? 0 : v; }

    function paint() {
      var f = num(first), n = num(next);
      // the first deposit earns half, capped; anything after earns a fifth
      var raw = f * 0.5;
      var bf = f >= MIN ? Math.min(raw, CAP) : 0;
      var bn = n * 0.2;
      if (outFirst) outFirst.textContent = money(bf);
      if (outNext) outNext.textContent = money(bn);
      if (outTotal) outTotal.textContent = money(bf + bn);
      if (noteFirst) {
        if (f > 0 && f < MIN) noteFirst.textContent = 'Needs a deposit of ' + money(MIN) + ' or more';
        else if (raw > CAP) noteFirst.textContent = '50% of ' + money(f) + ', capped at ' + money(CAP);
        else noteFirst.textContent = '50% of ' + money(f);
      }
      if (noteTotal) noteTotal.textContent = 'Credit, not withdrawable cash';
      var sib = outNext && outNext.parentNode ? outNext.parentNode.querySelector('i') : null;
      if (sib) sib.textContent = '20% of ' + money(n);
    }

    [first, next].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', paint);
      el.addEventListener('change', paint);
    });
    paint();
  }


  /* ---------------- VPS: which reimbursement tier the numbers reach ---------------- */
  function initVps() {
    var box = document.querySelector('[data-vp-check]');
    if (!box) return;
    var funds = box.querySelector('[data-vp-funds]');
    var vol = box.querySelector('[data-vp-vol]');
    var fig = box.querySelector('[data-vp-fig]');
    var title = box.querySelector('[data-vp-title]');
    var why = box.querySelector('[data-vp-why]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-vp-tier]'));
    // thresholds exactly as published
    var TIERS = [
      { n: 2, cap: 30, funds: 5000, vol: 1000000, volTx: 'USD 1 million' },
      { n: 1, cap: 20, funds: 3000, vol: 500000, volTx: 'USD 0.5 million' }
    ];

    function num(el) { var v = parseFloat(el && el.value); return isNaN(v) || v < 0 ? 0 : v; }

    function paint() {
      var f = num(funds), v = num(vol);
      var hit = null;
      TIERS.forEach(function (t) { if (!hit && f > t.funds && v > t.vol) hit = t; });
      cards.forEach(function (c) {
        c.classList.toggle('is-hit', !!hit && c.getAttribute('data-vp-tier') === String(hit.n));
      });
      if (hit) {
        if (fig) fig.innerHTML = hit.cap + ' <em>USD / mo</em>';
        if (title) title.textContent = 'Tier ' + hit.n;
        if (why) why.textContent = 'Initial funds and monthly volume both clear the Tier ' + hit.n + ' thresholds.';
        return;
      }
      if (fig) fig.innerHTML = '&mdash;';
      if (title) title.textContent = 'No tier reached yet';
      // say which of the two is short, since that is the useful part
      var need = TIERS[1];
      var missF = f <= need.funds, missV = v <= need.vol;
      if (why) {
        why.textContent = missF && missV
          ? 'Tier 1 needs initial funds over 3,000 USD and monthly volume over ' + need.volTx + ' notional.'
          : missF ? 'Volume is there; initial funds need to be over 3,000 USD.'
                  : 'Funds are there; monthly volume needs to be over ' + need.volTx + ' notional.';
      }
    }

    [funds, vol].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', paint);
      el.addEventListener('change', paint);
    });
    paint();
  }


  /* ---------------- Knowledge article: the sign-up ---------------- */
  function initKbForm() {
    var form = document.querySelector('[data-kb-signup]');
    if (!form) return;
    var card = form.closest ? form.closest('[data-kb-form]') : null;
    var done = card ? card.querySelector('[data-kb-done]') : null;
    var name = form.querySelector('[data-kb-name]');
    var email = form.querySelector('[data-kb-email]');
    var level = form.querySelector('[data-kb-level]');
    var check = form.querySelector('[data-kb-check]');
    var consent = form.querySelector('[data-kb-consent]');

    function mark(el, bad) {
      var f = el && el.closest ? el.closest('[data-kb-fld]') : null;
      if (!f) return;
      f.classList.toggle('is-bad', !!bad);
      var err = f.querySelector('.ct-err');
      if (err) err.hidden = !bad;
    }
    var okEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || ''); };

    [[name, function (v) { return v.trim().length > 1; }],
     [email, okEmail],
     [level, function (v) { return !!v; }]].forEach(function (pair) {
      var el = pair[0], ok = pair[1];
      if (!el) return;
      var ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, function () { if (ok(el.value)) mark(el, false); });
    });
    if (consent) consent.addEventListener('change', function () {
      if (consent.checked && check) check.classList.remove('is-bad');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      if (name && name.value.trim().length < 2) { mark(name, true); bad = bad || name; }
      if (email && !okEmail(email.value)) { mark(email, true); bad = bad || email; }
      if (level && !level.value) { mark(level, true); bad = bad || level; }
      if (consent && !consent.checked) {
        if (check) check.classList.add('is-bad');
        bad = bad || consent;
      }
      if (bad) { if (bad.focus) bad.focus(); return; }
      // nothing is transmitted from a static page; the card confirms and stands down
      form.hidden = true;
      if (done) { done.hidden = false; done.scrollIntoView({ block: 'nearest' }); }
    });
  }


  /* ---------------- MT4 vs MT5 comparison dialog ---------------- */
  function initCompare() {
    var dlg = document.querySelector('[data-cmp]');
    if (!dlg) return;
    var openers = Array.prototype.slice.call(document.querySelectorAll('[data-cmp-open]'));
    if (!openers.length) return;
    var last = null;

    function open(from) {
      last = from || null;
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');            // very old browsers get a plain panel
      var x = dlg.querySelector('[data-cmp-close]');
      if (x && x.focus) x.focus();
    }
    function close() {
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
      if (last && last.focus) last.focus();
    }

    openers.forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); open(b); });
    });
    Array.prototype.forEach.call(dlg.querySelectorAll('[data-cmp-close]'), function (b) {
      b.addEventListener('click', close);
    });
    // clicking the backdrop closes it: the dialog fills the viewport, the card does not
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) close();
    });
    dlg.addEventListener('cancel', function () { if (last && last.focus) setTimeout(function () { last.focus(); }, 0); });
  }

  /* ---------------- Events: the gallery rail ---------------- */
  function initEvents() {
    // events.html runs the gallery as a Swiper marquee; the progress bar
    // follows the marquee's translate — one full pass of the originals is
    // half the cloned track — so the design's moving line stays alive
    var mq = document.querySelector('.ev-rail.st-marquee');
    if (mq) {
      var mqBar = document.querySelector('[data-ev-bar]');
      if (mqBar) {
        var tries = 0;
        (function hook() {
          var sw = mq.swiper;
          if (!sw) { if (tries++ < 40) setTimeout(hook, 150); return; }
          var wrap = mq.querySelector('.swiper-wrapper');
          sw.on('setTranslate', function (s, t) {
            var w = Math.max(1, wrap.scrollWidth / 2);
            var p = ((-t / w) % 1 + 1) % 1;
            mqBar.style.transform = 'translateX(' + (p * (100 / 0.22 - 100)) + '%)';
          });
        })();
      }
    }

    // expo.html keeps the self-drifting rail
    var rail = document.querySelector('[data-ev-rail]');
    if (!rail) return;
    var frames = Array.prototype.slice.call(rail.querySelectorAll('.ev-frame'));
    var bar = document.querySelector('[data-ev-bar]');
    var hint = document.querySelector('[data-ev-hint]');
    if (!frames.length) return;

    enableDrag(rail);

    var raf = 0;
    function paint() {
      var max = rail.scrollWidth - rail.clientWidth;
      if (bar) {
        var p = max > 0 ? rail.scrollLeft / max : 0;
        bar.style.transform = 'translateX(' + (p * (100 / 0.22 - 100)) + '%)';
      }
      // each shot drifts inside its frame as the rail moves, so the row has depth
      var box = rail.getBoundingClientRect();
      frames.forEach(function (f) {
        var r = f.getBoundingClientRect();
        var t = (r.left + r.width / 2 - box.left) / box.width;
        var shot = f.querySelector('.ev-shot');
        if (shot) shot.style.setProperty('--px', Math.max(0, Math.min(1, t)).toFixed(3));
      });
    }
    rail.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; paint(); });
    });
    window.addEventListener('resize', paint);
    paint();

    // the rail drifts back and forth on its own; a hand on it pauses the
    // drift, and it picks itself back up a few seconds after the hand leaves
    if (prefersReduced) return;
    var dir = 1, visible = false, resting = false, idle = null, last = 0, pos = null;
    function stepDrift(ts) {
      requestAnimationFrame(stepDrift);
      if (!visible || resting || rail.classList.contains('dragging')) { last = ts; pos = null; return; }
      var dt = Math.min(48, ts - last); last = ts;
      var max = rail.scrollWidth - rail.clientWidth;
      if (max <= 0) { pos = null; return; }
      // the step is well under a pixel per frame, and scrollLeft snaps to whole
      // pixels — reading it back each frame threw the remainder away, so the
      // rail crept two pixels and then sat still. The position is carried in a
      // float and re-read from the element only after a pause or a drag.
      if (pos === null) pos = rail.scrollLeft;
      pos += dir * dt * 0.026;
      if (pos >= max) { pos = max; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      rail.scrollLeft = pos;
    }
    function rest() {
      resting = true;
      clearTimeout(idle);
      idle = setTimeout(function () { resting = false; }, 4000);
    }
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown'].forEach(function (ev) {
      rail.addEventListener(ev, rest, { passive: true });
    });
    // a wheel over the rail is usually the reader scrolling the page, not
    // reaching for the rail — only a sideways wheel counts as a hand on it,
    // otherwise reading past the section kept the drift parked for 4s at a time
    rail.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) rest();
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; });
      }, { threshold: 0.35 }).observe(rail);
    } else {
      visible = true;
    }
    requestAnimationFrame(stepDrift);
  }

  /* ---------------- CSR: gallery lightbox + the timeline rail ---------------- */
  function initCsr() {
    // the milestone scrubber: nodes drive the panel, and the active node centres itself
    var tm = document.querySelector('[data-csr-time]');
    if (tm) {
      var nodes = Array.prototype.slice.call(tm.querySelectorAll('[data-ct-node]'));
      var scroll = tm.querySelector('[data-ct-scroll]');
      var body = tm.querySelector('[data-ct-body]');
      var dots = Array.prototype.slice.call(tm.querySelectorAll('[data-ct-dots] i'));
      var pill = tm.querySelector('[data-ct-pill]');
      var kind = tm.querySelector('[data-ct-kind]');
      var ttl = tm.querySelector('[data-ct-title]');
      var dsc = tm.querySelector('[data-ct-desc]');
      var prevB = tm.querySelector('[data-ct-prev]');
      var nextB = tm.querySelector('[data-ct-next]');
      var cur = 3, lock = false, raf = 0;

      // measure against the scroll box itself — offsetLeft resolves to the nearest
      // positioned ancestor, which is not the rail, and lands the node off-centre
      function centre(el, smooth) {
        if (!scroll || !el) return;
        var r = el.getBoundingClientRect(), box = scroll.getBoundingClientRect();
        var to = scroll.scrollLeft + (r.left - box.left) - (box.width - r.width) / 2;
        if (scroll.scrollTo) scroll.scrollTo({ left: to, behavior: (smooth && !prefersReduced) ? 'smooth' : 'auto' });
        else scroll.scrollLeft = to;
      }
      function paintPanel(i) {
        var n = nodes[i];
        if (pill) pill.textContent = n.getAttribute('data-date') || '';
        if (kind) kind.textContent = n.getAttribute('data-kind') || '';
        if (ttl) ttl.innerHTML = n.getAttribute('data-title') || '';
        if (dsc) dsc.innerHTML = n.getAttribute('data-desc') || '';
        if (body) { body.classList.remove('is-swap'); void body.offsetWidth; body.classList.add('is-swap'); }
      }
      function mark(i) {
        if (i === cur) return;
        cur = i;
        nodes.forEach(function (x, k) { x.classList.toggle('is-on', k === cur); x.setAttribute('aria-selected', k === cur ? 'true' : 'false'); });
        dots.forEach(function (d, k) { d.classList.toggle('is-on', k === cur); });
        if (prevB) prevB.disabled = cur === 0;
        if (nextB) nextB.disabled = cur === nodes.length - 1;
        paintPanel(cur);
      }
      // whichever month is nearest the frame is the active one
      function readScroll() {
        if (lock) return;
        var box = scroll.getBoundingClientRect();
        var mid = box.left + box.width / 2, best = 0, gap = Infinity;
        nodes.forEach(function (n, i) {
          var r = n.getBoundingClientRect();
          var d = Math.abs((r.left + r.width / 2) - mid);
          if (d < gap) { gap = d; best = i; }
        });
        mark(best);
      }
      function go(i, smooth) {
        i = Math.max(0, Math.min(nodes.length - 1, i));
        mark(i);
        // hold the reader off while the smooth scroll settles, or it fights the target
        lock = true;
        centre(nodes[i], smooth !== false);
        clearTimeout(go._t);
        go._t = setTimeout(function () { lock = false; }, smooth === false ? 60 : 620);
      }
      // geometry is measured, so a viewport resize must re-centre the active
      // month — otherwise the frame and the rail drift apart until a reload
      var rzT;
      window.addEventListener('resize', function () {
        clearTimeout(rzT);
        rzT = setTimeout(function () {
          lock = true;
          centre(nodes[cur], false);
          setTimeout(function () { lock = false; }, 80);
        }, 120);
      });

      nodes.forEach(function (n, i) {
        n.setAttribute('role', 'tab');
        n.addEventListener('click', function () { go(i); });
      });
      if (prevB) prevB.addEventListener('click', function () { go(cur - 1); });
      if (nextB) nextB.addEventListener('click', function () { go(cur + 1); });
      tm.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        go(cur + d);
        nodes[cur].focus();
      });
      // read continuously while it moves, then settle the nearest month into the frame
      var settle = 0, dragging = false;
      scroll.addEventListener('scroll', function () {
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; readScroll(); });
        if (lock) return;
        clearTimeout(settle);
        settle = setTimeout(function () {
          if (lock || dragging) return;
          centre(nodes[cur], true);
        }, 130);
      });
      // a drag writes scrollLeft directly, so hold the settle until the pointer is up
      scroll.addEventListener('pointerdown', function () { dragging = true; });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
        scroll.addEventListener(ev, function () {
          if (!dragging) return;
          dragging = false;
          clearTimeout(settle);
          settle = setTimeout(function () { centre(nodes[cur], true); }, 90);
        });
      });

      if (scroll) enableDrag(scroll);
      if (prevB) prevB.disabled = cur === 0;
      if (nextB) nextB.disabled = cur === nodes.length - 1;
      // open balanced, with months either side, once the rail has its real width
      go(cur, false);
      window.addEventListener('load', function () { go(cur, false); });
    }

    var gal = document.querySelector('[data-csr-gal]');
    var lb = document.querySelector('[data-csr-lb]');
    var dataEl = document.querySelector('[data-csr-data]');
    if (!gal || !lb || !dataEl) return;

    var shots;
    try { shots = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!shots.length) return;

    var img = lb.querySelector('[data-csr-img]');
    var titleEl = lb.querySelector('[data-csr-title]');
    var capEl = lb.querySelector('[data-csr-cap]');
    var countEl = lb.querySelector('[data-csr-count]');
    var at = 0, opener = null;

    function paint(i) {
      at = (i + shots.length) % shots.length;
      var s = shots[at];
      img.src = s.src;
      img.alt = s.title;
      titleEl.textContent = s.title;
      capEl.textContent = s.cap;
      if (countEl) countEl.textContent = (at + 1) + ' / ' + shots.length;
    }
    function open(i, from) {
      opener = from || null;
      paint(i);
      lb.hidden = false;
      // a frame between unhiding and the class, or the transition never runs
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      var close = lb.querySelector('[data-csr-close]');
      if (close) close.focus();
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      setTimeout(function () { lb.hidden = true; }, 350);
      if (opener) opener.focus();
    }

    Array.prototype.slice.call(gal.querySelectorAll('[data-csr-tile]')).forEach(function (t) {
      t.addEventListener('click', function () { open(parseInt(t.getAttribute('data-csr-tile'), 10) || 0, t); });
    });
    var prev = lb.querySelector('[data-csr-prev]');
    var next = lb.querySelector('[data-csr-next]');
    if (prev) prev.addEventListener('click', function () { paint(at - 1); });
    if (next) next.addEventListener('click', function () { paint(at + 1); });
    var closeBtn = lb.querySelector('[data-csr-close]');
    if (closeBtn) closeBtn.addEventListener('click', close);
    // clicking the backdrop closes; clicking the figure does not
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') paint(at - 1);
      else if (e.key === 'ArrowRight') paint(at + 1);
    });
  }

  /* ---------------- Reveal-once hook: [data-seen] gains .is-seen on screen ---------------- */
  function initSeen() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-seen]'));
    if (!els.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-seen'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- STAR Web Trading: dashboard pins + feature switcher ---------------- */
  function initStarWeb() {
    // the built workspace: a region, its dot and the caption are one control
    var stage = document.querySelector('[data-sw-stage]');
    if (stage) {
      var grid = stage.querySelector('[data-swx-grid]');
      var zones = Array.prototype.slice.call(stage.querySelectorAll('[data-swx-zone]'));
      var dots = Array.prototype.slice.call(document.querySelectorAll('[data-swx-dot]'));
      var cap = document.querySelector('[data-swx-cap]');
      var keys = zones.map(function (z) { return z.getAttribute('data-swx-zone'); });
      var held = false, timer = null;

      function show(key) {
        var live = null;
        zones.forEach(function (z) {
          var on = z.getAttribute('data-swx-zone') === key;
          z.classList.toggle('is-on', on);
          if (on) live = z;
        });
        dots.forEach(function (d) { d.classList.toggle('is-on', d.getAttribute('data-swx-dot') === key); });
        if (grid) grid.classList.add('is-live');
        if (cap && live) {
          var b = cap.querySelector('b'), e = cap.querySelector('em');
          if (b) b.innerHTML = live.getAttribute('data-name') || '';
          if (e) e.innerHTML = live.getAttribute('data-desc') || '';
        }
      }
      function step() {
        if (held) return;
        var on = zones.filter(function (z) { return z.classList.contains('is-on'); })[0];
        var i = on ? keys.indexOf(on.getAttribute('data-swx-zone')) : -1;
        show(keys[(i + 1) % keys.length]);
      }
      zones.forEach(function (z) {
        var key = z.getAttribute('data-swx-zone');
        z.addEventListener('mouseenter', function () { show(key); });
        z.addEventListener('focus', function () { show(key); });
        z.addEventListener('click', function () { show(key); });
      });
      dots.forEach(function (d) {
        var key = d.getAttribute('data-swx-dot');
        d.addEventListener('mouseenter', function () { show(key); });
        d.addEventListener('focus', function () { show(key); });
        d.addEventListener('click', function () { show(key); });
      });
      show(keys[0]);
      // the tour runs itself until someone takes over, and only while on screen
      stage.addEventListener('pointerenter', function () { held = true; });
      stage.addEventListener('pointerleave', function () { held = false; });
      stage.addEventListener('focusin', function () { held = true; });
      if (!prefersReduced) {
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting && !timer) timer = setInterval(step, 3600);
              else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
            });
          }, { threshold: 0.25 }).observe(stage);
        } else {
          timer = setInterval(step, 3600);
        }
      }
    }

    var feat = document.querySelector('[data-sw-feat]');
    if (!feat) return;
    var rows = Array.prototype.slice.call(feat.querySelectorAll('[data-sw-key]'));
    var views = Array.prototype.slice.call(feat.querySelectorAll('[data-sw-view]'));
    var label = feat.querySelector('[data-sw-label]');
    rows.forEach(function (row) {
      var hd = row.querySelector('.sw-row-hd');
      if (!hd) return;
      hd.addEventListener('click', function () {
        var key = row.getAttribute('data-sw-key');
        rows.forEach(function (r) {
          var on = r === row;
          r.classList.toggle('is-on', on);
          var h = r.querySelector('.sw-row-hd');
          if (h) h.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
        views.forEach(function (v) { v.classList.toggle('is-on', v.getAttribute('data-sw-view') === key); });
        var name = hd.querySelector('b');
        if (label && name) label.textContent = name.textContent;
      });
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    if (!prefersReduced && hasGSAP && hasST) doc.classList.add('is-animate');
    initLenis();
    buildTicker();
    initHeader();
    initSmartBanner();
    initMobileMenu();
    initAnchors();
    initDropdowns();
    initMega();
    initLangPop();
    initAOS();
    initReveals();
    initHowtoScrub();
    initMarqueeSwipers();
    initLiveMarkets();
    initLvDots();
    initMagnetic();
    initCookie();
    initChat();
    initTradingAccount();
    initPrimeEcn();
    initFunding();
    initForex();
    initCommodities();
    initHowToTrade();
    initGlossary();
    initGlossaryTerm();
    initWebinars();
    initEcon();
    initNews();
    initArticle();
    initAnnouncements();
    initContact();
    initRegulation();
    initPartner();
    initCompany();
    initHeroTicker();
    initMarkets();
    initMarketAnalysis();
    initKnowledge();
    initPageList();
    initLoadMore();
    initHelpCentre();
    initTelemetry();
    initMtRail();
    initCopyTrade();
    initStarCopy();
    initStarWeb();
    initSeen();
    initCsr();
    initEvents();
    initNba();
    initPccme();
    initIcc();
    initPfl();
    initMena();
    initDeposit();
    initSignup();
    initDeposit5020();
    initKbForm();
    initCompare();
    initVps();
    initSelects();
    if (hasST) ScrollTrigger.refresh();
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
