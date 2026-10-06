-- Attribution: which page brought the visitor, and which button they pressed.
--
-- Companion to docs/FUNNEL.md. Nothing new has to be instrumented for these to
-- work — GA4 already records the landing page and referrer on every session, and
-- `cta_click` already carries `placement`. This file is the query layer.
--
-- Replace <PROPERTY_ID> before running.

-- ---------------------------------------------------------------------------
-- 1. Which page does someone land on?
--
-- GA4 records this natively; no custom event needed. The first page_view of a
-- session is the entry point, and everything after it is the path they took.
-- This is the answer to "which page attracted the visitor".
-- ---------------------------------------------------------------------------
WITH sessions AS (
  SELECT
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    user_pseudo_id,
    MIN(event_timestamp) AS first_hit
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
  WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
    AND event_name = 'page_view'
  GROUP BY session_id, user_pseudo_id
)
SELECT
  page_location,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS visitors,
  ROUND(100.0 * COUNT(DISTINCT session_id)
        / SUM(COUNT(DISTINCT session_id)) OVER (), 1) AS pct_of_sessions
FROM (
  SELECT
    sessions.session_id,
    sessions.user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer')  AS referrer
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`, sessions
  WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
    AND event_name = 'page_view'
    AND (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') = sessions.session_id
)
GROUP BY page_location
ORDER BY sessions DESC;

-- ---------------------------------------------------------------------------
-- 2. Where the traffic came from, split by landing page.
--
-- The question that decides whether a channel is worth anything: a referrer
-- that sends 40 visitors to the homepage and zero to /product/ is sending
-- tourists, not buyers.
-- ---------------------------------------------------------------------------
SELECT
  REGEXP_EXTRACT(page_referrer, r'^https?://([^/]+)') AS referrer_host,
  REGEXP_EXTRACT(page_location, r'akmalariq\.dev([^?]*)') AS landing_path,
  COUNT(DISTINCT (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS sessions
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND event_name = 'page_view'
  AND page_referrer != ''
GROUP BY referrer_host, landing_path
ORDER BY sessions DESC
LIMIT 50;

-- ---------------------------------------------------------------------------
-- 3. Which button.
--
-- `placement` is the data-funnel section the CTA sat in, added precisely so this
-- question is answerable — without it, cta_click is one undifferentiated number
-- and the page layout cannot be judged.
-- ---------------------------------------------------------------------------
SELECT
  COALESCE(placement, '(none)') AS placement,
  link_text,
  COUNT(*)                  AS clicks,
  COUNT(DISTINCT (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS sessions,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_clicks
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND event_name = 'cta_click'
GROUP BY placement, link_text
ORDER BY clicks DESC;

-- ---------------------------------------------------------------------------
-- 4. Button click to form submit, by placement.
--
-- The only query that says which CTA produces a lead rather than a click. A
-- placement with lots of clicks and no submits is a page-layout problem, not a
-- copy problem.
-- ---------------------------------------------------------------------------
WITH clicks AS (
  SELECT DISTINCT
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'placement') AS placement
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND event_name = 'cta_click'
),
submits AS (
  SELECT DISTINCT
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id
  FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND event_name = 'form_submit'
)
SELECT
  placement,
  COUNT(DISTINCT clicks.session_id)      AS clicked,
  COUNT(DISTINCT submits.session_id)    AS submitted,
  ROUND(100.0 * COUNT(DISTINCT submits.session_id)
        / NULLIF(COUNT(DISTINCT clicks.session_id), 0), 1) AS click_to_submit_pct
FROM clicks
LEFT JOIN submits USING (session_id)
GROUP BY placement
ORDER BY clicked DESC;

-- ---------------------------------------------------------------------------
-- 5. Which demo earns the enquiry.
--
-- The demos are the catalogue (see docs/ICP.md), so the honest question is not
-- which one is popular but which one precedes a conversation. Cross-reference the
-- demo page viewed against the session that submitted.
-- ---------------------------------------------------------------------------
SELECT
  REGEXP_EXTRACT(
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
    r'akmalariq\.dev/demos/([^/]+)/'
  ) AS demo,
  COUNT(DISTINCT (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS sessions,
  COUNT(DISTINCT IF(
    event_name = 'form_submit',
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'), NULL
  )) AS submits_in_same_session
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND REGEXP_CONTAINS(
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
    r'akmalariq\.dev/demos/[^/]+/'
  )
GROUP BY demo
ORDER BY sessions DESC;

-- ---------------------------------------------------------------------------
-- What still needs a human
--
-- GA4 stops at the browser. `proposal_sent` and `po_issued` live in
-- analytics/leads.csv and join on lead_id — see query 4 in funnel_queries.sql.
-- Attribution below the form is not measurable and should not be estimated.
-- ---------------------------------------------------------------------------