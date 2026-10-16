# DESIGN.md — akmalariq.dev

The design system for this portfolio. Written in the Google Stitch `DESIGN.md`
format: nine numbered sections, so any agent — this one included — reads one
file instead of four.

**Read this before making a visual change.** Everything below describes code
that is committed and deployed. The goal is to reuse, not to invent.

Supersedes the prose version of 2026-09-29, which described the pre-rollout
"warm ledger" world and **banned hard offset shadows** — the exact opposite of
what ships. Supporting detail lives in `docs/STYLE-GUIDE.md`,
`docs/UI-AUDIT.md`, `docs/UI-INVENTORY.md`, `docs/FEEDBACK-LOG.md`,
`docs/TOOLING.md`.

---

## 1. Visual Theme & Atmosphere

**The site is a stamped print artefact in a dark room.**

Two worlds coexist deliberately, and knowing which one you are editing is the
first job:

| World | Where | Grammar |
|---|---|---|
| **Neubrutalist** | `/` only, scoped to `body.home` via `css/landing.css` | 3px stroke · `border-radius: 0` · hard offset shadow, zero blur · flat categorical fills · oversized display type |
| **Ledger** | every other page — case studies, demos, blog, product | warm near-black · soft blurred shadow · 6/10/16px radius · serif figures · restraint |

They share `css/tokens.css` for the underlying primitives. `landing.css`
overrides only what the landing page needs. **Never let the two bleed.** A
component styled in one world must not appear in the other without an
explicit decision.

Density: generous on the landing page (each of ten sections is one deliberate
screen). Dense on case studies, where the content is the data.

Personality: explicit over subtle. The interface declares its presence rather
than disappearing. Warm neutrals, never cold grey.

---

## 2. Color Palette & Roles

### 2.1 Base tokens — `css/tokens.css` (both worlds)

| Role | Token | dark (default) | light |
|---|---|---|---|
| Page ground | `--bg-primary` | `oklch(0.13 0.008 75)` | `oklch(0.97 0.006 80)` |
| Panel | `--bg-secondary` | `oklch(0.16 0.01 75)` | `oklch(0.94 0.008 80)` |
| Raised | `--bg-elevated` | `oklch(0.19 0.012 75)` | `oklch(0.99 0.004 80)` |
| Body text | `--text-primary` | `oklch(0.94 0.006 75)` | `oklch(0.16 0.01 75)` |
| Secondary | `--text-secondary` | `oklch(0.65 0.008 75)` | `oklch(0.45 0.008 75)` |
| Muted | `--text-muted` | `oklch(0.58 0.008 75)` | `oklch(0.52 0.008 80)` |
| Hairline | `--border` | `oklch(0.24 0.01 75)` | `oklch(0.88 0.006 80)` |
| Strong rule | `--border-strong` | `oklch(0.32 0.012 75)` | `oklch(0.8 0.008 80)` |
| Accent | `--accent` | `oklch(0.72 0.12 260)` | `oklch(0.42 0.15 260)` |
| OK state | `--status-online` | `oklch(0.78 0.13 155)` | `oklch(0.5 0.14 155)` |
| Fault | `--status-offline` | `oklch(0.72 0.15 25)` | `oklch(0.55 0.18 25)` |

Neutral hues sit at **75–80°** — a warm cast, deliberately. Pure grey reads
colder and more generic than the site actually is.

`--accent` is **indigo, not amber**. Amber was tried and dropped: it sits too
close to `--status-offline` on the hue axis, which fails for deuteranopia and
protanopia. Indigo is separable from both green and red.

`--text-muted` in light is `0.52`, not `0.54` — 0.54 measured 4.26:1 against
`--bg-secondary`, under the 4.5:1 floor. `--status-online` in light is `0.50`,
not `0.55` (0.55 measured 3.82:1). **Both comments record what broke last
time. Re-measure before adjusting.**

### 2.2 Landing overrides — `css/landing.css`, `body.home`

| Role | Token | dark | light |
|---|---|---|---|
| Ground | `--home-bg` | `#0e0c0a` | `#FFFDF5` |
| Panel | `--home-surface` | `#16130f` | `#ffffff` |
| Panel 2 | `--home-surface-2` | `#1f1c17` | `#f3efdf` |
| Ink | `--home-ink` | `#f5f2eb` | `#000000` |
| Muted | `--home-muted` | `#a8a195` | `#4a4a4a` |
| Line | `--home-line` | `#f5f2eb` | `#000000` |
| Accent | `--home-accent` | `#1b3e8d` | `#1b3e8d` |
| Accent ink | `--home-accent-ink` | `#f5f2eb` | `#f5f2eb` |

### 2.3 Categorical project fills — `data-accent`

One flat fill per deliverable kind. **Categorical, not ambient** — the colour
identifies the work, it does not decorate it.

| Attribute | Fill | Left stripe | Meaning |
|---|---|---|---|
| `yellow` | `#FFF1B8` | `#FFD23F` | Replenishment / inventory |
| `orange` | `#FFEBD6` | `#FFA552` | Promotion / trade |
| `sky` | `#E3F1FF` | `#74B9FF` | Forecasting / ML |
| `green` | `#E0F4E0` | `#88D498` | Cloud / pipeline infrastructure |
| `neutral` | `--home-bg` | — | Everything else; dashed border |

Card text is forced to `#0e0c0a` regardless of theme, so a dark-theme page
still carries ink on a pastel fill.

### 2.4 Status

Green and red are never the **only** channel. Every state carries a text
label (`Success`, `Pending (Manual BCA Check)`, `Format Error`) — WCAG 1.4.1.

---

## 3. Typography Rules

### 3.1 Families

| Role | Ledger world | Landing world (`--home-*`) |
|---|---|---|
| Display | EB Garamond 400–800 | **Syne** 600–800 |
| Heading / UI | Manrope 200–800 | **Space Grotesk** 400–700 |
| Body | Manrope | Manrope |
| Mono | JetBrains Mono 100–800 | JetBrains Mono |

**Every family named above has an `@font-face` in `css/fonts.css`.** A family
without one fails *silently* to the generic fallback — this is not theoretical:
Syne, Space Grotesk and Space Mono were requested in `landing.css` for months
and never loaded, so the hero ran at 136px in Arial. See §3.4.

Self-hosted: EB Garamond, Manrope, JetBrains Mono, Inter (344 KB, Latin subset
— subset it further).
From Google: Syne, Space Grotesk, Space Mono.

### 3.2 Two rules, both violated before

1. **Descending order.** Every step is a clear step. Check as an ordered list, never by eye.
2. **A heading is never smaller than the body it heads.**

### 3.3 Current scale

Ledger (case studies, blog):

```
48px    page title
24px    KPI value
16.8px  lede
16px    section heading      ← was 10.6px, smaller than its own table text
13.6px  table cell
13.1px  footnote
10.9px  table column header  ← was 9.9px, read as a caption
9.9px   KPI label
```

Landing (`css/landing.css`):

| Step | Size | Use |
|---|---|---|
| Display | `clamp(3.5rem, 12vw, 8.5rem)` (136px @1280) | `.hero-title` only |
| Section | `clamp(2rem, 4.5vw, 3.25rem)` | `.section-title` |
| KPI | `clamp(1.35rem, 3vw, 1.85rem)` | `.opsdash__kpi-value`, `.cloud-metric-value` |
| Body | `1.02rem` / 1.65 | paragraphs |
| Label | `0.64–0.72rem` | mono eyebrows, table headers |

Tracking: `-0.03em` to `-0.045em` on display, `+0.05em` to `+0.14em` on mono
labels. Body line-height 1.6–1.7, display 0.88–1.15.

Mono carries labels, code and **tabular data** — measured data, never costume.
`font-variant-numeric: tabular-nums` on every number that sits in a column.

### 3.4 Font loading — the silent failure

`document.fonts` must list the family. A family in `font-family` without a
resolvable `@font-face` falls back with no console error and no layout shift —
the page just looks like the wrong font. Verify with a glyph-width probe, not
by reading the CSS:

```js
const c = document.createElement('canvas').getContext('2d');
c.font = '800 40px sans-serif';            const fallback = c.measureText(s).width;
c.font = "800 40px 'Syne', sans-serif";   const actual    = c.measureText(s).width;
// equal widths => the face never loaded
```

Google Fonts additionally requires CSP permission. `_headers` now carries:

```
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
font-src  'self' https://fonts.gstatic.com;
```

Widening CSP is a security-relevant change. Keep the host list to exactly what
is used.

---

## 4. Component Stylings

### 4.1 Landing world — `body.home`

| Component | Border | Radius | Shadow | Hover | Press |
|---|---|---|---|---|---|
| `.btn` | 3px | 0 | 5px offset | lift `translate(-2px,-2px)`, shadow → 8px | `translate(3px,3px)`, shadow `none` |
| `.hero-badge` | 3px | 0 | 3px | — | — |
| `.proof li` | 3px | 0 | 3px | — | — |
| `.project-card` | 3px + 6px stripe | 0 | 5px | lift, shadow → 7px | — |
| `.pipeline-card` / `.build-item` | 3px | 0 | 5px | lift, → 8px | — |
| `.pipeline-node` | 3px | 0 | 3px | lift 1px, → 5px | — |
| `.tab-btn` / `.opsdash__pill` | 2px | 0 | 3px | fill = accent, lift 1px | `translate(2px,2px)` |
| `.faq-item` | 3px | 0 | 3px | lift 1px, → 5px | — |
| `.opsdash` | 3px | 0 | 8px | — | — |

Buttons are `display: inline-flex`, 44px min height, uppercase mono label.
`body.home .btn { border-radius: 0 !important }` — site.css sets pills, this
outranks it and must stay.

### 4.2 Ledger world

`.btn` · `.project-card` · `.pricing-card` · `.consult-*` · `.report-kpi` ·
`.report-table` · `.demo-card` · `.cs-title` / `.cs-lede` · `.flow-step` /
`.flow-arrow` — reuse, do not rebuild.

The reconciliation demo renders its report from `seller-ledger`'s
`report.render_fragment()` and splices it into this site's chrome, so it
inherits nav, footer and theme handling. **Report figures are generated, never
hand-written** — change the fixture and re-render, do not edit HTML.

### 4.3 Navbar — one component, every page

`css/nav.css` + `js/nav.js`. Never restyle the header from a page stylesheet.
Markup identical everywhere, in order:
`Services · Pricing · About │ Work · Blog · Get in touch` — exactly one divider,
between in-page anchors and page links.

### 4.4 Interactive components

**`.opsdash`** (`js/sample-dashboard.js`) — filterable dashboard over
*synthetic* retail data. Filters: period, branch, channel, each with
`aria-pressed`. DOM bars, not canvas, so they stay selectable and legible and
inherit theme tokens. Data generated by a seeded PRNG (mulberry32): 84 days × 3
branches × 3 channels × 4 categories would be ~250 KB as JSON and is 10.8 KB as
source. Day 0 is a **fixed date**, not `today`, so the chart shape does not
change between loads.

**Tabs** (`.showcase-card`) — `role="tablist"` / `tab` / `tabpanel`, `.active`
class, `aria-selected`. Without JS both panes stack; nothing hides.

---

## 5. Layout Principles

- Container `1300px` (`--container-max`), body measure `68ch`.
- Section order on `/` is fixed: `what-i-build` → `solutions` →
  `opsdash-section` → `process` → `projects` → `pricing` → `skills` → `about` →
  `faq` → `contact`.
- **More space above a heading than below it.**
- Section spacing: `clamp(2.5rem, 6vw, 4rem)`.

### 5.1 The gutter decides the breakpoints

Free space each side is `(viewport − 1300) / 2`:

| Viewport | Left gutter | What fits |
|---|---|---|
| 1920px | 310px | section index with labels |
| 1728px | 214px | section index with labels (barely) |
| 1600px | 150px | index as ticks only |
| 1440px | 70px | index as ticks only |
| 1280px | 0px | **nothing** — container fills viewport |

**Measure the gutter before placing anything in it.** An element positioned
against the viewport edge collides with content below ~1412px. Both index
breakpoints (1412px, 1714px) come from that arithmetic.

### 5.2 Section index

Fixed rail, appears past 60% of the hero. Fixed rather than sticky so it never
reserves layout space. Its active item is tracked by its own observer, not the
navbar scrollspy — that one favours "just passed", the index wants "currently
reading". Seven of ten sections; skills and FAQ omitted on purpose.

### 5.3 Anchors

Header is sticky at 74px. Every `section[id]` carries
`scroll-margin-top: 5.5rem`.

---

## 6. Depth & Elevation

### 6.1 Landing — hard offset, zero blur

| Token | Value | Use |
|---|---|---|
| `--home-shadow-sm` | `3px 3px 0 0` | badges, chips, small controls, pipeline nodes |
| `--home-shadow-md` | `5px 5px 0 0` | cards, buttons, panels |
| `--home-shadow-lg` | `8px 8px 0 0` | overlays, `.opsdash` |
| `--home-shadow-xl` | `12px 12px 0 0` | dialogs |

Colour is `--home-shadow-color` — ink on light, paper on dark. **Blur is
always 0.** This tiering is the whole depth language; when every card, chip and
tooltip gets equally aggressive shadow, hierarchy collapses.

### 6.2 Ledger — soft, blurred

`--shadow: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.28)` (dark);
warm-tinted equivalent in light. Elevation here is atmospheric, not structural.

### 6.3 No gradients as depth

No gradient backgrounds, no gradient text, no glass/blur as decoration.
Emphasis comes from weight or size.

---

## 7. Do's and Don'ts

### Do

- Read the token before hardcoding a value. If you are typing a colour, radius, font or duration into a component, add a token instead.
- Animate only `transform` and `opacity`.
- Gate pointer-only hover inside `@media (hover: hover) and (pointer: fine)` — touch fires `:hover` on tap and leaves links stuck.
- Give pressable elements `:active { transform: scale(0.97) }`.
- Label every state with text, never colour alone.
- Say "Sample data · synthetic" once, in mono, below any generated figure.

### Don't

- Hero-metric template: big number, small label, accent. *(The landing hero is
  a name. The number lives in `docs/FEEDBACK-LOG.md` as a future change.)*
- Icon + heading + text cards as page structure. Cards are the lazy container; nested cards are always wrong.
- Sparklines, progress rings, soft rounded rectangles standing in for content.
- Unicode glyphs standing in for icons.
- Monospace as costume.
- A system face as the display voice. If a face is missing, source it — the closest installed font is a failure, not a fallback.
- `transition: all`. Name the properties.
- `scale(0)` as an entry state. Start at `scale(0.95)` with `opacity: 0`.
- `ease-in` on UI. It reads sluggish; use `--ease-out`.
- Animating anything a keyboard user triggers repeatedly.
- A 3D or canvas hero. The deliverable is a dashboard.
- Both design worlds on one page.

---

## 8. Responsive Behaviour

Breakpoints in use:

| Query | Governs |
|---|---|
| `max-width: 1714px` / `1412px` | section index degrades to ticks, then hides |
| `max-width: 1088px` (68rem) | container gutters |
| `max-width: 992px` | wide grid → single column |
| `max-width: 768px` | navbar collapses to `.mobile-menu-btn` |
| `max-width: 720px` / `640px` | section spacing tightens |
| `max-width: 544px` (34rem) | type scale floors |
| `(hover: hover) and (pointer: fine)` | all pointer-only motion |
| `(prefers-reduced-motion: reduce)` | motion off, opacity retained |

**44px minimum tap target**, enforced on `.nav-cta`, `.tab-btn`,
`.opsdash__pill`, `.footer-links a` and the theme toggle.

Collapse order: never the deliverable. `.opsdash` drops its filter groups to
one column and its plot bars keep their flex basis so the shape survives.
Tables scroll horizontally rather than reflowing — a report that reflows is no
longer a report.

Reduced motion keeps opacity and colour transitions (they aid comprehension);
drop `transform` and `translate`. Guard both JS (`matchMedia`) and CSS.

---

## 9. Agent Prompt Guide

Quick reference for an agent about to touch this codebase.

**Scope first**

```
Which world? landing (body.home, css/landing.css) or ledger (css/style.css + site.css)?
Never both on one page.
```

**Before editing**

```bash
npm run check:structure   # must print "Structure is intact."
```

**Tokens live in one place**

```
css/tokens.css        primitives + palettes — edit here
css/landing.css       body.home overrides — edit here for the landing world
css/nav.css           the ONLY place navbar CSS belongs
css/style.css         legacy components (no tokens)
css/site.css          current components, loads after style.css (no tokens)
blog-src/src/styles/tokens.css   GENERATED — run npm run sync:tokens
```

**Theme changes take five steps** — palette in `tokens.css`, `THEMES` in
`js/nav.js`, `THEMES` in the page bootstrap, icon rules in `nav.css`, blog
cursor in `blog.css`. All five, or the theme half-works.

**Before saying done**

```bash
npm run check:structure
npm run build
npx wrangler pages deploy dist --project-name akmalariq --branch main
```

Then, in a real browser, **both themes**, at 1280 and 390px. Confirm the
fonts you touched actually loaded (§3.4). The prose above is not a substitute
for looking at it.

**Copy-paste reminders**

- `transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms ease`
- `:active { transform: scale(0.97) }`
- `@media (hover: hover) and (pointer: fine) { … }`
- `@media (prefers-reduced-motion: reduce) { opacity and colour only }`

**Skills** — `impeccable` (audit, polish, DESIGN.md extraction),
`design-taste-frontend` (deal a direction before inventing one),
`emil-design-eng` (motion), `improve-animations` (audit existing motion).
Precedence and installation state: `docs/TOOLING.md`.