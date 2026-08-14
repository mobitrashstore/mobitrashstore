import React from 'react';

interface InstantQuoteWidgetProps {
    navigate: (path: string) => void;
}

const InstantQuoteWidget: React.FC<InstantQuoteWidgetProps> = ({ navigate }) => {
    return (
        <section className="bg-transparent py-16 sm:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get an Instant Quote for Your Phone</h2>
                <p className="mt-4 mx-auto text-lg text-gray-600">
                    Find out how much your phone is worth in less than a minute. Free shipping and fast payment.
                </p>
                <div className="mt-10">
                    <button
                        onClick={() => navigate('/sell')}
                        className="bg-[#059669] text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-[#047857] transition-all shadow-md active:scale-95"
                    >
                        Start Your Quote
                    </button>
                </div>
            </div>
        </section>
    );
};

export default InstantQuoteWidget;
