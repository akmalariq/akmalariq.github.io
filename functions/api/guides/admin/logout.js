import { json, sameOrigin, adminCookie } from "../_lib.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request rejected." }, 403);
  const cookie = await adminCookie(env);
  return json({ ok: true }, 200, {
    "set-cookie": cookie?.clear ?? "guides_admin=; Path=/; Max-Age=0",
  });
}
