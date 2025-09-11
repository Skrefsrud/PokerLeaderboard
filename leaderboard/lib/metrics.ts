import type {
  SessionRow,
  PlayerSession,
  PlayerAggregate,
  RollingPoint,
  HeatmapBucket,
} from "./types";
import { mean, stddev, streaks } from "./math";
import { diffHours } from "./time";
import { resolveName, storeUnmappedAlias, type AliasIndex } from "./alias";

export function rowsToPlayerSessions(
  rows: SessionRow[],
  aliasIndex: AliasIndex
): PlayerSession[] {
  const sessions = new Map<string, SessionRow[]>();

  for (const r of rows) {
    const resolved = resolveName(r.player_nickname, aliasIndex);
    if (!resolved.known) {
      storeUnmappedAlias(r.player_nickname);
    }

    const key = `${r.ledger_id}-${resolved.canonical}`;
    const existing = sessions.get(key) ?? [];
    existing.push({ ...r, player_nickname: resolved.canonical });
    sessions.set(key, existing);
  }

  const playerSessions: PlayerSession[] = [];
  for (const [, sessionRows] of sessions.entries()) {
    const first = sessionRows[0];
    const resolved = resolveName(first.player_nickname, aliasIndex);

    const start = new Date(
      Math.min(
        ...sessionRows.map((r) => new Date(r.session_start_at).getTime())
      )
    );
    const end = new Date(
      Math.max(
        ...sessionRows
          .map((r) =>
            r.session_end_at ? new Date(r.session_end_at).getTime() : 0
          )
          .filter((t) => t > 0)
      )
    );

    const duration = Math.max(diffHours(end ?? start, start), 1 / 60);
    const totalBuyIn = sessionRows.reduce((sum, r) => sum + (r.buy_in ?? 0), 0);
    const totalNet = sessionRows.reduce((sum, r) => sum + (r.net ?? 0), 0);
    const roi = totalBuyIn > 0 ? (totalNet / totalBuyIn) * 100 : 0;

    playerSessions.push({
      playerId: resolved.canonical,
      player: resolved.canonical,
      ledgerId: first.ledger_id,
      start,
      end,
      durationHours: duration,
      buyInNok: totalBuyIn / 20,
      netNok: totalNet / 20,
      roiPct: roi,
    });
  }

  return playerSessions;
}

export function aggregatePlayers(sessions: PlayerSession[]): PlayerAggregate[] {
  const byPlayer = new Map<string, PlayerSession[]>();
  for (const s of sessions) {
    const existing = byPlayer.get(s.player) ?? [];
    existing.push(s);
    byPlayer.set(s.player, existing);
  }

  const aggregates: PlayerAggregate[] = [];
  for (const [player, playerSessions] of byPlayer.entries()) {
    playerSessions.sort((a, b) => a.start.getTime() - b.start.getTime());

    const totalSessions = playerSessions.length;
    const totalNetNok = playerSessions.reduce((sum, s) => sum + s.netNok, 0);
    const totalBuyInNok = playerSessions.reduce(
      (sum, s) => sum + s.buyInNok,
      0
    );
    const totalHours = playerSessions.reduce(
      (sum, s) => sum + s.durationHours,
      0
    );

    const winRatePct =
      (playerSessions.filter((s) => s.netNok > 0).length / totalSessions) * 100;
    const roiPct = totalBuyInNok > 0 ? (totalNetNok / totalBuyInNok) * 100 : 0;
    const hourlyRateNok = totalHours > 0 ? totalNetNok / totalHours : 0;

    const nets = playerSessions.map((s) => s.netNok);
    const bestSessionNok = Math.max(...nets, 0);
    const worstSessionNok = Math.min(...nets, 0);
    const volatilityStdNok = stddev(nets);

    const sessionOutcomes = playerSessions.map((s) => s.netNok > 0);
    const { longestTrue: longestWinStreak, longestFalse: longestLoseStreak } =
      streaks(sessionOutcomes);

    aggregates.push({
      playerId: player,
      player,
      sessions: playerSessions,
      totalSessions,
      totalNetNok,
      totalBuyInNok,
      winRatePct,
      roiPct,
      avgPerSessionNok: totalNetNok / totalSessions,
      hourlyRateNok,
      bestSessionNok,
      worstSessionNok,
      volatilityStdNok,
      longestWinStreak,
      longestLoseStreak,
    });
  }
  return aggregates.sort((a, b) => b.totalNetNok - a.totalNetNok);
}

export function buildRollingSeries(
  playerSessionsSorted: PlayerSession[]
): RollingPoint[] {
  let cumulativeNet = 0;
  return playerSessionsSorted.map((session, idx) => {
    cumulativeNet += session.netNok;
    return {
      idx: idx + 1,
      date: session.start,
      perSessionNet: session.netNok,
      cumulativeNet,
    };
  });
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function heatmapByTimeOfDay(
  playerSessions: PlayerSession[]
): HeatmapBucket[] {
  const byHour = new Map<number, number[]>();
  for (const s of playerSessions) {
    const hour = s.start.getHours();
    const nets = byHour.get(hour) ?? [];
    nets.push(s.netNok);
    byHour.set(hour, nets);
  }
  const buckets: HeatmapBucket[] = [];
  for (let i = 0; i < 24; i++) {
    const nets = byHour.get(i) ?? [];
    buckets.push({
      xKey: String(i),
      yKey: "net",
      value: nets.length > 0 ? mean(nets) : 0,
    });
  }
  return buckets;
}

export function heatmapByWeekday(
  playerSessions: PlayerSession[]
): HeatmapBucket[] {
  const byDay = new Map<number, number[]>();
  for (const s of playerSessions) {
    const day = s.start.getDay();
    const nets = byDay.get(day) ?? [];
    nets.push(s.netNok);
    byDay.set(day, nets);
  }
  return WEEKDAYS.map((dayName, idx) => {
    const nets = byDay.get(idx) ?? [];
    return {
      xKey: dayName,
      yKey: "net",
      value: nets.length > 0 ? mean(nets) : 0,
    };
  });
}

export function buyInVsNetPoints(
  playerSessions: PlayerSession[]
): Array<{ buyIn: number; net: number; date: Date }> {
  return playerSessions.map((s) => ({
    buyIn: s.buyInNok,
    net: s.netNok,
    date: s.start,
  }));
}

export function profitBySessionLength(
  playerSessions: PlayerSession[],
  bins: number[] = [0, 1, 2, 3, 5, 8]
): Array<{ binLabel: string; avgNet: number; count: number }> {
  const byBin = new Map<string, number[]>();
  const binLabels: string[] = [];

  for (let i = 0; i < bins.length; i++) {
    const lower = bins[i];
    const upper = bins[i + 1];
    const label = upper ? `${lower}-${upper}h` : `${lower}+h`;
    binLabels.push(label);
    byBin.set(label, []);
  }

  for (const s of playerSessions) {
    for (let i = bins.length - 1; i >= 0; i--) {
      const binStart = bins[i];
      const binEnd = bins[i + 1];
      const label = binEnd ? `${binStart}-${binEnd}h` : `${binStart}+h`;
      if (s.durationHours >= binStart) {
        byBin.get(label)?.push(s.netNok);
        break;
      }
    }
  }

  return binLabels.map((label) => {
    const nets = byBin.get(label) ?? [];
    return {
      binLabel: label,
      avgNet: nets.length > 0 ? mean(nets) : 0,
      count: nets.length,
    };
  });
}

export type BadgeInfo = {
  name: string;
  description: string;
};

export function badgesFromAggregate(p: PlayerAggregate): BadgeInfo[] {
  const badges: BadgeInfo[] = [];
  const V_THRESHOLD = 500; // Volatility threshold in NOK
  const WIN_RATE_THRESHOLD = 55; // %
  const BEST_SESSION_THRESHOLD = 2000; // NOK
  const STREAK_THRESHOLD = 3;
  const AVG_HOURS_THRESHOLD = 4;

  if (p.volatilityStdNok < V_THRESHOLD && p.winRatePct > WIN_RATE_THRESHOLD) {
    badges.push({
      name: "Most Consistent",
      description: `Has a low volatility (std. dev. < ${V_THRESHOLD} NOK) and a high win rate (> ${WIN_RATE_THRESHOLD}%).`,
    });
  }

  if (p.bestSessionNok > BEST_SESSION_THRESHOLD) {
    badges.push({
      name: "High Roller",
      description: `Has won more than ${BEST_SESSION_THRESHOLD} NOK in a single session.`,
    });
  }

  if (
    p.longestLoseStreak >= STREAK_THRESHOLD &&
    p.longestWinStreak >= STREAK_THRESHOLD
  ) {
    badges.push({
      name: "Comeback Kid",
      description: `Has recovered from a losing streak of ${STREAK_THRESHOLD} or more with a winning streak of ${STREAK_THRESHOLD} or more.`,
    });
  }

  const avgHours = mean(p.sessions.map((s) => s.durationHours));
  if (avgHours > AVG_HOURS_THRESHOLD) {
    badges.push({
      name: "Marathoner",
      description: `Plays long sessions, averaging over ${AVG_HOURS_THRESHOLD} hours.`,
    });
  }

  return badges;
}
