# Outreach kit — one lead in seven days

Everything needed to run the week. Written 2026-10-16.

**Read `docs/FEEDBACK-LOG.md` first** — it explains why these assets exist and
what was cut to make room for them.

---

## 0. What ships with this

| Asset | Where | Why |
|---|---|---|
| Sample report | `https://akmalariq.dev/sample/` | The link every email carries. Readable without talking to anyone. |
| Cut form | `/#consult` | Three required fields. Qualification is optional and lives in a `<details>`. |
| Copy-paste email | §2 below | |
| Call script | §3 below | |

---

## 1. The arithmetic, so the targets are honest

| | |
|---|---|
| Send | 15 personalised messages |
| Reply rate on a *relevant* warm-ish email | 20–40% |
| Expected replies | 3–6 |
| Convert reply → sample report delivered | ~70% |
| Expected reports delivered | 2–4 |
| Report → 20-minute call | ~50% |
| **Expected calls** | **1–2** |

Fifteen messages is not a spam run. It is fifteen businesses that exist, and
you have met most of them. The list is in §5.

**Do not send a message you have not personalised.** One line naming
something real about their actual operation is the entire difference between
a reply and being marked as spam by a shop owner who forwards things.

---

## 2. The email

Three versions. Send the one that matches what you actually know about them.

### 2A — the default (you know they sell on marketplaces)

**Subject:** your Shopee + Tokopedia numbers, reconciled

> Hi [First name],
>
> I'm Akmal — a data engineer in Jakarta. I build the monthly report for small
> retailers, so the number is the same every morning and nobody opens the
> reconciliation sheet.
>
> Not a pitch. Here's a sample report I made for a shop like yours:
> [akmalariq.dev/sample](https://akmalariq.dev/sample)
>
> If it's not useful, you keep it and we never speak again. If it is, send me
> three exports — Shopee, Tokopedia, your POS or a bank statement, whichever
> is easiest — and I'll send back the same report with *your* numbers in it,
> plus two paragraphs on what I'd fix first.
>
> No call required to start.
>
> Akmal
> Data engineer · Jakarta
> [akmalariq.dev](https://akmalariq.dev)

### 2B — you know their month-end is painful

**Subject:** the 3rd of the month

> Hi [First name],
>
> The 3rd of the month is when the bank number and the marketplace number stop
> matching and somebody has to explain it.
>
> I'm Akmal, a data engineer in Jakarta. I build the report that makes those
> two agree — here's a sample of what arrives: [akmalariq.dev/sample](https://akmalariq.dev/sample)
>
> Send me three exports (marketplace, POS, bank — any three) and I'll send
> back yours, reconciled, plus two paragraphs on where the difference comes
> from. That's it. If it's not useful, keep it.
>
> Akmal
> Data engineer · Jakarta

### 2C — you worked with them or share a network

**Subject:** [Their name]'s reporting, if it's still a manual thing

> Hi [First name],
>
> Long time — [one specific, true sentence: "we overlapped at Kanmo" / "you
> were the one who ran the [X] reports" / "met you at [event]"].
>
> I'm working with small retailers now, building the monthly report so the
> numbers reconcile themselves. Before I start, I'd like your read on it —
> here's a sample of what I'd hand over: [akmalariq.dev/sample](https://akmalariq.dev/sample)
>
> If you know someone who'd want this, a forward is genuinely useful.
>
> Akmal

### 2D — the follow-up (day 5, only if no reply)

**Subject:** Re: your Shopee + Tokopedia numbers, reconciled

> Hi [First name],
>
> No reply needed — I know a month is full.
>
> I'm attaching a one-page PDF of the sample report rather than making you open
> a link: [attached]
>
> If the reconciliation ever becomes a whole morning, send me three exports and
> I'll do it once for free so you can see whether it's worth anything.
>
> Akmal

---

## 3. The 20-minute call script

The form no longer qualifies the lead, so the call does. Structure matters more
than charisma here — you are qualifying, not selling.

### Minutes 0–2 — let them talk

> "Before I ask anything: walk me through how you find out how the month went."
>
> Then stay quiet. The answer is the qualification.

**Listen for:** "we check Shopee, then Tokopedia, then ask the finance guy to
compare it to the bank statement, then…" — that is a Segment A buyer with a
live problem. Versus "we've got a system for that" — not a buyer.

### Minutes 2–5 — the two questions that decide everything

**"When the numbers disagree, who gets asked?"**

> Somebody is named. That is the whole test. If the answer is "nobody, we
> just adjust", there is no project, and you should say so.

**"Could you hire someone to do this?"**

> If yes, you lose to a salary and you should say so. Your buyer is the one
> who *can't* staff it.

### Minutes 5–9 — establish the data

**"What can you export today, without asking anyone?"**

| They say | You say |
|---|---|
| "Shopee, Tokopedia, POS, bank — all of it" | **This is the ideal engagement.** Go to scope. |
| "We have Excel exports" | Fine. Where do they come from, and who writes them? |
| "The bank gives us a PDF" | Fine — one source of truth plus three ledgers is enough to start. |
| "I'd have to ask" / "we don't record it" | **Stop here.** "Then this isn't the right project yet. When you're recording it, come back." |

This is the `no data, no deal` filter from `docs/ICP.md`, applied in one
question instead of a form gate.

### Minutes 9–13 — show, don't describe

> "I've got a sample for a shop about your size. Can I share my screen for two
> minutes?"
>
> Open `akmalariq.dev/sample`. Filter to their branch if they have one. Point
> at the reconciliation table, not the charts.

The charts are pretty. The reconciliation table is the proof. Nine retailers
out of ten will ask about the row that says **"Unexplained."** Let them.

### Minutes 13–17 — scope and price

> "Based on what you've described, this is a two-to-three week build, fixed
> scope, Rp 7.5 million. I'll send that in writing this afternoon with what I
> heard you say. If it fits, we start Monday."

**Say the number.** A consultant who won't say a number is a consultant who
isn't sure. If they need a different number, you will find out now rather
than in three weeks.

Do not discount on the call. The founding rate is already a discount and it
already buys you the case study.

### Minutes 17–20 — the close

> "Two things I need from you: the three exports, and whoever is named when
> the numbers are wrong. I'll have your sample within two working days."

### What disqualifies you — say it early and be kind

| Signal | Line |
|---|---|
| Nothing is recorded | "You're not ready for this. Come back when you are." |
| They can hire an analyst | "Hire an analyst. You'd get more out of that than from me." |
| They want a dashboard, not a report | "That's a different person. Here's two names…" |
| No budget, no date | "Then it's a conversation, not a project. I'll check back in Q1." |

Walking away from three of five calls is what makes the other two real.

---

## 4. The seven days

| Day | Action | Done when |
|---|---|---|
| **1** | Form cut to three fields ✅ shipped · Pricing: one primary CTA ✅ shipped · Sample report live ✅ shipped | `akmalariq.dev/sample/` loads, filters work |
| **1** | Write the list: 30 named businesses | 30 rows in a sheet: name, contact, the one real thing you know |
| **2** | Rank to 15. Keep only the ones where the ICP filter could plausibly pass | 15 rows |
| **3** | Send 7 (2A or 2B). Personalise one line each | 7 sent, logged |
| **4** | Send 8 more. Use 2C for anyone you have met | 15 sent total |
| **5** | Follow up the 10 who didn't reply (2D) | 10 follow-ups |
| **5** | Post the sample link publicly — LinkedIn, or the retail Facebook groups you are already in | 1 post |
| **6** | Anyone who replied gets their sample report built | reports delivered |
| **7** | Calls. Follow the script | ≥1 call booked |

**Log everything in `analytics/leads.csv`.** The file is committed empty on
purpose. The first row you write is the first real number this business has.

---

## 5. Where the 30 come from

Ranked by likelihood of passing "someone is named when the number is wrong":

1. **Every retailer you have met through Kanmo work** — they exist, they
   trust you slightly, and they are almost certainly still doing this by hand
2. **The retail floor of your parents' / friends' neighbourhood** — walk in,
   ask who runs the books. Physical presence is an unfair advantage here.
3. **Shopee/Tokopedia seller communities** — Jakarta seller groups on
   Facebook and Discord. Post the sample, do not DM.
4. **Second-hand: the finance guy** — every small retailer has one. He is the
   person named when the number is wrong, and he is your champion.
5. **Adjacent verticals** — cafés, warungs with 3+ branches, laundromats,
   clinics. Same problem, same answer.

---

## 6. What to do with the answers

The first three replies are the most valuable data you will collect this
quarter. Write down, for each:

- The sentence they used for "how do you find out how the month went" —
  verbatim
- Who they said gets asked
- What they could export without permission

Those three sentences are better positioning research than anything on the
site. When you have three, `docs/POSITIONING.md` should be rewritten around
them.

---

## 7. What not to do

- **Do not sell a product.** You have zero customers on the product path.
  Sell the sample, sell the build.
- **Do not offer a discount on the first call.** The founding rate already
  exists and it already asks for a testimonial and a case study.
- **Do not build a landing page for this.** One page, `/sample/`, is enough.
  A dedicated outreach landing page is a way of not sending the emails.
- **Do not follow up more than once.** The follow-up in 2D is the follow-up.
- **Do not fake a case study.** `data-lake-ingestion` is real and unpublished —
  publish it as the technical proof. Everything else waits until a client says
  yes.