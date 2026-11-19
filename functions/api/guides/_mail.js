import { formatIDR, escapeHtml } from "./_lib.js";

const FROM = "Akmal Ariq <guides@akmalariq.dev>";

/**
 * Delivery email, sent only after a human approves the payment. A missing
 * Resend key is not an error: the order page still shows the download, and the
 * admin sees `skipped` rather than a failed sale.
 */
export async function sendGuideEmail({ env, request, order, product }) {
  if (!env?.RESEND_API_KEY) return "skipped";
  if (!order?.email) return "skipped";

  const origin = new URL(request.url).origin;
  const link = `${origin}/guides/order/?t=${encodeURIComponent(order.access_token)}`;
  const ref = String(order.code).padStart(3, "0");
  const greeting = order.name ? `Halo ${order.name},` : "Halo,";
  const subject = `Guide kamu siap — ${product.name} (#${ref})`;

  const text = [
    greeting,
    "",
    `Pembayaran untuk ${product.name} — ${product.title} sudah kami terima.`,
    "",
    `Pesanan: #${ref}`,
    `Nominal: ${formatIDR(order.amount)}`,
    "",
    "Unduh guide-nya di sini:",
    link,
    "",
    "Link ini menampilkan status pesanan dan bisa kamu buka lagi kapan saja.",
    "Simpan email ini. Kalau ada masalah, balas saja email ini.",
    "",
    "— Akmal",
    "akmalariq.dev/guides",
  ].join("\n");

  const html = `<!doctype html>
<html lang="id"><body style="margin:0;padding:24px;background:#f6f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1b1a17">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2ddd2;border-radius:12px;padding:28px">
    <p style="margin:0 0 16px;font-size:15px">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6">
      Pembayaran untuk <strong>${escapeHtml(product.name)} — ${escapeHtml(product.title)}</strong>
      sudah kami terima.
    </p>
    <p style="margin:0 0 20px;font-size:13px;color:#6b665c">
      Pesanan <strong>#${ref}</strong> &middot; ${escapeHtml(formatIDR(order.amount))}
    </p>
    <p style="margin:0 0 24px">
      <a href="${escapeHtml(link)}" style="display:inline-block;background:#1b3e8d;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:15px">Buka halaman unduhan</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#6b665c;line-height:1.6">
      Link ini menampilkan status pesanan dan bisa dibuka lagi kapan saja. Simpan email ini.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b665c">— Akmal<br>akmalariq.dev/guides</p>
  </div>
</body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [order.email],
        reply_to: "akmalariq@protonmail.com",
        subject,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error("guides mail failed:", response.status, await response.text());
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("guides mail error:", error?.message ?? error);
    return "failed";
  }
}
