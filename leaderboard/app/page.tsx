import { loadAllRows, buildScoreboard, summarizePerFile } from "@/lib/ledger";
import { LeaderboardTable } from "@/components/leaderboard-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { PlayerStats } from "@/components/player-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, FileText, DollarSign } from "lucide-react";

export default function Page() {
  const { rows, files } = loadAllRows();
  const scoreboard = buildScoreboard(rows);
  const fileSummaries = summarizePerFile(files, rows);
  const totalAcrossAll = scoreboard.reduce((a, r) => a + r.totalNet, 0);

  const totalSessions = scoreboard.reduce((a, r) => a + r.sessions, 0);
  const activePlayers = scoreboard.length;
  const biggestWinner = scoreboard[0];
  const realMoneyTotal = totalAcrossAll / 20;

  // Normalize rows down to what's needed on the client
  const simplified = rows
    .map((r: any) => ({
      // prefer a real date field; fall back to start/end or empty
      date: r.date ?? r.session_start_at ?? r.session_end_at ?? "",
      player: r.player_nickname,
      // support both ledger types: net or net_chips
      net: typeof r.net === "number" ? r.net : r.net_chips ?? 0,
    }))
    // drop rows without any date (optional)
    .filter((r) => r.date && r.player);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-primary-foreground">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Poker Analytics
                </h1>
                <p className="text-primary-foreground/80 text-lg">
                  Comprehensive ledger analysis across {files.length} data file
                  {files.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Across all players
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Players
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePlayers}</div>
              <p className="text-xs text-muted-foreground">
                Registered players
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Total (Chips)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {totalAcrossAll >= 0 ? "+" : ""}
                {totalAcrossAll.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {realMoneyTotal >= 0 ? "+" : ""}
                {realMoneyTotal.toFixed(2)} real money
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Player
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {biggestWinner?.player || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {biggestWinner
                  ? `+${biggestWinner.totalNet.toFixed(2)} chips`
                  : "No data"}
              </p>
            </CardContent>
          </Card>
        </div>

        <LeaderboardTable
          scoreboard={scoreboard}
          totalAcrossAll={totalAcrossAll}
        />

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Player Performance Analytics
            </CardTitle>
            <p className="text-muted-foreground">
              Track individual player performance over time
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <PlayerStats rows={simplified} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Data Sources Summary
            </CardTitle>
            <p className="text-muted-foreground">
              Breakdown by individual ledger files
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">File Name</TableHead>
                    <TableHead className="font-semibold">Sessions</TableHead>
                    <TableHead className="font-semibold">
                      Net Total (Chips)
                    </TableHead>
                    <TableHead className="font-semibold">Real Money</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileSummaries.map((f) => (
                    <TableRow key={f.file} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="mr-2">
                          {f.file.split(".").pop()?.toUpperCase()}
                        </Badge>
                        {f.file}
                      </TableCell>
                      <TableCell>{f.rows}</TableCell>
                      <TableCell className="font-mono">
                        <span
                          className={
                            f.totalNet >= 0
                              ? "text-primary"
                              : "text-destructive"
                          }
                        >
                          {f.totalNet >= 0 ? "+" : ""}
                          {f.totalNet.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {f.totalNet >= 0 ? "+" : ""}
                        {(f.totalNet / 20).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-muted-foreground">
              Development Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">
                  ▶
                </span>
                View raw data (first 50 rows)
              </summary>
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
                <pre className="text-xs overflow-x-auto text-muted-foreground">
                  {JSON.stringify(rows.slice(0, 50), null, 2)}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
