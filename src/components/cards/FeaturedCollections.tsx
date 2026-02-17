import Link from 'next/link';

export function FeaturedCollectionsSection({ collections }: { collections: any[] }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section>
            <div className="layout-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-light)' }}>
                        Curated Collections
                    </h2>
                    <Link href="/manage/collections" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                        Create Yours →
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {collections.map(col => (
                        <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', background: 'white' }}>
                                <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                                    {col.properties[0]?.property?.images[0]?.url ? (
                                        <img
                                            src={col.properties[0].property.images[0].url}
                                            alt={col.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '2rem' }}>
                                            📁
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-inner)'
                                        , fontSize: '0.75rem', fontWeight: '600'
                                    }}>
                                        {/* Ideally we count properties or passed specific counts, for now assuming at least 1 if image exists */}
                                        Collection
                                    </div>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{col.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em' }}>
                                        {col.description || 'No description.'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { AutoScrollCarousel } from '@/components/ui';

export function FeaturedCollectionsFeedItem({ collections, className }: { collections: any[], className?: string }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section className={className} style={{ marginBottom: '0px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '16px' }}>
                Recommended Collections
            </h2>
            <AutoScrollCarousel 
                itemWidth="280px" 
                gap="12px"
                desktopItemCount={3}
                tabletItemCount={2}
                mobileItemCount={1.2}
            >
                {collections.map(col => {
                    // Handle image URL extraction safely
                    const imageUrl = col.properties?.[0]?.property?.images?.[0]?.url || col.properties?.[0]?.property?.images?.[0];
                    const hasImage = !!imageUrl;

                    return (
                        <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            style={{ textDecoration: 'none', height: '100%', display: 'block' }}
                        >
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
                                {hasImage ? (
                                    <img
                                        src={imageUrl}
                                        alt={col.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                ) : (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        height: '100%', 
                                        color: '#94a3b8', 
                                        fontSize: '2rem',
                                        background: 'linear-gradient(45deg, #f1f5f9 25%, #e2e8f0 25%, #e2e8f0 50%, #f1f5f9 50%, #f1f5f9 75%, #e2e8f0 75%, #e2e8f0 100%)',
                                        backgroundSize: '20px 20px'
                                    }}>
                                        📁
                                    </div>
                                )}
                                
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
                                        {col.name}
                                    </div>
                                    <div style={{ 
                                        color: 'rgba(255,255,255,0.9)', 
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}>
                                        Curated Selection
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </AutoScrollCarousel>
        </section>
    );
}
