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
 * Bot gate: how long the form was on screen before submission, in ms.
 *
 * Deliberately not reCAPTCHA. Three fields is already the whole form, and a
 * "prove you are human" checkbox is the single most-abandoned element on the
 * web — it would cost real leads to catch bots that, on a site this size, do
 * not exist. This costs the visitor nothing and catches the ones that do: a
 * script that fills and submits in under a second. A person typing a name, an
 * email and a sentence cannot beat 1.2s.
 */
const MIN_FILL_MS = 1200;
/** A stale tab left open overnight is not a bot; don't reject real enquiries. */
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

/**
 * Per-IP rate limit. In-memory and best-effort: a Pages Function isolate is
 * short-lived, so this stops a naive script, not a determined one. The real
 * gate is that a form costs an API call.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

/**
 * Who is writing, and what reply they need. A business owner and a job seeker
 * reach the same CTA and want opposite answers, so this is the first question —
 * before anyone invests effort in describing a problem that would go to the
 * wrong reply path.
 */
const SEGMENTS = {
  business: "Business owner",
  freelancer: "Freelancer / agency",
  work: "Looking for work",
  other: "Other",
};

/**
 * The two ICP tests, asked as the cap allows (docs/ICP.md).
 *
 * `EXPORTS` is the sharpest filter in the whole document: no exportable data
 * means the engagement is research rather than delivery, and that is worth
 * knowing before a call rather than during one. `CADENCE` decides whether this is
 * a project or a standing service, which is the first question on any quote.
 */
const EXPORTS = {
  full: "Marketplaces + POS + bank",
  pos: "POS or accounting only",
  sheets: "Spreadsheets only",
  none: "Nothing exportable yet",
};

const CADENCE = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  rarely: "Rarely",
};

/** Keep every field short. A long "describe your business" box gets skipped. */
const LIMITS = { name: 120, email: 200, pain: 2000 };
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

  const fillMs = Number(data?.fill_ms);

  const name = clean(data?.name, LIMITS.name);
  const email = clean(data?.email, LIMITS.email);
  const pain = clean(data?.pain, LIMITS.pain);
  const leadId = clean(data?.lead_id, 64);
  // Allowlist, never echo: the raw value goes nowhere but the segment label.
  // Allowlist, never echo: the raw value goes nowhere but these labels.
  const segment = Object.hasOwn(SEGMENTS, data?.segment) ? data.segment : "";
  const exports = Object.hasOwn(EXPORTS, data?.exports) ? data.exports : "";
  const cadence = Object.hasOwn(CADENCE, data?.cadence) ? data.cadence : "";

  const errors = {};
  if (!segment) errors.segment = "Pick the one that fits best.";
  if (!exports) errors.exports = "Pick the closest one.";
  if (!cadence) errors.cadence = "Pick one.";
  if (name.length < 2) errors.name = "Please add your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please add an email I can reply to.";
  if (pain.length < 10) errors.pain = "A sentence about the report is enough.";
  if (Object.keys(errors).length) return json({ errors }, 400);

  // Timing gate — after validation, deliberately.
  //
  // This was originally above it, and that was a serious bug: an empty or
  // autofilled submission reported fill_ms 0, tripped the gate, and returned a
  // fake `{ok:true}`. The visitor saw "Sent. I reply within one business day"
  // for an enquiry that was never delivered. Anyone whose password manager
  // filled the form in under 1.2s lost their message silently and had no way
  // to know.
  //
  // Validation is real feedback and must always reach the visitor. The gate only
  // ever runs on a submission that is otherwise complete and would have been
  // delivered. The value is client-supplied, so this is a cheap filter, not a
  // proof — the honeypot and the rate limit are the other two layers.
  if (Number.isFinite(fillMs) && (fillMs < MIN_FILL_MS || fillMs > MAX_FILL_MS)) {
    console.warn(`discarded submission, fill time ${fillMs}ms`);
    return json({ ok: true }, 200);
  }

  const label = SEGMENTS[segment];
  const exportLabel = EXPORTS[exports];
  const cadenceLabel = CADENCE[cadence];

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
        subject: `[${label}] Consult request — ${pain.slice(0, 60)}`,
        text: [
          `Who:     ${label}`,
          `Name:    ${name}`,
          `Email:   ${email}`,
          `Exports: ${exportLabel}`,
          `Cadence: ${cadenceLabel}`,
          leadId ? `Lead ID: ${leadId}` : null,
          "",
          "What they said they want to stop dreading:",
          pain,
          "",
          "-- sent from akmalariq.dev",
        ]
          .filter(Boolean)
          .join("\n"),
        html: `<p><strong>Who:</strong> ${escapeHtml(label)}<br>
<strong>Name:</strong> ${escapeHtml(name)}<br>
<strong>Email:</strong> ${escapeHtml(email)}<br>${
          `<strong>Exports:</strong> ${escapeHtml(exportLabel)}<br><strong>Cadence:</strong> ${escapeHtml(cadenceLabel)}<br>`
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