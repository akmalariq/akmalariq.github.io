-- GA4 to BigQuery queries for akmalariq.dev
--
-- The GA4 BigQuery export lands in a dataset named analytics_<PROPERTY_ID>,
-- where <PROPERTY_ID> is the numeric property id (GA4 Admin, Property settings),
-- not the measurement id G-WJGF1SGCQ2. Tables are events_YYYYMMDD, one per day,
-- so queries use the events_* wildcard and filter on _TABLE_SUFFIX.
--
-- Replace <PROPERTY_ID> before running, for example:
--   FROM `akmalariq-analytics.analytics_123456789.events_*`

-- 1. Daily event volume, the base health check.
SELECT
  event_date,
  event_name,
  COUNT(*) AS events,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
GROUP BY event_date, event_name
ORDER BY event_date DESC, events DESC;

-- 2. The custom events this site sends, with their parameters flattened.
--    This is the equivalent of the GA4 events report, but joined to the exact
--    link or file that was clicked.
SELECT
  event_date,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_text') AS link_text,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'file_name') AS file_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_domain') AS link_domain,
  COUNT(*) AS events
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE event_name IN (
  'select_item', 'file_download', 'contact_click',
  'outbound_click', 'select_content', 'cta_click', 'ui_toggle'
)
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY events DESC;

-- 3. Which projects people actually open (select_item by destination).
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS project_url,
  COUNT(*) AS selections,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE event_name = 'select_item'
GROUP BY project_url
ORDER BY selections DESC;

-- 4. Traffic sources, the marketing ROI view. GA4 populates the first-touch
--    source on session_start in collected_traffic_source.
SELECT
  collected_traffic_source.manual_source AS source,
  collected_traffic_source.manual_medium AS medium,
  collected_traffic_source.manual_campaign_name AS campaign,
  COUNT(*) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
WHERE event_name = 'session_start'
GROUP BY 1, 2, 3
ORDER BY sessions DESC;

-- 5. Engagement by device and country.
SELECT
  device.category AS device,
  geo.country AS country,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNT(*) AS events
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`
GROUP BY 1, 2
ORDER BY users DESC;

-- 6. A derived view for Looker Studio, so the dashboard reads one tidy table
--    instead of the raw nested export. Create the dataset first:
--      bq mk --location=US --dataset akmalariq-analytics:portfolio_analytics
CREATE OR REPLACE VIEW `akmalariq-analytics.portfolio_analytics.events_flat` AS
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS event_day,
  event_name,
  user_pseudo_id,
  collected_traffic_source.manual_source AS source,
  collected_traffic_source.manual_medium AS medium,
  collected_traffic_source.manual_campaign_name AS campaign,
  device.category AS device,
  geo.country AS country,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_text') AS link_text,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'file_name') AS file_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_domain') AS link_domain
FROM `akmalariq-analytics.analytics_<PROPERTY_ID>.events_*`;
