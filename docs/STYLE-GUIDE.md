# Style Guide — AI Digital-derived (emil-tuned)

**Status**: Reference document — distills `aidigital.com` visual language through `emil-design-eng` skill principles (spring animations, unseen details, interruption-friendly motions, hardware-accelerated transforms, and accessibility). Implied users: data consultants who want premium SaaS authority, not "designer-who-uses-PowerPoint".

Source of truth: `aidigital.com` CSS tokens (extracted `page.css` + live HTML structure, 2026-10). All tokens cross-checked on `aidigital.com/`. Output format: copy-pasteable.

---

## 1. The visual thesis

**What aidigital does that matters**:
1. **White crystal canvas** + **deep navy #26263A** text lockup + **indigo #0009DC** link accent. No background noise, deliberate.
2. **Optical-sized Inter** with variable `opsz 14–32` axis and weights 300–800. Headlines relax via `clamp()` at every breakpoint.
3. **One accent per screen**: primary CTA is indigo, language blocks are lime (`#AEF33E`), warnings are fuchsia (`#F0348E`). Never muddle.
4. **Rounded but not juvenile**: 1rem dominate, 1.5rem hero, 100px pill.
5. **Soft elevation only** — no `box-shadow` frames; 1px neutral borders; real depth via layout and whitespace.
6. **Animation vocabulary types**: text slide-ins (1–4 deep cascades), "double-scroll" video chips, masked logo sliders, subtle Lottie decorative.
7. **Performance-first**: GPU-friendly, no heavy JS-driven visual state shifts.

**Emil's voice applied to aidigital's recipe**:
- Don't animate everything; use `slide-in-1..4` on text blocks only.
- Cap duration under 300 ms; `ease` on hover states, never `ease-in`.
- Prefer `transform + opacity` only, no width/height/margin/padding for motion.
- Always `@media (hover: hover) and (pointer: fine)` before applying hover motion.
- Cap reduced-motion per Emil: **keep opacity + color transitions** that aid comprehension; drop any motion.

---

## 2. Norman color system (reference tokens + semantic mapping)

```css
:root {
  /* aidigital primitives — DO NOT change; re-brand via mix/overlay instead */
  --aid-black:     #26263A;      /* body text on white */
  --aid-deep:      #0009DC;      /* primary / links / buttons */
  --aid-bright:    #00B6FF;      /* hover / active states */
  --aid-lime:      #AEF33E;      /* live data pill / "report landed" */
  --aid-fuchsia:   #F0348E;      /* error / report-failed / negative */
  --aid-purple:    #B07FFF;      /* secondary accent (one use max per screen) */
  --aid-pink:      #FF7CF5;      /* rare third accent */
  --aid-grey:      #80808E;      /* muted / fine print */
  --aid-dark-grey:#484848;      /* secondary labels */
  --aid-bright-grey:#F2F1F3;    /* page sections ground */
  --aid-blue-50:   #FAFAFE;    /* subtle blue wash */
  --aid-blue-100:  #F2F3FD;    /* section bands */
  --aid-blue-200:  #0009DC1A;  /* super-light tint */
  --aid-white:     #FFFFFF;

  /* Semantic mapping (what you actually type in your CSS) */
  --c-bg:          #FFFFFF;
  --c-bg-2:        #FAFAFE;   /* hero band */
  --c-fg:          #26263A;   /* body text (warm black) */
  --c-muted:       #484848;
  --c-muted-lt:    #80808E;
  --c-line:        #F2F1F3;
  --c-brand:       #0009DC;
  --c-brand-hov:   #0005B0;
  --c-live:        #AEF33E;   /* report landed */
  --c-live-ink:    #26263A;
  --c-danger:      #F0348E;

  /* Dark theme path */
  --c-dark-bg:   #0F0F1B;
  --c-dark-fg:   #F6F6FB;
  --c-dark-muted:#A0A0B6;
  --c-dark-brand:#6C89FD;
}
```

Avoid: gradients for section ground anywhere except AI Digital's diagonal mesh markers as subtle open-book. (They actually used no gradient masks in production; masked logowalls do — copy that.)

---

## 3. Typography

**Faces**: (1) Inter Variable — optical sizing **14..32**, weight 100–900; (2) the regular system mono fallback `SF Mono / JetBrains Mono 500-600`. Nothing else.

**Scale (px)** — Inter-style `clamp()` range:  
12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 · 32 · 40 · 48 · 56 · 72 · 80/96.

Only 2 bold weights: 400 body, 600 heading, 700 section kicker. Headline weight frequently 500 (ugly? no — AI uses bold headings).

```css
h1 {
  font-family: 'Inter Variable', ui-sans-serif, sans-serif;
  font-weight: 700;
  font-size: clamp(2.5rem, 5vw, 5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-feature-settings: "cv02, cv03, cv04, cv11, ss01, ss03";
  font-variation-settings: "opsz" 32;
}
```

**Cross-properties**:
- `text-wrap: balance` on h1/h2, `text-wrap: pretty` on paragraphs.
- `font-variant-numeric: tabular-nums` whenever numbers appear.
- `letter-spacing: -0.01em` on headings; `+0.05em` to `+0.1em` on eyebrow labels (ALL CAPS).
- Icon knockouts use `font-size: 1.25em` relative line-height 1.

### Line-height rule of thumb
<|message|> prose | 1.65  |
| display head | 1.05–1.15  |
| UI labels / chips | 1 |
| dense note | 1.35 |

---

## 4. Layout / spacing / grid

- **Base**: 8 px (AI tokens use a `%` Tailwind ladder; 8 for simplicity).
- Spacing ramp: 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 120.
- **Section rhythm**: top padding 4rem (≤479px) → 5rem (mobile) → 8rem (desktop), `padding-top: clamp(4rem, 8vw, 10rem)`.
- Max-width: 1280 px shell + 1120 px text column.
- Grid: 12-column, but real layout is 6+6 (intro text + media, or text + card).
- Card inner alignment: 8 px between heading and body, then 24 px padding ≥40 px.

---

## 5. Radius and elevation

| Token | px | Used for |
|---|---|---|
| `--radius-xs` | 4   | chips, tag-font tag bar |
| `--radius-s`  | 8   | form inputs, small cards |
| `--radius-m`  | 16  | case-study cards, primary buttons, nav |
| `--radius-l`  | 24  | display panels, hero-toys |
| `--radius-pill` | 100 | CTAs & CTA isolated buttons |

- **No drop-shadows**. Use 1px borders (color = `--c-line`, or `--c-bright` for hovered cards). For navigation sticky bar use `box-shadow: 0 0.5rem 1.5rem -0.5rem rgba(0,9,220,.06)`.
- Transitions: 150-200 ms, `ease-out`, just `transform` and `border-color`.

---

## 6. Motion decision framework (Emil rules applied to aidigital UX)

**Before you ship a motion, answer these in order:**

1. **How often will this appear?**
   | Frequency | Decision |
   |---|---|
   | every keypress, every hover | **No animation** (Raycast). |
   | paging, pagination, scroll | Reduce to < 100ms or fade-only. |
   | occasional (modal, drawer, toast) | 150–250ms, transform for GPU. |
   | rare / celebratory | can delight >300ms. |
2. **Why does it animate?** Must be one of: spatial consistency (a tab chooser), state change (toggle morphs), feedback (button fires 97% down), prevent jarring shift. Never "looks cool."
3. **Easing**:
   - entering: `ease-out` (instant feel).
   - on-screen movement: `ease-in-out`.
   - constant: `linear`.
   - **NEVER `ease-in`**.
   - Custom curves: `cubic-bezier(0.23, 1, 0.32, 1)` (strong UI).
   - Add iOS drawer `cubic-bezier(0.32, 0.72, 0, 1)` for slide-in tall panels (compatible with aidigital slide-in-1/2/3/4).
4. **Durations** (UI only < 300ms):
   - Button press 100–160ms
   - Drop target / tooltip / small pop 125–200ms
   - Dropdown/select 150–250ms
   - Modal/drawer 200–500ms.
5. **Frequency penalty**: hovers that trigger motion need `@media (hover: hover) and (pointer: fine)`.
6. **Reduced motion**: respect `prefers-reduced-motion: reduce`. Keep only **opacity + color** that aid comprehension (like aidigital's heavy usage of `blur` and slide reveal). Drop transforms.
7. Use **spring physics `bounce 0.1–0.3` only for drag/throw/celebratory motion**, but for most UI use transitions.
8. **Interruptibility**: transitions beat keyframes so a second click slows its own animation rather than restarts.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-ios: cubic-bezier(0.32, 0.72, 0, 1);
--duration-xs: 100ms;
--duration-s: 160ms;
--duration-m: 240ms;
--motion-vehicle: transform var(--duration-s) var(--ease-out),
                  opacity  var(--duration-s) var(--ease-out),
                  border-color var(--duration-s) ease;

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Stagger
Use 30–80ms per item — below that reads synchronously, above it begins to read "animation."

### Interruptible enter/exit
Enter 200–250ms. Exit **always** half the length (e.g., 125ms) and decays opacity first, transform after.

### Modern enter (`@starting-style`)
```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity:0; transform: translateY(100%); }
}
```

---

## 7. Components

### 7.1 Button
```css
.btn {
  height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1;
  transition: transform 160ms var(--ease-out),
              background-color 160ms ease,
              border-color 160ms ease,
              box-shadow 160ms ease;
  border: 1px solid var(--c-line);
  background: var(--c-bg);
  color: var(--c-fg);
}
.btn:hover { background: var(--c-bg-2); }
.btn--primary { background: var(--c-brand); color: white; }
.btn--primary:hover { background: var(--c-brand-hov); transform: translateY(-1px); }
.btn:active { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) {
  .btn:hover { box-shadow: 0 4px 8px -3px rgba(0,9,220,0.2); }
}
```
Don't use `transition: all`. Add `::active` scale 0.9–0.98 only — avoid anything outside `0.95–0.98`, it gets flabbergastingly slow.

### 7.2 Card / panel
```css
.card {
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-bg);
  padding: 24px 28px;
  transition: border-color 200ms ease, transform 200ms ease;
}
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    border-color: rgba(0,9,220,0.35);
    transform: translateY(-1px);
  }
}
```
Aidigital's cards often include 48px top padding + 8px margin on title → "bento layout" feel.

### 7.3 Chip / tag
```css
.chip {
  display: inline-flex; align-items: center;
  padding: 0 10px; height: 26px;
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  line-height: 1;
  background: var(--c-line);
  color: var(--c-muted);
  gap: 6px;
}
.chip-live { background: var(--c-live); color: var(--c-live-ink); }
.chip-live::before {
  content: ""; width:6px;height:6px;border-radius:50%;
  background: var(--c-fg);
  animation: blink 2s ease-in-out infinite;
}
```
Keep at most **one living chip per viewport**; the blink should not scale.

### 7.4 Form input
```css
.input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-s);
  background: var(--c-bg);
  transition: box-shadow 160ms ease, border-color 160ms ease;
}
.input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 2px rgba(0,9,220,0.25);
  outline: none;
}
```
Don't animate background color. Don't disable the browser's autofill UX.

### 7.5 Navigation
- `position: sticky; top:0; backdrop-filter: blur(10px) saturate(180%);` with a solid fallback under `prefers-reduced-transparency` (a real bundle flag at least).
- 3 link rows max per dropdown, each pauses 60 ms before it .show (stagger); each card animates up by 30px then back.

---

## 8. Micro interactions (Emil + aidigital cross-section)

1. **Swipe carousel** with damping when drag overshoots its bounds; snap to nearest item on release; use `Math.abs(dragAmt / timeTaken) > 0.11` velocity to dismiss early.
2. **Popover onboarding position**: let mousewheel interact; don't interrupt wheel regions.
3. **Clip-path region reveal** `inset(0,100%,0,0)` left-to-right; aidigital uses mask gradients, you use clip-path.
4. **Hold-to-action** uses 2s linear for `:active` clip-path, 200 ms ease-out release.
5. **Comparison slider** — two layers, top `clip-path inset(0 50%)` with drag sync.
6. **Scroll-driven image reveals**: `useInView` + IntersectionObserver `{ once: true, rootMargin: "-100px" }`.
7. **Multi-touch protection**: ignore additional `pointerId` values inside a drag.
8. **Blur to bridge cross-fade states** (keep under 20px; expensive in Safari).
9. **Tap highlight suppression**: on `:focus-ring:outline:0`, use explicit transform only.
10. **Edge-case async**: pause timers when tab hidden, close on Escape.

---

## 9. Accessibility (non-negotiable)

- `prefers-reduced-motion`: cut `transform`/`translate`, retain `opacity` + `color`. See section 6.
- `prefers-reduced-transparency`: replace `backdrop-filter` with solid bg.
- `@media (hover: hover) and (pointer: fine)` suppresses hover motion on touch.
- Skip link as a real focusable; route boundary per panel with `aria-live="polite"`.
- Focus ring: always `0 0 0 2px` solid accent on every focusable element. No hiding unless replacing.
- 4.5:1 body text, 3:1 UI components.
- Alt text for anything that conveys content; everything else `aria-hidden`.
- `aria-current="page"` and `aria-selected` for active tabs.
- Don't add redundant `role="button"` to `<button>`.

---

## 10. Anti-patterns for this guide (never do)

- `transition: all` → name it: `transition: transform 160ms ease-out;`.
- `scale(0)` entry → use `scale(0.95)` + `opacity 0`.
- `ease-in` on UI effect — feels sluggish; `ease-out` or custom.
- Animations on keyboard-driven actions (search, palette, esc).
- Hover animation without `(hover: hover)`.
- Keyframes on rapidly re-triggered elements (use transitions for interruptibility).
- Framer Motion `x/y` shorthand under CPU load (use `transform: "translateX()"`).
- Heavy blur > 20px in Safari.
- Multiple bouncing entering items at once (do staggering instead).
- Backdrop blur globally on tablet (leave blur out below 768 or under prefetch).
- Gradients for section ground (use solid blue washes, premium look).

---

## 11. Reduced detail-matching to Emil checklist

When reviewing any UI code, check for:

| Issue | Fix |
|---|---|
| `transition: all` | name the exact property |
| `.scale(0)` entry | Start at `scale(0.95)` |
| `ease-in` on motion | switch to `ease-out` |
| `transform-origin: center` on fixed popover | pick trigger origin |
| Motion on keypress | remove |
| Duration > 300ms on dense UI | 150–250ms max |
| Hover motion outside pointer fine | gate behind media query |
| Keyframe on rev trigger | use CSS transition |
| Fast Framer `x/y` under load | use `transform` string |
| Same in=fast exit | exit ~half in, fade before transform |
| Everything appears at once | stagger 30-80ms |

---

## 12. Installation recipe

1. Replace every font link that leads to CDN with variable files `InterVariable.woff2`.
2. Drop `--aid-*` baseline, custom use `--c-*` semantic tokens only.
3. Add runtime CSS (Section 6 tokens) to `tokens.css` and echo custom instrument in `landing.css` with measurement differences if used.
4. Wire `@media (hover: hover) and (pointer: fine)` around all hover states.
5. Audit all keyframe duration & origin variables each deliverable. Use `docs/LH-BASELINE.md` to log no—just results.

If something like this doesn't fix it → think about **content value**, not just translation. The thing moving the needle is the data canvas above the fold and 5-sentence answer of the user manual.<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Created file successfully: projects/local/cloudflare/portfolio/docs/STYLE-GUIDE.md