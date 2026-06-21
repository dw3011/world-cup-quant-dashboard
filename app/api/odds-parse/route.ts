import { NextResponse } from "next/server";
import { parseOddsText } from "@/lib/ai/parseOdds";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawText = String(body.raw_text || "").trim();
  if (!rawText) {
    return NextResponse.json({ error: "请粘贴赔率文本" }, { status: 400 });
  }

  return NextResponse.json(await parseOddsText(rawText));
}
