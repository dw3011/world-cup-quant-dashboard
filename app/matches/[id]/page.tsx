import { notFound } from "next/navigation";
import Link from "next/link";
import { AIReport } from "@/components/analysis/AIReport";
import { ModelReasonPanel } from "@/components/analysis/ModelReasonPanel";
import { PageContainer } from "@/components/layout/PageContainer";
import { MatchDetailActions } from "@/components/match/MatchDetailActions";
import { MatchHeader } from "@/components/match/MatchHeader";
import { OddsPanel } from "@/components/match/OddsPanel";
import { ProbabilityPanel } from "@/components/match/ProbabilityPanel";
import { RiskBadge } from "@/components/match/RiskBadge";
import { ScorePrediction } from "@/components/match/ScorePrediction";
import { getAIReportByMatchId, getMatchById, getPredictionByMatchId, getReviewByMatchId } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await getMatchById(params.id);
  if (!match) notFound();
  const prediction = await getPredictionByMatchId(match.id);
  const report = await getAIReportByMatchId(match.id);
  const review = await getReviewByMatchId(match.id);

  return (
    <PageContainer>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-semibold text-primary">返回今日分析</Link>
        <Link href={`/matches/${match.id}/review`} className="btn-secondary">进入赛后复盘</Link>
      </div>
      <div className="space-y-6">
        <MatchHeader match={match} />
        <MatchDetailActions
          matchId={match.id}
          showPredict={!prediction}
          showAIReport={!report}
          showReview={match.status === "FINISHED" && !review}
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <OddsPanel match={match} />
            {prediction ? (
              <div className="card space-y-6">
                <h2 className="font-display text-2xl font-bold">量化模型预测</h2>
                <ProbabilityPanel prediction={prediction} />
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <span className="label-caps mb-3 block">推荐比分 Top 3</span>
                    <ScorePrediction prediction={prediction} />
                  </div>
                  <div className="soft-card flex flex-col items-center justify-center text-center">
                    <span className="label-caps">推荐进球数区间</span>
                    <div className="mt-2 font-display text-4xl font-bold text-primary">{prediction.goals_range}</div>
                    <span className="mt-1 text-sm text-secondary">置信度 78%</span>
                  </div>
                  <div className="soft-card flex flex-col items-center justify-center text-center">
                    <span className="label-caps">风险等级</span>
                    <div className="mt-4"><RiskBadge level={prediction.risk_level} /></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-secondary">暂无规则模型结果，请先运行规则模型。</div>
            )}
            {report ? <AIReport report={report} /> : <div className="card text-secondary">暂无 AI 分析报告，请点击“生成 AI 分析”。</div>}
          </div>
          <aside className="space-y-6 lg:col-span-4">
            {prediction ? <ModelReasonPanel prediction={prediction} /> : null}
            <div className="card">
              <h3 className="mb-4 font-display text-xl font-bold">人工录入摘要</h3>
              <Info label="伤停信息" value={match.manual.injury_info} />
              <Info label="战意与小组形势" value={match.manual.motivation_info} />
              <Info label="阵容轮换" value={match.manual.lineup_info} />
              <Info label="市场 / 盘口备注" value={match.manual.market_note} />
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-outline-variant py-3 last:border-b-0">
      <div className="label-caps">{label}</div>
      <p className="mt-1 text-sm leading-6 text-text-muted">{value}</p>
    </div>
  );
}
