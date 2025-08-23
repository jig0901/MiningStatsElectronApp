// Menu Handlers - Main menu and navigation functions

function showMainMenu() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; height: auto;">
            <div class="modal-header">
                <h2>⚙️ Mining Stats Menu</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <button onclick="openSettings()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        🎨 Settings
                    </button>
                    <button onclick="showAdvancedNotificationSettings(); document.querySelectorAll('.modal').forEach(m => m.remove());" 
                            class="refresh-btn" style="margin: 0; justify-content: center;">
                        🔔 Notifications
                    </button>
                    <button onclick="toggleBitcoinPrice()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        ₿ Bitcoin Price
                    </button>
                    <button onclick="toggleAnalytics()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        📊 Analytics
                    </button>
                    <button onclick="toggleWorkerPerformance()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        🔧 Performance
                    </button>
                    <button onclick="toggleMiningActivity()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        📈 Activity Log
                    </button>
                    <button onclick="showWorkerManagement()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        👷 Worker URLs
                    </button>
                    <button onclick="exportAllData()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        💾 Export Data
                    </button>
                    <button onclick="showAbout()" class="refresh-btn" style="margin: 0; justify-content: center;">
                        ℹ️ About
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="refresh-btn" style="margin: 0; justify-content: center; background: #6b7280; grid-column: 1 / -1;">
                        Close Menu
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function showAbout() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; height: auto;">
            <div class="modal-header">
                <h2>ℹ️ About Belani Solo Mining</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⛏️</div>
                <h3 style="margin-bottom: 16px;">Belani Solo Mining Dashboard</h3>
                <p style="color: #6b7280; margin-bottom: 20px; line-height: 1.5;">
                    A comprehensive monitoring dashboard for solo Bitcoin mining operations. 
                    Track your hashrate, monitor workers, analyze performance, and stay updated 
                    with real-time mining statistics.
                </p>
                
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: left;">
                    <h4 style="margin-bottom: 12px;">✨ Features:</h4>
                    <ul style="color: #6b7280; line-height: 1.6; margin-left: 20px;">
                        <li>Real-time hashrate monitoring</li>
                        <li>Worker performance tracking</li>
                        <li>Mining activity timeline</li>
                        <li>Bitcoin price integration</li>
                        <li>Customizable alerts and notifications</li>
                        <li>Data export and analysis tools</li>
                        <li>Dark mode and responsive design</li>
                    </ul>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.open('https://github.com', '_blank')" 
                            class="refresh-btn" style="margin: 0;">
                        📚 Documentation
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="refresh-btn" style="margin: 0; background: #6b7280;">
                        Close
                    </button>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                    Version 2.0 • Built with ❤️ for the mining community
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Close main menu
    document.querySelectorAll('.modal').forEach(m => {
        if (m !== modal) m.remove();
    });
}

function toggleBitcoinPrice() {
    if (window.app && window.app.settingsManager) {
        const currentSetting = window.app.settingsManager.settings.showBitcoinPrice;
        window.app.settingsManager.settings.showBitcoinPrice = !currentSetting;
        window.app.settingsManager.saveSettings();
        
        // Re-render the main content to show/hide Bitcoin price
        if (window.app.render) {
            window.app.render();
        }
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function toggleAnalytics() {
    // Switch to analytics tab and close menu
    if (typeof switchTab === 'function') {
        const analyticsButton = document.querySelector('[onclick*="analytics-tab"]');
        switchTab('analytics-tab', analyticsButton);
    }
    if (window.app) {
        window.app.showNotification('Analytics', 'Switched to Analytics tab');
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function toggleWorkerPerformance() {
    // Switch to performance tab and close menu
    if (typeof switchTab === 'function') {
        const performanceButton = document.querySelector('[onclick*="performance-tab"]');
        switchTab('performance-tab', performanceButton);
    }
    if (window.app) {
        window.app.showNotification('Performance', 'Switched to Performance tab');
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function toggleMiningActivity() {
    // Switch to activity tab and close menu
    if (typeof switchTab === 'function') {
        const activityButton = document.querySelector('[onclick*="activity-tab"]');
        switchTab('activity-tab', activityButton);
    }
    if (window.app) {
        window.app.showNotification('Activity', 'Switched to Activity tab');
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function showWorkerManagement() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; height: auto; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>👷 Worker Management</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h3>Worker URLs</h3>
                    <p style="color: #6b7280; margin-bottom: 16px;">
                        Manage your mining pool URLs and worker configurations.
                    </p>
                </div>
                
                <div id="worker-urls-list" style="margin-bottom: 20px;">
                    <!-- Worker URLs will be populated here -->
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="addWorkerURL()" class="refresh-btn" style="margin: 0; background: #10b981;">
                        Add URL
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
    
    // Close main menu
    document.querySelectorAll('.modal').forEach(m => {
        if (m !== modal) m.remove();
    });
    
    // Load existing worker URLs
    loadWorkerURLs();
}

function loadWorkerURLs() {
    const urlsList = document.getElementById('worker-urls-list');
    if (!urlsList) return;
    
    // Get stored URLs (implement based on your storage system)
    const storedURLs = JSON.parse(localStorage.getItem('workerURLs') || '[]');
    
    if (storedURLs.length === 0) {
        urlsList.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 20px;">
                <p>No worker URLs configured yet.</p>
            </div>
        `;
        return;
    }
    
    urlsList.innerHTML = storedURLs.map((url, index) => `
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px;">
            <input type="text" value="${url}" onchange="updateWorkerURL(${index}, this.value)" 
                   style="flex: 1; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px;">
            <button onclick="removeWorkerURL(${index})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                Remove
            </button>
        </div>
    `).join('');
}

function addWorkerURL() {
    const newURL = prompt('Enter worker URL:');
    if (newURL && newURL.trim()) {
        const storedURLs = JSON.parse(localStorage.getItem('workerURLs') || '[]');
        storedURLs.push(newURL.trim());
        localStorage.setItem('workerURLs', JSON.stringify(storedURLs));
        loadWorkerURLs();
    }
}

function updateWorkerURL(index, newValue) {
    const storedURLs = JSON.parse(localStorage.getItem('workerURLs') || '[]');
    if (index >= 0 && index < storedURLs.length) {
        storedURLs[index] = newValue;
        localStorage.setItem('workerURLs', JSON.stringify(storedURLs));
    }
}

function removeWorkerURL(index) {
    if (confirm('Are you sure you want to remove this URL?')) {
        const storedURLs = JSON.parse(localStorage.getItem('workerURLs') || '[]');
        storedURLs.splice(index, 1);
        localStorage.setItem('workerURLs', JSON.stringify(storedURLs));
        loadWorkerURLs();
    }
}

function exportAllData() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; height: auto;">
            <div class="modal-header">
                <h2>💾 Export Data</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <p style="color: #6b7280; margin-bottom: 20px;">
                    Export your mining data for analysis or backup purposes.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="exportWorkerData()" class="refresh-btn" style="margin: 0;">
                        📊 Export Worker Data (CSV)
                    </button>
                    <button onclick="exportMiningStats()" class="refresh-btn" style="margin: 0;">
                        📈 Export Mining Statistics (JSON)
                    </button>
                    <button onclick="exportActivityLog()" class="refresh-btn" style="margin: 0;">
                        📋 Export Activity Log (CSV)
                    </button>
                    <button onclick="exportAllSettings()" class="refresh-btn" style="margin: 0;">
                        ⚙️ Export Settings (JSON)
                    </button>
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
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
    
    // Close main menu
    document.querySelectorAll('.modal').forEach(m => {
        if (m !== modal) m.remove();
    });
}

function exportWorkerData() {
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        alert('No worker data available to export');
        return;
    }
    
    const workers = window.app.stats.workers;
    const csvHeaders = 'Worker Name,Hashrate (TH/s),Shares,Rejects,Reject Rate (%),Status\n';
    const csvData = workers.map(worker => {
        const cleanName = worker.workername.split('.')[1] || worker.workername;
        const hashrate = parseFloat(worker.hashrate1m) || 0;
        const shares = parseInt(worker.shares) || 0;
        const rejects = parseInt(worker.rejects) || 0;
        const rejectRate = shares > 0 ? ((rejects / (shares + rejects)) * 100).toFixed(2) : '0.00';
        const status = hashrate > 0 ? 'Online' : 'Offline';
        
        return `"${cleanName}",${hashrate.toFixed(2)},${shares},${rejects},${rejectRate},"${status}"`;
    }).join('\n');
    
    downloadFile(csvHeaders + csvData, 'worker-data.csv', 'text/csv');
}

function exportMiningStats() {
    if (!window.app || !window.app.stats) {
        alert('No mining statistics available to export');
        return;
    }
    
    const statsData = {
        timestamp: new Date().toISOString(),
        poolStats: window.app.stats,
        workerCount: window.app.stats.workers ? window.app.stats.workers.length : 0,
        exportedBy: 'Belani Solo Mining Dashboard v2.0'
    };
    
    downloadFile(JSON.stringify(statsData, null, 2), 'mining-stats.json', 'application/json');
}

function exportActivityLog() {
    // This would export activity log data if available
    if (window.miningActivityManager && window.miningActivityManager.activityLog) {
        const log = window.miningActivityManager.activityLog;
        const csvHeaders = 'Timestamp,Type,Message,Details\n';
        const csvData = log.map(entry => {
            return `"${entry.timestamp}","${entry.type}","${entry.message}","${entry.details || ''}"`;
        }).join('\n');
        
        downloadFile(csvHeaders + csvData, 'activity-log.csv', 'text/csv');
    } else {
        alert('No activity log data available to export');
    }
}

function exportAllSettings() {
    if (!window.app || !window.app.settingsManager) {
        alert('No settings available to export');
        return;
    }
    
    const settingsData = {
        timestamp: new Date().toISOString(),
        settings: window.app.settingsManager.settings,
        refreshInterval: window.app.refreshInterval,
        exportedBy: 'Belani Solo Mining Dashboard v2.0'
    };
    
    downloadFile(JSON.stringify(settingsData, null, 2), 'dashboard-settings.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (window.app) {
        window.app.showNotification('Export Complete', `${filename} has been downloaded`);
    }
}

function refreshData() {
    if (window.app) {
        window.app.fetchData();
        window.app.countdown = window.app.refreshInterval;
        
        if (window.app.showNotification) {
            window.app.showNotification('Data Refreshed', 'Mining data has been updated');
        }
    }
}

// Make all functions globally available
window.showMainMenu = showMainMenu;
window.showAbout = showAbout;
window.toggleBitcoinPrice = toggleBitcoinPrice;
window.toggleAnalytics = toggleAnalytics;
window.toggleWorkerPerformance = toggleWorkerPerformance;
window.toggleMiningActivity = toggleMiningActivity;
window.showWorkerManagement = showWorkerManagement;
window.loadWorkerURLs = loadWorkerURLs;
window.addWorkerURL = addWorkerURL;
window.updateWorkerURL = updateWorkerURL;
window.removeWorkerURL = removeWorkerURL;
window.exportAllData = exportAllData;
window.exportWorkerData = exportWorkerData;
window.exportMiningStats = exportMiningStats;
window.exportActivityLog = exportActivityLog;
window.exportAllSettings = exportAllSettings;
window.downloadFile = downloadFile;
window.refreshData = refreshData;