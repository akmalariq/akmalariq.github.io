import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { url, slugify } from "../lib/url";

export const GET: APIRoute = async ({ site }) => {
  const origin = site!.href.replace(/\/$/, "");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const postsPath = url("/");
  const paths = [
    postsPath,
    ...posts.map((p) => url(`${p.slug}/`)),
    ...[...new Set(posts.flatMap((p) => p.data.tags))].map((t) => url(`tags/${t}/`)),
    ...[...new Set(posts.map((p) => p.data.series).filter((s): s is string => Boolean(s)))].map(
      (s) => url(`series/${slugify(s)}/`)
    ),
  ];

  const body = paths
    .map((p) => `  <url>\n    <loc>${origin}${p}</loc>\n  </url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
