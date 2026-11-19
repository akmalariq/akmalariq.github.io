import { json } from "./_lib.js";
import { publicCatalog } from "./_catalog.js";

/** GET /api/guides/catalog — prices, merchant details, launch state. */
export async function onRequestGet() {
  return json(publicCatalog(), 200, {
    "cache-control": "public, max-age=60",
  });
}
