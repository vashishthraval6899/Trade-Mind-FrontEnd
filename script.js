// API configuration
const API_BASE_URL = 'https://trade-mind-production.up.railway.app';

// Mock data for fallback/development
const MOCK_RESPONSE = {
  "ticker": "TCS",
  "sector": "IT",
  "metrics": {
    "bull_score": 85,
    "bear_score": 72,
    "final_score": 13
  },
  "bull_summary": "TCS demonstrates strong resilience with high ROE (~50%) and margin stability despite wage pressures, signaling robust profitability. The MPC's unchanged repo rate (6.50%) and focus on inflation alignment (4%) while supporting growth provide a stable macroeconomic backdrop for IT services. Global IT spending is projected to grow at a healthy CAGR of 6.9% (CY25E-CY30P), with TCS positioned to benefit from international expansion and AI-driven innovation. Recent sell-offs may reflect short-term market corrections rather than fundamental weakness, offering attractive entry points for long-term investors.",
  "bear_summary": "The IT/ITeS sector in India, including TCS, faces significant headwinds due to high and persistent inflation (currently at 3.4% CPI but well above RBI's 4% target in H1 2024-25), elevated policy repo rates (6.50% held since mid-2023), and a liquidity-driven slowdown in growth. Rising deposit rates and higher interest costs on small savings schemes squeeze margins, while AI-driven innovation demands escalating R&D investments, straining profitability.",
  "final_decision": "BUY",
  "confidence": "Medium",
  "final_summary": "TCS's strong profitability metrics and leadership in AI-driven IT services support its long-term growth potential. However, sector-specific headwinds introduce near-term risks. The recent sell-offs may offer entry points, but valuation risks justify a Medium confidence BUY decision.",
  "recent_news": [
    {
      "title": "IT stocks selloff continues! Infosys, TCS crash up to 6% - Times of India",
      "summary": "IT stocks continue to face selling pressure",
      "published": "2026-02-13 04:44:00+00:00"
    },
    {
      "title": "Infosys, TCS, Wipro tumble up to 5%: Why are IT stocks falling today? - India Today",
      "summary": "Analysts cite valuation concerns and global uncertainty",
      "published": "2026-02-12 04:21:12+00:00"
    },
    {
      "title": "TCS, Infosys to Wipro: Should you buy the dip after AI-driven sell-off? - Mint",
      "summary": "Market experts divided on IT sector valuation",
      "published": "2026-02-14 10:57:21+00:00"
    },
    {
      "title": "SENSEX falls over 350 points; Infosys, TCS among top drags - Upstox",
      "summary": "Broad market selloff impacts IT stocks",
      "published": "2026-02-12 04:04:54+00:00"
    },
    {
      "title": "State Bank Of India Overtakes TCS To Become Fourth Most Valued Company - NDTV",
      "summary": "SBI market cap surpasses TCS",
      "published": "2026-02-11 09:07:01+00:00"
    }
  ]
};

// DOM Elements
const elements = {
  tickerSelect: document.getElementById('tickerSelect'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  loadingSpinner: document.getElementById('loadingSpinner'),
  companyTicker: document.getElementById('companyTicker'),
  newsContainer: document.getElementById('newsContainer'),
  bullScore: document.getElementById('bullScore'),
  bearScore: document.getElementById('bearScore'),
  bullSummary: document.getElementById('bullSummary'),
  bearSummary: document.getElementById('bearSummary'),
  finalDecision: document.getElementById('finalDecision'),
  confidenceLabel: document.getElementById('confidenceLabel'),
  finalSummary: document.getElementById('finalSummary'),
  finalScoreVal: document.getElementById('finalScoreVal'),
  docPulses: document.querySelectorAll('.doc-pulse')
};

// State
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadInitialData();
});

// Load initial data (TCS)
async function loadInitialData() {
  await fetchAnalysis('TCS');
}

// Fetch analysis from API
async function fetchAnalysis(ticker) {
  try {
    // Try to fetch from API
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker })
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error);
    // Update ticker in mock data
    const mockData = { ...MOCK_RESPONSE, ticker };
    updateUI(mockData);
  }
}

// Update UI with analysis data
function updateUI(data) {
  // Update company ticker in docs section
  if (elements.companyTicker) {
    elements.companyTicker.textContent = data.ticker;
  }

  // Update scores
  if (elements.bullScore) {
    elements.bullScore.textContent = data.metrics.bull_score;
  }
  if (elements.bearScore) {
    elements.bearScore.textContent = data.metrics.bear_score;
  }
  if (elements.finalScoreVal) {
    elements.finalScoreVal.textContent = data.metrics.final_score;
  }

  // Update summaries
  if (elements.bullSummary) {
    elements.bullSummary.textContent = data.bull_summary;
  }
  if (elements.bearSummary) {
    elements.bearSummary.textContent = data.bear_summary;
  }
  if (elements.finalSummary) {
    elements.finalSummary.textContent = data.final_summary;
  }

  // Update decision
  if (elements.finalDecision) {
    elements.finalDecision.textContent = data.final_decision;
  }
  if (elements.confidenceLabel) {
    elements.confidenceLabel.textContent = data.confidence;
  }

  // Update news
  updateNews(data.recent_news);

  // Re-initialize icons
  lucide.createIcons();
}

// Update news section
function updateNews(newsItems) {
  if (!elements.newsContainer) return;

  elements.newsContainer.innerHTML = '';
  
  newsItems.slice(0, 5).forEach(item => {
    // Clean up title
    let cleanTitle = item.title;
    if (cleanTitle.includes(' - ')) {
      cleanTitle = cleanTitle.split(' - ')[0];
    }
    if (cleanTitle.length > 50) {
      cleanTitle = cleanTitle.slice(0, 47) + '...';
    }

    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    newsElement.innerHTML = `
      <i data-lucide="radio"></i>
      <span>${cleanTitle}</span>
    `;
    
    // Add click handler to open news (if URL available)
    if (item.url) {
      newsElement.style.cursor = 'pointer';
      newsElement.addEventListener('click', () => {
        window.open(item.url, '_blank');
      });
    }
    
    elements.newsContainer.appendChild(newsElement);
  });
}

// Simulate research process
async function runResearch(ticker) {
  if (isLoading) return;
  
  isLoading = true;
  elements.analyzeBtn.disabled = true;
  elements.loadingSpinner.classList.add('visible');
  
  // Activate document pulses
  elements.docPulses.forEach(pulse => {
    pulse.classList.add('active');
  });

  // Update HUD title
  const hudTitle = document.querySelector('.hud-title span');
  if (hudTitle) {
    hudTitle.textContent = `research stream · analyzing ${ticker}`;
  }

  // Simulate document processing in sequence
  const docs = Array.from(elements.docPulses);
  for (let i = 0; i < docs.length; i++) {
    docs[i].style.animation = 'softPulse 0.8s infinite';
    await sleep(150); // Quick sequential activation
  }

  // Fetch actual analysis
  await fetchAnalysis(ticker);

  // Reset UI state
  elements.docPulses.forEach(pulse => {
    pulse.classList.remove('active');
    pulse.style.animation = '';
  });

  if (hudTitle) {
    hudTitle.textContent = 'research stream · live context';
  }

  elements.loadingSpinner.classList.remove('visible');
  elements.analyzeBtn.disabled = false;
  isLoading = false;
}

// Utility: sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
elements.analyzeBtn.addEventListener('click', async () => {
  const selectedTicker = elements.tickerSelect.value;
  await runResearch(selectedTicker);
});

// Optional: Add keyboard shortcut (Enter key)
elements.tickerSelect.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    elements.analyzeBtn.click();
  }
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchAnalysis, updateUI, runResearch };
}