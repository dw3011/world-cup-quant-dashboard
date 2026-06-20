import type { Prediction } from "@/types/prediction";

export function ScorePrediction({ prediction, compact = false }: { prediction: Prediction; compact?: boolean }) {
  if (compact) {
    return (
      <div className="font-mono text-sm">
        {prediction.predicted_scores.map((item, index) => (
          <span key={item.score} className={index === 0 ? "font-bold text-primary" : "text-secondary"}>
            {item.score} {item.probability}%{index < prediction.predicted_scores.length - 1 ? "｜" : ""}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {prediction.predicted_scores.map((item, index) => (
        <div key={item.score} className="flex items-center justify-between rounded-lg border-l-4 border-primary bg-surface-low px-3 py-2">
          <span className="font-mono text-lg font-bold text-primary">{item.score}</span>
          <span className={index === 0 ? "font-mono text-sm font-bold text-primary" : "font-mono text-sm text-secondary"}>{item.probability}%</span>
        </div>
      ))}
    </div>
  );
}
