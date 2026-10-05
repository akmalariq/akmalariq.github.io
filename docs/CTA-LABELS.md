# CTA label unification — deferred, not implemented

Status: **parked by decision, 2026-10-03.** Raised after a pass over
[cta.gallery](https://www.cta.gallery/). Nothing was changed in the HTML.

## Why it was raised

Six conversion points used **three different labels for one action**. A visitor
who remembers "consult" from the hero does not recognise "Book a free
20-minute consult" further down the page as the same thing.

| Page | Label | Location |
| --- | --- | --- |
| `/` | Book a free consult | mid-page CTA band |
| `/` | Book a free consult ×3 | pricing cards |
| `/` | Book a free 20-minute consult | contact section |
| `/` | Book a consult | footer |
| `/demo/` | Book a free consult | primary CTA |
| `/demo/` | Book a consult | inline link |

`Book a consult` also appears in the footer of the case-study pages, `/privacy/`
and `/terms/`.

Useful context already in the copy: every mailto body says **"20-minute"**, and
the pricing sections run under headings like *"The report that builds itself"*
and *"Your data person, on call"*. The specific, short conversation is already
promised everywhere except on the button.

## The blocker

This was deferred in favour of the product question. Selling more calls into a
thin offer set is a traffic problem, not a copy problem. **Fix the label when
there is a product worth labelling.**

Real blocker underneath it: all six conversion paths are `mailto:`. No one can
book without leaving the site. That is worth more than any button wording.

## Options, when it is picked up

| | Label | Note |
| --- | --- | --- |
| A | Book a free 20-minute consult | Already in the copy and subject lines. Zero new claims. Long for a footer row. |
| B | Get a free data audit | Sharper, but promises a deliverable you must produce and deliver inside the call. |
| C | Stop rebuilding the same report | Strongest emotionally, weakest as an instruction. |
| D | Pick for me | → **A**, with the footer deliberately shortened to "Book a consult" as the one exception. |

## Two smaller fixes that ride along

1. **`/projects/` hierarchy** — "Work with me" and "Read the blog →" are
   siblings with equal weight. Demote the blog link to a text link so there is
   one obvious next step.
2. **Use the counts that already exist** — the format filter computes 4 live
   demos / 4 case studies / 8 open source. A line such as *"16 projects. 4 you
   can try, 4 you can read in depth."* turns existing work into a pitch. Real
   numbers, no invented proof.

See `docs/PRODUCT.md` for the product question this was parked behind.
