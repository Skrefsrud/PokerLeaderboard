"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type VolatilityHistogramProps = {
  sessionNets: number[]; // in NOK
};

export function VolatilityHistogram({
  sessionNets,
}: VolatilityHistogramProps) {
  const histogramData = useMemo(() => {
    if (sessionNets.length === 0) {
      return null;
    }

    const minNet = Math.min(...sessionNets);
    const maxNet = Math.max(...sessionNets);
    
    // Handle case where all nets are the same
    if (minNet === maxNet) {
      const labels = [minNet.toFixed(0)];
      const data = [sessionNets.length];
      return {
        labels,
        datasets: [
          {
            label: "Number of Sessions",
            data: data,
            backgroundColor: "rgba(139, 92, 246, 0.7)",
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    const numBins = Math.min(10, Math.floor(sessionNets.length / 2));
    if (numBins < 2) {
        return null; // Not enough data for a meaningful histogram
    }
    const binWidth = (maxNet - minNet) / numBins;

    const bins = Array(numBins).fill(0);
    const labels = Array(numBins).fill("");

    for (let i = 0; i < numBins; i++) {
      const binStart = minNet + i * binWidth;
      const binEnd = binStart + binWidth;
      labels[i] = `${binStart.toFixed(0)} to ${binEnd.toFixed(0)}`;
    }

    for (const net of sessionNets) {
      let binIndex = Math.floor((net - minNet) / binWidth);
      if (binIndex >= numBins) {
        binIndex = numBins - 1; // Put max value in the last bin
      }
      bins[binIndex]++;
    }

    return {
      labels,
      datasets: [
        {
          label: "Number of Sessions",
          data: bins,
          backgroundColor: "rgba(139, 92, 246, 0.7)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [sessionNets]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y} sessions`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Net Session Result (NOK)",
          color: "#ffffff",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "hsl(var(--border))",
        }
      },
      y: {
        title: {
          display: true,
          text: "Frequency",
          color: "#ffffff",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#ffffff",
          stepSize: 1,
        },
        grid: {
          color: "hsl(var(--border))",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Player Volatility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {histogramData ? (
            <Bar data={histogramData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Not enough data to display volatility.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}