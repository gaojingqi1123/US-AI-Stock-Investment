// ── Type Definitions ──────────────────────────────────────────────

export type SignalType = 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
export type AccountType = 'aggressive' | 'stable' | 'defensive';
export type TrendDirection = 'uptrend' | 'downtrend' | 'sideways';

export interface PyramidLevel {
  level: number;
  ratio: number;
  price: number;
  shares: number;
  investment: number;
  cumulativeShares: number;
  cumulativeInvestment: number;
  averageCost: number;
}

export interface Signal {
  id: string;
  ticker: string;
  type: SignalType;
  price: number;
  targetPrice: number;
  stopLoss?: number;
  reason: string;
  technicalAnalysis: string;
  confidence: number; // 0-100
  timestamp: Date;
  strategy: string;
  account?: AccountType;
}

export interface AccountAllocation {
  type: AccountType;
  name: string;
  percentage: number;
  value: number;
  color: string;
  positions: Position[];
}

export interface Position {
  ticker: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  account: AccountType;
}

export interface TechnicalAnalysis {
  supportLevels: number[];
  resistanceLevels: number[];
  trend: TrendDirection;
  trendStrength: number; // 0-100
  rsi: number;
  rsiSignal: 'overbought' | 'oversold' | 'neutral';
  macdSignal: 'bullish' | 'bearish' | 'neutral';
  maSignal: 'golden_cross' | 'death_cross' | 'neutral';
  recommendation: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  accounts: AccountAllocation[];
  cashReserve: number;
  cashReservePercent: number;
  riskMetrics: RiskMetrics;
}

export interface RiskMetrics {
  maxDrawdown: number;
  sharpeRatio: number;
  beta: number;
  winRate: number;
  volatility: number;
}

// ── VIX Decision System ───────────────────────────────────────────

export interface VIXDecision {
  level: number;
  severity: 'calm' | 'elevated' | 'high' | 'extreme' | 'panic';
  action: string;
  allocationAdjustment: Record<AccountType, number>;
  description: string;
}

export function getVIXDecision(vixLevel: number): VIXDecision {
  if (vixLevel < 20) {
    return {
      level: vixLevel,
      severity: 'calm',
      action: 'HOLD',
      allocationAdjustment: { aggressive: 45, stable: 15, defensive: 40 },
      description: '市场平静，维持标准配置',
    };
  }
  if (vixLevel < 30) {
    return {
      level: vixLevel,
      severity: 'elevated',
      action: 'WATCH',
      allocationAdjustment: { aggressive: 40, stable: 20, defensive: 40 },
      description: '警戒状态，准备部署资金',
    };
  }
  if (vixLevel < 40) {
    return {
      level: vixLevel,
      severity: 'high',
      action: 'BUY_ETF',
      allocationAdjustment: { aggressive: 50, stable: 15, defensive: 35 },
      description: '开始分批建仓ETF，金字塔1-2层',
    };
  }
  if (vixLevel < 50) {
    return {
      level: vixLevel,
      severity: 'extreme',
      action: 'AGGRESSIVE_BUY',
      allocationAdjustment: { aggressive: 55, stable: 10, defensive: 35 },
      description: '极端恐慌，积极买入ETF，金字塔3-4层',
    };
  }
  return {
    level: vixLevel,
    severity: 'panic',
    action: 'MAXIMUM_BUY',
    allocationAdjustment: { aggressive: 60, stable: 10, defensive: 30 },
    description: '市场恐慌，全力建仓，历史性机会',
  };
}

// ── Pyramid Position Builder ──────────────────────────────────────

const PYRAMID_RATIOS = [1, 1, 1.5, 1.5, 2, 2, 3];

export interface PyramidConfig {
  basePrice: number;
  stepPercent: number; // Price step between levels (default 3-5%)
  baseShares: number;  // Shares for ratio=1
  maxLevels?: number;
}

/**
 * Generate pyramid position levels
 * Uses 1-1-1.5-1.5-2-2-3 ratio system
 */
export function generatePyramidLevels(config: PyramidConfig): PyramidLevel[] {
  const { basePrice, stepPercent, baseShares, maxLevels = 7 } = config;
  const ratios = PYRAMID_RATIOS.slice(0, maxLevels);
  const levels: PyramidLevel[] = [];

  let cumulativeShares = 0;
  let cumulativeInvestment = 0;

  for (let i = 0; i < ratios.length; i++) {
    const ratio = ratios[i];
    const price = basePrice * Math.pow(1 - stepPercent / 100, i);
    const shares = Math.round(baseShares * ratio);
    const investment = shares * price;

    cumulativeShares += shares;
    cumulativeInvestment += investment;

    levels.push({
      level: i + 1,
      ratio,
      price: Math.round(price * 100) / 100,
      shares,
      investment: Math.round(investment * 100) / 100,
      cumulativeShares,
      cumulativeInvestment: Math.round(cumulativeInvestment * 100) / 100,
      averageCost: Math.round((cumulativeInvestment / cumulativeShares) * 100) / 100,
    });
  }

  return levels;
}

/**
 * Get pyramid summary statistics
 */
export function getPyramidSummary(levels: PyramidLevel[]) {
  if (levels.length === 0) return null;

  const lastLevel = levels[levels.length - 1];
  const totalInvestment = lastLevel.cumulativeInvestment;
  const totalShares = lastLevel.cumulativeShares;
  const avgCost = lastLevel.averageCost;
  const firstPrice = levels[0].price;
  const lastPrice = lastLevel.price;
  const priceDrop = ((firstPrice - lastPrice) / firstPrice) * 100;

  return {
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    totalShares,
    averageCost: avgCost,
    firstPrice,
    lastPrice,
    totalLevels: levels.length,
    priceDropPercent: Math.round(priceDrop * 100) / 100,
    maxDrawdown: Math.round(priceDrop * 100) / 100,
  };
}

// ── Signal Generator ──────────────────────────────────────────────

export interface SignalConfig {
  rsiOverbought?: number;
  rsiOversold?: number;
  maShort?: number;
  maLong?: number;
}

const DEFAULT_SIGNAL_CONFIG: SignalConfig = {
  rsiOverbought: 70,
  rsiOversold: 30,
  maShort: 20,
  maLong: 60,
};

/**
 * Generate trading signals based on technical analysis
 */
export function generateSignal(
  ticker: string,
  prices: number[],
  volumes: number[],
  currentPrice: number,
  vixLevel: number,
  config: SignalConfig = DEFAULT_SIGNAL_CONFIG
): Signal {
  const mergedConfig = { ...DEFAULT_SIGNAL_CONFIG, ...config };
  const analysis = calculateTechnicalAnalysis(prices, volumes, mergedConfig);
  const id = `${ticker}-${Date.now()}`;

  let type: SignalType = 'HOLD';
  let confidence = 50;
  let reason = '';
  let targetPrice = currentPrice;

  // VIX-based signal override
  const vixDecision = getVIXDecision(vixLevel);

  if (analysis.rsiSignal === 'oversold' && vixDecision.severity !== 'calm') {
    type = vixLevel >= 40 ? 'STRONG_BUY' : 'BUY';
    confidence = Math.min(95, 60 + (vixLevel / 100) * 40);
    reason = `RSI超卖(${Math.round(analysis.rsi)}) + VIX ${vixLevel} 恐慌情绪`;
    targetPrice = currentPrice * 1.08;
  } else if (analysis.rsiSignal === 'overbought') {
    type = analysis.macdSignal === 'bearish' ? 'STRONG_SELL' : 'SELL';
    confidence = Math.min(90, 65 + (analysis.rsi - 70) * 2);
    reason = `RSI超买(${Math.round(analysis.rsi)}) + MACD${analysis.macdSignal === 'bearish' ? '死叉' : '走弱'}`;
    targetPrice = currentPrice * 0.95;
  } else if (analysis.maSignal === 'golden_cross' && analysis.trend === 'uptrend') {
    type = 'BUY';
    confidence = 70;
    reason = '均线金叉，上升趋势确认';
    targetPrice = currentPrice * 1.05;
  } else if (analysis.maSignal === 'death_cross' && analysis.trend === 'downtrend') {
    type = 'SELL';
    confidence = 72;
    reason = '均线死叉，下降趋势确认';
    targetPrice = currentPrice * 0.93;
  } else if (vixLevel >= 40 && analysis.rsi < 50) {
    type = 'BUY';
    confidence = 65;
    reason = `VIX恐慌(${vixLevel}) + 技术面回撤，分批建仓机会`;
    targetPrice = currentPrice * 1.06;
  }

  return {
    id,
    ticker,
    type,
    price: Math.round(currentPrice * 100) / 100,
    targetPrice: Math.round(targetPrice * 100) / 100,
    reason,
    technicalAnalysis: formatTechnicalAnalysis(analysis),
    confidence: Math.round(confidence),
    timestamp: new Date(),
    strategy: getStrategyName(type, vixLevel),
  };
}

// ── Technical Analysis ────────────────────────────────────────────

export function calculateTechnicalAnalysis(
  prices: number[],
  _volumes: number[],
  config: SignalConfig = DEFAULT_SIGNAL_CONFIG
): TechnicalAnalysis {
  const mergedConfig = { ...DEFAULT_SIGNAL_CONFIG, ...config };
  const rsi = calculateRSI(prices);
  const maShort = calculateSMA(prices, mergedConfig.maShort!);
  const maLong = calculateSMA(prices, mergedConfig.maLong!);
  const macd = calculateMACD(prices);

  // Support/Resistance from recent price action
  const recentPrices = prices.slice(-20);
  const supportLevels = findSupportLevels(recentPrices);
  const resistanceLevels = findResistanceLevels(recentPrices);

  // Trend determination
  const trend = determineTrend(prices, maShort, maLong);
  const trendStrength = calculateTrendStrength(prices);

  // Signals
  const rsiSignal: TechnicalAnalysis['rsiSignal'] =
    rsi > mergedConfig.rsiOverbought! ? 'overbought' :
    rsi < mergedConfig.rsiOversold! ? 'oversold' : 'neutral';

  const macdSignal: TechnicalAnalysis['macdSignal'] =
    macd.histogram > 0 && macd.macd > macd.signal ? 'bullish' :
    macd.histogram < 0 && macd.macd < macd.signal ? 'bearish' : 'neutral';

  const maSignal: TechnicalAnalysis['maSignal'] =
    maShort > maLong && prices[prices.length - 1] > maShort ? 'golden_cross' :
    maShort < maLong && prices[prices.length - 1] < maShort ? 'death_cross' : 'neutral';

  let recommendation = 'HOLD';
  if (rsiSignal === 'oversold' || (maSignal === 'golden_cross' && macdSignal === 'bullish')) {
    recommendation = 'BUY';
  } else if (rsiSignal === 'overbought' || (maSignal === 'death_cross' && macdSignal === 'bearish')) {
    recommendation = 'SELL';
  }

  return {
    supportLevels,
    resistanceLevels,
    trend,
    trendStrength,
    rsi: Math.round(rsi * 100) / 100,
    rsiSignal,
    macdSignal,
    maSignal,
    recommendation,
  };
}

// ── Three Account Manager ─────────────────────────────────────────

const ACCOUNT_CONFIG: Record<AccountType, { name: string; percentage: number; color: string }> = {
  aggressive: { name: '进取型', percentage: 45, color: '#FF6B35' },
  stable: { name: '稳健型', percentage: 15, color: '#00D9C0' },
  defensive: { name: '防御型', percentage: 40, color: '#6366F1' },
};

export function createAccountAllocation(
  type: AccountType,
  _totalPortfolioValue: number,
  positions: Position[]
): AccountAllocation {
  const config = ACCOUNT_CONFIG[type];
  const accountPositions = positions.filter((p) => p.account === type);
  const currentValue = accountPositions.reduce((sum, p) => sum + p.marketValue, 0);

  return {
    type,
    name: config.name,
    percentage: config.percentage,
    value: Math.round(currentValue * 100) / 100,
    color: config.color,
    positions: accountPositions,
  };
}

export function createPortfolioSummary(
  totalValue: number,
  positions: Position[],
  cashReserve: number
): PortfolioSummary {
  const accounts: AccountAllocation[] = [
    createAccountAllocation('aggressive', totalValue, positions),
    createAccountAllocation('stable', totalValue, positions),
    createAccountAllocation('defensive', totalValue, positions),
  ];

  const totalInvested = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.shares * p.averageCost, 0);
  const totalPnl = totalInvested - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalChange: Math.round(totalPnl * 100) / 100,
    totalChangePercent: Math.round(totalPnlPercent * 100) / 100,
    accounts,
    cashReserve: Math.round(cashReserve * 100) / 100,
    cashReservePercent: Math.round((cashReserve / totalValue) * 1000) / 10,
    riskMetrics: calculateRiskMetrics(positions),
  };
}

// ── Helper Functions ──────────────────────────────────────────────

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([...prices.slice(-26), ema12], 9);
  const histogram = macdLine - signalLine;

  return {
    macd: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
  };
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

function findSupportLevels(prices: number[]): number[] {
  const levels: number[] = [];
  for (let i = 2; i < prices.length - 2; i++) {
    if (prices[i] < prices[i - 1] && prices[i] < prices[i - 2] &&
        prices[i] < prices[i + 1] && prices[i] < prices[i + 2]) {
      levels.push(Math.round(prices[i] * 100) / 100);
    }
  }
  return levels.slice(-3);
}

function findResistanceLevels(prices: number[]): number[] {
  const levels: number[] = [];
  for (let i = 2; i < prices.length - 2; i++) {
    if (prices[i] > prices[i - 1] && prices[i] > prices[i - 2] &&
        prices[i] > prices[i + 1] && prices[i] > prices[i + 2]) {
      levels.push(Math.round(prices[i] * 100) / 100);
    }
  }
  return levels.slice(-3);
}

function determineTrend(prices: number[], maShort: number, maLong: number): TrendDirection {
  const currentPrice = prices[prices.length - 1];
  if (currentPrice > maShort && maShort > maLong) return 'uptrend';
  if (currentPrice < maShort && maShort < maLong) return 'downtrend';
  return 'sideways';
}

function calculateTrendStrength(prices: number[]): number {
  if (prices.length < 20) return 50;
  const sma20 = calculateSMA(prices, 20);
  const currentPrice = prices[prices.length - 1];
  const deviation = Math.abs((currentPrice - sma20) / sma20) * 100;
  return Math.min(100, Math.round(deviation * 10));
}

function calculateRiskMetrics(positions: Position[]): RiskMetrics {
  const pnls = positions.map((p) => p.unrealizedPnlPercent);
  const winning = pnls.filter((p) => p > 0);

  const winRate = pnls.length > 0 ? (winning.length / pnls.length) * 100 : 0;

  // Simplified calculations
  const avgReturn = pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0;
  const variance = pnls.length > 0
    ? pnls.reduce((sum, p) => sum + Math.pow(p - avgReturn, 2), 0) / pnls.length
    : 0;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
  const sharpeRatio = volatility > 0 ? (avgReturn / volatility) * 100 : 1.5;

  const maxDrawdown = pnls.length > 0 ? Math.min(...pnls) : 0;

  return {
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    beta: 0.94,
    winRate: Math.round(winRate * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
  };
}

function formatTechnicalAnalysis(analysis: TechnicalAnalysis): string {
  const parts: string[] = [];
  parts.push(`趋势: ${analysis.trend === 'uptrend' ? '上升' : analysis.trend === 'downtrend' ? '下降' : '横盘'} (${analysis.trendStrength}/100)`);
  parts.push(`RSI: ${analysis.rsi} (${analysis.rsiSignal === 'overbought' ? '超买' : analysis.rsiSignal === 'oversold' ? '超卖' : '中性'})`);
  parts.push(`MACD: ${analysis.macdSignal === 'bullish' ? '看涨' : analysis.macdSignal === 'bearish' ? '看跌' : '中性'}`);
  parts.push(`均线: ${analysis.maSignal === 'golden_cross' ? '金叉' : analysis.maSignal === 'death_cross' ? '死叉' : '中性'}`);
  if (analysis.supportLevels.length > 0) {
    parts.push(`支撑位: ${analysis.supportLevels.join(', ')}`);
  }
  if (analysis.resistanceLevels.length > 0) {
    parts.push(`阻力位: ${analysis.resistanceLevels.join(', ')}`);
  }
  return parts.join(' | ');
}

function getStrategyName(type: SignalType, vixLevel: number): string {
  if (type.includes('BUY')) {
    if (vixLevel >= 40) return 'VIX恐慌买入';
    if (type === 'STRONG_BUY') return '金字塔建仓';
    return '技术突破买入';
  }
  if (type.includes('SELL')) {
    if (type === 'STRONG_SELL') return '趋势反转卖出';
    return '止盈减仓';
  }
  return '观望持有';
}
