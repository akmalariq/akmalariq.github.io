-- Funnel queries: visitor to purchase order.
--
-- Companion to docs/FUNNEL.md. The site-side stages are in the GA4 export; the
-- offline stages (consult_booked, proposal_sent, po_issued) live in
-- analytics/leads.csv and are joined on lead_id below.
--
-- Replace <PROPERTY_ID> before running. It is the numeric property id from
-- GA4 Admin > Property settings, NOT the G- measurement id.

-- ---------------------------------------------------------------------------
-- 1. The headline: where visitors drop off, in one table.
--
--    Each stage counts DISTINCT sessions, so one person who scrolls the whole
--    page and clicks twice is counted once per stage. Order matters: the rows
--    are the funnel from the top down.
-- ---------------------------------------------------------------------------
WITH events AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    event_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'section') AS section,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'placement') AS placement
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
                     AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name IN (
      'page_view', 'funnel_section', 'cta_click',
      'form_start', 'form_submit', 'form_error'
    )
),
sessions AS (
  SELECT DISTINCT session_id FROM events WHERE session_id IS NOT NULL
),
stage AS (SELECT COUNT(*) AS n FROM sessions),
-- Percentage of sessions that reached each section, most-reached first.
section_counts AS (
  SELECT
    section,
    COUNT(DISTINCT session_id) AS sessions
  FROM events
  WHERE event_name = 'funnel_section' AND section IS NOT NULL
  GROUP BY section
),
form_counts AS (
  SELECT event_name, COUNT(DISTINCT session_id) AS sessions
  FROM events
  WHERE event_name IN ('form_start', 'form_submit', 'form_error')
  GROUP BY event_name
)
SELECT
  'sessions'                        AS stage,
  s.n                               AS sessions,
  1.0                              AS pct_of_sessions
FROM stage s
UNION ALL
SELECT 'section: ' || section, sc.sessions, sc.sessions * 1.0 / s.n
FROM section_counts sc, stage s
UNION ALL
SELECT fc.event_name, fc.sessions, fc.sessions * 1.0 / s.n
FROM form_counts fc, stage s
ORDER BY pct_of_sessions DESC;

-- ---------------------------------------------------------------------------
-- 2. Which CTA actually gets clicked, by placement.
--
--    `placement` is the enclosing data-funnel section. This is the query that
--    tells you whether the pricing section or the nav is doing the work — the
--    answer decides where effort goes next.
-- ---------------------------------------------------------------------------
SELECT
  COALESCE(placement, '(none)') AS placement,
  COUNT(*)                     AS clicks,
  COUNT(DISTINCT session_id)    AS sessions
FROM (
  SELECT
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'placement') AS placement
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND event_name = 'cta_click'
)
GROUP BY placement
ORDER BY clicks DESC;

-- ---------------------------------------------------------------------------
-- 3. Form abandonment: started but never submitted.
--
--    Grouped by day, because a spike usually means a deploy broke the endpoint
--    rather than a copy problem. Check `reason` when it is 'network'.
-- ---------------------------------------------------------------------------
SELECT
  event_date,
  COUNT(DISTINCT IF(event_name = 'form_start',    session_id, NULL)) AS started,
  COUNT(DISTINCT IF(event_name = 'form_submit',   session_id, NULL)) AS submitted,
  ROUND(
    100.0 * COUNT(DISTINCT IF(event_name = 'form_submit', session_id, NULL))
    / NULLIF(COUNT(DISTINCT IF(event_name = 'form_start', session_id, NULL)), 0),
    1
  ) AS completion_pct,
  ARRAY_AGG(DISTINCT IF(event_name = 'form_error', reason, NULL) IGNORE NULLS) AS error_reasons
FROM (
  SELECT
    event_date,
    event_name,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'reason') AS reason
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY))
    AND event_name IN ('form_start', 'form_submit', 'form_error')
)
GROUP BY event_date
ORDER BY event_date DESC;

-- ---------------------------------------------------------------------------
-- 4. The whole funnel, site and offline, joined on lead_id.
--
--    The only query that reaches a purchase order. Upload analytics/leads.csv as
--    a BigQuery table (or paste it into a VALUES list) as `leads`, then run:
--
--      WITH leads AS (
--        SELECT * FROM `your-project.your_dataset.leads`
--      )
--      SELECT ...
--
--    Pipeline value is the number worth watching, not the lead count:
--    30 leads at Rp 7.5jt is a very different business from 3 leads at Rp 80jt.
-- ---------------------------------------------------------------------------
-- offline_stage, value_idr, company FROM leads
-- JOIN events ON events.lead_id = leads.lead_id AND event_name = 'form_submit'
--
-- Aggregate per stage:
--   COUNT(*)                                        AS leads
--   SUM(value_idr)                                  AS pipeline_idr
--   COUNTIF(stage = 'po_issued')                    AS won
--   SAFE_DIVIDE(COUNTIF(stage='po_issued'), COUNT(*)) AS win_rate