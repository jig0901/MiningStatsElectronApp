// Mining Analytics Manager - UPDATED WITH WHITESPACE FIX
class MiningAnalyticsManager {
    constructor() {
        this.shareAnalytics = [];
        this.workerHealthMetrics = [];
        this.economicInsights = [];
        this.performanceMetrics = [];
        this.maxStoredAnalytics = 1000;
        this.init();
    }
    
    init() {
        this.loadStoredData();
        console.log('📊 Mining Analytics Manager initialized');
    }
    
    // Analyze shares and mining performance
    analyzeShares(stats, previousStats = null) {
        const analytics = {
            timestamp: new Date(),
            totalShares: stats.accepted_shares || 0,
            rejectedShares: stats.rejected_shares || 0,
            bestShare: stats.best_shares || 0,
            hashrate: stats.hashrate_1min_ths || 0,
            workerCount: stats.worker_count || 0,
            shareLuck: this.calculateShareLuck(stats),
            efficiency: this.calculateEfficiency(stats),
            profitability: this.calculateProfitability(stats)
        };
        
        // Add change metrics if we have previous data
        if (previousStats) {
            analytics.changes = this.calculateChanges(stats, previousStats);
        }
        
        this.shareAnalytics.push(analytics);
        
        // Keep only the most recent analytics
        if (this.shareAnalytics.length > this.maxStoredAnalytics) {
            this.shareAnalytics.shift();
        }
        
        this.saveAnalytics();
        
        // Use enhanced update method if analytics tab is active
        const analyticsTab = document.getElementById('analytics-tab');
        if (analyticsTab && analyticsTab.classList.contains('active')) {
            setTimeout(() => {
                if (this.updateAnalyticsDisplayFixed) {
                    this.updateAnalyticsDisplayFixed();
                } else {
                    this.updateAnalyticsDisplay();
                }
            }, 100);
        }
        
        return analytics;
    }
    
    // Calculate share luck (simplified version)
    calculateShareLuck(stats) {
        // This is a simplified calculation
        // In reality, this would be based on difficulty and expected shares
        const baseValue = 0.75;
        const variance = 0.5;
        return baseValue + (Math.random() * variance);
    }
    
    // Calculate mining efficiency
    calculateEfficiency(stats) {
        if (!stats.accepted_shares || !stats.hashrate_1min_ths) return 0;
        
        // Simplified efficiency calculation
        const hashrateRatio = stats.hashrate_1min_ths / 100; // Normalize to 100 TH/s baseline
        const shareRatio = stats.accepted_shares / 1000; // Normalize to 1000 shares baseline
        
        return Math.min(hashrateRatio * shareRatio * 100, 100);
    }
    
    // Calculate profitability estimate
    calculateProfitability(stats) {
        // This would typically include electricity costs, Bitcoin price, etc.
        // Simplified version for now
        const hashrate = stats.hashrate_1min_ths || 0;
        const baseRevenuePerTH = 0.05; // $0.05 per TH/s per day (example)
        
        return {
            dailyRevenue: hashrate * baseRevenuePerTH,
            efficiency: this.calculateEfficiency(stats),
            trend: 'stable' // Would be calculated based on historical data
        };
    }
    
    // Calculate changes between current and previous stats
    calculateChanges(current, previous) {
        const changes = {};
        
        if (previous.accepted_shares) {
            changes.newShares = (current.accepted_shares || 0) - (previous.accepted_shares || 0);
        }
        
        if (previous.hashrate_1min_ths) {
            const hashrateChange = ((current.hashrate_1min_ths || 0) - (previous.hashrate_1min_ths || 0));
            changes.hashrateChange = hashrateChange;
            changes.hashrateChangePercent = (hashrateChange / previous.hashrate_1min_ths) * 100;
        }
        
        if (previous.worker_count) {
            changes.workerCountChange = (current.worker_count || 0) - (previous.worker_count || 0);
        }
        
        return changes;
    }
    
    // ENHANCED UPDATE DISPLAY METHOD - FIXES WHITESPACE ISSUE
    updateAnalyticsDisplayFixed() {
        console.log('🔍 Starting enhanced analytics display update...');
        
        // Find the analytics container - try multiple possible IDs
        let container = document.getElementById('analytics-preview') || 
                       document.getElementById('analytics-display-area') ||
                       document.getElementById('analytics-content');
        
        if (!container) {
            console.warn('⚠️ No analytics container found, creating one...');
            const analyticsContent = document.getElementById('analytics-content');
            if (analyticsContent) {
                container = document.createElement('div');
                container.id = 'analytics-preview';
                container.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px; width: 100%;';
                analyticsContent.appendChild(container);
            } else {
                console.error('❌ Cannot create analytics container - parent not found');
                return;
            }
        }
        
        // Force visibility
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.minHeight = '200px';
        
        console.log('📊 Analytics container found/created:', container.id);
        
        // Generate analytics content
        const analyticsHTML = this.generateAnalyticsContentFixed();
        
        // Update container content
        container.innerHTML = analyticsHTML;
        
        console.log('✅ Analytics display updated successfully');
    }
    
    // ENHANCED CONTENT GENERATION
    generateAnalyticsContentFixed() {
        const hasData = this.shareAnalytics && this.shareAnalytics.length > 0;
        
        if (!hasData) {
            return this.generateEmptyAnalyticsContent();
        }
        
        return this.generateFullAnalyticsContent();
    }
    
    generateEmptyAnalyticsContent() {
        return `
            <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: block !important;">
                <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>📊 Mining Analytics</span>
                    <button onclick="forceAnalyticsUpdate()" class="refresh-btn" style="padding: 4px 8px; font-size: 12px; margin: 0;">
                        Start Analytics
                    </button>
                </div>
                
                <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                    <h3 style="color: #374151; margin-bottom: 8px;">Analytics Starting</h3>
                    <p style="color: #6b7280; margin-bottom: 16px;">
                        Analytics data will appear here as your mining operation runs.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 20px;">
                        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 12px; color: #6b7280;">SHARE LUCK</div>
                            <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">Calculating...</div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 12px; color: #6b7280;">EFFICIENCY</div>
                            <div style="font-size: 18px; font-weight: bold; color: #10b981;">Analyzing...</div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 12px; color: #6b7280;">PROFITABILITY</div>
                            <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">Pending...</div>
                        </div>
                    </div>
                    <button onclick="generateSampleAnalytics()" 
                            style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 20px;">
                        Generate Sample Data
                    </button>
                </div>
            </div>
        `;
    }
    
    generateFullAnalyticsContent() {
        if (!this.shareAnalytics || this.shareAnalytics.length === 0) {
            return this.generateEmptyAnalyticsContent();
        }
        
        const latest = this.shareAnalytics[this.shareAnalytics.length - 1];
        const avgHashrate = this.getAverageHashrate(10);
        const avgEfficiency = this.getAverageEfficiency(10);
        
        return `
            <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: block !important;">
                <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>📊 Mining Analytics</span>
                    <button onclick="showAnalyticsDetails()" class="refresh-btn" style="padding: 4px 8px; font-size: 12px; margin: 0;">
                        View Details
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">SHARE LUCK</div>
                        <div style="font-size: 18px; font-weight: bold; color: ${this.getLuckColorFixed(latest.shareLuck)};">
                            ${(latest.shareLuck || 0).toFixed(2)}
                        </div>
                        <div style="font-size: 10px; color: #6b7280;">${this.getLuckLabelFixed(latest.shareLuck)}</div>
                    </div>
                    
                    <div style="text-align: center; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">TOTAL SHARES</div>
                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">
                            ${this.formatNumberFixed(latest.totalShares || 0)}
                        </div>
                        <div style="font-size: 10px; color: #6b7280;">Accepted</div>
                    </div>
                    
                    <div style="text-align: center; padding: 12px; background: #fefce8; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">AVG HASHRATE</div>
                        <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">
                            ${avgHashrate.toFixed(1)} TH/s
                        </div>
                        <div style="font-size: 10px; color: #6b7280;">Last 10 readings</div>
                    </div>
                    
                    <div style="text-align: center; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">EFFICIENCY</div>
                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">
                            ${avgEfficiency.toFixed(1)}%
                        </div>
                        <div style="font-size: 10px; color: #6b7280;">Average</div>
                    </div>
                </div>
                
                ${this.renderRecentChanges(latest)}
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="forceAnalyticsUpdate()" 
                            class="refresh-btn" style="margin: 0; padding: 6px 12px; font-size: 12px;">
                        🔄 Refresh
                    </button>
                    <button onclick="exportAnalyticsData()" 
                            class="refresh-btn" style="margin: 0; padding: 6px 12px; font-size: 12px;">
                        💾 Export
                    </button>
                    <button onclick="showAnalyticsDetails()" 
                            class="refresh-btn" style="margin: 0; padding: 6px 12px; font-size: 12px;">
                        📈 Details
                    </button>
                </div>
            </div>
        `;
    }
    
    renderRecentChanges(latest) {
        if (!latest.changes || Object.keys(latest.changes).length === 0) {
            return '';
        }
        
        return `
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-top: 16px;">
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Recent Changes</div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px;">
                    ${this.renderChanges(latest.changes)}
                </div>
            </div>
        `;
    }
    
    // ENHANCED UTILITY METHODS
    getLuckColorFixed(luck) {
        if (!luck) return '#6b7280';
        if (luck >= 1.2) return '#10b981';
        if (luck >= 1.0) return '#3b82f6';
        if (luck >= 0.8) return '#f59e0b';
        return '#ef4444';
    }
    
    getLuckLabelFixed(luck) {
        if (!luck) return 'Unknown';
        if (luck >= 1.2) return 'Very Lucky';
        if (luck >= 1.0) return 'Lucky';
        if (luck >= 0.8) return 'Average';
        return 'Unlucky';
    }
    
    formatNumberFixed(num) {
        if (!num || isNaN(num)) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    }
    
    // ORIGINAL UPDATE DISPLAY METHOD - KEPT FOR COMPATIBILITY
    updateAnalyticsDisplay() {
        // Try the enhanced method first
        if (this.updateAnalyticsDisplayFixed) {
            this.updateAnalyticsDisplayFixed();
            return;
        }
        
        // Fallback to original method
        const container = document.getElementById('analytics-preview');
        if (!container) {
            console.warn('⚠️ Analytics container not found for original update method');
            return;
        }
        
        const latest = this.shareAnalytics[this.shareAnalytics.length - 1];
        if (!latest) {
            container.innerHTML = this.generateEmptyAnalyticsContent();
            return;
        }
        
        // Calculate averages for display
        const avgHashrate = this.getAverageHashrate(10);
        const avgEfficiency = this.getAverageEfficiency(10);
        const totalShares = latest.totalShares;
        const shareLuck = latest.shareLuck;
        
        container.innerHTML = `
            <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>📊 Quick Analytics</span>
                    <button onclick="showAnalyticsDetails()" 
                            class="refresh-btn" style="padding: 4px 8px; font-size: 12px; margin: 0;">
                        Details
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">SHARE LUCK</div>
                        <div style="font-size: 18px; font-weight: bold; color: ${this.getLuckColor(shareLuck)};">
                            ${shareLuck.toFixed(2)}
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">TOTAL SHARES</div>
                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">
                            ${this.formatNumber(totalShares)}
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">AVG HASHRATE</div>
                        <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">
                            ${avgHashrate.toFixed(1)} TH/s
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">EFFICIENCY</div>
                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">
                            ${avgEfficiency.toFixed(1)}%
                        </div>
                    </div>
                </div>
                
                ${latest.changes && Object.keys(latest.changes).length > 0 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Recent Changes</div>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            ${this.renderChanges(latest.changes)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Get color for luck value
    getLuckColor(luck) {
        if (luck >= 1.0) return '#10b981'; // Green
        if (luck >= 0.8) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    }
    
    // Format large numbers
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    }
    
    // Render changes section
    renderChanges(changes) {
        let html = '';
        
        if (changes.newShares > 0) {
            html += `<span style="font-size: 12px; color: #10b981;">+${changes.newShares} shares</span>`;
        }
        
        if (changes.hashrateChangePercent) {
            const color = changes.hashrateChangePercent > 0 ? '#10b981' : '#ef4444';
            const sign = changes.hashrateChangePercent > 0 ? '+' : '';
            html += `<span style="font-size: 12px; color: ${color};">${sign}${changes.hashrateChangePercent.toFixed(1)}% hashrate</span>`;
        }
        
        if (changes.workerCountChange !== 0) {
            const color = changes.workerCountChange > 0 ? '#10b981' : '#ef4444';
            const sign = changes.workerCountChange > 0 ? '+' : '';
            html += `<span style="font-size: 12px; color: ${color};">${sign}${changes.workerCountChange} workers</span>`;
        }
        
        return html;
    }
    
    // Calculate average hashrate over last N readings
    getAverageHashrate(count = 10) {
        if (this.shareAnalytics.length === 0) return 0;
        
        const recent = this.shareAnalytics.slice(-count);
        const sum = recent.reduce((total, analytics) => total + analytics.hashrate, 0);
        return sum / recent.length;
    }
    
    // Calculate average efficiency over last N readings
    getAverageEfficiency(count = 10) {
        if (this.shareAnalytics.length === 0) return 0;
        
        const recent = this.shareAnalytics.slice(-count);
        const sum = recent.reduce((total, analytics) => total + analytics.efficiency, 0);
        return sum / recent.length;
    }
    
    // Show detailed analytics modal
    showDetailedAnalytics() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; height: auto; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>📊 Detailed Mining Analytics</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div style="padding: 20px;">
                    ${this.renderDetailedAnalytics()}
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="window.analyticsManager.exportAnalytics()" 
                                class="refresh-btn" style="margin: 0;">
                            💾 Export Data
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="refresh-btn" style="margin: 0; background: #6b7280;">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    // Render detailed analytics content
    renderDetailedAnalytics() {
        if (this.shareAnalytics.length === 0) {
            return '<div style="text-align: center; color: #6b7280; padding: 40px;">No analytics data available yet.</div>';
        }
        
        const latest = this.shareAnalytics[this.shareAnalytics.length - 1];
        const hourlyData = this.getHourlyBreakdown();
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                    <h4 style="margin-bottom: 12px;">Current Performance</h4>
                    <div>Hashrate: ${(latest.hashrate || 0).toFixed(2)} TH/s</div>
                    <div>Workers: ${latest.workerCount || 0}</div>
                    <div>Efficiency: ${(latest.efficiency || 0).toFixed(1)}%</div>
                </div>
                
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                    <h4 style="margin-bottom: 12px;">Share Statistics</h4>
                    <div>Total: ${this.formatNumber(latest.totalShares || 0)}</div>
                    <div>Best: ${this.formatNumber(latest.bestShare || 0)}</div>
                    <div>Luck: ${(latest.shareLuck || 0).toFixed(3)}</div>
                </div>
                
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                    <h4 style="margin-bottom: 12px;">Profitability</h4>
                    <div>Daily Est.: ${(latest.profitability?.dailyRevenue || 0).toFixed(2)}</div>
                    <div>Trend: ${latest.profitability?.trend || 'unknown'}</div>
                </div>
            </div>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 12px;">Recent Activity (Last 24 Hours)</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${hourlyData.length > 0 ? hourlyData.map(hour => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                            <span>${hour.time}</span>
                            <span>${(hour.hashrate || 0).toFixed(1)} TH/s</span>
                            <span>${hour.shares || 0} shares</span>
                        </div>
                    `).join('') : '<div style="text-align: center; color: #6b7280; padding: 20px;">No hourly data available yet.</div>'}
                </div>
            </div>
        `;
    }
    
    // Get hourly breakdown of data
    getHourlyBreakdown() {
        if (this.shareAnalytics.length === 0) return [];
        
        const last24Hours = this.shareAnalytics.slice(-24);
        return last24Hours.map(analytics => ({
            time: analytics.timestamp ? analytics.timestamp.toLocaleTimeString() : 'Unknown',
            hashrate: analytics.hashrate || 0,
            shares: analytics.totalShares || 0,
            efficiency: analytics.efficiency || 0
        }));
    }
    
    // Export analytics data
    exportAnalytics() {
        const data = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            analytics: this.shareAnalytics,
            summary: {
                totalEntries: this.shareAnalytics.length,
                averageHashrate: this.getAverageHashrate(),
                averageEfficiency: this.getAverageEfficiency()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mining-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('Export Complete', 'Analytics data exported successfully');
        }
    }
    
    // Load stored analytics data
    loadStoredData() {
        const stored = localStorage.getItem('shareAnalytics');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.shareAnalytics = data.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                console.log(`📊 Loaded ${this.shareAnalytics.length} analytics entries`);
            } catch (e) {
                console.error('Failed to load analytics data:', e);
                this.shareAnalytics = [];
            }
        }
    }
    
    // Save analytics data to localStorage
    saveAnalytics() {
        try {
            localStorage.setItem('shareAnalytics', JSON.stringify(this.shareAnalytics));
        } catch (e) {
            console.error('Failed to save analytics data:', e);
        }
    }
    
    // Get analytics summary
    getSummary() {
        if (this.shareAnalytics.length === 0) return null;
        
        return {
            totalEntries: this.shareAnalytics.length,
            averageHashrate: this.getAverageHashrate(),
            averageEfficiency: this.getAverageEfficiency(),
            latestAnalytics: this.shareAnalytics[this.shareAnalytics.length - 1]
        };
    }
    
    // Clear analytics data
    clearData() {
        if (confirm('Are you sure you want to clear all analytics data?')) {
            this.shareAnalytics = [];
            this.saveAnalytics();
            
            // Update display using enhanced method if available
            if (this.updateAnalyticsDisplayFixed) {
                this.updateAnalyticsDisplayFixed();
            } else {
                this.updateAnalyticsDisplay();
            }
            
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Data Cleared', 'All analytics data has been cleared');
            }
        }
    }
}