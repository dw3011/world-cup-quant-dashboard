import type { Match } from "@/types/match";
import { calculateImpliedProbabilities, toPercent } from "@/lib/models/odds";

export function OddsPanel({ match }: { match: Match }) {
  const implied = calculateImpliedProbabilities(match.odds);
  const cells = [
    { label: "主胜", odds: match.odds.home_win_odds, prob: implied.normalized.home, tone: "text-primary" },
    { label: "平局", odds: match.odds.draw_odds, prob: implied.normalized.draw, tone: "text-secondary" },
    { label: "客胜", odds: match.odds.away_win_odds, prob: implied.normalized.away, tone: "text-danger" }
  ];

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">市场指数摘要</h3>
        <span className="text-sm text-secondary">去水率 {(implied.overround * 100).toFixed(1)}%</span>
      </div>
      <div className="grid overflow-hidden rounded-xl border border-outline-variant sm:grid-cols-3">
        {cells.map((cell) => (
          <div key={cell.label} className="border-b border-outline-variant bg-surface-low p-4 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <p className="label-caps mb-2">{cell.label}</p>
            <p className={`font-display text-2xl font-bold ${cell.tone}`}>{cell.odds.toFixed(2)}</p>
            <p className="mt-1 font-mono text-sm text-text-muted">隐含概率 {toPercent(cell.prob)}%</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 text-sm text-secondary sm:grid-cols-2">
        <div className="soft-card">大小球：大 {match.odds.over_2_5_odds ?? "-"} / 小 {match.odds.under_2_5_odds ?? "-"}</div>
        <div className="soft-card">让球盘口：{match.odds.handicap ?? "未录入"}</div>
      </div>
    </div>
  );
}
