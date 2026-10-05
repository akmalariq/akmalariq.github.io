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
const CHEVRON_LEFT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const CHEVRON_RIGHT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

function createProjectCard(project, options = {}) {
    // `hero` is decided by the caller. The /projects/ index promotes exactly one
    // card so the grid below it stays uniform; the homepage keeps every
    // featured card in its wide treatment.
    const hero = options.hero === true;
    const card = document.createElement('article');
    card.className = hero ? 'project-card featured' : 'project-card';
    card.dataset.category = project.category || '';
    card.dataset.format = projectFormat(project);

    // A project can have any number of demos — a live app, a hosted dashboard, a
    // sample of the output it produces. They are ordered strongest-first, and the
    // first one is the card's primary action.
    const demos = (Array.isArray(project.demos) ? project.demos : [])
        .filter(d => d && d.url)
        .map(d => ({ label: d.label || 'Open live demo', url: d.url, kind: d.kind || 'app' }));

    const demoHref = demos.length ? demos[0].url : null;
    const caseHref = project.caseStudy || null;
    const ghHref = project.github || null;

    // One primary action, and a live app always wins it.
    let primaryHref = null;
    let primaryLabel = '';
    if (demoHref) {
        primaryHref = demoHref;
        primaryLabel = demos[0].label;
    } else if (caseHref) {
        primaryHref = caseHref;
        primaryLabel = 'Read case study';
    } else if (ghHref) {
        primaryHref = ghHref;
        primaryLabel = 'View on GitHub';
    }
    const primaryExternal = /^https?:\/\//i.test(primaryHref || '');

    // Any demos beyond the first get their own buttons, so a project with two or
    // three ways to look at it does not hide the extras behind the primary.
    const extraDemoButtons = demos.slice(1).map(d => {
        const ext = /^https?:\/\//i.test(d.url);
        return `<a class="btn btn-secondary" href="${escapeHtml(d.url)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(d.label)}${ext ? ARROW_EXTERNAL : ARROW_INTERNAL}</a>`;
    }).join('');

    // The screenshot is the point of the card. It links to the same place as
    // the primary button, so it is decorative to assistive tech (the button is
    // the accessible link of record).
    //
    // Only four projects have a screenshot today, so the index shows one on the
    // hero and keeps the rest text-only: a grid where a third of the cards are
    // twice as tall as the others is not a grid. Turn `media` back on everywhere
    // once every entry has a `preview`.
    const media = options.media !== false && project.preview && primaryHref
        ? `<a class="project-media" href="${escapeHtml(primaryHref)}"${primaryExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} tabindex="-1" aria-hidden="true">
            <img src="${escapeHtml(project.preview)}" alt="" width="1280" height="800" loading="lazy" decoding="async">
            ${demos.length ? `<span class="project-media__badge">${demos.length > 1 ? `Live · ${demos.length} demos` : 'Live demo'}</span>` : ''}
        </a>`
        : '';

    const tags = Array.isArray(project.tags) ? project.tags : [];
    const tagsHtml = tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

    // The lead stat is named per project in projects.json rather than inferred.
    // Inference looked tempting and was wrong: "one Worker + D1", "MinIO (S3)"
    // and "SCD Type 2" all contain digits, so a rule that promoted the first
    // numeric stat would lead with a version number on three of sixteen cards.
    // Each lead is chosen because it is the strongest evidence on that card.
    const leadStat = project.leadStat && project.stats && project.stats[project.leadStat]
        ? { label: project.leadStat, value: project.stats[project.leadStat] }
        : null;

    const leadHtml = leadStat
        ? `<p class="project-stat">
               <span class="project-stat__label">${escapeHtml(leadStat.label)}</span>
               <span class="project-stat__value">${escapeHtml(leadStat.value)}</span>
           </p>`
        : '';

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
        hero ? '<span class="project-kicker__flag">Featured</span>' : '',
        project.category ? escapeHtml(categoryLabel(project.category)) : '',
    ].filter(Boolean).join('<span class="project-kicker__sep" aria-hidden="true">/</span>');

    const htmlString = `
        ${media}
        <div class="project-body">
            ${kicker ? `<p class="project-kicker">${kicker}</p>` : ''}
            <h2 class="project-title">${escapeHtml(project.title)}</h2>
            ${leadHtml}
            <p class="project-description">${escapeHtml(project.description)}</p>
            ${tagsHtml ? `<div class="project-tags">${tagsHtml}</div>` : ''}
            <div class="project-links">
                ${primaryButton}
                ${extraDemoButtons}
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
// Featured carousel
// ==============================
// A swipeable track of the featured projects. Native scroll-snap does the
// motion, so touch, trackpad, the buttons, and the arrow keys all agree, and
// it degrades to a normal horizontal scroller if the JS below never runs.
function createFeaturedCarousel(projects) {
    const carousel = document.createElement('div');
    carousel.className = 'featured-carousel';

    const viewport = document.createElement('div');
    viewport.className = 'featured-carousel__viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'group');
    viewport.setAttribute('aria-roledescription', 'carousel');
    viewport.setAttribute('aria-label', 'Featured projects');

    const track = document.createElement('ul');
    track.className = 'featured-carousel__track';

    projects.forEach((project, i) => {
        const slide = document.createElement('li');
        slide.className = 'featured-carousel__slide';
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${i + 1} of ${projects.length}`);
        slide.appendChild(createProjectCard(project, { hero: true, media: true }));
        track.appendChild(slide);
    });
    viewport.appendChild(track);
    carousel.appendChild(viewport);

    const controls = document.createElement('div');
    controls.className = 'featured-carousel__controls';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'featured-carousel__btn';
    prev.setAttribute('aria-label', 'Previous project');
    prev.innerHTML = CHEVRON_LEFT;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'featured-carousel__btn';
    next.setAttribute('aria-label', 'Next project');
    next.innerHTML = CHEVRON_RIGHT;

    const dots = document.createElement('div');
    dots.className = 'featured-carousel__dots';

    const dotButtons = projects.map((project, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'featured-carousel__dot';
        dot.setAttribute('aria-label', `Show project ${i + 1}: ${project.title}`);
        dot.addEventListener('click', () => go(i));
        dots.appendChild(dot);
        return dot;
    });

    controls.append(prev, dots, next);
    carousel.appendChild(controls);

    let index = 0;

    function sync() {
        prev.disabled = index === 0;
        next.disabled = index === projects.length - 1;
        dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }

    function go(i) {
        index = Math.max(0, Math.min(projects.length - 1, i));
        viewport.scrollTo({ left: index * viewport.clientWidth, behavior: 'smooth' });
        sync();
    }

    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));

    viewport.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const i = Math.round(viewport.scrollLeft / viewport.clientWidth);
            if (i !== index) {
                index = i;
                sync();
            }
        });
    }, { passive: true });

    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(index + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(index - 1);
        }
    });

    // Re-align after a resize so the active slide stays in view.
    window.addEventListener('resize', () => {
        viewport.scrollTo({ left: index * viewport.clientWidth });
    });

    sync();
    return carousel;
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
// Project count (the /projects/ index reports what the filter is showing)
// ==============================
function updateProjectCount(shown, total) {
    const el = document.getElementById('projectCount');
    if (!el) return;
    el.textContent = shown === total
        ? `${total} projects`
        : `${shown} of ${total} projects`;
}

// ==============================
// A project's format is what a visitor can DO with it, in the order the links
// are prioritised: try it, read it, clone it. Derived from the data so it can
// never drift, and exclusive — a project shows its strongest offer.
// ==============================
function projectFormat(project) {
    if (Array.isArray(project.demos) && project.demos.length) return 'demo';
    if (project.caseStudy) return 'case';
    if (project.github) return 'repo';
    return 'private';
}

const FORMAT_ORDER = ['demo', 'case', 'repo'];
const FORMAT_LABELS = {
    demo: 'Live demos',
    case: 'Case studies',
    repo: 'Open source',
};

// ==============================
// Format filter (progressive enhancement)
// Filters by format rather than discipline: the card kicker already names the
// discipline, and "can I try this or only read it" is the question a visitor
// actually arrives with. Renders only where #projectFilters exists, so the
// homepage keeps its single flat grid.
// ==============================
function initProjectFilters(projects, grid) {
    const bar = document.getElementById('projectFilters');
    if (!bar) return;

    const present = FORMAT_ORDER.filter(format =>
        projects.some(project => projectFormat(project) === format)
    );

    const options = [{ value: 'all', label: 'All work' }]
        .concat(present.map(format => ({ value: format, label: FORMAT_LABELS[format] })));

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
        const cards = grid.querySelectorAll('.project-card');
        let shown = 0;
        cards.forEach(card => {
            const hide = value !== 'all' && card.dataset.format !== value;
            card.hidden = hide;
            if (!hide) shown += 1;
        });
        updateProjectCount(shown, cards.length);
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

    // The /projects/ index promotes exactly one card so the grid below it stays
    // uniform; the homepage keeps every featured card in its wide treatment.
    // Screenshots stay on the homepage (only featured cards have one there) but
    // the index shows a single hero image, for the reason noted in the media
    // block above.
    const isListing = Boolean(document.getElementById('projectFilters'));

    if (isListing) {
        // The /projects/ index promotes one card and keeps the rest uniform.
        let heroAssigned = false;
        projects.forEach(project => {
            const wide = project.featured === true && !heroAssigned;
            if (wide) heroAssigned = true;
            grid.appendChild(createProjectCard(project, { hero: wide, media: wide }));
        });
        initProjectFilters(projects, grid);
    } else {
        // Homepage: the featured projects become a carousel, the rest stay in
        // the grid under a small heading.
        const featured = projects.filter(project => project.featured === true);
        const rest = projects.filter(project => project.featured !== true);

        if (featured.length > 0) {
            grid.before(createFeaturedCarousel(featured));
        }
        if (featured.length > 0 && rest.length > 0) {
            const subheading = document.createElement('h3');
            subheading.className = 'projects-subheading';
            subheading.textContent = 'More work';
            grid.before(subheading);
        }
        if (rest.length > 0) {
            rest.forEach(project => grid.appendChild(createProjectCard(project, { hero: false, media: true })));
        } else {
            grid.remove();
        }
    }

    updateProjectCount(projects.length, projects.length);

    // Trigger reveal now that cards are in the DOM
    requestAnimationFrame(() => {
        const gridEl = document.querySelector('.reveal-grid');
        if (gridEl) gridEl.classList.add('visible');
    });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
