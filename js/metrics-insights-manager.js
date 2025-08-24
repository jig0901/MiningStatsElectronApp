
// metrics-insights-manager.js
// Compact dashboard insights derived from the /metrics API
// Exports a global: window.MetricsInsightsManager

class MetricsInsightsManager {
  constructor() {
    this.latest = null;
    this.targetEl = null;
  }

  update(data, previous = null) {
    if (!data) return;
    const now = new Date();

    // Pool-level basics
    const pool = data.pool || {};
    const accepted = Number(pool.accepted || data.accepted_shares || 0);
    const rejected = Number(pool.rejected || 0);
    const acceptRate = (accepted + rejected) > 0 ? accepted / (accepted + rejected) : 1;

    // Shares/sec windows (fallback to recent_shares estimate if 1m not present)
    const sps = {
      '1m': this.numberOr(pool.SPS1m, null),
      '5m': this.numberOr(pool.SPS5m, null),
      '15m': this.numberOr(pool.SPS15m, null),
      '1h': this.numberOr(pool.SPS1h, null)
    };
    if (!sps['1m']) {
      sps['1m'] = this.estimateSPSFromRecentShares(data.recent_shares, 60);
    }

    // Last share age
    const lastShareAgeSec = this.computeLastShareAgeSeconds(data.last_share_time, now);

    // Hashrate momentum (pool windows in TH/s)
    const hw = {
      m1: this.numberOr(data.hashrate_1min_ths, 0),
      m5: this.numberOr(data.hashrate_5min_ths, 0),
      h1: this.numberOr(data.hashrate_1hr_ths, 0),
      d1: this.numberOr(data.hashrate_1d_ths, 0),
      d7: this.numberOr(data.hashrate_7d_ths, 0)
    };
    const sr = (a,b) => (b ? a/b : 0);
    const momentum = {
      m1_vs_h1: sr(hw.m1, hw.h1),   // >1 rising, <1 falling
      h1_vs_d1: sr(hw.h1, hw.d1),
      d1_vs_d7: sr(hw.d1, hw.d7),
      volatility: this.windowSpread([hw.m1, hw.h1, hw.d1].filter(x => x > 0))
    };

    // Worker health
    const workers = Array.isArray(data.workers) ? data.workers : [];
    const onlineCutoff = 180; // seconds considered "recent"
    const nowUnix = Math.floor(now.getTime() / 1000);
    const onlineWorkers = workers.filter(w => {
      const last = Number(w.lastshare || 0);
      return last > 0 && (nowUnix - last) <= onlineCutoff;
    }).length;

    const workerTopBy1h = workers
      .map(w => ({ name: this.cleanWorkerName(w.workername), h1: this.parseHashrate(w.hashrate1hr || '0') }))
      .sort((a, b) => b.h1 - a.h1)
      .slice(0, 3);

    const workerTopByBestShare = workers
      .map(w => ({ name: this.cleanWorkerName(w.workername), best: Number(w.bestever || w.bestshare || 0) }))
      .sort((a, b) => b.best - a.best)
      .slice(0, 3);

    // Share contribution in last minute (from recent_shares)
    const lastMinuteByWorker = this.sharesByWorkerWithin(data.recent_shares, nowUnix, 60);
    const topContrib = Object.entries(lastMinuteByWorker)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Block odds & ETA (approximate)
    const odds = {
      h24: Number(data.odds_24hr_percent || 0) / 100,
      d7: Number(data.odds_7d_percent || 0) / 100,
      d30: Number(data.odds_30d_percent || 0) / 100,
      y1: Number(data.odds_1yr_percent || 0) / 100
    };
    const eta = {
      h24: this.etaFromProb(24, odds.h24, 'hours'),
      d7: this.etaFromProb(7, odds.d7, 'days'),
      d30: this.etaFromProb(30, odds.d30, 'days'),
      y1: this.etaFromProb(365, odds.y1, 'days')
    };

    // Energy outlook (ComEd)
    const priceSeries = Array.isArray(data.comed_future_prices) ? data.comed_future_prices : [];
    const energy = this.energyOutlook(priceSeries);

    // Idle / disconnected from pool
    const idle = Number(pool.idle || 0);
    const disconnected = Number(pool.disconnected || 0);
    const totalWorkers = Number(pool.workers || data.worker_count || workers.length || 0);

    this.latest = {
      now,
      acceptRate,
      sps,
      lastShareAgeSec,
      hw, momentum,
      workers: {
        total: totalWorkers,
        online: onlineWorkers,
        idle,
        disconnected,
        topBy1h: workerTopBy1h,
        topByBest: workerTopByBestShare,
        topContribLastMin: topContrib
      },
      odds, eta,
      energy
    };

    if (this.targetEl) this.renderInto(this.targetEl);
  }

  render(targetId = 'metrics-insights') {
    const host = document.getElementById(targetId);
    if (!host) return;
    this.targetEl = host;
    this.renderInto(host);
  }

  renderInto(host) {
    const s = this.latest;
    if (!s) {
      host.innerHTML = `
        <div class="section" style="background:white;border-radius:12px;padding:20px;">
          <div class="section-title">📌 Insights</div>
          <div style="color:#6b7280">Waiting for data…</div>
        </div>`;
      return;
    }

    const fmtPct = (x, d=1) => (x*100).toFixed(d) + '%';
    const fmt = (x,d=1) => (x ?? 0).toFixed(d);
    const trend = (r) => r > 1.03 ? '⬆️' : (r < 0.97 ? '⬇️' : '⟷');

    host.innerHTML = `
      <div class="section" style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div class="section-title" style="display:flex;justify-content:space-between;align-items:center;">
          <span>📌 Insights</span>
          <span style="font-size:12px;color:#6b7280;">Updated ${s.now.toLocaleTimeString()}</span>
        </div>

        <!-- Row 1: Share Flow / Hashrate Momentum -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:12px;">
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
            <div style="font-weight:600;margin-bottom:8px;">Share Flow</div>
            <div>SPS (1m/5m/15m/1h): <b>${fmt(s.sps['1m'],2)}</b> / ${fmt(s.sps['5m'],2)} / ${fmt(s.sps['15m'],2)} / ${fmt(s.sps['1h'],2)}</div>
            <div>Accept rate: <b>${fmtPct(s.acceptRate)}</b></div>
            <div>Last share: <b>${this.ago(s.lastShareAgeSec)}</b></div>
            ${s.workers.topContribLastMin.length ? `
            <div style="margin-top:6px;font-size:12px;color:#6b7280;">Top contributors (last 60s):
              ${s.workers.topContribLastMin.map(w=>`${w.name} (${w.count})`).join(', ')}
            </div>` : ``}
          </div>

          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
            <div style="font-weight:600;margin-bottom:8px;">Hashrate Momentum</div>
            <div>1m vs 1h: <b>${trend(s.momentum.m1_vs_h1)} ${fmt(s.momentum.m1_vs_h1,2)}×</b></div>
            <div>1h vs 1d: <b>${trend(s.momentum.h1_vs_d1)} ${fmt(s.momentum.h1_vs_d1,2)}×</b></div>
            <div>1d vs 7d: <b>${trend(s.momentum.d1_vs_d7)} ${fmt(s.momentum.d1_vs_d7,2)}×</b></div>
            <div>Volatility (1m/1h/1d spread): <b>${fmt(s.momentum.volatility,2)}%</b></div>
          </div>
        </div>

        <!-- Row 2: Worker Health / Energy Outlook -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:12px;">
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
            <div style="font-weight:600;margin-bottom:8px;">Worker Health</div>
            <div>Online: <b>${s.workers.online}</b> / ${s.workers.total}</div>
            <div>Idle: <b>${s.workers.idle}</b>, Disconnected: <b>${s.workers.disconnected}</b></div>
            <div style="margin-top:6px;font-size:12px;color:#6b7280;">
              Top by 1h: ${s.workers.topBy1h.map(w=>`${w.name} (${fmt(w.h1,2)} TH/s)`).join(', ')}
            </div>
            <div style="margin-top:4px;font-size:12px;color:#6b7280;">
              Top by Best: ${s.workers.topByBest.map(w=>`${this.escapeHtml(w.name)} (${this.shortNumber(w.best)})`).join(', ')}
            </div>
          </div>

          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
            <div style="font-weight:600;margin-bottom:8px;">Energy Outlook (ComEd)</div>
            ${s.energy
              ? `<div>Next trough: <b>${s.energy.next?.time || '--:--'}</b> at <b>${s.energy.next?.price ?? '--'}</b>¢/kWh</div>
                 <div>Avg next hour: <b>${s.energy.avgNextHour ?? '--'}</b>¢/kWh</div>
                 ${s.energy.hasNegative ? `<div style="color:#10b981;margin-top:4px;">⚡ Negative pricing window ahead</div>` : ``}`
              : `<div style="color:#6b7280;">No price forecast available</div>`}
          </div>
        </div>

        <!-- Row 3: Block Odds -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:12px;">
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
            <div style="font-weight:600;margin-bottom:8px;">Block Odds & ETA</div>
            <div>24h: ${fmtPct(s.odds.h24)} (ETA ~ ${s.eta.h24})</div>
            <div>7d: ${fmtPct(s.odds.d7)} (ETA ~ ${s.eta.d7})</div>
            <div>30d: ${fmtPct(s.odds.d30)} (ETA ~ ${s.eta.d30})</div>
            <div>1y: ${fmtPct(s.odds.y1)} (ETA ~ ${s.eta.y1})</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- Helpers ---------- */

  numberOr(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  estimateSPSFromRecentShares(recent, secs=60) {
    if (!Array.isArray(recent) || !recent.length) return null;
    const now = Math.floor(Date.now()/1000);
    const count = recent.filter(s => Number(s.ts) && (now - Number(s.ts)) <= secs).length;
    return count / secs;
  }

  computeLastShareAgeSeconds(lastShareTimeStr, now) {
    if (!lastShareTimeStr) return null;
    // API format: "YYYY-MM-DD HH:mm:ss"
    const t = new Date((lastShareTimeStr || '').replace(' ', 'T') + 'Z'); // treat as UTC
    if (!isNaN(t.getTime())) return Math.max(0, Math.floor((now - t)/1000));
    return null;
  }

  sharesByWorkerWithin(recent, nowUnix, secs) {
    if (!Array.isArray(recent)) return {};
    const cutoff = nowUnix - secs;
    const map = {};
    for (const s of recent) {
      const ts = Number(s.ts || 0);
      if (ts >= cutoff) {
        const name = this.cleanWorkerName(s.workername || 'unknown');
        map[name] = (map[name] || 0) + 1;
      }
    }
    return map;
  }

  etaFromProb(period, p, unit) {
    if (!p || p <= 0) return '∞';
    // Rough expectation: period / p (valid for small p)
    const val = period / p;
    if (unit === 'hours') return `${val.toFixed(1)} h`;
    if (unit === 'days') return `${val.toFixed(1)} d`;
    return val.toFixed(1);
  }

  energyOutlook(series) {
    if (!series || !series.length) return null;
    const parsed = series
      .map(x => ({ time: x.time, price: Number(x.price) }))
      .filter(x => Number.isFinite(x.price));

    if (!parsed.length) return null;

    const next = parsed.reduce((m, x) => (m == null || x.price < m.price ? x : m), null);
    const hasNegative = parsed.some(x => x.price < 0);

    // Average of first ~4 slots as a crude "next hour"
    const avgNextHour = (parsed.slice(0, 4).reduce((s, x) => s + x.price, 0) / Math.max(1, Math.min(4, parsed.length))).toFixed(2);

    return { next, hasNegative, avgNextHour };
  }

  parseHashrate(s) {
    if (!s) return 0;
    const m = String(s).trim().match(/^([\d.]+)\s*([kKmMgGtTpP]?)[hH]?$/);
    if (!m) return Number(s) || 0;
    const val = Number(m[1]);
    const unit = (m[2] || '').toUpperCase();
    const mult = unit === 'P' ? 1e6 : unit === 'T' ? 1e3 : unit === 'G' ? 1 : unit === 'M' ? 1e-3 : unit === 'K' ? 1e-6 : 0;
    return val * mult; // TH/s
  }

  windowSpread(arr) {
    if (!arr || arr.length < 2) return 0;
    const max = Math.max(...arr), min = Math.min(...arr);
    if (max <= 0) return 0;
    return ((max - min) / max) * 100;
  }

  cleanWorkerName(name) {
    if (!name) return '';
    const idx = name.indexOf('.');
    return idx > 0 ? name.slice(idx + 1) : name;
  }

  shortNumber(n) {
    const abs = Math.abs(n);
    if (abs >= 1e12) return (n/1e12).toFixed(2) + 'T';
    if (abs >= 1e9)  return (n/1e9).toFixed(2) + 'B';
    if (abs >= 1e6)  return (n/1e6).toFixed(2) + 'M';
    if (abs >= 1e3)  return (n/1e3).toFixed(2) + 'k';
    return String(Math.round(n));
  }

  ago(secs) {
    if (secs == null) return '--';
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs/60), s = secs%60;
    return `${m}m ${s}s`;
  }

  escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
  }

  safeRatio(a, b) {
    if (!b) return 0;
    return a / b;
  }
}

// Expose globally
window.MetricsInsightsManager = MetricsInsightsManager;
