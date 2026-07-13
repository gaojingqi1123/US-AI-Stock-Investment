import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Wallet,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import VIXGauge from '@/components/VIXGauge';
import SignalBadge from '@/components/SignalBadge';
import type { SignalType } from '@/lib/strategyEngine';

// ── Mock Data ─────────────────────────────────────────────────────

const heroMetrics = [
  { label: 'S&P 500', value: '5,247.83', change: 1.24, icon: TrendingUp, color: '#00E676' },
  { label: 'Active Signals', value: '12', change: 3, icon: Activity, color: '#00D9C0', isAbsolute: true },
  { label: 'Portfolio Value', value: '$847,293.50', change: 2.18, icon: Wallet, color: '#00E676' },
  { label: "Today's P&L", value: '+$18,042.00', change: 2.18, icon: DollarSign, color: '#00E676' },
];

const marketOverview = [
  { symbol: 'SPY', name: 'S&P 500', price: 525.00, change: 1.24, sparkline: [510, 512, 515, 513, 518, 520, 522, 525.00] },
  { symbol: 'QQQ', name: 'NASDAQ 100', price: 487.00, change: 1.27, sparkline: [460, 465, 470, 468, 475, 480, 485, 487.00] },
  { symbol: 'DIA', name: 'Dow Jones', price: 391.50, change: 0.88, sparkline: [385, 386, 387, 388, 389, 390, 390.5, 391.50] },
];

const recentSignals: Array<{
  id: string;
  type: SignalType;
  ticker: string;
  description: string;
  targetPrice: string;
  time: string;
  strategyColor: string;
}> = [
  { id: '1', type: 'BUY', ticker: 'AAPL', description: 'Pyramid Entry L3', targetPrice: '$298.00', time: '5 min ago', strategyColor: '#00E676' },
  { id: '2', type: 'STRONG_BUY', ticker: 'NVDA', description: 'VIX Panic Buy L4', targetPrice: '$165.00', time: '8 min ago', strategyColor: '#00D9C0' },
  { id: '3', type: 'BUY', ticker: 'SPY', description: 'ETF Accumulation', targetPrice: '$545.00', time: '12 min ago', strategyColor: '#6366F1' },
  { id: '4', type: 'SELL', ticker: 'META', description: 'Take Profit 15%', targetPrice: '$695.00', time: '18 min ago', strategyColor: '#FF1744' },
  { id: '5', type: 'HOLD', ticker: 'TSLA', description: 'Wait for Breakout', targetPrice: '$450.00', time: '25 min ago', strategyColor: '#FBBF24' },
  { id: '6', type: 'BUY', ticker: 'AMD', description: 'Support Bounce', targetPrice: '$480.00', time: '32 min ago', strategyColor: '#00E676' },
  { id: '7', type: 'STRONG_BUY', ticker: 'QQQ', description: 'VIX Golden Opportunity', targetPrice: '$410.00', time: '45 min ago', strategyColor: '#00D9C0' },
  { id: '8', type: 'HOLD', ticker: 'GOOGL', description: 'Consolidation', targetPrice: '$175.00', time: '1h ago', strategyColor: '#FBBF24' },
];

const portfolioAccounts = [
  { type: 'aggressive', name: '进取型', percentage: 45, value: 381282, color: '#FF6B35' },
  { type: 'stable', name: '稳健型', percentage: 15, value: 127094, color: '#00D9C0' },
  { type: 'defensive', name: '防御型', percentage: 40, value: 338917, color: '#6366F1' },
];

const watchlist = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 312.66, change: 1.45, signal: 'BUY' as SignalType, maStatus: 'Golden Cross', volume: 52400000 },
  { symbol: 'MSFT', name: 'Microsoft', price: 425.00, change: 0.82, signal: 'HOLD' as SignalType, maStatus: 'Above MA20', volume: 22100000 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 170.00, change: -0.35, signal: 'HOLD' as SignalType, maStatus: 'Sideways', volume: 18900000 },
  { symbol: 'AMZN', name: 'Amazon', price: 195.00, change: 1.12, signal: 'BUY' as SignalType, maStatus: 'Above MA5', volume: 31200000 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 195.55, change: 3.25, signal: 'STRONG_BUY' as SignalType, maStatus: 'Golden Cross', volume: 48700000 },
  { symbol: 'META', name: 'Meta', price: 600.29, change: -0.68, signal: 'HOLD' as SignalType, maStatus: 'Above MA20', volume: 15600000 },
  { symbol: 'TSLA', name: 'Tesla', price: 419.77, change: 2.15, signal: 'HOLD' as SignalType, maStatus: 'Above MA20', volume: 98400000 },
  { symbol: 'AMD', name: 'AMD', price: 552.05, change: 2.18, signal: 'HOLD' as SignalType, maStatus: 'Above MA20', volume: 45600000 },
];

const strategyCards = [
  { title: 'VIX Panic Index', description: '5-tier decision system: <20 calm, 20-30 elevated, 30-40 high anxiety, 40-50 extreme fear, 50+ market panic', color: '#FF9800', icon: Activity },
  { title: 'Pyramid Building', description: 'Position scaling: 1-1-1.5-1.5-2-2-3 ratio units. 7 levels with decreasing step intervals', color: '#00E676', icon: TrendingUp },
  { title: 'Three Accounts', description: 'Aggressive 45% / Stable 15% / Defensive 40%. Independent tracking per account', color: '#6366F1', icon: Wallet },
  { title: 'Golden Ratio', description: 'Position sizing: max 61.8% of available capital per single holding', color: '#D4AF37', icon: DollarSign },
  { title: 'Negative Cost', description: 'Track effective cost basis reduction through dividend capture and covered calls', color: '#00D9C0', icon: Activity },
  { title: 'Technical Signals', description: 'MA crossover, MACD divergence, RSI extremes, support/resistance breakout detection', color: '#F472B6', icon: TrendingUp },
];

// ── Mini Sparkline Component ──────────────────────────────────────

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const color = positive ? '#00E676' : '#FF1744';

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={color}
        opacity="0.1"
      />
    </svg>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const totalPortfolio = portfolioAccounts.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="max-w-[1440px] mx-auto p-4 lg:p-6 space-y-6">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Hero Metrics Bar                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heroMetrics.map((metric, i) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;

          return (
            <div
              key={metric.label}
              className="relative bg-bg-card rounded-xl border border-border-default p-5 overflow-hidden hover:border-border-hover transition-all duration-300 hover:shadow-card"
              style={{
                borderLeft: `3px solid ${metric.color}`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
              }}
            >
              {/* Icon top-right */}
              <div className="absolute top-4 right-4">
                <Icon className="w-4 h-4 text-text-dim" />
              </div>

              {/* Label */}
              <span className="text-xs text-text-muted uppercase tracking-wider">{metric.label}</span>

              {/* Value */}
              <div className="mt-2 text-2xl lg:text-3xl font-bold font-mono text-text-primary">
                {metric.value}
              </div>

              {/* Change */}
              <div className="mt-2 flex items-center gap-1">
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-signal-bullish" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-signal-bearish" />
                )}
                <span
                  className={`text-sm font-mono font-medium ${
                    metric.isAbsolute
                      ? 'text-accent-primary'
                      : isPositive
                      ? 'text-signal-bullish'
                      : 'text-signal-bearish'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {metric.isAbsolute ? `${metric.change} today` : `${metric.change}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Main Grid (2/3 + 1/3)                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── 2A: Market Overview (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="bg-bg-card rounded-xl border border-border-default p-5"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 240ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 240ms',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Market Overview</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-bullish opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-bullish" />
                </span>
                <span className="text-[11px] text-signal-bullish font-mono font-medium">LIVE</span>
              </div>
            </div>

            {/* Sparkline rows */}
            <div className="space-y-3">
              {marketOverview.map((market) => {
                const isPositive = market.change >= 0;
                return (
                  <div
                    key={market.symbol}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-elevated/50 transition-colors"
                  >
                    {/* Symbol & Name */}
                    <div className="w-32 shrink-0">
                      <div className="text-sm font-mono font-bold text-text-primary">{market.symbol}</div>
                      <div className="text-[11px] text-text-muted">{market.name}</div>
                    </div>

                    {/* Sparkline */}
                    <MiniSparkline data={market.sparkline} positive={isPositive} />

                    {/* Price */}
                    <div className="ml-auto text-right">
                      <div className="text-base font-mono font-semibold text-text-primary">
                        {market.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-mono ${isPositive ? 'text-signal-bullish' : 'text-signal-bearish'}`}>
                        {isPositive ? '+' : ''}{market.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2C: Recent Signal Feed ── */}
          <div
            className="bg-bg-card rounded-xl border border-border-default p-5"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 320ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 320ms',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Recent Signals</h3>
              <Link
                to="/signals"
                className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Signal rows */}
            <div className="space-y-1">
              {recentSignals.map((signal, i) => (
                <div
                  key={signal.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-elevated/50 transition-colors"
                  style={{
                    borderLeft: signal.type.includes('BUY')
                      ? '2px solid #00E676'
                      : signal.type.includes('SELL')
                      ? '2px solid #FF1744'
                      : '2px solid #FBBF24',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * 50}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * 50}ms`,
                  }}
                >
                  <SignalBadge signal={signal.type} size="sm" />
                  <span className="text-sm font-mono font-semibold text-text-primary w-14">{signal.ticker}</span>
                  <span className="text-sm text-text-secondary">—</span>
                  <span className="text-sm text-text-secondary truncate flex-1">{signal.description}</span>
                  <span className="text-sm font-mono text-accent-primary">Target: {signal.targetPrice}</span>
                  <span className="text-xs text-text-muted w-16 text-right">{signal.time}</span>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: signal.strategyColor }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2B: VIX Panic Index Gauge (1/3) ── */}
        <div className="space-y-4">
          <div
            className="bg-bg-card rounded-xl border border-border-default p-5"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 240ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 240ms',
            }}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">VIX Panic Index</h3>
            <VIXGauge value={24.5} change={1.2} changePercent={5.15} />
          </div>

          {/* ── 2D: Portfolio Snapshot ── */}
          <div
            className="bg-bg-card rounded-xl border border-border-default p-5"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 320ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 320ms',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Portfolio Snapshot</h3>
              <Link
                to="/portfolio"
                className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
              >
                Manage
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Total Value */}
            <div className="text-3xl font-bold font-mono text-accent-primary mb-1">
              ${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mb-4">
              <ArrowUpRight className="w-3.5 h-3.5 text-signal-bullish" />
              <span className="text-sm font-mono text-signal-bullish">+$18,042.00 (+2.18%)</span>
            </div>

            {/* Stacked Bar */}
            <div className="h-2 rounded-full overflow-hidden flex bg-bg-elevated mb-3">
              {portfolioAccounts.map((account) => (
                <div
                  key={account.type}
                  className="h-full transition-all duration-800"
                  style={{
                    width: `${account.percentage}%`,
                    backgroundColor: account.color,
                  }}
                />
              ))}
            </div>

            {/* Account breakdown */}
            <div className="space-y-2 mb-4">
              {portfolioAccounts.map((account) => (
                <div key={account.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: account.color }} />
                    <span className="text-xs text-text-secondary">{account.name} ({account.percentage}%)</span>
                  </div>
                  <span className="text-xs font-mono text-text-primary">
                    ${account.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Cash Reserve */}
            <div className="pt-3 border-t border-border-default mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Cash Reserve</span>
                <span className="text-xs font-mono text-text-secondary">$127,094.00 (15%)</span>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Max Drawdown', value: '-8.4%' },
                { label: 'Sharpe Ratio', value: '1.82' },
                { label: 'Beta', value: '0.94' },
                { label: 'Win Rate', value: '68.3%' },
              ].map((metric) => (
                <div key={metric.label} className="bg-bg-elevated rounded-lg p-2.5">
                  <div className="text-[10px] text-text-muted mb-1">{metric.label}</div>
                  <div className="text-sm font-mono font-semibold text-text-primary">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2E: Watchlist Table (Full Width)                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        className="bg-bg-card rounded-xl border border-border-default overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 400ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 400ms',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h3 className="text-lg font-semibold text-text-primary">Watchlist</h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated text-left">
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider text-right">Price</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider text-right">Change %</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Signal</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">MA Status</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Volume</th>
                <th className="px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((stock, i) => {
                const isPositive = stock.change >= 0;
                const maxVolume = 100000000;
                const volumePercent = Math.min((stock.volume / maxVolume) * 100, 100);

                return (
                  <tr
                    key={stock.symbol}
                    className="border-t border-border-default hover:bg-bg-elevated/50 transition-colors"
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${500 + i * 50}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) ${500 + i * 50}ms, background-color 150ms`,
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-text-primary">{stock.symbol}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{stock.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-primary text-right">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-mono ${isPositive ? 'text-signal-bullish' : 'text-signal-bearish'}`}>
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SignalBadge signal={stock.signal} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{stock.maStatus}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${volumePercent}%`,
                              backgroundColor: 'rgba(0, 217, 192, 0.5)',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-text-muted">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/analysis?ticker=${stock.symbol}`}
                        className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors font-medium"
                      >
                        Analyze →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Strategy Quick Reference                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        className="space-y-4"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 600ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 600ms',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary font-heading">Strategy Framework</h2>
          <Link
            to="/strategy"
            className="flex items-center gap-1 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
          >
            Full Guide
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategyCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to="/strategy"
                className="group bg-bg-card rounded-xl border border-border-default p-5 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
                  transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${700 + i * 80}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${700 + i * 80}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>

                {/* Title */}
                <h4 className="text-base font-semibold text-text-primary mb-2">{card.title}</h4>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{card.description}</p>

                {/* Bottom accent line */}
                <div
                  className="mt-4 h-[3px] rounded-full transition-all duration-200 group-hover:h-1"
                  style={{
                    backgroundColor: card.color,
                    width: '40%',
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
