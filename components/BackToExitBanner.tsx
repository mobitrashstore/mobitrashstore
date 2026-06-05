import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import logo from '../assets/logo.png';

interface BackToExitBannerProps {
  show: boolean;
}

const BackToExitBanner: React.FC<BackToExitBannerProps> = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-orange-100 flex items-center gap-3 ring-1 ring-black/5"
        >
          {/* Official Logo Container */}
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-50 to-white p-1.5 ring-1 ring-orange-100/50 shadow-sm">
            <img 
              src={logo} 
              alt="Mobi Store" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback icon if logo fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-orange-500 rounded-lg"></div>';
                }
              }}
            />
          </div>
          
          <div className="flex flex-col">
            <p className="text-gray-900 text-[13px] font-bold leading-tight">
              Exit Mobi Store?
            </p>
            <p className="text-gray-500 text-[11px] font-medium leading-tight">
              Please click Back again to exit
            </p>
          </div>
          
          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-2xl pointer-events-none"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToExitBanner;
