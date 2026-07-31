/* =============================================================
   STARTRADER — interactions & animations
   ============================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = typeof window.ScrollTrigger !== 'undefined';
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasGSAP && hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  function initLenis() {
    if (prefersReduced || typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.05, lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    if (hasGSAP && hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); });
    }
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
    { n: 'Euro vs Swiss Franc', a: 'eu', b: 'ch', p: '0.92963/0.92980', dir: 'down' },
    { n: 'Euro vs Australian Dollar', a: 'eu', b: 'au', p: '1.62889/1.62915', dir: 'up' },
    { n: 'Great Britain Pound vs Swiss Franc', a: 'gb', b: 'ch', p: '1.08842/1.08858', dir: 'down' },
    { n: 'New Zealand Dollar vs Swiss Franc', a: 'nz', b: 'ch', p: '0.47272/0.47287', dir: 'up' },
    { n: 'Great Britain Pound vs Canadian Dollar', a: 'gb', b: 'ca', p: '1.88057/1.88083', dir: 'down' },
    { n: 'US Dollar vs Japanese Yen', a: 'us', b: 'jp', p: '163.562/163.588', dir: 'up' },
    { n: 'Euro vs US Dollar', a: 'eu', b: 'us', p: '1.08420/1.08435', dir: 'up' },
    { n: 'Great Britain Pound vs US Dollar', a: 'gb', b: 'us', p: '1.27180/1.27201', dir: 'down' }
  ];
  function initHeroTicker() {
    var track = document.getElementById('heroTicker');
    if (!track) return;
    var arrows = { down: 'M12 5v14M6 13l6 6 6-6', up: 'M12 19V5M6 11l6-6 6 6' };
    var html = heroPairs.map(function (m) {
      return '<a class="mkt-pill" href="#">' +
        '<span class="mkt-flags"><img src="/assets/img/flags/' + m.a + '.svg" alt="" loading="lazy"><img src="/assets/img/flags/' + m.b + '.svg" alt="" loading="lazy"></span>' +
        '<span class="mkt-txt"><b>' + m.n + '</b><em>' + m.p + '</em></span>' +
        '<span class="mkt-dir ' + m.dir + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="' + arrows[m.dir] + '"/></svg></span>' +
        '<span class="mkt-trade">Trade</span>' +
        '</a>';
    }).join('');
    track.innerHTML = html + html; // duplicate for seamless loop
    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    var speed = 62; // px/s
    var tween = gsap.to(track, {
      x: -half, duration: half / speed, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { tween.timeScale(0.12); });
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
  function initMobileMenu() {
    var burger = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
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
    burger.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
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

  function initReveals() {
    if (prefersReduced || !hasGSAP || !hasST) { doc.classList.remove('is-animate'); return; }

    // anything already on screen at boot reveals straight away — a trigger line
    // at 88% leaves content in the lower part of the first screen invisible
    // until the visitor scrolls, which on a short laptop can hide a whole block
    function onScreen(el) {
      var r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || 0) && r.bottom > 0;
    }

    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      // clearProps drops the inline transform GSAP would otherwise leave at
      // translate(0,0) — inline beats the CSS :hover lift on every card
      if (onScreen(el)) {
        gsap.fromTo(el, { y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform' });
        return;
      }
      gsap.fromTo(el, { y: 28 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    gsap.utils.toArray('[data-reveal-stagger]').forEach(function (group) {
      if (onScreen(group)) {
        gsap.fromTo(group.children, { y: 28 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, clearProps: 'transform' });
        return;
      }
      gsap.fromTo(group.children, { y: 28 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, clearProps: 'transform',
        scrollTrigger: { trigger: group, start: 'top 84%', once: true }
      });
    });

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
    if (glow) gsap.to(glow, { yPercent: 26, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (shape) gsap.to(shape, { yPercent: 18, rotate: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------------- Awards marquee (auto-scroll) ---------------- */
  function initAwards() {
    var track = document.getElementById('awardTrack');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    cards.forEach(function (c) { track.appendChild(c.cloneNode(true)); }); // duplicate for seamless loop
    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    var speed = 50; // px/s
    var tween = gsap.to(track, {
      x: -half, duration: half / speed, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { gsap.to(tween, { timeScale: 0.15, duration: 0.4 }); });
    track.addEventListener('mouseleave', function () { gsap.to(tween, { timeScale: 1, duration: 0.4 }); });
  }

  /* ---------------- Drag-to-scroll (country + awards) ---------------- */
  function enableDrag(el) {
    var isDown = false, startX = 0, startScroll = 0, moved = false;
    el.addEventListener('pointerdown', function (e) {
      isDown = true; moved = false; startX = e.clientX; startScroll = el.scrollLeft;
      el.classList.add('dragging'); el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    });
    function end() { isDown = false; el.classList.remove('dragging'); }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', end);
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); } }, true);
  }

  /* ---------------- Trusted country marquee (auto-scroll) ---------------- */
  function initCountryMarquee() {
    var track = document.getElementById('countryTrack');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    cards.forEach(function (c) { track.appendChild(c.cloneNode(true)); }); // duplicate for seamless loop
    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    var speed = 42; // px/s
    var tween = gsap.to(track, {
      x: -half, duration: half / speed, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { gsap.to(tween, { timeScale: 0.15, duration: 0.4 }); });
    track.addEventListener('mouseleave', function () { gsap.to(tween, { timeScale: 1, duration: 0.4 }); });
  }

  /* ---------------- Reviews marquee (auto-scroll) ---------------- */
  function initReviewsMarquee() {
    var track = document.getElementById('reviewsTrack');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    cards.forEach(function (c) { track.appendChild(c.cloneNode(true)); }); // duplicate for seamless loop
    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    var speed = 34; // px/s
    var tween = gsap.to(track, {
      x: -half, duration: half / speed, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { gsap.to(tween, { timeScale: 0.15, duration: 0.4 }); });
    track.addEventListener('mouseleave', function () { gsap.to(tween, { timeScale: 1, duration: 0.4 }); });
  }

  /* ---------------- Live market data (simulated) ---------------- */
  var mkxData = [
    { s: 'USDCAD', n: 'US Dollar vs Canadian Dollar', c: 'forex', ic: { t: 'flags', a: 'us', b: 'ca' }, p: 1.40855, d: 5, chg: -0.08, pop: true },
    { s: 'GBPUSD', n: 'Great Britain Pound vs US Dollar', c: 'forex', ic: { t: 'flags', a: 'gb', b: 'us' }, p: 1.3355, d: 4, chg: 0.26, pop: true },
    { s: 'EURUSD', n: 'Euro vs US Dollar', c: 'forex', ic: { t: 'flags', a: 'eu', b: 'us' }, p: 1.0842, d: 4, chg: 0.13, pop: true },
    { s: 'AUDUSD', n: 'Australian Dollar vs US Dollar', c: 'forex', ic: { t: 'flags', a: 'au', b: 'us' }, p: 0.6612, d: 4, chg: -0.08 },
    { s: 'USDJPY', n: 'US Dollar vs Japanese Yen', c: 'forex', ic: { t: 'flags', a: 'us', b: 'jp' }, p: 156.82, d: 2, chg: 0.24 },
    { s: 'NZDCHF', n: 'New Zealand Dollar vs Swiss Franc', c: 'forex', ic: { t: 'flags', a: 'nz', b: 'ch' }, p: 0.47272, d: 5, chg: 0.32 },
    { s: 'CAC40', n: 'France 40 Cash Index', c: 'indices', ic: { t: 'flag', a: 'fr' }, p: 8438.7, d: 1, chg: 0.93, pop: true },
    { s: 'US500', n: 'US 500 Cash Index', c: 'indices', ic: { t: 'flag', a: 'us' }, p: 5732.3, d: 1, chg: 0.90 },
    { s: 'GER40', n: 'Germany 40 Cash Index', c: 'indices', ic: { t: 'flag', a: 'de' }, p: 18411, d: 0, chg: 0.34 },
    { s: 'NAS100', n: 'US Tech 100 Cash Index', c: 'indices', ic: { t: 'flag', a: 'us' }, p: 29971.3, d: 1, chg: -0.62 },
    { s: 'SOLUSD', n: 'Solana vs US Dollar', c: 'crypto', ic: { t: 'sym', v: 'S', bg: '#7b5cff' }, p: 76.53, d: 2, chg: 3.59, pop: true },
    { s: 'BTCUSD', n: 'Bitcoin vs US Dollar', c: 'crypto', ic: { t: 'sym', v: '₿', bg: '#f7931a' }, p: 64230, d: 0, chg: 2.14 },
    { s: 'ETHUSD', n: 'Ethereum vs US Dollar', c: 'crypto', ic: { t: 'sym', v: 'Ξ', bg: '#627eea' }, p: 3402.5, d: 1, chg: 1.12 },
    { s: 'AAPL', n: 'Apple Inc', c: 'stocks', ic: { t: 'sym', v: 'A', bg: '#111418' }, p: 228.11, d: 2, chg: 0.63 },
    { s: 'TSLA', n: 'Tesla Inc', c: 'stocks', ic: { t: 'sym', v: 'T', bg: '#e82127' }, p: 334.09, d: 2, chg: -1.02 },
    { s: 'NVDA', n: 'NVIDIA Corp', c: 'stocks', ic: { t: 'sym', v: 'N', bg: '#76b900' }, p: 126.40, d: 2, chg: 2.18 },
    { s: 'SPXS.ETF', n: 'Direxion Daily S&P 500 Bear 3x Shares', c: 'etfs', ic: { t: 'etf' }, p: 27.61, d: 2, chg: -0.61, pop: true },
    { s: 'RSP.ETF', n: 'Invesco S&P 500 Equal Weight ETF', c: 'etfs', ic: { t: 'etf' }, p: 213.7, d: 1, chg: 1.03, pop: true },
    { s: 'LQD.ETF', n: 'iShares iBoxx IG Corp Bond ETF', c: 'etfs', ic: { t: 'etf' }, p: 106.35, d: 2, chg: 0.05, pop: true },
    { s: 'SPY.ETF', n: 'SPDR S&P 500 ETF Trust', c: 'etfs', ic: { t: 'etf' }, p: 571.28, d: 2, chg: 0.55 },
    { s: 'XAUUSD', n: 'Gold vs US Dollar', c: 'commodities', ic: { t: 'inst', a: 'xau' }, p: 3241.80, d: 2, chg: 0.82 },
    { s: 'XAGUSD', n: 'Silver vs US Dollar', c: 'commodities', ic: { t: 'inst', a: 'xag' }, p: 38.42, d: 2, chg: 1.14 },
    { s: 'WTI', n: 'US Crude Oil Spot', c: 'commodities', ic: { t: 'inst', a: 'xti' }, p: 71.28, d: 2, chg: -0.34 }
  ];
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
    return { line: line, area: line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z', baseY: ys[0].toFixed(1) };
  }
  function mkxIcon(m) {
    var ic = m.ic;
    if (ic.t === 'flags') return '<span class="mkx-ic mkx-ic-flags"><img src="/assets/img/flags/' + ic.a + '.svg" alt="" loading="lazy"><img src="/assets/img/flags/' + ic.b + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'flag') return '<span class="mkx-ic mkx-ic-flag"><img src="/assets/img/flags/' + ic.a + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'inst') return '<span class="mkx-ic mkx-ic-inst"><img src="/assets/img/commodities/' + ic.a + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'etf') return '<span class="mkx-ic mkx-ic-etf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l5-6 3.5 3.5L20 7"/><path d="M4 20h16"/></svg></span>';
    return '<span class="mkx-ic mkx-ic-sym" style="background:' + (ic.bg || '#0a2a6b') + '">' + ic.v + '</span>';
  }
  function mkxCard(m) {
    var up = m.chg >= 0, col = up ? '#12b76a' : '#e5484d', sp = mkxSpark(m.s, up);
    var gid = 'gsp-' + m.s.replace(/[^A-Za-z0-9]/g, '');
    var price = m.p.toLocaleString('en-US', { minimumFractionDigits: m.d, maximumFractionDigits: m.d });
    return '<article class="mkx-card" data-cat="' + m.c + '" data-sym="' + m.s + '">' +
      '<div class="mkx-top">' + mkxIcon(m) + '<div class="mkx-name"><b>' + m.s + '</b><em>' + m.n + '</em></div></div>' +
      '<div class="mkx-spark"><svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".26"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
        '<line class="mkx-base" x1="0" y1="' + sp.baseY + '" x2="100" y2="' + sp.baseY + '"/>' +
        '<path d="' + sp.area + '" fill="url(#' + gid + ')"/>' +
        '<path d="' + sp.line + '" fill="none" stroke="' + col + '" stroke-width="1.4" vector-effect="non-scaling-stroke"/>' +
      '</svg></div>' +
      '<div class="mkx-foot"><span class="mkx-price">' + price + '</span><span class="mkx-chg ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + m.chg.toFixed(2) + '%</span><a class="mkx-trade" href="#">Trade</a></div>' +
      '</article>';
  }
  var mkxLive = {};
  function initMarkets() {
    var rows = document.getElementById('mkxRows');
    if (!rows) return;
    mkxData.forEach(function (m) { if (!mkxLive[m.s]) mkxLive[m.s] = { base: m.p, cur: m.p, d: m.d }; });
    var tracks = Array.prototype.slice.call(rows.querySelectorAll('.mkx-track'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.mkx-tab'));

    function fillRow(track, items) {
      var dir = parseInt(track.dataset.dir, 10) || -1, cardW = 338;
      var row = track.closest('.mkx-row');
      var need = Math.ceil(((row ? row.clientWidth : 1200) + 420) / cardW);
      var set = [];
      while (set.length < Math.max(need, items.length)) set = set.concat(items);
      track.innerHTML = set.concat(set).map(mkxCard).join('');
      if (track._tw) { track._tw.kill(); track._tw = null; }
      if (prefersReduced || !hasGSAP) { gsap && gsap.set(track, { x: 0 }); return; }
      var half = track.scrollWidth / 2, dur = half / 42;
      if (dir < 0) { gsap.set(track, { x: 0 }); track._tw = gsap.to(track, { x: -half, duration: dur, ease: 'none', repeat: -1 }); }
      else { gsap.set(track, { x: -half }); track._tw = gsap.to(track, { x: 0, duration: dur, ease: 'none', repeat: -1 }); }
      track.onmouseenter = function () { if (track._tw) track._tw.timeScale(0.18); };
      track.onmouseleave = function () { if (track._tw) track._tw.timeScale(1); };
    }
    function render(cat) {
      var items = mkxData.filter(function (m) { return cat === 'popular' ? m.pop : m.c === cat; });
      if (tracks[0]) fillRow(tracks[0], items);
      if (tracks[1]) fillRow(tracks[1], items.slice().reverse());
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        render(t.dataset.cat);
      });
    });
    render('popular');

    // live prices — updates every card sharing a symbol (incl. duplicated marquee copies)
    if (!prefersReduced) {
      setInterval(function () {
        var cards = rows.querySelectorAll('.mkx-card');
        if (!cards.length) return;
        var bySym = {};
        cards.forEach(function (c) { var s = c.getAttribute('data-sym'); if (s) (bySym[s] = bySym[s] || []).push(c); });
        Object.keys(bySym).forEach(function (s) {
          var st = mkxLive[s]; if (!st) return;
          if (Math.random() > 0.5) return;
          var step = st.base * 0.0009 * (Math.random() * 2 - 1);
          st.cur = st.cur + step + (st.base - st.cur) * 0.05;
          var chg = ((st.cur - st.base) / st.base) * 100;
          var ps = st.cur.toLocaleString('en-US', { minimumFractionDigits: st.d, maximumFractionDigits: st.d });
          var cs = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
          bySym[s].forEach(function (c) {
            var pe = c.querySelector('.mkx-price'), ce = c.querySelector('.mkx-chg');
            if (pe) { pe.textContent = ps; pe.classList.remove('mkx-flash-up', 'mkx-flash-down'); void pe.offsetWidth; pe.classList.add(step >= 0 ? 'mkx-flash-up' : 'mkx-flash-down'); }
            if (ce) { ce.textContent = cs; ce.classList.toggle('up', chg >= 0); ce.classList.toggle('down', chg < 0); }
          });
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
    document.querySelectorAll('.nav-item.has-mega').forEach(function (item) {
      var mega = item.querySelector('.mega');
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

    items.forEach(function (it) {
      it.addEventListener('click', function () {
        items.forEach(function (x) { x.classList.remove('is-active'); });
        it.classList.add('is-active');
        if (codeEl) codeEl.textContent = it.getAttribute('data-code') || codeEl.textContent;
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
    setTimeout(function () { el.classList.add('show'); }, 1300);
    function dismiss() {
      try { localStorage.setItem('st_cookie_consent', 'accepted'); } catch (e) {}
      el.classList.remove('show');
    }
    var x = document.getElementById('cookieClose');
    if (x) x.addEventListener('click', dismiss);
  }

  /* ---------------- Chat widget ---------------- */
  function initChat() {
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
      if (prefersReduced || !hasGSAP || !hasST) {
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
      return f ? '<img src="/assets/img/flags/' + f + '.svg" alt="" loading="lazy">' : '';
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
          return '<span class="fx-inst-ic"><img src="/assets/img/commodities/' + p.icon + '.svg" alt="" loading="lazy"></span>';
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
            { sym: 'COCOA', name: 'Cocoa Futures CFD', icon: 'cocoa', badge: 'CC', mid: 7420.0, dec: 1, spread: 12.0, sdec: 1 }
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

    // one step highlighted at a time, following the scroll position
    steps.forEach(function (s, i) {
      ScrollTrigger.create({
        trigger: s, start: 'top 66%', end: 'bottom 44%',
        onEnter: function () { setActive(i); },
        onEnterBack: function () { setActive(i); }
      });
    });
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

      cards.forEach(function (c) {
        var okL = letter === 'all' || c.closest('.gl-group').getAttribute('data-l') === letter;
        var okQ = !q || (c.dataset.name || '').indexOf(q) > -1 || (c.dataset.def || '').indexOf(q) > -1;
        var on = okL && okQ;
        c.hidden = !on;
        if (on) shown++;
        mark(c._t, c._tRaw, q);
        mark(c._e, c._eRaw, q);
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
      if (pager) pager.hidden = shown === 0 || !!q;
      if (clear) clear.hidden = !query;

      if (status) {
        if (q) status.textContent = shown + (shown === 1 ? ' term matches ' : ' terms match ') + '“' + query.trim() + '”';
        else if (letter !== 'all') status.textContent = 'Showing ' + shown + (shown === 1 ? ' term' : ' terms') + ' under ' + letter;
        else status.textContent = '';
      }
      if (hasST) ScrollTrigger.refresh();
    }

    letters.forEach(function (b) {
      if (b.classList.contains('is-off')) return;
      b.addEventListener('click', function () {
        letter = b.dataset.l;
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
        clearTimeout(t);
        t = setTimeout(apply, 120);
      });
      // Esc clears the field the way a search box should
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && input.value) { input.value = ''; query = ''; apply(); }
      });
    }
    function clearAll() {
      if (input) { input.value = ''; input.focus(); }
      query = '';
      letter = 'all';
      letters.forEach(function (x) { x.classList.toggle('is-on', x.dataset.l === 'all'); });
      apply();
    }
    if (clear) clear.addEventListener('click', clearAll);
    if (reset) reset.addEventListener('click', clearAll);

    // ?q= pre-fills the search so a filtered view can be linked to directly
    var q0 = new URLSearchParams(window.location.search).get('q');
    if (q0 && input) { input.value = q0; query = q0; }

    apply();
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

    /* ---- "View all replays" jumps to the replay tab ---- */
    var allRow = root.querySelector('.wb-allrow .wb-textlink');
    if (allRow) {
      allRow.addEventListener('click', function (e) {
        e.preventDefault();
        cat = 'replay';
        apply();
      });
    }

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

  /* ---------------- News room — filter, search, load more ---------------- */
  function initNews() {
    var root = document.getElementById('latest');
    if (!root) return;

    var PAGE = 6;                        // stories revealed per step
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

    if (prefersReduced || !hasGSAP || !hasST) return;
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

    if (prefersReduced || !hasGSAP || !hasST) return;
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
      var PAGE = 6;
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
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = (input && input.value || '').trim();
        var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (!note) return;
        note.textContent = ok
          ? 'Thanks — the next briefing will land in your inbox before the London open.'
          : 'That email address does not look right. Check it and try again.';
        note.className = 'ma-sub-note ' + (ok ? 'is-ok' : 'is-err');
        if (ok && input) input.value = '';
        if (ok) setTimeout(function () { note.textContent = base; note.className = 'ma-sub-note'; }, 6000);
      });
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
      var level = 'basics', prod = 'all';

      function moveInd() {
        if (!ind) return;
        var on = levels.filter(function (b) { return b.classList.contains('is-on'); })[0];
        if (!on) return;
        ind.style.width = on.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      }

      function apply() {
        var matched = items.filter(function (el) {
          return el.getAttribute('data-level') === level &&
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
              ' at ' + LEVELS[level] + (prod === 'all' ? '' : ' in ' + PRODS[prod])
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
    var cat = 'all';

    function apply() {
      var shown = 0;
      items.forEach(function (el) {
        var on = cat === 'all' || el.getAttribute('data-cat') === cat;
        el.hidden = !on;
        if (on) shown++;
      });
      chips.forEach(function (b) {
        var on = b.getAttribute('data-pg-cat') === cat;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (statusEl) statusEl.textContent = shown ? 'Showing ' + shown + (shown === 1 ? ' item' : ' items') : '';
      if (hasST) ScrollTrigger.refresh();
    }
    chips.forEach(function (b) {
      b.addEventListener('click', function () { cat = b.getAttribute('data-pg-cat'); apply(); });
    });
    if (resetBtn) resetBtn.addEventListener('click', function () { cat = 'all'; apply(); });
    apply();
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
      vp.scrollBy({ left: dir * step(), behavior: prefersReduced ? 'auto' : 'smooth' });
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

    // the ranking is a marquee, built the same way as the awards row
    railMarquee(document.getElementById('ctTrack'));
  }

  /* ---------------- Card rail: clone once, scroll forever ---------------- */
  function railMarquee(track, pxPerSec) {
    if (!track) return;
    Array.prototype.slice.call(track.children).forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    if (prefersReduced || !hasGSAP) return;
    var half = track.scrollWidth / 2;
    if (!half) return;
    var tween = gsap.to(track, {
      x: -half, duration: half / (pxPerSec || 48), ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    track.addEventListener('mouseenter', function () { tween.timeScale(0.15); });
    track.addEventListener('mouseleave', function () { tween.timeScale(1); });
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
    railMarquee(board.hasAttribute('data-sc-track') ? board : null);

    // draw the curves and fill the win-rate meters once the board is on screen
    if (prefersReduced || !('IntersectionObserver' in window)) { board.classList.add('is-seen'); return; }
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { board.classList.add('is-seen'); bio.unobserve(e.target); } });
    }, { threshold: 0.2 });
    bio.observe(board);
  }

  /* ---------------- STAR Web Trading: dashboard pins + feature switcher ---------------- */
  function initStarWeb() {
    // the annotated screenshot: a pin and its note are one control in two places
    var stage = document.querySelector('[data-sw-stage]');
    if (stage) {
      var pins = Array.prototype.slice.call(stage.querySelectorAll('[data-sw-pin]'));
      var notes = Array.prototype.slice.call(stage.querySelectorAll('[data-sw-note]'));
      var keys = notes.map(function (n) { return n.getAttribute('data-sw-note'); });
      var held = false, timer = null;

      function show(key) {
        pins.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-sw-pin') === key); });
        notes.forEach(function (n) { n.classList.toggle('is-on', n.getAttribute('data-sw-note') === key); });
      }
      function step() {
        if (held) return;
        var on = notes.filter(function (n) { return n.classList.contains('is-on'); })[0];
        var i = on ? keys.indexOf(on.getAttribute('data-sw-note')) : -1;
        show(keys[(i + 1) % keys.length]);
      }
      pins.concat(notes).forEach(function (el) {
        var key = el.getAttribute('data-sw-pin') || el.getAttribute('data-sw-note');
        el.addEventListener('mouseenter', function () { show(key); });
        el.addEventListener('focus', function () { show(key); });
        el.addEventListener('click', function () { show(key); });
      });
      // the tour runs itself until someone takes over, and only while on screen
      stage.addEventListener('pointerenter', function () { held = true; });
      stage.addEventListener('pointerleave', function () { held = false; });
      stage.addEventListener('focusin', function () { held = true; });
      if (!prefersReduced) {
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting && !timer) timer = setInterval(step, 3400);
              else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
            });
          }, { threshold: 0.3 }).observe(stage);
        } else {
          timer = setInterval(step, 3400);
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
    initMobileMenu();
    initAnchors();
    initDropdowns();
    initMega();
    initLangPop();
    initReveals();
    initHowtoScrub();
    initAwards();
    initCountryMarquee();
    initReviewsMarquee();
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
    initHelpCentre();
    initTelemetry();
    initMtRail();
    initCopyTrade();
    initStarCopy();
    initStarWeb();
    if (hasST) ScrollTrigger.refresh();
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
