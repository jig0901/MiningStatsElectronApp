// Bitcoin Price Manager
class BitcoinPriceManager {
    constructor() {
        this.currentPrice = null;
        this.priceHistory = [];
        this.isLoading = false;
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        this.loadStoredData();
        this.fetchBitcoinPrice();
        // Fetch price every 5 minutes
        this.updateInterval = setInterval(() => this.fetchBitcoinPrice(), 300000);
    }
    
    async fetchBitcoinPrice() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.bitcoin) {
                throw new Error('Invalid API response format');
            }
            
            this.currentPrice = {
                price: data.bitcoin.usd,
                change24h: data.bitcoin.usd_24h_change,
                timestamp: new Date()
            };
            
            this.priceHistory.push(this.currentPrice);
            
            // Keep only last 100 price points
            if (this.priceHistory.length > 100) {
                this.priceHistory.shift();
            }
            
            this.savePriceHistory();
            this.updatePriceDisplay();
            
            // Trigger price alert if significant change
            this.checkPriceAlerts();
            
        } catch (error) {
            console.error('Failed to fetch Bitcoin price:', error);
            this.handleFetchError(error);
        } finally {
            this.isLoading = false;
        }
    }
    
    checkPriceAlerts() {
        if (!this.currentPrice || this.priceHistory.length < 2) return;
        
        const previousPrice = this.priceHistory[this.priceHistory.length - 2];
        const changePercent = Math.abs(this.currentPrice.change24h);
        
        // Alert on significant price movements (>5% in 24h)
        if (changePercent > 5 && window.miningActivityManager) {
            const direction = this.currentPrice.change24h > 0 ? 'increased' : 'decreased';
            window.miningActivityManager.addActivity(
                'price',
                `💰 Bitcoin ${direction} by ${changePercent.toFixed(1)}% to $${this.currentPrice.price.toLocaleString()}`,
                {
                    price: this.currentPrice.price,
                    change: this.currentPrice.change24h
                }
            );
        }
    }
    
    handleFetchError(error) {
        // Show error in display if no cached data
        if (!this.currentPrice) {
            const container = document.getElementById('bitcoin-price-section');
            if (container) {
                container.innerHTML = `
                    <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div class="section-title">₿ Bitcoin Price</div>
                        <div style="text-align: center; color: #ef4444; padding: 20px;">
                            <div>⚠️ Failed to load price data</div>
                            <div style="font-size: 12px; margin-top: 8px;">${error.message}</div>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    updatePriceDisplay() {
        const container = document.getElementById('bitcoin-price-section');
        if (!container || !this.currentPrice) return;
        
        const changeColor = this.currentPrice.change24h >= 0 ? '#10b981' : '#ef4444';
        const changePrefix = this.currentPrice.change24h >= 0 ? '+' : '';
        const changeIcon = this.currentPrice.change24h >= 0 ? '📈' : '📉';
        
        // Format last update time
        const lastUpdate = this.currentPrice.timestamp.toLocaleTimeString();
        
        container.innerHTML = `
            <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>₿ Bitcoin Price</span>
                    <span style="font-size: 12px; color: #6b7280; font-weight: normal;">
                        Updated: ${lastUpdate}
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">CURRENT PRICE</div>
                        <div style="font-size: 28px; font-weight: bold; color: #1f2937;">
                            $${this.currentPrice.price.toLocaleString()}
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">24H CHANGE</div>
                        <div style="font-size: 20px; font-weight: bold; color: ${changeColor}; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <span>${changeIcon}</span>
                            <span>${changePrefix}${this.currentPrice.change24h.toFixed(2)}%</span>
                        </div>
                    </div>
                    
                    ${this.priceHistory.length > 1 ? `
                        <div style="text-align: center;">
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">PRICE TREND</div>
                            <div style="font-size: 16px; font-weight: 600;">
                                ${this.getPriceTrend()}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${this.priceHistory.length > 5 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6b7280;">
                            <span>Recent High: $${this.getRecentHigh().toLocaleString()}</span>
                            <span>Recent Low: $${this.getRecentLow().toLocaleString()}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    getPriceTrend() {
        if (this.priceHistory.length < 3) return '📊 Analyzing...';
        
        const recent = this.priceHistory.slice(-3);
        const isRising = recent[2].price > recent[1].price && recent[1].price > recent[0].price;
        const isFalling = recent[2].price < recent[1].price && recent[1].price < recent[0].price;
        
        if (isRising) return '🚀 Rising';
        if (isFalling) return '📉 Falling';
        return '➡️ Stable';
    }
    
    getRecentHigh() {
        const recentPrices = this.priceHistory.slice(-20).map(p => p.price);
        return Math.max(...recentPrices);
    }
    
    getRecentLow() {
        const recentPrices = this.priceHistory.slice(-20).map(p => p.price);
        return Math.min(...recentPrices);
    }
    
    loadStoredData() {
        const stored = localStorage.getItem('bitcoinPriceHistory');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.priceHistory = data.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                this.currentPrice = this.priceHistory[this.priceHistory.length - 1] || null;
                
                // If data is old (>10 minutes), clear current price to force refresh
                if (this.currentPrice && 
                    (new Date() - this.currentPrice.timestamp) > 600000) {
                    this.currentPrice = null;
                }
            } catch (e) {
                console.error('Failed to load price history:', e);
                this.priceHistory = [];
                this.currentPrice = null;
            }
        }
    }
    
    savePriceHistory() {
        try {
            localStorage.setItem('bitcoinPriceHistory', JSON.stringify(this.priceHistory));
        } catch (e) {
            console.error('Failed to save price history:', e);
        }
    }
    
    // Get price data for other components
    getCurrentPrice() {
        return this.currentPrice;
    }
    
    getPriceHistory() {
        return this.priceHistory;
    }
    
    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}