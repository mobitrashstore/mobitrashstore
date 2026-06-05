
import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { XMarkIcon } from './icons/XMarkIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { SyncIcon } from './icons/SyncIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import SearchModal from './SearchModal';
import NotificationBell from './NotificationBell';
import VisualEditorHeaderToggle from './VisualEditorHeaderToggle';
import { useVisualEditing } from '../context/VisualEditingContext';
import * as api from '../services/api';
import { Category } from '../types';
import { permissionService } from '../services/permissionService';
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

  const [dateTime, setDateTime] = useState(new Date());
  const [temp, setTemp] = useState<string>('--°C');
  const [locationName, setLocationName] = useState<string>('Detecting...');
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async (lat: number, lon: number, city: string) => {
    setIsWeatherLoading(true);
    try {
      // Use Open-Meteo for real, high-accuracy data
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const weatherData = await weatherRes.json();
      const currentTemp = Math.round(weatherData.current_weather.temperature);
      setTemp(`${currentTemp}°C`);
      setLocationName(city);
    } catch (e) {
      console.error("Weather fetch failed", e);
      setTemp('--°C');
      setLocationName('Unknown Location');
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const fetchInitialLocationAndWeather = async () => {
    let lat: number | null = null;
    let lon: number | null = null;
    let city: string | null = null;

    try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
            lat = ipData.latitude;
            lon = ipData.longitude;
            city = ipData.city || ipData.region || ipData.country_name;
        }
    } catch (e) {
        console.log("IP Location failed");
    }

    if (lat && lon && city) {
        fetchWeather(lat, lon, city);
    } else {
        // Ultimate fallback if even IP detection fails - still no hardcoding
        setLocationName('Global');
        setTemp('--°C');
    }
  };

  const updateLocationAndWeather = async () => {
    setIsWeatherLoading(true);
    permissionService.markLocationRequested(); // Allow manual trigger
    let lat: number | null = null;
    let lon: number | null = null;
    let city: string | null = null;

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`);
        const geoData = await geoRes.json();
        city = geoData.address.city || geoData.address.town || geoData.address.municipality || 'My Location';
      } catch (geoError) {
        console.log("Geolocation/Geocoding failed", geoError);
      }
    }
    if (lat && lon && city) {
        fetchWeather(lat, lon, city);
    } else {
        setLocationName('Global');
        setTemp('--°C');
        setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialLocationAndWeather();
    const weatherTimer = setInterval(fetchInitialLocationAndWeather, 1800000); // 30 mins
    return () => clearInterval(weatherTimer);
  }, []);

  return (
    <>
      <header className={`bg-white fixed top-0 left-0 right-0 z-40 border-b border-gray-100 shadow-sm hidden md:block pt-[env(safe-area-inset-top)] transition-all duration-300`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Left: Branding & Real-time Widgets */}
            <div className="flex items-center gap-6">
              <a href="/" onClick={(e) => handleNav(e, '/')} className="flex items-center" title="Go to Homepage" aria-label="Mobi Store Home">
                <img src="/header-logo.png" alt="Mobi Store logo" width="160" height="48" className="h-8 md:h-12 w-auto object-contain" />
              </a>

              {/* REAL-TIME WIDGETS - COMPACT CAPSULES */}
              <div className="hidden xl:flex items-center gap-3 pl-6 border-l border-gray-200">
                {/* Date & Time Capsule */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-[11px] font-black text-slate-700">
                  <span className="text-indigo-600">📅</span>
                  <span>{mounted ? dateTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span>
                  <span className="text-slate-300">|</span>
                  <span className="tabular-nums">{mounted ? dateTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}</span>
                </div>

                {/* Location & Weather Capsule */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-[11px] font-black text-slate-700">
                  <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-slate-500 truncate max-w-[80px]">{locationName}</span>
                  <span className="text-slate-800">{temp}</span>
                  <button
                    onClick={updateLocationAndWeather}
                    disabled={isWeatherLoading}
                    className="ml-1 p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                    title="Update Weather"
                  >
                    <SyncIcon className={`w-3 h-3 ${isWeatherLoading ? 'animate-spin text-indigo-600' : 'opacity-80'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle: Clean Navigation */}
            <nav className="hidden md:flex items-center gap-6 h-full">
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => handleCategoryHover(true)}
                onMouseLeave={() => handleCategoryHover(false)}
              >
                <a
                  href="/categories"
                  onClick={(e) => handleNav(e, '/categories')}
                  className={`flex items-center gap-1.5 font-bold text-sm tracking-wide transition-colors py-2 ${isHoveringCategories ? 'text-[#ff5722]' : 'text-slate-600 hover:text-[#ff5722]'}`}
                  title="Explore Product Categories"
                >
                  <Squares2x2Icon className="w-5 h-5 opacity-50" /> Categories
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
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-[#ff5722] transition-colors">
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-[#ff5722] line-clamp-1">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a href="/product" onClick={(e) => handleNav(e, '/product')} className="font-bold text-sm text-slate-600 hover:text-[#ff5722] transition-all uppercase tracking-wide" title="Shop All Devices">Buy</a>
              <a href="/sell" onClick={(e) => handleNav(e, '/sell')} className="font-bold text-sm text-slate-600 hover:text-[#ff5722] transition-all uppercase tracking-wide" title="Sell Your Used Device">Sell</a>
              <a href="/repair" onClick={(e) => handleNav(e, '/repair')} className="font-bold text-sm text-slate-600 hover:text-[#ff5722] transition-all uppercase tracking-wide" title="Expert Repair Services">Repair</a>
              <a href="/compare" onClick={(e) => handleNav(e, '/compare')} className="font-bold text-sm text-slate-600 hover:text-[#ff5722] transition-all uppercase tracking-wide" title="Compare Device Specifications">Compare</a>
              <a href="/blog" onClick={(e) => handleNav(e, '/blog')} className="font-bold text-sm text-slate-600 hover:text-[#ff5722] transition-all uppercase tracking-wide" title="Read Latest Tech News">Blog</a>
              {user?.role === 'admin' && (
                <a href="/admin/dashboard" onClick={(e) => handleNav(e, '/admin/dashboard')} className="font-bold text-sm text-amber-600 hover:text-amber-500 uppercase tracking-wide" title="Open Admin Control Panel">Admin</a>
              )}
            </nav>

            <div className="flex items-center gap-1 sm:gap-4">
              <div className="hidden md:block">
                <VisualEditorHeaderToggle />
              </div>

              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-500 hover:text-[#ff5722] transition-colors" title="Search Products" aria-label="Search Products">
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
              <NotificationBell navigate={navigate} iconClassName="w-6 h-6 text-slate-500 hover:text-[#ff5722]" />

              {/* Dark/Light Mode Toggle */}
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
              <button onClick={openCart} className="relative p-2 text-slate-500 hover:text-[#ff5722] transition-colors" title={`View Shopping Cart (${cartItemCount} items)`} aria-label={`View Shopping Cart - ${cartItemCount} items`}>
                <ShoppingCartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-[#ff5722] text-white text-[10px] font-black flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <div className="hidden md:flex items-center border-l border-gray-200 pl-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <a href="/profile" onClick={(e) => handleNav(e, '/profile')} className="text-slate-500 hover:text-[#ff5722]" title="My Profile Settings" aria-label="My Profile Settings">
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
                    <a href="/login" onClick={(e) => handleNav(e, '/login')} className="text-xs font-black text-slate-600 hover:text-slate-900 uppercase tracking-widest" title="Log into Your Account">Login</a>
                    <a href="/signup" onClick={(e) => handleNav(e, '/signup')} className="text-xs font-black bg-[#ff5722] text-black px-4 py-2 rounded-lg hover:bg-[#e64a19] transition-all uppercase tracking-widest" title="Create New Account">Join</a>
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
