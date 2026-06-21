import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardMatchCard } from "@/components/match/DashboardMatchCard";
import { getAIReportByMatchId, getReviewByMatchId, listLatestOddsSnapshots, listMatchesByDate } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: { date?: string } }) {
  const date = searchParams.date || getChinaToday();
  console.log("[home] received searchParams.date:", searchParams.date ?? null, "using date:", date);
  const todayMatches = await listMatchesByDate(date);
  const latestOdds = await listLatestOddsSnapshots(todayMatches.map((match) => match.id));
  const statusEntries = await Promise.all(todayMatches.map(async (match) => {
    const [report, review] = await Promise.all([getAIReportByMatchId(match.id), getReviewByMatchId(match.id)]);
    return [match.id, { hasOdds: Boolean(latestOdds[match.id]), hasReport: Boolean(report), hasReview: Boolean(review) }] as const;
  }));
  const statusMap = Object.fromEntries(statusEntries);
  const generated = statusEntries.filter(([, status]) => status.hasReport).length;
  const pendingReview = todayMatches.filter((match) => match.status === "FINISHED" && !statusMap[match.id]?.hasReview).length;

  return (
    <PageContainer>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="当日比赛数" value={String(todayMatches.length)} hint="matches 表赛程" />
        <Metric label="已生成分析" value={String(generated)} hint={`覆盖率 ${todayMatches.length ? Math.round((generated / todayMatches.length) * 100) : 0}%`} />
        <Metric label="待复盘数" value={String(pendingReview)} hint="已结束未复盘" />
        <Metric label="已录赔率" value={String(statusEntries.filter(([, status]) => status.hasOdds).length)} hint="体彩赔率快照" />
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">比赛看板</h1>
            <p className="mt-1 text-sm text-secondary">当前日期：{date}</p>
          </div>
          <form className="flex items-end gap-2">
            <label className="space-y-2">
              <span className="label-caps">选择日期</span>
              <input className="input" type="date" name="date" defaultValue={date} />
            </label>
            <button className="btn-secondary" type="submit">切换日期</button>
          </form>
        </div>
        {todayMatches.length ? (
          <div className="space-y-4">
            {todayMatches.map((match) => (
              <DashboardMatchCard
                key={match.id}
                match={match}
                hasOdds={statusMap[match.id]?.hasOdds ?? false}
                hasReport={statusMap[match.id]?.hasReport ?? false}
                hasReview={statusMap[match.id]?.hasReview ?? false}
              />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-14 text-center">
            <h2 className="font-display text-2xl font-bold">该日期暂无比赛，请先导入赛程。</h2>
            <p className="mt-2 text-sm text-secondary">赛程应提前维护到 Supabase matches 表，日常只需录入赔率。</p>
            <Link href="/matches/manage" className="btn-primary mt-6">前往赛程维护</Link>
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


function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card">
      <span className="text-sm text-secondary">{label}</span>
      <div className="mt-2 font-display text-4xl font-bold">{value}</div>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}
