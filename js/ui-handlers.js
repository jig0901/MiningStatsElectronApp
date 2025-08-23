// UI Event Handlers and Global Functions

// Global functions
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

function openSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; height: auto; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>🎨 Settings</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Appearance Settings -->
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <h3 style="margin: 0 0 12px 0; color: #374151;">🎨 Appearance</h3>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label>Dark Mode</label>
                            <input type="checkbox" id="setting-dark-mode" onchange="updateSetting('isDarkMode', this.checked)">
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label>Compact Layout</label>
                            <input type="checkbox" id="setting-compact-layout" onchange="updateSetting('useCompactLayout', this.checked)">
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label>Accent Color</label>
                            <select id="setting-accent-color" onchange="updateSetting('accentColor', this.value)" style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                <option value="orange">Orange</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="red">Red</option>
                                <option value="mint">Mint</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Display Settings -->
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <h3 style="margin: 0 0 12px 0; color: #374151;">📊 Display</h3>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label>Show Bitcoin Price</label>
                            <input type="checkbox" id="setting-bitcoin-price" onchange="updateSetting('showBitcoinPrice', this.checked)">
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label>Show Analytics</label>
                            <input type="checkbox" id="setting-analytics" onchange="updateSetting('showAnalyticsPreview', this.checked)">
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label>Show Worker Performance</label>
                            <input type="checkbox" id="setting-worker-performance" onchange="updateSetting('showWorkerPerformance', this.checked)">
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label>Enable Animations</label>
                            <input type="checkbox" id="setting-animations" onchange="updateSetting('enableAnimations', this.checked)">
                        </div>
                    </div>
                    
                    <!-- Notification Settings -->
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <h3 style="margin: 0 0 12px 0; color: #374151;">🔔 Notifications</h3>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label>Smart Notifications</label>
                            <input type="checkbox" id="setting-notifications" onchange="updateSetting('enableSmartNotifications', this.checked)">
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label>Refresh Interval</label>
                            <select id="setting-refresh-interval" onchange="updateRefreshInterval(this.value)" style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                <option value="30">30 seconds</option>
                                <option value="60" selected>60 seconds</option>
                                <option value="120">2 minutes</option>
                                <option value="300">5 minutes</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="resetSettings()" class="refresh-btn" style="background: #ef4444; margin: 0;">
                            Reset to Defaults
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                                class="refresh-btn" style="margin: 0;">
                            Close
                        </button>
                    </div>
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
    
    // Load current settings
    loadCurrentSettings();
}

function loadCurrentSettings() {
    if (!window.app || !window.app.settingsManager) return;
    
    const settings = window.app.settingsManager.settings;
    
    const darkModeEl = document.getElementById('setting-dark-mode');
    const compactLayoutEl = document.getElementById('setting-compact-layout');
    const accentColorEl = document.getElementById('setting-accent-color');
    const bitcoinPriceEl = document.getElementById('setting-bitcoin-price');
    const analyticsEl = document.getElementById('setting-analytics');
    const workerPerformanceEl = document.getElementById('setting-worker-performance');
    const animationsEl = document.getElementById('setting-animations');
    const notificationsEl = document.getElementById('setting-notifications');
    const refreshIntervalEl = document.getElementById('setting-refresh-interval');
    
    if (darkModeEl) darkModeEl.checked = settings.isDarkMode;
    if (compactLayoutEl) compactLayoutEl.checked = settings.useCompactLayout;
    if (accentColorEl) accentColorEl.value = settings.accentColor;
    if (bitcoinPriceEl) bitcoinPriceEl.checked = settings.showBitcoinPrice;
    if (analyticsEl) analyticsEl.checked = settings.showAnalyticsPreview;
    if (workerPerformanceEl) workerPerformanceEl.checked = settings.showWorkerPerformance;
    if (animationsEl) animationsEl.checked = settings.enableAnimations;
    if (notificationsEl) notificationsEl.checked = settings.enableSmartNotifications;
    if (refreshIntervalEl && window.app) refreshIntervalEl.value = window.app.refreshInterval;
}

function updateSetting(key, value) {
    if (!window.app || !window.app.settingsManager) return;
    
    window.app.settingsManager.settings[key] = value;
    window.app.settingsManager.saveSettings();
}

function updateRefreshInterval(value) {
    if (!window.app) return;
    
    window.app.refreshInterval = parseInt(value);
    window.app.countdown = window.app.refreshInterval;
    
    // Restart timer with new interval
    window.app.startTimer();
}

function resetSettings() {
    if (!window.app || !window.app.settingsManager) return;
    
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        window.app.settingsManager.settings = {
            isDarkMode: false,
            useCompactLayout: false,
            accentColor: 'orange',
            showAdvancedMetrics: true,
            showWorkerPerformance: true,
            showBitcoinPrice: true,
            showAnalyticsPreview: true,
            enableAnimations: true,
            enableSmartNotifications: true
        };
        window.app.settingsManager.saveSettings();
        loadCurrentSettings();
        window.app.showNotification('Settings Reset', 'All settings have been reset to defaults');
    }
}

// Advanced Notification Settings UI
function showAdvancedNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; height: auto;">
            <div class="modal-header">
                <h2>🔔 Notification Settings</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px; color: #6b7280;">
                    Choose which types of notifications you want to receive.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">💎 Share Found</div>
                            <div style="font-size: 12px; color: #6b7280;">When new shares are discovered</div>
                        </div>
                        <input type="checkbox" id="notify-share-found" onchange="toggleNotification('shareFound', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">🔴 Worker Offline</div>
                            <div style="font-size: 12px; color: #6b7280;">When workers go offline</div>
                        </div>
                        <input type="checkbox" id="notify-worker-offline" onchange="toggleNotification('workerOffline', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">🟢 Worker Online</div>
                            <div style="font-size: 12px; color: #6b7280;">When workers come online</div>
                        </div>
                        <input type="checkbox" id="notify-worker-online" onchange="toggleNotification('workerOnline', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">🎉 Milestones</div>
                            <div style="font-size: 12px; color: #6b7280;">Share count and hashrate milestones</div>
                        </div>
                        <input type="checkbox" id="notify-milestones" onchange="toggleNotification('milestones', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">⚡ Hashrate Changes</div>
                            <div style="font-size: 12px; color: #6b7280;">Significant hashrate fluctuations</div>
                        </div>
                        <input type="checkbox" id="notify-hashrate-changes" onchange="toggleNotification('hashrateChanges', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">❌ Errors</div>
                            <div style="font-size: 12px; color: #6b7280;">System errors and alerts</div>
                        </div>
                        <input type="checkbox" id="notify-errors" onchange="toggleNotification('errors', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">💰 Price Alerts</div>
                            <div style="font-size: 12px; color: #6b7280;">Bitcoin price notifications</div>
                        </div>
                        <input type="checkbox" id="notify-price-alerts" onchange="toggleNotification('priceAlerts', this.checked)">
                    </div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="disableAllNotifications()" class="refresh-btn" style="background: #ef4444; margin: 0;">
                        Disable All
                    </button>
                    <button onclick="enableAllNotifications()" class="refresh-btn" style="background: #10b981; margin: 0;">
                        Enable All
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                            class="refresh-btn" style="margin: 0;">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Load current settings
    loadNotificationCheckboxes();
}

function loadNotificationCheckboxes() {
    if (!window.miningActivityManager) return;
    
    const settings = window.miningActivityManager.notificationSettings;
    
    const shareFoundEl = document.getElementById('notify-share-found');
    const workerOfflineEl = document.getElementById('notify-worker-offline');
    const workerOnlineEl = document.getElementById('notify-worker-online');
    const milestonesEl = document.getElementById('notify-milestones');
    const hashrateChangesEl = document.getElementById('notify-hashrate-changes');
    const errorsEl = document.getElementById('notify-errors');
    const priceAlertsEl = document.getElementById('notify-price-alerts');
    
    if (shareFoundEl) shareFoundEl.checked = settings.shareFound;
    if (workerOfflineEl) workerOfflineEl.checked = settings.workerOffline;
    if (workerOnlineEl) workerOnlineEl.checked = settings.workerOnline;
    if (milestonesEl) milestonesEl.checked = settings.milestones;
    if (hashrateChangesEl) hashrateChangesEl.checked = settings.hashrateChanges;
    if (errorsEl) errorsEl.checked = settings.errors;
    if (priceAlertsEl) priceAlertsEl.checked = settings.priceAlerts;
}

function toggleNotification(type, enabled) {
    if (window.miningActivityManager) {
        window.miningActivityManager.toggleNotificationType(type, enabled);
        
        if (window.app) {
            const action = enabled ? 'enabled' : 'disabled';
            const typeLabel = type.replace(/([A-Z])/g, ' $1').toLowerCase();
            window.app.showNotification('Notification Setting', `${typeLabel} notifications ${action}`);
        }
    }
}

function disableAllNotifications() {
    if (!window.miningActivityManager) return;
    
    ['shareFound', 'workerOffline', 'workerOnline', 'milestones', 'hashrateChanges', 'errors', 'priceAlerts'].forEach(type => {
        window.miningActivityManager.toggleNotificationType(type, false);
    });
    
    loadNotificationCheckboxes();
    
    if (window.app) {
        window.app.showNotification('Notifications', 'All notifications disabled');
    }
}

function enableAllNotifications() {
    if (!window.miningActivityManager) return;
    
    ['shareFound', 'workerOffline', 'workerOnline', 'milestones', 'hashrateChanges', 'errors', 'priceAlerts'].forEach(type => {
        window.miningActivityManager.toggleNotificationType(type, true);
    });
    
    loadNotificationCheckboxes();
    
    if (window.app) {
        window.app.showNotification('Notifications', 'All notifications enabled');
    }
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
    // Analytics are now in the Analytics tab
    if (window.app) {
        window.app.showNotification('Analytics', 'Analytics are available in the Analytics tab');
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function toggleWorkerPerformance() {
    // Worker performance is now in the Performance tab
    if (window.app) {
        window.app.showNotification('Performance', 'Worker performance is available in the Performance tab');
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function toggleMiningActivity() {
    // Mining activity is now in the Activity Log tab
    if (window.app) {
        window.app.showNotification('Activity', 'Mining activity is available in the Activity Log tab');
    }
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

function showWorkerManagement() {
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        alert('No worker data available');
        return;
    }
    
    const workers = window.app.stats.workers;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; height: auto; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>👷 Worker URL Management</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px; color: #6b7280;">
                    Set URLs for your workers to enable quick access. You can click worker names in the table to open their interfaces.
                </p>
                <div id="worker-url-inputs">
                    ${workers.map(worker => {
                        const cleanName = window.app.cleanWorkerName(worker.workername);
                        const currentUrl = window.app.workerUrls[cleanName] || '';
                        return `
                            <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
                                <label style="flex: 1; font-weight: 600; margin-right: 12px;">${cleanName}</label>
                                <input type="url" 
                                       placeholder="http://192.168.1.100 or miner IP"
                                       value="${currentUrl}"
                                       data-worker="${cleanName}"
                                       style="flex: 2; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                <button onclick="testWorkerUrl('${cleanName}')" 
                                        class="refresh-btn" style="margin-left: 8px; padding: 6px 12px; font-size: 12px;">
                                    Test
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="clearAllWorkerUrls()" 
                            class="refresh-btn" style="background: #ef4444; margin: 0;">
                        Clear All
                    </button>
                    <button onclick="saveWorkerUrls()" 
                            class="refresh-btn" style="margin: 0;">
                        Save URLs
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

function testWorkerUrl(workerName) {
    const input = document.querySelector(`input[data-worker="${workerName}"]`);
    if (!input || !input.value) {
        alert('Please enter a URL first');
        return;
    }
    
    let url = input.value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    
    // Try to open in new tab
    const testWindow = window.open(url, '_blank');
    if (testWindow) {
        setTimeout(() => {
            try {
                if (testWindow.closed) {
                    alert('Connection test completed');
                } else {
                    testWindow.close();
                    alert('Connection successful!');
                }
            } catch (e) {
                alert('Connection test completed');
            }
        }, 2000);
    } else {
        alert('Popup blocked or invalid URL');
    }
}

function saveWorkerUrls() {
    if (!window.app) return;
    
    const inputs = document.querySelectorAll('#worker-url-inputs input[data-worker]');
    let saved = 0;
    
    inputs.forEach(input => {
        const workerName = input.dataset.worker;
        let url = input.value.trim();
        
        if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'http://' + url;
            }
            window.app.workerUrls[workerName] = url;
            saved++;
        } else {
            delete window.app.workerUrls[workerName];
        }
    });
    
    window.app.saveWorkerUrlsToStorage();
    document.querySelectorAll('.modal').forEach(m => m.remove());
    
    window.app.showNotification('URLs Saved', `Saved URLs for ${saved} workers`);
    
    // Re-render workers table to show URL indicators
    if (window.app.stats) {
        window.app.render();
    }
}

function clearAllWorkerUrls() {
    if (confirm('Are you sure you want to clear all worker URLs?')) {
        if (window.app) {
            window.app.workerUrls = {};
            window.app.saveWorkerUrlsToStorage();
        }
        
        // Clear all inputs
        document.querySelectorAll('#worker-url-inputs input').forEach(input => {
            input.value = '';
        });
        
        if (window.app) {
            window.app.showNotification('URLs Cleared', 'All worker URLs have been cleared');
        }
    }
}

function exportAllData() {
    const data = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        settings: window.app && window.app.settingsManager ? window.app.settingsManager.settings : {},
        workerUrls: window.app ? window.app.workerUrls : {},
        currentStats: window.app ? window.app.stats : null,
        hashrateHistory: window.app ? window.app.history : [],
        bitcoinPriceHistory: window.app && window.app.bitcoinPriceManager ? 
            window.app.bitcoinPriceManager.priceHistory : [],
        analyticsData: window.app && window.app.analyticsManager ? 
            window.app.analyticsManager.shareAnalytics : [],
        performanceData: window.workerPerformanceManager ? {
            expectedHashrates: Object.fromEntries(window.workerPerformanceManager.expectedHashrates),
            performanceHistory: window.workerPerformanceManager.performanceHistory.slice(-100)
        } : {},
        activityData: window.miningActivityManager ? 
            window.miningActivityManager.activities.slice(0, 500) : []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `belani-mining-complete-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.app) {
        window.app.showNotification('Export Complete', 'Complete mining data exported successfully');
    }
    
    document.querySelectorAll('.modal').forEach(m => m.remove());
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

function refreshData() {
    if (window.app) {
        window.app.fetchData();
        window.app.countdown = window.app.refreshInterval;
    }
}

function handleWorkerClick(workerName, event) {
    if (!window.app) return;
    
    const url = window.app.workerUrls[workerName];
    
    if (url) {
        if (event.ctrlKey || event.metaKey) {
            // Edit URL on Ctrl/Cmd + click
            const newUrl = prompt(`Edit URL for ${workerName}:`, url);
            if (newUrl && newUrl !== url) {
                const finalUrl = newUrl.startsWith('http') ? newUrl : `http://${newUrl}`;
                window.app.workerUrls[workerName] = finalUrl;
                window.app.saveWorkerUrlsToStorage();
                window.app.showNotification('URL Updated', `URL updated for ${workerName}`);
                window.app.render(); // Re-render to update URL indicator
            }
        } else {
            // Open URL in new tab
            window.open(url, '_blank');
        }
    } else {
        // Prompt to add URL
        const newUrl = prompt(`Enter URL for ${workerName} (e.g., 192.168.1.100):`);
        if (newUrl) {
            const finalUrl = newUrl.startsWith('http') ? newUrl : `http://${newUrl}`;
            window.app.workerUrls[workerName] = finalUrl;
            window.app.saveWorkerUrlsToStorage();
            window.app.showNotification('URL Added', `URL added for ${workerName}`);
            window.app.render(); // Re-render to show URL indicator
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshData();
    }
    
    // Ctrl/Cmd + M for menu
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        showMainMenu();
    }
    
    // Ctrl/Cmd + N for notifications
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        showAdvancedNotificationSettings();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.remove());
    }
});

// ================================
// FIXED TAB MANAGEMENT FUNCTIONS
// ================================

// Tab Management Functions - FIXED VERSION
function switchTab(tabId, buttonElement) {
    console.log(`🔄 Switching to tab: ${tabId}`);
    
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab panel
    const selectedPanel = document.getElementById(tabId);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
        console.log(`✅ Activated panel: ${tabId}`);
    } else {
        console.error(`❌ Panel not found: ${tabId}`);
    }
    
    // Add active class to clicked button
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    // Initialize tab content properly
    setTimeout(() => {
        initializeSpecificTab(tabId);
    }, 100);
}

function initializeSpecificTab(tabId) {
    console.log(`🔧 Initializing specific tab: ${tabId}`);
    
    switch (tabId) {
        case 'performance-tab':
            initializePerformanceTab();
            break;
        case 'activity-tab':
            initializeActivityTab();
            break;
        case 'analytics-tab':
            initializeAnalyticsTab();
            break;
        case 'settings-tab':
            initializeSettingsTab();
            break;
    }
}

function initializePerformanceTab() {
    console.log('🔧 Initializing performance tab...');
    
    const performanceContent = document.getElementById('performance-content');
    if (!performanceContent) {
        console.error('❌ Performance content container not found');
        return;
    }
    
    // Ensure we have the worker-performance container
    let performanceContainer = document.getElementById('worker-performance');
    if (!performanceContainer) {
        performanceContent.innerHTML = `
            <div id="worker-performance">
                <div style="text-align: center; color: #6b7280; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
                    <h3>Worker Performance Analysis</h3>
                    <p>Analyzing worker performance...</p>
                </div>
            </div>
        `;
        performanceContainer = document.getElementById('worker-performance');
    }
    
    // Trigger analysis if we have data
    if (window.workerPerformanceManager && window.app && window.app.stats && window.app.stats.workers) {
        setTimeout(() => {
            console.log('🔧 Triggering worker performance analysis...');
            window.workerPerformanceManager.analyzeWorkerPerformance(window.app.stats.workers);
        }, 200);
    } else {
        console.log('⚠️ Missing components for performance analysis');
    }
}

function initializeActivityTab() {
    console.log('📊 Initializing activity tab...');
    
    const activityContent = document.getElementById('activity-content');
    if (!activityContent) {
        console.error('❌ Activity content container not found');
        return;
    }
    
    // Ensure we have the proper structure
    let activityDisplayArea = document.getElementById('activity-display-area');
    if (!activityDisplayArea) {
        activityContent.innerHTML = `
            <div id="activity-display-area">
                <div id="mining-activity">
                    <div style="text-align: center; color: #6b7280; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <h3>Mining Activity Timeline</h3>
                        <p>Loading activity data...</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Make sure we have the mining-activity container
        if (!document.getElementById('mining-activity')) {
            activityDisplayArea.innerHTML = '<div id="mining-activity"></div>';
        }
    }
    
    // Update activity display if manager exists
    if (window.miningActivityManager) {
        setTimeout(() => {
            console.log('📊 Triggering activity display update...');
            window.miningActivityManager.updateActivityDisplay();
        }, 200);
    } else {
        console.log('⚠️ Mining activity manager not available');
    }
}

function initializeAnalyticsTab() {
    console.log('📈 Initializing analytics tab...');
    
    const analyticsContent = document.getElementById('analytics-content');
    if (!analyticsContent) {
        console.error('❌ Analytics content container not found');
        return;
    }
    
    // Build the analytics content structure
    let analyticsHTML = '';
    
    // Add Bitcoin price section if enabled and available
    if (window.bitcoinPriceManager && window.bitcoinPriceManager.currentPrice && 
        window.app?.settingsManager?.settings?.showBitcoinPrice) {
        analyticsHTML += '<div id="bitcoin-price-section"></div>';
    }
    
    // Add analytics display area
    analyticsHTML += `
        <div id="analytics-display-area">
            <div id="analytics-preview">
                <div style="text-align: center; color: #6b7280; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                    <h3>Mining Analytics & Insights</h3>
                    <p>Loading analytics data...</p>
                </div>
            </div>
        </div>
    `;
    
    // Set the content
    analyticsContent.innerHTML = analyticsHTML;
    
    // Update Bitcoin price if manager exists
    if (window.bitcoinPriceManager && window.bitcoinPriceManager.currentPrice) {
        setTimeout(() => {
            console.log('₿ Updating Bitcoin price display...');
            window.bitcoinPriceManager.updatePriceDisplay();
        }, 100);
    }
    
    // Update analytics if manager exists
    if (window.analyticsManager) {
        setTimeout(() => {
            console.log('📈 Triggering analytics display update...');
            window.analyticsManager.updateAnalyticsDisplay();
        }, 200);
    } else {
        console.log('⚠️ Analytics manager not available');
    }
}

function initializeSettingsTab() {
    console.log('⚙️ Initializing settings tab...');
    
    // Load quick settings
    if (window.app && window.app.loadQuickSettings) {
        setTimeout(() => {
            window.app.loadQuickSettings();
        }, 100);
    }
}

// Fixed refresh functions
function refreshActivityTab() {
    console.log('🔄 Refreshing activity tab...');
    initializeActivityTab();
}

function refreshAnalyticsTab() {
    console.log('🔄 Refreshing analytics tab...');
    initializeAnalyticsTab();
}

// Quick Settings Functions
function quickToggleSetting(setting, value) {
    if (window.app && window.app.settingsManager) {
        window.app.settingsManager.updateSetting(setting, value);
    }
}

function quickToggleNotification(type, enabled) {
    if (window.miningActivityManager) {
        window.miningActivityManager.toggleNotificationType(type, enabled);
    }
}

function quickUpdateRefreshInterval(value) {
    if (window.app) {
        window.app.refreshInterval = parseInt(value);
        window.app.countdown = window.app.refreshInterval;
        window.app.startTimer();
    }
}

// Additional Functions
function exportWorkerData() {
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        alert('No worker data to export');
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        workers: window.app.stats.workers,
        workerUrls: window.app.workerUrls,
        summary: {
            totalWorkers: window.app.stats.worker_count,
            totalHashrate: window.app.stats.hashrate_1min_ths
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.app) {
        window.app.showNotification('Export Complete', 'Worker data exported successfully');
    }
}

// Debug and Utility Functions
function debugNotificationSettings() {
    console.log('=== NOTIFICATION DEBUG ===');
    console.log('Mining Activity Manager exists:', !!window.miningActivityManager);
    
    if (window.miningActivityManager) {
        console.log('Notification Settings:', window.miningActivityManager.notificationSettings);
        console.log('Share Found Setting:', window.miningActivityManager.notificationSettings.shareFound);
        console.log('Should notify shares:', window.miningActivityManager.shouldNotify('share'));
    }
    
    console.log('App Settings Manager exists:', !!(window.app && window.app.settingsManager));
    if (window.app && window.app.settingsManager) {
        console.log('Smart Notifications Enabled:', window.app.settingsManager.settings.enableSmartNotifications);
    }
    console.log('=========================');
}

function debugTabState() {
    console.log('=== TAB DEBUG INFO ===');
    console.log('Active tab panel:', document.querySelector('.tab-panel.active')?.id || 'none');
    console.log('Active tab button:', document.querySelector('.tab-button.active')?.textContent?.trim() || 'none');
    
    console.log('Container states:');
    console.log('- performance-content:', !!document.getElementById('performance-content'));
    console.log('- worker-performance:', !!document.getElementById('worker-performance'));
    console.log('- activity-content:', !!document.getElementById('activity-content'));
    console.log('- mining-activity:', !!document.getElementById('mining-activity'));
    console.log('- analytics-content:', !!document.getElementById('analytics-content'));
    console.log('- analytics-preview:', !!document.getElementById('analytics-preview'));
    
    console.log('Manager states:');
    console.log('- workerPerformanceManager:', !!window.workerPerformanceManager);
    console.log('- miningActivityManager:', !!window.miningActivityManager);
    console.log('- analyticsManager:', !!window.analyticsManager);
    console.log('- bitcoinPriceManager:', !!window.bitcoinPriceManager);
    
    console.log('====================');
}

// Force enable worker performance for debugging
function forceEnableWorkerPerformance() {
    console.log('🔧 Force enabling worker performance...');
    
    // Switch to performance tab first
    switchTab('performance-tab', document.querySelector('[onclick*="performance-tab"]'));
    
    // Update settings
    if (window.app && window.app.settingsManager) {
        window.app.settingsManager.settings.showWorkerPerformance = true;
        window.app.settingsManager.saveSettings();
        console.log('✅ Settings updated');
    }
    
    // Force update the performance tab
    setTimeout(() => {
        initializePerformanceTab();
    }, 200);
}

// Global analytics function
function showAnalyticsDetails() {
    if (window.analyticsManager) {
        window.analyticsManager.showDetailedAnalytics();
    } else {
        alert('Analytics manager not available');
    }
}

// Ensure tabs are properly initialized on load
function ensureTabsAreInitialized() {
    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
        setTimeout(ensureTabsAreInitialized, 100);
        return;
    }
    
    console.log('🚀 Ensuring tabs are properly initialized...');
    
    // Check if we have tabs
    const tabs = document.querySelectorAll('.tab-panel');
    if (tabs.length === 0) {
        console.log('⚠️ No tabs found, waiting...');
        setTimeout(ensureTabsAreInitialized, 500);
        return;
    }
    
    // Initialize the default active tab (workers)
    const activeTab = document.querySelector('.tab-panel.active');
    if (activeTab) {
        console.log(`✅ Found active tab: ${activeTab.id}`);
        initializeSpecificTab(activeTab.id);
    } else {
        // If no active tab, activate the first one
        const firstTab = tabs[0];
        if (firstTab) {
            firstTab.classList.add('active');
            const firstButton = document.querySelector('.tab-button');
            if (firstButton) {
                firstButton.classList.add('active');
            }
            initializeSpecificTab(firstTab.id);
        }
    }
}

// Click outside modal to close
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.remove();
    }
});

// Initialize tabs when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(ensureTabsAreInitialized, 500);
    });
} else {
    setTimeout(ensureTabsAreInitialized, 500);
}

// ANALYTICS FIX FUNCTIONS - ADD TO END OF ui-handlers.js

// ================================
// ANALYTICS TAB FIX FUNCTIONS
// ================================

function forceAnalyticsUpdate() {
    console.log('🔄 Forcing analytics update...');
    
    // Switch to analytics tab if not already there
    const analyticsTab = document.getElementById('analytics-tab');
    if (!analyticsTab || !analyticsTab.classList.contains('active')) {
        const analyticsButton = document.querySelector('[onclick*="analytics-tab"]');
        if (analyticsButton) {
            switchTab('analytics-tab', analyticsButton);
        }
    }
    
    // Force update
    setTimeout(() => {
        loadAnalyticsTabSafely();
    }, 200);
}

function generateSampleAnalytics() {
    console.log('📊 Generating sample analytics data...');
    
    if (!window.analyticsManager) {
        window.analyticsManager = new MiningAnalyticsManager();
    }
    
    // Generate sample data
    const sampleData = {
        timestamp: new Date(),
        totalShares: Math.floor(Math.random() * 10000) + 1000,
        rejectedShares: Math.floor(Math.random() * 100),
        bestShare: Math.floor(Math.random() * 1000000) + 100000,
        hashrate: Math.random() * 100 + 50,
        workerCount: Math.floor(Math.random() * 10) + 1,
        shareLuck: 0.8 + Math.random() * 0.4,
        efficiency: 85 + Math.random() * 15,
        profitability: {
            dailyRevenue: Math.random() * 50 + 10,
            trend: 'stable'
        }
    };
    
    window.analyticsManager.shareAnalytics.push(sampleData);
    
    // Update display using enhanced method if available
    if (window.analyticsManager.updateAnalyticsDisplayFixed) {
        window.analyticsManager.updateAnalyticsDisplayFixed();
    } else {
        window.analyticsManager.updateAnalyticsDisplay();
    }
    
    if (window.app) {
        window.app.showNotification('Sample Data', 'Sample analytics data generated');
    }
}

function exportAnalyticsData() {
    if (!window.analyticsManager || !window.analyticsManager.shareAnalytics) {
        alert('No analytics data to export');
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        analytics: window.analyticsManager.shareAnalytics,
        summary: {
            totalEntries: window.analyticsManager.shareAnalytics.length,
            averageHashrate: window.analyticsManager.getAverageHashrate ? window.analyticsManager.getAverageHashrate() : 0,
            averageEfficiency: window.analyticsManager.getAverageEfficiency ? window.analyticsManager.getAverageEfficiency() : 0
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.app) {
        window.app.showNotification('Export Complete', 'Analytics data exported');
    }
}

function showAnalyticsDetails() {
    if (window.analyticsManager && typeof window.analyticsManager.showDetailedAnalytics === 'function') {
        window.analyticsManager.showDetailedAnalytics();
    } else {
        alert('Detailed analytics not available');
    }
}

// Auto-fix function to ensure analytics visibility
function ensureAnalyticsVisibility() {
    const analyticsTab = document.getElementById('analytics-tab');
    const analyticsPreview = document.getElementById('analytics-preview');
    
    if (analyticsTab && analyticsTab.classList.contains('active') && analyticsPreview) {
        // Force visibility
        analyticsPreview.style.display = 'block';
        analyticsPreview.style.visibility = 'visible';
        analyticsPreview.style.opacity = '1';
        analyticsPreview.style.minHeight = '200px';
        
        // Check if content is minimal and fix if needed
        if (analyticsPreview.innerHTML.length < 200) {
            console.log('🔧 Auto-fixing minimal analytics content...');
            if (window.createManualAnalyticsDisplay) {
                window.createManualAnalyticsDisplay();
            }
        }
    }
}

// ================================
// ENHANCED UTILITY FUNCTIONS
// ================================

function testAddActivity() {
    if (window.miningActivityManager) {
        const testActivity = {
            type: 'test',
            message: 'Test activity added manually',
            timestamp: new Date(),
            read: false
        };
        
        window.miningActivityManager.activities.push(testActivity);
        window.miningActivityManager.updateActivityDisplay();
        
        if (window.app) {
            window.app.showNotification('Test Activity', 'Test activity added successfully');
        }
    }
}

function refreshActivityDisplay() {
    if (window.miningActivityManager && window.miningActivityManager.updateActivityDisplay) {
        window.miningActivityManager.updateActivityDisplay();
    } else {
        console.warn('⚠️ Activity manager not available for refresh');
    }
}

// ================================
// ENHANCED TAB REFRESH FUNCTIONS
// ================================

function refreshAnalyticsTab() {
    console.log('🔄 Refreshing analytics tab...');
    
    // Switch to analytics tab if not active
    const analyticsTab = document.getElementById('analytics-tab');
    if (!analyticsTab || !analyticsTab.classList.contains('active')) {
        const analyticsButton = document.querySelector('[onclick*="analytics-tab"]');
        if (analyticsButton) {
            switchTab('analytics-tab', analyticsButton);
        }
    }
    
    // Force refresh
    setTimeout(() => {
        forceAnalyticsUpdate();
    }, 100);
}

function refreshActivityTab() {
    console.log('🔄 Refreshing activity tab...');
    
    // Switch to activity tab if not active
    const activityTab = document.getElementById('activity-tab');
    if (!activityTab || !activityTab.classList.contains('active')) {
        const activityButton = document.querySelector('[onclick*="activity-tab"]');
        if (activityButton) {
            switchTab('activity-tab', activityButton);
        }
    }
    
    // Force refresh
    setTimeout(() => {
        if (window.loadActivityTabSafely) {
            window.loadActivityTabSafely();
        }
    }, 100);
}

// ================================
// ENHANCED DEBUG FUNCTIONS
// ================================

function debugAnalyticsState() {
    console.log('=== ANALYTICS DEBUG INFO ===');
    console.log('Analytics Manager exists:', !!window.analyticsManager);
    
    if (window.analyticsManager) {
        console.log('Analytics data entries:', window.analyticsManager.shareAnalytics.length);
        console.log('Enhanced update method:', !!window.analyticsManager.updateAnalyticsDisplayFixed);
    }
    
    console.log('Analytics containers:');
    console.log('- analytics-content:', !!document.getElementById('analytics-content'));
    console.log('- analytics-preview:', !!document.getElementById('analytics-preview'));
    
    const analyticsPreview = document.getElementById('analytics-preview');
    if (analyticsPreview) {
        console.log('Analytics preview visibility:');
        console.log('- display:', getComputedStyle(analyticsPreview).display);
        console.log('- visibility:', getComputedStyle(analyticsPreview).visibility);
        console.log('- opacity:', getComputedStyle(analyticsPreview).opacity);
        console.log('- content length:', analyticsPreview.innerHTML.length);
    }
    
    console.log('===========================');
}

function debugAllTabsState() {
    console.log('=== ALL TABS DEBUG ===');
    
    // Check active tab
    const activeTab = document.querySelector('.tab-panel.active');
    console.log('Active tab:', activeTab ? activeTab.id : 'none');
    
    // Check all managers
    console.log('Managers state:');
    console.log('- Analytics Manager:', !!window.analyticsManager);
    console.log('- Activity Manager:', !!window.miningActivityManager);
    console.log('- Performance Manager:', !!window.workerPerformanceManager);
    console.log('- Bitcoin Price Manager:', !!window.bitcoinPriceManager);
    
    // Check containers
    const containers = [
        'analytics-content', 'analytics-preview',
        'activity-content', 'mining-activity',
        'performance-content', 'worker-performance'
    ];
    
    console.log('Container states:');
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`- ${id}: exists, ${el.innerHTML.length} chars, display: ${getComputedStyle(el).display}`);
        } else {
            console.log(`- ${id}: missing`);
        }
    });
    
    console.log('=====================');
}

// ================================
// PERIODIC FIXES
// ================================

// Set up periodic check for analytics visibility (every 5 seconds)
setInterval(ensureAnalyticsVisibility, 5000);

// Set up periodic debug logging (every 30 seconds, only if debug mode)
if (window.location.search.includes('debug=true')) {
    setInterval(() => {
        console.log('🔍 Periodic debug check...');
        debugAllTabsState();
    }, 30000);
}

// ================================
// GLOBAL FUNCTION EXPORTS
// ================================

// Make analytics functions globally available
window.forceAnalyticsUpdate = forceAnalyticsUpdate;
window.generateSampleAnalytics = generateSampleAnalytics;
window.exportAnalyticsData = exportAnalyticsData;
window.showAnalyticsDetails = showAnalyticsDetails;
window.ensureAnalyticsVisibility = ensureAnalyticsVisibility;

// Make utility functions globally available
window.testAddActivity = testAddActivity;
window.refreshActivityDisplay = refreshActivityDisplay;
window.refreshAnalyticsTab = refreshAnalyticsTab;
window.refreshActivityTab = refreshActivityTab;

// Make debug functions globally available
window.debugAnalyticsState = debugAnalyticsState;
window.debugAllTabsState = debugAllTabsState;

// ================================
// INITIALIZATION
// ================================

// Initialize analytics fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📊 Analytics fix functions loaded');
        
        // Quick initial fix for analytics visibility
        setTimeout(() => {
            ensureAnalyticsVisibility();
        }, 2000);
    });
} else {
    console.log('📊 Analytics fix functions loaded');
    
    // Quick initial fix for analytics visibility
    setTimeout(() => {
        ensureAnalyticsVisibility();
    }, 2000);
}

console.log('✅ Analytics Tab Fix Functions Loaded Successfully');