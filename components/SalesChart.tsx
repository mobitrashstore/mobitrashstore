
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface SalesChartProps {
    labels: string[];
    onlineRevenueData: number[];
    shop1RevenueData?: number[]; 
    shop2RevenueData?: number[];
    offlineRevenueData?: number[];
    type: 'bar' | 'line';
}

const SalesChart: React.FC<SalesChartProps> = ({ labels, onlineRevenueData, shop1RevenueData, shop2RevenueData, offlineRevenueData, type }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    // Handle backward compatibility
    const s1Data = shop1RevenueData || offlineRevenueData || [];
    const s2Data = shop2RevenueData || [];

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                // Determine styling based on chart type
                const isLine = type === 'line';
                
                chartInstance.current = new Chart(ctx, {
                    type: type,
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Online',
                                data: onlineRevenueData,
                                backgroundColor: isLine ? 'rgba(2, 132, 199, 0.1)' : 'rgba(2, 132, 199, 0.8)',
                                borderColor: 'rgba(2, 132, 199, 1)',
                                borderWidth: 2,
                                fill: isLine,
                                tension: 0.4,
                                pointBackgroundColor: 'rgba(2, 132, 199, 1)',
                                pointRadius: isLine ? 3 : 0,
                                pointHoverRadius: 5,
                            },
                            {
                                label: 'Townplanning',
                                data: s1Data,
                                backgroundColor: isLine ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.8)',
                                borderColor: 'rgba(245, 158, 11, 1)',
                                borderWidth: 2,
                                fill: isLine,
                                tension: 0.4,
                                pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                                pointRadius: isLine ? 3 : 0,
                                pointHoverRadius: 5,
                            },
                            {
                                label: 'Nayabazar',
                                data: s2Data,
                                backgroundColor: isLine ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.8)',
                                borderColor: 'rgba(147, 51, 234, 1)',
                                borderWidth: 2,
                                fill: isLine,
                                tension: 0.4,
                                pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                                pointRadius: isLine ? 3 : 0,
                                pointHoverRadius: 5,
                            }
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                ticks: { color: '#64748b', font: { size: 11, weight: 'bold' } }, // Darker slate
                                grid: { display: false },
                                stacked: !isLine,
                            },
                            y: {
                                beginAtZero: true,
                                ticks: { 
                                    color: '#64748b', // Darker slate
                                    font: { size: 11, weight: 'bold' },
                                    callback: function(value) {
                                        if (typeof value === 'number') {
                                            if(value >= 1000) return (value/1000).toFixed(0) + 'k';
                                            return value;
                                        }
                                        return value;
                                    }
                                },
                                grid: { color: 'rgba(226, 232, 240, 0.8)' },
                                stacked: !isLine,
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                align: 'end',
                                labels: { 
                                    color: '#475569', // Darker text
                                    font: { size: 12, weight: 'bold' }, 
                                    usePointStyle: true, 
                                    boxWidth: 8 
                                },
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', // Dark tooltip bg
                                titleColor: '#ffffff',
                                bodyColor: '#cbd5e1',
                                borderColor: '#475569',
                                borderWidth: 1,
                                padding: 10,
                                boxPadding: 4,
                            },
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        }
                    },
                });
            }
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [labels, onlineRevenueData, s1Data, s2Data, type]);

    return (
        <div className="relative w-full h-full">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default SalesChart;
