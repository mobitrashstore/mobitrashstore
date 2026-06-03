import React, { useEffect } from 'react';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

interface AdBannerProps {
    adId?: string;
    isTesting?: boolean;
}

/**
 * AdBanner Component
 * This component automatically shows a banner ad when mounted and removes it when unmounted.
 * Note: Banner ads in Capacitor are overlays, so this component handles the showing/hiding.
 */
const AdBanner: React.FC<AdBannerProps> = ({
    adId = 'ca-app-pub-3940256099942544/6300978111', // Default Test ID
    isTesting = true
}) => {
    useEffect(() => {
        const initializeBanner = async () => {
            try {
                // We check if we are on a real device or emulator
                const isPushEnabled = await AdMob.showBanner({
                    adId: adId,
                    adSize: BannerAdSize.ADAPTIVE_BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER,
                    margin: 60, // Leave space for bottom nav bar if needed
                    isTesting: isTesting
                });
            } catch (e) {
                console.error('Banner Ad failed to show:', e);
            }
        };

        // Small delay to ensure the page has loaded
        const timer = setTimeout(() => {
            initializeBanner();
        }, 1000);

        return () => {
            clearTimeout(timer);
            // Clean up the ad when leaving the page
            AdMob.removeBanner().catch(e => console.error('Error removing banner:', e));
        };
    }, [adId, isTesting]);

    // Returning an empty div as the ad is an overlay managed by the native layer
    return <div className="ad-container" style={{ height: '0px' }}></div>;
};

export default AdBanner;
