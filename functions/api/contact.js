/**
 * POST /api/contact — receives a consult request from the landing page.
 *
 * Why this exists: every "Book a free consult" CTA used to be a mailto:, which
 * launches the visitor's desktop mail client. On a phone that means leaving the
 * site, opening an app, and composing — and most people abandon there. The form
 * keeps them on the page, and a pain-point field qualifies the lead before any
 * conversation starts.
 *
 * Delivery is Cloudflare Email Routing (`send_email` binding). No third-party
 * account, and the message goes straight to the inbox.
 *
 * Setup, once — all of it in the dashboard, because a Pages project's
 * wrangler.jsonc does not accept a send_email binding (it fails validation):
 *
 *   1. Cloudflare dashboard -> akmalariq.dev -> Email -> Email Routing -> Enable
 *   2. Add destination address akmalariqs@gmail.com and verify it
 *   3. Workers & Pages -> akmalariq -> Settings -> Functions -> Bindings
 *      -> Add -> "Send email", variable name SEND_EMAIL
 *
 * If the binding is absent this returns 503 with an explanation rather than
 * silently dropping the lead — a form that looks like it worked but swallowed
 * the enquiry is the worst possible failure for a sales page.
 */

const DESTINATION = "akmalariqs@gmail.com";
const SUBJECT = "Consult request — {pain}";

/** Fields a bot fills that a person never sees. */
const HONEYPOT = "website";

/**
 * Per-IP rate limit. In-memory and best-effort: a Pages Function isolate is
 * short-lived, so this stops a naive script, not a determined one. The real
 * gate is the verified email destination.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

/** Keep every field short. A long "describe your business" box gets skipped. */
const LIMITS = { name: 120, email: 200, company: 160, pain: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

/** Strip control characters and trim. Keeps the email body well-formed. */
const clean = (value, limit) =>
  String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, limit);

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic cleanup so the map cannot grow without bound on a long isolate.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function onRequestPost({ request, env }) {
  // Same-origin only. Without this the endpoint is an open relay anyone can
  // POST to, using your sending reputation.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && new URL(origin).host !== host) {
    return json({ error: "Cross-origin submission rejected." }, 403);
  }

  if (!env?.SEND_EMAIL) {
    return json(
      {
        error:
          "Email delivery is not configured on this site. Please email directly.",
        fallback: DESTINATION,
      },
      503,
    );
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (rateLimited(ip)) {
    return json({ error: "Too many requests. Please email directly." }, 429);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Malformed request." }, 400);
  }

  // A filled honeypot gets a success response. Telling a bot it was caught only
  // teaches it to vary the field.
  if (clean(data?.[HONEYPOT], 200)) return json({ ok: true }, 200);

  const name = clean(data?.name, LIMITS.name);
  const email = clean(data?.email, LIMITS.email);
  const company = clean(data?.company, LIMITS.company);
  const pain = clean(data?.pain, LIMITS.pain);

  const errors = {};
  if (name.length < 2) errors.name = "Please add your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please add an email I can reply to.";
  if (pain.length < 10) errors.pain = "A sentence about the report is enough.";
  if (Object.keys(errors).length) return json({ errors }, 400);

  const subject = SUBJECT.replace("{pain}", pain.slice(0, 70));
  const body = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    company ? `Company: ${company}` : null,
    "",
    "What they said they want to stop dreading:",
    pain,
    "",
    "-- sent from akmalariq.dev",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await env.SEND_EMAIL.send({
      to: DESTINATION,
      from: "consult@akmalariq.dev",
      subject,
      text: body,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br>
<strong>Email:</strong> ${escapeHtml(email)}<br>${
    company ? `<strong>Company:</strong> ${escapeHtml(company)}<br>` : ""
  }</p>
<h3>What they want to stop dreading</h3>
<p>${escapeHtml(pain).replace(/\n/g, "<br>")}</p>
<hr><p style="color:#888;font-size:12px">Sent from akmalariq.dev</p>`,
    });
  } catch (error) {
    console.error("contact delivery failed:", error?.message ?? error);
    return json({ error: "Could not send. Please email directly.", fallback: DESTINATION }, 502);
  }

  return json({ ok: true }, 200);
}

/** Anything other than POST is a mistake, not an attack — say so plainly. */
export function onRequest() {
  return json({ error: "Use POST." }, 405);
}