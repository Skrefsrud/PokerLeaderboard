export type SessionRow = {
  player_nickname: string;
  player_id: string | null;
  session_start_at: string; // ISO
  session_end_at?: string | null; // ISO or null
  buy_in: number;  // NOK
  buy_out?: number | null; // NOK
  stack?: number | null;   // chips (if used)
  net: number;     // NOK
  ledger_id: string; // derive from filename
};

export type PlayerSession = {
  playerId: string;
  player: string;          // canonical
  ledgerId: string;
  start: Date;             // TZ-aware
  end?: Date | null;
  durationHours: number;   // computed
  buyInNok: number;
  netNok: number;
  roiPct: number;          // (net / buyIn) * 100, guard divide-by-zero
};

export type PlayerAggregate = {
  playerId: string;
  player: string;
  sessions: PlayerSession[];
  totalSessions: number;
  totalNetNok: number;
  totalBuyInNok: number;
  roiPct: number;           // (totalNet / totalBuyIn)*100
  winRatePct: number;       // % sessions with net > 0
  avgPerSessionNok: number;
  hourlyRateNok: number;    // totalNet / sum(duration hours)
  bestSessionNok: number;
  worstSessionNok: number;
  volatilityStdNok: number; // stddev of session net
  longestWinStreak: number;
  longestLoseStreak: number;
};

export type TimeBin = 'hour' | 'weekday' | 'month';

export type HeatmapBucket = {
  xKey: string; // hour (0-23) or weekday or month
  yKey: string; // optional secondary dim (e.g., year)
  value: number; // sum net or avg net
};

export type PairEdge = {
  aId: string; aName: string;
  bId: string; bName: string;
  netFromAToB: number; // A's lifetime net vs B
  sessionsTogether: number;
};

export type RollingPoint = {
  idx: number; // session index by date
  date: Date;
  perSessionNet: number;
  cumulativeNet: number;
  rollingRoiPct?: number; // moving avg/median windowed ROI
};