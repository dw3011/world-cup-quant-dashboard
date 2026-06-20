import type { Prediction } from "@/types/prediction";

export function ProbabilityPanel({ prediction }: { prediction: Prediction }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.05em] text-secondary">
        <span>主胜 {prediction.win_prob_home}%</span>
        <span>平局 {prediction.draw_prob}%</span>
        <span>客胜 {prediction.win_prob_away}%</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-mid">
        <div className="bg-primary" style={{ width: `${prediction.win_prob_home}%` }} />
        <div className="bg-outline" style={{ width: `${prediction.draw_prob}%` }} />
        <div className="bg-secondary" style={{ width: `${prediction.win_prob_away}%` }} />
      </div>
    </div>
  );
}
