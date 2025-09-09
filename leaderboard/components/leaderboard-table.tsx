import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trophy, Medal, Award } from "lucide-react";
import { getAllAggregates } from "@/lib/ledger";

// This is now a Server Component that fetches its own data.
export async function LeaderboardTable() {
  const aggregates = await getAllAggregates();

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankStyling = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-amber-950/30 to-amber-900/20 border-amber-800/30";
      case 2:
        return "bg-gradient-to-r from-slate-800/30 to-slate-700/20 border-slate-600/30";
      case 3:
        return "bg-gradient-to-r from-orange-950/30 to-orange-900/20 border-orange-800/30";
      default:
        return "hover:bg-muted/50";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r p-4 from-primary/10 to-secondary/10">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Player Leaderboard
        </CardTitle>
        <p className="text-muted-foreground">
          Rankings across all poker sessions
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">Player</TableHead>
                <TableHead className="font-semibold text-center">Sessions</TableHead>
                <TableHead className="font-semibold text-right">Profit (NOK)</TableHead>
                <TableHead className="font-semibold text-right">ROI %</TableHead>
                <TableHead className="font-semibold text-right">Hourly (NOK/h)</TableHead>
                <TableHead className="font-semibold text-right">Volatility (σ)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregates.map((row, i) => {
                const position = i + 1;

                return (
                  <TableRow
                    key={row.player}
                    className={`transition-colors ${getRankStyling(position)}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankIcon(position)}
                        <span className="text-lg font-bold">#{position}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/player/${encodeURIComponent(row.playerId)}`} className="font-semibold hover:underline">
                        {row.player}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{row.totalSessions}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-right">
                      <span
                        className={`font-semibold ${
                          row.totalNetNok >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {row.totalNetNok >= 0 ? "+" : ""}
                        {row.totalNetNok.toFixed(0)}
                      </span>
                    </TableCell>
                     <TableCell className="font-mono text-right">
                      <span
                        className={`font-semibold ${
                          row.roiPct >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {row.roiPct.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-right text-sm text-muted-foreground">
                       {row.hourlyRateNok.toFixed(0)}
                    </TableCell>
                     <TableCell className="font-mono text-right text-sm text-muted-foreground">
                       {row.volatilityStdNok.toFixed(0)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}