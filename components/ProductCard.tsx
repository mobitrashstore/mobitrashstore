import React from 'react';
import { InventoryItem } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { EyeIcon } from './icons/EyeIcon';
import { BoltIcon } from './icons/BoltIcon';
import * as api from '../services/api';

interface ProductCardProps {
    item: InventoryItem;
    navigate: (path: string) => void;
    onAddToCart: (item: InventoryItem) => void;
    onWishlistToggle: (item: InventoryItem) => void;
    isWishlisted: boolean;
    viewCount?: number;
    layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ item, navigate, onAddToCart, onWishlistToggle, isWishlisted, viewCount, layout = 'grid' }) => {

    const productPath = api.getProductPermalink(item);

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking action buttons
        if ((e.target as HTMLElement).closest('button')) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        navigate(productPath);
    };

    const handleAddToCartAction = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        // If product has variants (colors), go to detail page to select
        if (item.colors && item.colors.length > 0) {
            navigate(productPath);
        } else {
            onAddToCart(item);
        }
    };

    const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onWishlistToggle(item);
    };

    const isOutOfStock = item.stock === 0;
    const discount = item.oldPrice ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;
    const soldCount = item.soldCount || 0;

    // Ensure we show at least 1 view if the component is mounted (the current user)
    // Plus, check if the item itself has a 'views' field for manual/fake popular counts
    const views = Math.max(1, viewCount || 0, (item as any).views || 0);

    let imageUrl = item.media?.[0];
    if (imageUrl && imageUrl.includes('ik.imagekit.io')) {
        const separator = imageUrl.includes('?') ? '&' : '?';
        imageUrl = `${imageUrl}${separator}tr=w-400,q-75`; // Optimised sizing for cards
    } else if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
        imageUrl = imageUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_400,c_limit/');
    } else if (!imageUrl) {
        imageUrl = 'https://placehold.co/400x400?text=No+Image';
    }

    // Flash Sale Timer Logic
    const [timeLeft, setTimeLeft] = React.useState<{ d: number, h: number, m: number, s: number } | null>(null);

    React.useEffect(() => {
        if (!item.flashSaleEndTime) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const difference = +new Date(item.flashSaleEndTime!) - +new Date();
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

        // Initial set
        const initial = calculateTimeLeft();
        setTimeLeft(initial);
        if (!initial) return;

        const timer = setInterval(() => {
            const tl = calculateTimeLeft();
            setTimeLeft(tl);
            if (!tl) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [item.flashSaleEndTime]);

    if (layout === 'list') {
        return (
            <a
                href={productPath}
                className="flex w-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group p-4 gap-4 items-center"
                onClick={handleCardClick}
                title={`View details for ${item.title}`}
            >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100">
                    <img
                        src={imageUrl}
                        alt={item.title}
                        width="128"
                        height="128"
                        className="w-full h-full object-contain mix-blend-multiply"
                        loading="lazy"
                        decoding="async"
                    />
                    {discount > 0 && (
                        <span className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-lg">
                            {discount}% OFF
                        </span>
                    )}

                    {/* Flash Sale Badge List View */}
                    {timeLeft && (
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold py-0.5 px-2 flex items-center justify-center gap-1">
                            <BoltIcon className="w-2.5 h-2.5 animate-pulse" />
                            <span>{timeLeft.d > 0 ? `${timeLeft.d}d ` : ''}{timeLeft.h}h {timeLeft.m}m</span>
                        </div>
                    )}
                </div>

                <div className="flex-grow min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.category}</span>
                        {soldCount > 0 && <span>• {soldCount} Sold</span>}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mt-2">
                        <div>
                            <p className="font-extrabold text-base sm:text-lg text-gray-900">NPR {item.price?.toLocaleString() || '0'}</p>
                            {item.oldPrice && <span className="text-xs text-gray-400 line-through">NPR {item.oldPrice.toLocaleString()}</span>}
                        </div>

                        {/* View Count Badge List Mode */}
                        <div className="flex items-center gap-1.5 bg-black/5 px-2 py-1 rounded-full w-fit">
                            <EyeIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-[10px] font-bold text-gray-600 tabular-nums">{views}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button onClick={handleWishlistClick} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-gray-200" title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                        <HeartIcon className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'}`} />
                    </button>
                    <button
                        onClick={handleAddToCartAction}
                        disabled={isOutOfStock}
                        className={`p-2 rounded-full transition-colors border ${isOutOfStock ? 'bg-gray-100 text-gray-300 border-gray-200' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
                        title={isOutOfStock ? "Out of Stock" : "Add to Shopping Cart"}
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                    </button>
                </div>
            </a>
        );
    }

    return (
        <a
            href={productPath}
            className="flex flex-col w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer group transform hover:-translate-y-1"
            onClick={handleCardClick}
            title={`View details for ${item.title}`}
        >
            {/* Discount Badge */}
            {discount > 0 && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-2 py-1 text-[10px] font-black text-white bg-orange-600 rounded-md shadow-sm tracking-wide uppercase">
                        -{discount}%
                    </span>
                </div>
            )}



            {/* Heart Button */}
            <button onClick={handleWishlistClick} className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-rose-500 shadow-sm border border-gray-100 transition-all hover:scale-110 active:scale-95" title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                <HeartIcon className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'}`} />
            </button>

            {/* Image Area */}
            <div className="w-full aspect-square flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={item.title}
                    width="400"
                    height="400"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                    loading="lazy"
                    decoding="async"
                />
                {/* Flash Sale Timer Badge Grid View */}
                {timeLeft && (
                    <div className="absolute bottom-14 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black text-white bg-amber-500 rounded-md shadow-sm tracking-wide uppercase border border-amber-400 animate-pulse-slow">
                            <BoltIcon className="w-3 h-3" />
                            {timeLeft.d > 0 ? `${timeLeft.d}d ` : ''}
                            {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
                        </span>
                    </div>
                )}

                {/* View Count Badge */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg border border-white/10">
                    <EyeIcon className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-bold text-white tabular-nums">{views}</span>
                </div>

                {/* Quick Add Button */}
                <button
                    onClick={handleAddToCartAction}
                    disabled={isOutOfStock}
                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 active:scale-90
                    ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                >
                    <ShoppingCartIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Info Area */}
            <div className="p-3.5 flex flex-col flex-grow bg-white relative">
                <div className="mb-1">
                    {soldCount > 5 && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide">Best Seller</span>
                    )}
                </div>

                <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-amber-600 transition-colors min-h-[2.5em]">
                    {item.title}
                </h4>

                <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                        <p className="font-black text-base text-gray-900">NPR {item.price?.toLocaleString() || '0'}</p>
                        {item.oldPrice && <span className="text-[10px] text-gray-400 line-through font-medium">NPR {item.oldPrice.toLocaleString()}</span>}
                    </div>
                    {isOutOfStock && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Out of Stock</span>
                    )}
                </div>
            </div>
        </a>
    );
};

export default ProductCard;
