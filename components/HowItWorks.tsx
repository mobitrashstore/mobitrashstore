import React from 'react';
import { CashIcon } from './icons/CashIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: <CashIcon className="w-10 h-10 text-[#ff5722]" />,
            title: "Get an Instant Quote",
            description: "Select your device and tell us its condition. Our smart algorithm gives you a fair, real-time price in under a minute.",
        },
        {
            icon: <TruckIcon className="w-10 h-10 text-[#ff5722]" />,
            title: "Free & Insured Pickup",
            description: "Happy with your quote? We'll arrange a free, convenient, and insured pickup from your doorstep, anywhere in Nepal.",
        },
        {
            icon: <ShieldCheckIcon className="w-10 h-10 text-[#ff5722]" />,
            title: "Fast Inspection & Payment",
            description: "Once we receive your device, our experts verify its condition. We then process your payment fast via your chosen method.",
        },
    ];

    return (
        <section className="py-16 sm:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How It Works</h2>
                    <p className="mt-4 mx-auto text-lg text-gray-600">
                        Selling your old phone is as easy as 1, 2, 3.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white border border-gray-200 p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-[#ff5722]/10 rounded-full">
                                {step.icon}
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-gray-900">{step.title}</h3>
                            <p className="mt-2 text-gray-600">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
