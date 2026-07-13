import { useEffect, useState, useRef, useCallback } from 'react'

export interface StockQuote {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  high52: number
  low52: number
  dayHigh: number
  dayLow: number
  open: number
  previousClose: number
  currency: string
  timestamp: number
}

// ====== CORS Proxy for Yahoo Finance ======
// Using allorigins.win as CORS proxy - no backend needed!
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

function yfUrl(path: string): string {
  const encoded = encodeURIComponent(`https://query1.finance.yahoo.com${path}`)
  return `${CORS_PROXY}${encoded}`
}

// Cache with 5-second TTL
const cache = new Map<string, { data: any; ts: number }>()
const CACHE_TTL = 5000

function getCache(key: string) {
  const c = cache.get(key)
  if (c && Date.now() - c.ts < CACHE_TTL) return c.data
  return null
}
function setCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() })
}

// ====== Parse Yahoo Finance Response ======
function parseQuote(result: any): StockQuote {
  const p = result.price || result
  const n = result.quoteType?.toLowerCase() === 'index'
  return {
    ticker: p.symbol || result.symbol || '',
    name: p.shortName || p.longName || p.symbol || '',
    price: p.regularMarketPrice?.raw ?? p.regularMarketPrice ?? 0,
    change: p.regularMarketChange?.raw ?? p.regularMarketChange ?? 0,
    changePercent: p.regularMarketChangePercent?.raw ?? p.regularMarketChangePercent ?? 0,
    volume: p.regularMarketVolume?.raw ?? p.regularMarketVolume ?? 0,
    marketCap: p.marketCap?.raw ?? p.marketCap ?? 0,
    pe: p.trailingPE?.raw ?? p.trailingPE ?? 0,
    high52: p.fiftyTwoWeekHigh?.raw ?? p.fiftyTwoWeekHigh ?? 0,
    low52: p.fiftyTwoWeekLow?.raw ?? p.fiftyTwoWeekLow ?? 0,
    dayHigh: p.regularMarketDayHigh?.raw ?? p.regularMarketDayHigh ?? 0,
    dayLow: p.regularMarketDayLow?.raw ?? p.regularMarketDayLow ?? 0,
    open: p.regularMarketOpen?.raw ?? p.regularMarketOpen ?? 0,
    previousClose: p.regularMarketPreviousClose?.raw ?? p.regularMarketPreviousClose ?? 0,
    currency: p.currency || 'USD',
    timestamp: Date.now(),
  }
}

// ====== Mock Fallback Data (2026-07-07) ======
const FALLBACK: Record<string, StockQuote> = {
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', price: 312.66, change: 4.03, changePercent: 1.45, volume: 52400000, marketCap: 4.75e12, pe: 37.8, high52: 317.40, low52: 201.50, dayHigh: 315.20, dayLow: 308.00, open: 310.00, previousClose: 308.63, currency: 'USD', timestamp: Date.now() },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 195.55, change: 0.72, changePercent: 0.37, volume: 48700000, marketCap: 4.74e12, pe: 29.9, high52: 236.54, low52: 157.34, dayHigh: 198.00, dayLow: 193.00, open: 194.39, previousClose: 194.83, currency: 'USD', timestamp: Date.now() },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', price: 425.00, change: 3.47, changePercent: 0.82, volume: 22100000, marketCap: 3.15e12, pe: 36.2, high52: 468.35, low52: 362.90, dayHigh: 428.00, dayLow: 423.50, open: 424.50, previousClose: 421.53, currency: 'USD', timestamp: Date.now() },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 170.00, change: -0.60, changePercent: -0.35, volume: 18900000, marketCap: 2.10e12, pe: 25.6, high52: 200.00, low52: 130.00, dayHigh: 172.00, dayLow: 168.00, open: 169.00, previousClose: 170.60, currency: 'USD', timestamp: Date.now() },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com', price: 195.00, change: 2.16, changePercent: 1.12, volume: 31200000, marketCap: 2.05e12, pe: 52.3, high52: 230.00, low52: 150.00, dayHigh: 198.00, dayLow: 192.00, open: 193.00, previousClose: 192.84, currency: 'USD', timestamp: Date.now() },
  META: { ticker: 'META', name: 'Meta Platforms', price: 600.29, change: -4.17, changePercent: -0.68, volume: 15600000, marketCap: 1.52e12, pe: 21.8, high52: 796.25, low52: 520.26, dayHigh: 608.00, dayLow: 595.00, open: 598.00, previousClose: 604.46, currency: 'USD', timestamp: Date.now() },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', price: 419.77, change: 8.84, changePercent: 2.15, volume: 98400000, marketCap: 1.58e12, pe: 381.6, high52: 498.83, low52: 288.77, dayHigh: 425.00, dayLow: 410.00, open: 415.00, previousClose: 410.93, currency: 'USD', timestamp: Date.now() },
  AMD: { ticker: 'AMD', name: 'AMD Inc.', price: 552.05, change: 11.82, changePercent: 2.18, volume: 45600000, marketCap: 900e9, pe: 184.0, high52: 584.73, low52: 133.50, dayHigh: 560.00, dayLow: 545.00, open: 548.00, previousClose: 540.23, currency: 'USD', timestamp: Date.now() },
  QQQ: { ticker: 'QQQ', name: 'Invesco QQQ', price: 487.00, change: 6.11, changePercent: 1.27, volume: 22100000, marketCap: 0, pe: 0, high52: 520.00, low52: 380.00, dayHigh: 490.00, dayLow: 482.00, open: 485.00, previousClose: 480.89, currency: 'USD', timestamp: Date.now() },
  SPY: { ticker: 'SPY', name: 'SPDR S&P 500', price: 525.00, change: 6.43, changePercent: 1.24, volume: 54300000, marketCap: 0, pe: 0, high52: 545.00, low52: 460.00, dayHigh: 528.00, dayLow: 520.00, open: 522.00, previousClose: 518.57, currency: 'USD', timestamp: Date.now() },
  BRK_B: { ticker: 'BRK.B', name: 'Berkshire Hathaway', price: 413.00, change: 1.03, changePercent: 0.25, volume: 3200000, marketCap: 600e9, pe: 9.2, high52: 440.00, low52: 370.00, dayHigh: 415.00, dayLow: 410.00, open: 412.00, previousClose: 411.97, currency: 'USD', timestamp: Date.now() },
  KO: { ticker: 'KO', name: 'Coca-Cola', price: 62.35, change: 0.31, changePercent: 0.50, volume: 8500000, marketCap: 270e9, pe: 24.5, high52: 68.00, low52: 56.00, dayHigh: 63.00, dayLow: 62.00, open: 62.10, previousClose: 62.04, currency: 'USD', timestamp: Date.now() },
  JNJ: { ticker: 'JNJ', name: 'Johnson & Johnson', price: 148.20, change: -0.74, changePercent: -0.50, volume: 6200000, marketCap: 356e9, pe: 12.8, high52: 165.00, low52: 140.00, dayHigh: 149.00, dayLow: 147.50, open: 148.50, previousClose: 148.94, currency: 'USD', timestamp: Date.now() },
  PG: { ticker: 'PG', name: 'Procter & Gamble', price: 168.90, change: 1.35, changePercent: 0.81, volume: 4800000, marketCap: 400e9, pe: 27.8, high52: 178.00, low52: 150.00, dayHigh: 170.00, dayLow: 168.00, open: 168.50, previousClose: 167.55, currency: 'USD', timestamp: Date.now() },
  SCHD: { ticker: 'SCHD', name: 'Schwab US Dividend', price: 28.40, change: 0.08, changePercent: 0.28, volume: 4200000, marketCap: 0, pe: 0, high52: 30.00, low52: 24.00, dayHigh: 28.60, dayLow: 28.20, open: 28.30, previousClose: 28.32, currency: 'USD', timestamp: Date.now() },
  CRM: { ticker: 'CRM', name: 'Salesforce', price: 298.40, change: 2.10, changePercent: 0.71, volume: 5600000, marketCap: 289e9, pe: 62.3, high52: 340.00, low52: 212.00, dayHigh: 301.00, dayLow: 296.00, open: 297.00, previousClose: 296.30, currency: 'USD', timestamp: Date.now() },
  NFLX: { ticker: 'NFLX', name: 'Netflix', price: 645.20, change: 8.40, changePercent: 1.32, volume: 3200000, marketCap: 278e9, pe: 42.5, high52: 720.00, low52: 510.00, dayHigh: 650.00, dayLow: 638.00, open: 640.00, previousClose: 636.80, currency: 'USD', timestamp: Date.now() },
  UBER: { ticker: 'UBER', name: 'Uber Technologies', price: 72.35, change: 1.85, changePercent: 2.62, volume: 12800000, marketCap: 152e9, pe: 85.2, high52: 82.00, low52: 48.00, dayHigh: 73.50, dayLow: 71.00, open: 71.50, previousClose: 70.50, currency: 'USD', timestamp: Date.now() },
  COIN: { ticker: 'COIN', name: 'Coinbase Global', price: 162.40, change: -3.20, changePercent: -1.93, volume: 6200000, marketCap: 41e9, pe: 38.5, high52: 295.00, low52: 115.00, dayHigh: 168.00, dayLow: 160.00, open: 165.00, previousClose: 165.60, currency: 'USD', timestamp: Date.now() },
  PLTR: { ticker: 'PLTR', name: 'Palantir Tech', price: 58.90, change: 1.20, changePercent: 2.08, volume: 28000000, marketCap: 128e9, pe: 182.5, high52: 80.00, low52: 26.00, dayHigh: 60.00, dayLow: 57.50, open: 58.00, previousClose: 57.70, currency: 'USD', timestamp: Date.now() },
  V: { ticker: 'V', name: 'Visa Inc.', price: 312.80, change: 0.90, changePercent: 0.29, volume: 4500000, marketCap: 650e9, pe: 30.2, high52: 340.00, low52: 250.00, dayHigh: 315.00, dayLow: 310.00, open: 312.00, previousClose: 311.90, currency: 'USD', timestamp: Date.now() },
  JPM: { ticker: 'JPM', name: 'JPMorgan Chase', price: 268.40, change: 1.20, changePercent: 0.45, volume: 8900000, marketCap: 780e9, pe: 11.5, high52: 280.00, low52: 200.00, dayHigh: 270.00, dayLow: 267.00, open: 268.00, previousClose: 267.20, currency: 'USD', timestamp: Date.now() },
  AVGO: { ticker: 'AVGO', name: 'Broadcom Inc.', price: 228.50, change: 3.40, changePercent: 1.51, volume: 12800000, marketCap: 107e9, pe: 18.2, high52: 250.00, low52: 160.00, dayHigh: 230.00, dayLow: 225.00, open: 226.00, previousClose: 225.10, currency: 'USD', timestamp: Date.now() },
}

const FALLBACK_INDICES: Record<string, any> = {
  '^GSPC': { symbol: '^GSPC', name: 'S&P 500', price: 5567.19, change: 42.80, changePercent: 0.77 },
  '^IXIC': { symbol: '^IXIC', name: 'NASDAQ', price: 18283.07, change: 155.20, changePercent: 0.86 },
  '^DJI': { symbol: '^DJI', name: 'Dow Jones', price: 41678.35, change: 128.50, changePercent: 0.31 },
  '^VIX': { symbol: '^VIX', name: 'VIX', price: 13.12, change: -0.45, changePercent: -3.32 },
}

// ====== Real-time Fetch via CORS Proxy ======
async function fetchYahooQuotes(tickers: string[]): Promise<Record<string, StockQuote>> {
  const results: Record<string, StockQuote> = {}
  for (const ticker of tickers) {
    const cacheKey = `quote_${ticker}`
    const cached = getCache(cacheKey)
    if (cached) { results[ticker] = cached; continue }

    try {
      // Try modules endpoint first (more reliable)
      const url = yfUrl(`/v10/finance/quoteSummary/${ticker}?modules=price`)
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const priceData = json?.quoteSummary?.result?.[0]
      if (priceData) {
        const quote = parseQuote(priceData)
        if (quote.price > 0) {
          setCache(cacheKey, quote)
          results[ticker] = quote
          continue
        }
      }
      throw new Error('No price data')
    } catch {
      // Fallback to mock data
      results[ticker] = FALLBACK[ticker] || FALLBACK[ticker.replace('.', '_')] || {
        ticker, name: ticker, price: 0, change: 0, changePercent: 0, volume: 0,
        marketCap: 0, pe: 0, high52: 0, low52: 0, dayHigh: 0, dayLow: 0,
        open: 0, previousClose: 0, currency: 'USD', timestamp: Date.now()
      }
    }
  }
  return results
}

async function fetchYahooIndices(): Promise<Record<string, any>> {
  const indices = ['^GSPC', '^IXIC', '^DJI', '^VIX']
  const results: Record<string, any> = {}
  for (const idx of indices) {
    const cacheKey = `idx_${idx}`
    const cached = getCache(cacheKey)
    if (cached) { results[idx] = cached; continue }

    try {
      const url = yfUrl(`/v8/finance/chart/${idx}?interval=1d&range=1d`)
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const meta = json?.chart?.result?.[0]?.meta
      if (meta && meta.regularMarketPrice) {
        const data = {
          symbol: idx,
          name: idx === '^GSPC' ? 'S&P 500' : idx === '^IXIC' ? 'NASDAQ' : idx === '^DJI' ? 'Dow Jones' : 'VIX',
          price: meta.regularMarketPrice,
          change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice),
          changePercent: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice)) / (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice)) * 100,
        }
        setCache(cacheKey, data)
        results[idx] = data
        continue
      }
      throw new Error('No data')
    } catch {
      results[idx] = FALLBACK_INDICES[idx]
    }
  }
  return results
}

// ====== React Hooks ======
export function useStockQuote(tickers: string[]) {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [isFetching, setIsFetching] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const tickersKey = tickers.join(',')

  const load = useCallback(async () => {
    if (tickers.length === 0) return
    setIsFetching(true)
    const data = await fetchYahooQuotes(tickers)
    setQuotes(data)
    setIsFetching(false)
  }, [tickersKey])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 5000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  return { quotes, isLoading: false, isFetching, error: null, refetch: load, pause: () => {}, resume: () => {} }
}

export function useSingleStockQuote(ticker: string) {
  const { quotes, isLoading, isFetching, error, refetch } = useStockQuote([ticker])
  return { quote: quotes[ticker] || null, isLoading, isFetching, error, refetch }
}

export function useMarketSummary() {
  const [data, setData] = useState<Record<string, any>>(FALLBACK_INDICES)
  const [isFetching, setIsFetching] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const load = useCallback(async () => {
    setIsFetching(true)
    const result = await fetchYahooIndices()
    setData(result)
    setIsFetching(false)
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 10000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  return { data, isLoading: false, isFetching, error: null }
}

export function useStockHistory(ticker: string, period: string = '1mo', interval: string = '1d') {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ticker) return
    const cacheKey = `hist_${ticker}_${period}_${interval}`
    const cached = getCache(cacheKey)
    if (cached) { setData(cached); return }

    setIsLoading(true)
    const url = yfUrl(`/v8/finance/chart/${ticker}?interval=${interval}&range=${period}`)
    fetch(url, { signal: AbortSignal.timeout(10000) })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        const result = json?.chart?.result?.[0]
        if (result) {
          const quotes = result.timestamp?.map((t: number, i: number) => ({
            date: new Date(t * 1000).toISOString().split('T')[0],
            open: result.indicators?.quote?.[0]?.open?.[i],
            high: result.indicators?.quote?.[0]?.high?.[i],
            low: result.indicators?.quote?.[0]?.low?.[i],
            close: result.indicators?.quote?.[0]?.close?.[i],
            volume: result.indicators?.quote?.[0]?.volume?.[i],
          })).filter((q: any) => q.close !== null)
          const payload = { ticker, quotes, meta: result.meta }
          setCache(cacheKey, payload)
          setData(payload)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [ticker, period, interval])

  return { data, isLoading, error: null }
}
