"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts";

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
  avgNet: {
    label: "Average Net (NOK)",
  },
} satisfies ChartConfig;

export default function ProfitByLengthBarChart({
  bars,
}: {
  bars: { binLabel: string; avgNet: number; count: number }[];
}) {
  const chartData = bars.map((b) => ({
    binLabel: b.binLabel,
    avgNet: b.avgNet,
    count: b.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit vs. Session Length</CardTitle>
        <CardDescription>
          Showing average net profit by session length.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{ top: 16 }}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator />}
            />
            <Bar dataKey="avgNet">
              <LabelList dataKey="binLabel" position="top" fillOpacity={1} />
              {chartData.map((item) => (
                <Cell
                  key={item.binLabel}
                  fill={item.avgNet > 0 ? "var(--chart-5)" : "var(--chart-3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing average net for sessions of different lengths.
        </div>
      </CardFooter>
    </Card>
  );
}
