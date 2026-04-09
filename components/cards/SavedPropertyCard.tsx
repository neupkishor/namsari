'use client';

import React from 'react';
import Link from 'next/link';

interface SavedPropertyCardProps {
    property: {
        id: number | string;
        title: string;
        slug?: string;
        price: string;
        location: string;
        specs?: string;
        images?: string[];
        likes_count?: number;
        timestamp?: string;
    };
}

export const SavedPropertyCard: React.FC<SavedPropertyCardProps> = ({ property }) => {
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const propertyUrl = `/properties/${slug}-${property.id}`;
    
    // Fallback image logic
    const imageUrl = property.images?.[0] 
        ? (typeof property.images[0] === 'string' ? property.images[0] : (property.images[0] as any).url) 
        : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';

    return (
        <div className="card" style={{ 
            padding: '16px', 
            display: 'flex', 
            gap: '16px',
            alignItems: 'center',
            background: 'white',
            border: '1px solid var(--color-border)',
            borderRadius: '24px'
        }}>
            {/* Image Section */}
            <Link href={propertyUrl} style={{ flexShrink: 0 }}>
                <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    background: '#f1f5f9'
                }}>
                    <img 
                        src={imageUrl} 
                        alt={property.title} 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                </div>
            </Link>

            {/* Content Section */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: '700', 
                            color: 'var(--color-primary)',
                            marginBottom: '4px',
                            lineHeight: '1.3'
                        }}>
                            {property.title}
                        </h3>
                    </Link>
                    {/* Optional: Add remove button or menu here if needed */}
                </div>

                <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#64748b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    marginBottom: '8px'
                }}>
                    <span>📍</span> {property.location}
                </div>

                <div style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '800', 
                    color: 'var(--color-gold)',
                    marginBottom: '8px'
                }}>
                    {property.price}
                </div>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: 'auto',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '8px'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                        {property.specs}
                    </div>
                    {property.timestamp && (
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                            {property.timestamp}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
