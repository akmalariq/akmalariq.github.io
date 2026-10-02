#!/usr/bin/env node
// Decide whether the blog needs rebuilding and redeploying.
//
// Astro's build already hides a post whose pubDate has not arrived (see
// src/lib/posts.ts), so a scheduled post goes live on its own — but only if
// something rebuilds the site on the day. Without this, "publish" quietly means
// "remember to run npm run deploy on the Tuesday", which is exactly how a post
// ends up a week late.
//
// So this answers one question: is there a post that *should* be live by now but
// is not on the live site? It compares the repo against the deployed sitemap and
// redeploys only when they disagree. On a quiet day it prints "nothing due" and
// the workflow exits without touching production.
//
//   node scripts/publish-due.mjs
//
// Writes `due=true|false` and `slugs=...` to $GITHUB_OUTPUT when run by Actions.
// Exits non-zero only if it could not tell, so a network failure surfaces instead
// of being read as "nothing to do".

import { readdir, readFile, appendFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "blog-src/src/content/blog");
const SITE = "https://akmalariq.dev";

// Slug must mirror Astro's: the filename minus its extension.
const slugOf = (file) => file.replace(/\.mdx?$/, "");

// Only `pubDate` and `draft` matter here, and both are single-line scalars, so a
// targeted read beats pulling in a YAML parser for a 2-field subset.
function frontmatter(body) {
  const block = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return {};
  const field = (key) => block[1].match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
  return { pubDate: field("pubDate"), draft: field("draft") };
}

// The deployed sitemap is the source of truth for "what a visitor can reach".
async function liveSlugs() {
  const res = await fetch(`${SITE}/blog/sitemap.xml`, {
    // Pages carry no cache header worth trusting for this check.
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`sitemap ${res.status} ${res.statusText}`);
  const xml = await res.text();
  return new Set(
    [...xml.matchAll(/<loc>https:\/\/akmalariq\.dev\/blog\/([^/<]+)\/?<\/loc>/g)].map((m) => m[1])
  );
}

async function main() {
  // The override exists so a scheduled post can be checked without waiting for
  // its date: PUBLISH_DUE_NOW=2026-10-07 node scripts/publish-due.mjs
  const now = process.env.PUBLISH_DUE_NOW ? new Date(process.env.PUBLISH_DUE_NOW) : new Date();
  const files = (await readdir(CONTENT)).filter((f) => /\.mdx?$/.test(f));

  const posts = await Promise.all(
    files.map(async (file) => ({ slug: slugOf(file), ...frontmatter(await readFile(join(CONTENT, file), "utf8")) }))
  );

  const problems = [];
  const due = [];
  for (const p of posts) {
    if (!p.pubDate) problems.push(`${p.slug}: no pubDate`);
    // `draft` is absent on some posts and that is correct: the collection schema
    // defaults it to false. Only an explicit `true` holds a post back.
    if (p.draft !== "true" && p.draft !== undefined && p.draft !== "false")
      problems.push(`${p.slug}: draft must be true or false, got "${p.draft}"`);
    if (p.draft !== "true" && new Date(`${p.pubDate}T00:00:00Z`) <= now) due.push(p.slug);
  }
  if (problems.length) throw new Error(`frontmatter problems:\n  ${problems.join("\n  ")}`);

  const live = await liveSlugs();
  const missing = due.filter((s) => !live.has(s)).sort();

  const dueLine =
    missing.length === 0
      ? `nothing due — ${due.length} post(s) already live`
      : `${missing.length} post(s) due: ${missing.join(", ")}`;
  console.log(dueLine);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `due=${missing.length > 0}\nslugs=${missing.join(",")}\n`
    );
  }

  // A non-empty `missing` is the normal "go deploy" case, not an error.
  process.exit(0);
}

main().catch((err) => {
  console.error(`publish-due: ${err.message}`);
  process.exit(1);
});