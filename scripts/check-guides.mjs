#!/usr/bin/env node
// Guards the one duplication the store cannot avoid: the prices printed in
// guides/index.html are static (for SEO and no-JS), while the order endpoint
// reads content/guides.json. This fails the build when they drift, when a
// checkout link points at an unknown product, or when a PDF is missing.
//
//   node scripts/check-guides.mjs
//
// Exits non-zero on any failure.

import { readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const read = (p) => readFile(join(ROOT, p), "utf8");
const exists = (p) => stat(join(ROOT, p)).then(() => true).catch(() => false);

const config = JSON.parse(await read("content/guides.json"));
const html = await read("guides/index.html");

const launchEnd = Date.parse(config.launch?.ends_at ?? "");
const onLaunch = Number.isFinite(launchEnd) && Date.now() < launchEnd;

const current = (product) => {
  const regular = Number(product.price);
  const promo = Number(product.launch_price);
  return onLaunch && promo > 0 && promo < regular ? promo : regular;
};

for (const product of config.products) {
  const block = html.match(
    new RegExp(
      `data-product="${product.id}"[^>]*data-price="(\\d+)"[^>]*data-regular="(\\d+)"`,
    ),
  );

  if (!block) {
    failures.push(`guides/index.html has no data-product="${product.id}" price block`);
    continue;
  }

  const printed = Number(block[1]);
  const printedRegular = Number(block[2]);
  const expected = current(product);

  if (printed !== expected) {
    failures.push(
      `${product.id}: page prints Rp ${printed}, catalogue says Rp ${expected} — update both, or the checkout will charge a different amount`,
    );
  }
  if (printedRegular !== Number(product.price)) {
    failures.push(
      `${product.id}: page regular price is Rp ${printedRegular}, catalogue has Rp ${product.price}`,
    );
  }
  if (!html.includes(`/guides/checkout/?p=${product.id}`)) {
    failures.push(`${product.id}: no checkout link on /guides/`);
  }

  if (product.kind === "bundle") {
    const singles = (product.includes_products ?? [])
      .map((id) => config.products.find((p) => p.id === id))
      .filter(Boolean);
    if (singles.length !== (product.includes_products ?? []).length) {
      failures.push(`${product.id}: includes_products names an unknown guide`);
    }
    // The printed saving must match the launch prices actually shown above.
    const sum = singles.reduce((total, p) => total + current(p), 0);
    const saving = sum - current(product);
    const printedSaving = html.match(/Hemat Rp ([\d.]+) dibanding beli terpisah/);
    if (printedSaving) {
      const value = Number(printedSaving[1].replace(/\./g, ""));
      if (value !== saving) {
        failures.push(
          `bundle: page says the saving is Rp ${value}, the current prices make it Rp ${saving}`,
        );
      }
    }
  } else {
    if (!product.file) failures.push(`${product.id}: no PDF file in the catalogue`);
    else if (!(await exists(`guides/${product.file}`))) {
      failures.push(`${product.id}: PDF missing at guides/${product.file}`);
    }
  }
}

if (!(await exists("guides/sample.pdf"))) failures.push("guides/sample.pdf is missing");

// Server-only paths must never appear in shipped HTML.
for (const product of config.products) {
  if (product.file && html.includes(product.file)) {
    failures.push(`${product.id}: the private PDF path is printed on /guides/`);
  }
}

if (failures.length) {
  console.log("Guide store check failed:\n");
  for (const failure of failures) console.log(`  - ${failure}`);
  console.log("");
  process.exit(1);
}

console.log(
  `Guide store ok: ${config.products.length} product(s), ${onLaunch ? "launch" : "regular"} prices, PDFs present.`,
);
