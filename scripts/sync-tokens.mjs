#!/usr/bin/env node
// Generate the blog's token stylesheet from the canonical one.
//
// The blog is a separate Astro build with its own src/ tree, and importing a
// CSS file from outside its root is fragile. Rather than keep two hand-edited
// copies in sync (which is how the navbar drifted), css/tokens.css is the
// single source and this writes the blog's copy from it.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SOURCE = join(ROOT, "css", "tokens.css");
const TARGET = join(ROOT, "blog-src", "src", "styles", "tokens.css");

const banner = `/* GENERATED FILE — do not edit.
   Source: portfolio/css/tokens.css
   Regenerate: node scripts/sync-tokens.mjs (runs as part of npm run build:blog)
   Edit the source, not this file. */

`;

const source = await readFile(SOURCE, "utf8");
await writeFile(TARGET, banner + source);
console.log(`  tokens synced -> blog-src/src/styles/tokens.css (${source.length} bytes)`);
