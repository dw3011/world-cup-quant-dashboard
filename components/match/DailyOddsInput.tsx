"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Match, OddsSnapshot, ParsedOddsText } from "@/types/match";

type StatusMap = Record<string, { hasOdds: boolean; hasPrediction: boolean; hasReport: boolean; hasReview: boolean; latestOdds?: OddsSnapshot }>;
type LoadingState = "parse" | "parsed" | "batch" | string | null;

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return raw === null ? "" : String(raw);
}

function numberValue(formData: FormData, key: string) {
  const num = Number(formData.get(key));
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

export function DailyOddsInput({ date, matches, statusMap }: { date: string; matches: Match[]; statusMap: StatusMap }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedOddsText | null>(null);
  const [loading, setLoading] = useState<LoadingState>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const progress = useMemo(() => {
    const values = matches.map((match) => statusMap[match.id]);
    return {
      total: matches.length,
      odds: values.filter((status) => status?.hasOdds).length,
      reports: values.filter((status) => status?.hasReport).length,
      pendingReview: matches.filter((match) => match.status === "FINISHED" && !statusMap[match.id]?.hasReview).length
    };
  }, [matches, statusMap]);
  const matchedForParsed = useMemo(() => {
    if (!parsed) return null;
    return matches.find((match) => match.home_team.includes(parsed.home_team) || match.away_team.includes(parsed.away_team) || parsed.home_team.includes(match.home_team) || parsed.away_team.includes(match.away_team)) ?? null;
  }, [matches, parsed]);

  async function saveOdds(form: HTMLFormElement, matchId: string) {
    const formData = new FormData(form);
    const response = await fetch("/api/odds-snapshots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        match_id: matchId,
        source: "体彩",
        win_odds: numberValue(formData, "win_odds"),
        draw_odds: numberValue(formData, "draw_odds"),
        loss_odds: numberValue(formData, "loss_odds"),
        handicap_line: value(formData, "handicap_line"),
        handicap_win_odds: numberValue(formData, "handicap_win_odds"),
        handicap_draw_odds: numberValue(formData, "handicap_draw_odds"),
        handicap_loss_odds: numberValue(formData, "handicap_loss_odds"),
        raw_text: value(formData, "raw_text")
      })
    });
    if (!response.ok) throw new Error((await response.json()).error || "赔率保存失败");
  }

  async function runAnalysis(matchId: string) {
    const predict = await fetch("/api/predict", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ match_id: matchId })
    });
    if (!predict.ok) throw new Error((await predict.json()).error || "模型运行失败");

    const report = await fetch("/api/ai-report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ match_id: matchId })
    });
    if (!report.ok) throw new Error((await report.json()).error || "AI 分析生成失败");
  }

  async function handleSubmit(form: HTMLFormElement, matchId: string, withAnalysis: boolean) {
    setLoading(matchId);
    setMessage("");
    try {
      await saveOdds(form, matchId);
      if (withAnalysis) await runAnalysis(matchId);
      router.refresh();
      setMessage(withAnalysis ? "赔率已保存，分析已生成。" : "赔率已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(null);
    }
  }

  async function analyzeOnly(matchId: string, doneMessage = "分析已生成。") {
    setLoading(matchId);
    setMessage("");
    try {
      await runAnalysis(matchId);
      router.refresh();
      setMessage(doneMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(null);
    }
  }

  async function parseText() {
    setLoading("parse");
    setMessage("");
    const response = await fetch("/api/odds-parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ raw_text: rawText })
    });
    setLoading(null);
    if (!response.ok) {
      setMessage((await response.json()).error || "解析失败");
      return;
    }
    setParsed(await response.json());
  }

  async function saveParsed(withAnalysis: boolean) {
    if (!parsed || !matchedForParsed) return;
    setLoading("parsed");
    setMessage("");
    try {
      const response = await fetch("/api/odds-snapshots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          match_id: matchedForParsed.id,
          source: "体彩",
          win_odds: parsed.win_odds,
          draw_odds: parsed.draw_odds,
          loss_odds: parsed.loss_odds,
          handicap_line: parsed.handicap_line,
          handicap_win_odds: parsed.handicap_win_odds,
          handicap_draw_odds: parsed.handicap_draw_odds,
          handicap_loss_odds: parsed.handicap_loss_odds,
          raw_text: rawText
        })
      });
      if (!response.ok) throw new Error((await response.json()).error || "保存失败");
      if (withAnalysis) await runAnalysis(matchedForParsed.id);
      setParsed(null);
      setRawText("");
      router.refresh();
      setMessage("解析结果已确认保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(null);
    }
  }

  async function batchGenerate() {
    setLoading("batch");
    setMessage("");
    try {
      const readyMatches = matches.filter((match) => {
        const status = statusMap[match.id];
        return status?.hasOdds && (!status.hasPrediction || !status.hasReport);
      });
      for (const match of readyMatches) {
        await runAnalysis(match.id);
      }
      router.refresh();
      setMessage(`批量生成完成：处理 ${readyMatches.length} 场，已存在完整分析的比赛已跳过。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "批量生成失败");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard label="今日比赛数" value={progress.total} hint="matches 表赛程" />
        <ProgressCard label="已录入赔率数" value={progress.odds} hint="latest odds_snapshot" />
        <ProgressCard label="已生成分析数" value={progress.reports} hint="AI 分析报告" />
        <ProgressCard label="待复盘数" value={progress.pendingReview} hint="已结束未复盘" />
      </section>

      <section className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">粘贴赔率文本</h2>
            <p className="mt-1 text-sm text-secondary">解析结果会先展示确认，不会自动入库。</p>
          </div>
          <button className="btn-secondary" type="button" onClick={parseText} disabled={loading === "parse"}>{loading === "parse" ? "解析中..." : "解析赔率文本"}</button>
        </div>
        <textarea className="input min-h-24" value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="德国 vs 科特迪瓦 主胜1.38 平4.65 客胜6.20 让-1 让胜2.12 让平3.45 让负2.78" />
        {parsed ? (
          <div className="mt-4 rounded-xl border border-outline-variant bg-surface-low p-4">
            <div className="mb-3 text-sm text-secondary">解析结果：{parsed.home_team || "-"} vs {parsed.away_team || "-"}；匹配比赛：{matchedForParsed ? `${matchedForParsed.home_team} vs ${matchedForParsed.away_team}` : "未匹配"}</div>
            <div className="grid gap-3 text-sm md:grid-cols-4">
              <span>主胜 {parsed.win_odds ?? "-"}</span>
              <span>平 {parsed.draw_odds ?? "-"}</span>
              <span>客胜 {parsed.loss_odds ?? "-"}</span>
              <span>让球 {parsed.handicap_line || "-"}</span>
              <span>让胜 {parsed.handicap_win_odds ?? "-"}</span>
              <span>让平 {parsed.handicap_draw_odds ?? "-"}</span>
              <span>让负 {parsed.handicap_loss_odds ?? "-"}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary" disabled={!matchedForParsed || loading === "parsed"} onClick={() => saveParsed(false)}>确认保存赔率</button>
              <button className="btn-primary" disabled={!matchedForParsed || loading === "parsed"} onClick={() => saveParsed(true)}>确认并生成分析</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{date} 比赛赔率录入</h2>
          <p className="text-sm text-secondary">只录入体彩赔率和补充信息，赛程基础信息来自 matches 表。</p>
        </div>
        <button className="btn-primary" type="button" onClick={batchGenerate} disabled={loading === "batch"}>{loading === "batch" ? "批量生成中..." : "批量生成今日分析"}</button>
      </section>

      {message ? <div className="rounded-xl bg-primary/10 p-4 text-sm text-primary">{message}</div> : null}

      <div className="space-y-4">
        {matches.map((match) => {
          const status = statusMap[match.id];
          const latest = status?.latestOdds;
          const isExpanded = expanded[match.id] ?? !status?.hasOdds;
          const primary = getPrimaryAction(match, status);
          return (
            <form key={match.id} className="card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-display text-xl font-bold">{match.home_flag} {match.home_team} vs {match.away_team} {match.away_flag}</div>
                  <div className="mt-1 text-sm text-secondary">{match.match_time.slice(11, 16)} · {match.group_name}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusTag active={!status?.hasOdds} label="未录入赔率" tone="muted" />
                  <StatusTag active={Boolean(status?.hasOdds)} label="已录入赔率" tone="blue" />
                  <StatusTag active={Boolean(status?.hasReport)} label="已生成分析" tone="blue" />
                  <StatusTag active={Boolean(status?.hasReview)} label="已复盘" tone="green" />
                </div>
              </div>

              {latest ? <OddsSummary latest={latest} /> : null}

              {isExpanded ? (
                <>
                  <div className="grid gap-3 md:grid-cols-4">
                    <Field name="win_odds" label="主胜赔率" defaultValue={latest?.win_odds} />
                    <Field name="draw_odds" label="平局赔率" defaultValue={latest?.draw_odds} />
                    <Field name="loss_odds" label="客胜赔率" defaultValue={latest?.loss_odds} />
                    <Field name="handicap_line" label="让球数" type="text" defaultValue={latest?.handicap_line} />
                    <Field name="handicap_win_odds" label="让胜赔率" defaultValue={latest?.handicap_win_odds} />
                    <Field name="handicap_draw_odds" label="让平赔率" defaultValue={latest?.handicap_draw_odds} />
                    <Field name="handicap_loss_odds" label="让负赔率" defaultValue={latest?.handicap_loss_odds} />
                  </div>
                  <textarea className="input min-h-20" name="raw_text" defaultValue={latest?.raw_text} placeholder="补充信息，可填写盘口变化、伤停、战意、人工备注..." />
                </>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {primary.kind === "save-analyze" ? (
                  <button type="button" className="btn-primary" disabled={loading === match.id} onClick={(event) => handleSubmit(event.currentTarget.form!, match.id, true)}>
                    保存赔率并生成分析
                  </button>
                ) : null}
                {primary.kind === "analyze" ? (
                  <button type="button" className="btn-primary" disabled={loading === match.id} onClick={() => analyzeOnly(match.id)}>
                    生成分析
                  </button>
                ) : null}
                {primary.kind === "view" ? (
                  <a className="btn-primary" href={`/matches/${match.id}`}>查看分析</a>
                ) : null}
                {primary.kind === "review" ? (
                  <a className="btn-primary" href={`/matches/${match.id}/review`}>填写复盘</a>
                ) : null}
                {latest ? (
                  <button type="button" className="btn-secondary" onClick={() => setExpanded((current) => ({ ...current, [match.id]: !isExpanded }))}>
                    {isExpanded ? "收起赔率" : "修改赔率"}
                  </button>
                ) : null}
                {isExpanded ? (
                  <button type="button" className="btn-secondary" disabled={loading === match.id} onClick={(event) => handleSubmit(event.currentTarget.form!, match.id, false)}>
                    保存赔率
                  </button>
                ) : null}
                {status?.hasReport ? (
                  <button type="button" className="btn-secondary" disabled={loading === match.id} onClick={() => analyzeOnly(match.id, "分析已重新生成。")}>
                    重新生成
                  </button>
                ) : null}
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}

function getPrimaryAction(match: Match, status: StatusMap[string] | undefined) {
  if (match.status === "FINISHED" && !status?.hasReview) return { kind: "review" as const };
  if (!status?.hasOdds) return { kind: "save-analyze" as const };
  if (!status.hasPrediction || !status.hasReport) return { kind: "analyze" as const };
  return { kind: "view" as const };
}

function ProgressCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="card">
      <span className="text-sm text-secondary">{label}</span>
      <div className="mt-2 font-display text-4xl font-bold">{value}</div>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}

function StatusTag({ active, label, tone }: { active: boolean; label: string; tone: "blue" | "green" | "muted" }) {
  if (!active) return null;
  const cls = tone === "blue" ? "bg-primary/10 text-primary" : tone === "green" ? "bg-emerald-50 text-success" : "bg-surface-mid text-secondary";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

function OddsSummary({ latest }: { latest: OddsSnapshot }) {
  return (
    <div className="grid gap-3 rounded-xl border border-outline-variant bg-surface-low p-4 text-sm md:grid-cols-4">
      <span>主胜 / 平 / 客胜：<strong className="font-mono text-primary">{latest.win_odds} / {latest.draw_odds} / {latest.loss_odds}</strong></span>
      <span>让球数：<strong className="font-mono">{latest.handicap_line || "-"}</strong></span>
      <span>让胜 / 让平 / 让负：<strong className="font-mono">{latest.handicap_win_odds ?? "-"} / {latest.handicap_draw_odds ?? "-"} / {latest.handicap_loss_odds ?? "-"}</strong></span>
      <span>来源：{latest.source}</span>
    </div>
  );
}

function Field({ name, label, type = "number", defaultValue }: { name: string; label: string; type?: string; defaultValue?: string | number }) {
  return (
    <label className="space-y-2">
      <span className="label-caps">{label}</span>
      <input className="input" name={name} type={type} step={type === "number" ? "0.01" : undefined} defaultValue={defaultValue ?? ""} placeholder={label} />
    </label>
  );
}
