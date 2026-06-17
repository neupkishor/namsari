'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { toggleLike, addComment } from '@/actions/social';
import { InternalPropertyLink } from '@/components/navigation/InternalPropertyLink';

export function SocialCollectionView({ properties, user }: { properties: any[], user: any }) {
    const [displayCount, setDisplayCount] = useState(10);
    const observerTarget = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setDisplayCount((prev) => {
                        const next = prev + 10;
                        return next > properties.length ? properties.length : next;
                    });
                }
            },
            { threshold: 0.1 } // Load when element is 10% visible
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [properties.length]);

    const visibleProperties = properties.slice(0, displayCount);

    if (properties.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No properties in this collection yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px', margin: '0 auto' }}>
            {visibleProperties.map(({ property }) => (
                <CollectionFeedItem key={property.id} property={property} collectionUser={user} />
            ))}
            {displayCount < properties.length && (
                <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />
            )}
        </div>
    );
}

function CollectionFeedItem({ property, collectionUser }: { property: any, collectionUser: any }) {
    const propertyUrl = `/property/${property.slug || property.id}`;
    const images = property.images || [];
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [shareCount, setShareCount] = useState(0);

    const handleShare = () => {
        setShareCount(prev => prev + 1);
        // Implement share logic here (e.g., navigator.share or copy link)
    };
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const scrollTo = (index: number) => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({
                left: index * width,
                behavior: 'smooth'
            });
            setActiveIndex(index);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isDragging) return; // Don't update while dragging
        const target = e.currentTarget;
        const scrollLeft = target.scrollLeft;
        const width = target.offsetWidth;
        if (width > 0) {
            const newIndex = Math.round(scrollLeft / width);
            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        e.preventDefault(); // Prevent default browser drag behavior
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // Snap to nearest slide
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            const currentScroll = scrollRef.current.scrollLeft;
            const index = Math.round(currentScroll / width);
            scrollTo(index);
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            if (scrollRef.current) {
                const width = scrollRef.current.offsetWidth;
                const currentScroll = scrollRef.current.scrollLeft;
                const index = Math.round(currentScroll / width);
                scrollTo(index);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX);
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleDoubleTap = async () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // Double tap detected
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 1000);
            
            if (!isLiked) {
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
                try {
                    await toggleLike(property.id);
                } catch (error) {
                    console.error('Failed to like:', error);
                    setIsLiked(false);
                    setLikeCount(prev => prev - 1);
                }
            }
        }
        setLastTap(now);
    };

    const handleLike = async () => {
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
        
        try {
            await toggleLike(property.id);
        } catch (error) {
            console.error('Failed to toggle like:', error);
            setIsLiked(!newLikedState);
            setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1);
        }
    };

    const specs = property.features
        ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath`
        : '';

    return (
        <div className="card" style={{ padding: '0', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {collectionUser.profile_picture ? (
                            <img src={collectionUser.profile_picture} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            (collectionUser.name || 'U')[0]
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-primary-light)' }}>{collectionUser.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                             {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                        </div>
                    </div>
                </div>
                
                <InternalPropertyLink href={propertyUrl} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}>
                    View
                </InternalPropertyLink>
            </div>

            {/* Media Carousel */}
            <div 
                style={{ position: 'relative', background: '#f8fafc', height: '450px' }}
                onClick={handleDoubleTap}
            >
                {/* Animated Heart Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${showHeart ? 1 : 0})`,
                    opacity: showHeart ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    zIndex: 20,
                    pointerEvents: 'none'
                }}>
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="white" stroke="none" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>

                {images.length > 1 && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); scrollTo(Math.max(0, activeIndex - 1)); }} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>‹</button>
                        <button onClick={(e) => { e.stopPropagation(); scrollTo(Math.min(images.length - 1, activeIndex + 1)); }} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>›</button>
                        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
                            {images.map((_: any, i: number) => (
                                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === activeIndex ? '#3b82f6' : 'rgba(0,0,0,0.2)', transition: 'all 0.2s' }} />
                            ))}
                        </div>
                    </>
                )}

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{ 
                        display: 'flex', 
                        overflowX: 'auto', 
                        overflowY: 'hidden',
                        scrollSnapType: isDragging ? 'none' : 'x mandatory', 
                        width: '100%', 
                        height: '100%', 
                        scrollbarWidth: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        touchAction: 'pan-x'
                    }}
                >
                    {images.map((img: any, i: number) => (
                        <div key={i} style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start', display: 'block' }}>
                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div style={{ minWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>No Image</div>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "#1e293b"} strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        {likeCount > 0 && <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{likeCount}</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                        </button>
                        {shareCount > 0 && <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{shareCount}</span>}
                    </div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </div>
                </button>
            </div>

            {/* Content & Actions */}
            <div style={{ padding: '0 16px 16px 16px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e293b' }}>
                        {property.pricing && property.pricing.price ?
                            new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(property.pricing.price).replace('NPR', 'NRs.')
                            : 'Price on Request'}
                    </div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1rem' }}>
                        {property.title}
                    </div>
                </div>

                {property.remarks && (
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                            <span style={{ fontWeight: '700', marginRight: '6px' }}>{collectionUser.name}</span>
                            {property.remarks}
                        </span>
                    </div>
                )}

                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span> {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                </p>
                {specs && <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '8px' }}>{specs}</div>}
            </div>
        </div>
    );
}
