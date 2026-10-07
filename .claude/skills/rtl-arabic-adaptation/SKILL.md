---
name: rtl-arabic-adaptation
description: How to build the Arabic (or any right-to-left) version of an English web design. Use whenever an AR/RTL page, banner, landing page or component is created or reviewed. The whole composition is mirrored and re-balanced for right-to-left reading, not just the text direction, so the result feels designed for an Arabic-speaking audience. Includes the STARTRADER web team's RTL requirements (from Hiba) and a CSS implementation checklist.
---

# RTL / Arabic adaptation

When creating the Arabic version of an English design, do not only change the
text direction to right-to-left. The entire design layout must be adapted to
RTL and visually mirrored where appropriate, so the Arabic version feels
naturally designed for an Arabic-speaking audience rather than like Arabic
text placed inside an English layout.

## Principles (follow strictly)

- The overall visual flow should move from right to left.
- Reverse the placement of major design elements compared with the English
  version. If the English design has the main visual on the right and text on
  the left, the Arabic version should generally have the visual on the left and
  text on the right.
- Titles, body copy, CTAs, labels, tables, cards and content blocks follow RTL
  hierarchy and alignment.
- Navigation, arrows, directional icons, progress indicators, steps and similar
  elements are adjusted to RTL direction.
- Decorative elements, shapes, backgrounds, supporting graphics and visual
  accents are repositioned where needed to create an RTL composition.
- Spacing, margins and alignment are reconsidered for the mirrored layout
  rather than simply keeping the English positioning.
- The Arabic design keeps the same visual balance, hierarchy, branding and
  overall style as the English version while presenting the composition from
  the opposite reading direction.
- Do not mirror elements that should remain unchanged: logos, brand marks,
  product images, photographs of real objects, numbers, or anything where
  mirroring would make it incorrect.
- Think of the Arabic version as a proper RTL adaptation of the full design,
  not simply a translation of the English text.

## Implementation checklist (HTML/CSS)

1. `<html lang="ar" dir="rtl">`. Never force `direction:ltr` on the page
   wrapper or hero to "protect" a layout; mirror the layout instead.
2. Let the engine do the bulk: CSS grid and flex rows reverse automatically
   under `dir="rtl"`, as do text alignment, list markers, `margin/padding-inline`
   and `inset-inline`. Prefer logical properties for new CSS.
3. Audit the page CSS for physical directional rules and give each an RTL
   counterpart (`[dir="rtl"] …`): `left/right` on absolute elements and
   pseudo-elements, `text-align:left/right`, `margin-/padding-/border-left|right`,
   `transform: translateX(...)`, `transform-origin`, `object-position`,
   `background-position`, `mask-image` fades, horizontal gradients
   (`90deg` becomes `270deg`), `@keyframes` that animate `left`, `skew`
   directions, hover nudges, and inline `style="left:…"` on markup.
4. Hero art: keep the artwork un-flipped (it may contain brand marks and
   lettering). Re-anchor it to the opposite side, mirror its edge fade and the
   copy overlay gradient, move the copy block to the right, and re-check the
   focal point (`object-position`) at every breakpoint.
5. Arrows and chevrons in buttons and links: `transform:scaleX(-1)`, and the
   hover shift goes the same way. Icons that are symbolic rather than
   directional (globe, user, check) stay as they are.
6. Progress and sequence: step rails, timelines, sliders, countdown order and
   fills start from the right. Podiums and centred stages stay centred.
7. Tables: first column on the right, numeric column on the left; header
   alignment follows.
8. Numbers, amounts, currency codes, dates with digits, phone numbers and
   codes keep left-to-right order: `direction:ltr; unicode-bidi:isolate` on
   those elements.
9. Shared English components (a disclaimer bar or footer that is still in
   English) stay `direction:ltr`; translate them rather than mirror them when
   the Arabic text exists.
10. Copy: Arabic strings come from the approved sheet verbatim. Where a label
    is derived from a sentence (for a stat or chip), drop only connectives and
    punctuation, never reword.

## Verification

- Screenshot desktop (1440) and phone (390) and compare against the English
  page flipped horizontally: the composition should match element for element,
  except logos, product art and numerals.
- Check no horizontal scroll at 350px, arrows point left, step and rank
  numbering reads right-to-left, and no English UI string is left in the main
  content.
