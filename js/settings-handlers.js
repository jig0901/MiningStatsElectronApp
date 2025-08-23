// Settings Handlers - Settings UI and configuration functions

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

// Quick Settings Functions
function quickToggleSetting(setting, value) {
    if (window.app && window.app.settingsManager) {
        window.app.settingsManager.updateSetting(setting, value);
    }
}

function quickUpdateRefreshInterval(value) {
    if (window.app) {
        window.app.refreshInterval = parseInt(value);
        window.app.countdown = window.app.refreshInterval;
        window.app.startTimer();
    }
}

function loadQuickSettings() {
    if (!window.app || !window.app.settingsManager) return;
    
    const settings = window.app.settingsManager.settings;
    const notificationSettings = window.miningActivityManager?.notificationSettings;
    
    // Load appearance settings
    const darkModeEl = document.getElementById('quick-dark-mode');
    const animationsEl = document.getElementById('quick-animations');
    const bitcoinPriceEl = document.getElementById('quick-bitcoin-price');
    const refreshIntervalEl = document.getElementById('quick-refresh-interval');
    
    if (darkModeEl) darkModeEl.checked = settings.isDarkMode;
    if (animationsEl) animationsEl.checked = settings.enableAnimations;
    if (bitcoinPriceEl) bitcoinPriceEl.checked = settings.showBitcoinPrice;
    if (refreshIntervalEl) refreshIntervalEl.value = window.app.refreshInterval;
    
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

// Make functions globally available
window.openSettings = openSettings;
window.loadCurrentSettings = loadCurrentSettings;
window.updateSetting = updateSetting;
window.updateRefreshInterval = updateRefreshInterval;
window.resetSettings = resetSettings;
window.quickToggleSetting = quickToggleSetting;
window.quickUpdateRefreshInterval = quickUpdateRefreshInterval;
window.loadQuickSettings = loadQuickSettings;