/* =================================================================
   Refer a Friend on LINE (PMT330) — page script
   Standalone landing page: no site header, footer, cookie banner or
   chat, so it does not load the shared main.js. It needs only:
     1. the promotion countdown
     2. scroll reveals (AOS, loaded before this file)
   ================================================================= */
(function () {
  'use strict';

  /* ---------- 1. countdown to 23:59:59, 12 November 2026 ---------- */
  function initCountdown() {
    var END = new Date(2026, 10, 12, 23, 59, 59);
    var root = document.querySelector('[data-raf-cd]');
    if (!root) return;
    var d = root.querySelector('[data-raf-d]'),
        h = root.querySelector('[data-raf-h]'),
        m = root.querySelector('[data-raf-m]'),
        s = root.querySelector('[data-raf-s]');
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var left = Math.max(0, Math.floor((END - new Date()) / 1000));
      var dd = Math.floor(left / 86400);
      d.textContent = dd < 100 ? pad(dd) : String(dd);
      h.textContent = pad(Math.floor(left % 86400 / 3600));
      m.textContent = pad(Math.floor(left % 3600 / 60));
      s.textContent = pad(left % 60);
      return left > 0;
    }
    if (tick()) {
      var id = setInterval(function () { if (!tick()) clearInterval(id); }, 1000);
    }
  }

  /* ---------- 2. scroll reveals ----------
     Without AOS (or with reduced motion) the html never gets .js-aos and
     the stylesheet shows every [data-aos] element as-is. */
  function initReveals() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof AOS === 'undefined' || reduced) return;
    document.documentElement.classList.add('js-aos');

    function settle(el, wait) {
      setTimeout(function () {
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
        el.classList.remove('aos-init', 'aos-animate');
      }, wait);
    }

    // once an element has animated in, drop the AOS hooks so later layout
    // changes can never hide it again
    document.addEventListener('aos:in', function (e) {
      var el = e.detail;
      if (!el || el.nodeType !== 1 || !el.hasAttribute('data-aos')) return;
      var delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10) || 0;
      settle(el, 800 + delay + 120);
    });
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });

    // lazy images shift the layout after AOS caches its offsets
    window.addEventListener('load', function () { AOS.refresh(); });

    // safety net: anything that reaches the viewport is revealed even if
    // AOS missed it
    if (!('IntersectionObserver' in window)) return;
    var net = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        net.unobserve(el);
        setTimeout(function () {
          if (el.hasAttribute('data-aos') && !el.classList.contains('aos-animate')) {
            el.classList.add('aos-animate');
            settle(el, 920);
          }
        }, 350);
      });
    }, { threshold: 0.05 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-aos]'), function (el) { net.observe(el); });
  }

  function boot() { initCountdown(); initReveals(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
