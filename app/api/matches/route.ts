import { NextResponse } from "next/server";
import { createMatch, deleteMatch, getMatchById, listMatches, updateMatch, type MatchInput } from "@/lib/repositories";

export async function GET() {
  return NextResponse.json(await listMatches());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as MatchInput | null;
  if (!body) {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const match = await createMatch(body);
  return NextResponse.json(match, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("id");
  if (!matchId) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const match = await getMatchById(matchId);
  if (!match) {
    return NextResponse.json({ error: "比赛不存在" }, { status: 404 });
  }

  await deleteMatch(matchId);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as (Partial<MatchInput> & { id?: string }) | null;
  if (!body?.id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const match = await getMatchById(body.id);
  if (!match) {
    return NextResponse.json({ error: "比赛不存在" }, { status: 404 });
  }

  const { id, ...updates } = body;
  return NextResponse.json(await updateMatch(id, updates));
}
