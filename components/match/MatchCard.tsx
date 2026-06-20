import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import { ProbabilityPanel } from "./ProbabilityPanel";
import { RiskBadge } from "./RiskBadge";
import { ScorePrediction } from "./ScorePrediction";

const statusMap = {
  UPCOMING: { label: "未开始", cls: "bg-surface-mid text-secondary" },
  LIVE: { label: "进行中", cls: "bg-red-50 text-danger" },
  FINISHED: { label: "已结束", cls: "bg-outline-variant text-text-muted" }
};

export function MatchCard({ match, prediction }: { match: Match; prediction: Prediction }) {
  const status = statusMap[match.status];
  const score = match.score_home === null ? "VS" : `${match.score_home} - ${match.score_away}`;

  return (
    <Link href={`/matches/${match.id}`} className="group block">
      <article className="card grid gap-6 transition group-hover:border-primary lg:grid-cols-[1.05fr_1.4fr_.9fr]">
        <div className="border-outline-variant lg:border-r lg:pr-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.05em] ${status.cls}`}>{status.label}</span>
            <span className="font-mono text-sm text-secondary">{match.match_time.slice(11)} K.O.</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Team flag={match.home_flag} name={match.home_team} />
            <span className="font-display text-2xl font-extrabold">{score}</span>
            <Team flag={match.away_flag} name={match.away_team} />
          </div>
        </div>

        <div className="space-y-4 border-outline-variant lg:border-r lg:px-6">
          <ProbabilityPanel prediction={prediction} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="soft-card">
              <span className="label-caps mb-2 block">预测比分 Top 3</span>
              <ScorePrediction prediction={prediction} compact />
            </div>
            <div className="soft-card text-center">
              <span className="label-caps block">进球数区间</span>
              <div className="mt-1 font-display text-2xl font-bold text-primary">{prediction.goals_range}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 lg:pl-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">风险等级</span>
              <RiskBadge level={prediction.risk_level} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">AI 分析状态</span>
              <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <CheckCircle2 size={15} />
                {match.ai_status}
              </span>
            </div>
          </div>
          <span className="btn-primary w-full">
            查看分析
            <ArrowRight size={16} />
          </span>
        </div>
      </article>
    </Link>
  );
}

function Team({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-low text-3xl">{flag}</div>
      <span className="font-display text-lg font-bold">{name}</span>
    </div>
  );
}
