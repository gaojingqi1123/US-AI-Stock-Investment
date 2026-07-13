# 美股实时价格接入计划

## 方案：Full-Stack 架构（前端 + Hono后端 + ifind数据源）

### Stage 1: 读取后端技能并初始化
- 读取 backend-building-swarm/SKILL.md
- 在现有前端项目中graft后端

### Stage 2: 构建后端API
- 创建 Hono API路由 `/api/stock/quote?ticker=AAPL.O`
- 使用ifind获取实时价格
- 缓存机制避免重复调用

### Stage 3: 修改前端
- 创建自定义hook `useRealtimePrice(ticker)`
- 定时轮询（5秒间隔）
- 更新所有页面使用实时数据

### Stage 4: 部署
- 使用 dynamic 部署（需要后端服务器）
