'use client';

import React from 'react';
import Link from 'next/link';

export function SocialCollectionView({ properties, user }: { properties: any[], user: any }) {
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
            {properties.map(({ property }) => (
                <CollectionFeedItem key={property.id} property={property} collectionUser={user} />
            ))}
        </div>
    );
}

function CollectionFeedItem({ property, collectionUser }: { property: any, collectionUser: any }) {
    const propertyUrl = `/property/${property.slug || property.id}`;
    const images = property.images || [];
    const [activeIndex, setActiveIndex] = React.useState(0);
    const scrollRef = React.useRef<HTMLDivElement>(null);

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

    const specs = property.features
        ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath`
        : '';

    return (
        <div className="card" style={{ padding: '0', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {collectionUser.profile_picture ? (
                        <img src={collectionUser.profile_picture} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        (collectionUser.name || 'U')[0]
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-primary-light)' }}>{collectionUser.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                        Curated Recommendation
                    </div>
                </div>
            </div>

            {/* Media Carousel */}
            <div style={{ position: 'relative', background: '#f8fafc', height: '450px' }}>
                {images.length > 1 && (
                    <>
                        <button onClick={() => scrollTo(Math.max(0, activeIndex - 1))} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>‹</button>
                        <button onClick={() => scrollTo(Math.min(images.length - 1, activeIndex + 1))} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>›</button>
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
                    style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', width: '100%', height: '100%', scrollbarWidth: 'none' }}
                >
                    {images.map((img: any, i: number) => (
                        <Link key={i} href={propertyUrl} style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start', display: 'block' }}>
                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                    ))}
                    {images.length === 0 && (
                        <div style={{ minWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>No Image</div>
                    )}
                </div>
            </div>

            {/* Content & Actions */}
            <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: 'var(--color-gold)', fontWeight: '800', fontSize: '1.4rem' }}>
                        {property.pricing ?
                            new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(property.pricing.price).replace('NPR', 'NRs.')
                            : 'Price on Request'}
                    </div>
                </div>

                <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'var(--color-primary-light)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px', lineHeight: '1.4' }}>{property.title}</h3>
                </Link>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span> {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                </p>
                {specs && <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>{specs}</div>}

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <Link href={propertyUrl} style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', color: 'var(--color-primary-light)', textDecoration: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                        Details
                    </Link>
                    <button style={{ flex: 1.5, padding: '12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                        Contact Agent
                    </button>
                </div>
            </div>
        </div>
    );
}
