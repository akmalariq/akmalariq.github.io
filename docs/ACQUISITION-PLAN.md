# Customer acquisition plan — 90 days

Written 2026-10-16. Replaces nothing; extends `docs/OUTREACH-KIT.md`
(week 1 tactics) with the months that follow it.

**Starting position:** zero leads. Zero published client results. A site that
is finished, a sample report that is live, and an audit page nobody has
seen. This plan assumes all of that and starts from zero.

---

## 1. What one client is actually worth

| Stage | Price | How often | Notes |
|---|---|---|---|
| Paid audit | Rp 2.500.000 | once | Rp 0 margin if they continue inside 30 days — it is acquisition cost |
| The build | Rp 7.500.000 | once | 2–3 weeks of work |
| Managed | Rp 4.000.000/mo | ~10 months average | where the business actually lives |
| **Full ladder** | **~Rp 52.500.000** | | gross, one client |

`docs/POSITIONING.md` already argued this: **management is where the business
lives.** Migration is the wedge, but a client you never convert to managed was
a Rp 7.5jt one-off.

### The funnel math that has to hold

```
15 cold messages            →  4–6 replies          (25–40%, warm-ish, ICP-filtered)
 4–6 sample reports sent    →  2–4 calls booked     (~50%)
 2–4 calls                  →  1–2 audits bought    (~60%)
 1–2 audits                 →  1 build              (~60%)
 1 build                    →  0.6 managed          (~60%)
```

**One client costs roughly 15 good messages.** That is the only ratio that
matters right now, and it is why volume is the whole game.

### Realistic 90-day outcome

| Month | Audits | Builds | Managed starts | Gross |
|---|---|---|---|---|
| 1 | 1 | 0 | 0 | Rp 2,5 jt |
| 2 | 2 | 1 | 1 | Rp 24 jt |
| 3 | 3 | 1 | 1 | Rp 35 jt |
| **90 days** | **6** | **2** | **2** | **~Rp 61 jt** |

Six audits is **~90 qualified messages over 90 days.** Three a day is not
insane, but it is the entire job. There is no version of this where the site
does the work for you at this volume.

---

## 2. Capacity — not the constraint

| Work | Hours |
|---|---|
| First audit | 3.75 |
| Each subsequent audit | ~1.5 |
| A build | 60–90 |
| Managed, per client/month | 3–4 |

At 20 billable hours a week you have room for roughly **two builds in
progress**. Demand, not capacity, is the constraint for the next six months.
Do not let "I need more time" become the reason you send fewer messages.

---

## 3. Channels, ranked by cost per qualified lead

Honest estimates for the Indonesian SME / retail market. Everything except
referral is a guess; treat these as order-of-magnitude, not benchmarks.

| Rank | Channel | Est. cost per qualified lead | Verdict |
|---|---|---|---|
| **1** | **Referral** | Rp 0–50k | The only channel that compounds. Engineer it deliberately. |
| **2** | **Warm network** | Rp 0–50k (time only) | 4 years of Kanmo contacts. Mostly spent. |
| **3** | **Facebook UMKM groups** | Rp 0–100k | Where the buyer already complains, for free |
| **4** | **Instagram** | Rp 100k–300k | Shopee/Tokopedia sellers live here; weak intent |
| **5** | **Google Ads → /audit/** | Rp 300k–800k | Only viable with the Rp 2,5jt entry price. Not yet. |
| **6** | **Cold LinkedIn** | Rp 200k–500k | Wrong audience. Reaches consultants, who will not hire you. |
| **7** | **SEO / blog** | Rp 0 now, Rp 0 in 90 days | Long game. Keep posting; do not count on it. |

**Two channels for 90 days. Referral and warm network. Everything else is a
distraction until one of those is working.**

---

## 4. Referral — the channel that compounds

A solo consultant with good results gets referred by clients. You do not have
any yet, so referral is currently **zero** and will become your dominant
source around month 4. This is the single most important thing to build, and
it is a design problem, not a marketing one.

### What makes a client refer you

1. **The report is forwardable.** `/sample/` exists so that a shop owner can
   send it to a partner without you in the thread. Every audit must be a
   document they can forward with their name on it, not a link to your site.
2. **You told them something they did not want to hear.** "Nothing is wrong"
   earns more trust than a finding. Say it when it is true.
3. **You did not try to close.** The audit is complete on its own. The build
   is a second decision. Pushing converts a satisfied client into a reluctant
   one.
4. **You asked once, specifically.** Day 7 after delivery: *"did anything in
   the report turn out to be wrong?"* That message earns a reply and a
   correction. It does not earn a referral. The referral comes from the
   delivered result, three weeks later.

### The ask, when it comes

> If you know another owner dealing with the same thing, a forward is genuinely
> useful. No obligation on them either — the first report is free.

Named, low-pressure, once. Never in the first email, never twice.

---

## 5. The 90 days

### Days 1–14 — prove the motion works

| | |
|---|---|
| Build the 30-name list | `docs/OUTREACH-KIT.md` §5 |
| Send 15 personalised | §2 templates |
| Deliver every sample report within 2 working days | `RUNBOOK-SAMPLE-DELIVERY.md` |
| Log every lead | `analytics/leads.csv` |

**Gate:** at least 3 replies, at least 1 call booked. If 15 messages produce
**zero** replies, the problem is the message, not the volume. Rewrite before
sending 15 more.

### Days 15–30 — sell the audit

| | |
|---|---|
| Convert every active conversation to a paid audit | Rp 2,5jt, credited if they continue |
| Send 15 more, plus 10 follow-ups | |
| One post in a Facebook UMKM group | the `/audit/` page, not "hire me" |
| **Read the GA4 funnel for the first time** | you now have enough data to mean something |

**Gate:** 2 audits sold. If audits are selling but builds are not, the audit
report is under-delivering on its "what I would fix first" page.

### Days 31–60 — first build, first managed client

| | |
|---|---|
| Deliver the first build | 2–3 weeks |
| Convert to managed **inside the build** | ask on day 1 of handover, not week 6 |
| Send 15 more | |
| Ask the first satisfied client for one referral | |
| Publish one case study | with written permission, anonymised |

**Gate:** one managed client live. If the build completes and nobody moves to
managed, the retainer is being sold as a favour rather than a decision.

### Days 61–90 — decide whether ads are affordable

Only now, and only with real numbers:

```
audits sold (90d) ÷ qualified messages sent = conversion rate
builds ÷ audits                          = audit→build rate
managed ÷ builds                         = build→managed rate
```

Multiply them and you have your CAC ceiling without spending a rupiah. If
that number is under Rp 2,5jt, run Rp 500k of Google Ads pointed at `/audit/`
as a **test with a defined kill criterion** — see §8.

---

## 6. What to measure

`docs/FUNNEL.md` already instruments this. The five numbers that matter:

| Metric | Where | Why |
|---|---|---|
| `cta_click` by `placement` | GA4 | which section actually produces clicks |
| `pricing` reached, `contact` not | GA4 | pricing problem, per FUNNEL's own rule |
| `/sample/` visits | GA4 | the free report is the top of the ladder — is anyone using it? |
| `/audit/` visits | GA4 | is the product discoverable? |
| Replies per 15 messages | `leads.csv` | the only number that predicts revenue |

**`analytics/leads.csv` is the source of truth.** The file is committed empty
on purpose; the first row you write makes the pipeline total a real number
for the first time.

---

## 7. The moat — be honest about it

Nothing technical here is hard to copy. ClickHouse + dbt + Dagster + Superset
are all Apache-2.0 and a competent engineer could reproduce the pipeline in a
month. Do not build the business on the stack.

What is actually defensible:

1. **Being the person they already know.** Four years at Kanmo is a real
   distribution asset and it decays with time. Spend it before it does.
2. **Knowing the Indonesian retail specifics.** Shopee and Tokopedia payout
   cycles, BCA statement formats, how refunds actually settle, the
   Indonesian accounting conventions. A generic engineer does not know these
   and would take a month to learn what took you four years.
3. **Speed.** 3.75 hours from "here are your exports" to "here is what is
   wrong with your month" is genuinely fast, and it is reproducible because
   the shape repeats.
4. **Being trusted with the number.** Retail owners do not hand over their
   bank statements to strangers. Reputation here is the asset.

---

## 8. What would make you stop

Set these now, while you are not emotionally invested:

| If this happens by day 90 | Then |
|---|---|
| 90 messages sent, under 3 replies | The message is wrong. Rewrite the whole approach, not the copy. |
| 3 replies, 0 calls | The offer is wrong. Push the free sample harder; consider dropping the audit price. |
| Calls booked, none convert | The qualification is too loose, or the price is wrong. Both are fixable in one week. |
| 2 builds, 0 managed | **The most important failure.** Retainer demand is a positioning problem, not a sales problem. Stop selling builds and sell management. |
| You are doing this 25 hours a week with no reply-rate improvement | Solo is the wrong shape. Consider subcontracting the delivery and keeping only the sales. |

The one that matters most is the fourth. A build you cannot convert to
managed is a one-off job, and one-off jobs do not become a business.

---

## 9. What not to do

- **Do not build a SaaS product.** There is one customer. A product needs
  three before it is a product.
- **Do not start a course.** Nobody in your ICP is learning to be a data
  engineer.
- **Do not chase enterprise.** `docs/ICP.md` already rejected it: real budget,
  six-month procurement, uns survivable solo.
- **Do not be on five channels.** Two channels done properly beat five done
  badly, and badly is the failure mode.
- **Do not discount the audit below Rp 2jt.** It is the entry price that makes
  acquisition work; under it, the arithmetic stops.
- **Do not post daily.** Consistency beats volume and nobody remembers a daily
  post from a consultant.
- **Do not re-do the website.** It is finished. Every hour spent on it is an
  hour not spent sending messages, and the site is not your constraint.

---

## 10. The uncomfortable part

The plan above needs **90 messages in 90 days** for one or two clients.

That is roughly three a day, most mornings, for three months, on top of
whatever else you are doing. There is no funnel optimisation that replaces it
and no content strategy that shortcuts it. The site, the sample report, the
audit product and the delivery process are all built now — they exist so that
when you send message number 4, something good happens at the other end.

The failure mode is not a bad website. It is a good website and a quiet month.
Decide now whether you will send the messages, because everything upstream of
that decision has already been paid for.