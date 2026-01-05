# Agent Guidelines for akmalariq.github.io

This is a static personal portfolio website built with pure HTML and CSS, hosted on GitHub Pages.

## Build/Test/Lint Commands

This project uses no build tools - it's pure static HTML/CSS.

**No package.json exists** - this is not a Node.js project.

**No linting configured** - there are no linters like ESLint or Prettier set up.

**No tests** - this is a static site with no test framework.

### Local Development
Simply open `index.html` in a browser or use a simple HTTP server:
```bash
python3 -m http.server 8000
# or
npx serve .
```

### Deployment
The site is deployed via GitHub Pages. No build commands needed.

## Code Style Guidelines

### HTML
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<section>`, `<footer>`)
- Include proper meta tags: charset, viewport, description
- Maintain logical nesting structure
- Use kebab-case for IDs and class names
- External images should use HTTPS URLs (currently using Unsplash)
- Emoji are acceptable in content sections for visual appeal

### CSS
- **File Location**: All CSS goes in `assets/css/style.css`
- **Custom Properties**: Define colors and theme variables in `:root`
- **Theming**: Support both dark (default) and light themes using `@media (prefers-color-scheme: light)`
- **Colors**: Use CSS variables with semantic names like `--bg-primary`, `--text-primary`, `--accent`
- **Typography**: Use Google Fonts 'Inter' - link is already included
- **Spacing**: Use `rem` units for consistent scaling
- **Comments**: Use `/* === SECTION NAME === */` for major section dividers
- **Responsive**: Include `@media (max-width: 768px)` breakpoints for mobile
- **Transitions**: Use `transition: all 0.2s` or similar for hover effects
- **Z-index**: Keep decorative elements at `z-index: 0`, content at `z-index: 1`

### CSS Organization
1. Root variables and theme definitions
2. Global resets and body styles
3. Gradient decorations (fixed background elements)
4. Container layout
5. Header/Navigation
6. Hero section
7. Social links
8. Sections (Work, Services, About)
9. Cards (project cards, service cards)
10. Footer
11. Responsive breakpoints

### Naming Conventions
- **Classes**: kebab-case (e.g., `project-card`, `socials`, `section-title`)
- **IDs**: kebab-case (e.g., `work`, `about`, `services`)
- **Files**: kebab-case (e.g., `style.css`, `index.html`)

### New Features
- Maintain the dark/light theme pattern for any new styling
- Keep CSS custom properties in `:root` and the light theme media query
- Use semantic HTML5 elements when adding new sections
- Match existing spacing patterns: sections use `padding: 4rem 0`
- Follow the visual consistency: card backgrounds, borders, hover effects

### Error Handling
This is a static site - no server-side code. For broken images or links:
- Use external image services with reliable URLs (e.g., Unsplash)
- Test all links work before deploying
- Use `target="_blank"` for external links to keep user on portfolio

### Project Structure
```
/
├── index.html           # Main portfolio page
├── assets/
│   └── css/
│       └── style.css   # All styles
└── README.md           # Basic project info
```

When adding new projects or sections, follow the existing patterns in `index.html` and add corresponding styles to `assets/css/style.css`.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
