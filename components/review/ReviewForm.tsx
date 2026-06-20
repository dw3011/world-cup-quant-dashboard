"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Match } from "@/types/match";

export function ReviewForm({ match }: { match: Match }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        match_id: match.id,
        actual_score_home: Number(formData.get("actual_score_home")),
        actual_score_away: Number(formData.get("actual_score_away")),
        error_analysis: formData.get("error_analysis"),
        adjustment_suggestion: formData.get("adjustment_suggestion")
      })
    });

    setSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setMessage(body.error || "提交失败");
      return;
    }

    router.refresh();
    setMessage("复盘结果已保存");
  }

  return (
    <form className="card space-y-5" onSubmit={handleSubmit}>
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
        <textarea name="error_analysis" className="input min-h-28" defaultValue="模型方向判断正确，但对下半场节奏变化估计偏保守。" />
      </label>
      <label className="space-y-2">
        <span className="label-caps">下次权重调整建议</span>
        <textarea name="adjustment_suggestion" className="input min-h-28" defaultValue="强队边路冲击优势明显时，可略微提高攻防倾向权重。" />
      </label>
      {message ? <div className="rounded-xl bg-primary/10 p-3 text-sm text-primary">{message}</div> : null}
      <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">提交复盘结果</button>
    </form>
  );
}
