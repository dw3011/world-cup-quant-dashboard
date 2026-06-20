export function StatsCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "primary" }) {
  return (
    <div className={tone === "primary" ? "rounded-2xl border border-primary bg-primary p-6 text-white shadow-card" : "card"}>
      <span className={tone === "primary" ? "label-caps text-blue-100" : "label-caps"}>{label}</span>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      <div className={tone === "primary" ? "mt-4 h-1.5 rounded-full bg-white/25" : "mt-4 h-1.5 rounded-full bg-surface-mid"}>
        <div className={tone === "primary" ? "h-full rounded-full bg-white" : "h-full rounded-full bg-primary"} style={{ width: value.includes("%") ? value : "72%" }} />
      </div>
    </div>
  );
}
