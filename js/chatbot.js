// ==============================================================================
// Akmal Ariq | Virtual Consulting Partner Chatbot Engine
// File: js/chatbot.js
// ==============================================================================

(function () {
    let resumeData = null;
    let projectsData = null;
    let isTyping = false;

    // Cache elements
    const bubble = document.getElementById('chatbotBubble');
    const windowEl = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messagesContainer = document.getElementById('chatbotMessages');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');
    const chipsContainer = document.getElementById('chatbotChips');

    if (!bubble || !windowEl || !closeBtn || !messagesContainer || !form || !input || !chipsContainer) {
        console.warn('Chatbot DOM elements missing. Skipping initialization.');
        return;
    }

    // Toggle Chat Window
    bubble.addEventListener('click', () => {
        const isHidden = windowEl.hidden;
        windowEl.hidden = !isHidden;
        if (isHidden) {
            bubble.classList.add('active-window');
            document.documentElement.classList.add('chatbot-open');
            input.focus();
            // Scroll to bottom on open
            scrollToBottom();
        } else {
            bubble.classList.remove('active-window');
            document.documentElement.classList.remove('chatbot-open');
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.hidden = true;
        bubble.classList.remove('active-window');
        document.documentElement.classList.remove('chatbot-open');
    });

    // Handle suggestion chips
    chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip || isTyping) return;
        const query = chip.dataset.query;
        handleUserQuery(query, chip.innerText);
    });

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || isTyping) return;
        input.value = '';
        handleUserQuery(text);
    });

    // Setup: Fetch data on load
    async function loadData() {
        try {
            const [resumeRes, projectsRes] = await Promise.all([
                fetch('data/resume.json'),
                fetch('data/projects.json')
            ]);
            resumeData = await resumeRes.json();
            projectsData = await projectsRes.json();
        } catch (e) {
            console.error('Chatbot failed to warm data cache:', e);
        }
        sendInitialGreeting();
    }

    // Construct Context-Aware Timezone Greeting
    function sendInitialGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const timezoneOffset = now.getTimezoneOffset(); // minutes

        let greeting = "Hello!";
        
        // Dynamic time-of-day greetings
        if (hour >= 5 && hour < 12) {
            greeting = "Good morning!";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Good afternoon!";
        } else if (hour >= 17 && hour < 22) {
            greeting = "Good evening!";
        } else {
            greeting = "Hello!";
        }

        // Localized Indonesian check (WIB/WITA/WIT are offsets between -420 and -540 minutes)
        let localIntro = "";
        if (timezoneOffset >= -540 && timezoneOffset <= -420) {
            if (hour >= 5 && hour < 11) {
                localIntro = "Selamat pagi! 🌤️ ";
            } else if (hour >= 11 && hour < 15) {
                localIntro = "Selamat siang! ☀️ ";
            } else if (hour >= 15 && hour < 18) {
                localIntro = "Selamat sore! 🌅 ";
            } else {
                localIntro = "Selamat malam! 🌙 ";
            }
        }

        const msgHtml = `
            <p>${escapeHtml(localIntro)}${escapeHtml(greeting)} I am Akmal's <strong>Virtual Partner</strong>.</p>
            <p>I help small businesses and teams automate manual reporting, optimize database costs, and deploy cloud-native AI workflows.</p>
            <p>How can I help accelerate your projects today?</p>
        `;
        appendMessage('bot', msgHtml);
    }

    // Append Chat Bubble
    function appendMessage(sender, htmlContent) {
        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = `chat-bubble-wrapper ${sender}`;

        const msgBubble = document.createElement('div');
        msgBubble.className = `chat-bubble ${sender}`;

        // Safe DOM insertion using DOMParser to avoid direct innerHTML assignment
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        while (doc.body.firstChild) {
            msgBubble.appendChild(doc.body.firstChild);
        }

        bubbleWrap.appendChild(msgBubble);
        messagesContainer.appendChild(bubbleWrap);
        scrollToBottom();
    }

    // Show Typing State
    function showTypingIndicator() {
        isTyping = true;
        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'chat-bubble-wrapper bot typing-indicator-wrap';
        bubbleWrap.id = 'typingIndicator';

        const msgBubble = document.createElement('div');
        msgBubble.className = 'chat-bubble bot typing';
        
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.className = 'dot';
            msgBubble.appendChild(span);
        }

        bubbleWrap.appendChild(msgBubble);
        messagesContainer.appendChild(bubbleWrap);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        isTyping = false;
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Main Query Handler
    async function handleUserQuery(rawQuery, displayLabel) {
        const queryText = displayLabel || rawQuery;
        appendMessage('user', escapeHtml(queryText));

        showTypingIndicator();

        const startTime = Date.now();
        const minDelay = Math.max(700, Math.min(1500, queryText.length * 15));

        try {
            const responseResult = resolveResponse(rawQuery);
            const responseHtml = (responseResult instanceof Promise)
                ? await responseResult
                : responseResult;

            const elapsedTime = Date.now() - startTime;
            const remainingDelay = Math.max(0, minDelay - elapsedTime);

            setTimeout(() => {
                removeTypingIndicator();
                appendMessage('bot', responseHtml);
            }, remainingDelay);
        } catch (err) {
            const elapsedTime = Date.now() - startTime;
            const remainingDelay = Math.max(0, minDelay - elapsedTime);
            setTimeout(() => {
                removeTypingIndicator();
                appendMessage('bot', '<p>I encountered an unexpected system error. Please try again.</p>');
            }, remainingDelay);
        }
    }

    // Keyword NLP Resolution Engine
    function resolveResponse(query) {
        const q = query.toLowerCase().trim();

        // Special Easter Egg: Telemetry check
        if (q === '/diagnostic' || q === '/telemetry' || q === 'diagnostic' || q === 'telemetry') {
            return fetchAndRenderTelemetry();
        }

        // 1. Services / Freelance
        if (matchesAny(q, ['service', 'freelance', 'consult', 'consulting', 'hire', 'price', 'rate', 'value', 'what can you do', 'help', 'cost'])) {
            return `
                <p class="bot-title">💼 Digital Enablement &amp; Automation Services</p>
                <p>Akmal helps traditional businesses and teams automate manual spreadsheets and connect fragmented operations into secure cloud pipelines:</p>
                <ul class="bot-list">
                    <li><strong>Excel-to-Cloud Migration:</strong> Transitioning slow, error-prone manual spreadsheets and desktop file databases into secure, centralized cloud databases (PostgreSQL/BigQuery).</li>
                    <li><strong>Omnichannel Data Ingestion:</strong> Automatically pulling order, sales, and stock data from multi-channel marketplaces (Tokopedia, Shopee, TikTok Shop) to eliminate daily manual reporting delays.</li>
                    <li><strong>Resilient Web Extraction:</strong> Building high-throughput, scheduled Python extractors that bypass anti-bot shields (Cloudflare) to automate price tracking sweeps.</li>
                    <li><strong>Automated Data Orchestration:</strong> Orchestrating background data workflows using Apache Airflow, Kestra, and Docker to replace human copy-paste tasks.</li>
                </ul>
                <p>Would you like to review some of Akmal's active case studies?</p>
            `;
        }

        // 2. Case Studies / Projects
        if (matchesAny(q, ['project', 'case study', 'portfolio', 'work', 'built', 'danone', 'earthquake', 'freshcart'])) {
            return `
                <p class="bot-title">📈 Featured Case Studies</p>
                <p>Akmal has built several production-grade data pipelines showcasing absolute reliability:</p>
                <ul class="bot-list">
                    <li><strong>FreshCart E-Commerce (150K+ Records):</strong> A complete medallion-architecture analytics pipeline using Airflow, dbt, and BigQuery. It segments buyer behavior using automated RFM models.</li>
                    <li><strong>Earthquake Analytics:</strong> A 10+ year global activity data lake using Terraform for Infrastructure as Code, Kestra for orchestration, and dbt.</li>
                    <li><strong>Danone Technical Solution:</strong> Full automated paginated scraping of 117 laptop models loaded cleanly into PostgreSQL with regex extraction queries.</li>
                </ul>
                <p>You can click on <strong>"View My Work"</strong> in the main section of this page to view live repositories!</p>
            `;
        }

        // 3. Technical Stack
        if (matchesAny(q, ['skills', 'tech', 'stack', 'tools', 'airflow', 'kestra', 'gcp', 'bigquery', 'python', 'sql', 'terraform', 'docker'])) {
            return `
                <p class="bot-title">🛠️ Technical Stack</p>
                <p>Akmal designs scalable pipelines using modern industry standards:</p>
                <ul class="bot-list">
                    <li><strong>Languages:</strong> Python (Pandas, Faker, Scrapers), SQL, Shell Scripting (Bash).</li>
                    <li><strong>Orchestration:</strong> Apache Airflow (Dockerized, LocalExecutor), Kestra.</li>
                    <li><strong>Modern Warehousing:</strong> BigQuery, dbt (Data Build Tool), PostgreSQL, DuckDB.</li>
                    <li><strong>Infrastructure:</strong> Google Cloud Platform (GCP), Terraform (IaC), Docker, Git, CI/CD pipelines.</li>
                </ul>
                <p>All pipeline builds include automated data quality testing via dbt to ensure absolute source trust.</p>
            `;
        }

        // 4. Contact / Hire
        if (matchesAny(q, ['contact', 'email', 'reach', 'linkedin', 'github', 'hire', 'schedule', 'call', 'mail', 'phone'])) {
            return `
                <p class="bot-title">✉️ Let's Collaborate</p>
                <p>I would love to discuss how we can automate your data reporting or cut down your cloud database costs.</p>
                <p>You can reach Akmal directly to schedule a free initial consultation call:</p>
                <ul class="bot-list">
                    <li>📧 <strong>Email:</strong> <a href="mailto:akmalariqs@gmail.com">akmalariqs@gmail.com</a></li>
                    <li>💼 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/akmalariq" target="_blank">linkedin.com/in/akmalariq</a></li>
                    <li>🐙 <strong>GitHub:</strong> <a href="https://github.com/akmalariq" target="_blank">github.com/akmalariq</a></li>
                </ul>
                <p>I typically respond to inquiries within 24 hours!</p>
            `;
        }

        // 5. Greetings / Hello
        if (matchesAny(q, ['hello', 'hi', 'hey', 'greetings', 'about', 'who are you', 'bio', 'start'])) {
            return `
                <p>Hello! I am Akmal's AI Partner.</p>
                <p>I can walk you through Akmal's <strong>freelance services</strong>, show you his <strong>case studies</strong>, list his <strong>technical stack</strong>, or help you <strong>get in touch</strong> with him directly.</p>
                <p>What can I assist you with today?</p>
            `;
        }

        // Default Fallback
        return `
            <p>I want to make sure I give you exactly the information you need! Are you interested in:</p>
            <ul class="bot-list font-specimen">
                <li>💼 Learning about my <strong>freelance &amp; consulting services</strong>?</li>
                <li>📈 Reviewing my data engineering <strong>case studies</strong>?</li>
                <li>🛠️ Checking out my <strong>technical stack</strong>?</li>
                <li>✉️ <strong>Booking a consultation</strong> call directly?</li>
            </ul>
            <p>Feel free to click any of the quick-action chips below or type another question!</p>
        `;
    }

    // Helper: Match checking
    function matchesAny(str, keywords) {
        return keywords.some(k => str.includes(k));
    }

    // Helper: Telemetry Easter Egg renderer
    function fetchAndRenderTelemetry() {
        let telemetryHtml = `<p class="bot-title">📟 WSL Developer Server Diagnostics</p>`;
        
        // Fetch it synchronously via XMLHttp/Fetch inside timeout
        return fetch('https://akmalariq.github.io/data/telemetry.json')
            .then(res => res.json())
            .then(data => {
                const modelClean = data.cpu.model.replace(/Intel\(R\)|Core\(TM\)|\(R\)/g, '').trim();
                const cleanCpuModel = modelClean.split('@')[0];
                return `
                    ${telemetryHtml}
                    <div class="telemetry-log">
                        <div>&gt; wsl --status</div>
                        <div>WSL Node: <span class="text-green">ONLINE</span></div>
                        <div>Kernel: 6.6.114.1-microsoft</div>
                        <div>CPU: ${escapeHtml(data.cpu.cores)} Cores | ${escapeHtml(cleanCpuModel)}</div>
                        <div>Memory: ${escapeHtml(data.memory.used_mb)}MB / ${escapeHtml(data.memory.total_mb)}MB (${escapeHtml(data.memory.used_pct)}%)</div>
                        <div>Storage: ${escapeHtml(data.storage.used)} / ${escapeHtml(data.storage.total)} (${escapeHtml(data.storage.used_pct)}%)</div>
                        <div>Ping Latency: ${escapeHtml(data.network.ping_ms)}ms</div>
                        <div>Services Failed: ${escapeHtml(data.services.failed_count)}</div>
                        <div>Timestamp: ${escapeHtml(data.timestamp)}</div>
                    </div>
                    <p>Live server telemetry successfully parsed! It proves this static page is automatically listening to cron updates from Akmal's local WSL machine.</p>
                `;
            })
            .catch(() => {
                return `
                    ${telemetryHtml}
                    <div class="telemetry-log error">
                        <div>&gt; wsl --status</div>
                        <div>Connection: <span class="text-red">OFFLINE</span></div>
                        <div>Reason: Could not fetch static telemetry payload.</div>
                    </div>
                `;
            });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Load data on page load
    loadData();
})();
