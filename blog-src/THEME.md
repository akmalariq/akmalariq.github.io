# Theme

The blog's look is controlled by **one file**: [`src/styles/tokens.css`](src/styles/tokens.css).
Layout and prose rules in `src/styles/blog.css` never hardcode a font, so re-skinning is a
token change, not a rewrite.

## Change the fonts

1. Edit the three font tokens in `src/styles/tokens.css`:

   ```css
   --font-display: 'EB Garamond', Georgia, serif;   /* headings */
   --font-sans: 'Manrope', ...;                     /* body + UI */
   --font-mono: 'JetBrains Mono', ...;              /* code */
   ```

2. Update the matching Google Fonts `<link>` in `src/layouts/Base.astro` (search for
   `fonts.googleapis.com`).

That is the whole change. Nothing else references a font family by name.

## Change the palette

Edit the `:root, html.dark { … }` and `html.light { … }` blocks in `tokens.css`. Tokens are
`oklch()` values shared with the main site (`portfolio/css/style.css`), so keeping the names
identical keeps the blog visually continuous with `akmalariq.dev`.

Key tokens: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`,
`--border`, `--accent`, `--accent-dim`, `--code-bg`.

## Theme switching

Dark is the default. An inline script in `Base.astro` applies `html.dark` / `html.light`
before first paint; the toggle button persists the choice in `localStorage`.

## Deliberate constraint

Fonts are loaded from Google Fonts via a `<link>` in the head. If you later want
self-hosted or system fonts, swap that link for a `@font-face` block inside `tokens.css`
(or add a `public/fonts/` directory) — again, no layout changes required.
