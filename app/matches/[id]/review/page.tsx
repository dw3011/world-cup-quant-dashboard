import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { MatchHeader } from "@/components/match/MatchHeader";
import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewResult } from "@/components/review/ReviewResult";
import { getMatch, mockReviews } from "@/data/mockMatches";
import { predictionFor } from "@/lib/models/probability";

export default function ReviewPage({ params }: { params: { id: string } }) {
  const match = getMatch(params.id);
  if (!match) notFound();
  const prediction = predictionFor(match);
  const review = mockReviews.find((item) => item.match_id === match.id);

  return (
    <PageContainer>
      <div className="mb-6">
        <span className="text-sm font-semibold text-primary">赛后复盘</span>
        <h1 className="mt-2 font-display text-3xl font-bold">复盘 {match.home_team} vs {match.away_team}</h1>
      </div>
      <div className="space-y-6">
        <MatchHeader match={match} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ReviewForm match={match} />
          {review ? <ReviewResult review={review} prediction={prediction} /> : <div className="card text-secondary">暂无复盘结果，请先提交真实比分。</div>}
        </div>
      </div>
    </PageContainer>
  );
}
