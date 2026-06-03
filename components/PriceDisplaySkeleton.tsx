import React from 'react';

const PriceDisplaySkeleton: React.FC = () => {
    return (
        <div className="animate-pulse flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Left side: Price and Actions */}
            <div className="w-full max-w-md p-6 border border-gray-200 rounded-lg shadow-lg flex-grow">
                <div className="h-8 w-3/4 bg-gray-300 rounded mb-4"></div>
                <div className="my-4 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                    <div className="h-10 w-4/5 bg-gray-300 rounded"></div>
                </div>
                
                <div className="space-y-3 mt-6">
                    <div className="w-full h-12 bg-gray-300 rounded-lg"></div>
                    <div className="w-full h-12 bg-gray-300 rounded-lg"></div>
                     <div className="w-full h-12 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
            
            {/* Right side: Images */}
            <div className="flex flex-col items-center">
                 <div className="w-32 h-48 bg-gray-300 rounded-md mb-6"></div>
                 <div className="w-48 h-32 bg-gray-300 rounded-md"></div>
            </div>
        </div>
    );
};

export default PriceDisplaySkeleton;
