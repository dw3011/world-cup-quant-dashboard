import { NextResponse } from "next/server";
import { generateAIReport } from "@/lib/ai/report";
import { generatePredictionFromLatestOdds, getMatchById, getPredictionByMatchId, saveAIReport } from "@/lib/repositories";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const matchId = body.match_id as string | undefined;
  if (!matchId) {
    return NextResponse.json({ error: "缺少 match_id" }, { status: 400 });
  }

  const match = await getMatchById(matchId);
  if (!match) {
    return NextResponse.json({ error: "比赛不存在" }, { status: 404 });
  }

  const prediction = (await getPredictionByMatchId(match.id)) ?? (await generatePredictionFromLatestOdds(match, true));
  if (!prediction) {
    return NextResponse.json({ error: "请先录入赔率" }, { status: 400 });
  }

  const report = await saveAIReport(await generateAIReport(match, prediction));
  return NextResponse.json(report);
}
