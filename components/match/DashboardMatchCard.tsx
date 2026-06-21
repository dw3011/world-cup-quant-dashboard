import Link from "next/link";
import { ArrowRight, ClipboardEdit } from "lucide-react";
import type { Match } from "@/types/match";

const statusMap = {
  UPCOMING: { label: "未开始", cls: "bg-surface-mid text-secondary" },
  LIVE: { label: "进行中", cls: "bg-red-50 text-danger" },
  FINISHED: { label: "已结束", cls: "bg-outline-variant text-text-muted" }
};

export function DashboardMatchCard({
  match,
  hasOdds,
  hasReport,
  hasReview
}: {
  match: Match;
  hasOdds: boolean;
  hasReport: boolean;
  hasReview: boolean;
}) {
  const status = statusMap[match.status];
  const score = match.score_home === null ? "VS" : `${match.score_home} - ${match.score_away}`;

  return (
    <article className="card grid gap-6 lg:grid-cols-[1.1fr_1fr_.8fr]">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.05em] ${status.cls}`}>{status.label}</span>
          <span className="font-mono text-sm text-secondary">{match.match_time.slice(11, 16)} K.O.</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Team flag={match.home_flag} name={match.home_team} />
          <span className="font-display text-2xl font-extrabold">{score}</span>
          <Team flag={match.away_flag} name={match.away_team} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:border-x lg:border-outline-variant lg:px-6">
        <Status label="赔率" active={hasOdds} activeText="已录入" emptyText="待录入" />
        <Status label="分析" active={hasReport} activeText="已生成" emptyText="待生成" />
        <Status label="复盘" active={hasReview} activeText="已复盘" emptyText="待复盘" />
      </div>
      <div className="flex flex-col justify-center gap-3">
        <Link href={`/daily-input?date=${match.match_time.slice(0, 10)}`} className="btn-secondary w-full">
          <ClipboardEdit size={16} />
          录入赔率
        </Link>
        <Link href={`/matches/${match.id}`} className="btn-primary w-full">
          查看分析
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function Status({ label, active, activeText, emptyText }: { label: string; active: boolean; activeText: string; emptyText: string }) {
  return (
    <div className="soft-card text-center">
      <span className="label-caps">{label}</span>
      <div className={`mt-2 text-sm font-bold ${active ? "text-primary" : "text-secondary"}`}>{active ? activeText : emptyText}</div>
    </div>
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
