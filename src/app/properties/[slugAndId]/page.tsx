import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PropertyMap from './PropertyMap';

export default async function PropertyDetailPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    // Extract ID from slug-id format
    const parts = slugAndId.split('-');
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) return notFound();

    // Fetch property and settings
    const [property, settings] = await Promise.all([
        prisma.property.findUnique({
            where: { id },
            include: {
                listedBy: true,
                pricing: true,
                location: true,
                images: true,
                types: true,
                features: true,
                comments: {
                    include: { user: true },
                    orderBy: { created_at: 'desc' }
                },
                property_likes: true
            }
        }),
        (prisma as any).systemSettings.findFirst()
    ]);

    if (!property) return notFound();

    // Increment view count asynchronously
    await (prisma as any).property.update({
        where: { id: property.id },
        data: { views: { increment: 1 } }
    });

    const session = await getSession();
    const images = property.images.map(img => img.url);
    const locationStr = property.location
        ? `${property.location.area}, ${property.location.district}`
        : 'Unspecified';
    const priceValue = property.pricing?.price || 0;
    const isLiked = session && property.property_likes.some(l => l.user_id === Number(session.id));

    const specs = property.features
        ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath • ${property.features.builtUpArea || 0} ${property.features.builtUpAreaUnit || ''}`
        : 'Details unspecified';

    const mainCategory = property.types && property.types.length > 0
        ? property.types[0].name.charAt(0).toUpperCase() + property.types[0].name.slice(1)
        : 'Property';

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <header className="full-width-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container header-content">
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: '32px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
                        <Link href="/">Browse</Link>
                        <Link href="/sell" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                            Sell Property
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="layout-container" style={{ paddingTop: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>

                    {/* Left Column: Media & Description */}
                    <div>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', marginBottom: '24px' }}>
                            {images.length > 0 ? (
                                <img src={images[0]} style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }} alt={property.title} />
                            ) : (
                                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No Image</div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
                                {images.slice(1).map((img: string, idx: number) => (
                                    <img key={idx} src={img} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                ))}
                            </div>
                        )}

                        <div className="card" style={{ padding: '32px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', color: '#1e293b' }}>{property.title}</h1>
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Price</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                                        {new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(priceValue).replace('NPR', 'NRs.')}
                                    </div>
                                </div>
                                <div style={{ width: '1px', background: '#e2e8f0' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Location</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{locationStr}</div>
                                </div>
                            </div>

                            <h3 style={{ marginBottom: '12px', fontWeight: '700' }}>Specifications</h3>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap' }}>{specs}</p>

                            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                                <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Property Category</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ padding: '6px 16px', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.9rem' }}>{mainCategory}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Agent & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {(property.listedBy as any)?.profile_picture ? (
                                        <img src={(property.listedBy as any).profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name} />
                                    ) : (
                                        (property.listedBy?.name || 'A')[0]
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Listed By</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{property.listedBy?.name || 'Unknown'}</div>
                                    <Link href={`/@${property.listedBy?.username}`} style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>View Profile</Link>
                                </div>
                            </div>

                            {settings?.show_contact_agent !== false && (
                                <button style={{ width: '100%', padding: '14px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"></path></svg>
                                    Contact Agent
                                </button>
                            )}
                            {settings?.show_make_offer !== false && (
                                <button style={{ width: '100%', padding: '14px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
                                    Make Offer
                                </button>
                            )}
                            <button style={{ width: '100%', padding: '14px', background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Schedule Viewing
                            </button>
                        </div>

                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontWeight: '700' }}>{property.property_likes.length} Likes</span>
                                <span style={{ fontWeight: '700' }}>{property.comments.length} Comments</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {settings?.show_like_button !== false && (
                                    <button style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: isLiked ? '#fee2e2' : 'white', color: isLiked ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
                                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                                    </button>
                                )}
                                {settings?.show_share_button !== false && (
                                    <button style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                                        🔗 Share
                                    </button>
                                )}
                            </div>
                        </div>

                        {(property.location?.latitude && property.location?.longitude) && (
                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '24px 24px 12px' }}>
                                    <h4 style={{ marginBottom: '4px', fontWeight: '700' }}>Location</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>{locationStr}</p>
                                </div>

                                <PropertyMap
                                    property={{
                                        id: property.id,
                                        title: property.title,
                                        price: priceValue,
                                        latitude: property.location.latitude,
                                        longitude: property.location.longitude,
                                        location: locationStr
                                    }}
                                    images={images}
                                />

                                <div style={{ padding: '16px 24px 24px' }}>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${property.location.latitude},${property.location.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            width: '100%',
                                            padding: '12px',
                                            background: '#f1f5f9',
                                            color: '#0f172a',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            border: '1px solid #e2e8f0',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <span>📍</span> Open in Google Maps
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
