"use client";

import { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type ChartDataset,
} from "chart.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type Point = { buyIn: number; net: number; date: string };

function getCssVar(name: string, fallback = "#999") {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return val || fallback;
}

export default function BuyInNetScatter({ points }: { points: Point[] }) {
  // Resolve theme colors (once per render)
  const posColor = getCssVar("--chart-5", "#22c55e"); // positive points
  const negColor = getCssVar("--chart-3", "#ef4444"); // negative points
  const tickColor = getCssVar("--muted-foreground", "#a1a1aa"); // axis text
  const gridColor = getCssVar("--muted-foreground", "#a1a1aa"); // grid lines

  const dataset = useMemo(
    () => points.map((p) => ({ x: p.buyIn, y: p.net, _date: p.date })),
    [points]
  );

  // Avoid scriptable callbacks -> give arrays instead (fixes TS)
  const pointColors = useMemo(
    () => dataset.map((d) => (d.y >= 0 ? posColor : negColor)),
    [dataset, posColor, negColor]
  );

  const datasets: ChartDataset<"scatter">[] = [
    {
      label: "Session Result",
      data: dataset,
      showLine: false,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointHitRadius: 10,
      pointBackgroundColor: pointColors, // array of colors
      pointBorderColor: pointColors, // array of colors
    },
  ];

  const data: ChartData<"scatter"> = { datasets };

  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const x = Number(ctx.parsed.x);
            const y = Number(ctx.parsed.y);
            const signed = `${y >= 0 ? "+" : ""}${y.toFixed(0)}`;
            return ` Buy-in: ${x} NOK • Net: ${signed} NOK`;
          },
          title: (items) => {
            const d = (items[0]?.raw as any)?._date;
            return d ? new Date(d).toLocaleDateString() : "";
          },
        },
      },
    },
    layout: { padding: { left: 12, right: 12 } },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        grid: { display: false }, // no vertical grid
        border: { display: false }, // no axis border
        title: { display: true, text: "Buy-in (NOK)", color: tickColor },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          font: { family: "var(--font-sans)" },
          color: tickColor, // concrete color string
        },
      },
      y: {
        grid: {
          display: true,
          lineWidth: 0.5,
          color: gridColor, // concrete color string
        },
        border: { display: false },
        title: { display: true, text: "Net Profit (NOK)", color: tickColor },
        ticks: {
          callback: (value) => {
            const n = Number(value);
            return `${n >= 0 ? "+" : ""}${n.toFixed(0)}`;
          },
          font: { family: "var(--font-sans)" },
          color: tickColor, // concrete color string
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy-in vs. Net Profit</CardTitle>
        <CardDescription>
          Each dot is a session. Positive = chart-1, negative = chart-2.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <Scatter data={data} options={options} />
      </CardContent>
    </Card>
  );
}
