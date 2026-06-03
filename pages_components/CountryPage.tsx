

import React from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { GlobeAltIcon } from '../components/icons/GlobeAltIcon';

interface CountryPageProps {
    navigate: (path: string) => void;
}

const CountryPage: React.FC<CountryPageProps> = ({ navigate }) => {
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Select Country" Icon={GlobeAltIcon} hasSpacer={false} />
            <div className="text-center py-10 pt-20 md:pt-10 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-900 hidden md:block">Select Country</h1>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto mt-8">
                    <GlobeAltIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Currently, we only operate in Nepal.</p>
                </div>
            </div>
        </div>
    );
};

export default CountryPage;
