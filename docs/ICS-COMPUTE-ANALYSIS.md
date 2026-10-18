# ICS Compute — what they actually do, and what that means for us

Research 2026-10-18. Read from their live site: homepage, `/capabilities/data-platform-engineering`,
`/insights-case-studies`, plus company data.

**Why this exists:** someone read their case study and correctly identified that
akmalariq.dev sells *reports* while ICS sells *foundations*. This is the analysis
of what their business actually is, which parts are copyable, which are not, and
what we already have that we did not know we had.

---

## 1. The business, in their words

Their homepage headline is the entire thesis:

> **"Your data isn't ready for AI yet."**
> *We make it steady, then build AI that learns how your business actually runs.*

They are not an AI company that happens to do data work. They are a **data
company that uses AI as the closing argument.** The sequencing — boring
plumbing first, AI second — is the positioning, and everything else follows from
it.

### The four pillars (delivery method)

| | |
|---|---|
| **Transform** | AI roadmaps, ROI models, data audit, governance framework |
| **Build** | Cloud & platform engineering, **data platform & engineering** |
| **Operate** | Managed cloud & AI ops, DevOps/SRE |
| **Scale** | AI business applications, advanced analytics & MLOps |

### The four layers (what they build)

```
01  AI layer              models, agents, GenAI on Claude, audit-grade
02  Data & integration    Databricks pipelines, ERP/HRIS/CRM connectors,
                           customer-controlled data residency
03  Operations             monitoring, drift management, escalation path
04  Cloud foundation       infra, networking, security, identity, FinOps
```

### The reference architecture (their data platform)

```
SOURCES   →  INGEST  →  LAKEHOUSE  →  SERVE  →  CONSUME
 tx DBs       batch/       tested        curated   dashboards
 SaaS         ELT/         data zone     datasets  models
 files        streaming                  features  workflows
 events

CROSS-CUTTING: governance · lineage · observability · quality checks
               · dataset SLAs · access control
```

Note the last line. **Governance is not a phase — it is a property of the
whole thing.** That is a real engineering opinion, and it is the one worth
stealing.

### Their engineering principles

| | |
|---|---|
| Lakehouse **by domain** | not one giant table that becomes impossible to evolve |
| Pipelines **as software** | version-controlled, tested, reviewed, with dataset SLAs |
| **Reliability before scale** | monitoring and lineage before bigger clusters |
| Controls **inside the workflow** | not left as documentation |
| **Latency must earn its cost** | streaming only when the business SLA needs it |

### The entry point (this is the important one)

> "Start with a platform assessment. Decide the build after."

A low-risk assessment producing a roadmap the client can execute internally
*or with ICS*. They never ask you to commit to a build first.

---

## 2. Their moat — and why none of it is copyable

| Asset | Detail |
|---|---|
| **Partner credentials** | Databricks Delivery Partner · AWS Agentic AI Competency (First in ASEAN) · AWS GenAI Competency (First in ASEAN) |
| **Certifications** | ISO 9001 · ISO 27001 |
| **Scale** | 118 people, founded 2017, Menara Caraka South Jakarta |
| **Buyer tier** | banks, pharmaceuticals, media, healthcare, public sector |
| **Public proof** | 40–73% analytics cost reduction · 52% faster queries · same-day time-to-insight |
| **Procurement eligibility** | certified, staffed, insured enough for a bank's vendor panel |

None of that is available to a solo consultant and none of it is what makes
their *idea* good. **Their idea is: sell sequencing. Data readiness before AI,
governed at every layer, assessed before anyone commits.**

---

## 3. What we already have, and did not know we had

This is the finding that matters. The critique assumed we lacked the proof.
We have it — four published projects that are the ICS thesis, built and
documented, and we were never connecting them to the argument.

| Project | What it actually proves |
|---|---|
| **Spark + Iceberg Lakehouse** | Bronze → silver → gold, **SCD Type 2**, time travel, table compaction, **Nessie catalog**, automated DQ checks driving a report. This is their reference architecture, end to end. |
| **RAG Agent Over the Data Catalog** | An analyst asks the warehouse what a metric means and gets an answer **with the tables cited**. This is the "Genie-style" governed self-service pattern. It already exists. |
| **Agentic Data Quality Pipeline** | An LLM agent that detects and fixes quality issues **against documented business rules, with safe-fix guardrails**. That is governed AI exploration, not a chatbot. |
| **Modern Data Warehouse with DuckDB** | Medallion architecture end to end. |

Two details worth naming precisely:

- **Nessie** in the lakehouse project is an Iceberg REST catalog — the same API
  surface Unity Catalog standardises on. "A catalog, not a spreadsheet of table
  names" is not a stretch claim; it is in a published project.
- **"With safe-fix guardrails"** in the DQ pipeline is the whole governance
  argument in four words. An agent that cannot damage anything is what makes
  AI exploration safe in a regulated shop.

**The gap was never capability. It was narrative.** We were comparing
ourselves to their case studies instead of to their argument, and our own
project grid buried the evidence under a "See my work" heading.

---

## 4. What to take, what to refuse

### Take — free, and it is the whole idea

1. **The sequencing headline.** "Your data isn't ready for AI yet" works at any
   size. So does: *the report is the first workload, not the only one.*
2. **The four-pillar shape** — Transform / Build / Operate / Scale — because it
   shows a method rather than a menu.
3. **The five-stage reference architecture**, simplified. Already live on the
   homepage as the three-layer stack.
4. **Assessment before build.** Already built: `/audit/`, Rp 2,5jt, credited.
   We independently arrived at the same entry point.
5. **Governance as cross-cutting**, not a phase. This is why
   `--home-accent-text` and the assertion language exist in the copy.

### Refuse — copyable in form, fatal in substance

| Do not | Why |
|---|---|
| Claim Databricks delivery partnership | False. We are credentialed on nothing. |
| Name their clients (bank, Genero, ERHA, Vmedis) | Their client work is theirs. |
| Quote their case-study numbers (40–73%, 52%) | Those are their outcomes. |
| Say "ISO-equivalent" or "enterprise-grade compliance" | Aimed at a buyer who checks. |
| Sell to 50–500 employees as the primary target | They already have that buyer. See §5. |

---

## 5. The segment is uncontested, and that is the good news

ICS Compute's smallest named client is an enterprise. Their framing is
banks, pharmaceuticals, media, public sector. **Their minimum engagement is
almost certainly an order of magnitude above ours.**

A three-branch retailer in Jakarta who wants a governed base is not in their
funnel, is not worth their Databricks partner economics, and will never be a
case study on their site.

**There is no cannibalisation risk and no head-on competition.** We are not
taking their client; we are selling to the client they cannot economically
serve. That is the cleanest competitive position available, and it should be
stated plainly rather than disguised.

---

## 6. The plan

### The segment

**Name:** *Data foundation for operators who can't hire a data team.*
**Buyer:** 20–200 employees, 2–5 branches, sales across marketplaces + POS +
accounting, no data team, wants forecasting or self-service in 12 months.
**The wedge:** they have already been told by someone else that this is
expensive.

### The product — Foundation Sprint

Fixed scope, 4–6 weeks. Inherits everything from `/audit/`.

| Delivers | Notes |
|---|---|
| Governed base from 2–3 sources | raw → trusted, layered, on a catalog |
| Quality assertions that fail the pipeline | not warnings in a dashboard |
| Access rules as rules, not shared logins | the line ICS draws, at our scale |
| One workload live | the report, because that is what they need this month |
| A scored roadmap for the next workload | forecasting, replenishment, or self-service |

### The proof — reframe, do not add

The four projects in §3 get promoted from a project grid into the argument,
each attached to the layer it proves. No new case studies required.

### Price — publish the range, publish the scope boundary

A range tied to a stated boundary is a specification. A number with no scope is
a guess.

| Scope | Price |
|---|---|
| 2 sources, 1 workload | Rp 25.000.000 |
| 3 sources, 1 workload + roadmap | Rp 35.000.000 |
| 4+ sources, cross-region, or a second workload | quoted separately |

This is safe because the scope boundary is public: a client who wants more
than the boundary pays more, and a client who wants less is quoting the first
row.

**Do not quote it before the first Sprint is scoped.** Publish the range; the
first quote comes from a real conversation, not from the page.

---

## 7. Sequencing — this does not jump the 90-day plan

`docs/ACQUISITION-PLAN.md` says 90 messages in 90 days for one or two clients.
That is unchanged. What changes:

| Now | After the first build |
|---|---|
| Sell `/audit/` and the Rp 7,5jt build | Sell the Foundation Sprint |
| Frame as three layers | Frame as the four pillars |
| Proof sits in the project grid | Proof attached to each layer |
| `/foundation/` does not exist | `/foundation/` exists, quoted after a real scope |

**The Foundation Sprint is the second act, not the first.** We have never
scoped a governed foundation for a paying client. Publishing the price before
the first delivery is how you discover it takes 200 hours.

But the **narrative** change ships now, because it is free and it costs
nothing to be true early:

> The report is the first workload. The base is what you keep.

---

## 8. The one-paragraph version

ICS Compute proved that governed data foundations are worth more than the
dashboards built on them, and built a 118-person ISO-certified firm around that
insight selling to banks. We take the insight — sequencing, governance as a
cross-cutting property, assess before build — and sell it to the operator
ICS Compute cannot economically serve, for one-fifth of the money, with the
person who does the work being the person you talk to.

Their moat is credentials and procurement eligibility. Ours is price, speed,
and the absence of an account manager. **They cannot follow us down and we
cannot follow them up.** That is not a weakness in the plan; it is the plan.