import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";

type DebugMatchRow = {
  id: string;
  match_date: string | null;
  match_time: string | null;
  home_team: string | null;
  away_team: string | null;
};

function compactRows(rows: DebugMatchRow[] | null) {
  return (rows ?? []).map((row) => ({
    id: row.id,
    match_date: row.match_date,
    match_time: row.match_time,
    home_team: row.home_team,
    away_team: row.away_team
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const receivedDate = searchParams.get("date") ?? "";
  const supabaseConfigured = isSupabaseConfigured();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      receivedDate,
      supabaseConfigured,
      exactMatchDateQueryCount: 0,
      exactMatchDateQueryRows: [],
      allMatchesCount: 0,
      sampleMatches: [],
      error: "Supabase is not configured"
    });
  }

  const selectFields = "id, match_date, match_time, home_team, away_team";
  const exactQuery = await supabase
    .from("matches")
    .select(selectFields, { count: "exact" })
    .eq("match_date", receivedDate)
    .order("match_time", { ascending: true });

  const allQuery = await supabase
    .from("matches")
    .select(selectFields, { count: "exact" })
    .order("match_time", { ascending: true })
    .limit(20);

  console.log("[debug/matches-by-date] receivedDate:", receivedDate);
  console.log("[debug/matches-by-date] exact count:", exactQuery.count, "error:", exactQuery.error?.message ?? null);
  console.log("[debug/matches-by-date] all count:", allQuery.count, "error:", allQuery.error?.message ?? null);
  console.log("[debug/matches-by-date] exact sample:", compactRows((exactQuery.data ?? []).slice(0, 5) as DebugMatchRow[]));

  return NextResponse.json({
    receivedDate,
    supabaseConfigured,
    exactMatchDateQueryCount: exactQuery.count ?? exactQuery.data?.length ?? 0,
    exactMatchDateQueryRows: compactRows((exactQuery.data ?? []) as DebugMatchRow[]),
    allMatchesCount: allQuery.count ?? allQuery.data?.length ?? 0,
    sampleMatches: compactRows((allQuery.data ?? []) as DebugMatchRow[]),
    exactMatchDateQueryError: exactQuery.error?.message ?? null,
    allMatchesError: allQuery.error?.message ?? null
  });
}
