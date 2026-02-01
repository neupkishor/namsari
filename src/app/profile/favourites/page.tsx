import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SiteHeader } from '@/components/SiteHeader';

export default async function FavouritesPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(session.id) }
    });

    if (!user) {
        redirect('/login');
    }

    // Fetch liked properties
    const likes = await prisma.like.findMany({
        where: { user_id: user.id },
        include: {
            property: {
                include: {
                    images: true,
                    types: true,
                    location: true,
                    pricing: true,
                    features: true,
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });

    const properties = likes.map(like => {
        const p = like.property;
        // Transform to match shape used in views if necessary, or just use direct fields
        // We'll mimic the shape used in HomeClient mostly
        return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.pricing?.price ? `Rs. ${p.pricing.price.toLocaleString()}` : 'Price on Request',
            location: p.location ? `${p.location.area}, ${p.location.cityVillage}` : 'Location n/a',
            images: p.images.map(img => img.url),
            specs: `${p.features?.bedrooms || 0} Beds • ${p.features?.bathrooms || 0} Baths`
        };
    });

    return (
        <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <SiteHeader user={user} />

            <div className="layout-container" style={{ padding: '60px 0 100px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
                        Your Favourites
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        You have saved {properties.length} properties.
                    </p>
                </div>

                {properties.length === 0 ? (
                    <div style={{ padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#64748b' }}>No favourites yet.</h3>
                        <Link href="/explore" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                            Browse properties to add some →
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {properties.map(p => {
                            const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            const pUrl = `/properties/${slug}-${p.id}`;
                            return (
                                <div key={p.id} className="card" style={{ padding: '0', overflow: 'hidden', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                    <Link href={pUrl} style={{ display: 'block', height: '240px', overflow: 'hidden' }}>
                                        <img
                                            src={p.images?.[0] || 'https://via.placeholder.com/400x240'}
                                            alt={p.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        />
                                    </Link>
                                    <div style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '1.25rem' }}>{p.price}</div>
                                            {/* Could add a remove button here later */}
                                        </div>

                                        <Link href={pUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 style={{ marginBottom: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.4' }}>{p.title}</h3>
                                        </Link>

                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{p.location}</p>

                                        <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
                                            {p.specs}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
