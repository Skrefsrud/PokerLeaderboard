"use client";

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
import { Trophy, Medal, Award } from "lucide-react";

export type LeaderboardRow = {
  player: string;
  sessions: number;
  totalNet: number;
};

interface LeaderboardTableProps {
  scoreboard: LeaderboardRow[];
}

export function LeaderboardTable({ scoreboard }: LeaderboardTableProps) {
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
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
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
                <TableHead className="font-semibold">Sessions</TableHead>
                <TableHead className="font-semibold">
                  Total Net (Chips)
                </TableHead>
                <TableHead className="font-semibold">Real Money</TableHead>
                <TableHead className="font-semibold">Avg per Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoreboard.map((row, i) => {
                const position = i + 1;
                const avgPerSession =
                  row.sessions > 0 ? row.totalNet / row.sessions : 0;

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
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {row.player.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold">{row.player}</span>
                        
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.sessions}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      <span
                        className={`font-semibold ${
                          row.totalNet >= 0
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {row.totalNet >= 0 ? "+" : ""}
                        {row.totalNet.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">
                      <span
                        className={`font-semibold ${
                          row.totalNet >= 0
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {row.totalNet / 20 >= 0 ? "+" : ""}
                        {(row.totalNet / 20).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {avgPerSession >= 0 ? "+" : ""}
                      {avgPerSession.toFixed(2)}
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
