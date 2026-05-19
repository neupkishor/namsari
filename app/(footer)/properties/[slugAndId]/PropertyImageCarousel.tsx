'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type PropertyImageCarouselProps = {
    images: string[];
    galleryHref: string;
};

export default function PropertyImageCarousel({ images, galleryHref }: PropertyImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const safeImages = useMemo(() => (images.length > 0 ? images : ['/images/not_found_mansion.png']), [images]);

    const handleScroll = () => {
        const node = scrollerRef.current;
        if (!node) return;
        const width = node.clientWidth || 1;
        const nextIndex = Math.round(node.scrollLeft / width);
        if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
    };

    return (
        <div className="mobile-property-carousel">
            <Link href={galleryHref} style={{ display: 'block', textDecoration: 'none' }}>
                <div className="mobile-property-carousel-track" ref={scrollerRef} onScroll={handleScroll}>
                    {safeImages.map((src, idx) => (
                        <div key={`${src}-${idx}`} className="mobile-property-carousel-slide">
                            <img src={src} alt={`Property image ${idx + 1}`} className="mobile-property-carousel-image" />
                        </div>
                    ))}
                </div>
            </Link>

            <div className="mobile-property-carousel-top">
                <span className="mobile-property-carousel-count">
                    {Math.min(activeIndex + 1, safeImages.length)}/{safeImages.length}
                </span>
                <div className="mobile-property-carousel-dots">
                    {safeImages.map((_, idx) => (
                        <span
                            key={idx}
                            className={`mobile-property-carousel-dot ${idx === activeIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
