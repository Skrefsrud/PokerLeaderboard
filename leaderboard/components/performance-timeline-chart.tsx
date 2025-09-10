"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Point = {
  date: string; // ISO string
  perSessionNet: number;
  cumulativeNet: number;
};

const chartConfig = {
  perSessionNet: {
    label: "Per-session net (NOK)",
    color: "hsl(var(--chart-2))",
  },
  cumulativeNet: {
    label: "Cumulative (NOK)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PerformanceTimelineChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(),
    perSessionNet: d.perSessionNet,
    cumulativeNet: d.cumulativeNet,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Timeline</CardTitle>
        <CardDescription>
          Showing per-session and cumulative net over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 5)} // Short date format
            />
            <YAxis
              tickFormatter={(value) =>
                `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(0)}`
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="perSessionNet"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="cumulativeNet"
              type="monotone"
              stroke="var(--chart-5)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {/* This can be dynamic later */}
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing data for all sessions.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
