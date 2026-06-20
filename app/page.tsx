import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { MatchCard } from "@/components/match/MatchCard";
import { getOrGeneratePrediction, listMatches } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const matches = await listMatches();
  const today = getChinaToday();
  const todayMatches = matches.filter((match) => match.match_time.slice(0, 10) === today);
  const predictions = await Promise.all(todayMatches.map((match) => getOrGeneratePrediction(match)));
  const generated = todayMatches.filter((match) => match.ai_status === "已生成").length;
  const activeOrFinished = todayMatches.filter((match) => match.status === "LIVE" || match.status === "FINISHED").length;
  const averageRisk = predictions.length ? mostCommon(predictions.map((prediction) => prediction.risk_level)) : "无";

  return (
    <PageContainer>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="今日比赛" value={String(todayMatches.length)} hint="手动录入赛程" />
        <Metric label="已生成分析" value={String(generated)} hint={`覆盖率 ${todayMatches.length ? Math.round((generated / todayMatches.length) * 100) : 0}%`} />
        <Metric label="进行中/已结束" value={String(activeOrFinished)} hint="实时处理中" />
        <Metric label="平均风险" value={averageRisk} hint="基于规则模型" />
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
        {todayMatches.length ? (
          <div className="space-y-4">
            {todayMatches.map((match, index) => (
              <MatchCard key={match.id} match={match} prediction={predictions[index]} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-14 text-center">
            <h2 className="font-display text-2xl font-bold">今日暂无比赛，请先手动新增比赛。</h2>
            <p className="mt-2 text-sm text-secondary">新增后会进入 Supabase matches 表，并可继续运行规则模型和 AI 分析。</p>
            <Link href="/new-match" className="btn-primary mt-6">新增比赛</Link>
          </div>
        )}
      </section>
    </PageContainer>
  );
}

function getChinaToday() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function mostCommon(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "无";
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
