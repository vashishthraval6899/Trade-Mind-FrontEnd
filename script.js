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
  hudTitle: document.querySelector('.hud-title span'),
  researchHud: document.getElementById('researchHud')
};

// State
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  console.log('✅ Trade-Mind initialized');
});

// Fetch analysis from API
async function fetchAnalysis(ticker) {
  try {
    console.log(`🚀 Calling API for ticker: ${ticker}`);
    console.log(`📡 Endpoint: ${API_BASE_URL}/api/analyze`);
    
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ ticker: ticker }) // Send exact ticker as string
    });

    const responseTime = Date.now() - startTime;
    console.log(`⏱️  API response time: ${responseTime}ms`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', data);
    
    // Validate response has expected structure
    if (!data || !data.metrics) {
      throw new Error('Invalid API response structure');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
}

// Update UI with analysis data
function updateUI(data) {
  console.log('🎨 Updating UI with data:', data);
  
  // Update company ticker in docs section
  if (elements.companyTicker) {
    elements.companyTicker.textContent = data.ticker || elements.tickerSelect.value;
  }

  // Update scores with animation
  if (elements.bullScore) {
    elements.bullScore.textContent = data.metrics?.bull_score || '0';
    elements.bullScore.style.transition = 'all 0.5s ease';
  }
  if (elements.bearScore) {
    elements.bearScore.textContent = data.metrics?.bear_score || '0';
  }
  if (elements.finalScoreVal) {
    elements.finalScoreVal.textContent = data.metrics?.final_score || '0';
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
    
    // Color code the decision
    if (data.final_decision === 'BUY') {
      elements.finalDecision.style.background = '#e6f7e6';
      elements.finalDecision.style.color = '#1b6e46';
    } else if (data.final_decision === 'SELL') {
      elements.finalDecision.style.background = '#ffe6e6';
      elements.finalDecision.style.color = '#b3404c';
    } else {
      elements.finalDecision.style.background = '#edf2fc';
      elements.finalDecision.style.color = '#26344f';
    }
  }
  
  if (elements.confidenceLabel) {
    elements.confidenceLabel.textContent = data.confidence || 'Medium';
  }

  // Update news
  if (data.recent_news && Array.isArray(data.recent_news)) {
    updateNews(data.recent_news);
  }

  // Re-initialize icons
  lucide.createIcons();
  
  console.log('✅ UI update complete');
}

// Update news section
function updateNews(newsItems) {
  if (!elements.newsContainer) return;

  elements.newsContainer.innerHTML = '';
  
  if (!newsItems || newsItems.length === 0) {
    elements.newsContainer.innerHTML = '<div class="news-item">No recent news available</div>';
    return;
  }
  
  newsItems.forEach((item, index) => {
    // Extract clean title
    let cleanTitle = item.title || 'News article';
    cleanTitle = cleanTitle.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    
    // Truncate if too long
    if (cleanTitle.length > 60) {
      cleanTitle = cleanTitle.slice(0, 57) + '...';
    }

    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    
    // Extract link from summary if available
    let link = '#';
    if (item.summary) {
      const linkMatch = item.summary.match(/href="([^"]*)"/);
      if (linkMatch) {
        link = linkMatch[1];
      }
    }
    
    // Format published date if available
    let dateStr = '';
    if (item.published) {
      const date = new Date(item.published);
      if (!isNaN(date.getTime())) {
        dateStr = ` · ${date.toLocaleDateString()}`;
      }
    }
    
    newsElement.innerHTML = `
      <i data-lucide="radio"></i>
      <span>${cleanTitle}${dateStr}</span>
    `;
    
    // Add click handler
    if (link !== '#') {
      newsElement.style.cursor = 'pointer';
      newsElement.addEventListener('click', () => {
        window.open(link, '_blank');
      });
    }
    
    elements.newsContainer.appendChild(newsElement);
  });
}

// Show loading state
function showLoadingState() {
  elements.bullSummary.textContent = '🔄 Analyzing bull case...';
  elements.bearSummary.textContent = '🔄 Analyzing bear case...';
  elements.finalSummary.textContent = '🔄 Weighing evidence...';
  
  elements.bullScore.textContent = '--';
  elements.bearScore.textContent = '--';
  elements.finalScoreVal.textContent = '--';
  elements.finalDecision.textContent = '--';
  elements.confidenceLabel.textContent = '--';
}

// Show error state
function showErrorState(ticker, error) {
  elements.bullSummary.textContent = `❌ Error analyzing ${ticker}: ${error.message}`;
  elements.bearSummary.textContent = `❌ Please try again in a few moments`;
  elements.finalSummary.textContent = `❌ If the problem persists, check console for details`;
  
  elements.bullScore.textContent = 'ERR';
  elements.bearScore.textContent = 'ERR';
  elements.finalScoreVal.textContent = 'ERR';
  elements.finalDecision.textContent = 'ERROR';
  elements.confidenceLabel.textContent = 'Low';
  
  elements.newsContainer.innerHTML = '<div class="news-item">❌ Unable to load news</div>';
  lucide.createIcons();
}

// Run research and analysis
async function runResearch(ticker) {
  if (isLoading) {
    console.log('⏳ Analysis already in progress');
    return;
  }
  
  isLoading = true;
  elements.analyzeBtn.disabled = true;
  elements.loadingSpinner.classList.add('visible');
  
  // Show loading state in cards
  showLoadingState();
  
  // Activate document pulses
  elements.docPulses.forEach(pulse => {
    pulse.classList.add('active');
  });

  // Update HUD title
  if (elements.hudTitle) {
    elements.hudTitle.textContent = `🔍 researching ${ticker} · querying vector stores`;
  }

  try {
    // Simulate some document processing (visual flair)
    const docs = Array.from(elements.docPulses);
    for (let i = 0; i < docs.length; i++) {
      docs[i].style.animation = 'softPulse 0.6s infinite';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Update HUD to show API call
    if (elements.hudTitle) {
      elements.hudTitle.textContent = `🌐 calling API for ${ticker} · awaiting response`;
    }
    
    // ACTUAL API CALL
    const data = await fetchAnalysis(ticker);
    
    // Update HUD to show processing
    if (elements.hudTitle) {
      elements.hudTitle.textContent = `📊 processing ${ticker} results · updating dashboard`;
    }
    
    // Small delay to show processing state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update UI with real data
    updateUI(data);
    
    console.log(`✨ Analysis complete for ${ticker}`);
    
  } catch (error) {
    console.error('❌ Research failed:', error);
    showErrorState(ticker, error);
  } finally {
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
}

// Event Listeners
elements.analyzeBtn.addEventListener('click', () => {
  const selectedTicker = elements.tickerSelect.value;
  console.log('🎯 Analysis requested for:', selectedTicker);
  runResearch(selectedTicker);
});

// Add keyboard shortcut (Enter key)
elements.tickerSelect.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    elements.analyzeBtn.click();
  }
});

// Add CSS for better UX
const style = document.createElement('style');
style.textContent = `
  .visible {
    opacity: 1 !important;
  }
  
  .doc-pulse.active {
    background: #2a7a4b;
    box-shadow: 0 0 0 2px rgba(42, 122, 75, 0.3);
    animation: softPulse 1s infinite !important;
  }
  
  .news-item {
    transition: all 0.2s ease;
    cursor: default;
  }
  
  .news-item[style*="cursor: pointer"]:hover {
    background: #e8f0fd;
    transform: translateX(4px);
    border-color: #9bb5e0;
  }
  
  #finalDecision {
    transition: all 0.3s ease;
  }
  
  .score-badge {
    transition: all 0.5s ease;
  }
`;

document.head.appendChild(style);