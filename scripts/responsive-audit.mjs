#!/usr/bin/env node
/**
 * responsive-audit.mjs — Deep mobile responsiveness audit via Playwright.
 *
 * Usage:
 *   node scripts/responsive-audit.mjs <baseUrl> [--routes /,/about] [--rtl] [--out audit-results]
 *
 * Requires: npm i -D playwright && npx playwright install chromium
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

// ---------- CLI ----------
const args = process.argv.slice(2);
const baseUrl = args.find(a => !a.startsWith('--'));
if (!baseUrl) {
  console.error('Usage: node responsive-audit.mjs <baseUrl> [--routes /,/a,/b] [--rtl] [--out dir]');
  process.exit(1);
}
const getFlag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : def;
};
const routes = getFlag('routes', '/').split(',').map(r => r.trim()).filter(Boolean);
const outDir = getFlag('out', 'audit-results');
const testRtl = args.includes('--rtl');

const VIEWPORTS = [
  { name: 'android-360',      width: 360, height: 800, dpr: 3 },
  { name: 'iphone-se-375',    width: 375, height: 667, dpr: 2 },
  { name: 'iphone-pro-393',   width: 393, height: 852, dpr: 3 },
  { name: 'iphone-max-430',   width: 430, height: 932, dpr: 3 },
  { name: 'tablet-768',       width: 768, height: 1024, dpr: 2 },
  { name: 'landscape-852',    width: 852, height: 393, dpr: 3 },
];

fs.mkdirSync(path.join(outDir, 'screenshots'), { recursive: true });

// ---------- In-page audit (runs in browser context) ----------
const PAGE_AUDIT = () => {
  const vw = window.innerWidth;
  const issues = [];

  const cssPath = (el) => {
    if (!(el instanceof Element)) return String(el);
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 5) {
      let sel = node.nodeName.toLowerCase();
      if (node.id) { parts.unshift(`${sel}#${node.id}`); break; }
      const cls = [...node.classList].slice(0, 2).join('.');
      if (cls) sel += `.${cls}`;
      const parent = node.parentElement;
      if (parent) {
        const sibs = [...parent.children].filter(c => c.nodeName === node.nodeName);
        if (sibs.length > 1) sel += `:nth-of-type(${sibs.indexOf(node) + 1})`;
      }
      parts.unshift(sel);
      node = parent;
    }
    return parts.join(' > ');
  };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' &&
           s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.01;
  };

  // 1. Horizontal overflow + offenders
  const docOverflow = document.scrollingElement.scrollWidth - vw;
  if (docOverflow > 1) {
    const offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      if (!visible(el)) return;
      const r = el.getBoundingClientRect();
      const over = Math.max(r.right - vw, -r.left);
      if (over > 2 && r.width < document.scrollingElement.scrollWidth * 1.5) {
        // skip elements whose parent is already listed with same overflow
        offenders.push({ selector: cssPath(el), overflowPx: Math.round(over), width: Math.round(r.width) });
      }
    });
    offenders.sort((a, b) => b.overflowPx - a.overflowPx);
    issues.push({ type: 'horizontal-overflow', severity: 'blocking',
      detail: `Document scrollWidth exceeds viewport by ${Math.round(docOverflow)}px`,
      offenders: offenders.slice(0, 15) });
  }

  // 2. Tap targets
  const interactive = document.querySelectorAll(
    'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [onclick], [tabindex]:not([tabindex="-1"])'
  );
  const rects = [];
  interactive.forEach(el => {
    if (!visible(el)) return;
    const r = el.getBoundingClientRect();
    rects.push({ el, r });
    if ((r.width < 44 || r.height < 44) && !(el.closest('nav') && r.height >= 40)) {
      issues.push({ type: 'small-tap-target', severity: r.width < 32 || r.height < 32 ? 'blocking' : 'warning',
        detail: `${Math.round(r.width)}×${Math.round(r.height)}px (min 44×44)`,
        selector: cssPath(el), text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40) });
    }
  });
  // adjacent targets < 8px apart
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i].r, b = rects[j].r;
      const gapX = Math.max(a.left, b.left) - Math.min(a.right, b.right);
      const gapY = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom);
      const overlapY = a.top < b.bottom && b.top < a.bottom;
      const overlapX = a.left < b.right && b.left < a.right;
      if ((overlapY && gapX > -1 && gapX < 8 && gapX >= 0) || (overlapX && gapY > -1 && gapY < 8 && gapY >= 0)) {
        issues.push({ type: 'crowded-tap-targets', severity: 'warning',
          detail: `Gap ${Math.round(Math.max(gapX, gapY))}px (< 8px)`,
          selector: `${cssPath(rects[i].el)}  <->  ${cssPath(rects[j].el)}` });
        break;
      }
    }
  }

  // 3. Font sizes
  const seen = new Set();
  document.querySelectorAll('body *').forEach(el => {
    if (!visible(el)) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!hasText) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const key = `${Math.round(fs)}-${cssPath(el)}`;
    if (seen.has(key)) return; seen.add(key);
    if (fs < 12) issues.push({ type: 'tiny-font', severity: 'blocking',
      detail: `${fs.toFixed(1)}px`, selector: cssPath(el),
      text: el.textContent.trim().slice(0, 40) });
  });

  // 4. Viewport meta
  const meta = document.querySelector('meta[name="viewport"]');
  const content = meta?.getAttribute('content') || '';
  if (!meta) issues.push({ type: 'viewport-meta', severity: 'blocking', detail: 'Missing <meta name="viewport">' });
  else {
    if (!/width\s*=\s*device-width/.test(content))
      issues.push({ type: 'viewport-meta', severity: 'blocking', detail: `No width=device-width: "${content}"` });
    if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(content))
      issues.push({ type: 'viewport-meta', severity: 'warning', detail: `Zoom disabled (a11y): "${content}"` });
  }

  // 5. Oversized / unconstrained images
  document.querySelectorAll('img, video').forEach(el => {
    if (!visible(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width > vw + 2) issues.push({ type: 'media-overflow', severity: 'blocking',
      detail: `Rendered ${Math.round(r.width)}px wide (viewport ${vw}px)`, selector: cssPath(el), src: (el.currentSrc || el.src || '').slice(-60) });
    if (el.tagName === 'IMG' && el.naturalWidth && r.width > 0) {
      const ratio = el.naturalWidth / (r.width * devicePixelRatio);
      if (ratio > 2.2) issues.push({ type: 'oversized-image-asset', severity: 'warning',
        detail: `Natural ${el.naturalWidth}px for ${Math.round(r.width * devicePixelRatio)}px needed (${ratio.toFixed(1)}×)`,
        selector: cssPath(el), src: (el.currentSrc || el.src || '').slice(-60) });
    }
  });

  // 6. Fixed/sticky coverage
  let fixedArea = 0; const fixedEls = [];
  document.querySelectorAll('body *').forEach(el => {
    const pos = getComputedStyle(el).position;
    if ((pos === 'fixed' || pos === 'sticky') && visible(el)) {
      const r = el.getBoundingClientRect();
      const clippedH = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (clippedH > 0 && r.width > vw * 0.5) { fixedArea += clippedH; fixedEls.push(cssPath(el)); }
    }
  });
  if (fixedArea > window.innerHeight * 0.25)
    issues.push({ type: 'fixed-elements-coverage', severity: 'warning',
      detail: `Fixed/sticky elements cover ${Math.round(100 * fixedArea / window.innerHeight)}% of viewport height`,
      offenders: fixedEls.slice(0, 5) });

  // 7. Clipped text
  document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,li,td,th,div').forEach(el => {
    if (!visible(el)) return;
    const s = getComputedStyle(el);
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!hasText) return;
    if (el.scrollWidth > el.clientWidth + 4 && s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis' && s.whiteSpace === 'nowrap') {
      issues.push({ type: 'clipped-text', severity: 'blocking',
        detail: `Content ${el.scrollWidth}px in ${el.clientWidth}px box (nowrap, no ellipsis)`,
        selector: cssPath(el), text: el.textContent.trim().slice(0, 40) });
    }
  });

  // 8. iOS zoom-triggering inputs
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (!visible(el)) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 16) issues.push({ type: 'input-ios-zoom', severity: 'warning',
      detail: `font-size ${fs.toFixed(1)}px (< 16px triggers iOS zoom on focus)`, selector: cssPath(el) });
  });

  // 11. Safe areas — fixed bars flush to edges without env() padding
  fixedEls.length && document.querySelectorAll('body *').forEach(el => {
    const s = getComputedStyle(el);
    if (s.position !== 'fixed' || !visible(el)) return;
    const r = el.getBoundingClientRect();
    const flushBottom = Math.abs(r.bottom - window.innerHeight) < 2;
    const flushTop = Math.abs(r.top) < 2;
    if ((flushBottom || flushTop) && r.width > vw * 0.8) {
      const pad = flushBottom ? s.paddingBottom : s.paddingTop;
      // heuristic: can't read env() back; flag zero-padding full-width bars
      if (parseFloat(pad) === 0) issues.push({ type: 'safe-area', severity: 'warning',
        detail: `Full-width fixed bar flush to ${flushBottom ? 'bottom' : 'top'} with 0 padding — verify env(safe-area-inset-*)`,
        selector: cssPath(el) });
    }
  });

  return { issues, scrollWidth: document.scrollingElement.scrollWidth, viewport: vw };
};

// ---------- Layout-shift snapshot ----------
const LAYOUT_SNAPSHOT = () => {
  const map = {};
  document.querySelectorAll('h1,h2,h3,section,header,footer,nav,main,[class*="hero"],[class*="cta"]').forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0) map[`${el.tagName}-${i}-${(el.className || '').toString().slice(0, 30)}`] = [Math.round(r.top + scrollY), Math.round(r.left)];
  });
  return map;
};

// ---------- Runner ----------
const report = { baseUrl, timestamp: new Date().toISOString(), routes: {}, breakpointSweep: {}, summary: { blocking: 0, warning: 0 } };

const browser = await chromium.launch();

for (const route of routes) {
  const url = new URL(route, baseUrl).href;
  report.routes[route] = {};
  console.log(`\n━━━ ${url}`);

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.width < 768,
      hasTouch: vp.width < 768,
      userAgent: vp.width < 768
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1500); // let fonts/animations settle

      const snapBefore = await page.evaluate(LAYOUT_SNAPSHOT);
      await page.waitForTimeout(2000);
      const snapAfter = await page.evaluate(LAYOUT_SNAPSHOT);

      const result = await page.evaluate(PAGE_AUDIT);

      // layout shift diff
      const shifts = [];
      for (const k of Object.keys(snapBefore)) {
        const a = snapBefore[k], b = snapAfter[k];
        if (b && (Math.abs(a[0] - b[0]) > 8 || Math.abs(a[1] - b[1]) > 8))
          shifts.push({ element: k, moved: `${b[0] - a[0]}px vertical, ${b[1] - a[1]}px horizontal` });
      }
      if (shifts.length) result.issues.push({ type: 'layout-shift', severity: 'warning', detail: 'Elements moved after load settled', offenders: shifts.slice(0, 8) });

      // RTL pass (only at one mobile viewport to keep runtime sane)
      if (testRtl && vp.name === 'iphone-se-375') {
        await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
        await page.waitForTimeout(800);
        const rtl = await page.evaluate(PAGE_AUDIT);
        const rtlOverflow = rtl.issues.filter(i => i.type === 'horizontal-overflow');
        if (rtlOverflow.length) result.issues.push({ type: 'rtl-overflow', severity: 'blocking', detail: 'Horizontal overflow appears in RTL mode', offenders: rtlOverflow[0].offenders });
        await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));
      }

      const shotName = `${route.replace(/[^a-z0-9]/gi, '_') || 'home'}--${vp.name}.png`;
      await page.screenshot({ path: path.join(outDir, 'screenshots', shotName), fullPage: true });

      result.screenshot = `screenshots/${shotName}`;
      report.routes[route][vp.name] = result;
      result.issues.forEach(i => report.summary[i.severity === 'blocking' ? 'blocking' : 'warning']++);
      const b = result.issues.filter(i => i.severity === 'blocking').length;
      const w = result.issues.length - b;
      console.log(`  ${vp.name.padEnd(16)} ${b ? `✗ ${b} blocking` : '✓'}${w ? `, ${w} warnings` : ''}`);
    } catch (e) {
      report.routes[route][vp.name] = { error: e.message };
      console.log(`  ${vp.name.padEnd(16)} ERROR: ${e.message}`);
    }
    await ctx.close();
  }

  // Breakpoint sweep 320 → 1280 step 20 (overflow only, fast)
  const sweepCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const sweepPage = await sweepCtx.newPage();
  try {
    await sweepPage.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    const breaks = [];
    let prevOverflow = false;
    for (let w = 320; w <= 1280; w += 20) {
      await sweepPage.setViewportSize({ width: w, height: 900 });
      await sweepPage.waitForTimeout(120);
      const over = await sweepPage.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
      const has = over > 1;
      if (has !== prevOverflow) breaks.push({ width: w, overflow: has ? `${Math.round(over)}px` : 'resolved' });
      prevOverflow = has;
    }
    report.breakpointSweep[route] = breaks;
    if (breaks.length) console.log(`  sweep 320→1280   ⚠ overflow transitions at: ${breaks.map(b => `${b.width}px(${b.overflow})`).join(', ')}`);
    else console.log('  sweep 320→1280   ✓ no overflow at any width');
  } catch (e) {
    report.breakpointSweep[route] = { error: e.message };
  }
  await sweepCtx.close();
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n${'═'.repeat(50)}\nBlocking: ${report.summary.blocking}   Warnings: ${report.summary.warning}\nReport: ${path.join(outDir, 'report.json')}\nScreenshots: ${path.join(outDir, 'screenshots')}/`);
process.exit(report.summary.blocking > 0 ? 1 : 0);
