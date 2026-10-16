
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
