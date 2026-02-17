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
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
                    <p>No featured projects have been assigned yet.</p>
                    <Link href="/manage/featured" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginTop: '8px', display: 'inline-block' }}>Manage Featured List</Link>
                </div>
            </section>
        );
    }

    return (
        <section className={className}>
            <AutoScrollCarousel 
                itemWidth="280px" 
                gap="12px"
                desktopItemCount={3}
                tabletItemCount={2}
                mobileItemCount={1.2}
            >
                {displayProjects.map((p) => {
                    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const propertyUrl = `/properties/${slug}-${p.id}`;
                    const imageUrl = p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

                    return (
                        <Link key={p.id} href={propertyUrl} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                            <div style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-inner)',
                                overflow: 'hidden',
                                height: '100%',
                                minHeight: '160px',
                                background: '#f8fafc',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer'
                            }}>
                                <img
                                    src={imageUrl}
                                    alt={p.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                
                                {/* Overlay with Title */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                                    padding: '16px',
                                    paddingTop: '32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end'
                                }}>
                                    <div style={{ 
                                        color: 'white', 
                                        fontWeight: '700', 
                                        fontSize: '1.1rem', 
                                        marginBottom: '4px',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}>
                                        {p.title}
                                    </div>
                                    <div style={{ 
                                        color: 'rgba(255,255,255,0.9)', 
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}>
                                        {p.property_types?.[0] || 'Project'}
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
