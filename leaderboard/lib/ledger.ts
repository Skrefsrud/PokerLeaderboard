import type { LedgerRow, ScoreRow, SessionSummary } from "./types";
import { listCsvFiles, readLedgerCsv } from "./csv";
import { loadAliasIndex, resolveName } from "./alias";
import { basename } from "node:path";

export function loadAllRows() {
  const files = listCsvFiles();
  const rows = files.flatMap((file) => readLedgerCsv(file));

  const idx = loadAliasIndex();
  const unknown: Record<string, number> = {};

  const mapped = rows.map((r) => {
    const res = resolveName(r.player_nickname, idx);
    if (!res.known)
      unknown[res.normalized] = (unknown[res.normalized] ?? 0) + 1;
    return { ...r, player_nickname: res.canonical };
  });

  return { rows: mapped, files, unknown };
}

export function buildScoreboard(rows: LedgerRow[]): ScoreRow[] {
  const map = new Map<string, { total: number; sessions: number }>();
  for (const r of rows) {
    const key = r.player_nickname || "Unknown";
    const cur = map.get(key) ?? { total: 0, sessions: 0 };
    cur.total += r.net ?? 0;
    cur.sessions += 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([player, v]) => ({ player, totalNet: v.total, sessions: v.sessions }))
    .sort((a, b) => b.totalNet - a.totalNet);
}

export function summarizePerFile(files: string[]): SessionSummary[] {
  // unchanged
  const byFile = new Map<string, { rows: number; total: number }>();
  for (const file of files) {
    const single = readLedgerCsv(file);
    const total = single.reduce((acc, r) => acc + (r.net ?? 0), 0);
    byFile.set(basename(file), {
      rows: single.length,
      total,
    });
  }
  return [...byFile.entries()].map(([file, v]) => ({
    file,
    rows: v.rows,
    totalNet: v.total,
  }));
}
