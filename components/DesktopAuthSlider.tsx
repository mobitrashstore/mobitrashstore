import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Banner } from '../types';

const DEFAULT_HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80',
    title: 'Recycle Smarter',
    subtitle: "Turn your old devices into cash instantly with Nepal's most trusted e-waste buyback program.",
  },
  {
    bg: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80',
    title: 'Earn Rewards',
    subtitle: 'Get points on every trade-in, purchase & referral. Redeem them for exclusive discounts and prizes.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80',
    title: 'Verified Store',
    subtitle: 'Rated 5 stars by thousands of customers. Secure payments, quick service & genuine products only.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=900&q=80',
    title: 'Fast & Secure',
    subtitle: 'Your data is 100% wiped securely before any transaction. Privacy is our top priority.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80',
    title: 'Any Condition',
    subtitle: 'Dead, broken, or perfectly working. We accept mobile phones in all conditions.',
  }
];

const DesktopAuthSlider: React.FC = () => {
  const [slides, setSlides] = useState<any[]>(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchSlides = async () => {
      try {
        const allBanners = await api.getBanners();
        const authBanners = allBanners.filter(b => b.section === 'auth_desktop');
        if (mounted && authBanners.length > 0) {
          // Map CMS banners to slide format
          setSlides(authBanners.map(b => ({
            bg: b.imageUrl,
            title: b.title || '',
            subtitle: b.subtitle || ''
          })));
        }
      } catch (e) {
        console.error("Failed to fetch auth desktop banners", e);
      }
    };
    fetchSlides();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="hidden md:flex flex-col w-1/2 h-full bg-black relative overflow-hidden">
      {/* Background Images Crossfade */}
      {slides.map((slide, i) => (
        <div 
          key={i} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={slide.bg} alt={`Slide ${i}`} className="w-full h-full object-cover opacity-60" />
        </div>
      ))}

      {/* Persistent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-20"></div>

      {/* Logo Overlay */}
      <div className="absolute top-8 left-8 z-30">
        <img src="/header-logo.png" alt="Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Content Area */}
      <div className="relative z-30 flex flex-col justify-end h-full p-12 text-white pb-20">
        {/* Animated Text Container */}
        <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-bold mb-4 leading-tight">{currentSlide.title}</h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">{currentSlide.subtitle}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-10">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopAuthSlider;
