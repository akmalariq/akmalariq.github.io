/* ==============================================================================
   Shared header behaviour — theme toggle, mobile menu, footer year.

   Loaded by the main site, the /projects pages and the blog so the navbar
   behaves identically everywhere. Deliberately tiny and dependency-free.
   ============================================================================== */
(function () {
    'use strict';

    // Themes are defined in css/tokens.css. Keep this list in step with the
    // palette blocks there, and with the bootstrap in each page's <head>.
    var THEMES = ['dark', 'light', 'contrast'];
    var LABELS = { dark: 'dark', light: 'light', contrast: 'high contrast' };

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            /* private mode: the attribute still applies for this page */
        }
    }

    function nextTheme() {
        var i = THEMES.indexOf(currentTheme());
        return THEMES[(i + 1) % THEMES.length];
    }

    function initThemeToggle() {
        var root = document.documentElement;
        var toggles = [
            document.getElementById('themeToggle'),
            document.getElementById('themeToggleMobile'),
        ].filter(Boolean);

        // Say what the button will do, not what it currently is.
        function describe() {
            var upcoming = nextTheme();
            toggles.forEach(function (el) {
                el.setAttribute('title', 'Switch to ' + LABELS[upcoming] + ' theme');
                el.setAttribute('aria-label', 'Switch to ' + LABELS[upcoming] + ' theme');
            });
        }

        function advance(event) {
            if (event) event.preventDefault();
            applyTheme(nextTheme());
            describe();
        }

        toggles.forEach(function (el) {
            el.addEventListener('click', advance);
        });

        describe();
    }

    function initMobileMenu() {
        var btn = document.querySelector('.mobile-menu-btn');
        var menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', function () {
            var isOpen = btn.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(isOpen));
            menu.hidden = !isOpen;
        });

        // Close after choosing a destination
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                btn.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
                menu.hidden = true;
            });
        });
    }

    // Mark the current section without hand-editing every page.
    function initActiveLink() {
        var path = window.location.pathname;
        var section = path.indexOf('/blog') === 0 ? 'blog'
            : path.indexOf('/projects') === 0 ? 'work'
            : null;

        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function (link) {
            var href = link.getAttribute('href') || '';
            if (!href || link.classList.contains('nav-cta')) return;

            var isMatch =
                (section === 'blog' && href === '/blog/') ||
                (section === 'work' && href === '/projects');

            if (isMatch) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    function initFooterYear() {
        var el = document.getElementById('footer-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    function init() {
        initThemeToggle();
        initMobileMenu();
        initActiveLink();
        initFooterYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
