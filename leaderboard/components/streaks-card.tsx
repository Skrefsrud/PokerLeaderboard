import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Trophy, Target } from "lucide-react";

export default function StreaksCard({
  winStreak,
  loseStreak,
}: {
  winStreak: number;
  loseStreak: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Performance Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Win Streak */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Win Streak
                </p>
                <p className="text-xs text-muted-foreground">
                  Longest winning run
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {winStreak}
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              >
                <Target className="h-3 w-3 mr-1" />
                Best
              </Badge>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (winStreak / Math.max(winStreak, loseStreak, 10)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Lose Streak */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Losing Streak
                </p>
                <p className="text-xs text-muted-foreground">
                  Longest losing run
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loseStreak}
              </div>
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800"
              >
                Worst
              </Badge>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (loseStreak / Math.max(winStreak, loseStreak, 10)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Win/Loss Ratio</span>
            <span className="font-medium">
              {loseStreak > 0 ? (winStreak / loseStreak).toFixed(1) : "∞"}:1
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
