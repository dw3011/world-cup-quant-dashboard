import "server-only";
import { getOpenAIClient } from "@/lib/ai/client";
import type { ParsedOddsText } from "@/types/match";

function emptyParsed(): ParsedOddsText {
  return {
    home_team: "",
    away_team: "",
    win_odds: null,
    draw_odds: null,
    loss_odds: null,
    handicap_line: "",
    handicap_win_odds: null,
    handicap_draw_odds: null,
    handicap_loss_odds: null
  };
}

function numberAfter(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function fallbackParse(text: string): ParsedOddsText {
  const parsed = emptyParsed();
  const teams = text.match(/(.+?)\s*(?:vs|VS|对阵|v)\s*(.+?)\s+(?:主胜|胜)/);
  parsed.home_team = teams?.[1]?.trim() ?? "";
  parsed.away_team = teams?.[2]?.trim() ?? "";
  parsed.win_odds = numberAfter(text, /主胜\s*([0-9]+(?:\.[0-9]+)?)/);
  parsed.draw_odds = numberAfter(text, /(?:平|平局)\s*([0-9]+(?:\.[0-9]+)?)/);
  parsed.loss_odds = numberAfter(text, /(?:客胜|客|负)\s*([0-9]+(?:\.[0-9]+)?)/);
  parsed.handicap_line = text.match(/让\s*([+-]?\d+(?:\.\d+)?)/)?.[1] ?? "";
  parsed.handicap_win_odds = numberAfter(text, /让胜\s*([0-9]+(?:\.[0-9]+)?)/);
  parsed.handicap_draw_odds = numberAfter(text, /让平\s*([0-9]+(?:\.[0-9]+)?)/);
  parsed.handicap_loss_odds = numberAfter(text, /让负\s*([0-9]+(?:\.[0-9]+)?)/);
  return parsed;
}

function normalize(text: string, fallback: ParsedOddsText): ParsedOddsText {
  try {
    const parsed = JSON.parse(text) as Partial<ParsedOddsText>;
    return {
      home_team: String(parsed.home_team ?? fallback.home_team ?? ""),
      away_team: String(parsed.away_team ?? fallback.away_team ?? ""),
      win_odds: parsed.win_odds === null || parsed.win_odds === undefined ? fallback.win_odds : Number(parsed.win_odds),
      draw_odds: parsed.draw_odds === null || parsed.draw_odds === undefined ? fallback.draw_odds : Number(parsed.draw_odds),
      loss_odds: parsed.loss_odds === null || parsed.loss_odds === undefined ? fallback.loss_odds : Number(parsed.loss_odds),
      handicap_line: String(parsed.handicap_line ?? fallback.handicap_line ?? ""),
      handicap_win_odds: parsed.handicap_win_odds === null || parsed.handicap_win_odds === undefined ? fallback.handicap_win_odds : Number(parsed.handicap_win_odds),
      handicap_draw_odds: parsed.handicap_draw_odds === null || parsed.handicap_draw_odds === undefined ? fallback.handicap_draw_odds : Number(parsed.handicap_draw_odds),
      handicap_loss_odds: parsed.handicap_loss_odds === null || parsed.handicap_loss_odds === undefined ? fallback.handicap_loss_odds : Number(parsed.handicap_loss_odds)
    };
  } catch {
    return fallback;
  }
}

export async function parseOddsText(rawText: string): Promise<ParsedOddsText> {
  const fallback = fallbackParse(rawText);
  const client = getOpenAIClient();
  if (!client) return fallback;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0,
    input: [
      "请从中文竞彩/体彩赔率文本中抽取结构化 JSON。",
      "只返回 JSON，不要 Markdown。",
      "字段：home_team, away_team, win_odds, draw_odds, loss_odds, handicap_line, handicap_win_odds, handicap_draw_odds, handicap_loss_odds。",
      "无法确定的数字字段返回 null，文本字段返回空字符串。",
      rawText
    ].join("\n")
  });

  return normalize(response.output_text, fallback);
}
