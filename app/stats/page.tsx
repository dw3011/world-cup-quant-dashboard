import { AccuracyChart } from "@/components/stats/AccuracyChart";
import { StatsCard } from "@/components/stats/StatsCard";
import { TrendChart } from "@/components/stats/TrendChart";
import { PageContainer } from "@/components/layout/PageContainer";

export default function StatsPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">模型逻辑架构与表现统计</h1>
        <p className="mt-2 text-secondary">展示规则模型结构、命中率、风险分层与最近 10 场预测表现。</p>
      </div>
      <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="总预测场次" value="128" />
        <StatsCard label="胜平负命中率" value="74.2%" />
        <StatsCard label="进球数命中率" value="68.5%" />
        <StatsCard label="比分接近率" value="42.8%" />
        <StatsCard label="高信心场次命中率" value="89.4%" tone="primary" />
      </section>
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <AccuracyChart />
        <TrendChart />
      </section>
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="card lg:col-span-7">
          <h2 className="mb-5 font-display text-xl font-bold">量化分析五层结构</h2>
          <div className="space-y-4">
            {[
              ["1", "原始输入", "人工录入赛程、赔率、球队评分、伤停、战意与盘口备注。"],
              ["2", "数据特征化", "将赔率去水，将评分差、状态差和攻防倾向转为可加权变量。"],
              ["3", "业务规则", "按预设权重修正主胜、平局和客胜的基础概率。"],
              ["4", "规则推导", "使用简化规则生成胜平负概率、比分 Top 3、进球区间和风险等级。"],
              ["5", "最终输出", "归一化为 100%，再由 AI 生成中文解释与风险提示。"]
            ].map(([step, title, desc]) => (
              <div key={step} className="flex gap-4 rounded-xl border border-outline-variant bg-surface-low p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">{step}</span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-secondary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card lg:col-span-5">
          <h2 className="mb-5 font-display text-xl font-bold">模型偏差类型统计</h2>
          <div className="space-y-4">
            {[
              ["低估强队进球", "31%"],
              ["高估平局防范", "24%"],
              ["伤停影响放大", "18%"],
              ["盘口异常误判", "15%"],
              ["临场轮换缺失", "12%"]
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-mono font-bold">{value}</span></div>
                <div className="h-2 rounded-full bg-surface-mid"><div className="h-full rounded-full bg-primary" style={{ width: value }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
