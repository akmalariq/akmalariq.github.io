import {
  json,
  sameOrigin,
  clientIp,
  rateLimited,
  readJson,
  safeEqualSecret,
} from "../_lib.js";
import { adminCookie } from "../_lib.js";

/** POST /api/guides/admin/login — password → 12-hour HttpOnly session. */
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request rejected." }, 403);
  if (!env.GUIDES_ADMIN_PASSWORD) {
    return json({ error: "Admin password belum diatur di environment." }, 503);
  }

  const ip = clientIp(request);
  if (rateLimited(`login:${ip}`, 6, 10 * 60 * 1000)) {
    return json({ error: "Terlalu banyak percobaan. Tunggu 10 menit." }, 429);
  }

  let data;
  try {
    data = await readJson(request, 4096);
  } catch {
    return json({ error: "Permintaan tidak valid." }, 400);
  }

  const password = String(data?.password ?? "");
  if (password.length < 1 || password.length > 256) {
    return json({ error: "Password salah." }, 401);
  }

  const ok = await safeEqualSecret(password, env.GUIDES_ADMIN_PASSWORD);
  if (!ok) return json({ error: "Password salah." }, 401);

  const cookie = await adminCookie(env);
  if (!cookie) return json({ error: "Session secret belum dikonfigurasi." }, 503);

  return json({ ok: true }, 200, { "set-cookie": cookie.header });
}
