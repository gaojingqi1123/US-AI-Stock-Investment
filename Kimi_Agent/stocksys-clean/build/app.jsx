const {useState, useEffect, useMemo} = React;

// ==================== DATA ====================
const INDICES = {
  "^GSPC": {name: "S&P 500", price: 7537.43, prev: 7483.24, change: 54.19, pct: 0.72, high: 7551.31, low: 7500.97, high52: 7620.90, low52: 6201.00},
  "^IXIC": {name: "NASDAQ", price: 26121.16, prev: 25832.67, change: 288.49, pct: 1.12, high: 26209.76, low: 25963.44, high52: 27190.21, low52: 20323.02},
  "^DJI": {name: "Dow Jones", price: 53055.91, prev: 52900.07, change: 155.84, pct: 0.29, high: 53060.10, low: 52648.69, high52: 53060.10, low52: 43340.68},
  "^VIX": {name: "VIX", price: 15.57, prev: 16.15, change: -0.58, pct: -3.59, high: 16.50, low: 15.56, high52: 35.30, low52: 13.38}
};

const STOCKS = {
  AAPL: {name: "Apple", price: 312.66, prev: 308.63, change: 4.03, pct: 1.31, high52: 317.40, low52: 201.50, pe: 37.8, cap: "4.59T", vol: "52.4M", avgVol: "48.2M", high: 314.18, low: 307.01, open: 307.68, ma5: 308.5, ma20: 301.2, ma60: 285.4, rsi: 52, macd: 1.2, macdSignal: 0.8, analyst: "买入"},
  MSFT: {name: "Microsoft", price: 386.74, prev: 390.49, change: -3.75, pct: -0.96, high52: 555.45, low52: 349.20, pe: 23.0, cap: "2.87T", vol: "22.1M", avgVol: "20.5M", high: 389.15, low: 381.22, open: 386.81, ma5: 388.2, ma20: 385.6, ma60: 400.3, rsi: 48, macd: -0.5, macdSignal: -0.3, analyst: "强烈买入"},
  NVDA: {name: "NVIDIA", price: 195.55, prev: 194.83, change: 0.72, pct: 0.37, high52: 236.54, low52: 157.34, pe: 29.9, cap: "4.74T", vol: "48.7M", avgVol: "42.1M", high: 197.55, low: 194.00, open: 194.39, ma5: 194.2, ma20: 188.5, ma60: 175.8, rsi: 55, macd: 2.1, macdSignal: 1.5, analyst: "买入"},
  GOOGL: {name: "Alphabet", price: 366.46, prev: 359.91, change: 6.55, pct: 1.82, high52: 408.61, low52: 172.77, pe: 28.0, cap: "4.47T", vol: "25.3M", avgVol: "22.8M", high: 367.93, low: 357.38, open: 361.93, ma5: 360.1, ma20: 352.4, ma60: 338.7, rsi: 58, macd: 3.2, macdSignal: 2.1, analyst: "买入"},
  AMZN: {name: "Amazon", price: 244.16, prev: 242.67, change: 1.49, pct: 0.61, high52: 278.56, low52: 196.00, pe: 31.8, cap: "2.63T", vol: "38.9M", avgVol: "35.2M", high: 246.04, low: 240.88, open: 243.80, ma5: 242.3, ma20: 238.1, ma60: 228.5, rsi: 54, macd: 1.8, macdSignal: 1.2, analyst: "买入"},
  META: {name: "Meta", price: 600.29, prev: 582.90, change: 17.39, pct: 2.98, high52: 796.25, low52: 520.26, pe: 21.8, cap: "1.52T", vol: "15.8M", avgVol: "14.2M", high: 603.58, low: 581.76, open: 594.84, ma5: 590.1, ma20: 578.3, ma60: 620.5, rsi: 62, macd: 5.4, macdSignal: 3.2, analyst: "强烈买入"},
  TSLA: {name: "Tesla", price: 419.77, prev: 393.45, change: 26.32, pct: 6.69, high52: 498.83, low52: 288.77, pe: 381.6, cap: "1.58T", vol: "98.5M", avgVol: "85.3M", high: 420.00, low: 390.50, open: 397.32, ma5: 395.2, ma20: 385.6, ma60: 365.4, rsi: 72, macd: 8.2, macdSignal: 5.1, analyst: "持有"},
  AMD: {name: "AMD", price: 552.05, prev: 517.82, change: 34.23, pct: 6.61, high52: 584.73, low52: 133.50, pe: 184.0, cap: "900B", vol: "55.2M", avgVol: "48.7M", high: 572.50, low: 527.04, open: 535.20, ma5: 520.1, ma20: 498.3, ma60: 450.2, rsi: 68, macd: 12.5, macdSignal: 8.3, analyst: "持有"}
};

const POSITIONS = {
  aggressive: [
    {ticker: "NVDA", shares: 350, cost: 138.50, price: 195.55},
    {ticker: "AAPL", shares: 520, cost: 218.00, price: 312.66},
    {ticker: "TSLA", shares: 180, cost: 318.00, price: 419.77},
    {ticker: "AMD", shares: 450, cost: 385.00, price: 552.05},
    {ticker: "META", shares: 95, cost: 458.00, price: 600.29},
    {ticker: "AMZN", shares: 220, cost: 168.00, price: 244.16},
    {ticker: "GOOGL", shares: 180, cost: 148.50, price: 366.46}
  ],
  stable: [
    {ticker: "MSFT", shares: 260, cost: 372.00, price: 386.74},
    {ticker: "QQQ", shares: 200, cost: 448.00, price: 487.00},
    {ticker: "SPY", shares: 150, cost: 512.00, price: 525.00}
  ],
  defensive: [
    {ticker: "BRK.B", shares: 420, cost: 395.00, price: 413.00},
    {ticker: "SCHD", shares: 650, cost: 26.50, price: 28.40},
    {ticker: "KO", shares: 520, cost: 58.00, price: 62.35},
    {ticker: "JNJ", shares: 280, cost: 155.00, price: 148.20},
    {ticker: "PG", shares: 200, cost: 158.00, price: 168.90},
    {ticker: "TLT", shares: 180, cost: 92.00, price: 89.45}
  ]
};

const SIGNALS = [
  {date: "2026-07-07", ticker: "NVDA", type: "BUY", price: 195.55, target: 210, stop: 175, confidence: 85, reason: "均线多头排列，RSI处于强势区间，MACD金叉运行中"},
  {date: "2026-07-07", ticker: "AAPL", type: "BUY", price: 312.66, target: 328, stop: 298, confidence: 78, reason: "价格站稳60日均线上方，成交量温和放大"},
  {date: "2026-07-07", ticker: "META", type: "STRONG_BUY", price: 600.29, target: 650, stop: 560, confidence: 92, reason: "MACD金叉确认，分析师一致强烈买入"},
  {date: "2026-07-06", ticker: "MSFT", type: "HOLD", price: 390.49, target: 400, stop: 370, confidence: 55, reason: "价格在60日均线附近震荡，等待方向选择"},
  {date: "2026-07-06", ticker: "TSLA", type: "HOLD", price: 419.77, target: 450, stop: 380, confidence: 50, reason: "RSI接近超买区域，短期可能有回调"},
  {date: "2026-07-06", ticker: "AMD", type: "HOLD", price: 552.05, target: 580, stop: 500, confidence: 60, reason: "涨幅较大，等待回踩确认支撑"}
];

// ==================== 企稳分析引擎 ====================
function analyzeStability(ticker) {
  const s = STOCKS[ticker];
  if (!s) return null;

  // 技术面评分 (60分)
  let techScore = 0;
  let techDetails = [];

  // 均线排列 (30分)
  if (s.ma5 > s.ma20 && s.ma20 > s.ma60) {
    techScore += 30;
    techDetails.push({label: "均线排列", score: "+30", desc: "多头排列（5日>20日>60日）", good: true});
  } else if (s.ma5 < s.ma20 && s.ma20 < s.ma60) {
    techScore -= 30;
    techDetails.push({label: "均线排列", score: "-30", desc: "空头排列（5日<20日<60日）", good: false});
  } else {
    techDetails.push({label: "均线排列", score: "0", desc: "震荡排列", good: null});
  }

  // 60日均线位置 (15分)
  if (s.price > s.ma60) {
    techScore += 15;
    techDetails.push({label: "60日均线", score: "+15", desc: `价格$${s.price}在60日均线上方$${s.ma60}`, good: true});
  } else {
    techScore -= 15;
    techDetails.push({label: "60日均线", score: "-15", desc: `价格$${s.price}跌破60日均线$${s.ma60}`, good: false});
  }

  // RSI (20分)
  if (s.rsi < 30) {
    techScore += 20;
    techDetails.push({label: "RSI指标", score: "+20", desc: `RSI=${s.rsi} 超卖区域，可能反弹`, good: true});
  } else if (s.rsi < 50) {
    techScore += 5;
    techDetails.push({label: "RSI指标", score: "+5", desc: `RSI=${s.rsi} 偏弱区间`, good: null});
  } else if (s.rsi < 70) {
    techScore += 10;
    techDetails.push({label: "RSI指标", score: "+10", desc: `RSI=${s.rsi} 偏强区间`, good: true});
  } else {
    techScore -= 10;
    techDetails.push({label: "RSI指标", score: "-10", desc: `RSI=${s.rsi} 超买区域，注意回调`, good: false});
  }

  // MACD (15分)
  if (s.macd > s.macdSignal) {
    techScore += 15;
    techDetails.push({label: "MACD", score: "+15", desc: `金叉运行中 (${s.macd.toFixed(1)} > ${s.macdSignal.toFixed(1)})`, good: true});
  } else {
    techScore -= 15;
    techDetails.push({label: "MACD", score: "-15", desc: `死叉运行中 (${s.macd.toFixed(1)} < ${s.macdSignal.toFixed(1)})`, good: false});
  }

  // K线形态 (10分)
  if (s.pct > 0 && s.vol > s.avgVol * 1.2) {
    techScore += 10;
    techDetails.push({label: "量价配合", score: "+10", desc: "放量上涨，资金流入", good: true});
  } else if (s.pct < 0 && s.vol < s.avgVol * 0.8) {
    techScore += 10;
    techDetails.push({label: "量价配合", score: "+10", desc: "缩量下跌，抛压减轻", good: true});
  } else if (s.pct < 0 && s.vol > s.avgVol * 1.2) {
    techScore -= 15;
    techDetails.push({label: "量价配合", score: "-15", desc: "放量下跌，资金出逃", good: false});
  } else {
    techDetails.push({label: "量价配合", score: "0", desc: "量能正常", good: null});
  }

  // 基本面评分 (40分)
  let fundScore = 0;
  let fundDetails = [];

  // PE估值 (20分)
  const peBenchmark = 30;
  if (s.pe < peBenchmark * 0.8) {
    fundScore += 20;
    fundDetails.push({label: "PE估值", score: "+20", desc: `PE=${s.pe} 低于行业均值${peBenchmark}的80%，低估`, good: true});
  } else if (s.pe < peBenchmark * 1.2) {
    fundScore += 10;
    fundDetails.push({label: "PE估值", score: "+10", desc: `PE=${s.pe} 在合理区间`, good: true});
  } else {
    fundScore -= 10;
    fundDetails.push({label: "PE估值", score: "-10", desc: `PE=${s.pe} 高于行业均值，估值偏高`, good: false});
  }

  // 52周位置 (20分)
  const weekPos = (s.price - s.low52) / (s.high52 - s.low52);
  if (weekPos < 0.2) {
    fundScore += 20;
    fundDetails.push({label: "52周位置", score: "+20", desc: `处于52周低点${(weekPos*100).toFixed(0)}%位置，底部区域`, good: true});
  } else if (weekPos < 0.5) {
    fundScore += 10;
    fundDetails.push({label: "52周位置", score: "+10", desc: `处于52周${(weekPos*100).toFixed(0)}%位置，中位附近`, good: true});
  } else if (weekPos < 0.8) {
    fundDetails.push({label: "52周位置", score: "0", desc: `处于52周${(weekPos*100).toFixed(0)}%位置`, good: null});
  } else {
    fundScore -= 10;
    fundDetails.push({label: "52周位置", score: "-10", desc: `处于52周高点${(weekPos*100).toFixed(0)}%位置，注意回调`, good: false});
  }

  // 分析师评级 (10分)
  if (s.analyst === "强烈买入") {
    fundScore += 10;
    fundDetails.push({label: "分析师评级", score: "+10", desc: "一致强烈买入", good: true});
  } else if (s.analyst === "买入") {
    fundScore += 8;
    fundDetails.push({label: "分析师评级", score: "+8", desc: "一致买入", good: true});
  } else if (s.analyst === "持有") {
    fundScore += 3;
    fundDetails.push({label: "分析师评级", score: "+3", desc: "持有评级", good: null});
  } else {
    fundScore -= 5;
    fundDetails.push({label: "分析师评级", score: "-5", desc: "卖出评级", good: false});
  }

  // 综合评分
  const totalScore = techScore + fundScore;
  let status, statusClass, statusText, action;
  if (totalScore >= 80) {
    status = "stable"; statusClass = "status-green"; statusText = "已企稳"; action = "可买入或持有";
  } else if (totalScore >= 50) {
    status = "unstable"; statusClass = "status-yellow"; statusText = "震荡整理"; action = "观望等待";
  } else if (totalScore >= 20) {
    status = "caution"; statusClass = "status-orange"; statusText = "趋势不明"; action = "谨慎操作";
  } else {
    status = "downtrend"; statusClass = "status-red"; statusText = "下行趋势"; action = "不建议买入";
  }

  // 支撑阻力位
  const r2 = (s.price * 1.08).toFixed(2);
  const r1 = (s.price * 1.04).toFixed(2);
  const s1 = (s.price * 0.96).toFixed(2);
  const s2 = (s.price * 0.92).toFixed(2);

  // 买入建议
  const buyTargets = [
    (s.price * 0.98).toFixed(2),
    (s.price * 0.95).toFixed(2),
    (s.price * 0.90).toFixed(2)
  ];
  const stopLoss = (s.price * 0.88).toFixed(2);

  return {
    ticker, ...s,
    techScore, techDetails,
    fundScore, fundDetails,
    totalScore,
    status, statusClass, statusText, action,
    r1, r2, s1, s2,
    buyTargets, stopLoss,
    weekPos
  };
}

function getVIXAdvice(vix) {
  if (vix < 15) return {level: "极度平静", action: "考虑减仓", color: "var(--green)"};
  if (vix < 20) return {level: "正常", action: "维持常规策略", color: "var(--accent)"};
  if (vix < 25) return {level: "偏高", action: "开始建仓现金储备", color: "var(--yellow)"};
  if (vix < 30) return {level: "高恐惧", action: "开始买入宽基ETF", color: "var(--orange)"};
  if (vix < 40) return {level: "恐慌", action: "积极买入优质股", color: "var(--red)"};
  if (vix < 50) return {level: "极度恐慌", action: "部署50%以上现金", color: "#9C27B0"};
  return {level: "历史机会", action: "全力买入", color: "#E91E63"};
}

function calcPyramid(price, budget) {
  const ratios = [1, 1, 1.5, 1.5, 2, 2, 3];
  const total = ratios.reduce((a, b) => a + b, 0);
  const step = 0.05;
  let totalShares = 0, totalCost = 0;
  const levels = ratios.map((r, i) => {
    const p = price * (1 - step * (i + 1));
    const amt = (budget * r) / total;
    const shares = Math.floor(amt / p);
    totalShares += shares;
    totalCost += shares * p;
    return {level: i + 1, price: p.toFixed(2), ratio: r, shares, amount: amt.toFixed(0)};
  });
  return {levels, totalShares, avgCost: totalShares > 0 ? (totalCost / totalShares).toFixed(2) : "0", totalInvested: totalCost.toFixed(0)};
}


// ==================== COMPONENTS ====================
function Badge({type}) {
  const map = {BUY: "badge-buy", "STRONG_BUY": "badge-strong-buy", SELL: "badge-sell", "STRONG_SELL": "badge-strong-sell", HOLD: "badge-hold"};
  const labels = {BUY: "买入", "STRONG_BUY": "强烈买入", SELL: "卖出", "STRONG_SELL": "强烈卖出", HOLD: "观望"};
  return <span className={"badge " + (map[type] || "badge-hold")}>{labels[type] || type}</span>;
}

function Navbar({page, setPage}) {
  const items = [
    {key: "dashboard", label: "仪表盘"},
    {key: "market", label: "市场"},
    {key: "analysis", label: "分析"},
    {key: "portfolio", label: "持仓"},
    {key: "signals", label: "信号"},
    {key: "strategy", label: "策略"}
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="nav-logo" onClick={e => {e.preventDefault(); setPage("dashboard");}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          美股量化系统
        </a>
        <div className="nav-links">
          {items.map(item => (
            <a key={item.key} href="#" className={"nav-link " + (page === item.key ? "active" : "")}
               onClick={e => {e.preventDefault(); setPage(item.key);}}>{item.label}</a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return <div className="footer">投资有风险，入市需谨慎。本系统仅供参考，不构成投资建议。美股量化系统</div>;
}

// ==================== DASHBOARD ====================
function Dashboard({setPage}) {
  const idx = Object.entries(INDICES);
  const stocks = Object.entries(STOCKS);
  const recentSignals = SIGNALS.slice(0, 5);
  return (
    <div className="main">
      <div className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        仪表盘
      </div>

      {/* 指数卡片 */}
      <div className="grid-4">
        {idx.map(([k, v]) => (
          <div key={k} className="index-card">
            <div className="text-xs text-secondary">{v.name}</div>
            <div className="index-value">{k === "^VIX" ? v.price.toFixed(2) : v.price.toLocaleString("en-US", {minimumFractionDigits: 2})}</div>
            <div className={"index-change " + (v.change >= 0 ? "up" : "down")}>
              {v.change >= 0 ? "+" : ""}{v.change.toFixed(2)} ({v.change >= 0 ? "+" : ""}{v.pct.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>

      {/* VIX建议 */}
      <div className="card mt-4">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          VIX恐慌指数与建议
        </div>
        <div style={{display:"flex", gap:24, alignItems:"center", flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:42, fontWeight:700, fontFamily:"monospace", color: INDICES["^VIX"].price < 20 ? "var(--green)" : INDICES["^VIX"].price < 30 ? "var(--yellow)" : "var(--red)"}}>
              {INDICES["^VIX"].price.toFixed(2)}
            </div>
            <div className={"text-sm " + (INDICES["^VIX"].change >= 0 ? "down" : "up")}>
              {INDICES["^VIX"].change >= 0 ? "+" : ""}{INDICES["^VIX"].change.toFixed(2)} ({INDICES["^VIX"].pct.toFixed(2)}%)
            </div>
          </div>
          <div style={{flex:1, minWidth:200}}>
            {(() => {
              const advice = getVIXAdvice(INDICES["^VIX"].price);
              return (
                <div>
                  <div className="text-sm">当前状态：<span style={{color: advice.color, fontWeight:600}}>{advice.level}</span></div>
                  <div className="text-sm mt-2">建议操作：<span style={{color: advice.color, fontWeight:600}}>{advice.action}</span></div>
                  <div className="gauge-bg"><div className="gauge-fill" style={{width: Math.min(INDICES["^VIX"].price / 50 * 100, 100) + "%", background: advice.color}}></div></div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 最新信号 */}
      <div className="card mt-4">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          最新信号
        </div>
        {recentSignals.map((sig, i) => (
          <div key={i} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)"}}>
            <span className="font-mono text-sm" style={{minWidth:90}}>{sig.date}</span>
            <span className="font-mono font-bold">{sig.ticker}</span>
            <Badge type={sig.type} />
            <span className="font-mono text-sm">${sig.price.toFixed(2)}</span>
            <span className="text-sm text-secondary" style={{flex:1}}>{sig.reason}</span>
            <button className="btn" style={{padding:"4px 12px", fontSize:12}} onClick={() => setPage("analysis")}>分析</button>
          </div>
        ))}
      </div>

      {/* 自选股 */}
      <div className="card mt-4">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          自选股监控
        </div>
        <div className="stock-header stock-row">
          <span>代码</span><span>名称</span><span style={{textAlign:"right"}}>价格</span><span style={{textAlign:"right"}}>涨跌幅</span>
          <span>信号</span><span>均线状态</span><span style={{textAlign:"right"}}>成交量</span>
        </div>
        {stocks.map(([t, s]) => (
          <div key={t} className="stock-row">
            <span className="ticker">{t}</span>
            <span className="name">{s.name}</span>
            <span className="price">${s.price.toFixed(2)}</span>
            <span className={"pct " + (s.change >= 0 ? "up" : "down")}>{s.change >= 0 ? "+" : ""}{s.pct.toFixed(2)}%</span>
            <span><Badge type={s.rsi > 65 ? "HOLD" : s.macd > s.macdSignal ? "BUY" : "HOLD"} /></span>
            <span className="text-xs" style={{color: s.ma5 > s.ma20 && s.ma20 > s.ma60 ? "var(--green)" : s.ma5 < s.ma20 && s.ma20 < s.ma60 ? "var(--red)" : "var(--yellow)"}}>
              {s.ma5 > s.ma20 && s.ma20 > s.ma60 ? "多头排列" : s.ma5 < s.ma20 && s.ma20 < s.ma60 ? "空头排列" : "震荡"}
            </span>
            <span className="font-mono text-sm" style={{textAlign:"right", color: s.vol > s.avgVol * 1.2 ? "var(--green)" : s.vol < s.avgVol * 0.8 ? "var(--red)" : "var(--text2)"}}>
              {s.vol}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== MARKET ====================
function Market() {
  const stocks = Object.entries(STOCKS);
  return (
    <div className="main">
      <div className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        市场行情
      </div>
      <div className="card">
        <div className="stock-row stock-header">
          <span>代码</span><span>名称</span><span style={{textAlign:"right"}}>价格</span>
          <span style={{textAlign:"right"}}>涨跌</span><span style={{textAlign:"right"}}>涨跌幅</span>
          <span style={{textAlign:"right"}}>52周区间</span><span style={{textAlign:"right"}}>PE</span><span>信号</span>
        </div>
        {stocks.map(([t, s]) => (
          <div key={t} className="stock-row">
            <span className="ticker">{t}</span>
            <span className="name">{s.name}</span>
            <span className="price">${s.price.toFixed(2)}</span>
            <span className={"price " + (s.change >= 0 ? "up" : "down")}>{s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}</span>
            <span className={"pct " + (s.change >= 0 ? "up" : "down")}>{s.change >= 0 ? "+" : ""}{s.pct.toFixed(2)}%</span>
            <span className="font-mono text-sm" style={{textAlign:"right", color:"var(--text2)"}}>
              ${s.low52}-${s.high52}
            </span>
            <span className="font-mono text-sm" style={{textAlign:"right"}}>{s.pe}</span>
            <span><Badge type={s.rsi > 65 ? "HOLD" : s.macd > s.macdSignal ? "BUY" : "HOLD"} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ==================== ANALYSIS (核心: 企稳分析) ====================
function Analysis() {
  const [ticker, setTicker] = useState("AAPL");
  const [input, setInput] = useState("");

  const result = useMemo(() => analyzeStability(ticker), [ticker]);
  if (!result) return <div className="main"><div className="card">暂无数据</div></div>;

  const popular = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD"];

  return (
    <div className="main">
      <div className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        个股分析 - 企稳判断
      </div>

      {/* 搜索栏 */}
      <div className="card">
        <div style={{display:"flex", gap:12, maxWidth:500}}>
          <input className="input" value={input} onChange={e => setInput(e.target.value.toUpperCase())}
                 onKeyDown={e => e.key === "Enter" && STOCKS[input] && setTicker(input)}
                 placeholder="输入股票代码 (如 AAPL, NVDA)" />
          <button className="btn" onClick={() => STOCKS[input] && setTicker(input)}>分析</button>
        </div>
        <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
          {popular.map(t => (
            <button key={t} onClick={() => {setInput(t); setTicker(t);}}
              style={{padding:"4px 12px", borderRadius:20, border:"1px solid " + (ticker === t ? "var(--accent)" : "var(--border)"),
                      background: ticker === t ? "rgba(0,217,192,0.08)" : "transparent",
                      color: ticker === t ? "var(--accent)" : "var(--text2)", fontSize:12, fontFamily:"monospace", cursor:"pointer"}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 基本信息 */}
      <div className="card" style={{borderLeft: "4px solid " + (result.change >= 0 ? "var(--green)" : "var(--red)")}}>
        <div style={{display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <span style={{fontSize:28, fontWeight:700}}>{result.ticker}</span>
              <span className="text-xs" style={{background:"var(--elevated)", padding:"2px 10px", borderRadius:20, color:"var(--muted)"}}>NASDAQ</span>
              <Badge type={result.totalScore >= 80 ? "BUY" : result.totalScore >= 50 ? "HOLD" : result.totalScore >= 20 ? "HOLD" : "SELL"} />
            </div>
            <div className="text-sm text-secondary">{result.name}</div>
          </div>
          <div>
            <div style={{fontSize:32, fontWeight:700, fontFamily:"monospace"}}>${result.price.toFixed(2)}</div>
            <div className={"text-sm font-mono font-bold " + (result.change >= 0 ? "up" : "down")}>
              {result.change >= 0 ? "▲ " : "▼ "}{result.change >= 0 ? "+" : ""}{result.change.toFixed(2)} ({result.pct >= 0 ? "+" : ""}{result.pct.toFixed(2)}%)
            </div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 24px", fontSize:14}}>
            <div><span className="text-muted" style={{fontSize:11}}>市值</span><div className="font-mono">{result.cap}</div></div>
            <div><span className="text-muted" style={{fontSize:11}}>PE</span><div className="font-mono">{result.pe}</div></div>
            <div><span className="text-muted" style={{fontSize:11}}>成交量</span><div className="font-mono">{result.vol}</div></div>
            <div><span className="text-muted" style={{fontSize:11}}>均量</span><div className="font-mono">{result.avgVol}</div></div>
          </div>
        </div>
      </div>

      {/* 核心：企稳判断 */}
      <div className="card" style={{border: "2px solid " + (result.status === "stable" ? "rgba(0,230,118,0.3)" : result.status === "unstable" ? "rgba(251,191,36,0.3)" : result.status === "caution" ? "rgba(255,152,0,0.3)" : "rgba(255,23,68,0.3)")}}>
        <div className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={result.status === "stable" ? "var(--green)" : result.status === "unstable" ? "var(--yellow)" : result.status === "caution" ? "var(--orange)" : "var(--red)"} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          企稳判断 — <span className={result.statusClass}>{result.statusText}</span>
        </div>

        <div style={{display:"flex", flexWrap:"wrap", gap:24, alignItems:"center"}}>
          {/* 综合评分环 */}
          <div className={result.status}>
            <div className="score-ring">
              <div className="score-value" style={{color: result.totalScore >= 80 ? "var(--green)" : result.totalScore >= 50 ? "var(--yellow)" : result.totalScore >= 20 ? "var(--orange)" : "var(--red)"}}>
                {result.totalScore}
              </div>
              <div className="score-label">综合评分</div>
            </div>
          </div>

          {/* 评分详情 */}
          <div style={{flex:1, minWidth:250}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
              <span className="text-sm">技术面评分 (60%)</span>
              <span className="font-mono font-bold" style={{color: result.techScore >= 30 ? "var(--green)" : result.techScore >= 0 ? "var(--yellow)" : "var(--red)"}}>{result.techScore}分</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: Math.max(0, (result.techScore + 50) / 100 * 100) + "%", background: result.techScore >= 30 ? "var(--green)" : result.techScore >= 0 ? "var(--yellow)" : "var(--red)"}}></div></div>

            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8, marginTop:12}}>
              <span className="text-sm">基本面评分 (40%)</span>
              <span className="font-mono font-bold" style={{color: result.fundScore >= 20 ? "var(--green)" : result.fundScore >= 0 ? "var(--yellow)" : "var(--red)"}}>{result.fundScore}分</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: Math.max(0, (result.fundScore + 20) / 60 * 100) + "%", background: result.fundScore >= 20 ? "var(--green)" : result.fundScore >= 0 ? "var(--yellow)" : "var(--red)"}}></div></div>

            <div className="mt-4" style={{padding:12, borderRadius:8, background: result.status === "stable" ? "rgba(0,230,118,0.05)" : result.status === "unstable" ? "rgba(251,191,36,0.05)" : result.status === "caution" ? "rgba(255,152,0,0.05)" : "rgba(255,23,68,0.05)"}}>
              <div className="text-sm">
                <span className="text-muted">操作建议：</span>
                <span className={result.statusClass + " font-bold"}>{result.action}</span>
              </div>
              <div className="text-xs text-muted mt-2">
                {result.status === "stable" ? "技术面和基本面均呈积极信号，可考虑分批建仓或持有" :
                 result.status === "unstable" ? "多空因素交织，建议等待更明确的企稳信号后再操作" :
                 result.status === "caution" ? "趋势方向不明，控制仓位，以观望为主" :
                 "多项指标偏空，不建议此时买入，已持仓者注意止损"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 技术面详细分析 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          技术面分析 (60%权重)
        </div>
        <div className="grid-2">
          {result.techDetails.map((d, i) => (
            <div key={i} style={{padding:12, background:"var(--elevated)", borderRadius:8, borderLeft:"3px solid " + (d.good === true ? "var(--green)" : d.good === false ? "var(--red)" : "var(--yellow)")}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span className="text-sm font-bold">{d.label}</span>
                <span className="font-mono font-bold" style={{color: d.good === true ? "var(--green)" : d.good === false ? "var(--red)" : "var(--yellow)"}}>{d.score}</span>
              </div>
              <div className="text-xs text-muted mt-1">{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 基本面分析 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          基本面分析 (40%权重)
        </div>
        <div className="grid-2">
          {result.fundDetails.map((d, i) => (
            <div key={i} style={{padding:12, background:"var(--elevated)", borderRadius:8, borderLeft:"3px solid " + (d.good === true ? "var(--green)" : d.good === false ? "var(--red)" : "var(--yellow)")}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span className="text-sm font-bold">{d.label}</span>
                <span className="font-mono font-bold" style={{color: d.good === true ? "var(--green)" : d.good === false ? "var(--red)" : "var(--yellow)"}}>{d.score}</span>
              </div>
              <div className="text-xs text-muted mt-1">{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 支撑与阻力位 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>
          支撑与阻力位
        </div>
        <div className="grid-4">
          {[
            {label: "阻力位 R2", price: result.r2, color: "var(--red)", pct: ((parseFloat(result.r2) - result.price) / result.price * 100).toFixed(1)},
            {label: "阻力位 R1", price: result.r1, color: "var(--orange)", pct: ((parseFloat(result.r1) - result.price) / result.price * 100).toFixed(1)},
            {label: "支撑位 S1", price: result.s1, color: "var(--green)", pct: ((parseFloat(result.s1) - result.price) / result.price * 100).toFixed(1)},
            {label: "支撑位 S2", price: result.s2, color: "var(--accent)", pct: ((parseFloat(result.s2) - result.price) / result.price * 100).toFixed(1)},
          ].map((l, i) => (
            <div key={i} style={{padding:12, background:"var(--elevated)", borderRadius:8, borderLeft:"3px solid " + l.color}}>
              <div className="text-xs text-muted">{l.label}</div>
              <div className="font-mono font-bold text-lg" style={{color: l.color}}>${l.price}</div>
              <div className="text-xs font-mono" style={{color: parseFloat(l.pct) >= 0 ? "var(--green)" : "var(--red)"}}>{parseFloat(l.pct) >= 0 ? "+" : ""}{l.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 买卖建议 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          买卖建议
        </div>
        <div className="recommend-box" style={{borderColor: result.totalScore >= 50 ? "var(--green)" : "var(--red)"}}>
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:12}}>
            <Badge type={result.totalScore >= 80 ? "STRONG_BUY" : result.totalScore >= 50 ? "BUY" : "HOLD"} />
            <span className="text-sm text-muted">{new Date().toLocaleDateString("zh-CN")}</span>
          </div>
          <div className="text-sm text-secondary mb-4">
            <strong>判断依据：</strong>{result.techDetails.filter(d => d.good === true).map(d => d.label).join("、")}
            {result.techDetails.filter(d => d.good === true).length > 0 ? "等技术面指标积极" : "技术面信号偏弱"}
            ，{result.fundDetails.filter(d => d.good === true).map(d => d.label).join("、")}
            {result.fundDetails.filter(d => d.good === true).length > 0 ? "等基本面指标向好" : "基本面信号一般"}
            ，综合评分{result.totalScore}分。
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            <div>
              <div className="text-xs text-muted mb-2" style={{display:"flex", alignItems:"center", gap:4}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                目标买入价 (金字塔)
              </div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {result.buyTargets.map((p, i) => (
                  <span key={i} className="font-mono text-sm" style={{padding:"4px 12px", background:"rgba(0,230,118,0.1)", color:"var(--green)", borderRadius:6}}>
                    ${p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-2" style={{display:"flex", alignItems:"center", gap:4}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                止损价
              </div>
              <span className="font-mono font-bold" style={{color: "var(--red)"}}>${result.stopLoss}</span>
              <span className="text-xs text-muted"> (距现价{((1 - parseFloat(result.stopLoss) / result.price) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==================== PORTFOLIO (三账户持仓) ====================
function Portfolio() {
  const accounts = [
    {key: "aggressive", name: "进取型账户", pct: "45%", desc: "高成长科技股", color: "var(--green)",
     total: POSITIONS.aggressive.reduce((a, p) => a + p.shares * p.price, 0),
     cost: POSITIONS.aggressive.reduce((a, p) => a + p.shares * p.cost, 0)},
    {key: "stable", name: "稳健型账户", pct: "15%", desc: "蓝筹+ETF", color: "var(--accent)",
     total: POSITIONS.stable.reduce((a, p) => a + p.shares * p.price, 0),
     cost: POSITIONS.stable.reduce((a, p) => a + p.shares * p.cost, 0)},
    {key: "defensive", name: "防御型账户", pct: "40%", desc: "红利+债券", color: "var(--yellow)",
     total: POSITIONS.defensive.reduce((a, p) => a + p.shares * p.price, 0),
     cost: POSITIONS.defensive.reduce((a, p) => a + p.shares * p.cost, 0)}
  ];
  const [activeTab, setActiveTab] = useState("aggressive");
  const active = accounts.find(a => a.key === activeTab);
  const positions = POSITIONS[activeTab];
  const totalValue = active.total;
  const totalCost = active.cost;
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = (totalPnL / totalCost * 100).toFixed(2);

  return (
    <div className="main">
      <div className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        持仓管理
      </div>

      {/* 三账户卡片 */}
      <div className="grid-3">
        {accounts.map(a => (
          <div key={a.key}
               onClick={() => setActiveTab(a.key)}
               style={{cursor:"pointer", padding:16, borderRadius:12, border:"2px solid " + (activeTab === a.key ? a.color : "var(--border)"), background:"var(--card)"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <span style={{fontWeight:600}}>{a.name}</span>
              <span className="text-xs" style={{padding:"2px 8px", borderRadius:4, background:a.color + "20", color:a.color}}>{a.pct}</span>
            </div>
            <div className="text-xs text-muted">{a.desc}</div>
            <div className="font-mono font-bold text-lg mt-2">${(a.total / 1000).toFixed(0)}K</div>
            <div className="font-mono text-sm" style={{color: (a.total - a.cost) >= 0 ? "var(--green)" : "var(--red)"}}>
              {(a.total - a.cost) >= 0 ? "+" : ""}{((a.total - a.cost) / a.cost * 100).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* 当前账户详情 */}
      <div className="card mt-4">
        <div className="card-title" style={{color: active.color}}>
          {active.name} — 持仓明细
        </div>
        <div style={{display:"flex", gap:24, marginBottom:16, flexWrap:"wrap"}}>
          <div>
            <div className="text-xs text-muted">总市值</div>
            <div className="font-mono font-bold text-xl">${totalValue.toLocaleString("en-US", {maximumFractionDigits:0})}</div>
          </div>
          <div>
            <div className="text-xs text-muted">总成本</div>
            <div className="font-mono text-secondary">${totalCost.toLocaleString("en-US", {maximumFractionDigits:0})}</div>
          </div>
          <div>
            <div className="text-xs text-muted">盈亏</div>
            <div className="font-mono font-bold" style={{color: totalPnL >= 0 ? "var(--green)" : "var(--red)"}}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString("en-US", {maximumFractionDigits:0})} ({totalPnLPct}%)
            </div>
          </div>
        </div>
        <div className="pos-row" style={{color:"var(--muted)", fontSize:12, textTransform:"uppercase", borderBottom:"2px solid var(--border)"}}>
          <span>代码</span><span>持仓数</span><span style={{textAlign:"right"}}>成本价</span>
          <span style={{textAlign:"right"}}>现价</span><span style={{textAlign:"right"}}>市值</span>
          <span style={{textAlign:"right"}}>盈亏</span><span style={{textAlign:"right"}}>盈亏%</span>
        </div>
        {positions.map((p, i) => {
          const mkt = p.shares * p.price;
          const cst = p.shares * p.cost;
          const pnl = mkt - cst;
          const pnlPct = (pnl / cst * 100).toFixed(1);
          return (
            <div key={i} className="pos-row">
              <span className="ticker font-bold">{p.ticker}</span>
              <span className="font-mono">{p.shares.toLocaleString()}</span>
              <span className="font-mono text-sm" style={{textAlign:"right"}}>${p.cost.toFixed(2)}</span>
              <span className="font-mono text-sm" style={{textAlign:"right"}}>${p.price.toFixed(2)}</span>
              <span className="font-mono text-sm" style={{textAlign:"right"}}>${mkt.toLocaleString("en-US", {maximumFractionDigits:0})}</span>
              <span className="font-mono text-sm font-bold" style={{textAlign:"right", color: pnl >= 0 ? "var(--green)" : "var(--red)"}}>
                {pnl >= 0 ? "+" : ""}${pnl.toLocaleString("en-US", {maximumFractionDigits:0})}
              </span>
              <span className="font-mono text-sm font-bold" style={{textAlign:"right", color: pnl >= 0 ? "var(--green)" : "var(--red)"}}>
                {pnl >= 0 ? "+" : ""}{pnlPct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* 负成本追踪 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          负成本追踪
        </div>
        <div className="text-sm text-secondary mb-4">
          通过金字塔加仓和波段操作，目标将持仓成本降至零以下。当"已实现盈利"超过"总成本"时，持仓即为负成本。
        </div>
        {positions.filter(p => p.ticker !== "QQQ" && p.ticker !== "SPY" && p.ticker !== "SCHD" && p.ticker !== "TLT").slice(0, 3).map((p, i) => {
          const mkt = p.shares * p.price;
          const cst = p.shares * p.cost;
          const unrealized = mkt - cst;
          const realized = unrealized * 0.3;
          const remainingCost = cst - realized;
          const progress = Math.min(realized / cst * 100, 100).toFixed(0);
          return (
            <div key={i} className="mb-4">
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                <span className="font-mono font-bold">{p.ticker}</span>
                <span className="text-xs text-muted">已实现盈利覆盖成本 {progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: progress + "%", background: realized >= cst ? "var(--green)" : "var(--accent)"}}></div>
              </div>
              <div className="text-xs text-muted mt-1">
                总成本 ${cst.toLocaleString("en-US", {maximumFractionDigits:0})} → 剩余 ${remainingCost.toLocaleString("en-US", {maximumFractionDigits:0})}
                {realized >= cst ? " ✓ 已负成本" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== SIGNALS (信号中心) ====================
function Signals() {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? SIGNALS : SIGNALS.filter(s => s.type === filter);
  const stats = {
    total: SIGNALS.length,
    buy: SIGNALS.filter(s => s.type.includes("BUY")).length,
    hold: SIGNALS.filter(s => s.type === "HOLD").length,
    strongBuy: SIGNALS.filter(s => s.type === "STRONG_BUY").length,
    avgConfidence: (SIGNALS.reduce((a, s) => a + s.confidence, 0) / SIGNALS.length).toFixed(0)
  };

  return (
    <div className="main">
      <div className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        交易信号中心
      </div>

      {/* 统计 */}
      <div className="grid-4">
        <div className="index-card"><div className="text-xs text-muted">总信号数</div><div className="index-value">{stats.total}</div></div>
        <div className="index-card"><div className="text-xs text-muted">买入信号</div><div className="index-value" style={{color:"var(--green)"}}>{stats.buy + stats.strongBuy}</div></div>
        <div className="index-card"><div className="text-xs text-muted">观望信号</div><div className="index-value" style={{color:"var(--yellow)"}}>{stats.hold}</div></div>
        <div className="index-card"><div className="text-xs text-muted">平均置信度</div><div className="index-value" style={{color:"var(--accent)"}}>{stats.avgConfidence}%</div></div>
      </div>

      {/* 筛选 */}
      <div className="card mt-4" style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        {[{k:"ALL", l:"全部"}, {k:"STRONG_BUY", l:"强烈买入"}, {k:"BUY", l:"买入"}, {k:"HOLD", l:"观望"}].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={"tab-btn " + (filter === f.k ? "active" : "")}>{f.l}</button>
        ))}
      </div>

      {/* 信号列表 */}
      <div className="card">
        <div className="card-title">信号明细</div>
        <div style={{display:"grid", gridTemplateColumns:"0.8fr 0.6fr 2fr 0.8fr 0.8fr 0.8fr 0.6fr", gap:8, padding:"8px 0", color:"var(--muted)", fontSize:12, borderBottom:"2px solid var(--border)"}}>
          <span>日期</span><span>代码</span><span>原因</span><span style={{textAlign:"right"}}>价格</span>
          <span style={{textAlign:"right"}}>目标</span><span style={{textAlign:"right"}}>止损</span><span style={{textAlign:"center"}}>置信</span>
        </div>
        {filtered.map((sig, i) => (
          <div key={i} style={{display:"grid", gridTemplateColumns:"0.8fr 0.6fr 2fr 0.8fr 0.8fr 0.8fr 0.6fr", gap:8, padding:"10px 0", borderBottom:"1px solid var(--border)", alignItems:"center"}}>
            <span className="font-mono text-xs">{sig.date}</span>
            <span className="font-mono font-bold">{sig.ticker}</span>
            <span className="text-sm text-secondary">{sig.reason}</span>
            <span className="font-mono text-sm" style={{textAlign:"right"}}>${sig.price.toFixed(2)}</span>
            <span className="font-mono text-sm" style={{textAlign:"right", color:"var(--green)"}}>${sig.target}</span>
            <span className="font-mono text-sm" style={{textAlign:"right", color:"var(--red)"}}>${sig.stop}</span>
            <span className="font-mono text-xs font-bold" style={{textAlign:"center", color: sig.confidence >= 80 ? "var(--green)" : sig.confidence >= 60 ? "var(--accent)" : "var(--yellow)"}}>{sig.confidence}%</span>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-muted mt-4">暂无符合条件的信号</div>}
      </div>

      {/* 近期信号图表 */}
      <div className="card">
        <div className="card-title">信号趋势</div>
        <div style={{height:200, position:"relative"}}>
          <canvas ref={el => {
            if (!el) return;
            const ctx = el.getContext("2d");
            const dpr = window.devicePixelRatio || 1;
            const rect = el.getBoundingClientRect();
            el.width = rect.width * dpr; el.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            const w = rect.width, h = rect.height;
            ctx.clearRect(0, 0, w, h);
            const data = SIGNALS.map((s, i) => ({x: i, y: s.confidence, type: s.type}));
            const maxY = 100, minY = 0;
            const pad = 30;
            const barW = (w - pad * 2) / data.length * 0.5;
            data.forEach((d, i) => {
              const x = pad + (w - pad * 2) * (i / (data.length - 1 || 1));
              const barH = (d.y - minY) / (maxY - minY) * (h - pad * 2);
              const color = d.type === "STRONG_BUY" ? "#00D9C0" : d.type === "BUY" ? "#00E676" : d.type === "HOLD" ? "#FBBF24" : "#FF1744";
              ctx.fillStyle = color + "60";
              ctx.fillRect(x - barW / 2, h - pad - barH, barW, barH);
              ctx.fillStyle = color;
              ctx.fillRect(x - barW / 2, h - pad - barH, barW, 3);
              ctx.fillStyle = "#94A3B8";
              ctx.font = "10px monospace";
              ctx.textAlign = "center";
              ctx.fillText(SIGNALS[i].ticker, x, h - pad + 14);
            });
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
          }} style={{width:"100%", height:"100%"}} />
        </div>
      </div>
    </div>
  );
}

// ==================== STRATEGY (策略中心) ====================
function Strategy() {
  const vix = INDICES["^VIX"].price;
  const vixAdvice = getVIXAdvice(vix);
  const [budget, setBudget] = useState(10000);
  const [basePrice, setBasePrice] = useState(200);
  const pyramid = calcPyramid(basePrice, budget);

  return (
    <div className="main">
      <div className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        投资策略中心
      </div>

      {/* VIX决策系统 */}
      <div className="card" style={{border: "2px solid " + vixAdvice.color + "30"}}>
        <div className="card-title" style={{color: vixAdvice.color}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={vixAdvice.color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          VIX恐慌指数决策系统
        </div>
        <div style={{display:"flex", flexWrap:"wrap", gap:24, alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:56, fontWeight:800, fontFamily:"monospace", color: vixAdvice.color}}>{vix.toFixed(2)}</div>
            <div className="text-sm" style={{color: vixAdvice.color, fontWeight:600}}>{vixAdvice.level}</div>
          </div>
          <div style={{flex:1, minWidth:250}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
              <span className="text-sm">极度平静</span><span className="text-sm">正常</span><span className="text-sm">恐慌</span><span className="text-sm">极端</span>
            </div>
            <div style={{height:20, background:"linear-gradient(to right, #00E676, #00D9C0, #FBBF24, #FF9800, #FF1744, #9C27B0, #E91E63)", borderRadius:10, position:"relative"}}>
              <div style={{position:"absolute", left: Math.min(vix / 50 * 100, 100) + "%", top:-4, width:4, height:28, background:"#fff", borderRadius:2, boxShadow:"0 0 8px rgba(255,255,255,0.5)", transform:"translateX(-50%)"}}></div>
            </div>
            <div className="mt-4" style={{padding:16, borderRadius:8, background: vixAdvice.color + "10", borderLeft:"3px solid " + vixAdvice.color}}>
              <div className="text-sm">
                <span className="text-muted">当前建议：</span>
                <span style={{color: vixAdvice.color, fontWeight:700}}>{vixAdvice.action}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VIX档位速查表 */}
        <div className="mt-4">
          <div className="text-sm font-bold mb-2">VIX决策速查表</div>
          <div className="grid-4">
            {[
              {range: "< 15", level: "极度平静", action: "减仓避险", color: "var(--green)"},
              {range: "15-20", level: "正常区间", action: "常规策略", color: "var(--accent)"},
              {range: "20-25", level: "偏高警惕", action: "储备现金", color: "var(--yellow)"},
              {range: "25-30", level: "高恐惧", action: "买入ETF", color: "var(--orange)"},
              {range: "30-40", level: "恐慌区域", action: "积极买入", color: "var(--red)"},
              {range: "40-50", level: "极度恐慌", action: "大举建仓", color: "#9C27B0"},
              {range: "> 50", level: "历史机会", action: "全力买入", color: "#E91E63"},
              {range: "极端值", level: "黑天鹅", action: "无视价格", color: "#fff"}
            ].map((v, i) => (
              <div key={i} style={{padding:10, borderRadius:8, background:"var(--elevated)", borderLeft:"3px solid " + v.color, opacity: v.range.includes(vix.toFixed(0)) || (vix < 15 && v.range === "< 15") ? 1 : 0.6}}>
                <div className="font-mono text-xs" style={{color: v.color}}>{v.range}</div>
                <div className="text-sm font-bold">{v.level}</div>
                <div className="text-xs text-muted">{v.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 金字塔加仓计算器 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/></svg>
          金字塔加仓计算器
        </div>
        <div style={{display:"flex", gap:16, flexWrap:"wrap", marginBottom:16}}>
          <div style={{flex:1, minWidth:200}}>
            <label className="text-xs text-muted">基准价格 ($)</label>
            <input className="input" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} />
          </div>
          <div style={{flex:1, minWidth:200}}>
            <label className="text-xs text-muted">总预算 ($)</label>
            <input className="input" type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid-2">
          <div>
            <div className="text-sm font-bold mb-2">7层金字塔 (每档-5%)</div>
            {pyramid.levels.map((l, i) => (
              <div key={i} className={"pyramid-tier " + (i <= 2 ? "active" : "pending")}>
                <span className="level-badge level-{(i+1)}">L{i+1}</span>
                <span className="font-mono text-sm">${l.price}</span>
                <span className="text-xs text-muted">配比 {l.ratio}x</span>
                <span className="text-xs text-muted">{l.shares}股</span>
                <span className="font-mono text-xs" style={{marginLeft:"auto"}}>${l.amount}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-bold mb-2">汇总</div>
            <div className="card" style={{background:"var(--elevated)"}}>
              <div className="mb-2"><span className="text-muted text-xs">总投入</span><div className="font-mono font-bold">${pyramid.totalInvested}</div></div>
              <div className="mb-2"><span className="text-muted text-xs">总股数</span><div className="font-mono font-bold">{pyramid.totalShares.toLocaleString()} 股</div></div>
              <div className="mb-2"><span className="text-muted text-xs">平均成本</span><div className="font-mono font-bold" style={{color:"var(--green)"}}>${pyramid.avgCost}</div></div>
              <div className="mb-2"><span className="text-muted text-xs">较基准折价</span>
                <div className="font-mono font-bold" style={{color: parseFloat(pyramid.avgCost) < basePrice ? "var(--green)" : "var(--text)"}}>
                  {((parseFloat(pyramid.avgCost) - basePrice) / basePrice * 100).toFixed(1)}%
                </div>
              </div>
              <div><span className="text-muted text-xs">预算利用率</span>
                <div className="font-mono font-bold">{(pyramid.totalInvested / budget * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 三账户配置规则 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>
          三账户配置规则
        </div>
        <div className="grid-3">
          <div style={{padding:16, borderRadius:12, background:"rgba(0,230,118,0.05)", border:"1px solid rgba(0,230,118,0.2)"}}>
            <div style={{color:"var(--green)", fontWeight:700, marginBottom:8}}>进取型 45%</div>
            <div className="text-sm text-secondary">高成长科技股、AI半导体</div>
            <div className="text-xs text-muted mt-2">目标：年化 15-25%</div>
            <div className="text-xs text-muted">个股：NVDA/AAPL/TSLA/META</div>
          </div>
          <div style={{padding:16, borderRadius:12, background:"rgba(0,217,192,0.05)", border:"1px solid rgba(0,217,192,0.2)"}}>
            <div style={{color:"var(--accent)", fontWeight:700, marginBottom:8}}>稳健型 15%</div>
            <div className="text-sm text-secondary">蓝筹龙头+ETF</div>
            <div className="text-xs text-muted mt-2">目标：年化 8-12%</div>
            <div className="text-xs text-muted">个股：MSFT/SPY/QQQ</div>
          </div>
          <div style={{padding:16, borderRadius:12, background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.2)"}}>
            <div style={{color:"var(--yellow)", fontWeight:700, marginBottom:8}}>防御型 40%</div>
            <div className="text-sm text-secondary">红利股+债券ETF</div>
            <div className="text-xs text-muted mt-2">目标：年化 4-8%</div>
            <div className="text-xs text-muted">个股：BRK.B/SCHD/KO/TLT</div>
          </div>
        </div>
      </div>

      {/* 黄金分割仓位 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          黄金分割仓位管理
        </div>
        <div className="text-sm text-secondary mb-4">
          基于斐波那契数列 (1, 1, 2, 3, 5, 8, 13) 的金字塔加仓法。每下跌一档加仓一次，加仓比例递增。
        </div>
        <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
          {[1, 1, 2, 3, 5, 8, 13].map((n, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:12}}>
              <div style={{width:30 + n * 3, height:30 + n * 3, borderRadius:4, background:"rgba(0,217,192,0.1)", border:"1px solid var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 + n * 0.5, fontWeight:700, color:"var(--accent)"}}>
                {n}
              </div>
              {i < 6 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== APP ====================
function App() {
  const [page, setPage] = useState("dashboard");
  const pages = {
    dashboard: React.createElement(Dashboard, {setPage: setPage}),
    market: React.createElement(Market),
    analysis: React.createElement(Analysis),
    portfolio: React.createElement(Portfolio),
    signals: React.createElement(Signals),
    strategy: React.createElement(Strategy)
  };
  return React.createElement("div", null,
    React.createElement(Navbar, {page, setPage}),
    pages[page] || pages.dashboard,
    React.createElement(Footer)
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));