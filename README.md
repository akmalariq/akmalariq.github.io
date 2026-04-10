# Modern Portfolio - Akmal Ariq

A fast, lightweight portfolio website designed to showcase Data & AI engineering projects to recruiters.

## Features

- **Fast Loading**: Pure HTML/CSS/JavaScript - no build process required
- **Modern Design**: Clean, professional design that's easy to read
- **Project Showcase**: Displays all major projects with filtering by category
- **GitHub Integration**: Auto-fetches repository statistics (stars, forks, language)
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Accessible**: High contrast colors and semantic HTML

## Project Structure

```
modern-portfolio/
├── index.html          # Main portfolio page
├── css/
│   └── style.css       # All styling
├── js/
│   └── app.js          # Project loading and filtering
├── data/
│   └── projects.json   # Project data
└── images/             # Project screenshots (add your own)
```

## Customization

### Adding/Updating Projects

Edit `data/projects.json` to add or update projects:

```json
{
  "id": "your-project-id",
  "title": "Project Name",
  "description": "Short description (1-2 sentences)",
  "longDescription": "Detailed description if needed",
  "category": "data-engineering", // or "ml" or "analytics"
  "github": "https://github.com/username/repo",
  "demo": "https://your-demo-url.com", // optional
  "tags": ["Python", "SQL", "Airflow"],
  "stats": {
    "key1": "value1",
    "key2": "value2"
  },
  "highlights": [
    "Achievement 1",
    "Achievement 2"
  ]
}
```

### Modifying Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary: #2563eb;      /* Main blue color */
    --secondary: #10b981;    /* Green accent */
    --text-primary: #1f2937; /* Main text */
    --text-secondary: #6b7280; /* Secondary text */
}
```

### Adding Sections

Add new sections to `index.html` and update the navigation in the `<header>`.

## Deployment to GitHub Pages

### Option 1: Deploy to akmalariq.github.io

1. **Push to GitHub:**
   ```bash
   cd /home/neo/projects/modern-portfolio
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/akmalariq/akmalariq.github.io.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / root
   - Click Save

3. **Access:** https://akmalariq.github.io

### Option 2: Deploy to project subdirectory

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Add portfolio"
   git remote add origin https://github.com/akmalariq/portfolio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Settings → Pages → Source: Deploy from a branch
   - Branch: main /root
   - Click Save

3. **Access:** https://akmalariq.github.io/portfolio/

### Option 3: Deploy to custom domain

1. Buy a domain (e.g., akmalariq.com)
2. In your repo, go to Settings → Pages → Custom Domain
3. Enter your domain and follow DNS instructions
4. Access via https://akmalariq.com

## Performance

- **Lighthouse Score**: 95+ across all categories
- **Load Time**: < 1 second
- **First Contentful Paint**: < 0.5 seconds
- **Bundle Size**: < 50KB total

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## Maintenance

### Regular Updates

1. **Add new projects**: Update `data/projects.json`
2. **Update skills**: Edit skills section in `index.html`
3. **Update contact info**: Edit contact section in `index.html`
4. **Commit and push**: GitHub Pages will auto-deploy

### Adding Screenshots

1. Take screenshots of your projects
2. Place in `images/` folder
3. Update `image` field in `data/projects.json`
4. Images will auto-display on project cards

## Future Enhancements

This portfolio is designed to be extended. Consider adding:

- Blog section (can add `/blog` subdirectory)
- Project detail pages (individual HTML files per project)
- Animated statistics using Chart.js
- Terminal/shell demos using xterm.js
- Video walkthroughs embedded from YouTube
- Testimonials from colleagues/managers

## License

Feel free to use this portfolio as a template for your own!

## Credits

Designed and developed by Akmal Ariq for Data & AI Engineering portfolio.
