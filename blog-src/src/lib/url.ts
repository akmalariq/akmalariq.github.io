// Prefix an internal path with the site base (`/blog`).
// url() -> "/blog/"  ·  url("tags/") -> "/blog/tags/"
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function url(path = ""): string {
  return `${BASE}/${path.replace(/^\//, "")}`;
}

// URL-safe slug for tag/series values (importable inside getStaticPaths).
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
