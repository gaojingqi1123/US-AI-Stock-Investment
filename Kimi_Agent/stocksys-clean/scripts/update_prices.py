#!/usr/bin/env python3
"""
美股量化投资系统 - 多数据源价格更新脚本
优先级: iFinD → Yahoo Finance → S&P Global
生成 data/prices.json 供前端读取
"""

import json, os, sys, subprocess, re, time
from datetime import datetime

# 64只核心美股
TICKERS = [
    "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","AMD","AVGO","CRM",
    "ADBE","INTC","QCOM","NKE","DIS","UBER","PYPL","KO","PEP","COST",
    "WMT","PG","JNJ","UNH","PFE","ABBV","MRK","LLY","JPM","V",
    "MA","BAC","WFC","GS","MS","XOM","CVX","COP","BA","CAT",
    "GE","HON","UPS","VZ","T","TMUS","LIN","NEE","DHR","ABT",
    "TMO","ACN","MCD","SBUX","TXN","MU","AMGN","BMY","SCHW","BLK",
    "SPGI","ISRG","VRTX","ADI","MRVL"
]

OUTPUT = "/mnt/agents/output/stocksys-clean/data/prices.json"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def call_ifind(tickers_batch):
    """调用 iFinD 获取价格，每次最多3只"""
    result = {}
    for i in range(0, len(tickers_batch), 3):
        chunk = tickers_batch[i:i+3]
        symbols = ",".join(f"{t}.O" if t in NASDAQ else f"{t}.N" for t in chunk)
        try:
            # Use subprocess to call the data source tool
            cmd = [
                sys.executable, "-c",
                f"""
import subprocess, json, sys, os
os.chdir('/app/.agents/plugins/ifind')
result = subprocess.run(
    [sys.executable, 'scripts/ifind_tool.py', 'call', '--api-name', 'ifind_get_price',
     '--params-json', '{{"ticker":"{symbols}","start_date":"2026-07-07","end_date":"2026-07-08","file_path":"/tmp/ifind_multi.csv"}}'],
    capture_output=True, text=True, timeout=15
)
print(result.stdout)
print(result.stderr, file=sys.stderr)
"""
            ]
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
            if r.returncode != 0:
                continue
            
            import pandas as pd
            df = pd.read_csv("/tmp/ifind_multi.csv")
            for _, row in df.iterrows():
                t = row['thscode'].replace('.O', '').replace('.N', '')
                result[t] = round(row['close'], 2)
        except Exception as e:
            log(f"  iFinD error for {chunk}: {e}")
            continue
    return result

def call_yahoo(tickers_batch):
    """调用 Yahoo Finance 获取价格"""
    result = {}
    for t in tickers_batch:
        try:
            import subprocess, pandas as pd
            r = subprocess.run(
                [sys.executable, "scripts/yahoo_finance_tool.py", "call",
                 "--api-name", "get_stock_info",
                 "--params-json", f'{{"ticker":"{t}","file_path":"/tmp/yf_{t}.csv"}}'],
                capture_output=True, text=True, timeout=15, cwd="/app/.agents/plugins/yahoo_finance"
            )
            if r.returncode != 0:
                continue
            df = pd.read_csv(f"/tmp/yf_{t}.csv")
            price = df.iloc[0]['currentPrice']
            result[t] = round(price, 2)
        except Exception as e:
            log(f"  Yahoo error for {t}: {e}")
            continue
    return result

def call_sp_global(tickers_batch):
    """调用 S&P Global 获取价格"""
    result = {}
    # S&P Global mainly provides fundamentals, skip for price
    log("  S&P Global: price data not supported, skipping")
    return result

# NASDAQ tickers use .O suffix
NASDAQ = {"AAPL","ADBE","AMZN","AMD","AVGO","COST","CRM","GOOGL","INTC","META","MSFT","NVDA","PYPL","QCOM","SBUX","TSLA","TMUS","UBER","NKE","PEP","MU","TXN"}

def update():
    log("=" * 60)
    log("Starting multi-source price update...")
    
    prices = {}
    source_stats = {"ifind": 0, "yahoo": 0, "sp_global": 0, "failed": 0}
    
    # Try iFinD first (3 at a time)
    log("Phase 1: iFinD (primary source)")
    ifind_result = call_ifind(TICKERS)
    for t in TICKERS:
        if t in ifind_result:
            prices[t] = {"price": ifind_result[t], "source": "iFinD", "ts": time.time()}
            source_stats["ifind"] += 1
    log(f"  iFinD: {source_stats['ifind']}/{len(TICKERS)} tickers")
    
    # Fallback to Yahoo Finance for missing tickers
    missing = [t for t in TICKERS if t not in prices]
    if missing:
        log(f"Phase 2: Yahoo Finance (fallback for {len(missing)} tickers)")
        yahoo_result = call_yahoo(missing)
        for t in missing:
            if t in yahoo_result:
                prices[t] = {"price": yahoo_result[t], "source": "Yahoo", "ts": time.time()}
                source_stats["yahoo"] += 1
        log(f"  Yahoo: {source_stats['yahoo']}/{len(missing)} tickers")
    
    # S&P Global as last resort
    still_missing = [t for t in TICKERS if t not in prices]
    if still_missing:
        log(f"Phase 3: S&P Global (last resort for {len(still_missing)} tickers)")
        sp_result = call_sp_global(still_missing)
        for t in still_missing:
            if t in sp_result:
                prices[t] = {"price": sp_result[t], "source": "S&P", "ts": time.time()}
                source_stats["sp_global"] += 1
        log(f"  S&P Global: {source_stats['sp_global']}/{len(still_missing)} tickers")
    
    # Count failures
    source_stats["failed"] = len([t for t in TICKERS if t not in prices])
    
    # Build output
    output = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total": len(TICKERS),
        "covered": len(prices),
        "sources": source_stats,
        "prices": prices
    }
    
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(output, f, indent=2)
    
    log(f"Output saved: {OUTPUT}")
    log(f"Summary: {source_stats['ifind']} iFinD + {source_stats['yahoo']} Yahoo + {source_stats['sp_global']} S&P = {len(prices)}/{len(TICKERS)} tickers")
    if source_stats['failed'] > 0:
        log(f"Failed: {[t for t in TICKERS if t not in prices]}")
    log("Done!")
    
    return len(prices), source_stats

if __name__ == "__main__":
    covered, stats = update()
    print(f"\n{covered}/{len(TICKERS)} tickers updated")
    sys.exit(0 if stats["failed"] == 0 else 1)
