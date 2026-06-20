import type { Prediction } from "@/types/prediction";

const styles: Record<Prediction["risk_level"], string> = {
  低: "bg-primary/10 text-primary",
  中低: "bg-emerald-50 text-success",
  中: "bg-surface-mid text-secondary",
  中高: "bg-amber-50 text-warning",
  高: "bg-red-50 text-danger"
};

export function RiskBadge({ level }: { level: Prediction["risk_level"] }) {
  return <span className={`rounded-lg px-3 py-1 text-sm font-semibold ${styles[level]}`}>{level}</span>;
}
