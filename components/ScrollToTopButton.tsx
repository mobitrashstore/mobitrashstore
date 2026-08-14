import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const isAdmin = router?.pathname?.startsWith('/admin') || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  useEffect(() => {
    const toggleVisibility = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > 250) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (isAdmin || !isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className="fixed bottom-24 md:bottom-8 right-5 md:right-7 z-40 p-1 bg-transparent border-0 outline-none cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 transition-all duration-200 hover:-translate-y-1 hover:scale-110 active:scale-90 focus:outline-none drop-shadow-md group animate-fade-in"
    >
      {/* Standalone Pure Vector Mouse Icon (No Box / No Card) */}
      <svg
        className="w-7 h-10 md:w-8 md:h-11 transition-all duration-200"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mouse Outer Pill Silhouette */}
        <rect
          x="2.5"
          y="2.5"
          width="19"
          height="31"
          rx="9.5"
          stroke="currentColor"
          strokeWidth="2.8"
        />
        {/* Mouse Center Scroll Wheel */}
        <line
          x1="12"
          y1="8"
          x2="12"
          y2="14"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="transition-transform duration-200 group-hover:-translate-y-1"
        />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
