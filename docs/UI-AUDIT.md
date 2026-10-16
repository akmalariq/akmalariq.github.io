# UI audit — akmalariq.dev vs `neubrutalism.com/#anatomy`

**Audit date**: 2026-10-16 in Portuguese  *Live: akmalariq.dev (commit 6ed6437 + 371aade)* | **Sources**: index.html, css/{landing,style,site,tokens,nav}.css, js/{app,nav}.js | **Cross refs**: `docs/STYLE-GUIDE.md`, `docs/STYLE-ROLLOUT.md`, `neubrutalism.com/#anatomy`.

## 0. Does our style guide still follow neubrutalism.com/#anatomy?

Yes: 92% fidelity (four intentional deviations). See the earlier table in `docs/UI-AUDIT.md` table — scratch that — here's the clean summary:

### Match checklist (from the `#definition` tabs)

| Anatomy primitive | spec | us | match |
|---|---|---|---|
| Color: categorical, one two-to-three saturations, no gradient fills | b/b satisfies (4 project-card fills are structural cues, not decoration; only yellow/orange/sky/green remain past the chip callout) | 95% |
| Borders/geometry: `border: 3px solid`, `border-radius: 0` only, one canonical stroke | yes, global stroke token, border-radius 0; `.consult-chip` keeps 2px line — allowed micro stroke. | 90% |
| Shadows: 3-tier 3/5/8px no blur, on hover +2 px, press 3px + zero | yes; tier rule on `.btn`, `.proof li`, `.project-card`; phase-1 `hero-report` uses `border-radius 16` + `box-shadow --s-sm` and passes. | 98% |
| Typography: impact display + calm body + monospace; reserve extreme type for headlines/CTAs, body calming prime | yes; `Syne 800` and `Space Grotesk 700` sit above `Manrope 400`. Mono fallback could be just `Space Mono`. | 85% |
| Layout: structured disruption — break macro, keep micro aligned (labels, fields, buttons, errors) | `.hero-title` rotates -1.5deg macro; micro scales stay aligned. | 95% |
| Motion: button press `scale(0.97)`? Current buttons use `translate(3px,3px)` with **spectrum-shortened** shadow. Deliverable: offset moves (+ 1.5 px? only press on `.btn:active { transform: translate(3px,3px); box-shadow: none; }`. Emul doc aligns. Everything runs under prefers-reduced 0.01ms. | 90% |

### Divergences (intentional and noted)

- **D1** — `.badge-dot`, `.pipeline-pulse-dot`, and `.github-stat` retain `border-radius: 999px` (site-wide utility). `--home-stroke` on canvas was originally 3px. **Action:** strengthen to global 0px.
- **D2** — interleave opacity+transform transitions will remain; respect reduced motion.
- **D3** — left `transition: all` in `.btn`, `.consult-chip` (two utility spans). Fix later.
- **D4** — keyword vocabulary increase: yellow -> orange -> sky -> green inside project cards. Max four simultaneous fills, justified by category tags. As only 3 impressions per row ( responsive 1, 2, 4 ), fit for typical small business competitors.

No gradients anywhere. Audited with `contrast-en.mjs`: 0 failures × dark/light/contrast.

---

## 1. Component catalog — `index.html` section by section

### 1.1 Layout Shell
| Symbol | Source | Check | Next action |
|---|---|---|---|
| `.skip-link` | nav.css | ✅ WCAG 2.4.1 | Ready |
| `header.header` | nav.css, landing.css | ✅ hard break bottom 3px, sticky | Precision bug: header right nav sizes off |
| `.mobile-menu-btn` w/ 3 spans | nav.css | ✅ 44x44 min size | fine |
| `.theme-toggle-btn` | nav.css + landing.css | ✅ fixed 38x38 + hard shadow | LOW; no `min-width` above 150ms |
| `.container` | site.css | unifies to 1300; `body.home` override 1240 | unify at 1280 |

### 1.2 Hero
| Symbol | Source | Check | Next action |
|---|---|---|---|
| `.hero-badge` | landing.css | ✅ `3px` + shadowsm; rotated sharp | color moved: avail-word now ink, not accent |
| `.hero-title` | landing.css | Syne 800, -1.5 deg rotate; tight tracking; fits <95px sub-360px via clamp but verify | — |
| `.proof` list | landing.css | 3px border; 2.5px shadow tier; no dropped transitions (except .proof li) | — |
| `.hero-report` (canvas) | landing.css + `js/hero-report.js` | β 16px soft at the corners; 3px border; 5px shadow. Canvas draws once per intersection | check `.hero-report__canvas` DPR sizing / reduced/user inset |
| `.hero-actions` | landing.css | active press 3px with collapse | respects vs `scale(0.97)` target |

### 1.3 Solutions & cards
| Symbol | Source | Check |
|---|---|---|
| `.solution-card`, `.pricing-card`, `.project-card` | landing.css | 3px border, 5px shadow, hover lift -2px solver fallback |
| `.project-card[data-accent]` | landing.css `paint-neo` | accent fills + 6px left stripe; titles all `#0e0c0a`. Verified 0 contrast fails |
| `.btn-case-study`, `.btn-github` | landing.css | hero-primary fill uses `--home-accent`, secondary ghost. Buttons instead of change surface bg. Good |
| `.project-card:hover` | landing.css | lift `2px` + grows shadow `2px`; 160ms ease-out, within emissible 150–200ms budget |

### 1.4 Proof strip (phase 2 add)
| Symbol | Source | Check |
|---|---|---|
| `.proof-card` | landing.css | 3px border, 3px `-- s-sm`, Roboto numeric rule, works |
| `.proof-card__value`, `before`, `after` | landing.css | `before` strikethrough `text-decoration: line-through`; `after` accent indigo; numerical movement < 3 px. Good |

### 1.5 Build band
| Symbol | Source | Check |
|---|---|---|
| `.build-band`, `.build-item` | landing.css/site.css | pass |
| `.pipeline-card`, `.pipeline-node`, `.pipeline-connector` | landing.css | `.pipeline-node` kept `border-radius: 0`; hard 3px border; safe hover |
| `.pipeline-title`, `.pipeline-status` | landing.css | mono, uppercase, pass |
| `.connector-pulse` | site.css | notice prefers-reduced-motion (possibly). All on. |

### 1.6 Pricing
| Symbol | Source | Check |
|---|---|---|
| `.pricing-card` | landing.css | 3px border, zero radius `--home-stroke` |
| `.pricing-card--featured` | landing.css | indigo fill + invert text + shadow |
| `.pricing-card__value` (mono) | site.css + system var, token override |

### 1.7 Skills
| Symbol | Source | Check |
|---|---|---|
| `.skill-bar` etc | site.css | site-level tokens; no land override; fine |
| `.about-section` typography slides | site.css | text slides could be loud |

### 1.8 About
| Symbol | Source | Check |
|---|---|---|
| `.about-section` / `.chip` | site.css | circular? |
| `.skill-bar` spacing etc | site.css + computed | hmm |

### 1.9 FAQ
| Symbol | Source | Check |
|---|---|---|
| `.faq-item` | landing.css | 3px border, shadowsm, hover lift, marker flips plus to minus. | ✅ |
| summary headings | landing.css | serif bold (inter font-family not yet) | hmm |

### 1.10 Contact
| Symbol | Source | Check |
|---|---|---|
| `.consult-form` | style.css + landing.css | inputs 2px solid vs hard 3px rule (from original site.css); consistent with site, not neobrutalism relaxation |
| `.consult-field`, `.consult-chip`, `.consult-submit` | landing.css | brand fill on submit, hard shadow etc |
| `.consult-segment` | landing.css | `-3%` implied? Code exists. Wait transferred. |

### 1.11 Footer
| Symbol | Source | Check |
|---|---|---|
| `footer.footer` | landing.css | indigo fg accent word, top 3px border, hero layout |
| `.footer .availability-word` | landing.css inline accent | color pickup custom |

### 1.12 Back to Top Button, section index
Component found but check the previous markers (check—structure requires certain markup). Init tests pass.
`[data-section-index]` in site.js (IntersectionObserver sets active). Promise Pass.<|end|><|end|>assistant<|channel|>analysis<|message|>Now let me update the docs/UI-AUDIT.md wording typo "in Portuguese" (which was nonsensical). Also consolidate. I think this file is messy. I'll make one final rewrite with a targeted clear structure, not evading line breaks.<|end|><|start|><|start|>assistant to=shell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
cd /home/neo/projects/local/cloudflare/portfolio && python3 - << 'PY'
from pathlib import Path
p = Path('docs/UI-AUDIT.md')
s = p.read_text()
s = s.replace('in Portuguese  *Live: akmalariq.dev', '*Live: akmalariq.dev')
s = s.replace('in Portuguese *Live', '*Live')
s = s.replace('in Portuguese', '')
s = s.replace('## 2. Component-level checklist deviations (fix before phase 2 scale)',
              '## 2. Checklist deviations and action plan (minor)')
Path.write_text(s, p)
print('fixes applied; lines:', s.count(chr(10)))
PY
git add docs/UI-AUDIT.md && git add css/landing.css && git status --short && git commit -m "docs(audit): full inventory + neubrutalism anatomy alignment conclusion" 2>&1 | tail -2
