import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { PaginationControl } from '@/components/ui';

export default async function ManagePropertiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [properties, totalCount] = await Promise.all([
        prisma.property.findMany({
            include: {
                listedBy: true,
                pricing: true,
                location: true,
                images: true,
                types: true
            },
            orderBy: { created_on: 'desc' },
            skip,
            take: limit
        }),
        prisma.property.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const enrichedProperties = properties.map((p) => {
        const priceValue = p.pricing?.price || 0;
        const formattedPrice = new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(Number(priceValue)).replace('NPR', 'NRs.');

        const locationStr = p.location
            ? `${p.location.area}, ${p.location.district}`
            : 'Unspecified';

        const mainCategory = p.types && p.types.length > 0
            ? p.types[0].name.charAt(0).toUpperCase() + p.types[0].name.slice(1)
            : 'Other';

        return {
            ...p,
            price: formattedPrice,
            location: locationStr,
            author_name: p.listedBy?.name || 'Unknown',
            author_username: p.listedBy?.username || '',
            author_avatar: p.listedBy?.profile_picture || (p.listedBy?.name || 'U')[0],
            main_category: mainCategory,
            images: p.images.map(img => img.url),
        };
    });

    return (
        <div>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Property Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Overview of all listed assets across the network.</p>
                </div>
                <Link href="/sell" style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}>
                    + Add New Asset
                </Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {enrichedProperties.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        No properties found in the registry.
                    </div>
                ) : (
                    enrichedProperties.map((p) => (
                        <div key={p.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '200px', width: '100%', background: '#f1f5f9', position: 'relative' }}>
                                {p.images && p.images[0] ? (
                                    <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.title} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#cbd5e1' }}>🏠</div>
                                )}
                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                    {p.main_category}
                                </div>
                                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }}>
                                    {p.price}
                                </div>
                            </div>

                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '4px', lineHeight: '1.4' }}>{p.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>📍 {p.location}</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', overflow: 'hidden' }}>
                                        {typeof p.author_avatar === 'string' && p.author_avatar.startsWith('http') ? (
                                            <img src={p.author_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.author_name} />
                                        ) : (
                                            p.author_avatar
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                                        {p.author_name}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Listed {new Date(p.created_on).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Link href={`/properties/${p.slug || p.id}`} style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                                        View
                                    </Link>
                                    <Link href={`/manage/properties/${p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`} style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                                        Manage
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
