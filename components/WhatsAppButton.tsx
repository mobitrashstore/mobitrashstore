import React from 'react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

const WhatsAppButton: React.FC = () => {
    return (
        <a
            href="https://wa.me/9779827801575" // Replace with actual number
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 z-40"
            aria-label="Chat on WhatsApp"
        >
            <WhatsAppIcon className="w-8 h-8" />
        </a>
    );
};

export default WhatsAppButton;
