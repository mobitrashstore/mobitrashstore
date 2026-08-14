import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence } from 'framer-motion';
import FullscreenGallery from '../components/FullscreenGallery';
import { permissionService } from '../services/permissionService';
import * as api from '../services/api';
import { InventoryItem, DarazConfig, PaymentPartner } from '../types';
import { useCart } from '../context/CartContext';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import NotFoundPage from './NotFoundPage';
import { useWishlist } from '../context/WishlistContext';
import { HeartIcon } from '../components/icons/HeartIcon';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { TruckIcon } from '../components/icons/TruckIcon';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { ShoppingCartIcon } from '../components/icons/ShoppingCartIcon';
import { BoltIcon } from '../components/icons/BoltIcon';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { MinusIcon } from '../components/icons/MinusIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { ChevronUpIcon } from '../components/icons/ChevronUpIcon';
import { ArrowTopRightOnSquareIcon } from '../components/icons/ArrowTopRightOnSquareIcon';
import { useNotification } from '../context/NotificationContext';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
// LAZY LOAD HEAVY COMPONENTS
const SearchModal = React.lazy(() => import('../components/SearchModal'));
const ProductReviews = React.lazy(() => import('../components/ProductReviews'));
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { NEPAL_DISTRICTS, INSIDE_VALLEY_DISTRICTS } from '../constants';
import SEO from '../components/SEO';
import { EyeIcon } from '../components/icons/EyeIcon';
import VisualEditWrapper from '../components/VisualEditWrapper';
import { useVisualEditing } from '../context/VisualEditingContext';
import EditableText from '../components/EditableText';

interface ProductDetailPageProps {
    sku: string;
    navigate: (path: string) => void;
}


// --- Helper Components ---

const PlayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l1.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const TrustBadge: React.FC<{ icon?: React.ElementType, imgUrl?: string, label: string, subLabel?: string }> = ({ icon: Icon, imgUrl, label, subLabel }) => (
    <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 flex items-center justify-center mb-2">
            {imgUrl ? (
                <img src={imgUrl} alt={label} className="w-full h-full object-contain" />
            ) : (
                Icon && <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#059669]">
                    <Icon className="w-6 h-6" />
                </div>
            )}
        </div>
        <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
        {subLabel && <p className="text-[10px] text-gray-500 leading-tight">{subLabel}</p>}
    </div>
);

const RelatedProductCard: React.FC<{
    item: InventoryItem;
    navigate: (path: string) => void;
    onAddToCart: (item: InventoryItem) => void;
}> = React.memo(({ item, navigate, onAddToCart }) => {
    const discount = item.oldPrice ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;
    const productPath = api.getProductPermalink(item);

    return (
        <a
            href={productPath}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative min-w-[160px]"
            onClick={(e) => { e.preventDefault(); navigate(productPath) }}
        >
            {discount > 0 && (
                <div className="absolute top-2 left-2 z-10">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-orange-700 bg-orange-100 rounded-md">
                        {discount}% OFF
                    </span>
                </div>
            )}
            <div className="block p-4 bg-gray-50 dark:bg-slate-800/50 aspect-square">
                <img src={item.media[0]} alt={item.title} width="160" height="160" className="w-full h-full object-contain" />
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-xs font-medium text-gray-700 line-clamp-2 mb-2 h-8">{item.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="font-bold text-sm text-gray-900">NPR {item.price.toLocaleString()}</p>
                        {item.oldPrice && <p className="text-[10px] text-gray-400 line-through">{item.oldPrice.toLocaleString()}</p>}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(item); }} className="p-2 bg-gray-100 rounded-full hover:bg-[#059669] hover:text-white transition-colors">
                        <ShoppingCartIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </a>
    );
});

const SpecRow: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <div className="flex py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="w-1/3 text-sm text-gray-500 font-medium">{label}</div>
        <div className="w-2/3 text-sm text-gray-800 dark:text-gray-200 font-semibold">{Array.isArray(value) ? value.join(', ') : value}</div>
    </div>
);

const AppDownloadSection = () => (
    <div className="hidden lg:flex items-center gap-5 p-5 mt-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-300">
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <img src="/assets/qr_code.png" alt="Scan to Download" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
                <img src="/header-logo.png" className="h-6 object-contain opacity-90" alt="Mobi Store" />
            </div>
            <p className="text-[13px] font-extrabold text-slate-800 leading-snug tracking-tight">
                Download app to enjoy<br />
                <span className="text-orange-600">exclusive discounts!</span>
            </p>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <div className="p-1 bg-slate-100 rounded-md">
                    <DevicePhoneMobileIcon className="w-3 h-3 text-slate-500" />
                </div>
                Scan with mobile
            </div>
        </div>
    </div>
);

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ sku, navigate }) => {
    const [product, setProduct] = useState<InventoryItem | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedStorage, setSelectedStorage] = useState('');
    const [showSpecs, setShowSpecs] = useState(true);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [viewCount, setViewCount] = useState(1); // Default to 1 (current user)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    const [darazConfig, setDarazConfig] = useState<DarazConfig | null>(null);
    const [paymentPartners, setPaymentPartners] = useState<PaymentPartner[]>([]);

    const { cart, addToCart, openCart } = useCart();
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addNotification } = useNotification();

    // --- NEW: ZOOM & SLIDE REFS/STATE ---
    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
    const autoSlideRef = useRef<number | null>(null);

    // Location and Delivery State
    const [deliveryDistrict, setDeliveryDistrict] = useState('Kathmandu');
    const [deliveryDateStr, setDeliveryDateStr] = useState('');

    // Flash Sale Timer Logic
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    // Delivery Date Calculation Logic
    const calculateDeliveryDate = (district: string) => {
        const isInsideValley = INSIDE_VALLEY_DISTRICTS.includes(district);
        const days = isInsideValley ? 2 : 4;
        const date = new Date();
        date.setDate(date.getDate() + days);
        setDeliveryDateStr(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };


    // DARAZ-STYLE URL AUTO-CORRECTION
    useEffect(() => {
        if (!product) return;

        // Use the API helper to get the "correct" Daraz-style permalink
        const permalink = api.getProductPermalink(product);
        const currentPath = window.location.pathname;

        // If current path doesn't match the new standard (slug-pkSKU),
        // silently update the URL to the SEO-standard one.
        if (currentPath !== permalink) {
            window.history.replaceState(null, '', permalink);
        }
    }, [product]);

    useEffect(() => {
        calculateDeliveryDate('Kathmandu');

        // Auto-detect location removed to prevent permission prompt on load.
        // Delivery district defaults to Kathmandu.
        calculateDeliveryDate('Kathmandu');
    }, []);

    useEffect(() => {
        const loadData = async () => {
            // 1. PHASE ONE: CRITICAL CONTENT (BLOCKING BUT FAST)
            setLoading(true);
            setProduct(null);
            setRelatedProducts([]); // Clear old data
            setActiveImageIndex(0);
            setShowVideo(false);
            setQuantity(1);
            setSelectedColor(null);
            setSelectedStorage('');
            setIsDescriptionExpanded(false);
            setViewCount(1); // Reset view count

            try {
                // Try fetching by SKU first (Fastest) - SMART ID lookup in API handles all patterns
                const foundProduct = await api.getInventoryItemBySku(sku);

                if (foundProduct) {
                    // 1. PHASE ONE COMPLETE: RENDER UI IMMEDIATELY
                    setProduct(foundProduct);
                    setLoading(false);
                    // ... (rest of initial selection logic)
                } else {
                    // FAILSAFE: If no product found, check if this slug was actually a category
                    // This happens if someone clicks a category link that mistakenly uses the /product/DETAIL format
                    const allCats = await api.getCategories();
                    const slugMatch = allCats.find(c => api.slugify(c.name) === sku.toLowerCase());
                    if (slugMatch) {
                        navigate(`/buy?category=${encodeURIComponent(slugMatch.name)}`);
                        return;
                    }
                    
                    // Not a product, not a category -> 404
                    setLoading(false);
                }

                if (foundProduct) {
                    const rootEl = document.getElementById('root');
                    if (rootEl) rootEl.scrollTo({ top: 0, behavior: 'auto' });

                    // Initialize selection state
                    if (foundProduct.specs?.storage_gb) {
                        setSelectedStorage(foundProduct.specs.storage_gb.toString() + 'GB');
                    } else if (foundProduct.specs?.Storage) {
                        setSelectedStorage(foundProduct.specs.Storage.toString());
                    }
                    if (foundProduct.colors && foundProduct.colors.length > 0) {
                        setSelectedColor(foundProduct.colors[0]);
                    }

                    // 2. PHASE TWO: BACKGROUND DATA (NON-BLOCKING)
                    Promise.all([
                        api.incrementProductViewAndGetCount(foundProduct.title).then(count => {
                            const finalView = Math.max(1, count, (foundProduct as any).views || 0);
                            setViewCount(finalView);
                        }).catch(console.warn),
                        api.getDarazConfig().then(setDarazConfig),
                        api.getPaymentPartners().then(setPaymentPartners),
                        api.getInventoryItems().then(allItems => {
                            const related = allItems
                                .filter(item => item.category === foundProduct.category && item.sku !== foundProduct.sku)
                                .slice(0, 6);
                            setRelatedProducts(related);
                        })
                    ]).catch(err => console.error("Background data load error", err));

                } else {
                    // Product completely not found after all attempts
                    setLoading(false);
                }
            } catch (error) {
                console.error("Critical load error", error);
                setLoading(false);
            }
        };

        loadData();
    }, [sku]);

    // LIVE VIEW COUNT POLLING
    useEffect(() => {
        if (!product) return;

        const interval = setInterval(async () => {
            try {
                const lifetimeViews = await api.getProductStats(product.title);
                setViewCount(Math.max(1, lifetimeViews, (product as any).views || 0));
            } catch (e) {
                console.warn("View polling failed", e);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [product]);

    // --- NEW: AUTO-SLIDE EFFECT ---
    useEffect(() => {
        if (!product || showVideo || product.media.length <= 1) return;

        autoSlideRef.current = window.setInterval(() => {
            setActiveImageIndex(prev => {
                if (product.media.length === 0) return 0;
                return (prev + 1) % product.media.length;
            });
        }, 5000);

        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [product, showVideo]);

    // --- FLASH SALE TIMER ---
    useEffect(() => {
        if (!product?.flashSaleEndTime) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const difference = +new Date(product.flashSaleEndTime!) - +new Date();
            if (difference > 0) {
                return {
                    d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    m: Math.floor((difference / 1000 / 60) % 60),
                    s: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        const initial = calculateTimeLeft();
        setTimeLeft(initial);
        if (!initial) return;

        const timer = setInterval(() => {
            const tl = calculateTimeLeft();
            setTimeLeft(tl);
            if (!tl) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [product]);

    // --- FIX: Image URL Transformer ---
    // Prevents broken images when using data:image (base64) strings
    const getTransformedImageUrl = (url: string | undefined, width = 800, quality = 80) => {
        if (!url) return 'https://placehold.co/800x800?text=No+Image';
        if (url.startsWith('data:')) return url; // Don't transform base64
        if (url.includes('ik.imagekit.io')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}tr=w-${width},q-${quality},f-auto`;
        }
        if (url.includes('res.cloudinary.com')) {
            return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
        }
        return url;
    };

    // --- NEW: ZOOM HANDLERS ---
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (window.innerWidth <= 768 || !product || !product.media[activeImageIndex] || showVideo) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;

        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${getTransformedImageUrl(product.media[activeImageIndex], 2400, 100)})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: '250%', // Magnification level
        });
    };

    const handleMouseEnter = () => {
        // Pause auto-play on hover
        if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };

    const handleMouseLeave = () => {
        setZoomStyle({ display: 'none' });
        // Resume auto-play on leave
        if (product && product.media.length > 1 && !showVideo) {
            autoSlideRef.current = window.setInterval(() => {
                setActiveImageIndex(prev => {
                    if (product.media.length === 0) return 0;
                    return (prev + 1) % product.media.length;
                });
            }, 5000);
        }
    };

    // Derived available storages based on selected color
    const availableStorages = useMemo(() => {
        if (!product || !product.variants) return [];
        if (!selectedColor) return [];

        return product.variants
            .filter(v => !v.color || v.color === selectedColor)
            .map(v => v.storage)
            .filter((value, index, self) => self.indexOf(value) === index);
    }, [product, selectedColor]);

    // Determine current active variant
    const activeVariant = useMemo(() => {
        if (!product || !product.variants) return null;
        if (!selectedStorage) return null;

        return product.variants.find(v =>
            v.storage === selectedStorage &&
            (!v.color || !selectedColor || v.color === selectedColor)
        );
    }, [product, selectedColor, selectedStorage]);

    // Logic to handle Color Selection
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);

        if (product?.imageColorIndex) {
            const matchedIndexStr = Object.keys(product.imageColorIndex).find(key =>
                product.imageColorIndex![parseInt(key)] === color
            );

            if (matchedIndexStr !== undefined) {
                const idx = parseInt(matchedIndexStr);
                if (idx >= 0 && idx < product.media.length) {
                    setActiveImageIndex(idx);
                    setShowVideo(false);
                }
            }
        }
    };

    const handleWishlistToggle = () => {
        if (product) {
            isInWishlist(product.sku) ? removeFromWishlist(product.sku) : addToWishlist(product);
        }
    };

    const validateSelection = () => {
        if (!product) return false;

        const hasColors = product.colors && product.colors.length > 0;

        if (hasColors && !selectedColor) {
            addNotification("Please select a color", "error");
            return false;
        }

        return true;
    }

    const handleAddToCartAction = () => {
        if (!validateSelection() || !product) return;

        let finalPrice = product.price;

        if (activeVariant) {
            finalPrice = activeVariant.price;
        }

        let media = [...product.media];
        if (selectedColor && product.imageColorIndex) {
            const imageIndexStr = Object.keys(product.imageColorIndex).find(
                key => product.imageColorIndex![parseInt(key)] === selectedColor
            );

            if (imageIndexStr !== undefined) {
                const imageIndex = parseInt(imageIndexStr);
                if (imageIndex >= 0 && imageIndex < media.length) {
                    const selectedImage = media[imageIndex];
                    media.splice(imageIndex, 1);
                    media.unshift(selectedImage);
                }
            }
        }

        const cartItemObj = {
            ...product,
            price: finalPrice,
            media: media,
        };

        addToCart(cartItemObj, quantity, selectedColor || undefined);
    }

    const handleBuyNow = () => {
        if (!validateSelection() || !product) return;
        handleAddToCartAction();
        navigate('/checkout');
    }

    const videoData = useMemo(() => {
        if (!product || !product.videoUrl) return null;
        const url = product.videoUrl.trim();

        try {
            // Check if it's a raw iframe string
            if (url.startsWith('<iframe') && url.includes('src=')) {
                const srcMatch = url.match(/src=["']([^"']+)["']/);
                if (srcMatch) {
                    return { type: 'iframe', url: srcMatch[1] };
                }
            }

            // Direct video files
            if (url.match(/\.(mp4|webm|ogg|mov)$|^blob:|^data:video/i)) {
                return { type: 'direct', url };
            }

            // YouTube Parsing (Robust regex)
            const ytRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const ytMatch = url.match(ytRegex);
            if (ytMatch && ytMatch[1]) {
                const videoId = ytMatch[1];
                return { type: 'iframe', url: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&loop=1` };
            }

            // Vimeo
            if (url.includes('vimeo.com')) {
                const vimeoIdMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
                const videoId = vimeoIdMatch ? vimeoIdMatch[3] : url.split('/').pop();
                return { type: 'iframe', url: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1` };
            }

            // Tiktok / Embed links
            if (url.includes('tiktok.com') || url.includes('/embed/') || url.includes('/v/')) {
                return { type: 'iframe', url };
            }

            // Default to iframe if it contains "http" but no specific match (fallback)
            if (url.startsWith('http')) {
                return { type: 'iframe', url };
            }
        } catch (e) {
            console.error("Video parse error", e);
        }
        return null;
    }, [product?.videoUrl]);

    if (loading) {
        return <div className="bg-white"><ProductDetailSkeleton /></div>;
    }

    if (!product) {
        return <NotFoundPage navigate={navigate} />;
    }

    let displayPrice = product.price;
    let displayOldPrice = product.oldPrice;
    let displayStock = product.stock;

    if (activeVariant) {
        displayPrice = activeVariant.price;
        displayStock = activeVariant.stock;
    } else if (product.variants && product.variants.length > 0) {
        // Show starting price for selected color if any, else overall min price
        const applicableVariants = selectedColor
            ? product.variants.filter(v => v.color === selectedColor)
            : product.variants;

        if (applicableVariants.length > 0) {
            const minPrice = Math.min(...applicableVariants.map(v => v.price));
            if (minPrice > 0) displayPrice = minPrice;

            // If all variants for selected color are out of stock
            const totalStockForSelection = applicableVariants.reduce((sum, v) => sum + v.stock, 0);
            displayStock = totalStockForSelection;
        }
    }

    const isWishlisted = isInWishlist(product.sku);
    const isOutOfStock = displayStock === 0;
    const isPhone = product.category === 'Phones';
    const soldCount = product.soldCount || 0;

    const siteUrl = 'https://mobitrashstore.com';
    const canonicalUrl = `https://mobitrashstore.com${api.getProductPermalink(product)}`;

    const tagsList = product.tags ? product.tags.join(', ') : '';
    const keywords = `buy used ${product.title} nepal, ${product.specs?.brand || ''} price nepal, second hand mobile, ${tagsList}`;

    const cleanSku = String(product.sku || product.id || 'MOBI-001').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || 'MOBI-ITEM';
    const cleanTitle = (product.title || 'Product').slice(0, 140).trim();
    const cleanDescription = (product.description || `Buy certified ${cleanTitle} in Nepal at Mobi Store. Professionally tested with warranty.`).slice(0, 4900).trim();
    const ratingVal = 4.8;
    const reviewCount = Math.max(12, (product.soldCount || 5) * 3);

    const productSchema = {
        "@type": "Product",
        "name": cleanTitle,
        "image": product.media || [],
        "description": cleanDescription,
        "sku": cleanSku,
        "mpn": cleanSku,
        "brand": {
            "@type": "Brand",
            "name": product.specs?.brand || "Mobi Store"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingVal,
            "reviewCount": reviewCount,
            "bestRating": 5,
            "worstRating": 1
        },
        "review": [
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Verified Customer"
                },
                "datePublished": "2026-06-01",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": 5,
                    "bestRating": 5,
                    "worstRating": 1
                },
                "reviewBody": `Excellent condition ${product.title}. Fast delivery in Kathmandu and authentic certified product.`
            }
        ],
        "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "NPR",
            "price": displayPrice,
            "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
            "itemCondition": product.grade === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
            "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "NP",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": 150,
                    "currency": "NPR"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "NP"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "DAY"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 1,
                        "maxValue": 3,
                        "unitCode": "DAY"
                    }
                }
            },
            "seller": {
                "@type": "Organization",
                "name": "Mobi Store",
                "url": "https://mobitrashstore.com"
            }
        }
    };

    const breadcrumbSchema = {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Buy",
                "item": `${siteUrl}/buy`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.specs?.Category || "Product",
                "item": `${siteUrl}/buy?category=${encodeURIComponent(product.specs?.Category || "Phones")}`
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": product.title,
                "item": canonicalUrl
            }
        ]
    };

    const combinedSchema = {
        "@context": "https://schema.org/",
        "@graph": [
            productSchema,
            breadcrumbSchema
        ]
    };

    const renderMarkdown = (content: string) => {
        if (!content) return null;

        let processedContent = content;
        // Replace image placeholders [[image_N]] with actual URLs from media array
        if (product && product.media) {
            product.media.forEach((url, index) => {
                if (url) {
                    const placeholder = `[[image_${index}]]`;
                    // Use split/join for global replacement
                    processedContent = processedContent.split(placeholder).join(url);
                }
            });
        }

        return (
            <div className="prose prose-sm prose-slate max-w-none 
                prose-headings:text-slate-900 prose-headings:font-extrabold 
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-slate-100
                prose-table:border prose-table:border-slate-200 prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow-sm
                prose-th:bg-slate-50 prose-th:p-3 prose-th:text-slate-700 prose-th:font-bold
                prose-td:p-3 prose-td:border-t prose-td:border-slate-100 prose-td:text-slate-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {processedContent}
                </ReactMarkdown>
            </div>
        );
    };

    const DescriptionSection = () => (
        product.description ? (
            <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                    Detailed Product Overview
                </h2>

                <div className="relative">
                    <div className={`${!isDescriptionExpanded ? 'max-h-[500px] overflow-hidden' : ''} transition-all duration-500`}>
                        {renderMarkdown(product.description)}
                    </div>

                    {!isDescriptionExpanded && product.description.length > 300 && (
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-[#111] via-white/80 dark:via-[#111]/80 to-transparent flex items-end justify-center pb-2">
                            <button
                                onClick={() => setIsDescriptionExpanded(true)}
                                className="px-8 py-2.5 bg-slate-900 dark:bg-orange-600 text-white text-sm font-bold rounded-full shadow-xl hover:bg-slate-800 dark:hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                Read Full Description
                                <ChevronDownIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {isDescriptionExpanded && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setIsDescriptionExpanded(false)}
                                className="px-6 py-2 border-2 border-slate-200 text-slate-500 text-sm font-bold rounded-full hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                Show Less
                                <ChevronUpIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ) : null
    );

    const SpecsSection = () => (
        <div className="border-t border-gray-200 pt-4 mb-8">
            <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="flex w-full items-center justify-between py-2 text-lg font-bold text-gray-900"
            >
                Product Specifications
                {showSpecs ? <ChevronUpIcon className="w-5 h-5 text-[#059669]" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
            </button>

            {showSpecs && (
                <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4">
                        <SpecRow label="Brand" value={product.specs?.brand || 'Generic'} />
                        <SpecRow label="Model Name" value={product.specs?.model || product.title} />
                        <SpecRow label="Warranty" value={product.warranty} />
                        <SpecRow label="Weight" value={product.weight_g ? `${product.weight_g} grams` : undefined} />
                        <SpecRow label="Dimensions" value={product.dimensions && (Number(product.dimensions.length) > 0 || Number(product.dimensions.width) > 0) ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm` : undefined} />
                        {product.specs && Object.entries(product.specs).map(([key, val]) => {
                            if (key === 'brand' || key === 'model' || key === 'color') return null;
                            return <SpecRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />;
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
            <SEO
                title={product.metaTitle || product.title}
                description={product.metaDescription || product.description?.substring(0, 160) || `Buy ${product.title} at best price in Nepal. ${product.grade || 'Certified'} condition with warranty.`}
                keywords={keywords}
                image={product.media[0]}
                canonicalUrl={canonicalUrl}
                schema={combinedSchema}
            />

            <div
                className="sticky top-0 z-30 bg-[#059669] border-b border-emerald-600/50 px-4 py-3 flex items-center justify-between md:hidden pt-2 shadow-sm"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
                <button onClick={() => window.history.back()} className="p-2 -ml-2 text-white hover:bg-white/20 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <React.Suspense fallback={<div className="h-10 w-8 bg-gray-200 rounded-full" />}>
                    <button onClick={() => setIsSearchOpen(true)} className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex-grow mx-4 shadow-sm text-left">
                        <MagnifyingGlassIcon className="w-4 h-4 text-white/80 mr-2 flex-shrink-0" />
                        <span className="text-white/80 text-xs truncate w-full">Search for products...</span>
                    </button>
                </React.Suspense>
                <div className="relative">
                    <button onClick={openCart} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                        <ShoppingCartIcon className="w-6 h-6" />
                        {cartItemCount > 0 && (
                            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-[#059669] text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2 border-2 border-sky-300">
                                {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="w-full px-0 md:px-6 lg:px-8 md:py-8">
                <VisualEditWrapper
                    label="Product Data"
                    config={product}
                    onSave={async (newData) => {
                        if (!product) return;
                        await api.updateInventoryItem(product.id, newData);
                        setProduct({ ...product, ...newData });
                    }}
                >
                    <div className="bg-white md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">

                            <div className="p-4 md:p-8 lg:col-span-7 border-b lg:border-b-0 lg:border-r border-gray-200">
                                <div
                                    className="relative w-full h-72 sm:h-96 bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-center mb-6 p-4 overflow-hidden group/main"
                                    onMouseMove={handleMouseMove}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* --- NEW: DESKTOP ZOOM OVERLAY --- */}
                                    {!showVideo && (
                                        <div
                                            className="hidden md:block absolute inset-0 z-20 pointer-events-none bg-no-repeat transition-opacity duration-200 rounded-2xl"
                                            style={{
                                                ...zoomStyle,
                                                // Fix: Access 'display' using type assertion to avoid TypeScript error on CSSProperties
                                                opacity: (zoomStyle as any).display === 'block' ? 1 : 0
                                            }}
                                        />
                                    )}

                                    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm pointer-events-none">
                                        <EyeIcon className="w-3.5 h-3.5 text-white/90" />
                                        <span className="text-xs font-bold text-white tabular-nums">{viewCount}</span>
                                    </div>

                                    <button
                                        onClick={handleAddToCartAction}
                                        className="absolute bottom-3 right-3 p-2 bg-white rounded-full text-gray-400 hover:text-[#059669] shadow-md z-30 border border-gray-100"
                                        aria-label="Add to cart"
                                    >
                                        <ShoppingCartIcon className="w-6 h-6" />
                                    </button>

                                    <button onClick={handleWishlistToggle} className="absolute top-3 right-3 p-2 bg-white rounded-full text-gray-400 hover:text-rose-500 shadow-md z-30 border border-gray-100">
                                        <HeartIcon className={`w-6 h-6 ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'}`} />
                                    </button>

                                    {showVideo && videoData ? (
                                        videoData.type === 'iframe' ? (
                                            <iframe
                                                src={videoData.url}
                                                title="Product Video"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full rounded-2xl shadow-inner bg-black"
                                            ></iframe>
                                        ) : (
                                            <video
                                                src={videoData.url}
                                                controls
                                                autoPlay
                                                muted
                                                loop
                                                className="w-full h-full rounded-2xl object-contain bg-black"
                                            />
                                        )
                                    ) : (
                                        <img
                                            src={getTransformedImageUrl(product.media[activeImageIndex], 800, 90)}
                                            alt={product.title}
                                            onClick={() => setIsGalleryOpen(true)}
                                            className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-500 cursor-zoom-in group-hover/main:scale-[1.02]"
                                        />
                                    )}
                                </div>

                                <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide justify-center items-center">
                                    {product.media.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => { setActiveImageIndex(index); setShowVideo(false); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
                                            className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 p-1 bg-white transition-all ${!showVideo && activeImageIndex === index ? 'border-[#059669] scale-105 opacity-100' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={getTransformedImageUrl(img, 200)} alt={`View ${index}`} className="w-full h-full object-contain" />
                                        </button>
                                    ))}

                                    {videoData && (
                                        <button
                                            onClick={() => { setShowVideo(true); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
                                            className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 flex items-center justify-center bg-gray-900 text-white transition-all ${showVideo ? 'border-[#059669] scale-105' : 'border-gray-200 opacity-60'}`}
                                            title="Watch Video"
                                        >
                                            <PlayIcon className="w-8 h-8" />
                                        </button>
                                    )}
                                </div>

                                <div className="hidden lg:block mt-8">
                                    <DescriptionSection />
                                    <SpecsSection />
                                </div>
                            </div>

                            <div className="p-4 md:p-8 lg:col-span-5">
                                <div className="sticky top-24">
                                    <div className="mb-4">
                                        <span className="text-blue-600 text-sm font-semibold">
                                            <EditableText
                                                value={product.specs?.brand || 'Product'}
                                                onSave={async (val) => {
                                                    const newSpecs = { ...product.specs, brand: val };
                                                    const newData = { specs: newSpecs };
                                                    await api.updateInventoryItem(product.id, newData);
                                                    setProduct({ ...product, ...newData });
                                                }}
                                                tag="span"
                                            />
                                        </span>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">
                                            <EditableText
                                                value={product.title}
                                                onSave={async (val) => {
                                                    const newData = { title: val };
                                                    await api.updateInventoryItem(product.id, newData);
                                                    setProduct({ ...product, ...newData });
                                                }}
                                                tag="span"
                                            />
                                        </h1>
                                        {soldCount > 0 && <p className="text-xs text-slate-500 mt-1 font-medium">{soldCount} sold recently</p>}
                                    </div>

                                    <div className="flex items-baseline gap-3 mb-4">
                                        <h2 className="text-3xl font-extrabold text-gray-900">NPR {displayPrice.toLocaleString()}</h2 >
                                        {displayOldPrice && <span className="text-lg text-gray-400 line-through">NPR {displayOldPrice.toLocaleString()}</span>}
                                    </div>

                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {displayStock > 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase rounded">
                                                IN STOCK
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase rounded">
                                                OUT OF STOCK
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase rounded">
                                            <BoltIcon className="w-3 h-3" /> Selling Out Fast
                                        </span>
                                    </div>

                                    {timeLeft && (
                                        <div className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg animate-pulse-slow border-2 border-white/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                        <BoltIcon className="w-6 h-6 animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-100 uppercase tracking-wider mb-0.5">Flash Deal Ends In</p>
                                                        <div className="flex items-baseline gap-1 font-mono font-black text-xl leading-none">
                                                            {timeLeft.d > 0 && <span>{timeLeft.d}d :</span>}
                                                            <span>{String(timeLeft.h).padStart(2, '0')}</span><span className="text-sm">:</span>
                                                            <span>{String(timeLeft.m).padStart(2, '0')}</span><span className="text-sm">:</span>
                                                            <span>{String(timeLeft.s).padStart(2, '0')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-bold text-amber-100 uppercase">Don't Miss Out</p>
                                                    <p className="text-xs font-bold">Limited Stock Available</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-lg p-3 flex items-center gap-3 mb-6">
                                        <TruckIcon className="w-6 h-6 text-amber-600" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">
                                                Delivery to <span className="text-amber-900">{deliveryDistrict}</span>
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Expected By <span className="font-semibold text-gray-900">{deliveryDateStr}</span>
                                                <span className="text-gray-400 mx-1">•</span>
                                                <span className="text-gray-500">{INSIDE_VALLEY_DISTRICTS.includes(deliveryDistrict) ? '2 Days' : '4 Days'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 mb-4 border-b border-gray-100 pb-6">
                                        <TrustBadge imgUrl="https://cdn.ourshopee.com/ourshopee-img/assets/vector_icons/top_rated_customer.png" label="Top Rated" subLabel="By Customer" />
                                        <TrustBadge imgUrl="https://cdn.ourshopee.com/ourshopee-img/assets/vector_icons/Secure_Transaction.png" label="Secure" subLabel="Transaction" />
                                        <TrustBadge imgUrl="https://cdn.ourshopee.com/ourshopee-img/assets/vector_icons/Exchange_Available.png" label="Exchange" subLabel="Available" />
                                        <TrustBadge imgUrl="https://cdn.ourshopee.com/ourshopee-img/assets/vector_icons/Pay_Delivery.png" label="Cash/Pay On" subLabel="Delivery" />
                                    </div>

                                    <AppDownloadSection />

                                    {/* Color & Variant Selection - Visible for all categories if options exist */}
                                    {(product.colors?.length || 0) > 0 || (product.variants?.length || 0) > 0 ? (
                                        <div className="space-y-6 mb-8 border-b border-gray-100 pb-8">
                                            {product.colors && product.colors.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-sm font-bold text-gray-900 border-l-4 border-[#059669] pl-3 uppercase tracking-wider">
                                                            Choose Colour
                                                        </h3>
                                                        {selectedColor && (
                                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                                Selected: {selectedColor}
                                                            </span>
                                                        )}
                                                        {!selectedColor && <span className="text-[10px] text-rose-500 font-bold animate-pulse">* Selection Required</span>}
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        {product.colors.map(color => {
                                                            // Find the image for this color if it exists in imageColorIndex
                                                            const colorImageIndex = product.imageColorIndex
                                                                ? Object.keys(product.imageColorIndex).find(key => product.imageColorIndex![parseInt(key)] === color)
                                                                : null;
                                                            const imageIdx = colorImageIndex ? parseInt(colorImageIndex) : -1;
                                                            const colorThumbnail = (imageIdx >= 0 && product.media[imageIdx])
                                                                ? product.media[imageIdx]
                                                                : null;

                                                            return (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => handleColorSelect(color)}
                                                                    className={`group relative flex flex-col items-center gap-1.5 transition-all ${selectedColor === color ? 'scale-105' : 'hover:scale-105'
                                                                        }`}
                                                                >
                                                                    <div className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-white shadow-sm transition-all ${selectedColor === color
                                                                        ? 'border-blue-600 ring-2 ring-blue-100'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                        }`}>
                                                                        {colorThumbnail ? (
                                                                            <img src={getTransformedImageUrl(colorThumbnail, 100)} alt={color} className="w-full h-full object-contain p-1" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold bg-gray-50 uppercase">{color.substring(0, 2)}</div>
                                                                        )}
                                                                        {selectedColor === color && (
                                                                            <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center">
                                                                                <CheckCircleIcon className="w-6 h-6 text-blue-600 bg-white rounded-full" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-[10px] font-bold uppercase transition-colors ${selectedColor === color ? 'text-blue-600' : 'text-gray-500'
                                                                        }`}>
                                                                        {color}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {availableStorages.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-3 uppercase tracking-wider">
                                                        {isPhone ? 'Select Storage' : 'Select Option'}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {availableStorages.map(storage => {
                                                            const isSelected = storage === selectedStorage;
                                                            return (
                                                                <button
                                                                    key={storage}
                                                                    onClick={() => setSelectedStorage(storage)}
                                                                    className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${isSelected
                                                                        ? 'border-black bg-black text-white shadow-md'
                                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-black'
                                                                        }`}
                                                                >
                                                                    {storage}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* DESKTOP ACTIONS - Always visible on larger screens */}
                                            <div className="hidden md:block pt-4">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Quantity Selector */}
                                                        <div className="flex items-center border border-gray-300 rounded-xl h-12 bg-white px-1 shadow-sm">
                                                            <button
                                                                onClick={() => { setQuantity(Math.max(1, quantity - 1)); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
                                                                className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                <MinusIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="w-10 text-center font-bold text-gray-900 border-x border-gray-50 tabular-nums">{quantity}</span>
                                                            <button
                                                                onClick={() => { setQuantity(quantity + 1); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
                                                                className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                <PlusIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        {/* Add to Cart Button */}
                                                        <button
                                                            onClick={handleAddToCartAction}
                                                            className="bg-[#5236FF] text-white rounded-xl h-12 w-16 flex items-center justify-center shadow-md hover:bg-[#4329e6] active:scale-95 transition-all group"
                                                            title="Add to Cart"
                                                        >
                                                            <ShoppingCartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                        </button>

                                                        {/* Buy Now Button */}
                                                        <button
                                                            onClick={handleBuyNow}
                                                            disabled={isOutOfStock}
                                                            className={`flex-grow h-12 rounded-xl shadow-md font-black flex items-center justify-center gap-2 active:scale-95 transition-all ${isOutOfStock
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-[#FFD700] text-black hover:bg-[#ebc600]'
                                                                }`}
                                                        >
                                                            <BoltIcon className="w-5 h-5" />
                                                            {isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'}
                                                        </button>
                                                    </div>

                                                    {!selectedColor && product.colors && product.colors.length > 0 && (
                                                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                                                            Select a colour to enable purchase
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {darazConfig?.enabled && (
                                        <div className="mb-8">
                                            <a
                                                href={darazConfig.shopUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-white border border-[#f85606] rounded-xl shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={darazConfig.logoUrl}
                                                        alt="Daraz"
                                                        className="h-8 w-auto object-contain"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">Also Available on Daraz</p>
                                                        <p className="text-xs text-gray-500">Visit our official store for more options.</p>
                                                    </div>
                                                </div>
                                                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-[#f85606] group-hover:scale-110 transition-transform" />
                                            </a>
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Partners</h3>
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-6 justify-center md:justify-start">
                                            {paymentPartners.map(partner => (
                                                <img
                                                    key={partner.id}
                                                    src={partner.logoUrl}
                                                    alt={partner.name}
                                                    className="h-8 object-contain"
                                                    title={partner.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="lg:hidden">
                                        <DescriptionSection />
                                        <SpecsSection />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </VisualEditWrapper>
            </div>

            <div className="w-full md:px-6 lg:px-8 md:pb-8">
                <React.Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl mt-8" />}>
                    <ProductReviews productId={sku} />
                </React.Suspense>
            </div>

            {relatedProducts.length > 0 && (
                <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended Products</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {relatedProducts.map(item => (
                            <div key={item.sku} className="w-40 sm:w-48 flex-shrink-0">
                                <RelatedProductCard
                                    item={item}
                                    navigate={navigate}
                                    onAddToCart={addToCart}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 md:hidden">
                <div className="flex gap-3 items-center">
                    <div className="flex items-center border border-gray-300 rounded-lg h-12 px-2">
                        <button
                            onClick={() => { setQuantity(Math.max(1, quantity - 1)); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
                            className="p-2 text-gray-500"
                        >
                            <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="mx-2 font-bold text-gray-900 min-w-[1.5rem] text-center">{quantity}</span>
                        <button
                            onClick={() => { setQuantity(quantity + 1); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
                            className="p-2 text-gray-500"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCartAction}
                        className="bg-[#5236FF] text-white rounded-lg h-12 w-14 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                        <ShoppingCartIcon className="w-6 h-6" />
                        <span className="sr-only">Add to Cart</span>
                    </button>

                    <button
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className="flex-grow bg-[#FFD700] text-black font-bold h-12 rounded-lg shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <BoltIcon className="w-5 h-5" />
                        {isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'}
                    </button>
                </div>
            </div>

            <React.Suspense fallback={null}>
                <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} navigate={navigate} />
            </React.Suspense>
            {/* Fullscreen Gallery */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <FullscreenGallery
                        images={product.media.map(url => getTransformedImageUrl(url, 2400, 100))}
                        initialIndex={activeImageIndex}
                        onClose={() => setIsGalleryOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetailPage;
