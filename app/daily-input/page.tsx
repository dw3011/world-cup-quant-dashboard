import { DailyOddsInput } from "@/components/match/DailyOddsInput";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAIReportByMatchId, getPredictionByMatchId, getReviewByMatchId, listLatestOddsSnapshots, listMatchesByDate } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function DailyInputPage({ searchParams }: { searchParams: { date?: string } }) {
  const date = searchParams.date || getChinaToday();
  console.log("[daily-input] received searchParams.date:", searchParams.date ?? null, "using date:", date);
  const matches = await listMatchesByDate(date);
  const latestOdds = await listLatestOddsSnapshots(matches.map((match) => match.id));
  const statusEntries = await Promise.all(matches.map(async (match) => {
    const [prediction, report, review] = await Promise.all([
      getPredictionByMatchId(match.id),
      getAIReportByMatchId(match.id),
      getReviewByMatchId(match.id)
    ]);
    return [match.id, {
      hasOdds: Boolean(latestOdds[match.id]),
      hasPrediction: Boolean(prediction),
      hasReport: Boolean(report),
      hasReview: Boolean(review),
      latestOdds: latestOdds[match.id]
    }] as const;
  }));
  const statusMap = Object.fromEntries(statusEntries);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-primary">每日赔率录入</span>
          <h1 className="mt-2 font-display text-3xl font-bold">今日赔率录入与自动分析</h1>
          <p className="mt-2 text-secondary">赛程来自 matches 表，日常只需要录入体彩赔率和补充信息。</p>
        </div>
        <form className="flex items-end gap-2">
          <label className="space-y-2">
            <span className="label-caps">选择日期</span>
            <input className="input" type="date" name="date" defaultValue={date} />
          </label>
          <button className="btn-secondary" type="submit">切换日期</button>
        </form>
      </div>
      {matches.length ? (
        <DailyOddsInput date={date} matches={matches} statusMap={statusMap} />
      ) : (
        <div className="card py-12 text-center text-secondary">该日期暂无赛程，请到赛程维护页补充 matches 表。</div>
      )}
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
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
}
