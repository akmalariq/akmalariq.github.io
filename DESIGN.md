# DESIGN.md — akmalariq.dev

The design system for this portfolio, extracted from the code that implements it.

**Read this before making a visual change.** Every decision below is already
committed and working. The goal is to reuse, not to invent.

This document replaces `DESIGN-REFERENCES.md`, which described a different
website — navy and blue, white background, Inter — and conflicted with the
actual build. Do not follow it.

---

## The world in one paragraph

Warm near-black with a faint cast, one muted bronze accent, a serif that carries
the numbers and a geometric sans that carries the words. It reads as a printed
financial document — a ledger, an annual report — rather than an app. Type does
the work; colour and shadow stay out of the way. Restraint is the aesthetic. The
site is dark by default because that is the mode a portfolio is read in, and the
reader arrived from a dark tab.

Not: a SaaS dashboard. Not playful. Not maximalist.

---

## Primitives (`css/tokens.css`)

Never hardcode these. Read them.

| Role | Token | Value |
|---|---|---|
| Display / figures | `--font-display` | EB Garamond (variable 400–800) |
| Body / UI | `--font-sans` | Manrope (variable 200–800) |
| Labels, code, data | `--font-mono` | JetBrains Mono (variable 100–800) |

Spacing is fluid, five steps: `--spacing-xs` → `--spacing-xl`. Layout uses
`--container-max: 1300px` and `--measure: 68ch`. Radii: 6 / 10 / 16px.

Motion: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for UI, `--ease-smooth`
for reveals. Durations 160 / 200 / 250 / 600ms.

The built-in CSS easings are **too weak to read as intentional** — that is why
both curves exist. Do not substitute `ease` or `ease-in-out`.

---

## Palettes — three themes, all first-class

| | dark (default) | light | contrast |
|---|---|---|---|
| Base | `oklch(0.13 0.008 75)` | `oklch(0.97 0.006 80)` | white |
| Accent | `oklch(0.79 0.12 80)` | `oklch(0.55 0.12 75)` | `oklch(0.42 0.15 60)` |

Neutral hues sit at **75–80°** — a warm cast, deliberately. Pure grey would read
colder and more generic than the site actually is.

- **dark is the default** in `:root`, so a page with no `data-theme` still looks right and there is no flash before the bootstrap runs.
- **contrast is functional, not a mood.** Neutrals lose their warm cast, text goes to the extremes, borders carry the separation colour normally would. Never drop it — it is the accessibility floor.

To add a theme: copy a palette block, rename the attribute value, add the name
to `THEMES` in `js/nav.js`. Nothing else needs to know.

### Contrast floor

Body and placeholder text ≥ 4.5:1; large text ≥ 3:1. Verified across all three
themes.

Several muted tokens are tuned to this floor and carry the measured reason in a
comment — `--text-muted` at `0.52` in light (0.54 measured 4.26:1, too low) and
`--status-online` at `0.50` (0.55 measured 3.82:1). **When adjusting these,
re-measure. The comment explains what broke last time.**

---

## Type scale

Two rules govern this, and both have been violated:

1. **Descending order.** Every step must be a clear step. Check as an ordered
   list, never by eye.
2. **A heading is never smaller than the body it heads.**

Current committed scale:

```
48px    page title (clamp 2rem→3rem)
24px    KPI value, display face
16.8px  lede
16px    section heading      ← was 10.6px, smaller than its own table text
13.6px  table cell
13.1px  footnote
10.9px  table column header  ← was 9.9px, read as a caption
9.9px   KPI label
```

Mono is used for labels, code and tabular data — **measured data, not
decoration.** Using it as a costume for "technical" is off-limits.

---

## Layout

### The gutter is the constraint that decides breakpoints

The container is 1300px, so the free space on each side is `(viewport - 1300) / 2`:

| Viewport | Left gutter | What fits there |
|---|---|---|
| 1920px | 310px | the section index with labels |
| 1728px | 214px | the section index with labels (barely) |
| 1600px | 150px | the index as ticks only |
| 1440px | 70px | the index as ticks only |
| 1280px | 0px | **nothing** — the container fills the viewport |

**Measure the gutter before placing anything in it.** An element positioned
against the viewport edge will sit on top of the content below about 1412px.
Both index breakpoints (1412px and 1714px) come from that arithmetic, not from
round numbers that felt right.

### Section index

Fixed rail on the left, appears past 60% of the hero, hidden at the top. Fixed
rather than sticky so it never reserves layout space — a reserved column would
shrink the 1300px container and reflow everything below it.

The active item is tracked by its own observer, not the navbar's `initScrollspy`:
that one fires on section entry and favours "just passed", while the index wants
the section currently being read.

The index lists seven of the eleven sections — the decision-relevant ones. Skills
and FAQ are omitted deliberately; a ten-item rail is harder to scan than a
seven-item one, and neither is where a hire is decided.

### Anchors must clear the header

The header is sticky at 74px. Every `section[id]` and `#consult` carries
`scroll-margin-top: 5.5rem`, so an anchor jump lands with its heading visible
instead of underneath the header.

- Container 1300px, body measure `--measure: 68ch` (65–75ch is the readable band).
- **44px minimum tap target**, everywhere. Enforced on `.nav-cta`, `.tab-btn`,
  `.footer-links a`, and the theme toggle.
- Nav order is fixed: Services · Pricing · About │ Work · Blog · CTA. Exactly one
  divider, between the scroll links and the page links.
- Section spacing: more space **above** a heading than below it.

---

## Components that already exist — reuse, do not rebuild

`.report` · `.report-kpi` · `.report-table` · `.report-review` · `.demo-card` ·
`.btn` / `.btn-primary` · `.cs-title` / `.cs-lede` · `.project-card` ·
`.flow-step` / `.flow-arrow`

The reconciliation demo renders its report from `seller-ledger`'s
`report.render_fragment()` and splices that block into this site's chrome, so it
inherits the nav, footer and theme handling. **The report figures are generated,
never hand-written** — changing them means changing the fixture and re-rendering,
not editing HTML.

---

## Refuse

These are the defaults this world does not use:

- Hero-metric template: big number, small label, supporting stats, accent.
- Icon-plus-heading-plus-text cards as page structure. Cards are the lazy container; nested cards are always wrong.
- Gradient text. Emphasis comes from weight or size.
- Glass and blur as decoration.
- Hard offset shadows (`4px 4px 0`). Shadows carry an offset **and** a soft blur; the zero-blur block shadow is a costume.
- Sparklines, progress rings, and soft-rounded rectangles standing in for content.
- Monospace as costume.
- A system display face as the display voice. If a face is missing, source it — the closest installed font is a failure, not a fallback.
- Unicode glyphs standing in for icons.
- Light or dark picked by category. `contrast` exists for a reason.

---

## Verify

`npm run check:structure` — tokens centralised, themes are attributes, page
contract, nav order, projects data, build entries. Each check corresponds to a
mistake that actually happened and was found by eye, late.

Then, in a browser, all three themes. The prose above is not a substitute for
looking at it.