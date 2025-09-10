"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import * as React from "react";

type ChartSeriesConfig = Record<string, { label: string; color: string }>;

export default function ContendersChart({
  data,
}: {
  data: {
    chartData: Record<string, string | number>[];
    chartConfig: ChartSeriesConfig; // color: "var(--chart-1)" etc.
  };
}) {
  const { chartData, chartConfig } = data;

  // Sanitize keys so they become valid CSS var names
  const toToken = React.useCallback(
    (k: string) => k.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month&apos;s Contenders</CardTitle>
        <CardDescription>
          Cumulative net profit for the top players this month.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            {Object.keys(chartConfig).map((rawKey) => {
              const token = toToken(rawKey);
              return (
                <Line
                  key={rawKey}
                  dataKey={rawKey}
                  type="monotone"
                  stroke={`var(--color-${token})`}
                  strokeWidth={2}
                  dot={false}
                  // If you need area fill later:
                  // fill={`var(--color-${token})`}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing cumulative net profit for the current month.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
