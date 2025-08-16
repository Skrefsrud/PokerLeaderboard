# Poker Ledger (local CSVs)

## Setup

1. `pnpm i` (or `npm i` / `yarn`)
2. Drop all your ledger CSV files into `./data/`  
   Expected columns (case-sensitive):

   - `player_nickname` (string)
   - `net` (number, positive = won, negative = lost)  
     The rest are optional: `player_id, session_start_at, session_end_at, buy_in, buy_out, stack`.

3. `pnpm dev` and open http://localhost:3000

## Notes

- No uploads yet. We read files from the local `data` directory every request.
- Name aliasing (same human, different nicknames) is not handled yet.
- If your schema differs, adjust `lib/csv.ts` mapping.
