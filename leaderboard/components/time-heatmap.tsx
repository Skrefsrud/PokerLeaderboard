"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

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

const chartConfig = {
  value: {
    label: "Average Net (NOK)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function TimeHeatmap({
  data = [], // Added default empty array to handle undefined data
  xLabel,
}: {
  data: { xKey: string; value: number }[];
  xLabel: string;
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance by {xLabel}</CardTitle>
          <CardDescription>No data available to display.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data to show</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    xKey: d.xKey,
    value: d.value,
    fill: d.value >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-5))",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by {xLabel}</CardTitle>
        <CardDescription>
          Showing average net performance across different{" "}
          {xLabel.toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="xKey"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
            <Bar dataKey="value" strokeWidth={2} radius={4}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Performance varies by {xLabel.toLowerCase()}{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing average net for all sessions.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
