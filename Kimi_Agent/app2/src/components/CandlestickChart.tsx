import { useEffect, useRef, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { cn } from '@/lib/utils';

interface CandlestickChartProps {
  data: Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  signals?: Array<{
    time: number;
    price: number;
    type: 'BUY' | 'SELL';
  }>;
  showVolume?: boolean;
  showMA?: boolean;
  height?: number;
  className?: string;
}

export default function CandlestickChart({
  data,
  signals = [],
  showVolume = true,
  showMA = true,
  height = 400,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ma5SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const formatChartData = useCallback((): CandlestickData[] => {
    return data.map((d) => ({
      time: d.date.getTime() / 1000 as unknown as string,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
  }, [data]);

  const formatVolumeData = useCallback((): HistogramData[] => {
    return data.map((d) => ({
      time: d.date.getTime() / 1000 as unknown as string,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)',
    }));
  }, [data]);

  const calculateMA = useCallback((period: number) => {
    return data.map((d, i) => {
      if (i < period - 1) return null;
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, item) => sum + item.close, 0) / period;
      return {
        time: d.date.getTime() / 1000 as unknown as string,
        value: Math.round(avg * 100) / 100,
      };
    }).filter(Boolean) as Array<{ time: string; value: number }>;
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0B0F19' },
        textColor: '#94A3B8',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00D9C0',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00D9C0',
        },
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00E676',
      downColor: '#FF1744',
      borderUpColor: '#00E676',
      borderDownColor: '#FF1744',
      wickUpColor: '#00E676',
      wickDownColor: '#FF1744',
    });
    candlestickSeriesRef.current = candlestickSeries;

    const chartData = formatChartData();
    candlestickSeries.setData(chartData);

    // Volume series
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: 'rgba(0, 217, 192, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volumeSeries.setData(formatVolumeData());
    }

    // Moving averages
    if (showMA) {
      const ma5Data = calculateMA(5);
      const ma20Data = calculateMA(20);

      const ma5Series = chart.addSeries(LineSeries, {
        color: '#00D9C0',
        lineWidth: 1,
        title: 'MA5',
        lastValueVisible: false,
      });
      ma5SeriesRef.current = ma5Series;
      ma5Series.setData(ma5Data);

      const ma20Series = chart.addSeries(LineSeries, {
        color: '#F472B6',
        lineWidth: 1,
        title: 'MA20',
        lastValueVisible: false,
      });
      ma20SeriesRef.current = ma20Series;
      ma20Series.setData(ma20Data);
    }

    // Add signal markers
    if (signals.length > 0) {
      const markers = signals.map((signal) => ({
        time: signal.time as unknown as string,
        position: signal.type === 'BUY' ? 'belowBar' as const : 'aboveBar' as const,
        color: signal.type === 'BUY' ? '#00E676' : '#FF1744',
        shape: signal.type === 'BUY' ? 'arrowUp' as const : 'arrowDown' as const,
        text: signal.type,
        size: 1.5,
      }));
      (candlestickSeries as unknown as { setMarkers(m: typeof markers): void }).setMarkers(markers);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, signals, showVolume, showMA, formatChartData, formatVolumeData, calculateMA]);

  return (
    <div
      ref={chartContainerRef}
      className={cn('w-full rounded-lg overflow-hidden', className)}
      style={{ height }}
    />
  );
}
