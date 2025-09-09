
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Point = {
  date: Date;
  perSessionNet: number;
  cumulativeNet: number;
  rollingRoiPct?: number;
};

export default function RollingRoiChart({ data }: { data: Point[] }) {
  const chartData = {
    labels: data.map(p => p.date.toLocaleDateString()),
    datasets: [
      {
        label: 'Cumulative Net (NOK)',
        data: data.map(p => p.cumulativeNet),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.2)',
        yAxisID: 'y',
        type: 'line' as const,
      },
      {
        label: 'Per Session Net (NOK)',
        data: data.map(p => p.perSessionNet),
        borderColor: 'hsl(var(--muted-foreground))',
        backgroundColor: 'hsla(var(--muted-foreground), 0.2)',
        type: 'bar' as const,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Performance Over Time',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
            display: true,
            text: 'Session Date'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
            display: true,
            text: 'Net Profit (NOK)'
        }
      },
    },
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Performance Timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
             <Line options={options} data={chartData} />
        </CardContent>
    </Card>
  )
}
