import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { url } from "../lib/url";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site }) => {
  const origin = site!.href.replace(/\/$/, "");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const items = posts
    .map((p) => {
      const link = `${origin}${url(`${p.slug}/`)}`;
      const categories = p.data.tags
        .map((t) => `      <category>${escape(t)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escape(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <description>${escape(p.data.description)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Akmal Ariq — Blog</title>
    <link>${origin}${url("/")}</link>
    <description>Notes on data engineering, storage, and system design — written to be re-read.</description>
    <language>en</language>
    <atom:link href="${origin}${url("rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
