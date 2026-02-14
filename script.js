/* script.js */

// WE USE A CORS PROXY TO BYPASS THE ERROR FOR NOW
const PROXY_URL = "https://api.allorigins.win/raw?url=";
const TARGET_API_URL = "https://trade-mind-production.up.railway.app";

let selectedTicker = null;

const tickerCards = document.querySelectorAll('.ticker-card');
const analyzeBtn = document.getElementById('analyze-btn');
const terminalSection = document.getElementById('terminal-view');
const logsContainer = document.getElementById('logs-container');
const progressFill = document.getElementById('progress-fill');
const newsSection = document.getElementById('news-section');
const newsContainer = document.getElementById('news-container');
const discussionPanel = document.getElementById('discussion-panel');

// Ticker Selection
tickerCards.forEach(card => {
    card.addEventListener('click', () => {
        tickerCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTicker = card.dataset.ticker;
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = `INITIATE PROTOCOL: ${selectedTicker}`;
    });
});

// Main Analysis Flow
analyzeBtn.addEventListener('click', async () => {
    if (!selectedTicker) return;

    resetInterface();
    terminalSection.classList.remove('hidden');
    
    try {
        await addLog(`[SYSTEM] Initializing Trade-Mind Protocol for ${selectedTicker}...`, 'info', 0);
        await addLog(`[MACRO] Fetching: Indian Union Budget 2026-27 Data...`, 'process', 800);
        await addLog(`[MACRO] Analyzing: RBI Monetary Policy Committee Minutes 2025...`, 'process', 1500);
        await addLog(`[SECTOR] Loading: CareEdge Indian IT Sector Report 2025...`, 'info', 3000);
        
        // --- THE FIX: FETCHING VIA PROXY ---
        // We do this concurrently with the "simulation" to save time
        const fetchPromise = fetch(PROXY_URL + encodeURIComponent(TARGET_API_URL), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: selectedTicker })
        });

        await addLog(`[COMPANY] Vector Search: ${selectedTicker} Annual Report (FY25)...`, 'process', 4500);
        await addLog(`[NEWS] Google News API: Fetching real-time sentiment...`, 'process', 5500);

        const response = await fetchPromise;

        if (!response.ok) throw new Error(`API Connection Failed: ${response.status}`);

        const data = await response.json();
        
        await addLog(`[SYSTEM] Data Aggregation Complete. Generating Alpha...`, 'success', 6000);
        updateProgressBar(100);

        setTimeout(() => {
            renderResults(data);
        }, 1000);

    } catch (error) {
        console.error(error);
        addLog(`[ERROR] System Failure: ${error.message}`, 'error', 0);
    }
});

// Helper: Add Log Entry (Same as before)
function addLog(message, type, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = `log-entry ${type}`;
            div.innerText = `> ${message}`;
            logsContainer.appendChild(div);
            logsContainer.scrollTop = logsContainer.scrollHeight;
            const currentProgress = parseInt(progressFill.style.width || 0);
            if (currentProgress < 90) updateProgressBar(currentProgress + 15);
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
}

function renderResults(data) {
    // 1. News Section
    newsContainer.innerHTML = '';
    if (data.recent_news && data.recent_news.length > 0) {
        data.recent_news.slice(0, 4).forEach(news => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = news.summary; 
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const cleanSnippet = textContent.length > 100 ? textContent.substring(0, 100) + "..." : textContent;
            
            // Extract Link safely
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

    // 2. Metrics & Text
    document.getElementById('bull-score-display').innerText = `Score: ${data.metrics.bull_score}`;
    document.getElementById('bull-summary-text').innerText = data.bull_summary;

    document.getElementById('bear-score-display').innerText = `Score: ${data.metrics.bear_score}`;
    document.getElementById('bear-summary-text').innerText = data.bear_summary;

    document.getElementById('final-decision-display').innerText = data.final_decision;
    document.getElementById('final-score-display').innerText = `Score: ${data.metrics.final_score}`;
    document.getElementById('judge-summary-text').innerText = data.final_summary;
    document.getElementById('confidence-display').innerText = data.confidence;

    // 3. Dynamic Color for Decision
    const decision = data.final_decision.toUpperCase();
    const badge = document.getElementById('final-decision-display');
    badge.style.border = '1px solid currentColor';
    if(decision.includes('BUY')) badge.style.color = 'var(--bull)';
    else if (decision.includes('SELL')) badge.style.color = 'var(--bear)';
    else badge.style.color = 'var(--gold)';

    // 4. Reveal
    discussionPanel.classList.remove('hidden');
    discussionPanel.scrollIntoView({ behavior: 'smooth' });
}
