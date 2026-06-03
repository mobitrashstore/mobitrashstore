
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { LeafIcon } from './icons/LeafIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

const WhyChooseUs: React.FC = () => {
    const features = [
        {
            icon: <CurrencyDollarIcon className="w-8 h-8 text-amber-500" />,
            title: "Best Prices, Guaranteed",
            description: "Our transparent pricing ensures you get the most value whether you're buying or selling.",
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8 text-amber-500" />,
            title: "1-Year Warranty",
            description: "Every certified pre-owned device we sell is backed by a comprehensive 1-year warranty.",
        },
        {
            icon: <LeafIcon className="w-8 h-8 text-amber-500" />,
            title: "Eco-Friendly",
            description: "By giving phones a second life, you're helping reduce e-waste and promote sustainability.",
        },
    ];

    return (
        <section className="bg-gray-50 text-gray-800 py-6 md:py-24 overscroll-none" style={{ overscrollBehavior: 'none' }}>
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900">Why Choose Mobi Store?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 text-center">
                    {features.map((feature, index) => (
                        <div key={index} className="p-2 md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 mx-auto bg-amber-100 rounded-full">
                                {feature.icon}
                            </div>
                            <h3 className="mt-3 md:mt-6 text-lg md:text-xl font-bold text-gray-900">{feature.title}</h3>
                            <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
