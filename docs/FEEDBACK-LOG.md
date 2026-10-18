
## Contrast-probe false positive: graphical elements

The probe applies the 4.5:1 **text** threshold to every selector. Graphical
elements — chart bars, progress fills, status dots — are governed by WCAG
2.2 **1.4.11 Non-text Contrast**, which requires only **3:1**.

Measured 2026-10-16 for `.opsdash__bar`:

| pair | ratio | required | verdict |
|---|---|---|---|
| bar `#1b3e8d` vs plot `#fffdf5` | 9.73:1 | 3:1 (1.4.11) | pass |
| bar `#1b3e8d` vs card `#ffffff` | 9.90:1 | 3:1 (1.4.11) | pass |

Do not "fix" a bar to satisfy a 4.5:1 text probe. If a future run flags a
graphic again, measure it against 3:1 before touching the palette.

## Font audit — three display faces never loaded (2026-10-16)

`css/landing.css` asked for Syne, Space Grotesk and Space Mono. `css/fonts.css`
had no `@font-face` for any of them. The Google Fonts `<link>` existed in
`index.html` and returned 200 — but `_headers` shipped a CSP with
`font-src 'self'` and no `fonts.gstatic.com` in `style-src`, so the stylesheet
was fetched and then blocked.

The failure was **silent**: no console error, no layout shift. The hero
rendered at 136px in the generic sans fallback, and it read as "the design
drifts from the reference" rather than "three fonts are missing".

Measured with a canvas glyph-width probe, same string, three faces:

| face | width | verdict |
|---|---|---|
| `sans-serif` | 516px | baseline fallback |
| `'Syne', sans-serif` | 516px | **identical → not loaded** |
| `'Space Grotesk', sans-serif` | 516px | **identical → not loaded** |
| `'Syne', sans-serif` (after fix) | 723px | loaded |
| `'Space Grotesk', sans-serif` (after fix) | 435px | loaded |
| `'Space Mono', monospace` (after fix) | 482px | loaded |

H1 rendered width 690px → 722px. 0 console errors after the fix.

Three fixes, all required:
1. `_headers` CSP: added `https://fonts.googleapis.com` to `style-src` and
   `https://fonts.gstatic.com` to `font-src`.
2. `landing.css`: `--home-display`, `--home-heading`, `--home-mono` now name a
   single face with a comment pointing here.
3. `DESIGN.md` §3.4 documents the glyph-width probe as the standard check.

**Rule added:** a family in `font-family` with no resolvable `@font-face` is a
failure, not a fallback. Verify with `document.fonts` or the width probe. Never
by reading the CSS.

## Accent-as-text needs its own token (2026-10-18)

Third time the indigo accent has failed as text. `--home-accent: #1b3e8d` measures
**1.87:1** against `--home-bg: #0e0c0a` — unusable as text, fine as a fill with
light ink on top.

Added `--home-accent-text` (#7b9bf0 dark / #1b3e8d light) and repointed every
accent-used-as-text rule at it: `.layer__index`, `.layer__claim`,
`.foundation-col__lead`.

**Rule:** if a colour is used both as a fill and as text, it is two tokens.
A fill wants contrast against the ink sitting on it; text wants contrast
against the ground behind it. Those are different numbers and one value
cannot satisfy both. Probe both themes — it passes in light and fails in dark
every time.
