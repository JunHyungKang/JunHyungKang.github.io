'use client';

import { useEffect, useRef } from 'react';

type AdBannerProps = {
    dataAdSlot?: string;
    dataAdFormat?: string;
    dataFullWidthResponsive?: boolean;
    className?: string;
};

export default function AdBanner({
    dataAdSlot = "YOUR_AD_SLOT_ID", // Replace with valid slot ID when available
    dataAdFormat = "auto",
    dataFullWidthResponsive = true,
    className = "",
}: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className={`my-8 w-full flex justify-center overflow-hidden min-h-[100px] bg-slate-900/30 rounded-lg ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-3166603343095810" // Using ID from layout.tsx
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
                ref={adRef}
            />
        </div>
    );
}
