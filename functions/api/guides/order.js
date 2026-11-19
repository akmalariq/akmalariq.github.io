import {
  json,
  clean,
  rateLimited,
  sameOrigin,
  clientIp,
  readJson,
} from "./_lib.js";
import { publicOrder } from "./_order.js";

const TOKEN_RE = /^[a-f0-9]{32,64}$/;

async function findByToken(db, token) {
  return db.prepare("SELECT * FROM orders WHERE access_token = ?").bind(token).first();
}

/** GET /api/guides/order?t=<token> — buyer's own order, by bearer token. */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") ?? "";
  if (!TOKEN_RE.test(token)) return json({ error: "Pesanan tidak ditemukan." }, 404);
  if (!env.GUIDES_DB) return json({ error: "Order database belum dikonfigurasi." }, 503);

  const ip = clientIp(request);
  if (rateLimited(`status:${ip}`, 120, 60 * 1000)) {
    return json({ error: "Terlalu banyak permintaan." }, 429);
  }

  const row = await findByToken(env.GUIDES_DB, token);
  if (!row) return json({ error: "Pesanan tidak ditemukan." }, 404);
  return json({ order: publicOrder(row) });
}

/**
 * POST /api/guides/order — "Saya sudah bayar".
 *
 * This does not mark anything paid. It records who says they paid so the owner
 * can match the GoPay notification; only /admin can unlock downloads.
 */
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request rejected." }, 403);
  if (!env.GUIDES_DB) return json({ error: "Order database belum dikonfigurasi." }, 503);

  const ip = clientIp(request);
  if (rateLimited(`claim:${ip}`, 20, 60 * 60 * 1000)) {
    return json({ error: "Terlalu banyak percobaan." }, 429);
  }

  let data;
  try {
    data = await readJson(request);
  } catch {
    return json({ error: "Permintaan tidak valid." }, 400);
  }

  const token = String(data?.token ?? "");
  if (!TOKEN_RE.test(token)) return json({ error: "Pesanan tidak ditemukan." }, 404);

  const payer = clean(data?.payer, 80);
  const note = clean(data?.note, 300);
  if (payer.length < 2) {
    return json({ error: "Tulis nama yang muncul di aplikasi GoPay kamu." }, 400);
  }

  const row = await findByToken(env.GUIDES_DB, token);
  if (!row) return json({ error: "Pesanan tidak ditemukan." }, 404);

  if (row.status === "rejected" || row.status === "expired") {
    return json(
      { error: "Pesanan ini sudah kedaluwarsa atau ditutup. Buat pesanan baru, atau email saya kalau sudah transfer." },
      409,
    );
  }

  if (row.status === "pending" || row.status === "claimed") {
    const now = new Date().toISOString();
    await env.GUIDES_DB.prepare(
      `UPDATE orders
          SET status = 'claimed',
              payer = ?,
              pay_note = ?,
              claimed_at = COALESCE(claimed_at, ?),
              updated_at = ?
        WHERE access_token = ? AND status IN ('pending', 'claimed')`,
    )
      .bind(payer, note || null, now, now, token)
      .run();
    const updated = await findByToken(env.GUIDES_DB, token);
    return json({ order: publicOrder(updated) });
  }

  return json({ order: publicOrder(row) });
}
