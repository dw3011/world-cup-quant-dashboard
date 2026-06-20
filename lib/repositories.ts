import "server-only";
import { mockMatches, mockReports, mockReviews } from "@/data/mockMatches";
import { predictionFor } from "@/lib/models/probability";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Match, MatchStatus, ManualInput, Odds } from "@/types/match";
import type { AIReport, Prediction } from "@/types/prediction";
import type { Review } from "@/types/review";

type MatchRow = {
  id: string;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  group_name: string;
  match_time: string;
  status: MatchStatus;
  score_home: number | null;
  score_away: number | null;
  venue: string | null;
  ai_status: Match["ai_status"] | null;
  odds: Odds;
  manual: ManualInput;
};

type PredictionRow = Prediction & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type AIReportRow = AIReport & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type ReviewRow = Review & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type MatchInput = Omit<Match, "id"> & { id?: string };

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    home_team: row.home_team,
    home_flag: row.home_flag,
    away_team: row.away_team,
    away_flag: row.away_flag,
    group_name: row.group_name,
    match_time: row.match_time,
    status: row.status,
    score_home: row.score_home,
    score_away: row.score_away,
    venue: row.venue ?? undefined,
    ai_status: row.ai_status ?? undefined,
    odds: row.odds,
    manual: row.manual
  };
}

function toMatchRow(input: MatchInput) {
  return {
    id: input.id,
    home_team: input.home_team,
    home_flag: input.home_flag,
    away_team: input.away_team,
    away_flag: input.away_flag,
    group_name: input.group_name,
    match_time: input.match_time,
    status: input.status,
    score_home: input.score_home,
    score_away: input.score_away,
    venue: input.venue ?? null,
    ai_status: input.ai_status ?? "待生成",
    odds: input.odds,
    manual: input.manual
  };
}

export async function listMatches(): Promise<Match[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockMatches;

  const { data, error } = await supabase.from("matches").select("*").order("match_time", { ascending: true });
  if (error || !data?.length) return mockMatches;

  return (data as MatchRow[]).map(toMatch);
}

export async function getMatchById(id: string): Promise<Match | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockMatches.find((match) => match.id === id) ?? null;

  const { data, error } = await supabase.from("matches").select("*").eq("id", id).single();
  if (error || !data) return mockMatches.find((match) => match.id === id) ?? null;

  return toMatch(data as MatchRow);
}

export async function createMatch(input: MatchInput): Promise<Match> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ...input, id: input.id ?? `local_${Date.now()}` };
  }

  const { data, error } = await supabase.from("matches").insert(toMatchRow(input)).select().single();
  if (error) throw new Error(error.message);

  return toMatch(data as MatchRow);
}

export async function updateMatch(matchId: string, input: Partial<MatchInput>): Promise<Match> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const fallback = mockMatches.find((match) => match.id === matchId);
    return { ...fallback!, ...input, id: matchId } as Match;
  }

  const updatePayload: Record<string, unknown> = {};
  if (input.home_team !== undefined) updatePayload.home_team = input.home_team;
  if (input.home_flag !== undefined) updatePayload.home_flag = input.home_flag;
  if (input.away_team !== undefined) updatePayload.away_team = input.away_team;
  if (input.away_flag !== undefined) updatePayload.away_flag = input.away_flag;
  if (input.group_name !== undefined) updatePayload.group_name = input.group_name;
  if (input.match_time !== undefined) updatePayload.match_time = input.match_time;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.score_home !== undefined) updatePayload.score_home = input.score_home;
  if (input.score_away !== undefined) updatePayload.score_away = input.score_away;
  if (input.venue !== undefined) updatePayload.venue = input.venue;
  if (input.ai_status !== undefined) updatePayload.ai_status = input.ai_status;
  if (input.odds !== undefined) updatePayload.odds = input.odds;
  if (input.manual !== undefined) updatePayload.manual = input.manual;

  const { data, error } = await supabase.from("matches").update(updatePayload).eq("id", matchId).select().single();
  if (error) throw new Error(error.message);

  return toMatch(data as MatchRow);
}

export async function updateMatchScore(matchId: string, scoreHome: number, scoreAway: number) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("matches")
    .update({ score_home: scoreHome, score_away: scoreAway, status: "FINISHED", ai_status: "待复盘" })
    .eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function deleteMatch(matchId: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function getPredictionByMatchId(matchId: string): Promise<Prediction | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const match = mockMatches.find((item) => item.id === matchId);
    return match ? predictionFor(match) : null;
  }

  const { data, error } = await supabase.from("predictions").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;

  const row = data as PredictionRow;
  return {
    match_id: row.match_id,
    win_prob_home: row.win_prob_home,
    draw_prob: row.draw_prob,
    win_prob_away: row.win_prob_away,
    predicted_scores: row.predicted_scores,
    goals_range: row.goals_range,
    risk_level: row.risk_level,
    model_reason: row.model_reason
  };
}

export async function listPredictions(): Promise<Prediction[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockMatches.map(predictionFor);

  const { data, error } = await supabase.from("predictions").select("*").order("created_at", { ascending: false });
  if (error || !data?.length) return [];

  return (data as PredictionRow[]).map((row) => ({
    match_id: row.match_id,
    win_prob_home: row.win_prob_home,
    draw_prob: row.draw_prob,
    win_prob_away: row.win_prob_away,
    predicted_scores: row.predicted_scores,
    goals_range: row.goals_range,
    risk_level: row.risk_level,
    model_reason: row.model_reason
  }));
}

export async function savePrediction(prediction: Prediction): Promise<Prediction> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return prediction;

  const { data, error } = await supabase
    .from("predictions")
    .upsert(prediction, { onConflict: "match_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const row = data as PredictionRow;
  return {
    match_id: row.match_id,
    win_prob_home: row.win_prob_home,
    draw_prob: row.draw_prob,
    win_prob_away: row.win_prob_away,
    predicted_scores: row.predicted_scores,
    goals_range: row.goals_range,
    risk_level: row.risk_level,
    model_reason: row.model_reason
  };
}

export async function getOrGeneratePrediction(match: Match, persist = false) {
  const saved = await getPredictionByMatchId(match.id);
  if (saved) return saved;

  const prediction = predictionFor(match);
  return persist ? savePrediction(prediction) : prediction;
}

export async function getAIReportByMatchId(matchId: string): Promise<AIReport | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockReports.find((report) => report.match_id === matchId) ?? null;

  const { data, error } = await supabase.from("ai_reports").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;

  const row = data as AIReportRow;
  return { match_id: row.match_id, sections: row.sections };
}

export async function saveAIReport(report: AIReport): Promise<AIReport> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return report;

  const { data, error } = await supabase.from("ai_reports").upsert(report, { onConflict: "match_id" }).select().single();
  if (error) throw new Error(error.message);
  await supabase.from("matches").update({ ai_status: "已生成" }).eq("id", report.match_id);

  const row = data as AIReportRow;
  return { match_id: row.match_id, sections: row.sections };
}

export async function getReviewByMatchId(matchId: string): Promise<Review | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockReviews.find((review) => review.match_id === matchId) ?? null;

  const { data, error } = await supabase.from("reviews").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;

  const row = data as ReviewRow;
  return {
    match_id: row.match_id,
    actual_score_home: row.actual_score_home,
    actual_score_away: row.actual_score_away,
    hit_result: row.hit_result,
    hit_goals_range: row.hit_goals_range,
    hit_score_accuracy: row.hit_score_accuracy,
    error_analysis: row.error_analysis,
    adjustment_suggestion: row.adjustment_suggestion
  };
}

export async function listReviews(): Promise<Review[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockReviews;

  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error || !data?.length) return [];

  return (data as ReviewRow[]).map((row) => ({
    match_id: row.match_id,
    actual_score_home: row.actual_score_home,
    actual_score_away: row.actual_score_away,
    hit_result: row.hit_result,
    hit_goals_range: row.hit_goals_range,
    hit_score_accuracy: row.hit_score_accuracy,
    error_analysis: row.error_analysis,
    adjustment_suggestion: row.adjustment_suggestion
  }));
}

export async function saveReview(review: Review): Promise<Review> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return review;

  const { data, error } = await supabase.from("reviews").upsert(review, { onConflict: "match_id" }).select().single();
  if (error) throw new Error(error.message);

  const row = data as ReviewRow;
  return {
    match_id: row.match_id,
    actual_score_home: row.actual_score_home,
    actual_score_away: row.actual_score_away,
    hit_result: row.hit_result,
    hit_goals_range: row.hit_goals_range,
    hit_score_accuracy: row.hit_score_accuracy,
    error_analysis: row.error_analysis,
    adjustment_suggestion: row.adjustment_suggestion
  };
}
