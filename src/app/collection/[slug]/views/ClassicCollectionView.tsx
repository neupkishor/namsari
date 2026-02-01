'use client';

import React from 'react';
import Link from 'next/link';

export function ClassicCollectionView({ properties }: { properties: any[] }) {
    // Helper to format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(price).replace('NPR', 'NRs.');
    };

    if (properties.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No properties in this collection yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {properties.map(({ property }) => (
                <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                    <div className="card" style={{
                        padding: '0',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ height: '220px', background: '#f1f5f9', position: 'relative' }}>
                            {property.images[0] ? (
                                <img src={property.images[0].url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>No Image</div>
                            )}
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                backdropFilter: 'blur(4px)'
                            }}>
                                {property.types && property.types.length > 0 ? property.types[0].name : 'Property'}
                            </div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', lineHeight: '1.4' }}>
                                {property.title}
                            </h3>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                                {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.1rem' }}>
                                    {property.pricing ? formatPrice(property.pricing.price) : 'N/A'}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>View Details →</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
