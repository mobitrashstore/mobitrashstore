
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGlobalNotification } from '../context/GlobalNotificationContext';
import { BellIcon } from './icons/BellIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface NotificationBellProps {
    navigate: (path: string) => void;
    iconClassName?: string;
    buttonClassName?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
    navigate, 
    iconClassName = "w-6 h-6",
    buttonClassName = "relative p-2 text-gray-500 hover:text-[#059669] transition-colors rounded-full hover:bg-gray-100/50 focus:outline-none"
}) => {
    const { notifications, unreadCount, markAllAsRead } = useGlobalNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        if (!isOpen) {
            setIsOpen(true);
            markAllAsRead();
        } else {
            setIsOpen(false);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Only close desktop dropdown on outside click. 
                // Mobile is handled by backdrop click in the portal.
                // Check if window width is desktop
                if (window.innerWidth >= 768) {
                     setIsOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (link?: string) => {
        setIsOpen(false);
        if (link) {
            if (link.startsWith('http')) {
                window.open(link, '_blank');
            } else {
                // If the link accidentally contains a hash, strip it
                const internalPath = link.startsWith('#') ? link.substring(1) : link;
                navigate(internalPath);
            }
        }
    };

    const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPushPermission(Notification.permission);
        }
    }, []);

    const handleEnablePush = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
                const res = await Notification.requestPermission();
                setPushPermission(res);
                if (res === 'granted' && (window as any).OneSignalDeferred) {
                    (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
                        await OneSignal.User.PushSubscription.optIn();
                    });
                }
            } catch (e) {
                console.warn('Push permission request failed:', e);
            }
        }
    };

    const notificationListContent = (
        <>
            {pushPermission !== 'granted' && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <span>🔔</span>
                        <span className="font-semibold">Get instant price drops & deals</span>
                    </div>
                    <button
                        onClick={handleEnablePush}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm flex-shrink-0"
                    >
                        Allow
                    </button>
                </div>
            )}
            {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif.link)}
                            className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer`}
                        >
                            {notif.imageUrl && (
                                <img src={notif.imageUrl} alt="" className="w-12 h-12 rounded-md object-cover border border-gray-200 flex-shrink-0" />
                            )}
                            <div className="flex-grow">
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{notif.title}</h4>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                    <p>No notifications yet.</p>
                </div>
            )}
        </>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleOpen}
                className={buttonClassName}
                aria-label="Notifications"
                title="Notifications"
            >
                <BellIcon className={iconClassName} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3.5 w-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Mobile View: Rendered via Portal to ensure correct layering */}
                    {createPortal(
                        // Z-Index 40 places it BELOW the Mobile Header (Z-50) so the header stays visible if needed, 
                        // but we style this to blend in perfectly.
                        <div className="md:hidden fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 pointer-events-none">
                             {/* Backdrop */}
                             <div 
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in" 
                                onClick={() => setIsOpen(false)}
                             />
                             
                             {/* Modal Card */}
                             <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden pointer-events-auto animate-slide-in-down relative z-10 flex flex-col max-h-[60vh]">
                                 {/* Header - Styled with pure Emerald Green */}
                                 <div className="p-4 border-b border-white/10 bg-[#059669] flex justify-between items-center sticky top-0 z-20 shadow-md">
                                     <h3 className="font-bold text-white text-lg">Notifications</h3>
                                     <button onClick={() => setIsOpen(false)} className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-md">
                                         <XMarkIcon className="w-5 h-5" />
                                     </button>
                                 </div>
                                 <div className="overflow-y-auto overscroll-contain flex-1 bg-white">
                                     {notificationListContent}
                                 </div>
                             </div>
                        </div>,
                        document.body
                    )}

                    {/* Desktop View */}
                    <div className="hidden md:block absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 origin-top-right animate-fade-in-down">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {notificationListContent}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
