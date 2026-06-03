
import React, { useState, useEffect, useRef } from 'react';

const OfflineBanner: React.FC = () => {
    const [status, setStatus] = useState<'hidden' | 'offline' | 'restored'>('hidden');
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const handleOnline = () => {
            // Switch to Green "Back Online" banner
            setStatus('restored');
            
            // Clear any existing timer (e.g. from the offline state)
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Hide completely after 3 seconds
            timerRef.current = window.setTimeout(() => {
                setStatus('hidden');
            }, 3000);
        };

        const handleOffline = () => {
            // Show Amber "Offline" banner
            setStatus('offline');
            
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            
            // Optional: Hide offline banner after 5 seconds automatically 
            // (or keep it sticky until online - sticking to previous behavior of auto-hide)
            timerRef.current = window.setTimeout(() => {
                // setStatus('hidden'); 
                // Better UX: Keep offline banner visible until connection returns or user acts, 
                // but based on previous code it hid after 5s. I will keep it sticky for now 
                // so they know why app might be failing, but per request implies just the message logic.
                // Let's stick to the 5s hide for offline to be non-intrusive.
                 setStatus('hidden');
            }, 5000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Initial check
        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    if (status === 'hidden') {
        return null;
    }

    const isRestored = status === 'restored';

    return (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[150] w-auto animate-slide-in-up md:bottom-6">
            <div className={`
                rounded-xl shadow-xl border p-2 px-4 backdrop-blur-md transition-colors duration-500
                ${isRestored 
                    ? 'bg-emerald-500/90 border-emerald-400/30 text-white' 
                    : 'bg-amber-600/90 border-amber-400/30 text-white'
                }
            `}>
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        {isRestored ? (
                            <img src="/wifi-on.png" alt="Wifi Online" className="w-5 h-5 object-contain animate-pulse" />
                        ) : (
                            <img src="/wifi-off.png" alt="Wifi Offline" className="w-5 h-5 object-contain" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-sm tracking-tight leading-none">
                            {isRestored ? "Back Online" : "No Connection"}
                        </p>
                        <p className="text-[10px] font-medium opacity-80 mt-0.5 whitespace-nowrap">
                            {isRestored 
                                ? "Everything is synced!" 
                                : "Check your internet connection."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfflineBanner;
