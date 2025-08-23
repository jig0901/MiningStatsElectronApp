// Enhanced Settings Manager for Electron App
// Converted from EnhancedSettingsManager.swift

class EnhancedSettingsManager {
    constructor() {
        this.settings = {
            // Appearance Settings
            isDarkMode: false,
            useCompactLayout: false,
            accentColor: 'orange',
            
            // Feature Visibility Settings
            showAdvancedMetrics: true,
            showWorkerPerformance: true,
            showBitcoinPrice: true,
            showAnalyticsPreview: true,
            showProfitabilityCards: true,
            showOddsSection: true,
            showChartsSection: true,
            showWorkerTable: true,
            
            // Dashboard Layout Settings
            dashboardLayout: 'standard',
            cardsPerRow: 2,
            showSectionIcons: true,
            enableAnimations: true,
            
            // Data Display Settings
            preferredHashrateUnit: 'terahash',
            preferredCurrency: 'usd',
            showRelativeTimes: true,
            use24HourFormat: false,
            
            // Notification Settings
            enableSmartNotifications: true,
            notificationSummaryEnabled: true,
            
            // Data & Privacy Settings
            enableDataCollection: false,
            shareAnonymousMetrics: false,
            automaticBackup: true,
            dataRetentionDays: 30,
            
            // Advanced Settings
            refreshInterval: 'oneMinute',
            enableBackgroundRefresh: true,
            debugMode: false,
            enableBetaFeatures: false,
            
            // Watch Settings
            enableWatchSync: true,
            watchDisplayMode: 'compact',
            watchMetrics: ['hashrate', 'workers', 'comedPrice']
        };
        
        this.loadSettings();
    }
    
    // Settings Persistence
    saveSettings() {
        localStorage.setItem('enhancedSettings', JSON.stringify(this.settings));
        this.applySettings();
    }
    
    loadSettings() {
        const stored = localStorage.getItem('enhancedSettings');
        if (stored) {
            try {
                const parsedSettings = JSON.parse(stored);
                this.settings = { ...this.settings, ...parsedSettings };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        this.applySettings();
    }
    
    // Apply settings to the UI
    applySettings() {
        // Apply dark mode
        document.body.classList.toggle('dark-mode', this.settings.isDarkMode);
        
        // Apply accent color
        document.documentElement.style.setProperty('--accent-color', this.getAccentColorValue());
        
        // Apply compact layout
        document.body.classList.toggle('compact-layout', this.settings.useCompactLayout);
        
        // Show/hide sections based on settings
        this.toggleSectionVisibility();
        
        // Apply animations
        document.body.classList.toggle('animations-disabled', !this.settings.enableAnimations);
    }
    
    getAccentColorValue() {
        const colors = {
            orange: '#f59e0b',
            blue: '#3b82f6',
            green: '#10b981',
            purple: '#8b5cf6',
            red: '#ef4444',
            mint: '#06d6a0'
        };
        return colors[this.settings.accentColor] || colors.orange;
    }
    
    toggleSectionVisibility() {
        const sections = {
            'advanced-metrics': this.settings.showAdvancedMetrics,
            'worker-performance': this.settings.showWorkerPerformance,
            'bitcoin-price': this.settings.showBitcoinPrice,
            'analytics-preview': this.settings.showAnalyticsPreview,
            'profitability-cards': this.settings.showProfitabilityCards,
            'odds-section': this.settings.showOddsSection,
            'charts-section': this.settings.showChartsSection,
            'worker-table': this.settings.showWorkerTable
        };
        
        Object.entries(sections).forEach(([id, visible]) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = visible ? 'block' : 'none';
            }
        });
    }
    
    // Settings UI
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'modal settings-modal';
        
        modal.innerHTML = `
            <div class="modal-content settings-content">
                <div class="modal-header">
                    <h2>⚙️ Enhanced Settings</h2>
                    <span class="close" onclick="app.closeSettingsModal()">&times;</span>
                </div>
                <div class="settings-tabs">
                    <div class="tab active" data-tab="appearance">🎨 Appearance</div>
                    <div class="tab" data-tab="features">🔧 Features</div>
                    <div class="tab" data-tab="display">📊 Display</div>
                    <div class="tab" data-tab="notifications">🔔 Notifications</div>
                    <div class="tab" data-tab="privacy">🔒 Privacy</div>
                    <div class="tab" data-tab="advanced">⚡ Advanced</div>
                </div>
                <div class="settings-content-area">
                    ${this.createAppearanceTab()}
                    ${this.createFeaturesTab()}
                    ${this.createDisplayTab()}
                    ${this.createNotificationsTab()}
                    ${this.createPrivacyTab()}
                    ${this.createAdvancedTab()}
                </div>
                <div class="settings-footer">
                    <button onclick="app.resetSettings()" class="btn secondary">Reset to Defaults</button>
                    <button onclick="app.saveSettingsAndClose()" class="btn primary">Save & Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupSettingsEventListeners();
    }
    
    createAppearanceTab() {
        return `
            <div class="tab-content active" id="appearance-tab">
                <div class="setting-group">
                    <h3>Theme</h3>
                    <label class="setting-item">
                        <span>Dark Mode</span>
                        <input type="checkbox" id="isDarkMode" ${this.settings.isDarkMode ? 'checked' : ''}>
                    </label>
                    <label class="setting-item">
                        <span>Compact Layout</span>
                        <input type="checkbox" id="useCompactLayout" ${this.settings.useCompactLayout ? 'checked' : ''}>
                    </label>
                </div>
                
                <div class="setting-group">
                    <h3>Accent Color</h3>
                    <div class="color-grid">
                        ${['orange', 'blue', 'green', 'purple', 'red', 'mint'].map(color => `
                            <div class="color-option ${this.settings.accentColor === color ? 'selected' : ''}" 
                                 data-color="${color}" 
                                 style="background-color: ${this.getColorValue(color)}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="setting-group">
                    <h3>Layout</h3>
                    <label class="setting-item">
                        <span>Show Section Icons</span>
                        <input type="checkbox" id="showSectionIcons" ${this.settings.showSectionIcons ? 'checked' : ''}>
                    </label>
                    <label class="setting-item">
                        <span>Enable Animations</span>
                        <input type="checkbox" id="enableAnimations" ${this.settings.enableAnimations ? 'checked' : ''}>
                    </label>
                    <label class="setting-item">
                        <span>Cards per Row: ${this.settings.cardsPerRow}</span>
                        <input type="range" id="cardsPerRow" min="1" max="4" value="${this.settings.cardsPerRow}">
                    </label>
                </div>
            </div>
        `;
    }
    
    createFeaturesTab() {
        return `
            <div class="tab-content" id="features-tab">
                <div class="setting-group">
                    <h3>Dashboard Sections</h3>
                    ${this.createToggleSetting('showAdvancedMetrics', '📊 Advanced Metrics')}
                    ${this.createToggleSetting('showWorkerPerformance', '⚡ Worker Performance')}
                    ${this.createToggleSetting('showBitcoinPrice', '₿ Bitcoin Price')}
                    ${this.createToggleSetting('showAnalyticsPreview', '📈 Analytics Preview')}
                    ${this.createToggleSetting('showProfitabilityCards', '💰 Profitability Cards')}
                    ${this.createToggleSetting('showOddsSection', '🎲 Block Discovery Odds')}
                    ${this.createToggleSetting('showChartsSection', '📊 Charts Section')}
                    ${this.createToggleSetting('showWorkerTable', '👷 Worker Table')}
                </div>
                
                <div class="setting-group">
                    <h3>Quick Actions</h3>
                    <button onclick="app.hideAllAdvanced()" class="btn secondary">Hide All Advanced Features</button>
                    <button onclick="app.showAllFeatures()" class="btn secondary">Show All Features</button>
                </div>
            </div>
        `;
    }
    
    createDisplayTab() {
        return `
            <div class="tab-content" id="display-tab">
                <div class="setting-group">
                    <h3>Units</h3>
                    <label class="setting-item">
                        <span>Hashrate Unit</span>
                        <select id="preferredHashrateUnit">
                            <option value="gigahash" ${this.settings.preferredHashrateUnit === 'gigahash' ? 'selected' : ''}>GH/s</option>
                            <option value="terahash" ${this.settings.preferredHashrateUnit === 'terahash' ? 'selected' : ''}>TH/s</option>
                            <option value="petahash" ${this.settings.preferredHashrateUnit === 'petahash' ? 'selected' : ''}>PH/s</option>
                            <option value="exahash" ${this.settings.preferredHashrateUnit === 'exahash' ? 'selected' : ''}>EH/s</option>
                        </select>
                    </label>
                    <label class="setting-item">
                        <span>Currency</span>
                        <select id="preferredCurrency">
                            <option value="usd" ${this.settings.preferredCurrency === 'usd' ? 'selected' : ''}>$ USD</option>
                            <option value="eur" ${this.settings.preferredCurrency === 'eur' ? 'selected' : ''}>€ EUR</option>
                            <option value="gbp" ${this.settings.preferredCurrency === 'gbp' ? 'selected' : ''}>£ GBP</option>
                            <option value="btc" ${this.settings.preferredCurrency === 'btc' ? 'selected' : ''}>₿ BTC</option>
                        </select>
                    </label>
                </div>
                
                <div class="setting-group">
                    <h3>Time & Dates</h3>
                    ${this.createToggleSetting('showRelativeTimes', 'Show Relative Times')}
                    ${this.createToggleSetting('use24HourFormat', 'Use 24-Hour Format')}
                </div>
            </div>
        `;
    }
    
    createNotificationsTab() {
        return `
            <div class="tab-content" id="notifications-tab">
                <div class="setting-group">
                    <h3>Smart Notifications</h3>
                    ${this.createToggleSetting('enableSmartNotifications', 'Enable Smart Notifications')}
                    ${this.createToggleSetting('notificationSummaryEnabled', 'Notification Summary')}
                </div>
            </div>
        `;
    }
    
    createPrivacyTab() {
        return `
            <div class="tab-content" id="privacy-tab">
                <div class="setting-group">
                    <h3>Data Collection</h3>
                    ${this.createToggleSetting('enableDataCollection', 'Enable Analytics')}
                    ${this.createToggleSetting('shareAnonymousMetrics', 'Share Anonymous Metrics')}
                </div>
                
                <div class="setting-group">
                    <h3>Data Management</h3>
                    ${this.createToggleSetting('automaticBackup', 'Automatic Backup')}
                    <label class="setting-item">
                        <span>Data Retention: ${this.settings.dataRetentionDays} days</span>
                        <input type="range" id="dataRetentionDays" min="7" max="90" step="7" value="${this.settings.dataRetentionDays}">
                    </label>
                </div>
            </div>
        `;
    }
    
    createAdvancedTab() {
        return `
            <div class="tab-content" id="advanced-tab">
                <div class="setting-group">
                    <h3>Performance</h3>
                    <label class="setting-item">
                        <span>Refresh Interval</span>
                        <select id="refreshInterval">
                            <option value="thirtySeconds" ${this.settings.refreshInterval === 'thirtySeconds' ? 'selected' : ''}>30 seconds</option>
                            <option value="oneMinute" ${this.settings.refreshInterval === 'oneMinute' ? 'selected' : ''}>1 minute</option>
                            <option value="twoMinutes" ${this.settings.refreshInterval === 'twoMinutes' ? 'selected' : ''}>2 minutes</option>
                            <option value="fiveMinutes" ${this.settings.refreshInterval === 'fiveMinutes' ? 'selected' : ''}>5 minutes</option>
                        </select>
                    </label>
                    ${this.createToggleSetting('enableBackgroundRefresh', 'Background Refresh')}
                </div>
                
                <div class="setting-group">
                    <h3>Developer</h3>
                    ${this.createToggleSetting('debugMode', 'Debug Mode')}
                    ${this.createToggleSetting('enableBetaFeatures', 'Beta Features')}
                </div>
            </div>
        `;
    }
    
    createToggleSetting(id, label) {
        return `
            <label class="setting-item">
                <span>${label}</span>
                <input type="checkbox" id="${id}" ${this.settings[id] ? 'checked' : ''}>
            </label>
        `;
    }
    
    getColorValue(color) {
        const colors = {
            orange: '#f59e0b',
            blue: '#3b82f6',
            green: '#10b981',
            purple: '#8b5cf6',
            red: '#ef4444',
            mint: '#06d6a0'
        };
        return colors[color] || colors.orange;
    }
    
    setupSettingsEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            });
        });
        
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.settings.accentColor = option.dataset.color;
                this.applySettings();
            });
        });
        
        // Setting inputs
        document.querySelectorAll('#settingsModal input, #settingsModal select').forEach(input => {
            input.addEventListener('change', () => {
                const value = input.type === 'checkbox' ? input.checked : 
                             input.type === 'range' ? parseInt(input.value) : input.value;
                this.settings[input.id] = value;
                this.applySettings();
                
                // Update range display
                if (input.type === 'range') {
                    const label = input.parentElement.querySelector('span');
                    if (input.id === 'cardsPerRow') {
                        label.textContent = `Cards per Row: ${value}`;
                    } else if (input.id === 'dataRetentionDays') {
                        label.textContent = `Data Retention: ${value} days`;
                    }
                }
            });
        });
    }
    
    updateRefreshInterval() {
        const intervals = {
            thirtySeconds: 30,
            oneMinute: 60,
            twoMinutes: 120,
            fiveMinutes: 300
        };
        
        const newInterval = intervals[this.settings.refreshInterval] || 60;
        if (app && app.refreshInterval !== newInterval) {
            app.refreshInterval = newInterval;
            app.countdown = newInterval;
            // Restart timer if needed
            if (app.startTimer) {
                app.startTimer();
            }
        }
    }
}

// Global methods for settings
window.openSettingsModal = function() {
    if (!document.getElementById('settingsModal')) {
        app.settingsManager.createSettingsModal();
    }
    document.getElementById('settingsModal').style.display = 'block';
};

window.closeSettingsModal = function() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.saveSettingsAndClose = function() {
    app.settingsManager.saveSettings();
    app.settingsManager.updateRefreshInterval();
    closeSettingsModal();
    app.showNotification('Settings Saved', 'Your preferences have been saved successfully.');
};

window.resetSettings = function() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        localStorage.removeItem('enhancedSettings');
        app.settingsManager = new EnhancedSettingsManager();
        closeSettingsModal();
        app.showNotification('Settings Reset', 'All settings have been reset to defaults.');
    }
};

window.hideAllAdvanced = function() {
    const advancedFeatures = ['showAdvancedMetrics', 'showWorkerPerformance', 'showAnalyticsPreview', 'showProfitabilityCards', 'showOddsSection'];
    advancedFeatures.forEach(feature => {
        app.settingsManager.settings[feature] = false;
        const checkbox = document.getElementById(feature);
        if (checkbox) checkbox.checked = false;
    });
    app.settingsManager.applySettings();
};

window.showAllFeatures = function() {
    const allFeatures = ['showAdvancedMetrics', 'showWorkerPerformance', 'showBitcoinPrice', 'showAnalyticsPreview', 'showProfitabilityCards', 'showOddsSection', 'showChartsSection', 'showWorkerTable'];
    allFeatures.forEach(feature => {
        app.settingsManager.settings[feature] = true;
        const checkbox = document.getElementById(feature);
        if (checkbox) checkbox.checked = true;
    });
    app.settingsManager.applySettings();
};