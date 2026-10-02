# akmalariq.dev/blog — source

Static, English-first blog about data engineering, storage, and system design.
Built with [Astro](https://astro.build) + MDX. It is **not** a separate site: the build
output lands in `../blog/`, which the existing `portfolio` Cloudflare Worker serves at
<https://akmalariq.dev/blog/> (its `assets.directory` is the repo root).

## Commands

Run from `portfolio/blog-src/` (or from the repo root via `npm run …`):

```bash
npm install          # once
npm run dev          # local preview at http://localhost:4321/blog/
npm run build        # generates ../blog/
npm run preview      # preview the built output
```

From the repo root:

```bash
npm run build        # build blog + assemble dist/
npm run deploy       # build + wrangler pages deploy dist --project-name akmalariq
```

The deploy target is the **Cloudflare Pages** project `akmalariq` (root
`akmalariq.dev`, `akmalariq.pages.dev`). Its git build config is
`build_command = npm run build`, `destination_dir = dist`.

## Write a post

Create `src/content/blog/<slug>.mdx`. The filename becomes the URL:
`my-post.mdx` → `/blog/my-post/`.

```mdx
---
title: "Post title"
description: "One-sentence summary used for SEO + social previews."
pubDate: 2026-09-16
tags: ["storage", "fundamentals"]
series: "DE Foundations"      # optional
level: "Foundations"          # Foundations | Intermediate | Advanced
---

import Callout from "../../components/Callout.astro";
import Figure from "../../components/Figure.astro";
import Quiz from "../../components/Quiz.astro";

## First heading

Body text. Use `##`/`###` headings — the table of contents is generated from them.
```

Components available in MDX (paths are relative to the post file):

- `<Callout type="info|warn|win" title="…">…</Callout>`
- `<Figure caption="…">…svg…</Figure>`
- `<CompareTable caption="…">…</CompareTable>`
- `<Quiz title="Check yourself">…</Quiz>` — put `<details><summary>Answer</summary>…</details>` inside

Each post automatically gets: canonical URL, Open Graph + Twitter tags, `BlogPosting`
JSON-LD, reading time, tags, a table of contents, and a call-to-action back to
`akmalariq.dev/#contact`.

Note: MDX treats HTML comments as errors — use `{/* … */}` inside JSX/SVG instead of `<!-- -->`.

## Publish a post

Two frontmatter knobs decide when a post is visible, and they are orthogonal:

| frontmatter | effect |
| --- | --- |
| `draft: true` | **Held.** Never ships, on any date. For unfinished work. |
| `draft: false` (or omitted) + `pubDate` in the future | **Scheduled.** Ships itself on that date. |
| `draft: false` + `pubDate` in the past | Already live. |

The date check lives in one place — `src/lib/posts.ts` — and every listing
(index, post pages, tags, series, RSS, sitemap) filters through it, so a
scheduled post cannot leak into the feeds days before its page exists.

`pubDate` is a bare `YYYY-MM-DD`, resolved as 00:00 **UTC** — so a post dated the
6th goes live at 07:00 WIB on the 6th. It is never visible early as a result.

### Checking what is due

```bash
npm run publish:due                 # compare the repo against the live sitemap
PUBLISH_DUE_NOW=2026-10-07 npm run publish:due   # "would something be due on the 7th?"
```

It prints `nothing due` when every scheduled post is already live, which is the
signal the automated deploy uses to skip a rebuild.

### Automated publishing

`.github/workflows/publish.yml` runs four times a day and redeploys **only** when
`publish-due` finds a post whose date has arrived but which is not yet on the live
site. On a quiet day it does nothing.

To enable it, add two repository secrets under **Settings → Secrets and variables
→ Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Until those exist the workflow builds but its deploy step will fail, so add them
before relying on it.

## Deploy

The blog ships inside the `portfolio` Worker. Two options:

- **Manual:** `bun run build` here, then `npm run deploy` from the repo root.
- **Automated (preferred):** the scheduled workflow above, which handles posts
  whose date has arrived. For everything else — a fix, a redesign — deploy by
  hand with `npm run deploy`.
- **Cloudflare Workers Builds:** build command `npm run build`, deploy command
  `npx wrangler deploy`, run from the repo root. The output `blog/` is gitignored and
  regenerated on every build.

`.assetsignore` in the repo root keeps the source (`blog-src/`, `node_modules`, configs)
and Astro internals out of the uploaded assets.

See [`THEME.md`](THEME.md) to change fonts or colors.
