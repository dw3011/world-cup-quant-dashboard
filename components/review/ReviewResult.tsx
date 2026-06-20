import type { Prediction } from "@/types/prediction";
import type { Review } from "@/types/review";

export function ReviewResult({ review, prediction }: { review: Review; prediction: Prediction }) {
  const items = [
    { label: "胜平负", value: review.hit_result ? "命中" : "未命中" },
    { label: "进球数区间", value: review.hit_goals_range ? "命中" : "未命中" },
    { label: "比分准确度", value: review.hit_score_accuracy }
  ];

  return (
    <div className="card">
      <h3 className="mb-4 font-display text-xl font-bold">预测结果 vs 实际结果</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="soft-card">
            <span className="label-caps">{item.label}</span>
            <div className="mt-2 text-lg font-bold text-primary">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="soft-card">
          <span className="label-caps">模型预测</span>
          <p className="mt-2 text-sm text-text-muted">主胜 {prediction.win_prob_home}% / 平 {prediction.draw_prob}% / 客胜 {prediction.win_prob_away}%；进球区间 {prediction.goals_range}</p>
        </div>
        <div className="soft-card">
          <span className="label-caps">实际比分</span>
          <p className="mt-2 font-mono text-2xl font-bold">{review.actual_score_home} - {review.actual_score_away}</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-text-muted">{review.error_analysis}</p>
      <p className="mt-2 text-sm leading-6 text-text-muted">{review.adjustment_suggestion}</p>
    </div>
  );
}
