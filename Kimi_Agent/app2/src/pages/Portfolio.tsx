import { useState, useMemo, useCallback } from 'react';
import type { AccountType, SignalType } from '@/lib/strategyEngine';
import SignalBadge from '@/components/SignalBadge';
import {
  Wallet,
  Zap,
  Shield,
  Lock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  Minus,
  Info,
  CheckCircle2,
  RefreshCw,
  DollarSign,
  Percent,
  BarChart3,
  Layers,
  Target,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────

interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  account: AccountType;
  signal: SignalType;
  weight: number;
}

interface NegativeCostHolding {
  ticker: string;
  name: string;
  originalCost: number;
  totalIncome: number;
  effectiveCost: number;
  status: 'negative' | 'near-zero';
  monthlyIncome: number;
  yieldOnZero: number;
}

interface RiskMetric {
  label: string;
  value: string;
  numericValue: number;
  rating: 'excellent' | 'good' | 'monitor' | 'alert';
  ratingLabel: string;
}

interface PyramidBuild {
  ticker: string;
  name: string;
  account: AccountType;
  status: 'in_progress' | 'complete';
  levels: {
    level: number;
    target: number;
    filled: number;
    price: number;
    avgCost: number;
    complete: boolean;
  }[];
  totalDeployed: number;
  totalTarget: number;
  currentPrice: number;
  unrealizedPnl: number;
}

// ── Mock Data ─────────────────────────────────────────────────────

const ACCOUNT_COLORS: Record<AccountType, string> = {
  aggressive: '#FF6B35',
  stable: '#00D9C0',
  defensive: '#6366F1',
};

const ACCOUNT_NAMES: Record<AccountType, string> = {
  aggressive: '进取型',
  stable: '稳健型',
  defensive: '防御型',
};

const ACCOUNT_ICONS = {
  aggressive: Zap,
  stable: Shield,
  defensive: Lock,
};

const ACCOUNT_GOALS: Record<AccountType, string> = {
  aggressive: '高成长股票。目标：年化15-25%。完整金字塔部署。',
  stable: '蓝筹股息股。目标：年化8-12%。择时入场。',
  defensive: '防御性股息贵族+债券。目标：年化5-8%。资本保值。',
};

const mockPositions: Position[] = [
  // Aggressive Account
  { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 350, avgCost: 142.50, currentPrice: 178.42, account: 'aggressive', signal: 'HOLD', weight: 12.4 },
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 520, avgCost: 175.20, currentPrice: 189.25, account: 'aggressive', signal: 'BUY', weight: 8.7 },
  { ticker: 'TSLA', name: 'Tesla Inc.', shares: 180, avgCost: 242.00, currentPrice: 178.42, account: 'aggressive', signal: 'SELL', weight: 6.2 },
  { ticker: 'AMD', name: 'AMD Inc.', shares: 450, avgCost: 145.80, currentPrice: 168.35, account: 'aggressive', signal: 'BUY', weight: 5.8 },
  { ticker: 'META', name: 'Meta Platforms', shares: 95, avgCost: 480.00, currentPrice: 525.30, account: 'aggressive', signal: 'HOLD', weight: 4.9 },
  { ticker: 'AMZN', name: 'Amazon.com', shares: 220, avgCost: 172.00, currentPrice: 185.60, account: 'aggressive', signal: 'BUY', weight: 4.5 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 180, avgCost: 158.00, currentPrice: 172.45, account: 'aggressive', signal: 'HOLD', weight: 4.1 },
  { ticker: 'CRM', name: 'Salesforce Inc.', shares: 130, avgCost: 285.00, currentPrice: 298.40, account: 'aggressive', signal: 'HOLD', weight: 3.8 },
  { ticker: 'NFLX', name: 'Netflix Inc.', shares: 45, avgCost: 580.00, currentPrice: 645.20, account: 'aggressive', signal: 'HOLD', weight: 3.2 },
  { ticker: 'UBER', name: 'Uber Technologies', shares: 380, avgCost: 58.00, currentPrice: 72.35, account: 'aggressive', signal: 'BUY', weight: 2.9 },
  { ticker: 'COIN', name: 'Coinbase Global', shares: 150, avgCost: 185.00, currentPrice: 162.40, account: 'aggressive', signal: 'HOLD', weight: 2.5 },
  { ticker: 'PLTR', name: 'Palantir Tech', shares: 420, avgCost: 42.00, currentPrice: 58.90, account: 'aggressive', signal: 'STRONG_BUY', weight: 2.3 },
  { ticker: 'ARKK', name: 'ARK Innovation ETF', shares: 280, avgCost: 48.00, currentPrice: 42.15, account: 'aggressive', signal: 'SELL', weight: 1.8 },
  { ticker: 'SQ', name: 'Block Inc.', shares: 140, avgCost: 78.00, currentPrice: 72.50, account: 'aggressive', signal: 'HOLD', weight: 1.5 },
  // Stable Account
  { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 260, avgCost: 380.00, currentPrice: 425.80, account: 'stable', signal: 'BUY', weight: 6.5 },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', shares: 200, avgCost: 362.00, currentPrice: 487.25, account: 'stable', signal: 'HOLD', weight: 6.2 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: 150, avgCost: 445.00, currentPrice: 524.78, account: 'stable', signal: 'BUY', weight: 5.8 },
  { ticker: 'VTI', name: 'Vanguard Total Stock', shares: 180, avgCost: 228.00, currentPrice: 268.45, account: 'stable', signal: 'HOLD', weight: 3.5 },
  // Defensive Account
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', shares: 420, avgCost: 385.00, currentPrice: 412.60, account: 'defensive', signal: 'HOLD', weight: 8.2 },
  { ticker: 'SCHD', name: 'Schwab US Dividend', shares: 650, avgCost: 26.50, currentPrice: 28.40, account: 'defensive', signal: 'BUY', weight: 7.5 },
  { ticker: 'KO', name: 'Coca-Cola Co.', shares: 520, avgCost: 58.00, currentPrice: 62.35, account: 'defensive', signal: 'HOLD', weight: 5.8 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', shares: 280, avgCost: 155.00, currentPrice: 148.20, account: 'defensive', signal: 'HOLD', weight: 4.9 },
  { ticker: 'PG', name: 'Procter & Gamble', shares: 200, avgCost: 158.00, currentPrice: 168.90, account: 'defensive', signal: 'BUY', weight: 4.5 },
  { ticker: 'TLT', name: 'iShares 20+ Yr Treasury', shares: 180, avgCost: 92.00, currentPrice: 89.45, account: 'defensive', signal: 'HOLD', weight: 3.1 },
  { ticker: 'VYM', name: 'Vanguard High Dividend', shares: 220, avgCost: 108.00, currentPrice: 112.30, account: 'defensive', signal: 'HOLD', weight: 2.8 },
  { ticker: 'XLU', name: 'Utilities Select Sector', shares: 350, avgCost: 68.00, currentPrice: 72.15, account: 'defensive', signal: 'HOLD', weight: 2.0 },
];

const negativeCostHoldings: NegativeCostHolding[] = [
  { ticker: 'JNJ', name: 'Johnson & Johnson', originalCost: 8500, totalIncome: 9240, effectiveCost: -740, status: 'negative', monthlyIncome: 142, yieldOnZero: 1.92 },
  { ticker: 'KO', name: 'Coca-Cola', originalCost: 5200, totalIncome: 5680, effectiveCost: -480, status: 'negative', monthlyIncome: 89, yieldOnZero: 1.85 },
  { ticker: 'PG', name: 'Procter & Gamble', originalCost: 6800, totalIncome: 7150, effectiveCost: -350, status: 'negative', monthlyIncome: 112, yieldOnZero: 3.20 },
  { ticker: 'SCHD', name: 'Schwab US Dividend', originalCost: 12500, totalIncome: 11820, effectiveCost: 680, status: 'near-zero', monthlyIncome: 245, yieldOnZero: 0 },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', originalCost: 15200, totalIncome: 14860, effectiveCost: 340, status: 'near-zero', monthlyIncome: 0, yieldOnZero: 0 },
];

const riskMetrics: RiskMetric[] = [
  { label: '夏普比率', value: '1.82', numericValue: 1.82, rating: 'excellent', ratingLabel: '优秀' },
  { label: '索提诺比率', value: '2.14', numericValue: 2.14, rating: 'excellent', ratingLabel: '优秀' },
  { label: '特雷诺比率', value: '8.45', numericValue: 8.45, rating: 'good', ratingLabel: '良好' },
  { label: '信息比率', value: '0.94', numericValue: 0.94, rating: 'good', ratingLabel: '良好' },
  { label: '最大回撤', value: '-8.4%', numericValue: -8.4, rating: 'good', ratingLabel: '可接受' },
  { label: '卡尔玛比率', value: '4.13', numericValue: 4.13, rating: 'excellent', ratingLabel: '优秀' },
  { label: 'Beta', value: '0.94', numericValue: 0.94, rating: 'good', ratingLabel: '市场中性' },
  { label: 'Alpha', value: '4.2%', numericValue: 4.2, rating: 'excellent', ratingLabel: '超额收益' },
  { label: '年化波动率', value: '12.8%', numericValue: 12.8, rating: 'good', ratingLabel: '低' },
  { label: 'VaR (95%)', value: '-$12,450', numericValue: -12450, rating: 'monitor', ratingLabel: '关注' },
  { label: 'CVaR (95%)', value: '-$18,200', numericValue: -18200, rating: 'monitor', ratingLabel: '关注' },
  { label: '与标普相关性', value: '0.87', numericValue: 0.87, rating: 'good', ratingLabel: '—' },
];

const drawdownData = [
  { date: 'Jan', drawdown: 0 },
  { date: 'Feb', drawdown: -1.2 },
  { date: 'Mar', drawdown: -2.8 },
  { date: 'Apr', drawdown: -2.1 },
  { date: 'May', drawdown: -4.5 },
  { date: 'Jun', drawdown: -6.2 },
  { date: 'Jul', drawdown: -5.8 },
  { date: 'Aug', drawdown: -8.4 },
  { date: 'Sep', drawdown: -7.1 },
  { date: 'Oct', drawdown: -5.2 },
  { date: 'Nov', drawdown: -3.8 },
  { date: 'Dec', drawdown: -2.1 },
];

const pyramidBuilds: PyramidBuild[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp.',
    account: 'aggressive',
    status: 'in_progress',
    currentPrice: 178.42,
    unrealizedPnl: 4310,
    totalDeployed: 26000,
    totalTarget: 69500,
    levels: [
      { level: 1, target: 5000, filled: 5000, price: 195.00, avgCost: 195.00, complete: true },
      { level: 2, target: 5000, filled: 5000, price: 189.50, avgCost: 192.25, complete: true },
      { level: 3, target: 7500, filled: 7500, price: 184.00, avgCost: 188.20, complete: true },
      { level: 4, target: 7500, filled: 3500, price: 178.50, avgCost: 185.40, complete: false },
      { level: 5, target: 10000, filled: 0, price: 173.00, avgCost: 0, complete: false },
      { level: 6, target: 10000, filled: 0, price: 167.50, avgCost: 0, complete: false },
      { level: 7, target: 15000, filled: 0, price: 162.00, avgCost: 0, complete: false },
    ],
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    account: 'aggressive',
    status: 'in_progress',
    currentPrice: 189.25,
    unrealizedPnl: 2180,
    totalDeployed: 18000,
    totalTarget: 45000,
    levels: [
      { level: 1, target: 3500, filled: 3500, price: 185.00, avgCost: 185.00, complete: true },
      { level: 2, target: 3500, filled: 3500, price: 180.50, avgCost: 182.75, complete: true },
      { level: 3, target: 5000, filled: 5000, price: 176.00, avgCost: 179.80, complete: true },
      { level: 4, target: 5000, filled: 3000, price: 171.50, avgCost: 178.20, complete: false },
      { level: 5, target: 7000, filled: 0, price: 167.00, avgCost: 0, complete: false },
      { level: 6, target: 7000, filled: 0, price: 162.50, avgCost: 0, complete: false },
      { level: 7, target: 10500, filled: 0, price: 158.00, avgCost: 0, complete: false },
    ],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    account: 'stable',
    status: 'in_progress',
    currentPrice: 425.80,
    unrealizedPnl: 3890,
    totalDeployed: 12000,
    totalTarget: 38000,
    levels: [
      { level: 1, target: 3000, filled: 3000, price: 410.00, avgCost: 410.00, complete: true },
      { level: 2, target: 3000, filled: 3000, price: 400.00, avgCost: 405.00, complete: true },
      { level: 3, target: 4500, filled: 2500, price: 390.00, avgCost: 402.00, complete: false },
      { level: 4, target: 4500, filled: 0, price: 380.00, avgCost: 0, complete: false },
      { level: 5, target: 6000, filled: 0, price: 370.00, avgCost: 0, complete: false },
      { level: 6, target: 6000, filled: 0, price: 360.00, avgCost: 0, complete: false },
      { level: 7, target: 9000, filled: 0, price: 350.00, avgCost: 0, complete: false },
    ],
  },
];

// ── Utility Functions ─────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// ── Sub-Components ────────────────────────────────────────────────

function MiniPieChart({ data, color }: { data: { name: string; value: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={index === 0 ? color : '#1E293B'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#0B0F19',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          itemStyle={{ color: '#F8FAFC' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RatingBadge({ rating, label }: { rating: string; label: string }) {
  const colors: Record<string, string> = {
    excellent: 'bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30',
    good: 'bg-accent-primary/15 text-accent-primary border-accent-primary/30',
    monitor: 'bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30',
    alert: 'bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${colors[rating] || colors.good}`}>
      {label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function Portfolio() {
  const mounted = true;
  const [activeTab, setActiveTab] = useState<AccountType | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [capitalInput, setCapitalInput] = useState(500000);
  const [goldenSlider, setGoldenSlider] = useState(61.8);
  const [pyramidFilter, setPyramidFilter] = useState<AccountType | 'all'>('all');


  // ── Computed Data ─────────────────────────────────────────────

  const accounts = useMemo(() => {
    const result = {
      aggressive: { type: 'aggressive' as AccountType, value: 0, cash: 38128, target: 45, positions: 0 },
      stable: { type: 'stable' as AccountType, value: 0, cash: 19064, target: 15, positions: 0 },
      defensive: { type: 'defensive' as AccountType, value: 0, cash: 67783, target: 40, positions: 0 },
    };
    mockPositions.forEach((pos) => {
      const mv = pos.shares * pos.currentPrice;
      result[pos.account].value += mv;
      result[pos.account].positions += 1;
    });
    return result;
  }, []);

  const totalValue = useMemo(() => {
    return Object.values(accounts).reduce((s, a) => s + a.value, 0);
  }, [accounts]);

  const totalCash = 124975;
  const todayPnl = 18042;
  const todayPnlPercent = 2.18;

  const filteredPositions = useMemo(() => {
    let positions = activeTab === 'all' ? mockPositions : mockPositions.filter((p) => p.account === activeTab);
    if (sortConfig) {
      const key = sortConfig.key;
      positions = [...positions].sort((a, b) => {
        let av: number | string = 0;
        let bv: number | string = 0;
        if (key === 'ticker') { av = a.ticker; bv = b.ticker; }
        else if (key === 'shares') { av = a.shares; bv = b.shares; }
        else if (key === 'avgCost') { av = a.avgCost; bv = b.avgCost; }
        else if (key === 'currentPrice') { av = a.currentPrice; bv = b.currentPrice; }
        else if (key === 'pnl') { av = (a.currentPrice - a.avgCost) * a.shares; bv = (b.currentPrice - b.avgCost) * b.shares; }
        else if (key === 'pnlPercent') { av = ((a.currentPrice - a.avgCost) / a.avgCost) * 100; bv = ((b.currentPrice - b.avgCost) / b.avgCost) * 100; }
        else if (key === 'weight') { av = a.weight; bv = b.weight; }
        if (typeof av === 'string') return sortConfig.direction === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortConfig.direction === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
    }
    return positions;
  }, [activeTab, sortConfig]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      return { key, direction: 'desc' };
    });
  }, []);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <Minus className="w-3 h-3 text-text-dim inline" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-3 h-3 text-accent-primary inline" />
      : <ChevronDown className="w-3 h-3 text-accent-primary inline" />;
  };

  const goldenPosition = capitalInput * (goldenSlider / 100);
  const remainingReserve = capitalInput - goldenPosition;

  const pyramidLevels = useMemo(() => {
    const ratios = [10, 10, 15, 15, 20, 20, 30];
    const labels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
    return labels.map((label, i) => ({
      label,
      amount: goldenPosition * (ratios[i] / 100),
      ratio: ratios[i],
    }));
  }, [goldenPosition]);

  const filteredPyramids = useMemo(() => {
    return pyramidFilter === 'all' ? pyramidBuilds : pyramidBuilds.filter((p) => p.account === pyramidFilter);
  }, [pyramidFilter]);

  // ── Section Animations ────────────────────────────────────────

  const sectionStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  return (
    <div className="max-w-[1440px] mx-auto p-4 lg:p-6 space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-center gap-3" style={sectionStyle(0)}>
        <Wallet className="w-6 h-6 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">投资组合</h1>
          <p className="text-sm text-text-secondary">三账户管理与持仓追踪</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-text-muted">
          <RefreshCw className="w-3 h-3" />
          <span>最后更新: 2024年3月15日 3:45 PM ET</span>
        </div>
      </div>

      {/* ── Section 1: Portfolio Summary Bar ──────────────────── */}
      <div
        className="bg-bg-card rounded-xl border border-border-default p-6 relative overflow-hidden"
        style={sectionStyle(50)}
      >
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary via-account-stable to-account-defensive" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Total Value */}
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider">总资产</span>
            <div className="text-3xl font-bold font-mono text-accent-primary mt-1">
              {formatCurrency(totalValue + totalCash)}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-mono text-signal-bullish flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {formatCurrency(todayPnl)} ({formatPercent(todayPnlPercent)})
              </span>
              <span className="text-xs text-text-muted">今日</span>
            </div>
          </div>
          {/* Center: Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">总收益</span>
              <div className="text-xl font-mono font-bold text-signal-bullish mt-1">+34.7%</div>
              <div className="text-[10px] text-text-muted">成立以来</div>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">现金储备</span>
              <div className="text-xl font-mono font-bold text-accent-primary mt-1">{formatCurrency(totalCash)}</div>
              <div className="text-[10px] text-text-muted">{(totalCash / (totalValue + totalCash) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">持仓数</span>
              <div className="text-xl font-mono font-bold text-text-primary mt-1">{mockPositions.length}</div>
              <div className="text-[10px] text-text-muted">全部账户</div>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">本月收益</span>
              <div className="text-xl font-mono font-bold text-signal-bullish mt-1">+5.82%</div>
              <div className="text-[10px] text-text-muted">MTD</div>
            </div>
          </div>
          {/* Right: Risk Snapshot */}
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <div className="text-center">
              <span className="text-[10px] text-text-muted uppercase">风险等级</span>
              <div className="mt-1">
                <span className="text-[10px] px-2 py-1 rounded-full bg-signal-neutral/15 text-signal-neutral border border-signal-neutral/30 font-medium">
                  适中
                </span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-text-muted uppercase">夏普比率</span>
              <div className="text-lg font-mono font-semibold text-text-primary mt-1">1.82</div>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-text-muted uppercase">最大回撤</span>
              <div className="text-lg font-mono font-semibold text-signal-bullish mt-1">-8.4%</div>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-text-muted uppercase">Beta</span>
              <div className="text-lg font-mono font-semibold text-text-primary mt-1">0.94</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Three-Account Dashboard ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(accounts) as AccountType[]).map((accountType, idx) => {
          const account = accounts[accountType];
          const color = ACCOUNT_COLORS[accountType];
          const Icon = ACCOUNT_ICONS[accountType];
          const name = ACCOUNT_NAMES[accountType];
          const goal = ACCOUNT_GOALS[accountType];
          const investedPct = (account.value / (account.value + account.cash)) * 100;
          const accountPositions = mockPositions.filter((p) => p.account === accountType);
          const topHolding = accountPositions.sort((a, b) => b.weight - a.weight)[0];

          return (
            <div
              key={accountType}
              className="bg-bg-card rounded-xl border border-border-default p-5 relative overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200"
              style={{
                ...sectionStyle(150 + idx * 100),
                borderTop: `4px solid ${color}`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{name}账户</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
                      {account.target}% 配置
                    </span>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="text-2xl font-bold font-mono text-text-primary mb-1">
                {formatCurrency(account.value + account.cash)}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono text-signal-bullish flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />+{idx === 0 ? '2.56' : idx === 1 ? '1.01' : '2.18'}%
                </span>
                <span className="text-xs text-text-muted">
                  +{formatCurrency(idx === 0 ? 9532 : idx === 1 ? 1271 : 7239)} 今日
                </span>
              </div>

              {/* Mini Pie */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-20 h-20 shrink-0">
                  <MiniPieChart data={[
                    { name: '持仓', value: account.value },
                    { name: '现金', value: account.cash },
                  ]} color={color} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">持仓</span>
                    <span className="font-mono text-text-primary">{formatCurrency(account.value)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">现金</span>
                    <span className="font-mono text-text-primary">{formatCurrency(account.cash)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">仓位</span>
                    <span className="font-mono" style={{ color }}>{investedPct.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">持仓数</span>
                    <span className="font-mono text-text-primary">{account.positions}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar: invested vs cash */}
              <div className="h-1.5 rounded-full bg-bg-elevated mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${investedPct}%`, backgroundColor: color }}
                />
              </div>

              {/* Target allocation bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-text-muted">目标配置 {account.target}%</span>
                  <span className="font-mono text-text-muted">
                    实际 {((account.value + account.cash) / (totalValue + totalCash) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(((account.value + account.cash) / (totalValue + totalCash) * 100) / account.target * 100, 100)}%`,
                      backgroundColor: color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>

              {/* Top holding */}
              {topHolding && (
                <div className="pt-3 border-t border-border-default">
                  <div className="text-[10px] text-text-muted mb-1">最大持仓</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-text-primary">{topHolding.ticker}</span>
                    <span className="text-xs font-mono text-text-secondary">{topHolding.weight}%</span>
                  </div>
                </div>
              )}

              {/* Goal */}
              <div className="pt-2 mt-2 border-t border-border-default">
                <p className="text-[10px] text-text-muted leading-relaxed">{goal}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Section 3: Account Detail Tabs + Holdings Table ───── */}
      <div className="bg-bg-card rounded-xl border border-border-default overflow-hidden" style={sectionStyle(500)}>
        {/* Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-border-default overflow-x-auto">
          {([
            { key: 'all', label: '全部账户', color: '#00D9C0' },
            { key: 'aggressive', label: '进取型', color: '#FF6B35' },
            { key: 'stable', label: '稳健型', color: '#00D9C0' },
            { key: 'defensive', label: '防御型', color: '#6366F1' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
              style={activeTab === tab.key ? { backgroundColor: `${tab.color}15`, color: tab.color } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.color }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Holdings Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                {[
                  { key: 'ticker', label: '代码 / 名称', sortable: true },
                  { key: 'account', label: '账户', sortable: false },
                  { key: 'shares', label: '股数', sortable: true },
                  { key: 'weight', label: '权重', sortable: true },
                  { key: 'avgCost', label: '成本价', sortable: true },
                  { key: 'currentPrice', label: '现价', sortable: true },
                  { key: 'pnl', label: '盈亏 ($)', sortable: true },
                  { key: 'pnlPercent', label: '盈亏 (%)', sortable: true },
                  { key: 'signal', label: '信号', sortable: false },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider whitespace-nowrap ${
                      col.sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((pos, i) => {
                const marketValue = pos.shares * pos.currentPrice;
                const costBasis = pos.shares * pos.avgCost;
                const pnl = marketValue - costBasis;
                const pnlPercent = (pnl / costBasis) * 100;
                const accountColor = ACCOUNT_COLORS[pos.account];
                const accountName = ACCOUNT_NAMES[pos.account];

                return (
                  <tr
                    key={pos.ticker}
                    className="border-t border-border-default hover:bg-bg-elevated/50 transition-colors"
                    style={{
                      opacity: mounted ? 1 : 0,
                      animation: mounted ? `fadeInRow 300ms ease forwards ${600 + i * 40}ms` : 'none',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-text-primary">{pos.ticker}</span>
                        <span className="text-xs text-text-muted hidden sm:block">{pos.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${accountColor}20`, color: accountColor }}
                      >
                        {accountName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">{pos.shares.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 rounded-full bg-bg-elevated overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(pos.weight * 3, 100)}%`, backgroundColor: accountColor }} />
                        </div>
                        <span className="text-xs font-mono text-text-secondary">{pos.weight}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">${pos.avgCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-primary">${pos.currentPrice.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-sm font-mono ${pnl >= 0 ? 'text-signal-bullish' : 'text-signal-bearish'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono ${pnlPercent >= 0 ? 'text-signal-bullish' : 'text-signal-bearish'}`}>
                      <span className="flex items-center gap-0.5">
                        {pnlPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {formatPercent(pnlPercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SignalBadge signal={pos.signal} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border-default text-xs text-text-muted">
          共 {filteredPositions.length} 个持仓
          {activeTab !== 'all' && ` · ${ACCOUNT_NAMES[activeTab]}账户`}
        </div>
      </div>

      {/* ── Section 4: Negative Cost Tracker ──────────────────── */}
      <div className="bg-bg-card rounded-xl border border-border-default overflow-hidden" style={sectionStyle(600)}>
        <div className="p-5 border-b border-border-default">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-signal-bullish" />
            <h2 className="text-lg font-semibold text-text-primary font-heading">零成本持仓追踪</h2>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-signal-bullish-dim border border-signal-bullish/20">
            <Info className="w-4 h-4 text-signal-bullish shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              以下持仓已通过股息收入和期权权利金将成本基础降至零或以下。这些股票作为"免费"的现金流生成器长期持有。
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="px-4 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">代码 / 名称</th>
                <th className="px-4 py-3 text-right text-xs text-text-muted font-medium uppercase tracking-wider">原始成本</th>
                <th className="px-4 py-3 text-right text-xs text-text-muted font-medium uppercase tracking-wider">累计收益</th>
                <th className="px-4 py-3 text-right text-xs text-text-muted font-medium uppercase tracking-wider">有效成本</th>
                <th className="px-4 py-3 text-center text-xs text-text-muted font-medium uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-right text-xs text-text-muted font-medium uppercase tracking-wider">月收入</th>
                <th className="px-4 py-3 text-right text-xs text-text-muted font-medium uppercase tracking-wider">零成本收益率</th>
                <th className="px-4 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">进度</th>
              </tr>
            </thead>
            <tbody>
              {negativeCostHoldings.map((holding) => {
                const progress = Math.min((holding.totalIncome / holding.originalCost) * 100, 100);
                return (
                  <tr
                    key={holding.ticker}
                    className={`border-t border-border-default hover:bg-bg-elevated/50 transition-colors ${
                      holding.status === 'negative' ? 'border-l-[3px] border-l-signal-bullish' : 'border-l-[3px] border-l-signal-neutral'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-text-primary">{holding.ticker}</span>
                        <span className="text-xs text-text-muted">{holding.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary text-right">{formatCurrency(holding.originalCost)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-signal-bullish text-right">{formatCurrency(holding.totalIncome)}</td>
                    <td className={`px-4 py-3 text-sm font-mono font-bold text-right ${holding.effectiveCost <= 0 ? 'text-signal-bullish' : 'text-text-primary'}`}>
                      {holding.effectiveCost <= 0 ? '-' : ''}{formatCurrency(Math.abs(holding.effectiveCost))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {holding.status === 'negative' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-signal-bullish/15 text-signal-bullish border border-signal-bullish/30 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> 负成本
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-signal-neutral/15 text-signal-neutral border border-signal-neutral/30 font-medium">
                          <RefreshCw className="w-3 h-3" /> 接近零
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-accent-primary text-right">${holding.monthlyIncome}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">
                      {holding.yieldOnZero > 0 ? (
                        <span className="text-signal-bullish">{holding.yieldOnZero.toFixed(2)}%/月</span>
                      ) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: holding.status === 'negative' ? '#00E676' : '#FBBF24',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-text-muted">{progress.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-t border-border-default bg-bg-primary/50">
          <div className="text-center p-3 rounded-lg bg-bg-elevated">
            <div className="text-[10px] text-text-muted uppercase mb-1">负成本持仓</div>
            <div className="text-lg font-mono font-bold text-signal-bullish">{negativeCostHoldings.filter((h) => h.status === 'negative').length}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-elevated">
            <div className="text-[10px] text-text-muted uppercase mb-1">月收入</div>
            <div className="text-lg font-mono font-bold text-accent-primary">
              ${negativeCostHoldings.reduce((s, h) => s + h.monthlyIncome, 0).toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-elevated">
            <div className="text-[10px] text-text-muted uppercase mb-1">年收入</div>
            <div className="text-lg font-mono font-bold text-text-primary">
              ${(negativeCostHoldings.reduce((s, h) => s + h.monthlyIncome, 0) * 12).toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-elevated">
            <div className="text-[10px] text-text-muted uppercase mb-1">组合收益贡献</div>
            <div className="text-lg font-mono font-bold text-signal-bullish">+0.49%</div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Risk Metrics ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Dashboard */}
        <div className="bg-bg-card rounded-xl border border-border-default p-5" style={sectionStyle(700)}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary font-heading">风险指标</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {riskMetrics.map((metric, i) => (
              <div
                key={metric.label}
                className="p-3 rounded-lg bg-bg-elevated hover:bg-bg-elevated/80 transition-colors"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 400ms ease ${800 + i * 50}ms, transform 400ms ease ${800 + i * 50}ms`,
                }}
              >
                <div className="text-[10px] text-text-muted mb-1">{metric.label}</div>
                <div className="text-base font-mono font-semibold text-text-primary mb-1">{metric.value}</div>
                <RatingBadge rating={metric.rating} label={metric.ratingLabel} />
              </div>
            ))}
          </div>
        </div>

        {/* Drawdown Chart */}
        <div className="bg-bg-card rounded-xl border border-border-default p-5" style={sectionStyle(750)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-signal-bearish" />
              <h3 className="text-lg font-semibold text-text-primary font-heading">回撤分析</h3>
            </div>
            <div className="flex gap-1">
              {['YTD', '1Y', 'ALL'].map((tf) => (
                <button key={tf} className="text-[10px] px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drawdownData}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1744" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FF1744" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F19',
                    border: '1px solid #1E293B',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  formatter={(value: number) => [`${value}%`, '回撤']}
                />
                <Area type="monotone" dataKey="drawdown" stroke="#FF1744" strokeWidth={2} fill="url(#drawdownGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="text-center">
              <div className="text-[10px] text-text-muted">当前回撤</div>
              <div className="text-sm font-mono font-semibold text-signal-bullish">-2.1%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-text-muted">最大回撤</div>
              <div className="text-sm font-mono font-semibold text-signal-bearish">-8.4%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-text-muted">恢复时间</div>
              <div className="text-sm font-mono font-semibold text-text-primary">18天</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-text-muted">最长回撤</div>
              <div className="text-sm font-mono font-semibold text-text-primary">34天</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 6: Golden Ratio Position Sizer ────────────── */}
      <div className="bg-bg-card rounded-xl border border-border-default p-5" style={sectionStyle(850)}>
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-signal-neutral" />
          <h2 className="text-lg font-semibold text-text-primary font-heading">黄金比例仓位计算器</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-signal-neutral/15 text-signal-neutral border border-signal-neutral/30 font-medium">
            &phi; = 1.618
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Calculator */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">可用资金</label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-text-muted" />
                <input
                  type="number"
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(Number(e.target.value))}
                  className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block">黄金比例调整</label>
              <div className="flex items-center gap-3">
                <Percent className="w-4 h-4 text-text-muted" />
                <input
                  type="range"
                  min={38.2}
                  max={61.8}
                  step={0.1}
                  value={goldenSlider}
                  onChange={(e) => setGoldenSlider(Number(e.target.value))}
                  className="flex-1 accent-accent-primary"
                />
                <span className="text-sm font-mono text-accent-primary w-16 text-right">{goldenSlider.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[10px] text-text-dim mt-1">
                <span>38.2%</span>
                <span>61.8%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-bg-elevated border border-accent-primary/30">
                <div className="text-[10px] text-text-muted mb-1">黄金仓位</div>
                <div className="text-xl font-mono font-bold text-accent-primary">{formatCurrency(goldenPosition)}</div>
                <div className="text-[10px] text-text-muted mt-1">黄金比例 {goldenSlider.toFixed(1)}%</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated">
                <div className="text-[10px] text-text-muted mb-1">剩余储备</div>
                <div className="text-xl font-mono font-bold text-text-primary">{formatCurrency(remainingReserve)}</div>
                <div className="text-[10px] text-text-muted mt-1">{(100 - goldenSlider).toFixed(1)}%</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-bg-elevated">
              <div className="text-[10px] text-text-muted mb-2">金字塔层级预览</div>
              {pyramidLevels.map((level, i) => (
                <div key={level.label} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-text-muted w-5">{level.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-bg-primary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(level.amount / goldenPosition) * 100}%`,
                        backgroundColor: `hsl(${170 + i * 8}, 100%, ${45 - i * 3}%)`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary w-20 text-right">{formatCurrency(level.amount)}</span>
                  <span className="text-[10px] font-mono text-text-dim w-8 text-right">{level.ratio}%</span>
                </div>
              ))}
              <div className="flex justify-between text-[10px] mt-2 pt-2 border-t border-border-default">
                <span className="text-text-muted">总计</span>
                <span className="font-mono text-accent-primary">{formatCurrency(goldenPosition)}</span>
              </div>
            </div>
          </div>

          {/* Right: Golden Spiral Visual */}
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full max-w-[320px] h-auto">
              {/* Golden spiral representation */}
              <rect x="0" y="0" width="200" height="200" rx="12" fill="#111827" />
              {/* Fibonacci squares */}
              <rect x="100" y="0" width="100" height="100" rx="4" fill="none" stroke="#1E293B" strokeWidth="1" />
              <rect x="100" y="100" width="50" height="50" rx="4" fill="none" stroke="#1E293B" strokeWidth="1" />
              <rect x="150" y="100" width="50" height="50" rx="4" fill="none" stroke="#1E293B" strokeWidth="1" />
              <rect x="100" y="125" width="25" height="25" rx="2" fill="none" stroke="#1E293B" strokeWidth="1" />
              <rect x="125" y="125" width="25" height="25" rx="2" fill="none" stroke="#1E293B" strokeWidth="1" />

              {/* Golden cut highlight (61.8%) */}
              <rect x="100" y="0" width="100" height="100" rx="4" fill="rgba(0, 217, 192, 0.08)" stroke="#00D9C0" strokeWidth="1.5" />
              <rect x="0" y="0" width="100" height="200" rx="4" fill="rgba(30, 41, 59, 0.5)" stroke="none" />

              {/* Labels */}
              <text x="150" y="50" textAnchor="middle" fill="#00D9C0" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                61.8%
              </text>
              <text x="50" y="100" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono, monospace">
                38.2%
              </text>
              <text x="125" y="125" textAnchor="middle" fill="#00D9C0" fontSize="8" fontFamily="JetBrains Mono, monospace">
                23.6%
              </text>

              {/* Spiral arcs */}
              <path
                d="M 200 0 A 100 100 0 0 1 100 100 A 50 50 0 0 1 150 150 A 25 25 0 0 1 125 125"
                fill="none"
                stroke="#00D9C0"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Center info */}
              <circle cx="50" cy="100" r="30" fill="#0B0F19" stroke="#1E293B" strokeWidth="1" />
              <text x="50" y="95" textAnchor="middle" fill="#F8FAFC" fontSize="8" fontFamily="JetBrains Mono, monospace">
                GOLDEN
              </text>
              <text x="50" y="108" textAnchor="middle" fill="#00D9C0" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                {goldenSlider.toFixed(1)}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Section 7: Pyramid Position Tracker ───────────────── */}
      <div className="bg-bg-card rounded-xl border border-border-default p-5" style={sectionStyle(950)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-heading">活跃金字塔建仓</h2>
          </div>
          <div className="flex gap-1">
            {([
              { key: 'all', label: '全部' },
              { key: 'aggressive', label: '进取' },
              { key: 'stable', label: '稳健' },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setPyramidFilter(f.key)}
                className={`text-[10px] px-3 py-1.5 rounded-md font-medium transition-all ${
                  pyramidFilter === f.key
                    ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
                    : 'bg-bg-elevated text-text-muted hover:text-text-primary border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPyramids.map((build) => {
            const completedLevels = build.levels.filter((l) => l.complete).length;
            const progress = (build.totalDeployed / build.totalTarget) * 100;
            const accountColor = ACCOUNT_COLORS[build.account];
            const isProfit = build.unrealizedPnl >= 0;

            return (
              <div key={build.ticker} className="p-4 rounded-lg bg-bg-elevated border border-border-default hover:border-border-hover transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-mono font-bold text-text-primary">{build.ticker}</span>
                    <span className="text-xs text-text-muted">{build.name}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${accountColor}20`, color: accountColor }}
                    >
                      {ACCOUNT_NAMES[build.account]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-text-secondary">
                      {completedLevels}/{build.levels.length} 层
                    </span>
                    <span className={`font-mono ${isProfit ? 'text-signal-bullish' : 'text-signal-bearish'}`}>
                      {isProfit ? '+' : ''}{formatCurrency(build.unrealizedPnl)}
                    </span>
                  </div>
                </div>

                {/* Pyramid Bars */}
                <div className="space-y-1.5 mb-3">
                  {build.levels.map((level) => {
                    const fillPct = level.complete ? 100 : (level.filled / level.target) * 100;
                    return (
                      <div key={level.level} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-text-muted w-5">L{level.level}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-bg-primary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${fillPct}%`,
                              backgroundColor: level.complete
                                ? '#00E676'
                                : fillPct > 0
                                  ? '#00D9C0'
                                  : '#1E293B',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-text-muted w-12 text-right">
                          {level.complete ? (
                            <CheckCircle2 className="w-3 h-3 text-signal-bullish inline" />
                          ) : (
                            `${fillPct.toFixed(0)}%`
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary w-20 text-right">
                          {formatCurrency(level.filled)}
                        </span>
                        <span className="text-[10px] font-mono text-text-dim w-20 text-right">
                          / {formatCurrency(level.target)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-4 pt-3 border-t border-border-default text-xs">
                  <div>
                    <span className="text-text-muted">当前价: </span>
                    <span className="font-mono text-text-primary">${build.currentPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">均成本: </span>
                    <span className="font-mono text-text-primary">
                      ${build.levels.filter((l) => l.avgCost > 0).length > 0
                        ? (build.levels.filter((l) => l.avgCost > 0).reduce((s, l) => s + l.avgCost, 0) / build.levels.filter((l) => l.avgCost > 0).length).toFixed(2)
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">已投入: </span>
                    <span className="font-mono text-accent-primary">{formatCurrency(build.totalDeployed)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">目标: </span>
                    <span className="font-mono text-text-primary">{formatCurrency(build.totalTarget)}</span>
                  </div>
                  <div className="ml-auto">
                    <div className="text-[10px] text-text-muted mb-1">总体进度 {progress.toFixed(0)}%</div>
                    <div className="w-24 h-1 rounded-full bg-bg-primary overflow-hidden">
                      <div className="h-full rounded-full bg-accent-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Styles for row animation */}
      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
