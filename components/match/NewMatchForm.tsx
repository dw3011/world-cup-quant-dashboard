"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import type { MatchInput } from "@/lib/repositories";
import type { MatchStatus } from "@/types/match";

const baseFields = [
  { label: "比赛日期", name: "match_date", type: "date" },
  { label: "比赛时间", name: "match_clock", type: "time" },
  { label: "小组", name: "group_name", type: "text" },
  { label: "主队", name: "home_team", type: "text" },
  { label: "主队国旗", name: "home_flag", type: "text" },
  { label: "客队", name: "away_team", type: "text" },
  { label: "客队国旗", name: "away_flag", type: "text" }
];

const scoreFields = [
  { label: "主队当前/最终比分", name: "score_home" },
  { label: "客队当前/最终比分", name: "score_away" }
];

const oddsFields = [
  { label: "主胜赔率", name: "home_win_odds" },
  { label: "平局赔率", name: "draw_odds" },
  { label: "客胜赔率", name: "away_win_odds" },
  { label: "大小球大（可选）", name: "over_2_5_odds" },
  { label: "大小球小（可选）", name: "under_2_5_odds" },
  { label: "让球盘口（可选）", name: "handicap", type: "text" }
];

const ratingFields = [
  { label: "主队硬实力评分 1-10", name: "home_strength_rating" },
  { label: "客队硬实力评分 1-10", name: "away_strength_rating" },
  { label: "主队近期状态评分 1-10", name: "home_form_rating" },
  { label: "客队近期状态评分 1-10", name: "away_form_rating" },
  { label: "主队攻防倾向评分 1-10", name: "home_attack_defense_rating" },
  { label: "客队攻防倾向评分 1-10", name: "away_attack_defense_rating" }
];

const remarkFields = [
  { label: "伤停信息", name: "injury_info" },
  { label: "战意与小组形势", name: "motivation_info" },
  { label: "阵容轮换", name: "lineup_info" },
  { label: "市场 / 盘口备注", name: "market_note" },
  { label: "人工备注", name: "manual_note" }
];

function text(formData: FormData, name: string, fallback = "") {
  return String(formData.get(name) || fallback);
}

function number(formData: FormData, name: string, fallback = 0) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function optionalNumber(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function NewMatchForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function createFromForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const date = text(formData, "match_date", new Date().toISOString().slice(0, 10));
    const clock = text(formData, "match_clock", "20:00");
    const rawStatus = text(formData, "status", "未开始");
    const statusText = rawStatus === "进行中" ? "LIVE" : rawStatus === "已结束" ? "FINISHED" : rawStatus.toUpperCase();
    const status = (["UPCOMING", "LIVE", "FINISHED"].includes(statusText) ? statusText : "UPCOMING") as MatchStatus;

    const payload: MatchInput = {
      home_team: text(formData, "home_team", "主队"),
      home_flag: text(formData, "home_flag", "🏳️"),
      away_team: text(formData, "away_team", "客队"),
      away_flag: text(formData, "away_flag", "🏳️"),
      group_name: text(formData, "group_name", "小组赛"),
      match_date: date,
      match_time: `${date}T${clock}:00+08:00`,
      stage: "",
      status,
      score_home: status === "UPCOMING" ? null : number(formData, "score_home", 0),
      score_away: status === "UPCOMING" ? null : number(formData, "score_away", 0),
      venue: text(formData, "venue", "未录入"),
      ai_status: "待生成",
      odds: {
        home_win_odds: number(formData, "home_win_odds", 2),
        draw_odds: number(formData, "draw_odds", 3.2),
        away_win_odds: number(formData, "away_win_odds", 3),
        over_2_5_odds: optionalNumber(formData, "over_2_5_odds"),
        under_2_5_odds: optionalNumber(formData, "under_2_5_odds"),
        handicap: text(formData, "handicap")
      },
      manual: {
        home_strength_rating: number(formData, "home_strength_rating", 6),
        away_strength_rating: number(formData, "away_strength_rating", 6),
        home_form_rating: number(formData, "home_form_rating", 6),
        away_form_rating: number(formData, "away_form_rating", 6),
        home_attack_defense_rating: number(formData, "home_attack_defense_rating", 6),
        away_attack_defense_rating: number(formData, "away_attack_defense_rating", 6),
        injury_info: text(formData, "injury_info", "暂无明确伤停。"),
        motivation_info: text(formData, "motivation_info", "双方战意正常。"),
        lineup_info: text(formData, "lineup_info", "首发阵容待确认。"),
        market_note: text(formData, "market_note", "盘口暂无异常。"),
        manual_note: text(formData, "manual_note", "人工备注待补充。")
      }
    };

    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).error || "保存失败");
    return response.json() as Promise<{ id: string }>;
  }

  async function handleAction(form: HTMLFormElement, action: "save" | "predict" | "ai") {
    setSaving(true);
    setMessage("");
    try {
      const match = await createFromForm(form);
      if (action === "predict" || action === "ai") {
        await fetch("/api/predict", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ match_id: match.id })
        });
      }
      if (action === "ai") {
        await fetch("/api/ai-report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ match_id: match.id })
        });
      }
      router.push(`/matches/${match.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-6">
      <Section title="A. 比赛基础信息">
        {baseFields.map((field) => <Field key={field.name} {...field} />)}
        <label className="space-y-2">
          <span className="label-caps">比赛状态</span>
          <select className="input" name="status" defaultValue="未开始">
            <option value="未开始">未开始</option>
            <option value="进行中">进行中</option>
            <option value="已结束">已结束</option>
          </select>
        </label>
        {scoreFields.map((field) => <Field key={field.name} {...field} type="number" min={0} />)}
      </Section>
      <Section title="B. 赔率信息">
        {oddsFields.map((field) => <Field key={field.name} {...field} type={field.type ?? "number"} />)}
      </Section>
      <Section title="C. 球队评分">
        {ratingFields.map((field) => <Field key={field.name} {...field} type="number" min={1} max={10} />)}
      </Section>
      <section className="card">
        <h2 className="mb-4 font-display text-xl font-bold">D. 伤停/战意/盘口备注</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {remarkFields.map((field) => (
            <label key={field.name} className="space-y-2 md:last:col-span-2">
              <span className="label-caps">{field.label}</span>
              <textarea className="input min-h-28" name={field.name} placeholder={`请输入${field.label}`} />
            </label>
          ))}
        </div>
      </section>
      {message ? <div className="rounded-xl bg-red-50 p-4 text-sm text-danger">{message}</div> : null}
      <section className="card">
        <h2 className="mb-4 font-display text-xl font-bold">E. 操作按钮</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={saving} className="btn-secondary" onClick={(event) => handleAction(event.currentTarget.form!, "save")}>保存比赛</button>
          <button type="button" disabled={saving} className="btn-secondary" onClick={(event) => handleAction(event.currentTarget.form!, "predict")}>保存并运行模型</button>
          <button type="button" disabled={saving} className="btn-primary" onClick={(event) => handleAction(event.currentTarget.form!, "ai")}>保存并生成 AI 分析</button>
        </div>
      </section>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function Field({ label, name, type = "text", min, max }: { label: string; name: string; type?: string; min?: number; max?: number }) {
  return (
    <label className="space-y-2">
      <span className="label-caps">{label}</span>
      <input className="input" name={name} type={type} placeholder={label} min={min} max={max} />
    </label>
  );
}
