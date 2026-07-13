import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Activity, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import VIXGauge from '@/components/VIXGauge';
import CandlestickChart from '@/components/CandlestickChart';
import SignalBadge from '@/components/SignalBadge';
import { getVIXSeverityColor, getVIXActionAdvice } from '@/lib/yahooFinance';
import type { VIXSeverity } from '@/lib/yahooFinance';
import type { HistoricalDataPoint } from '@/lib/yahooFinance';

// ── Types ─────────────────────────────────────────────────────────

interface IndexCard {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  ytdChange: number;
  high52: number;
  low52: number;
  sparkline: number[];
}

interface SectorData {
  name: string;
  etf: string;
  change: number;
  marketCapWeight: number;
}

interface MarketBreadthData {
  advancing: number;
  declining: number;
  unchanged: number;
  newHighs: number;
  newLows: number;
  above200MA: number;
  mclellanOsc: number;
}

// ── Mock Data Generators ──────────────────────────────────────────

function generateSparkline(base: number, points: number, volatility: number): number[] {
  const data: number[] = [base];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.48) * volatility;
    data.push(data[i - 1] + change);
  }
  return data;
}

function generateHistoricalData(days: number, basePrice: number, volatility: number = 0.012): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let price = basePrice;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.49) * volatility;
    const open = price;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, price) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.floor(50000000 + Math.random() * 100000000);
    data.push({ date, open, high, low, close: price, volume });
  }
  return data;
}

// ── Static Mock Data ──────────────────────────────────────────────

const INDICES: IndexCard[] = [
  {
    symbol: 'SPX', name: 'S&P 500', price: 5247.83, change: 64.28, changePercent: 1.24,
    ytdChange: 12.8, high52: 5264.85, low52: 4122.39,
    sparkline: generateSparkline(5180, 20, 15),
  },
  {
    symbol: 'NDX', name: 'NASDAQ 100', price: 18473.52, change: 231.45, changePercent: 1.27,
    ytdChange: 15.3, high52: 18712.75, low52: 14092.75,
    sparkline: generateSparkline(18240, 20, 45),
  },
  {
    symbol: 'DJI', name: 'Dow Jones', price: 39123.66, change: 342.18, changePercent: 0.88,
    ytdChange: 6.2, high52: 39282.08, low52: 32327.20,
    sparkline: generateSparkline(38780, 20, 30),
  },
  {
    symbol: 'RUT', name: 'Russell 2000', price: 2041.47, change: 28.63, changePercent: 1.42,
    ytdChange: 3.8, high52: 2105.80, low52: 1626.45,
    sparkline: generateSparkline(2012, 20, 8),
  },
];

const SECTORS: SectorData[] = [
  { name: 'Technology', etf: 'XLK', change: 2.14, marketCapWeight: 28 },
  { name: 'Healthcare', etf: 'XLV', change: 0.85, marketCapWeight: 13 },
  { name: 'Financials', etf: 'XLF', change: -0.32, marketCapWeight: 13 },
  { name: 'Energy', etf: 'XLE', change: 1.56, marketCapWeight: 4 },
  { name: 'Consumer Disc.', etf: 'XLY', change: 1.23, marketCapWeight: 10 },
  { name: 'Industrials', etf: 'XLI', change: -0.18, marketCapWeight: 8 },
  { name: 'Materials', etf: 'XLB', change: -0.75, marketCapWeight: 2 },
  { name: 'Utilities', etf: 'XLU', change: 0.42, marketCapWeight: 2 },
  { name: 'Real Estate', etf: 'XLRE', change: -1.24, marketCapWeight: 2 },
  { name: 'Communication', etf: 'XLC', change: 0.95, marketCapWeight: 9 },
  { name: 'Consumer Staples', etf: 'XLP', change: -0.45, marketCapWeight: 6 },
];

const VIX_VALUE = 24.5;

const BREADTH: MarketBreadthData = {
  advancing: 1847, declining: 1203, unchanged: 56,
  newHighs: 342, newLows: 58, above200MA: 68, mclellanOsc: 45,
};

// ── Helpers ───────────────────────────────────────────────────────

function getVIXSeverity(vix: number): VIXSeverity {
  if (vix < 20) return 'calm';
  if (vix < 30) return 'elevated';
  if (vix < 40) return 'high';
  if (vix < 50) return 'extreme';
  return 'panic';
}

function getSectorBgColor(change: number): string {
  if (change > 2) return 'rgba(0, 230, 118, 0.35)';
  if (change > 0) return 'rgba(0, 230, 118, 0.15)';
  if (change > -0.5) return 'rgba(255, 255, 255, 0.04)';
  if (change > -2) return 'rgba(255, 23, 68, 0.15)';
  return 'rgba(255, 23, 68, 0.35)';
}

function getSectorTextColor(change: number): string {
  if (change > 0.5) return '#00E676';
  if (change < -0.5) return '#FF1744';
  return '#94A3B8';
}

const VIX_TIERS = [
  { level: '<20', label: '平静', severity: 'calm' as VIXSeverity, cash: '10%', maxPos: '100%', strategy: '标准金字塔' },
  { level: '20-30', label: '警戒', severity: 'elevated' as VIXSeverity, cash: '20%', maxPos: '80%', strategy: '减速建仓' },
  { level: '30-40', label: '焦虑', severity: 'high' as VIXSeverity, cash: '40%', maxPos: '50%', strategy: '等待模式' },
  { level: '40-50', label: '极端', severity: 'extreme' as VIXSeverity, cash: '60%', maxPos: '30%', strategy: '选择性买入' },
  { level: '50+', label: '恐慌', severity: 'panic' as VIXSeverity, cash: '80%', maxPos: '20%', strategy: '激进买入' },
];

const VIX_SPECIAL_TIERS = [
  { vix: 30, action: '开始买入大盘ETF，金字塔第1-2层建仓' },
  { vix: 40, action: '买入个股+ETF组合，部署40%现金储备' },
  { vix: 50, action: '激进买入，部署50%+现金，金字塔第5-7层' },
  { vix: 90, action: '历史性抄底机会，全力建仓，动用所有现金' },
];

// ── Mini Sparkline Component ──────────────────────────────────────

function MiniSparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const chartData = data.map((v, i) => ({ v: i, value: v }));
  return (
    <div style={{ width: 100, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Progress Ring Component ───────────────────────────────────────

function ProgressRing({ value, max, color, size = 80, label, sublabel }: {
  value: number; max: number; color: string; size?: number; label: string; sublabel?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((Math.abs(value) / max) * 100, 100);
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#111827" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={6} strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size, position: 'relative', marginTop: -size }}>
        <span className="text-sm font-bold font-mono" style={{ color }}>{label}</span>
      </div>
      {sublabel && <span className="text-[10px] text-text-muted mt-1">{sublabel}</span>}
    </div>
  );
}

// ── Main Market Page ──────────────────────────────────────────────

export default function Market() {
  const [mounted, setMounted] = useState(false);
  const [activeIndexTab, setActiveIndexTab] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const spyData = useMemo(() => generateHistoricalData(180, 5180, 0.012), []);
  const qqqData = useMemo(() => generateHistoricalData(180, 18200, 0.015), []);
  const diaData = useMemo(() => generateHistoricalData(180, 38800, 0.010), []);
  const rutData = useMemo(() => generateHistoricalData(180, 2000, 0.014), []);

  const indexChartData = [spyData, qqqData, diaData, rutData];
  const indexNames = ['S&P 500 (SPY)', 'NASDAQ 100 (QQQ)', 'Dow Jones (DIA)', 'Russell 2000 (IWM)'];

  const adRatio = BREADTH.advancing / BREADTH.declining;
  const netHighs = BREADTH.newHighs - BREADTH.newLows;

  const vixSeverity = getVIXSeverity(VIX_VALUE);
  const vixColor = getVIXSeverityColor(vixSeverity);
  const currentTier = VIX_TIERS.find(t => {
    if (t.level === '<20') return VIX_VALUE < 20;
    if (t.level === '50+') return VIX_VALUE >= 50;
    const [min, max] = t.level.split('-').map(Number);
    return VIX_VALUE >= min && VIX_VALUE < max;
  }) || VIX_TIERS[1];

  const cardStyle = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  return (
    <div className="max-w-[1440px] mx-auto p-4 lg:p-6 space-y-6">
      {/* SECTION 1: Page Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">市场行情</h1>
          <p className="text-sm text-text-secondary">实时市场数据与VIX恐慌指数</p>
        </div>
      </div>

      {/* SECTION 2: Index Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {INDICES.map((idx, i) => {
          const pct52w = ((idx.price - idx.low52) / (idx.high52 - idx.low52)) * 100;
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="bg-bg-card rounded-xl border border-border-default p-5 hover:border-border-hover hover:shadow-card transition-all duration-300"
              style={cardStyle(i * 80)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-text-primary">{idx.name}</span>
                  <span className="ml-2 text-[10px] font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">{idx.symbol}</span>
                </div>
                <MiniSparkline
                  data={idx.sparkline}
                  color={isUp ? '#00E676' : '#FF1744'}
                  height={35}
                />
              </div>
              <div className="text-[28px] font-bold font-mono text-text-primary leading-none">
                {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn('flex items-center gap-0.5 text-sm font-mono font-semibold', isUp ? 'text-signal-bullish' : 'text-signal-bearish')}>
                  {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%)
                </span>
              </div>
              {/* YTD */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-text-muted">YTD</span>
                <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.abs(idx.ytdChange) / 20 * 100, 100)}%`,
                      backgroundColor: idx.ytdChange >= 0 ? '#00E676' : '#FF1744',
                      transitionDelay: `${600 + i * 100}ms`,
                    }}
                  />
                </div>
                <span className={cn('text-[11px] font-mono', idx.ytdChange >= 0 ? 'text-signal-bullish' : 'text-signal-bearish')}>
                  {idx.ytdChange >= 0 ? '+' : ''}{idx.ytdChange}%
                </span>
              </div>
              {/* 52W Range */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                  <span>52W Low</span>
                  <span>52W High</span>
                </div>
                <div className="h-1 bg-bg-elevated rounded-full relative">
                  <div className="absolute h-full rounded-full" style={{ width: `${pct52w}%`, backgroundColor: '#00D9C0' }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-accent-primary"
                    style={{ left: `${pct52w}%`, transform: `translate(-50%, -50%)` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 3: VIX Decision System */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* VIX Gauge */}
        <div
          className="lg:col-span-2 bg-bg-card rounded-xl border border-border-default p-6"
          style={cardStyle(320)}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-heading">VIX 恐慌指数</h2>
          </div>
          <VIXGauge value={VIX_VALUE} change={1.2} changePercent={5.15} />
        </div>

        {/* Decision Panel */}
        <div
          className="lg:col-span-3 bg-bg-card rounded-xl border border-border-default p-6"
          style={cardStyle(400)}
        >
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4">仓位决策矩阵</h3>

          {/* Current Status */}
          <div
            className="rounded-lg p-4 mb-4 border"
            style={{
              backgroundColor: `${vixColor}10`,
              borderColor: `${vixColor}40`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vixColor }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: vixColor }}>
                {currentTier.label}区间 (VIX {currentTier.level})
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              {getVIXActionAdvice(VIX_VALUE)}
            </p>
          </div>

          {/* Action Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted border-b border-border-default">
                  <th className="text-left py-2 px-2 font-medium">VIX水平</th>
                  <th className="text-center py-2 px-2 font-medium">现金储备</th>
                  <th className="text-center py-2 px-2 font-medium">最大仓位</th>
                  <th className="text-left py-2 px-2 font-medium">策略</th>
                </tr>
              </thead>
              <tbody>
                {VIX_TIERS.map((tier) => {
                  const isActive = tier.level === currentTier.level;
                  const tierColor = getVIXSeverityColor(tier.severity);
                  return (
                    <tr
                      key={tier.level}
                      className={cn(
                        'border-b border-border-default transition-all duration-200',
                        isActive && 'font-semibold'
                      )}
                      style={isActive ? { backgroundColor: `${tierColor}10` } : undefined}
                    >
                      <td className="py-2 px-2">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColor }} />
                          <span style={{ color: isActive ? tierColor : undefined }}>{tier.level} ({tier.label})</span>
                        </span>
                      </td>
                      <td className="text-center py-2 px-2 font-mono text-text-primary">{tier.cash}</td>
                      <td className="text-center py-2 px-2 font-mono text-text-primary">{tier.maxPos}</td>
                      <td className="py-2 px-2 text-text-secondary">{tier.strategy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4-Tier System */}
          <div className="mt-4 space-y-2">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">特殊节点操作</span>
            {VIX_SPECIAL_TIERS.map((tier) => (
              <div
                key={tier.vix}
                className="flex items-start gap-3 rounded-lg p-2.5 bg-bg-elevated border border-border-default"
              >
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${getVIXSeverityColor(getVIXSeverity(tier.vix))}20`, color: getVIXSeverityColor(getVIXSeverity(tier.vix)) }}>
                  VIX={tier.vix}
                </span>
                <span className="text-xs text-text-secondary">{tier.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Sector Heatmap */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-6"
        style={cardStyle(480)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-heading">板块热力图</h2>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-1 rounded bg-[rgba(0,230,118,0.2)] text-[#00E676]">强涨 &gt;+2%</span>
            <span className="px-2 py-1 rounded bg-[rgba(0,230,118,0.1)] text-[#00E676]">上涨</span>
            <span className="px-2 py-1 rounded bg-[rgba(255,255,255,0.04)] text-text-muted">平盘</span>
            <span className="px-2 py-1 rounded bg-[rgba(255,23,68,0.1)] text-[#FF1744]">下跌</span>
            <span className="px-2 py-1 rounded bg-[rgba(255,23,68,0.2)] text-[#FF1744]">强跌 &lt;-2%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SECTORS.map((sector, i) => (
            <div
              key={sector.name}
              className="rounded-lg p-4 border border-transparent transition-all duration-200 hover:scale-[1.03] hover:z-10 hover:shadow-card cursor-pointer"
              style={{
                backgroundColor: getSectorBgColor(sector.change),
                gridColumn: sector.marketCapWeight >= 20 ? 'span 2' : undefined,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="text-xs font-semibold text-text-primary">{sector.name}</div>
              <div className="text-[10px] text-text-muted font-mono mt-0.5">{sector.etf}</div>
              <div className="text-lg font-mono font-bold mt-1" style={{ color: getSectorTextColor(sector.change) }}>
                {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: Market Breadth */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Advance/Decline */}
        <div
          className="lg:col-span-3 bg-bg-card rounded-xl border border-border-default p-6"
          style={cardStyle(560)}
        >
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4">市场广度 — NYSE</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-bg-elevated rounded-lg p-3 text-center">
              <div className="text-[10px] text-text-muted uppercase">上涨</div>
              <div className="text-lg font-mono font-bold text-signal-bullish">{BREADTH.advancing.toLocaleString()}</div>
            </div>
            <div className="bg-bg-elevated rounded-lg p-3 text-center">
              <div className="text-[10px] text-text-muted uppercase">下跌</div>
              <div className="text-lg font-mono font-bold text-signal-bearish">{BREADTH.declining.toLocaleString()}</div>
            </div>
            <div className="bg-bg-elevated rounded-lg p-3 text-center">
              <div className="text-[10px] text-text-muted uppercase">平盘</div>
              <div className="text-lg font-mono font-bold text-text-muted">{BREADTH.unchanged}</div>
            </div>
            <div className="bg-bg-elevated rounded-lg p-3 text-center">
              <div className="text-[10px] text-text-muted uppercase">A/D比率</div>
              <div className={cn('text-lg font-mono font-bold', adRatio >= 1 ? 'text-signal-bullish' : 'text-signal-bearish')}>
                {adRatio.toFixed(2)}
              </div>
            </div>
          </div>
          {/* Mini A/D Chart */}
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                day: i,
                adv: 1500 + Math.sin(i * 0.3) * 300 + Math.random() * 200,
                dec: 1200 + Math.cos(i * 0.3) * 250 + Math.random() * 200,
              }))}>
                <defs>
                  <linearGradient id="advGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00E676" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="decGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1744" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FF1744" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="adv" stroke="#00E676" fill="url(#advGrad)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="dec" stroke="#FF1744" fill="url(#decGrad)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breadth Gauges */}
        <div
          className="lg:col-span-2 bg-bg-card rounded-xl border border-border-default p-6"
          style={cardStyle(640)}
        >
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4">广度指标</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <ProgressRing value={adRatio} max={3} color={adRatio >= 1 ? '#00E676' : '#FF1744'} size={90} label={adRatio.toFixed(2)} sublabel="A/D 比率" />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing value={Math.abs(netHighs)} max={500} color={netHighs >= 0 ? '#00E676' : '#FF1744'} size={90} label={`${netHighs >= 0 ? '+' : ''}${netHighs}`} sublabel="新高/新低净额" />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing value={BREADTH.above200MA} max={100} color={BREADTH.above200MA > 50 ? '#00E676' : '#FF1744'} size={90} label={`${BREADTH.above200MA}%`} sublabel="高于200日均线" />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing value={Math.abs(BREADTH.mclellanOsc)} max={100} color={BREADTH.mclellanOsc >= 0 ? '#00E676' : '#FF1744'} size={90} label={`${BREADTH.mclellanOsc >= 0 ? '+' : ''}${BREADTH.mclellanOsc}`} sublabel="McClellan震荡" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Index Technical Charts */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-6"
        style={cardStyle(720)}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-heading">指数技术分析</h2>
          </div>
          <div className="flex items-center gap-1">
            {indexNames.map((name, i) => (
              <button
                key={name}
                onClick={() => setActiveIndexTab(i)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                  activeIndexTab === i
                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent'
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 450 }}>
          <CandlestickChart
            data={indexChartData[activeIndexTab]}
            showVolume={true}
            showMA={true}
            height={450}
          />
        </div>
        {/* Technical Summary */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-bg-elevated rounded-lg p-3">
            <span className="text-[10px] text-text-muted uppercase">趋势</span>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-signal-bullish" />
              <span className="text-xs font-mono text-signal-bullish">上升趋势</span>
            </div>
          </div>
          <div className="bg-bg-elevated rounded-lg p-3">
            <span className="text-[10px] text-text-muted uppercase">MACD</span>
            <div className="text-xs font-mono text-signal-bullish mt-1">金叉 — 看涨</div>
          </div>
          <div className="bg-bg-elevated rounded-lg p-3">
            <span className="text-[10px] text-text-muted uppercase">RSI(14)</span>
            <div className="text-xs font-mono text-text-primary mt-1">62.4 — 中性</div>
          </div>
          <div className="bg-bg-elevated rounded-lg p-3">
            <span className="text-[10px] text-text-muted uppercase">下一支撑</span>
            <div className="text-xs font-mono text-signal-bullish mt-1">$5,180</div>
          </div>
          <div className="bg-bg-elevated rounded-lg p-3">
            <span className="text-[10px] text-text-muted uppercase">下一阻力</span>
            <div className="text-xs font-mono text-signal-bearish mt-1">$5,320</div>
          </div>
        </div>
      </div>

      {/* SECTION 7: Market Regime Status */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-6 lg:p-8"
        style={cardStyle(800)}
      >
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">市场状态分析</h2>
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="text-2xl lg:text-3xl font-bold text-signal-bullish font-heading">
              上升趋势 — 早期阶段
            </div>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              S&P 500 处于上升20日和60日均线上方。VIX在可控范围内。适合系统性建仓。
            </p>
            <div className="flex items-center gap-3 mt-4">
              <SignalBadge signal="BUY" size="md" />
              <span className="text-xs text-text-muted">置信度: 75%</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[500px]">
            <div className="bg-bg-elevated rounded-lg p-4 border-t-2" style={{ borderColor: '#FF6B35' }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#FF6B35' }}>进取账户</span>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">部署80%配置资金，高贝塔成长股，全金字塔建仓</p>
            </div>
            <div className="bg-bg-elevated rounded-lg p-4 border-t-2" style={{ borderColor: '#00D9C0' }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#00D9C0' }}>稳健账户</span>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">维持现有仓位，回调至20日均线时加仓</p>
            </div>
            <div className="bg-bg-elevated rounded-lg p-4 border-t-2" style={{ borderColor: '#6366F1' }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#6366F1' }}>防御账户</span>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">持有股息贵族，对涨幅过大仓位部分止盈</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
