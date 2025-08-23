// Enhanced Settings Manager
class EnhancedSettingsManager {
    constructor() {
        this.settings = {
            // Appearance
            isDarkMode: false,
            useCompactLayout: false,
            accentColor: 'orange',
            enableAnimations: true,
            
            // Display Features
            showAdvancedMetrics: true,
            showWorkerPerformance: true,
            showBitcoinPrice: true,
            showAnalyticsPreview: true,
            showMiningActivity: true,
            showProfitabilityCards: true,
            showOddsSection: true,
            showChartsSection: true,
            showWorkerTable: true,
            
            // Layout
            dashboardLayout: 'standard',
            cardsPerRow: 'auto',
            showSectionIcons: true,
            
            // Units and Formatting
            preferredHashrateUnit: 'terahash',
            preferredCurrency: 'usd',
            showRelativeTimes: true,
            use24HourFormat: false,
            
            // Notifications
            enableSmartNotifications: true,
            notificationSummaryEnabled: true,
            
            // Data and Privacy
            enableDataCollection: false,
            shareAnonymousMetrics: false,
            automaticBackup: true,
            dataRetentionDays: 30,
            
            // Performance
            refreshInterval: 60,
            enableBackgroundRefresh: true,
            
            // Development
            debugMode: false,
            enableBetaFeatures: false
        };
        
        this.observers = [];
        this.initializationComplete = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.loadSettings();
        this.applySettings();
        this.initializationComplete = true;
        this.notifyObservers('initialized');
        console.log('⚙️ Settings Manager initialized');
    }
    
    // Settings Management
    loadSettings() {
        const stored = localStorage.getItem('enhancedSettings');
        if (stored) {
            try {
                const parsedSettings = JSON.parse(stored);
                this.settings = { ...this.settings, ...parsedSettings };
                console.log('📥 Settings loaded from localStorage');
            } catch (e) {
                console.error('Failed to load settings:', e);
                this.resetToDefaults();
            }
        } else {
            console.log('🆕 Using default settings');
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('enhancedSettings', JSON.stringify(this.settings));
            this.applySettings();
            this.notifyObservers('settingsChanged', this.settings);
            console.log('💾 Settings saved');
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
    
    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            const oldValue = this.settings[key];
            this.settings[key] = value;
            this.saveSettings();
            this.notifyObservers('settingChanged', { key, oldValue, newValue: value });
            return true;
        } else {
            console.warn(`Setting '${key}' does not exist`);
            return false;
        }
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    getAllSettings() {
        return { ...this.settings };
    }
    
    resetToDefaults() {
        const defaultSettings = {
            isDarkMode: false,
            useCompactLayout: false,
            accentColor: 'orange',
            enableAnimations: true,
            showAdvancedMetrics: true,
            showWorkerPerformance: true,
            showBitcoinPrice: true,
            showAnalyticsPreview: true,
            showMiningActivity: true,
            enableSmartNotifications: true,
            refreshInterval: 60
        };
        
        this.settings = { ...this.settings, ...defaultSettings };
        this.saveSettings();
        this.notifyObservers('settingsReset');
        console.log('🔄 Settings reset to defaults');
    }
    
    // Apply settings to the UI
    applySettings() {
        if (!document.body) {
            setTimeout(() => this.applySettings(), 100);
            return;
        }
        
        // Apply theme
        this.applyTheme();
        
        // Apply layout
        this.applyLayout();
        
        // Apply section visibility
        this.toggleSectionVisibility();
        
        // Apply animations
        this.applyAnimationSettings();
        
        // Apply accent color
        this.applyAccentColor();
    }
    
    applyTheme() {
        document.body.classList.toggle('dark-mode', this.settings.isDarkMode);
        
        // Update meta theme color for mobile browsers
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }
        
        themeColorMeta.content = this.settings.isDarkMode ? '#1f2937' : '#667eea';
    }
    
    applyLayout() {
        document.body.classList.toggle('compact-layout', this.settings.useCompactLayout);
        
        // Apply cards per row setting
        const cardsPerRow = this.settings.cardsPerRow;
        if (cardsPerRow !== 'auto') {
            document.documentElement.style.setProperty(
                '--cards-per-row', 
                `repeat(${cardsPerRow}, 1fr)`
            );
        } else {
            document.documentElement.style.setProperty(
                '--cards-per-row', 
                'repeat(auto-fit, minmax(200px, 1fr))'
            );
        }
    }
    
    applyAnimationSettings() {
        document.body.classList.toggle('animations-disabled', !this.settings.enableAnimations);
        
        if (!this.settings.enableAnimations) {
            // Add CSS to disable all animations
            let style = document.getElementById('disable-animations-style');
            if (!style) {
                style = document.createElement('style');
                style.id = 'disable-animations-style';
                style.textContent = `
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        transition-delay: 0ms !important;
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            const style = document.getElementById('disable-animations-style');
            if (style) {
                style.remove();
            }
        }
    }
    
    applyAccentColor() {
        const accentColor = this.getAccentColorValue();
        document.documentElement.style.setProperty('--accent-color', accentColor);
        
        // Also set related color variations
        const rgb = this.hexToRgb(accentColor);
        if (rgb) {
            document.documentElement.style.setProperty(
                '--accent-color-light', 
                `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
            );
            document.documentElement.style.setProperty(
                '--accent-color-hover', 
                `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
            );
        }
    }
    
    getAccentColorValue() {
        const colors = {
            orange: '#f59e0b',
            blue: '#3b82f6',
            green: '#10b981',
            purple: '#8b5cf6',
            red: '#ef4444',
            mint: '#06d6a0',
            pink: '#ec4899',
            indigo: '#6366f1',
            yellow: '#eab308',
            teal: '#14b8a6'
        };
        return colors[this.settings.accentColor] || colors.orange;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    toggleSectionVisibility() {
        // Since we moved everything to tabs, this method now just handles the Bitcoin price on main screen
        // Bitcoin price is now shown directly in the main render if enabled
        if (window.app && typeof window.app.render === 'function') {
            // Trigger a re-render to show/hide Bitcoin price section
            window.app.render();
        }
    }
    
    // Observer pattern for settings changes
    addObserver(callback) {
        this.observers.push(callback);
    }
    
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }
    
    notifyObservers(event, data = null) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                console.error('Observer callback error:', e);
            }
        });
    }
    
    // Import/Export settings
    exportSettings() {
        const exportData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            settings: this.settings
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mining-dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📤 Settings exported');
        return exportData;
    }
    
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (importData.settings) {
                        // Validate settings
                        const validatedSettings = this.validateImportedSettings(importData.settings);
                        this.settings = { ...this.settings, ...validatedSettings };
                        this.saveSettings();
                        console.log('📥 Settings imported successfully');
                        resolve(validatedSettings);
                    } else {
                        reject(new Error('Invalid settings file format'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse settings file: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    validateImportedSettings(importedSettings) {
        const validatedSettings = {};
        
        // Only import settings that exist in our schema
        Object.keys(this.settings).forEach(key => {
            if (importedSettings.hasOwnProperty(key)) {
                // Type validation
                const expectedType = typeof this.settings[key];
                const importedType = typeof importedSettings[key];
                
                if (expectedType === importedType) {
                    validatedSettings[key] = importedSettings[key];
                } else {
                    console.warn(`Setting '${key}' type mismatch: expected ${expectedType}, got ${importedType}`);
                }
            }
        });
        
        return validatedSettings;
    }
    
    // Utility methods
    isDarkMode() {
        return this.settings.isDarkMode;
    }
    
    getRefreshInterval() {
        return this.settings.refreshInterval * 1000; // Convert to milliseconds
    }
    
    isAnimationsEnabled() {
        return this.settings.enableAnimations;
    }
    
    isNotificationsEnabled() {
        return this.settings.enableSmartNotifications;
    }
    
    // Debug methods
    debugInfo() {
        return {
            settings: this.settings,
            observers: this.observers.length,
            initialized: this.initializationComplete,
            localStorage: !!localStorage.getItem('enhancedSettings')
        };
    }
}