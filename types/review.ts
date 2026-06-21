export interface Review {
  id?: string;
  match_id: string;
  prediction_id?: string | null;
  actual_score_home: number;
  actual_score_away: number;
  hit_result: boolean;
  hit_goals_range: boolean;
  hit_score_accuracy: "命中" | "接近" | "未命中";
  error_analysis: string;
  adjustment_suggestion: string;
}
