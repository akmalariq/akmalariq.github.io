import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// Output is written to the sibling `blog/` directory, which the existing
// `portfolio` Cloudflare Worker already serves at https://akmalariq.dev/blog/
// because its `assets.directory` is the repo root.
export default defineConfig({
  site: "https://akmalariq.dev",
  base: "/blog",
  outDir: "../blog",
  publicDir: "./public",
  trailingSlash: "always",
  build: {
    format: "directory",
    assets: "_assets",
  },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: false,
    },
  },
  integrations: [mdx()],
});
