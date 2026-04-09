'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackImpression, trackClick } from '@/actions/ads';

interface Ad {
    id: number;
    image: string;
    takes_to?: string | null;
    link?: string | null;
    posted_by?: string | null;
    isSponsoredRel?: boolean;
}

export const AdvertisementCard = ({ ad, className }: { ad: Ad, className?: string }) => {
    const [hasViewed, setHasViewed] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const destinationUrl = ad.link || ad.takes_to;
    const relAttributes = [
        "noopener", 
        "noreferrer", 
        ad.isSponsoredRel ? "sponsored" : ""
    ].filter(Boolean).join(" ");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasViewed) {
                    setHasViewed(true);
                    const sessionId = sessionStorage.getItem('namsari_session_id') || undefined;
                    trackImpression(ad.id, sessionId).catch(console.error);
                }
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [ad.id, hasViewed]);

    const handleAdClick = () => {
        const sessionId = sessionStorage.getItem('namsari_session_id') || undefined;
        trackClick(ad.id, sessionId).catch(console.error);
    };

    const content = (
        <div ref={cardRef} className={`w-full overflow-hidden relative rounded-2xl border border-border bg-surface shadow-sm hover:shadow-lg transition-all duration-500 group ${className || ''}`}>
            <div className="relative w-full pt-[44.44%] sm:pt-[40%] md:pt-[35%] lg:pt-[30%] overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={ad.image}
                        alt="Advertisement"
                        className="w-full h-full block object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/10 tracking-[0.15em] uppercase shadow-xl z-10">
                        Sponsored {ad.posted_by ? `by ${ad.posted_by}` : ''}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="bg-white/95 backdrop-blur-sm text-primary text-[11px] px-4 py-2 rounded-2xl font-black shadow-2xl border border-primary/10 tracking-widest uppercase">
                            Learn More
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (destinationUrl) {
        return <Link href={destinationUrl} target="_blank" rel={relAttributes} className="block" onClick={handleAdClick}>{content}</Link>;
    }
    return content;
};

export const AdvertisementCarousel = ({ ads }: { ads: Ad[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                setIsInView(entries[0].isIntersecting);
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isInView && ads[activeIndex]) {
            const sessionId = sessionStorage.getItem('namsari_session_id') || undefined;
            trackImpression(ads[activeIndex].id, sessionId).catch(console.error);
        }
    }, [activeIndex, isInView, ads]);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % ads.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + ads.length) % ads.length);
    };

    useEffect(() => {
        if (ads.length <= 1) return;
        timeoutRef.current = setInterval(nextSlide, 5000);
        return () => {
            if (timeoutRef.current) clearInterval(timeoutRef.current);
        };
    }, [ads.length]);

    const handleManualNav = (action: () => void) => {
        if (timeoutRef.current) clearInterval(timeoutRef.current);
        action();
        if (ads.length > 1) {
            timeoutRef.current = setInterval(nextSlide, 5000);
        }
    };

    const handleAdClick = (adId: number) => {
        const sessionId = sessionStorage.getItem('namsari_session_id') || undefined;
        trackClick(adId, sessionId).catch(console.error);
    };

    if (ads.length === 0) return null;

    return (
        <div ref={containerRef} className="w-full rounded-2xl overflow-hidden relative bg-surface shadow-2xl border border-border group/carousel">
            <div className="relative w-full pt-[44.44%] sm:pt-[40%] md:pt-[35%] lg:pt-[30%] overflow-hidden">
                {ads.map((ad, idx) => {
                    const adUrl = ad.link || ad.takes_to;
                    const adRel = ["noopener", "noreferrer", ad.isSponsoredRel ? "sponsored" : ""].filter(Boolean).join(" ");
                    
                    return (
                        <div
                            key={`${ad.id}-${idx}`}
                            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${
                                idx === activeIndex ? 'opacity-100 z-10 scale-100 pointer-events-auto' : 'opacity-0 z-0 scale-105 pointer-events-none'
                            }`}
                        >
                            <Link 
                                href={adUrl || '#'}
                                target={adUrl ? "_blank" : undefined}
                                rel={adUrl ? adRel : undefined} 
                                className={`block w-full h-full relative overflow-hidden ${adUrl ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => handleAdClick(ad.id)}
                            >
                                <img
                                    src={ad.image}
                                    alt={`Ad by ${ad.posted_by}`}
                                    className="w-full h-full object-cover transition-transform duration-[8000ms] group-hover/carousel:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                            </Link>
                            <div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black border border-white/10 tracking-[0.2em] uppercase shadow-2xl z-20">
                                Sponsored {ad.posted_by ? `by ${ad.posted_by}` : ''}
                            </div>
                        </div>
                    );
                })}
            </div>

            {ads.length > 1 && (
                <>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                        {ads.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleManualNav(() => setActiveIndex(idx));
                                }}
                                className={`h-1.5 rounded-full transition-all duration-700 shadow-xl ${
                                    idx === activeIndex ? 'bg-white w-10 ring-4 ring-white/20' : 'bg-white/40 w-3 hover:bg-white/60'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <div className="absolute inset-y-0 left-6 flex items-center z-30 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover/carousel:translate-x-0">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleManualNav(prevSlide);
                            }}
                            className="bg-white/90 hover:bg-white text-primary border border-white/50 rounded-2xl w-11 h-11 flex items-center justify-center cursor-pointer backdrop-blur-md transition-all active:scale-90 shadow-2xl group/btn"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:-translate-x-0.5 transition-transform"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-6 flex items-center z-30 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 translate-x-[10px] group-hover/carousel:translate-x-0">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleManualNav(nextSlide);
                            }}
                            className="bg-white/90 hover:bg-white text-primary border border-white/50 rounded-2xl w-11 h-11 flex items-center justify-center cursor-pointer backdrop-blur-md transition-all active:scale-90 shadow-2xl group/btn"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-0.5 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
