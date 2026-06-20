import type { Match } from "@/types/match";

export function ReviewForm({ match }: { match: Match }) {
  return (
    <form className="card space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">结果录入</h2>
        <p className="mt-1 text-sm text-secondary">录入真实比分后用于赛后复盘与命中率统计。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="label-caps">{match.home_team} 实际进球</span>
          <input className="input font-mono" name="actual_score_home" defaultValue={match.score_home ?? 0} type="number" min={0} />
        </label>
        <label className="space-y-2">
          <span className="label-caps">{match.away_team} 实际进球</span>
          <input className="input font-mono" name="actual_score_away" defaultValue={match.score_away ?? 0} type="number" min={0} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {["胜平负命中", "进球区间命中", "比分接近"].map((item) => (
          <label key={item} className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-low p-3 text-sm font-semibold">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-outline-variant text-primary" />
            {item}
          </label>
        ))}
      </div>
      <label className="space-y-2">
        <span className="label-caps">模型偏差总结</span>
        <textarea className="input min-h-28" defaultValue="模型方向判断正确，但对下半场节奏变化估计偏保守。" />
      </label>
      <label className="space-y-2">
        <span className="label-caps">下次权重调整建议</span>
        <textarea className="input min-h-28" defaultValue="强队边路冲击优势明显时，可略微提高攻防倾向权重。" />
      </label>
      <button type="button" className="btn-primary w-full sm:w-auto">提交复盘结果</button>
    </form>
  );
}
