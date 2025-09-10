"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "Average Net (NOK)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function PerformanceLineChart({
  data = [],
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
              dataKey="xKey"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="value"
              type="linear"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Performance varies by {xLabel.toLowerCase()}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing average net for all sessions.
        </div>
      </CardFooter>
    </Card>
  );
}
