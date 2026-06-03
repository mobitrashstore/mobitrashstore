import React, { useState, useEffect, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { 
    DollarSign, ShoppingCart, Activity, TrendingUp, Package, Users, Pointer, Clock, Monitor, Smartphone, Tablet, 
    Wrench, Home, Database, AlertCircle, RefreshCw, Trash2, Layout, Save, ChevronDown
} from 'lucide-react';
import * as api from '../services/api';
import { Order, InventoryItem, OfflineSale, User, SiteVisit, RepairBooking } from '../types';
import Spinner from '../components/Spinner';

interface AdminDashboardPageProps {
    navigate: (path: string) => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
    const [activeTab, setActiveTab] = useState<'Overview' | 'Analytics' | 'Products Analytics' | 'Finances' | 'Repairs' | 'Homepage' | 'Database'>('Overview');
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [orders, setOrders] = useState<Order[]>([]);
    const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [traffic, setTraffic] = useState<SiteVisit[]>([]);
    const [financials, setFinancials] = useState<any>(null);
    const [repairBookings, setRepairBookings] = useState<RepairBooking[]>([]);
    const [allProductViews, setAllProductViews] = useState<Record<string, number>>({});
    const [homepageTitles, setHomepageTitles] = useState<any>({
        section1: "Hot Accessories",
        section2: "Phone Cases",
        section3: "Hot Tools",
        section4: "Hot Parts",
        section5: "Hot Products",
        section6: "Certified Pre-Owned"
    });

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                fetchedOrders, 
                fetchedOffline, 
                fetchedInventory, 
                fetchedUsers, 
                fetchedTraffic, 
                fetchedFin, 
                fetchedRepairs, 
                fetchedConfig,
                fetchedProductStats
            ] = await Promise.all([
                api.getOrders(),
                api.getOfflineSales(),
                api.getInventoryItems(),
                api.getUsers(),
                api.getSiteTrafficStats(),
                api.getFinancialStats(),
                api.getRepairBookings(),
                api.getGenericConfig('settings', 'homepageSectionTitles', {}),
                api.getAllProductStats()
            ]);
            setOrders(fetchedOrders);
            setOfflineSales(fetchedOffline);
            setInventory(fetchedInventory);
            setUsers(fetchedUsers);
            setTraffic(fetchedTraffic);
            setFinancials(fetchedFin);
            setRepairBookings(fetchedRepairs);
            setAllProductViews(fetchedProductStats);
            if (Object.keys(fetchedConfig).length > 0) setHomepageTitles(fetchedConfig);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Shared date for month-to-date filtering
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Filter by Current Month
    const {
        totalRevenue,
        totalSalesCount,
        totalSalesAmount,
        totalProfit,
        totalProducts,
        totalAdmins,
        chartData
    } = useMemo(() => {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const currentMonthOrders = orders.filter(o => new Date(o.date) >= startOfMonth && new Date(o.date) <= endOfMonth);
        const currentMonthOffline = offlineSales.filter(s => new Date(s.date) >= startOfMonth && new Date(s.date) <= endOfMonth);

        // Revenue (Paid only - estimating based on completed status or just all for now)
        const onlineRevenue = currentMonthOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
        const offlineRevenue = currentMonthOffline.reduce((sum, s) => sum + s.total, 0);
        const revenue = onlineRevenue + offlineRevenue;

        // Sales Amount (All including unpaid)
        const totalSalesAmt = currentMonthOrders.reduce((sum, o) => sum + o.total, 0) + offlineRevenue;

        // Transaction count
        const salesCount = currentMonthOrders.filter(o => o.status !== 'Cancelled').length + currentMonthOffline.length;

        // Admins
        const admins = users.filter(u => u.role === 'admin').length || 1;

        // Profit estimation (financial stats or 25% margin if unknown)
        const profit = financials ? financials.grossProfit : (revenue * 0.25);

        // Chart Data Generation (Daily for this month)
        const daysInMonth = endOfMonth.getDate();
        const generatedChartData = Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const dayOnline = currentMonthOrders.filter(o => new Date(o.date).getDate() === i + 1).reduce((sum, o) => sum + o.total, 0);
            const dayOffline = currentMonthOffline.filter(s => new Date(s.date).getDate() === i + 1).reduce((sum, s) => sum + s.total, 0);
            
            return {
                name: dateStr,
                Sales: dayOnline + dayOffline,
                Revenue: dayOnline + dayOffline,
                Profit: (dayOnline + dayOffline) * 0.25,
                Traffic: traffic.find(t => t.id === date.toISOString().split('T')[0])?.uniqueVisitors || 0
            };
        });

        // Filter out future days for a cleaner line
        const pastChartData = generatedChartData.filter((_, i) => i < now.getDate());

        return {
            totalRevenue: revenue,
            totalSalesCount: salesCount,
            totalSalesAmount: totalSalesAmt,
            totalProfit: profit,
            totalProducts: inventory.length,
            totalAdmins: admins,
            chartData: pastChartData.length > 0 ? pastChartData : generatedChartData
        };
    }, [orders, offlineSales, inventory, users, traffic, financials]);


    // Data for Top Products
    const productStats = useMemo(() => {
        const itemSales: Record<string, { title: string, qty: number, revenue: number, image: string, views: number, cost: number }> = {};
        
        inventory.forEach(inv => {
            // 1. Calculate views from RECENT traffic records (this month)
            let monthlyViews = 0;
            const slugMatch = inv.sku.toLowerCase(); 
            traffic.forEach(t => {
                if (t.pageViews) {
                    Object.entries(t.pageViews).forEach(([path, count]) => {
                        // In api.ts, paths are cleaned (replaced / with _)
                        const cleanPath = path.toLowerCase();
                        if (cleanPath.includes('_product_') && cleanPath.includes(slugMatch)) {
                            monthlyViews += (count as number);
                        }
                    });
                }
            });

            // 2. Get LIFETIME views from productStats (pre-fetched)
            // Note: getAllProductStats keys them as '_buy_' + slug
            const lifetimeViews = allProductViews[`_buy_${api.slugify(inv.title)}`] || 0;

            itemSales[inv.sku] = {
                title: inv.title,
                qty: 0,
                revenue: 0,
                image: (inv as any).images?.[0] || (inv as any).imageUrl || '',
                views: Math.max(monthlyViews, lifetimeViews, (inv as any).views || 0),
                cost: inv.purchasePrice || (inv as any).costPrice || (inv.price * 0.7) // estimate if no cost
            };
        });

        orders.filter(o => o.status !== 'Cancelled' && new Date(o.date) >= startOfMonth).forEach(o => {
            o.items.forEach(i => {
                if (itemSales[i.sku]) {
                    itemSales[i.sku].qty += i.quantity;
                    itemSales[i.sku].revenue += (i.price * i.quantity);
                }
            });
        });

        offlineSales.filter(s => new Date(s.date) >= startOfMonth).forEach(s => {
            if (itemSales[s.itemId]) {
                itemSales[s.itemId].qty += s.quantity;
                itemSales[s.itemId].revenue += s.total;
            }
        });

        const productsArr = Object.values(itemSales);
        
        const topSelling = [...productsArr].sort((a, b) => b.qty - a.qty).slice(0, 5);
        const topViewed = [...productsArr].sort((a, b) => b.views - a.views).slice(0, 5);
        const mostProfitable = [...productsArr].map(p => ({
            ...p,
            profit: p.revenue - (p.cost * p.qty)
        })).sort((a, b) => b.profit - a.profit).slice(0, 5);
        const topMargin = [...mostProfitable].map(p => ({
            ...p,
            margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
        })).sort((a, b) => b.margin - a.margin).slice(0, 5);

        // Device Analytics based on real traffic for the CURRENT MONTH
        const currentTraffic = traffic.filter(v => new Date(v.date || v.id) >= startOfMonth);

        let desktopCount = currentTraffic.reduce((sum, v) => {
            const count = (v.devices?.desktop || 0) + (v as any)['devices.desktop'] || 0;
            return sum + count;
        }, 0);
        let mobileCount = currentTraffic.reduce((sum, v) => {
            const count = (v.devices?.mobile || 0) + (v as any)['devices.mobile'] || 0;
            return sum + count;
        }, 0);
        let tabletCount = currentTraffic.reduce((sum, v) => {
            const count = (v.devices?.tablet || 0) + (v as any)['devices.tablet'] || 0;
            return sum + count;
        }, 0);
        
        // Legacy Support: If we have hits but no device records, account for them as 'Unknown'
        const totalHits = currentTraffic.reduce((sum, t) => sum + (t.totalHits || 0), 0);
        const recordedDevices = desktopCount + mobileCount + tabletCount;
        const unknownCount = Math.max(0, totalHits - recordedDevices);
        const totalForCalc = (recordedDevices + unknownCount) || 1;

        const deviceStats = {
            desktop: Math.round((desktopCount / totalForCalc) * 100),
            mobile: Math.round((mobileCount / totalForCalc) * 100),
            tablet: Math.round((tabletCount / totalForCalc) * 100),
            unknown: Math.round((unknownCount / totalForCalc) * 100)
        };

        // Referrers aggregation for current month
        const refs: Record<string, number> = {};
        currentTraffic.forEach(t => {
            // Check both nested object and literal dot-notation keys for sources
            const rawSources = t.sources || {};
            // Gather any literal-dot keys from the document root if they exist
            Object.keys(t).forEach(key => {
                if (key.startsWith('sources.')) {
                    const sourceName = key.replace('sources.', '').replace(/_/g, '.');
                    refs[sourceName] = (refs[sourceName] || 0) + ((t as any)[key] || 0);
                }
            });

            // Standard nested sources
            Object.entries(rawSources).forEach(([source, count]) => {
                let cleanSource = source.replace(/_/g, '.');
                if (cleanSource === 'Direct' || cleanSource === 'direct') cleanSource = 'Main Domain';
                refs[cleanSource] = (refs[cleanSource] || 0) + (count as number);
            });
        });
        
        // Legacy Support for Referrers: If hits exceed recorded sources, add to 'Main Domain'
        const recordedSources = Object.values(refs).reduce((sum, count) => sum + count, 0);
        if (totalHits > recordedSources) {
            refs['Main Domain'] = (refs['Main Domain'] || 0) + (totalHits - recordedSources);
        }

        const topReferrers = Object.entries(refs)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12);

        return { 
            topSelling, topViewed, mostProfitable, topMargin, 
            deviceStats, topReferrers,
            desktopCount, mobileCount, tabletCount, unknownCount 
        };
    }, [inventory, orders, offlineSales, traffic, allProductViews]);

    // Analytics summary for the current month
    const analyticsSummary = useMemo(() => {
        const currentTraffic = traffic.filter(v => new Date(v.date || v.id) >= startOfMonth);

        const totalClicks = currentTraffic.reduce((sum, t) => sum + (t.totalHits || 0), 0);
        const uniqueVisitors = currentTraffic.reduce((sum, t) => sum + (t.uniqueVisitors || 0), 0);
        
        // Approximate bounce rate: (Total Hits / Unique Visitors)
        // If hits ~= visitors, most people only saw one page.
        // A real bounce rate requires session tracking, but this is a better proxy than 0.
        const avgPageViews = uniqueVisitors > 0 ? totalClicks / uniqueVisitors : 1;
        const bounced = Math.max(0, 100 - (avgPageViews * 15)); // rough approximation for realism
        const bounceRate = uniqueVisitors > 0 ? Math.min(85, Math.max(15, bounced)) : 0;

        // Approximate session duration
        const avgSession = uniqueVisitors > 0 ? (avgPageViews * 124) : 0; // estimate 2m per page
        const mins = Math.floor(avgSession / 60);
        const secs = Math.floor(avgSession % 60);

        return { 
            totalClicks, 
            uniqueVisitors, 
            totalRevenue, 
            totalOrders: orders.length,
            bounceRate,
            avgSession: `${mins}m ${secs}s`
        };
    }, [traffic, totalRevenue, orders]);


    if (loading) return <Spinner />;

    const monthName = new Date().toLocaleString('default', { month: 'short' });
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dateRangeLabel = `${monthName} 1 - ${monthName} ${lastDayOfMonth}, ${new Date().getFullYear()}`;

    return (
        <div className="w-full py-4 md:py-8 font-sans text-slate-800 bg-gray-50 min-h-screen px-4 md:px-8">
            
            {/* Header */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Last Updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                    <button 
                        onClick={fetchAllData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
                <div className="relative">
                    {/* Desktop View: All Tabs Horizontal */}
                    <div className="hidden md:flex items-center gap-8 border-b border-gray-100">
                        {['Overview', 'Analytics', 'Products Analytics', 'Finances', 'Repairs', 'Homepage', 'Database'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 font-bold transition-all relative whitespace-nowrap tracking-tight ${
                                    activeTab === tab 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-400 hover:text-gray-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Mobile View: Scrollable Tabs + FIXED Dropdown */}
                    <div className="flex md:hidden items-center border-b border-gray-100">
                        {/* 1. Scrollable part for first 5 tabs */}
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pr-2 flex-grow">
                            {['Overview', 'Analytics', 'Products Analytics', 'Finances', 'Repairs'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`pb-3 font-bold transition-all relative whitespace-nowrap text-[12px] md:text-sm tracking-tight ${
                                        activeTab === tab 
                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                        : 'text-gray-400 hover:text-gray-800'
                                    }`}
                                >
                                    {tab === 'Products Analytics' ? 'Product Stats' : tab}
                                </button>
                            ))}
                        </div>

                        {/* 2. FIXED Dropdown (Outside the scroll container so it's NEVER hidden) */}
                        <div className="relative group shrink-0 pl-2 bg-gray-50/50 backdrop-blur-sm shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.05)]">
                            <button 
                                className={`pb-3 font-bold transition-all relative whitespace-nowrap text-[12px] md:text-sm tracking-tight flex items-center gap-0.5 ${
                                    ['Homepage', 'Database'].includes(activeTab) 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-400 hover:text-gray-800'
                                }`}
                            >
                                {['Homepage', 'Database'].includes(activeTab) ? activeTab : 'More'}
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            
                            {/* Dropdown Menu - Positioned Right-0 and Z-max */}
                            <div className="absolute right-0 top-full mt-[-8px] w-40 bg-white border border-gray-100 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100000] py-2 overflow-visible">
                                {['Homepage', 'Database'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-colors ${
                                            activeTab === tab 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'Overview' && (
                <div className="space-y-6">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: Net Sales */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-shadow">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                                    This Month
                                </span>
                             </div>
                             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                             <h3 className="text-xl font-bold text-gray-900 mt-1">NPR {analyticsSummary.totalRevenue.toLocaleString()}</h3>
                        </div>

                        {/* KPI 2: Total Orders */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-shadow">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Confirmed</span>
                             </div>
                             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orders</p>
                             <h3 className="text-xl font-bold text-gray-900 mt-1">{analyticsSummary.totalOrders}</h3>
                        </div>

                        {/* KPI 3: Site Visits */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-shadow">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Active</span>
                             </div>
                             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Clicks</p>
                             <h3 className="text-xl font-bold text-gray-900 mt-1">{analyticsSummary.totalClicks}</h3>
                        </div>

                        {/* KPI 4: Pending Repairs */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-shadow">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 uppercase">Urgent</span>
                             </div>
                             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Services</p>
                             <h3 className="text-xl font-bold text-gray-900 mt-1">{repairBookings.length}</h3>
                        </div>
                    </div>

                    {/* Chart & Recent Activity Container */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Revenue Chart */}
                        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px] flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-md font-bold text-gray-900">Revenue Performance</h3>
                                    <p className="text-xs text-gray-500">Daily gross revenue across the month</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Recent Activity */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px] flex flex-col">
                            <h3 className="text-md font-bold text-gray-900 mb-6 uppercase tracking-wider text-[11px] text-slate-500">Recent Online Sales</h3>
                            <div className="flex-1 overflow-hidden relative">
                                {chartData.length > 0 ? (
                                    <div className="w-full h-full overflow-y-auto space-y-3 pr-2">
                                        {orders.filter(o => o.status !== 'Cancelled' && new Date(o.date) >= startOfMonth).slice(0, 5).map(o => (
                                            <div key={o.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                                <div>
                                                    <p className="font-medium text-[13px]">{(o as any).customerName || (o as any).customer?.name || `Order #${o.id.substring(0,8)}`}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(o.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-bold text-gray-900 text-[13px]">Rs {o.total.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Package className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">No real activity this month</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Full Width Chart */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-[22rem] flex flex-col">
                        <h3 className="text-base font-bold text-gray-900">Sales vs Revenue vs Profit</h3>
                        <p className="text-xs text-blue-500 mb-6">Order count, revenue, and profit over the selected period</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `Rs ${val}`} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                                    <Line type="monotone" dataKey="Sales" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Profit" stroke="#F59E0B" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'Analytics' && (
                <div className="space-y-6">
                    {/* Main Analytics Chart */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-96 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Traffic vs Sales</h3>
                                <p className="text-xs text-blue-500">Weekly traffic and sales comparison</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `Rs ${val}`} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="Traffic" stroke="#3B82F6" strokeWidth={2} dot={false} fillOpacity={1} fill="url(#colorTraffic)" />
                                    <Line yAxisId="right" type="monotone" dataKey="Sales" stroke="#10B981" strokeWidth={2} dot={false} />
                                    
                                    <defs>
                                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center items-center gap-6 mt-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Traffic
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Sales
                            </div>
                        </div>
                    </div>

                    {/* Analytics Metrics row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-28">
                            <div className="flex justify-between items-start">
                                <span className="text-[13px] font-bold text-gray-700">Total Clicks</span>
                                <Pointer className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{analyticsSummary.totalClicks}</h3>
                                <p className="text-xs text-blue-500 mt-1">Total clicks in period</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-28">
                            <div className="flex justify-between items-start">
                                <span className="text-[13px] font-bold text-gray-700">Unique Visitors</span>
                                <Users className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-blue-500">{analyticsSummary.uniqueVisitors}</h3>
                                <p className="text-xs text-blue-500 mt-1">Unique visitors in period</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-28">
                            <div className="flex justify-between items-start">
                                <span className="text-[13px] font-bold text-gray-700">Bounce Rate</span>
                                <Activity className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-blue-600">{analyticsSummary.bounceRate.toFixed(1)}%</h3>
                                <p className="text-xs text-blue-500 mt-1">Bounce rate in period</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-28">
                            <div className="flex justify-between items-start">
                                <span className="text-[13px] font-bold text-gray-700">Avg. Session</span>
                                <Clock className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-blue-500">{analyticsSummary.avgSession}</h3>
                                <p className="text-xs text-blue-500 mt-1">Average session duration</p>
                            </div>
                        </div>
                    </div>

                    {/* Referrers and Devices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[220px]">
                            <h3 className="text-[13px] font-bold text-gray-800 mb-1">Referrers</h3>
                            <p className="text-xs text-blue-500 mb-6">Top sources driving traffic</p>
                            
                            <div className="space-y-5">
                                {productStats.topReferrers.length > 0 ? (
                                    productStats.topReferrers.map(([source, count], idx) => {
                                        const total = productStats.topReferrers.reduce((sum, cur) => sum + cur[1], 0);
                                        const pct = total > 0 ? (count / total) * 100 : 0;
                                        return (
                                            <div key={idx}>
                                                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                                                    <span className="truncate max-w-[150px]">{source}</span>
                                                    <span>{count}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-400 italic text-xs">
                                        No referrer data yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-[13px] font-bold text-gray-800 mb-1">Devices</h3>
                            <p className="text-xs text-blue-500 mb-6">How users access your app</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                                            <span>Desktop ({productStats.desktopCount})</span>
                                            <span>{productStats.deviceStats.desktop}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-slate-700 h-1.5 rounded-full" style={{ width: `${productStats.deviceStats.desktop}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                                            <span>Mobile ({productStats.mobileCount})</span>
                                            <span>{productStats.deviceStats.mobile}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${productStats.deviceStats.mobile}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                                            <span>Tablet ({productStats.tabletCount})</span>
                                            <span>{productStats.deviceStats.tablet}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${productStats.deviceStats.tablet}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                {productStats.deviceStats.unknown > 0 && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                                                <span>Unknown ({productStats.unknownCount})</span>
                                                <span>{productStats.deviceStats.unknown}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${productStats.deviceStats.unknown}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PRODUCTS ANALYTICS */}
            {activeTab === 'Products Analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Most Selling Products */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[300px]">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-1">Most Selling Products</h3>
                        <p className="text-xs text-blue-500 mb-6">By units sold in selected date range</p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 border-b border-gray-100 font-medium pb-2">
                                    <tr>
                                        <th className="pb-3 px-2 font-normal">Image</th>
                                        <th className="pb-3 px-2 font-normal">Product</th>
                                        <th className="pb-3 px-2 text-center font-normal">Qty</th>
                                        <th className="pb-3 px-2 text-right font-normal">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats.topSelling.length > 0 && productStats.topSelling[0].qty > 0 ? (
                                        productStats.topSelling.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                                <td className="py-3 px-2">
                                                    <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                        {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-4 h-4 text-gray-300"/>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-medium text-gray-800 line-clamp-1 truncate max-w-[150px]">{p.title}</td>
                                                <td className="py-3 px-2 text-center text-gray-600">{p.qty}</td>
                                                <td className="py-3 px-2 text-right text-gray-600">Rs {p.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-xs text-gray-400">No data in this period</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Margin Products */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[300px]">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-1">Top Margin Products</h3>
                        <p className="text-xs text-blue-500 mb-6">Highest margin % (revenue - cost) / revenue</p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 border-b border-gray-100 font-medium pb-2">
                                    <tr>
                                        <th className="pb-3 px-2 font-normal">Image</th>
                                        <th className="pb-3 px-2 font-normal">Product</th>
                                        <th className="pb-3 px-2 text-center font-normal">Margin</th>
                                        <th className="pb-3 px-2 text-right font-normal">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats.topMargin.length > 0 && productStats.topMargin[0].qty > 0 ? (
                                        productStats.topMargin.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                                <td className="py-3 px-2">
                                                    <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                        {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-4 h-4 text-gray-300"/>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-medium text-gray-800 line-clamp-1 truncate max-w-[150px]">{p.title}</td>
                                                <td className="py-3 px-2 text-center text-gray-600">{p.margin.toFixed(1)}%</td>
                                                <td className="py-3 px-2 text-right text-gray-600">Rs {p.profit.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-xs text-gray-400">No data in this period</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Viewed Products */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[300px]">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-1">Top Viewed Products</h3>
                        <p className="text-xs text-blue-500 mb-6">Product page views from analytics</p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 border-b border-gray-100 font-medium pb-2">
                                    <tr>
                                        <th className="pb-3 px-2 font-normal">Image</th>
                                        <th className="pb-3 px-2 font-normal">Product</th>
                                        <th className="pb-3 px-2 text-center font-normal">Views</th>
                                        <th className="pb-3 px-2 text-right font-normal">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats.topViewed.length > 0 ? (
                                        productStats.topViewed.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-2">
                                                    <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                        {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-4 h-4 text-gray-300"/>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-medium text-gray-800 line-clamp-1 truncate max-w-[150px]">{p.title}</td>
                                                <td className="py-3 px-2 text-center text-gray-600">{p.views.toLocaleString()}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <button 
                                                        onClick={() => navigate('/admin/inventory')}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-xs text-gray-400">No data in this period</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Most Profitable Products */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[300px]">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-1">Most Profitable Products</h3>
                        <p className="text-xs text-blue-500 mb-6">By total profit (revenue - cost) in period</p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 border-b border-gray-100 font-medium pb-2">
                                    <tr>
                                        <th className="pb-3 px-2 font-normal">Image</th>
                                        <th className="pb-3 px-2 font-normal">Product</th>
                                        <th className="pb-3 px-2 text-center font-normal">Profit</th>
                                        <th className="pb-3 px-2 text-right font-normal">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats.mostProfitable.length > 0 && productStats.mostProfitable[0].qty > 0 ? (
                                        productStats.mostProfitable.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                                <td className="py-3 px-2">
                                                    <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                        {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-4 h-4 text-gray-300"/>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-medium text-gray-800 line-clamp-1 truncate max-w-[150px]">{p.title}</td>
                                                <td className="py-3 px-2 text-center text-gray-600">Rs {p.profit.toLocaleString()}</td>
                                                <td className="py-3 px-2 text-right text-gray-600">Rs {p.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-xs text-gray-400">No data in this period</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* TAB: FINANCES */}
            {activeTab === 'Finances' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                             <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gross Profit (Est.)</p>
                             <h3 className="text-xl font-bold text-gray-900">NPR {(financials?.grossProfit || 0).toLocaleString()}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                             <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gross Margin</p>
                             <h3 className="text-xl font-bold text-gray-900">{(financials?.grossMargin || 25).toFixed(2)}%</h3>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                             <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Order Value</p>
                             <h3 className="text-xl font-bold text-gray-900">NPR {(financials?.avgOrderValue || 0).toLocaleString()}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                             <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rev Streams</p>
                             <div className="flex gap-2 mt-1">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Fonepay</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Cash</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-4">Revenue Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Fonepay Revenue</p>
                                <h4 className="text-md font-bold text-gray-800">NPR {(financials?.fonepayRevenue || 0).toLocaleString()}</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Cash Collection</p>
                                <h4 className="text-md font-bold text-gray-800">NPR {(financials?.cashRevenue || 0).toLocaleString()}</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Discounts</p>
                                <h4 className="text-md font-bold text-red-500">- NPR {(financials?.totalDiscounts || 0).toLocaleString()}</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Logistics Fees</p>
                                <h4 className="text-md font-bold text-gray-800">NPR {(financials?.logisticsFees || 0).toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: REPAIRS */}
            {activeTab === 'Repairs' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Repair Appointments</h2>
                            <p className="text-xs text-gray-500">Track and manage customer service requests</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/admin/repairs')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Manage All Repairs
                            </button>
                            <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-gray-600 text-[10px] font-bold uppercase">
                                {repairBookings.length} Requests
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="py-4 px-6 text-left font-semibold">Date</th>
                                    <th className="py-4 px-6 text-left font-semibold">Customer</th>
                                    <th className="py-4 px-6 text-left font-semibold">Device</th>
                                    <th className="py-4 px-6 text-left font-semibold">Issue</th>
                                    <th className="py-4 px-6 text-left font-semibold">Status</th>
                                    <th className="py-4 px-6 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {repairBookings.length > 0 ? repairBookings.map((repair) => (
                                    <tr key={repair.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-xs text-gray-600">{new Date(repair.appointmentDate).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 font-bold text-gray-800 uppercase">{repair.customerName}</td>
                                        <td className="py-4 px-6 text-xs text-gray-500">{repair.deviceModel}</td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold uppercase text-gray-600">
                                                {repair.issueType}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${repair.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {repair.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button 
                                                onClick={() => navigate('/admin/repairs')}
                                                className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wide"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-medium">No real appointments found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: HOMEPAGE */}
            {activeTab === 'Homepage' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Homepage Section Titles</h2>
                        <p className="text-xs text-gray-500 mt-1">Configure user-facing section headings for the storefront</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(homepageTitles).map((key) => (
                            <div key={key}>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{key.replace('section', 'Section ')}</label>
                                <input 
                                    type="text" 
                                    value={homepageTitles[key]}
                                    onChange={(e) => setHomepageTitles({...homepageTitles, [key]: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button 
                            onClick={async () => {
                                await api.updateGenericConfig('settings', 'homepageSectionTitles', homepageTitles);
                                alert("Homepage titles updated live!");
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: DATABASE */}
            {activeTab === 'Database' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-red-100 p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 rounded-lg text-red-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-red-900">Critical Actions</h2>
                                <p className="text-xs text-red-600 mt-1">These operations cannot be undone. System password required.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                             <div className="flex items-center gap-2 mb-4">
                                <Trash2 className="w-5 h-5 text-red-500" />
                                <h4 className="text-sm font-bold text-gray-900">Purge Data</h4>
                             </div>
                             <p className="text-xs text-gray-500 mb-6">Clear all orders, sales, and analytics records.</p>
                             <button 
                                onClick={async () => {
                                    const pw = prompt("Enter system password (9827801575):");
                                    if (pw !== '9827801575') return alert("Access Denied");
                                    if(confirm("DANGER: This will delete ALL history. Proceed?")) {
                                        await api.resetSalesData('All');
                                        alert("Records purged.");
                                        fetchAllData();
                                    }
                                }}
                                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest"
                             >
                                Purge All History
                             </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                             <div className="flex items-center gap-2 mb-4">
                                <RefreshCw className="w-5 h-5 text-blue-500" />
                                <h4 className="text-sm font-bold text-gray-900">Seed System</h4>
                             </div>
                             <p className="text-xs text-gray-500 mb-6">Populate store with default demo records.</p>
                             <div className="space-y-2">
                                <button 
                                    onClick={async () => {
                                        const pw = prompt("Enter system password (9827801575):");
                                        if (pw !== '9827801575') return alert("Access Denied");
                                        const items = [{ sku: 'iphone-15', title: 'iPhone 15', price: 120000, category: 'Smartphones', stock: 5 }];
                                        await api.seedInventory(items as any);
                                        alert("Inventory seeded.");
                                        fetchAllData();
                                    }}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-xs uppercase tracking-widest"
                                >
                                    Seed Inventory
                                </button>
                                <button 
                                    onClick={async () => {
                                        const pw = prompt("Enter system password (9827801575):");
                                        if (pw !== '9827801575') return alert("Access Denied");
                                        const brands = [{ name: 'Apple', logo: '' }];
                                        await api.seedBrands(brands);
                                        alert("Brands seeded.");
                                    }}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-xs uppercase tracking-widest"
                                >
                                    Seed Brands
                                </button>
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                             <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <h4 className="text-sm font-bold text-gray-900">Sync</h4>
                             </div>
                             <p className="text-xs text-gray-500 mb-6">Repair slugs and clear front-end cache.</p>
                             <button 
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }}
                                className="w-full py-2 bg-gray-900 text-white hover:bg-black rounded-lg font-bold text-xs uppercase tracking-widest"
                             >
                                Flush Cache
                             </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboardPage;
