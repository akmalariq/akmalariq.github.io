/**
 * POST /api/guides/orders
 *
 * Creates a pending order and returns the three-digit code that becomes the
 * last three digits of the amount. Nothing is charged here; the buyer scans the
 * merchant QRIS and transfers the exact amount, then claims it.
 *
 * The price always comes from `content/guides.json` — never from the body.
 */
import {
  json,
  clean,
  EMAIL_RE,
  randomToken,
  rateLimited,
  sameOrigin,
  clientIp,
  readJson,
} from "./_lib.js";
import { store, productById, currentPrice } from "./_catalog.js";
import { publicOrder } from "./_order.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request rejected." }, 403);
  if (!store.open) return json({ error: "Toko sedang tutup. Coba lagi nanti." }, 503);

  const ip = clientIp(request);
  if (rateLimited(`order:${ip}`, 10, 30 * 60 * 1000)) {
    return json({ error: "Terlalu banyak percobaan. Coba lagi 30 menit lagi." }, 429);
  }

  let data;
  try {
    data = await readJson(request);
  } catch {
    return json({ error: "Permintaan tidak valid." }, 400);
  }

  const product = productById(data?.product);
  if (!product) return json({ error: "Guide tidak dikenal." }, 400);

  const email = clean(data?.email, 200).toLowerCase();
  const name = clean(data?.name, 120);
  if (!EMAIL_RE.test(email)) {
    return json({ error: "Email belum valid. Link unduhan dikirim ke alamat ini." }, 400);
  }

  const utmSource = clean(data?.utm_source, 60) || null;
  const utmCampaign = clean(data?.utm_campaign, 60) || null;
  const db = env.GUIDES_DB;
  if (!db) return json({ error: "Order database belum dikonfigurasi." }, 503);

  const now = Date.now();
  const price = currentPrice(product, now);

  // Free codes held by abandoned orders before allocating. A paid or rejected
  // row no longer needs its code; only pending and claimed do.
  const ttlMs = Math.max(1, Number(store.order_ttl_hours) || 24) * 60 * 60 * 1000;
  const staleBefore = new Date(now - ttlMs).toISOString();
  await db
    .prepare(
      `UPDATE orders SET status = 'expired', updated_at = ?
        WHERE status IN ('pending', 'claimed') AND created_at < ?`,
    )
    .bind(new Date(now).toISOString(), staleBefore)
    .run()
    .catch(() => {});

  // Allocate the smallest code not currently open. Codes come back into the
  // pool once an order closes, so the three-digit space is effectively endless.
  const usedRows = await db
    .prepare("SELECT code FROM orders WHERE status IN ('pending', 'claimed')")
    .all();
  const used = new Set((usedRows.results ?? []).map((row) => Number(row.code)));
  let code = 1;
  while (used.has(code)) code += 1;
  if (code > 999) {
    return json({ error: "Kode pesanan habis. Hubungi saya langsung." }, 503);
  }

  const token = randomToken(24);
  const createdAt = new Date(now).toISOString();
  const amount = price + code;

  let inserted = false;
  let lastError = null;
  for (let attempt = 0; attempt < 4 && !inserted; attempt += 1) {
    try {
      await db
        .prepare(
          `INSERT INTO orders
             (code, product, amount, status, email, name, access_token,
              utm_source, utm_campaign, created_at, updated_at)
           VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(code, product.id, amount, email, name || null, token, utmSource, utmCampaign, createdAt, createdAt)
        .run();
      inserted = true;
    } catch (error) {
      lastError = error;
      // Lost a race for this code: recompute and retry.
      const again = await db
        .prepare("SELECT code FROM orders WHERE status IN ('pending', 'claimed')")
        .all();
      const taken = new Set((again.results ?? []).map((row) => Number(row.code)));
      let next = 1;
      while (taken.has(next)) next += 1;
      if (next > 999) break;
      code = next;
    }
  }

  if (!inserted) {
    console.error("guides order insert failed:", lastError?.message ?? "unknown");
    return json({ error: "Pesanan gagal dibuat. Coba lagi." }, 500);
  }

  const row = {
    code,
    product: product.id,
    amount,
    status: "pending",
    access_token: token,
    created_at: createdAt,
    updated_at: createdAt,
  };

  // The token is returned only here, once. It is the buyer's bearer key for the
  // status page; the GET endpoint never echoes it back.
  return json({ order: { ...publicOrder(row, now), token } }, 201);
}
