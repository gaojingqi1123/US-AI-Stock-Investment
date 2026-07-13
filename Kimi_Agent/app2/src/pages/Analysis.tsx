import { useState, useMemo, useCallback } from 'react';
import {
  Search, BarChart3, ArrowUp, ArrowDown, TrendingUp, TrendingDown,
  Activity, Target, Shield, Layers, ChevronRight, Info,
} from 'lucide-react';
import { Line, ResponsiveContainer, AreaChart, Area, Bar, Cell, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import CandlestickChart from '@/components/CandlestickChart';
import SignalBadge from '@/components/SignalBadge';
import { generatePyramidLevels, getPyramidSummary } from '@/lib/strategyEngine';
import type { PyramidLevel } from '@/lib/strategyEngine';
import type { SignalType } from '@/lib/strategyEngine';
import type { HistoricalDataPoint } from '@/lib/yahooFinance';

// ── Types ─────────────────────────────────────────────────────────

interface StockInfo {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  high52: number;
  low52: number;
  volume: string;
  avgVolume: string;
  dayHigh: number;
  dayLow: number;
  open: number;
}

interface IndicatorGauge {
  label: string;
  value: number;
  min: number;
  max: number;
  zones: { min: number; max: number; label: string; color: string }[];
  signal: string;
}

// ── Mock Data Generators ──────────────────────────────────────────

function generateHistoricalData(days: number, basePrice: number, volatility: number = 0.015): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let price = basePrice;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, price) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.floor(20000000 + Math.random() * 80000000);
    data.push({ date, open, high, low, close: price, volume });
  }
  return data;
}

// ── Mock Stock Database ───────────────────────────────────────────

const STOCK_DB: Record<string, StockInfo> = {
  AAPL: {
    ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 189.25, change: 2.71, changePercent: 1.45,
    marketCap: '$2.90T', peRatio: 28.5, high52: 199.62, low52: 164.08, volume: '52.4M', avgVolume: '48.2M', dayHigh: 190.10, dayLow: 187.50, open: 188.00,
  },
  MSFT: {
    ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', price: 425.80, change: 3.47, changePercent: 0.82,
    marketCap: '$3.15T', peRatio: 32.1, high52: 430.82, low52: 362.90, volume: '22.1M', avgVolume: '20.5M', dayHigh: 428.00, dayLow: 422.30, open: 423.50,
  },
  NVDA: {
    ticker: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', price: 875.15, change: 15.28, changePercent: 1.78,
    marketCap: '$2.16T', peRatio: 72.4, high52: 974.00, low52: 393.03, volume: '48.7M', avgVolume: '42.1M', dayHigh: 880.50, dayLow: 865.20, open: 868.00,
  },
  GOOGL: {
    ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', price: 172.45, change: 1.85, changePercent: 1.09,
    marketCap: '$2.12T', peRatio: 25.8, high52: 191.75, low52: 129.40, volume: '25.3M', avgVolume: '22.8M', dayHigh: 173.80, dayLow: 171.20, open: 171.50,
  },
  AMZN: {
    ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', price: 180.35, change: 2.12, changePercent: 1.19,
    marketCap: '$1.87T', peRatio: 60.2, high52: 189.77, low52: 118.35, volume: '38.9M', avgVolume: '35.2M', dayHigh: 181.50, dayLow: 178.80, open: 179.00,
  },
  TSLA: {
    ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', price: 175.42, change: -3.28, changePercent: -1.84,
    marketCap: '$557B', peRatio: 42.8, high52: 299.29, low52: 138.80, volume: '98.5M', avgVolume: '85.3M', dayHigh: 180.20, dayLow: 174.50, open: 179.80,
  },
  META: {
    ticker: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', price: 505.20, change: 6.15, changePercent: 1.23,
    marketCap: '$1.29T', peRatio: 27.3, high52: 531.49, low52: 274.40, volume: '15.8M', avgVolume: '14.2M', dayHigh: 508.00, dayLow: 501.30, open: 502.50,
  },
  AMD: {
    ticker: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', price: 164.32, change: 3.78, changePercent: 2.35,
    marketCap: '$265B', peRatio: 232.5, high52: 227.30, low52: 93.12, volume: '55.2M', avgVolume: '48.7M', dayHigh: 166.00, dayLow: 162.10, open: 162.50,
  },
};

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'AMD'];

// ── Mock Technical Indicators ─────────────────────────────────────

function getMockIndicators(ticker: string) {
  const hash = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    rsi: 35 + (hash % 40),       // 35-75 range
    macd: -2 + (hash % 5),       // -2 to +2
    macdSignal: -1 + (hash % 4), // -1 to +2
    bbUpper: 1.05,
    bbMiddle: 1.0,
    bbLower: 0.95,
    maTrend: hash % 3 === 0 ? 'bullish' : hash % 3 === 1 ? 'bearish' : 'neutral',
  };
}

function getMockSignal(ticker: string): { type: SignalType; confidence: number; reason: string; targetBuy: number[]; targetSell: number[]; stopLoss: number } {
  const info = STOCK_DB[ticker];
  if (!info) return { type: 'HOLD', confidence: 50, reason: '等待信号', targetBuy: [], targetSell: [], stopLoss: 0 };

  const hash = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const signals: SignalType[] = ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'];
  const type = signals[hash % signals.length];
  const basePrice = info.price;

  const reasons = [
    'RSI超卖信号，价格触及支撑位，MACD金叉确认',
    '价格突破20日均线，成交量放大1.3倍',
    '布林带下轨反弹，RSI脱离超卖区间',
    '均线多头排列，上升趋势确认',
    'RSI超买，价格接近阻力位，MACD死叉',
    '价格跌破60日支撑，成交量萎缩',
  ];

  return {
    type,
    confidence: 55 + (hash % 40),
    reason: reasons[hash % reasons.length],
    targetBuy: [basePrice * 0.98, basePrice * 0.95, basePrice * 0.92],
    targetSell: [basePrice * 1.05, basePrice * 1.10, basePrice * 1.15],
    stopLoss: basePrice * 0.90,
  };
}

// ── Mini Gauge Component ──────────────────────────────────────────

function MiniGauge({ label, value, min, max, zones, signal }: IndicatorGauge) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const activeZone = zones.find(z => value >= z.min && value < z.max) || zones[zones.length - 1];

  return (
    <div className="bg-bg-card rounded-xl border border-border-default p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-primary">{label}</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: `${activeZone.color}20`, color: activeZone.color }}>
          {signal}
        </span>
      </div>
      <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
        {zones.map((z, i) => (
          <div
            key={i}
            className="absolute h-full rounded-full"
            style={{
              left: `${Math.max(0, ((z.min - min) / (max - min)) * 100)}%`,
              width: `${Math.min(100, ((z.max - z.min) / (max - min)) * 100)}%`,
              backgroundColor: `${z.color}30`,
            }}
          />
        ))}
        <div
          className="absolute top-0 h-full w-1 rounded-full transition-all duration-700"
          style={{ left: `${pct}%`, backgroundColor: activeZone.color }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-text-muted font-mono">{min}</span>
        <span className="text-lg font-bold font-mono" style={{ color: activeZone.color }}>
          {typeof value === 'number' && Math.abs(value) < 10 ? value.toFixed(2) : Math.round(value)}
        </span>
        <span className="text-[10px] text-text-muted font-mono">{max}</span>
      </div>
    </div>
  );
}

// ── RSI Mini Chart ────────────────────────────────────────────────

function RSIMiniChart({ rsi }: { rsi: number }) {
  const data = useMemo(() => {
    const pts = [];
    let v = 50;
    for (let i = 0; i < 30; i++) {
      v += (Math.random() - 0.5) * 12;
      v = Math.max(10, Math.min(90, v));
      pts.push({ v: i, value: v });
    }
    pts[pts.length - 1].value = rsi;
    return pts;
  }, [rsi]);

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="rsiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D9C0" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00D9C0" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <ReferenceLine y={70} stroke="#FF1744" strokeDasharray="3 3" strokeOpacity={0.5} />
        <ReferenceLine y={30} stroke="#00E676" strokeDasharray="3 3" strokeOpacity={0.5} />
        <ReferenceLine y={50} stroke="#1E293B" strokeDasharray="3 3" />
        <Area type="monotone" dataKey="value" stroke="#00D9C0" fill="url(#rsiGrad)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── MACD Mini Chart ───────────────────────────────────────────────

function MACDMiniChart({ macd, signal }: { macd: number; signal: number }) {
  const data = useMemo(() => {
    const pts = [];
    let m = 0;
    let s = 0;
    for (let i = 0; i < 30; i++) {
      m += (Math.random() - 0.5) * 1.5;
      s += (Math.random() - 0.5) * 1.0;
      pts.push({ v: i, macd: m, signal: s, hist: m - s });
    }
    pts[pts.length - 1] = { v: 29, macd, signal, hist: macd - signal };
    return pts;
  }, [macd, signal]);

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data}>
        <ReferenceLine y={0} stroke="#1E293B" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="macd" stroke="#00D9C0" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="signal" stroke="#F472B6" strokeWidth={1.5} dot={false} />
        <Bar dataKey="hist" fill="rgba(0, 217, 192, 0.3)" radius={[1, 1, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.hist >= 0 ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'} />
          ))}
        </Bar>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Pyramid Visual Component ──────────────────────────────────────

function PyramidVisual({ levels }: { levels: PyramidLevel[] }) {
  const maxRatio = Math.max(...levels.map(l => l.ratio));
  const colors = ['#00E676', '#00E676', '#00D9C0', '#00D9C0', '#FBBF24', '#FBBF24', '#FF6B35'];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1">金字塔可视化</span>
      <div className="flex flex-col-reverse items-center gap-1">
        {levels.map((level, i) => {
          const width = 30 + (level.ratio / maxRatio) * 60;
          return (
            <div
              key={level.level}
              className="h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300"
              style={{
                width: `${width}%`,
                backgroundColor: `${colors[i]}25`,
                border: `1px solid ${colors[i]}60`,
                color: colors[i],
              }}
              title={`L${level.level}: $${level.price} x ${level.shares}股 = $${level.investment.toFixed(0)}`}
            >
              L{level.level} — ${level.price.toFixed(2)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Analysis Page ────────────────────────────────────────────

export default function Analysis() {
  const [searchInput, setSearchInput] = useState('');
  const [ticker, setTicker] = useState('AAPL');
  const mounted = true;
  const [showSuggestions, setShowSuggestions] = useState(false);


  const stock = STOCK_DB[ticker];

  const historicalData = useMemo(() =>
    generateHistoricalData(120, stock?.price || 180, 0.018),
    [ticker, stock?.price]
  );

  const indicators = useMemo(() => getMockIndicators(ticker), [ticker]);
  const signal = useMemo(() => getMockSignal(ticker), [ticker]);

  const pyramidLevels = useMemo(() => {
    if (!stock) return [];
    return generatePyramidLevels({
      basePrice: stock.price,
      stepPercent: 3.5,
      baseShares: 10,
      maxLevels: 7,
    });
  }, [ticker, stock]);

  const pyramidSummary = useMemo(() => getPyramidSummary(pyramidLevels), [pyramidLevels]);

  const chartSignals = useMemo(() => {
    if (!stock) return [];
    const pts: { time: number; price: number; type: 'BUY' | 'SELL' }[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * historicalData.length);
      const pt = historicalData[idx];
      if (pt) {
        pts.push({
          time: pt.date.getTime() / 1000,
          price: pt.low * 0.998,
          type: i % 2 === 0 ? 'BUY' : 'SELL',
        });
      }
    }
    return pts;
  }, [historicalData, stock]);

  const handleSearch = useCallback(() => {
    const clean = searchInput.trim().toUpperCase();
    if (STOCK_DB[clean]) {
      setTicker(clean);
      setShowSuggestions(false);
    }
  }, [searchInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const filteredSuggestions = useMemo(() => {
    const q = searchInput.trim().toUpperCase();
    if (!q) return [];
    return POPULAR_TICKERS.filter(t => t.includes(q));
  }, [searchInput]);

  const cardStyle = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  if (!stock) return null;

  const isUp = stock.change >= 0;
  const pct52 = ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100;

  return (
    <div className="max-w-[1440px] mx-auto p-4 lg:p-6 space-y-6">
      {/* SECTION 1: Page Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">个股分析</h1>
          <p className="text-sm text-text-secondary">深度技术分析与K线图表</p>
        </div>
      </div>

      {/* SECTION 2: Search Bar */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-5"
        style={cardStyle(0)}
      >
        <div className="flex gap-3 max-w-xl relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value.toUpperCase()); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="输入股票代码 (如: AAPL, MSFT, NVDA)"
              className="w-full h-10 pl-10 pr-4 bg-bg-elevated border border-border-default rounded-lg text-text-primary text-sm font-mono placeholder:text-text-dim focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all"
            />
            {/* Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border-default rounded-lg overflow-hidden z-50 shadow-card">
                {filteredSuggestions.map(t => (
                  <button
                    key={t}
                    className="w-full text-left px-4 py-2.5 text-sm font-mono text-text-primary hover:bg-accent-primary/10 transition-colors flex items-center justify-between"
                    onClick={() => { setSearchInput(t); setTicker(t); setShowSuggestions(false); }}
                  >
                    <span>{t}</span>
                    <span className="text-xs text-text-muted">{STOCK_DB[t]?.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-10 px-6 bg-accent-primary text-bg-primary font-semibold text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            分析
          </button>
        </div>
        {/* Quick Ticker Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {POPULAR_TICKERS.map(t => (
            <button
              key={t}
              onClick={() => { setSearchInput(t); setTicker(t); }}
              className={cn(
                'px-3 py-1 text-xs font-mono rounded-full border transition-all duration-200',
                ticker === t
                  ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/40'
                  : 'text-text-muted border-border-default hover:border-border-hover hover:text-text-secondary'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: Stock Header */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6"
        style={{
          ...cardStyle(80),
          borderLeftWidth: 4,
          borderLeftColor: isUp ? '#00E676' : '#FF1744',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Ticker + Name */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-text-primary font-heading">{stock.ticker}</span>
              <span className="text-[11px] text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full font-mono">{stock.exchange}</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">{stock.name}</p>
          </div>

          {/* Center: Price Stats */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <div className="text-[32px] font-bold font-mono text-text-primary leading-none">
                ${stock.price.toFixed(2)}
              </div>
              <div className={cn('flex items-center gap-1 mt-1 text-sm font-mono font-semibold', isUp ? 'text-signal-bullish' : 'text-signal-bearish')}>
                {isUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-[10px] text-text-muted uppercase block">市值</span>
                <span className="font-mono text-text-primary">{stock.marketCap}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">P/E</span>
                <span className="font-mono text-text-primary">{stock.peRatio}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">成交量</span>
                <span className="font-mono text-text-primary">{stock.volume}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">均量</span>
                <span className="font-mono text-text-primary">{stock.avgVolume}</span>
              </div>
            </div>
          </div>

          {/* Right: Signal */}
          <div className="flex flex-col items-start lg:items-end gap-2">
            <SignalBadge signal={signal.type} size="lg" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-muted">信号强度</span>
              <div className="w-20 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${signal.confidence}%`,
                    backgroundColor: signal.type.includes('BUY') ? '#00E676' : signal.type.includes('SELL') ? '#FF1744' : '#FBBF24',
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-text-primary">{signal.confidence}%</span>
            </div>
          </div>
        </div>

        {/* 52W Range */}
        <div className="mt-4 pt-4 border-t border-border-default">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-text-muted font-mono">52周区间</span>
            <span className="font-mono text-text-secondary">${stock.low52.toFixed(2)}</span>
            <div className="flex-1 h-1.5 bg-bg-elevated rounded-full relative max-w-[200px]">
              <div className="h-full rounded-full" style={{ width: `${pct52}%`, backgroundColor: isUp ? '#00E676' : '#FF1744' }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-accent-primary" style={{ left: `${pct52}%` }} />
            </div>
            <span className="font-mono text-text-secondary">${stock.high52.toFixed(2)}</span>
            <span className="text-[10px] text-text-muted ml-2">当前处于 {pct52.toFixed(0)}% 位置</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Main K-line Chart */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-5"
        style={cardStyle(160)}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-heading">K线图</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted uppercase">均线</span>
            <span className="text-[10px] font-mono text-chart-ma5">MA5</span>
            <span className="text-[10px] text-text-muted">|</span>
            <span className="text-[10px] font-mono text-chart-ma20">MA20</span>
            <span className="text-[10px] text-text-muted">|</span>
            <span className="text-[10px] font-mono text-chart-ma60">MA60</span>
            <span className="text-[10px] text-text-muted ml-2">|</span>
            <span className="text-[10px] font-mono text-signal-bullish ml-2">● 买入</span>
            <span className="text-[10px] font-mono text-signal-bearish ml-1">● 卖出</span>
          </div>
        </div>
        <div style={{ height: 480 }}>
          <CandlestickChart
            data={historicalData}
            signals={chartSignals}
            showVolume={true}
            showMA={true}
            height={480}
          />
        </div>

        {/* Support/Resistance Levels */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '阻力位 R2', price: stock.price * 1.08, color: '#FF1744', type: 'resistance' as const },
            { label: '阻力位 R1', price: stock.price * 1.04, color: '#FF9800', type: 'resistance' as const },
            { label: '支撑位 S1', price: stock.price * 0.96, color: '#00E676', type: 'support' as const },
            { label: '支撑位 S2', price: stock.price * 0.92, color: '#00D9C0', type: 'support' as const },
          ].map(level => {
            const pct = ((level.price - stock.price) / stock.price) * 100;
            return (
              <div key={level.label} className="bg-bg-elevated rounded-lg p-3 border-l-2" style={{ borderColor: level.color }}>
                <span className="text-[10px] text-text-muted uppercase">{level.label}</span>
                <div className="text-sm font-mono font-bold mt-0.5" style={{ color: level.color }}>
                  ${level.price.toFixed(2)}
                </div>
                <span className={cn('text-[10px] font-mono', pct >= 0 ? 'text-signal-bullish' : 'text-signal-bearish')}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: Signal Panel */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-5"
        style={cardStyle(240)}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary font-heading">信号分析</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Signal Card */}
          <div className="bg-bg-elevated rounded-lg p-5 border" style={{ borderLeftWidth: 4, borderLeftColor: signal.type.includes('BUY') ? '#00E676' : signal.type.includes('SELL') ? '#FF1744' : '#FBBF24' }}>
            <div className="flex items-center justify-between mb-3">
              <SignalBadge signal={signal.type} size="lg" />
              <span className="text-[11px] text-text-muted">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-text-muted uppercase">信号原因</span>
                <p className="text-sm text-text-secondary leading-relaxed mt-0.5">{signal.reason}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase">置信度</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${signal.confidence}%`,
                        backgroundColor: signal.type.includes('BUY') ? '#00E676' : signal.type.includes('SELL') ? '#FF1744' : '#FBBF24',
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono font-bold text-text-primary">{signal.confidence}%</span>
                </div>
              </div>
              {/* Target Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-text-muted uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-signal-bullish" /> 目标买入价
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {signal.targetBuy.map((p, i) => (
                      <span key={i} className="text-xs font-mono bg-signal-bullish-dim text-signal-bullish px-2 py-0.5 rounded">
                        ${p.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-signal-bearish" /> 目标卖出价
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {signal.targetSell.map((p, i) => (
                      <span key={i} className="text-xs font-mono bg-signal-bearish-dim text-signal-bearish px-2 py-0.5 rounded">
                        ${p.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Stop Loss */}
              <div className="flex items-center gap-2 pt-2 border-t border-border-default">
                <Shield className="w-4 h-4 text-signal-bearish" />
                <span className="text-xs text-text-muted">止损价:</span>
                <span className="text-sm font-mono font-bold text-signal-bearish">${signal.stopLoss.toFixed(2)}</span>
                <span className="text-[10px] text-text-muted ml-auto">
                  风险: {((1 - signal.stopLoss / stock.price) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Signal History */}
          <div className="bg-bg-elevated rounded-lg p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">历史信号</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {[
                { date: '2024-06-10', type: 'BUY' as SignalType, price: 182.50, result: '+3.7%' },
                { date: '2024-05-28', type: 'SELL' as SignalType, price: 191.20, result: '-1.2%' },
                { date: '2024-05-15', type: 'STRONG_BUY' as SignalType, price: 178.30, result: '+6.1%' },
                { date: '2024-04-22', type: 'HOLD' as SignalType, price: 185.60, result: '+2.0%' },
                { date: '2024-04-08', type: 'BUY' as SignalType, price: 180.10, result: '+5.1%' },
                { date: '2024-03-20', type: 'SELL' as SignalType, price: 175.40, result: '+7.9%' },
              ].map((s, idx) => {
                const isProfit = s.result.startsWith('+');
                return (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                    <div className="flex items-center gap-2">
                      <SignalBadge signal={s.type} size="sm" />
                      <span className="text-xs text-text-muted font-mono">{s.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-primary">${s.price.toFixed(2)}</span>
                      <span className={cn('text-xs font-mono', isProfit ? 'text-signal-bullish' : 'text-signal-bearish')}>
                        {s.result}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-border-default flex items-center gap-4 text-[11px]">
              <span className="text-text-muted">胜率: <span className="font-mono text-signal-bullish font-bold">75%</span></span>
              <span className="text-text-muted">总信号: <span className="font-mono text-text-primary font-bold">12</span></span>
              <span className="text-text-muted">总盈亏: <span className="font-mono text-signal-bullish font-bold">+$3,240</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Technical Indicators */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style={cardStyle(320)}
      >
        {/* RSI */}
        <MiniGauge
          label="RSI (14)"
          value={indicators.rsi}
          min={0}
          max={100}
          zones={[
            { min: 0, max: 30, label: '超卖', color: '#00E676' },
            { min: 30, max: 50, label: '偏弱', color: '#00D9C0' },
            { min: 50, max: 70, label: '偏强', color: '#FBBF24' },
            { min: 70, max: 100, label: '超买', color: '#FF1744' },
          ]}
          signal={indicators.rsi < 30 ? '超卖' : indicators.rsi > 70 ? '超买' : '中性'}
        />
        <div className="bg-bg-card rounded-xl border border-border-default p-4 sm:col-span-1">
          <RSIMiniChart rsi={indicators.rsi} />
        </div>

        {/* MACD */}
        <MiniGauge
          label="MACD"
          value={indicators.macd}
          min={-5}
          max={5}
          zones={[
            { min: -5, max: 0, label: '看跌', color: '#FF1744' },
            { min: 0, max: 5, label: '看涨', color: '#00E676' },
          ]}
          signal={indicators.macd > 0 ? '金叉看涨' : '死叉看跌'}
        />
        <div className="bg-bg-card rounded-xl border border-border-default p-4 sm:col-span-1">
          <MACDMiniChart macd={indicators.macd} signal={indicators.macdSignal} />
        </div>

        {/* Bollinger Bands */}
        <MiniGauge
          label="布林带位置"
          value={50 + (indicators.macd * 10)}
          min={0}
          max={100}
          zones={[
            { min: 0, max: 20, label: '下轨', color: '#00E676' },
            { min: 20, max: 80, label: '通道内', color: '#FBBF24' },
            { min: 80, max: 100, label: '上轨', color: '#FF1744' },
          ]}
          signal={50 + (indicators.macd * 10) > 80 ? '触及上轨' : 50 + (indicators.macd * 10) < 20 ? '触及下轨' : '通道中部'}
        />

        {/* MA Trend */}
        <MiniGauge
          label="均线趋势"
          value={indicators.maTrend === 'bullish' ? 75 : indicators.maTrend === 'bearish' ? 25 : 50}
          min={0}
          max={100}
          zones={[
            { min: 0, max: 40, label: '空头排列', color: '#FF1744' },
            { min: 40, max: 60, label: '纠缠', color: '#FBBF24' },
            { min: 60, max: 100, label: '多头排列', color: '#00E676' },
          ]}
          signal={indicators.maTrend === 'bullish' ? '多头排列' : indicators.maTrend === 'bearish' ? '空头排列' : '均线纠缠'}
        />
      </div>

      {/* SECTION 7: Pyramid Position Builder */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6"
        style={cardStyle(400)}
      >
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary font-heading">金字塔仓位构建器</h2>
          <span className="text-[10px] text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full ml-2">1-1-1.5-1.5-2-2-3</span>
        </div>

        {pyramidSummary && (
          <div className="mb-4 p-3 bg-bg-elevated rounded-lg border border-border-default">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] text-text-muted uppercase block">总投资</span>
                <span className="text-sm font-mono font-bold text-text-primary">${pyramidSummary.totalInvestment.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">总股数</span>
                <span className="text-sm font-mono font-bold text-text-primary">{pyramidSummary.totalShares}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">均价</span>
                <span className="text-sm font-mono font-bold text-accent-primary">${pyramidSummary.averageCost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">最大回撤</span>
                <span className="text-sm font-mono font-bold text-signal-bearish">{pyramidSummary.maxDrawdown}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pyramid Table */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted border-b border-border-default">
                    <th className="text-left py-2 px-2 font-medium">层级</th>
                    <th className="text-center py-2 px-2 font-medium">比例</th>
                    <th className="text-right py-2 px-2 font-medium">价格</th>
                    <th className="text-right py-2 px-2 font-medium">股数</th>
                    <th className="text-right py-2 px-2 font-medium">投资额</th>
                    <th className="text-right py-2 px-2 font-medium">累计股数</th>
                    <th className="text-right py-2 px-2 font-medium">均价</th>
                  </tr>
                </thead>
                <tbody>
                  {pyramidLevels.map((level, i) => {
                    const colors = ['#00E676', '#00E676', '#00D9C0', '#00D9C0', '#FBBF24', '#FBBF24', '#FF6B35'];
                    return (
                      <tr key={level.level} className="border-b border-border-default last:border-0 hover:bg-bg-elevated transition-colors">
                        <td className="py-2.5 px-2">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-bg-primary" style={{ backgroundColor: colors[i] }}>
                              {level.level}
                            </span>
                            <span className="text-text-primary font-semibold">第{level.level}层</span>
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <span className="font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${colors[i]}20`, color: colors[i] }}>
                            {level.ratio}x
                          </span>
                        </td>
                        <td className="text-right py-2.5 px-2 font-mono text-text-primary">${level.price.toFixed(2)}</td>
                        <td className="text-right py-2.5 px-2 font-mono text-text-primary">{level.shares}</td>
                        <td className="text-right py-2.5 px-2 font-mono text-text-primary">${level.investment.toFixed(0)}</td>
                        <td className="text-right py-2.5 px-2 font-mono text-accent-primary font-semibold">{level.cumulativeShares}</td>
                        <td className="text-right py-2.5 px-2 font-mono text-text-primary">${level.averageCost.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pyramid Visual */}
          <div className="bg-bg-elevated rounded-lg p-4">
            <PyramidVisual levels={pyramidLevels} />
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                <p className="text-[11px] text-text-muted leading-relaxed">
                  金字塔建仓法：股价每下跌3.5%加仓一层，比例递增。低位买入更多份额，有效降低平均成本。
                </p>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-accent-primary mt-0.5 shrink-0" />
                <p className="text-[11px] text-text-muted leading-relaxed">
                  从基准价${stock.price.toFixed(2)}开始，每降3.5%建一层，共7层，最大回撤约{pyramidSummary?.maxDrawdown ?? 22}%。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
