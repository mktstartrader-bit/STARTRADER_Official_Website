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
        '<span class="mkt-flags"><img src="assets/img/flags/' + m.a + '.svg" alt="" loading="lazy"><img src="assets/img/flags/' + m.b + '.svg" alt="" loading="lazy"></span>' +
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
        scrollToTarget(target, -off);
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

    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    gsap.utils.toArray('[data-reveal-stagger]').forEach(function (group) {
      gsap.to(group.children, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09,
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
    if (ic.t === 'flags') return '<span class="mkx-ic mkx-ic-flags"><img src="assets/img/flags/' + ic.a + '.svg" alt="" loading="lazy"><img src="assets/img/flags/' + ic.b + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'flag') return '<span class="mkx-ic mkx-ic-flag"><img src="assets/img/flags/' + ic.a + '.svg" alt="" loading="lazy"></span>';
    if (ic.t === 'inst') return '<span class="mkx-ic mkx-ic-inst"><img src="assets/img/commodities/' + ic.a + '.svg" alt="" loading="lazy"></span>';
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

  /* ---------------- Mega menu — Commodities flyout ---------------- */
  function initMega() {
    document.querySelectorAll('.nav-item.has-mega').forEach(function (item) {
      var mega = item.querySelector('.mega');
      var parent = item.querySelector('.mega-item-parent');
      if (!mega || !parent) return;
      var fly = mega.querySelector('.mega-flyout');
      function openFly() {
        mega.classList.add('flyout-open');
        parent.classList.add('active');
        if (fly) fly.setAttribute('aria-hidden', 'false');
      }
      function closeFly() {
        mega.classList.remove('flyout-open');
        parent.classList.remove('active');
        if (fly) fly.setAttribute('aria-hidden', 'true');
      }
      // open on hovering Commodities; keep open while over the flyout
      parent.addEventListener('mouseenter', openFly);
      parent.addEventListener('focus', openFly);
      if (fly) fly.addEventListener('mouseenter', openFly);
      // close when hovering any other menu item
      mega.querySelectorAll('.mega-item').forEach(function (it) {
        if (it !== parent) it.addEventListener('mouseenter', closeFly);
      });
      // reset when leaving the whole Trading menu
      item.addEventListener('mouseleave', closeFly);
      // The parent is a link to its own hub page: clicking the label navigates,
      // clicking the chevron toggles the flyout instead. Non-link parents always toggle.
      parent.addEventListener('click', function (e) {
        var chev = e.target && e.target.closest ? e.target.closest('.mega-chev') : null;
        if (parent.tagName === 'A' && parent.getAttribute('href') && !chev) return;
        e.preventDefault();
        mega.classList.contains('flyout-open') ? closeFly() : openFly();
      });
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
      return f ? '<img src="assets/img/flags/' + f + '.svg" alt="" loading="lazy">' : '';
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
          return '<span class="fx-inst-ic"><img src="assets/img/commodities/' + p.icon + '.svg" alt="" loading="lazy"></span>';
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
    var list = document.querySelector('[data-htrade]');
    if (!list) return;
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
    initMagnetic();
    initCookie();
    initChat();
    initTradingAccount();
    initPrimeEcn();
    initFunding();
    initForex();
    initCommodities();
    initHowToTrade();
    initCompany();
    initHeroTicker();
    initMarkets();
    if (hasST) ScrollTrigger.refresh();
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
