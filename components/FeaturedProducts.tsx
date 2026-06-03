

import React from 'react';
import { InventoryItem } from '../types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  items: InventoryItem[];
  loading: boolean;
  navigate: (path: string) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md animate-pulse">
        <div className="relative pt-[100%] bg-gray-200"></div>
        <div className="p-4">
            <div className="h-4 w-1/4 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        </div>
    </div>
);


const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ items, loading, navigate }) => {
  const featuredItems = items.slice(0, 4);

  return (
    <section className="py-8 sm:py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            featuredItems.map(item => (
              <ProductCard 
                key={item.sku} 
                item={item} 
                navigate={navigate}
                onAddToCart={() => {}} 
                onWishlistToggle={() => {}} 
                isWishlisted={false} 
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
