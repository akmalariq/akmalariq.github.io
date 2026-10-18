# Credibility plan — competing as a solo IC

Written 2026-10-18. Follows `docs/ICS-COMPUTE-ANALYSIS.md`.

---

## The problem this solves

A three-branch retailer in Jakarta is choosing between:

| | ICS Compute | You |
|---|---|---|
| Who you actually talk to | an account manager, sometimes a subcontractor | the person who writes the pipeline |
| Verifiability | "118 people, ISO 27001, Databricks Partner" | ??? |
| Who is accountable if it breaks | a contract, an SLA, a legal entity | you, by name, in your inbox |
| Price | five figures and up, minimum | Rp 7.500.000 |
| Smallest client they will take | an enterprise | one branch |

Every row except "who you actually talk to" looks like they win. So the
entire credibility plan is about converting **checkability** into the thing
they are selling with badges.

---

## 1. How an IC is credible: replace credentials with verifiability

A firm is **opaque**. You cannot audit 118 people, an ISO certificate, or a
partner agreement. You take it on faith.

An IC is **checkable**. Everything about them can be verified in ten minutes,
in public, by a stranger. That is a genuine structural advantage — but only
if the ten minutes actually work, and right now they do not, because the
site sells *services* and not *evidence*.

### The credibility stack

| Layer | What a firm offers instead | Cost to us |
|---|---|---|
| **1. Named references** | 118 colleagues you will never meet | Free. The single highest-value asset. |
| **2. Checkable work** | portfolio under NDA | Free. Already exists — 17 published projects. |
| **3. Live, pokeable artifacts** | "schedule a demo with our team" | Hours. Highest conversion lift on the whole site. |
| **4. Published thinking** | whitepapers gated behind a form | Hours. Compounds for years. |
| **5. Transparent delivery record** | references to unnamed clients | Free. Needs publishing. |
| **6. Personal accountability** | corporate indemnity | Free — this is the one they structurally cannot copy. |

We win on 1, 2, 5 and 6. We must *build* 3 and 4.

---

## 2. The gap, measured

| Asset | State | Verdict |
|---|---|---|
| Projects published | 17, all with descriptions and flow diagrams | **Strong. Unused as proof.** |
| GitHub links | 10 on the homepage | Strong where it exists |
| Live demos | 4 (`/demos/`) | **Good. Under-promoted.** |
| **Named references** | **zero** | **The single biggest gap.** |
| Testimonial slots | 2 on the site, both `hidden` | Dead markup — see §3.1 |
| `TESTIMONIAL_STRATEGY.md` | **referenced in HTML, does not exist** | Dangling reference. Fix. |
| Offline case studies | 8 in `apps/admin`, unported | Unexploited proof, incl. the lakehouse |
| Blog posts | 5 | Thin for "practitioner worth reading" |
| "Who is named when the numbers are wrong" | no client named anywhere | The ICP filter is invisible to a buyer |

**The summary:** the evidence exists and is scattered; the argument that
connects it does not. That is a writing problem, not a work problem.

---

## 3. What to do, in order

### 3.1 Fix the dangling reference — today, 2 minutes

Two hidden `<figure class="testimonial">` slots point at a strategy doc that
was never written. Either write it or remove the reference. Leaving a
comment pointing at a nonexistent file is exactly the kind of slop
`DESIGN.md` §7 bans.

### 3.2 Get one named reference — the highest-value hour of this plan

Not five. One. A person who will take a phone call from a stranger.

Who: a former colleague, a manager, a client, a Kanmo teammate — anyone who
can say *"yes, I worked with Akmal, here is what he delivered and here is what
he was like when it broke."*

Ask:

> I'm putting my name and my work in public and I'd like one honest reference on the site — name, role, and one sentence about working with me. If you'd rather not, that's completely fine.

**Rules.** Consent in writing, name and company only with explicit permission,
and never a quote you edited. A soft quote from a real person converts; a
perfect quote from nobody reads as a lie. If you cannot get one within 30 days,
delete the slots rather than leaving them hidden — hidden slots are a promise
you did not keep.

Then remove `hidden` from exactly one slot, not both. One real quote reads as
a person with a reference. Two identical quotes read as a template.

### 3.3 Promote the proof out of the grid — the ICS argument

Four projects already prove the foundation thesis (`docs/ICS-COMPUTE-ANALYSIS.md` §3). Attach each to the layer it proves rather than leaving them alphabetical:

```
Layer 01 · the governed base   ← Spark + Iceberg Lakehouse
                                     RAG Agent Over the Data Catalog
Layer 02 · the reporting layer ← Agentic Data Quality Pipeline
Layer 03 · the decision layer  ← Demand-Driven Replenishment Optimization
```

No new case studies required. Same four projects, different grammar.

### 3.4 Port the eight offline case studies — the real moat

`apps/admin` holds eight case studies that have never been public. Among them
is the Databricks lakehouse — the one project that lets you speak credibly
about governance without overclaiming.

Porting is a day or two and it converts *"I know this stack"* into *"here is
what I built."* **Do it before writing a single new sentence about Unity
Catalog.**

### 3.5 Publish the delivery record — the account nobody else has

ICS Compute publishes outcome percentages. You can publish something they
structurally cannot: **the honest ledger.**

```md
| Engagement | Duration | Outcome | Still running? |
|---|---|---|---|
| Retail, 3 branches | 3 weeks | reconciliation 4h → 20 min | yes, 14 months |
| F&B, 11 stores    | 2 weeks | month-end on day 3 | yes |
```

Including a client that churned, or a project that did not land, is what
makes the successes readable. An IC's credibility is *boring transparency*,
because a firm will never publish a churned account.

### 3.6 Write about what you can see and they cannot

The blog has five posts, all on infrastructure topics that compete with a
firm's whitepapers. Wrong fight.

Write about **the things only a solo operator sees**:

- What a shop owner's month-end actually looks like at 3am
- Why the platform's total disagreed with the marketplace's, in four specific causes
- The week you told a client their data was fine and they spent money anyway
- What Rp 7.500.000 buys and what Rp 250.000.000 buys, honestly

None of this is gated, credentialed, or reproducible by 118 people. That is
the point.

### 3.7 Make the demo the argument

`/sample/` is the credibility asset and it is linked from the hero only.
Add: a 60-second walkthrough on the homepage using `/sample/`, and one line
naming what is synthetic and what is not. A prospect who filters a real-looking
report and then learns the data is generated *respects the honesty*; the same
prospect discovering it later does not.

---

## 4. The credible-IC positioning, in one paragraph

> ICS Compute is a 118-person ISO-certified firm selling governed AI
> foundations to banks. Their smallest client is an enterprise, their smallest
> engagement is five figures, and you will not get the person who builds it.
>
> I am the person who builds it. My work is public — the pipelines, the
> architectures, the four years of production systems, and the numbers from
> clients who agreed to be named. For a business with a handful of branches,
> that is enough to check, and checking is what you should do before handing
> anyone your bank statement.

---

## 5. Sequencing against the 90-day plan

`docs/ACQUISITION-PLAN.md` is unchanged: 90 messages, 90 days. Credibility work
is what makes those messages land, and it is *not* a substitute for them.

| Week | Alongside the messages |
|---|---|
| 1 | Fix the dangling reference. Ask for one reference. |
| 2–3 | Promote the four proof projects into the layer argument |
| 4–6 | Publish the delivery ledger, even if it is three rows |
| 6–8 | Port the offline case studies |
| 8+ | Write about the retail month-end, not about CDC |

**One thing not to do:** wait until the portfolio looks credible before
sending the messages. It will never look finished, because you will keep
adding to it. The evidence is already sufficient to open a conversation. The
conversation is what makes the rest of it worth doing.

---

## 6. The credential question, answered plainly

You will be asked: *"why not just go with the firm?"*

The honest answer, which is also the reason you win:

> Because they cannot give you the person. Not "we'll assign someone senior"
> — the person. If your month-end breaks at 3am on the 3rd, you want the person
> who wrote the reconciliation to answer the phone, not a ticket queue that
> closes in five business days.

That is not a sales line. It is the actual structural difference, and it is
the only one a competitor cannot replicate by hiring.