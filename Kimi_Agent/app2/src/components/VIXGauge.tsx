import { useEffect, useState } from 'react';
import { getVIXSeverityColor } from '@/lib/yahooFinance';
import type { VIXSeverity } from '@/lib/yahooFinance';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface VIXGaugeProps {
  value: number;
  change?: number;
  changePercent?: number;
  className?: string;
}

const VIX_THRESHOLDS = [
  { max: 20, label: '平静', severity: 'calm' as VIXSeverity },
  { max: 30, label: '警戒', severity: 'elevated' as VIXSeverity },
  { max: 40, label: '焦虑', severity: 'high' as VIXSeverity },
  { max: 50, label: '极端', severity: 'extreme' as VIXSeverity },
  { max: 100, label: '恐慌', severity: 'panic' as VIXSeverity },
];

function getVIXInfo(value: number) {
  const threshold = VIX_THRESHOLDS.find((t) => value < t.max) || VIX_THRESHOLDS[VIX_THRESHOLDS.length - 1];
  return {
    label: threshold.label,
    severity: threshold.severity,
    color: getVIXSeverityColor(threshold.severity),
  };
}

function getVIXAction(value: number): string {
  if (value < 20) return '市场平静 — 维持标准仓位配置';
  if (value < 30) return '警戒状态 — 准备部署30%现金储备';
  if (value < 40) return '高度焦虑 — 开始分批建仓ETF';
  if (value < 50) return '极端恐慌 — 积极买入ETF';
  return '市场恐慌 — 全力建仓，历史性机会';
}

export default function VIXGauge({ value, change, changePercent, className }: VIXGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const info = getVIXInfo(value);
  const maxValue = 60; // Gauge shows 0-60 range
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 80; // radius = 80
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75; // 75% circle (270 degrees)

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + (value - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  // Generate gradient stops for the gauge arc
  const gradientColors = [
    { offset: '0%', color: '#00E676' },
    { offset: '25%', color: '#FBBF24' },
    { offset: '50%', color: '#FF9800' },
    { offset: '75%', color: '#FF5722' },
    { offset: '100%', color: '#FF1744' },
  ];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Gauge SVG */}
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-[135deg]">
          <defs>
            <linearGradient id="vixGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((stop) => (
                <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#111827"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="url(#vixGradient)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
            style={{
              filter: info.severity === 'panic' ? 'drop-shadow(0 0 8px rgba(255,23,68,0.6))' : 'none',
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold font-mono"
            style={{ color: info.color }}
          >
            {animatedValue.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider mt-1">VIX</span>
        </div>
      </div>

      {/* Severity Label */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${info.color}20`,
            color: info.color,
            border: `1px solid ${info.color}40`,
          }}
        >
          {info.label}
        </span>
      </div>

      {/* Change indicator */}
      {(change !== undefined && changePercent !== undefined) && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn(
            'text-xs font-mono',
            change >= 0 ? 'text-signal-bearish' : 'text-signal-bullish'
          )}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* Threshold Reference */}
      <div className="mt-3 flex items-center gap-1 text-[10px] text-text-dim font-mono">
        <span className="text-[#00E676]">&lt;20</span>
        <span>|</span>
        <span className="text-[#FBBF24]">20-30</span>
        <span>|</span>
        <span className="text-[#FF9800]">30-40</span>
        <span>|</span>
        <span className="text-[#FF5722]">40-50</span>
        <span>|</span>
        <span className="text-[#FF1744]">50+</span>
      </div>

      {/* Action Box */}
      <div className="mt-4 w-full bg-bg-elevated rounded-lg p-3 border border-border-default">
        <div className="flex items-center gap-1.5 mb-1">
          <Info className="w-3 h-3 text-accent-primary" />
          <span className="text-[11px] text-text-muted uppercase tracking-wider">建议操作</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">{getVIXAction(value)}</p>
      </div>
    </div>
  );
}
