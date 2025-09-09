
'use client';

import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function BuyInNetScatter({ points }: { points: { buyIn: number; net: number; date: string }[] }) {
    const chartData = {
        datasets: [
            {
                label: 'Session Result',
                data: points.map(p => ({ x: p.buyIn, y: p.net })),
                backgroundColor: 'hsla(var(--primary), 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true },
            title: {
                display: true,
                text: 'Buy-in vs. Net Profit',
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `Buy-in: ${context.parsed.x} NOK, Net: ${context.parsed.y.toFixed(2)} NOK`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear' as const,
                position: 'bottom' as const,
                title: {
                    display: true,
                    text: 'Buy-in (NOK)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Net Profit (NOK)',
                },
            },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Buy-in vs. Net Profit</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <Scatter options={options} data={chartData} />
            </CardContent>
        </Card>
    )
}
