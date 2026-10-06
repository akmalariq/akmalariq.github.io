# ICP — segmented

Status: **settled enough to build against.** 2026-10-06. Supersedes §3 of
`ICP-AND-PRODUCTS.md`, which described one profile where there are two.

Built from Salesforce's ICP framework (firmographic · technographic ·
behavioral · pain) applied to the seller you actually are: a solo consultant
selling to Indonesian SMB owners. Two segments, one shared qualification test.

---

## Why two, not three

The obvious split is one segment per demo — weekly report, reorder and margin,
reconciliation. It was rejected: a visitor then has to *recognise their problem
to choose a door*, and someone whose reporting is a mess in a way none of the
three names will leave rather than pick.

The real distinction is not the problem. It is **what is being bought**, and that
has to be asked, not guessed:

| | **Segment A — Track the business** | **Segment B — Make sense of it** |
|---|---|---|
| The situation | Sales live across Shopee, Tokopedia, a POS, and spreadsheets, and nobody can answer "how did we do" without an afternoon | The numbers exist and reconcile badly; someone is blamed for them every month |
| What they buy | A system that runs | Judgement, then a system that follows from it |
| First purchase | Build project | Consulting, software optional |
| Demo that proves it | any — this is the point | any |
| Price shape | Fixed scope, quoted after discovery | Fixed scope or retainer |
| **The real objection** | "Can I trust it?" | "Am I the one being blamed?" |

**A is not a subset of B.** A business can have beautiful reporting and still not
know which products to reorder. B can be a single shop with one spreadsheet and
a monthly argument with the bank. Treating A as "entry level" and B as "advanced"
is the mistake — they are different purchases with different first questions.

---

## The shared qualification test

Everything else is description. These five are the filter, and they come straight
from the four filters in `ICP-AND-PRODUCTS.md` §3 plus technographics.

| Test | Why it is the filter |
|---|---|
| **Someone is named when the number is wrong** | No exposure, no purchase. This is the whole game. |
| **3+ sources disagree** | Platforms, POS, bank, spreadsheets. Disagreement is what creates the work. |
| **A decision rides on it weekly** | Decides whether a project is enough or a standing service. |
| **They cannot staff it** | If they can afford an analyst they will hire, and you are competing with a salary. |
| **They already have the raw data** | Exports, POS, bank statements. You can be useful in week one. If they have nothing, the engagement is research, not delivery — a different, harder sell. |

The fifth is new and it is the sharpest. **No data, no deal.** It converts the
conversations you would otherwise lose two hours into, and it is answered by the
contact form's first field rather than by you.

### Firmographic

- Indonesia. Jakarta or remote — stated on the page.
- SMB: roughly 10–200 staff. Not enterprises, who have a data team already, and
  not solo sellers, where a bad week is not material.
- **Revenue floor is a hard test, not a soft one.** Under about Rp 50 million a
  month in sales, the fee is not worth the disruption. The product page already
  says this and it should stay said: self-disqualification buys credibility.

### Technographic

New, and it is what tells you whether week one is possible.

| They have | Implication |
|---|---|
| Marketplace + POS + bank exports | **Ideal.** You are useful immediately. |
| A POS that exports CSV | Fine. Most common case. |
| Only spreadsheets | Workable, slower, higher setup. |
| Nothing exportable | **Disqualify.** Research engagement, not delivery. |

Instruments named on the page as "starting points, no replacement needed":
Excel exports, SQL Server, POS systems, marketplace reports.

### Behavioural

- Currently hiring or has recently tried and failed to hire an analyst.
- Has been burned by an agency that built something nobody opened.
- Already asked an AI tool and got something that did not survive contact with a
  real month of data.
- Says "reconcile" unprompted.

### Pain, in their words

Not "needs a data platform". The phrases that mean a deal:

- "which store is actually making money"
- "I don't trust the numbers"
- "every month-end is a fight with the bank"
- "the report takes three days"

### Explicitly out

- Wants a dashboard and intends to build it themselves.
- Reporting is already automated and working.
- Looking for a job, a CV, or a reference — the contact form routes these
  separately and they are not ICP.
- Peer freelancers looking to subcontract. Adjacent, different economics.

---

## What this changes on the page

Not yet built. Recording the intent so it is not forgotten:

1. ~~The contact form should ask about data, not identity.~~ **Built
   2026-10-06.** The form now asks exactly three categorical questions —
   *which describes you*, *what can you export today*, *how often does a
   decision ride on it* — and the first two ICP tests (`no data, no deal`, and
   weekly cadence) are answered before a call rather than during one. `company`
   was removed: the exports answer already implies the industry, and it was
   optional text nobody acted on. `docs/FUNNEL.md` explains why `exports: none`
   is counted rather than rejected.
2. **The CTA should name the outcome, not the activity.** "Book a free consult"
   describes what the visitor does. Every segment-A and segment-B visitor wants to
   know what stops.
3. **Do not build one page per segment.** Two asks on one page, differentiated by
   which demo sits under which heading. A separate site per segment is not
   affordable at this traffic.

---

## Rejected, with the reason

- **One segment per demo.** Makes the visitor choose a door before they know which
  door is theirs. See "Why two, not three".
- **Five Salesforce-style segments.** Firmographic splits on revenue band, size
  and industry produce profiles that look thorough and cannot be told apart in a
  20-minute call. Their own guidance is to narrow, not to multiply.
- **Enterprise and public sector.** Real budget, real need, and a six-month
  procurement cycle you cannot survive as a solo consultant. The OJK/BI
  experience is a credibility asset for the *middle* of the market, not a route
  into it.
- **Anyone-segment optimization.** Copy from `cta.gallery` — urgency, "join
  10,000+ happy customers". Zero clients exist. Fabricated proof on a
  Rp 7.5jt consulting offer is worse than no proof.

---

## What would change this

- **Nothing here has been tested against a paying customer.** Every claim is
  reasoned, and the reasoning is written down so it can be wrong.
- The disqualifying threshold (Rp 50m/month) is a guess. The first three real
  conversations will either confirm or destroy it.
- If A turns out to dominate, B collapses into "consulting sold as an add-on"
  and the two-segment model is really one segment with a service line.