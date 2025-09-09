
'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TimeHeatmap({ data, xLabel }: { data: { xKey: string; value: number }[], xLabel: string }) {
    const chartData = {
        labels: data.map(d => d.xKey),
        datasets: [
            {
                label: `Average Net (NOK)`,
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.value >= 0 ? 'hsla(var(--primary), 0.7)' : 'hsla(var(--destructive), 0.7)'),
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: `Performance by ${xLabel}`
            }
        },
        scales: {
            x: {
                title: { display: true, text: xLabel }
            },
            y: {
                title: { display: true, text: 'Average Net (NOK)' }
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance by {xLabel}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <Bar options={options} data={chartData} />
            </CardContent>
        </Card>
    )
}
