/* script.js */

// --- CONFIGURATION ---
const API_URL = "https://trade-mind-production.up.railway.app";
// SET THIS TO TRUE TO BYPASS THE ERROR AND SEE THE UI WORKING
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

// Ticker Selection Logic
tickerCards.forEach(card => {
    card.addEventListener('click', () => {
        tickerCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTicker = card.dataset.ticker;
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `RUN ANALYSIS: <span style="color:#fff">${selectedTicker}</span>`;
    });
});

// Main Analysis Flow
analyzeBtn.addEventListener('click', async () => {
    if (!selectedTicker) return;

    // Reset UI
    resetInterface();
    terminalSection.classList.remove('hidden');
    
    try {
        // --- STEP 1: VISUAL SIMULATION ---
        await addLog(`[SYSTEM] Initializing Investment Committee for ${selectedTicker}...`, 'info', 0);
        await addLog(`[MACRO] Fetching: Indian Union Budget 2026-27 Data...`, 'process', 800);
        await addLog(`[MACRO] Analyzing: RBI Monetary Policy Committee Minutes 2025...`, 'process', 1500);
        await addLog(`[SECTOR] Loading: CareEdge Indian IT Sector Report 2025...`, 'info', 2500);
        await addLog(`[COMPANY] Vector Search: ${selectedTicker} Annual Report (FY25)...`, 'process', 3500);
        
        // --- STEP 2: FETCH DATA ---
        let data;
        
        if (USE_MOCK_DATA) {
            await addLog(`[DEBUG] CORS Bypass Active: Loading Simulation Data...`, 'warning', 4000);
            await new Promise(r => setTimeout(r, 1000)); 
            data = getMockData(); 
        } else {
            // Real API Call
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: selectedTicker })
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            data = await response.json();
        }

        await addLog(`[NEWS] Google News API: Sentiment Analysis Complete...`, 'process', 5000);
        await addLog(`[SYSTEM] Consensus Reached. Generating Investment Thesis...`, 'success', 6000);
        updateProgressBar(100);

        // --- STEP 3: SHOW RESULTS ---
        setTimeout(() => {
            renderResults(data);
        }, 800);

    } catch (error) {
        console.error(error);
        addLog(`[ERROR] Protocol Failed: ${error.message}`, 'error', 0);
    }
});

// Helper Functions
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
    // Clear texts
    document.getElementById('bull-summary-text').innerText = '';
    document.getElementById('bear-summary-text').innerText = '';
    document.getElementById('judge-summary-text').innerText = '';
}

function renderResults(data) {
    // 1. Render News
    newsContainer.innerHTML = '';
    if (data.recent_news && data.recent_news.length > 0) {
        data.recent_news.slice(0, 4).forEach(news => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = news.summary;
            let cleanText = tempDiv.textContent || tempDiv.innerText || "";
            if(cleanText.length > 120) cleanText = cleanText.substring(0, 120) + "...";

            const match = news.summary.match(/href="([^"]*)"/);
            const link = match ? match[1] : "#";

            const card = document.createElement('div');
            card.className = 'news-item';
            card.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px; color:#fff;">${news.title}</div>
                <div style="color:#94a3b8; margin-bottom:10px;">${cleanText}</div>
                <a href="${link}" target="_blank" style="color:var(--accent); font-size:0.8rem;">
                    Read Source <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            `;
            newsContainer.appendChild(card);
        });
        newsSection.classList.remove('hidden');
    }

    // 2. Render Metrics & Summaries
    document.getElementById('bull-score-display').innerText = `Score: ${data.metrics.bull_score}`;
    document.getElementById('bull-summary-text').innerText = data.bull_summary;

    document.getElementById('bear-score-display').innerText = `Score: ${data.metrics.bear_score}`;
    document.getElementById('bear-summary-text').innerText = data.bear_summary;

    const judgeBadge = document.getElementById('final-decision-display');
    judgeBadge.innerText = data.final_decision;
    document.getElementById('final-score-display').innerText = `Score: ${data.metrics.final_score}`;
    document.getElementById('judge-summary-text').innerText = data.final_summary;
    document.getElementById('confidence-display').innerText = data.confidence;

    // 3. Color Coding
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

    // 4. Reveal
    discussionPanel.classList.remove('hidden');
    discussionPanel.scrollIntoView({ behavior: 'smooth' });
}

function getMockData() {
    return {
        "ticker": "TCS",
        "sector": "IT",
        "metrics": {
            "bull_score": 85,
            "bear_score": 72,
            "final_score": 13
        },
        "bull_summary": "TCS demonstrates strong resilience with high ROE (~50%) and margin stability despite wage pressures. The MPC’s unchanged repo rate (6.50%) provides a stable macroeconomic backdrop.",
        "bear_summary": "The IT/ITeS sector faces headwinds due to high inflation and elevated policy repo rates. Rising deposit rates squeeze margins, while AI-driven innovation demands escalating R&D investments.",
        "final_decision": "BUY",
        "confidence": "Medium",
        "final_summary": "TCS’s strong profitability metrics and leadership in AI-driven IT services support long-term growth. However, sector-specific headwinds introduce near-term risks.",
        "recent_news": [
            { "title": "IT stocks selloff continues! Infosys, TCS crash up to 6%", "summary": "IT stocks selloff continues! Infosys, TCS crash up to 6%." },
            { "title": "State Bank Of India Overtakes TCS", "summary": "State Bank Of India Overtakes TCS To Become Fourth Most Valued Company In India." }
        ]
    };
}
