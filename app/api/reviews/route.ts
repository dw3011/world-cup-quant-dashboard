import { NextResponse } from "next/server";
import { getMatchById, getOrGeneratePrediction, saveReview, updateMatchScore } from "@/lib/repositories";
import type { Review } from "@/types/review";

function resultOf(home: number, away: number) {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

function predictedResult(prediction: { win_prob_home: number; draw_prob: number; win_prob_away: number }) {
  const max = Math.max(prediction.win_prob_home, prediction.draw_prob, prediction.win_prob_away);
  if (max === prediction.win_prob_home) return "home";
  if (max === prediction.win_prob_away) return "away";
  return "draw";
}

function goalsInRange(range: string, total: number) {
  const [min, max] = range.split("-").map(Number);
  return Number.isFinite(min) && Number.isFinite(max) ? total >= min && total <= max : false;
}

function scoreAccuracy(scores: Array<{ score: string }>, home: number, away: number): Review["hit_score_accuracy"] {
  if (scores.some((item) => item.score === `${home}-${away}`)) return "命中";
  if (scores.some((item) => {
    const [predHome, predAway] = item.score.split("-").map(Number);
    return Math.abs(predHome - home) + Math.abs(predAway - away) <= 1;
  })) return "接近";
  return "未命中";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const matchId = body.match_id as string | undefined;
  const actualHome = Number(body.actual_score_home);
  const actualAway = Number(body.actual_score_away);

  if (!matchId || !Number.isFinite(actualHome) || !Number.isFinite(actualAway)) {
    return NextResponse.json({ error: "缺少复盘比分或 match_id" }, { status: 400 });
  }

  const match = await getMatchById(matchId);
  if (!match) {
    return NextResponse.json({ error: "比赛不存在" }, { status: 404 });
  }

  const prediction = await getOrGeneratePrediction(match, true);
  const review: Review = {
    match_id: matchId,
    actual_score_home: actualHome,
    actual_score_away: actualAway,
    hit_result: resultOf(actualHome, actualAway) === predictedResult(prediction),
    hit_goals_range: goalsInRange(prediction.goals_range, actualHome + actualAway),
    hit_score_accuracy: scoreAccuracy(prediction.predicted_scores, actualHome, actualAway),
    error_analysis: body.error_analysis || "系统已根据实际比分与规则模型输出生成基础偏差记录。",
    adjustment_suggestion: body.adjustment_suggestion || "后续可结合更多复盘样本调整权重。"
  };

  await updateMatchScore(matchId, actualHome, actualAway);
  return NextResponse.json(await saveReview(review), { status: 201 });
}
