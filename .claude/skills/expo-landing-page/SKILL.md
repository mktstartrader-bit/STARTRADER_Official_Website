---
name: expo-landing-page
description: Builds a STARTRADER expo/event promotion landing page from a content sheet supplied by MKT, reusing the established template (forex-expo-dubai-2026.html). Use whenever the user asks for a landing page for an expo, trade show, or event campaign and supplies content (sheet, screenshot, or text).
---

# Expo Landing Page

MKT supplies the content per expo; the UI stays identical between expos.
The reference implementation is `forex-expo-dubai-2026.html` — copy it and
swap content, never redesign.

## Non-negotiables

- **Content verbatim.** Every line from the sheet lands exactly as written —
  no additions, no rewrites, no dropped lines. Headings keep their sentence
  as given (case may follow the template's type treatment).
- **No site chrome.** No header/nav, no footer, no cookie/app banners —
  the page must not load `main.js` (it injects the smart banner). AOS is
  initialised by the page's own inline script, which also adds the
  `js-aos` class.
- **Risk warning last.** The standard risk paragraph (first paragraph of
  the site footer's RISK WARNING) closes the page on a dark strip.
- **Open Live Account form in the hero** — the house underline-field form
  (country select, email, verification code + resend countdown, password
  + eye toggle, Individual/Company pills, U.S.-person + Privacy Policy
  consents, Create Account button). Behaviour: native validation, valid
  submit routes to `/getting-started.html` with no fields in the URL.
- **File name**: `<event-slug>-<year>.html` (e.g. `forex-expo-dubai-2026.html`).
  Add it to `sitemap.xml`.

## Page anatomy (in order)

1. **Hero (dark)** — `xp-hero`: STARTRADER logo link, kicker (event name),
   H1 = the sheet's two headline lines (second line takes the blue→teal
   gradient `alt` class), lead = booth/meet line, two `xp-meta-row` glass
   chips (venue+halls / dates+booth), and the `xp-form` glass card on the
   right (stacks below 1024px).
2. **Full-width image band** — `xp-band`: a 21:9 venue image, edge to
   edge, dark-feathered top and bottom.
3. **Entity fine print (dark seam)** — the sheet's compliance lines,
   centred small print.
4. **Campaign section (LIGHT ground, dark billboard)** — `xp-quiz`: one
   large rounded dark-glass panel (`xp-quiz-panel`: lit hairline top edge,
   blue/teal radials on near-black) sitting on the light page ground.
   Inside, left: the sheet's second headline pair, the campaign copy,
   stat pills (each sheet line becomes one `xp-stat`), the CTA button
   (campaign URL from MKT; `#` + comment until supplied). Right: the
   hero 3D icon with `mix-blend-mode:screen` so its black background
   melts into the panel and only the glass glows. Below ~1024px the
   icon moves above the copy.
5. **How it works (LIGHT)** — `xp-steps`: one glass card per sheet step;
   card = ghost numeral + 3D icon tile + bold title (the part before the
   em-dash) + copy (the part after). Below: the `*T&Cs apply.` line — the
   anchor text links the promotion's PMT document (from MKT; `#` +
   comment until supplied, keep the full document name in `title=`).
6. **Risk warning (dark)** — `xp-risk`.

The light/dark rhythm is fixed: dark hero → image band → dark fine print
→ light campaign → light steps → dark risk.

## Imagery (generate per expo, Higgsfield nano_banana)

All icons share one recipe — append to a subject description:
"rendered in deep sapphire blue frosted glass (#0047BB) with lighter
#2A72FF glass highlights and a subtle cyan rim light, translucent glassy
material, soft inner glow, crisp studio reflections, app-icon style,
high detail product render, pure black background, centered", 1:1.

- 1 hero icon for the campaign section (subject = the campaign mechanic,
  e.g. stopwatch + lightning for a speed quiz), exported 512px.
- 1 icon per step (question bubble / gauge / trophy / ascending steps
  worked for the quiz mechanic), exported 256px.
- 1 venue band image, 21:9: "ultra-wide cinematic photograph of a premium
  fintech exhibition hall … deep sapphire blue and cyan grading … no
  readable text or logos anywhere".

Convert everything to WebP (Pillow, quality=80, method=6) into
`assets/img/` as `<slug>-hero.webp`, `<slug>-step-*.webp`, `<slug>-hall.webp`
and update the page's `og:image`.

## SEO

- Title: `<Event Name> <Year> | Meet STARTRADER at Booth <N>`.
- Meta description from the booth line + venue + dates.
- JSON-LD `Event` (startDate/endDate, Place with locality/country,
  organizer STARTRADER). Canonical on www.startrader.com.

## Verify before shipping

Playwright at 1366 / 768 / 390 / 320: no horizontal overflow, all images
load, form send-code countdown + eye toggle + submit redirect work, no
`.site-header`/`.site-footer` present. Then commit, push, `vercel --prod`.
