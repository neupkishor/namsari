import React from 'react';
import Link from 'next/link';
import { AutoScrollCarousel } from '@/components/ui';

interface FeaturedProjectsProps {
    properties?: any[];
    className?: string;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ properties = [], className }) => {
    // In many parts of the app, we already have a list of properties that might include featured ones
    const displayProjects = properties.filter(p => p.isFeatured);

    if (displayProjects.length === 0) {
        return (
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>
                        Featured Projects
                    </h2>
                </div>
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
                    <p>No featured projects have been assigned yet.</p>
                    <Link href="/manage/featured" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginTop: '8px', display: 'inline-block' }}>Manage Featured List</Link>
                </div>
            </section>
        );
    }

    return (
        <section className={className}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>
                    Featured Projects
                </h2>
                <div style={{ color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1.5rem' }}>➡️</span>
                </div>
            </div>

            <AutoScrollCarousel itemWidth="280px" gap="24px">
                {displayProjects.map((p) => {
                    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const propertyUrl = `/properties/${slug}-${p.id}`;

                    // Handle price formatting if not already string (from API)
                    const displayPrice = typeof p.price === 'string' ? p.price :
                        p.pricing ? new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(p.pricing.price).replace('NPR', 'NRs.') :
                            'Price on Request';

                    // Handle location formatting
                    const displayLocation = typeof p.location === 'string' ? p.location :
                        p.location ? `${p.location.area}, ${p.location.district}` :
                            'Location Unspecified';

                    return (
                        <Link key={p.id} href={propertyUrl} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                            <div
                                className="card"
                                style={{
                                    padding: '0',
                                    overflow: 'hidden',
                                    borderRadius: 'var(--radius-card)',
                                    border: '1px solid var(--color-border)',
                                    background: 'white',
                                    height: '100%',
                                }}
                            >
                                <div style={{ position: 'relative', height: '220px' }}>
                                    <img
                                        src={p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                                        alt={p.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        left: '12px',
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        padding: '6px 12px',
                                        borderRadius: 'var(--radius-inner)',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        border: '1px solid #bae6fd'
                                    }}>
                                        {displayPrice}
                                    </div>
                                </div>

                                <div style={{ padding: '20px' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {p.property_types?.[0] || 'Property'}
                                    </p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '8px', lineHeight: '1.3' }}>
                                        {p.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '0.9rem' }}>📍</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>{displayLocation}</span>
                                    </div>

                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#f8fafc',
                                        padding: '4px 12px',
                                        borderRadius: 'calc(var(--radius-inner) - 2px)',
                                        fontSize: '0.85rem',
                                        color: '#475569',
                                        fontWeight: '600',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {p.property_types?.[0] || 'Premium Listing'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </AutoScrollCarousel>
        </section>
    );
};
