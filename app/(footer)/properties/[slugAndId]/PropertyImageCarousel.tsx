'use client';

import { useMemo, useRef, useState } from 'react';

type PropertyImageCarouselProps = {
    images: string[];
    galleryHref: string;
};

export default function PropertyImageCarousel({ images, galleryHref }: PropertyImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
            <div className="mobile-property-carousel-track" ref={scrollerRef} onScroll={handleScroll} onClick={(event) => { const src = (event.target as HTMLImageElement).src; const index = safeImages.indexOf(src); if (index >= 0) setLightboxIndex(index); }}>
                    {safeImages.map((src, idx) => (
                        <div key={`${src}-${idx}`} className="mobile-property-carousel-slide">
                            <img src={src} alt={`Property image ${idx + 1}`} className="mobile-property-carousel-image" />
                        </div>
                    ))}
            </div>

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
            {lightboxIndex !== null && <div className="property-lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxIndex(null)}><button type="button" className="property-lightbox-close" onClick={() => setLightboxIndex(null)}>×</button><img src={safeImages[lightboxIndex]} alt={`Property image ${lightboxIndex + 1}`} onClick={(event) => event.stopPropagation()} /><button type="button" className="property-lightbox-nav property-lightbox-prev" onClick={(event) => { event.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + safeImages.length) % safeImages.length); }}>‹</button><button type="button" className="property-lightbox-nav property-lightbox-next" onClick={(event) => { event.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % safeImages.length); }}>›</button></div>}
        </div>
    );
}
