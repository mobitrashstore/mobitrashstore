
import React, { useState, useEffect, useRef } from 'react';
// REMOVED LAZY LOADING FOR ABOVE-THE-FOLD COMPONENTS TO ELIMINATE FLICKER
import ProductCarousel from '../components/ProductCarousel';
import { HomeCategorySlider, PromoBannerSlider } from '../components/HomeSliders';
import NotificationBell from '../components/NotificationBell';

// STILL LAZY LOADED (Below the fold or On-Demand)
const SearchModal = React.lazy(() => import('../components/SearchModal'));
const Testimonials = React.lazy(() => import('../components/Testimonials'));
const FAQ = React.lazy(() => import('../components/FAQ'));
const HomeBlogSection = React.lazy(() => import('../components/HomeBlogSection'));


// RESTORED IMPORTS
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { InventoryItem, Category, Banner, DarazConfig } from '../types';
import * as api from '../services/api';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { ArrowTopRightOnSquareIcon } from '../components/icons/ArrowTopRightOnSquareIcon';


// Keep critical above-the-fold components eager if needed, or lazy load everything non-critical
// HeroSection and PriceTicker are defined in-file, so they are fine.

{/* Fallback Loader */ }
const SectionLoader = () => (
    <div className="w-full h-48 md:h-64 bg-slate-100/50 animate-pulse rounded-2xl my-4" />
);
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { TruckIcon } from '../components/icons/TruckIcon';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';
import { WrenchIcon } from '../components/icons/WrenchIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { GiftIcon } from '../components/icons/GiftIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { BoltIcon } from '../components/icons/BoltIcon';
import { useAuth } from '../context/AuthContext';
import { NEPAL_DISTRICTS } from '../constants';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import SEO from '../components/SEO';
import { useVisualEditing } from '../context/VisualEditingContext';
import VisualEditWrapper from '../components/VisualEditWrapper';
import EditableText from '../components/EditableText';
import VisualDropZone from '../components/VisualDropZone';
import DynamicRenderer, { DynamicSectionData } from '../components/DynamicRenderer';


import { ShoppingCartIcon } from '../components/icons/ShoppingCartIcon';

export interface HomePageProps {
    navigate: (path: string) => void;
}

const HOME_CONFIG_DEFAULT = {
    hero: {
        subtitle: "The Most Trusted Mobile Store",
        titlePrefix: "Turn Trash Into ",
        titleHighlight: "Cash.",
        description: "Experience the fastest way to sell your used phone. Instant fair pricing, free doorstep pickup, and instant payment directly to your bank.",
        button1Label: "Sell Your",
        button2Label: "Buy",
        button1Link: "/sell",
        button2Link: "/buy"
    },
    stats: {
        devicesRescued: '20,000+',
        customerRating: '4.9★',
        avgPayout: '< 10 min',
        partnerStores: '10+',
        liveStoreText: 'Live store · Trusted Worldwide',
        reviewCount: '1,200+',
        rewardsTitle: 'Spin & Win daily rewards and bonus points.',
        rewardsSubtitle: 'Win gadgets, coupons & store credits. No purchase required to spin.'
    },
    repair: {
        title: "Shattered Screen?",
        highlight: "We Fix It Instantly.",
        description: "From battery replacements to chip-level motherboard repairs, our certified technicians bring your device back to life in under 60 minutes.",
        buttonLabel: "Book Appointment"
    },
    titles: {
        hotAccessories: "Hot Accessories",
        phoneCases: "Phone Cases",
        hotTools: "Hot Tools",
        hotParts: "Hot Parts",
        hotProducts: "Hot Products",
        certifiedPreOwned: "Certified Pre-Owned"
    },
    sections: [] as DynamicSectionData[]
};

// Unified image optimizer — supports ImageKit and Cloudinary URLs.
const getOptimizedImageUrl = (url: string | undefined, width: number, quality: number): string => {
    if (!url) return 'https://placehold.co/400x400?text=No+Image';
    if (url.startsWith('data:')) return url; // Don't optimize base64 images
    if (url.includes('ik.imagekit.io')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}tr=w-${width},q-${quality}`;
    }
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
    return url;
};

/* ---------------- TOP PREMIUM PIECES ---------------- */



const HeroSection: React.FC<{
    navigate: (path: string) => void;
    sideBanners: Banner[];
    config?: typeof HOME_CONFIG_DEFAULT.hero;
    onUpdate?: (newConfig: typeof HOME_CONFIG_DEFAULT.hero) => void;
}> = ({
    navigate,
    sideBanners = [],
    config = HOME_CONFIG_DEFAULT.hero,
    onUpdate
}) => {
        const [currentSlide, setCurrentSlide] = useState(0);

        useEffect(() => {
            if (sideBanners.length <= 1) return;
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % sideBanners.length);
            }, 4000);
            return () => clearInterval(interval);
        }, [sideBanners.length]);

        return (
            <section className="bg-white text-slate-900 -mt-20 md:mt-0 relative z-0 pt-20 md:pt-0 overflow-hidden">
                <div className="w-full md:px-6 pt-8 pb-12 md:pt-16 md:pb-20 flex flex-col md:flex-row items-center gap-10 relative z-10"> {/* Removed max-w-7xl mx-auto */}
                    {/* LEFT: TEXT SIDE */}
                    <div className="flex-1 text-center md:text-left space-y-5 md:space-y-6 px-4 md:px-0">


                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
                            <EditableText
                                value={config.titlePrefix}
                                onSave={(val) => onUpdate && onUpdate({ ...config, titlePrefix: val })}
                                tag="span"
                            />{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 block sm:inline">
                                <EditableText
                                    value={config.titleHighlight}
                                    onSave={(val) => onUpdate && onUpdate({ ...config, titleHighlight: val })}
                                    tag="span"
                                />
                            </span>
                        </h1>

                        <p className="max-w-xl mx-auto md:mx-0 text-sm md:text-base text-slate-600 font-medium leading-relaxed">
                            <EditableText
                                value={config.description}
                                onSave={(val) => onUpdate && onUpdate({ ...config, description: val })}
                                tag="span"
                            />
                        </p>

                        {/* COMPACT SINGLE LINE BUTTONS */}
                        <div className="flex flex-row items-center justify-center md:justify-start gap-3 pt-2 w-full max-w-md mx-auto md:mx-0">
                            <button
                                onClick={() => navigate(config.button1Link)}
                                className="group relative flex-1 h-12 inline-flex items-center justify-center gap-2 px-2 md:px-5 rounded-xl bg-[#059669] text-white font-semibold text-[13px] sm:text-sm tracking-wide shadow-md shadow-emerald-600/20 hover:bg-[#047857] active:scale-95 transition-all overflow-hidden whitespace-nowrap"
                                title="Sell your device"
                            >
                                <BoltIcon className="w-5 h-5 text-amber-300 shrink-0" />
                                <EditableText
                                    value={config.button1Label}
                                    onSave={(val) => onUpdate && onUpdate({ ...config, button1Label: val })}
                                    tag="span"
                                    className="text-white"
                                />
                            </button>
                            <button
                                onClick={() => navigate(config.button2Link)}
                                className="group flex-1 h-12 inline-flex items-center justify-center gap-2 px-2 md:px-5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-[13px] sm:text-sm tracking-wide hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-95 transition-all shadow-sm whitespace-nowrap"
                                title="Buy certified devices"
                            >
                                <ShoppingCartIcon className="w-5 h-5 text-[#059669] shrink-0" />
                                <EditableText
                                    value={config.button2Label}
                                    onSave={(val) => onUpdate && onUpdate({ ...config, button2Label: val })}
                                    tag="span"
                                />
                                <ArrowRightIcon className="w-4 h-4 text-[#059669] ml-0.5 group-hover:translate-x-1 transition-all shrink-0" />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
                            {[
                                { label: 'Instant Pay', icon: BanknotesIcon },
                                { label: 'Safe Data Wipe', icon: ShieldCheckIcon },
                                { label: 'Free Pickup', icon: TruckIcon },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] font-medium text-slate-600"
                                >
                                    <item.icon className="w-3.5 h-3.5 text-[#059669]" />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: IMAGE SIDE */}
                    <div className="hidden xl:flex flex-1 items-center justify-center">
                        <div className="relative w-full max-w-md group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                            <div className="relative rounded-[2rem] overflow-hidden bg-white border-4 border-white shadow-2xl h-[380px]">
                                {sideBanners.length > 0 ? (
                                    sideBanners.map((banner, index) => (
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
                                            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentSlide
                                                ? 'opacity-100 pointer-events-auto z-10'
                                                : 'opacity-0 pointer-events-none z-0'
                                                } ${banner.link ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <img
                                                src={getOptimizedImageUrl(banner.imageUrl, 800, 80)}
                                                alt="Hero Banner"
                                                width="800"
                                                height="380"
                                                className="w-full h-full object-cover"
                                                loading={index === 0 ? "eager" : "lazy"}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
                                        No banners
                                    </div>
                                )}

                                {/* Static Overlay Content */}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex items-end justify-between pointer-events-none">
                                    <div className="text-white">
                                        <p className="font-bold text-lg">Featured Deal</p>
                                        <p className="text-xs text-slate-300">Limited Time Offer</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const currentBanner = sideBanners[currentSlide];
                                            if (currentBanner?.link) {
                                                if (currentBanner.link.startsWith('http')) {
                                                    window.open(currentBanner.link, '_blank');
                                                } else {
                                                    navigate(currentBanner.link);
                                                }
                                            } else {
                                                navigate('/buy');
                                            }
                                        }}
                                        className="bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/40 transition-all pointer-events-auto cursor-pointer"
                                        title="View This Deal"
                                    >
                                        <ArrowRightIcon className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Slide Indicators */}
                                {sideBanners.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                        {sideBanners.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

/* ---- Stats + Rewards strip (what went missing) ---- */

const StatsAndRewards: React.FC<{
    navigate: (path: string) => void;
    config?: typeof HOME_CONFIG_DEFAULT.stats;
    onUpdate?: (newConfig: typeof HOME_CONFIG_DEFAULT.stats) => void;
}> = ({ navigate, config = HOME_CONFIG_DEFAULT.stats, onUpdate }) => (
    <section className="space-y-4 md:space-y-6 px-4 md:px-0"> {/* Added px-4 md:px-6 */}
        {/* Top stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
                {
                    label: 'Devices Rescued',
                    value: config.devicesRescued,
                    sub: 'given a second life',
                },
                {
                    label: 'Customer Rating',
                    value: config.customerRating,
                    sub: 'across online platforms',
                },
                {
                    label: 'Avg. Payout Time',
                    value: config.avgPayout,
                    sub: 'after device check',
                },
                {
                    label: 'Partner Stores',
                    value: config.partnerStores,
                    sub: 'serving across the globe',
                },
            ].map((stat, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 md:px-5 md:py-4 flex flex-col justify-center"
                >
                    <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {stat.label}
                    </span>
                    <span className="text-lg md:text-2xl font-bold text-slate-900 mt-1">
                        <EditableText
                            value={String(stat.value)}
                            onSave={(val) => {
                                // Find key by matching label
                                const keyMap: { [key: string]: keyof typeof config } = {
                                    'Devices Rescued': 'devicesRescued',
                                    'Customer Rating': 'customerRating',
                                    'Avg. Payout Time': 'avgPayout',
                                    'Partner Stores': 'partnerStores'
                                };
                                const key = keyMap[stat.label];
                                if (key && onUpdate) onUpdate({ ...config, [key]: val });
                            }}
                            tag="span"
                        />
                    </span>
                    <span className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                        {stat.sub}
                    </span>
                </div>
            ))}
        </div>

        {/* rating pill */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <a
                href="https://g.page/r/CdivF-h7mkT_EAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-700 group hover:text-emerald-700 transition-colors"
            >
                <span className="text-emerald-500 text-sm">★★★★★</span>
                <span className="font-semibold">{config.customerRating.replace('★', '')}/5</span>
                <span className="text-slate-500 group-hover:text-emerald-700 transition-colors">from {config.reviewCount} customer reviews</span>
                <ArrowRightIcon className="w-4 h-4 text-emerald-600 ml-1" />
            </a>
        </div>

        {/* rewards center strip */}
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                    <GiftIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                    <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-emerald-400 font-semibold">
                        Rewards Center
                    </p>
                    <h3 className="text-sm md:text-base font-semibold">
                        <EditableText
                            value={config.rewardsTitle}
                            onSave={(val) => onUpdate && onUpdate({ ...config, rewardsTitle: val })}
                        />
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-300 mt-0.5">
                        <EditableText
                            value={config.rewardsSubtitle}
                            onSave={(val) => onUpdate && onUpdate({ ...config, rewardsSubtitle: val })}
                            tag="span"
                        />
                    </p>
                </div>
            </div>
            <button
                onClick={() => navigate('/spin-win')}
                className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md active:scale-95 transition-all"
            >
                Open Spin &amp; Win
                <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
        </div>
    </section>
);

/* --- features row (was already there) --- */

const ServiceFeatures = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-2 md:py-4 px-4 md:px-0">
        {[
            { icon: ShieldCheckIcon, title: 'Extended Warranty', desc: 'On all certified devices', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: TruckIcon, title: 'Fast Shipping', desc: 'Secure worldwide delivery', color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: ArrowPathIcon, title: 'Hassle-Free Replacement', desc: '7 days return policy', color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: BanknotesIcon, title: 'Best Value', desc: 'Guaranteed price match', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, i) => (
            <div
                key={i}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-3 md:p-4 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default h-full"
            >
                <div className={`p-2.5 md:p-3 ${item.bg} ${item.color} rounded-xl shadow-inner`}>
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-xs md:text-sm leading-tight">
                        {item.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 leading-tight">
                        {item.desc}
                    </p>
                </div>
            </div>
        ))}
    </div>
);

/* --- NEW: Repair Promo Section (WHITE THEME) --- */
const RepairPromo: React.FC<{
    navigate: (path: string) => void;
    config?: typeof HOME_CONFIG_DEFAULT.repair;
    onUpdate?: (newConfig: typeof HOME_CONFIG_DEFAULT.repair) => void;
}> = ({ navigate, config = HOME_CONFIG_DEFAULT.repair, onUpdate }) => (
    <section className="my-3 md:my-5 relative overflow-hidden md:rounded-3xl bg-white shadow-xl border-y md:border border-slate-100 md:mx-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-100/50 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center">
            <div className="flex-1 p-6 md:p-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                    <WrenchIcon className="w-4 h-4 text-emerald-600" /> Expert Service
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
                    <EditableText
                        value={config.title}
                        onSave={(val) => onUpdate && onUpdate({ ...config, title: val })}
                        tag="span"
                    /> <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
                        <EditableText
                            value={config.highlight}
                            onSave={(val) => onUpdate && onUpdate({ ...config, highlight: val })}
                            tag="span"
                        />
                    </span>
                </h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto md:mx-0 leading-relaxed text-sm md:text-base">
                    <EditableText
                        value={config.description}
                        onSave={(val) => onUpdate && onUpdate({ ...config, description: val })}
                        tag="span"
                    />
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-8">
                    <div className="flex items-center gap-2 text-slate-700 text-xs md:text-sm font-semibold bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-blue-500" /> Screen
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 text-xs md:text-sm font-semibold bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <BoltIcon className="w-5 h-5 text-emerald-600" /> Battery
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 text-xs md:text-sm font-semibold bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <WrenchIcon className="w-5 h-5 text-teal-600" /> Hardware
                    </div>
                </div>

                <button
                    onClick={() => navigate('/repair')}
                    className="w-full md:w-auto bg-slate-900 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                    <EditableText
                        value={config.buttonLabel}
                        onSave={(val) => onUpdate && onUpdate({ ...config, buttonLabel: val })}
                        tag="span"
                        className="text-white"
                    /> <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="w-full md:w-1/2 h-40 md:h-auto md:min-h-[300px] relative">
                {/* Gradient to fade image into white background */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:bg-gradient-to-r md:from-white md:via-transparent z-10"></div>
                <img
                    src={getOptimizedImageUrl('https://5.imimg.com/data5/GY/KL/MY-42250892/smart-mobile-phone-service.png', 800, 75)}
                    alt="Mobile Repair"
                    width="800"
                    height="300"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                />
            </div>
        </div>
    </section>
);


/* ---------------- MAIN PAGE ---------------- */

// FIX: Explicitly type the component to include navigate prop in function signature
const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
    const [allItems, setAllItems] = useState<InventoryItem[]>(() => api.getCachedData<InventoryItem[]>('inventory_items') || []);
    const [categories, setCategories] = useState<Category[]>(() => api.getCachedData<Category[]>('categories') || []);
    const [banners, setBanners] = useState<Banner[]>(() => api.getCachedData<Banner[]>('banners') || []);
    const [darazConfig, setDarazConfig] = useState<DarazConfig | null>(() => api.getCachedData<DarazConfig>('daraz_config') || null);

    // TRUE 0ms DELAY: Only initialize as loading if we don't already have inventory items cached
    const [loading, setLoading] = useState<boolean>(() => {
        const cachedItems = api.getCachedData<InventoryItem[]>('inventory_items');
        return !cachedItems || cachedItems.length === 0;
    });

    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [userLocation, setUserLocation] = useState('Detecting...');
    const [viewCounts, setViewCounts] = useState<Record<string, number>>(() => api.getCachedData<Record<string, number>>('product_stats') || {});

    const mobileHeaderRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    const [homeConfig, setHomeConfig] = useState(() => {
        const cached = api.getCachedData<any>('settings_homepage') || HOME_CONFIG_DEFAULT;
        if (cached.hero.button1Label === "Get Instant Quote" || cached.hero.button1Label === "Sell Now") {
            cached.hero.button1Label = "Sell Your";
        }
        if (cached.hero.button2Label === "Shop Certified") {
            cached.hero.button2Label = "Buy";
        }
        return cached;
    });
    const updateHomeConfig = async (section: keyof typeof HOME_CONFIG_DEFAULT, newData: any) => {
        const updatedConfig = { ...homeConfig, [section]: newData };
        await api.updateGenericConfig('settings', 'homepage', updatedConfig);
        setHomeConfig(updatedConfig);
    };

    const handleAddSection = (widgetId: string, index?: number) => {
        const newSection: DynamicSectionData = {
            id: `section-${Date.now()}`,
            type: widgetId,
            content: {}
        };
        const currentSections = homeConfig.sections || [];
        const newSections = index !== undefined
            ? [...currentSections.slice(0, index), newSection, ...currentSections.slice(index)]
            : [...currentSections, newSection];

        updateHomeConfig('sections', newSections);
    };

    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { user, logout } = useAuth();

    // FORCE HIDE ONESIGNAL BELL & ELFSIGHT BRANDING ON MOUNT
    useEffect(() => {
        const cleanupWidgets = () => {
            // OneSignal
            const bell = document.getElementById('onesignal-bell-container');
            if (bell) bell.remove(); // Remove completely from DOM

            const launcher = document.getElementById('onesignal-slidedown-container');
            if (launcher) launcher.style.display = 'none';

            // Elfsight Branding
            const brandingLinks = document.querySelectorAll('a[href*="elfsight.com"]');
            brandingLinks.forEach(el => {
                (el as HTMLElement).style.display = 'none';
                (el as HTMLElement).style.visibility = 'hidden';
                (el as HTMLElement).style.opacity = '0';
                (el as HTMLElement).style.pointerEvents = 'none';
            });

            // Generic class hiding
            const eappsLinks = document.querySelectorAll('.eapps-link');
            eappsLinks.forEach(el => {
                (el as HTMLElement).style.display = 'none !important';
            });
        };

        const detectLocation = async () => {
            try {
                const ipRes = await fetch('https://ipapi.co/json/');
                const ipData = await ipRes.json();
                if (ipData.city || ipData.region) {
                    setUserLocation(ipData.city || ipData.region);
                } else {
                    setUserLocation('Global');
                }
            } catch (e) {
                setUserLocation('Worldwide');
            }
        };

        detectLocation();
        cleanupWidgets();
        const interval = setInterval(cleanupWidgets, 500); // Check repeatedly for dynamic injects
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            // Only show loader if we have NO data to show initially
            if (!allItems || allItems.length === 0) {
                setLoading(true);
            }

            try {
                // These API calls now leverage the caching implemented in services/api.ts
                const [items, cats, allBanners, darazData, lifetimeProductStats, configData] = await Promise.all([
                    api.getInventoryItems(), // Caches for 10 minutes
                    api.getCategories(), // Caches for 1 hour
                    api.getBanners(), // Caches for 1 hour
                    api.getDarazConfig(), // Caches for 1 hour
                    api.getAllProductStats(), // Caches for 1 hour
                    api.getGenericConfig('settings', 'homepage', HOME_CONFIG_DEFAULT)
                ]);

                // FORCE UPDATE OLD LABELS TO NEW SIMPLIFIED ONES
                if (configData.hero.button1Label === "Get Instant Quote" || configData.hero.button1Label === "Sell Now") {
                    configData.hero.button1Label = "Sell Your Phone";
                }
                if (configData.hero.button2Label === "Shop Certified") {
                    configData.hero.button2Label = "Shop Certified";
                }

                setAllItems(items);
                setCategories(cats);
                setBanners(allBanners);
                setDarazConfig(darazData);
                setViewCounts(lifetimeProductStats);
                setHomeConfig(configData);
            } catch (error) {
                console.error('Failed to fetch homepage data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // REAL-TIME VIEW COUNT SUBSCRIPTION
        const unsubscribe = api.subscribeToProductStats(setViewCounts);

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        // Defer Elfsight reviews widget: load after 4s to avoid blocking main thread
        const timer = setTimeout(() => {
            const script = document.createElement('script');
            script.src = "https://elfsightcdn.com/platform.js";
            script.async = true;
            document.body.appendChild(script);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const headerEl = mobileHeaderRef.current;
        if (!headerEl) return;

        const observer = new ResizeObserver(() => {
            if (headerEl) {
                setHeaderHeight(headerEl.offsetHeight);
            }
        });

        observer.observe(headerEl);
        setHeaderHeight(headerEl.offsetHeight);

        return () => observer.disconnect();
    }, []);

    const handleWishlistToggle = (item: InventoryItem) => {
        if (isInWishlist(item.sku)) {
            removeFromWishlist(item.sku);
        } else {
            addToWishlist(item);
        }
    };

    // banner groups
    const heroBanners = banners.filter((b) => b.section === 'hero');
    const section2Banners = banners.filter((b) => b.section === 'section2');
    const section3Banners = banners.filter((b) => b.section === 'section3');
    const section4Banners = banners.filter((b) => b.section === 'section4');
    const section5Banners = banners.filter((b) => b.section === 'section5');

    // categories logic
    // categories logic -- Updated to include Home Page Sections flags
    const hotProducts = allItems.filter((i) => i.category === 'Hot Product' || i.homePageSections?.includes('Hot Product'));
    const hotAccessories = allItems.filter((i) => i.category === 'Hot Accessory' || i.homePageSections?.includes('Hot Accessory'));
    const hotTools = allItems.filter((i) => i.category === 'Hot Tool' || i.homePageSections?.includes('Hot Tool'));
    const hotParts = allItems.filter((i) => i.category === 'Hot Part' || i.homePageSections?.includes('Hot Part'));

    // Certified Pre-Owned (Phones)
    const featuredPhoneProducts = allItems.filter((i) => i.category === 'Phones' || i.homePageSections?.includes('Certified Pre-Owned'));

    // Updated: Include both 'Mobile Cases' (legacy) and 'Phone Cases'
    const mobileCases = allItems.filter((i) => i.category === 'Mobile Cases' || i.category === 'Phone Cases' || i.homePageSections?.includes('Phone Cases'));

    const partnerBrands = [
        darazConfig?.logoUrl || 'https://f1.kwayisi.org/nepal/fonepay.png',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5N7y5g0OM2t-7qZ_ZHOYGBcNM491GL-lg4Q&s',
        'https://ultima.com.np/_next/image?url=%2Fimages%2Fultima%20black%20logo.png&w=640&q=75',
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SEO
                title="Mobi Store - Buy & Sell Certified Phones, Accessories & Electronics Worldwide"
                description="The global trusted destination to sell used phones for instant cash and buy certified pre-owned devices, premium accessories, and electronics with warranty."
                keywords="sell phone, buy used iphone, mobile accessories, electronics shop, Mobi Store"
                canonicalUrl="https://mobitrashstore.com/"
            />

            {/* FORCE HIDE ELFSIGHT BRANDING LINK VIA CSS */}
            <style>{`
                /* Hide Elfsight Branding Link */
                .eapps-link,
                a[href*="elfsight.com"], 
                .eapps-widget-toolbar {
                     display: none !important;
                     visibility: hidden !important;
                     opacity: 0 !important;
                     pointer-events: none !important;
                     height: 0 !important;
                     width: 0 !important;
                     position: absolute !important;
                     z-index: -1000 !important;
                }
                /* HIDE WIDGET HEADER TITLE */
                .eapps-widget-header, 
                .EsReviewHeader-container,
                [class*="Header__Container"],
                [class*="WidgetTitle__WidgetTitleContainer"] { 
                    display: none !important; 
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }

                .elfsight-app-6fb6e234-b4af-4c8a-9f43-dade42e97341 > a {
                    display: none !important;
                }
                
                /* Hide OneSignal bell specifically */
                #onesignal-bell-container {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            `}</style>

            {/* 
                MOBILE HEADER - UPDATED DESIGN
                - Changed to Vertical Gradient (bg-gradient-to-b)
                - This ensures top edge color #34d399 matches status bar
            */}
            <div
                ref={mobileHeaderRef}
                className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#059669] text-white shadow-md rounded-b-2xl overflow-hidden"
            >
                <div className="w-full px-5 pb-5" style={{ paddingTop: `calc(env(safe-area-inset-top) + 0.75rem)` }}>
                    {/* Top Row: Avatar | Search | Bell */}
                    <div className="flex items-center gap-3">
                        <a href="/profile" className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full p-[2px] bg-white/30 backdrop-blur-sm border border-white/40">
                                <img
                                    src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/6325/6325109.png'}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover bg-white"
                                    loading="lazy"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#059669] rounded-full"></div>
                        </a>

                        <button
                            onClick={() => setIsMobileSearchOpen(true)}
                            className="flex-grow h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center px-4 text-white shadow-sm group active:scale-95 transition-all"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 mr-3 text-white/80" />
                            <span className="text-sm font-medium text-white/80">Tap to search...</span>
                        </button>

                        <div className="relative">
                            <NotificationBell
                                navigate={navigate}
                                iconClassName="w-6 h-6 text-white"
                                buttonClassName="shrink-0 w-11 h-11 flex items-center justify-center bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all backdrop-blur-md active:scale-95 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Greeting & Location Row */}
                    <div className="mt-5 flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-0.5">Welcome Back,</p>
                            <h1 className="text-2xl font-black text-white truncate max-w-[200px] drop-shadow-sm">{user?.name ? user.name.split(' ')[0] : 'Guest'}</h1>
                        </div>

                        {/* Location Pill - Right Aligned (Below Bell Area) */}
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm hover:bg-white/20 transition-colors cursor-default">
                                <MapPinIcon className="w-3.5 h-3.5 text-white/80" />
                                <span>{userLocation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* spacer for fixed header */}
            <div className="md:hidden" style={{ height: `${headerHeight}px` }} />

            {/* LIGHT HERO - Main Hero Section (Turn Trash Into Cash) */}
            <VisualEditWrapper
                label="Hero Section"
                config={homeConfig.hero}
                onSave={(d) => updateHomeConfig('hero', d)}
                onAddWidget={(w, pos) => handleAddSection(w, pos === 'before' ? 0 : 999)}
            >
                <HeroSection
                    navigate={navigate}
                    config={homeConfig.hero}
                    sideBanners={banners.filter((b) => b.section === 'hero_side')}
                    onUpdate={(d) => updateHomeConfig('hero', d)}
                />
            </VisualEditWrapper>

            {/* CATEGORY RAIL */}
            <section className="bg-white border-b border-slate-100 relative z-20 md:rounded-none md:-mt-0">
                <div className="w-full md:px-6 py-2 md:py-6 space-y-4">
                    <VisualEditWrapper
                        label="Categories"
                        onEdit={() => navigate('/admin/categories')}
                        onAddWidget={(w) => handleAddSection(w)}
                    >
                        <div className="md:rounded-3xl border-y md:border border-slate-100 bg-white md:bg-slate-50 md:px-4 md:py-3 shadow-sm overflow-hidden">
                            <HomeCategorySlider
                                categories={categories}
                                navigate={navigate}
                                topBanners={banners.filter(b => b.section === 'section1')}
                            />
                        </div>
                    </VisualEditWrapper>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <div className="md:bg-transparent">
                <div className="w-full md:px-6 lg:px-8 space-y-2 md:space-y-4 mt-2 md:mt-4 pb-16 md:pb-12">
                    {/* the stats + rewards area you wanted back */}
                    <VisualEditWrapper
                        label="Stats & Rewards"
                        config={homeConfig.stats}
                        onSave={(d) => updateHomeConfig('stats', d)}
                        onAddWidget={(w) => handleAddSection(w)}
                    >
                        <StatsAndRewards
                            navigate={navigate}
                            config={homeConfig.stats}
                            onUpdate={(d) => updateHomeConfig('stats', d)}
                        />
                    </VisualEditWrapper>

                    <DynamicRenderer
                        sections={homeConfig.sections || []}
                        onUpdate={(newSections) => updateHomeConfig('sections', newSections)}
                        onAddAt={handleAddSection}
                    />

                    {/* existing feature cards */}
                    <VisualEditWrapper
                        label="Value Props"
                        onEdit={() => navigate('/admin/settings')}
                        onAddWidget={(w) => handleAddSection(w)}
                    >
                        <ServiceFeatures />
                    </VisualEditWrapper>

                    {/* Daraz + partners strip */}
                    {darazConfig?.enabled && (
                        <section className="my-3 md:my-4 px-4 md:px-0">
                            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-lg text-white">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                        <div className="bg-white rounded-xl p-2 md:p-3 shadow-md">
                                            <img
                                                src={getOptimizedImageUrl(darazConfig.logoUrl, 100, 36)}
                                                className="h-7 md:h-9 object-contain"
                                                alt="Daraz Logo"
                                                width="100"
                                                height="36"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] opacity-80 font-semibold">
                                                Official Online Partner
                                            </p>
                                            <p className="font-bold text-lg md:text-xl leading-snug">
                                                Shop Mobi Store on Daraz
                                            </p>
                                            <p className="text-[11px] md:text-xs opacity-90 mt-1">
                                                100% authentic listings, secure payments and nationwide delivery.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                                        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                                            <span className="text-[11px] md:text-xs uppercase tracking-[0.16em] opacity-90 font-semibold">
                                                Trusted brands
                                            </span>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                {partnerBrands.map((logo, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-white/95 rounded-lg p-1.5 md:p-2 shadow-md"
                                                    >
                                                        <img
                                                            src={getOptimizedImageUrl(logo, 80, 75)}
                                                            alt="Partner logo"
                                                            width="80"
                                                            height="28"
                                                            className="h-6 md:h-7 w-auto object-contain"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-start md:justify-end">
                                            <a
                                                href={darazConfig.shopUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-black/15 hover:bg:black/25 border border-white/40 text-xs md:text-sm font-semibold shadow-lg backdrop-blur-sm"
                                            >
                                                Visit Daraz Store
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* NEW: REPAIR PROMO SECTION */}
                    <VisualEditWrapper
                        label="Repair Section"
                        config={homeConfig.repair}
                        onSave={(d) => updateHomeConfig('repair', d)}
                        onAddWidget={(w) => handleAddSection(w)}
                    >
                        <RepairPromo
                            navigate={navigate}
                            config={homeConfig.repair}
                            onUpdate={(d) => updateHomeConfig('repair', d)}
                        />
                    </VisualEditWrapper>

                    {/* existing product sections */}
                    <div className="md:rounded-lg overflow-hidden">
                        <PromoBannerSlider banners={section2Banners} navigate={navigate} />
                    </div>

                    <VisualEditWrapper
                        label="Inventory"
                        onEdit={() => navigate('/admin/inventory')}
                        onAddWidget={(w) => handleAddSection(w)}
                    >
                        <ProductCarousel
                            title={homeConfig.titles?.hotAccessories || "Hot Accessories"}
                            items={hotAccessories}
                            navigate={navigate}
                            onAddToCart={addToCart}
                            onWishlistToggle={handleWishlistToggle}
                            isInWishlist={isInWishlist}
                            viewCounts={viewCounts}
                        />
                    </VisualEditWrapper>

                    <ProductCarousel
                        title={homeConfig.titles?.phoneCases || "Phone Cases"}
                        items={mobileCases}
                        navigate={navigate}
                        onAddToCart={addToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        viewCounts={viewCounts}
                    />

                    <div className="md:rounded-lg overflow-hidden">
                        <PromoBannerSlider banners={section3Banners} initialIndex={1} navigate={navigate} />
                    </div>

                    <ProductCarousel
                        title={homeConfig.titles?.hotTools || "Hot Tools"}
                        items={hotTools}
                        navigate={navigate}
                        onAddToCart={addToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        viewCounts={viewCounts}
                    />

                    <div className="md:rounded-lg overflow-hidden">
                        <PromoBannerSlider banners={section4Banners} initialIndex={2} navigate={navigate} />
                    </div>

                    <ProductCarousel
                        title={homeConfig.titles?.hotParts || "Hot Parts"}
                        items={hotParts}
                        navigate={navigate}
                        onAddToCart={addToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        viewCounts={viewCounts}
                    />

                    <div className="md:rounded-lg overflow-hidden">
                        <PromoBannerSlider banners={section5Banners} initialIndex={3} navigate={navigate} />
                    </div>

                    <ProductCarousel
                        title={homeConfig.titles?.hotProducts || "Hot Products"}
                        items={hotProducts}
                        navigate={navigate}
                        onAddToCart={addToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        viewCounts={viewCounts}
                    />

                    {/* CERTIFIED PRE-OWNED */}
                    <ProductCarousel
                        title={homeConfig.titles?.certifiedPreOwned || "Certified Pre-Owned"}
                        items={featuredPhoneProducts}
                        navigate={navigate}
                        onAddToCart={addToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        viewCounts={viewCounts}
                    />

                    {/* BLOG SECTION - Always visible, with mobile slider logic inside */}
                    <VisualEditWrapper label="Blog Posts" onEdit={() => navigate('/admin/blog')}>
                        <React.Suspense fallback={<SectionLoader />}>
                            <HomeBlogSection navigate={navigate} />
                        </React.Suspense>
                    </VisualEditWrapper>

                    {/* OTHER FEATURES - Desktop Only */}
                    <div className="hidden md:block space-y-12">
                        <React.Suspense fallback={<SectionLoader />}>
                            <Testimonials />
                        </React.Suspense>
                        <React.Suspense fallback={<SectionLoader />}>
                            <FAQ />
                        </React.Suspense>
                    </div>

                    {/* Google Reviews Widget - Desktop Only */}
                    <div className="hidden md:block bg-white md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative md:mb-0">
                        {/* Removed layout hacks, relying on pure CSS now */}
                        <div className="p-0 relative">
                            <div className="elfsight-app-6fb6e234-b4af-4c8a-9f43-dade42e97341" data-elfsight-app-lazy></div>
                        </div>
                        {/* Mask removed - CSS handles hiding now */}
                    </div>


                </div>
            </div>

            <React.Suspense fallback={null}>
                <SearchModal
                    isOpen={isMobileSearchOpen}
                    onClose={() => setIsMobileSearchOpen(false)}
                    navigate={navigate}
                />
            </React.Suspense>
        </div>
    );
};

export default HomePage;
