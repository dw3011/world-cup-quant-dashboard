import type { Match } from "@/types/match";
import type { AIReport } from "@/types/prediction";
import type { Review } from "@/types/review";

export const mockMatches: Match[] = [
  {
    id: "m_001",
    home_team: "巴西",
    home_flag: "🇧🇷",
    away_team: "海地",
    away_flag: "🇭🇹",
    group_name: "小组赛 B组",
    match_time: "2026-06-20 20:00",
    status: "LIVE",
    score_home: 2,
    score_away: 0,
    venue: "洛杉矶体育场",
    ai_status: "已生成",
    odds: { home_win_odds: 1.42, draw_odds: 4.6, away_win_odds: 8.5, over_2_5_odds: 1.82, under_2_5_odds: 2.03, handicap: "巴西 -1.25" },
    manual: {
      home_strength_rating: 9,
      away_strength_rating: 5,
      home_form_rating: 8,
      away_form_rating: 5,
      home_attack_defense_rating: 8,
      away_attack_defense_rating: 5,
      injury_info: "客队后防一名主力停赛，主队核心阵容完整。",
      motivation_info: "主队需要净胜球巩固小组优势。",
      lineup_info: "巴西预计沿用四后卫体系，边路推进优先。",
      market_note: "主胜方向热度高但未出现异常跳水。",
      manual_note: "实力差距明确，需防大幅轮换导致节奏下降。"
    }
  },
  {
    id: "m_002",
    home_team: "德国",
    home_flag: "🇩🇪",
    away_team: "西班牙",
    away_flag: "🇪🇸",
    group_name: "小组赛 E组",
    match_time: "2026-06-20 23:00",
    status: "UPCOMING",
    score_home: null,
    score_away: null,
    venue: "纽约新泽西体育场",
    ai_status: "已生成",
    odds: { home_win_odds: 2.65, draw_odds: 3.18, away_win_odds: 2.7, over_2_5_odds: 2.05, under_2_5_odds: 1.78, handicap: "平手" },
    manual: {
      home_strength_rating: 8,
      away_strength_rating: 8,
      home_form_rating: 7,
      away_form_rating: 8,
      home_attack_defense_rating: 7,
      away_attack_defense_rating: 8,
      injury_info: "双方均有边路球员轻伤，影响有限。",
      motivation_info: "双方都能接受平局，但胜者将获得出线主动权。",
      lineup_info: "德国中场厚度较好，西班牙控球稳定。",
      market_note: "平局赔率下调，市场防范均势拉扯。",
      manual_note: "高质量对抗，风险来自控球优势无法转化为射门质量。"
    }
  },
  {
    id: "m_003",
    home_team: "法国",
    home_flag: "🇫🇷",
    away_team: "阿根廷",
    away_flag: "🇦🇷",
    group_name: "淘汰赛",
    match_time: "2026-06-20 18:00",
    status: "FINISHED",
    score_home: 3,
    score_away: 1,
    venue: "达拉斯体育场",
    ai_status: "待复盘",
    odds: { home_win_odds: 2.15, draw_odds: 3.4, away_win_odds: 3.65, over_2_5_odds: 1.92, under_2_5_odds: 1.9, handicap: "法国 -0.25" },
    manual: {
      home_strength_rating: 9,
      away_strength_rating: 8,
      home_form_rating: 8,
      away_form_rating: 7,
      home_attack_defense_rating: 8,
      away_attack_defense_rating: 7,
      injury_info: "客队后腰体能储备不足，主队中轴线完整。",
      motivation_info: "主队希望延续卫冕冠军势头。",
      lineup_info: "法国保持高位压迫，阿根廷更多依靠中路推进。",
      market_note: "主胜方向资金稳定，平局水位有防范。",
      manual_note: "预测主队不败，注意下半场转换节奏。"
    }
  },
  {
    id: "m_004",
    home_team: "日本",
    home_flag: "🇯🇵",
    away_team: "墨西哥",
    away_flag: "🇲🇽",
    group_name: "小组赛 G组",
    match_time: "2026-06-21 02:00",
    status: "UPCOMING",
    score_home: null,
    score_away: null,
    venue: "温哥华体育场",
    ai_status: "待生成",
    odds: { home_win_odds: 2.88, draw_odds: 3.05, away_win_odds: 2.55, over_2_5_odds: 2.18, under_2_5_odds: 1.68, handicap: "墨西哥 -0" },
    manual: {
      home_strength_rating: 7,
      away_strength_rating: 7,
      home_form_rating: 8,
      away_form_rating: 7,
      home_attack_defense_rating: 6,
      away_attack_defense_rating: 7,
      injury_info: "主队前场轮换空间较小。",
      motivation_info: "双方首战都倾向稳守拿分。",
      lineup_info: "日本重视边路速度，墨西哥中前场对抗更强。",
      market_note: "客胜赔率略有下探，但幅度有限。",
      manual_note: "低比分概率较高，临场阵容会影响节奏。"
    }
  }
];

export const mockReports: AIReport[] = mockMatches.map((match) => ({
  match_id: match.id,
  sections: [
    { title: "比赛背景", content: `${match.home_team} 对阵 ${match.away_team}，本场属于${match.group_name}，比赛地点为${match.venue}。两队赛前目标清晰，比赛节奏预计会受到小组形势影响。` },
    { title: "赔率解读", content: "赔率去水后作为基础概率输入，当前市场没有出现需要单独放大的异常信号，平局方向仍需保留一定防范。" },
    { title: "双方状态对比", content: "主客队评分差异会对胜平负做小幅修正，近期状态和攻防倾向共同决定进球数区间。" },
    { title: "战意与阵容影响", content: match.manual.motivation_info + " " + match.manual.injury_info },
    { title: "模型预测结果", content: "规则模型输出经过归一化处理，三项概率总和固定为 100%，用于辅助赛前研判。" },
    { title: "比分和进球数倾向", content: "推荐比分以 Top 3 概率展示，进球区间结合攻防倾向和赔率结构给出。" },
    { title: "爆冷风险", content: "若临场阵容或盘口出现明显反向变化，应提升风险等级并降低单场置信。" },
    { title: "最终建议", content: "以规则模型概率最高方向为主参考，同时结合风险等级控制决策强度。" },
    { title: "风险提示", content: "本报告只提供数据解释，不代表确定赛果。请理性使用分析结果。" }
  ]
}));

export const mockReviews: Review[] = [
  {
    match_id: "m_003",
    actual_score_home: 3,
    actual_score_away: 1,
    hit_result: true,
    hit_goals_range: true,
    hit_score_accuracy: "接近",
    error_analysis: "模型对主队胜向判断准确，但低估了下半场转换进攻效率。",
    adjustment_suggestion: "遇到边路冲击能力较强的强队时，适度提高攻防倾向权重。"
  }
];

export function getMatch(id: string) {
  return mockMatches.find((match) => match.id === id);
}
