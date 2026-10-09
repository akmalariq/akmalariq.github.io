# Positioning

Status: **decided in shape, one question open.** 2026-10-09.

Companion to `ICP.md` (who buys) and `MANAGED-SERVICES.md` (what it runs on).
This is what you say you are.

---

## The open question — resolved

This started as two competing businesses: spreadsheet-to-platform versus
warehouse specialist. **They are not two businesses. They are one business at
three maturities**, and the client climbs the ladder while you stay their
supplier.

```
  1. SPREADSHEETS  →  2. TRANSACTIONAL DB  →  3. WAREHOUSE  →  4. LAKEHOUSE
     in Excel            SQL Server             columnar          object store
     one person          doing double duty      + models          + semi-structured
     understands it      as the report DB       + dashboards      + governance
```

You meet them at whichever rung they are on. That is the whole positioning, and
it removes the contradiction — the same client moves through all of it.

### The stage that matters most

**Stage 2 is the strongest, and it is the one you described second.**

The pattern is common and badly named. A business runs SQL Server, MySQL or
Oracle, and **reports are written directly against it** — the same database that
takes the orders. It works until it doesn't: month-end reports lock tables the
shop needs, history is missing because the table only holds current state, and
nobody can join across systems.

The trade term is "OLTP doing OLAP's job." The client's version is:

> "Our reports run against the same database that takes our orders. That's why
> everything's slow at month-end."

Why it beats stage 1 as the primary target:

| | Stage 1 (spreadsheets) | Stage 2 (DB → warehouse) |
|---|---|---|
| Proof we have | ❌ none | ✅ `data-lake-ingestion` |
| Pain they can verify | they sort of know | they can **test it themselves** |
| Budget | small | already paying DB licences |
| Repeatability | bespoke per client | **same architecture every time** |
| Needs managing after | a database | a pipeline — a real retainer |

**Stage 2 is a product; stage 1 is a project.** The same shape works for every
client who has an operational database: extract → columnar store → models →
dashboards, with production untouched.

And you already built it. `data-lake-ingestion` is SQL Server and MySQL through
ODBC into Iceberg, loaded into ClickHouse for serving. That is the offer. It is
sitting unpublished in `apps/admin`.

### The technical default

**Nightly or hourly extract, not CDC.** Debezium and logical replication are the
correct answer for sub-minute freshness, and almost no SMB reporting needs it.
They cost operational complexity, a replication slot to monitor, and a new class
of failure — for freshness nobody asked for. `data-lake-ingestion` uses
Dagster-scheduled extraction, which is the right default.

Reach for CDC when a client genuinely needs near-real-time and can say why.

---

## The position

**One line, for the client:**

> I move small retail businesses off spreadsheets onto a system that reports
> itself — and then I keep it running.

**One line, for a peer or a technical buyer:**

> I build and operate the data layer behind retail and marketplace operations:
> warehouse, pipelines, dashboards, monitoring.

The first is what goes on the site. The second is what goes on LinkedIn.

**The five capabilities are your checklist, not your pitch.** Nobody has ever
bought "automation". They buy "I stop doing this every Monday".

---

## The ladder

Two ladders, and they answer different questions. Don't mix them up.

**How the client matures** — what they own over time. Defined in
[`PRODUCT-TIERS.md`](PRODUCT-TIERS.md) as the three products:

```
  TIER 1               TIER 2                  TIER 3
  Consolidate     →    Analyse            →    Preserve
  sheets → db          oltp → olap             olap → lakehouse (SCD)
```

**How you sell** — what happens in the first engagement, and what follows:

```
    MIGRATION          →     DASHBOARD + AUTOMATION     →     MANAGEMENT
    the way in               what they get                    the money
    project, scoped          included in the project         retainer
```

**Migration is the wedge.** It is the only one of the five where the client
already knows they have a problem, cannot solve it themselves, and can see the
finish line. No education required, which is what makes it cheap to sell.

**Management is where the business lives** — recurring, compounding, and the
reason a client does not leave.

`PRODUCT-TIERS.md` argues the build order should start at **Tier 2, not Tier 1**,
because Tier 1 is bespoke work wearing a product's clothes while Tier 2 is the
same architecture for every client. Read it before deciding what to build first.

---

## The problem catalogue

Every problem in the client's own voice, what it costs them, the fix, and
**whether you can already prove it.**

Evidence key: ✅ demo or case study exists · ⚠️ exists but offline in
`apps/admin` · ❌ nothing yet — needs building

### Stage 1 — Spreadsheets → a database

*The way in. Cheapest to start, most education required.*

| # | The problem, as they'd say it | The fix | Evidence |
|---|---|---|---|
| 1 | "Everything's in Excel and only one person understands it" | Move it onto a database, documented | ❌ |
| 2 | "If that one person leaves, we're stuck" | Same — the handover is the point | ❌ |
| 3 | "We pay someone to re-enter data every month" | Ingest once, transform automatically | ⚠️ `data-lake-ingestion` |
| 4 | "Our old system has nobody who can maintain it" | Rebuild, hand over, document | ⚠️ `databricks-lakehouse` |

### Stage 2 — the database doing two jobs  ★ primary ICP

*Rows 5–8. The operational database is also the reporting database. The pain is
verifiable — they can run a report and watch it happen — and the fix is the same
architecture every time, which is what makes it a product rather than a project.*

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 5 | "Our reports run against the same database that takes our orders" | Extract to a columnar store; production untouched | ✅ `data-lake-ingestion` |
| 6 | "The site crawls at month-end when finance runs reports" | Separate the analytical workload from the transactional one | ✅ `data-lake-ingestion` |
| 7 | "We only see today's state — there's no history" | Keep every version; query across time | ✅ `data-lake-ingestion` |
| 8 | "Every department queries the same SQL Server directly" | One modelled layer, governed, instead of raw tables | ✅ `regulatory-report-perf` |
| 9 | "Sales are in five places and they don't agree" | One warehouse, one definition | ⚠️ `marketplace-api-pipeline` |
| 10 | "I can't tell which outlet actually makes money" | Store-level margin, not revenue | ⚠️ `kanaya-studio-dashboard` |
| 11 | "Stock counts don't match between systems" | Single source for inventory | ⚠️ `inventory-alerts` |
| 12 | "Month-end is a week of copy-paste" | Automated close, reconciled nightly | ✅ `seller-ledger` |

### Stage 3 — what they see

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 13 | "I find out about a bad month three weeks late" | Weekly report, automatic | ✅ `weekly-report` |
| 14 | "Every report is different depending who made it" | One report, one source | ✅ `weekly-report` |
| 15 | "I only see revenue, not whether I made money" | Margin in every view | ✅ `reorder-and-margin` |
| 16 | "The report exists but nobody opens it" | Fewer numbers, flagged decisions | ✅ `weekly-report` |
| 17 | "I can't answer 'how did we do' without an afternoon" | One page, current | ✅ `weekly-report` |

### Automation — the hours back

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 18 | "Someone re-keys the same data every morning" | Scheduled ingestion | ⚠️ `airflow-pipelines` |
| 19 | "Competitor prices change and a customer tells me" | Scheduled price extraction | ❌ |
| 20 | "We stock out on the thing that sells" | Reorder points from actual velocity | ✅ `reorder-and-margin` |
| 21 | "A promotion looked great and lost money" | Incremental lift, not total sales | ✅ `promotion-lift` |
| 22 | "We over-order and it sits for six months" | Dead-stock detection | ✅ `reorder-and-margin` |

### Management — the quiet part

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 23 | "The person who built it left, nobody knows how it works" | Documentation + handover | ⚠️ `pipeline-observability` |
| 24 | "It broke and nobody noticed for a week" | Monitoring, alerting | ⚠️ `pipeline-observability` |
| 25 | "I don't want to hire a data team" | Managed service instead | ✅ `/product/` |
| 26 | "The last consultant built it and disappeared" | Retainer with a stated response time | ✅ `/product/` |

---

## Where the case studies are

**26 problems. 15 proven live. 8 offline. 3 with nothing.**

Half the evidence exists and is unpublished in `apps/admin` — including the four
rows that are the primary ICP.

**The three with no proof are all in the wedge**, which is the worst place for a
gap to be:

- **#1 / #2 — spreadsheet migration.** Two rows, one problem. This is how the
  ladder starts and there is no public proof of it anywhere.
- **#19 — competitor price monitoring.** Cheap to build, and the one a
  marketplace seller recognises instantly.

Ranked by what each unlocks:

1. **A migration case study (#1/#2)** — without it the first rung is a claim
2. **The eight offline pages published (#3, #4, #9, #10, #11, #18, #23, #24)** —
   turns warehouse capability from assertion into evidence
3. **Competitor price demo (#19)** — cheap, immediate recognition
4. **Store-level profitability (#10)** — the question every multi-outlet owner
   asks, currently only answered by `kanaya-studio-dashboard`

**Note which is *not* on this list:** `data-lake-ingestion` (#5–7) is the single
most valuable case study you own, because it is the primary ICP and it is fully
built. It is offline.

## What this changes

- **`/#solutions` currently has 4 problems.** The catalogue has 22. Not all
  belong on the homepage — but the four there now are not the four best.
- **Reordering the page:** migration first, because it is the wedge. Right now
  it is fourth.
- **Publishing the 9** is now a positioning task, not tidying.

---

## Rejected, with the reason

- **"Data warehouse, management, dashboard, automation, migration" as the
  pitch.** That is your internal checklist. Five nouns a client cannot repeat
  back is not a position.
- **Warehouse specialist (business B).** Real work, real money, and it conflicts
  with `ICP.md`'s strongest filter — *cannot staff it*. Competing with a salary
  means selling to companies that don't have a warehouse.
- **Leading with "AI".** `retail-demand-forecasting-ai` is the weakest hook in
  your evidence set. A shop owner does not have a forecasting problem; they have
  a "how did we do and what do I reorder" problem.

## What would change this

Nothing here is validated against a paying client. The problem list is reasoned
from the retail operations you have seen, not from ten customer interviews. The
first three real conversations should edit this file, not confirm it.
