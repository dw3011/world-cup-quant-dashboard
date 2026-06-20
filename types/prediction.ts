export interface Prediction {
  match_id: string;
  win_prob_home: number;
  draw_prob: number;
  win_prob_away: number;
  predicted_scores: Array<{ score: string; probability: number }>;
  goals_range: string;
  risk_level: "低" | "中低" | "中" | "中高" | "高";
  model_reason: string;
}

export interface AIReport {
  match_id: string;
  sections: Array<{ title: string; content: string }>;
}
