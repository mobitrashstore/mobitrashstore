
import React, { useState, useEffect, ReactNode } from 'react';
import Spinner from './Spinner';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh, disabled = false }) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Adjusted thresholds for a tighter feel
    const THRESHOLD = 70;
    const MAX_PULL = 130;

    useEffect(() => {
        // Component is mounted
        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;

        // Check multiple scroll top properties for robustness
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

        // Only activate if we are at the very top of the page
        if (scrollTop <= 1 && !refreshing) {
            setStartY(e.touches[0].clientY);
        } else {
            setStartY(0);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (disabled || startY === 0 || refreshing) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

        // If user has scrolled down during the gesture, cancel the pull logic
        if (scrollTop > 0) {
            setStartY(0);
            setCurrentY(0);
            return;
        }

        const y = e.touches[0].clientY;
        const diffY = y - startY;

        if (diffY > 0) {
            // Prevent browser native refresh/overscroll
            if (e.cancelable) {
                // Note: Preventing default here stops the browser URL bar from expanding/refreshing
                // ONLY if the listener isn't passive. React's events are passive by default in newer versions, 
                // but the CSS overscroll-behavior-y: none; is the real hero here.
            }

            // Add resistance so the pull feels "heavy" but content stays locked
            const dampened = diffY * 0.4;
            setCurrentY(Math.min(dampened, MAX_PULL));
        }
    };

    const handleTouchEnd = async () => {
        if (disabled || startY === 0 || refreshing) return;

        if (currentY > THRESHOLD) {
            setRefreshing(true);
            setCurrentY(THRESHOLD); // Snap spinner to visible loading position

            // Subtle haptic feedback
            if (navigator.vibrate) navigator.vibrate(15);

            try {
                await onRefresh();
            } finally {
                // Keep spinner visible briefly to show completion
                setTimeout(() => {
                    setRefreshing(false);
                    setCurrentY(0);
                    setStartY(0);
                }, 800);
            }
        } else {
            // Spring back immediately if threshold not met
            setCurrentY(0);
            setStartY(0);
        }
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full relative"
        >
            {/* Spinner Overlay - Moves independently */}
            <div
                className="fixed left-0 right-0 z-[90] flex justify-center pointer-events-none transition-transform duration-300 ease-out will-change-transform"
                style={{
                    // Position relative to the top (adjusting for header height + safe area)
                    top: 'calc(env(safe-area-inset-top) + 85px)',
                    // Start hidden (-60px) and slide down based on pull
                    transform: `translateY(${currentY - 60}px) scale(${currentY > THRESHOLD ? 1.1 : 1})`,
                    opacity: currentY > 10 ? 1 : 0
                }}
            >
                <div className="bg-white/95 backdrop-blur-md p-3 rounded-full shadow-xl border border-emerald-100/50 ring-4 ring-black/5">
                    <Spinner size="w-6 h-6" />
                </div>
            </div>

            {/* Content Container */}
            <div className="h-full">
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
