
import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import SearchModal from './SearchModal';
import NotificationBell from './NotificationBell';
import VisualEditorHeaderToggle from './VisualEditorHeaderToggle';
import { useVisualEditing } from '../context/VisualEditingContext';
import * as api from '../services/api';
import { Category } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  navigate: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ navigate }) => {
  const { cart, openCart } = useCart();
  const { user, logout } = useAuth();
  const { isEditing } = useVisualEditing();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Category Dropdown State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isHoveringCategories, setIsHoveringCategories] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Header category fetch failed", e);
      }
    };
    fetchCategories();
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCategoryHover = (hovering: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hovering) {
      setIsHoveringCategories(true);
    } else {
      // Small delay to prevent flickering when moving mouse to the dropdown
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsHoveringCategories(false);
      }, 150);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className={`bg-white fixed top-0 left-0 right-0 z-40 border-b border-gray-100 shadow-sm hidden md:block pt-[env(safe-area-inset-top)] transition-all duration-300`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Left: Branding Logo */}
            <div className="flex items-center">
              <a href="/" onClick={(e) => handleNav(e, '/')} className="flex items-center group py-1" title="Go to Homepage" aria-label="Mobi Store Home">
                <img src="/header-logo.png" alt="Mobi Store logo" width="200" height="56" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              </a>
            </div>

            {/* Middle: Clean Navigation */}
            <nav className="hidden md:flex items-center gap-7 h-full">
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => handleCategoryHover(true)}
                onMouseLeave={() => handleCategoryHover(false)}
              >
                <a
                  href="/categories"
                  onClick={(e) => handleNav(e, '/categories')}
                  className={`flex items-center gap-1.5 font-semibold text-sm tracking-wide transition-colors py-2 ${isHoveringCategories ? 'text-[#059669]' : 'text-slate-700 hover:text-[#059669]'}`}
                  title="Explore Product Categories"
                >
                  <Squares2x2Icon className="w-4 h-4 opacity-60" /> Categories
                  <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isHoveringCategories ? 'rotate-180' : ''}`} />
                </a>

                {/* Simplified Categories Dropdown */}
                {isHoveringCategories && (
                  <div className="absolute top-full left-0 mt-0 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down z-50 p-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Top Categories</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.slice(0, 9).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            navigate(`/product?category=${encodeURIComponent(cat.name)}`);
                            setIsHoveringCategories(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                          title={`View ${cat.name}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-[#059669] transition-colors">
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-[#059669] line-clamp-1">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a href="/buy" onClick={(e) => handleNav(e, '/buy')} className="font-semibold text-sm text-slate-700 hover:text-[#059669] transition-all tracking-wide" title="Shop All Devices">BUY</a>
              <a href="/sell" onClick={(e) => handleNav(e, '/sell')} className="font-semibold text-sm text-slate-700 hover:text-[#059669] transition-all tracking-wide" title="Sell Your Used Device">SELL</a>
              <a href="/repair" onClick={(e) => handleNav(e, '/repair')} className="font-semibold text-sm text-slate-700 hover:text-[#059669] transition-all tracking-wide" title="Expert Repair Services">REPAIR</a>
              <a href="/compare" onClick={(e) => handleNav(e, '/compare')} className="font-semibold text-sm text-slate-700 hover:text-[#059669] transition-all tracking-wide" title="Compare Device Specifications">COMPARE</a>
              <a href="/blog" onClick={(e) => handleNav(e, '/blog')} className="font-semibold text-sm text-slate-700 hover:text-[#059669] transition-all tracking-wide" title="Read Latest Tech News">BLOG</a>
              {user?.role === 'admin' && (
                <a href="/admin/dashboard" target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-emerald-700 hover:text-emerald-600 uppercase tracking-wide flex items-center gap-1" title="Open Admin Control Panel">ADMIN ↗</a>
              )}
            </nav>

            <div className="flex items-center gap-1 sm:gap-4">
              <div className="hidden md:block">
                <VisualEditorHeaderToggle />
              </div>

              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-500 hover:text-[#059669] transition-colors" title="Search Products" aria-label="Search Products">
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
              <NotificationBell navigate={navigate} iconClassName="w-6 h-6 text-slate-500 hover:text-[#059669]" />

              {/* Dark/Light Mode Toggle */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className={`theme-toggle-btn ${theme}`}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="theme-toggle-knob">
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </span>
                </button>
              )}
              <button onClick={openCart} className="relative p-2 text-slate-500 hover:text-[#059669] transition-colors" title={`View Shopping Cart (${cartItemCount} items)`} aria-label={`View Shopping Cart - ${cartItemCount} items`}>
                <ShoppingCartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-[#059669] text-white text-[10px] font-bold flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <div className="hidden md:flex items-center border-l border-gray-200 pl-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <a href="/profile" onClick={(e) => handleNav(e, '/profile')} className="text-slate-500 hover:text-[#059669]" title="My Profile Settings" aria-label="My Profile Settings">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" width="32" height="32" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200" />
                      ) : (
                        <UserCircleIcon className="w-8 h-8" />
                      )}
                    </a>
                    <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors" title="Sign Out of Account" aria-label="Sign Out of Account">
                      <ArrowRightOnRectangleIcon className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a href="/login" onClick={(e) => handleNav(e, '/login')} className="text-xs font-semibold text-slate-600 hover:text-slate-900 uppercase tracking-widest" title="Log into Your Account">Login</a>
                    <a href="/signup" onClick={(e) => handleNav(e, '/signup')} className="text-xs font-semibold bg-[#059669] text-white px-4 py-2 rounded-lg hover:bg-[#047857] transition-all uppercase tracking-widest" title="Create New Account">Join</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} navigate={navigate} />
    </>
  );
};

export default Header;
