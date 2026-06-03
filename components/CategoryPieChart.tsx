
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface CategoryPieChartProps {
    data: { [key: string]: number };
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const labels = Object.keys(data);
                const values = Object.values(data);
                
                chartInstance.current = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Sales',
                                data: values,
                                backgroundColor: [
                                    'rgba(251, 191, 36, 0.8)',
                                    'rgba(245, 158, 11, 0.8)',
                                    'rgba(14, 165, 233, 0.8)',
                                    'rgba(5, 150, 105, 0.8)',
                                    'rgba(219, 39, 119, 0.8)',
                                    'rgba(124, 58, 237, 0.8)',
                                    'rgba(217, 70, 239, 0.8)',
                                    'rgba(16, 185, 129, 0.8)'
                                ],
                                borderColor: 'rgba(255, 255, 255, 1)',
                                borderWidth: 2,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: 20
                        },
                        plugins: {
                            legend: {
                                position: 'bottom', // Move to bottom to prevent cut-off
                                align: 'center',
                                labels: { 
                                    color: '#334155', // Darker text (slate-700)
                                    boxWidth: 12, 
                                    padding: 15,
                                    font: { 
                                        size: 11,
                                        weight: 'bold' 
                                    },
                                    usePointStyle: true,
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                padding: 12,
                                titleFont: { size: 13 },
                                bodyFont: { size: 12 }
                            }
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
    }, [data]);

    return (
        <div className="relative w-full h-full">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default CategoryPieChart;
