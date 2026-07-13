# 美股量化投资系统 — 构建计划

## 项目概述
基于《美股投资策略指南（完整版）》构建一个可视化美股量化投资系统，包含实时数据连接、策略信号生成、买卖指导。

## Stage 1: 技术架构设计
- 读取vibecoding-webapp-swarm技能
- 确定技术栈和数据流
- 设计系统架构和页面结构

## Stage 2: 数据层构建
- 接入Yahoo Finance API获取实时美股K线
- 实现股票历史数据获取
- 实现技术指标计算（MA、MACD、RSI、VIX等）

## Stage 3: 量化策略引擎
- 基于策略指南实现核心策略模块：
  - 金字塔加仓信号生成器
  - VIX恐慌指数决策模块
  - 黄金分割仓位管理器
  - 负成本持股追踪器
  - 三大账户管理器
  - 止损止盈信号生成器

## Stage 4: 前端可视化
- 构建React + TypeScript + Tailwind CSS + shadcn/ui网页应用
- 核心页面：
  1. 大盘仪表盘（VIX、纳指、标普实时数据）
  2. 个股分析页（K线图 + 买卖信号 + 策略指导）
  3. 策略信号页（金字塔加仓信号、VIX决策）
  4. 仓位管理页（三大账户管理）
  5. 策略指南页（核心策略速查）

## Stage 5: 部署上线
- 部署为可访问的网页应用

## 技术栈
- 前端: React 18 + TypeScript + Tailwind CSS + shadcn/ui + Recharts/KLine
- 数据: Yahoo Finance API (via yahoo-finance2)
- 部署: 静态网站
