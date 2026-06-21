export interface Prediction {
  id?: string;
  match_id: string;
  odds_snapshot_id?: string | null;
  win_prob_home: number;
  draw_prob: number;
  win_prob_away: number;
  predicted_scores: Array<{ score: string; probability: number }>;
  goals_range: string;
  risk_level: "低" | "中低" | "中" | "中高" | "高";
  model_reason: string;
}

export interface AIReport {
  id?: string;
  match_id: string;
  prediction_id?: string | null;
  sections: Array<{ title: string; content: string }>;
  summary?: string;
}
