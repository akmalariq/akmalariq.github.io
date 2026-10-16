# Runbook — reply to delivered sample

The gap between "someone sent me three exports" and "they got a report back".
This is the step where a lead is won or quietly lost, and it is the one thing
on the critical path that had no written process.

Written 2026-10-16, alongside `docs/OUTREACH-KIT.md`.

---

## The commitment being made

Every message in `docs/OUTREACH-KIT.md` promises the same three things:

> "I'll send back the same report with **your** numbers in it, plus two
> paragraphs on what I'd fix first."
>
> "within two working days"
>
> "No call required to start."

Three promises. Miss the first and you lose the referral chain. Miss the
second and you lose the reason you were chosen over the cheaper option. The
third is the reason they replied at all — **do not convert it into a meeting.**

---

## Step 1 — Acknowledge (within 4 working hours)

Short. No questions yet, because you need to look before you ask.

> Got them, thanks. Two things I need to know before I start:
>
> 1. Which period should I build? (a full month is best — e.g. May 2026)
> 2. Should I use your real names, or blank them?
>
> I'll have your sample back by [date, two working days from now].

That is the entire message. It sets a date you must hit, and it gets the only
two answers that genuinely change the work.

---

## Step 2 — Look before you build (30 minutes, not 3 hours)

Open the exports. Before anything else, answer these four questions **for
yourself**:

| Question | If no |
|---|---|
| Do the dates in the exports overlap the period they said? | Stop. Ask which period is real. |
| Is there a transaction ID or order number in at least one export? | You cannot reconcile. Say so honestly and offer a margin report instead. |
| Do the platform totals differ from the sum of the line items? | Feasible — platform fees, ads, cancelled orders. This is normal, not disqualifying. |
| Is the bank statement readable (not a photo of a receipt)? | Ask for a proper PDF or CSV export. |

**The honest outcome is allowed and is often the right one.** "Your exports
cannot be reconciled at transaction level — here is what I can tell you from
them, and here is what a system would need you to start capturing" is a
*better* answer than a padded report. It demonstrates exactly the judgement
you are being paid for.

---

## Step 3 — Build the report (2 hours)

Reuse, do not rebuild. `/sample/` already has the shape and the code.

| Piece | Where | Change needed |
|---|---|---|
| Data generator | `js/sample-dashboard.js` | Replace the seeded generator with their rows |
| Layout | `/sample/index.html` | Unchanged |
| Reconciliation table | `/sample/index.html` | Their actual differences, with causes |
| Styling | `css/landing.css` | Unchanged |

Day 0 in the dashboard is a **fixed date** (`2026-05-29`) so the shape is
stable. For a client report, set it to their real month-end. That is a
one-line change and it is the only code edit.

```js
// js/sample-dashboard.js — for a real client, swap the generator for:
var ROWS = [ /* their rows: day, branch, channel, category, orders, net, refunds, refundValue */ ];
```

Keep the "Sample data · synthetic" caption **until the data is theirs**. Then
remove it — and that removal is the moment it stops being a demo.

---

## Step 4 — The two paragraphs

This is the part that gets quoted back to a partner, and the part nobody does
well. Two paragraphs, plain language, no jargon, no tool names.

**Paragraph 1 — what I found.** One number, one cause.

> Of the Rp 412.600 that reached the bank in May and didn't match an order,
> Rp 340.000 is marketplace fees you were treating as lost sales. That is not
> loss — it's the cost of selling on the platform, and it was never in your
> margin calculation.

**Paragraph 2 — what I'd do first.** One decision, not a project plan.

> I'd start with the refund flow. Rp 280.000 of May's variance is refunds that
> take 3 days to reach your account. If you held the refund reserve in a
> separate float, your month-end would already balance to within about Rp 50.000
> without a single software change.

Rules:
- **No tool names.** "ClickHouse" is worth nothing to a shop owner.
- **One number each.** Two numbers in a paragraph means neither lands.
- **Second paragraph must be actionable without hiring you.** If they can do
  it themselves this week, they will, and they will tell people that — which
  is the referral you want.

---

## Step 5 — Send

> Hi [Name],
>
> Here it is: [link to their report]
>
> **What I found.** [paragraph 1]
>
> **What I'd do first.** [paragraph 2]
>
> The report is a PDF of the live page — the filters still work in the link,
> which is usually the part people tell their partner about.
>
> No call needed. If it's useful, tell me what would make it more useful.
>
> Akmal

**Attach the PDF.** The link is for the filters; the attachment is for the
person who will forward it internally without clicking anything.

---

## Step 6 — The follow-up that is not a follow-up

Day 7 after delivery, one message:

> Hi [Name] — did anything in the report turn out to be wrong? A wrong number
> is useful to me, and cheap for you to say.

This is the highest-value message in the whole flow. It:
- gets a factual correction you can trust
- surfaces whether anyone internal actually opened it
- keeps a warm contact without asking for anything

---

## What to log

Every row in `analytics/leads.csv`:

```csv
lead_id,received_at,company,stage,value_idr,notes
s8f2k1,2026-10-19,"Tokopedia 3-branch store",sample_delivered,0,"May; real names ok; Rp340k is fees, not loss"
```

The file is committed empty on purpose. Write the header row plus your first
real row and the pipeline total becomes a real number for the first time.

---

## The three failure modes

| Failure | What it looks like | Prevention |
|---|---|---|
| **The date slips** | You send day 4 instead of day 2. They never ask again. | Set the date in Step 1's email. A date you put in writing is a commitment, not a hope. |
| **The padded report** | You built it but had nothing real to say, so you sent it silently. | Steps 4's two paragraphs are mandatory. Silence reads as "nothing to report", which is worse than the problem was. |
| **The meeting creep** | They reply warmly, you propose a call to "discuss next steps". | You promised no call required. The report is the close. A call is what happens after they decide they want more — not the thing you substitute for it. |

---

## Capacity check

| Hours | Task |
|---|---|
| 0.5 | Step 1, acknowledge |
| 0.5 | Step 2, look |
| 2.0 | Step 3, build |
| 0.5 | Step 4, write the two paragraphs |
| 0.25 | Step 5, send |
| **3.75** | **Total, first client** |
| ~1.5 | Subsequent clients — the shape is already built |

3.75 hours for the first one. If that is comfortably inside your Rp 7.5jt
build, the discovery is free and you have been underpricing. If it is not,
that is the number to know **before** the call, not after.