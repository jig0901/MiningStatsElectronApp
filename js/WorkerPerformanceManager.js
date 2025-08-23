// Worker Performance Manager for Electron App
// Converted from WorkerPerformanceModule.swift

class WorkerPerformanceManager {
    constructor() {
        this.expectedHashrates = [];
        this.performanceHistory = [];
        this.maxHistoryPoints = 288; // 24 hours at 5-minute intervals
        
        this.loadData();
    }
    
    // Expected Hashrate Management
    setExpectedHashrate(workerName, hashrate) {
        // Remove existing entry for this worker
        this.expectedHashrates = this.expectedHashrates.filter(
            w => w.workerName !== workerName && this.cleanName(w.workerName) !== this.cleanName(workerName)
        );
        
        const newExpectedHashrate = {
            id: this.generateId(),
            workerName: workerName,
            expectedHashrate: hashrate
        };
        
        this.expectedHashrates.push(newExpectedHashrate);
        this.saveExpectedHashrates();
    }
    
    getExpectedHashrate(workerName) {
        // Try exact match first
        const exact = this.expectedHashrates.find(w => w.workerName === workerName);
        if (exact) return exact.expectedHashrate;
        
        // Try clean name match
        const cleanWorkerName = this.cleanName(workerName);
        const cleanMatch = this.expectedHashrates.find(w => this.cleanName(w.workerName) === cleanWorkerName);
        return cleanMatch ? cleanMatch.expectedHashrate : null;
    }
    
    removeExpectedHashrate(workerName) {
        this.expectedHashrates = this.expectedHashrates.filter(
            w => w.workerName !== workerName && this.cleanName(w.workerName) !== this.cleanName(workerName)
        );
        this.saveExpectedHashrates();
    }
    
    // Performance Tracking
    recordPerformance(workers) {
        const performances = [];
        
        workers.forEach(worker => {
            const expectedHashrate = this.getExpectedHashrate(worker.workername);
            if (expectedHashrate && expectedHashrate > 0) {
                const actualHashrate = this.extractWorkerHashrate(worker);
                const ratio = actualHashrate / expectedHashrate;
                
                const performance = {
                    id: this.generateId(),
                    workerName: worker.workername,
                    actualHashrate: actualHashrate,
                    expectedHashrate: expectedHashrate,
                    performanceRatio: ratio,
                    timestamp: new Date()
                };
                
                performances.push(performance);
            }
        });
        
        if (performances.length > 0) {
            const historyPoint = {
                id: this.generateId(),
                date: new Date(),
                workerPerformances: performances
            };
            
            this.performanceHistory.push(historyPoint);
            
            // Keep only recent points
            if (this.performanceHistory.length > this.maxHistoryPoints) {
                this.performanceHistory = this.performanceHistory.slice(-this.maxHistoryPoints);
            }
            
            this.savePerformanceHistory();
        }
    }
    
    // Data Analysis
    getWorkerSummaries(timeframe = '24h') {
        const cutoffDate = new Date(Date.now() - this.getTimeframeHours(timeframe) * 3600000);
        const filteredData = this.performanceHistory.filter(point => new Date(point.date) >= cutoffDate);
        
        const summaries = [];
        
        this.expectedHashrates.forEach(expectedHashrate => {
            const workerName = expectedHashrate.workerName;
            const performances = filteredData.flatMap(point =>
                point.workerPerformances.filter(p => p.workerName === workerName)
            );
            
            if (performances.length === 0) return;
            
            const avgPerformance = performances.reduce((sum, p) => sum + p.performanceRatio, 0) / performances.length;
            const uptimePercentage = (performances.filter(p => p.performanceRatio > 0.1).length / performances.length) * 100;
            const currentPerformance = this.getPerformanceCategory(performances[performances.length - 1]?.performanceRatio || 0);
            
            summaries.push({
                workerName: this.cleanName(workerName),
                averagePerformance: avgPerformance,
                uptimePercentage: uptimePercentage,
                currentStatus: currentPerformance
            });
        });
        
        return summaries.sort((a, b) => b.averagePerformance - a.averagePerformance);
    }
    
    getPerformanceData(workerName = null, timeframe = '24h') {
        const cutoffDate = new Date(Date.now() - this.getTimeframeHours(timeframe) * 3600000);
        const filteredData = this.performanceHistory.filter(point => new Date(point.date) >= cutoffDate);
        
        if (workerName) {
            return filteredData.map(point => ({
                ...point,
                workerPerformances: point.workerPerformances.filter(p => this.cleanName(p.workerName) === workerName)
            })).filter(point => point.workerPerformances.length > 0);
        }
        
        return filteredData;
    }
    
    getPerformanceCategory(performanceRatio) {
        if (performanceRatio >= 0.95) return { name: 'Excellent', color: '#10b981', emoji: '🟢' };
        if (performanceRatio >= 0.85) return { name: 'Good', color: '#3b82f6', emoji: '🔵' };
        if (performanceRatio >= 0.7) return { name: 'Warning', color: '#f59e0b', emoji: '🟡' };
        if (performanceRatio >= 0.1) return { name: 'Poor', color: '#ef4444', emoji: '🔴' };
        return { name: 'Offline', color: '#6b7280', emoji: '⚫' };
    }
    
    // Utility Methods
    extractWorkerHashrate(worker) {
        const hashrate5m = worker.hashrate5m || '0T';
        return parseFloat(hashrate5m.replace('T', '').trim()) || 0;
    }
    
    cleanName(fullName) {
        const dotIndex = fullName.indexOf('.');
        return dotIndex > -1 ? fullName.substring(dotIndex + 1) : fullName;
    }
    
    getTimeframeHours(timeframe) {
        switch (timeframe) {
            case '1h': return 1;
            case '6h': return 6;
            case '24h': return 24;
            default: return 24;
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Persistence
    saveExpectedHashrates() {
        localStorage.setItem('expectedHashrates', JSON.stringify(this.expectedHashrates));
    }
    
    savePerformanceHistory() {
        localStorage.setItem('performanceHistory', JSON.stringify(this.performanceHistory));
    }
    
    loadData() {
        // Load expected hashrates
        const expectedData = localStorage.getItem('expectedHashrates');
        if (expectedData) {
            try {
                this.expectedHashrates = JSON.parse(expectedData);
            } catch (e) {
                console.error('Failed to load expected hashrates:', e);
            }
        }
        
        // Load performance history
        const historyData = localStorage.getItem('performanceHistory');
        if (historyData) {
            try {
                this.performanceHistory = JSON.parse(historyData);
            } catch (e) {
                console.error('Failed to load performance history:', e);
            }
        }
    }
    
    // UI Rendering
    renderPerformanceSection() {
        const container = document.getElementById('worker-performance');
        if (!container || this.expectedHashrates.length === 0) return;
        
        container.innerHTML = `
            <div class="section performance-section">
                <div class="section-title">
                    <span class="icon">⚡</span>
                    <span>Worker Performance Analysis</span>
                    <button onclick="app.performanceManager.showPerformanceConfig()" class="btn-small">Setup</button>
                </div>
                
                <div class="performance-controls">
                    <div class="timeframe-selector">
                        <button class="timeframe-btn active" data-timeframe="1h">1h</button>
                        <button class="timeframe-btn" data-timeframe="6h">6h</button>
                        <button class="timeframe-btn" data-timeframe="24h">24h</button>
                    </div>
                    <div class="worker-selector">
                        <select id="workerSelect">
                            <option value="all">All Workers</option>
                            ${this.expectedHashrates.map(w => 
                                `<option value="${this.cleanName(w.workerName)}">${this.cleanName(w.workerName)}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div id="performanceContent">
                    ${this.renderPerformanceContent('24h', 'all')}
                </div>
            </div>
        `;
        
        this.setupPerformanceEventListeners();
    }
    
    renderPerformanceContent(timeframe, selectedWorker) {
        if (selectedWorker === 'all') {
            return this.renderWorkerSummaryCards(timeframe) + this.renderPerformanceHeatMap(timeframe);
        } else {
            return this.renderIndividualWorkerChart(selectedWorker, timeframe);
        }
    }
    
    renderWorkerSummaryCards(timeframe) {
        const summaries = this.getWorkerSummaries(timeframe);
        
        if (summaries.length === 0) {
            return '<div class="no-data">No performance data available</div>';
        }
        
        return `
            <div class="performance-summary-cards">
                ${summaries.map(summary => `
                    <div class="performance-summary-card">
                        <div class="card-header">
                            <span class="worker-status">${summary.currentStatus.emoji}</span>
                            <span class="worker-name">${summary.workerName}</span>
                        </div>
                        <div class="performance-metrics">
                            <div class="metric">
                                <span class="label">Avg Performance</span>
                                <span class="value">${Math.round(summary.averagePerformance * 100)}%</span>
                            </div>
                            <div class="metric">
                                <span class="label">Uptime</span>
                                <span class="value">${Math.round(summary.uptimePercentage)}%</span>
                            </div>
                        </div>
                        <div class="status-badge" style="background-color: ${summary.currentStatus.color}">
                            ${summary.currentStatus.name}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderPerformanceHeatMap(timeframe) {
        const data = this.getPerformanceData(null, timeframe);
        
        if (data.length === 0) {
            return '<div class="no-chart">No performance data for heat map</div>';
        }
        
        return `
            <div class="performance-heatmap-section">
                <h3>Performance Heat Map</h3>
                <div class="heatmap-container">
                    <canvas id="performanceHeatMap" width="800" height="300"></canvas>
                </div>
                <div class="heatmap-legend">
                    <span class="legend-item"><span class="color-box" style="background: #10b981"></span> Excellent (95%+)</span>
                    <span class="legend-item"><span class="color-box" style="background: #3b82f6"></span> Good (85-95%)</span>
                    <span class="legend-item"><span class="color-box" style="background: #f59e0b"></span> Warning (70-85%)</span>
                    <span class="legend-item"><span class="color-box" style="background: #ef4444"></span> Poor (10-70%)</span>
                    <span class="legend-item"><span class="color-box" style="background: #6b7280"></span> Offline (0-10%)</span>
                </div>
            </div>
        `;
    }
    
    renderIndividualWorkerChart(workerName, timeframe) {
        const data = this.getPerformanceData(workerName, timeframe);
        
        if (data.length === 0) {
            return '<div class="no-chart">No performance data available for this worker</div>';
        }
        
        return `
            <div class="individual-worker-chart">
                <h3>Performance Trend - ${workerName}</h3>
                <div class="chart-container">
                    <canvas id="individualWorkerChart" width="800" height="300"></canvas>
                </div>
                <div class="performance-stats">
                    ${this.renderWorkerStats(data)}
                </div>
            </div>
        `;
    }
    
    renderWorkerStats(data) {
        const allPerformances = data.flatMap(point => point.workerPerformances);
        if (allPerformances.length === 0) return '';
        
        const avgPerformance = allPerformances.reduce((sum, p) => sum + p.performanceRatio, 0) / allPerformances.length;
        const maxPerformance = Math.max(...allPerformances.map(p => p.performanceRatio));
        const minPerformance = Math.min(...allPerformances.map(p => p.performanceRatio));
        const uptime = (allPerformances.filter(p => p.performanceRatio > 0.1).length / allPerformances.length) * 100;
        
        return `
            <div class="worker-stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Average Performance</span>
                    <span class="stat-value">${Math.round(avgPerformance * 100)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Peak Performance</span>
                    <span class="stat-value">${Math.round(maxPerformance * 100)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Lowest Performance</span>
                    <span class="stat-value">${Math.round(minPerformance * 100)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Uptime</span>
                    <span class="stat-value">${Math.round(uptime)}%</span>
                </div>
            </div>
        `;
    }
    
    setupPerformanceEventListeners() {
        // Timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updatePerformanceContent();
            });
        });
        
        // Worker selector
        const workerSelect = document.getElementById('workerSelect');
        if (workerSelect) {
            workerSelect.addEventListener('change', () => {
                this.updatePerformanceContent();
            });
        }
    }
    
    updatePerformanceContent() {
        const activeTimeframe = document.querySelector('.timeframe-btn.active')?.dataset.timeframe || '24h';
        const selectedWorker = document.getElementById('workerSelect')?.value || 'all';
        
        const content = document.getElementById('performanceContent');
        if (content) {
            content.innerHTML = this.renderPerformanceContent(activeTimeframe, selectedWorker);
            
            // Initialize charts
            setTimeout(() => {
                if (selectedWorker === 'all') {
                    this.initPerformanceHeatMap(activeTimeframe);
                } else {
                    this.initIndividualWorkerChart(selectedWorker, activeTimeframe);
                }
            }, 100);
        }
    }
    
    initPerformanceHeatMap(timeframe) {
        const canvas = document.getElementById('performanceHeatMap');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.getPerformanceData(null, timeframe);
        
        if (data.length === 0) return;
        
        // Create heat map data
        const workerNames = [...new Set(data.flatMap(point => 
            point.workerPerformances.map(p => this.cleanName(p.workerName))
        ))];
        
        const heatMapData = [];
        
        data.forEach((point, timeIndex) => {
            point.workerPerformances.forEach(performance => {
                const workerIndex = workerNames.indexOf(this.cleanName(performance.workerName));
                if (workerIndex !== -1) {
                    heatMapData.push({
                        x: timeIndex,
                        y: workerIndex,
                        v: performance.performanceRatio
                    });
                }
            });
        });
        
        // Simple heat map visualization using rectangles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const cellWidth = Math.max(1, Math.floor(canvas.width / data.length));
        const cellHeight = Math.max(1, Math.floor(canvas.height / workerNames.length));
        
        heatMapData.forEach(cell => {
            const color = this.getPerformanceColor(cell.v);
            ctx.fillStyle = color;
            ctx.fillRect(
                cell.x * cellWidth,
                cell.y * cellHeight,
                cellWidth,
                cellHeight
            );
        });
        
        // Draw worker names
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        workerNames.forEach((name, index) => {
            ctx.fillText(name, 5, (index + 0.7) * cellHeight);
        });
    }
    
    initIndividualWorkerChart(workerName, timeframe) {
        const canvas = document.getElementById('individualWorkerChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (this.workerChart) {
            this.workerChart.destroy();
        }
        
        const data = this.getPerformanceData(workerName, timeframe);
        const chartData = data.flatMap(point => 
            point.workerPerformances.map(p => ({
                x: new Date(point.date),
                y: p.performanceRatio * 100
            }))
        );
        
        this.workerChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Performance %',
                    data: chartData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Expected (100%)',
                    data: chartData.map(point => ({ x: point.x, y: 100 })),
                    borderColor: '#6b7280',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                hour: 'HH:mm',
                                day: 'MMM DD'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 120,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }
    
    getPerformanceColor(ratio) {
        if (ratio >= 0.95) return '#10b981';
        if (ratio >= 0.85) return '#3b82f6';
        if (ratio >= 0.7) return '#f59e0b';
        if (ratio >= 0.1) return '#ef4444';
        return '#6b7280';
    }
    
    // Performance Configuration Modal
    showPerformanceConfig() {
        if (!document.getElementById('performanceConfigModal')) {
            this.createPerformanceConfigModal();
        }
        document.getElementById('performanceConfigModal').style.display = 'block';
    }
    
    createPerformanceConfigModal() {
        const modal = document.createElement('div');
        modal.id = 'performanceConfigModal';
        modal.className = 'modal performance-config-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📊 Performance Setup</h2>
                    <span class="close" onclick="app.performanceManager.closePerformanceConfig()">&times;</span>
                </div>
                <div class="config-content">
                    <div class="expected-hashrates-list">
                        <h3>Expected Hashrates</h3>
                        <div id="hashratesList">
                            ${this.renderHashratesList()}
                        </div>
                    </div>
                    <div class="add-hashrate-section">
                        <h3>Add/Edit Expected Hashrate</h3>
                        <div class="hashrate-form">
                            <input type="text" id="workerNameInput" placeholder="Worker name (e.g., worker1)" />
                            <input type="number" id="expectedHashrateInput" placeholder="Expected TH/s" min="0" step="0.1" />
                            <button onclick="app.performanceManager.addExpectedHashrate()" class="btn primary">
                                Add/Update
                            </button>
                        </div>
                        <div class="form-help">
                            Enter the worker name (just the part after the dot) and expected hashrate in TH/s.
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    renderHashratesList() {
        if (this.expectedHashrates.length === 0) {
            return '<div class="no-hashrates">No expected hashrates configured</div>';
        }
        
        return this.expectedHashrates.map(hashrate => `
            <div class="hashrate-item">
                <div class="hashrate-info">
                    <span class="worker-name">${this.cleanName(hashrate.workerName)}</span>
                    <span class="expected-value">${hashrate.expectedHashrate.toFixed(1)} TH/s</span>
                </div>
                <div class="hashrate-actions">
                    <button onclick="app.performanceManager.editHashrate('${hashrate.workerName}', ${hashrate.expectedHashrate})" 
                            class="btn-small secondary">Edit</button>
                    <button onclick="app.performanceManager.removeHashrate('${hashrate.workerName}')" 
                            class="btn-small danger">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    addExpectedHashrate() {
        const workerName = document.getElementById('workerNameInput').value.trim();
        const expectedHashrate = parseFloat(document.getElementById('expectedHashrateInput').value);
        
        if (!workerName || isNaN(expectedHashrate) || expectedHashrate <= 0) {
            alert('Please enter a valid worker name and expected hashrate');
            return;
        }
        
        this.setExpectedHashrate(workerName, expectedHashrate);
        
        // Clear form
        document.getElementById('workerNameInput').value = '';
        document.getElementById('expectedHashrateInput').value = '';
        
        // Refresh list
        document.getElementById('hashratesList').innerHTML = this.renderHashratesList();
        
        // Update performance section if it exists
        this.renderPerformanceSection();
        
        if (app && app.showNotification) {
            app.showNotification('Hashrate Updated', `Expected hashrate set for ${workerName}: ${expectedHashrate.toFixed(1)} TH/s`);
        }
    }
    
    editHashrate(workerName, currentHashrate) {
        document.getElementById('workerNameInput').value = this.cleanName(workerName);
        document.getElementById('expectedHashrateInput').value = currentHashrate;
    }
    
    removeHashrate(workerName) {
        if (confirm(`Remove expected hashrate for ${this.cleanName(workerName)}?`)) {
            this.removeExpectedHashrate(workerName);
            document.getElementById('hashratesList').innerHTML = this.renderHashratesList();
            this.renderPerformanceSection();
            
            if (app && app.showNotification) {
                app.showNotification('Hashrate Removed', `Expected hashrate removed for ${this.cleanName(workerName)}`);
            }
        }
    }
    
    closePerformanceConfig() {
        const modal = document.getElementById('performanceConfigModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}