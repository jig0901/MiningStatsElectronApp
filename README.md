# ⛏️ Belani Solo Mining — Fleet Dashboard & Analytics  

A lightweight, self-hosted **Electron + Web app** to monitor your Bitcoin solo mining fleet.  
It provides **real-time mining stats, analytics, worker performance tracking, block odds, and activity logging** — all in one dashboard UI.  

> ℹ️ **Backend required:** This dashboard consumes data from a separate backend that exposes a **secure Metrics API** and (optionally) runs a **self-hosted Stratum server**.  
> • **Metrics API + Proxy:** _Mining Metrics API project_ → **(replace with your repo URL)**  
> • **Stratum (CKPool fork used by the backend):** [jbelani/ckpool (Bitbucket fork with stratifier enhancements)](https://bitbucket.org/jbelani/ckpool/src/master/)

---

## 📖 Table of Contents
- [✨ Features](#-features)  
- [🚀 Quick Start](#-quick-start)  
- [🔌 Backend Integration](#-backend-integration)  
- [⚙️ Configuration](#%EF%B8%8F-configuration)  
- [📊 Metrics API Schema](#-metrics-api-schema)  
- [🖥️ UI Guide](#%EF%B8%8F-ui-guide)  
- [👨‍💻 Development Notes](#-development-notes)  
- [📦 Packaging](#-packaging)  
- [🛠️ Troubleshooting](#%EF%B8%8F-troubleshooting)  
- [🗺️ Roadmap](#%EF%B8%8F-roadmap)  
- [🤝 Contributing](#-contributing)  
- [📜 License](#-license)  
- [🖼️ Screenshots](#%EF%B8%8F-screenshots)

---

## ✨ Features  

### 📡 Live Overview
- Worker count, best share, total shares, last share time  
- ⚡ ComEd future price integration (if enabled in backend API)  
- 🔄 Auto-refresh with countdown  

### 📈 Hashrate & Odds
- Hashrate snapshots: **1m / 5m / 1h / 24h / 7d**  
- Block discovery odds: **24h, 1w, 1m, 1y**  

### 🎯 Performance Insights
- At-a-glance **Optimal / Under / Over / Avg Efficiency** chips  
- Click to drill into filtered **Performance** view  

### 👷 Worker Details
- Per-worker hashrate + efficiency  
- Status pills (**Online / Offline / High Rejects**)  
- Manage device URLs, export data  

### 🔎 Bitaxe Device Modal
- Auto-fetch stats (efficiency, thermals, power, Wi-Fi, firmware, uptime)  
- Quick actions: **Refresh / Open UI**  

### 📰 Activity Log
- Real-time mining activity & milestones  
- Worker up/down notifications  
- Share-found alerts  

### 📊 Analytics
- Share luck, total shares, average hashrate, efficiency  
- Recent changes tracked  

---

## 🚀 Quick Start

1. **Clone the repo**  
   ```bash
   git clone <your-repo-url>
   cd <your-repo>
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Run the app in development**  
   ```bash
   npm start
   ```

4. **(Optional) Build installers**  
   ```bash
   npm run build-win     # Windows
   npm run build-mac     # macOS
   npm run build-linux   # Linux
   npm run build-all     # All platforms
   ```

> ⚠️ Requires **Node.js v18+** and npm.

---

## 🔌 Backend Integration

This dashboard expects a backend service exposing a **Metrics API** (JSON).  
Point the app to your backend’s `/metrics` endpoint; the backend can live anywhere (LAN, VM, VPS).

- **Recommended backend:** _Mining Metrics API project_ → **(replace with your repo URL)**  
  - Provides `/metrics` and `/comed-prices` via a secure reverse proxy  
  - Optionally packages a **CKPool stratum server** (using the [jbelani/ckpool](https://bitbucket.org/jbelani/ckpool/src/master/) fork)

---

## ⚙️ Configuration  

- Set metrics API endpoint in **`mining-stats-app.js`**:  
  ```js
  this.apiURL = 'https://YOUR-API/metrics';
  ```
- Settings menu allows:
  - Refresh interval (30s / 60s / 2m / 5m)  
  - Dark mode, animations, Bitcoin price toggle  
  - Notification categories  

---

## 📊 Metrics API Schema  
*(Example response expected from the Metrics API service)*  
```json
{
  "worker_count": 9,
  "hashrate_1min_ths": 36.4,
  "best_shares": 51320000000,
  "comed_future_prices": [{ "price": "3.5" }],
  "odds_24hr_percent": 0.00047,
  "workers": [
    { "workername": "bitaxe_alpha", "hashrate1m": "1.82T", "shares": "133.03M" }
  ]
}
```

---

## 👨‍💻 Development Notes  
- Single-page app — global `statsUpdated` event syncs UI  
- Chart.js for historical hashrate  
- Worker URLs stored in **localStorage**  
- Suggested structure:
  ```
  / (repo root)
  ├─ index.html
  ├─ mining-stats-app.js
  ├─ app-init.js
  ├─ styles.css
  └─ assets/icons/
  ```

---

## 📦 Packaging  

### 🖥️ Electron
- Uses `electron-builder`  
- Set `"author.email"` in `package.json` (required for `.deb` builds)  
- Provide app icon  

### 📱 Android (optional)
- Cordova/Capacitor supported  
- Ensure `AndroidManifest.xml` package IDs match  

---

## 🛠️ Troubleshooting  
- ❌ **No data showing** → verify API URL & CORS on backend  
- ⚠️ **Notifications missing** → allow permissions + enable in Settings  
- 🐞 **Bitaxe errors** → open device UI directly or add reverse proxy  

---

## 🗺️ Roadmap  
- Group worker baselines  
- Enhanced performance heatmap  
- CSV/JSON export  
- New alert types (power/temp spikes)  
- Mobile UI refinements  

---

## 🤝 Contributing  
PRs/issues welcome. Please include:  
- OS / browser / API shape  
- Logs & screenshots  

---

## 📜 License  
MIT — attribution appreciated.  

---

## 🖼️ Screenshots  

![Mining Dashboard](./Screenshot%202025-08-23%20172254.png)  
![Worker Overview](./Screenshot%202025-08-23%20172315.png)  
![Worker Performance](./Screenshot%202025-08-24%20140446.png)  
![Worker Table](./Screenshot%202025-08-23%20172447.png)  
![Activity Log](./Screenshot%202025-08-23%20172518.png)  
![Analytics](./Screenshot%202025-08-23%20172548.png)  
![Bitaxe Modal](./Screenshot%202025-08-23%20172633.png)  
