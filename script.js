const API_URL = "https://trade-mind-production.up.railway.app";
let selectedTicker = null;

// DOM Elements
const tickerCards = document.querySelectorAll('.ticker-card');
const analyzeBtn = document.getElementById('analyze-btn');
const terminalSection = document.getElementById('terminal-view');
const logsContainer = document.getElementById('logs-container');
const progressFill = document.getElementById('progress-fill');
const newsSection = document.getElementById('news-section');
const newsContainer = document.getElementById('news-container');
const discussionPanel = document.getElementById('discussion-panel');

// State Manager for Ticker Selection
tickerCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove active class from all
        tickerCards.forEach(c => c.classList.remove('selected'));
        // Add to clicked
        card.classList.add('selected');
        selectedTicker = card.dataset.ticker;
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = `INITIATE PROTOCOL: ${selectedTicker}`;
    });
});

// Main Analysis Flow
analyzeBtn.addEventListener('click', async () => {
    if (!selectedTicker) return;

    // 1. Reset Interface
    resetInterface();
    
    // 2. Start Terminal Simulation
    terminalSection.classList.remove('hidden');
    
    try {
        // Add logs sequentially to simulate complex research
        await addLog(`[SYSTEM] Initializing Trade-Mind Protocol for ${selectedTicker}...`, 'info', 0);
        await addLog(`[MACRO] Fetching: Indian Union Budget 2026-27 Data...`, 'process', 800);
        await addLog(`[MACRO] Analyzing: RBI Monetary Policy Committee Minutes 2025...`, 'process', 1500);
        await addLog(`[MACRO] Cross-referencing: US FOMC Meeting Minutes...`, 'process', 2200);
        await addLog(`[SECTOR] Loading: BCG Indian Banking Sector Report 2025...`, 'info', 3000);
        await addLog(`[SECTOR] Loading: CareEdge Indian IT Sector Report 2025...`, 'info', 3500);
        await addLog(`[COMPANY] Vector Search: ${selectedTicker} Annual Report (FY25)...`, 'process', 4500);
        await addLog(`[COMPANY] Parsing: Last 2 Quarterly Earnings Calls...`, 'process', 5500);
        await addLog(`[NEWS] Google News API: Fetching real-time sentiment...`, 'process', 6500);

        // 3. Actually Call the API
        // Note: In a real app, you might start this earlier. 
        // Here we wait for the "show" to finish mostly, or run in parallel.
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: selectedTicker })
        });

        if (!response.ok) throw new Error("API Connection Failed");

        const data = await response.json();
        
        await addLog(`[SYSTEM] Data Aggregation Complete. Generating Alpha...`, 'success', 7000);
        updateProgressBar(100);

        // 4. Render Results after a brief delay
        setTimeout(() => {
            renderResults(data);
        }, 1000);

    } catch (error) {
        addLog(`[ERROR] System Failure: ${error.message}`, 'error', 0);
    }
});

// Helper: Add Log Entry
function addLog(message, type, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = `log-entry ${type}`;
            div.innerText = `> ${message}`;
            logsContainer.appendChild(div);
            logsContainer.scrollTop = logsContainer.scrollHeight; // Auto scroll
            
            // Update progress bar roughly based on flow
            const currentProgress = parseInt(progressFill.style.width || 0);
            if (currentProgress < 90) updateProgressBar(currentProgress + 10);
            
            resolve();
        }, delay);
    });
}

function updateProgressBar(percent) {
    progressFill.style.width = `${percent}%`;
}

function resetInterface() {
    logsContainer.innerHTML = '';
    progressFill.style.width = '0%';
    newsSection.classList.add('hidden');
    discussionPanel.classList.add('hidden');
    // Clear previous results text
    document.getElementById('bull-summary-text').innerHTML = '';
    document.getElementById('bear-summary-text').innerHTML = '';
}

function renderResults(data) {
    // 1. Show News
    newsContainer.innerHTML = '';
    if (data.recent_news && data.recent_news.length > 0) {
        data.recent_news.slice(0, 4).forEach(news => {
            // Check if summary is raw HTML or text. The API sends raw HTML in summary.
            // We'll strip tags for a cleaner look or use a snippet.
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = news.summary; 
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const cleanSnippet = textContent.length > 100 ? textContent.substring(0, 100) + "..." : textContent;

            // Extract link from the summary HTML string provided by API
            const match = news.summary.match(/href="([^"]*)"/);
            const link = match ? match[1] : "#";

            const card = document.createElement('div');
            card.className = 'news-item';
            card.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px;">${news.title}</div>
                <div style="color:#aaa; margin-bottom:10px;">${cleanSnippet}</div>
                <a href="${link}" target="_blank">Read Source <i class="fa-solid fa-external-link-alt"></i></a>
            `;
            newsContainer.appendChild(card);
        });
        newsSection.classList.remove('hidden');
    }

    // 2. Populate Analysis
    document.getElementById('bull-score-display').innerText = `Score: ${data.metrics.bull_score}`;
    document.getElementById('bull-summary-text').innerText = data.bull_summary;

    document.getElementById('bear-score-display').innerText = `Score: ${data.metrics.bear_score}`;
    document.getElementById('bear-summary-text').innerText = data.bear_summary;

    document.getElementById('final-decision-display').innerText = data.final_decision;
    document.getElementById('final-score-display').innerText = `Score: ${data.metrics.final_score}`;
    document.getElementById('judge-summary-text').innerText = data.final_summary;
    document.getElementById('confidence-display').innerText = data.confidence;

    // Stylize the decision badge color
    const decision = data.final_decision.toUpperCase();
    const badge = document.getElementById('final-decision-display');
    if(decision === 'BUY') {
        badge.style.color = 'var(--bull)';
        badge.style.border = '1px solid var(--bull)';
    } else if (decision === 'SELL') {
        badge.style.color = 'var(--bear)';
        badge.style.border = '1px solid var(--bear)';
    } else {
        badge.style.color = 'var(--gold)';
        badge.style.border = '1px solid var(--gold)';
    }

    // 3. Reveal Discussion Panel
    discussionPanel.classList.remove('hidden');

    // Scroll to results
    discussionPanel.scrollIntoView({ behavior: 'smooth' });
}
