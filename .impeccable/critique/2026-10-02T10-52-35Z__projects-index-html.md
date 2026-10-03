---
target: "the /projects/ page (https://akmalariq.dev/projects/)"
total_score: 21
max_score: 28
na_heuristics: 7,9,10
p0_count: 1
p1_count: 3
p2_count: 1
target_identity: "file:/home/neo/projects/local/cloudflare/portfolio/projects/index.html"
target_fingerprint: "sha256:fc2eeac3579badee28e6534d68e607b1d7b55b675e98da4af764f2c5f054decd"
target_path: /home/neo/projects/local/cloudflare/portfolio/projects/index.html
timestamp: 2026-10-02T10-52-35Z
slug: projects-index-html
---
Method: dual-agent (A: ses_f03d67071ffeO3arTcsK2smKK · B: ses_f03d67017ffeO24dCoOyrOoOyl)
B was truncated twice at the step ceiling; contrast and filter-correctness evidence was completed in the parent context. Overlay injection blocked by site CSP (no unsafe-eval), so the detector WebAssembly core cannot compile and no user-visible overlay exists.

Target: https://akmalariq.dev/projects/ (resolved: projects/index.html)
Mode: Experience

## Design Health Score — 21/28 (Good, 75%)

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Count text is the only filter feedback |
| 2 | Match System / Real World | 3 | Kicker uses recruiter vocabulary |
| 3 | User Control and Freedom | 3 | No reset affordance; filter state lost on refresh |
| 4 | Consistency and Standards | 3 | Index and homepage promise the same thing, deliver differently |
| 5 | Error Prevention | 4 | No destructive actions; noscript fallback present |
| 6 | Recognition Rather Than Recall | 3 | Format only discoverable by reading the button label |
| 7 | Flexibility and Efficiency | n/a | No power-user path exists |
| 8 | Aesthetic and Minimalist Design | 2 | One image card among 16 text-only reads as a leftover |
| 9 | Error Recognition and Recovery | n/a | No user-recoverable errors |
| 10 | Help and Documentation | n/a | Self-evident surface |

Applicable max 28 (three scored n/a: 7, 9, 10).

## Design Specificity
Authored, not category-interchangeable. Real numbers in copy (68,706-row star schema,
44.8% lower MAE), format filter answering try/read/clone, three type voices in three lanes.
Goes generic in card anatomy: hero and 15 regular cards structurally identical.

## Deterministic scan — 5 findings on projects/index.html, 81 across projects/
- cramped-padding (projects section): FALSE POSITIVE. Real padding 80px/128px; rule fired on padding-left/right: 0.
- cramped-padding (cta-band__inner): FALSE POSITIVE. Real padding 36px.
- dark-glow (#10b981): genuine in stylesheet, static evidence only.
- radial-halo (#2e220b): genuine in stylesheet, static evidence only.
- all-caps-body (48 chars): UNVERIFIED, detector reported line:0 with no element.
- skipped-heading on case-study sub-pages corroborates the h1->h3 finding.

## Evidence highlights
- Contrast PASSES WCAG AA in both light and dark: lede 6.81, description 6.24, kicker 6.24,
  tag 6.81, filter 5.95, count 4.66, media badge 4.55, title 16.29. Strongest aspect of the page.
- Filter correctness: painted == notHidden in all four states, both themes (16/5/3/8).
- Filter pills 27.2px tall (FAIL vs 44px house standard and WCAG 2.5.5); card buttons 45.7px pass.
- Card heights distinct: 264.6, 293; hero 414.5. Ragged rows.
- Mobile 390x844: first card top edge y=459px in 844px viewport; hero below fold.
- 54 anchors/buttons, zero missing accessible names; 3 icon-only controls have aria-label.
- Heading order: h1 -> 16x h3, no h2.
- Dead CSS confirmed: .project-stats/.stat-label/.stat-value at site.css:246-261 never referenced by app.js.

## Priority Issues
- P0 First viewport sells the wrong promise. Hero is Dompet (consumer money manager) while the
  lede claims data platforms. Fix: promote Jakarta Retail Site Selection or Dashboard Factory.
- P1 The numbers that would sell the work are never rendered. 4-8 stats per project in
  data/projects.json, CSS already written, renderer never emits them.
- P1 Filter pills fail target size at 27.2px. Fix: padding 0.5rem 0.9rem.
- P1 Ragged grid rows (264.6/293/414.5). Fix: grid-auto-rows 1fr + line-clamp.
- P2 Document outline skips a level (h1 -> h3). Fix: grid h2 or promote card titles.

## Persona Red Flags
Jordan (first-timer): hero answers the wrong question; format only readable from button labels;
no outcome metric ever surfaces.
Casey (mobile): hero below fold at y=459/844; 27.2px filter pills.
Sam (screen reader): h1->h3 gives no section structure; tag cap of 3 hides that 8 exist.

## Minor Observations
- jakarta-geomarketing has demo === caseStudy URL, so the primary button reads "Open live demo"
  while pointing at the case study, and the secondary button is suppressed.
- Filter state not in URL; refresh and Back lose it.
- Retracted: footer year is NOT hardcoded (js/nav.js:105 initFooterYear uses new Date()).
- noscript shows 6 cards, JS shows 16.
- Reveal stagger covers cards 1-4 only.
- Tags look interactive and are not.

## Questions to Consider
1. The page has no authorship above the fold; one sentence in the author's voice.
2. Make format buckets sections rather than a control.
3. Open with depth (one screenshot) or breadth (range)?
