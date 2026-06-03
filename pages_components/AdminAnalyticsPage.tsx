// ... (imports remain the same)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../services/api';
import { SiteVisit, Order } from '../types';
import Spinner from '../components/Spinner';
import Chart from 'chart.js/auto';

import { GlobeAltIcon } from '../components/icons/GlobeAltIcon';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import { ArrowTrendingUpIcon } from '../components/icons/ArrowTrendingUpIcon';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';

// ... (rest of the file content until the chart options) ...

// I'm providing the full file content to ensure consistency and correctness.
// This is the updated version with 'bold' font weight instead of '600'.

export interface AdminAnalyticsPageProps {
    navigate: (path: string) => void;
}

const TrendIndicator: React.FC<{ value: number }> = ({ value }) => {
    if (value === 0) return <span className="text-slate-400 text-xs font-bold ml-2">─ 0%</span>;
    const isPositive = value > 0;
    return (
        <span className={`text-xs font-bold ml-2 flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
        </span>
    );
};

const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = () => {
    const [trafficData, setTrafficData] = useState<SiteVisit[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(7); // Default 7 days

    // Refs for Charts
    const mainChartRef = useRef<HTMLCanvasElement>(null);
    const deviceChartRef = useRef<HTMLCanvasElement>(null);
    const pagesChartRef = useRef<HTMLCanvasElement>(null);
    const sourcesChartRef = useRef<HTMLCanvasElement>(null);

    // Instances
    const mainInstance = useRef<Chart | null>(null);
    const deviceInstance = useRef<Chart | null>(null);
    const pagesInstance = useRef<Chart | null>(null);
    const sourcesInstance = useRef<Chart | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [traffic, allOrders] = await Promise.all([
                    api.getSiteTrafficStats(),
                    api.getOrders()
                ]);

                // Ensure data is sorted by date ascending
                const sortedTraffic = [...traffic].sort((a, b) => {
                    const tA = a.date ? new Date(a.date).getTime() : 0;
                    const tB = b.date ? new Date(b.date).getTime() : 0;
                    return tA - tB;
                });

                setTrafficData(sortedTraffic);
                setOrders(allOrders);

            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- ANALYTICS ENGINE ---
    const analysis = useMemo(() => {
        if (loading) return null;

        // Helper to filter data by date range
        const filterByDate = <T extends { date: string }>(data: T[], daysAgoStart: number, daysAgoEnd: number): T[] => {
            const now = new Date();
            const startDate = new Date();
            startDate.setDate(now.getDate() - daysAgoEnd);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date();
            endDate.setDate(now.getDate() - daysAgoStart); // e.g. 0 means today
            endDate.setHours(23, 59, 59, 999);

            return data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate && itemDate <= endDate;
            });
        };

        // 1. Current Period Data
        const currentTraffic = filterByDate<SiteVisit>(trafficData, 0, timeRange);
        const currentOrders = filterByDate<Order>(orders, 0, timeRange);

        // 2. Previous Period Data (for comparison)
        const prevTraffic = filterByDate<SiteVisit>(trafficData, timeRange, timeRange * 2);
        const prevOrders = filterByDate<Order>(orders, timeRange, timeRange * 2);

        // 3. Aggregate Metrics
        const sum = (items: any[], key: string) => items.reduce((acc, item) => acc + (item[key] || 0), 0);
        const sumNested = (items: any[], key: string, subKey: string) => items.reduce((acc, item) => acc + (item[key]?.[subKey] || 0), 0);

        const metrics = {
            visits: sum(currentTraffic, 'totalHits') + sum(currentTraffic, 'totalVisits'), // Handle legacy key
            uniqueUsers: sum(currentTraffic, 'uniqueVisitors'),
            revenue: sum(currentOrders, 'total'),
            ordersCount: currentOrders.length
        };

        const prevMetrics = {
            visits: sum(prevTraffic, 'totalHits') + sum(prevTraffic, 'totalVisits'),
            uniqueUsers: sum(prevTraffic, 'uniqueVisitors'),
            revenue: sum(prevOrders, 'total'),
            ordersCount: prevOrders.length
        };

        // 4. Calculate Trends (%)
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const trends = {
            visits: calculateTrend(metrics.visits, prevMetrics.visits),
            uniqueUsers: calculateTrend(metrics.uniqueUsers, prevMetrics.uniqueUsers),
            revenue: calculateTrend(metrics.revenue, prevMetrics.revenue),
            orders: calculateTrend(metrics.ordersCount, prevMetrics.ordersCount)
        };

        // 5. Conversion Rates
        const conversionRate = metrics.uniqueUsers > 0 ? (metrics.ordersCount / metrics.uniqueUsers) * 100 : 0;
        const prevConversionRate = prevMetrics.uniqueUsers > 0 ? (prevMetrics.ordersCount / prevMetrics.uniqueUsers) * 100 : 0;
        const conversionTrend = calculateTrend(conversionRate, prevConversionRate);

        const revenuePerUser = metrics.uniqueUsers > 0 ? metrics.revenue / metrics.uniqueUsers : 0;

        // 6. Detailed breakdowns for charts
        const deviceTotals = { mobile: 0, desktop: 0, tablet: 0 };
        const pages: Record<string, number> = {};
        const sources: Record<string, number> = {};

        // --- Helper to beautify page names ---
        const getReadablePageName = (rawPath: string) => {
            // Raw paths often come from DB as 'buy_sku-123' or 'home'
            if (rawPath === 'home' || rawPath === '/') return 'Home Page';

            let path = rawPath.replace(/_/g, '/');
            if (!path.startsWith('/')) path = '/' + path;

            // Clean common routes
            if (path === '/buy') return 'Shop / Buy';
            if (path === '/sell') return 'Sell Device';
            if (path === '/repair') return 'Repair Service';
            if (path === '/track') return 'Order Tracking';
            if (path === '/cart') return 'Shopping Cart';
            if (path === '/profile') return 'User Profile';
            if (path === '/checkout') return 'Checkout';
            if (path === '/contact') return 'Contact Us';
            if (path === '/categories') return 'Categories';

            // Dynamic Routes
            if (path.startsWith('/admin')) return `Admin: ${path.replace('/admin/', '')}`;
            if (path.startsWith('/buy/')) return `Product: ${path.replace('/buy/', '')}`;
            if (path.startsWith('/blog/')) return `Blog: ${path.replace('/blog/', '')}`;

            return path;
        };

        currentTraffic.forEach(day => {
            if (day.devices) {
                deviceTotals.mobile += (day.devices.mobile || 0);
                deviceTotals.desktop += (day.devices.desktop || 0);
                deviceTotals.tablet += (day.devices.tablet || 0);
            }
            if (day.pageViews) {
                Object.entries(day.pageViews).forEach(([p, c]) => {
                    const readableName = getReadablePageName(p);
                    pages[readableName] = (pages[readableName] || 0) + c;
                });
            }
            if (day.sources) {
                Object.entries(day.sources).forEach(([s, c]) => {
                    const clean = s.replace(/_/g, '.');
                    sources[clean] = (sources[clean] || 0) + c;
                });
            }
        });

        // 7. Daily Chart Data Construction
        const chartLabels: string[] = [];
        const chartVisits: number[] = [];
        const chartRevenue: number[] = [];

        // Arrays for Device Line Chart
        const deviceTrends = {
            mobile: [] as number[],
            desktop: [] as number[],
            tablet: [] as number[]
        };

        // Generate last N days labels even if no data
        for (let i = timeRange - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
            const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayTraffic = currentTraffic.find(t => t.id === dateStr || t.date === dateStr);
            const dayOrders = currentOrders.filter(o => o.date === dateStr);

            chartLabels.push(displayLabel);
            chartVisits.push((dayTraffic?.totalHits || dayTraffic?.totalVisits || 0));
            chartRevenue.push(dayOrders.reduce((acc, o) => acc + o.total, 0));

            // Push device counts for this day
            deviceTrends.mobile.push(dayTraffic?.devices?.mobile || 0);
            deviceTrends.desktop.push(dayTraffic?.devices?.desktop || 0);
            deviceTrends.tablet.push(dayTraffic?.devices?.tablet || 0);
        }

        return {
            metrics,
            trends,
            conversionRate,
            conversionTrend,
            revenuePerUser,
            deviceTotals,
            deviceTrends, // New field for line chart
            topPages: Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 10), // Increased to top 10
            topSources: Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5),
            chartData: {
                labels: chartLabels,
                visits: chartVisits,
                revenue: chartRevenue
            }
        };
    }, [trafficData, orders, timeRange, loading]);


    // --- CHARTS EFFECTS ---

    // 1. MAIN DUAL-AXIS CHART (Traffic vs Revenue)
    useEffect(() => {
        if (!analysis || !mainChartRef.current) return;
        if (mainInstance.current) mainInstance.current.destroy();

        const ctx = mainChartRef.current.getContext('2d');
        if (ctx) {
            // Create gradient for revenue line
            const gradientRevenue = ctx.createLinearGradient(0, 0, 0, 400);
            gradientRevenue.addColorStop(0, 'rgba(245, 158, 11, 0.5)'); // Amber top
            gradientRevenue.addColorStop(1, 'rgba(245, 158, 11, 0.0)'); // Transparent bottom

            mainInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: analysis.chartData.labels,
                    datasets: [
                        {
                            label: 'Visits',
                            data: analysis.chartData.visits,
                            backgroundColor: '#e2e8f0', // Slate 200
                            hoverBackgroundColor: '#94a3b8',
                            borderRadius: 4,
                            order: 2,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Revenue (NPR)',
                            data: analysis.chartData.revenue,
                            type: 'line',
                            borderColor: '#f59e0b', // Amber 500
                            backgroundColor: gradientRevenue,
                            borderWidth: 3,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#f59e0b',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            fill: true,
                            tension: 0.4,
                            order: 1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: { display: true, position: 'top', align: 'end' },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#cbd5e1',
                            borderColor: '#334155',
                            borderWidth: 1,
                            padding: 10,
                            usePointStyle: true,
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        if (context.dataset.type === 'line') {
                                            label += new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(context.parsed.y).replace('NPR', 'Rs.');
                                        } else {
                                            label += context.parsed.y;
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            grid: { display: false }
                        }
                    }
                }
            });
        }
        return () => { if (mainInstance.current) mainInstance.current.destroy(); }
    }, [analysis]);

    // 2. DEVICE TRENDS (Line Chart)
    useEffect(() => {
        if (!analysis || !deviceChartRef.current) return;
        if (deviceInstance.current) deviceInstance.current.destroy();

        const ctx = deviceChartRef.current.getContext('2d');
        if (ctx) {
            deviceInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: analysis.chartData.labels,
                    datasets: [
                        {
                            label: 'Mobile',
                            data: analysis.deviceTrends.mobile,
                            borderColor: '#f43f5e', // Rose
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Desktop',
                            data: analysis.deviceTrends.desktop,
                            borderColor: '#3b82f6', // Blue
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Tablet',
                            data: analysis.deviceTrends.tablet,
                            borderColor: '#10b981', // Emerald
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 6 } },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#cbd5e1',
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
                    }
                }
            });
        }
        return () => { if (deviceInstance.current) deviceInstance.current.destroy(); }
    }, [analysis]);

    // 3. Top Pages (Horizontal Bar - ENHANCED)
    useEffect(() => {
        if (!analysis || !pagesChartRef.current) return;
        if (pagesInstance.current) pagesInstance.current.destroy();

        const ctx = pagesChartRef.current.getContext('2d');
        if (ctx) {
            pagesInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: analysis.topPages.map(p => p[0]), // These are now the readable names
                    datasets: [{
                        label: 'Views',
                        data: analysis.topPages.map(p => p[1]),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
                        borderRadius: 4,
                        barThickness: 24, // Thicker bars
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#fff',
                            bodyColor: '#cbd5e1',
                            padding: 12,
                            callbacks: {
                                title: (items) => items[0].label // Show full page name
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 10 } }
                        },
                        y: {
                            grid: { display: false },
                            ticks: {
                                // @ts-ignore - Fix for Chart.js type issue with font weight
                                // FIX: Changed numeric font weight '600' to 'bold' string to match Chart.js types.
                                font: { size: 11, weight: 'bold' },
                                color: '#334155',
                                autoSkip: false, // Ensure all labels show
                            }
                        }
                    }
                }
            });
        }
        return () => { if (pagesInstance.current) pagesInstance.current.destroy(); }
    }, [analysis]);

    // ... (rest of the component render remains the same)
    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (!analysis) return <div className="p-10 text-center">No data available.</div>;

    return (
        <div className="animate-fade-in pb-20 space-y-8">
            {/* ... (rest of the JSX) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm flex items-center gap-2">
                        Analytics <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full uppercase tracking-widest border border-amber-200">Pro</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Performance metrics & conversion insights.</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {[7, 14, 30, 60].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${timeRange === days ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            {days} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards Row 1: Traffic & Conversion */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Visits */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Visits</span>
                        <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <GlobeAltIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-black text-slate-800">{analysis.metrics.visits.toLocaleString()}</span>
                        <TrendIndicator value={analysis.trends.visits} />
                    </div>
                </div>

                {/* Unique Users */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Unique Users</span>
                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <UsersIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-black text-slate-800">{analysis.metrics.uniqueUsers.toLocaleString()}</span>
                        <TrendIndicator value={analysis.trends.uniqueUsers} />
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-200 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Revenue</span>
                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                            <BanknotesIcon className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-black text-slate-800 truncate">Rs. {analysis.metrics.revenue.toLocaleString()}</span>
                        <TrendIndicator value={analysis.trends.revenue} />
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-rose-200 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
                        <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-rose-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-black text-slate-800">{analysis.conversionRate.toFixed(2)}%</span>
                        <TrendIndicator value={analysis.conversionTrend} />
                    </div>
                </div>
            </div>

            {/* Main Analysis Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Traffic vs. Revenue</h3>
                    <p className="text-xs text-slate-400 mb-6">Correlate visitor spikes with sales performance over the last {timeRange} days.</p>
                    <div className="h-80 w-full relative">
                        <canvas ref={mainChartRef} />
                    </div>
                </div>
            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Device Trends (Line Chart) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Device Trends</h3>
                    <div className="h-48 w-full relative">
                        <canvas ref={deviceChartRef} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-4">
                        <div className="p-2 rounded-lg">
                            <p className="text-[10px] uppercase font-bold text-rose-500 mb-1">Mobile</p>
                            <p className="text-sm font-black text-slate-800">{analysis.deviceTotals.mobile}</p>
                        </div>
                        <div className="p-2 rounded-lg border-l border-r border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Desktop</p>
                            <p className="text-sm font-black text-slate-800">{analysis.deviceTotals.desktop}</p>
                        </div>
                        <div className="p-2 rounded-lg">
                            <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Tablet</p>
                            <p className="text-sm font-black text-slate-800">{analysis.deviceTotals.tablet}</p>
                        </div>
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Most Visited Pages</h3>
                    <div className="h-64 w-full relative">
                        <canvas ref={pagesChartRef} />
                    </div>
                </div>

                {/* Traffic Sources List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Top Referrers</h3>
                    <div className="space-y-3">
                        {analysis.topSources.map((source, idx) => (
                            <div key={source[0]} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${idx < 3 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                                    <span className="text-sm font-bold text-slate-700 capitalize">{source[0]}</span>
                                </div>
                                <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shadow-sm">
                                    {source[1]}
                                </span>
                            </div>
                        ))}
                        {analysis.topSources.length === 0 && <p className="text-sm text-slate-400 italic">No referral data yet.</p>}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default AdminAnalyticsPage;
