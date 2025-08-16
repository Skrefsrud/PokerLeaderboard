import type { LedgerRow, ScoreRow, SessionSummary } from "./types";
import { listCsvFiles, readLedgerCsv } from "./csv";
import { loadAliasIndex, resolveName } from "./alias";
import { basename } from "node:path";

export function loadAllRows() {
  const files = listCsvFiles();
  const idx = loadAliasIndex();
  const unknown: Record<string, number> = {};

  const allSessions = files.flatMap((file) => {
    const rows = readLedgerCsv(file);
    const playerSessions = new Map<string, LedgerRow>();

    for (const r of rows) {
      const res = resolveName(r.player_nickname, idx);
      const canonicalName = res.known ? res.canonical : "Unknown";

      if (!res.known) {
        unknown[res.normalized] = (unknown[res.normalized] ?? 0) + 1;
      }

      const existing = playerSessions.get(canonicalName);
      if (existing) {
        existing.net += r.net ?? 0;
        // Also update buy_in and buy_out for completeness
        if (r.buy_in) existing.buy_in += r.buy_in;
        if (r.buy_out) existing.buy_out += r.buy_out;
        // Update session start/end times
        if (r.session_start_at && (!existing.session_start_at || r.session_start_at < existing.session_start_at)) {
          existing.session_start_at = r.session_start_at;
        }
        if (r.session_end_at && (!existing.session_end_at || r.session_end_at > existing.session_end_at)) {
          existing.session_end_at = r.session_end_at;
        }
      } else {
        playerSessions.set(canonicalName, {
          ...r,
          player_nickname: canonicalName,
        });
      }
    }
    return Array.from(playerSessions.values());
  });

  return { rows: allSessions, files, unknown };
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

export function findExtremes(rows: LedgerRow[]): { greatestWin: LedgerRow, greatestLoss: LedgerRow } {
  let greatestWin: LedgerRow = { player_nickname: '', net: 0 };
  let greatestLoss: LedgerRow = { player_nickname: '', net: 0 };

  for (const row of rows) {
    if (row.net > greatestWin.net) {
      greatestWin = row;
    }
    if (row.net < greatestLoss.net) {
      greatestLoss = row;
    }
  }

  return { greatestWin, greatestLoss };
}
