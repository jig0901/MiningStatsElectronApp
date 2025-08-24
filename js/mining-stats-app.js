// Main Mining Stats App - UPDATED WITH MAIN AREA BITCOIN PRICE
class MiningStatsApp {
    constructor() {
        this.apiURL = 'https://www.belanifamily.com/metrics';
        this.refreshInterval = 60;
        this.countdown = this.refreshInterval;
        this.chart = null;
        this.history = [];
        this.stats = null;
        this.previousStats = null;
        this.workerUrls = this.loadWorkerUrls();
        
        // Initialize managers after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initManagers());
        } else {
            this.initManagers();
        }
        
        this.init();
    }
    
    initManagers() {
        try {
            // Initialize all manager classes
            this.settingsManager = new EnhancedSettingsManager();
            this.bitcoinPriceManager = new BitcoinPriceManager();
            this.analyticsManager = new MiningAnalyticsManager();
            this.insightsManager = new MetricsInsightsManager();
            // Initialize new managers and assign to global variables
            window.workerPerformanceManager = new WorkerPerformanceManager();
            window.miningActivityManager = new MiningActivityManager();
            
            // Also assign to app instance for internal use
            this.performanceManager = window.workerPerformanceManager;
            this.activityManager = window.miningActivityManager;
            
            // Make analytics manager globally available
            window.analyticsManager = this.analyticsManager;

            // Single global entry point chips use
            window.navigateToPerformanceTabWithFilter = (filter) => this.navigateToPerformanceTabWithFilter(filter);

            console.log('All managers initialized successfully');
        } catch (error) {
            console.error('Failed to initialize managers:', error);
            throw error;
        }
    }

    init() {
        this.fetchData();
        this.startTimer();
        this.requestNotificationPermission();
        this.setupEventListeners();
        
        // Enhanced analytics initialization
        setTimeout(() => {
            if (this.analyticsManager && this.stats) {
                // Force initial analytics display
                const analyticsTab = document.getElementById('analytics-tab');
                if (analyticsTab && analyticsTab.classList.contains('active')) {
                    this.forceUpdateAnalyticsTabEnhanced();
                }
            }
            // Render initial bubbles (in case stats already present)
            this.updatePerformanceBubblesInline();
        }, 3000);
    }

    // Wait until any of the given IDs is present in the DOM (tries for ~800ms)
    async waitForElementById(ids, timeoutMs = 800) {
    const list = Array.isArray(ids) ? ids : [ids];
    const start = performance.now();
    return new Promise((resolve) => {
        const tick = () => {
        for (const id of list) {
            const el = document.getElementById(id);
            if (el) return resolve(el);
        }
        if (performance.now() - start >= timeoutMs) return resolve(null);
        requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
    }

    // Promise that resolves on the next animation frame (optionally multiple)
    async nextFrame(times = 1) {
    for (let i = 0; i < times; i++) {
        await new Promise((r) => requestAnimationFrame(() => r()));
    }
    }
    
    setupEventListeners() {
        // Custom event for stats updates
        this.statsUpdatedEvent = new CustomEvent('statsUpdated', {
            detail: { current: null, previous: null }
        });
        // Keep bubbles fresh if other components fire this
        window.addEventListener('statsUpdated', () => this.updatePerformanceBubblesInline());
    }

    async fetchData() {
        try {
            const response = await fetch(this.apiURL);
            const data = await response.json();

             // Update insights early so it’s ready for render
            if (this.insightsManager) {
                this.insightsManager.update(data, this.previousStats);
            }

            // Store previous stats before updating
            this.previousStats = this.stats;
            this.stats = data;
            
            this.updateHistory(data.hashrate_1min_ths);
            
            // Enhanced analytics update
            if (this.analyticsManager && data) {
                // Analyze shares with enhanced data
                this.analyticsManager.analyzeShares(data, this.previousStats);
                
                // Force analytics display update if analytics tab is active
                const analyticsTab = document.getElementById('analytics-tab');
                if (analyticsTab && analyticsTab.classList.contains('active')) {
                    setTimeout(() => {
                        if (this.analyticsManager.updateAnalyticsDisplayFixed) {
                            this.analyticsManager.updateAnalyticsDisplayFixed();
                        } else {
                            this.forceUpdateAnalyticsTab();
                        }
                    }, 200);
                }
            }
            
            // Update performance monitoring
            if (this.performanceManager && data.workers) {
                this.performanceManager.analyzeWorkerPerformance(data.workers);
            }
            
            // Track mining activities
            if (this.activityManager) {
                this.activityManager.trackActivities(data, this.previousStats);
            }
            
            // Dispatch stats updated event
            this.statsUpdatedEvent.detail.current = data;
            this.statsUpdatedEvent.detail.previous = this.previousStats;
            window.dispatchEvent(this.statsUpdatedEvent);
            
            this.render();
            this.countdown = this.refreshInterval;
            
            // Check for alerts
            this.checkForAlerts(data, this.previousStats);
            
        } catch (error) {
            console.error('Failed to fetch data:', error);
            this.showNotification('Connection Error', 'Failed to fetch mining data');
        }
    }
    
    checkForAlerts(current, previous) {
        if (!previous) return;
        
        // Check notification settings before showing any alerts
        const notificationSettings = window.miningActivityManager?.notificationSettings;
        
        // Check for significant hashrate drops
        if (current.hashrate_1min_ths && previous.hashrate_1min_ths) {
            const change = ((current.hashrate_1min_ths - previous.hashrate_1min_ths) / previous.hashrate_1min_ths) * 100;
            if (change < -20 && notificationSettings?.hashrateChanges) {
                this.showNotification('Hashrate Alert', `Hashrate dropped by ${Math.abs(change).toFixed(1)}%`);
            }
        }
        
        // Check for worker count changes
        if (current.worker_count !== previous.worker_count) {
            const change = current.worker_count - previous.worker_count;
            if (change < 0 && notificationSettings?.workerOffline) {
                this.showNotification('Worker Alert', `${Math.abs(change)} worker(s) went offline`);
            }
        }
        
        // Check for new shares - ONLY if share notifications are enabled
        if (current.accepted_shares && previous.accepted_shares && notificationSettings?.shareFound) {
            const newShares = current.accepted_shares - previous.accepted_shares;
            if (newShares > 0) {
                this.showNotification('Share Found!', `Found ${newShares} new share${newShares > 1 ? 's' : ''}!`);
            }
        }
    }

    render() {
        if (!this.stats) return;
        
        const content = document.getElementById('content');
        content.innerHTML = `
            ${this.renderPerformanceBubblesSection()}   <!-- NEW: at-a-glance bubbles up top -->
            ${this.renderGeneralStats()}
            ${this.renderHashrateStats()}
            ${this.renderOddsStats()}
            ${this.renderChart()}
            ${this.renderTabbedInterface()}
            ${this.settingsManager?.settings?.showAdvancedMetrics ? '<div id="metrics-insights"></div>' : ''}
        `;
        
        this.initChart();
        this.initTabs();
        
        // Update header with Bitcoin price
        this.updateHeader();
         // Ensure bubbles get a final refresh after layout established
        this.updatePerformanceBubblesInline();
        // Let Insights Manager render into its container
        if (this.settingsManager?.settings?.showAdvancedMetrics && this.insightsManager) {
        this.insightsManager.render('metrics-insights');
        }
    }

    // Top-of-view compact chip host (very small margins)
    renderPerformanceBubblesSection() {
    return `
        <div class="section" style="background:transparent;padding:0;margin:4px 0 8px;">
        <div id="worker-performance-bubbles-inline"></div>
        <!-- Bitaxe details drawer lives right below the bubbles -->
        <div id="bitaxe-viewer" style="display:none;margin-top:8px;"></div>
        </div>
    `;
    }

    // Delegate to manager to paint the chip ribbon
    updatePerformanceBubblesInline() {
        if (window.workerPerformanceManager) {
            window.workerPerformanceManager.renderSummaryBubblesInline('worker-performance-bubbles-inline');
        }
    }

    // Clicked chip -> set filter -> open Performance tab -> wait -> render filtered view
    async navigateToPerformanceTabWithFilter(filterKey) {
    const normalized = (filterKey && filterKey !== 'all') ? filterKey : null;
    const mgr = window.workerPerformanceManager;

    if (mgr) {
        mgr.currentFilter = normalized;
        // Update chip active state immediately
        mgr.renderSummaryBubblesInline('worker-performance-bubbles-inline');
    }

    // 1) Switch to the Performance tab UI first so its container is in the DOM
    this.switchToPerformanceTab();

    // 2) Give the UI a moment to mount the panel (two frames is usually plenty)
    await this.nextFrame(2);

    // 3) Ensure the container exists before painting
    await this.waitForElementById(['performance-content', 'performance-tab']);

    // 4) Now render the filtered worker list deterministically
    if (mgr) {
        const analysis = mgr.latestAnalysis ||
        (this.stats?.workers ? mgr.analyzeWorkerPerformance(this.stats.workers) : null);

        if (analysis) {
        mgr.updatePerformanceDisplay(analysis);        // paints with current filter
        }
    }

    // 5) Scroll into view (polish)
    const target = document.getElementById('performance-content') || document.getElementById('performance-tab');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    // Robust tab activation
    switchToPerformanceTab() {
        // If your global tab function exists, use it
        const tabBtn = document.querySelector('.tab-header .tab-button[onclick*="performance-tab"]');
        if (typeof window.switchTab === 'function') {
            window.switchTab('performance-tab', tabBtn || null);
            return;
        }
        // Else try to click the button
        if (tabBtn) { tabBtn.click(); return; }

        // Fallback: naive class toggle
        const allPanels = document.querySelectorAll('.tab-panel');
        allPanels.forEach(p => p.classList.remove('active'));
        const perfPanel = document.getElementById('performance-tab');
        if (perfPanel) perfPanel.classList.add('active');

        const allButtons = document.querySelectorAll('.tab-header .tab-button');
        allButtons.forEach(b => b.classList.remove('active'));
        if (allButtons.length) allButtons[1]?.classList.add('active'); // assumes order: workers, performance, ...
    }
    
    // BITCOIN PRICE FOR HEADER DISPLAY
    renderBitcoinPriceHeader() {
        // Only show if Bitcoin price manager exists and has data and setting is enabled
        if (window.bitcoinPriceManager && window.bitcoinPriceManager.currentPrice && 
            this.settingsManager?.settings?.showBitcoinPrice) {
            
            const price = window.bitcoinPriceManager.currentPrice;
            const changeColor = price.change24h >= 0 ? '#10b981' : '#ef4444';
            const changePrefix = price.change24h >= 0 ? '+' : '';
            const changeIcon = price.change24h >= 0 ? '📈' : '📉';
            const trendText = this.getBitcoinTrendText(price.change24h);
            
            return `
                <div style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f7931a 0%, #ff9500 100%); color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-weight: 600;">₿</span>
                        <span style="font-weight: 500;">${this.formatBitcoinPrice(price.price)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 12px;">
                        <span style="color: ${price.change24h >= 0 ? '#90EE90' : '#FFB6C1'};">
                            ${changePrefix}${price.change24h.toFixed(2)}%
                        </span>
                        <span style="font-size: 12px;">${changeIcon}</span>
                    </div>
                    <div style="font-size: 10px; opacity: 0.8; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px;">
                        ${trendText}
                    </div>
                    <div style="font-size: 9px; opacity: 0.7; margin-left: auto;">
                        ${price.timestamp.toLocaleTimeString().slice(0, 5)}
                    </div>
                </div>
            `;
        }
        return '';
    }
    
    // Update the header to include Bitcoin price
    updateHeader() {
        const header = document.querySelector('header');
        if (header) {
            const bitcoinPrice = this.renderBitcoinPriceHeader();
            
            // Check if header already has Bitcoin price element
            const existingBitcoin = header.querySelector('.bitcoin-header-price');
            
            if (bitcoinPrice) {
                if (existingBitcoin) {
                    // Update existing element
                    existingBitcoin.innerHTML = bitcoinPrice;
                } else {
                    // Create new element and insert between title and menu button
                    const bitcoinDiv = document.createElement('div');
                    bitcoinDiv.className = 'bitcoin-header-price';
                    bitcoinDiv.innerHTML = bitcoinPrice;
                    
                    // Find the menu button and insert before it
                    const menuButton = header.querySelector('.menu-btn');
                    if (menuButton) {
                        header.insertBefore(bitcoinDiv, menuButton);
                    } else {
                        // Fallback: append to header
                        header.appendChild(bitcoinDiv);
                    }
                }
            } else if (existingBitcoin) {
                // Remove Bitcoin price if it should not be shown
                existingBitcoin.remove();
            }
        }
    }
    
    // Helper method to format Bitcoin price for compact display
    formatBitcoinPrice(price) {
        if (price >= 100000) {
            return (price / 1000).toFixed(0) + 'k';
        } else if (price >= 10000) {
            return (price / 1000).toFixed(1) + 'k';
        } else {
            return price.toLocaleString();
        }
    }
    
    // Helper method to get trend description
    getBitcoinTrendText(change24h) {
        const absChange = Math.abs(change24h);
        if (absChange >= 10) {
            return change24h > 0 ? 'Strong Bull' : 'Heavy Bear';
        } else if (absChange >= 5) {
            return change24h > 0 ? 'Bullish' : 'Bearish';
        } else if (absChange >= 2) {
            return change24h > 0 ? 'Rising' : 'Falling';
        } else {
            return 'Stable';
        }
    }
    
    renderBitcoinPrice() {
        // Show Bitcoin price at the top if enabled and data exists (for Analytics tab)
        if (window.bitcoinPriceManager && window.bitcoinPriceManager.currentPrice && 
            this.settingsManager?.settings?.showBitcoinPrice) {
            
            const price = window.bitcoinPriceManager.currentPrice;
            const changeColor = price.change24h >= 0 ? '#10b981' : '#ef4444';
            const changePrefix = price.change24h >= 0 ? '+' : '';
            const changeIcon = price.change24h >= 0 ? '📈' : '📉';
            const lastUpdate = price.timestamp.toLocaleTimeString();
            
            // Update the bitcoin-price-section if it exists
            const bitcoinSection = document.getElementById('bitcoin-price-section');
            if (bitcoinSection) {
                bitcoinSection.innerHTML = `
                    <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
                            <span>₿ Bitcoin Price</span>
                            <span style="font-size: 12px; color: #6b7280; font-weight: normal;">
                                Updated: ${lastUpdate}
                            </span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">CURRENT PRICE</div>
                                <div style="font-size: 28px; font-weight: bold; color: #1f2937;">
                                    $${price.price.toLocaleString()}
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">24H CHANGE</div>
                                <div style="font-size: 20px; font-weight: bold; color: ${changeColor}; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <span>${changeIcon}</span>
                                    <span>${changePrefix}${price.change24h.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                return bitcoinSection.outerHTML;
            } else {
                return `
                    <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
                            <span>₿ Bitcoin Price</span>
                            <span style="font-size: 12px; color: #6b7280; font-weight: normal;">
                                Updated: ${lastUpdate}
                            </span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">CURRENT PRICE</div>
                                <div style="font-size: 28px; font-weight: bold; color: #1f2937;">
                                    $${price.price.toLocaleString()}
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">24H CHANGE</div>
                                <div style="font-size: 20px; font-weight: bold; color: ${changeColor}; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <span>${changeIcon}</span>
                                    <span>${changePrefix}${price.change24h.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        return '';
    }
    
    renderTabbedInterface() {
        // Count unread activities for badge
        const unreadCount = window.miningActivityManager ? 
            window.miningActivityManager.activities.filter(a => !a.read).length : 0;
        
        // Count underperforming workers for badge
        const workerIssues = this.getWorkerIssuesCount();
        
        return `
            <div class="tab-container">
                <div class="tab-header">
                    <button class="tab-button active" onclick="switchTab('workers-tab', this)">
                        <span>👷</span>
                        <span>Worker Details</span>
                        ${workerIssues > 0 ? `<span class="tab-badge">${workerIssues}</span>` : ''}
                    </button>
                    
                    <button class="tab-button" onclick="switchTab('performance-tab', this)">
                        <span>🔧</span>
                        <span>Performance</span>
                    </button>
                    
                    <button class="tab-button" onclick="switchTab('activity-tab', this)">
                        <span>📊</span>
                        <span>Activity Log</span>
                        ${unreadCount > 0 ? `<span class="tab-badge">${unreadCount}</span>` : ''}
                    </button>
                    
                    <button class="tab-button" onclick="switchTab('analytics-tab', this)">
                        <span>📈</span>
                        <span>Analytics</span>
                    </button>
                    
                    <button class="tab-button" onclick="switchTab('settings-tab', this)">
                        <span>⚙️</span>
                        <span>Settings</span>
                    </button>
                </div>
                
                <div class="tab-content">
                    <div id="workers-tab" class="tab-panel active">
                        ${this.renderWorkersTabContent()}
                    </div>
                    
                    <div id="performance-tab" class="tab-panel">
                        ${this.renderPerformanceTabContent()}
                    </div>
                    
                    <div id="activity-tab" class="tab-panel">
                        ${this.renderActivityTabContent()}
                    </div>
                    
                    <div id="analytics-tab" class="tab-panel">
                        ${this.renderAnalyticsTabContent()}
                    </div>
                    
                    <div id="settings-tab" class="tab-panel">
                        ${this.renderSettingsTabContent()}
                    </div>
                </div>
            </div>
        `;
    }
    
    getWorkerIssuesCount() {
        if (!this.stats.workers) return 0;
        
        let issueCount = 0;
        this.stats.workers.forEach(worker => {
            const currentHashrate = this.parseHashrate(worker.hashrate1m);
            const shares = parseInt(worker.shares) || 0;
            const rejects = parseInt(worker.rejects) || 0;
            const rejectRate = shares > 0 ? ((rejects / (shares + rejects)) * 100) : 0;
            
            // Count offline workers or high reject rates
            if (currentHashrate === 0 || rejectRate > 5) {
                issueCount++;
            }
        });
        
        return issueCount;
    }
    
    renderWorkersTabContent() {
        if (!this.stats.workers || this.stats.workers.length === 0) {
            return '<div style="text-align: center; color: #6b7280; padding: 40px;">No worker data available</div>';
        }
        
        return `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #374151;">Worker Overview</h3>
                <div style="display: flex; gap: 10px;">
                    <button onclick="showWorkerManagement()" class="refresh-btn" style="margin: 0; padding: 6px 12px; font-size: 12px;">
                        🔗 Manage URLs
                    </button>
                    <button onclick="exportWorkerData()" class="refresh-btn" style="margin: 0; padding: 6px 12px; font-size: 12px;">
                        💾 Export
                    </button>
                </div>
            </div>
            
            <div class="workers-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>1m Hashrate</th>
                            <th>5m Hashrate</th>
                            <th>1h Hashrate</th>
                            <th>Shares</th>
                            <th>Rejects</th>
                            <th>Best Share</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderWorkersTableRows()}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    renderPerformanceTabContent() {
        return `
            <div id="performance-content">
                <div style="text-align: center; color: #6b7280; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
                    <h3>Worker Performance Analysis</h3>
                    <p>Performance data will appear here once workers are analyzed.</p>
                    <button onclick="forceEnableWorkerPerformance()" class="refresh-btn" style="margin-top: 16px;">
                        Start Performance Analysis
                    </button>
                </div>
            </div>
        `;
    }
    
    renderActivityTabContent() {
        return `
            <div id="activity-content">
                <div id="activity-display-area">
                    <div style="text-align: center; color: #6b7280; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <h3>Mining Activity Timeline</h3>
                        <p>Activity data will appear here as mining events are tracked.</p>
                        <button onclick="refreshActivityTab()" class="refresh-btn" style="margin-top: 16px;">
                            Load Activities
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Enhanced renderAnalyticsTabContent method with proper structure
    renderAnalyticsTabContent() {
        return `
            <div id="analytics-content" style="min-height: 400px;">
                <div id="bitcoin-price-section" style="margin-bottom: 20px;"></div>
                <div id="analytics-display-area">
                    <div style="text-align: center; color: #6b7280; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                        <h3>Mining Analytics & Insights</h3>
                        <p>Advanced analytics and performance insights will appear here.</p>
                        <button onclick="refreshAnalyticsTab()" class="refresh-btn" style="margin-top: 16px;">
                            🔄 Load Analytics
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSettingsTabContent() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 16px;">🎨 Appearance</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Dark Mode</span>
                            <input type="checkbox" id="quick-dark-mode" onchange="quickToggleSetting('isDarkMode', this.checked)">
                        </label>
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Animations</span>
                            <input type="checkbox" id="quick-animations" onchange="quickToggleSetting('enableAnimations', this.checked)">
                        </label>
                    </div>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 16px;">🔔 Notifications</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Share Found</span>
                            <input type="checkbox" id="quick-share-notifications" onchange="quickToggleNotification('shareFound', this.checked)">
                        </label>
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Worker Offline</span>
                            <input type="checkbox" id="quick-worker-notifications" onchange="quickToggleNotification('workerOffline', this.checked)">
                        </label>
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Milestones</span>
                            <input type="checkbox" id="quick-milestone-notifications" onchange="quickToggleNotification('milestones', this.checked)">
                        </label>
                    </div>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 16px;">📊 Display</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Bitcoin Price</span>
                            <input type="checkbox" id="quick-bitcoin-price" onchange="quickToggleSetting('showBitcoinPrice', this.checked)">
                        </label>
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Refresh Interval</span>
                            <select id="quick-refresh-interval" onchange="quickUpdateRefreshInterval(this.value)" style="padding: 4px;">
                                <option value="30">30s</option>
                                <option value="60" selected>60s</option>
                                <option value="120">2m</option>
                                <option value="300">5m</option>
                            </select>
                        </label>
                    </div>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 16px;">🛠️ Actions</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button onclick="openSettings()" class="refresh-btn" style="margin: 0; justify-content: center;">
                            ⚙️ Advanced Settings
                        </button>
                        <button onclick="exportAllData()" class="refresh-btn" style="margin: 0; justify-content: center;">
                            💾 Export All Data
                        </button>
                        <button onclick="debugNotificationSettings()" class="refresh-btn" style="margin: 0; justify-content: center;">
                            🐛 Debug Notifications
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderWorkersTableRows() {
        if (!this.stats.workers) return '';
        
        return this.stats.workers.map(worker => {
            const cleanName = this.cleanWorkerName(worker.workername);
            const best = worker.bestever || worker.bestshare || 0;
            const hasUrl = this.workerUrls[cleanName];
            const urlIndicator = hasUrl ? ' 🔗' : '';
            
            // Calculate reject rate
            const shares = parseInt(worker.shares) || 0;
            const rejects = parseInt(worker.rejects) || 0;
            const rejectRate = shares > 0 ? ((rejects / (shares + rejects)) * 100).toFixed(2) : '0.00';
            
            // Determine status based on performance
            let status = '🟢 Online';
            const currentHashrate = this.parseHashrate(worker.hashrate1m);
            if (currentHashrate === 0) {
                status = '🔴 Offline';
            } else if (parseFloat(rejectRate) > 5) {
                status = '🟡 High Rejects';
            }
            
            return `<tr>
                <td>
                    <span class="worker-name" onclick="handleWorkerClick('${cleanName}', event)">
                        ${cleanName}${urlIndicator}
                    </span>
                </td>
                <td>${worker.hashrate1m || '0 TH/s'}</td>
                <td>${worker.hashrate5m || '0 TH/s'}</td>
                <td>${worker.hashrate1hr || '0 TH/s'}</td>
                <td>${this.formatValue(shares)}</td>
                <td>${this.formatValue(rejects)} (${rejectRate}%)</td>
                <td>${this.formatValue(best)}</td>
                <td>${status}</td>
            </tr>`;
        }).join('');
    }
    
    initTabs() {
        // Load current settings into quick toggles
        setTimeout(() => {
            this.loadQuickSettings();
            // Update tab content with actual data
            this.updateTabContent();
        }, 100);
    }
    
    loadQuickSettings() {
        if (!this.settingsManager) return;
        
        const settings = this.settingsManager.settings;
        const notificationSettings = window.miningActivityManager?.notificationSettings;
        
        // Load appearance settings
        const darkModeEl = document.getElementById('quick-dark-mode');
        const animationsEl = document.getElementById('quick-animations');
        const bitcoinPriceEl = document.getElementById('quick-bitcoin-price');
        const refreshIntervalEl = document.getElementById('quick-refresh-interval');
        
        if (darkModeEl) darkModeEl.checked = settings.isDarkMode;
        if (animationsEl) animationsEl.checked = settings.enableAnimations;
        if (bitcoinPriceEl) bitcoinPriceEl.checked = settings.showBitcoinPrice;
        if (refreshIntervalEl) refreshIntervalEl.value = this.refreshInterval;
        
        // Load notification settings
        if (notificationSettings) {
            const shareEl = document.getElementById('quick-share-notifications');
            const workerEl = document.getElementById('quick-worker-notifications');
            const milestoneEl = document.getElementById('quick-milestone-notifications');
            
            if (shareEl) shareEl.checked = notificationSettings.shareFound;
            if (workerEl) workerEl.checked = notificationSettings.workerOffline;
            if (milestoneEl) milestoneEl.checked = notificationSettings.milestones;
        }
    }
    
    // Enhanced updateTabContent method with analytics specific logic
    updateTabContent() {
        // This method will be called when tabs need fresh content
        console.log('🔄 Updating tab content...');
        
        // Update performance tab if manager exists
        if (window.workerPerformanceManager && this.stats.workers) {
            const performanceContent = document.getElementById('performance-content');
            if (performanceContent) {
                // Trigger performance analysis and let it update directly
                window.workerPerformanceManager.analyzeWorkerPerformance(this.stats.workers);
            }
        }
        
        // Force update activity tab content
        this.forceUpdateActivityTab();
        
        // Force update analytics tab content with enhanced method
        this.forceUpdateAnalyticsTabEnhanced();
        // Keep the top bubbles aligned with newest data
        this.updatePerformanceBubblesInline();
    }
    
    forceUpdateActivityTab() {
        if (window.miningActivityManager) {
            const activityArea = document.getElementById('activity-display-area');
            if (activityArea) {
                // Create temporary container with the expected ID
                activityArea.innerHTML = '<div id="mining-activity-temp"></div>';
                const tempContainer = document.getElementById('mining-activity-temp');
                
                if (tempContainer) {
                    // Temporarily change ID so the manager can find it
                    tempContainer.id = 'mining-activity';
                    
                    // Update the display
                    window.miningActivityManager.updateActivityDisplay();
                    
                    console.log('✅ Activity tab updated');
                }
            }
        }
    }
    
    // ENHANCED ANALYTICS TAB UPDATE METHOD
    forceUpdateAnalyticsTabEnhanced() {
        console.log('📈 Enhanced analytics tab update...');
        
        // Update Bitcoin price first
        this.renderBitcoinPrice();
        
        // Then update analytics
        if (window.analyticsManager) {
            const analyticsArea = document.getElementById('analytics-display-area');
            if (analyticsArea) {
                // Create or find analytics preview container
                let analyticsPreview = document.getElementById('analytics-preview');
                
                if (!analyticsPreview) {
                    analyticsPreview = document.createElement('div');
                    analyticsPreview.id = 'analytics-preview';
                    analyticsPreview.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px; width: 100%;';
                    analyticsArea.innerHTML = '';
                    analyticsArea.appendChild(analyticsPreview);
                }
                
                // Force visibility
                analyticsPreview.style.display = 'block';
                analyticsPreview.style.visibility = 'visible';
                analyticsPreview.style.opacity = '1';
                analyticsPreview.style.minHeight = '200px';
                
                // Use enhanced update method if available
                if (window.analyticsManager.updateAnalyticsDisplayFixed) {
                    window.analyticsManager.updateAnalyticsDisplayFixed();
                } else {
                    window.analyticsManager.updateAnalyticsDisplay();
                }
                
                // Triple-check content was created
                setTimeout(() => {
                    if (analyticsPreview.innerHTML.length < 200) {
                        console.warn('⚠️ Analytics content still minimal after enhanced update...');
                        this.createFallbackAnalyticsDisplay(analyticsPreview);
                    }
                }, 500);
                
                console.log('✅ Enhanced analytics tab updated');
            }
        } else {
            console.warn('⚠️ Analytics manager not available for enhanced update');
            this.createInitialAnalyticsDisplay();
        }
    }
    
    // ORIGINAL ANALYTICS TAB UPDATE (ENHANCED)
    forceUpdateAnalyticsTab() {
        if (window.analyticsManager) {
            const analyticsArea = document.getElementById('analytics-display-area');
            if (analyticsArea) {
                // Create container with the expected ID
                analyticsArea.innerHTML = '<div id="analytics-preview-temp"></div>';
                const tempContainer = document.getElementById('analytics-preview-temp');
                
                if (tempContainer) {
                    // Change ID so the manager can find it
                    tempContainer.id = 'analytics-preview';
                    tempContainer.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px; width: 100%;';
                    
                    // Use enhanced update method if available
                    if (window.analyticsManager.updateAnalyticsDisplayFixed) {
                        window.analyticsManager.updateAnalyticsDisplayFixed();
                    } else {
                        window.analyticsManager.updateAnalyticsDisplay();
                    }
                    
                    // Fallback check
                    setTimeout(() => {
                        if (tempContainer.innerHTML.length < 200) {
                            console.warn('⚠️ Analytics content still minimal, creating manual display...');
                            if (window.createManualAnalyticsDisplay) {
                                window.createManualAnalyticsDisplay();
                            }
                        }
                    }, 300);
                    
                    console.log('✅ Analytics tab updated with enhanced method');
                }
            }
        } else {
            console.warn('⚠️ Analytics manager not available for tab update');
            // Create basic analytics display even without manager
            const analyticsArea = document.getElementById('analytics-display-area');
            if (analyticsArea) {
                analyticsArea.innerHTML = `
                    <div id="analytics-preview" style="display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px; width: 100%;">
                        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #f59e0b;">
                            <h2 style="color: #f59e0b; margin-bottom: 20px;">📊 Analytics Initializing</h2>
                            
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h3>Status</h3>
                                <p><strong>Analytics Manager:</strong> Not loaded yet</p>
                                <p><strong>Action:</strong> Waiting for initialization</p>
                            </div>
                            
                            <div style="text-align: center;">
                                <button onclick="forceAnalyticsUpdate()" 
                                        style="background: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                                    🔄 Initialize Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Fallback analytics display creation
    createFallbackAnalyticsDisplay(container) {
        console.log('🔧 Creating fallback analytics display...');
        
        const hasData = this.stats && this.stats.hashrate_1min_ths;
        
        container.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6; display: block !important;">
                <h2 style="color: #3b82f6; margin-bottom: 20px;">📊 Mining Analytics</h2>
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3>System Status</h3>
                    <p><strong>Analytics Manager:</strong> ${window.analyticsManager ? '✅ Active' : '❌ Initializing'}</p>
                    <p><strong>Mining Data:</strong> ${hasData ? '✅ Available' : '⏳ Loading'}</p>
                    <p><strong>Last Update:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
                
                ${hasData ? `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
                        <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; text-align: center; border-left: 4px solid #3b82f6;">
                            <div style="font-size: 12px; color: #6b7280;">CURRENT HASHRATE</div>
                            <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">
                                ${this.stats.hashrate_1min_ths.toFixed(2)} TH/s
                            </div>
                        </div>
                        
                        <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; text-align: center; border-left: 4px solid #10b981;">
                            <div style="font-size: 12px; color: #6b7280;">ACTIVE WORKERS</div>
                            <div style="font-size: 18px; font-weight: bold; color: #10b981;">
                                ${this.stats.worker_count || 0}
                            </div>
                        </div>
                        
                        <div style="background: #fefce8; padding: 12px; border-radius: 6px; text-align: center; border-left: 4px solid #f59e0b;">
                            <div style="font-size: 12px; color: #6b7280;">TOTAL SHARES</div>
                            <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">
                                ${this.stats.accepted_shares?.toLocaleString() || 0}
                            </div>
                        </div>
                        
                        <div style="background: #fef2f2; padding: 12px; border-radius: 6px; text-align: center; border-left: 4px solid #ef4444;">
                            <div style="font-size: 12px; color: #6b7280;">BEST SHARE</div>
                            <div style="font-size: 18px; font-weight: bold; color: #ef4444;">
                                ${this.formatValue(this.stats.best_shares) || 0}
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                        <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                        <h3 style="color: #374151; margin-bottom: 8px;">Loading Mining Data</h3>
                        <p style="color: #6b7280;">Analytics will appear once data is available</p>
                    </div>
                `}
                
                <div style="margin-top: 20px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    <button onclick="forceAnalyticsUpdate()" 
                            style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        🔄 Refresh Analytics
                    </button>
                    <button onclick="generateSampleAnalytics()" 
                            style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                        📊 Generate Sample Data
                    </button>
                </div>
            </div>
        `;
        
        console.log('✅ Fallback analytics display created');
    }
    
    // Initial analytics display for when manager isn't loaded
    createInitialAnalyticsDisplay() {
        const analyticsArea = document.getElementById('analytics-display-area');
        if (analyticsArea) {
            analyticsArea.innerHTML = `
                <div id="analytics-preview" style="display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px; width: 100%;">
                    <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #f59e0b;">
                        <h2 style="color: #f59e0b; margin-bottom: 20px;">📊 Analytics Initializing</h2>
                        
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h3>Initialization Status</h3>
                            <p><strong>Analytics Manager:</strong> Loading...</p>
                            <p><strong>Data Collection:</strong> Preparing...</p>
                            <p><strong>Status:</strong> Please wait for initialization</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <button onclick="forceAnalyticsUpdate()" 
                                    style="background: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                                🔄 Initialize Analytics
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // UPDATED GENERAL STATS WITHOUT BITCOIN PRICE CARD
    renderGeneralStats() {
        const s = this.stats;
        let cards = `<div class="stats-grid">`;
        
        cards += `<div class="stat-card">
            <div class="stat-label">Worker Count</div>
            <div class="stat-value">${s.worker_count}</div>
        </div>`;
        
        if (s.comed_future_prices?.[0]) {
            const price = parseFloat(s.comed_future_prices[0].price);
            const tier = price <= 4 ? 'green' : (price <= 9 ? 'orange' : 'red');
            cards += `<div class="stat-card ${tier}">
                <div class="stat-label">ComEd Price</div>
                <div class="stat-value">${price}¢</div>
            </div>`;
        }
        
        if (s.last_share_time) {
            cards += `<div class="stat-card">
                <div class="stat-label">Last Share</div>
                <div class="stat-value">${s.last_share_time}</div>
            </div>`;
        }
        
        cards += `<div class="stat-card">
            <div class="stat-label">Best Share</div>
            <div class="stat-value">${this.formatValue(s.best_shares)}</div>
        </div>`;
        
        // Add accepted shares if available
        if (s.accepted_shares) {
            cards += `<div class="stat-card">
                <div class="stat-label">Total Shares</div>
                <div class="stat-value">${this.formatValue(s.accepted_shares)}</div>
            </div>`;
        }
        
        cards += `</div>`;
        return cards;
    }

    renderHashrateStats() {
        const s = this.stats;
        const fmt = (v) => Number(v).toFixed(2);

        // tolerate alternate keys
        const h1m  = s.hashrate_1min_ths;
        const h5m  = s.hashrate_5min_ths;
        const h1h  = s.hashrate_1hr_ths;
        const h24h = s.hashrate_24hr_ths ?? s.hashrate_24h_ths ?? s.hashrate_24h ?? s.hashrate_24hr ?? s.hashrate_1d_ths;
        const h7d  = s.hashrate_7d_ths   ?? s.hashrate_7day_ths ?? s.hashrate_7d   ?? s.hashrate_7day;

        return `<div class="section">
            <div class="section-title">⚡ Hashrate Overview</div>
            <div class="stats-grid">
            ${typeof h1m === 'number' ? `<div class="stat-card">
                <div class="stat-label">Current (1m)</div>
                <div class="stat-value">${fmt(h1m)} TH/s</div>
            </div>` : ''}

            ${typeof h5m === 'number' ? `<div class="stat-card">
                <div class="stat-label">Average (5m)</div>
                <div class="stat-value">${fmt(h5m)} TH/s</div>
            </div>` : ''}

            ${typeof h1h === 'number' ? `<div class="stat-card">
                <div class="stat-label">Average (1h)</div>
                <div class="stat-value">${fmt(h1h)} TH/s</div>
            </div>` : ''}

            ${h24h != null ? `<div class="stat-card">
                <div class="stat-label">Average (24h)</div>
                <div class="stat-value">${fmt(h24h)} TH/s</div>
            </div>` : ''}

            ${h7d != null ? `<div class="stat-card">
                <div class="stat-label">Average (7d)</div>
                <div class="stat-value">${fmt(h7d)} TH/s</div>
            </div>` : ''}
            </div>
        </div>`;
        }


    renderOddsStats() {
        const s = this.stats;
        const percent = (p) => this.formatPercent(Number(p));

        const p24h = s.odds_24hr_percent ?? s.odds_24h_percent;
        const p1w  = s.odds_1wk_percent  ?? s.odds_7d_percent   ?? s.odds_week_percent;
        const p1m  = s.odds_1mo_percent  ?? s.odds_30d_percent  ?? s.odds_month_percent;
        const p1y  = s.odds_1yr_percent;

        return `<div class="section">
            <div class="section-title">🎲 Block Discovery Odds</div>
            <div class="stats-grid">
            ${p24h != null ? `<div class="stat-card">
                <div class="stat-label">24 Hours</div>
                <div class="stat-value">${percent(p24h)}</div>
            </div>` : ''}

            ${p1w != null ? `<div class="stat-card">
                <div class="stat-label">1 Week</div>
                <div class="stat-value">${percent(p1w)}</div>
            </div>` : ''}

            ${p1m != null ? `<div class="stat-card">
                <div class="stat-label">1 Month</div>
                <div class="stat-value">${percent(p1m)}</div>
            </div>` : ''}

            ${p1y != null ? `<div class="stat-card">
                <div class="stat-label">1 Year</div>
                <div class="stat-value">${percent(p1y)}</div>
            </div>` : ''}
            </div>
        </div>`;
        }


    renderChart() {
        return `<div class="section">
            <div class="section-title">📈 Historical Hashrate</div>
            <div class="chart-container">
                <canvas id="chart"></canvas>
            </div>
        </div>`;
    }

    updateHistory(hashrate) {
        this.history.push({
            time: new Date(),
            value: hashrate
        });
        
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (this.countdown > 0) {
                this.countdown--;
            } else {
                this.countdown = this.refreshInterval;
                this.fetchData();
            }
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const countdownEl = document.querySelector('.countdown');
        if (countdownEl) {
            countdownEl.textContent = `${this.countdown}s`;
        }
    }

    initChart() {
        const ctx = document.getElementById('chart');
        if (!ctx || this.history.length === 0) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.history.map(h => h.time.toLocaleTimeString()),
                datasets: [{
                    label: 'Hashrate (TH/s)',
                    data: this.history.map(h => h.value),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Utility functions
    formatValue(n) {
        if (!n || isNaN(n)) return '0';
        const absN = Math.abs(n);
        if (absN >= 1e12) return (n / 1e12).toFixed(2) + 'T';
        if (absN >= 1e9) return (n / 1e9).toFixed(2) + 'G';
        if (absN >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (absN >= 1e3) return (n / 1e3).toFixed(2) + 'k';
        return n.toFixed(2);
    }

    formatPercent(p) {
        return p.toFixed(6) + '%';
    }

    cleanWorkerName(fullName) {
        const dotIndex = fullName.indexOf('.');
        return dotIndex > -1 ? fullName.substring(dotIndex + 1) : fullName;
    }
    
    parseHashrate(hashrateStr) {
        if (typeof hashrateStr === 'number') return hashrateStr;
        if (!hashrateStr) return 0;
        
        const match = hashrateStr.toString().match(/^([\d.]+)\s*([KMGT]?H\/s)?/i);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2] ? match[2].toUpperCase() : '';
        
        switch (unit) {
            case 'KH/S': return value / 1000000;
            case 'MH/S': return value / 1000;
            case 'GH/S': return value;
            case 'TH/S': return value * 1000;
            default: return value; // Assume TH/s if no unit
        }
    }

    loadWorkerUrls() {
        const stored = localStorage.getItem('workerUrls');
        return stored ? JSON.parse(stored) : {};
    }

    saveWorkerUrlsToStorage() {
        localStorage.setItem('workerUrls', JSON.stringify(this.workerUrls));
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    showNotification(title, body) {
        // Check if this is a share notification and if it should be blocked
        if (title.includes('Share Found') || title.includes('Share') || body.includes('share')) {
            const shareNotificationsEnabled = window.miningActivityManager?.notificationSettings?.shareFound;
            const globalNotificationsEnabled = this.settingsManager?.settings?.enableSmartNotifications;
            
            if (!shareNotificationsEnabled || !globalNotificationsEnabled) {
                console.log('🔕 Share notification blocked:', title, body);
                return; // Don't show the notification
            }
        }
        
        const notificationEl = document.getElementById('notification');
        if (notificationEl) {
            const titleEl = notificationEl.querySelector('.notification-title');
            const bodyEl = notificationEl.querySelector('.notification-body');
            
            if (titleEl && bodyEl) {
                titleEl.textContent = title;
                bodyEl.textContent = body;
                
                notificationEl.classList.add('show');
                
                setTimeout(() => {
                    notificationEl.classList.remove('show');
                }, 5000);
            }
        }

        // With this:
        if ('Notification' in window && Notification.permission === 'granted') {
        // If you have a real image URL, use: { body, icon: '/favicon.ico' }
        new Notification(title, { body });
        }
    }

    // ---------- Bitaxe Modal: styles + scaffolding ----------
    ensureBitaxeModalStyles() {
    if (document.getElementById('bitaxe-modal-styles')) return;
    const css = `
    .bitaxe-modal__overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,.45);
        display: none; align-items: center; justify-content: center; z-index: 9999;
        backdrop-filter: blur(2px);
    }
    .bitaxe-modal__dialog {
        width: min(100vw - 24px, 1000px);
        max-height: calc(100vh - 24px);
        background: #fff; border-radius: 12px; overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        display: flex; flex-direction: column;
    }
    .bitaxe-modal__hdr {
        display:flex; align-items:center; justify-content:space-between;
        padding: 12px 14px; border-bottom: 1px solid #e5e7eb; gap: 10px;
    }
    .bitaxe-modal__title { font-weight: 700; }
    .bitaxe-modal__body {
        padding: 12px; overflow: auto;
    }
    .bitaxe-modal__actions { display:flex; gap:8px; flex-wrap:wrap; }
    .refresh-btn {
        background: #2563eb; color: #fff; border: 0; padding: 8px 12px; border-radius: 8px;
        cursor: pointer; font-weight: 600;
    }
    .refresh-btn:hover { filter: brightness(0.95); }
    .refresh-btn.gray { background:#6b7280; }
    .bitaxe-badge { font-size:12px;color:#6b7280; }
    `;
    const style = document.createElement('style');
    style.id = 'bitaxe-modal-styles';
    style.textContent = css;
    document.head.appendChild(style);
    }

    getOrCreateBitaxeModal() {
    this.ensureBitaxeModalStyles();
    let overlay = document.getElementById('bitaxe-modal');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'bitaxe-modal';
    overlay.className = 'bitaxe-modal__overlay';
    overlay.innerHTML = `
        <div class="bitaxe-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="bitaxe-modal-title">
        <div class="bitaxe-modal__hdr">
            <div class="bitaxe-modal__title" id="bitaxe-modal-title">Bitaxe</div>
            <div class="bitaxe-modal__actions">
            <button class="refresh-btn" id="bitaxe-modal-refresh">Refresh</button>
            <a class="refresh-btn" id="bitaxe-modal-open" target="_blank" rel="noreferrer">Open UI</a>
            <button class="refresh-btn gray" id="bitaxe-modal-close">Close</button>
            </div>
        </div>
        <div class="bitaxe-modal__body" id="bitaxe-modal-body"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Close behaviors
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeBitaxeModal();
    });
    document.getElementById('bitaxe-modal-close').onclick = () => this.closeBitaxeModal();
    document.addEventListener('keydown', (e) => {
        if (overlay.style.display === 'flex' && e.key === 'Escape') this.closeBitaxeModal();
    });

    return overlay;
    }

    openBitaxeModal({ title, baseUrl }) {
    const overlay = this.getOrCreateBitaxeModal();
    document.getElementById('bitaxe-modal-title').textContent = title || 'Bitaxe';
    const openLink = document.getElementById('bitaxe-modal-open');
    openLink.style.display = baseUrl ? '' : 'none';
    if (baseUrl) openLink.href = baseUrl;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    }

    closeBitaxeModal() {
    const overlay = document.getElementById('bitaxe-modal');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    const body = document.getElementById('bitaxe-modal-body');
    if (body) body.innerHTML = '';
    }


    // ---------- Bitaxe Modal: workflow ----------
    onWorkerClick(workerName, evt) {
    if (evt) evt.stopPropagation();
    const isBitaxe = /bitaxe/i.test(workerName);
    if (isBitaxe) {
        this.showBitaxeModal(workerName);
    } else {
        // keep existing fallback behavior if you had one (e.g., navigate to performance tab)
        if (this.navigateToPerformanceTabWithFilter) {
        this.navigateToPerformanceTabWithFilter('all');
        }
    }
    }

    async showBitaxeModal(workerName) {
    // Use your saved mapping if present; fallback to localStorage "workerUrls"
    if (!this.workerUrls) {
        this.workerUrls =
        (typeof this.loadWorkerUrlsFromStorage === 'function'
            ? this.loadWorkerUrlsFromStorage()
            : JSON.parse(localStorage.getItem('workerUrls') || '{}')) || {};
    }

    const baseUrl = this.workerUrls?.[workerName] || '';
    this.openBitaxeModal({ title: `🪓 ${workerName}`, baseUrl });
    this.renderBitaxeLoadingModal(workerName, baseUrl);

    // hook up refresh button each time
    const refreshBtn = document.getElementById('bitaxe-modal-refresh');
    if (refreshBtn) refreshBtn.onclick = () => this.showBitaxeModal(workerName);

    if (!baseUrl) {
        this.renderBitaxeMissingUrlModal(workerName);
        return;
    }

    try {
        const info = await this.fetchBitaxeInfo(baseUrl);
        this.renderBitaxeModalContent(workerName, info, baseUrl);
    } catch (err) {
        this.renderBitaxeErrorModal(workerName, baseUrl, err);
    }
    }

    async fetchBitaxeInfo(baseUrl) {
    let url = (baseUrl || '').trim();
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
    const endpoint = url.replace(/\/+$/,'') + '/api/system/info';
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
    }

    // ---------- Bitaxe Modal: renders ----------
    renderBitaxeLoadingModal(workerName, baseUrl) {
    const body = document.getElementById('bitaxe-modal-body');
    if (!body) return;
    body.innerHTML = `
        <div style="color:#6b7280;">Fetching from <code>${baseUrl || '— (no URL saved)'}</code> …</div>
    `;
    }

    renderBitaxeMissingUrlModal(workerName) {
        const body = document.getElementById('bitaxe-modal-body');
        if (!body) return;

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:10px;">
            <div>No URL saved for <strong>${workerName}</strong>. Enter the Bitaxe base URL or IP (e.g., <code>http://10.0.0.42</code>).</div>
            <div style="display:flex;gap:8px;align-items:center;">
                <input id="bitaxe-url-input" type="text" placeholder="http://10.x.x.x"
                    style="flex:1;min-width:220px;padding:8px;border:1px solid #d1d5db;border-radius:6px;">
                <button class="refresh-btn" id="bitaxe-url-save">Save & Open</button>
            </div>
            </div>
        `;

        // Hide the "Open UI" link until we have a URL
        const openLink = document.getElementById('bitaxe-modal-open');
        if (openLink) openLink.style.display = 'none';

        // Bind click handler safely (no quoting problems)
        const saveBtn = document.getElementById('bitaxe-url-save');
        if (saveBtn) {
            saveBtn.onclick = () => {
            const input = document.getElementById('bitaxe-url-input');
            if (!input || !input.value) return;

            if (!this.workerUrls) this.workerUrls = {};
            this.workerUrls[workerName] = input.value.trim();

            if (typeof this.saveWorkerUrlsToStorage === 'function') {
                this.saveWorkerUrlsToStorage();
            } else {
                localStorage.setItem('workerUrls', JSON.stringify(this.workerUrls));
            }
            this.showBitaxeModal(workerName);
            };
        }
    }


    renderBitaxeErrorModal(workerName, baseUrl, err) {
    const body = document.getElementById('bitaxe-modal-body');
    if (!body) return;
    const msg = (err && (err.message || err.toString())) || 'Unknown error';
    body.innerHTML = `
        <div style="background:#fff;border:1px solid #fee2e2;border-left:4px solid #ef4444;border-radius:10px;padding:12px;">
        <div style="font-weight:700;margin-bottom:6px;">Failed to load ${workerName}</div>
        <div style="color:#b91c1c;margin-bottom:8px;">${msg} from <code>${baseUrl}</code></div>
        <div style="font-size:12px;color:#6b7280;">
            If blocked by CORS, open the device UI directly or use a simple reverse proxy that sets
            <code>Access-Control-Allow-Origin</code>.
        </div>
        <div style="margin-top:10px;">
            <button class="refresh-btn" onclick="window.app.showBitaxeModal(${JSON.stringify(workerName)})">Retry</button>
        </div>
        </div>
    `;
    }

    renderBitaxeModalContent(workerName, info, baseUrl) {
    const body = document.getElementById('bitaxe-modal-body');
    if (!body) return;

    const num = (v)=> (v===0 || v) ? v : '-';
    const asV = (v)=> (v>100 ? (v/1000).toFixed(2) : Number(v).toFixed(2)); // mV→V if needed
    const uptime = this.formatSeconds(info.uptimeSeconds||0);
    const hr = info.hashRate || 0;
    const ex = info.expectedHashrate || 0;
    const eff = ex>0 ? (hr/ex)*100 : null;
    const effBadge = eff!==null ? `${eff.toFixed(1)}%` : '—';
    const fans = (info.autofanspeed ? 'Auto' : 'Manual') + ` @ ${num(info.fanspeed)}%`;
    const poolUser = (info.stratumUser||'').split('.').slice(-1)[0] || info.hostname || workerName;

    // Update header actions "Open UI" after we know baseUrl correctness
    const openLink = document.getElementById('bitaxe-modal-open');
    if (openLink) {
        openLink.style.display = '';
        openLink.href = baseUrl;
    }

    body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="bitaxe-badge">${info.hostname||''} • ${info.version||info.axeOSVersion||''}</div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #3b82f6;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">HASHRATE</div>
            <div style="font-weight:700;">${hr.toFixed(1)} MH/s</div>
            <div style="font-size:12px;color:#6b7280;">Expected: ${ex ? ex.toFixed(1) : '—'} MH/s</div>
            <div style="margin-top:8px;height:8px;background:#e5e7eb;border-radius:9999px;overflow:hidden;">
            <div style="width:${Math.min(100, eff||0)}%;height:100%;background:#3b82f6;"></div>
            </div>
            <div style="font-size:12px;margin-top:6px;">Efficiency: <strong>${effBadge}</strong></div>
        </div>

        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #ef4444;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">THERMALS</div>
            <div>Chip: <strong>${num(info.temp)}°C</strong> • VRM: <strong>${num(info.vrTemp)}°C</strong></div>
            <div>Fan: <strong>${fans}</strong> ${info.fanrpm ? `• ${num(info.fanrpm)} rpm` : ''}</div>
            <div>${info.overheat_mode ? '🔥 Overheat mode active' : ''}</div>
        </div>

        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #10b981;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">POWER</div>
            <div>Power: <strong>${num(info.power)} W</strong></div>
            <div>Voltage: <strong>${asV(info.voltage)} V</strong> (Nominal ${asV(info.nominalVoltage||5)} V)</div>
            <div>Current: <strong>${num(info.current)}</strong> mA</div>
        </div>

        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #f59e0b;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">WIFI</div>
            <div>SSID: <strong>${info.ssid||'-'}</strong> • RSSI: <strong>${num(info.wifiRSSI)}</strong> dBm</div>
            <div>Status: ${info.wifiStatus||'-'} ${info.apEnabled? '• AP enabled':''}</div>
            <div>MAC: ${info.macAddr||'-'}</div>
        </div>

        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #111827;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">POOL</div>
            <div>${info.stratumURL||'-'}:${info.stratumPort||'-'}</div>
            <div>User: <code style="font-size:12px;">${poolUser}</code></div>
            <div>Diff: ${num(info.poolDifficulty)} • Resp: ${num(info.responseTime)} ms</div>
            <div>${info.isUsingFallbackStratum? 'Using fallback' : ''}</div>
        </div>

        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #6b7280;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">SESSION</div>
            <div>Uptime: <strong>${uptime}</strong></div>
            <div>Shares: <strong>${num(info.sharesAccepted)}</strong> ✅ / <strong>${num(info.sharesRejected)}</strong> ❌</div>
            <div>Best: ${info.bestSessionDiff||info.bestDiff||'-'}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:6px;">
            ${Array.isArray(info.sharesRejectedReasons) && info.sharesRejectedReasons.length
                ? 'Rejects: ' + info.sharesRejectedReasons.map(r=>`${r.message} (${r.count})`).join(', ')
                : ''}
            </div>
        </div>

        <div style="background:#f9fafb;border-radius:10px;padding:12px;border-left:4px solid #3b82f6;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">FIRMWARE / CLOCK</div>
            <div>FW: ${info.axeOSVersion || info.version || '-'}</div>
            <div>IDF: ${info.idfVersion || '-'}</div>
            <div>Board: ${info.boardVersion || '-'}</div>
            <div>Freq: ${num(info.frequency)} MHz • Core V: ${num(info.coreVoltageActual||info.coreVoltage)} mV ${info.overclockEnabled?'• OC':''}</div>
        </div>
        </div>
    `;
    }

    formatSeconds(sec) {
    const s = Math.max(0, Math.floor(sec||0));
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const r = s%60;
    return `${h}h ${m}m ${r}s`;
    }

}

// Initialize the app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new MiningStatsApp();
        window.app = app;
        // Allow markup to call handleWorkerClick from tables/cards
        window.handleWorkerClick = (name, evt) => window.app?.onWorkerClick?.(name, evt);

        // Add global debug functions
        window.debugBitcoinPrice = function() {
            console.log('=== BITCOIN PRICE DEBUG ===');
            console.log('App exists:', !!window.app);
            console.log('Bitcoin Manager exists:', !!window.bitcoinPriceManager);
            
            if (window.bitcoinPriceManager) {
                console.log('Current price object:', window.bitcoinPriceManager.currentPrice);
                console.log('Price value:', window.bitcoinPriceManager.currentPrice?.price);
                console.log('Change 24h:', window.bitcoinPriceManager.currentPrice?.change24h);
                console.log('Timestamp:', window.bitcoinPriceManager.currentPrice?.timestamp);
            }
            
            console.log('Settings Manager exists:', !!window.app?.settingsManager);
            if (window.app?.settingsManager) {
                console.log('Show Bitcoin setting:', window.app.settingsManager.settings?.showBitcoinPrice);
                console.log('All settings:', window.app.settingsManager.settings);
            }
            console.log('========================');
        };
        
        window.testBitcoinBanner = function() {
            console.log('🧪 Creating test Bitcoin banner in header...');
            
            // Remove existing test elements
            const existingTest = document.getElementById('test-bitcoin-banner');
            const existingInline = document.querySelector('.bitcoin-header-price-inline');
            if (existingTest) existingTest.remove();
            if (existingInline) existingInline.remove();
            
            // Create test Bitcoin HTML
            const testBitcoinHTML = `
                <div class="bitcoin-header-price" style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f7931a 0%, #ff9500 100%); color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-weight: 600;">₿</span>
                        <span style="font-weight: 500;">$65k</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 12px;">
                        <span style="color: #90EE90;">+2.34%</span>
                        <span style="font-size: 12px;">📈</span>
                    </div>
                    <div style="font-size: 10px; opacity: 0.8; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px;">
                        Bullish
                    </div>
                    <div style="font-size: 9px; opacity: 0.7; margin-left: auto;">
                        ${new Date().toLocaleTimeString().slice(0, 5)}
                    </div>
                </div>
            `;
            
            // Method 1: Look for header with "Belani Solo Mining" text
            const headerElements = document.querySelectorAll('*');
            let targetHeader = null;
            
            for (let element of headerElements) {
                if (element.textContent && element.textContent.includes('Belani Solo Mining')) {
                    // Found element containing the text, find its parent container
                    targetHeader = element.closest('header') || element.closest('div') || element.parentElement;
                    console.log('📍 Found Belani header container:', targetHeader?.tagName, targetHeader?.className);
                    break;
                }
            }
            
            // Method 2: Look for common header patterns
            if (!targetHeader) {
                const possibleHeaders = [
                    document.querySelector('header'),
                    document.querySelector('.header'),
                    document.querySelector('#header'),
                    document.querySelector('.app-header'),
                    document.querySelector('.navbar'),
                    document.querySelector('.top-bar')
                ];
                
                for (let header of possibleHeaders) {
                    if (header) {
                        targetHeader = header;
                        console.log('📍 Found header by selector:', header.className || header.id || header.tagName);
                        break;
                    }
                }
            }
            
            if (targetHeader) {
                // Create inline Bitcoin price display
                const bitcoinDiv = document.createElement('div');
                bitcoinDiv.className = 'bitcoin-header-price-inline';
                bitcoinDiv.style.cssText = 'display: flex; align-items: center; margin: 0 16px;';
                bitcoinDiv.innerHTML = testBitcoinHTML;
                
                // Try to find menu button to insert before it
                const menuButton = targetHeader.querySelector('button') || 
                                 targetHeader.querySelector('.menu-btn') || 
                                 targetHeader.querySelector('.btn') ||
                                 targetHeader.querySelector('[onclick*="menu"]') ||
                                 targetHeader.querySelector('[onclick*="Menu"]');
                
                if (menuButton) {
                    targetHeader.insertBefore(bitcoinDiv, menuButton);
                    console.log('✅ Test Bitcoin price inserted before menu button');
                } else {
                    // Fallback: append to header
                    targetHeader.appendChild(bitcoinDiv);
                    console.log('✅ Test Bitcoin price appended to header (menu button not found)');
                }
                
                // Make sure header has proper flex layout
                const headerStyle = getComputedStyle(targetHeader);
                if (headerStyle.display !== 'flex') {
                    targetHeader.style.display = 'flex';
                    targetHeader.style.alignItems = 'center';
                    targetHeader.style.justifyContent = 'space-between';
                    console.log('📐 Applied flex layout to header');
                }
                
                return bitcoinDiv;
                
            } else {
                console.warn('⚠️ Could not find header - creating fallback banner');
                // Fallback to banner
                const banner = document.createElement('div');
                banner.id = 'test-bitcoin-banner';
                banner.style.cssText = 'display: flex !important; justify-content: center; padding: 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-bottom: 1px solid #dee2e6; position: sticky; top: 0; z-index: 1000; width: 100%;';
                banner.innerHTML = testBitcoinHTML;
                
                document.body.insertBefore(banner, document.body.firstChild);
                console.log('✅ Test Bitcoin banner created as fallback');
                return banner;
            }
        };
        
        window.forceUpdateBitcoinHeader = function() {
            console.log('🔄 Force updating Bitcoin header...');
            if (window.app && window.app.updateHeader) {
                window.app.updateHeader();
            } else {
                console.error('❌ App or updateHeader method not available');
            }
        };
        
        window.debugPageStructure = function() {
            console.log('=== PAGE STRUCTURE DEBUG ===');
            
            // 1. Check for Belani text
            console.log('🔍 Searching for "Belani Solo Mining" text...');
            const elementsWithBelani = [];
            document.querySelectorAll('*').forEach(el => {
                if (el.textContent && el.textContent.includes('Belani')) {
                    elementsWithBelani.push({
                        element: el,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        textContent: el.textContent.trim().slice(0, 100),
                        parent: el.parentElement?.tagName
                    });
                }
            });
            
            console.log('Elements with "Belani" text:', elementsWithBelani);
            
            // 2. Check all headers
            console.log('🔍 All possible headers...');
            const headers = [
                ...document.querySelectorAll('header'),
                ...document.querySelectorAll('.header'),
                ...document.querySelectorAll('#header'),
                ...document.querySelectorAll('.navbar'),
                ...document.querySelectorAll('.top-bar'),
                ...document.querySelectorAll('[class*="header"]'),
                ...document.querySelectorAll('[id*="header"]')
            ];
            
            headers.forEach((header, i) => {
                console.log(`Header ${i}:`, {
                    tagName: header.tagName,
                    className: header.className,
                    id: header.id,
                    textContent: header.textContent.trim().slice(0, 100),
                    children: Array.from(header.children).map(c => c.tagName + (c.className ? '.' + c.className : ''))
                });
            });
            
            // 3. Check body direct children (might be the header area)
            console.log('🔍 Body direct children...');
            Array.from(document.body.children).forEach((child, i) => {
                console.log(`Body child ${i}:`, {
                    tagName: child.tagName,
                    className: child.className,
                    id: child.id,
                    textContent: child.textContent.trim().slice(0, 100)
                });
            });
            
            // 4. Look for buttons (menu buttons)
            console.log('🔍 All buttons...');
            document.querySelectorAll('button').forEach((btn, i) => {
                console.log(`Button ${i}:`, {
                    textContent: btn.textContent.trim(),
                    className: btn.className,
                    onclick: btn.onclick ? btn.onclick.toString().slice(0, 50) : 'none',
                    parent: btn.parentElement?.tagName
                });
            });
            
            console.log('========================');
        };
        
        window.createTestBitcoinAnywhere = function() {
            console.log('🧪 Creating test Bitcoin display - trying multiple locations...');
            
            // Remove any existing test elements
            document.querySelectorAll('.test-bitcoin-anywhere').forEach(el => el.remove());
            
            const testBitcoinHTML = `
                <div class="test-bitcoin-anywhere" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f7931a 0%, #ff9500 100%); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 0 8px;">
                    <span style="font-weight: 600;">₿ $65k</span>
                    <span style="color: #90EE90;">+2.34% 📈</span>
                </div>
            `;
            
            // Try multiple insertion points
            let insertionPoints = [];
            
            // 1. Try after any element containing "Belani"
            document.querySelectorAll('*').forEach(el => {
                if (el.textContent && el.textContent.includes('Belani') && el.children.length === 0) {
                    // This is likely the text element itself
                    insertionPoints.push({
                        type: 'After Belani text',
                        element: el,
                        method: 'afterend'
                    });
                }
            });
            
            // 2. Try before any button
            document.querySelectorAll('button').forEach(btn => {
                insertionPoints.push({
                    type: 'Before button',
                    element: btn,
                    method: 'beforebegin'
                });
            });
            
            // 3. Try in any header-like element
            document.querySelectorAll('header, .header, #header, [class*="header"]').forEach(header => {
                insertionPoints.push({
                    type: 'In header',
                    element: header,
                    method: 'beforeend'
                });
            });
            
            // 4. Try in first div of body
            if (document.body.firstElementChild) {
                insertionPoints.push({
                    type: 'In first body child',
                    element: document.body.firstElementChild,
                    method: 'beforeend'
                });
            }
            
            console.log('Found insertion points:', insertionPoints.length);
            
            // Try each insertion point
            insertionPoints.forEach((point, i) => {
                try {
                    const testDiv = document.createElement('div');
                    testDiv.innerHTML = testBitcoinHTML;
                    testDiv.style.cssText = 'display: inline-block;';
                    testDiv.setAttribute('data-test-location', `${point.type} ${i}`);
                    
                    point.element.insertAdjacentElement(point.method, testDiv);
                    
                    console.log(`✅ Inserted test Bitcoin at: ${point.type} ${i}`);
                } catch (e) {
                    console.log(`❌ Failed to insert at: ${point.type} ${i}`, e.message);
                }
            });
            
            // Also create one at the very top for reference
            const topDiv = document.createElement('div');
            topDiv.className = 'test-bitcoin-anywhere';
            topDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999;';
            topDiv.innerHTML = testBitcoinHTML.replace('margin: 0 8px;', '');
            document.body.appendChild(topDiv);
            
            console.log('✅ Also created reference Bitcoin at top-right corner');
        };
        
    });
} else {
    app = new MiningStatsApp();
    window.app = app;
    // Allow markup to call handleWorkerClick from tables/cards
    window.handleWorkerClick = (name, evt) => window.app?.onWorkerClick?.(name, evt);

    // Add global debug functions for immediate load
    window.debugBitcoinPrice = function() {
        console.log('=== BITCOIN PRICE DEBUG ===');
        console.log('App exists:', !!window.app);
        console.log('Bitcoin Manager exists:', !!window.bitcoinPriceManager);
        
        if (window.bitcoinPriceManager) {
            console.log('Current price object:', window.bitcoinPriceManager.currentPrice);
            console.log('Price value:', window.bitcoinPriceManager.currentPrice?.price);
            console.log('Change 24h:', window.bitcoinPriceManager.currentPrice?.change24h);
            console.log('Timestamp:', window.bitcoinPriceManager.currentPrice?.timestamp);
        }
        
        console.log('Settings Manager exists:', !!window.app?.settingsManager);
        if (window.app?.settingsManager) {
            console.log('Show Bitcoin setting:', window.app.settingsManager.settings?.showBitcoinPrice);
            console.log('All settings:', window.app.settingsManager.settings);
        }
        console.log('========================');
    };
    
    window.testBitcoinBanner = function() {
        console.log('🧪 Creating test Bitcoin banner...');
        
        // Remove existing test banner
        const existingTest = document.getElementById('test-bitcoin-banner');
        if (existingTest) {
            existingTest.remove();
        }
        
        // Create test banner with fake data
        const testHTML = `
            <div class="bitcoin-header-price" style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f7931a 0%, #ff9500 100%); color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 0 16px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-weight: 600;">₿</span>
                    <span style="font-weight: 500;">$65k</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px;">
                    <span style="color: #90EE90;">+2.34%</span>
                    <span style="font-size: 12px;">📈</span>
                </div>
                <div style="font-size: 10px; opacity: 0.8; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px;">
                    Bullish
                </div>
                <div style="font-size: 9px; opacity: 0.7; margin-left: auto;">
                    ${new Date().toLocaleTimeString().slice(0, 5)}
                </div>
            </div>
        `;
        
        const banner = document.createElement('div');
        banner.id = 'test-bitcoin-banner';
        banner.style.cssText = 'display: flex !important; justify-content: center; padding: 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-bottom: 1px solid #dee2e6; position: sticky; top: 0; z-index: 1000; width: 100%;';
        banner.innerHTML = testHTML;
        
        document.body.insertBefore(banner, document.body.firstChild);
        
        console.log('✅ Test Bitcoin banner created');
        return banner;
    };
    
    window.forceUpdateBitcoinHeader = function() {
        console.log('🔄 Force updating Bitcoin header...');
        if (window.app && window.app.updateHeader) {
            window.app.updateHeader();
        } else {
            console.error('❌ App or updateHeader method not available');
        }
    };
    
    window.enableBitcoinPrice = function() {
        console.log('🔧 Enabling Bitcoin price setting...');
        if (window.app?.settingsManager) {
            window.app.settingsManager.settings.showBitcoinPrice = true;
            window.app.settingsManager.saveSettings();
            console.log('✅ Bitcoin price setting enabled');
            
            // Try to update header
            setTimeout(() => {
                window.app.updateHeader();
            }, 100);
        } else {
            console.error('❌ Settings manager not available');
        }
    };
}

console.log('✅ Enhanced Mining Stats App Loaded with Main Area Bitcoin Price Display');