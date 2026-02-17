'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackImpression, trackClick } from '@/actions/ads';

interface Ad {
    id: number;
    image: string;
    takes_to?: string | null;
    posted_by?: string | null;
}

export const AdvertisementCard = ({ ad, className }: { ad: Ad, className?: string }) => {
    const [hasViewed, setHasViewed] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

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
        <div ref={cardRef} className={`card ${className || ''}`} style={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            padding: 0
        }}>
            <img
                src={ad.image}
                alt="Advertisement"
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    maxHeight: '500px',
                    objectFit: 'cover'
                }}
            />
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: '600',
                backdropFilter: 'blur(4px)'
            }}>
                Sponsored {ad.posted_by ? `by ${ad.posted_by}` : ''}
            </div>
        </div>
    );

    if (ad.takes_to) {
        return <Link href={ad.takes_to} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }} onClick={handleAdClick}>{content}</Link>;
    }
    return content;
};

export const AdvertisementCarousel = ({ ads }: { ads: Ad[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    // Track visibility of the carousel
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

    // Track impression when slide changes AND is in view
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
        timeoutRef.current = setInterval(nextSlide, 5000); // Auto-advance every 5s
        return () => {
            if (timeoutRef.current) clearInterval(timeoutRef.current);
        };
    }, [ads.length]);

    const handleManualNav = (action: () => void) => {
        if (timeoutRef.current) clearInterval(timeoutRef.current);
        action();
        if (ads.length > 1) {
            timeoutRef.current = setInterval(nextSlide, 5000); // Restart timer
        }
    };

    const handleAdClick = (adId: number) => {
        const sessionId = sessionStorage.getItem('namsari_session_id') || undefined;
        trackClick(adId, sessionId).catch(console.error);
    };

    if (ads.length === 0) return null;

    return (
        <div ref={containerRef} className="advertisement-carousel-container" style={{
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            background: '#f8fafc'
        }}>
            <style jsx>{`
                .carousel-wrapper {
                     position: relative;
                     width: 100%;
                     padding-top: 35%; /* Desktop Aspect Ratio */
                }
                @media (max-width: 768px) {
                    .carousel-wrapper {
                        padding-top: 50%; /* Tablet Aspect Ratio */
                    }
                }
                @media (max-width: 480px) {
                    .carousel-wrapper {
                        padding-top: 66%; /* Mobile Aspect Ratio - taller for better visibility */
                    }
                }
            `}</style>
            <div className="carousel-wrapper">
                {ads.map((ad, idx) => (
                    <div
                        key={`${ad.id}-${idx}`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: idx === activeIndex ? 1 : 0,
                            transition: 'opacity 0.6s ease-in-out',
                            zIndex: idx === activeIndex ? 1 : 0,
                            pointerEvents: idx === activeIndex ? 'auto' : 'none'
                        }}
                    >
                        <Link 
                            href={ad.takes_to || '#'} 
                            target={ad.takes_to ? "_blank" : undefined} 
                            style={{ display: 'block', width: '100%', height: '100%', cursor: ad.takes_to ? 'pointer' : 'default' }}
                            onClick={() => handleAdClick(ad.id)}
                        >
                            <img
                                src={ad.image}
                                alt={`Ad by ${ad.posted_by}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Link>
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            backdropFilter: 'blur(8px)',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase'
                        }}>
                            Sponsored {ad.posted_by ? `by ${ad.posted_by}` : ''}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Controls */}
            {ads.length > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 10
                }}>
                    {/* Dots */}
                    <div style={{ display: 'flex', gap: '6px', marginRight: '12px' }}>
                        {ads.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleManualNav(() => setActiveIndex(idx));
                                }}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: idx === activeIndex ? 'white' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>

                    {/* Arrows */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNav(prevSlide);
                        }}
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        ←
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNav(nextSlide);
                        }}
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
};
