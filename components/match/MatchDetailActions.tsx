"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MatchDetailActions({
  matchId,
  showPredict,
  showAIReport,
  showReview
}: {
  matchId: string;
  showPredict: boolean;
  showAIReport: boolean;
  showReview: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"predict" | "ai" | null>(null);
  const [message, setMessage] = useState("");

  async function run(endpoint: "/api/predict" | "/api/ai-report", type: "predict" | "ai") {
    setLoading(type);
    setMessage("");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ match_id: matchId })
    });
    setLoading(null);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setMessage(body.error || "操作失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  if (!showPredict && !showAIReport && !showReview) return null;

  return (
    <div className="card flex flex-wrap items-center gap-3">
      {showPredict ? (
        <button className="btn-secondary" disabled={loading !== null} onClick={() => run("/api/predict", "predict")}>
          {loading === "predict" ? "模型运行中..." : "运行规则模型"}
        </button>
      ) : null}
      {showAIReport ? (
        <button className="btn-primary" disabled={loading !== null} onClick={() => run("/api/ai-report", "ai")}>
          {loading === "ai" ? "AI 生成中..." : "生成 AI 分析"}
        </button>
      ) : null}
      {showReview ? (
        <Link href={`/matches/${matchId}/review`} className="btn-secondary">
          填写赛后复盘
        </Link>
      ) : null}
      {message ? <span className="text-sm text-danger">{message}</span> : null}
    </div>
  );
}
