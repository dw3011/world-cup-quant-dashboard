# 世界杯每日量化分析看板

这是一个以每日手动录入为主流程的世界杯量化分析看板。

## 当前主流程

1. 手动新增比赛，写入 Supabase `matches`
2. 手动录入赔率、球队评分、伤停、战意、阵容和盘口备注
3. 运行规则模型，结果写入 Supabase `predictions`
4. 基于模型结果调用 OpenAI 生成中文分析，写入 Supabase `ai_reports`
5. 赛后录入真实比分，写入 Supabase `reviews`
6. 统计页读取 `predictions` 和 `reviews` 计算表现

## 外部数据 API

外部数据 API 接入已预留，目前主流程采用手动录入。

`/api/football/*` 路由保留为 experimental optional 模块，不会被首页、详情页、新增页或核心业务流程主动调用。未配置 `API_FOOTBALL_KEY` 不影响项目运行。
