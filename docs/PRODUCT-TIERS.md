# Product tiers

Status: **structure agreed, build order contested.** 2026-10-09.

The ladder in `POSITIONING.md` (stages 1–4) describes how a client matures.
This document turns it into **three products you can sell separately.**

---

## The tiers

```
  TIER 1            TIER 2                    TIER 3
  Consolidate   →   Analyse              →   Preserve
  sheets→db         oltp→olap                 olap→lakehouse
                                                (SCD complete)
```

Each is a **separate sale.** Each stands alone. A client can buy Tier 1 and stop,
and still be better off — that is the rule that keeps the ladder from becoming a
trap.

---

### Tier 1 — Consolidate

*Spreadsheets into a database people can share.*

| | |
|---|---|
| **They say** | "Everything's in Excel, and only one person understands it" |
| **What I do** | Model it as tables, import it, document it, back it up |
| **What they get** | A database several people can use, that survives someone leaving |
| **Runs on** | PostgreSQL (PostgreSQL License — permissive, nothing to comply with) |
| **Roughly** | the entry price |
| **Managed** | hosting, backups, restore |

**The honest weakness:** this is the least productisable tier. Every client's
spreadsheets are shaped differently, so it is bespoke work dressed as a product.
The deliverable is consistent; the effort is not.

---

### Tier 2 — Analyse  ★

*Their operational database stops doing two jobs.*

| | |
|---|---|
| **They say** | "Our reports run against the database that takes our orders" |
| **What I do** | Extract → columnar store → models → dashboards. Production untouched. |
| **What they get** | Fast reports, no impact on the shop, one definition of a number |
| **Runs on** | ClickHouse + dbt + Dagster + Superset — **all Apache-2.0** |
| **Roughly** | the main project price |
| **Managed** | pipeline health, freshness, dashboard support |

**This is the product.** The architecture is identical for every client with an
operational database: extract on a schedule, land it columnar, model it in dbt,
serve it in Superset. The names change; the shape does not.

**Proof already exists** — `data-lake-ingestion` is exactly this, SQL Server and
MySQL through ODBC into Iceberg into ClickHouse. It is unpublished.

---

### Tier 3 — Preserve

*Every version of every record, queryable as of any date.*

| | |
|---|---|
| **They say** | "A number changed last quarter and nobody can tell me why" |
| **What I do** | SCD Type 2 dimensions, Iceberg tables on object storage |
| **What they get** | Full history, audit trail, point-in-time queries |
| **Runs on** | Apache Iceberg + object storage + ClickHouse |
| **Roughly** | the premium project price |
| **Managed** | lakehouse operations, retention, restore-to-date |

**SCD complete** is a precise promise, and it is worth spelling out because
almost nobody selling to SMBs makes it:

- every dimension row carries `valid_from` / `valid_to`
- a change creates a new version rather than overwriting the old one
- a fact row points at the dimension **version** that was true when it happened
- therefore `SELECT … WHERE '2026-03-15' BETWEEN valid_from AND valid_to` works

Most small-business reporting overwrites. Ask "what did this customer's
address look like when that order shipped?" and the answer is gone. **This is
the tier where the data becomes an archive instead of a snapshot.**

It is also the tier that only sells when a client has already been burned once —
which is why it sits at the top and not the bottom.

---

## Build order — where I disagree

**You said start with Tier 1 because it is small. I'd start with Tier 2.**

Tier 1 *feels* small. It is not repeatable, and repeatability is what makes
something a product rather than a project:

| | Tier 1 | Tier 2 |
|---|---|---|
| Inputs | every client's own chaos | SQL Server / MySQL / Oracle |
| Work per client | bespoke modelling | same pipeline, different names |
| Proof you have | ❌ none | ✅ built |
| Budget | smallest | already paying DB licences |
| What remains to run | a database | a pipeline — a real retainer |

**Tier 1 is where the ladder starts; Tier 2 is where the product is.**

The counter-argument, and it is real: Tier 1 is the cheapest thing for a nervous
client to say yes to, and a client who buys Tier 1 is a client who later buys
Tier 2. That makes Tier 1 a **lead magnet**, not a product line.

**So: build Tier 2 as the product, price Tier 1 as the way in, and only build
Tier 3 when someone has asked for it.** Building all three at once means three
things to maintain and no customer.

---

## Naming

The tier names are for you. A client should never hear "Tier 2".

| Internal | What you say to them |
|---|---|
| Tier 1 | "Get off spreadsheets" |
| Tier 2 | "Reports that don't slow the shop down" |
| Tier 3 | "Every version of your data, forever" |

---

## The rules that keep this honest

1. **Each tier stands alone.** If Tier 1 only makes sense as a step to Tier 2,
   it is not a tier, it is a sales funnel.
2. **Never sell up on the first call.** Tier 3 to a business that has not been
   burned is a solution to a problem they do not believe they have.
3. **The managed service wraps every tier.** That is where the recurring revenue
   is, and it applies at all three.
4. **Pin the versions.** Every component is permissively licensed today
   (`MANAGED-SERVICES.md`); pinning means a vendor relicence cannot reach
   production.

---

## What is a guess

- **All three price bands** are inferences from the numbers already on the site,
  not from a customer.
- **Whether Tier 3 sells at all** in the Indonesian SMB market is unproven. It
  is the tier most likely to be technically correct and commercially wrong.
- **The build order is an argument, not a finding.** It weighs repeatability
  over the client's natural entry point. If Tier 1 leads start arriving, that
  judgement was wrong and should change the same week.

---

## Addendum 2026-10-16 — the low-ticket front end

`/audit/` is not a new tier. It is `docs/RUNBOOK-SAMPLE-DELIVERY.md` **with a
price on it.**

| | Free sample | Paid audit | The build | Managed |
|---|---|---|---|---|
| Where | `/sample/` | `/audit/` | `/#pricing` | `/product/` |
| Your data | no | **yes** | yes | yes |
| Price | free | Rp 2.500.000 | Rp 7.500.000 | from Rp 4jt/mo |
| Effort to deliver | — | **3.75 h first, ~1.5 h after** | 2–3 weeks | recurring |
| Credited forward | — | yes, within 30 days | — | — |

**Why this is the product, not a product build.** `PRODUCT-TIERS.md` above
argues Tier 2 is the product because its architecture repeats. That is still
true — but the *first* sale does not come from Tier 2. It comes from the
audit, which is three and three-quarter hours of the runbook you already
wrote.

**Why it is not free.** A free audit is a sales call costing 3.75 hours, and
"free" filters for people with no commitment rather than people with no money.
A paid audit filters with money, in the buyer's favour — someone who will not
pay Rp 2.5jt will not pay Rp 7.5jt, and both of you learn that cheaply.

**The refund is seven days, not thirty.** A longer window gets used by people
who want the analysis for free. Seven days is enough for a careful buyer to
read it and talk to their partner.

**What this unlocks.** Paid acquisition only works when the CAC fits under the
entry price. At Rp 2.5jt an audit can carry acquisition; at Rp 7.5jt a build
cannot. That is the whole argument, and it is arithmetic rather than taste.

**Still not built, and deliberately:** a self-serve SaaS product. See §Rejected.
