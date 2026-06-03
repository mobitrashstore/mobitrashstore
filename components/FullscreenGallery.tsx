import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface FullscreenGalleryProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

const FullscreenGallery: React.FC<FullscreenGalleryProps> = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [origin, setOrigin] = useState({ x: 0.5, y: 0.5 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [lastTap, setLastTap] = useState(0);

    // Disable scroll when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setScale(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setScale(1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // Double tap detected
            if (scale > 1) {
                setScale(1);
            } else {
                // Calculate touch/mouse position relative to image
                let clientX, clientY;
                if ('touches' in e) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = (clientX - rect.left) / rect.width;
                const y = (clientY - rect.top) / rect.height;

                setOrigin({ x, y });
                setScale(2.5);
            }
        }
        setLastTap(now);
    };

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(prev => Math.max(prev - 0.5, 1));
    };

    // Swipe handlers
    const dragTransition = { type: "spring", stiffness: 300, damping: 30 };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center touch-none backdrop-blur-xl overflow-hidden"
        >
            {/* Dedicated Backdrop for closing - only clicks here will close */}
            <div
                className="absolute inset-0 z-0 cursor-default"
                onClick={onClose}
            />
            {/* Top Bar - Adjusted for Safe Areas (Notches/Status Bars) */}
            <div
                className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[210] bg-gradient-to-b from-black/80 to-transparent pb-10"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking bar area
            >
                <span className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                    {currentIndex + 1} / {images.length}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 shadow-sm"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 shadow-sm"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-full text-white backdrop-blur-md border border-rose-500/30 shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                ref={containerRef}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`w-full h-full flex items-center justify-center p-4 ${scale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Logic for desktop double click zoom or just single click zoom toggle
                        }}
                        onMouseDown={(e) => {
                            if (e.detail === 2) {
                                // Double click detected
                                if (scale > 1) {
                                    setScale(1);
                                } else {
                                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                    const x = (e.clientX - rect.left) / rect.width;
                                    const y = (e.clientY - rect.top) / rect.height;
                                    setOrigin({ x, y });
                                    setScale(2.5);
                                }
                            }
                        }}
                        onTouchStart={handleDoubleTap}
                        drag={scale > 1 ? "x" : false} // Allow drag only if zoomed? No, wait. 
                    >
                        <motion.img
                            src={images[currentIndex]}
                            alt={`Product ${currentIndex}`}
                            className={`max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-transform duration-200 ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                            style={{
                                scale,
                                transformOrigin: `${origin.x * 100}% ${origin.y * 100}%`
                            }}
                            drag={scale > 1}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0.1}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Desktop Nav Controls */}
                <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-6 pointer-events-none z-[210]">
                    <button
                        onClick={handlePrev}
                        className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 pointer-events-auto transition-all hover:scale-110 active:scale-90"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 pointer-events-auto transition-all hover:scale-110 active:scale-90"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            </div>

            {/* Mobile Swipe Area (Invisible detector for simple swipes if not zoomed) */}
            {scale === 1 && (
                <div
                    className="absolute inset-0 z-[5] cursor-default"
                    onClick={(e) => {
                        // If scale is 1, a click on the "empty" middle area should close the gallery
                        // BUT we need to check if we are clicking on actual UI elements
                        // This div is z-5, so it's behind TopBar (210) and Nav (210)
                        onClose();
                    }}
                    onTouchStart={(e) => {
                        const startX = e.touches[0].clientX;
                        const handleEnd = (ev: TouchEvent) => {
                            const endX = ev.changedTouches[0].clientX;
                            const diff = startX - endX;
                            if (Math.abs(diff) > 50) {
                                if (diff > 0) handleNext();
                                else handlePrev();
                            }
                            document.removeEventListener('touchend', handleEnd);
                        };
                        document.addEventListener('touchend', handleEnd);
                    }}
                />
            )}

            {/* Bottom Thumbnails - Adjusted for Safe Areas (Home Indicators) */}
            <div
                className="absolute bottom-0 left-0 right-0 p-4 pt-10 pb-8 overflow-x-auto flex justify-center gap-2 scrollbar-hide bg-gradient-to-t from-black/80 to-transparent z-[210]"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking thumbnail area
            >
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={(e) => {
                            e.stopPropagation();
                            setScale(1);
                            setCurrentIndex(i);
                        }}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex-shrink-0 transition-all shadow-2xl ${currentIndex === i ? 'border-white scale-110' : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105'}`}
                    >
                        <img src={img} className="w-full h-full object-cover rounded-lg" />
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default FullscreenGallery;
