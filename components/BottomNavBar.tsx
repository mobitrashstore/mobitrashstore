import React from 'react';
import { motion } from 'framer-motion';
import { HomeIcon } from './icons/HomeIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { BoltIcon } from './icons/BoltIcon';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface BottomNavBarProps {
  navigate: (path: string) => void;
  currentPath: string;
}

const NAV_TABS = [
  { id: 0, label: 'Home', path: '/', icon: <HomeIcon /> },
  { id: 1, label: 'Catg.', path: '/categories', icon: <Squares2x2Icon /> },
  { id: 2, label: 'SELL', path: '/sell', icon: <BoltIcon /> },
  { id: 3, label: 'Cart', path: '/cart', icon: <ShoppingCartIcon /> },
  { id: 4, label: 'Profile', path: '/profile', icon: <UserCircleIcon /> },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ navigate, currentPath }) => {
  const { user } = useAuth();
  const { cart, openCart } = useCart();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getActiveIndex = () => {
    if (currentPath === '/') return 0;
    if (currentPath.startsWith('/categories')) return 1;
    if (currentPath.startsWith('/sell')) return 2;
    if (currentPath.startsWith('/cart')) return 3;
    if (currentPath.startsWith('/profile') || currentPath.startsWith('/login')) return 4;
    return 0;
  };

  const activeIndex = getActiveIndex();

  const handleTabTrigger = (idx: number) => {
    const tab = NAV_TABS[idx];
    if (tab) {
      if (tab.label === 'Cart') openCart();
      else navigate(tab.path === '/profile' && !user ? '/login' : tab.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] h-[70px]">
      <div className="grid grid-cols-5 items-center h-full relative px-2">
        {NAV_TABS.map((tab, idx) => (
          <div key={tab.label} className="flex items-center justify-center h-full">
            {tab.id === 2 ? (
              /* Elevated Sell Button with Charging Animation */
              <div className="relative -top-6 w-full flex flex-col items-center">
                <button
                  onClick={() => handleTabTrigger(idx)}
                  className="w-14 h-14 bg-[#059669] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(5,150,105,0.35)] border-4 border-white transition-transform active:scale-95"
                >
                  <div className="relative w-8 h-8">
                     <BoltIcon className="absolute inset-0 w-full h-full text-white/40" />
                     <motion.div 
                      className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none"
                      animate={{ height: ['0%', '100%', '0%'] }}
                      transition={{ 
                         repeat: Infinity, 
                         duration: 3, 
                         ease: "easeInOut" 
                      }}
                    >
                       <BoltIcon className="absolute bottom-0 inset-x-0 w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                     </motion.div>
                  </div>
                </button>
                <span className="mt-1 text-[11px] font-semibold text-[#059669] tracking-wide uppercase">
                  {tab.label}
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleTabTrigger(idx)}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  activeIndex === idx ? 'text-[#059669] font-semibold' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  {React.cloneElement(tab.icon as React.ReactElement, {
                    className: "w-6 h-6 mb-1"
                  })}
                  {tab.label === 'Cart' && cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[16px] min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium leading-tight">
                  {tab.label}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
