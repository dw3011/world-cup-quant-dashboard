import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";

export function buildReportPrompt(match: Match, prediction: Prediction) {
  return [
    "你是一个中文世界杯量化分析报告撰写助手。",
    "重要规则：AI 不计算概率，不修改概率，不给出新的概率，只能解释下方规则模型已经生成的结果。",
    "请返回严格 JSON，不要 Markdown，不要额外解释。",
    "JSON 结构必须为：{\"sections\":[{\"title\":\"比赛背景\",\"content\":\"...\"}, ...]}。",
    "sections 必须包含且仅包含这些标题：比赛背景、赔率解读、双方状态对比、战意与阵容影响、模型预测结果、比分和进球数倾向、爆冷风险、最终建议、风险提示。",
    "",
    `比赛：${match.home_team} ${match.home_flag} vs ${match.away_team} ${match.away_flag}`,
    `赛事：${match.group_name}`,
    `时间：${match.match_time}`,
    `场地：${match.venue ?? "未录入"}`,
    `状态：${match.status}`,
    `赔率：主胜 ${match.odds.home_win_odds}，平局 ${match.odds.draw_odds}，客胜 ${match.odds.away_win_odds}，大小球大 ${match.odds.over_2_5_odds ?? "未录入"}，小 ${match.odds.under_2_5_odds ?? "未录入"}，盘口 ${match.odds.handicap ?? "未录入"}`,
    `规则模型输出：主胜 ${prediction.win_prob_home}%，平局 ${prediction.draw_prob}%，客胜 ${prediction.win_prob_away}%，推荐比分 ${prediction.predicted_scores.map((item) => `${item.score} ${item.probability}%`).join("、")}，进球数区间 ${prediction.goals_range}，风险等级 ${prediction.risk_level}`,
    `模型理由：${prediction.model_reason}`,
    `伤停：${match.manual.injury_info}`,
    `战意：${match.manual.motivation_info}`,
    `阵容：${match.manual.lineup_info}`,
    `市场备注：${match.manual.market_note}`,
    `人工备注：${match.manual.manual_note}`
  ].join("\n");
}
