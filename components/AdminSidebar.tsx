
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CubeIcon } from './icons/CubeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from './icons/ChevronDoubleRightIcon';
import { DevicePhoneMobileIcon } from './icons/DevicePhoneMobileIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { HomeModernIcon } from './icons/HomeModernIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { PhotoIcon } from './icons/PhotoIcon';
import { BellIcon } from './icons/BellIcon';
import { GiftIcon } from './icons/GiftIcon';
import { TicketIcon } from './icons/TicketIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { StarIcon } from './icons/StarIcon';
import { TagIcon } from './icons/TagIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface AdminSidebarProps {
    navigate: (path: string) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobileOpen: boolean;
    setMobileOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
    path: string;
    label: string;
    icon: React.ReactNode;
    navigate: (path: string) => void;
    isCollapsed: boolean;
}> = ({ path, label, icon, navigate, isCollapsed }) => {
    const currentPath = window.location.pathname || '/';
    const isActive = currentPath.startsWith(path);

    return (
        <a
            href={path}
            onClick={(e) => { e.preventDefault(); navigate(path); }}
            title={isCollapsed ? label : undefined}
            className={`group relative flex items-center gap-3 px-3 py-2.5 mx-3 mb-1 text-sm font-medium transition-all duration-300 rounded-lg overflow-hidden
                ${isActive
                    ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-white shadow-sm ring-1 ring-blue-100/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                } 
                ${isCollapsed ? 'justify-center px-0 mx-2' : ''}
            `}
        >
            {/* Powerful Active Indicator */}
            {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></span>
            )}

            <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-blue-600' : 'group-hover:scale-110 group-hover:text-slate-700'}`}>
                {icon}
            </span>

            {!isCollapsed && (
                <span className={`relative z-10 truncate tracking-wide transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>
                    {label}
                </span>
            )}

            {/* Hover Glow Effect */}
            <span className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></span>
        </a>
    );
};

const navSections = [
    {
        title: "Operations",
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
            { path: '/admin/orders', label: 'Orders', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
            { path: '/admin/trade-ins', label: 'Sale Requests', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
            { path: '/admin/product-requests', label: 'Product Requests', icon: <ShoppingBagIcon className="w-5 h-5 text-emerald-600" /> },
            { path: '/admin/repairs', label: 'Repair Bookings', icon: <WrenchIcon className="w-5 h-5" /> },
            { path: '/admin/notebook/townplanning', label: 'Khata: Townplanning', icon: <CalendarDaysIcon className="w-5 h-5 text-amber-600" /> },
            { path: '/admin/notebook/nayabazar', label: 'Khata: Nayabazar', icon: <CalendarDaysIcon className="w-5 h-5 text-purple-600" /> },
            { path: '/admin/sales-log/townplanning', label: 'Log: Townplanning', icon: <DocumentTextIcon className="w-5 h-5 text-amber-600" /> },
            { path: '/admin/sales-log/nayabazar', label: 'Log: Nayabazar', icon: <DocumentTextIcon className="w-5 h-5 text-purple-600" /> },
        ]
    },
    {
        title: "Inventory",
        items: [
            { path: '/admin/inventory', label: 'Products (Online)', icon: <CubeIcon className="w-5 h-5" /> },
            { path: '/admin/store-stock/townplanning', label: 'Stock: Townplanning', icon: <BuildingOfficeIcon className="w-5 h-5 text-amber-600" /> },
            { path: '/admin/store-stock/nayabazar', label: 'Stock: Nayabazar', icon: <HomeModernIcon className="w-5 h-5 text-purple-600" /> },
            { path: '/admin/categories', label: 'Categories', icon: <Squares2x2Icon className="w-5 h-5" /> },
            { path: '/admin/brands', label: 'Brands', icon: <TagIcon className="w-5 h-5" /> },
        ]
    },
    {
        title: "Config",
        items: [
            { path: '/admin/sell-models', label: 'Sell Models', icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
            { path: '/admin/valuations', label: 'Valuations', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
        ]
    },
    {
        title: "Marketing",
        items: [
            { path: '/admin/coupons', label: 'Coupons', icon: <TicketIcon className="w-5 h-5" /> },
            { path: '/admin/points', label: 'Points & Referrals', icon: <GiftIcon className="w-5 h-5" /> },
            { path: '/admin/spin-wheel', label: 'Spin & Win', icon: <SparklesIcon className="w-5 h-5" /> },
            { path: '/admin/notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
            { path: '/admin/bulk-email', label: 'Bulk Email', icon: <EnvelopeIcon className="w-5 h-5 text-blue-500" /> },
            { path: '/admin/banners', label: 'Banners', icon: <PhotoIcon className="w-5 h-5" /> },
            { path: '/admin/notice-banner', label: 'Notice Banner', icon: <MegaphoneIcon className="w-5 h-5 text-emerald-600" /> },
        ]
    },
    {
        title: "Content",
        items: [
            { path: '/admin/gallery', label: 'Gallery', icon: <PhotoIcon className="w-5 h-5 text-purple-500" /> },
            { path: '/admin/news', label: 'News Channels', icon: <NewspaperIcon className="w-5 h-5 text-red-600" /> },
            { path: '/admin/blog', label: 'Blog', icon: <BookOpenIcon className="w-5 h-5" /> },
            { path: '/admin/testimonials', label: 'Testimonials', icon: <SparklesIcon className="w-5 h-5" /> },
            { path: '/admin/reviews', label: 'Product Reviews', icon: <StarIcon className="w-5 h-5" /> },
            { path: '/admin/contacts', label: 'Messages', icon: <EnvelopeIcon className="w-5 h-5" /> },
            { path: '/admin/problems', label: 'Problem Reports', icon: <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" /> },
        ]
    },
    {
        title: "System",
        items: [
            { path: '/admin/users', label: 'Users', icon: <UsersIcon className="w-5 h-5" /> },
            { path: '/admin/ml-features', label: 'ML Features', icon: <SparklesIcon className="w-5 h-5 text-purple-600" /> },
            { path: '/admin/about', label: 'About Manager', icon: <InformationCircleIcon className="w-5 h-5" /> },
            { path: '/admin/legal', label: 'Legal Pages', icon: <DocumentTextIcon className="w-5 h-5" /> },
            { path: '/admin/settings', label: 'Store Settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
            { path: '/admin/workflow', label: 'API Workflow', icon: <WorkflowIcon className="w-5 h-5" /> },
            { path: '/admin/seed', label: 'Seed Database', icon: <ArrowUpTrayIcon className="w-5 h-5" /> },
        ]
    }
];


const AdminSidebar: React.FC<AdminSidebarProps> = ({ navigate, isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* SIDEBAR CONTAINER - Sleek & Powerful */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 flex flex-col
                bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 shadow-2xl
                transition-all duration-300 ease-out
                ${isCollapsed ? 'w-20' : 'xl:w-72 lg:w-64 w-60'} 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                pt-[env(safe-area-inset-top)]
            `}>

                {/* 1. LOGO / BRANDING AREA */}
                <div className={`
                    flex items-center h-20 flex-shrink-0
                    ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'} 
                    border-b border-slate-100/80
                `}>
                    <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-3 overflow-hidden">
                        <div className="relative group p-1">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-transparent opacity-0 group-hover:opacity-50 rounded-full blur-lg transition-opacity duration-500"></div>
                            <img
                                src="/header-logo.png"
                                alt="Admin Logo"
                                className={`relative z-10 transition-all duration-300 ${isCollapsed ? 'h-8 w-auto' : 'h-8 w-auto'}`}
                            />
                        </div>
                    </a>

                    {/* Mobile Close */}
                    <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-800 md:hidden p-1.5 bg-slate-100 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. SCROLLABLE NAVIGATION */}
                <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent py-6 space-y-8">
                    {navSections.map((section, sectionIndex) => (
                        <div key={section.title} className="relative px-1">
                            {!isCollapsed && (
                                <h3 className="px-5 text-[10px] font-extrabold uppercase text-slate-400/80 tracking-[0.15em] mb-2 flex items-center gap-2">
                                    {section.title}
                                </h3>
                            )}

                            {/* Divider for collapsed mode */}
                            {isCollapsed && sectionIndex > 0 && <div className="h-px bg-slate-100 mx-6 my-4"></div>}

                            <div className="space-y-0.5">
                                {section.items.map(item => <NavLink key={item.path} {...item} navigate={navigate} isCollapsed={isCollapsed} />)}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* 3. FOOTER ACTIONS */}
                <div className="flex-shrink-0 p-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md">
                    <button
                        onClick={toggleCollapse}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                        className={`hidden md:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all mb-2 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {isCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
                        {!isCollapsed && <span>Collapse</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </>
    );
};

export default AdminSidebar;
