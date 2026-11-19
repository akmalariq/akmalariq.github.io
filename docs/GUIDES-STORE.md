# Guide store (`/guides/`)

A small storefront for three PDF guides, built for the Cloudflare Pages site.
It takes **manual QRIS payments to the GoPay merchant** and verifies them by
hand. There is no payment gateway and no automatic callback.

**Status: built and tested, not deployed.** Two things must be replaced before
it can sell anything: the PDFs (they are previews) and the confirmation that the
AENITECH QRIS is the right merchant. See the go-live checklist.

---

## 1. What exists

| Path | What it is |
| --- | --- |
| `/guides/` | Storefront: three levels, bundle, how it works, FAQ, free sample |
| `/guides/checkout/?p=<id>` | Email + name, then creates the order |
| `/guides/order/?t=<token>` | The buyer's status/payment page (bearer link) |
| `/guides/admin/` | Password-gated order console (approve, reject, resend, refund) |
| `/guides/sample.pdf` | Public 8-page sample, no email gate |
| `/content/guides.json` | **Single source of truth** for prices, copy, QRIS, flags |
| `/functions/api/guides/*` | Order API, catalogue, downloads, admin endpoints |
| `/functions/guides/files/[file].js` | Shadows the static PDFs and requires a paid token |
| `/scripts/guides-schema.sql` | D1 schema |
| `/scripts/check-guides.mjs` | Fails the build when page prices drift from the catalogue |

The storefront is the "ledger" world (warm near-black, EB Garamond, indigo), not
the neubrutalist landing page. `css/guides.css` holds only `g-` components and
reads tokens; it declares no colours. `/guides/admin/` is deliberately outside
the public nav contract and listed in `EXEMPT_PAGES` in `check-structure.mjs`.

There is **no seventh nav item**. The store is reached from the strip under the
homepage pricing section, from the free sample, and from external links. That
follows the same reasoning as `/audit/`: the six-item nav is fixed on purpose.

---

## 2. The payment rail

A static QRIS has no callback and no reference field. Every Rp 69.000 transfer
looks identical, so **the amount carries the order id**:

```
amount = price + code        code = 1..999, the order id while the order is open
Rp 69.000 + 042 = Rp 69.042  ->  order #042
```

- The buyer scans the merchant QRIS and types the **exact** amount. GoPay's
  static QRIS asks the payer for the nominal — confirmed in GoPay's own merchant
  docs ("nominal transaksi harus dimasukkan oleh pelanggan secara manual").
- The buyer presses **Saya sudah bayar** and writes the sender name. That does
  not unlock anything.
- The owner matches the GoPay merchant notification to the amount and approves
  in `/guides/admin/`. Only then does `status` become `paid` and the download
  open (and the delivery email send, if Resend is configured).
- Codes are unique only among **open** orders (`pending`, `claimed`). A paid or
  expired order releases its code. This is what makes the 3-digit space last
  forever; a plain unique column would stop the store at 999 sales.
- Orders expire after `store.order_ttl_hours` (24). Expiry is swept on the next
  order and computed on read, so a stale page never shows as payable. A late
  transfer can still be approved from the "Semua" tab of the admin.

The trade-off is deliberate: order `#042` can exist more than once across
history. The admin list always shows the date, product and amount; the amount
is what reconciles against the GoPay notification.

---

## 3. Prices

All in rupiah, in `content/guides.json`. The page prints the same numbers and
`npm run check:guides` fails the build if they drift.

| Product | Regular | Launch | Launch window |
| --- | ---: | ---: | --- |
| 01 Masuk (58 pp) | 99.000 | **69.000** | until 2026-12-31 |
| 02 Naik (74 pp) | 179.000 | **119.000** | until 2026-12-31 |
| 03 Dalam (96 pp) | 279.000 | **189.000** | until 2026-12-31 |
| Paket Lengkap (228 pp) | 349.000 | **239.000** | until 2026-12-31 |

The bundle saves Rp 138.000 against the launch singles (Rp 377.000). The
`check:guides` script verifies that printed saving too.

---

## 4. Go-live checklist

Do these in order. Nothing here takes money until step 6.

1. **Confirm the QRIS.** The current `guides/qris.png` is the AENITECH, DIGITAL &
   KREATIF GoPay merchant QRIS copied from the Fitfolio site assets. If that is
   the wrong merchant, replace the file and update `store.merchant` in
   `content/guides.json`.
2. **Replace the PDFs.** The files in `guides/files/` are 5-page previews stamped
   PRATINJAU. Put the final PDFs at the same paths (or change `file` in
   `content/guides.json` to the new random names). Keep the random filename: it
   is not a secret, but it should not be guessable.
   - `guides/files/` is **gitignored on purpose**. This repo is public; paid PDFs
     must never be committed. They exist only on the machine that deploys.
3. **Update the page counts and claims** in `content/guides.json` and
   `guides/index.html` if the final manuscripts differ. Then run `npm run
   check:guides`.
4. **Set the admin secrets on Pages:**
   ```bash
   npx wrangler pages secret put GUIDES_ADMIN_PASSWORD --project-name akmalariq
   npx wrangler pages secret put GUIDES_SECRET --project-name akmalariq
   ```
   `GUIDES_SECRET` is optional; if unset, the password is also the session HMAC
   key. Set it so rotating the password does not invalidate sessions silently.
   The delivery email uses the existing `RESEND_API_KEY` (the contact form
   already relies on it) and sends from `guides@akmalariq.dev`.
5. **Apply the schema to the remote database:**
   ```bash
   npx wrangler d1 execute akmalariq-guides --remote --file=scripts/guides-schema.sql
   ```
6. **Open the store** in `content/guides.json`:
   ```json
   "store": { "open": true, "qris_live": true, ... }
   ```
   Then build and deploy:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name akmalariq --branch main
   ```
7. **Verify live:** open `/guides/`, create a real Rp 69.001 order, pay it from
   GoPay, approve it in `/guides/admin/`, and confirm the PDF downloads and the
   email arrives. Refund yourself by marking the order refunded afterwards.

The D1 database is `akmalariq-guides` (`65dc3c20-9289-4d97-8dd1-3d2caf3da84c`),
bound as `GUIDES_DB` in `wrangler.jsonc`.

---

## 5. Admin

`/guides/admin/` is `noindex`, disallowed in `robots.txt`, and password-gated
with a 12-hour `HttpOnly; Secure; SameSite=Strict` cookie. Login is rate-limited
(6 attempts / 10 minutes / IP).

- **Perlu dicek** — pending + claimed, the queue that matters.
- **Dibayar** — paid + refunded.
- **Semua** — includes expired and rejected; use this for a late transfer.
- **Setujui** asks for confirmation with the ref and amount before unlocking.
- Approving sends the delivery email; the result is reported as `sent`,
  `failed`, or `skipped` (no Resend key). A failed email does not undo the sale;
  the download is already open on the order page.

Match the amount **and** date against the GoPay merchant notification. The order
page is a bearer link: anyone with it can see the order and download after
approval, so do not post it publicly.

---

## 6. Security model

- **PDFs:** `guides/files/*.pdf` is static, but `functions/guides/files/[file].js`
  shadows that path and requires a paid order token. Verified locally: no token
  → 404/402, paid token → 200. The `/api/guides/download` route does the same
  check and streams the file.
- **Prices:** the order endpoint reads `content/guides.json`, never the browser.
- **Downloads:** checked against `status = 'paid'` on every request, so a refund
  revokes the link.
- **Admin:** HMAC-signed cookie, constant-time password compare, same-origin
  check on POSTs, per-IP limits.
- **Input:** all user strings are trimmed/sliced, and every value inserted into
  the admin DOM goes through `esc()`.

Known limits:

- **Manual verification.** Nothing is instant. The page promises under an hour in
  Jakarta business hours, next morning outside them. That promise is the product.
- **One code per open order.** At 999 simultaneous open orders the store returns
  503 rather than reusing a live code. That will not happen at launch volume.
- **Free-plan CPU.** The order endpoint does a sweep UPDATE, a SELECT and an
  INSERT, plus Web Crypto. It is well inside the 10 ms soft limit at this volume;
  sustained traffic is what would justify Workers Paid.
- **Email is best-effort.** The order page is the source of truth; Resend is a
  convenience.

---

## 7. Local development

```bash
# one-time: local schema
npx wrangler d1 execute akmalariq-guides --local --file=scripts/guides-schema.sql

# .dev.vars holds local-only GUIDES_ADMIN_PASSWORD and GUIDES_SECRET
npx wrangler pages dev dist --port 8788

# checks
npm run check:structure
npm run check:guides
npm run build:site
```

Test fixtures (paid, pending, expired) are easiest to create with the API:

```bash
curl -s -X POST http://127.0.0.1:8788/api/guides/orders \
  -H 'content-type: application/json' \
  -d '{"product":"beginner","email":"you@example.com"}'
```

Then log in at `/guides/admin/` with the local password and approve it. The
download should return a PDF; `?p=advanced` against a beginner order should
return 403.

When replacing the preview PDFs, keep the `file` paths in
`content/guides.json` in sync. The page never prints those paths; only the
Functions read them.
