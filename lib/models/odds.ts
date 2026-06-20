import type { Odds } from "@/types/match";

export function calculateImpliedProbabilities(odds: Odds) {
  const implied = {
    home: 1 / odds.home_win_odds,
    draw: 1 / odds.draw_odds,
    away: 1 / odds.away_win_odds
  };
  const total = implied.home + implied.draw + implied.away;

  return {
    raw: implied,
    normalized: {
      home: implied.home / total,
      draw: implied.draw / total,
      away: implied.away / total
    },
    overround: total - 1
  };
}

export function toPercent(value: number) {
  return Math.round(value * 100);
}
