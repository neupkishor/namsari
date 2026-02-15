import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface GridListingCardProps {
  properties: any[];
  title: string;
  className?: string;
}

export function GridListingCard({ properties, title, className }: GridListingCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance logic
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % properties.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  useEffect(() => {
    if (properties.length <= 1) return;
    timeoutRef.current = setInterval(nextSlide, 4000); // 4 seconds per slide
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [properties.length]);

  const handleManualNav = (action: () => void) => {
    if (timeoutRef.current) clearInterval(timeoutRef.current);
    action();
    if (properties.length > 1) {
      timeoutRef.current = setInterval(nextSlide, 4000);
    }
  };

  if (properties.length === 0) return null;

  const currentProperty = properties[activeIndex];
  const slug = currentProperty.slug || currentProperty.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${currentProperty.id}`;
  const mainImage = currentProperty.images?.[0] ? (typeof currentProperty.images[0] === 'string' ? currentProperty.images[0] : currentProperty.images[0].url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`grid-listing-card ${className || ''}`} style={{
        background: 'white',
        borderRadius: 'var(--radius-card)',
        padding: '0',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
    }}>
      <div className="grid-listing-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9'
      }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary)' }}>{title}</h4>
        <Link href="/explore" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-gold)', textDecoration: 'none' }}>Explore More</Link>
      </div>

      <div style={{ position: 'relative', width: '100%', paddingTop: '75%' /* 4:3 Aspect Ratio */ }}>
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
        }}>
            <Link href={propertyUrl} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img 
                    src={mainImage} 
                    alt={currentProperty.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Overlay Content */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    color: 'white'
                }}>
                    <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        marginBottom: '4px',
                        color: '#fbbf24' 
                    }}>
                        {currentProperty.price}
                    </div>
                    <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {currentProperty.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                        📍 {currentProperty.location}
                    </div>
                </div>
            </Link>

            {/* Navigation Controls */}
            {properties.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNav(prevSlide);
                        }}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2
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
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2
                        }}
                    >
                        →
                    </button>

                    {/* Dots Indicator */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '6px',
                        zIndex: 2,
                        background: 'rgba(0,0,0,0.4)',
                        padding: '6px 10px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {properties.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleManualNav(() => setActiveIndex(idx));
                                }}
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: idx === activeIndex ? 'white' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
