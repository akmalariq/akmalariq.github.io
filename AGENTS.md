# akmalariq.dev — agent rules

Static portfolio + a data-engineering blog, built to `dist/` and served by
Cloudflare Pages (`akmalariq`). Two build inputs: hand-written HTML at the
repo root, and an Astro blog in `blog-src/` that outputs to `blog/`.

**Design system rule #1: structure and theme are separate.** Components read
design tokens; they never hardcode a colour, radius, font or duration. If you
are typing a colour value into a component, stop and add a token instead.

---

## Commands

```bash
npm run check:structure   # structural checks — run this first, it catches drift in a second
npm run build:site        # assemble dist/ from the HTML + blog output (no blog rebuild)
npm run build:blog        # sync tokens, then Astro build -> blog/
npm run build             # check:structure && build:blog && build:site
npm run deploy            # build, then wrangler pages deploy dist --project-name akmalariq --branch main
npm run sync:tokens       # regenerate the blog's token copy from css/tokens.css
```

`npm run build` runs the structural checks first and **aborts on failure**, so drift
cannot be deployed. If a check fails, the message names the file and the fix.

`build:site` alone is enough when you only touched root HTML/CSS/JS.
**Run `build:blog` (or `npm run build`) whenever the shared CSS or the blog
layout changes** — the blog is a separate build and will otherwise serve stale
tokens.

Always prefix shell commands with `rtk` (see the parent `projects/AGENTS.md`).

---

## The design system

### One token file

`css/tokens.css` is the **single source of truth** for the whole site.

```
1. primitives   fonts · spacing · shape · motion · layout   ← never themed
2. palettes     [data-theme="dark"] · ["light"] · ["contrast"]   ← colour only
```

- `css/style.css` and `css/site.css` contain **zero token declarations**. If
  you find yourself adding `:root { --… }` to either, you are recreating the
  duplication this replaced.
- `blog-src/src/styles/tokens.css` is **generated**. Never edit it — edit
  `css/tokens.css` and run `npm run sync:tokens`.

### Themes are attributes, not classes

The theme lives on `<html data-theme="dark|light|contrast">`.

- Never write `html.light` or `html.dark` — both were fully migrated away.
  Use `[data-theme="…"]`.
- Dark is the default, so `:root` alone must look correct before the bootstrap
  runs. Any new theme block needs a `:root, [data-theme="dark"]`-style default
  or an explicit attribute selector.
- Every page sets the attribute **inline in `<head>`, before first paint**, so
  there is no flash. Copy that bootstrap block verbatim when adding a page.

**Adding a theme:**

1. Add a palette block to `css/tokens.css` (copy an existing one).
2. Add the name to `THEMES` in `js/nav.js`.
3. Add it to the `THEMES` array in the page bootstrap(s) — main site HTML and
   `blog-src/src/layouts/Base.astro`.
4. Add any icon rules to `css/nav.css` if it needs a different toggle glyph.
5. Add the cursor to `blog-src/src/styles/blog.css` if code blocks need it
   (`.astro-code` keys off `[data-theme="dark"]`).

All five steps, or the theme will half-work.

### The navbar is one component

`css/nav.css` + `js/nav.js` own the header everywhere — homepage, `/projects`,
case studies, demo, and all blog pages.

- Never restyle the header from a page stylesheet. `nav.css` deliberately
  states its own type metrics and `text-decoration` because host pages style
  bare `<a>` elements and those leak.
- Header markup must stay **identical on every page**, including order:
  `Services · Pricing · About │ Work · Blog · Get in touch`.
  In-page anchors come first; links that leave the page sit right of the divider.
- Pointer-only hover effects go inside `@media (hover: hover) and (pointer: fine)`.
  Touch devices fire `:hover` on tap and leave links stuck.
- Pressable things get `:active { transform: scale(0.97) }`.

---

## Adding a page

The header is duplicated as markup (it is a static site; there is no templating
for the root pages). Copy the `<head>` and `<header>` from an existing page such
as `projects/index.html` and keep these intact:

```html
<link rel="stylesheet" href="/css/fonts.css">
<link rel="stylesheet" href="/css/tokens.css">   <!-- must precede components -->
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/site.css">     <!-- after style.css -->
<link rel="stylesheet" href="/css/nav.css">      <!-- last, wins -->
<script src="/js/nav.js" defer></script>
<script src="/js/app.js" defer></script>
```

Then register the directory in `ENTRIES` in `scripts/build-site.mjs` — anything
not listed is never copied to `dist/`, and the failure is silent.

Use root-absolute asset paths (`/css/…`, `/data/…`). A relative path that works
on `/` resolves somewhere else on `/projects/`.

---

## File map

```
css/tokens.css        ALL design tokens + every theme palette
css/nav.css           shared header (the only place navbar CSS belongs)
css/style.css         legacy base + components (no tokens)
css/site.css          current components, loads after style.css (no tokens)
js/nav.js             theme cycle, mobile menu, active nav state
js/app.js             page behaviour: projects grid, reveals, tabs
data/projects.json    project cards. stats/highlights/tags/flow are REQUIRED keys
images/projects/      card preview screenshots (see `preview` in projects.json)
scripts/build-site.mjs   assembles dist/, minifies CSS, versions assets
scripts/sync-tokens.mjs  copies css/tokens.css -> blog-src/src/styles/tokens.css
blog-src/             Astro blog (outputs to ../blog, gitignored)
404.html              standalone; NOT on the design system (own inline tokens)
```

`dist/` and `blog/` are generated and gitignored. Never edit them.

---

## Traps that have bitten before

| Trap | Why it happens |
| --- | --- |
| A page looks like a different site | It is missing a stylesheet from the chain above, most often `site.css` |
| Navbar styles stop applying | `nav.css` was loaded before `site.css` instead of after |
| Theme toggle does nothing in the blog | The blog needs `js/nav.js`, and its tokens come from the **generated** file |
| A new page 404s | Its directory is not in `ENTRIES` in `scripts/build-site.mjs` |
| Project card renders blank | `data/projects.json` entry is missing `tags` (or `title`/`description`) — the renderer uses them directly |
| Card has no screenshot | the entry has no `preview`; add `images/projects/<id>.jpg` (16:10, top-left framed) and point `preview` at it |
| Data fetch works on `/` but not a subpage | Relative URL; make it root-absolute |
| Blog shows stale colours | `build:site` was run without `build:blog` |
| Buttons vanish in the blog | Blog names its button `.btn--primary`, the main site `.btn-primary`. Navbar CTA is styled in `nav.css` for this reason |

---

## Verify before saying done

```bash
npm run check:structure   # must print "Structure is intact."
npm run build
npx wrangler pages deploy dist --project-name akmalariq --branch main
```

### What the checker enforces

`scripts/check-structure.mjs` fails on any of these:

| Check | Catches |
| --- | --- |
| tokens centralised | a `--token:` declaration in `style.css` / `site.css` |
| themes are attributes | `html.light` or `html.dark` creeping back in |
| blog tokens synced | the generated blog tokens not matching `css/tokens.css` exactly |
| page contract | a page missing `tokens.css` / `nav.css` / `nav.js` / the theme bootstrap, or loading them out of order |
| nav order | the navbar reordered, a missing divider, a missing CTA |
| projects data | a `data/projects.json` entry missing `stats` / `highlights` / `tags` (the card renders blank) |
| build entries | a top-level directory that publishes HTML but is absent from `ENTRIES` |

`404.html` is exempt by design: it is standalone with its own inline tokens and
no navbar. Add to `EXEMPT_PAGES` if another page genuinely needs the same.

Then check the actual served output — not the source:

```bash
# every page type loads the same navbar and tokens
for p in / /projects/ /blog/ /projects/earthquake/ /demo/; do
  curl -sL "https://akmalariq.dev$p" | grep -oE '(nav|tokens)\.css\?v=[a-f0-9]+' | sort -u
done

# nav order identical everywhere: 5 links, 1 divider, 1 CTA
curl -sL https://akmalariq.dev/projects/ | grep -c 'nav-divider'
```

The build versions assets with `?v=<hash>`, so a change is only live when the
hash changes. If the hash looks unchanged, the build did not pick up your edit.

---

## Cloudflare account

Everything here and the OOH planner at `/projects/ooh-media-planner` share one
Cloudflare account, currently on the **Free** tiers. Nothing is billed.

| | Free ceiling | Actual use |
| --- | --- | --- |
| Pages requests | unlimited (static) | — |
| Worker requests | 100,000/day | ~9/day |
| Worker CPU | 10 ms/invocation | over, but absorbed — see below |
| D1 rows read | 5,000,000/day | ~108,000/24h |

**Worker CPU is the only tight limit.** The planner's CPU p50 peaks near 30 ms
against a 10 ms cap, yet invocation status over 30 days reads 279 success,
0 `exceededCpu`. Cloudflare allows each isolate *"built-in flexibility ... where
your Worker infrequently runs over the configured limit"*, and that Worker runs
about nine times a day, so overages stay rare. **That is volume-dependent, not
permanent** — sustained traffic would start producing `exceededCpu` and that,
not a date, is what would justify Workers Paid ($5/month).

Billing cannot be read with the OAuth token on this machine (it lacks the
billing scope). Billing profile, subscriptions and the next payment date are
only visible at **dash.cloudflare.com → account → Billing → Subscriptions**.

Account: `Akmalariqs@gmail.com's Account` · `db18b6090d3cd75544c171d79d793f5a`
· created 2026-01-14.

## Content conventions

- SEO per page: unique `<title>`, `meta description`, `canonical`, OG and
  Twitter tags, and JSON-LD where it fits.
- `sitemap.xml` is hand-maintained — add new public pages.
- Analytics (GTM) is injected by `scripts/build-site.mjs`; never hardcode a tag.
- Blog posts live in `blog-src/src/content/`; the blog is the reference for the
  visual language, the root pages follow it.
