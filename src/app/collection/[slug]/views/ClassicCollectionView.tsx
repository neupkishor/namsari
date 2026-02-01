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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
            {properties.map(({ property }) => {
                const specs = property.features
                    ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath • ${property.features.builtUpArea || 0} ${property.features.builtUpAreaUnit || ''}`
                    : '';

                return (
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
                            transition: 'all 0.3s ease',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            background: 'white'
                        }} onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                        }} onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div style={{ height: '220px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                                {property.images[0] ? (
                                    <img src={property.images[0].url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>No Image</div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    backdropFilter: 'blur(8px)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em'
                                }}>
                                    {property.types && property.types.length > 0 ? property.types[0].name : 'Property'}
                                </div>
                            </div>

                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px', lineHeight: '1.3' }}>
                                    {property.title}
                                </h3>
                                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>📍</span> {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                                </div>

                                {specs && (
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', fontWeight: '600', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                                        {specs}
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: 'var(--color-gold)', fontWeight: '800', fontSize: '1.3rem' }}>
                                        {property.pricing ? formatPrice(property.pricing.price) : 'N/A'}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Details</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
