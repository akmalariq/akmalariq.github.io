// ==============================
// Load Projects
// ==============================
// The grid is data-driven from /data/projects.json. It deliberately makes no
// third-party calls: fetching GitHub stars for each card added a network
// dependency and surfaced a row of zeroes, which read worse than no row at all.
async function loadProjects() {
    try {
        const response = await fetch('/data/projects.json');
        const data = await response.json();
        return Array.isArray(data.projects) ? data.projects : [];
    } catch {
        return [];
    }
}

const CATEGORY_LABELS = {
    "data-engineering": "Data Engineering",
    "data-science": "Data Science",
    "data-analytics": "Data Analytics",
    "product": "Product",
};

function categoryLabel(category) {
    return CATEGORY_LABELS[category] || category;
}

// ==============================
// Render Project Card
// ==============================
const GITHUB_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>';

const ARROW_EXTERNAL = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';
const ARROW_INTERNAL = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';

function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = project.featured ? 'project-card featured' : 'project-card';
    card.dataset.category = project.category || '';

    const demoHref = project.demo || null;
    const caseHref = project.caseStudy || null;
    const ghHref = project.github || null;

    // One primary action, and a live app always wins it.
    let primaryHref = null;
    let primaryLabel = '';
    if (demoHref) {
        primaryHref = demoHref;
        primaryLabel = project.demoLabel || 'Open live demo';
    } else if (caseHref) {
        primaryHref = caseHref;
        primaryLabel = 'Read case study';
    } else if (ghHref) {
        primaryHref = ghHref;
        primaryLabel = 'View on GitHub';
    }
    const primaryExternal = /^https?:\/\//i.test(primaryHref || '');

    // The screenshot is the point of the card. It links to the same place as
    // the primary button, so it is decorative to assistive tech (the button is
    // the accessible link of record).
    const media = project.preview && primaryHref
        ? `<a class="project-media" href="${escapeHtml(primaryHref)}"${primaryExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} tabindex="-1" aria-hidden="true">
            <img src="${escapeHtml(project.preview)}" alt="" width="1280" height="800" loading="lazy" decoding="async">
            ${demoHref ? '<span class="project-media__badge">Live demo</span>' : ''}
        </a>`
        : '';

    const tags = Array.isArray(project.tags) ? project.tags : [];
    const tagsHtml = tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

    const primaryButton = primaryHref
        ? `<a class="btn btn-primary" href="${escapeHtml(primaryHref)}"${primaryExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(primaryLabel)}${primaryExternal ? ARROW_EXTERNAL : ARROW_INTERNAL}</a>`
        : '';

    const secondaryButton = caseHref && primaryHref !== caseHref
        ? `<a class="btn btn-secondary" href="${escapeHtml(caseHref)}">Case study</a>`
        : '';

    const githubLink = ghHref && primaryHref !== ghHref
        ? `<a class="project-link" href="${escapeHtml(ghHref)}" target="_blank" rel="noopener noreferrer">${GITHUB_ICON}<span>GitHub</span></a>`
        : '';

    const kicker = [
        project.featured ? '<span class="project-kicker__flag">Featured</span>' : '',
        project.category ? escapeHtml(categoryLabel(project.category)) : '',
    ].filter(Boolean).join('<span class="project-kicker__sep" aria-hidden="true">/</span>');

    const htmlString = `
        ${media}
        <div class="project-body">
            ${kicker ? `<p class="project-kicker">${kicker}</p>` : ''}
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-description">${escapeHtml(project.description)}</p>
            ${tagsHtml ? `<div class="project-tags">${tagsHtml}</div>` : ''}
            <div class="project-links">
                ${primaryButton}
                ${secondaryButton}
                ${githubLink}
            </div>
        </div>`;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    while (doc.body.firstChild) {
        card.appendChild(doc.body.firstChild);
    }

    return card;
}

// Prevent XSS when injecting user-derived content
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==============================
// Scrollspy — highlight active nav link
// ==============================
function initScrollspy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    const on = link.getAttribute('href') === `#${entry.target.id}`;
                    link.classList.toggle('active', on);
                    // aria-current tells screen-reader users where they are,
                    // which the .active class alone cannot do.
                    if (on) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(section => observer.observe(section));
}

// ==============================
// Header scroll shadow
// ==============================
// ==============================
// Smooth scroll
// ==============================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ==============================
// Scroll reveal
// ==============================
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal, .reveal-grid');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

// ==============================
// Skill bar animation
// ==============================
function initSkillBars() {
    const skillsSection = document.querySelector('.skills');
    if (!skillsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('skills-animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(skillsSection);
}

// ==============================
// Back to Top
// ==============================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.hidden = window.scrollY < 400;
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ==============================
// Showcase Tabs (progressive enhancement)
// Tabs are a JS affordance; without JS both panes stack and stay readable.
// ==============================
function initShowcaseTabs() {
    const tabs = Array.from(document.querySelectorAll('.showcase-tabs [role="tab"]'));
    if (tabs.length === 0) return;

    const panes = tabs
        .map(tab => document.getElementById(tab.getAttribute('aria-controls')))
        .filter(Boolean);

    const select = (tab) => {
        tabs.forEach(t => {
            const on = t === tab;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
        });
        panes.forEach(pane => {
            const on = pane.id === tab.getAttribute('aria-controls');
            pane.classList.toggle('active', on);
            pane.hidden = !on;
        });
    };

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', (e) => {
            const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (!dir) return;
            e.preventDefault();
            const next = tabs[(i + dir + tabs.length) % tabs.length];
            next.focus();
            select(next);
        });
    });

    // Establish the initial state so the inactive pane is properly hidden.
    select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
}

// ==============================
// ==============================
// Category filter (progressive enhancement)
// Renders only where #projectFilters exists, so the homepage keeps one flat grid.
// ==============================
function initProjectFilters(projects, grid) {
    const bar = document.getElementById('projectFilters');
    if (!bar) return;

    const categories = [];
    projects.forEach(project => {
        if (project.category && !categories.includes(project.category)) categories.push(project.category);
    });

    const options = [{ value: 'all', label: 'All work' }]
        .concat(categories.map(category => ({ value: category, label: categoryLabel(category) })));

    const buttons = options.map(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-filter';
        button.textContent = option.label;
        button.dataset.filter = option.value;
        button.setAttribute('aria-pressed', option.value === 'all' ? 'true' : 'false');
        button.addEventListener('click', () => apply(option.value));
        bar.appendChild(button);
        return button;
    });

    function apply(value) {
        buttons.forEach(button => {
            button.setAttribute('aria-pressed', button.dataset.filter === value ? 'true' : 'false');
        });
        grid.querySelectorAll('.project-card').forEach(card => {
            card.hidden = value !== 'all' && card.dataset.category !== value;
        });
    }
}

// ==============================
// Init
// ==============================
async function initPortfolio() {
    // Non-blocking UI setup first
    initSmoothScroll();
    initScrollReveal();
    initSkillBars();
    initBackToTop();
    initScrollspy();
    initShowcaseTabs();

    // The grid renders wherever #projectsGrid exists (homepage and /projects).
    // The fetch below is root-absolute on purpose: on /projects a relative
    // "data/projects.json" would resolve to /projects/data/... and 404.
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const projects = await loadProjects();

    // Clear noscript fallback
    grid.replaceChildren();

    if (projects.length === 0) {
        const fallbackText = document.createElement('p');
        fallbackText.style.textAlign = 'center';
        fallbackText.style.color = 'var(--text-secondary)';
        fallbackText.textContent = 'No projects found. Check back soon!';
        grid.appendChild(fallbackText);
        return;
    }

    projects.forEach(project => grid.appendChild(createProjectCard(project)));
    initProjectFilters(projects, grid);

    // Trigger reveal now that cards are in the DOM
    requestAnimationFrame(() => {
        const gridEl = document.querySelector('.reveal-grid');
        if (gridEl) gridEl.classList.add('visible');
    });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
