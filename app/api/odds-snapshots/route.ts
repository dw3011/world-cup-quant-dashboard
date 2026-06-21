import { NextResponse } from "next/server";
import { createOddsSnapshot, getMatchById, type OddsSnapshotInput } from "@/lib/repositories";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as OddsSnapshotInput | null;
  if (!body?.match_id) {
    return NextResponse.json({ error: "缺少 match_id" }, { status: 400 });
  }

  const match = await getMatchById(body.match_id);
  if (!match) {
    return NextResponse.json({ error: "比赛不存在" }, { status: 404 });
  }

  if (!body.win_odds || !body.draw_odds || !body.loss_odds) {
    return NextResponse.json({ error: "请填写主胜、平局、客胜赔率" }, { status: 400 });
  }

  return NextResponse.json(await createOddsSnapshot(body), { status: 201 });
}
