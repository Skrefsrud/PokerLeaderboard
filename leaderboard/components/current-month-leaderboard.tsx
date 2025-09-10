import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Medal, Award, BarChart } from "lucide-react";

type ChartConfig = Record<string, { label: string; color: string }>;

export default function CurrentMonthLeaderboard({
  data,
}: {
  data: {
    chartData: Record<string, string | number>[];
    chartConfig: ChartConfig;
  };
}) {
  const { chartData, chartConfig } = data;
  const lastDay = chartData[chartData.length - 1];

  if (!lastDay) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-muted-foreground" />
            This Month&apos;s Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No data for the current month.
          </p>
        </CardContent>
      </Card>
    );
  }

  const leaderboard = Object.keys(chartConfig)
    .map((playerId) => {
      const raw = lastDay[playerId];
      const net =
        typeof raw === "string"
          ? Number.parseFloat(raw) || 0
          : (raw as number) || 0;

      return {
        id: playerId,
        label: chartConfig[playerId]?.label ?? playerId,
        color: chartConfig[playerId]?.color ?? "#888",
        net,
      };
    })
    .sort((a, b) => b.net - a.net);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-slate-300" />;
      case 3:
        return <Award className="h-4 w-4 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRowStyle = (position: number) =>
    position <= 3 ? "bg-muted/30" : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-muted-foreground" />
          This Month&apos;s Leaderboard
        </CardTitle>
        <CardDescription>
          Current standings (progress toward next month&apos;s awards)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ol className="space-y-2">
          {leaderboard.map((entry, index) => {
            const position = index + 1;
            const positive = entry.net >= 0;

            return (
              <li
                key={entry.id}
                className={`flex items-center justify-between rounded-md px-2 py-2 ${getRowStyle(
                  position
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[40px]">
                    {getRankIcon(position)}
                    <span className="text-sm font-medium text-muted-foreground">
                      #{position}
                    </span>
                  </div>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium">{entry.label}</span>
                </div>

                <span
                  className={`font-mono text-sm ${
                    positive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {positive ? "+" : ""}
                  {entry.net.toFixed(0)} NOK
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
