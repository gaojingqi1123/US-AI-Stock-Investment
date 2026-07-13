import { useEffect, useState, useCallback } from 'react'
import { trpc } from '@/providers/trpc'

export interface StockQuote {
  ticker: string
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
  name: string
  currency: string
  timestamp: number
}

export function useStockQuote(tickers: string[]) {
  const [enabled, setEnabled] = useState(true)
  
  const query = trpc.stock.quote.useQuery(
    { tickers: tickers.join(',') },
    {
      refetchInterval: 5000, // 5-second auto refresh
      refetchIntervalInBackground: false,
      enabled: enabled && tickers.length > 0,
      staleTime: 3000,
    }
  )

  const pause = useCallback(() => setEnabled(false), [])
  const resume = useCallback(() => setEnabled(true), [])

  const quotes: Record<string, StockQuote> = query.data || {}
  
  return {
    quotes,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    pause,
    resume,
  }
}

export function useSingleStockQuote(ticker: string) {
  const { quotes, isLoading, isFetching, error, refetch } = useStockQuote([ticker])
  return {
    quote: quotes[ticker] || null,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

export function useMarketSummary() {
  const query = trpc.stock.marketSummary.useQuery(undefined, {
    refetchInterval: 10000, // 10-second refresh for market indices
    refetchIntervalInBackground: false,
    staleTime: 5000,
  })

  return {
    data: query.data || {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  }
}

export function useStockHistory(ticker: string, period: string = '1mo', interval: string = '1d') {
  const query = trpc.stock.history.useQuery(
    { ticker, period, interval },
    {
      enabled: !!ticker,
      staleTime: 60000, // 1 minute cache for historical data
    }
  )

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
