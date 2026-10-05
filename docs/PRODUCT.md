# Product direction — working notes

Status: **thinking, not decided.** 2026-10-03.

## The idea under discussion

A packaged version of what Akmal already does. The client never touches
infrastructure:

1. Client hands over data — CSV export, marketplace report, bank statement,
   whatever they already have.
2. Akmal sets up the database and the dashboards, on **AWS, GCP or Tencent**.
3. Client gets a login to dashboards they can read, and nothing else.

Sold as a fixed engagement with a recurring hosting/reporting component, rather
than as hourly consulting.

## Why this shape is promising

- **It is the existing skill, productised.** Every case study on the site is an
  instance of it: reconciliation pipelines, replenishment optimisation,
  forecasting, a health dashboard, a DuckDB warehouse. Nothing new to learn.
- **The value is legible to a non-technical buyer.** "Your weekly reconciliation
  runs itself" is a sentence a shop owner understands. "dbt model" is not.
- **It removes the client's largest stated fear.** Hosting, backups, IAM and
  uptime are the reasons small businesses do not attempt this themselves.
- **Recurring revenue is built in.** A hosted dashboard is a subscription; a
  one-off project is not.

## Open questions

### 1. Who buys, and who uses?

These are different people and conflating them is the classic trap.

- **Buyer** — owns the money. Owner, GM, finance lead, ops manager.
- **User** — opens the dashboard daily. Ops, admin, a store manager.

The pitch must speak to the buyer's risk, and the product must survive contact
with the least technical user in the company.

### 2. Which platform per segment?

The "AWS, GCP or Tencent" flexibility is a hedge, and it has a cost: three
toolchains, three sets of failure modes, no shared expertise.

| | Strength | Weakness |
| --- | --- | --- |
| **GCP** | BigQuery + Looker Studio are excellent for this; strongest existing case study (jakarta-geomarketing) | Quota and cost surprises on big loads |
| **AWS** | Largest client familiarity; good for scheduled jobs | Assembling an equivalent stack takes more glue |
| **Tencent / China** | Real requirement for some Indonesian and Chinese-adjacent clients | Least portable, least transferable skill |

Leaning: **pick one primary and one fallback.** Depth beats breadth at this
stage.

### 3. Pricing shape

Not yet decided. The open question is whether it is:

- **fixed setup fee + monthly** — simple to sell, predictable for both sides
- **per-dashboard or per-metric** — scales, harder to explain
- **outcome-linked** — hardest to price, hardest to guarantee

### 4. Delivery and support

- Who ingests the data when a new month of CSVs lands?
- What happens when the client's schema changes and a column is renamed?
- Is there an SLA, and what does it promise?

This is the part that turns a project into a product, and it is the part most
likely to be underestimated.

## The "sell to rich users first" idea

This came up as a strategy: sell to a few wealthy, forgiving clients first to
generate capital and references, then use that to reach everyone else.

The idea has real merit and one serious flaw.

**What is right about it.** Early customers are cheap in the currency that
matters most when you have none: references, testimonials, case studies, and
tolerance for rough edges. Landing three reference clients is worth more than
thirty anonymous ones.

**The flaw.** "Rich users" is not a segment, it is a *price point*. It does not
tell you who has the problem. If the wedge is defined by ability to pay, every
lesson learned transfers to nobody — the customers who cannot afford you teach
you nothing about the customers you want.

Better framing: find the customers who have the problem **and** can act on it
today. Segment by situation, not by wealth:

| Segment | Has the problem? | Can decide alone? | Will pay? |
| --- | --- | --- | --- |
| Marketplace sellers reconciling payouts by hand | Yes | Usually | Varies |
| Multi-outlet retail doing stock counts on paper | Yes | Yes | Varies |
| Small agencies drowning in client reporting | Yes | Yes | Often |
| A company with an ops manager and no data tooling | Yes | Maybe | Often |

The second column is the one to filter on. "Cannot decide alone" is the
failure mode that kills small-business sales, and no amount of price sensitivity
fixes it.

**The real prerequisite** is not capital, it is **one productised instance**.
A demo built on synthetic data cannot be sold. A screenshot cannot be sold. What
converts is a working login on the prospect's *own* data, which is also the
cheapest possible proof that the thing works.

## Where this leaves the site

The site already argues the credibility half of this: the case studies are the
proof, and the lead stat on each card is the evidence. What it cannot do is
argue the product half — there is no product page, no pricing for a packaged
offer, and every CTA points at a mailto.

So the sequence is:

1. Decide the segment and the platform (above).
2. Build one real instance on real client data.
3. *Then* unify the CTA labels and point them at the product.
   See `docs/CTA-LABELS.md`.
