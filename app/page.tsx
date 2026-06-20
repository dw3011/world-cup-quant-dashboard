import { PageContainer } from "@/components/layout/PageContainer";
import { MatchCard } from "@/components/match/MatchCard";
import { mockMatches } from "@/data/mockMatches";
import { predictionFor } from "@/lib/models/probability";

export default function HomePage() {
  const predictions = mockMatches.map(predictionFor);
  const generated = mockMatches.filter((match) => match.ai_status === "已生成").length;
  const live = mockMatches.filter((match) => match.status === "LIVE").length;

  return (
    <PageContainer>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="今日比赛" value={String(mockMatches.length)} hint="已确认赛程" />
        <Metric label="已生成分析" value={String(generated)} hint={`覆盖率 ${Math.round((generated / mockMatches.length) * 100)}%`} />
        <Metric label="进行中比赛" value={String(live)} hint="实时处理中" />
        <Metric label="平均风险" value="中" hint="模型信心指数 72%" />
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">今日赛事解析</h1>
            <p className="mt-1 text-sm text-secondary">查看赛程、比分、规则模型预测和 AI 分析状态。</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary">筛选</button>
            <button className="btn-secondary">排序</button>
          </div>
        </div>
        <div className="space-y-4">
          {mockMatches.map((match, index) => (
            <MatchCard key={match.id} match={match} prediction={predictions[index]} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card">
      <span className="text-sm text-secondary">{label}</span>
      <div className="mt-2 font-display text-4xl font-bold">{value}</div>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}
