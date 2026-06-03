import React, { useState, useEffect } from 'react';
import SellFlowV2 from '../components/SellFlowV2';
import * as api from '../services/api';
import { Banner } from '../types';
import SEO from '../components/SEO';
import { useVisualEditing } from '../context/VisualEditingContext';
import VisualEditWrapper from '../components/VisualEditWrapper';
import EditableText from '../components/EditableText';

const SELL_PAGE_CONFIG_DEFAULT = {
  title: "Sell Phone Online",
  subtitle: "Get instant cash for your used device from Mobi Store Tech",
  seoSummary: "Mobi Store allows you to sell used iPhone online instantly for cash. We are the best place in Nepal to sell second hand phones near you. Powered by Mobi Store Tech."
};

interface SellPageHeroProps {
  onHasBanners: (has: boolean) => void;
}

// Unified image optimizer — supports ImageKit and Cloudinary URLs.
const getOptimizedImageUrl = (url: string | undefined, width: number, quality: number): string => {
  if (!url) return 'https://placehold.co/400x400?text=No+Image';
  if (url.startsWith('data:')) return url; // Don't optimize base64 images
  if (url.includes('ik.imagekit.io')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tr=w-${width},q-${quality}`;
  }
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
};

const SellPageHero: React.FC<SellPageHeroProps> = ({ onHasBanners }) => {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await api.getBanners();
        const sellBanners = banners.filter(b => b.section === 'sell_hero');
        if (sellBanners.length > 0) {
          setSlides(sellBanners.map(b => b.imageUrl));
          onHasBanners(true);
        } else {
          onHasBanners(false);
        }
      } catch (e) {
        console.error("Failed to fetch sell page banners", e);
        onHasBanners(false);
      }
    }
    fetchBanners();
  }, [onHasBanners]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-none md:rounded-2xl shadow-sm md:shadow-lg h-36 sm:h-56 md:h-80 bg-gray-200 flex-shrink-0 z-0">
      {slides.map((src, index) => (
        <img
          key={index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          src={getOptimizedImageUrl(src, 1920, 80)}
          alt={`Sell used phone online nepal ${index + 1}`}
          width="1920"
          height="320"
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-110 shadow-lg w-4' : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const SellPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [hasBanners, setHasBanners] = useState(false);
  const [config, setConfig] = useState(SELL_PAGE_CONFIG_DEFAULT);

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await api.getGenericConfig('settings', 'sellpage', SELL_PAGE_CONFIG_DEFAULT);
      setConfig(data);
    };
    fetchConfig();
  }, []);

  const updateConfig = async (newData: any) => {
    const updated = { ...config, ...newData };
    await api.updateGenericConfig('settings', 'sellpage', updated);
    setConfig(updated);
  };

  return (
    // The fixed layout has been removed to allow normal document flow.
    // This resolves issues with the mobile keyboard resizing the viewport.
    <div className="bg-transparent md:pt-0">
      <SEO
        title="Sell Used Phone Online in Nepal | Instant Cash"
        description="Sell your old iPhone, Samsung or Android device instantly. Get the best price, free doorstep pickup in Kathmandu, and instant payment."
        keywords="sell old mobile nepal, exchange phone kathmandu, sell iphone nepal, second hand mobile price, mobi trash store"
        canonicalUrl="https://mobitrashstore.com/sell"
      />

      <h1 className="sr-only">Sell Used Phone Online Instantly in Nepal - Mobi Store by Mobi Store Tech</h1>

      {/* Main content wrapper */}
      <div className="md:px-6 lg:px-8 md:py-6">

        <SellPageHero onHasBanners={setHasBanners} />

        {/* Form and other content */}
        <div className="px-4 sm:px-0 pt-4 md:pt-8">
          <div className="mb-4 text-center md:hidden">
            <h2 className="text-xl font-bold text-gray-900">
              <EditableText
                value={config.title}
                onSave={(val) => updateConfig({ title: val })}
              />
            </h2>
            <p className="text-xs text-gray-600">
              <EditableText
                value={config.subtitle}
                onSave={(val) => updateConfig({ subtitle: val })}
              />
            </p>
          </div>
          <SellFlowV2 navigate={navigate} />

          {/* SEO Content for Crawlers (Visible but low priority visually) */}
          <div className="mt-8 text-xs text-gray-400 text-center px-4 pb-4">
            <p>
              <EditableText
                value={config.seoSummary}
                onSave={(val) => updateConfig({ seoSummary: val })}
                multiline
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;
