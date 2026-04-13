// ==============================
// GitHub Stats
// ==============================
async function getGitHubStats(repoUrl) {
    try {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return null;

        const [, owner, repo] = match;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) return null;

        const data = await response.json();
        return {
            stars: data.stargazers_count,
            forks: data.forks_count,
            language: data.language,
            updated: new Date(data.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        };
    } catch {
        return null;
    }
}

// ==============================
// Load Projects
// ==============================
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();

        const projectsWithStats = await Promise.all(
            data.projects.map(async (project) => {
                const stats = await getGitHubStats(project.github);
                return { ...project, githubStats: stats };
            })
        );

        return projectsWithStats;
    } catch {
        return [];
    }
}

// ==============================
// Render Project Card
// ==============================
function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.category = project.category;

    const tagsHtml = project.tags
        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('');

    const demoButton = project.demo
        ? `<a href="${escapeHtml(project.demo)}" target="_blank" rel="noopener noreferrer" class="btn btn-demo">Live Demo</a>`
        : '';

    let githubStatsHtml = '';
    if (project.githubStats) {
        const { stars, forks, language, updated } = project.githubStats;
        githubStatsHtml = `
            <div class="github-stats" aria-label="GitHub statistics">
                <span class="github-stat" title="Stars">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ${stars ?? 0}
                </span>
                <span class="github-stat" title="Forks">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></svg>
                    ${forks ?? 0}
                </span>
                ${language ? `<span class="github-stat">${escapeHtml(language)}</span>` : ''}
                ${updated ? `<span class="github-stat">Updated ${escapeHtml(updated)}</span>` : ''}
            </div>`;
    }

    const statsHtml = Object.entries(project.stats)
        .map(([key, value]) => `
            <div class="stat">
                <span class="stat-label">${escapeHtml(key)}:</span>
                <span class="stat-value">${escapeHtml(value)}</span>
            </div>`)
        .join('');

    const highlightsHtml = project.highlights
        .map(h => `<li>${escapeHtml(h)}</li>`)
        .join('');

    card.innerHTML = `
        <div class="project-content">
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-description">${escapeHtml(project.description)}</p>

            ${githubStatsHtml}

            <div class="project-stats">${statsHtml}</div>

            <div class="project-highlights">
                <strong>Key Highlights:</strong>
                <ul>${highlightsHtml}</ul>
            </div>

            <div class="project-tags">${tagsHtml}</div>

            <div class="project-links">
                <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer" class="btn btn-github">
                    <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    View on GitHub
                </a>
                ${demoButton}
            </div>
        </div>`;

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
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
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
function initHeaderScroll() {
    const header = document.querySelector('.header');
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ==============================
// Mobile menu
// ==============================
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const isOpen = btn.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        menu.hidden = !isOpen;
    });

    // Close on nav link click
    menu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
        });
    });
}

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
// Footer year
// ==============================
function updateFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
}

// ==============================
// Init
// ==============================
async function initPortfolio() {
    // Non-blocking UI setup first
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initSkillBars();
    initBackToTop();
    initScrollspy();
    updateFooterYear();

    // Load and render projects
    const projects = await loadProjects();
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    // Clear noscript fallback
    grid.innerHTML = '';

    if (projects.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No projects found. Check back soon!</p>';
        return;
    }

    projects.forEach(project => grid.appendChild(createProjectCard(project)));

    // Trigger reveal now that cards are in the DOM
    requestAnimationFrame(() => {
        const gridEl = document.querySelector('.reveal-grid');
        if (gridEl) gridEl.classList.add('visible');
    });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
