#!/usr/bin/env node
// Structural checks for the design system.
//
// The failures this catches have all happened: tokens re-declared in a
// component file, a page missing a stylesheet from the chain, the blog's
// generated tokens drifting from the source, the navbar reordered on one page
// only. Each was found by eye, late. This finds them in a second.
//
//   node scripts/check-structure.mjs
//
// Exits non-zero on any failure.

import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];

const read = (p) => readFile(join(ROOT, p), "utf8").catch(() => null);
const fail = (check, detail) => failures.push({ check, detail });
const note = (msg) => notes.push(msg);

// 404 is deliberately standalone: it has its own inline tokens and no navbar.
const EXEMPT_PAGES = new Set(["404.html"]);

// ---------------------------------------------------------------- 1. tokens --

async function checkTokensAreCentralised() {
  for (const file of ["css/style.css", "css/site.css"]) {
    const css = await read(file);
    if (!css) continue;
    // Strip comments and var() references, then look for declarations
    // anywhere: a token on the same line as its selector counts too.
    const declarations =
      css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/var\([^)]*\)/g, "")
        .match(/--[a-z0-9-]+\s*:/gi) ?? [];
    if (declarations.length) {
      fail(
        "tokens centralised",
        `${file} declares ${declarations.length} token(s): ${declarations
          .slice(0, 3)
          .map((d) => d.trim())
          .join(", ")} — tokens belong in css/tokens.css`,
      );
    }
  }

  const tokens = await read("css/tokens.css");
  if (!tokens) fail("tokens centralised", "css/tokens.css is missing");
  else if (!tokens.includes(':root,\n[data-theme="dark"]') && !tokens.includes(":root,")) {
    fail("tokens centralised", "css/tokens.css has no dark default palette");
  }
}

// --------------------------------------------------------------- 2. data-theme --

async function checkNoClassBasedThemes() {
  const files = [
    "css/nav.css",
    "css/site.css",
    "css/style.css",
    "css/tokens.css",
    "blog-src/src/styles/blog.css",
  ];
  for (const file of files) {
    const css = await read(file);
    if (!css) continue;
    const hits = css.match(/html\.(light|dark)\b/g) ?? [];
    if (hits.length) {
      fail("themes are attributes", `${file} still uses ${[...new Set(hits)].join(", ")} — use [data-theme="…"]`);
    }
  }
}

// --------------------------------------------------- 3. generated blog tokens --

async function checkBlogTokensSynced() {
  const source = await read("css/tokens.css");
  const generated = await read("blog-src/src/styles/tokens.css");

  if (!source || !generated) {
    fail("blog tokens synced", "css/tokens.css or blog-src/src/styles/tokens.css is missing");
    return;
  }

  // The generator writes a banner then the source verbatim, so an exact
  // comparison is both the strongest check and the simplest one.
  const withoutBanner = generated.replace(/^\/\* GENERATED FILE[\s\S]*?\*\/\n\n/, "");
  if (withoutBanner.trim() !== source.trim()) {
    fail(
      "blog tokens synced",
      "blog-src/src/styles/tokens.css no longer matches css/tokens.css — run: npm run sync:tokens",
    );
  }
}

// ----------------------------------------------------------- 4. page contract --

async function htmlPages() {
  const out = [];
  const walk = async (dir) => {
    for (const entry of await readdir(join(ROOT, dir), { withFileTypes: true })) {
      const rel = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "blog-src", "dist", "blog", ".git"].includes(entry.name)) continue;
        await walk(rel);
      } else if (entry.name.endsWith(".html")) {
        // Skip stub files (Google site verification, hashed ownership files)
        const body = await readFile(join(ROOT, rel), "utf8");
        if (/<html/i.test(body)) out.push(rel);
      }
    }
  };
  await walk(".");
  return out;
}

async function checkPageContract() {
  const pages = await htmlPages();
  const required = [
    ["/css/tokens.css", "tokens"],
    ["/css/nav.css", "navbar styles"],
    ["/js/nav.js", "navbar behaviour"],
    ["data-theme", "theme bootstrap"],
  ];

  for (const page of pages) {
    if (EXEMPT_PAGES.has(page)) continue;
    const html = await read(page);
    if (!html) continue;

    for (const [needle, label] of required) {
      if (!html.includes(needle)) {
        fail("page contract", `${page} is missing ${label} (${needle})`);
      }
    }

    // Tokens must be in place before the components that read them. Parse the
    // actual <link> tags: a raw indexOf also matches the filename in comments.
    const order = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((href) => !/^https?:/.test(href))   // CDN sheets are not ours
      .map((href) => (href.match(/([a-z-]+\.css)/) ?? [])[1])
      .filter(Boolean);

    const EXPECTED = ["fonts.css", "tokens.css", "style.css", "site.css", "nav.css"];
    const ours = order.filter((f) => EXPECTED.includes(f));
    const sorted = [...ours].sort((a, b) => EXPECTED.indexOf(a) - EXPECTED.indexOf(b));
    if (ours.join() !== sorted.join()) {
      fail("page contract", `${page} loads stylesheets out of order: [${ours.join(", ")}] — expected [${sorted.join(", ")}]`);
    }
  }
  note(`checked ${pages.length - EXEMPT_PAGES.size} page(s), skipped ${EXEMPT_PAGES.size} exempt`);
}

// -------------------------------------------------------------- 5. nav order --

// The CTA carries .btn.nav-cta, not .nav-link, and is asserted separately.
const NAV_ORDER = ["Services", "Pricing", "About", "Work", "Blog"];

async function checkNavConsistency() {
  const pages = (await htmlPages()).filter((p) => !EXEMPT_PAGES.has(p));
  for (const page of pages) {
    const html = await read(page);
    if (!html) continue;
    const labels = [...html.matchAll(/class="nav-link"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
    if (labels.join("|") !== NAV_ORDER.join("|")) {
      fail(
        "nav order",
        `${page} renders [${labels.join(", ")}] — expected [${NAV_ORDER.join(", ")}]`,
      );
    }
    const dividers = (html.match(/nav-divider/g) ?? []).length;
    if (dividers !== 1) {
      fail("nav order", `${page} has ${dividers} nav divider(s), expected 1 (between scroll and page links)`);
    }
    if (!html.includes("nav-cta")) fail("nav order", `${page} has no nav CTA`);
  }
}

// ------------------------------------------------------- 6. projects.json data --

async function checkProjectsData() {
  const raw = await read("data/projects.json");
  if (!raw) return fail("projects data", "data/projects.json is missing");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return fail("projects data", `data/projects.json is not valid JSON: ${error.message}`);
  }
  const required = ["id", "title", "description", "category", "tags", "stats", "highlights", "flow"];
  for (const project of parsed.projects ?? []) {
    const missing = required.filter((key) => project[key] === undefined);
    if (missing.length) {
      fail(
        "projects data",
        `"${project.id ?? "?"}" is missing ${missing.join(", ")} — the card renderer calls .map on highlights and Object.entries on stats`,
      );
    }
  }
  const ids = new Set();
  for (const project of parsed.projects ?? []) {
    if (ids.has(project.id)) fail("projects data", `duplicate project id: ${project.id}`);
    ids.add(project.id);
  }
}

// --------------------------------------------------- 7. build entries coverage --

async function checkBuildEntries() {
  const script = await read("scripts/build-site.mjs");
  if (!script) return;
  const entries = [...(script.match(/const ENTRIES = \[([\s\S]*?)\];/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
    (m) => m[1],
  );

  const topLevelDirs = (await readdir(ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((n) => !["node_modules", "blog-src", "dist", "blog", ".git", ".wrangler", ".github"].includes(n));

  for (const dir of topLevelDirs) {
    if (entries.includes(dir)) continue;
    // Only tooling-free directories that actually publish HTML matter here.
    const html = (await readdir(join(ROOT, dir), { withFileTypes: true })).some(
      (e) => e.isFile() && e.name.endsWith(".html"),
    );
    if (html) {
      fail(
        "build entries",
        `top-level "${dir}/" publishes HTML but is not in ENTRIES in scripts/build-site.mjs — it will not reach dist/`,
      );
    }
  }
  for (const entry of entries) {
    const exists = await stat(join(ROOT, entry)).then(() => true).catch(() => false);
    // "blog" is generated, so it only exists after build:blog
    if (!exists && entry !== "blog") {
      fail("build entries", `ENTRIES lists "${entry}" but it does not exist`);
    }
  }
}

// ------------------------------------------------------------------- report --

const checks = [
  ["tokens centralised", checkTokensAreCentralised],
  ["themes are attributes", checkNoClassBasedThemes],
  ["blog tokens synced", checkBlogTokensSynced],
  ["page contract", checkPageContract],
  ["nav order", checkNavConsistency],
  ["projects data", checkProjectsData],
  ["build entries", checkBuildEntries],
];

console.log("Checking design-system structure…\n");

for (const [name, run] of checks) {
  const before = failures.length;
  await run();
  const added = failures.length - before;
  console.log(`  ${added === 0 ? "ok  " : "FAIL"}  ${name}${added ? ` (${added})` : ""}`);
}

for (const n of notes) console.log(`\n  note: ${n}`);

if (failures.length) {
  console.log("");
  for (const { check, detail } of failures) {
    console.log(`  [${check}] ${detail}`);
  }
  console.log(`\n${failures.length} structural problem(s). See AGENTS.md.`);
  process.exit(1);
}

console.log("\nStructure is intact.");
