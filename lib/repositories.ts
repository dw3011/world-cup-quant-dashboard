import "server-only";
import { mockMatches } from "@/data/mockMatches";
import { predictionFor } from "@/lib/models/probability";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Match, MatchStatus, ManualInput, Odds, OddsSnapshot } from "@/types/match";
import type { AIReport, Prediction } from "@/types/prediction";
import type { Review } from "@/types/review";

type MatchRow = {
  id: string;
  home_team: string;
  home_flag: string | null;
  away_team: string;
  away_flag: string | null;
  group_name: string | null;
  match_date: string | null;
  match_time: string;
  stage: string | null;
  status: MatchStatus;
  score_home: number | null;
  score_away: number | null;
  venue?: string | null;
  ai_status?: Match["ai_status"] | null;
  odds?: Odds | null;
  manual?: ManualInput | null;
};

type PredictionRow = Prediction & {
  id: string;
  odds_snapshot_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AIReportRow = {
  id: string;
  match_id: string;
  prediction_id?: string | null;
  report?: { sections?: Array<{ title: string; content: string }> } | Array<{ title: string; content: string }> | null;
  sections?: Array<{ title: string; content: string }>;
  summary?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ReviewRow = Review & {
  id: string;
  prediction_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MatchInput = Omit<Match, "id"> & { id?: string };
export type ScheduleImportItem = {
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  group_name: string;
  stage?: string;
  status?: MatchStatus;
};
export type OddsSnapshotInput = Omit<OddsSnapshot, "id" | "created_at" | "source"> & { source?: string };

type LocalStore = {
  matches: Match[];
  oddsSnapshots: OddsSnapshot[];
  predictions: Prediction[];
  reports: AIReport[];
  reviews: Review[];
};

const localStore = ((globalThis as typeof globalThis & { __worldCupLocalStore?: LocalStore }).__worldCupLocalStore ??= {
  matches: [],
  oddsSnapshots: [],
  predictions: [],
  reports: [],
  reviews: []
});

type OddsSnapshotRow = {
  id: string;
  match_id: string;
  source: string;
  win_odds: number | string;
  draw_odds: number | string;
  loss_odds: number | string;
  handicap_line: number | string | null;
  handicap_win_odds: number | string | null;
  handicap_draw_odds: number | string | null;
  handicap_loss_odds: number | string | null;
  raw_text: string | null;
  created_at: string;
};

const matchSelectFields = "id, match_date, match_time, home_team, away_team, home_flag, away_flag, group_name, stage, status, score_home, score_away";

function defaultOdds(): Odds {
  return {
    home_win_odds: 2,
    draw_odds: 3.2,
    away_win_odds: 3
  };
}

function defaultManual(): ManualInput {
  return {
    home_strength_rating: 6,
    away_strength_rating: 6,
    home_form_rating: 6,
    away_form_rating: 6,
    home_attack_defense_rating: 6,
    away_attack_defense_rating: 6,
    injury_info: "待补充",
    motivation_info: "待补充",
    lineup_info: "待补充",
    market_note: "待录入赔率",
    manual_note: "赛程基础信息"
  };
}

function parseHandicapLine(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const numeric = value.match(/-?\d+(?:\.\d+)?/)?.[0];
  if (!numeric) return null;
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    home_team: row.home_team,
    home_flag: row.home_flag ?? "🏳️",
    away_team: row.away_team,
    away_flag: row.away_flag ?? "🏳️",
    group_name: row.group_name ?? "未分组",
    match_date: row.match_date ?? row.match_time.slice(0, 10),
    match_time: row.match_time,
    stage: row.stage ?? undefined,
    status: row.status,
    score_home: row.score_home,
    score_away: row.score_away,
    venue: row.venue ?? undefined,
    ai_status: row.ai_status ?? undefined,
    odds: row.odds ?? defaultOdds(),
    manual: row.manual ?? defaultManual()
  };
}

function toMatchRow(input: MatchInput) {
  return {
    home_team: input.home_team,
    home_flag: input.home_flag,
    away_team: input.away_team,
    away_flag: input.away_flag,
    group_name: input.group_name,
    match_date: input.match_date ?? input.match_time.slice(0, 10),
    match_time: input.match_time,
    stage: input.stage ?? null,
    status: input.status,
    score_home: input.score_home,
    score_away: input.score_away
  };
}

function toOddsSnapshot(row: OddsSnapshotRow): OddsSnapshot {
  return {
    id: row.id,
    match_id: row.match_id,
    source: row.source,
    win_odds: Number(row.win_odds),
    draw_odds: Number(row.draw_odds),
    loss_odds: Number(row.loss_odds),
    handicap_line: row.handicap_line === null ? undefined : String(row.handicap_line),
    handicap_win_odds: row.handicap_win_odds === null ? undefined : Number(row.handicap_win_odds),
    handicap_draw_odds: row.handicap_draw_odds === null ? undefined : Number(row.handicap_draw_odds),
    handicap_loss_odds: row.handicap_loss_odds === null ? undefined : Number(row.handicap_loss_odds),
    raw_text: row.raw_text ?? undefined,
    created_at: row.created_at
  };
}

export function oddsFromSnapshot(snapshot: OddsSnapshot): Odds {
  return {
    home_win_odds: snapshot.win_odds,
    draw_odds: snapshot.draw_odds,
    away_win_odds: snapshot.loss_odds,
    handicap: snapshot.handicap_line
  };
}

export function matchWithOddsSnapshot(match: Match, snapshot: OddsSnapshot): Match {
  return {
    ...match,
    odds: oddsFromSnapshot(snapshot),
    manual: {
      ...match.manual,
      market_note: snapshot.raw_text || match.manual.market_note
    }
  };
}

export async function listMatches(): Promise<Match[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [...mockMatches, ...localStore.matches].sort((a, b) => a.match_time.localeCompare(b.match_time));

  const { data, error } = await supabase.from("matches").select(matchSelectFields).order("match_time", { ascending: true });
  if (error || !data?.length) return mockMatches;

  return (data as MatchRow[]).map(toMatch);
}

export async function listMatchesByDate(date: string): Promise<Match[]> {
  console.log("[getMatchesByDate] query date:", date);
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const fallback = [...mockMatches, ...localStore.matches].filter((match) => (match.match_date ?? match.match_time.slice(0, 10)) === date);
    console.log("[getMatchesByDate] returned matches:", fallback.length);
    return fallback;
  }

  const { data, error, count } = await supabase
    .from("matches")
    .select(matchSelectFields, { count: "exact" })
    .eq("match_date", date)
    .order("match_time", { ascending: true });
  if (error) {
    console.log("[getMatchesByDate] supabase error:", error.message);
    const { data: allData, error: allError } = await supabase.from("matches").select(matchSelectFields).order("match_time", { ascending: true });
    if (allError) {
      console.log("[getMatchesByDate] fallback all matches error:", allError.message);
      const fallback = mockMatches.filter((match) => (match.match_date ?? match.match_time.slice(0, 10)) === date);
      console.log("[getMatchesByDate] returned fallback matches:", fallback.length);
      return fallback;
    }
    const filtered = ((allData ?? []) as MatchRow[]).map(toMatch).filter((match) => (match.match_date ?? match.match_time.slice(0, 10)) === date);
    console.log("[getMatchesByDate] returned matches via in-memory date filter:", filtered.length);
    return filtered;
  }

  const matches = ((data ?? []) as MatchRow[]).map(toMatch);
  console.log("[getMatchesByDate] supabase count:", count, "returned matches:", matches.length);
  console.log("[getMatchesByDate] returned sample:", matches.slice(0, 5).map((match) => ({
    id: match.id,
    match_date: match.match_date,
    match_time: match.match_time,
    home_team: match.home_team,
    away_team: match.away_team
  })));
  return matches;
}

export async function getMatchById(id: string): Promise<Match | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [...mockMatches, ...localStore.matches].find((match) => match.id === id) ?? null;

  const { data, error } = await supabase.from("matches").select(matchSelectFields).eq("id", id).single();
  if (error || !data) return mockMatches.find((match) => match.id === id) ?? null;

  return toMatch(data as MatchRow);
}

export async function createMatch(input: MatchInput): Promise<Match> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const match = { ...input, id: input.id ?? `local_${Date.now()}` };
    localStore.matches = [match, ...localStore.matches.filter((item) => item.id !== match.id)];
    return match;
  }

  const { data, error } = await supabase.from("matches").insert(toMatchRow(input)).select().single();
  if (error) throw new Error(error.message);

  return toMatch(data as MatchRow);
}

function scheduleItemToMatchInput(item: ScheduleImportItem): MatchInput {
  const status = item.status && ["UPCOMING", "LIVE", "FINISHED"].includes(item.status) ? item.status : "UPCOMING";
  const groupName = item.stage ? `${item.group_name} · ${item.stage}` : item.group_name;
  const matchTime = item.match_time.includes("T") ? item.match_time : `${item.match_date}T${item.match_time}:00+08:00`;

  return {
    home_team: item.home_team,
    home_flag: item.home_flag,
    away_team: item.away_team,
    away_flag: item.away_flag,
    group_name: groupName,
    match_date: item.match_date,
    match_time: matchTime,
    stage: item.stage ?? "",
    status,
    score_home: null,
    score_away: null,
    venue: "未录入",
    ai_status: "待生成",
    odds: {
      home_win_odds: 2,
      draw_odds: 3.2,
      away_win_odds: 3
    },
    manual: {
      home_strength_rating: 6,
      away_strength_rating: 6,
      home_form_rating: 6,
      away_form_rating: 6,
      home_attack_defense_rating: 6,
      away_attack_defense_rating: 6,
      injury_info: "待补充",
      motivation_info: "待补充",
      lineup_info: "待补充",
      market_note: "待录入赔率",
      manual_note: "赛程批量导入"
    }
  };
}

function dedupeKey(input: Pick<MatchInput, "home_team" | "away_team" | "match_time">) {
  return `${input.home_team.trim()}__${input.away_team.trim()}__${input.match_time}`;
}

export async function bulkImportMatches(items: ScheduleImportItem[]) {
  console.log("[bulkImportMatches] first item:", items[0] ?? null);
  const normalized = items.map(scheduleItemToMatchInput);
  const uniqueInputs = Array.from(new Map(normalized.map((item) => [dedupeKey(item), item])).values());
  const existing = await listMatches();
  const existingKeys = new Set(existing.map(dedupeKey));
  const toInsert = uniqueInputs.filter((item) => !existingKeys.has(dedupeKey(item)));

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const insertedMatches = toInsert.map((item, index) => ({ ...item, id: `local_schedule_${Date.now()}_${index}` }));
    localStore.matches = [...localStore.matches, ...insertedMatches].sort((a, b) => a.match_time.localeCompare(b.match_time));
    console.log("[bulkImportMatches] inserted count:", toInsert.length, "skipped:", uniqueInputs.length - toInsert.length);
    return {
      inserted: toInsert.length,
      skipped: uniqueInputs.length - toInsert.length,
      matches: insertedMatches
    };
  }

  if (!toInsert.length) {
    console.log("[bulkImportMatches] inserted count:", 0, "skipped:", uniqueInputs.length);
    return { inserted: 0, skipped: uniqueInputs.length, matches: [] };
  }

  const { data, error } = await supabase.from("matches").insert(toInsert.map(toMatchRow)).select();
  if (error) throw new Error(error.message);

  console.log("[bulkImportMatches] inserted count:", data?.length ?? 0, "skipped:", uniqueInputs.length - (data?.length ?? 0));
  return {
    inserted: data?.length ?? 0,
    skipped: uniqueInputs.length - (data?.length ?? 0),
    matches: ((data ?? []) as MatchRow[]).map(toMatch)
  };
}

export async function updateMatch(matchId: string, input: Partial<MatchInput>): Promise<Match> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const fallback = [...mockMatches, ...localStore.matches].find((match) => match.id === matchId);
    if (!fallback) throw new Error("Match not found");
    const updated = { ...fallback, ...input, id: matchId } as Match;
    localStore.matches = [updated, ...localStore.matches.filter((match) => match.id !== matchId)];
    return updated;
  }

  const updatePayload: Record<string, unknown> = {};
  if (input.home_team !== undefined) updatePayload.home_team = input.home_team;
  if (input.home_flag !== undefined) updatePayload.home_flag = input.home_flag;
  if (input.away_team !== undefined) updatePayload.away_team = input.away_team;
  if (input.away_flag !== undefined) updatePayload.away_flag = input.away_flag;
  if (input.group_name !== undefined) updatePayload.group_name = input.group_name;
  if (input.match_date !== undefined) updatePayload.match_date = input.match_date;
  if (input.match_time !== undefined) updatePayload.match_time = input.match_time;
  if (input.stage !== undefined) updatePayload.stage = input.stage;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.score_home !== undefined) updatePayload.score_home = input.score_home;
  if (input.score_away !== undefined) updatePayload.score_away = input.score_away;

  const { data, error } = await supabase.from("matches").update(updatePayload).eq("id", matchId).select().single();
  if (error) throw new Error(error.message);

  return toMatch(data as MatchRow);
}

export async function updateMatchScore(matchId: string, scoreHome: number, scoreAway: number) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("matches")
    .update({ score_home: scoreHome, score_away: scoreAway, status: "FINISHED" })
    .eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function deleteMatch(matchId: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    localStore.matches = localStore.matches.filter((match) => match.id !== matchId);
    return;
  }

  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function createOddsSnapshot(input: OddsSnapshotInput): Promise<OddsSnapshot> {
  const supabase = getSupabaseServerClient();
  const row = {
    match_id: input.match_id,
    source: input.source ?? "体彩",
    win_odds: input.win_odds,
    draw_odds: input.draw_odds,
    loss_odds: input.loss_odds,
    handicap_line: parseHandicapLine(input.handicap_line),
    handicap_win_odds: input.handicap_win_odds ?? null,
    handicap_draw_odds: input.handicap_draw_odds ?? null,
    handicap_loss_odds: input.handicap_loss_odds ?? null,
    raw_text: input.raw_text ?? null
  };

  if (!supabase) {
    const snapshot = {
      ...input,
      id: `local_odds_${Date.now()}`,
      source: row.source,
      created_at: new Date().toISOString()
    };
    localStore.oddsSnapshots.unshift(snapshot);
    return snapshot;
  }

  const { data, error } = await supabase.from("odds_snapshots").insert(row).select().single();
  if (error) throw new Error(error.message);

  return toOddsSnapshot(data as OddsSnapshotRow);
}

export async function getLatestOddsSnapshotByMatchId(matchId: string): Promise<OddsSnapshot | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return localStore.oddsSnapshots.find((snapshot) => snapshot.match_id === matchId) ?? null;

  const { data, error } = await supabase
    .from("odds_snapshots")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return toOddsSnapshot(data as OddsSnapshotRow);
}

export async function listLatestOddsSnapshots(matchIds: string[]): Promise<Record<string, OddsSnapshot>> {
  const entries = await Promise.all(matchIds.map(async (matchId) => [matchId, await getLatestOddsSnapshotByMatchId(matchId)] as const));
  return entries.reduce<Record<string, OddsSnapshot>>((acc, [matchId, snapshot]) => {
    if (snapshot) acc[matchId] = snapshot;
    return acc;
  }, {});
}

export async function getPredictionByMatchId(matchId: string): Promise<Prediction | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return localStore.predictions.find((prediction) => prediction.match_id === matchId) ?? null;

  const { data, error } = await supabase.from("predictions").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;

  const row = data as PredictionRow;
  return {
    id: row.id,
    match_id: row.match_id,
    odds_snapshot_id: row.odds_snapshot_id ?? null,
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
  if (!supabase) return localStore.predictions;

  const { data, error } = await supabase.from("predictions").select("*").order("created_at", { ascending: false });
  if (error || !data?.length) return [];

  return (data as PredictionRow[]).map((row) => ({
    id: row.id,
    match_id: row.match_id,
    odds_snapshot_id: row.odds_snapshot_id ?? null,
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
  if (!supabase) {
    localStore.predictions = [prediction, ...localStore.predictions.filter((item) => item.match_id !== prediction.match_id)];
    return prediction;
  }

  const payload = {
    match_id: prediction.match_id,
    odds_snapshot_id: prediction.odds_snapshot_id ?? null,
    win_prob_home: prediction.win_prob_home,
    draw_prob: prediction.draw_prob,
    win_prob_away: prediction.win_prob_away,
    predicted_scores: prediction.predicted_scores,
    goals_range: prediction.goals_range,
    risk_level: prediction.risk_level,
    model_reason: prediction.model_reason
  };

  const { data, error } = await supabase
    .from("predictions")
    .upsert(payload, { onConflict: "match_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const row = data as PredictionRow;
  return {
    id: row.id,
    match_id: row.match_id,
    odds_snapshot_id: row.odds_snapshot_id ?? null,
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

export async function generatePredictionFromLatestOdds(match: Match, persist = false): Promise<Prediction | null> {
  const latestOdds = await getLatestOddsSnapshotByMatchId(match.id);
  if (!latestOdds) return null;

  const prediction = {
    ...predictionFor(matchWithOddsSnapshot(match, latestOdds)),
    odds_snapshot_id: latestOdds.id ?? null
  };
  return persist ? savePrediction(prediction) : prediction;
}

export async function getAIReportByMatchId(matchId: string): Promise<AIReport | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return localStore.reports.find((report) => report.match_id === matchId) ?? null;

  const { data, error } = await supabase.from("ai_reports").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;

  const row = data as AIReportRow;
  const sections = Array.isArray(row.report) ? row.report : row.report?.sections ?? row.sections ?? [];
  return {
    id: row.id,
    match_id: row.match_id,
    prediction_id: row.prediction_id ?? null,
    sections,
    summary: row.summary ?? undefined
  };
}

export async function saveAIReport(report: AIReport): Promise<AIReport> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    localStore.reports = [report, ...localStore.reports.filter((item) => item.match_id !== report.match_id)];
    return report;
  }

  const prediction = report.prediction_id ? null : await getPredictionByMatchId(report.match_id);
  const payload = {
    match_id: report.match_id,
    prediction_id: report.prediction_id ?? prediction?.id ?? null,
    report: { sections: report.sections },
    summary: report.summary ?? report.sections[0]?.content ?? null
  };

  const { data, error } = await supabase.from("ai_reports").upsert(payload, { onConflict: "match_id" }).select().single();
  if (error) throw new Error(error.message);

  const row = data as AIReportRow;
  const sections = Array.isArray(row.report) ? row.report : row.report?.sections ?? [];
  return {
    id: row.id,
    match_id: row.match_id,
    prediction_id: row.prediction_id ?? null,
    sections,
    summary: row.summary ?? undefined
  };
}

export async function getReviewByMatchId(matchId: string): Promise<Review | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return localStore.reviews.find((review) => review.match_id === matchId) ?? null;

  const { data, error } = await supabase.from("reviews").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;

  const row = data as ReviewRow;
  return {
    id: row.id,
    match_id: row.match_id,
    prediction_id: row.prediction_id ?? null,
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
  if (!supabase) return localStore.reviews;

  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error || !data?.length) return [];

  return (data as ReviewRow[]).map((row) => ({
    id: row.id,
    match_id: row.match_id,
    prediction_id: row.prediction_id ?? null,
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
  if (!supabase) {
    localStore.reviews = [review, ...localStore.reviews.filter((item) => item.match_id !== review.match_id)];
    return review;
  }

  const prediction = review.prediction_id ? null : await getPredictionByMatchId(review.match_id);
  const payload = {
    match_id: review.match_id,
    prediction_id: review.prediction_id ?? prediction?.id ?? null,
    actual_score_home: review.actual_score_home,
    actual_score_away: review.actual_score_away,
    hit_result: review.hit_result,
    hit_goals_range: review.hit_goals_range,
    hit_score_accuracy: review.hit_score_accuracy,
    error_analysis: review.error_analysis,
    adjustment_suggestion: review.adjustment_suggestion
  };

  const { data, error } = await supabase.from("reviews").upsert(payload, { onConflict: "match_id" }).select().single();
  if (error) throw new Error(error.message);

  const row = data as ReviewRow;
  return {
    id: row.id,
    match_id: row.match_id,
    prediction_id: row.prediction_id ?? null,
    actual_score_home: row.actual_score_home,
    actual_score_away: row.actual_score_away,
    hit_result: row.hit_result,
    hit_goals_range: row.hit_goals_range,
    hit_score_accuracy: row.hit_score_accuracy,
    error_analysis: row.error_analysis,
    adjustment_suggestion: row.adjustment_suggestion
  };
}
