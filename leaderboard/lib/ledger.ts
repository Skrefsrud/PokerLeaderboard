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
let aggregatesCache: PlayerAggregate[] | null = null;

async function primeCaches(): Promise<void> {
  if (sessionCache && aggregatesCache) return;

  console.log("--- Prime Caches: START ---");
  const files = listCsvFiles();
  const aliasIndex = loadAliasIndex();

  // 1. Read all raw rows from CSVs
  const allRows: SessionRow[] = files.flatMap((file) => readLedgerCsv(file));

  // 2. Convert raw rows to structured PlayerSessions
  const sessions = rowsToPlayerSessions(allRows, aliasIndex);
  sessions.sort((a, b) => a.start.getTime() - b.start.getTime()); // Sort chronologically
  sessionCache = sessions;

  // 3. Aggregate sessions into player summaries
  aggregatesCache = aggregatePlayers(sessions);
  console.log(
    `--- Prime Caches: DONE (${sessions.length} sessions, ${aggregatesCache.length} players) `
  );
}

export async function getAllPlayerSessions(
  playerId?: string
): Promise<PlayerSession[]> {
  await primeCaches();
  if (!playerId) return sessionCache!;
  return sessionCache!.filter((s) => s.playerId === playerId);
}

export async function getAllAggregates(): Promise<PlayerAggregate[]> {
  await primeCaches();
  return aggregatesCache!;
}

export async function getPlayerAggregate(
  playerId: string
): Promise<PlayerAggregate | undefined> {
  await primeCaches();
  return aggregatesCache!.find((p) => p.playerId === playerId);
}

export async function getRollingForPlayer(
  playerId: string
): Promise<RollingPoint[]> {
  const playerSessions = await getAllPlayerSessions(playerId);
  return buildRollingSeries(playerSessions);
}

export async function getHeatmap(
  playerId?: string,
  dim: "hour" | "weekday" = "hour"
): Promise<HeatmapBucket[]> {
  const sessions = await getAllPlayerSessions(playerId);
  return dim === "hour"
    ? heatmapByTimeOfDay(sessions)
    : heatmapByWeekday(sessions);
}

export async function getBuyInVsNet(
  playerId?: string
): Promise<{ buyIn: number; net: number; date: Date }[]> {
  const sessions = await getAllPlayerSessions(playerId);
  return buyInVsNetPoints(sessions);
}

export async function getProfitByLength(
  playerId?: string
): Promise<{ binLabel: string; avgNet: number; count: number }[]> {
  const sessions = await getAllPlayerSessions(playerId);
  return profitBySessionLength(sessions);
}

export async function getMatchups(): Promise<PairEdge[]> {
  const allSessions = await getAllPlayerSessions();
  return pairwiseMatchups(allSessions);
}
