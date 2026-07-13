import { useState, useMemo } from 'react';
import {
  Radio,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  ArrowUpDown,
  Trophy,
  AlertTriangle,
  Layers,
  Clock,
  CheckCircle2,
  Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import SignalBadge from '@/components/SignalBadge';
import type { SignalType } from '@/lib/strategyEngine';

// ── Types ─────────────────────────────────────────────────────────

interface SignalRecord {
  id: string;
  date: string;
  ticker: string;
  type: SignalType;
  price: number;
  target: number;
  stopLoss: number;
  confidence: number;
  status: 'Active' | 'Triggered' | 'Expired';
  result?: number;
  strategy: string;
  reason: string;
  technicalSummary: string;
  account: string;
  shares: number;
}

interface TradeEntry {
  id: string;
  date: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  price: number;
  shares: number;
  pnl?: number;
  strategy: string;
  level?: string;
}

interface PyramidBuild {
  id: string;
  ticker: string;
  name: string;
  currentTier: number;
  totalTiers: number;
  nextBuyPrice: number;
  avgCost: number;
  currentPrice: number;
  invested: number;
  target: number;
  unrealizedPnl: number;
  account: string;
  tiers: Array<{
    level: number;
    price: number;
    shares: number;
    invested: number;
    status: 'filled' | 'pending' | 'current';
  }>;
}

// ── Mock Data: Signals ────────────────────────────────────────────

const mockSignals: SignalRecord[] = [
  { id: 'S001', date: '2025-01-15 10:32', ticker: 'AAPL', type: 'BUY', price: 175.20, target: 185.00, stopLoss: 168.00, confidence: 78, status: 'Triggered', result: 980, strategy: 'Pyramid Building', reason: 'RSI oversold bounce at MA20 support', technicalSummary: 'RSI(14)=32, Price > MA20, MACD histogram turning positive', account: 'Aggressive', shares: 100 },
  { id: 'S002', date: '2025-01-14 14:15', ticker: 'NVDA', type: 'SELL', price: 875.00, target: 850.00, stopLoss: 900.00, confidence: 82, status: 'Triggered', result: 1240, strategy: 'MACD Divergence', reason: 'Bearish MACD divergence on 4h timeframe', technicalSummary: 'RSI(14)=72, MACD bearish crossover, Volume 1.8x avg', account: 'Aggressive', shares: 50 },
  { id: 'S003', date: '2025-01-14 09:45', ticker: 'MSFT', type: 'BUY', price: 405.00, target: 420.00, stopLoss: 390.00, confidence: 71, status: 'Triggered', result: 450, strategy: 'MA Crossover', reason: 'Golden cross MA5/MA20 with volume surge', technicalSummary: 'MA5 crossed above MA20, RSI=55, increasing volume', account: 'Stable', shares: 25 },
  { id: 'S004', date: '2025-01-13 11:20', ticker: 'TSLA', type: 'SELL', price: 245.00, target: 230.00, stopLoss: 260.00, confidence: 68, status: 'Triggered', result: -320, strategy: 'RSI Overbought', reason: 'RSI overbought + rejection at R2 resistance', technicalSummary: 'RSI(14)=78, Price rejected at $245 resistance, MACD weakening', account: 'Aggressive', shares: 40 },
  { id: 'S005', date: '2025-01-13 10:05', ticker: 'GOOGL', type: 'BUY', price: 165.40, target: 175.00, stopLoss: 158.00, confidence: 74, status: 'Triggered', result: 580, strategy: 'Support Bounce', reason: 'Double bottom at $163 support level', technicalSummary: 'Double bottom confirmed, RSI=38, Bullish engulfing candle', account: 'Stable', shares: 60 },
  { id: 'S006', date: '2025-01-12 15:30', ticker: 'AMD', type: 'BUY', price: 142.80, target: 158.00, stopLoss: 135.00, confidence: 65, status: 'Triggered', result: -180, strategy: 'Pyramid Building', reason: 'Pyramid Level 2 entry, -5% from L1', technicalSummary: 'Price at MA60 support, RSI=42, Consolidation pattern', account: 'Aggressive', shares: 80 },
  { id: 'S007', date: '2025-01-12 11:45', ticker: 'SPY', type: 'STRONG_BUY', price: 524.78, target: 545.00, stopLoss: 510.00, confidence: 88, status: 'Triggered', result: 2150, strategy: 'VIX-Based', reason: 'VIX 38 + RSI oversold on daily, broad market entry', technicalSummary: 'VIX=38.2, RSI(14)=29, Price at 200DMA, Extreme fear', account: 'Defensive', shares: 40 },
  { id: 'S008', date: '2025-01-11 09:30', ticker: 'META', type: 'SELL', price: 485.20, target: 465.00, stopLoss: 500.00, confidence: 72, status: 'Triggered', result: 890, strategy: 'Breakout', reason: 'False breakout above $490, rejection candle', technicalSummary: 'Shooting star at $490, RSI=71, Volume divergence', account: 'Aggressive', shares: 30 },
  { id: 'S009', date: '2025-01-10 14:00', ticker: 'QQQ', type: 'BUY', price: 487.25, target: 505.00, stopLoss: 475.00, confidence: 76, status: 'Triggered', result: 1120, strategy: 'VIX-Based', reason: 'VIX declining from 42, tech oversold bounce', technicalSummary: 'VIX falling from 42, RSI=33, Tech sector oversold', account: 'Defensive', shares: 25 },
  { id: 'S010', date: '2025-01-10 10:15', ticker: 'JNJ', type: 'BUY', price: 152.30, target: 160.00, stopLoss: 147.00, confidence: 62, status: 'Triggered', result: 340, strategy: 'Pyramid Building', reason: 'Defensive dividend play, pyramid L1 entry', technicalSummary: 'Price at 52-week low, RSI=35, Dividend yield 3.2%', account: 'Defensive', shares: 50 },
  { id: 'S011', date: '2025-01-09 11:30', ticker: 'AMZN', type: 'BUY', price: 178.50, target: 195.00, stopLoss: 170.00, confidence: 69, status: 'Expired', result: undefined, strategy: 'MA Crossover', reason: 'MA5/MA20 golden cross forming', technicalSummary: 'MA convergence, RSI=48, Awaiting confirmation', account: 'Stable', shares: 45 },
  { id: 'S012', date: '2025-01-09 09:45', ticker: 'NVDA', type: 'STRONG_BUY', price: 850.20, target: 920.00, stopLoss: 810.00, confidence: 91, status: 'Triggered', result: 2340, strategy: 'VIX-Based', reason: 'VIX 45 extreme fear, AI leader quality discount', technicalSummary: 'VIX=45.3, RSI=28, 20% off highs, Institutional support', account: 'Aggressive', shares: 30 },
  { id: 'S013', date: '2025-01-08 13:20', ticker: 'V', type: 'BUY', price: 268.00, target: 280.00, stopLoss: 260.00, confidence: 58, status: 'Triggered', result: 220, strategy: 'Support Bounce', reason: 'Bounce from $265 support, financial stability', technicalSummary: 'Hammer candle at $265, RSI=40, Low volatility', account: 'Stable', shares: 20 },
  { id: 'S014', date: '2025-01-08 10:00', ticker: 'COIN', type: 'SELL', price: 215.00, target: 190.00, stopLoss: 235.00, confidence: 77, status: 'Triggered', result: -450, strategy: 'Breakout', reason: 'Crypto correlation breakdown, momentum failure', technicalSummary: 'RSI=68, Momentum fading, Below MA20', account: 'Aggressive', shares: 60 },
  { id: 'S015', date: '2025-01-07 15:45', ticker: 'ARKK', type: 'BUY', price: 42.50, target: 48.00, stopLoss: 39.00, confidence: 64, status: 'Triggered', result: -120, strategy: 'VIX-Based', reason: 'VIX extreme, innovation ETF discount', technicalSummary: 'VIX=41, RSI=31, 35% off highs, High beta play', account: 'Aggressive', shares: 200 },
  { id: 'S016', date: '2025-01-07 11:10', ticker: 'KO', type: 'BUY', price: 62.80, target: 67.00, stopLoss: 60.00, confidence: 61, status: 'Triggered', result: 180, strategy: 'Pyramid Building', reason: 'Defensive consumer staple, dividend aristocrat', technicalSummary: '52-week low bounce, RSI=36, 3.1% yield', account: 'Defensive', shares: 100 },
  { id: 'S017', date: '2025-01-06 10:30', ticker: 'AAPL', type: 'HOLD', price: 182.50, target: 195.00, stopLoss: 175.00, confidence: 52, status: 'Expired', result: undefined, strategy: 'Support Bounce', reason: 'Consolidation pattern, await direction', technicalSummary: 'RSI=50, Doji candles, Narrow Bollinger bands', account: 'Stable', shares: 0 },
  { id: 'S018', date: '2025-01-06 09:15', ticker: 'MSFT', type: 'BUY', price: 398.00, target: 415.00, stopLoss: 385.00, confidence: 73, status: 'Triggered', result: 680, strategy: 'MACD Divergence', reason: 'Bullish MACD divergence on daily', technicalSummary: 'Price lower low, MACD higher low, RSI=34', account: 'Aggressive', shares: 35 },
  { id: 'S019', date: '2025-01-05 14:20', ticker: 'NFLX', type: 'SELL', price: 625.00, target: 590.00, stopLoss: 650.00, confidence: 70, status: 'Triggered', result: 1050, strategy: 'RSI Overbought', reason: 'RSI extreme overbought, streaming saturation', technicalSummary: 'RSI=81, Parabolic move, Volume declining', account: 'Aggressive', shares: 20 },
  { id: 'S020', date: '2025-01-05 10:45', ticker: 'BRK.B', type: 'BUY', price: 432.00, target: 450.00, stopLoss: 420.00, confidence: 66, status: 'Triggered', result: 420, strategy: 'VIX-Based', reason: 'Buffett defensive play, VIX elevated safety', technicalSummary: 'Below intrinsic value estimate, RSI=38, Low beta', account: 'Defensive', shares: 15 },
  { id: 'S021', date: '2025-01-04 11:00', ticker: 'DIS', type: 'BUY', price: 98.50, target: 110.00, stopLoss: 92.00, confidence: 59, status: 'Triggered', result: -85, strategy: 'Pyramid Building', reason: 'Entertainment recovery play, pyramid L1', technicalSummary: 'MA60 support, RSI=41, Earnings catalyst ahead', account: 'Stable', shares: 80 },
  { id: 'S022', date: '2025-01-04 09:30', ticker: 'INTC', type: 'STRONG_BUY', price: 19.80, target: 25.00, stopLoss: 17.50, confidence: 85, status: 'Active', result: undefined, strategy: 'VIX-Based', reason: 'Semiconductor turnaround, VIX panic pricing', technicalSummary: 'VIX=44, RSI=26, Book value support, CEO transition', account: 'Aggressive', shares: 500 },
  { id: 'S023', date: '2025-01-03 13:50', ticker: 'XOM', type: 'BUY', price: 108.00, target: 118.00, stopLoss: 102.00, confidence: 63, status: 'Active', result: undefined, strategy: 'Support Bounce', reason: 'Energy sector oversold, dividend support', technicalSummary: '200DMA bounce, RSI=37, 3.5% yield', account: 'Defensive', shares: 40 },
  { id: 'S024', date: '2025-01-03 10:20', ticker: 'AMD', type: 'SELL', price: 155.00, target: 140.00, stopLoss: 165.00, confidence: 75, status: 'Triggered', result: 960, strategy: 'Breakout', reason: 'Breakdown below $158 support, chip weakness', technicalSummary: 'Below key $158 support, RSI=58, Increasing volume', account: 'Aggressive', shares: 80 },
  { id: 'S025', date: '2025-01-02 15:00', ticker: 'SPY', type: 'BUY', price: 565.00, target: 585.00, stopLoss: 555.00, confidence: 67, status: 'Triggered', result: 780, strategy: 'MA Crossover', reason: 'Year-start momentum, MA alignment', technicalSummary: 'All MAs sloping up, RSI=52, Seasonality positive', account: 'Defensive', shares: 20 },
];

// ── Mock Data: Trade Journal ──────────────────────────────────────

const tradeJournal: TradeEntry[] = [
  { id: 'T001', date: 'Jan 15, 10:32 AM', ticker: 'AAPL', action: 'BUY', price: 175.20, shares: 100, pnl: undefined, strategy: 'Pyramid L3' },
  { id: 'T002', date: 'Jan 14, 2:15 PM', ticker: 'NVDA', action: 'SELL', price: 875.00, shares: 50, pnl: 1240, strategy: 'MACD Divergence' },
  { id: 'T003', date: 'Jan 14, 9:45 AM', ticker: 'MSFT', action: 'BUY', price: 405.00, shares: 25, pnl: undefined, strategy: 'MA Crossover' },
  { id: 'T004', date: 'Jan 13, 11:20 AM', ticker: 'TSLA', action: 'SELL', price: 245.00, shares: 40, pnl: -320, strategy: 'RSI Overbought' },
  { id: 'T005', date: 'Jan 13, 10:05 AM', ticker: 'GOOGL', action: 'BUY', price: 165.40, shares: 60, pnl: undefined, strategy: 'Support Bounce' },
  { id: 'T006', date: 'Jan 12, 3:30 PM', ticker: 'AMD', action: 'BUY', price: 142.80, shares: 80, pnl: undefined, strategy: 'Pyramid L2' },
  { id: 'T007', date: 'Jan 12, 11:45 AM', ticker: 'SPY', action: 'BUY', price: 524.78, shares: 40, pnl: undefined, strategy: 'VIX Panic Buy' },
  { id: 'T008', date: 'Jan 11, 9:30 AM', ticker: 'META', action: 'SELL', price: 485.20, shares: 30, pnl: 890, strategy: 'False Breakout' },
  { id: 'T009', date: 'Jan 10, 2:00 PM', ticker: 'QQQ', action: 'BUY', price: 487.25, shares: 25, pnl: undefined, strategy: 'VIX Reversal' },
  { id: 'T010', date: 'Jan 10, 10:15 AM', ticker: 'JNJ', action: 'BUY', price: 152.30, shares: 50, pnl: undefined, strategy: 'Pyramid L1' },
  { id: 'T011', date: 'Jan 08, 1:20 PM', ticker: 'COIN', action: 'SELL', price: 215.00, shares: 60, pnl: -450, strategy: 'Momentum Fail' },
  { id: 'T012', date: 'Jan 07, 3:45 PM', ticker: 'ARKK', action: 'BUY', price: 42.50, shares: 200, pnl: undefined, strategy: 'VIX Discount' },
  { id: 'T013', date: 'Jan 05, 2:20 PM', ticker: 'NFLX', action: 'SELL', price: 625.00, shares: 20, pnl: 1050, strategy: 'RSI Overbought' },
  { id: 'T014', date: 'Jan 04, 9:30 AM', ticker: 'INTC', action: 'BUY', price: 19.80, shares: 500, pnl: undefined, strategy: 'Turnaround' },
];

// ── Mock Data: Pyramid Builds ─────────────────────────────────────

const pyramidBuilds: PyramidBuild[] = [
  {
    id: 'P001', ticker: 'AAPL', name: 'Apple Inc.', currentTier: 3, totalTiers: 7,
    nextBuyPrice: 168.50, avgCost: 172.10, currentPrice: 175.80,
    invested: 26000, target: 69500, unrealizedPnl: 1110, account: 'Aggressive',
    tiers: [
      { level: 1, price: 180.00, shares: 50, invested: 9000, status: 'filled' },
      { level: 2, price: 174.60, shares: 50, invested: 8730, status: 'filled' },
      { level: 3, price: 169.20, shares: 75, invested: 12690, status: 'current' },
      { level: 4, price: 162.00, shares: 75, invested: 0, status: 'pending' },
      { level: 5, price: 153.00, shares: 100, invested: 0, status: 'pending' },
      { level: 6, price: 142.00, shares: 100, invested: 0, status: 'pending' },
      { level: 7, price: 128.00, shares: 150, invested: 0, status: 'pending' },
    ],
  },
  {
    id: 'P002', ticker: 'NVDA', name: 'NVIDIA Corp.', currentTier: 2, totalTiers: 7,
    nextBuyPrice: 816.00, avgCost: 850.20, currentPrice: 842.50,
    invested: 42500, target: 120000, unrealizedPnl: -1540, account: 'Aggressive',
    tiers: [
      { level: 1, price: 850.00, shares: 25, invested: 21250, status: 'filled' },
      { level: 2, price: 824.50, shares: 25, invested: 21250, status: 'current' },
      { level: 3, price: 790.00, shares: 38, invested: 0, status: 'pending' },
      { level: 4, price: 748.00, shares: 38, invested: 0, status: 'pending' },
      { level: 5, price: 697.00, shares: 50, invested: 0, status: 'pending' },
      { level: 6, price: 637.00, shares: 50, invested: 0, status: 'pending' },
      { level: 7, price: 565.00, shares: 75, invested: 0, status: 'pending' },
    ],
  },
  {
    id: 'P003', ticker: 'JNJ', name: 'Johnson & Johnson', currentTier: 1, totalTiers: 7,
    nextBuyPrice: 147.70, avgCost: 152.30, currentPrice: 151.80,
    invested: 7615, target: 25000, unrealizedPnl: -45, account: 'Defensive',
    tiers: [
      { level: 1, price: 152.30, shares: 50, invested: 7615, status: 'current' },
      { level: 2, price: 147.70, shares: 50, invested: 0, status: 'pending' },
      { level: 3, price: 141.00, shares: 75, invested: 0, status: 'pending' },
      { level: 4, price: 131.00, shares: 75, invested: 0, status: 'pending' },
      { level: 5, price: 118.00, shares: 100, invested: 0, status: 'pending' },
      { level: 6, price: 102.00, shares: 100, invested: 0, status: 'pending' },
      { level: 7, price: 82.00, shares: 150, invested: 0, status: 'pending' },
    ],
  },
];

// ── Equity Curve Data ─────────────────────────────────────────────

const equityCurveData = [
  { date: 'Jan 2', pnl: 0 },
  { date: 'Jan 3', pnl: 780 },
  { date: 'Jan 4', pnl: 695 },
  { date: 'Jan 5', pnl: 2660 },
  { date: 'Jan 6', pnl: 4020 },
  { date: 'Jan 7', pnl: 3900 },
  { date: 'Jan 8', pnl: 3670 },
  { date: 'Jan 9', pnl: 3670 },
  { date: 'Jan 10', pnl: 5030 },
  { date: 'Jan 11', pnl: 5920 },
  { date: 'Jan 12', pnl: 5920 },
  { date: 'Jan 13', pnl: 5560 },
  { date: 'Jan 14', pnl: 7220 },
  { date: 'Jan 15', pnl: 8200 },
];

const monthlyPerformance = [
  { month: 'Oct', wins: 8, losses: 3 },
  { month: 'Nov', wins: 10, losses: 4 },
  { month: 'Dec', wins: 12, losses: 3 },
  { month: 'Jan', wins: 5, losses: 2 },
];

// ── Helpers ───────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  Active: { color: '#FBBF24', bg: 'rgba(251,191,36,0.15)', icon: Clock },
  Triggered: { color: '#00E676', bg: 'rgba(0,230,118,0.15)', icon: CheckCircle2 },
  Expired: { color: '#64748B', bg: 'rgba(100,116,139,0.15)', icon: Minus },
};

const typeFilters: Array<{ label: string; value: SignalType | 'ALL' }> = [
  { label: '全部', value: 'ALL' },
  { label: '买入', value: 'BUY' },
  { label: '强烈买入', value: 'STRONG_BUY' },
  { label: '卖出', value: 'SELL' },
  { label: '强烈卖出', value: 'STRONG_SELL' },
  { label: '持有', value: 'HOLD' },
];

const statusFilters = ['ALL', 'Active', 'Triggered', 'Expired'];

const strategyFilters = ['ALL', 'Pyramid Building', 'MACD Divergence', 'MA Crossover', 'RSI Overbought', 'Support Bounce', 'Breakout', 'VIX-Based'];

// ── Stat Card ─────────────────────────────────────────────────────

function StatCard({ label, value, subtext, color, delay }: { label: string; value: string; subtext: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="bg-bg-card rounded-xl border border-border-default p-5 hover:border-border-hover transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="text-[28px] font-bold font-mono text-text-primary leading-tight">{value}</div>
      <div className="text-xs text-text-secondary mt-1">{subtext}</div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function Signals() {
  const [filterType, setFilterType] = useState<SignalType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStrategy, setFilterStrategy] = useState('ALL');
  const [searchTicker, setSearchTicker] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedPyramid, setExpandedPyramid] = useState<string | null>(null);

  // Stats
  const totalSignals = mockSignals.length;
  const wins = mockSignals.filter((s) => s.result && s.result > 0).length;
  const losses = mockSignals.filter((s) => s.result && s.result < 0).length;
  const winRate = totalSignals > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0';
  const avgReturn = totalSignals > 0 ? (mockSignals.reduce((sum, s) => sum + (s.result || 0), 0) / totalSignals).toFixed(0) : '0';
  const activeCount = mockSignals.filter((s) => s.status === 'Active').length;

  // Filter & Sort
  const filteredSignals = useMemo(() => {
    let result = [...mockSignals];
    if (filterType !== 'ALL') result = result.filter((s) => s.type === filterType);
    if (filterStatus !== 'ALL') result = result.filter((s) => s.status === filterStatus);
    if (filterStrategy !== 'ALL') result = result.filter((s) => s.strategy === filterStrategy);
    if (searchTicker) result = result.filter((s) => s.ticker.toLowerCase().includes(searchTicker.toLowerCase()));
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'ticker') cmp = a.ticker.localeCompare(b.ticker);
      else if (sortField === 'price') cmp = a.price - b.price;
      else if (sortField === 'confidence') cmp = a.confidence - b.confidence;
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [filterType, filterStatus, filterStrategy, searchTicker, sortField, sortAsc]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  // Win/Loss data for pie
  const winLossData = [
    { name: 'Wins', value: wins, color: '#00E676' },
    { name: 'Losses', value: losses, color: '#FF1744' },
  ];

  // Top 5
  const sortedByResult = [...mockSignals].filter((s) => s.result !== undefined).sort((a, b) => (b.result || 0) - (a.result || 0));
  const topWinners = sortedByResult.slice(0, 5);
  const topLosers = [...sortedByResult].reverse().slice(0, 5);

  const activeFilterCount = (filterType !== 'ALL' ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0) + (filterStrategy !== 'ALL' ? 1 : 0) + (searchTicker ? 1 : 0);

  return (
    <div className="max-w-[1440px] mx-auto p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
        <div className="flex items-center gap-3 mb-1">
          <Radio className="w-6 h-6 text-accent-primary" />
          <h1 className="text-2xl font-bold text-text-primary font-heading">Signals Center</h1>
        </div>
        <p className="text-sm text-text-secondary ml-9">Complete signal history, performance analytics, and trade journal</p>
      </motion.div>

      {/* Section 1: Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Signals (30D)" value={String(totalSignals)} subtext={`${wins} wins / ${losses} losses`} color="#00D9C0" delay={0} />
        <StatCard label="Win Rate" value={`${winRate}%`} subtext={`${wins} wins / ${losses} losses`} color="#00E676" delay={80} />
        <StatCard label="Avg Return/Signal" value={`+$${avgReturn}`} subtext={`Total: +$${mockSignals.reduce((s, m) => s + (m.result || 0), 0).toLocaleString()}`} color="#00E676" delay={160} />
        <StatCard label="Active Signals" value={String(activeCount)} subtext={`${mockSignals.filter((s) => s.type.includes('BUY')).length} BUY / ${mockSignals.filter((s) => s.type.includes('SELL')).length} SELL / ${mockSignals.filter((s) => s.type === 'HOLD').length} HOLD`} color="#FBBF24" delay={240} />
      </div>

      {/* Section 2: Filters + Signal Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
        {/* Filter Bar */}
        <div className="bg-bg-card rounded-xl border border-border-default p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted uppercase tracking-wider mr-2">Filters</span>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ticker..."
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                className="bg-bg-elevated text-text-primary text-xs rounded-lg pl-8 pr-3 py-1.5 border border-border-default focus:border-border-accent outline-none w-28"
              />
            </div>

            {/* Signal Type */}
            <div className="flex gap-1">
              {typeFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterType(f.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    filterType === f.value ? 'bg-accent-primary text-bg-primary' : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-bg-elevated text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none"
            >
              {statusFilters.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
            </select>

            {/* Strategy */}
            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="bg-bg-elevated text-text-primary text-xs rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none"
            >
              {strategyFilters.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Strategies' : s}</option>)}
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); setFilterStrategy('ALL'); setSearchTicker(''); }}
                className="text-[11px] text-text-muted hover:text-accent-primary transition-colors ml-auto"
              >
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Signal Table */}
        <div className="bg-bg-card rounded-xl border border-border-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-elevated text-left">
                  {[
                    { key: 'date', label: 'Date' },
                    { key: 'ticker', label: 'Ticker' },
                    { key: null, label: 'Signal' },
                    { key: 'price', label: 'Price' },
                    { key: null, label: 'Target' },
                    { key: null, label: 'Stop' },
                    { key: 'confidence', label: 'Conf.' },
                    { key: null, label: 'Status' },
                    { key: null, label: 'P&L' },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.key && toggleSort(col.key)}
                      className={`px-4 py-3 text-[11px] text-text-muted font-medium uppercase tracking-wider whitespace-nowrap ${col.key ? 'cursor-pointer hover:text-text-primary' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.key && sortField === col.key && (
                          sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                        {col.key && sortField !== col.key && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredSignals.map((signal, idx) => {
                    const StatusIcon = statusConfig[signal.status]?.icon || Clock;
                    return (
                      <motion.tr
                        key={signal.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.5) }}
                        className="border-t border-border-default hover:bg-bg-elevated/40 transition-colors cursor-pointer"
                        style={{
                          borderLeft: signal.type.includes('BUY') ? '3px solid #00E676' : signal.type.includes('SELL') ? '3px solid #FF1744' : '3px solid #FBBF24',
                        }}
                        onClick={() => setExpandedRow(expandedRow === signal.id ? null : signal.id)}
                      >
                        <td className="px-4 py-3 text-xs font-mono text-text-secondary whitespace-nowrap">{signal.date}</td>
                        <td className="px-4 py-3 text-sm font-mono font-bold text-text-primary">{signal.ticker}</td>
                        <td className="px-4 py-3"><SignalBadge signal={signal.type} size="sm" /></td>
                        <td className="px-4 py-3 text-sm font-mono text-text-primary">${signal.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs font-mono text-accent-primary">${signal.target.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs font-mono text-signal-bearish">${signal.stopLoss.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                              <div className="h-full rounded-full bg-accent-primary" style={{ width: `${signal.confidence}%` }} />
                            </div>
                            <span className="text-[11px] font-mono text-text-secondary">{signal.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: statusConfig[signal.status].color, backgroundColor: statusConfig[signal.status].bg }}>
                            <StatusIcon className="w-3 h-3" />
                            {signal.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-right">
                          {signal.result !== undefined ? (
                            <span className={signal.result >= 0 ? 'text-[#00E676]' : 'text-[#FF1744]'}>
                              {signal.result >= 0 ? '+' : ''}{signal.result >= 0 ? `$${signal.result.toLocaleString()}` : `-$${Math.abs(signal.result).toLocaleString()}`}
                            </span>
                          ) : (
                            <span className="text-text-dim">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredSignals.length === 0 && (
            <div className="py-12 text-center text-text-muted text-sm">No signals match the current filters.</div>
          )}

          {/* Expanded Row Detail */}
          <AnimatePresence>
            {expandedRow && (() => {
              const signal = mockSignals.find((s) => s.id === expandedRow);
              if (!signal) return null;
              return (
                <motion.div
                  key={expandedRow}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                  className="overflow-hidden border-t border-border-default bg-bg-elevated/30"
                >
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">Signal Reason</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{signal.reason}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">Technical Analysis</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{signal.technicalSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">Details</h4>
                      <div className="space-y-1 text-xs text-text-secondary">
                        <div className="flex justify-between"><span>Strategy:</span><span className="text-text-primary">{signal.strategy}</span></div>
                        <div className="flex justify-between"><span>Account:</span><span className="text-text-primary">{signal.account}</span></div>
                        <div className="flex justify-between"><span>Shares:</span><span className="text-text-primary">{signal.shares}</span></div>
                        <div className="flex justify-between"><span>Stop Loss:</span><span className="text-signal-bearish">${signal.stopLoss.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Target:</span><span className="text-accent-primary">${signal.target.toFixed(2)}</span></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Section 3: Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="lg:col-span-3 bg-bg-card rounded-xl border border-border-default p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary font-heading">Signal P&L Equity Curve</h3>
            <div className="flex gap-1">
              {['30D', '90D', '1Y'].map((tf) => (
                <button key={tf} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${tf === '30D' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}>
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={equityCurveData}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9C0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D9C0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#1E293B" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#1E293B" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`+$${value.toLocaleString()}`, 'Cumulative P&L']}
              />
              <Area type="monotone" dataKey="pnl" stroke="#00D9C0" strokeWidth={2} fill="url(#pnlGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-default">
            <div>
              <span className="text-[11px] text-text-muted">Best Signal</span>
              <p className="text-sm font-mono text-[#00E676]">NVDA STRONG_BUY +$2,340</p>
            </div>
            <div>
              <span className="text-[11px] text-text-muted">Worst Signal</span>
              <p className="text-sm font-mono text-[#FF1744]">TSLA SELL -$890</p>
            </div>
            <div>
              <span className="text-[11px] text-text-muted">Consecutive Wins</span>
              <p className="text-sm font-mono text-text-primary">5 (current streak)</p>
            </div>
          </div>
        </motion.div>

        {/* Win/Loss Pie + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="lg:col-span-2 bg-bg-card rounded-xl border border-border-default p-5"
        >
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4">Signal Performance</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winLossData} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" stroke="none">
                    {winLossData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold font-mono text-[#00E676]">{winRate}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-xs"><span className="text-text-secondary">Total Signals</span><span className="font-mono text-text-primary">{totalSignals}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#00E676]">Wins</span><span className="font-mono text-[#00E676]">{wins}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#FF1744]">Losses</span><span className="font-mono text-[#FF1744]">{losses}</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-secondary">Avg Win</span><span className="font-mono text-[#00E676]">+$520</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-secondary">Avg Loss</span><span className="font-mono text-[#FF1744]">-$195</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-secondary">Profit Factor</span><span className="font-mono text-accent-primary">2.67</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-secondary">Expectancy</span><span className="font-mono text-accent-primary">+$255/signal</span></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section 4: Monthly Performance + Top Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="bg-bg-card rounded-xl border border-border-default p-5"
        >
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} stroke="#1E293B" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#1E293B" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="wins" fill="#00E676" radius={[4, 4, 0, 0]} name="Wins" />
              <Bar dataKey="losses" fill="#FF1744" radius={[4, 4, 0, 0]} name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {/* Top 5 Winners */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-bg-card rounded-xl border border-border-default p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-[#00E676]" />
              <h4 className="text-sm font-semibold text-text-primary">Top 5 Winning Signals</h4>
            </div>
            <div className="space-y-2">
              {topWinners.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <SignalBadge signal={s.type} size="sm" />
                    <span className="font-mono font-bold text-text-primary">{s.ticker}</span>
                    <span className="text-text-muted">{s.strategy}</span>
                  </div>
                  <span className="font-mono text-[#00E676]">+${(s.result || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top 5 Losers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-bg-card rounded-xl border border-border-default p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#FF1744]" />
              <h4 className="text-sm font-semibold text-text-primary">Top 5 Losing Signals</h4>
            </div>
            <div className="space-y-2">
              {topLosers.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <SignalBadge signal={s.type} size="sm" />
                    <span className="font-mono font-bold text-text-primary">{s.ticker}</span>
                    <span className="text-text-muted">{s.strategy}</span>
                  </div>
                  <span className="font-mono text-[#FF1744]">-${Math.abs(s.result || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section 5: Active Pyramid Builds */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-bold text-text-primary font-heading">Active Pyramid Builds</h2>
        </div>
        <div className="space-y-4">
          {pyramidBuilds.map((build) => (
            <div key={build.id} className="bg-bg-card rounded-xl border border-border-default overflow-hidden">
              {/* Collapsed Header */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-bg-elevated/20 transition-colors"
                onClick={() => setExpandedPyramid(expandedPyramid === build.id ? null : build.id)}
              >
                <div className="shrink-0">
                  <span className="text-lg font-mono font-bold text-text-primary">{build.ticker}</span>
                  <span className="text-xs text-text-muted ml-2">{build.name}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {build.tiers.map((t, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-sm transition-all"
                      style={{
                        width: 16 + i * 4,
                        backgroundColor: t.status === 'filled' ? '#00E676' : t.status === 'current' ? '#00D9C0' : '#1E293B',
                      }}
                    />
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-4 text-xs">
                  <span className="text-text-secondary">{build.currentTier}/{build.totalTiers} levels</span>
                  <span className="font-mono text-text-primary">${(build.invested / 1000).toFixed(1)}K / ${(build.target / 1000).toFixed(1)}K</span>
                  <span className={`font-mono ${build.unrealizedPnl >= 0 ? 'text-[#00E676]' : 'text-[#FF1744]'}`}>
                    {build.unrealizedPnl >= 0 ? '+' : ''}${build.unrealizedPnl.toLocaleString()}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: build.account === 'Aggressive' ? 'rgba(255,107,53,0.15)' : build.account === 'Stable' ? 'rgba(0,217,192,0.15)' : 'rgba(99,102,241,0.15)', color: build.account === 'Aggressive' ? '#FF6B35' : build.account === 'Stable' ? '#00D9C0' : '#6366F1' }}>
                    {build.account}
                  </span>
                  {expandedPyramid === build.id ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>
              </div>

              {/* Expanded Pyramid */}
              <AnimatePresence>
                {expandedPyramid === build.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-border-default">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Pyramid Visual */}
                        <div className="flex-1 flex flex-col items-center gap-1">
                          {[...build.tiers].reverse().map((tier) => (
                            <div
                              key={tier.level}
                              className="flex items-center gap-3 transition-all"
                              style={{ width: `${40 + tier.level * 8}%` }}
                            >
                              <div
                                className="h-8 rounded-md flex items-center justify-center text-[11px] font-mono font-medium flex-1 relative overflow-hidden"
                                style={{
                                  backgroundColor: tier.status === 'filled' ? 'rgba(0,230,118,0.2)' : tier.status === 'current' ? 'rgba(0,217,192,0.15)' : '#111827',
                                  border: `1px solid ${tier.status === 'filled' ? '#00E676' : tier.status === 'current' ? '#00D9C0' : '#1E293B'}`,
                                  color: tier.status === 'filled' ? '#00E676' : tier.status === 'current' ? '#00D9C0' : '#64748B',
                                }}
                              >
                                {tier.status === 'filled' && <div className="absolute inset-0 bg-[#00E676] opacity-20" />}
                                {tier.status === 'current' && (
                                  <motion.div
                                    className="absolute inset-0 bg-[#00D9C0] opacity-10"
                                    animate={{ opacity: [0.05, 0.2, 0.05] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                )}
                                <span className="relative z-10">L{tier.level} {tier.status === 'filled' ? '✓' : tier.status === 'current' ? '●' : '○'} ${tier.price.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Details Panel */}
                        <div className="md:w-64 space-y-3">
                          <h4 className="text-sm font-semibold text-text-primary">Build Details</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-text-muted">Total Invested</span><span className="font-mono text-text-primary">${build.invested.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Total Target</span><span className="font-mono text-text-primary">${build.target.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Average Cost</span><span className="font-mono text-text-primary">${build.avgCost.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Current Price</span><span className="font-mono text-accent-primary">${build.currentPrice.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Next Buy</span><span className="font-mono text-signal-bearish">${build.nextBuyPrice.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Unrealized P&L</span><span className={`font-mono ${build.unrealizedPnl >= 0 ? 'text-[#00E676]' : 'text-[#FF1744]'}`}>{build.unrealizedPnl >= 0 ? '+' : ''}${build.unrealizedPnl.toLocaleString()}</span></div>
                          </div>
                          <div className="pt-2 border-t border-border-default">
                            <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent-primary transition-all"
                                style={{ width: `${(build.invested / build.target) * 100}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-text-muted mt-1 text-center">{((build.invested / build.target) * 100).toFixed(1)}% deployed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 6: Trade Journal Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-bold text-text-primary font-heading">Trade Journal</h2>
        </div>

        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border-default md:-translate-x-px" />

          <div className="space-y-6">
            {tradeJournal.map((trade, idx) => {
              const isLeft = idx % 2 === 0;
              const isBuy = trade.action === 'BUY';
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + idx * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className={`relative flex items-start gap-4 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-bg-primary z-10 mt-1.5"
                    style={{ backgroundColor: isBuy ? '#00E676' : '#FF1744' }}
                  />

                  {/* Card */}
                  <div className={`ml-10 md:ml-0 md:w-[calc(50%-24px)] ${isLeft ? 'md:pr-0 md:text-right' : 'md:pl-0'}`}>
                    <div
                      className="bg-bg-card rounded-xl border border-border-default p-4 hover:-translate-y-0.5 transition-all duration-200"
                      style={{ borderLeft: `3px solid ${isBuy ? '#00E676' : '#FF1744'}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-text-muted font-mono">{trade.date}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isBuy ? 'bg-[rgba(0,230,118,0.15)] text-[#00E676]' : 'bg-[rgba(255,23,68,0.15)] text-[#FF1744]'}`}>
                          {trade.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-mono font-bold text-text-primary">{trade.ticker}</span>
                        <span className="text-xs text-text-muted">{trade.strategy}</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        <span className="font-mono text-text-primary">${trade.price.toFixed(2)}</span>
                        <span className="mx-1">x</span>
                        <span className="font-mono">{trade.shares} shares</span>
                        <span className="mx-1">=</span>
                        <span className="font-mono text-text-primary">${(trade.price * trade.shares).toLocaleString()}</span>
                      </div>
                      {trade.pnl !== undefined && (
                        <div className={`mt-2 text-sm font-mono font-bold ${trade.pnl >= 0 ? 'text-[#00E676]' : 'text-[#FF1744]'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                          {trade.pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5 inline ml-1" /> : <TrendingDown className="w-3.5 h-3.5 inline ml-1" />}
                        </div>
                      )}
                      {trade.level && (
                        <div className="mt-2 text-[11px] text-accent-primary">{trade.level}</div>
                      )}
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-[calc(50%-24px)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
