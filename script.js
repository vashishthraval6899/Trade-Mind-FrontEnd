// API configuration
const API_BASE_URL = 'https://trade-mind-production.up.railway.app';

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
  docPulses: document.querySelectorAll('.doc-pulse'),
  hudTitle: document.querySelector('.hud-title span')
};

// State
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// Fetch analysis from API
async function fetchAnalysis(ticker) {
  try {
    console.log(`🚀 Fetching analysis for ticker: ${ticker}`);
    
    // Show loading state in cards
    showLoadingState();
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker: ticker }) // Pass exact ticker name
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', data);
    updateUI(data);
    
  } catch (error) {
    console.error('❌ API fetch failed:', error);
    // Show error state
    showErrorState(ticker);
  }
}

// Show loading state in cards
function showLoadingState() {
  const loadingText = 'Loading analysis...';
  elements.bullSummary.textContent = loadingText;
  elements.bearSummary.textContent = loadingText;
  elements.finalSummary.textContent = loadingText;
  
  elements.bullScore.textContent = '--';
  elements.bearScore.textContent = '--';
  elements.finalScoreVal.textContent = '--';
  elements.finalDecision.textContent = '--';
  elements.confidenceLabel.textContent = '--';
}

// Show error state
function showErrorState(ticker) {
  elements.bullSummary.innerHTML = `❌ Unable to fetch data for ${ticker}. Please try again.`;
  elements.bearSummary.innerHTML = `❌ Unable to fetch data for ${ticker}. Please try again.`;
  elements.finalSummary.innerHTML = `❌ Unable to fetch data for ${ticker}. Please try again.`;
  
  elements.bullScore.textContent = '--';
  elements.bearScore.textContent = '--';
  elements.finalScoreVal.textContent = '--';
  elements.finalDecision.textContent = 'ERROR';
  elements.confidenceLabel.textContent = 'Low';
  
  elements.newsContainer.innerHTML = '<div class="news-item">❌ Unable to load news</div>';
  lucide.createIcons();
}

// Update UI with analysis data
function updateUI(data) {
  // Update company ticker in docs section
  if (elements.companyTicker) {
    elements.companyTicker.textContent = data.ticker || 'TCS';
  }

  // Update scores
  if (elements.bullScore) {
    elements.bullScore.textContent = data.metrics?.bull_score || '--';
  }
  if (elements.bearScore) {
    elements.bearScore.textContent = data.metrics?.bear_score || '--';
  }
  if (elements.finalScoreVal) {
    elements.finalScoreVal.textContent = data.metrics?.final_score || '--';
  }

  // Update summaries
  if (elements.bullSummary) {
    elements.bullSummary.textContent = data.bull_summary || 'No bull summary available';
  }
  if (elements.bearSummary) {
    elements.bearSummary.textContent = data.bear_summary || 'No bear summary available';
  }
  if (elements.finalSummary) {
    elements.finalSummary.textContent = data.final_summary || 'No final summary available';
  }

  // Update decision
  if (elements.finalDecision) {
    elements.finalDecision.textContent = data.final_decision || 'HOLD';
  }
  if (elements.confidenceLabel) {
    elements.confidenceLabel.textContent = data.confidence || 'Medium';
  }

  // Update news
  if (data.recent_news && Array.isArray(data.recent_news)) {
    updateNews(data.recent_news);
  } else {
    updateNews([]);
  }

  // Re-initialize icons
  lucide.createIcons();
}

// Update news section
function updateNews(newsItems) {
  if (!elements.newsContainer) return;

  elements.newsContainer.innerHTML = '';
  
  if (!newsItems || newsItems.length === 0) {
    elements.newsContainer.innerHTML = '<div class="news-item">No recent news available</div>';
    return;
  }
  
  newsItems.slice(0, 5).forEach(item => {
    // Extract clean title (remove HTML tags if any)
    let cleanTitle = item.title || 'News article';
    
    // Remove any HTML tags
    cleanTitle = cleanTitle.replace(/<[^>]*>/g, '');
    
    // Clean up common patterns
    cleanTitle = cleanTitle
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Truncate if too long
    if (cleanTitle.length > 70) {
      cleanTitle = cleanTitle.slice(0, 67) + '...';
    }

    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    
    // Try to extract source and link from summary
    let source = '';
    let link = '';
    
    if (item.summary) {
      // Extract link
      const linkMatch = item.summary.match(/href="([^"]*)"/);
      if (linkMatch) {
        link = linkMatch[1];
      }
      
      // Extract source
      const sourceMatch = item.summary.match(/<font[^>]*>(.*?)<\/font>/);
      if (sourceMatch) {
        source = sourceMatch[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '');
      }
    }
    
    newsElement.innerHTML = `
      <i data-lucide="radio"></i>
      <span>${cleanTitle}${source ? ' · ' + source : ''}</span>
    `;
    
    // Add click handler if there's a link
    if (link) {
      newsElement.style.cursor = 'pointer';
      newsElement.addEventListener('click', () => {
        window.open(link, '_blank');
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
  if (elements.hudTitle) {
    elements.hudTitle.textContent = `research stream · analyzing ${ticker}`;
  }

  // Simulate document processing
  const docs = Array.from(elements.docPulses);
  for (let i = 0; i < docs.length; i++) {
    docs[i].style.animation = 'softPulse 0.8s infinite';
    await sleep(80);
  }

  // Fetch actual analysis with EXACT ticker name
  await fetchAnalysis(ticker);

  // Reset UI state
  elements.docPulses.forEach(pulse => {
    pulse.classList.remove('active');
    pulse.style.animation = '';
  });

  if (elements.hudTitle) {
    elements.hudTitle.textContent = 'research stream · live context';
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
  console.log('🔍 Analyze button clicked for ticker:', selectedTicker);
  await runResearch(selectedTicker);
});

// Add keyboard shortcut (Enter key)
elements.tickerSelect.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    elements.analyzeBtn.click();
  }
});

// Add some CSS for better UX
const style = document.createElement('style');
style.textContent = `
  .visible {
    opacity: 1 !important;
  }
  
  .news-item {
    transition: all 0.2s ease;
  }
  
  .news-item:hover {
    background: #e8f0fd;
    transform: translateX(4px);
  }
  
  .doc-pulse.active {
    background: #2a7a4b;
    box-shadow: 0 0 0 2px rgba(42, 122, 75, 0.3);
  }
`;
document.head.appendChild(style);