import type { SignalType } from '@/lib/strategyEngine';
import { cn } from '@/lib/utils';

interface SignalBadgeProps {
  signal: SignalType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

const signalConfig: Record<SignalType, { label: string; className: string; pulse: boolean }> = {
  BUY: {
    label: 'BUY',
    className: 'bg-[rgba(0,230,118,0.15)] text-[#00E676] border border-[rgba(0,230,118,0.3)]',
    pulse: false,
  },
  STRONG_BUY: {
    label: 'STRONG BUY',
    className: 'bg-[#00E676] text-[#030712] border border-[#00E676] font-bold',
    pulse: true,
  },
  SELL: {
    label: 'SELL',
    className: 'bg-[rgba(255,23,68,0.15)] text-[#FF1744] border border-[rgba(255,23,68,0.3)]',
    pulse: false,
  },
  STRONG_SELL: {
    label: 'STRONG SELL',
    className: 'bg-[#FF1744] text-white border border-[#FF1744] font-bold',
    pulse: true,
  },
  HOLD: {
    label: 'HOLD',
    className: 'bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.3)]',
    pulse: false,
  },
};

const sizeConfig = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-[11px] px-3 py-1',
  lg: 'text-xs px-4 py-1.5',
};

export default function SignalBadge({ signal, size = 'md', className, pulse }: SignalBadgeProps) {
  const config = signalConfig[signal];
  const shouldPulse = pulse ?? config.pulse;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-mono font-semibold uppercase tracking-wider',
        sizeConfig[size],
        config.className,
        shouldPulse && 'animate-pulse-signal',
        className
      )}
    >
      {config.label}
    </span>
  );
}
