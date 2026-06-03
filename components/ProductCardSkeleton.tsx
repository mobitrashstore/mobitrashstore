import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
            <div className="relative pt-[100%] bg-gray-200"></div>
            <div className="p-4">
                <div className="h-4 w-1/4 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded mt-4"></div>
                <div className="h-10 w-full bg-gray-200 rounded-md mt-4"></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
