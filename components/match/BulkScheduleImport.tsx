"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { ScheduleImportItem } from "@/lib/repositories";

const sample = `[
  {
    "match_date": "2026-06-20",
    "match_time": "20:00",
    "home_team": "德国",
    "away_team": "科特迪瓦",
    "home_flag": "🇩🇪",
    "away_flag": "🇨🇮",
    "group_name": "小组赛",
    "stage": "A组",
    "status": "UPCOMING"
  }
]`;

const requiredFields = ["match_date", "match_time", "home_team", "away_team", "home_flag", "away_flag", "group_name"] as const;

function isValidItem(item: unknown): item is ScheduleImportItem {
  if (!item || typeof item !== "object") return false;
  const record = item as Record<string, unknown>;
  return requiredFields.every((field) => typeof record[field] === "string" && String(record[field]).trim().length > 0);
}

export function BulkScheduleImport() {
  const router = useRouter();
  const [raw, setRaw] = useState(sample);
  const [preview, setPreview] = useState<ScheduleImportItem[]>([]);
  const [message, setMessage] = useState("");
  const [importedDate, setImportedDate] = useState("");
  const [loading, setLoading] = useState(false);

  function parsePreview() {
    setMessage("");
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setPreview([]);
        setMessage("请粘贴 JSON 数组。");
        return;
      }

      const valid = parsed.filter(isValidItem);
      setPreview(valid);
      setMessage(valid.length === parsed.length ? `已解析 ${valid.length} 场比赛。` : `已解析 ${valid.length} 场，有 ${parsed.length - valid.length} 条缺少必要字段。`);
    } catch {
      setPreview([]);
      setMessage("JSON 格式无法解析，请检查逗号、引号和数组结构。");
    }
  }

  async function confirmImport() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/matches/bulk-import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: preview })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "导入失败");

      setImportedDate(preview[0]?.match_date ?? "");
      setMessage(`导入完成：新增 ${body.inserted} 场，跳过重复 ${body.skipped} 场。可前往对应日期查看比赛。`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card space-y-5">
      <div>
        <span className="text-sm font-semibold text-primary">批量导入赛程</span>
        <h2 className="mt-2 font-display text-2xl font-bold">粘贴世界杯赛程 JSON</h2>
        <p className="mt-2 text-sm text-secondary">导入时按主队、客队、比赛时间去重，确认预览后才写入 matches 表。</p>
      </div>
      <textarea className="input min-h-56 font-mono text-xs" value={raw} onChange={(event) => setRaw(event.target.value)} />
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={parsePreview}>解析预览</button>
        <button type="button" className="btn-primary" disabled={!preview.length || loading} onClick={confirmImport}>{loading ? "导入中..." : "确认导入"}</button>
      </div>
      {message ? (
        <div className="rounded-xl bg-primary/10 p-4 text-sm text-primary">
          <div>{message}</div>
          {importedDate ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <Link className="font-semibold underline" href={`/daily-input?date=${importedDate}`}>查看赔率录入页</Link>
              <Link className="font-semibold underline" href={`/?date=${importedDate}`}>查看首页看板</Link>
            </div>
          ) : null}
        </div>
      ) : null}
      {preview.length ? (
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-low text-secondary">
              <tr>
                <th className="px-4 py-3">日期</th>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">主队</th>
                <th className="px-4 py-3">客队</th>
                <th className="px-4 py-3">小组/阶段</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((item, index) => (
                <tr key={`${item.home_team}-${item.away_team}-${item.match_time}-${index}`} className="border-t border-outline-variant">
                  <td className="px-4 py-3 font-mono">{item.match_date}</td>
                  <td className="px-4 py-3 font-mono">{item.match_time}</td>
                  <td className="px-4 py-3">{item.home_flag} {item.home_team}</td>
                  <td className="px-4 py-3">{item.away_flag} {item.away_team}</td>
                  <td className="px-4 py-3">{item.group_name}{item.stage ? ` · ${item.stage}` : ""}</td>
                  <td className="px-4 py-3">{item.status ?? "UPCOMING"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
