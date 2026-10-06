/**
 * POST /api/contact — receives a consult request from the landing page.
 *
 * Why this exists: every "Book a free consult" CTA used to be a mailto:, which
 * launches the visitor's desktop mail client. On a phone that means leaving the
 * site, opening an app, and composing — and most people abandon there. The form
 * keeps them on the page, and a pain-point field qualifies the lead before any
 * conversation starts.
 *
 * Delivery is Resend, not Cloudflare Email Routing. That was the obvious first
 * choice and it was wrong: akmalariq.dev already receives mail over iCloud+
 * custom domain (MX → mx01/mx02.mail.icloud.com), and enabling Cloudflare Email
 * Routing *replaces* those MX records rather than sitting alongside them. It
 * would have silently broken inbound mail to take over the form.
 *
 * Resend sends on the domain over its own SPF/DKIM and touches no MX record, so
 * iCloud keeps serving inbound and the form still arrives from a branded
 * address. Free tier is 3,000 emails a month against a handful of consults.
 *
 * Setup, once:
 *   1. resend.com — add akmalariq.dev, add the DNS records it gives you
 *      (SPF and DKIM are TXT; do NOT touch MX)
 *   2. Put the API key in Pages:
 *        npx wrangler pages secret put RESEND_API_KEY --project-name akmalariq
 *   3. Confirm the from address is verified in Resend before going live.
 *
 * If the key is missing this returns 503 with an explanation rather than
 * silently dropping the lead — a form that looks like it worked but swallowed
 * the enquiry is the worst possible failure for a sales page.
 */

const DESTINATION = "akmalariqs@gmail.com";
const FROM = "consult@akmalariq.dev";

/** Fields a bot fills that a person never sees. */
const HONEYPOT = "website";

/**
 * Per-IP rate limit. In-memory and best-effort: a Pages Function isolate is
 * short-lived, so this stops a naive script, not a determined one. The real
 * gate is that a form costs an API call.
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
  // POST to, spending your Resend quota and using your sending reputation.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && new URL(origin).host !== host) {
    return json({ error: "Cross-origin submission rejected." }, 403);
  }

  if (!env?.RESEND_API_KEY) {
    return json(
      {
        error: "Email delivery is not configured on this site. Please email directly.",
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
  const leadId = clean(data?.lead_id, 64);

  const errors = {};
  if (name.length < 2) errors.name = "Please add your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please add an email I can reply to.";
  if (pain.length < 10) errors.pain = "A sentence about the report is enough.";
  if (Object.keys(errors).length) return json({ errors }, 400);

  // Reply-To is the visitor, not the site: a reply from their thread lands in
  // their inbox and keeps the thread intact rather than bouncing off the site.
  //
  // The timeout is not decoration. Without it an unreachable or slow provider
  // leaves the fetch pending indefinitely, the function holds the connection,
  // and the visitor watches "Sending…" forever with no error and no way out.
  // Eight seconds is past any reasonable wait for a person to read a failure.
  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [DESTINATION],
        reply_to: email,
        subject: `Consult request — ${pain.slice(0, 70)}`,
        text: [
          `Name:     ${name}`,
          `Email:    ${email}`,
          company ? `Company: ${company}` : null,
          leadId ? `Lead ID:  ${leadId}` : null,
          "",
          "What they said they want to stop dreading:",
          pain,
          "",
          "-- sent from akmalariq.dev",
        ]
          .filter(Boolean)
          .join("\n"),
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br>
<strong>Email:</strong> ${escapeHtml(email)}<br>${
          company ? `<strong>Company:</strong> ${escapeHtml(company)}<br>` : ""
        }${leadId ? `<strong>Lead ID:</strong> ${escapeHtml(leadId)}<br>` : ""}</p>
<h3>What they want to stop dreading</h3>
<p>${escapeHtml(pain).replace(/\n/g, "<br>")}</p>
<hr><p style="color:#888;font-size:12px">Sent from akmalariq.dev</p>`,
      }),
    });
  } catch (error) {
    console.error("resend unreachable:", error?.name ?? error);
    return json({ error: "Could not send. Please email directly.", fallback: DESTINATION }, 502);
  }

  if (!response.ok) {
    // Log the body: Resend returns a specific reason (unverified from address,
    // quota exceeded) and that is the difference between a two-minute fix and
    // an afternoon of guessing.
    const detail = await response.text().catch(() => "");
    console.error("resend rejected:", response.status, detail.slice(0, 300));
    return json({ error: "Could not send. Please email directly.", fallback: DESTINATION }, 502);
  }

  return json({ ok: true }, 200);
}

/** Anything other than POST is a mistake, not an attack — say so plainly. */
export function onRequest() {
  return json({ error: "Use POST." }, 405);
}