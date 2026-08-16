import React, { useEffect } from 'react';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

interface AdBannerProps {
    adId?: string;
    isTesting?: boolean;
    margin?: number;
}

/**
 * AdBanner Component
 * This component automatically shows a banner ad when mounted and removes it when unmounted.
 * Note: Banner ads in Capacitor are overlays, so this component handles the showing/hiding.
 */
const AdBanner: React.FC<AdBannerProps> = ({
    adId = 'ca-app-pub-2257248018050891/7527697883', // Real Ad Unit ID for Mobi Store Banner
    isTesting = false,
    margin = 60
}) => {
    useEffect(() => {
        let isMounted = true;
        const initializeBanner = async () => {
            try {
                if (!isMounted) return;
                await AdMob.showBanner({
                    adId: adId,
                    adSize: BannerAdSize.ADAPTIVE_BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER,
                    margin: margin, // Leave space for bottom nav bar (60px)
                    isTesting: isTesting
                });
            } catch (e) {
                console.warn('Banner ad info:', e);
            }
        };

        const timer = setTimeout(() => {
            initializeBanner();
        }, 400);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [adId, isTesting, margin]);

    return null;
};

export default AdBanner;
