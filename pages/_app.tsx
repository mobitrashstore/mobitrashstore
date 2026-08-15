import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider, useCart } from '../context/CartContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { WishlistProvider } from '../context/WishlistContext';
import { NotificationProvider } from '../context/NotificationContext';
import { GlobalNotificationProvider } from '../context/GlobalNotificationContext';
import { VisualEditingProvider, useVisualEditing } from '../context/VisualEditingContext';
import { ToastContainer } from '../components/ToastNotification';
import Header from '../components/Header';
import AdminLayout from '../components/AdminLayout';
import Footer from '../components/Footer';
import { Analytics } from '@vercel/analytics/react';
import BottomNavBar from '../components/BottomNavBar';
import CartModal from '../components/CartModal';
import OfflineBanner from '../components/OfflineBanner';
import Spinner from '../components/Spinner';
import PullToRefresh from '../components/PullToRefresh';
import AuthOverlay from '../components/AuthOverlay';
import VisualEditorSidebar from '../components/VisualEditorSidebar';
import NoticeBanner from '../components/NoticeBanner';
import BackToExitBanner from '../components/BackToExitBanner';
import { AdMob } from '@capacitor-community/admob';
import AdBanner from '../components/AdBanner';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import * as api from '../services/api';
import emailjs from '@emailjs/browser';
import { newsService } from '../services/newsService';
import ScrollToTopButton from '../components/ScrollToTopButton';
import '../index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean }> {
  public state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) {
    try { api.logSystemIssue('error', error.toString(), errorInfo.componentStack); } catch (e) {}
    console.error("Uncaught Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Something went wrong.</h1>
          <p className="text-slate-600 mb-4">We've logged this issue and will fix it shortly.</p>
          <button onClick={() => window.location.reload()} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainAppContent = ({ Component, pageProps }: { Component: any; pageProps: any }) => {
  const router = useRouter();
  const { user, isAuthenticating } = useAuth();
  const { isCartOpen, closeCart } = useCart();
  const { isEditing, fullWidth } = useVisualEditing();
  const { theme } = useTheme();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showExitBanner, setShowExitBanner] = useState(false);
  const backPressCount = React.useRef(0);
  const exitTimerRef = React.useRef<any>(null);

  // Helper navigate that matches Vite app's navigate signature
  const navigate = (path: string) => {
    if (path === router.asPath) return;
    router.push(path);
    closeCart();
  };

  useEffect(() => {
    newsService.prefetch();
    const initNativeFeatures = async () => {
      try { await AdMob.initialize(); } catch (err) { console.warn('AdMob Init Error:', err); }
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: '#059669' });
        } catch (statusError) { console.error('StatusBar Sync Error:', statusError); }
      }

      const handleAppPermissions = async () => {
        // 1. Proactively request Notification permission (Native + OneSignal + Web)
        try {
          if (typeof window !== 'undefined' && (window as any).OneSignalDeferred) {
            (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
              try {
                if (OneSignal.Notifications?.requestPermission) {
                  await OneSignal.Notifications.requestPermission();
                }
                if (OneSignal.User?.PushSubscription?.optIn) {
                  await OneSignal.User.PushSubscription.optIn();
                }
              } catch (e) {}
            });
          }
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        } catch (e) {
          console.warn("Auto notification permission request error:", e);
        }

        // 2. Proactively request Location permission
        try {
          if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(() => { }, () => { }, { timeout: 4000, enableHighAccuracy: false });
          }
        } catch (e) {
          console.warn("Location permission trigger error:", e);
        }
      };

      setTimeout(() => { handleAppPermissions(); }, 1500);
    };

    initNativeFeatures();

    if (Capacitor.isNativePlatform()) {
      const handleBackButton = async (data: { canGoBack: boolean }) => {
        if (data.canGoBack && router.asPath !== '/') {
          window.history.back();
        } else {
          backPressCount.current += 1;
          if (backPressCount.current >= 2) {
            CapacitorApp.exitApp();
          } else {
            setShowExitBanner(true);
            if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
            exitTimerRef.current = setTimeout(() => {
              setShowExitBanner(false);
              backPressCount.current = 0;
            }, 3000);
          }
        }
      };

      const backListener = CapacitorApp.addListener('backButton', handleBackButton);
      return () => {
        backListener.then(l => l.remove());
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      };
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    }
  }, [theme]);

  const updateAdminModeClass = (path: string) => {
    if (path.startsWith('/admin')) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  };

  useEffect(() => {
    updateAdminModeClass(router.pathname);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, [router.asPath]);

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    window.addEventListener('resize', setVh);
    setVh();

    try { emailjs.init({ publicKey: 'TAnqTnsFNr9NHN_or' }); } catch (e) { console.error("Failed to initialize EmailJS.", e); }

    const splashScreen = document.getElementById('splash-screen');
    const checkBackground = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
        return;
      }
      if (window.innerWidth <= 768) {
        document.documentElement.style.backgroundColor = '#059669';
        document.body.style.backgroundColor = '#f8f7f4';
      } else {
        document.documentElement.style.backgroundColor = '#f3f4f6';
        document.body.style.backgroundColor = '#f3f4f6';
      }
    };

    if (splashScreen) {
      // Fade out and hide splash screen quickly
      setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display = 'none'; }, 400);
        checkBackground();
      }, 300);
    } else {
      checkBackground();
    }

    window.onerror = (msg, url, line, col, error) => {
      api.logSystemIssue('error', msg as string, error?.stack || `${url}:${line}:${col}`);
      return false;
    };

    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);

  useEffect(() => {
    api.trackTraffic(router.asPath);

    // Auto-clean unwanted Google/Social tracking parameters from address bar (srsltid, gclid, fbclid, utm_*)
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const url = new URL(window.location.href);
        const trackingParams = ['srsltid', 'gclid', 'fbclid', 'msclkid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        let hasTracking = false;
        trackingParams.forEach((param) => {
          if (url.searchParams.has(param)) {
            url.searchParams.delete(param);
            hasTracking = true;
          }
        });
        if (hasTracking) {
          const cleanUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
          window.history.replaceState(null, '', cleanUrl);
        }
      } catch (e) { }
    }
  }, [router.asPath]);

  const path = router.pathname;
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  const isAdminPage = normalizedPath.startsWith('/admin');
  const isSpinWinPage = normalizedPath === '/spin-win';
  const isProductDetailPage = normalizedPath.startsWith('/product/') && normalizedPath.length > 9;
  const rawPath = (router.pathname || router.asPath || '').split('?')[0].toLowerCase();
  const isAuthPage = rawPath === '/login' || rawPath === '/signup' || rawPath.endsWith('/login') || rawPath.endsWith('/signup');

  let paddingTopClass = "";
  if (!isAdminPage) {
    paddingTopClass += " md:pt-20";
  }

  const showBottomNav = !isAdminPage && !isSpinWinPage && !isProductDetailPage && !isAuthPage;

  useEffect(() => {
    const targetColor = isAuthPage ? '#b5123d' : '#059669';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', targetColor);
    if (typeof document !== 'undefined' && document.documentElement) {
      if (isAuthPage) {
        document.documentElement.classList.add('auth-theme');
      } else {
        document.documentElement.classList.remove('auth-theme');
      }
      document.documentElement.style.backgroundColor = targetColor;
    }

    if (Capacitor.isNativePlatform()) {
      const syncStatusBar = async () => {
        try {
          await StatusBar.setBackgroundColor({ color: targetColor });
          await StatusBar.setStyle({ style: Style.Light });
        } catch (e) { }
      };
      syncStatusBar();
    }
  }, [isAuthPage, router.asPath, router.pathname]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshKey(prev => prev + 1);
  };

  // If it's an admin page and user is not admin, we redirect to login
  useEffect(() => {
    if (isAdminPage && user && user.role !== 'admin') {
      router.replace('/login');
    }
  }, [isAdminPage, user]);

  const cleanCanonicalPath = normalizedPath === '/' ? '' : normalizedPath;
  const canonicalUrl = `https://mobitrashstore.com${cleanCanonicalPath}`;

  return (
    <div className={`min-h-screen w-full bg-gray-50 transition-all duration-300 overflow-x-hidden ${isEditing ? 'pl-80' : ''} ${fullWidth ? 'editor-full-width' : ''}`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content={isAuthPage ? '#b5123d' : '#059669'} />
        <link rel="canonical" href={canonicalUrl} key="canonical" />
        <meta name="robots" content={isAdminPage ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} key="robots" />
      </Head>

      {/* GLOBAL MOBILE STATUS BAR FILLER: Solid Wine Red (#b5123d) on /login and /signup, Emerald Green (#059669) everywhere else */}
      <div
        id="global-mobile-status-bar"
        className={`md:hidden fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-colors duration-150 border-0 shadow-none outline-none ${
          isAuthPage ? 'bg-[#b5123d]' : 'bg-[#059669]'
        }`}
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
      />

      <VisualEditorSidebar />
      <div className={`${paddingTopClass} flex flex-col min-h-screen`}>
        {!isAdminPage && <NoticeBanner navigate={navigate} />}
        {!isAdminPage && <Header navigate={navigate} />}

        <main className={`flex-grow flex flex-col bg-white relative overflow-hidden ${showBottomNav ? 'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>
          <ErrorBoundary>
            <PullToRefresh onRefresh={handleRefresh} disabled={isAdminPage}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${router.asPath}-${refreshKey}`}
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -15, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  className="flex-grow flex flex-col"
                >
                  {isAdminPage && (!user || user.role !== 'admin') ? (
                    <div className="flex h-[60vh] items-center justify-center"><Spinner size="w-12 h-12" /></div>
                  ) : isAdminPage ? (
                    <AdminLayout navigate={navigate}>
                      <Component {...pageProps} navigate={navigate} />
                    </AdminLayout>
                  ) : (
                    <Component {...pageProps} navigate={navigate} />
                  )}
                </motion.div>
              </AnimatePresence>
            </PullToRefresh>
          </ErrorBoundary>
        </main>

        {!isAdminPage && !isSpinWinPage && <Footer navigate={navigate} />}
        {showBottomNav && <BottomNavBar navigate={navigate} currentPath={normalizedPath} />}
        <ScrollToTopButton />
        <CartModal isOpen={isCartOpen} onClose={closeCart} navigate={navigate} />
        <OfflineBanner />
        {isAuthenticating && <AuthOverlay />}
        <BackToExitBanner show={showExitBanner} />
        {Capacitor.isNativePlatform() && !isAdminPage && (
          <AdBanner margin={showBottomNav ? 60 : 0} />
        )}
      </div>
    </div>
  );
};

export default function MyApp(props: AppProps) {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <VisualEditingProvider>
              <GlobalNotificationProvider>
                <CartProvider>
                  <WishlistProvider>
                    <MainAppContent {...props} />
                    <ToastContainer />
                    <Analytics />
                  </WishlistProvider>
                </CartProvider>
              </GlobalNotificationProvider>
            </VisualEditingProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
