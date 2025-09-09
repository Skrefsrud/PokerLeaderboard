import { getAllAggregates, getAllPlayerSessions } from "@/lib/ledger";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, FileText, TrendingDown } from "lucide-react";

export default async function Page() {
  const aggregates = await getAllAggregates();
  const sessions = await getAllPlayerSessions();

  const totalGames = new Set(sessions.map((s) => s.ledgerId)).size;
  const activePlayers = aggregates.length;

  const { greatestWin, greatestLoss } = sessions.reduce(
    (acc, session) => {
      if (session.netNok > acc.greatestWin.netNok)
        acc.greatestWin = { netNok: session.netNok, player: session.player };
      if (session.netNok < acc.greatestLoss.netNok)
        acc.greatestLoss = { netNok: session.netNok, player: session.player };
      return acc;
    },
    {
      greatestWin: { netNok: 0, player: "" },
      greatestLoss: { netNok: 0, player: "" },
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        <header className="relative rounded-lg bg-gradient-to-r from-card to-card/80 border overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400"></div>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                {/* Optional icon, e.g. Trophy/Users */}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Poker Leaderboard
                </h1>
                <p className="text-muted-foreground">
                  Analysis of {totalGames} games and {activePlayers} players.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGames}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Players
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePlayers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Greatest Win
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-green-400">
                +{greatestWin.netNok.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {greatestWin.player}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Greatest Loss
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-red-400">
                {greatestLoss.netNok.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {greatestLoss.player}
              </p>
            </CardContent>
          </Card>
        </div>

        <LeaderboardTable />
      </div>
    </div>
  );
}
