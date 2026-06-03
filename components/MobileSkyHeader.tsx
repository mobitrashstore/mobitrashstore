import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import NotificationBell from './NotificationBell';

interface MobileSkyHeaderProps {
    title: string;
    Icon?: React.ElementType;
    onBack?: () => void;
    onClose?: () => void;
    showNotification?: boolean;
    navigate?: (path: string) => void;
    hasSpacer?: boolean;
}

const MobileSkyHeader: React.FC<MobileSkyHeaderProps> = ({ title, Icon, onBack, onClose, showNotification, navigate, hasSpacer = true }) => {
    return (
        <>
            {/* 
                Fixed Header Container 
                - Updated to Emerald/Green Vertical Gradient to match Status Bar (#34d399)
                - Added pt-[env(safe-area-inset-top)] to push content below status bar
            */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-emerald-400 to-green-600 shadow-lg overflow-visible rounded-b-[2.5rem] pb-4 pt-[env(safe-area-inset-top)]">
                
                {/* Top Row: Back Button, Bell, Close Button */}
                <div className="flex items-center justify-between px-4 pt-4 z-20 relative">
                     {onBack ? (
                        <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-slate-900 hover:bg-white/30 transition-colors shadow-sm">
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                     ) : <div className="w-10"></div>}

                     {/* Notification Bell */}
                     {showNotification && navigate && (
                         <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full shadow-sm">
                            <NotificationBell navigate={navigate} iconClassName="w-6 h-6 text-slate-900" />
                         </div>
                     )}
                     
                     {onClose ? (
                        <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-slate-900 hover:bg-white/30 transition-colors shadow-sm">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                     ) : (!showNotification && <div className="w-10"></div>)}
                </div>

                {/* Title Row */}
                <div className="w-full flex justify-center z-10 relative mt-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 drop-shadow-sm tracking-wide text-center px-4 flex items-center gap-2">
                        {Icon && <Icon className="w-7 h-7 text-slate-800 opacity-80" />}
                        {title}
                    </h1>
                </div>
            </div>

            {/* Spacer to push page content down so it isn't hidden behind the fixed header */}
            {/* Height adjusted to account for safe area + header height */}
            {hasSpacer && <div className="md:hidden h-[calc(8rem+env(safe-area-inset-top))]"></div>}
        </>
    );
};

export default MobileSkyHeader;
