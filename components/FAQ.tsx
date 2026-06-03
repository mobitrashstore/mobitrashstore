import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

const faqs = [
    {
        question: "Why should I sell my phone to Mobi Store instead of Facebook Marketplace?",
        answer: "Selling on marketplaces is risky and time-consuming. You deal with strangers, haggle over prices, and risk scams. At Mobi Store (a venture of Mobi Store Tech), we offer a guaranteed instant price, free doorstep pickup, and 100% data security. It's safe, professional, and instant.",
    },
    {
        question: "Is my personal data safe? Do you wipe the phone?",
        answer: "Absolutely. Data security is our #1 priority. Once your device reaches our Kirtipur facility, we perform a military-grade data erasure using certified software that makes data recovery impossible. We recommend you factory reset your phone before handing it over, but we double-check every single device.",
    },
    {
        question: "How accurate is the online price quote?",
        answer: "Our AI-driven valuation engine uses live market data to give you the fairest price in Nepal. As long as you answer the condition questions honestly (e.g., about scratches or battery health), the price you see is the price you get. No hidden deductions.",
    },
    {
        question: "Do you buy dead, broken, or locked phones?",
        answer: "Yes! We buy dead phones for eco-friendly recycling and phones with broken screens for refurbishment. However, we strictly DO NOT buy lost or stolen phones. We check the IMEI of every device against police records. If a device is found to be stolen, we hand it over to the authorities.",
    },
    {
        question: "Can I exchange my old phone for a new one?",
        answer: "Yes, we specialize in exchanges! You can trade in your old device and pay only the difference for any new or certified pre-owned phone from our inventory. This is often the best way to get maximum value.",
    },
    {
        question: "Where is your physical store located?",
        answer: "We are located at Naya Bazar, Kirtipur, Kathmandu (Headquarters of Mobi Store Tech). You are welcome to visit us directly for buy/sell/repair services, or use our online platform for convenience.",
    },
    {
        question: "Who is behind Mobi Store?",
        answer: "Mobi Store was founded on November 25, 2025, by Mr. Mobi Store Team, the CEO of Mobi Store Tech. It was built to solve the problem of unsafe and unorganized second-hand mobile trading in Nepal.",
    },
    {
        question: "How fast will I get paid?",
        answer: "Instantly. Once our delivery partner picks up your device (or you drop it off) and we verify the condition (usually within 2-4 hours), we transfer the money directly to your bank account, eSewa, or Khalti immediately.",
    }
];

const FaqItem: React.FC<{ faq: { question: string, answer: string } }> = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="py-6 border-b border-gray-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none group"
            >
                <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-amber-600' : 'text-gray-900 group-hover:text-amber-600'}`}>
                    {faq.question}
                </h3>
                <span className={`ml-4 flex-shrink-0 p-1 rounded-full transition-colors ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    {isOpen ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-gray-600 leading-relaxed pr-4 border-l-4 border-amber-200 pl-4">{faq.answer}</p>
            </div>
        </div>
    );
};


const FAQ: React.FC = () => {
    return (
        <section id="faq" className="py-16 sm:py-24 bg-white rounded-2xl shadow-sm border border-gray-100 my-8">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Everything you need to know about selling your phone, data safety, and payments.</p>
                </div>
                <div className="w-full max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <FaqItem key={index} faq={faq} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
