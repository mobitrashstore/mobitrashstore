
import React, { useEffect, useState, useRef } from 'react';
import { Category, Banner } from '../types';
import * as api from '../services/api'; // Import API for fetching banners

// Unified image optimizer — supports ImageKit and Cloudinary URLs.
const getOptimizedImageUrl = (url: string | undefined, width: number, quality: number): string => {
    if (!url) return 'https://placehold.co/400x400?text=No+Image';
    if (url.startsWith('data:')) return url; // Don't optimize base64 images
    if (url.includes('ik.imagekit.io')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}tr=w-${width},q-${quality}`;
    }
    if (url.includes('res.cloudinary.com')) {
        // Inject Cloudinary transformations before the version/public_id segment
        return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
    return url;
};

// --- Top Category Slider ---
interface HomeCategorySliderProps {
    categories: Category[];
    navigate: (path: string) => void;
    topBanners?: Banner[]; // Added prop for top features
}

export const HomeCategorySlider: React.FC<HomeCategorySliderProps> = ({ categories, navigate, topBanners = [] }) => {
    // Desktop Infinite Scroll Logic
    const desktopCategories = categories.length > 0 ? [...categories, ...categories] : [];

    // Mobile Infinite Scroll - Quadruple for smooth loop
    const mobileCategories = categories.length > 0 ? [...categories, ...categories, ...categories, ...categories] : [];

    return (
        <div className="w-full bg-white">
            {/* Desktop Layout: [Features] | [Scrolling Categories] */}
            <div className="hidden md:flex items-center w-full h-28 px-6 border-b border-gray-100">

                {/* Left Side: Static Top Features */}
                {topBanners.length > 0 && (
                    <>
                        <div className="flex gap-4 flex-shrink-0 pr-6">
                            {topBanners.map(banner => (
                                <div
                                    key={banner.id}
                                    onClick={() => {
                                        if (banner.link) {
                                            if (banner.link.startsWith('http')) {
                                                window.open(banner.link, '_blank');
                                            } else {
                                                navigate(banner.link);
                                            }
                                        }
                                    }}
                                    className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-200 group hover:shadow-md transition-all hover:scale-105 cursor-pointer"
                                    title={banner.link ? "Click to view deal" : ""}
                                >
                                    <img
                                        src={getOptimizedImageUrl(banner.imageUrl, 100, 75)}
                                        alt="Feature"
                                        width="80"
                                        height="80"
                                        className="w-full h-full object-cover"
                                        loading="lazy" decoding="async"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Divider */}
                        <div className="w-px h-16 bg-gray-200 flex-shrink-0 mr-6"></div>
                    </>
                )}

                {/* Right Side: Smooth Auto-Scrolling Categories */}
                <div className="flex-grow overflow-hidden relative mask-linear-fade">
                    <div className="flex gap-8 items-center animate-marquee w-max hover:pause">
                        {desktopCategories.map((cat, index) => (
                            <button
                                key={`${cat.id}-desk-${index}`}
                                onClick={() => navigate(`/product?category=${encodeURIComponent(cat.name)}`)}
                                className="flex flex-col items-center space-y-2 group min-w-[80px]"
                            >
                                <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center p-2 group-hover:border-[#00bfff] group-hover:bg-white transition-all overflow-hidden">
                                    <img src={getOptimizedImageUrl(cat.imageUrl, 80, 75)} alt={cat.name} width="56" height="56" className="w-full h-full object-contain transform group-hover:scale-110 transition-transform" loading="lazy" decoding="async" />
                                </div>
                                <span className="text-xs font-bold text-gray-600 group-hover:text-[#00bfff] text-center whitespace-nowrap">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Layout (1 Row, CSS Marquee) */}
            <div className="md:hidden overflow-hidden w-full bg-slate-50 py-3 relative">
                <div className="flex items-center gap-6 animate-marquee w-max">
                    {mobileCategories.map((cat, index) => (
                        <button
                            key={`${cat.id}-mob-${index}`}
                            onClick={() => navigate(`/product?category=${encodeURIComponent(cat.name)}`)}
                            className="flex flex-col items-center space-y-1.5 group min-w-[72px]"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-3 group-hover:border-[#00bfff] transition-all overflow-hidden">
                                <img src={getOptimizedImageUrl(cat.imageUrl, 80, 75)} alt={cat.name} width="64" height="64" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 text-center leading-tight px-1 truncate w-full">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                .mask-linear-fade {
                    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                }
                .hover\:pause:hover {
                    animation-play-state: paused;
                }
             `}</style>
        </div>
    );
};

// --- Main Hero Slider ---
interface HomeHeroSliderProps {
    banners: Banner[];
    sideBanners?: Banner[];
    navigate: (path: string) => void;
}

export const HomeHeroSlider: React.FC<HomeHeroSliderProps> = ({ banners, sideBanners = [], navigate }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Fallback if no banners provided
    const slides: Banner[] = banners.length > 0 ? banners : [{ imageUrl: 'https://ik.imagekit.io/fixedmyspeaker/website%20main%20bg.jpg?updatedAt=1763458710837', id: 'default', section: 'hero', link: undefined }];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    const hasSideBanner = sideBanners.length > 0;

    // Main slider content
    const SliderContent = (
        <div className={`relative w-full overflow-hidden rounded-xl shadow-md ${hasSideBanner ? 'h-[200px] sm:h-[280px] md:h-[380px] lg:h-[450px]' : 'aspect-[21/9] md:aspect-[32/9]'}`}>
            {slides.map((banner, index) => (
                <div
                    key={banner.id}
                    onClick={() => {
                        if (banner.link) {
                            if (banner.link.startsWith('http')) {
                                window.open(banner.link, '_blank');
                            } else {
                                navigate(banner.link);
                            }
                        }
                    }}
                    className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
                        } ${banner.link ? 'cursor-pointer' : 'cursor-default'}`}
                >
                    <img
                        className="h-full w-full object-cover"
                        src={getOptimizedImageUrl(banner.imageUrl, 1920, 80)}
                        alt={`Slide ${index + 1}`}
                        width="1920"
                        height="600"
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        {...(index === 0 ? { fetchPriority: "high" } : {})}
                    />
                </div>
            ))}
            {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    if (hasSideBanner) {
        return (
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Main Slider Area */}
                <div className="w-full md:w-3/4">
                    {SliderContent}
                </div>

                {/* Side Banner Area (Desktop Only) */}
                <div
                    onClick={() => {
                        const banner = sideBanners[0];
                        if (banner?.link) {
                            if (banner.link.startsWith('http')) {
                                window.open(banner.link, '_blank');
                            } else {
                                navigate(banner.link);
                            }
                        }
                    }}
                    className={`hidden md:block w-full md:w-1/4 rounded-xl shadow-md overflow-hidden h-[380px] lg:h-[450px] ${sideBanners[0]?.link ? 'cursor-pointer' : 'cursor-default'}`}
                    title={sideBanners[0]?.link ? "Click to view deal" : ""}
                >
                    <img
                        src={getOptimizedImageUrl(sideBanners[0].imageUrl, 600, 80)}
                        alt="Side Promotion"
                        width="600"
                        height="450"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="lazy" decoding="async"
                    />
                </div>
            </div>
        );
    }

    return SliderContent;
};

// --- Promo Banner Auto-Slider ---
interface PromoBannerSliderProps {
    banners: Banner[];
    initialIndex?: number;
    navigate: (path: string) => void;
}

export const PromoBannerSlider: React.FC<PromoBannerSliderProps> = ({ banners, initialIndex = 0, navigate }) => {
    const [current, setCurrent] = useState(initialIndex % (banners.length || 1));

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners.length]);

    if (banners.length === 0) return null;

    return (
        <div className="w-full my-2 md:my-6 overflow-hidden rounded-lg shadow-sm relative h-28 sm:h-40 md:h-48">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    onClick={() => {
                        if (banner.link) {
                            if (banner.link.startsWith('http')) {
                                window.open(banner.link, '_blank');
                            } else {
                                navigate(banner.link);
                            }
                        }
                    }}
                    className={`absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out ${banner.link ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{
                        transform: banners.length > 1 ? `translateX(${(index - current) * 100}%)` : 'none',
                        zIndex: index === current ? 10 : 0,
                        pointerEvents: index === current ? 'auto' : 'none'
                    }}
                >
                    <img
                        src={getOptimizedImageUrl(banner.imageUrl, 1200, 75)}
                        alt="Promo Banner"
                        width="1200"
                        height="192"
                        className="w-full h-full object-cover"
                        loading="lazy" decoding="async"
                    />
                </div>
            ))}
        </div>
    );
};
