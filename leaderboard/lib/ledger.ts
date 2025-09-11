import "server-only"; // Ensure this module runs only on the server

import type {
  PlayerSession,
  PlayerAggregate,
  RollingPoint,
  HeatmapBucket,
  SessionRow,
} from "./types";
import {
  aggregatePlayers,
  buildRollingSeries,
  buyInVsNetPoints,
  heatmapByTimeOfDay,
  heatmapByWeekday,
  profitBySessionLength,
  rowsToPlayerSessions,
} from "./metrics";
import { listCsvFiles, readLedgerCsv } from "./csv";
import { loadAliasIndex } from "./alias";

// --- In-memory cache for the current request lifecycle ---
let sessionCache: PlayerSession[] | null = null;

async function primeCaches(): Promise<void> {
  if (sessionCache) return;

  console.log("--- Prime Caches: START ---");
  const files = listCsvFiles();
  const aliasIndex = loadAliasIndex();

  // 1. Read all raw rows from CSVs
  const allRows: SessionRow[] = files.flatMap((file) => readLedgerCsv(file));

  // 2. Convert raw rows to structured PlayerSessions
  const sessions = rowsToPlayerSessions(allRows, aliasIndex);
  sessions.sort((a, b) => a.start.getTime() - b.start.getTime()); // Sort chronologically
  sessionCache = sessions;

  console.log(`--- Prime Caches: DONE (${sessions.length} sessions) `);
}

export async function getAllPlayerSessions(
  playerId?: string,
  options: { from?: string; to?: string } = {}
): Promise<PlayerSession[]> {
  await primeCaches();
  let sessions = sessionCache!;

  if (playerId) {
    sessions = sessions.filter((s) => s.playerId === playerId);
  }

  const { from, to } = options;

  if (from) {
    sessions = sessions.filter((s) => s.start >= new Date(from));
  }

  if (to) {
    sessions = sessions.filter((s) => s.start <= new Date(to));
  }

  return sessions;
}

export async function getAllAggregates(
  options: { from?: string; to?: string } = {}
): Promise<PlayerAggregate[]> {
  const sessions = await getAllPlayerSessions(undefined, options);
  return aggregatePlayers(sessions);
}

export async function getPlayerAggregate(
  playerId: string,
  options: { from?: string; to?: string } = {}
): Promise<PlayerAggregate | undefined> {
  const sessions = await getAllPlayerSessions(playerId, options);
  if (sessions.length === 0) return undefined;
  const aggregate = aggregatePlayers(sessions);
  return aggregate.find((p) => p.playerId === playerId);
}

export async function getRollingForPlayer(
  playerId: string,
  options: { from?: string; to?: string } = {}
): Promise<RollingPoint[]> {
  const playerSessions = await getAllPlayerSessions(playerId, options);
  return buildRollingSeries(playerSessions);
}

export async function getHeatmap(
  playerId?: string,
  dim: "hour" | "weekday" = "hour",
  options: { from?: string; to?: string } = {}
): Promise<HeatmapBucket[]> {
  const sessions = await getAllPlayerSessions(playerId, options);
  return dim === "hour"
    ? heatmapByTimeOfDay(sessions)
    : heatmapByWeekday(sessions);
}

export async function getBuyInVsNet(
  playerId?: string,
  options: { from?: string; to?: string } = {}
): Promise<{ buyIn: number; net: number; date: Date }[]> {
  const sessions = await getAllPlayerSessions(playerId, options);
  return buyInVsNetPoints(sessions);
}

export async function getProfitByLength(
  playerId?: string,
  options: { from?: string; to?: string } = {}
): Promise<{ binLabel: string; avgNet: number; count: number }[]> {
  const sessions = await getAllPlayerSessions(playerId, options);
  return profitBySessionLength(sessions);
}

export async function getTopWinnersForPreviousMonth(): Promise<
  PlayerAggregate[]
> {
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const lastDayOfPreviousMonth = new Date(
    firstDayOfCurrentMonth.setDate(firstDayOfCurrentMonth.getDate() - 1)
  );
  const firstDayOfPreviousMonth = new Date(
    lastDayOfPreviousMonth.getFullYear(),
    lastDayOfPreviousMonth.getMonth(),
    1
  );

  const from = firstDayOfPreviousMonth.toISOString().split("T")[0];
  const to = lastDayOfPreviousMonth.toISOString().split("T")[0];

  const sessions = await getAllPlayerSessions(undefined, { from, to });
  const aggregates = aggregatePlayers(sessions);

  return aggregates.sort((a, b) => b.totalNetNok - a.totalNetNok).slice(0, 3);
}

export async function getContendersForCurrentMonth(
  numContenders: number = 10
): Promise<{
  chartData: Record<string, string | number>[];
  chartConfig: Record<string, { label: string; color: string }>;
}> {
  // 1. Get date range for the current month
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const from = firstDayOfCurrentMonth.toISOString().split("T")[0];
  const to = today.toISOString().split("T")[0];

  // 2. Get all sessions for the current month
  const sessions = await getAllPlayerSessions(undefined, { from, to });

  // 3. Aggregate sessions to get current month's performance
  const aggregatesThisMonth = aggregatePlayers(sessions);

  // 4. Identify top players for the current month
  const topPlayerIds = aggregatesThisMonth
    .sort((a, b) => b.totalNetNok - a.totalNetNok)
    .slice(0, numContenders)
    .map((p) => p.playerId);

  // 5. Create daily cumulative net profit for each of the top players
  const dailyCumulativeNet: Record<string, Record<string, number>> = {}; // { '2025-09-01': { player1: 100, player2: 50 } }

  for (const session of sessions) {
    const dateStr = session.start.toISOString().split("T")[0];
    if (!dailyCumulativeNet[dateStr]) {
      dailyCumulativeNet[dateStr] = {};
    }
    dailyCumulativeNet[dateStr][session.playerId] =
      (dailyCumulativeNet[dateStr][session.playerId] || 0) + session.netNok;
  }

  const chartData: Record<string, string | number>[] = [];
  const cumulativeTotals: Record<string, number> = {};
  topPlayerIds.forEach((p) => (cumulativeTotals[p] = 0));

  const date = new Date(firstDayOfCurrentMonth); // Reset date to the first day of the month
  while (date <= today) {
    const dateStr = date.toISOString().split("T")[0];
    const dailyNets = dailyCumulativeNet[dateStr] || {};

    const row: Record<string, string | number> = {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };

    for (const playerId of topPlayerIds) {
      cumulativeTotals[playerId] += dailyNets[playerId] || 0;
      row[playerId] = cumulativeTotals[playerId];
    }

    chartData.push(row);
    date.setDate(date.getDate() + 1);
  }

  // 6. Create chart config
  const chartConfig: Record<string, { label: string; color: string }> = {};
  topPlayerIds.forEach((playerId, index) => {
    chartConfig[playerId] = {
      label: playerId,
      color: `var(--chart-${index + 1})`,
    };
  });

  return { chartData, chartConfig };
}
