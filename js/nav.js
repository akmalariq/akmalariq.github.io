/* ==============================================================================
   Shared header behaviour — theme toggle, mobile menu, footer year.

   Loaded by the main site, the /projects pages and the blog so the navbar
   behaves identically everywhere. Deliberately tiny and dependency-free.
   ============================================================================== */
(function () {
    'use strict';

    function initThemeToggle() {
        var toggle = document.getElementById('themeToggle');
        var mobileToggle = document.getElementById('themeToggleMobile');
        var root = document.documentElement;

        function apply(theme) {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
            try {
                localStorage.setItem('theme', theme);
            } catch (e) {
                /* private mode: the class still applies for this page */
            }
        }

        function toggleTheme(event) {
            if (event) event.preventDefault();
            apply(root.classList.contains('light') ? 'dark' : 'light');
        }

        if (toggle) toggle.addEventListener('click', toggleTheme);
        if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);
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
