// Fetch GitHub repository statistics
async function getGitHubStats(repoUrl) {
    try {
        // Extract owner/repo from GitHub URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return null;

        const [, owner, repo] = match;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

        if (!response.ok) return null;

        const data = await response.json();
        return {
            stars: data.stargazers_count,
            forks: data.forks_count,
            language: data.language,
            updated: new Date(data.updated_at).toLocaleDateString()
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        return null;
    }
}

// Load projects from JSON file
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();

        // Fetch GitHub stats for all projects
        const projectsWithStats = await Promise.all(
            data.projects.map(async (project) => {
                const stats = await getGitHubStats(project.github);
                return { ...project, githubStats: stats };
            })
        );

        return projectsWithStats;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

// Render project card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.category = project.category;

    const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    const demoButton = project.demo
        ? `<a href="${project.demo}" target="_blank" class="btn btn-demo">Live Demo</a>`
        : '';

    // GitHub stats section
    let githubStatsHtml = '';
    if (project.githubStats) {
        githubStatsHtml = `
            <div class="github-stats">
                <span class="github-stat">⭐ ${project.githubStats.stars || 0} stars</span>
                <span class="github-stat">🍴 ${project.githubStats.forks || 0} forks</span>
                ${project.githubStats.language ? `<span class="github-stat">💻 ${project.githubStats.language}</span>` : ''}
            </div>
        `;
    }

    card.innerHTML = `
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>

            ${githubStatsHtml}

            <div class="project-stats">
                ${Object.entries(project.stats).map(([key, value]) =>
                    `<div class="stat">
                        <span class="stat-label">${key}:</span>
                        <span class="stat-value">${value}</span>
                    </div>`
                ).join('')}
            </div>

            <div class="project-highlights">
                <strong>Key Highlights:</strong>
                <ul>
                    ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
            </div>

            <div class="project-tags">
                ${tagsHtml}
            </div>

            <div class="project-links">
                <a href="${project.github}" target="_blank" class="btn btn-github">
                    <span class="btn-icon">🐙</span> View on GitHub
                </a>
                ${demoButton}
            </div>
        </div>
    `;

    return card;
}

// Filter projects
function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });

    // Filter cards
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-in';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize portfolio
async function initPortfolio() {
    const projects = await loadProjects();
    const grid = document.getElementById('projectsGrid');

    if (projects.length === 0) {
        grid.innerHTML = '<p class="no-projects">No projects found. Please check back later!</p>';
        return;
    }

    // Render projects
    projects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });

    // Add filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.filter;
            filterProjects(category);
        });
    });

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', initPortfolio);
