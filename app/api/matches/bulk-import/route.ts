import { NextResponse } from "next/server";
import { bulkImportMatches, type ScheduleImportItem } from "@/lib/repositories";

const requiredFields = ["match_date", "match_time", "home_team", "away_team", "home_flag", "away_flag", "group_name"];

function validate(items: unknown): items is ScheduleImportItem[] {
  return Array.isArray(items) && items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return requiredFields.every((field) => typeof record[field] === "string" && String(record[field]).trim().length > 0);
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body) ? body : body?.items;

  if (!validate(items)) {
    return NextResponse.json({ error: "JSON 数组格式错误或缺少必要字段" }, { status: 400 });
  }

  try {
    return NextResponse.json(await bulkImportMatches(items), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "批量导入失败" }, { status: 500 });
  }
}
