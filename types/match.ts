export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED";

export interface Odds {
  home_win_odds: number;
  draw_odds: number;
  away_win_odds: number;
  over_2_5_odds?: number;
  under_2_5_odds?: number;
  handicap?: string;
}

export interface ManualInput {
  home_strength_rating: number;
  away_strength_rating: number;
  home_form_rating: number;
  away_form_rating: number;
  home_attack_defense_rating: number;
  away_attack_defense_rating: number;
  injury_info: string;
  motivation_info: string;
  lineup_info: string;
  market_note: string;
  manual_note: string;
}

export interface Match {
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
  venue?: string;
  ai_status?: "已生成" | "待生成" | "待复盘" | "已归档";
  odds: Odds;
  manual: ManualInput;
}
