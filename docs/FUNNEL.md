# The funnel — visitor to PO

How a stranger becomes a signed purchase order, what is measured at each step,
and what has to be recorded by hand because it happens in an inbox rather than
on the site.

Read this before changing `js/analytics.js`, `js/contact-form.js`, or the
`data-funnel` attributes in `index.html`.

---

## The shape of it

```
   ARRIVE ──────────► INTEREST ──────────► INTENT ──────► LEAD ──► …offline
     │                   │                   │             │
  page_view        funnel_section       cta_click    form_start
  session          (which section)     (placement)      │
                                    form_submit ◄────────┘
                                         │
                                   lead_id ──────────────► join key
```

Stages 1–5 are measured on the site. Everything after `form_submit` happens in
email and is recorded by hand against `lead_id`.

---

## Stage 1 — Arrive

| Event | Source | Notes |
|---|---|---|
| `page_view` | GA4 built-in | Session start. Not a custom event. |

Acquisition lives in the normal GA4 traffic reports: source/medium, landing
page, campaign. UTM parameters are preserved by GA4 without extra tagging.

**Referrer worth watching:** a visit from a GitHub link, a LinkedIn post, or
direct. Those are the ones where a personal follow-up is worth your time.

---

## Stage 2 — Interest

The page is ~10,900px, roughly eleven screens. "Did they keep reading" is the
only honest interest signal, so each section reports itself once when it is
genuinely on screen.

| Event | Parameters | Fires when |
|---|---|---|
| `funnel_section` | `section` | A `data-funnel` element is 35% visible, once ever |

Section names, in document order:

```
hero → services → process → projects → work → pricing
     → skills → about → faq → contact
```

Two of these are the ones that matter:

- **`pricing`** — they reached the decision point.
- **`contact`** — they reached the ask.

**How to read a drop-off:** `pricing` reached but `contact` not is a pricing
problem. `contact` reached but no `form_start` is a form or offer problem.
`form_start` with no `form_submit` is a field-count problem — cut a field before
you blame the copy.

---

## Stage 3 — Intent

| Event | Parameters | Fires when |
|---|---|---|
| `cta_click` | `link_text`, `link_url`, `placement` | Any CTA is clicked |

`placement` is new and is the reason this stage is worth having. Without it,
`cta_click` is one undifferentiated number and the page layout cannot be judged.
Values are the `data-funnel` name of the enclosing section, or `nav` for the
header CTA.

---

## Stage 4 — Lead

| Event | Parameters | Fires when |
|---|---|---|
| `form_start` | `form_id`, `lead_id` | First real keystroke in the form |
| `form_submit` | `form_id`, `lead_id`, `has_company` | Server returned 200 |
| `form_error` | `form_id`, `lead_id`, `reason` | Validation or network failure |

`form_start` fires on the first **keystroke**, not on focus. Focusing a field
and leaving is common and is not intent.

`form_error.reason` is the field list joined by commas, or `network`. A field
that errors repeatedly is a field that needs to go.

### The `lead_id`

Minted client-side by `js/analytics.js` on first interaction, sent with the
submission, and included in the email that arrives in your inbox.

It is a random UUID. It carries no personal data, is not a cookie, and does not
identify anyone on its own. Its only job is to be the join key between the
on-site event and the offline stage you record by hand.

---

## Stage 5 — Offline. Recorded by hand.

**A purchase order is an email. GA4 cannot see it.** There is no honest way to
make a static site fire an event when a client signs a PO, and any attempt to
approximate it produces numbers you cannot audit. So these are recorded
deliberately, not measured.

| Stage | Meaning | When you know |
|---|---|---|
| `consult_booked` | They replied and a call is in the calendar | You send the invite |
| `proposal_sent` | You sent the written scope and price | You send it |
| `po_issued` | Signed purchase order received | The signed document arrives |

### How to record them

Keep one file, `analytics/leads.csv`, one row per lead:

```csv
lead_id,received_at,company,stage,value_idr,notes
a3f9c2e1-…,2026-10-06,Toko Sinar,consult_booked,,
b7d40a88-…,2026-10-02,Kopi Kita,po_issued,7500000,starter report
```

`lead_id` comes from the submission email, so it joins to the GA4 event. Because
GA4 is already exported to BigQuery (`akmalariq-analytics`, daily), a single
SQL join gives you the whole funnel — on-site and offline — as one table.
Queries for this are in `analytics/funnel_queries.sql`.

**Update `stage` when the stage changes.** This is the only manual step in the
entire funnel, and it is the step that decides whether any of it was worth
building.

---

## Queries

`analytics/funnel_queries.sql`. The headline number is the conversion rate:

```sql
COUNT(DISTINCT user_pseudo_id WHERE event_name = 'form_submit')
--------------------------------------------------------------------
COUNT(DISTINCT user_pseudo_id WHERE event_name = 'page_view')
```

BigQuery caveat: BigQuery is session- and device-scoped, so this is a
**session conversion rate**, not a person conversion rate. Someone who visited
three times and submitted once counts once. For a site this size that is the
right number — it answers "what share of visits produced a lead".

---

## Add an event to GTM

The Custom Event trigger in GTM uses a **regex**. New events will not reach GA4
until it is updated — the site pushes to the data layer regardless, so the data
exists but sits uncollected if you forget.

Trigger pattern, current:

```
select_item|file_download|contact_click|outbound_click|select_content|cta_click|ui_toggle|funnel_section|form_start|form_submit|form_error
```

Publish the container after editing. This is the one manual step between
changing the code and seeing the numbers.

---

## What is deliberately not tracked

- **No scroll-percentage event.** Depth is already captured by
  `funnel_section`, which is more meaningful than a percentage and fires once.
- **No heatmap or session recording.** This is a five-page site with three CTAs.
  Recording visitors on a sales page is a privacy cost with no matching benefit.
- **No cross-site visitor tracking.** No pixels on other domains, no retargeting.
- **No PII in any event parameter.** The pain-point text goes to the inbox, not
  to analytics. `form_submit` carries only a boolean about the company field.
  Sending the text itself would put a visitor's business problem into a Google
  dataset, which the privacy policy does not permit.