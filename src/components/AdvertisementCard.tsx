'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Ad {
    id: number;
    image: string;
    takes_to?: string | null;
    posted_by?: string | null;
}

export const AdvertisementCard = ({ ad, className }: { ad: Ad, className?: string }) => {
    const content = (
        <div className={`card ${className || ''}`} style={{
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
        return <Link href={ad.takes_to} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>{content}</Link>;
    }
    return content;
};

export const AdvertisementCarousel = ({ ads }: { ads: Ad[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    if (ads.length === 0) return null;

    return (
        <div className="advertisement-carousel-container" style={{
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
                        key={ad.id}
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
                        <Link href={ad.takes_to || '#'} target={ad.takes_to ? "_blank" : undefined} style={{ display: 'block', width: '100%', height: '100%', cursor: ad.takes_to ? 'pointer' : 'default' }}>
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
