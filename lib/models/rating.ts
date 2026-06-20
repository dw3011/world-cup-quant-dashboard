import type { ManualInput } from "@/types/match";

export const MODEL_WEIGHTS = [
  { key: "odds", label: "赔率隐含概率", value: 40 },
  { key: "strength", label: "球队硬实力", value: 20 },
  { key: "form", label: "近期状态", value: 15 },
  { key: "attack", label: "攻防倾向", value: 10 },
  { key: "injury", label: "伤停阵容", value: 5 },
  { key: "motivation", label: "战意与小组形势", value: 5 },
  { key: "market", label: "市场异常 / 盘口变化", value: 5 }
] as const;

export function ratingGap(input: ManualInput) {
  return {
    strength: input.home_strength_rating - input.away_strength_rating,
    form: input.home_form_rating - input.away_form_rating,
    attack: input.home_attack_defense_rating - input.away_attack_defense_rating
  };
}
