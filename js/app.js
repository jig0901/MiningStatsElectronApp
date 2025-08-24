// Updated MiningStatsApp with all new features integrated
// This updates the existing app with enhanced settings, bitcoin price, analytics, and performance tracking

class MiningStatsApp {
    constructor() {
        this.apiURL = 'https://www.yourdomain.com/metrics';
        this.refreshInterval = 60;
        this.countdown = this.refreshInterval;
        this.chart = null;
        this.history = [];
        this.previousStats = null;
        this.stats = null;
        this.workerUrls = this.loadWorkerUrls();
        this.currentWorkerName = null;
        this.currentUrl = null;
        
        // Initialize new managers
        this.settingsManager = new EnhancedSettingsManager();
        this.bitcoinPriceManager = new BitcoinPriceManager();
        this.analyticsManager = new MiningAnalyticsManager();
        this.performanceManager = new WorkerPerformanceManager();
        
        this.init();
    }

    init() {
        this.fetchData();
        this.startTimer();
        this.requestNotificationPermission();
        this.setupModalEvents();
        this.setupMenuButton();
        
        // Start Bitcoin price fetching
        this.bitcoinPriceManager.fetchBitcoinPrice();
        setInterval(() => {
            this.bitcoinPriceManager.fetchBitcoinPrice();
        }, 300000); // 5 minutes
    }
    
    setupMenuButton() {
        // Add enhanced menu button to existing toolbar
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn && !document.getElementById('menuButton')) {
            const menuButton = document.createElement('button');
            menuButton.id = 'menuButton';
            menuButton.className = 'refresh-btn';
            menuButton.style.marginRight = '10px';
            menuButton.innerHTML = '<span>⚙️</span><span>Menu</span>';
            menuButton.onclick = () => this.showMainMenu();
            
            refreshBtn.parentNode.insertBefore(menuButton, refreshBtn);
        }
    }
    
    showMainMenu() {
        const menu = document.createElement('div');
        menu.className = 'modal';
        menu.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>⚙️ Mining Stats Menu</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div style="padding: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button onclick="openSettingsModal()" class="btn primary">🎨 Enhanced Settings</button>
                        <button onclick="app.bitcoinPriceManager.showPriceAlerts()" class="btn secondary">💰 Bitcoin Price Alerts</button>
                        <button onclick="app.analyticsManager.showFullAnalytics()" class="btn secondary">📊 Advanced Analytics</button>
                        <button onclick="app.performanceManager.showPerformanceConfig()" class="btn secondary">⚡ Performance Setup</button>
                        <button onclick="app.showWorkerURLConfig()" class="btn secondary">🔗 Worker URLs</button>
                        <button onclick="app.showDataExportImport()" class="btn secondary">💾 Data Management</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(menu);
        menu.style.display = 'block';
    }
    
    showDataExportImport() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>💾 Data Management</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div style="padding: 20px;">
                    <h3>Export Data</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                        <button onclick="app.exportWorkerUrls()" class="btn secondary">Export Worker URLs</button>
                        <button onclick="app.exportSettings()" class="btn secondary">Export Settings</button>
                        <button onclick="app.exportAllData()" class="btn secondary">Export All Data</button>
                    </div>
                    
                    <h3>Import Data</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <input type="file" id="importFile" accept=".json" style="margin-bottom: 8px;">
                        <button onclick="app.importData()" class="btn secondary">Import Data</button>
                    </div>
                    
                    <h3 style="margin-top: 20px;">Clear Data</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button onclick="app.clearAnalyticsData()" class="btn danger">Clear Analytics Data</button>
                        <button onclick="app.clearAllData()" class="btn danger">Clear All Data</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    setupModalEvents() {
        // Existing modal setup code
        window.onclick = (event) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.remove();
                }
            });
        };

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => modal.remove());
            }
        });
    }

    // Enhanced data fetching with new analytics
    async fetchData() {
        try {
            const response = await fetch(this.apiURL);
            const data = await response.json();
            
            if (this.stats) {
                this.checkForChanges(this.stats, data);
            }
            
            // Record analytics data
            if (data.workers) {
                this.analyticsManager.analyzeShares(data, this.stats);
                this.analyticsManager.analyzeWorkerHealth(data.workers, this.history);
                this.performanceManager.recordPerformance(data.workers);
                
                // Calculate economic insights with ComEd price
                if (data.comed_future_prices?.[0]) {
                    const comedPrice = parseFloat(data.comed_future_prices[0].price);
                    this.analyticsManager.calculateEconomicInsights(data, comedPrice);
                    this.bitcoinPriceManager.calculateProfitability(comedPrice);
                }
            }
            
            this.stats = data;
            this.updateHistory(data.hashrate_1min_ths);
            this.render();
            this.countdown = this.refreshInterval;
        } catch (error) {
            console.error('Failed to fetch data:', error);
            this.showNotification('Connection Error', 'Failed to fetch mining data. Check your connection.');
        }
    }

    // Enhanced render method with new sections
    render() {
        if (!this.stats) return;
        
        const content = document.getElementById('content');
        content.innerHTML = `
            ${this.renderGeneralStats()}
            ${this.renderHashrateStats()}
            ${this.settingsManager.settings.showOddsSection ? this.renderOddsStats() : ''}
            ${this.settingsManager.settings.showBitcoinPrice ? this.renderBitcoinPriceSection() : ''}
            ${this.settingsManager.settings.showAnalyticsPreview ? this.renderAnalyticsPreview() : ''}
            ${this.settingsManager.settings.showChartsSection ? this.renderChart() : ''}
            ${this.settingsManager.settings.showWorkerPerformance && this.performanceManager.expectedHashrates.length > 0 ? this.renderPerformanceSection() : ''}
            ${this.settingsManager.settings.showWorkerTable ? this.renderWorkersTable() : ''}
        `;
        
        this.initChart();
        this.bitcoinPriceManager.initPriceChart();
        this.analyticsManager.renderAnalyticsSection();
        this.performanceManager.renderPerformanceSection();
    }

    renderBitcoinPriceSection() {
        return `<div id="bitcoin-price-section"></div>`;
    }

    renderAnalyticsPreview() {
        return `<div id="analytics-preview"></div>`;
    }

    renderPerformanceSection() {
        return `<div id="worker-performance"></div>`;
    }

    // Existing render methods remain the same
    renderGeneralStats() {
        const s = this.stats;
        let cards = `<div class="stats-grid">`;
        
        cards += `<div class="stat-card">
            <div class="stat-label">Worker Count</div>
            <div class="stat-value">${s.worker_count}</div>
        </div>`;
        
        if (s.comed_future_prices?.[0]) {
            const price = parseFloat(s.comed_future_prices[0].price);
            const tier = this.getPriceTier(price);
            cards += `<div class="stat-card ${tier} clickable" onclick="app.openBrowser('https://hourlypricing.comed.com/live-prices/', 'ComEd Live Pricing')">
                <div class="stat-label">ComEd Price (${s.comed_future_prices[0].time})</div>
                <div class="stat-value">${s.comed_future_prices[0].price} ¢</div>
            </div>`;
        }
        
        if (s.last_share_time) {
            cards += `<div class="stat-card">
                <div class="stat-label">Last Share</div>
                <div class="stat-value">${s.last_share_time}</div>
            </div>`;
        }
        
        if (s.accepted_shares) {
            cards += `<div class="stat-card">
                <div class="stat-label">Total Shares</div>
                <div class="stat-value">${this.formatValue(s.accepted_shares)}</div>
            </div>`;
        }
        
        cards += `<div class="stat-card">
            <div class="stat-label">Best Share</div>
            <div class="stat-value">${this.formatValue(s.best_shares)}</div>
        </div>`;
        
        if (s.workers) {
            const onlineCount = s.workers.filter(w => this.extractWorkerHashrate(w) > 0).length;
            cards += `<div class="stat-card">
                <div class="stat-label">Online Workers</div>
                <div class="stat-value">${onlineCount}/${s.workers.length}</div>
            </div>`;
        }
        
        cards += `</div>`;
        return cards;
    }

    renderHashrateStats() {
        if (!this.settingsManager.settings.showAdvancedMetrics) return '';
        
        const s = this.stats;
        let html = `<div class="section">
            <div class="section-title">⚡ Hashrate Overview</div>
            <div class="stats-grid">`;
        
        html += `<div class="stat-card">
            <div class="stat-label">Hashrate (1 m)</div>
            <div class="stat-value">${s.hashrate_1min_ths.toFixed(2)} TH/s</div>
        </div>`;
        
        if (s.hashrate_5min_ths) {
            html += `<div class="stat-card">
                <div class="stat-label">Hashrate (5 m)</div>
                <div class="stat-value">${s.hashrate_5min_ths.toFixed(2)} TH/s</div>
            </div>`;
        }
        
        if (s.hashrate_1hr_ths) {
            html += `<div class="stat-card">
                <div class="stat-label">Hashrate (1 h)</div>
                <div class="stat-value">${s.hashrate_1hr_ths.toFixed(2)} TH/s</div>
            </div>`;
        }
        
        if (s.hashrate_1d_ths) {
            html += `<div class="stat-card">
                <div class="stat-label">Hashrate (1 d)</div>
                <div class="stat-value">${s.hashrate_1d_ths.toFixed(2)} TH/s</div>
            </div>`;
        }
        
        if (s.hashrate_7d_ths) {
            html += `<div class="stat-card">
                <div class="stat-label">Hashrate (7 d)</div>
                <div class="stat-value">${s.hashrate_7d_ths.toFixed(2)} TH/s</div>
            </div>`;
        }
        
        html += `</div></div>`;
        return html;
    }

    renderOddsStats() {
        const s = this.stats;
        let html = `<div class="section">
            <div class="section-title">🎲 Odds of Finding a Block</div>
            <div class="stats-grid">`;
        
        if (s.odds_24hr_percent) {
            html += `<div class="stat-card">
                <div class="stat-label">Odds (24 h)</div>
                <div class="stat-value">${this.formatPercent(s.odds_24hr_percent)}</div>
            </div>`;
        }
        
        if (s.odds_7d_percent) {
            html += `<div class="stat-card">
                <div class="stat-label">Odds (7 d)</div>
                <div class="stat-value">${this.formatPercent(s.odds_7d_percent)}</div>
            </div>`;
        }
        
        if (s.odds_30d_percent) {
            html += `<div class="stat-card">
                <div class="stat-label">Odds (30 d)</div>
                <div class="stat-value">${this.formatPercent(s.odds_30d_percent)}</div>
            </div>`;
        }
        
        html += `<div class="stat-card">
            <div class="stat-label">Odds (1 yr)</div>
            <div class="stat-value">${this.formatPercent(s.odds_1yr_percent)}</div>
        </div>`;
        
        html += `</div></div>`;
        return html;
    }

    renderChart() {
        return `<div class="section">
            <div class="section-title">📈 Historical Hashrate (1 m TH/s)</div>
            <div class="chart-container">
                <canvas id="chart"></canvas>
            </div>
        </div>`;
    }

    renderWorkersTable() {
        if (!this.stats.workers || this.stats.workers.length === 0) {
            return '';
        }
        
        let html = `<div class="section">
            <div class="section-title">👷 Worker Details</div>
            <div class="workers-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>1 m</th>
                            <th>5 m</th>
                            <th>1 h</th>
                            <th>1 d</th>
                            <th>7 d</th>
                            <th>Shares</th>
                            <th>Best</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        for (const worker of this.stats.workers) {
            const cleanName = this.cleanWorkerName(worker.workername);
            const best = worker.bestever || worker.bestshare;
            const hasUrl = this.workerUrls[cleanName];
            const urlIndicator = hasUrl ? ' 🔗' : '';
            
            html += `<tr>
                <td>
                    <span class="worker-name" 
                          onclick="app.handleWorkerClick('${cleanName}', event)"
                          title="${hasUrl ? `Click to open: ${this.workerUrls[cleanName]}` : 'Click to set URL'} | Ctrl+Click to edit URL">
                        ${cleanName}${urlIndicator}
                    </span>
                </td>
                <td>${worker.hashrate1m}</td>
                <td>${worker.hashrate5m}</td>
                <td>${worker.hashrate1hr}</td>
                <td>${worker.hashrate1d}</td>
                <td>${worker.hashrate7d}</td>
                <td>${this.formatValue(worker.shares)}</td>
                <td>${this.formatValue(best)}</td>
            </tr>`;
        }
        
        html += `</tbody></table>
                <div style="margin-top: 15px; font-size: 12px; color: #6b7280; text-align: center;">
                    💡 Click worker names to choose how to open | Ctrl+Click to set/edit URLs | 🔗 indicates URL is set
                </div>
            </div>
        </div>`;
        return html;
    }

    // Data management methods
    exportWorkerUrls() {
        const data = {
            type: 'workerUrls',
            timestamp: new Date().toISOString(),
            data: this.workerUrls
        };
        this.downloadJSON(data, 'mining-stats-worker-urls.json');
    }

    exportSettings() {
        const data = {
            type: 'settings',
            timestamp: new Date().toISOString(),
            data: this.settingsManager.settings
        };
        this.downloadJSON(data, 'mining-stats-settings.json');
    }

    exportAllData() {
        const data = {
            type: 'full-export',
            timestamp: new Date().toISOString(),
            data: {
                workerUrls: this.workerUrls,
                settings: this.settingsManager.settings,
                priceHistory: this.bitcoinPriceManager.priceHistory,
                priceAlerts: this.bitcoinPriceManager.priceAlerts,
                shareAnalytics: this.analyticsManager.shareAnalytics,
                workerHealthMetrics: this.analyticsManager.workerHealthMetrics,
                economicInsights: this.analyticsManager.economicInsights,
                expectedHashrates: this.performanceManager.expectedHashrates,
                performanceHistory: this.performanceManager.performanceHistory
            }
        };
        this.downloadJSON(data, 'mining-stats-full-export.json');
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Export Complete', `Data exported to ${filename}`);
    }

    importData() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file to import');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                switch (importData.type) {
                    case 'workerUrls':
                        this.workerUrls = { ...this.workerUrls, ...importData.data };
                        this.saveWorkerUrlsToStorage();
                        break;
                        
                    case 'settings':
                        this.settingsManager.settings = { ...this.settingsManager.settings, ...importData.data };
                        this.settingsManager.saveSettings();
                        break;
                        
                    case 'full-export':
                        if (importData.data.workerUrls) {
                            this.workerUrls = { ...this.workerUrls, ...importData.data.workerUrls };
                            this.saveWorkerUrlsToStorage();
                        }
                        if (importData.data.settings) {
                            this.settingsManager.settings = { ...this.settingsManager.settings, ...importData.data.settings };
                            this.settingsManager.saveSettings();
                        }
                        if (importData.data.priceAlerts) {
                            this.bitcoinPriceManager.priceAlerts = importData.data.priceAlerts;
                            this.bitcoinPriceManager.savePriceAlerts();
                        }
                        if (importData.data.expectedHashrates) {
                            this.performanceManager.expectedHashrates = importData.data.expectedHashrates;
                            this.performanceManager.saveExpectedHashrates();
                        }
                        break;
                        
                    default:
                        throw new Error('Unknown import file type');
                }
                
                this.render();
                this.showNotification('Import Complete', 'Data imported successfully');
                
                // Close the modal
                document.querySelectorAll('.modal').forEach(modal => modal.remove());
                
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import data. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }

    clearAnalyticsData() {
        if (confirm('Clear all analytics data? This cannot be undone.')) {
            this.analyticsManager.shareAnalytics = [];
            this.analyticsManager.workerHealthMetrics = [];
            this.analyticsManager.economicInsights = [];
            this.bitcoinPriceManager.priceHistory = [];
            this.bitcoinPriceManager.profitabilityHistory = [];
            this.performanceManager.performanceHistory = [];
            
            // Save cleared data
            this.analyticsManager.saveShareAnalytics();
            this.analyticsManager.saveWorkerHealth();
            this.analyticsManager.saveEconomicInsights();
            this.bitcoinPriceManager.savePriceHistory();
            this.bitcoinPriceManager.saveProfitabilityHistory();
            this.performanceManager.savePerformanceHistory();
            
            this.showNotification('Data Cleared', 'Analytics data has been cleared');
            document.querySelectorAll('.modal').forEach(modal => modal.remove());
        }
    }

    clearAllData() {
        if (confirm('Clear ALL data including settings, URLs, and analytics? This cannot be undone.')) {
            // Clear all localStorage
            const keysToKeep = []; // Add any keys you want to preserve
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Reinitialize managers
            this.workerUrls = {};
            this.settingsManager = new EnhancedSettingsManager();
            this.bitcoinPriceManager = new BitcoinPriceManager();
            this.analyticsManager = new MiningAnalyticsManager();
            this.performanceManager = new WorkerPerformanceManager();
            
            this.render();
            this.showNotification('All Data Cleared', 'All data has been reset to defaults');
            document.querySelectorAll('.modal').forEach(modal => modal.remove());
        }
    }

    showWorkerURLConfig() {
        if (!document.getElementById('workerUrlConfigModal')) {
            this.createWorkerURLConfigModal();
        }
        document.getElementById('workerUrlConfigModal').style.display = 'block';
    }

    createWorkerURLConfigModal() {
        const modal = document.createElement('div');
        modal.id = 'workerUrlConfigModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔗 Worker URL Configuration</h2>
                    <span class="close" onclick="document.getElementById('workerUrlConfigModal').style.display='none'">&times;</span>
                </div>
                <div class="config-content">
                    <div id="workerUrlsList">
                        ${this.renderWorkerURLsList()}
                    </div>
                    <div class="add-url-section">
                        <h3>Add Worker URL</h3>
                        <div class="url-form">
                            <input type="text" id="newWorkerName" placeholder="Worker name (e.g., worker1)" />
                            <input type="text" id="newWorkerUrl" placeholder="IP address or URL" />
                            <button onclick="app.addWorkerUrlFromModal()" class="btn primary">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    renderWorkerURLsList() {
        const urls = Object.entries(this.workerUrls);
        if (urls.length === 0) {
            return '<div class="no-data">No worker URLs configured</div>';
        }
        
        return urls.map(([name, url]) => `
            <div class="url-item">
                <div class="url-info">
                    <span class="worker-name">${name}</span>
                    <span class="worker-url">${url}</span>
                </div>
                <button onclick="app.removeWorkerUrlFromModal('${name}')" class="btn-small danger">Remove</button>
            </div>
        `).join('');
    }

    addWorkerUrlFromModal() {
        const name = document.getElementById('newWorkerName').value.trim();
        const url = document.getElementById('newWorkerUrl').value.trim();
        
        if (!name || !url) {
            alert('Please enter both worker name and URL');
            return;
        }
        
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = `http://${url}`;
        }
        
        this.workerUrls[name] = finalUrl;
        this.saveWorkerUrlsToStorage();
        
        document.getElementById('newWorkerName').value = '';
        document.getElementById('newWorkerUrl').value = '';
        document.getElementById('workerUrlsList').innerHTML = this.renderWorkerURLsList();
        
        this.showNotification('URL Added', `Worker URL added for ${name}`);
    }

    removeWorkerUrlFromModal(name) {
        if (confirm(`Remove URL for worker ${name}?`)) {
            delete this.workerUrls[name];
            this.saveWorkerUrlsToStorage();
            document.getElementById('workerUrlsList').innerHTML = this.renderWorkerURLsList();
            this.showNotification('URL Removed', `Worker URL removed for ${name}`);
        }
    }

    // Enhanced settings integration
    updateRefreshInterval() {
        const intervals = {
            thirtySeconds: 30,
            oneMinute: 60,
            twoMinutes: 120,
            fiveMinutes: 300
        };
        
        const newInterval = intervals[this.settingsManager.settings.refreshInterval] || 60;
        if (this.refreshInterval !== newInterval) {
            this.refreshInterval = newInterval;
            this.countdown = newInterval;
            this.startTimer(); // Restart timer with new interval
        }
    }

    // Helper methods
    extractWorkerHashrate(worker) {
        const hashrate5m = worker.hashrate5m || '0T';
        return parseFloat(hashrate5m.replace('T', '').trim()) || 0;
    }

    cleanWorkerName(fullName) {
        const dotIndex = fullName.indexOf('.');
        return dotIndex > -1 ? fullName.substring(dotIndex + 1) : fullName;
    }

    formatValue(n) {
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

    getPriceTier(price) {
        if (price <= 4) return 'green';
        if (price <= 9) return 'orange';
        return 'red';
    }

    // Existing methods remain the same...
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

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '⛏️' });
        }
    }

    checkForChanges(oldStats, newStats) {
        if (oldStats.worker_count !== newStats.worker_count) {
            this.showNotification(
                '👷 Worker Count Changed',
                `From ${oldStats.worker_count} → ${newStats.worker_count} workers`
            );
        }

        if (oldStats.comed_future_prices?.[0] && newStats.comed_future_prices?.[0]) {
            const oldTier = this.getPriceTier(parseFloat(oldStats.comed_future_prices[0].price));
            const newTier = this.getPriceTier(parseFloat(newStats.comed_future_prices[0].price));
            
            if (oldTier !== newTier) {
                this.showNotification(
                    '💡 ComEd Price Tier Changed',
                    `Price moved from ${oldTier} → ${newTier} tier`
                );
            }
        }

        const oldHashrate = oldStats.hashrate_1min_ths;
        const newHashrate = newStats.hashrate_1min_ths;
        const changePercent = Math.abs((newHashrate - oldHashrate) / oldHashrate) * 100;
        
        if (changePercent > 10) {
            const direction = newHashrate > oldHashrate ? '↗️' : '↘️';
            this.showNotification(
                `${direction} Hashrate Change`,
                `${oldHashrate.toFixed(2)} → ${newHashrate.toFixed(2)} TH/s (${changePercent.toFixed(1)}%)`
            );
        }
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
        if (this.timer) {
            clearInterval(this.timer);
        }
        
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
        if (!ctx) return;
        
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
                    borderColor: this.settingsManager.settings.accentColor === 'orange' ? '#667eea' : this.settingsManager.getAccentColorValue(),
                    backgroundColor: `${this.settingsManager.getAccentColorValue()}20`,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Browser methods (keeping existing functionality)
    async openBrowser(url, title) {
        // Existing browser implementation
        console.log(`Opening browser for: ${url}`);
        // Implementation from original code...
    }

    handleWorkerClick(workerName, event) {
        // Existing worker click implementation
        event.preventDefault();
        
        if (event.shiftKey || event.ctrlKey || event.metaKey) {
            this.openWorkerUrlModal(workerName);
        } else if (this.workerUrls[workerName]) {
            const url = this.workerUrls[workerName];
            this.openBrowser(url, `Worker: ${workerName}`);
        } else {
            this.openWorkerUrlModal(workerName);
        }
    }

    openWorkerUrlModal(workerName) {
        // Existing implementation
        this.currentWorkerName = workerName;
        const modal = document.getElementById('workerUrlModal');
        if (modal) {
            const nameDisplay = document.getElementById('workerNameDisplay');
            const urlInput = document.getElementById('workerUrlInput');
            
            if (nameDisplay && urlInput) {
                nameDisplay.textContent = workerName;
                urlInput.value = this.workerUrls[workerName] || '';
                modal.style.display = 'block';
                urlInput.focus();
            }
        }
    }
}

// Initialize the enhanced app
const app = new MiningStatsApp();