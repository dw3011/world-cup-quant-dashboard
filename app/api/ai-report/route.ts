import { NextResponse } from "next/server";
import { mockReports } from "@/data/mockMatches";
import { createAIClient } from "@/lib/ai/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const client = await createAIClient();
  const report = mockReports.find((item) => item.match_id === body.match_id) ?? mockReports[0];

  return NextResponse.json({
    ...report,
    provider_ready: client.enabled,
    note: "第一版返回 mock 中文报告；真实 LLM 接入时仅从服务端环境变量读取 API Key。"
  });
}
