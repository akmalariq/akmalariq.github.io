# Analytics setup (GA4 + Google Tag Manager)

akmalariq.dev ships **no** analytics by default. When a container ID is present,
`scripts/build-site.mjs` injects Google Tag Manager (plus a first-party event
helper) into every assembled page, including the blog. IDs are public
identifiers, not secrets.

Status: **live**. Container `GTM-NCBX5SVS` and GA4 `G-WJGF1SGCQ2` are set up, tags
published, and the site is instrumented across 21 pages (homepage, case studies,
blog, 404). GA4 is linked to BigQuery: project `akmalariq-analytics`, location US,
daily export. Remaining: create the `events_flat` view and the Looker Studio
report once the first daily table lands.

---

## 1. Create the GA4 property (5 minutes, browser)

1. Go to https://analytics.google.com, Admin, **Create property** (name: `akmalariq.dev`, timezone Asia/Jakarta, currency IDR).
2. Create a **Web** data stream with URL `https://akmalariq.dev`.
3. Copy the **Measurement ID**, which looks like `G-XXXXXXXXXX`.

## 2. Create the GTM container (3 minutes, browser)

1. Go to https://tagmanager.google.com, **Create account** (`akmalariq.dev`), then a **Web** container.
2. Copy the **Container ID**, which looks like `GTM-XXXXXXX`. Ignore the install snippet it shows; the build injects it.

## 3. Wire the tags in GTM

The site pushes GA4-style events into the data layer. Create:

1. **A Google tag** (Tags, New, Google tag) with your `G-XXXXXXXXXX`, trigger **Initialization - All Pages**. This is the base GA4 configuration.
2. **A GA4 Event tag**: Tags, New, Google Analytics, **GA4 Event**. Measurement ID `G-XXXXXXXXXX`, Event Name `{{Event}}` (use the built-in `Event` variable). Trigger: a new **Custom Event** trigger.
3. **The Custom Event trigger**: Triggers, New, Custom Event. Enable **Use regex matching** and set the event name to:

   ```
   select_item|file_download|contact_click|outbound_click|select_content|cta_click|ui_toggle
   ```

4. **Publish** the container.

### Events the site sends

| Event | Fires when | Parameters |
|---|---|---|
| `select_item` | a project or case-study link is clicked | `item_list_name`, `link_url`, `link_text` |
| `file_download` | a `.pdf` link is clicked (the CV) | `file_name`, `link_url` |
| `contact_click` | a `mailto:` link is clicked | `method` |
| `outbound_click` | a GitHub or LinkedIn link is clicked | `link_domain`, `link_url`, `link_text` |
| `select_content` | a blog link is clicked | `content_type`, `link_url`, `link_text` |
| `cta_click` | a nav CTA or `#contact` link is clicked | `link_text`, `link_url` |
| `ui_toggle` | the theme toggle is clicked | `control` |

The helper lives in `js/analytics.js`. It is dependency-free and never talks to
Google directly, so the site keeps working when analytics is off.

## 4. Activate

Edit `data/analytics.json`:

```json
{ "gtmId": "GTM-XXXXXXX", "ga4Id": "G-XXXXXXXXXX" }
```

Then rebuild and deploy:

```bash
node scripts/build-site.mjs
npx wrangler pages deploy dist --project-name akmalariq --branch main
```

You can also set `GTM_ID` and `GA4_ID` environment variables instead; they take
precedence over the file. If `gtmId` is set it wins; otherwise the GA4 tag loads
directly with no GTM.

## 5. Verify

1. **GTM Preview** (tagmanager.google.com, Preview) on https://akmalariq.dev. Click a project card, the CV link, and the theme toggle, and confirm the events appear.
2. **GA4 Realtime** and **DebugView** (analytics.google.com) should show the same events within a minute.
3. Confirm the container request appears in the browser network tab (`gtm.js?id=GTM-...`). If it is blocked, check the `Content-Security-Policy` in `_headers`; the Google origins are already allow-listed.

## 6. GA4 to BigQuery to Looker Studio

**GCP project ready:** `akmalariq-analytics` (created 2026-09-23, billing linked to "My Billing Account", BigQuery API enabled). Use this project for the export.

### 6a. Link GA4 to BigQuery (browser, one time)

1. GA4, Admin, **Product links**, **BigQuery links**, **Link**.
2. Choose project **akmalariq-analytics**, pick a data location (choose **US** to match the queries below, or a single region you will reuse).
3. Events: enable **Daily** (free). Streaming is near real time but has query cost; leave it off for now.
4. Include advertising identifiers: **no**.
5. Submit. The first daily export can take up to 24 to 48 hours. The dataset appears as `analytics_<PROPERTY_ID>`, where `<PROPERTY_ID>` is the **numeric** property id (GA4 Admin, Property settings), not `G-WJGF1SGCQ2`.

### 6b. Query the export

`analytics/ga4_queries.sql` holds the queries: daily volume, the custom events with parameters flattened, project selections, traffic sources, device and country, and a derived view for Looker Studio.

```bash
# create the derived dataset (same location as the export)
bq mk --location=US --dataset akmalariq-analytics:portfolio_analytics

# run a query (replace <PROPERTY_ID> in the file first)
bq query --use_legacy_sql=false < analytics/ga4_queries.sql
```

### 6c. Looker Studio dashboard

1. Go to https://lookerstudio.google.com, **Create**, **Report**.
2. Add data, **BigQuery**, project `akmalariq-analytics`, dataset `portfolio_analytics`, table `events_flat` (the view from query 6).
3. Suggested charts: time series of events by day, bar of events by name, table of project selections by `link_url`, scorecards for CV downloads and outbound clicks, pie of traffic source.
4. Share the report link, and optionally embed it on the portfolio the way the earthquake case study embeds Looker Studio.

That closes the loop end to end: GTM tag to GA4 to BigQuery to Looker Studio, which is exactly the stack the BI role names.

### Cost

GA4 export storage is small, and BigQuery's free tier is 10 GB storage and 1 TB of queries per month. For a personal site this stays within free tier; set a budget alert on the GCP project if you want a guardrail.

## Notes

- The CSP in `_headers` already allow-lists `www.googletagmanager.com`, `www.google-analytics.com`, `analytics.google.com`, and `stats.g.doubleclick.net`, so enabling analytics needs no header change.
- The blog is an Astro app (`blog-src/`). Injection happens after `astro build`, in `build-site.mjs`, so blog pages are covered as long as the full build runs (`npm run build`).
- No consent banner is implemented. If EU traffic matters, add Consent Mode before enabling ads features.
