import type { Match } from "@/types/match";

const statusLabel = {
  UPCOMING: "未开始",
  LIVE: "进行中",
  FINISHED: "已结束"
};

export function MatchHeader({ match }: { match: Match }) {
  const score = match.score_home === null ? "VS" : `${match.score_home} : ${match.score_away}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-outline-variant bg-[#2e3039] text-white shadow-card">
      <div className="bg-primary/15 px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="rounded-full bg-primary/25 px-3 py-1 font-semibold">{match.group_name}</span>
          <span className="text-white/75">{match.venue}</span>
          <span className="text-white/75">{match.match_time}</span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-8 sm:px-10">
        <Team flag={match.home_flag} name={match.home_team} />
        <div className="text-center">
          <div className="font-display text-3xl font-extrabold sm:text-5xl">{score}</div>
          <div className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100">{statusLabel[match.status]}</div>
        </div>
        <Team flag={match.away_flag} name={match.away_team} />
      </div>
    </section>
  );
}

function Team({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-4xl shadow-inner sm:h-24 sm:w-24">{flag}</div>
      <h2 className="break-all text-center font-display text-xl font-bold sm:text-3xl">{name}</h2>
    </div>
  );
}
