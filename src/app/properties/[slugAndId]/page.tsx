import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function PropertyDetailPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    // Extract ID from slug-id format
    const parts = slugAndId.split('-');
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) return notFound();

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            user: true,
            comments: {
                include: { user: true },
                orderBy: { created_at: 'desc' }
            },
            property_likes: true
        }
    });

    if (!property) return notFound();

    const session = await getSession();
    const images = typeof property.images === 'string' ? JSON.parse(property.images) : (property.images || []);
    const isLiked = session && property.property_likes.some(l => l.user_id === Number(session.id));

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
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(property.price)}
                                    </div>
                                </div>
                                <div style={{ width: '1px', background: '#e2e8f0' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Location</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{property.location}</div>
                                </div>
                            </div>

                            <h3 style={{ marginBottom: '12px', fontWeight: '700' }}>Specifications</h3>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap' }}>{property.specs}</p>

                            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                                <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Property Category</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ padding: '6px 16px', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.9rem' }}>{property.main_category}</span>
                                    {property.commercial_sub_category && (
                                        <span style={{ padding: '6px 16px', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.9rem' }}>{property.commercial_sub_category}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Agent & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {(property.user?.name || property.author || 'A')[0]}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Listed By</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{property.user?.name || property.author}</div>
                                    <Link href={`/@${property.user?.username}`} style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>View Profile</Link>
                                </div>
                            </div>

                            <button style={{ width: '100%', padding: '16px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginBottom: '12px' }}>
                                Contact Agent
                            </button>
                            <button style={{ width: '100%', padding: '16px', background: 'white', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                                Schedule Viewing
                            </button>
                        </div>

                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontWeight: '700' }}>{property.property_likes.length} Likes</span>
                                <span style={{ fontWeight: '700' }}>{property.comments.length} Comments</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: isLiked ? '#fee2e2' : 'white', color: isLiked ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
                                    {isLiked ? '❤️ Liked' : '🤍 Like'}
                                </button>
                                <button style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                                    🔗 Share
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
