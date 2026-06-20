import type { Match, ManualInput, Odds } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import { calculateImpliedProbabilities } from "./odds";
import { ratingGap } from "./rating";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(home: number, draw: number, away: number) {
  const safeHome = Math.max(1, home);
  const safeDraw = Math.max(1, draw);
  const safeAway = Math.max(1, away);
  const total = safeHome + safeDraw + safeAway;
  const roundedHome = Math.round((safeHome / total) * 100);
  const roundedDraw = Math.round((safeDraw / total) * 100);
  const roundedAway = 100 - roundedHome - roundedDraw;
  return { home: roundedHome, draw: roundedDraw, away: roundedAway };
}

function scoreSet(home: number, draw: number, away: number, tempo: number) {
  if (draw >= home && draw >= away) {
    return [
      { score: "1-1", probability: 15 },
      { score: "0-0", probability: tempo < 6 ? 11 : 8 },
      { score: home >= away ? "2-1" : "1-2", probability: 9 }
    ];
  }
  if (home > away) {
    return [
      { score: tempo >= 7 ? "2-0" : "1-0", probability: tempo >= 7 ? 18 : 15 },
      { score: "2-1", probability: 13 },
      { score: "1-1", probability: 10 }
    ];
  }
  return [
    { score: tempo >= 7 ? "1-2" : "0-1", probability: tempo >= 7 ? 16 : 14 },
    { score: "1-1", probability: 12 },
    { score: "0-2", probability: 9 }
  ];
}

export function generatePrediction(match: { id: string; odds: Odds; manual: ManualInput }): Prediction {
  const oddsProb = calculateImpliedProbabilities(match.odds).normalized;
  const gaps = ratingGap(match.manual);
  const weightedGap = gaps.strength * 2 + gaps.form * 1.5 + gaps.attack;
  const closeness = 10 - Math.min(10, Math.abs(weightedGap));
  const injuryBias = match.manual.injury_info.includes("主队") ? -2 : match.manual.injury_info.includes("客队") ? 2 : 0;
  const motivationBias = match.manual.motivation_info.includes("主队") ? 1.5 : match.manual.motivation_info.includes("客队") ? -1.5 : 0;
  const marketBias = match.manual.market_note.includes("主胜") ? 1 : match.manual.market_note.includes("客胜") ? -1 : 0;

  const baseHome = oddsProb.home * 100;
  const baseDraw = oddsProb.draw * 100;
  const baseAway = oddsProb.away * 100;
  const adjustment = clamp(weightedGap * 1.15 + injuryBias + motivationBias + marketBias, -12, 12);
  const drawAdjustment = clamp((closeness - 5) * 1.1, -5, 6);
  const normalized = normalize(baseHome + adjustment, baseDraw + drawAdjustment, baseAway - adjustment);
  const tempo = (match.manual.home_attack_defense_rating + match.manual.away_attack_defense_rating) / 2;
  const oddsSpread = Math.max(normalized.home, normalized.draw, normalized.away) - Math.min(normalized.home, normalized.draw, normalized.away);
  const risk: Prediction["risk_level"] = oddsSpread < 10 ? "高" : oddsSpread < 16 ? "中高" : oddsSpread < 24 ? "中" : oddsSpread < 34 ? "中低" : "低";

  return {
    match_id: match.id,
    win_prob_home: normalized.home,
    draw_prob: normalized.draw,
    win_prob_away: normalized.away,
    predicted_scores: scoreSet(normalized.home, normalized.draw, normalized.away, tempo),
    goals_range: tempo >= 7.2 ? "2-4" : tempo >= 6 ? "2-3" : "1-2",
    risk_level: risk,
    model_reason: `赔率去水后形成基础概率，主客队评分差为 ${weightedGap.toFixed(
      1
    )}。规则模型按赔率、硬实力、状态、攻防、伤停、战意和市场备注进行小幅修正，并将胜平负概率重新归一化为 100%。`
  };
}

export function predictionFor(match: Match) {
  return generatePrediction({ id: match.id, odds: match.odds, manual: match.manual });
}
