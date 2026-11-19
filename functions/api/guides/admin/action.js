import { json, sameOrigin, readJson, clean } from "../_lib.js";
import { isAdmin } from "../_lib.js";
import { adminOrder } from "../_order.js";
import { productById } from "../_catalog.js";
import { sendGuideEmail } from "../_mail.js";

const ACTIONS = new Set(["approve", "reject", "refund", "resend"]);

/** POST /api/guides/admin/action {id, action, note} */
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request rejected." }, 403);
  if (!(await isAdmin(request, env))) return json({ error: "Unauthorized" }, 401);
  if (!env.GUIDES_DB) return json({ error: "Order database belum dikonfigurasi." }, 503);

  let data;
  try {
    data = await readJson(request, 4096);
  } catch {
    return json({ error: "Permintaan tidak valid." }, 400);
  }

  const id = Number(data?.id);
  const action = String(data?.action ?? "");
  const note = clean(data?.note, 300);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "Order tidak valid." }, 400);
  if (!ACTIONS.has(action)) return json({ error: "Aksi tidak dikenal." }, 400);

  const row = await env.GUIDES_DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(id)
    .first();
  if (!row) return json({ error: "Order tidak ditemukan." }, 404);

  const now = new Date().toISOString();
  let nextStatus = row.status;

  if (action === "approve") {
    if (row.status === "refunded") {
      return json({ error: "Order sudah direfund. Buat order baru." }, 409);
    }
    nextStatus = "paid";
    await env.GUIDES_DB.prepare(
      `UPDATE orders
          SET status = 'paid',
              paid_at = COALESCE(paid_at, ?),
              admin_note = COALESCE(?, admin_note),
              updated_at = ?
        WHERE id = ?`,
    )
      .bind(now, note || null, now, id)
      .run();
  } else if (action === "reject") {
    if (row.status === "paid" || row.status === "refunded") {
      return json({ error: "Order sudah dibayar. Gunakan refund, bukan reject." }, 409);
    }
    nextStatus = "rejected";
    await env.GUIDES_DB.prepare(
      `UPDATE orders SET status = 'rejected', admin_note = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(note || "Pembayaran tidak ditemukan.", now, id)
      .run();
  } else if (action === "refund") {
    if (row.status !== "paid") {
      return json({ error: "Hanya order yang sudah dibayar yang bisa direfund." }, 409);
    }
    nextStatus = "refunded";
    await env.GUIDES_DB.prepare(
      `UPDATE orders SET status = 'refunded', admin_note = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(note || "Refund.", now, id)
      .run();
  } else if (action === "resend") {
    if (row.status !== "paid") {
      return json({ error: "Email hanya dikirim untuk order yang sudah dibayar." }, 409);
    }
  }

  const updated = await env.GUIDES_DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(id)
    .first();
  const product = productById(updated?.product);

  let emailStatus = "not-sent";
  if (product && (action === "approve" || action === "resend")) {
    emailStatus = await sendGuideEmail({ env, request, order: updated, product });
  }

  return json({ order: adminOrder(updated), email: emailStatus, status: nextStatus });
}
