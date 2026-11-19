/**
 * The catalogue is the single source of truth for prices. It lives outside
 * `functions/` (in `content/guides.json`) so the same file can be read by the
 * build-time check that compares it with the prices printed on /guides/.
 *
 * Prices are integer rupiah. The order amount is `price + code`, where `code`
 * is 1–999 — that is the manual-payment identifier the buyer types into their
 * QRIS app. Never trust a price sent by the browser; this module is the only
 * thing the order endpoint reads.
 */
import config from "../../../content/guides.json";

export const store = config.store;
export const launch = config.launch;
export const products = config.products;

const byId = new Map(products.map((p) => [p.id, p]));

export const productById = (id) => byId.get(String(id)) ?? null;

export function launchActive(now = Date.now()) {
  const end = Date.parse(launch?.ends_at ?? "");
  return Number.isFinite(end) ? now < end : false;
}

export function currentPrice(product, now = Date.now()) {
  if (!product) return null;
  const regular = Number(product.price);
  const promo = Number(product.launch_price);
  if (launchActive(now) && Number.isFinite(promo) && promo > 0 && promo < regular) return promo;
  return regular;
}

export function includedProducts(product) {
  if (!product) return [];
  if (Array.isArray(product.includes_products)) {
    return product.includes_products.map((id) => byId.get(id)).filter(Boolean);
  }
  return [product];
}

/** Everything the browser is allowed to know. `file` stays server-side. */
export function publicProduct(product, now = Date.now()) {
  return {
    id: product.id,
    kind: product.kind,
    level: product.level,
    name: product.name,
    title: product.title,
    for: product.for,
    outcome: product.outcome,
    pages: product.pages,
    includes: product.includes,
    price: currentPrice(product, now),
    regular_price: Number(product.price),
    launch_price: Number(product.launch_price) || null,
    on_launch: launchActive(now) && currentPrice(product, now) < Number(product.price),
    includes_products: product.includes_products ?? [product.id],
  };
}

export function publicCatalog(now = Date.now()) {
  return {
    store: {
      open: Boolean(store.open),
      qris_live: Boolean(store.qris_live),
      qris_image: store.qris_image,
      merchant: store.merchant,
      support_email: store.support_email,
      order_ttl_hours: store.order_ttl_hours,
      refund_note: store.refund_note,
    },
    launch: {
      active: launchActive(now),
      ends_at: launch.ends_at,
      label: launch.label,
    },
    products: products.map((p) => publicProduct(p, now)),
  };
}
