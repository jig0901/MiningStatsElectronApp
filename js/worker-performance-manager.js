// Worker Performance Manager — UPDATED (adds top-of-app bubbles + latestAnalysis)
class WorkerPerformanceManager {
    constructor() {
        this.expectedHashrates = new Map();
        this.performanceHistory = [];
        this.latestAnalysis = null; // <— NEW: cache the most recent analysis for inline bubbles
        this.currentFilter  = null;   // "optimal" | "underperforming" | "overperforming" | null
        this.alertThresholds = {
            lowPerformance: 0.8,  // 80% of expected
            highTemperature: 85,  // Celsius
            highRejectRate: 0.05  // 5%
        };
        this.init();
        console.log('🔧 Worker Performance Manager initialized');
    }
    
    init() {
        this.loadData();
        this.initializePerformanceTracking();

        // Expose button helpers (your markup already calls these names)
        window.showExpectedHashrateDialog = () => this.showSetExpectedDialog();
        window.autoDetectAllHashrates = () => this.autoDetectAll();
        window.exportPerformanceData = () => this.exportPerformanceData();
    }
    
    setExpectedHashrate(workerName, hashrate) {
        this.expectedHashrates.set(workerName, {
            hashrate: hashrate,
            setAt: new Date(),
            autoDetected: false
        });
        this.saveExpectedHashrates();
        console.log(`📊 Set expected hashrate for ${workerName}: ${hashrate} TH/s`);
    }
    
    autoDetectExpectedHashrate(workerName, hashrateHistory) {
        if (hashrateHistory.length < 10) return null;
        const sorted = hashrateHistory.map(h => h.value).sort((a, b) => b - a);
        const top25Percent = sorted.slice(0, Math.ceil(sorted.length * 0.25));
        const expectedHashrate = top25Percent.reduce((a, b) => a + b) / top25Percent.length;
        this.expectedHashrates.set(workerName, {
            hashrate: expectedHashrate,
            setAt: new Date(),
            autoDetected: true
        });
        this.saveExpectedHashrates();
        return expectedHashrate;
    }
    
    analyzeWorkerPerformance(workers) {
        console.log(`🔧 Analyzing performance for ${workers.length} workers`);
        
        const analysis = {
            timestamp: new Date(),
            workers: [],
            summary: { totalWorkers: workers.length, underperforming: 0, optimal: 0, overperforming: 0 }
        };
        
        workers.forEach(worker => {
            const cleanName = this.cleanWorkerName(worker.workername);
            const currentHashrate = this.parseHashrate(worker.hashrate1m);
            const expected = this.expectedHashrates.get(cleanName);

            let performance = 'unknown';
            let efficiency = null;
            let status = 'normal';

            if (expected && currentHashrate > 0) {
                efficiency = currentHashrate / expected.hashrate;
                if (efficiency < this.alertThresholds.lowPerformance) {
                    performance = 'underperforming';
                    status = 'warning';
                    analysis.summary.underperforming++;
                } else if (efficiency > 1.1) {
                    performance = 'overperforming';
                    status = 'good';
                    analysis.summary.overperforming++;
                } else {
                    performance = 'optimal';
                    status = 'good';
                    analysis.summary.optimal++;
                }
            }

            const shares = parseInt(worker.shares) || 0;
            const rejects = parseInt(worker.rejects) || 0;
            const rejectRate = shares > 0 ? rejects / (shares + rejects) : 0;
            if (rejectRate > this.alertThresholds.highRejectRate) status = 'warning';

            analysis.workers.push({
                name: cleanName,
                currentHashrate,
                expectedHashrate: expected ? expected.hashrate : null,
                efficiency,
                performance,
                status,
                metrics: {
                    shares,
                    rejects,
                    rejectRate,
                    bestShare: worker.bestever || worker.bestshare || 0,
                    uptime: this.calculateUptime(cleanName),
                    lastSeen: new Date()
                }
            });
        });

        this.performanceHistory.push(analysis);
        if (this.performanceHistory.length > 1000) this.performanceHistory.shift();

        // NEW: cache + repaint
        this.latestAnalysis = analysis;
        this.savePerformanceHistory();
        this.renderSummaryBubblesInline('worker-performance-bubbles-inline');
        this.updatePerformanceDisplay(analysis);

        console.log('🔧 Performance analysis complete:', analysis.summary);
        return analysis;
    }

    
    calculateUptime(workerName) {
        const recentHistory = this.performanceHistory
            .slice(-24)
            .filter(h => h.workers.find(w => w.name === workerName));
        if (recentHistory.length === 0) return 100;
        const totalPossible = 24;
        const actualReadings = recentHistory.length;
        return (actualReadings / totalPossible) * 100;
    }

    // Compact summary for chips
    getPerformanceSummary() {
        const src = this.latestAnalysis || this.performanceHistory[this.performanceHistory.length - 1];
        if (!src) return { optimal: 0, underperforming: 0, overperforming: 0, avgEfficiencyPct: 0, hasBaseline: false };

        const workersWithEff = src.workers.filter(w => w.efficiency !== null);
        const avg = workersWithEff.length
            ? ((workersWithEff.reduce((s,w) => s + w.efficiency, 0) / workersWithEff.length) * 100).toFixed(1)
            : '0.0';

        return {
            optimal: src.summary.optimal,
            underperforming: src.summary.underperforming,
            overperforming: src.summary.overperforming,
            avgEfficiencyPct: parseFloat(avg),
            hasBaseline: src.workers.some(w => w.expectedHashrate)
        };
    }

    // Compact, clickable chips — unified click target
    renderSummaryBubblesInline(targetId = 'worker-performance-bubbles-inline') {
        const host = document.getElementById(targetId);
        if (!host) return;

        const summary = this.getPerformanceSummary();
        const isActive = (key) => this.currentFilter === key;

        const chip = (key, label, value, tone, title = '') => `
        <button title="${title}" onclick="window.navigateToPerformanceTabWithFilter && window.navigateToPerformanceTabWithFilter('${key}')"
                style="
                    display:inline-flex;align-items:center;gap:8px;cursor:pointer;
                    padding:6px 10px;border:${isActive(key)?'2px solid '+tone:'1px solid #e5e7eb'};
                    border-radius:9999px;background:${isActive(key)?'rgba(0,0,0,0.02)':'#fff'};
                    box-shadow:0 1px 1px rgba(0,0,0,.03);font-size:12px;line-height:1;">
            <span style="width:8px;height:8px;border-radius:50%;background:${tone};"></span>
            <span style="color:#6b7280;text-transform:uppercase;letter-spacing:.03em;font-weight:600;">${label}</span>
            <span style="font-weight:800;color:#111827;">${value}</span>
        </button>
        `;

        const updatedAt = this.latestAnalysis?.timestamp
        ? new Date(this.latestAnalysis.timestamp).toLocaleTimeString()
        : '';

        host.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-start;">
            ${chip('optimal','Optimal', summary.optimal, '#10b981', 'Within expected range')}
            ${chip('underperforming','Under', summary.underperforming, '#f59e0b', 'Below expected range')}
            ${chip('overperforming','Over', summary.overperforming, '#3b82f6', 'Above expected range')}
            ${chip('all','Avg', summary.avgEfficiencyPct + '%', '#111827', 'Average efficiency (show all)')}
            ${summary.hasBaseline ? '' : `
            <button onclick="window.showExpectedHashrateDialog && window.showExpectedHashrateDialog()"
                    style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;
                            border:1px dashed #d1d5db;border-radius:9999px;background:#f9fafb;font-size:12px;color:#374151;">
                <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;"></span>
                Set baselines
            </button>`}
            ${updatedAt ? `<span style="margin-left:auto;font-size:11px;color:#6b7280;">Updated ${updatedAt}</span>` : ''}
        </div>
        `;
    }


    // Programmatic filter + focus (used by global fallback)
    setFilterAndFocus(filterKey) {
        this.currentFilter = (filterKey && filterKey !== 'all') ? filterKey : null;

        // Repaint chips with active state
        this.renderSummaryBubblesInline('worker-performance-bubbles-inline');

        // Repaint performance panel using latest analysis (or compute if missing)
        const analysis = this.latestAnalysis ||
            (window.app?.stats?.workers ? this.analyzeWorkerPerformance(window.app.stats.workers) : null);
        if (analysis) this.updatePerformanceDisplay(analysis);

        // Scroll into view (if app nav not available)
        if (!window.navigateToPerformanceTabWithFilter) this.scrollToPerformanceView();
    }

    // Fallback smooth-scroll + open tab if possible
    scrollToPerformanceView() {
        const tabBtn = document.querySelector('.tab-header .tab-button[onclick*="performance-tab"]');
        if (tabBtn) tabBtn.click();
        const target = document.getElementById('performance-content') || document.getElementById('performance-tab');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updatePerformanceDisplay(analysis) {
        const possibleContainers = ['worker-performance','worker-performance-inline','worker-performance-tab-content','performance-content'];
        let container = null;
        for (const id of possibleContainers) {
            container = document.getElementById(id);
            if (container) break;
        }
        if (!container) {
            console.log('❌ Worker performance container not found, tried:', possibleContainers);
            return;
        }

        // NEW: apply filter (if any)
        let list = analysis.workers;
        if (this.currentFilter === 'optimal')          list = list.filter(w => w.performance === 'optimal');
        else if (this.currentFilter === 'underperforming') list = list.filter(w => w.performance === 'underperforming');
        else if (this.currentFilter === 'overperforming')  list = list.filter(w => w.performance === 'overperforming');

        const underperformingWorkers = analysis.workers.filter(w => w.status === 'warning');
        const topPerformers = analysis.workers
            .filter(w => w.efficiency && w.efficiency > 1.05)
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 3);

        const filterBadge = this.currentFilter ? `
        <div style="display:flex;align-items:center;gap:8px;margin:0 0 12px;">
            <span style="font-size:12px;color:#6b7280;">Filter:</span>
            <span style="font-size:12px;font-weight:700;border:1px solid #e5e7eb;border-radius:9999px;padding:4px 8px;text-transform:capitalize;">
            ${this.currentFilter}
            </span>
            <button onclick="window.navigateToPerformanceTabWithFilter && window.navigateToPerformanceTabWithFilter('all')"
                    class="refresh-btn" style="padding:4px 8px;font-size:12px;">Clear</button>
            <span style="margin-left:8px;font-size:12px;color:#6b7280;">Showing ${list.length} of ${analysis.workers.length}</span>
        </div>
        ` : '';

        container.innerHTML = `
        <div class="section" style="background:#fff;border-radius:12px;padding:20px;margin-bottom:20px;">
            <div class="section-title">🔧 Worker Performance</div>

            ${filterBadge}

            <div class="stats-grid" style="margin-bottom:20px;">
                <div class="stat-card green">
                    <div class="stat-label">Optimal Workers</div>
                    <div class="stat-value">${analysis.summary.optimal}</div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-label">Underperforming</div>
                    <div class="stat-value">${analysis.summary.underperforming}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Overperforming</div>
                    <div class="stat-value">${analysis.summary.overperforming}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Efficiency</div>
                    <div class="stat-value">${this.calculateAverageEfficiency(analysis)}%</div>
                </div>
            </div>

            ${underperformingWorkers.length > 0 ? `
                <div style="background:rgba(239,68,68,.1);border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin-bottom:20px;">
                    <h4 style="color:#dc2626;margin-bottom:12px;">⚠️ Performance Alerts</h4>
                    ${underperformingWorkers.map(w => `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:600;">${w.name}</span>
                            <span style="color:#dc2626;">${w.efficiency ? (w.efficiency * 100).toFixed(1) + '%' : 'No baseline'}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${topPerformers.length > 0 ? `
                <div style="background:rgba(16,185,129,.1);border-left:4px solid #10b981;padding:16px;border-radius:8px;margin-bottom:20px;">
                    <h4 style="color:#059669;margin-bottom:12px;">🏆 Top Performers</h4>
                    ${topPerformers.map(w => `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:600;">${w.name}</span>
                            <span style="color:#059669;">${(w.efficiency * 100).toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="max-height:400px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
                    ${list.map(w => this.renderWorkerCard(w)).join('')}
                </div>
            </div>

            <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
                <button onclick="showExpectedHashrateDialog()" class="refresh-btn" style="margin-right:10px;">📊 Set Expected Hashrates</button>
                <button onclick="autoDetectAllHashrates()" class="refresh-btn" style="margin-right:10px;">🔍 Auto-Detect All</button>
                <button onclick="exportPerformanceData()" class="refresh-btn">💾 Export Data</button>
            </div>
        </div>
        `;
    }

    
    renderWorkerCard(worker) {
        const statusColor = {
            'good': '#10b981',
            'warning': '#f59e0b',
            'error': '#ef4444',
            'normal': '#6b7280'
        }[worker.status] || '#6b7280';
        const efficiencyDisplay = worker.efficiency ? `${(worker.efficiency * 100).toFixed(1)}%` : 'No baseline';
        return `
            <div class="performance-card ${worker.status === 'warning' ? 'warning' : ''}" 
                 style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; border-left: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin:0;font-size:14px;font-weight:600;">
                    <span onclick="handleWorkerClick('${worker.name}', event)" 
                            style="cursor:pointer;text-decoration:underline;text-underline-offset:2px;">
                        ${worker.name}
                    </span>
                    </h4>
                    ${/bitaxe/i.test(worker.name) ? `
                    <button class="refresh-btn" style="margin:0 0 0 8px;padding:4px 8px;font-size:12px;"
                            onclick="handleWorkerClick('${worker.name}', event)">🔎 Bitaxe</button>
                    ` : ''}
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #6b7280;">Current</span>
                    <span style="font-weight: 600;">${worker.currentHashrate.toFixed(2)} TH/s</span>
                </div>
                ${worker.expectedHashrate ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; color: #6b7280;">Expected</span>
                        <span style="font-weight: 600;">${worker.expectedHashrate.toFixed(2)} TH/s</span>
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #6b7280;">Efficiency</span>
                    <span style="font-weight: 600; color: ${statusColor};">${efficiencyDisplay}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #6b7280;">Reject Rate</span>
                    <span style="font-weight: 600;">${(worker.metrics.rejectRate * 100).toFixed(2)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 12px; color: #6b7280;">Uptime</span>
                    <span style="font-weight: 600;">${worker.metrics.uptime.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }
    
    calculateAverageEfficiency(analysis) {
        const workersWithEfficiency = analysis.workers.filter(w => w.efficiency !== null);
        if (workersWithEfficiency.length === 0) return 0;
        const totalEfficiency = workersWithEfficiency.reduce((sum, w) => sum + w.efficiency, 0);
        return ((totalEfficiency / workersWithEfficiency.length) * 100).toFixed(1);
    }
    
    showSetExpectedDialog() {
        if (!window.app || !window.app.stats || !window.app.stats.workers) {
            alert('No worker data available');
            return;
        }
        const workers = window.app.stats.workers;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; height: auto; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>📊 Set Expected Hashrates</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div style="padding: 20px;">
                    <p style="margin-bottom: 20px; color: #6b7280;">Set expected hashrates for your workers to enable performance monitoring.</p>
                    <div id="hashrate-inputs">
                        ${workers.map(worker => {
                            const cleanName = this.cleanWorkerName(worker.workername);
                            const currentHashrate = this.parseHashrate(worker.hashrate1m);
                            const expected = this.expectedHashrates.get(cleanName);
                            return `
                                <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
                                    <label style="flex: 1; font-weight: 600;">${cleanName}</label>
                                    <span style="margin: 0 12px; color: #6b7280; font-size: 12px;">Current: ${currentHashrate.toFixed(2)} TH/s</span>
                                    <input type="number" step="0.01" placeholder="Expected TH/s"
                                           value="${expected ? expected.hashrate.toFixed(2) : ''}"
                                           data-worker="${cleanName}"
                                           style="width: 120px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px;">
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="refresh-btn" style="background: #6b7280; margin: 0;">Cancel</button>
                        <button onclick="workerPerformanceManager.saveExpectedHashratesFromDialog()" class="refresh-btn" style="margin: 0;">Save</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    saveExpectedHashratesFromDialog() {
        const inputs = document.querySelectorAll('#hashrate-inputs input[data-worker]');
        let saved = 0;
        inputs.forEach(input => {
            const workerName = input.dataset.worker;
            const value = parseFloat(input.value);
            if (!isNaN(value) && value > 0) {
                this.setExpectedHashrate(workerName, value);
                saved++;
            }
        });
        document.querySelectorAll('.modal').forEach(m => m.remove());
        if (window.app) window.app.showNotification('Settings Saved', `Expected hashrates set for ${saved} workers`);
        // Refresh bubbles immediately after baseline set
        this.renderSummaryBubblesInline('worker-performance-bubbles-inline');
    }
    
    autoDetectAll() {
        if (!window.app || !window.app.stats || !window.app.stats.workers) {
            alert('No worker data available');
            return;
        }
        let detected = 0;
        window.app.stats.workers.forEach(worker => {
            const cleanName = this.cleanWorkerName(worker.workername);
            const currentHashrate = this.parseHashrate(worker.hashrate1m);
            if (currentHashrate > 0) {
                this.setExpectedHashrate(cleanName, currentHashrate);
                detected++;
            }
        });
        if (window.app) window.app.showNotification('Auto-Detection Complete', `Set expected hashrates for ${detected} workers based on current performance`);
        this.renderSummaryBubblesInline('worker-performance-bubbles-inline');
    }
    
    exportPerformanceData() {
        const data = {
            timestamp: new Date().toISOString(),
            expectedHashrates: Object.fromEntries(this.expectedHashrates),
            performanceHistory: this.performanceHistory.slice(-100),
            alertThresholds: this.alertThresholds
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worker-performance-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.app) window.app.showNotification('Export Complete', 'Performance data exported successfully');
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
            default: return value;
        }
    }
    
    initializePerformanceTracking() {
        setInterval(() => {
            if (window.app && window.app.stats && window.app.stats.workers) {
                this.analyzeWorkerPerformance(window.app.stats.workers);
            }
        }, 60000);
    }
    
    loadData() {
        const storedExpected = localStorage.getItem('expectedHashrates');
        if (storedExpected) {
            try {
                const data = JSON.parse(storedExpected);
                this.expectedHashrates = new Map(Object.entries(data));
                console.log(`🔧 Loaded ${this.expectedHashrates.size} expected hashrate entries`);
            } catch (e) {
                console.error('Failed to load expected hashrates:', e);
            }
        }
        const storedHistory = localStorage.getItem('performanceHistory');
        if (storedHistory) {
            try {
                this.performanceHistory = JSON.parse(storedHistory);
                if (this.performanceHistory.length > 1000) {
                    this.performanceHistory = this.performanceHistory.slice(-1000);
                }
                this.latestAnalysis = this.performanceHistory[this.performanceHistory.length - 1] || null; // restore last
                console.log(`🔧 Loaded ${this.performanceHistory.length} performance history entries`);
            } catch (e) {
                console.error('Failed to load performance history:', e);
            }
        }
    }
    
    saveExpectedHashrates() {
        const data = Object.fromEntries(this.expectedHashrates);
        localStorage.setItem('expectedHashrates', JSON.stringify(data));
    }
    
    savePerformanceHistory() {
        try {
            localStorage.setItem('performanceHistory', JSON.stringify(this.performanceHistory));
        } catch (e) {
            console.error('Failed to save performance history:', e);
        }
    }
}


// Global functions for UI handlers
function showExpectedHashrateDialog() {
    if (window.workerPerformanceManager) {
        window.workerPerformanceManager.showSetExpectedDialog();
    }
}

function saveExpectedHashratesFromDialog() {
    if (window.workerPerformanceManager) {
        window.workerPerformanceManager.saveExpectedHashratesFromDialog();
    }
}

function autoDetectAllHashrates() {
    if (window.workerPerformanceManager) {
        window.workerPerformanceManager.autoDetectAll();
    }
}

function exportPerformanceData() {
    if (window.workerPerformanceManager) {
        window.workerPerformanceManager.exportPerformanceData();
    }
}

function filterWorkers(filterKey) {
    if (window.workerPerformanceManager) {
        window.workerPerformanceManager.setFilterAndFocus(filterKey);
    }
}
function clearWorkerFilter() {
    if (window.workerPerformanceManager) {
        window.workerPerformanceManager.setFilterAndFocus(null);
    }
}

// Back-compat helpers (if anything else calls them)
window.filterWorkers = (key) => {
  if (window.workerPerformanceManager) {
    window.workerPerformanceManager.setFilterAndFocus(key && key !== 'all' ? key : null);
  }
};
window.clearWorkerFilter = () => {
  if (window.workerPerformanceManager) {
    window.workerPerformanceManager.setFilterAndFocus(null);
  }
};
