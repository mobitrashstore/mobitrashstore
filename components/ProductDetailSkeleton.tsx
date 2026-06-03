import React from 'react';

const ProductDetailSkeleton: React.FC = () => {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div>
                    <div className="w-full aspect-square bg-gray-200 rounded-lg"></div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
                    <div className="mt-4 h-6 w-1/4 bg-gray-200 rounded-full"></div>
                    <div className="mt-4 h-10 w-1/2 bg-gray-200 rounded"></div>

                    <div className="mt-6 space-y-3">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="flex gap-4">
                            <div className="w-full h-14 bg-gray-200 rounded-lg"></div>
                            <div className="w-16 h-14 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="mt-4 h-5 w-1/2 mx-auto bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
