/**
 * GET /api/guides/download?t=<order token>&p=<product id>
 *
 * Paid is checked on every request, so revoking an order revokes the link. The
 * actual bytes are served by _serve.js; the PDFs are also statically reachable
 * under /guides/files/, which is why functions/guides/files/[file].js shadows
 * that path with the same check.
 */
import { json } from "./_lib.js";
import { productById, includedProducts } from "./_catalog.js";
import { servePdf, orderByToken } from "./_serve.js";

const TOKEN_RE = /^[a-f0-9]{32,64}$/;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") ?? "";
  const productId = url.searchParams.get("p") ?? "";

  if (!TOKEN_RE.test(token)) return json({ error: "Link tidak valid." }, 404);
  if (!env.GUIDES_DB) return json({ error: "Store belum dikonfigurasi." }, 503);

  const row = await orderByToken(env, token);
  if (!row) return json({ error: "Link tidak valid." }, 404);
  if (row.status !== "paid") {
    return json({ error: "Pembayaran belum terverifikasi." }, 402);
  }

  const ordered = productById(row.product);
  if (!ordered) return json({ error: "Produk tidak dikenal." }, 404);

  const product = includedProducts(ordered).find((p) => p.id === productId);
  if (!product) return json({ error: "Produk ini bukan bagian dari pesananmu." }, 403);

  return servePdf({ request, env, order: row, product });
}
