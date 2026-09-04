'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type PropertyImageCarouselProps = {
    images: string[];
    galleryHref: string;
};

export default function PropertyImageCarousel({ images, galleryHref }: PropertyImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const touchStartX = useRef<number | null>(null);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const safeImages = useMemo(() => (images.length > 0 ? images : ['/images/not_found_mansion.png']), [images]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                setLightboxIndex(null);
            }
            if (event.key === 'ArrowLeft') setLightboxIndex((current) => current === null ? current : (current - 1 + safeImages.length) % safeImages.length);
            if (event.key === 'ArrowRight') setLightboxIndex((current) => current === null ? current : (current + 1) % safeImages.length);
        };
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [lightboxIndex, safeImages.length]);

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
            {lightboxIndex !== null && <div className="property-lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxIndex(null)} onTouchStart={event => { touchStartX.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touchStartX.current === null) return; const distance = event.changedTouches[0].clientX - touchStartX.current; touchStartX.current = null; if (Math.abs(distance) > 50) { event.stopPropagation(); setLightboxIndex((lightboxIndex + (distance < 0 ? 1 : -1) + safeImages.length) % safeImages.length); } }}><button type="button" className="property-lightbox-close" onClick={() => setLightboxIndex(null)}>×</button><img key={safeImages[lightboxIndex]} className="property-lightbox-image" src={safeImages[lightboxIndex]} alt={`Property image ${lightboxIndex + 1}`} onClick={(event) => event.stopPropagation()} /><div className="property-lightbox-thumbnails" onClick={event => event.stopPropagation()}>{safeImages.map((src, i) => <button type="button" key={`${src}-${i}`} className={i === lightboxIndex ? 'active' : ''} onClick={() => setLightboxIndex(i)}><img src={src} alt={`Thumbnail ${i + 1}`} /></button>)}</div><button type="button" className="property-lightbox-nav property-lightbox-prev" onClick={(event) => { event.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + safeImages.length) % safeImages.length); }}>‹</button><button type="button" className="property-lightbox-nav property-lightbox-next" onClick={(event) => { event.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % safeImages.length); }}>›</button></div>}
        </div>
    );
}
