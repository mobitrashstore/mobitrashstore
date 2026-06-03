
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { NoticeBanner as NoticeBannerType } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface NoticeBannerProps {
    navigate: (path: string) => void;
}

const NoticeBanner: React.FC<NoticeBannerProps> = ({ navigate }) => {
    const [banner, setBanner] = useState<NoticeBannerType | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isStripVisible, setIsStripVisible] = useState(false);

    const checkTargeting = useCallback((data: NoticeBannerType) => {
        const isMobile = window.innerWidth < 768;
        if (data.targetDevice === 'mobile' && !isMobile) return false;
        if (data.targetDevice === 'desktop' && isMobile) return false;

        const path = window.location.pathname;
        if (data.targetPage !== 'all') {
            const pageMap: { [key: string]: string } = {
                home: '/',
                buy: '/product',
                sell: '/sell',
                repair: '/repair-booking'
            };
            const targetPath = pageMap[data.targetPage];
            if (path !== targetPath) return false;
        }
        return true;
    }, []);

    const checkFrequency = useCallback((data: NoticeBannerType, type: 'strip' | 'popup') => {
        const currentTimestamp = Date.now();
        const frequency = data.displayFrequency || 'session';
        const freqValue = data.frequencyValue || 1;
        
        const sessionKey = `notice_${type}_session_closed_${data.updatedAt}`;
        const storageKey = `notice_${type}_last_seen_${data.updatedAt}`;

        if (frequency === 'always') return true;
        
        // If closed in this session, don't show again regardless of global frequency
        if (sessionStorage.getItem(sessionKey)) return false;

        if (frequency === 'session') return true; // session check is above

        const lastSeen = localStorage.getItem(storageKey);
        if (!lastSeen) return true;

        const lastSeenTime = parseInt(lastSeen, 10);
        const diffMs = currentTimestamp - lastSeenTime;

        if (frequency === 'hours') return diffMs > (freqValue * 60 * 60 * 1000);
        if (frequency === 'days') return diffMs > (freqValue * 24 * 60 * 60 * 1000);
        return true;
    }, []);

    const markAsSeen = useCallback((data: NoticeBannerType, type: 'strip' | 'popup') => {
        const frequency = data.displayFrequency || 'session';
        if (frequency === 'hours' || frequency === 'days') {
            localStorage.setItem(`notice_${type}_last_seen_${data.updatedAt}`, Date.now().toString());
        }
    }, []);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const data = await api.getNoticeBanner();
                setBanner(data);

                if (!data.isStripActive && !data.isPopupActive) return;
                if (!checkTargeting(data)) return;

                // STRIP VISIBILITY
                if (data.isStripActive && checkFrequency(data, 'strip')) {
                    setIsStripVisible(true);
                    markAsSeen(data, 'strip');
                    if (data.autoHideSeconds && data.autoHideSeconds > 0) {
                        setTimeout(() => setIsStripVisible(false), data.autoHideSeconds * 1000);
                    }
                }

                // POPUP VISIBILITY
                if (data.isPopupActive && checkFrequency(data, 'popup')) {
                    if (data.showOnExit) {
                        const onMouseLeave = (e: MouseEvent) => {
                            if (e.clientY < 50) {
                                setIsPopupVisible(true);
                                markAsSeen(data, 'popup');
                                document.removeEventListener('mouseleave', onMouseLeave);
                            }
                        };
                        document.addEventListener('mouseleave', onMouseLeave);
                        return () => document.removeEventListener('mouseleave', onMouseLeave);
                    } else {
                        const delay = (data.popupDelay || 0) * 1000;
                        setTimeout(() => {
                            // Re-check frequency inside timeout to be safe
                            if (checkFrequency(data, 'popup')) {
                                setIsPopupVisible(true);
                                markAsSeen(data, 'popup');
                                if (data.autoHideSeconds && data.autoHideSeconds > 0) {
                                    setTimeout(() => setIsPopupVisible(false), data.autoHideSeconds * 1000);
                                }
                            }
                        }, delay);
                    }
                }
            } catch (error) {
                console.error("Failed to load banner logic", error);
            }
        };
        fetchBanner();
        // Dependency array should NOT include isPopupVisible to avoid infinite loops on close
    }, [checkTargeting, checkFrequency, markAsSeen]);

    const handleCloseStrip = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsStripVisible(false);
        if (banner) sessionStorage.setItem(`notice_strip_session_closed_${banner.updatedAt}`, 'true');
    };

    const handleClosePopup = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsPopupVisible(false);
        if (banner) sessionStorage.setItem(`notice_popup_session_closed_${banner.updatedAt}`, 'true');
    };

    const handleBannerAction = () => {
        if (banner?.link) {
            if (banner.link.startsWith('http')) {
                window.open(banner.link, '_blank');
            } else {
                navigate(banner.link);
            }
            if (isPopupVisible) handleClosePopup();
        }
    };

    if (!banner || (!isStripVisible && !isPopupVisible)) return null;

    return (
        <>
            {/* Strip */}
            {isStripVisible && banner.isStripActive && (
                <div
                    className="relative z-[100] w-full py-2.5 px-4 animate-slide-down flex items-center justify-center cursor-pointer border-b border-black/10"
                    style={{ backgroundColor: banner.backgroundColor || '#10b981', color: banner.textColor || '#ffffff' }}
                    onClick={handleBannerAction}
                >
                    <div className="flex items-center gap-3 overflow-hidden max-w-7xl mx-auto w-full justify-center">
                        {banner.imageUrl && <img src={banner.imageUrl} alt="" className="h-4 w-auto object-contain hidden sm:block grayscale brightness-200" />}
                        <p className="text-[10px] md:text-xs font-black tracking-widest text-center truncate uppercase">
                            {banner.text}
                        </p>
                        {banner.linkText && <div className="hidden sm:flex items-center gap-1 font-black text-[9px] uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{banner.linkText} <ChevronRightIcon className="w-3 h-3" /></div>}
                    </div>
                    {banner.showCloseButton && (
                         <button onClick={handleCloseStrip} className="absolute right-3 p-1.5 hover:bg-black/10 rounded-full transition-colors opacity-60">
                            <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Popup */}
            {isPopupVisible && banner.isPopupActive && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in shadow-2xl">
                    <div className="absolute inset-0 cursor-default" onClick={() => handleClosePopup()}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-up border-4 border-white" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleClosePopup()} className="absolute right-5 top-5 z-10 p-2 bg-black/5 hover:bg-black/10 text-slate-400 rounded-full transition-all hover:rotate-90">
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="w-full aspect-[4/5] bg-slate-50 flex items-center justify-center overflow-hidden">
                            {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt="notice" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-slate-300 font-extrabold uppercase text-[10px] tracking-widest">Notice Visual</div>
                            )}
                        </div>

                        <div className="p-8 text-center bg-white space-y-6">
                             {banner.text && <p className="text-slate-800 font-black text-lg leading-tight uppercase tracking-tight px-2">{banner.text}</p>}
                             
                             <div className="flex items-center gap-4 w-full">
                                {banner.linkText && (
                                    <button
                                        onClick={handleBannerAction}
                                        className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-white"
                                        style={{ backgroundColor: banner.backgroundColor }}
                                    >
                                        {banner.linkText}
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleClosePopup()} 
                                    className="flex-1 py-5 rounded-2xl font-black text-xs text-white bg-slate-900 hover:bg-black transition-all uppercase tracking-widest shadow-xl active:scale-95"
                                >
                                    Dismiss
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scale-up { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes slide-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-down { animation: slide-down 0.5s ease-out forwards; }
            `}</style>
        </>
    );
};

export default NoticeBanner;
