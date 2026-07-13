import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Wallet,
  Radio,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/market', label: 'Market', icon: TrendingUp },
  { path: '/analysis', label: 'Analysis', icon: BarChart3 },
  { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  { path: '/signals', label: 'Signals', icon: Radio },
  { path: '/strategy', label: 'Strategy', icon: BookOpen },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-bg-primary/80 backdrop-blur-xl border-b border-border-default">
      <div className="max-w-[1440px] mx-auto h-full flex items-center px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-8 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-accent-primary" />
          </div>
          <span className="text-lg font-bold text-text-primary font-heading tracking-tight hidden sm:block">
            美股量化系统
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'text-accent-primary bg-accent-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side - Status */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-bullish opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-bullish" />
            </span>
            <span className="text-[11px] text-signal-bullish font-mono font-medium hidden sm:block">LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
