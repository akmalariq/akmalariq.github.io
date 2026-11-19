import { store, productById, includedProducts } from "./_catalog.js";
import { pad3 } from "./_lib.js";

const TTL_MS = Math.max(1, Number(store.order_ttl_hours) || 24) * 60 * 60 * 1000;

export function expiresAt(row) {
  const created = Date.parse(row?.created_at ?? "");
  return Number.isFinite(created) ? new Date(created + TTL_MS).toISOString() : null;
}

export function isExpired(row, now = Date.now()) {
  if (!row) return true;
  if (row.status === "expired") return true;
  if (row.status !== "pending" && row.status !== "claimed") return false;
  const end = Date.parse(expiresAt(row) ?? "");
  return Number.isFinite(end) ? now > end : false;
}

export function downloadsFor(row) {
  if (row?.status !== "paid") return [];
  const product = productById(row.product);
  if (!product) return [];
  return includedProducts(product).map((p) => ({
    id: p.id,
    name: p.name,
    title: p.title,
    url: `/api/guides/download?t=${encodeURIComponent(row.access_token)}&p=${encodeURIComponent(p.id)}`,
  }));
}

/** What the buyer's browser may see. No email, no other buyers, no DB ids. */
export function publicOrder(row, now = Date.now()) {
  const product = productById(row.product);
  const expired = isExpired(row, now);
  return {
    ref: pad3(row.code),
    code: row.code,
    product: row.product,
    product_name: product?.name ?? row.product,
    product_title: product?.title ?? "",
    amount: row.amount,
    status: row.status,
    expired,
    created_at: row.created_at,
    claimed_at: row.claimed_at,
    paid_at: row.paid_at,
    expires_at: expiresAt(row),
    downloads: downloadsFor(row),
    store: {
      open: Boolean(store.open),
      qris_live: Boolean(store.qris_live),
      qris_image: store.qris_image,
      merchant: store.merchant,
      support_email: store.support_email,
      order_ttl_hours: store.order_ttl_hours,
      refund_note: store.refund_note,
    },
  };
}

/** Admin rows can include the contact details; the token is useful for support. */
export function adminOrder(row) {
  return {
    ...publicOrder(row),
    id: row.id,
    email: row.email,
    name: row.name,
    payer: row.payer,
    pay_note: row.pay_note,
    admin_note: row.admin_note,
    token: row.access_token,
    utm_source: row.utm_source,
    utm_campaign: row.utm_campaign,
    updated_at: row.updated_at,
  };
}
