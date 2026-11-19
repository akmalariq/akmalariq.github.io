import { json } from "../_lib.js";
import { isAdmin } from "../_lib.js";
import { adminOrder } from "../_order.js";

/** GET /api/guides/admin/orders?status=open|paid|all */
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "Unauthorized" }, 401);
  if (!env.GUIDES_DB) return json({ error: "Order database belum dikonfigurasi." }, 503);

  const url = new URL(request.url);
  const filter = url.searchParams.get("status") ?? "open";

  const where =
    filter === "paid"
      ? "status IN ('paid', 'refunded')"
      : filter === "open"
        ? "status IN ('pending', 'claimed')"
        : "1 = 1";

  const [rows, statsRows, todayRow] = await Promise.all([
    env.GUIDES_DB.prepare(
      `SELECT * FROM orders WHERE ${where}
        ORDER BY CASE status WHEN 'claimed' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
                 created_at DESC
        LIMIT 300`,
    ).all(),
    env.GUIDES_DB.prepare(
      "SELECT status, COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM orders GROUP BY status",
    ).all(),
    env.GUIDES_DB.prepare(
      "SELECT COUNT(*) AS n FROM orders WHERE created_at >= ?",
    )
      .bind(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .first(),
  ]);

  const stats = { pending: 0, claimed: 0, paid: 0, rejected: 0, refunded: 0 };
  const totals = { pending: 0, claimed: 0, paid: 0, rejected: 0, refunded: 0 };
  for (const row of statsRows.results ?? []) {
    const key = String(row.status);
    if (key in stats) {
      stats[key] = Number(row.n) || 0;
      totals[key] = Number(row.total) || 0;
    }
  }

  return json({
    orders: (rows.results ?? []).map(adminOrder),
    stats: { counts: stats, amounts: totals, last24h: Number(todayRow?.n) || 0 },
    server_time: new Date().toISOString(),
  });
}
