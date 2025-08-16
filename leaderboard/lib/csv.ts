import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { LedgerRow } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

export function listCsvFiles(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.toLowerCase().endsWith(".csv"))
    .map((f) => path.join(DATA_DIR, f));
}

export function readLedgerCsv(filePath: string): LedgerRow[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  // Normalize & coerce types
  return records.map((r) => ({
    player_nickname: r.player_nickname ?? r.player ?? r.name ?? "Unknown",
    player_id: r.player_id ?? null,
    session_start_at: r.session_start_at ?? null,
    session_end_at: r.session_end_at ?? null,
    buy_in: toNum(r.buy_in),
    buy_out: toNum(r.buy_out),
    stack: toNum(r.stack),
    net: toNum(r.net) ?? 0,
  }));
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s/g, "");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
