import { NextResponse } from "next/server";
import { getMatchById, savePrediction } from "@/lib/repositories";
import { predictionFor } from "@/lib/models/probability";

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

  const prediction = await savePrediction(predictionFor(match));
  return NextResponse.json(prediction);
}
