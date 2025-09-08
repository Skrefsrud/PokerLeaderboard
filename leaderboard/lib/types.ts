export type LedgerRow = {
  player_nickname: string;
  player_id?: string | number | null;
  session_start_at?: string | null;
  session_end_at?: string | null;
  buy_in?: number | null;
  buy_out?: number | null;
  stack?: number | null;
  net: number; // +win / -loss
  net_chips?: number;
};

export type ScoreRow = {
  player: string;
  totalNet: number;
  sessions: number;
  roi: number;
};

export type SessionSummary = {
  file: string;
  rows: number;
  totalNet: number;
};
