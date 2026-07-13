import { AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-bg-primary border-t border-border-default py-4 px-4 lg:px-6 mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-signal-neutral shrink-0" />
          <p className="text-[11px] text-text-muted leading-relaxed">
            投资有风险，入市需谨慎。本系统提供的所有分析和信号仅供参考，不构成投资建议。
            过往表现不代表未来收益。请根据自身风险承受能力做出投资决策。
          </p>
        </div>
        <p className="text-[11px] text-text-dim font-mono shrink-0">
          US Stock Quant System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
