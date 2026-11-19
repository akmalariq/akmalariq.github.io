import { productById, includedProducts } from "./_catalog.js";

/**
 * Serve one paid PDF, but only to a paid order that includes it.
 *
 * Two callers use this: /api/guides/download (the link on the order page) and
 * /guides/files/[file] (a shadowing Function). The second exists because the
 * PDFs are also static assets; without it, anyone who learned a filename could
 * fetch it directly. Pages Functions take precedence over static assets, so the
 * path is closed unless the request carries a paid order token.
 */
export function includedProductForFile(order, file) {
  const ordered = productById(order?.product);
  if (!ordered) return null;
  const wanted = String(file ?? "").split("/").pop();
  return (
    includedProducts(ordered).find((product) => {
      const name = String(product.file ?? "").split("/").pop();
      return name && name === wanted;
    }) ?? null
  );
}

export async function servePdf({ request, env, order, product }) {
  if (!env.ASSETS?.fetch) {
    return new Response("Penyimpanan file belum dikonfigurasi.", { status: 503 });
  }

  const url = new URL(request.url);
  const assetUrl = new URL(`/guides/${product.file}`, url.origin);
  const asset = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: "GET" }));
  if (!asset.ok || !asset.body) {
    return new Response("File tidak ditemukan.", { status: 404 });
  }

  const filename = `akmalariq-${product.id}-guide.pdf`;
  return new Response(asset.body, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export async function orderByToken(env, token) {
  if (!env.GUIDES_DB) return null;
  return env.GUIDES_DB.prepare("SELECT * FROM orders WHERE access_token = ?")
    .bind(token)
    .first();
}

export function pdfResponseError(message, status) {
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
