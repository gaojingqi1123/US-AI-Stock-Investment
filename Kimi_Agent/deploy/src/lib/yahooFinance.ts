// ── Type Definitions ──────────────────────────────────────────────

export interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  dayHigh?: number;
  dayLow?: number;
  open?: number;
  previousClose?: number;
  timestamp: Date;
}

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface VIXData {
  value: number;
  change: number;
  changePercent: number;
  severity: VIXSeverity;
  timestamp: Date;
}

export type VIXSeverity = 'calm' | 'elevated' | 'high' | 'extreme' | 'panic';

export interface MarketSummary {
  indices: MarketIndexData[];
  vix: VIXData;
  timestamp: Date;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

// ── VIX Severity Helper ───────────────────────────────────────────

export function getVIXSeverity(vixValue: number): VIXSeverity {
  if (vixValue < 20) return 'calm';
  if (vixValue < 30) return 'elevated';
  if (vixValue < 40) return 'high';
  if (vixValue < 50) return 'extreme';
  return 'panic';
}

export function getVIXSeverityColor(severity: VIXSeverity): string {
  const colors: Record<VIXSeverity, string> = {
    calm: '#00E676',
    elevated: '#FBBF24',
    high: '#FF9800',
    extreme: '#FF5722',
    panic: '#FF1744',
  };
  return colors[severity];
}

export function getVIXActionAdvice(vixLevel: number): string {
  if (vixLevel < 20) {
    return '市场平静 — 维持标准仓位配置。关注个股机会，保持30%现金储备。';
  }
  if (vixLevel < 30) {
    return '警戒状态 — 维持标准配置比例。如VIX突破30，准备部署30%现金储备。';
  }
  if (vixLevel < 40) {
    return '高度焦虑 — 开始分批建仓ETF。金字塔第1-2层建仓，利用恐慌情绪。';
  }
  if (vixLevel < 50) {
    return '极端恐慌 — 积极买入。金字塔第3-4层建仓，加大仓位配置。';
  }
  if (vixLevel < 90) {
    return '市场恐慌 — 激进买入机会。金字塔第5-7层满仓，历史性抄底时机。';
  }
  return '历史级恐慌 — 最大机会窗口。全力建仓，动用所有现金储备。';
}

// ── Mock Data Generators ─────────────────────────────────────────

const MOCK_QUOTES: Record<string, QuoteData> = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 2.71, changePercent: 1.45, volume: 52400000, marketCap: 2900000000000, peRatio: 28.5, fiftyTwoWeekHigh: 199.62, fiftyTwoWeekLow: 164.08, dayHigh: 190.10, dayLow: 187.50, open: 188.00, previousClose: 186.54, timestamp: new Date() },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corp.', price: 425.80, change: 3.47, changePercent: 0.82, volume: 22100000, marketCap: 3150000000000, peRatio: 32.1, fiftyTwoWeekHigh: 430.82, fiftyTwoWeekLow: 362.90, dayHigh: 428.00, dayLow: 422.00, open: 423.00, previousClose: 422.33, timestamp: new Date() },
  GOOGL: { symbol: 'Alphabet Inc.', name: 'Alphabet Inc.', price: 165.40, change: -0.58, changePercent: -0.35, volume: 18900000, marketCap: 2050000000000, peRatio: 24.8, fiftyTwoWeekHigh: 191.75, fiftyTwoWeekLow: 129.40, dayHigh: 167.00, dayLow: 164.20, open: 166.00, previousClose: 165.98, timestamp: new Date() },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.20, change: 1.97, changePercent: 1.12, volume: 31200000, marketCap: 1850000000000, peRatio: 58.2, fiftyTwoWeekHigh: 189.77, fiftyTwoWeekLow: 151.00, dayHigh: 179.50, dayLow: 176.80, open: 177.00, previousClose: 176.23, timestamp: new Date() },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 27.52, changePercent: 3.25, volume: 48700000, marketCap: 2180000000000, peRatio: 72.5, fiftyTwoWeekHigh: 974.00, fiftyTwoWeekLow: 460.10, dayHigh: 880.00, dayLow: 860.00, open: 865.00, previousClose: 847.78, timestamp: new Date() },
  META: { symbol: 'META', name: 'Meta Platforms', price: 485.20, change: -3.32, changePercent: -0.68, volume: 15600000, marketCap: 1240000000000, peRatio: 24.6, fiftyTwoWeekHigh: 531.49, fiftyTwoWeekLow: 326.49, dayHigh: 490.00, dayLow: 482.00, open: 488.00, previousClose: 488.52, timestamp: new Date() },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.50, change: 0.26, changePercent: 0.15, volume: 98400000, marketCap: 558000000000, peRatio: 45.2, fiftyTwoWeekHigh: 299.29, fiftyTwoWeekLow: 152.37, dayHigh: 178.00, dayLow: 173.00, open: 175.00, previousClose: 175.24, timestamp: new Date() },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices', price: 142.80, change: 3.05, changePercent: 2.18, volume: 45600000, marketCap: 231000000000, peRatio: 52.8, fiftyTwoWeekHigh: 227.30, fiftyTwoWeekLow: 126.54, dayHigh: 145.00, dayLow: 140.00, open: 140.50, previousClose: 139.75, timestamp: new Date() },
  SPY: { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 524.78, change: 6.42, changePercent: 1.24, volume: 52800000, marketCap: undefined, peRatio: undefined, fiftyTwoWeekHigh: 527.50, fiftyTwoWeekLow: 480.00, dayHigh: 526.00, dayLow: 520.00, open: 520.00, previousClose: 518.36, timestamp: new Date() },
  QQQ: { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 447.25, change: 5.63, changePercent: 1.27, volume: 31500000, marketCap: undefined, peRatio: undefined, fiftyTwoWeekHigh: 450.00, fiftyTwoWeekLow: 395.00, dayHigh: 449.00, dayLow: 443.00, open: 443.00, previousClose: 441.62, timestamp: new Date() },
  DIA: { symbol: 'DIA', name: 'SPDR Dow Jones ETF', price: 391.23, change: 3.42, changePercent: 0.88, volume: 4200000, marketCap: undefined, peRatio: undefined, fiftyTwoWeekHigh: 395.00, fiftyTwoWeekLow: 365.00, dayHigh: 392.50, dayLow: 388.50, open: 388.50, previousClose: 387.81, timestamp: new Date() },
  '^VIX': { symbol: '^VIX', name: 'CBOE Volatility Index', price: 24.5, change: 1.2, changePercent: 5.15, volume: 0, marketCap: undefined, peRatio: undefined, fiftyTwoWeekHigh: 65.73, fiftyTwoWeekLow: 12.50, dayHigh: 26.00, dayLow: 23.00, open: 23.50, previousClose: 23.30, timestamp: new Date() },
};

function generateMockHistorical(ticker: string): HistoricalDataPoint[] {
  const points: HistoricalDataPoint[] = [];
  const basePrice = MOCK_QUOTES[ticker]?.price ?? 100;
  let price = basePrice * 0.7;
  const now = new Date();

  for (let i = 252; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.48) * price * 0.03;
    price += change;
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    points.push({
      date,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }

  return points;
}

// ── API Functions ─────────────────────────────────────────────────

/**
 * Get real-time quote data for a single ticker
 */
export async function getQuote(ticker: string): Promise<QuoteData> {
  // Use mock data for browser environment
  const upperTicker = ticker.toUpperCase();
  if (MOCK_QUOTES[upperTicker]) {
    return { ...MOCK_QUOTES[upperTicker], timestamp: new Date() };
  }

  // Fallback: generate a mock quote
  return {
    symbol: upperTicker,
    name: upperTicker,
    price: 100 + Math.random() * 200,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 100000000),
    timestamp: new Date(),
  };
}

/**
 * Get real-time quotes for multiple tickers
 */
export async function getQuotes(tickers: string[]): Promise<QuoteData[]> {
  const results = await Promise.allSettled(
    tickers.map((t) => getQuote(t))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<QuoteData> => r.status === 'fulfilled')
    .map((r) => r.value);
}

/**
 * Get historical OHLCV data for a ticker
 */
export async function getHistorical(
  ticker: string,
  _period: string = '1y'
): Promise<HistoricalDataPoint[]> {
  return generateMockHistorical(ticker);
}

/**
 * Get VIX index data
 */
export async function getVIX(): Promise<VIXData> {
  const vixQuote = await getQuote('^VIX');
  const value = vixQuote.price;
  return {
    value,
    change: vixQuote.change,
    changePercent: vixQuote.changePercent,
    severity: getVIXSeverity(value),
    timestamp: new Date(),
  };
}

/**
 * Get major market indices (S&P 500, NASDAQ, Dow Jones)
 */
export async function getMarketSummary(): Promise<MarketSummary> {
  const indices = await getQuotes(['SPY', 'QQQ', 'DIA']);
  const vix = await getVIX();

  return {
    indices: indices.map((q) => ({
      symbol: q.symbol,
      name: getIndexName(q.symbol),
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      timestamp: q.timestamp,
    })),
    vix,
    timestamp: new Date(),
  };
}

/**
 * Search for stocks by keyword
 */
export async function searchStocks(query: string): Promise<SearchResult[]> {
  const allSymbols = Object.keys(MOCK_QUOTES).filter((s) => !s.startsWith('^'));
  const results = allSymbols
    .filter((s) => s.includes(query.toUpperCase()) || MOCK_QUOTES[s].name.toUpperCase().includes(query.toUpperCase()))
    .slice(0, 10)
    .map((s) => ({
      symbol: s,
      name: MOCK_QUOTES[s].name,
      exchange: 'NASDAQ',
      type: 'EQUITY',
    }));

  return results;
}

// ── Helper Functions ──────────────────────────────────────────────

function getIndexName(symbol: string): string {
  const names: Record<string, string> = {
    SPY: 'S&P 500',
    QQQ: 'NASDAQ 100',
    DIA: 'Dow Jones',
  };
  return names[symbol] || symbol;
}
