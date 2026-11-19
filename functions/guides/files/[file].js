/**
 * Shadows /guides/files/* so the static PDFs cannot be fetched directly.
 *
 * The store's real download link is /api/guides/download; this route exists only
 * because Pages would otherwise serve the asset with no check at all. It accepts
 * the same bearer token, so a link copied from the order page still works.
 */
import { includedProductForFile, servePdf, orderByToken, pdfResponseError } from "../../api/guides/_serve.js";

const TOKEN_RE = /^[a-f0-9]{32,64}$/;

export async function onRequestGet({ request, env, params }) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!TOKEN_RE.test(token)) return pdfResponseError("Link tidak valid.", 404);

  const row = await orderByToken(env, token);
  if (!row || row.status !== "paid") {
    return pdfResponseError("Pembayaran belum terverifikasi.", 402);
  }

  const product = includedProductForFile(row, params.file);
  if (!product) return pdfResponseError("File ini bukan bagian dari pesananmu.", 403);

  return servePdf({ request, env, order: row, product });
}
