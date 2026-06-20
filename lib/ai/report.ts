import "server-only";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildReportPrompt } from "@/lib/ai/prompt";
import type { Match } from "@/types/match";
import type { AIReport, Prediction } from "@/types/prediction";

const requiredSections = ["比赛背景", "赔率解读", "双方状态对比", "战意与阵容影响", "模型预测结果", "比分和进球数倾向", "爆冷风险", "最终建议", "风险提示"];

function fallbackReport(match: Match, prediction: Prediction): AIReport {
  return {
    match_id: match.id,
    sections: [
      { title: "比赛背景", content: `${match.home_team} 对阵 ${match.away_team}，本场属于${match.group_name}。当前分析以人工录入信息和规则模型输出为基础。` },
      { title: "赔率解读", content: `赔率去水后作为基础输入，规则模型给出主胜 ${prediction.win_prob_home}%、平局 ${prediction.draw_prob}%、客胜 ${prediction.win_prob_away}%。` },
      { title: "双方状态对比", content: "球队硬实力、近期状态和攻防倾向已按预设权重参与修正，未引入机器学习模型。" },
      { title: "战意与阵容影响", content: `${match.manual.motivation_info} ${match.manual.injury_info}` },
      { title: "模型预测结果", content: prediction.model_reason },
      { title: "比分和进球数倾向", content: `推荐比分为 ${prediction.predicted_scores.map((item) => `${item.score} ${item.probability}%`).join("、")}，进球区间为 ${prediction.goals_range}。` },
      { title: "爆冷风险", content: `当前风险等级为${prediction.risk_level}，需要关注临场阵容与盘口是否出现反向变化。` },
      { title: "最终建议", content: "以规则模型概率最高方向为主参考，同时结合风险等级控制分析强度。" },
      { title: "风险提示", content: "本报告只提供数据解释，不代表确定赛果。请理性使用分析结果。" }
    ]
  };
}

function normalizeReport(matchId: string, text: string, match: Match, prediction: Prediction): AIReport {
  try {
    const parsed = JSON.parse(text) as { sections?: Array<{ title?: string; content?: string }> };
    const sections = requiredSections.map((title) => {
      const found = parsed.sections?.find((section) => section.title === title);
      return {
        title,
        content: found?.content?.trim() || fallbackReport(match, prediction).sections.find((section) => section.title === title)!.content
      };
    });
    return { match_id: matchId, sections };
  } catch {
    return fallbackReport(match, prediction);
  }
}

export async function generateAIReport(match: Match, prediction: Prediction): Promise<AIReport> {
  const client = getOpenAIClient();
  if (!client) return fallbackReport(match, prediction);

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: buildReportPrompt(match, prediction),
    temperature: 0.4
  });

  return normalizeReport(match.id, response.output_text, match, prediction);
}
