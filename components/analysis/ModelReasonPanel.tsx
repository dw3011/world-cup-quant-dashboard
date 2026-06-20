import type { Prediction } from "@/types/prediction";
import { MODEL_WEIGHTS } from "@/lib/models/rating";

export function ModelReasonPanel({ prediction }: { prediction: Prediction }) {
  return (
    <div className="card">
      <h3 className="mb-4 font-display text-xl font-bold">规则模型权重与理由</h3>
      <div className="space-y-3">
        {MODEL_WEIGHTS.map((item) => (
          <div key={item.key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-text-muted">{item.label}</span>
              <span className="font-mono font-bold">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-mid">
              <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-xl bg-primary/5 p-4 text-sm leading-6 text-text-muted">{prediction.model_reason}</p>
    </div>
  );
}
