import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";

export function buildReportPrompt(match: Match, prediction: Prediction) {
  return `请基于规则模型结果生成中文分析报告。比赛：${match.home_team} vs ${match.away_team}。主胜 ${prediction.win_prob_home}%，平局 ${prediction.draw_prob}%，客胜 ${prediction.win_prob_away}%。AI 只解释，不重新计算概率。`;
}
