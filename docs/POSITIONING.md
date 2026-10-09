# Positioning

Status: **decided in shape, one question open.** 2026-10-09.

Companion to `ICP.md` (who buys) and `MANAGED-SERVICES.md` (what it runs on).
This is what you say you are.

---

## The open question

Two businesses are hiding in the current material, and they are not the same one:

| | **A · Spreadsheet-to-platform** | **B · Warehouse specialist** |
|---|---|---|
| Client | 1–5 outlets, no analyst | 10+ outlets, has data, wants better |
| They say | "everything is in Excel" | "our warehouse is a mess" |
| Buys | one project, then a retainer | bigger project, longer cycle |
| Price | Rp 7.5–25jt | Rp 40jt+ |
| Volume | more, smaller | fewer, larger |
| Your `ICP.md` | ✅ this one | ✗ not this one |

`ICP.md` describes **A**. "Data warehouse" language pulls toward **B**.

**Both are legitimate. You cannot hold both as your identity**, because the
word "warehouse" is exactly what makes an A-size client decide you are too
technical and expensive for them.

**Recommendation:** A, with B-grade capability as proof you can handle growth.
Sell to small businesses; show enterprise-grade work so a larger one trust you
when they arrive. That is a coherent story — "I build warehouse-grade systems for
companies that don't have a data team."

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

```
    MIGRATION          →     DASHBOARD + AUTOMATION     →     MANAGEMENT
    the way in               what they get                    the money
    project, scoped          visible, usable                 retainer, quiet
    Rp 7.5–25jt              included in the project         Rp 4jt+/month
```

**Migration is the wedge.** It is the only one of the five where the client
already knows they have a problem, cannot solve it themselves, and can see the
finish line. No education required, which is what makes it cheap to sell.

Then management is where the business actually lives: recurring, compounding,
and the reason a client does not leave.

---

## The problem catalogue

Every problem in the client's own voice, what it costs them, the fix, and
**whether you can already prove it.**

Evidence key: ✅ demo or case study exists · ⚠️ exists but offline in
`apps/admin` · ❌ nothing yet — needs building

### Migration — the way in

| # | The problem, as they'd say it | The fix | Evidence |
|---|---|---|---|
| 1 | "Everything's in Excel and only one person understands it" | Move it onto a warehouse, documented | ❌ |
| 2 | "If that one person leaves, we're stuck" | Same — the handover is the point | ❌ |
| 3 | "We pay someone to re-enter data every month" | Ingest once, transform automatically | ⚠️ `data-lake-ingestion` |
| 4 | "Our old system has nobody who can maintain it" | Rebuild, hand over, document | ⚠️ `databricks-lakehouse` |

### Warehouse — the foundation

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 5 | "Sales are in five places and they don't agree" | One warehouse, one definition | ⚠️ `marketplace-api-pipeline` |
| 6 | "I can't tell which outlet actually makes money" | Store-level margin, not revenue | ⚠️ `kanaya-studio-dashboard` |
| 7 | "Stock counts don't match between systems" | Single source for inventory | ⚠️ `inventory-alerts` |
| 8 | "Month-end is a week of copy-paste" | Automated close, reconciled nightly | ✅ `seller-ledger` |

### Dashboards — what they see

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 9 | "I find out about a bad month three weeks late" | Weekly report, automatic | ✅ `weekly-report` |
| 10 | "Every report is different depending who made it" | One report, one source | ✅ `weekly-report` |
| 11 | "I only see revenue, not whether I made money" | Margin in every view | ✅ `reorder-and-margin` |
| 12 | "The report exists but nobody opens it" | Fewer numbers, flagged decisions | ✅ `weekly-report` |
| 13 | "I can't answer 'how did we do' without an afternoon" | One page, current | ✅ `weekly-report` |

### Automation — the hours back

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 14 | "Someone re-keys the same data every morning" | Scheduled ingestion | ⚠️ `airflow-pipelines` |
| 15 | "Competitor prices change and a customer tells me" | Scheduled price extraction | ❌ |
| 16 | "We stock out on the thing that sells" | Reorder points from actual velocity | ✅ `reorder-and-margin` |
| 17 | "A promotion looked great and lost money" | Incremental lift, not total sales | ✅ `promotion-lift` |
| 18 | "We over-order and it sits for six months" | Dead-stock detection | ✅ `reorder-and-margin` |

### Management — the quiet part

| # | The problem | The fix | Evidence |
|---|---|---|---|
| 19 | "The person who built it left, nobody knows how it works" | Documentation + handover | ⚠️ `pipeline-observability` |
| 20 | "It broke and nobody noticed for a week" | Monitoring, alerting | ⚠️ `pipeline-observability` |
| 21 | "I don't want to hire a data team" | Managed service instead | ✅ `/product/` |
| 22 | "The last consultant built it and disappeared" | Retainer with a stated response time | ✅ `/product/` |

---

## Where the case studies are

**22 problems. 11 proven live. 8 offline. 3 with nothing.**

The gap is not ideas — it is that half your evidence is sitting unpublished in
`apps/admin`.

**The three with no proof are the most valuable to build**, because they are the
ones you would have to turn down or improvise. All three are in Migration and
Automation, which is the wedge:

- **#1 / #2 — spreadsheet migration.** Two rows, one problem. **This is the wedge
  and you have no public proof of it.** Highest priority by a distance.
- **#15 — competitor price monitoring.** Low effort, and the one a marketplace
  seller recognises instantly.

Ranked by what they unlock:

1. **A migration case study (#1/#2)** — without it the wedge is a claim
2. **The 8 offline pages published (#3–7, #14, #19, #20)** — turns
   warehouse capability from assertion into evidence
3. **Competitor price demo (#15)** — cheap, and it is the one a marketplace
   seller recognises instantly
4. **Store-level profitability (#6)** — the question every multi-outlet owner
   asks, and currently only answered by `kanaya-studio-dashboard`

---

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
