
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import AdminSidebar from './AdminSidebar';
import GlobalSearch from './GlobalSearch';
import { Bars3Icon } from './icons/Bars3Icon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon'; // Now the Send/PaperAirplane icon
import NotificationBell from './NotificationBell';
import { useTheme } from '../context/ThemeContext';

interface AdminLayoutProps {
    children: ReactNode;
    navigate: (path: string) => void;
}

// --- Nepali Date Converter Logic (Anchored to 1 Paush 2082 / Dec 17 2025) ---
import NepaliDate from 'nepali-date-converter';

// --- Nepali Date Converter Logic (Using Library) ---
const useNepaliDate = () => {
    const [nepaliDate, setNepaliDate] = useState('');

    useEffect(() => {
        const updateDate = () => {
            const today = new Date();
            // @ts-ignore - The library export structure requires .default in some environments
            const nd = new (NepaliDate.default || NepaliDate)(today);

            const monthNames = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Paush", "Magh", "Falgun", "Chaitra"];

            const day = nd.getDate();
            const monthIndex = nd.getMonth(); // 0-11
            const year = nd.getYear();
            const monthName = monthNames[monthIndex];

            const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });

            // Format: "4 FALGUN 2082, TUE"
            setNepaliDate(`${day} ${monthName.toUpperCase()} ${year}, ${dayName.toUpperCase()}`);
        };

        updateDate(); // Initial call
        const interval = setInterval(updateDate, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return nepaliDate;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, navigate }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [adminMobileHeaderHeight, setAdminMobileHeaderHeight] = useState(0);
    const [mounted, setMounted] = useState(false);
    const mobileHeaderRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => { setMounted(true); }, []);

    const nepaliDate = useNepaliDate();

    // Measure mobile header height
    useEffect(() => {
        if (mobileHeaderRef.current) {
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    // Use borderBoxSize if available to include padding/border
                    if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
                        setAdminMobileHeaderHeight(entry.borderBoxSize[0].blockSize);
                    } else {
                        // Fallback to contentRect (less accurate if padding exists) or just re-measure ref
                        setAdminMobileHeaderHeight(mobileHeaderRef.current?.offsetHeight || entry.contentRect.height);
                    }
                }
            });

            // Initial measurement
            setAdminMobileHeaderHeight(mobileHeaderRef.current.offsetHeight);

            observer.observe(mobileHeaderRef.current);
            return () => observer.disconnect();
        }
    }, []);

    // No legacy handleSearch needed - GlobalSearch handles all navigation internally

    return (
        <div
            className="admin-container flex min-h-screen bg-[#FDFBF7] text-slate-800 relative overflow-hidden font-sans selection:bg-amber-100 selection:text-amber-900"
        >

            {/* --- OPTIMIZED BACKGROUND (Static) --- */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#FDFBF7]">
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                ></div>
                <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-gradient-to-br from-amber-100/40 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-gradient-to-tl from-blue-100/40 to-transparent opacity-50"></div>
            </div>

            <div className="relative flex w-full md:pt-0">
                <AdminSidebar
                    navigate={navigate}
                    isCollapsed={isSidebarCollapsed}
                    toggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
                    isMobileOpen={isMobileSidebarOpen}
                    setMobileOpen={setIsMobileSidebarOpen}
                />

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${isSidebarCollapsed ? 'md:pl-16' : 'md:pl-56'}`}>

                    {/* Mobile Header - Enhanced with Search, Notifications & Dev Profile */}
                    <header
                        ref={mobileHeaderRef}
                        className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-30 px-3 h-auto flex items-center justify-between shadow-sm transition-all duration-300"
                        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)', paddingBottom: '0.5rem' }}
                    >
                        {isMobileSearchOpen ? (
                            <div className="flex-1 flex items-center gap-3 animate-fade-in w-full">
                                <GlobalSearch
                                    navigate={navigate}
                                    placeholder="Search anything..."
                                    className="flex-1"
                                    isMobile={true}
                                    autoFocus={true}
                                    onClose={() => setIsMobileSearchOpen(false)}
                                />
                                <button
                                    onClick={() => setIsMobileSearchOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 rounded-full border border-slate-200"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsMobileSidebarOpen(true)} className="text-slate-600 p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <Bars3Icon className="w-6 h-6" />
                                    </button>
                                    {/* Date on Mobile - Increased Size & Font */}
                                    <div className="flex flex-col border-l border-slate-200 pl-3">
                                        <span className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">BS</span>
                                        <span className="text-sm font-extrabold text-emerald-600 font-mono tracking-wide leading-none">{nepaliDate}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button onClick={() => setIsMobileSearchOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                        <MagnifyingGlassIcon className="w-6 h-6" />
                                    </button>

                                    {/* Dark/Light Mode Toggle - Mobile Admin */}
                                    {mounted && (
                                        <button
                                            onClick={toggleTheme}
                                            className={`theme-toggle-btn ${theme}`}
                                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                            aria-label="Toggle dark/light mode"
                                        >
                                            <span className="theme-toggle-knob">
                                                {theme === 'dark' ? '🌙' : '☀️'}
                                            </span>
                                        </button>
                                    )}

                                    {/* Broadcast / Send Notification Button - Now Paper Airplane */}
                                    <button
                                        onClick={() => navigate('/admin/notifications')}
                                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors transform active:scale-90"
                                        title="Send Notification"
                                    >
                                        <MegaphoneIcon className="w-6 h-6" />
                                    </button>

                                    <div className="relative">
                                        <NotificationBell
                                            navigate={navigate}
                                            iconClassName="w-6 h-6 text-slate-500"
                                            buttonClassName="p-2 hover:bg-slate-100 rounded-full transition-colors relative flex items-center justify-center"
                                        />
                                    </div>

                                    {/* Mobile Developer Profile */}
                                    <div className="ml-1 relative group cursor-pointer" onClick={() => window.open('https://www.facebook.com/bishalmishra9827', '_blank')}>
                                        <img
                                            src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg"
                                            alt="Dev"
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Bishal+Mishra&background=0D8ABC&color=fff';
                                            }}
                                        />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </header>

                    {/* Desktop Header */}
                    <header className="hidden md:flex items-center justify-between px-4 lg:px-8 py-3 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 transition-all">
                        {/* Search Bar + Date */}
                        <div className="flex flex-col gap-1 w-full max-w-[280px] lg:max-w-md">
                            <GlobalSearch
                                navigate={navigate}
                                placeholder="Global Search (Pages, Orders, Products...)"
                                className="w-full"
                                isMobile={false}
                            />
                            <div className="flex items-center gap-2 pl-1">
                                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">BS DATE:</span>
                                <p className="text-xs font-bold text-emerald-600 font-mono tracking-wider uppercase">
                                    {nepaliDate}
                                </p>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 lg:gap-6">

                            {/* Broadcast / Send Notification Button - Now Paper Airplane */}
                            <button
                                onClick={() => navigate('/admin/notifications')}
                                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-white/50 hover:bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center group hover:scale-110 active:scale-95 transform"
                                title="Send Notification"
                            >
                                <MegaphoneIcon className="w-5 h-5" />
                            </button>

                            <div className="relative">
                                <NotificationBell
                                    navigate={navigate}
                                    iconClassName="w-6 h-6 text-slate-400"
                                    buttonClassName="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 hover:bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center"
                                />
                            </div>

                            {/* Dark/Light Mode Toggle - Desktop Admin */}
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className={`theme-toggle-btn ${theme}`}
                                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                    aria-label="Toggle dark/light mode"
                                >
                                    <span className="theme-toggle-knob">
                                        {theme === 'dark' ? '🌙' : '☀️'}
                                    </span>
                                </button>
                            )}

                            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                                <div className="text-right hidden xl:block">
                                    <p className="text-sm font-bold text-slate-800">Mobi Store Team</p>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Main Developer</p>
                                </div>
                                <div className="relative group cursor-pointer" onClick={() => window.open('https://www.facebook.com/bishalmishra9827', '_blank')}>
                                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 to-fuchsia-600 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                                    <img
                                        src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg"
                                        alt="Developer"
                                        className="relative w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-100"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Bishal+Mishra&background=0D8ABC&color=fff';
                                        }}
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full ring-1 ring-slate-100"></div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Wrapper */}
                    <main
                        className="flex-1 p-3 sm:p-5 lg:p-8 min-w-0 overflow-x-hidden"
                        style={{ paddingTop: adminMobileHeaderHeight > 0 ? `${adminMobileHeaderHeight}px` : 'initial' }} // Dynamic top padding
                    >
                        <div className="relative animate-fade-in min-w-0">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
