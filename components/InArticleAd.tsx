import React, { useEffect } from 'react';

/**
 * InArticleAd Component
 * Specifically designed for blog post content. 
 * This uses a standard AdSense unit but can be customized with your actual slot ID.
 */
const InArticleAd: React.FC = () => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className="my-6 w-full max-w-xl mx-auto overflow-hidden text-center bg-gray-50/10 rounded-md py-0.5 border border-dashed border-gray-100 max-h-[140px]">
            <p className="text-[7px] text-gray-300 font-bold uppercase tracking-tighter mb-0 leading-none">Advertisement</p>
            {/* 
        IMPORTANT: Replace the data-ad-slot with your actual Slot ID 
        from Google AdSense > Ads > By Ad Unit > In-article ads
      */}
            <div className="h-full overflow-hidden">
                <ins
                    className="adsbygoogle"
                    style={{ display: 'block', textAlign: 'center' }}
                    data-ad-layout="in-article"
                    data-ad-format="fluid"
                    data-ad-client="ca-pub-2257248018050891"
                    data-ad-slot="9813801750"
                ></ins>
            </div>
        </div>
    );
};

export default InArticleAd;
