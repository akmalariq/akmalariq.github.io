# Rollout Plan — akmalariq.dev → "Data Canvas" (interactive reporting hero)

**Owner policy:** one phase per session. Branch off `main`, ship, measure, don't merge if KPIs regress.
**Strategic frame** (from decision log): our ICP (small retail) starts the day with messy spreadsheets. Positioning line: *"I move small retail businesses off spreadsheets onto a system that reports itself — and then I keep it running."* The site must **look like the deliverable**, not like a CV — the hero shows *their* report, not our tools or stile.

**Aesthetic decision**: "data canvas" = editorial restraint + a single interactive chart as hero + numbered proof blocks, warm cream + indigo + coral-lime accents. **Not** brutalist-neobrutalist (too loud); **not** agency-corporate (too generic). Funnel safe, focus-first.

**Branch layout**
- `main` = production live (neobrutalist committed 80bb8ae)
- `design/agency-aidigital` = AI-Digital–flavored candidate (reference)
- `design/neobrutalism` = snapshot of neobrutalist for rollback
- All rollout work sits under `design/<phase-name>`; each phase ends as its own commit/tag + Preview URL + measurement (see § Phases).

---

## Definition of Done for the whole rollout
- [ ] Cool Ray Lighthouse: LCP ≥ 90, CLS ≤ 0.02, TBT ≤ 200 ms
- [ ] 0 contrast failures across 24 selectors × 3 themes (probe in § Measurement)
- [ ] Hero renders an interactive dataset (HTML canvas, no screenshot) in < 1.5 s on 4G
- [ ] Contact form completion ≥ 0.5 % of sessions
- [ ] Bounce < 50 % on first screen, scroll-to-bottom ≥ 50 % within 21 days
- [ ] No regression in GA4 `page_view`/`scroll` events from the last 30 days

---

## Style guide (the single source of truth — edit here first, then CSS)

### 1. Color (use tokens; never two warm accents on one view)

| Token | Hex | Role |
|---|---|---|
| `--c-bg` | `#faf7f1` | page ground (warm bone) |
| `--c-bg-2` | `#f3f0e7` | hero band / card surface 2 |
| `--c-fg` | `#14222f` | warm carbon text (not pure black) |
| `--c-muted` | `#59544e` | secondary sentences |
| `--c-muted-lt` | `#8c847a` | fine print, mono labels |
| `--c-line` | `#e5e1d6` | dividers & hairlines |
| `--c-brand` | `#1b3e8d` | indigo: links, number blocks, focus ring |
| `--c-accent` | `#d37a32` | coral/baked-amber — **only** the actual "delivered report" badge |
| `--c-lime` | `#b9ed65` | "report landed this morning" state |
| `--c-neu` | `#eae6de` | neutral deep |
| `--c-neu-lt` | `#aeaa9e` | neutral ramp stop |
| `--c-white` | `#ffffff` | pure white |

**Dark theme equivalent** (carries identical mechanical grammar)
- `--c-bg → #0f0f1b`, `--c-bg-2 → #1a1a2e`, `--c-fg → #f6f6fb`, brand → `#6c89fd`, muted → `#a0a0b6`.

Rules: (1) no other warm accent next to amber; (2) no gradient hero backgrounds.

### 2. Typography (two faces only)
- **Display + body**: Inter Variable (300–800, `opsz 14..32`). Replace the existing Google stack only in Phase 1 of this plan.
- **Numbers**: JetBrains Mono 500.
- Scale: 13 / 14 / 16 / 18 / 20 / 28 / 36 / 56 px (tokens `--t-xs` … `--t-xxxl`).
- Line-height: body 1.65, display 1.1–1.2.
- `font-feature-settings: "tnum"` only on numeric blocks.

### 3. Spacing
4 px base. Ramp: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.

### 4. Radii & motion
- `r-sm 6px`, `r-md 12px`, `r-lg 18px`, `r-pill 999px`.
- Animations ≤ 240 ms; transform / opacity only; honour `prefers-reduced-motion`.
- Focus ring = exactly **`0 0 0 3px #1b3e8d`**.
- One reveal per scroll view; never two at once.

### 5. Component contracts
- Primary button: indigo fill, white text, pill radius, 44px height, padding 12×20.
- Secondary button: transparent bg, 1px indigo outline, inverse on hover.
- Chip: 26px tall, padding 0 10 px, status dot with color; functional states: `.is-live` (lime), `.is-stuck` (amber), `.is-error` (coral).
- Card: 1px border + radius 18 + padding 20–24; hover lifts exactly 2 px (no shadow growth past 1 level).
- "Report landed" badge: lime fill + `#14222f` text + 10 px dot.
- Number block (the hero piece): mono, 32–44 px, tabular-num, indigo, with weak tinted track behind; label at `.t-sm` underneath.
- Input: 16 px padding, indigo border on focus + 3 px ring, no animated easing.

### 6. Micro-copy rules
- Headlines ≤ 10 words, benefit → mechanism → proof.
- Lead with units: "2 hrs of Tuesday → 20 min" not "We save time."
- Numbers always in mono tab-nums. Section labels in micro ALL CAPS (0.06–0.1em tracking).
- Use the positioning line as a usable quote — it must be literally findable via search and the sentence above the fold.

### 7. Accessibility non-negotiables
- Breadcrumbs/step row on every case study (visitor → problem → proof → handover).
- "Active" page marked with `aria-current="page"`.
- Hero contains `<H1>`, then `<h2>` text for narrative (currently loose `<span>` islands).
- Contrast: non-negotiable 4.5 : 1 text / 3 : 1 UI — that's what the probe verifies at every phase.

---

## Phases (each 1–3 days; ends with a Preview URL + KPI measurement)

Task checklist syntax: each phase finishes when every box is `[x]` and the Preview URL is linked in the PR. Never more than one active rollout branch at a time.

---

## Phases (one per session; each checkbox = 30 min)

Branch habit: `git switch -c design/phase-N-<slug>` from `main`. Each branch must end with Preview URL + measurement in the PR description. Keep only **one opinion live at a time**.

### Phase 0 — Baseline measure (1 day)
Goal: know what's broken before touching the design.
- [ ] Open GA4 → Reports → Engagement → path screenshots → save as `docs/baseline-*`.
- [ ] kDevTools: cap to 10 Mbps / 150 ms delay, record **LCP**, **CLS**, **TBT** for `akmalariq.dev`.
- [ ] Voice-call 4 cold recipients: "What did you understand about me in 5 seconds?"
- [ ] Write `docs/BASELINE-2025.md`: four lines, one per recipient.
- [ ] Commit baseline doc.

### Phase 1 — Hero = "their data" (3–4 days)
Branch: `design/phase-1-data-canvas`
- [ ] Branch from `main`.
- [ ] Keep theme selector strategy untouched (`html[data-theme]`).
- [ ] Replace type stack: Inter Variable only. Self-host `InterVariable.woff2`, 60 ms budget, link-rel preload.
- [ ] Build `public/hero-data.json` (12 retail rows <= 8 kB), render to `<canvas>` after in-view via `IntersectionObserver`; fallback 60 ms later.
- [ ] Write H1 (≤ 10 words), benefits → mechanism → proof.
- [ ] Primary CTA "Get a free audit →", secondary "See my work".
- [ ] Remove all shadows beyond `--s-sm`; motion ≤ 240 ms.
- [ ] Deploy Preview, share to 2 clients, 5-second task.
- [ ] Commit.
- [ ] Acceptance: Lighthouse drops ≤ 10; contrast probe 0 failures; hero canvas rolls in < 1.5 s on 3G.

### Phase 2 — Numerical proof & "second brain" (3–4 days)
Branch: `design/phase-2-proof`
- [ ] Three scrolly breakouts: (a) live KPI delta card, (b) naive-vs-fixed SQL diff, (c) weekly coefficient strip (3 bars).
- [ ] "Report landed" sage on intersection (what just shipped): 2.4 k rows reconciled; 12 % faster; 3 mails.
- [ ] Case studies as horizontal cards with a number **first**, title second, aspect ratio 3/2.
- [ ] `font-feature-settings: "tnum"` on all mono numbers.
- [ ] Deploy Preview; record sessions; ask "any jargon?"
- [ ] Acceptance: GA4 shows 60% scrolled; bounce from hero to FAQ is < 1.

### Phase 3 — "Now what?" portal + frictionless lead gen (2–3 days)
Branch: `design/phase-3-leads`
- [ ] Section asks the visitor which Excel (sheet names like `Sales`, `Inventory`, `Returns`) they forward.
- [ ] Form micro-copy: "Forward your first 3 tabs. We reply in 2 hours with a sample report + 2 paragraphs. No phone number required."
- [ ] Required fields: `Company`, `Question (one sentence)`.
- [ ] Optional: screenshots (`PNG ≤ 2MB`) of their Excel sheet.
- [ ] Webhook hits the same Telegram bot already in `kanmo-orchestration/.env`.
- [ ] Add price anchor copy: "Typical project 2–8 weeks, kickoff this week."
- [ ] Acceptance: ≥ 3 qualified submissions in the first week.

### Phase 4 — Accessibility & polish (2–3 days)
Branch: `design/phase-4-a11y`
- [ ] Contrast probe 24 selectors × 3 `data-theme` (script below): any failure → shade.
- [ ] Alt text audit (decorative → `aria-hidden` + empty `alt`).
- [ ] Keyboard: skip link first, visible focus ring on all actionable within 150 ms, Tab order sensible.
- [ ] `prefers-reduced-motion`: no transitions above opacity 0↔1.
- [ ] Animator capped so CLS ≤ 0.02.
- [ ] Open PR bugs list, close each.
- [ ] Acceptance: 0 contrast failures; CI output reports 0 a11y barriers.

### Phase 5 — Visual polish & launch (1–2 days)
Branch: `main` (merge after smoke test)
- [ ] Run Lighthouse CI (`npm run lhci`).
- [ ] Ship AVIF + JPEG fallback; compress CSS to ≤ 30 kB.
- [ ] Run `preflight-secrets.mjs`.
- [ ] Switch main branch + deploy.
- [ ] Post-launch message + share GA4 dashboard to the staging watcher.
- [ ] Acceptance: Lighthouse ≥ 90 / all metrics.

---

## Measurement (run at every phase gate)

- **Tool**: Playwright + contrast probe borrowed from `measure.mjs` (at `/home/neo/tmp/impeccable-review`).
- **Selectors**: `body, .hero-title, .hero-subtitle, .hero-badge, .btn-primary, .btn-secondary, .section-title, .solution-card, .project-card, .process-step, footer, h1, h2`.
- **Run**: `URL=https://design-phaseN.akmalariq.pages.dev node docs/check-contrast.mjs`.
- **Thresholds**: hero 4.5 : 1, UI 3 : 1.
- **Smoke test**: `npm run check:structure && node scripts/build-site.mjs` both emit zero.
- **Baseline queries load time: 5–15× slower with simulated 3G.

## Rollback

Every phase ships a tag: `git tag phase0-baseline, phase1-canvas`, …

Revert quickly:
```bash
cd /home/neo/projects/local/cloudflare/portfolio
git checkout main HEAD  # or reset to any tag
git push origin main --force-with-lease
npm run check:structure && node scripts/build-site.mjs
npx wrangler pages deploy dist --project-name akmalariq --branch main
```

Review how Cloudflare preview-C names: nytrump points to `docs/PREVIEW-URLS.md`.

## Post-rollout (ongoing)
- Iterate on copy via single issue per week; keep fixing worst font-size or interactions in `docs/STYLE-ROLLOUT.md`.
- If new style is needed: first branch off this guide, *then* style override.
- Maintenance check every two weeks: 500 blobs less, 0 race-conditions, import axis matches a documented stale-state.
