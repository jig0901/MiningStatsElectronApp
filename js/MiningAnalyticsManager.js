// Mining Analytics Manager for Electron App
// Converted from MiningAnalyticsModule.swift

class MiningAnalyticsManager {
    constructor() {
        this.shareAnalytics = [];
        this.networkData = null;
        this.workerHealthMetrics = [];
        this.economicInsights = [];
        this.isLoadingNetworkData = false;
        
        this.maxHistoryPoints = 288; // 24 hours at 5-minute intervals
        
        // Network API endpoints
        this.mempoolSpaceURL = 'https://mempool.space/api/v1/fees/recommended';
        this.blockstreamURL = 'https://blockstream.info/api/blocks/tip/height';
        this.difficultyURL = 'https://blockstream.info/api/blocks/tip';
        
        this.loadStoredData();
        this.fetchNetworkData();
    }
    
    // Share Analysis
    analyzeShares(stats, previousStats = null) {
        const currentShares = stats.accepted_shares || 0;
        const currentBestShare = stats.best_shares;
        const currentHashrate = stats.hashrate_1min_ths;
        
        // Calculate share metrics
        const averageShareDifficulty = this.calculateAverageShareDifficulty(currentShares, currentHashrate);
        const shareLuck = this.calculateShareLuck(currentShares, currentHashrate, 300); // 5 minutes
        const shareEfficiency = currentHashrate > 0 ? currentShares / currentHashrate : 0;
        
        const analytics = {
            id: this.generateId(),
            timestamp: new Date(),
            totalShares: currentShares,
            bestShare: currentBestShare,
            averageShareDifficulty: averageShareDifficulty,
            shareLuck: shareLuck,
            shareEfficiency: shareEfficiency
        };
        
        this.shareAnalytics.push(analytics);
        this.trimHistoryIfNeeded(this.shareAnalytics);
        this.saveShareAnalytics();
    }
    
    calculateAverageShareDifficulty(shares, hashrate) {
        if (hashrate <= 0) return 0;
        return shares / hashrate * 1000000; // Rough estimate
    }
    
    calculateShareLuck(shares, hashrate, timeInterval) {
        const expectedShares = hashrate * timeInterval / 600; // Rough estimate
        if (expectedShares <= 0) return 0;
        return shares / expectedShares;
    }
    
    getLuckCategory(shareLuck) {
        if (shareLuck >= 1.2) return { name: 'Very Lucky', color: '#10b981', emoji: '🍀' };
        if (shareLuck >= 1.05) return { name: 'Lucky', color: '#3b82f6', emoji: '😊' };
        if (shareLuck >= 0.95) return { name: 'Average', color: '#6b7280', emoji: '😐' };
        if (shareLuck >= 0.8) return { name: 'Unlucky', color: '#f59e0b', emoji: '😕' };
        return { name: 'Very Unlucky', color: '#ef4444', emoji: '😰' };
    }
    
    // Network Data
    async fetchNetworkData() {
        if (this.isLoadingNetworkData) return;
        this.isLoadingNetworkData = true;
        
        try {
            const [mempoolData, blockData] = await Promise.all([
                this.fetchMempoolData(),
                this.fetchBlockData()
            ]);
            
            this.networkData = {
                difficulty: blockData.difficulty,
                networkHashrate: this.calculateNetworkHashrate(blockData.difficulty),
                mempoolSize: mempoolData.mempoolSize,
                mempoolBytes: mempoolData.mempoolBytes,
                recommendedFeeRate: mempoolData.recommendedFee,
                averageConfirmationTime: mempoolData.confirmationTime,
                blockHeight: blockData.height,
                timestamp: new Date()
            };
            
            this.isLoadingNetworkData = false;
            this.updateNetworkDisplay();
        } catch (error) {
            console.error('Failed to fetch network data:', error);
            this.isLoadingNetworkData = false;
        }
    }
    
    async fetchMempoolData() {
        try {
            const response = await fetch(this.mempoolSpaceURL);
            const data = await response.json();
            return {
                mempoolSize: 50000, // Simplified
                mempoolBytes: 100000000,
                recommendedFee: data.fastestFee || 20.0,
                confirmationTime: 15.0
            };
        } catch (error) {
            // Fallback data
            return {
                mempoolSize: 50000,
                mempoolBytes: 100000000,
                recommendedFee: 20.0,
                confirmationTime: 15.0
            };
        }
    }
    
    async fetchBlockData() {
        try {
            const [heightResponse, tipResponse] = await Promise.all([
                fetch(this.blockstreamURL),
                fetch(this.difficultyURL)
            ]);
            
            const height = await heightResponse.json();
            const tipData = await tipResponse.json();
            
            return {
                difficulty: tipData.bits ? this.calculateDifficultyFromBits(tipData.bits) : 83148355189239.77,
                height: height
            };
        } catch (error) {
            // Fallback data
            return {
                difficulty: 83148355189239.77,
                height: 850000
            };
        }
    }
    
    calculateDifficultyFromBits(bits) {
        // Simplified difficulty calculation
        return 83148355189239.77; // Current approximate difficulty
    }
    
    calculateNetworkHashrate(difficulty) {
        // Network hashrate calculation: difficulty * 2^256 / (600 * 10^18)
        return difficulty / 6.0e24; // Simplified calculation in EH/s
    }
    
    // Worker Health Analysis
    analyzeWorkerHealth(workers, historicalData) {
        this.workerHealthMetrics = [];
        
        workers.forEach(worker => {
            const stability = this.calculateHashrateStability(worker, historicalData);
            const shareRate = this.calculateShareSubmissionRate(worker);
            const uptime = this.calculateUptimePercentage(worker, historicalData);
            const trend = this.calculatePerformanceTrend(worker, historicalData);
            const healthScore = this.calculateHealthScore(stability, shareRate, uptime, trend);
            const maintenanceDate = this.predictMaintenanceDate(healthScore, trend);
            
            const metrics = {
                id: this.generateId(),
                workerName: worker.workername,
                timestamp: new Date(),
                hashRateStability: stability,
                shareSubmissionRate: shareRate,
                uptimePercentage: uptime,
                performanceTrend: trend,
                healthScore: healthScore,
                predictedMaintenanceDate: maintenanceDate
            };
            
            this.workerHealthMetrics.push(metrics);
        });
        
        this.saveWorkerHealth();
    }
    
    calculateHashrateStability(worker, history) {
        const recentHashrates = history.slice(-12).map(() => this.extractWorkerHashrate(worker));
        if (recentHashrates.length <= 1) return 100;
        
        const mean = recentHashrates.reduce((sum, h) => sum + h, 0) / recentHashrates.length;
        const variance = recentHashrates.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / recentHashrates.length;
        const standardDeviation = Math.sqrt(variance);
        
        const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1.0;
        return Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
    }
    
    extractWorkerHashrate(worker) {
        const hashrate5m = worker.hashrate5m || '0T';
        return parseFloat(hashrate5m.replace('T', '')) || 0;
    }
    
    calculateShareSubmissionRate(worker) {
        return this.extractWorkerHashrate(worker) * 0.1; // Rough estimate
    }
    
    calculateUptimePercentage(worker, history) {
        const isOnline = this.extractWorkerHashrate(worker) > 0;
        return isOnline ? 100 : 0; // Simplified
    }
    
    calculatePerformanceTrend(worker, history) {
        if (history.length < 24) return 'stable';
        
        const currentHashrate = this.extractWorkerHashrate(worker);
        const oldHashrate = currentHashrate * (0.9 + Math.random() * 0.2); // Simulated for demo
        
        const change = (currentHashrate - oldHashrate) / oldHashrate;
        
        if (change >= 0.05) return 'improving';
        if (change <= -0.05 && change > -0.2) return 'declining';
        if (change <= -0.2) return 'critical';
        return 'stable';
    }
    
    calculateHealthScore(stability, shareRate, uptime, trend) {
        let score = (stability * 0.3 + uptime * 0.4 + Math.min(shareRate * 10, 100) * 0.3);
        
        // Adjust for trend
        switch (trend) {
            case 'improving': score *= 1.1; break;
            case 'declining': score *= 0.9; break;
            case 'critical': score *= 0.7; break;
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    predictMaintenanceDate(healthScore, trend) {
        if (healthScore >= 80 && trend !== 'declining') return null;
        
        let daysUntilMaintenance;
        if (healthScore < 30) daysUntilMaintenance = 7;
        else if (healthScore < 50 && trend === 'critical') daysUntilMaintenance = 14;
        else if (healthScore < 50) daysUntilMaintenance = 30;
        else if (healthScore < 70 && trend === 'declining') daysUntilMaintenance = 45;
        else if (healthScore < 80 && trend === 'declining') daysUntilMaintenance = 60;
        else daysUntilMaintenance = 90;
        
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysUntilMaintenance);
        return futureDate;
    }
    
    getHealthCategory(healthScore) {
        if (healthScore >= 90) return { name: 'Excellent', color: '#10b981' };
        if (healthScore >= 75) return { name: 'Good', color: '#3b82f6' };
        if (healthScore >= 50) return { name: 'Fair', color: '#f59e0b' };
        if (healthScore >= 25) return { name: 'Poor', color: '#f59e0b' };
        return { name: 'Critical', color: '#ef4444' };
    }
    
    // Economic Analysis
    calculateEconomicInsights(stats, comedPrice) {
        const hashrate = stats.hashrate_1min_ths;
        const shares = stats.accepted_shares || 0;
        
        // Estimated costs (configurable)
        const powerConsumptionKW = hashrate * 3.5; // 3.5 kW per TH/s
        const electricityCostPerKWh = comedPrice / 100.0;
        const hourlyCost = powerConsumptionKW * electricityCostPerKWh;
        
        // Estimated revenue (simplified)
        const btcPrice = 45000.0; // Would come from price API
        const networkHashrate = 500.0; // EH/s
        const blockReward = 6.25; // BTC
        const blocksPerHour = 6.0;
        
        const hashShareOfNetwork = hashrate / (networkHashrate * 1_000_000);
        const estimatedBTCPerHour = hashShareOfNetwork * blockReward * blocksPerHour;
        const estimatedRevenuePerHour = estimatedBTCPerHour * btcPrice;
        
        const profitability = estimatedRevenuePerHour - hourlyCost;
        const costPerShare = shares > 0 ? hourlyCost / shares : 0;
        const costPerTH = hashrate > 0 ? hourlyCost / hashrate : 0;
        
        const insights = {
            id: this.generateId(),
            timestamp: new Date(),
            realTimeProfitability: profitability,
            costPerShare: costPerShare,
            costPerTerraHash: costPerTH,
            optimalComEdThreshold: this.calculateOptimalThreshold(estimatedRevenuePerHour, powerConsumptionKW),
            dailyProfitForecast: profitability * 24,
            weeklyROI: this.calculateWeeklyROI(profitability),
            breakEvenElectricityPrice: this.calculateBreakEvenPrice(estimatedRevenuePerHour, powerConsumptionKW)
        };
        
        this.economicInsights.push(insights);
        this.trimHistoryIfNeeded(this.economicInsights);
        this.saveEconomicInsights();
    }
    
    calculateOptimalThreshold(revenuePerHour, powerConsumption) {
        return (revenuePerHour / powerConsumption) * 100; // cents per kWh
    }
    
    calculateWeeklyROI(profitability) {
        const weeklyProfit = profitability * 24 * 7;
        const estimatedEquipmentCost = 50000.0; // Configurable
        return (weeklyProfit / estimatedEquipmentCost) * 100;
    }
    
    calculateBreakEvenPrice(revenuePerHour, powerConsumption) {
        return (revenuePerHour / powerConsumption) * 100;
    }
    
    getProfitabilityStatus(profitability) {
        if (profitability >= 0.001) return { name: 'Profitable', color: '#10b981', emoji: '💰' };
        if (profitability >= -0.001) return { name: 'Break Even', color: '#f59e0b', emoji: '⚖️' };
        return { name: 'Unprofitable', color: '#ef4444', emoji: '📉' };
    }
    
    // Utility Methods
    trimHistoryIfNeeded(array) {
        if (array.length > this.maxHistoryPoints) {
            array.splice(0, array.length - this.maxHistoryPoints);
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatLargeNumber(number) {
        if (number >= 1e12) return `${(number / 1e12).toFixed(2)}T`;
        if (number >= 1e9) return `${(number / 1e9).toFixed(2)}B`;
        if (number >= 1e6) return `${(number / 1e6).toFixed(2)}M`;
        if (number >= 1e3) return `${(number / 1e3).toFixed(2)}K`;
        return number.toFixed(2);
    }
    
    cleanWorkerName(fullName) {
        const dotIndex = fullName.indexOf('.');
        return dotIndex > -1 ? fullName.substring(dotIndex + 1) : fullName;
    }
    
    // Persistence
    saveShareAnalytics() {
        localStorage.setItem('shareAnalytics', JSON.stringify(this.shareAnalytics));
    }
    
    saveWorkerHealth() {
        localStorage.setItem('workerHealthMetrics', JSON.stringify(this.workerHealthMetrics));
    }
    
    saveEconomicInsights() {
        localStorage.setItem('economicInsights', JSON.stringify(this.economicInsights));
    }
    
    loadStoredData() {
        // Load share analytics
        const shareData = localStorage.getItem('shareAnalytics');
        if (shareData) {
            try {
                this.shareAnalytics = JSON.parse(shareData);
            } catch (e) {
                console.error('Failed to load share analytics:', e);
            }
        }
        
        // Load worker health
        const healthData = localStorage.getItem('workerHealthMetrics');
        if (healthData) {
            try {
                this.workerHealthMetrics = JSON.parse(healthData);
            } catch (e) {
                console.error('Failed to load worker health metrics:', e);
            }
        }
        
        // Load economic insights
        const economicData = localStorage.getItem('economicInsights');
        if (economicData) {
            try {
                this.economicInsights = JSON.parse(economicData);
            } catch (e) {
                console.error('Failed to load economic insights:', e);
            }
        }
    }
    
    // UI Rendering Methods
    renderAnalyticsSection() {
        const container = document.getElementById('analytics-preview');
        if (!container) return;
        
        container.innerHTML = `
            <div class="section analytics-section">
                <div class="section-title">
                    <span class="icon">📈</span>
                    <span>Advanced Analytics</span>
                    <button onclick="app.analyticsManager.showFullAnalytics()" class="btn-small">View All</button>
                </div>
                <div class="analytics-grid">
                    ${this.renderQuickAnalyticsCards()}
                </div>
            </div>
        `;
    }
    
    renderQuickAnalyticsCards() {
        let cards = '';
        
        // Share Luck Card
        if (this.shareAnalytics.length > 0) {
            const latest = this.shareAnalytics[this.shareAnalytics.length - 1];
            const category = this.getLuckCategory(latest.shareLuck);
            cards += `
                <div class="analytics-card">
                    <div class="card-header">
                        <span class="icon">${category.emoji}</span>
                        <span class="title">Share Luck</span>
                    </div>
                    <div class="card-value" style="color: ${category.color}">
                        ${latest.shareLuck.toFixed(2)}
                    </div>
                    <div class="card-subtitle">${category.name}</div>
                </div>
            `;
        }
        
        // Profitability Card
        if (this.economicInsights.length > 0) {
            const latest = this.economicInsights[this.economicInsights.length - 1];
            const status = this.getProfitabilityStatus(latest.realTimeProfitability);
            cards += `
                <div class="analytics-card">
                    <div class="card-header">
                        <span class="icon">${status.emoji}</span>
                        <span class="title">Profitability</span>
                    </div>
                    <div class="card-value" style="color: ${status.color}">
                        ${latest.realTimeProfitability.toFixed(2)}/hr
                    </div>
                    <div class="card-subtitle">${status.name}</div>
                </div>
            `;
        }
        
        // Worker Health Card
        if (this.workerHealthMetrics.length > 0) {
            const avgHealth = this.workerHealthMetrics.reduce((sum, w) => sum + w.healthScore, 0) / this.workerHealthMetrics.length;
            const healthColor = avgHealth >= 80 ? '#10b981' : (avgHealth >= 60 ? '#f59e0b' : '#ef4444');
            cards += `
                <div class="analytics-card">
                    <div class="card-header">
                        <span class="icon">❤️</span>
                        <span class="title">Avg Health</span>
                    </div>
                    <div class="card-value" style="color: ${healthColor}">
                        ${Math.round(avgHealth)}/100
                    </div>
                    <div class="card-subtitle">Fleet Status</div>
                </div>
            `;
        }
        
        // Network Status Card
        if (this.networkData) {
            cards += `
                <div class="analytics-card">
                    <div class="card-header">
                        <span class="icon">🌍</span>
                        <span class="title">Network</span>
                    </div>
                    <div class="card-value" style="color: #3b82f6">
                        ${this.networkData.networkHashrate.toFixed(1)} EH/s
                    </div>
                    <div class="card-subtitle">Global Hashrate</div>
                </div>
            `;
        }
        
        return cards;
    }
    
    updateNetworkDisplay() {
        const container = document.getElementById('network-data-section');
        if (!container || !this.networkData) return;
        
        container.innerHTML = `
            <div class="section network-section">
                <div class="section-title">
                    <span class="icon">🌍</span>
                    <span>Bitcoin Network Status</span>
                </div>
                <div class="network-grid">
                    <div class="network-card">
                        <div class="label">Network Hashrate</div>
                        <div class="value">${this.networkData.networkHashrate.toFixed(1)} EH/s</div>
                        <div class="subtitle">Global Mining Power</div>
                    </div>
                    <div class="network-card">
                        <div class="label">Difficulty</div>
                        <div class="value">${this.formatLargeNumber(this.networkData.difficulty)}</div>
                        <div class="subtitle">Current Difficulty</div>
                    </div>
                    <div class="network-card">
                        <div class="label">Mempool</div>
                        <div class="value">${this.networkData.mempoolSize.toLocaleString()}</div>
                        <div class="subtitle">Pending Transactions</div>
                    </div>
                    <div class="network-card">
                        <div class="label">Fee Rate</div>
                        <div class="value">${Math.round(this.networkData.recommendedFeeRate)} sat/vB</div>
                        <div class="subtitle">Recommended Fee</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Full Analytics Modal
    showFullAnalytics() {
        if (!document.getElementById('analyticsModal')) {
            this.createAnalyticsModal();
        }
        document.getElementById('analyticsModal').style.display = 'block';
    }
    
    createAnalyticsModal() {
        const modal = document.createElement('div');
        modal.id = 'analyticsModal';
        modal.className = 'modal analytics-modal';
        
        modal.innerHTML = `
            <div class="modal-content analytics-content">
                <div class="modal-header">
                    <h2>📊 Advanced Mining Analytics</h2>
                    <span class="close" onclick="app.analyticsManager.closeAnalytics()">&times;</span>
                </div>
                <div class="analytics-tabs">
                    <div class="tab active" data-tab="shares">🎯 Shares</div>
                    <div class="tab" data-tab="network">🌍 Network</div>
                    <div class="tab" data-tab="health">❤️ Health</div>
                    <div class="tab" data-tab="economics">💰 Economics</div>
                </div>
                <div class="analytics-tab-content">
                    ${this.renderSharesTab()}
                    ${this.renderNetworkTab()}
                    ${this.renderHealthTab()}
                    ${this.renderEconomicsTab()}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupAnalyticsEventListeners();
    }
    
    renderSharesTab() {
        if (this.shareAnalytics.length === 0) {
            return `
                <div class="tab-content active" id="shares-tab">
                    <div class="no-data">No share analytics data available yet</div>
                </div>
            `;
        }
        
        const latest = this.shareAnalytics[this.shareAnalytics.length - 1];
        const category = this.getLuckCategory(latest.shareLuck);
        
        return `
            <div class="tab-content active" id="shares-tab">
                <div class="analytics-cards-grid">
                    <div class="analytics-detail-card">
                        <h3>Share Luck</h3>
                        <div class="big-value" style="color: ${category.color}">
                            ${category.emoji} ${latest.shareLuck.toFixed(2)}
                        </div>
                        <div class="category">${category.name}</div>
                    </div>
                    <div class="analytics-detail-card">
                        <h3>Share Efficiency</h3>
                        <div class="big-value">${latest.shareEfficiency.toFixed(1)}</div>
                        <div class="category">shares/TH/s</div>
                    </div>
                    <div class="analytics-detail-card">
                        <h3>Avg Difficulty</h3>
                        <div class="big-value">${this.formatLargeNumber(latest.averageShareDifficulty)}</div>
                        <div class="category">Current Average</div>
                    </div>
                </div>
                <div class="chart-section">
                    <h3>Share Luck Trend (Last 4 Hours)</h3>
                    <canvas id="shareLuckChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }
    
    renderNetworkTab() {
        const content = this.networkData ? `
            <div class="analytics-cards-grid">
                <div class="analytics-detail-card">
                    <h3>Network Hashrate</h3>
                    <div class="big-value">${this.networkData.networkHashrate.toFixed(1)} EH/s</div>
                    <div class="category">Global Mining Power</div>
                </div>
                <div class="analytics-detail-card">
                    <h3>Difficulty</h3>
                    <div class="big-value">${this.formatLargeNumber(this.networkData.difficulty)}</div>
                    <div class="category">Mining Difficulty</div>
                </div>
                <div class="analytics-detail-card">
                    <h3>Mempool Size</h3>
                    <div class="big-value">${this.networkData.mempoolSize.toLocaleString()}</div>
                    <div class="category">Pending Transactions</div>
                </div>
                <div class="analytics-detail-card">
                    <h3>Recommended Fee</h3>
                    <div class="big-value">${Math.round(this.networkData.recommendedFeeRate)} sat/vB</div>
                    <div class="category">Current Rate</div>
                </div>
            </div>
        ` : '<div class="no-data">Loading network data...</div>';
        
        return `
            <div class="tab-content" id="network-tab">
                ${content}
            </div>
        `;
    }
    
    renderHealthTab() {
        if (this.workerHealthMetrics.length === 0) {
            return `
                <div class="tab-content" id="health-tab">
                    <div class="no-data">No worker health data available yet</div>
                </div>
            `;
        }
        
        return `
            <div class="tab-content" id="health-tab">
                <div class="health-summary">
                    <h3>Worker Health Overview</h3>
                </div>
                <div class="worker-health-list">
                    ${this.workerHealthMetrics.map(worker => this.renderWorkerHealthCard(worker)).join('')}
                </div>
            </div>
        `;
    }
    
    renderWorkerHealthCard(worker) {
        const category = this.getHealthCategory(worker.healthScore);
        const trendEmoji = this.getTrendEmoji(worker.performanceTrend);
        
        return `
            <div class="worker-health-card">
                <div class="worker-header">
                    <h4>${this.cleanWorkerName(worker.workerName)}</h4>
                    <span class="health-badge" style="background-color: ${category.color}">
                        ${category.name}
                    </span>
                </div>
                <div class="health-metrics">
                    <div class="metric">
                        <span class="label">Health Score</span>
                        <span class="value">${Math.round(worker.healthScore)}/100</span>
                    </div>
                    <div class="metric">
                        <span class="label">Stability</span>
                        <span class="value">${Math.round(worker.hashRateStability)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">Uptime</span>
                        <span class="value">${Math.round(worker.uptimePercentage)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">Trend</span>
                        <span class="value">${trendEmoji} ${worker.performanceTrend}</span>
                    </div>
                </div>
                ${worker.predictedMaintenanceDate ? `
                    <div class="maintenance-warning">
                        🔧 Maintenance suggested by ${new Date(worker.predictedMaintenanceDate).toLocaleDateString()}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderEconomicsTab() {
        if (this.economicInsights.length === 0) {
            return `
                <div class="tab-content" id="economics-tab">
                    <div class="no-data">No economic insights available yet</div>
                </div>
            `;
        }
        
        const latest = this.economicInsights[this.economicInsights.length - 1];
        const status = this.getProfitabilityStatus(latest.realTimeProfitability);
        
        return `
            <div class="tab-content" id="economics-tab">
                <div class="analytics-cards-grid">
                    <div class="analytics-detail-card">
                        <h3>Profitability</h3>
                        <div class="big-value" style="color: ${status.color}">
                            ${status.emoji} ${latest.realTimeProfitability.toFixed(2)}/hr
                        </div>
                        <div class="category">${status.name}</div>
                    </div>
                    <div class="analytics-detail-card">
                        <h3>Cost per TH/s</h3>
                        <div class="big-value">${latest.costPerTerraHash.toFixed(3)}</div>
                        <div class="category">Per Hour</div>
                    </div>
                    <div class="analytics-detail-card">
                        <h3>Break-even Price</h3>
                        <div class="big-value">${latest.breakEvenElectricityPrice.toFixed(1)}¢</div>
                        <div class="category">Per kWh</div>
                    </div>
                    <div class="analytics-detail-card">
                        <h3>Daily Forecast</h3>
                        <div class="big-value" style="color: ${latest.dailyProfitForecast >= 0 ? '#10b981' : '#ef4444'}">
                            ${latest.dailyProfitForecast.toFixed(2)}
                        </div>
                        <div class="category">Profit/Loss</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getTrendEmoji(trend) {
        switch (trend) {
            case 'improving': return '📈';
            case 'stable': return '➡️';
            case 'declining': return '📉';
            case 'critical': return '🚨';
            default: return '➡️';
        }
    }
    
    setupAnalyticsEventListeners() {
        // Tab switching
        document.querySelectorAll('#analyticsModal .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#analyticsModal .tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('#analyticsModal .tab-content').forEach(t => t.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
                
                // Initialize charts for the active tab
                if (tab.dataset.tab === 'shares') {
                    setTimeout(() => this.initShareLuckChart(), 100);
                }
            });
        });
        
        // Initialize share luck chart if shares tab is active
        setTimeout(() => this.initShareLuckChart(), 100);
    }
    
    initShareLuckChart() {
        const canvas = document.getElementById('shareLuckChart');
        if (!canvas || this.shareAnalytics.length < 2) return;
        
        const ctx = canvas.getContext('2d');
        if (this.shareLuckChart) {
            this.shareLuckChart.destroy();
        }
        
        const chartData = this.shareAnalytics.slice(-48); // Last 4 hours
        
        this.shareLuckChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(point => new Date(point.timestamp).toLocaleTimeString()),
                datasets: [{
                    label: 'Share Luck',
                    data: chartData.map(point => point.shareLuck),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Average (1.0)',
                    data: chartData.map(() => 1.0),
                    borderColor: '#6b7280',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
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
    
    closeAnalytics() {
        const modal = document.getElementById('analyticsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}