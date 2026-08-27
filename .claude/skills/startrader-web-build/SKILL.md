---
name: startrader-web-build
description: Build conventions and delivery workflow for the STARTRADER official website — CSS architecture (append-only styles.css + inline page styles), Swiper/AOS plugin patterns, WebP image pipeline, i18n width reserves, 350px compatibility, verification and Vercel deploy. Use when adding or editing pages, images, styles, carousels, or animations in this repo, and when preparing code for the developer handoff.
---

# STARTRADER Web Build

Rules and workflows for every change in this repo. They exist because developers
copy code from here into the official website — pages must lift out cleanly and
the shared layer must never shift under them.

## CSS architecture (non-negotiable)

- `assets/css/styles.css` holds **only cross-page styles**: tokens, reset,
  typography, buttons, header/nav/mega-menu, footer, shared components, page
  families (e.g. `.fx-*` product pages), Swiper/AOS theming.
- **`styles.css` is append-only.** Never rewrite, reorder, or delete existing
  rules once delivered — if a previous batch shipped "abc", the next ships
  "abcd", never "bbcd". New shared styles go at the END under a dated
  `/* ===== <BATCH NAME> (appended batch) ===== */` header.
- **Page-specific CSS lives inline** in that page's `<head>`, in the `<style>`
  block after the marker comment
  `<!-- Page-specific styles (extracted from the shared stylesheet) -->`.
- `url()` paths inside inline page styles resolve **relative to the page**, not
  to `assets/css/` — rebase when moving CSS between the two layers
  (e.g. `../img/x.webp` in styles.css becomes `../../assets/img/x.webp` in a
  page two levels deep). Never rely on above-root `../../../` clamping.
- Head order matters: `swiper-bundle.min.css` (if rails) → `aos.min.css` →
  `fonts.css`/`styles.css` → inline `<style>`. Page CSS must load last so it
  wins cascade ties.

## Plugins — never hand-roll these

- **Carousels/marquees = Swiper** (self-hosted `assets/js/vendor/swiper-bundle.min.js`,
  `assets/css/swiper-bundle.min.css`). Pattern:
  ```html
  <div class="award-rail swiper st-marquee" data-marquee-speed="50">
    <div class="award-track swiper-wrapper" id="...">
      <article class="award-card swiper-slide">…</article>
  ```
  `initMarqueeSwipers()` in main.js picks up every `.st-marquee`
  automatically: `slidesPerView:'auto'`, loop, continuous linear autoplay at
  `data-marquee-speed` px/s, pause on hover, drag. Optional
  `data-marquee-prev/next` selectors wire arrow buttons. Slide classes must
  declare their own width (`flex:0 0 300px` or `width:…`) — the
  `.st-marquee .swiper-slide` override intentionally does NOT set width.
  Rails with fewer than 8 slides are auto-cloned once for loop mode.
- **Reveal/entry animations = AOS** (self-hosted `aos.min.js`/`aos.min.css`).
  Mark elements `data-aos="fade-up"` (+ `data-aos-delay="100|200|…"` for
  stagger, steps of 100 capped at 600). `initAOS()` in main.js initialises
  (700ms, once:true, offset:60) and **strips AOS attributes after each element
  animates in** — required, otherwise AOS pins a transform that kills the
  shared card hover lift. The `html:not(.js-aos) [data-aos]` safety rule keeps
  content visible with JS off; never remove it.
- GSAP/ScrollTrigger/Lenis stay ONLY for pinned scroll scrubs, count-up
  counters, and hero parallax. No new GSAP reveals or marquees.

## Images

- All raster images ship as **WebP** (Pillow, `quality=80, method=6`); SVG/GIF
  stay as-is. No jpg/jpeg/png may enter the repo.
- Update every reference when adding/renaming: `<img src>`, CSS `url()`,
  `<link rel="preload">` (+ `type="image/webp"`), `og:image`, `twitter:image`.
- **Every `<img>` gets a meaningful, filled `alt`** — empty `alt=""` is not
  accepted by the dev team, even for decorative art.
- Keep the LCP hero image preloaded with `fetchpriority="high"`; give imgs
  explicit `width`/`height` (CLS).

## Layout & i18n

- Reserve **130% of the English text width** in buttons, nav items, badges and
  card headings (translations run long). Prefer `clamp()`/flex over fixed
  widths; never `white-space:nowrap` on translatable UI without min-width room.
- Minimum supported viewport is **350px**. Wide content (tables, rails,
  code) scrolls inside its own container; the page never scrolls horizontally.
- Heroes carry only heading, subline and one button — no background patterns.
  Cards are glassmorphic and share the one site-wide hover effect.

## Verification workflow (before any handoff/deploy)

1. `node --check assets/js/main.js` and brace-balance any edited CSS.
2. Serve locally: `python3 -m http.server 8742`, screenshot with headless
   Chrome (`--headless --screenshot --window-size=1440,4000
   --virtual-time-budget=8000`); pixel-diff against pre-change captures with
   Pillow. Live tickers/counters produce ~0.3–3% noise — compare against a
   run-to-run noise floor before calling something a regression.
3. 350px check: headless Chrome clamps windows to 500px, so wrap the page in a
   350px-wide same-origin `<iframe>` and read `scrollWidth` from inside.
4. Check all CSS `url()` refs resolve on disk and no `.jpg/.png` references
   remain: `grep -rniE '\.(jpe?g|png)\b' --include='*.html' --include='*.css' .`

## Delivery & deploy

- Prefer complete per-page code in one batch (page HTML with its inline CSS),
  never fragments the devs must merge by hand.
- Commit in logical units (images / vendor / shared CSS+JS / pages).
- **Minified build artifacts**: pages link `styles.min.css?v=<stamp>` and
  `main.min.js?v=<stamp>`. The editable, append-only sources remain
  `styles.css` and `main.js` (never hand-edit the `.min` files). After ANY
  change to either source, regenerate both artifacts before verifying:
  `npx --yes csso-cli assets/css/styles.css --no-restructure -o assets/css/styles.min.css`
  (`--no-restructure` is mandatory — the append-only cascade depends on rule
  order) and
  `npx --yes terser assets/js/main.js -c -m --ecma 5 -o assets/js/main.min.js`,
  then `node --check assets/js/main.min.js`.
- Cache busting: after regenerating the artifacts, bump the `?v=` stamp on the
  `.min` links across all pages (sed) so reviewers' phones pick up the change
  without hard refreshes.
- Page-speed guardrails (Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on
  mobile AND desktop): every below-the-fold `<img>` carries `loading="lazy"
  decoding="async"`; hero/LCP images stay eager with a
  `<link rel="preload" as="image" fetchpriority="high">`; `<video>` uses
  `preload="metadata"` (never `auto`) with a poster; third-party iframes are
  lazy-loaded (IntersectionObserver) with a `preconnect` for their origin.
- Deploy: `vercel --prod --yes` (project is linked; static, no build step).
  Smoke-check the `startrader-official.vercel.app` alias afterwards — the
  unique deployment URL 302s due to deployment protection; that is normal.
