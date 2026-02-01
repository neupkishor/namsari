import Link from 'next/link';

export function FeaturedCollectionsSection({ collections }: { collections: any[] }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section style={{ padding: '40px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div className="layout-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
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
                            <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', transition: 'transform 0.2s', background: 'white' }}>
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
                                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
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

export function FeaturedCollectionsFeedItem({ collections }: { collections: any[] }) {
    if (!collections || collections.length === 0) return null;

    // Show a horizontal scroll list for feed
    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>Recommended Collections</h3>
            <div style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />
                {collections.map(col => (
                    <Link
                        key={col.id}
                        href={`/collection/${col.slug}`}
                        style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: '240px' }}
                    >
                        <div style={{ borderRadius: '8px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            <div style={{ height: '140px', background: '#f8fafc' }}>
                                {col.properties[0]?.property?.images[0]?.url ? (
                                    <img
                                        src={col.properties[0].property.images[0].url}
                                        alt={col.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '1.5rem' }}>
                                        📁
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Curated Selection</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
