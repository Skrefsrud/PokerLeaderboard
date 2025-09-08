"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { VolatilityHistogram } from "./volatility-histogram";

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend
);

type Row = {
  date: string; // ISO-ish
  player: string;
  net: number; // chips for that session (positive/negative)
};

export function PlayerStats({ rows }: { rows: Row[] }) {
  // Unique players (post-alias—your server already mapped names)
  const players = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.player))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [rows]);

  const [player, setPlayer] = useState<string>(players[0] ?? "");

  // Build timeline: sort by date, cumulate net
  const timeline = useMemo(() => {
    const fmt = (d: string) => {
      // try to normalize to yyyy-mm-dd for stable sorting/labels
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? d : dt.toISOString();
    };

    const filtered = rows
      .filter((r) => r.player === player)
      .map((r) => ({ ...r, date: fmt(r.date) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let cumulative = 0;
    return filtered.map((r) => {
      cumulative += r.net ?? 0;
      return {
        date: r.date,
        net: r.net ?? 0,
        cumulative,
        // real money per your rule: chips / 20
        netMoney: (r.net ?? 0) / 20,
        cumulativeMoney: cumulative / 20,
      };
    });
  }, [rows, player]);

  const playerStats = useMemo(() => {
    if (timeline.length === 0) return null;

    const totalSessions = timeline.length;
    const totalNet = timeline[timeline.length - 1].cumulative;
    const avgPerSession = totalNet / totalSessions;
    const winSessions = timeline.filter((t) => t.net > 0).length;
    const winRate = (winSessions / totalSessions) * 100;
    const bestSession = Math.max(...timeline.map((t) => t.net));
    const worstSession = Math.min(...timeline.map((t) => t.net));

    return {
      totalSessions,
      totalNet,
      avgPerSession,
      winRate,
      bestSession,
      worstSession,
    };
  }, [timeline]);

  const labels = timeline.map((d) => d.date.slice(0, 10));
  const data = {
    labels,
    datasets: [
      {
        label: "Per-session net (NOK)",
        data: timeline.map((d) => d.netMoney),
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Cumulative (NOK)",
        data: timeline.map((d) => d.cumulativeMoney),
        borderColor: "#06b6d4",
        backgroundColor: "#06b6d4",
        tension: 0.25,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          footer: (ctx: TooltipItem<"line">[]) => {
            const i = ctx[0].dataIndex;
            const d = timeline[i];
            return `Date: ${d.date.slice(0, 10)}`;
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "#ffffff",
          font: {
            size: 16,
            weight: "normal",
          },
          padding: 10,
        },
        title: {
          display: true,
          text: "Date",
          color: "#ffffff",
          font: {
            size: 18,
            weight: "normal",
          },
          padding: { top: 15 },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "#ffffff",
          font: {
            size: 16,
            weight: "normal",
          },
          padding: 10,
          // show ± with monospace vibe
          callback: (val: string | number) =>
            `${Number(val) >= 0 ? "+" : ""}${Number(val).toFixed(0)}`,
        },
        title: {
          display: true,
          text: "Net (NOK)",
          color: "#ffffff",
          font: {
            size: 18,
            weight: "normal",
          },
          padding: { bottom: 15 },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Select Player:
          </span>
          <Select value={player} onValueChange={setPlayer}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {players.map((p) => (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {p.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {p}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {timeline.length > 0 && playerStats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {playerStats.totalSessions}
                </div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div
                  className={`text-2xl font-bold font-mono ${
                    playerStats.totalNet >= 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {playerStats.totalNet >= 0 ? "+" : ""}
                  {(playerStats.totalNet / 20).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total Net (NOK)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div
                  className={`text-2xl font-bold font-mono ${
                    playerStats.avgPerSession >= 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {playerStats.avgPerSession >= 0 ? "+" : ""}
                  {(playerStats.avgPerSession / 20).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Avg per Session (NOK)</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {playerStats.winRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold font-mono text-primary flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />+
                  {(playerStats.bestSession / 20).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Best Session (NOK)</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold font-mono text-destructive flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  {(playerStats.worstSession / 20).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Worst Session (NOK)</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Timeline
              </CardTitle>
              <div className="flex gap-2">
                <Badge
                  variant={
                    playerStats.totalNet >= 0 ? "default" : "destructive"
                  }
                >
                  {playerStats.totalNet >= 0 ? "Profitable" : "Loss"}
                </Badge>
                <Badge variant="outline">
                  {playerStats.winRate.toFixed(1)}% Win Rate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Line data={data} options={options} />
              </div>
            </CardContent>
          </Card>

          <VolatilityHistogram sessionNets={timeline.map((t) => t.netMoney)} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No data available for {player}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
