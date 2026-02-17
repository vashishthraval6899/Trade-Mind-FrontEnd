/* script.js */

// --- CONFIGURATION ---
const API_URL = "https://trade-mind-production.up.railway.app";
const USE_MOCK_DATA = false;

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

// -------------------------------
// Ticker Selection
// -------------------------------
tickerCards.forEach(card => {
    card.addEventListener('click', () => {
        tickerCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTicker = card.dataset.ticker;
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `RUN ANALYSIS: <span style="color:#fff">${selectedTicker}</span>`;
    });
});

// -------------------------------
// Main Analysis Flow
// -------------------------------
analyzeBtn.addEventListener('click', async () => {
    if (!selectedTicker) return;

    resetInterface();
    terminalSection.classList.remove('hidden');

    try {
        // Terminal simulation
        await addLog(`[SYSTEM] Initializing Investment Committee for ${selectedTicker}...`, 'info', 0);
        await addLog(`[MACRO] Fetching: Indian Union Budget 2026-27 Data...`, 'process', 700);
        await addLog(`[MACRO] Analyzing: RBI Monetary Policy Committee Minutes...`, 'process', 1300);
        await addLog(`[SECTOR] Loading: Industry Sector Reports...`, 'info', 2100);
        await addLog(`[COMPANY] Vector Search: ${selectedTicker} Annual Report...`, 'process', 3000);

        let data;

        if (USE_MOCK_DATA) {
            await addLog(`[DEBUG] Loading Simulation Data...`, 'warning', 3500);
            await new Promise(r => setTimeout(r, 800));
            data = getMockData();
        } else {

            // ✅ FIXED API CALL → Now hits /analyze
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: selectedTicker })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            data = await response.json();

            // If backend returns {error: "..."}
            if (data.error || data.detail) {
                throw new Error(data.error || data.detail);
            }
        }

        await addLog(`[NEWS] Sentiment Analysis Complete...`, 'process', 4500);
        await addLog(`[SYSTEM] Consensus Reached. Generating Investment Thesis...`, 'success', 5200);

        updateProgressBar(100);

        setTimeout(() => {
            renderResults(data);
        }, 700);

    } catch (error) {
        console.error(error);
        addLog(`[ERROR] ${error.message}`, 'error', 0);
    }
});

// -------------------------------
// Terminal Log Helper
// -------------------------------
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

    document.getElementById('bull-summary-text').innerText = '';
    document.getElementById('bear-summary-text').innerText = '';
    document.getElementById('judge-summary-text').innerText = '';
}

// -------------------------------
// Render Results
// -------------------------------
function renderResults(data) {

    if (!data.metrics) {
        throw new Error("Invalid API response structure.");
    }

    // NEWS
    newsContainer.innerHTML = '';
    if (data.recent_news && data.recent_news.length > 0) {
        data.recent_news.slice(0, 4).forEach(news => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = news.summary;
            let cleanText = tempDiv.textContent || tempDiv.innerText || "";
            if (cleanText.length > 120) cleanText = cleanText.substring(0, 120) + "...";

            const card = document.createElement('div');
            card.className = 'news-item';
            card.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px; color:#fff;">${news.title}</div>
                <div style="color:#94a3b8; margin-bottom:10px;">${cleanText}</div>
            `;
            newsContainer.appendChild(card);
        });
        newsSection.classList.remove('hidden');
    }

    // SCORES & SUMMARIES
    document.getElementById('bull-score-display').innerText = `Score: ${data.metrics.bull_score}`;
    document.getElementById('bull-summary-text').innerText = data.bull_summary;

    document.getElementById('bear-score-display').innerText = `Score: ${data.metrics.bear_score}`;
    document.getElementById('bear-summary-text').innerText = data.bear_summary;

    const judgeBadge = document.getElementById('final-decision-display');
    judgeBadge.innerText = data.final_decision;

    document.getElementById('final-score-display').innerText = `Score: ${data.metrics.final_score}`;
    document.getElementById('judge-summary-text').innerText = data.final_summary;
    document.getElementById('confidence-display').innerText = data.confidence;

    // COLOR CODING
    const decision = data.final_decision.toUpperCase();
    judgeBadge.className = 'decision-badge';

    if (decision.includes('BUY')) {
        judgeBadge.style.background = 'var(--bull)';
        judgeBadge.style.color = '#000';
    } else if (decision.includes('SELL')) {
        judgeBadge.style.background = 'var(--bear)';
        judgeBadge.style.color = '#fff';
    } else {
        judgeBadge.style.background = 'var(--gold)';
        judgeBadge.style.color = '#000';
    }

    discussionPanel.classList.remove('hidden');
    discussionPanel.scrollIntoView({ behavior: 'smooth' });
}

// -------------------------------
// Mock Data
// -------------------------------
function getMockData() {
    return {
        "ticker": "TCS",
        "metrics": {
            "bull_score": 85,
            "bear_score": 72,
            "final_score": 13
        },
        "bull_summary": "Strong resilience, stable margins, macro support.",
        "bear_summary": "Sector headwinds and inflation pressure.",
        "final_decision": "BUY",
        "confidence": "Medium",
        "final_summary": "Strong long-term growth backed by AI adoption.",
        "recent_news": [
            { "title": "TCS Surges", "summary": "TCS sees strong quarterly results." }
        ]
    };
}
