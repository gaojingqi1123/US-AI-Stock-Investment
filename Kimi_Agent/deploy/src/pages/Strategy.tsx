import { useState, useCallback } from 'react';
import {
  Activity,
  Layers,
  Shield,
  Zap,
  Lock,
  Percent,
  TrendingUp,
  ArrowRight,
  Copy,
  Check,
  Target,
  AlertTriangle,
  Lightbulb,
  CircleDollarSign,
  GitFork,
  Gauge,
  TrendingDown,
  ArrowUpFromLine,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import VIXGauge from '@/components/VIXGauge';
import { generatePyramidLevels, getPyramidSummary } from '@/lib/strategyEngine';

// ── Animation Helpers ─────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

// ── Section 1: Page Hero ──────────────────────────────────────────

function PageHero({ onNavClick }: { onNavClick: (id: string) => void }) {
  const pills = [
    { label: 'VIX System', id: 'vix' },
    { label: 'Pyramid', id: 'pyramid' },
    { label: 'Accounts', id: 'accounts' },
    { label: 'Golden Ratio', id: 'golden' },
    { label: 'Neg. Cost', id: 'negcost' },
    { label: 'Technical', id: 'technical' },
  ];

  return (
    <motion.section {...fadeUp(0)} className="relative py-12 px-4 lg:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,217,192,0.03) 0%, transparent 70%)' }} />
      <div className="relative z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary font-heading mb-3 tracking-tight">
          Investment Strategy Framework
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed mb-6">
          A quantitative, rules-based approach to US stock market investing. Six interconnected systems working together to optimize entries, manage risk, and compound returns.
        </p>
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => onNavClick(pill.id)}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary hover:text-accent-primary hover:border-border-accent border border-border-default transition-all"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ── Section 2: VIX Decision System ────────────────────────────────

function VIXDecisionSystem() {
  const [vixValue, setVixValue] = useState(32);

  const getVIXRecommendation = (v: number) => {
    if (v < 15) return { text: 'Extreme complacency — consider reducing positions', color: '#00E676', severity: 'calm' };
    if (v < 20) return { text: 'Normal — maintain regular strategy', color: '#00E676', severity: 'calm' };
    if (v < 30) return { text: 'Elevated — start building cash reserves', color: '#FBBF24', severity: 'elevated' };
    if (v < 40) return { text: 'High fear — begin buying broad market ETFs (VOO, QQQ)', color: '#FF9800', severity: 'high' };
    if (v < 50) return { text: 'Panic — aggressively buy quality stocks + ETFs', color: '#FF5722', severity: 'extreme' };
    if (v < 90) return { text: 'Extreme panic — deploy 50%+ of cash, maximum buying', color: '#FF1744', severity: 'panic' };
    return { text: 'Historical opportunity — all-in on broad market', color: '#FF1744', severity: 'panic' };
  };

  const rec = getVIXRecommendation(vixValue);

  const tierCards = [
    { range: '< 20', label: 'Calm', color: '#00E676', cash: '10%', position: '100%', action: 'Standard pyramid, full deployment' },
    { range: '20-30', label: 'Elevated', color: '#FBBF24', cash: '20%', position: '80%', action: 'Slow pyramid, 80% sizing' },
    { range: '30-40', label: 'High Anxiety', color: '#FF9800', cash: '40%', position: '50%', action: 'Wait mode, selective entries' },
    { range: '40-50', label: 'Extreme Fear', color: '#FF5722', cash: '60%', position: '30%', action: 'Aggressive selective buying' },
    { range: '50+', label: 'Panic', color: '#FF1744', cash: '80%', position: '20%', action: 'Maximum aggression, scale in' },
  ];

  return (
    <motion.section {...fadeUp(0)} id="vix" className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary uppercase tracking-wider">Core Strategy</span>
      </div>
      <h2 className="text-xl font-bold text-text-primary font-heading mb-2">1. VIX Panic Index Decision System</h2>
      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
        The Volatility Index (VIX) is our primary market weather gauge. It measures expected S&P 500 volatility over the next 30 days. Our system uses thresholds to determine market regime and adjust positioning accordingly.
      </p>

      {/* Interactive Gauge + Slider */}
      <div className="flex flex-col items-center mb-8">
        <VIXGauge value={vixValue} change={1.2} changePercent={3.8} />
        <div className="w-full max-w-md mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">VIX Value: <span className="text-text-primary font-mono font-bold">{vixValue}</span></span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rec.color}20`, color: rec.color, border: `1px solid ${rec.color}40` }}>
              {rec.severity.toUpperCase()}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            value={vixValue}
            onChange={(e) => setVixValue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00E676 0%, #00E676 18.4%, #FBBF24 18.4%, #FBBF24 31.6%, #FF9800 31.6%, #FF9800 44.7%, #FF5722 44.7%, #FF5722 57.9%, #FF1744 57.9%, #FF1744 100%)`,
              accentColor: rec.color,
            }}
          />
          <div className="flex justify-between mt-1 text-[10px] text-text-dim font-mono">
            <span>5</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
          </div>
        </div>

        {/* Dynamic Recommendation */}
        <motion.div
          key={rec.text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 w-full max-w-lg bg-bg-elevated rounded-lg p-4 border-l-4"
          style={{ borderLeftColor: rec.color }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" style={{ color: rec.color }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: rec.color }}>Recommendation</span>
          </div>
          <p className="text-sm text-text-primary">{rec.text}</p>
        </motion.div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tierCards.map((tier) => (
          <div
            key={tier.label}
            className="rounded-lg p-3 border-t-4 bg-bg-elevated/50"
            style={{ borderTopColor: tier.color }}
          >
            <div className="text-xs font-bold mb-1" style={{ color: tier.color }}>{tier.label}</div>
            <div className="text-[11px] text-text-muted mb-1">VIX {tier.range}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]"><span className="text-text-muted">Cash</span><span className="font-mono text-text-primary">{tier.cash}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-text-muted">Position</span><span className="font-mono text-text-primary">{tier.position}</span></div>
            </div>
            <p className="text-[10px] text-text-secondary mt-2 leading-snug">{tier.action}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// ── Section 3: Pyramid Builder ────────────────────────────────────

function PyramidBuilder() {
  const [budget, setBudget] = useState(100000);
  const [firstPrice, setFirstPrice] = useState(150);
  const [stepPercent, setStepPercent] = useState(5);
  const [copied, setCopied] = useState(false);

  const baseShares = Math.round(budget / firstPrice / 12);
  const levels = generatePyramidLevels({ basePrice: firstPrice, stepPercent, baseShares, maxLevels: 7 });
  const summary = getPyramidSummary(levels);

  const copyPlan = () => {
    const text = levels.map((l) => `L${l.level}: $${l.price.toFixed(2)} x ${l.shares} shares = $${l.investment.toFixed(0)} (${l.ratio} units)`).join('\n');
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const tierColors = ['#00E676', '#00E676', '#00D9C0', '#00D9C0', '#FBBF24', '#FBBF24', '#FF9800'];

  return (
    <motion.section {...fadeUp(0)} id="pyramid" className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <h2 className="text-xl font-bold text-text-primary font-heading mb-2">2. Pyramid Position Building</h2>
      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
        Instead of buying a full position at once, we build positions in 7 levels using the ratio <strong className="text-accent-primary">1-1-1.5-1.5-2-2-3</strong>. This averages down our cost basis during declines while maintaining discipline. Total position = 12 units.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">Total Budget ($)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full bg-bg-elevated text-text-primary text-sm font-mono rounded-lg px-3 py-2 border border-border-default focus:border-border-accent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">First Buy Price ($)</label>
          <input
            type="number"
            value={firstPrice}
            onChange={(e) => setFirstPrice(Number(e.target.value))}
            className="w-full bg-bg-elevated text-text-primary text-sm font-mono rounded-lg px-3 py-2 border border-border-default focus:border-border-accent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">Step Drop (%)</label>
          <input
            type="number"
            value={stepPercent}
            onChange={(e) => setStepPercent(Number(e.target.value))}
            className="w-full bg-bg-elevated text-text-primary text-sm font-mono rounded-lg px-3 py-2 border border-border-default focus:border-border-accent outline-none"
          />
        </div>
      </div>

      {/* Pyramid Visual + Table */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pyramid Visual */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 py-4">
          {[...levels].reverse().map((level, i) => (
            <motion.div
              key={level.level}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="h-10 rounded-md flex items-center justify-between px-4 text-xs font-mono relative overflow-hidden"
              style={{
                width: `${35 + (7 - i) * 9}%`,
                backgroundColor: `${tierColors[7 - i]}15`,
                border: `1px solid ${tierColors[7 - i]}40`,
                color: tierColors[7 - i],
              }}
            >
              <span className="font-bold">L{level.level}</span>
              <span>${level.price.toFixed(2)}</span>
              <span>{level.shares} sh</span>
              <span className="opacity-70">{level.ratio}u</span>
            </motion.div>
          ))}
        </div>

        {/* Summary Table */}
        <div className="lg:w-96">
          <div className="bg-bg-elevated/50 rounded-lg border border-border-default overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-bg-elevated text-left">
                  <th className="px-3 py-2 text-text-muted font-medium">Lvl</th>
                  <th className="px-3 py-2 text-text-muted font-medium">Price</th>
                  <th className="px-3 py-2 text-text-muted font-medium">Shares</th>
                  <th className="px-3 py-2 text-text-muted font-medium text-right">Amount</th>
                  <th className="px-3 py-2 text-text-muted font-medium text-right">Avg Cost</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l) => (
                  <tr key={l.level} className="border-t border-border-default hover:bg-bg-elevated/50">
                    <td className="px-3 py-2 font-mono font-bold" style={{ color: tierColors[l.level - 1] }}>L{l.level}</td>
                    <td className="px-3 py-2 font-mono">${l.price.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono">{l.shares}</td>
                    <td className="px-3 py-2 font-mono text-right">${l.investment.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-right text-accent-primary">${l.averageCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {summary && (
            <div className="mt-3 p-3 bg-bg-elevated rounded-lg border border-border-default space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-text-muted">Total Investment</span><span className="font-mono text-text-primary">${summary.totalInvestment.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Total Shares</span><span className="font-mono text-text-primary">{summary.totalShares}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Average Cost</span><span className="font-mono text-accent-primary">${summary.averageCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Price Drop (L1-L7)</span><span className="font-mono text-signal-bearish">{summary.priceDropPercent.toFixed(1)}%</span></div>
            </div>
          )}

          <button
            onClick={copyPlan}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary/10 text-accent-primary text-xs font-medium hover:bg-accent-primary/20 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Plan'}
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg-elevated rounded-lg border border-border-default">
        <p className="text-xs text-text-secondary">
          <span className="text-accent-primary font-medium">Step intervals:</span> Decreasing step intervals ensure we buy MORE as price drops FURTHER, but with WIDER gaps to avoid catching a falling knife too early.
        </p>
      </div>
    </motion.section>
  );
}

// ── Section 4: Three Account Management ───────────────────────────

function ThreeAccountManager() {
  const [totalCapital, setTotalCapital] = useState(500000);

  const accounts = [
    {
      type: 'Aggressive', pct: 45, color: '#FF6B35', icon: Zap,
      goal: '15-25% annual return', risk: 'High — expect 20-30% drawdowns',
      strategy: 'High-beta growth stocks. Full pyramid deployment. Momentum + breakout plays.',
      rules: ['Max 8 concurrent positions', 'Stop loss: -15% hard, -10% warning', 'Target: 2:1 risk/reward minimum', 'Full pyramid allowed (all 7 levels)'],
      vixAdj: 'At VIX 30+: Reduce to 50%. At VIX 40+: Reduce to 30%.',
    },
    {
      type: 'Stable', pct: 15, color: '#00D9C0', icon: Shield,
      goal: '8-12% annual return', risk: 'Moderate — expect 10-15% drawdowns',
      strategy: 'Blue-chip dividend stocks. Selective entry only at strong support.',
      rules: ['Max 5 concurrent positions', 'Stop loss: -10% hard, -7% warning', 'Target: 1.5:1 risk/reward minimum', 'Max 4 pyramid levels (L1-L4 only)'],
      vixAdj: 'At VIX 30+: Hold positions, no new entries. At VIX 40+: Begin profit-taking.',
    },
    {
      type: 'Defensive', pct: 40, color: '#6366F1', icon: Lock,
      goal: '5-8% annual return + income', risk: 'Low — expect 5-10% drawdowns',
      strategy: 'Dividend aristocrats, REITs, bond ETFs. Capital preservation priority.',
      rules: ['Max 6 concurrent positions', 'Stop loss: -8% hard, -5% warning', 'Target: 1:1 risk/reward acceptable', 'Max 3 pyramid levels (L1-L3 only)', 'Negative cost basis goal for 50% of positions'],
      vixAdj: 'At VIX 30+: Increase to 50% (shift from Aggressive). At VIX 40+: Defensive becomes 60%.',
    },
  ];

  return (
    <motion.section {...fadeUp(0)} id="accounts" className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <h2 className="text-xl font-bold text-text-primary font-heading mb-2">3. Three-Account Management System</h2>
      <p className="text-sm text-text-secondary mb-6">Capital is divided into three independently tracked accounts, each with distinct risk profiles, strategies, and goals. Never mix account objectives.</p>

      {/* Account Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {accounts.map((acct, i) => {
          const Icon = acct.icon;
          return (
            <motion.div
              key={acct.type}
              {...fadeUp(i * 0.12)}
              className="rounded-xl p-5 border-t-4 bg-bg-elevated/30"
              style={{ borderTopColor: acct.color }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${acct.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: acct.color }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{acct.type}</h3>
                  <span className="text-xs font-mono" style={{ color: acct.color }}>{acct.pct}% allocation</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div><span className="text-text-muted">Goal:</span> <span className="text-text-primary">{acct.goal}</span></div>
                <div><span className="text-text-muted">Risk:</span> <span className="text-text-primary">{acct.risk}</span></div>
                <div><span className="text-text-muted">Strategy:</span> <span className="text-text-secondary">{acct.strategy}</span></div>

                <div className="pt-2 border-t border-border-default">
                  <span className="text-text-muted uppercase tracking-wider text-[10px]">Rules</span>
                  <ul className="mt-1.5 space-y-1">
                    {acct.rules.map((rule, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: acct.color }} />
                        <span className="text-text-secondary">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-border-default">
                  <span className="text-text-muted uppercase tracking-wider text-[10px]">VIX Adjustment</span>
                  <p className="mt-1 text-text-secondary">{acct.vixAdj}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Allocation Slider */}
      <div className="bg-bg-elevated/30 rounded-lg p-4 border border-border-default">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-text-muted uppercase tracking-wider">Total Capital Allocation</label>
          <span className="text-sm font-mono font-bold text-accent-primary">${totalCapital.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={100000}
          max={5000000}
          step={50000}
          value={totalCapital}
          onChange={(e) => setTotalCapital(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer mb-3"
          style={{ background: 'linear-gradient(to right, #FF6B35 0%, #FF6B35 45%, #00D9C0 45%, #00D9C0 60%, #6366F1 60%, #6366F1 100%)' }}
        />
        <div className="flex justify-between text-xs">
          {accounts.map((acct) => (
            <div key={acct.type} className="text-center">
              <span className="block font-mono font-bold" style={{ color: acct.color }}>${((totalCapital * acct.pct) / 100).toLocaleString()}</span>
              <span className="text-text-muted">{acct.type} ({acct.pct}%)</span>
            </div>
          ))}
        </div>
        {/* Stacked bar */}
        <div className="flex h-4 rounded-full overflow-hidden mt-3">
          {accounts.map((acct) => (
            <div key={acct.type} style={{ width: `${acct.pct}%`, backgroundColor: acct.color }} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ── Section 5: Golden Ratio Sizer ─────────────────────────────────

function GoldenRatioSizer() {
  const [portfolio, setPortfolio] = useState(100000);
  const [positions, setPositions] = useState(5);

  const goldenRatio = 0.618;
  const maxPosition = portfolio * goldenRatio;
  const perPosition = maxPosition / positions;
  const reserve = portfolio - maxPosition;

  return (
    <motion.section {...fadeUp(0)} id="golden" className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary font-mono">&phi; = 1.618</span>
      </div>
      <h2 className="text-xl font-bold text-text-primary font-heading mb-2">4. Golden Ratio Position Sizing</h2>
      <p className="text-sm text-text-secondary mb-6">
        The maximum single position size should not exceed <strong className="text-accent-primary">61.8%</strong> of available capital in an account. This is derived from the golden ratio (1/&phi; &asymp; 0.618). It ensures no single position can devastate the portfolio while allowing meaningful conviction sizing.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Golden Spiral Visual */}
        <div className="lg:w-[45%] flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Fibonacci rectangles */}
              <rect x="100" y="0" width="100" height="100" fill="none" stroke="#00D9C0" strokeWidth="0.5" opacity="0.3" />
              <rect x="0" y="0" width="100" height="60" fill="none" stroke="#00D9C0" strokeWidth="0.5" opacity="0.3" />
              <rect x="0" y="60" width="60" height="40" fill="none" stroke="#00D9C0" strokeWidth="0.5" opacity="0.3" />
              <rect x="60" y="60" width="40" height="25" fill="none" stroke="#00D9C0" strokeWidth="0.5" opacity="0.3" />
              <rect x="60" y="85" width="25" height="15" fill="none" stroke="#00D9C0" strokeWidth="0.5" opacity="0.3" />

              {/* Golden spiral arcs */}
              <path d="M 100,100 A 100,100 0 0,1 200,0" fill="none" stroke="#00D9C0" strokeWidth="2" opacity="0.6" />
              <path d="M 100,60 A 60,60 0 0,0 0,0" fill="none" stroke="#00D9C0" strokeWidth="2" opacity="0.6" />
              <path d="M 75,60 A 35,35 0 0,1 0,60" fill="none" stroke="#00D9C0" strokeWidth="2" opacity="0.6" />
              <path d="M 75,82 A 22,22 0 0,0 60,105" fill="none" stroke="#00D9C0" strokeWidth="2" opacity="0.6" />
              <path d="M 88,82 A 13,13 0 0,1 100,70" fill="none" stroke="#00D9C0" strokeWidth="2" opacity="0.6" />

              {/* Highlight 61.8% */}
              <circle cx="100" cy="100" r="62" fill="none" stroke="#00D9C0" strokeWidth="2" strokeDasharray="4 2" opacity="0.8" />
              <text x="155" y="75" fill="#00D9C0" fontSize="8" fontFamily="monospace">61.8%</text>
              <text x="55" y="95" fill="#64748B" fontSize="7" fontFamily="monospace">38.2%</text>
              <text x="102" y="15" fill="#64748B" fontSize="7" fontFamily="monospace">100%</text>
            </svg>
          </div>
        </div>

        {/* Calculator */}
        <div className="lg:w-[55%] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">Account Balance ($)</label>
              <input
                type="number"
                value={portfolio}
                onChange={(e) => setPortfolio(Number(e.target.value))}
                className="w-full bg-bg-elevated text-text-primary text-sm font-mono rounded-lg px-3 py-2 border border-border-default focus:border-border-accent outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">Target Positions</label>
              <input
                type="number"
                value={positions}
                min={1}
                max={20}
                onChange={(e) => setPositions(Number(e.target.value))}
                className="w-full bg-bg-elevated text-text-primary text-sm font-mono rounded-lg px-3 py-2 border border-border-default focus:border-border-accent outline-none"
              />
            </div>
          </div>

          <div className="bg-bg-elevated rounded-lg p-4 border border-border-default space-y-3">
            <div>
              <span className="text-xs text-text-muted">Golden Ratio Position Size (max)</span>
              <p className="text-2xl font-bold font-mono text-accent-primary">${maxPosition.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted">Equal Distribution</span>
                <p className="font-mono text-text-primary">${(portfolio / positions).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-text-muted">Reserve (38.2%)</span>
                <p className="font-mono text-text-primary">${reserve.toLocaleString()}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border-default">
              <span className="text-xs text-text-muted">Per-position (61.8% / {positions} positions)</span>
              <p className="text-lg font-bold font-mono text-accent-primary">${perPosition.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg border-l-4 border-signal-neutral bg-[rgba(251,191,36,0.08)]">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-signal-neutral" />
              <span className="text-xs font-bold text-signal-neutral uppercase">Warning</span>
            </div>
            <p className="text-xs text-text-secondary">Never exceed 61.8% in a single position, even with high conviction. Use the pyramid system to build up to this maximum gradually.</p>
          </div>

          <div className="text-xs text-text-secondary space-y-1">
            <p><strong className="text-text-primary">Why 61.8%?</strong> The golden ratio appears throughout nature and markets. Psychologically, investors who exceed this threshold tend to experience disproportionate anxiety. Mathematically, it provides optimal risk-adjusted position sizing.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Section 6: Negative Cost Concept ──────────────────────────────

function NegativeCostConcept() {
  const [buyPrice, setBuyPrice] = useState(100);
  const [sellPrice, setSellPrice] = useState(120);
  const [shares, setShares] = useState(100);
  const [dividendYield, setDividendYield] = useState(3);
  const [callPremium, setCallPremium] = useState(1.5);

  const initialCost = buyPrice * shares;
  const sellProceeds = sellPrice * shares * 0.5; // Sell half
  const sharesSold = shares * 0.5;
  const sharesKept = shares - sharesSold;
  const newCostBasis = sharesKept > 0 ? (initialCost - sellProceeds) / sharesKept : 0;
  const annualDividends = newCostBasis * sharesKept * (dividendYield / 100);
  const annualCalls = newCostBasis * sharesKept * (callPremium / 100) * 12;
  const annualIncome = annualDividends + annualCalls;
  const monthsToZero = newCostBasis > 0 && annualIncome > 0 ? (newCostBasis * sharesKept / (annualIncome / 12)) : 0;

  return (
    <motion.section {...fadeUp(0)} id="negcost" className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <h2 className="text-xl font-bold text-text-primary font-heading mb-2">5. Negative Cost Basis Holding</h2>
      <p className="text-sm text-text-secondary mb-6">
        The ultimate goal for defensive positions: reduce effective cost basis to zero or below through systematic income generation. Once achieved, these &ldquo;free&rdquo; shares generate pure income indefinitely.
      </p>

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { label: 'Buy Shares', icon: TrendingUp },
          { label: 'Collect Dividends', icon: CircleDollarSign },
          { label: 'Sell Covered Calls', icon: Activity },
          { label: 'Cost Basis Drops', icon: TrendingDown },
          { label: 'ZERO COST', icon: Target, highlight: true },
          { label: 'Free Income', icon: Zap, golden: true },
        ].map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border min-w-[100px]"
                style={{
                  backgroundColor: step.highlight ? 'rgba(0,217,192,0.1)' : step.golden ? 'rgba(251,191,36,0.1)' : '#111827',
                  borderColor: step.highlight ? '#00D9C0' : step.golden ? '#FBBF24' : '#1E293B',
                }}
              >
                <Icon className="w-5 h-5" style={{ color: step.highlight ? '#00D9C0' : step.golden ? '#FBBF24' : '#94A3B8' }} />
                <span className="text-[10px] font-medium text-text-primary text-center">{step.label}</span>
              </motion.div>
              {i < 5 && <ArrowRight className="w-4 h-4 text-text-dim hidden sm:block" />}
            </div>
          );
        })}
      </div>

      {/* Worked Example + Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explanation */}
        <div className="space-y-4">
          <div className="p-4 bg-bg-elevated rounded-lg border border-border-default">
            <h4 className="text-sm font-semibold text-text-primary mb-2">Worked Example</h4>
            <div className="space-y-2 text-xs text-text-secondary">
              <p>Buy <strong className="text-text-primary">{shares} shares</strong> at <strong className="text-text-primary">${buyPrice.toFixed(2)}</strong> = <strong className="text-text-primary">${initialCost.toLocaleString()}</strong> initial cost</p>
              <p>Sell <strong className="text-text-primary">{sharesSold} shares</strong> (half) at <strong className="text-text-primary">${sellPrice.toFixed(2)}</strong> = <strong className="text-accent-primary">${sellProceeds.toLocaleString()}</strong> proceeds</p>
              <p>Keep <strong className="text-text-primary">{sharesKept} shares</strong> with new cost basis:</p>
              <p className="text-lg font-mono font-bold text-accent-primary">${newCostBasis.toFixed(2)}/share</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <p><strong className="text-text-primary">Dividend Capture:</strong> Quarterly dividends reduce cost basis. A ${buyPrice} stock with {dividendYield}% yield = ${(buyPrice * dividendYield / 100).toFixed(2)}/year/share reduction.</p>
            <p><strong className="text-text-primary">Covered Calls:</strong> Sell out-of-the-money calls monthly. Collect premium (~{callPremium}% monthly) which directly reduces cost basis.</p>
          </div>
        </div>

        {/* Calculator */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary">Cost Basis Calculator</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Buy Price ($)</label>
              <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full bg-bg-elevated text-text-primary text-xs font-mono rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Sell Price ($)</label>
              <input type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full bg-bg-elevated text-text-primary text-xs font-mono rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Shares</label>
              <input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value))} className="w-full bg-bg-elevated text-text-primary text-xs font-mono rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Dividend Yield (%)</label>
              <input type="number" value={dividendYield} onChange={(e) => setDividendYield(Number(e.target.value))} className="w-full bg-bg-elevated text-text-primary text-xs font-mono rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Monthly Call Premium (%)</label>
              <input type="number" value={callPremium} onChange={(e) => setCallPremium(Number(e.target.value))} className="w-full bg-bg-elevated text-text-primary text-xs font-mono rounded-lg px-2.5 py-1.5 border border-border-default focus:border-border-accent outline-none" />
            </div>
          </div>

          <div className="mt-3 p-3 bg-bg-elevated rounded-lg border border-border-default space-y-2">
            <div className="flex justify-between text-xs"><span className="text-text-muted">New Cost Basis</span><span className="font-mono text-accent-primary">${newCostBasis.toFixed(2)}/share</span></div>
            <div className="flex justify-between text-xs"><span className="text-text-muted">Annual Dividends</span><span className="font-mono text-[#00E676]">${annualDividends.toFixed(0)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-text-muted">Annual Call Income</span><span className="font-mono text-[#00E676]">${annualCalls.toFixed(0)}</span></div>
            <div className="flex justify-between text-xs pt-1 border-t border-border-default"><span className="text-text-muted">Months to Zero Cost</span><span className="font-mono text-accent-primary">{monthsToZero.toFixed(1)}</span></div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="w-full bg-bg-elevated rounded-full h-3 overflow-hidden border border-border-default">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #FF1744 0%, #FBBF24 50%, #00E676 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, (1 - newCostBasis / buyPrice) * 100))}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-muted mt-1">
              <span>Full Cost</span>
              <span>Zero Cost</span>
              <span>Negative Cost</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Section 7: Technical Analysis Framework ───────────────────────

function TechnicalFramework() {
  const indicators = [
    {
      title: 'RSI Extremes',
      icon: Gauge,
      color: '#F472B6',
      signals: [
        { type: 'BUY', text: 'RSI(14) below 30 (oversold) with bullish reversal candle' },
        { type: 'SELL', text: 'RSI(14) above 70 (overbought) with bearish reversal candle' },
        { type: 'BUY', text: 'RSI 50 crossover: Bullish when crossing up through 50' },
        { type: 'SELL', text: 'Divergence: Price high + RSI lower high = sell signal' },
      ],
      weight: '25%',
      miniChart: [
        { v: 45 }, { v: 38 }, { v: 32 }, { v: 28 }, { v: 35 }, { v: 42 }, { v: 55 }, { v: 68 }, { v: 75 }, { v: 62 },
      ],
    },
    {
      title: 'MACD Divergence',
      icon: Activity,
      color: '#00D9C0',
      signals: [
        { type: 'BUY', text: 'Bullish divergence — price makes lower low, MACD makes higher low' },
        { type: 'SELL', text: 'Bearish divergence — price makes higher high, MACD makes lower high' },
        { type: 'BUY', text: 'Histogram turning positive from negative = early entry' },
        { type: 'SELL', text: 'Histogram turning negative from positive = early exit' },
      ],
      weight: '25%',
      miniChart: [
        { v: -2 }, { v: -1.5 }, { v: -0.5 }, { v: 0.5 }, { v: 1.2 }, { v: 0.8 }, { v: -0.3 }, { v: -1.0 }, { v: -1.5 }, { v: 0.2 },
      ],
    },
    {
      title: 'Moving Averages',
      icon: TrendingUp,
      color: '#00E676',
      signals: [
        { type: 'BUY', text: 'Price crosses above 20-day MA with volume confirmation' },
        { type: 'SELL', text: 'Price crosses below 60-day MA' },
        { type: 'BUY', text: 'Golden Cross: 20-day MA crosses above 60-day MA — major bullish' },
        { type: 'SELL', text: 'Death Cross: 20-day MA crosses below 60-day MA — major bearish' },
      ],
      weight: '30%',
      miniChart: [
        { v: 100 }, { v: 102 }, { v: 105 }, { v: 103 }, { v: 108 }, { v: 112 }, { v: 110 }, { v: 115 }, { v: 118 }, { v: 120 },
      ],
    },
    {
      title: 'Support/Resistance',
      icon: ArrowUpFromLine,
      color: '#FBBF24',
      signals: [
        { type: 'BUY', text: 'Price breaks above resistance with volume >1.5x average' },
        { type: 'SELL', text: 'Price breaks below support with volume >1.5x average' },
        { type: 'BUY', text: 'False breakout filter: Wait for daily close above/below level' },
        { type: 'BUY', text: 'Retest entry: Enter on pullback to broken level that holds' },
      ],
      weight: '20%',
      miniChart: [
        { v: 50 }, { v: 52 }, { v: 48 }, { v: 55 }, { v: 53 }, { v: 58 }, { v: 56 }, { v: 60 }, { v: 59 }, { v: 62 },
      ],
    },
  ];

  return (
    <motion.section {...fadeUp(0)} id="technical" className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <h2 className="text-xl font-bold text-text-primary font-heading mb-2">6. Technical Signal Framework</h2>
      <p className="text-sm text-text-secondary mb-6">
        Four technical analysis systems generate entry and exit signals. Signals are combined with VIX and account rules for final execution decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicators.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <motion.div
              key={ind.title}
              {...fadeUp(i * 0.08)}
              className="bg-bg-elevated/50 rounded-lg border border-border-default p-4 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ind.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: ind.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{ind.title}</h4>
                    <span className="text-[10px] text-text-muted">Weight: {ind.weight} of signal score</span>
                  </div>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="h-16 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ind.miniChart}>
                    <defs>
                      <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ind.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={ind.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={ind.color} strokeWidth={1.5} fill={`url(#grad${i})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Signals */}
              <div className="space-y-2">
                {ind.signals.map((sig, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${sig.type === 'BUY' ? 'bg-[rgba(0,230,118,0.15)] text-[#00E676]' : 'bg-[rgba(255,23,68,0.15)] text-[#FF1744]'}`}>
                      {sig.type}
                    </span>
                    <span className="text-xs text-text-secondary leading-relaxed">{sig.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Signal Scoring Bar */}
      <div className="mt-6 p-4 bg-bg-elevated/50 rounded-lg border border-border-default">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Signal Scoring</h4>
        <p className="text-xs text-text-secondary mb-3">Final signal strength = weighted average of active indicators</p>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #FF1744 0%, #FBBF24 40%, #00E676 100%)' }}>
          <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: '25%' }} />
          <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: '40%' }} />
          <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: '60%' }} />
          <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: '75%' }} />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted mt-1.5 font-mono">
          <span>&lt;25% Strong Sell</span>
          <span>25-40% Sell</span>
          <span>40-60% Hold</span>
          <span>60-75% Buy</span>
          <span>&gt;75% Strong Buy</span>
        </div>
      </div>
    </motion.section>
  );
}

// ── Section 8: Core Principles ────────────────────────────────────

function CorePrinciples() {
  const principles = [
    {
      title: '应对 > 预测',
      subtitle: 'React > Predict',
      desc: 'Focus on responding to market conditions rather than trying to predict them. Adaptability beats forecasting.',
      icon: Activity,
      color: '#00D9C0',
    },
    {
      title: '不满仓、不上杠杆、不追高',
      subtitle: 'No Full Position / No Leverage / No Chasing',
      desc: 'Never go all-in. Never use leverage. Never chase prices after a big move. Preserve capital above all.',
      icon: Shield,
      color: '#00E676',
    },
    {
      title: '负成本持股',
      subtitle: 'Negative Cost Holding',
      desc: 'Systematically reduce cost basis to zero through dividends and covered calls. Own shares for free.',
      icon: CircleDollarSign,
      color: '#FBBF24',
    },
    {
      title: '金字塔加仓',
      subtitle: 'Pyramid Building',
      desc: 'Build positions gradually in 7 tiers (1-1-1.5-1.5-2-2-3). Buy more as price drops, averaging down safely.',
      icon: Layers,
      color: '#FF9800',
    },
    {
      title: '财商三位一体',
      subtitle: 'Financial Intelligence Trinity',
      desc: 'Three pillars: ability to earn money, skill to preserve it, and wisdom to read wealth flows.',
      icon: Lightbulb,
      color: '#6366F1',
    },
    {
      title: '黄金分割仓位',
      subtitle: 'Golden Ratio Sizing',
      desc: 'Max 61.8% of account capital in any single position. Derived from the golden ratio for optimal sizing.',
      icon: Percent,
      color: '#F472B6',
    },
    {
      title: '恐慌中买入',
      subtitle: 'Buy Fear, Sell Greed',
      desc: 'Use VIX as a guide. Higher fear means greater opportunity. Be greedy when others are fearful.',
      icon: TrendingUp,
      color: '#FF6B35',
    },
    {
      title: '三账户独立管理',
      subtitle: 'Three Account System',
      desc: 'Aggressive 45% / Stable 15% / Defensive 40%. Track each independently. Never mix objectives.',
      icon: GitFork,
      color: '#00D9C0',
    },
  ];

  return (
    <motion.section {...fadeUp(0)} className="bg-bg-card rounded-xl border border-border-default p-5 lg:p-6">
      <h2 className="text-xl font-bold text-text-primary font-heading mb-6">Core Strategy Principles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {principles.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              {...fadeUp(i * 0.06)}
              className="bg-bg-elevated/50 rounded-lg border border-border-default p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${p.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: p.color }} />
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-0.5">{p.title}</h4>
              <p className="text-[10px] text-text-muted font-mono mb-2">{p.subtitle}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
              <div className="mt-3 h-[2px] rounded-full transition-all duration-300" style={{ backgroundColor: p.color, width: '30%' }} />
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

// ── Main Strategy Page ────────────────────────────────────────────

export default function Strategy() {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-6">
      <PageHero onNavClick={scrollTo} />

      <div className="px-4 lg:px-6 space-y-6">
        <VIXDecisionSystem />
        <PyramidBuilder />
        <ThreeAccountManager />
        <GoldenRatioSizer />
        <NegativeCostConcept />
        <TechnicalFramework />
        <CorePrinciples />
      </div>
    </div>
  );
}
