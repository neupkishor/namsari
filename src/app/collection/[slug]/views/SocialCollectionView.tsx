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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '680px', margin: '0 auto' }}>
            {properties.map(({ property }) => (
                <CollectionFeedItem key={property.id} property={property} collectionUser={user} />
            ))}
        </div>
    );
}

function CollectionFeedItem({ property, collectionUser }: { property: any, collectionUser: any }) {
    const propertyUrl = `/property/${property.slug || property.id}`;
    const images = property.images || [];

    return (
        <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', background: 'white' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f8fafc' }}>
                <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold' }}>
                        {collectionUser.profile_picture ? (
                            <img src={collectionUser.profile_picture} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                            (collectionUser.name || 'U')[0]
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}>Recommended</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            via {collectionUser.name}'s Collection
                        </div>
                    </div>
                </Link>
            </div>

            {/* Content */}
            <div style={{ position: 'relative', background: '#000', minHeight: '300px' }}>
                <Link href={propertyUrl} style={{ display: 'block', width: '100%', height: '100%' }}>
                    {images[0] ? (
                        <img src={images[0].url} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '600px', objectFit: 'contain', margin: '0 auto' }} />
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>No Image</div>
                    )}
                </Link>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                        {property.pricing ?
                            new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(property.pricing.price).replace('NPR', 'NRs.')
                            : 'Price on Request'}
                    </div>
                </div>

                <Link href={propertyUrl} style={{ textDecoration: 'none', color: '#1e293b' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{property.title}</h3>
                </Link>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                </p>

                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <Link href={propertyUrl} style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f1f5f9', color: '#1e293b', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}>
                        View Details
                    </Link>
                    <button style={{ flex: 1, padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                        Contact Agent
                    </button>
                </div>
            </div>
        </div>
    );
}
