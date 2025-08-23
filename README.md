# Mining Stats - Electron App

A cross-platform desktop application for monitoring Belani Solo Mining statistics, built with Electron.

## Features

- ⚡ Real-time mining statistics dashboard
- 📊 Historical hashrate charts
- 👷 Worker monitoring and details
- 💡 ComEd electricity price tracking with color-coded tiers
- 🔔 Desktop notifications for important changes
- 🔄 Auto-refresh every 60 seconds
- 🖥️ Runs on Windows, macOS, and Linux

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Setup

1. Create a new directory for your app:
```bash
mkdir mining-stats-app
cd mining-stats-app
```

2. Save the provided files:
   - `index.html` - The main UI (save the HTML artifact content)
   - `main.js` - Electron main process
   - `package.json` - Project configuration

3. Install dependencies:
```bash
npm install
```

## Running the App

### Development Mode
```bash
npm start
```

### With Dev Tools
```bash
npm run dev
```

## Building for Distribution

### Build for Current Platform
```bash
npm run dist
```

### Build for Specific Platforms

**Windows:**
```bash
npm run build-win
```
This creates:
- `.exe` installer in `dist/`
- Portable `.exe` version

**macOS:**
```bash
npm run build-mac
```
This creates:
- `.dmg` installer in `dist/`
- `.zip` archive

**Linux:**
```bash
npm run build-linux
```
This creates:
- `.AppImage` in `dist/`
- `.deb` package

### Build for All Platforms
```bash
npm run build-all
```

## Adding Icons

For a professional appearance, add icon files to your project directory:

1. **Windows:** Create `icon.ico` (256x256 px)
2. **macOS:** Create `icon.icns` (512x512 px)
3. **Linux:** Create `icon.png` (512x512 px)

You can use online converters to create these from a single PNG image.

## File Structure

```
mining-stats-app/
├── index.html          # Main UI
├── main.js            # Electron main process
├── package.json       # Project configuration
├── icon.ico          # Windows icon (optional)
├── icon.icns         # macOS icon (optional)
├── icon.png          # Linux icon (optional)
├── node_modules/     # Dependencies (after npm install)
└── dist/            # Built applications (after building)
```

## Configuration

The app connects to the API endpoint: `https://www.belanifamily.com/metrics`

To modify the refresh interval, edit the `refreshInterval` value in `index.html`:
```javascript
this.refreshInterval = 60; // seconds
```

## Features in Detail

### Dashboard Cards
- **Worker Count:** Number of active mining workers
- **ComEd Price:** Current electricity price (clickable to open pricing website)
  - Green: ≤4¢ per kWh
  - Orange: 4-9¢ per kWh  
  - Red: >9¢ per kWh
- **Last Share:** Time of the most recent share submission
- **Total Shares:** Cumulative accepted shares
- **Best Share:** Highest difficulty share found

### Hashrate Monitoring
Displays hashrate averages over different time periods:
- 1 minute
- 5 minutes
- 1 hour
- 1 day
- 7 days

### Block Finding Odds
Probability of finding a block within:
- 24 hours
- 7 days
- 30 days
- 1 year

### Worker Details Table
Comprehensive view of each worker including:
- Worker name
- Hashrate over various periods
- Share count
- Best share difficulty

### Notifications
Desktop notifications trigger when:
- Worker count changes
- ComEd price tier changes (green/orange/red)

## Troubleshooting

### App won't start
- Ensure Node.js is installed: `node --version`
- Check all dependencies are installed: `npm install`
- Verify all files are in the correct location

### Build fails
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure you have sufficient permissions

### Notifications not working
- Check system notification permissions
- On macOS: System Preferences → Notifications
- On Windows: Settings → System → Notifications

## Development Tips

- Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac) to open Developer Tools
- The app auto-refreshes data every 60 seconds
- Click the refresh button to manually update
- All external links open in your default browser

## License

MIT

## Support

For issues or questions about the mining statistics, visit: https://www.belanifamily.com