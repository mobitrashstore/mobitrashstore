
import React, { useRef, useEffect } from 'react';
import { InventoryItem } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import ProductCard from './ProductCard';

import { slugify } from '../services/api';

interface ProductCarouselProps {
    title: string;
    items: InventoryItem[];
    navigate: (path: string) => void;
    // Fix: Updated signature to match addToCart in useCart context to resolve type mismatch in HomePage
    onAddToCart: (item: InventoryItem, quantity?: number, selectedColor?: string) => void;
    onWishlistToggle: (item: InventoryItem) => void;
    isInWishlist: (sku: string) => boolean;
    // Fix: Added viewCounts to props to resolve 'IntrinsicAttributes' error in HomePage
    viewCounts?: Record<string, number>;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, items, navigate, onAddToCart, onWishlistToggle, isInWishlist, viewCounts }) => {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<number | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const startAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = window.setInterval(() => {
            if (scrollContainer.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
                if (scrollLeft + clientWidth >= scrollWidth - 1) {
                    scrollContainer.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainer.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
            }
        }, 3000);
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll(); // Cleanup on unmount
    }, [items]); // Rerun if items change

    return (
        <div
            className="w-full py-1 md:py-2"
            onMouseEnter={stopAutoScroll}
            onMouseLeave={startAutoScroll}
        >
            <h2 className="text-lg md:text-3xl font-bold text-center text-gray-900 mb-1 md:mb-4">{title}</h2>
            <div className="relative flex items-center">
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:block absolute -left-5 z-10 p-2 bg-white rounded-full shadow-md text-blue-500 hover:bg-gray-100 transition-colors"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div
                    ref={scrollContainer}
                    className="flex gap-4 overflow-x-auto px-2 py-1 md:py-2 pb-2 md:pb-4 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item, index) => (
                        <div key={item.sku || index} className="flex-shrink-0 w-44 sm:w-52">
                            <ProductCard
                                item={item}
                                navigate={navigate}
                                onAddToCart={onAddToCart}
                                onWishlistToggle={onWishlistToggle}
                                isWishlisted={isInWishlist(item.sku)}
                                // Fix: Pass specific item's view count from the Record passed by HomePage
                                viewCount={viewCounts ? viewCounts[`_buy_${slugify(item.title)}`] : undefined}
                            />
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:block absolute -right-5 z-10 p-2 bg-white rounded-full shadow-md text-blue-500 hover:bg-gray-100 transition-colors"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ProductCarousel;
