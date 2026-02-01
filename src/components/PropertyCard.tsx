'use client';

import React from 'react';
import Link from 'next/link';

interface PropertyCardProps {
    property: {
        id: number | string;
        title: string;
        slug?: string;
        price: string;
        location: string;
        specs?: string;
        images?: string[];
    };
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const propertyUrl = `/properties/${slug}-${property.id}`;

    return (
        <div
            className="card"
            style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Link href={propertyUrl} style={{ display: 'block', position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'}
                    alt={property.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'transform 0.5s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    zIndex: 2
                }}>
                    NEW LISTING
                </div>
            </Link>

            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--color-gold)', fontWeight: '800', fontSize: '1.35rem', marginBottom: '10px' }}>
                    {property.price}
                </div>

                <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{
                        fontSize: '1.15rem',
                        fontWeight: '750',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        lineHeight: '1.4',
                        color: 'var(--color-primary)'
                    }}>
                        {property.title}
                    </h3>
                </Link>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>📍</span> {property.location}
                </p>

                <div style={{
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        {property.specs}
                    </div>
                </div>
            </div>
        </div>
    );
};
