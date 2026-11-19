/**
 * Shared helpers for the /guides/ store functions.
 *
 * Kept deliberately small: every request here runs on the Workers free tier
 * (10 ms CPU), so this is JSON, one or two D1 statements, and Web Crypto — no
 * libraries, no PDF work, no synchronous loops over large data.
 */

export const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });

/** Strip control characters and trim; every stored string goes through this. */
export const clean = (value, limit) =>
  String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, limit);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const formatIDR = (n) =>
  "Rp " + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const randomToken = (bytes = 24) => {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const pad3 = (code) => String(code).padStart(3, "0");

const enc = new TextEncoder();

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(String(value)));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(String(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(String(message)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length-independent equality on hex strings. */
export function safeEqualStr(a, b) {
  const x = String(a ?? "");
  const y = String(b ?? "");
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

/**
 * Compare two plaintext secrets without leaking length through timing: hash
 * both first, then compare the fixed-size digests.
 */
export async function safeEqualSecret(a, b) {
  const [da, db] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  return safeEqualStr(da, db);
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // curl and same-origin GETs
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export function clientIp(request) {
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}

/**
 * In-memory limiter. Isolates are short-lived, so this stops a naive script,
 * not a distributed one. It is backed by the fact that every order also costs a
 * D1 write and a human check.
 */
const buckets = new Map();

export function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 4000) {
    for (const [k, times] of buckets) {
      if (!times.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return recent.length > max;
}

export function getCookie(request, name) {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export const ADMIN_COOKIE = "guides_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export async function adminCookie(env) {
  const secret = env.GUIDES_SECRET || env.GUIDES_ADMIN_PASSWORD;
  if (!secret) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await hmacHex(secret, `admin:${exp}`);
  return {
    header: `${ADMIN_COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}`,
    clear: `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export async function isAdmin(request, env) {
  const secret = env.GUIDES_SECRET || env.GUIDES_ADMIN_PASSWORD;
  if (!secret) return false;
  const raw = getCookie(request, ADMIN_COOKIE);
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  if (!Number.isFinite(Number(exp)) || Number(exp) <= Date.now()) return false;
  const expected = await hmacHex(secret, `admin:${exp}`);
  return safeEqualStr(sig, expected);
}

export async function readJson(request, limit = 8192) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length && length > limit) throw new Error("payload too large");
  const text = await request.text();
  if (text.length > limit) throw new Error("payload too large");
  if (!text) return {};
  return JSON.parse(text);
}

export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export const maskEmail = (email) => {
  const [user = "", domain = ""] = String(email ?? "").split("@");
  if (!domain) return "";
  const head = user.slice(0, 1);
  return `${head}${"*".repeat(Math.min(Math.max(user.length - 1, 2), 6))}@${domain}`;
};
