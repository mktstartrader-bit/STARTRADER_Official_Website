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
    var last = 0;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (header) {
        header.classList.toggle('scrolled', y > 24);
        if (y > last && y > 480) header.classList.add('hide');
        else header.classList.remove('hide');
      }
      if (toTop) toTop.classList.toggle('show', y > 760);
      last = y;
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
    var headerH = 84;
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      a.addEventListener('click', function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollToTarget(target, -headerH);
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

  /* ---------------- Live market data (simulated) ---------------- */
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

    // Fallback: no pin on touch / small screens / short viewports / reduced motion
    if (prefersReduced || !hasGSAP || !hasST || window.innerWidth < 900 || window.innerHeight < 720) {
      setState(0, 0);
      return;
    }

    setState(0, 0);
    ScrollTrigger.create({
      trigger: section, start: 'top top', end: '+=1900', pin: true, scrub: 0.5, anticipatePin: 1,
      onUpdate: function (self) {
        var p = self.progress;
        var active = Math.min(n - 1, Math.floor(p * n));
        setState(active, p * n);
      }
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (!finePointer || prefersReduced || !hasGSAP) return;
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
      parent.addEventListener('click', function (e) {
        e.preventDefault();
        var open = mega.classList.toggle('flyout-open');
        parent.classList.toggle('active', open);
        if (fly) fly.setAttribute('aria-hidden', open ? 'false' : 'true');
      });
      item.addEventListener('mouseleave', function () {
        mega.classList.remove('flyout-open');
        parent.classList.remove('active');
        if (fly) fly.setAttribute('aria-hidden', 'true');
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
    function choose(v) {
      try { localStorage.setItem('st_cookie_consent', v); } catch (e) {}
      el.classList.remove('show');
    }
    var a = document.getElementById('cookieAccept'), d = document.getElementById('cookieDecline');
    if (a) a.addEventListener('click', function () { choose('accepted'); });
    if (d) d.addEventListener('click', function () { choose('declined'); });
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
    initReveals();
    initHowtoScrub();
    initAwards();
    initCountryMarquee();
    initLiveMarkets();
    initMagnetic();
    initCookie();
    initChat();
    if (hasST) ScrollTrigger.refresh();
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
