import "server-only"; // Ensure this module runs only on the server

import type {
  PlayerSession,
  PlayerAggregate,
  PairEdge,
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
  pairwiseMatchups,
  profitBySessionLength,
  rowsToPlayerSessions,
} from "./metrics";
import { listCsvFiles, readLedgerCsv } from "./csv";
import { loadAliasIndex } from "./alias";
import { basename } from "node:path";

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

  console.log(
    `--- Prime Caches: DONE (${sessions.length} sessions) `
  );
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

export async function getMatchups(
  options: { from?: string; to?: string } = {}
): Promise<PairEdge[]> {
  const allSessions = await getAllPlayerSessions(undefined, options);
  return pairwiseMatchups(allSessions);
}

export async function getTopWinnersForPreviousMonth(): Promise<PlayerAggregate[]> {
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth.setDate(firstDayOfCurrentMonth.getDate() - 1));
  const firstDayOfPreviousMonth = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), 1);

  const from = firstDayOfPreviousMonth.toISOString().split("T")[0];
  const to = lastDayOfPreviousMonth.toISOString().split("T")[0];

  const sessions = await getAllPlayerSessions(undefined, { from, to });
  const aggregates = aggregatePlayers(sessions);

  return aggregates
    .sort((a, b) => b.totalNetNok - a.totalNetNok)
    .slice(0, 3);
}