# Design tooling — what is installed and when to use it

Added 2026-10-16. Five references were evaluated; three are now installed,
one was already present, one was deliberately skipped.

## Installed

### 1. `design-taste-frontend` — NEW
`github.com/Leonxlnx/taste-skill` · installed to
`~/.config/opencode/skills/design-taste-frontend/`

Art direction drawn from a study of 247 gallery sites. Its
`scripts/draw.mjs --sector <x>` **deals** three of twenty researched
directions instead of letting the model pick the category default. Verified
working: `--sector personal-portfolio` returned "The dark room — charcoal
and sage, Boska, loose scatter".

Use it when: *redesigning from scratch*, or when the page "looks generic /
templated / AI-made". Not for a one-line tweak.

```bash
cd ~/.config/opencode/skills/design-taste-frontend/scripts
node draw.mjs --sector personal-portfolio    # or: finance, saas, agency…
```

Not installed from the same repo: `redesign-skill` (install failed silently
— only one of the two landed), and the v1/v2-experimental legacy variants.
Add later with `npx skills add https://github.com/Leonxlnx/taste-skill --skill "<name>"`.

### 2. `impeccable` — ALREADY PRESENT
`impeccable.style` · `~/.config/opencode/skills/impeccable/`

59 anti-slop checks (`/slop`), commands `polish · audit · typeset ·
distill · layout · colorize · animate · critique · document`, and a
`DESIGN.md` / `PRODUCT.md` convention. Ships a real-browser inspector and
a Chrome extension.

Use it when: *polishing something that exists*, or generating
`DESIGN.md` from the code rather than writing it by hand.

### 3. `emil-design-eng` — ALREADY PRESENT
Motion philosophy: frequency-first animation budget, `ease-out` curves,
interruptible transitions, spring physics only for drag, reduced-motion
rules, and a 10-row review table. Loaded earlier in this session and
applied to the button/hover/stagger work.

Use it when: *anything animates*.

### Also already present
`improve-animations`, `review-animations`, `apple-design`,
`animation-vocabulary`, `web-perf`, `security-audit`, `cloudflare`,
`workers-best-practices`, `wrangler`, `turnstile-spin`, `durable-objects`,
`agents-sdk`, `sandbox-sdk`, `cloudflare-one`, `cloudflare-email-service`,
`cloudflare-one-migrations`.

## Documented, not installed

### 4. `playwright.dev/agent-cli` — for later
A shell-first browser driver built for agents: persistent daemon, ref-based
accessibility snapshots, `screenshot`, `console`, `trace`, sessions.
Install: `npm install -g @playwright/cli`.

Why not now: this session already has an ad-hoc Playwright harness at
`~/tmp/impeccable-review/` (contrast probe, DOM catalog, filter tests) that
covers what we need. The CLI is worth it when the visual work starts — it
would replace the hand-rolled probe scripts with a maintained tool.

Note: `~/tmp/impeccable-review/` contains a stray `re.py` that shadows the
Python stdlib. Delete it before using that directory for anything else.

### 5. `awesome-design-md` — format reference
`github.com/VoltAgent/awesome-design-md` · 84 DESIGN.md files extracted from
real brands, in Google's Stitch format.

**Why this matters:** our `DESIGN.md` does *not* follow that format. It is
prose-plus-tables; the Stitch spec is nine numbered sections:

1. Visual Theme & Atmosphere
2. Color Palette & Roles (semantic name + hex + function)
3. Typography Rules (family + full hierarchy table)
4. Component Stylings (buttons, cards, inputs, nav — with states)
5. Layout Principles (spacing scale, grid, whitespace)
6. Depth & Elevation (shadow system, surface hierarchy)
7. Do's and Don'ts
8. Responsive Behaviour (breakpoints, touch targets, collapse order)
9. Agent Prompt Guide (quick colour reference, copy-paste prompts)

We already have the substance in `DESIGN.md`, `STYLE-GUIDE.md` and
`UI-AUDIT.md` — they are just split across three files and miss sections 8
and 9 explicitly. Rewriting `DESIGN.md` into the Stitch format is the single
highest-leverage thing we could do so that *any* agent (including this one)
reads one file instead of four.

Reference brands worth stealing sections from, given the ICP is small retail
owners: **Shopify** (dark-first + neon accent), **Wise** (friendly +
clarity), **Mercury** (ink-violet + indigo pill), **Mastercard** (warm
cream canvas).

### 6. `img2threejs` — skipped on purpose
`github.com/img2threejs/img2threejs` rebuilds an object from a photo as a
procedural, animation-ready Three.js model. Apache-2.0, agent-agnostic,
installs cleanly into OpenCode via `npx img2threejs@latest install`.

**Not adding it.** A data consulting portfolio has no 3D assets. A hero
Three.js model would add ~150 KB and defeat the "one deliverable in frame"
goal, which is a *dashboard*, not an object. Revisit only if a client sells
a physical object and asks for a configurator.

## Precedence when skills disagree

1. House rules — body copy ≥ 16px, labels ≥ 13px, one button shape, one radius, one page margin
2. Stated brand constraint — neubrutalist grammar on `main` (3px stroke, 0 radius, hard offset shadow, 0 blur)
3. The direction — whichever skill is mid-task
4. Type and palette tokens — `css/tokens.css` is the source of truth, `css/landing.css` overrides for `body.home`
5. `check-structure.mjs` — non-negotiable, runs in `npm run typecheck`

Never let a skill's palette override `css/tokens.css` without a commit that
updates the token file too. That is how the agency/neobrutalist hybrid
happened.

## Current stack decision (unchanged)

No Tailwind. Hand-written CSS, scoped to `body.home` on the landing page.
Modularisation is deferred: see `docs/UI-AUDIT.md` § "30% drift" for the
four components actually worth extracting (`btn`, `card`, `chip`, `input`),
and `docs/FEEDBACK-LOG.md` for the 10 content gaps, which rank higher.