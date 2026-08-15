import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        
        {/* Status Bar Color Configuration */}
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />


        {/* Prevent Chrome Translation Popup & "Running in Chrome" context if possible */}
        <meta name="google" content="notranslate" />

        <meta name="application-name" content="Mobi Store" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* iOS Startup Splash Screen (Optimization) */}
        <link rel="apple-touch-startup-image" href="/icon-512.png" />

        {/* FAVICON & ICONS */}
        {/* SVG favicon: crisp at ALL sizes, no blur ever */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Fallback PNG for old browsers */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
        <link rel="shortcut icon" href="/favicon.svg" />
        {/* iOS Home Screen - MUST be high-res PNG (iOS does not support SVG here) */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/apple-touch-icon-hd.png" />
        <link rel="apple-touch-icon" sizes="1024x1024" href="/apple-touch-icon-hd.png" />

        {/* NETWORK & CDN ACCELERATION FOR LOW-SPEED NETWORKS */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PERFORMANCE: PRELOAD CRITICAL ASSETS */}
        <link rel="preload" as="image" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preload" as="font" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwMAdGHFzUXxw.woff2" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" as="font" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwMAdGHFl2UXxw.woff2" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" as="font" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwMAdGHFj2UXxw.woff2" type="font/woff2" crossOrigin="anonymous" />

        {/* Google Adsense: loaded with async defer to avoid blocking rendering */}
        <meta name="google-adsense-account" content="ca-pub-2257248018050891" />
        <script async defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2257248018050891" crossOrigin="anonymous" />
        <meta name="google-site-verification" content="oxF6z3AR6drhrd8QNRbYeyt6jj1W7fsCpOvvXysJhUo" />

        {/* OneSignal Push Notifications */}
        <script defer src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" />
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function (OneSignal) {
                await OneSignal.init({
                  appId: "57ef8ba0-4ed2-44c6-9bbc-917123034494",
                  safari_web_id: "web.onesignal.auto.11a76d30-e2a9-4f46-9be9-382fbd4a01f1",
                  notifyButton: {
                    enable: false,
                  },
                });
              });
            `
          }}
        />

        {/* BLOCK CONTEXT MENU SCRIPT */}
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function protectContent(e) {
                  if (document.body && (document.body.classList.contains('admin-mode') || window.location.pathname.startsWith('/admin'))) {
                    return true;
                  }
                  if (window.innerWidth > 768) {
                    return true;
                  }
                  let target = e.target;
                  let depth = 4;
                  while (target && target !== document && depth > 0) {
                    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') {
                      return true;
                    }
                    target = target.parentElement;
                    depth--;
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }

                if (window.innerWidth <= 768) {
                  document.addEventListener('touchstart', function (e) {
                    if (e.touches.length > 1) {
                      e.preventDefault();
                    }
                  }, { passive: false });

                  let lastTouchEnd = 0;
                  document.addEventListener('touchend', function (e) {
                    const now = (new Date()).getTime();
                    if (now - lastTouchEnd <= 300) {
                      e.preventDefault();
                    }
                    lastTouchEnd = now;
                  }, false);

                  document.addEventListener('gesturestart', function (e) {
                    e.preventDefault();
                  });
                }

                window.addEventListener('contextmenu', protectContent, { passive: false, capture: true });
                document.documentElement.style.webkitUserSelect = 'none';
                document.documentElement.style.userSelect = 'none';
              })();
            `
          }}
        />

        {/* Styles for Splash & Scroll & No-Select */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --brand-primary: #059669;
            }

            html {
              width: 100%;
              overflow-x: hidden;
              background-color: var(--brand-primary);
              overscroll-behavior-y: none;
            }

            body {
              margin: 0;
              padding: 0;
              width: 100%;
              overflow-x: hidden;
              font-family: 'Inter', sans-serif;
              -webkit-tap-highlight-color: transparent;
            }

            @media (max-width: 768px) {
              input, textarea, [contenteditable="true"], select {
                -webkit-user-select: text !important;
                user-select: text !important;
                -webkit-touch-callout: default !important;
              }
            }

            body.admin-mode * {
              -webkit-touch-callout: default !important;
              -webkit-user-select: text !important;
              user-select: text !important;
            }

            @media (max-width: 768px), (display-mode: standalone) {
              html {
                background-color: #059669 !important;
              }
              body {
                background-color: #f8f7f4 !important;
              }
              #root {
                background-color: #f8f7f4 !important;
                min-height: 100vh;
              }
            }

            @media (min-width: 769px) and (display-mode: browser) {
              html, body {
                background-color: #f3f4f6 !important;
              }
              #root {
                background-color: transparent !important;
                min-height: 100vh;
              }
            }

            #splash-screen {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 99999;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #059669;
              color: white;
              transition: opacity 0.4s ease-out;
              padding: env(safe-area-inset-top) 2rem env(safe-area-inset-bottom) 2rem;
            }

            .splash-mobile {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              max-width: 320px;
            }

            .splash-desktop {
              display: none;
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: 1.5rem;
            }

            .desktop-logo-row {
              display: flex;
              align-items: center;
              gap: 1.5rem;
            }

            .desktop-tagline {
              font-size: 1.1rem;
              font-weight: 600;
              letter-spacing: 0.1em;
              color: #059669;
              opacity: 0;
              transform: translateY(10px);
              animation: fadeInTagline 0.6s ease-out 0.8s forwards;
            }

            @keyframes fadeInTagline {
              to { opacity: 0.7; transform: translateY(0); }
            }

            .splash-line {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.05em;
              flex-wrap: nowrap;
            }

            .splash-word-gap { width: 0.3em; }

            .splash-letter {
              font-size: 2.2rem;
              font-weight: 900;
              color: #ffffff;
              opacity: 0;
              transform: translateY(20px);
              animation: letterReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: inline-block;
              line-height: 1.1;
            }

            @keyframes letterReveal {
              to { opacity: 1; transform: translateY(0); }
            }

            .splash-icon-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              animation: iconEnter 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }

            .splash-cart-icon {
              width: 32px;
              height: 32px;
              color: #ffffff;
              fill: #ffffff;
              filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
            }

            @keyframes iconEnter {
              0% { opacity: 0; transform: scale(0) rotate(-20deg); }
              100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }

            .animate-bounce {
              animation: bounceIcon 2s ease-in-out infinite;
            }

            @keyframes bounceIcon {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }

            .splash-footer {
              position: absolute;
              bottom: 30px;
              left: 0;
              width: 100%;
              text-align: center;
              opacity: 0;
              animation: fadeIn 0.8s ease-out 1.8s forwards;
            }

            .splash-footer-text {
              font-size: 0.7rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: #ffffff;
              opacity: 0.6;
            }

            .loader-bar {
              width: 60px;
              height: 4px;
              background: rgba(255, 255, 255, 0.3);
              border-radius: 2px;
              margin-top: 1.5rem;
              overflow: hidden;
              position: relative;
              opacity: 0;
              animation: fadeIn 0.5s ease-out 0.2s forwards;
            }

            .loader-bar::after {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 40%;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 2px;
              animation: loadingSwipe 1s infinite ease-in-out;
            }

            @keyframes fadeIn { to { opacity: 1; } }

            @keyframes loadingSwipe {
              0% { left: -40%; width: 30%; }
              50% { width: 60%; }
              100% { left: 100%; width: 30%; }
            }

            @media (min-width: 769px) {
              .splash-mobile { display: none; }
              .splash-desktop { display: flex; }
              .splash-letter { font-size: 3.5rem; }
              .splash-cart-icon { width: 48px; height: 48px; }
              .loader-bar { width: 100px; height: 5px; margin-top: 2rem; }
              .splash-footer-text { font-size: 0.85rem; }
            }
          `
        }} />

        {/* Performance Optimizations: Preconnect to CDN origins */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        {/* Google One Tap */}
        <script src="https://accounts.google.com/gsi/client" async defer />

        {/* Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              {
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://mobitrashstore.com/#organization",
                    "name": "Mobi Store",
                    "alternateName": ["Mobi Store Tech", "Mobi Store"],
                    "url": "https://mobitrashstore.com",
                    "logo": "/icon-192.png",
                    "email": "support@mobitrashstore.com",
                    "foundingDate": "2025-11-25",
                    "taxID": "140158515",
                    "founder": {
                      "@type": "Person",
                      "name": "Mobi Store Team",
                      "jobTitle": "CEO & Developer",
                      "url": "https://mobitrashstore.com/about"
                    },
                    "description": "Mobi Store is the leading global re-commerce platform to sell used phones instantly, buy certified pre-owned devices, and get expert mobile repairs with worldwide delivery.",
                    "contactPoint": [
                      {
                        "@type": "ContactPoint",
                        "telephone": "+977-9827801575",
                        "contactType": "customer service",
                        "areaServed": "Global",
                        "availableLanguage": ["en"]
                      }
                    ],
                    "sameAs": [
                      "https://www.facebook.com/share/17SwmmmU6f/?mibextid=wwXIfr",
                      "https://www.tiktok.com/@mobistoreapp",
                      "https://wa.me/+9779812141777"
                    ],
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "Global Headquarters",
                      "addressLocality": "Worldwide",
                      "addressRegion": "Global",
                      "postalCode": "00000",
                      "addressCountry": "US"
                    }
                  },
                  {
                    "@type": "MobilePhoneStore",
                    "@id": "https://mobitrashstore.com/#store",
                    "parentOrganization": { "@id": "https://mobitrashstore.com/#organization" },
                    "name": "Mobi Store - Global Certified Outlet",
                    "image": "/icon-192.png",
                    "priceRange": "$$$",
                    "telephone": "+9779827801575"
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://mobitrashstore.com/#website",
                    "url": "https://mobitrashstore.com",
                    "name": "Mobi Store - Sell Used Phones in Nepal",
                    "description": "Instant cash for used smartphones. Best valuation in Nepal.",
                    "publisher": { "@id": "https://mobitrashstore.com/#organization" },
                    "potentialAction": {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://mobitrashstore.com/buy?search={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  },
                  {
                    "@type": "Service",
                    "name": "Mobile Repair Service",
                    "provider": { "@id": "https://mobitrashstore.com/#organization" },
                    "areaServed": { "@type": "City", "name": "Kathmandu" },
                    "description": "Professional mobile repair services including screen replacement, battery change, and motherboard repair."
                  },
                  {
                    "@type": "Service",
                    "name": "Phone Buyback Program",
                    "provider": { "@id": "https://mobitrashstore.com/#organization" },
                    "areaServed": "NP",
                    "description": "Sell your used smartphone online and get instant cash via bank transfer or eSewa."
                  }
                ]
              }
            `
          }}
        />
      </Head>
      <body>
        {/* LOADING SPLASH SCREEN MARKUP */}
        <div id="splash-screen">
          {/* MOBILE VIEW (Vertical layout) */}
          <div className="splash-mobile">
            <div className="splash-line">
              <span className="splash-letter" style={{ animationDelay: '0.05s' }}>M</span>
              <span className="splash-letter" style={{ animationDelay: '0.1s' }}>o</span>
              <span className="splash-letter" style={{ animationDelay: '0.15s' }}>b</span>
              <span className="splash-letter" style={{ animationDelay: '0.2s' }}>i</span>
            </div>
            <div className="splash-line">
              <div className="splash-icon-wrapper" style={{ animationDelay: '0.3s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="splash-cart-icon">
                  <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="splash-letter" style={{ animationDelay: '0.4s' }}>S</span>
              <span className="splash-letter" style={{ animationDelay: '0.45s' }}>t</span>
              <span className="splash-letter" style={{ animationDelay: '0.5s' }}>o</span>
              <span className="splash-letter" style={{ animationDelay: '0.55s' }}>r</span>
              <span className="splash-letter" style={{ animationDelay: '0.6s' }}>e</span>
            </div>
            <div className="loader-bar" />
          </div>

          {/* DESKTOP VIEW (Horizontal layout + Tagline) */}
          <div className="splash-desktop">
            <div className="desktop-logo-row">
              <div className="splash-icon-wrapper" style={{ animationDelay: '0.1s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="splash-cart-icon">
                  <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="splash-line">
                <span className="splash-letter" style={{ animationDelay: '0.2s' }}>M</span>
                <span className="splash-letter" style={{ animationDelay: '0.25s' }}>o</span>
                <span className="splash-letter" style={{ animationDelay: '0.3s' }}>b</span>
                <span className="splash-letter" style={{ animationDelay: '0.35s' }}>i</span>
                <span className="splash-word-gap" />
                <span className="splash-letter" style={{ animationDelay: '0.45s' }}>S</span>
                <span className="splash-letter" style={{ animationDelay: '0.5s' }}>t</span>
                <span className="splash-letter" style={{ animationDelay: '0.55s' }}>o</span>
                <span className="splash-letter" style={{ animationDelay: '0.6s' }}>r</span>
                <span className="splash-letter" style={{ animationDelay: '0.65s' }}>e</span>
              </div>
            </div>
            <div className="desktop-tagline">Nepal's Premier Tech Marketplace</div>
            <div className="loader-bar" />
          </div>

          <div className="splash-footer">
            <span className="splash-footer-text">By Mobi Store Tech</span>
          </div>
        </div>

        <Main />
        <NextScript />

        {/* Script triggers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                const carts = document.querySelectorAll('.splash-cart-icon');
                carts.forEach(cart => cart.classList.add('animate-bounce'));
              }, 2300);

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `
          }}
        />
      </body>
    </Html>
  );
}
