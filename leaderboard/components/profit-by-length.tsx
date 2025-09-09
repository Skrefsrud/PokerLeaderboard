
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

export default function ProfitByLength({ bars }: { bars: { binLabel: string; avgNet: number; count: number }[] }) {
    const chartData = {
        labels: bars.map(b => b.binLabel),
        datasets: [
            {
                label: 'Average Net (NOK)',
                data: bars.map(b => b.avgNet),
                backgroundColor: bars.map(b => b.avgNet >= 0 ? 'hsla(var(--primary), 0.7)' : 'hsla(var(--destructive), 0.7)'),
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Profit vs. Session Length',
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const bar = bars[context.dataIndex];
                        return `Avg Net: ${context.parsed.y.toFixed(2)} NOK (${bar.count} sessions)`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Session Length (Hours)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Average Net (NOK)',
                },
            },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profit vs. Session Length</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <Bar options={options} data={chartData} />
            </CardContent>
        </Card>
    )
}
