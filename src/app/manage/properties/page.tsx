import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function ManagePropertiesPage() {
    // Fetch properties and join with relations for full details
    const properties = await prisma.property.findMany({
        include: {
            listedBy: true,
            pricing: true,
            location: true,
            images: true,
            types: true
        },
        orderBy: { created_on: 'desc' }
    });

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
            // Images overwrites the relation with a simple array of URLs for the UI
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

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Details</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price & Location</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listed By</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listed On</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrichedProperties.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No properties found in the registry.
                                </td>
                            </tr>
                        ) : (
                            enrichedProperties.map((p: any) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '60px', height: '40px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                {p.images && p.images[0] ? (
                                                    <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🏠</div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: #{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{p.price}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.location}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', overflow: 'hidden' }}>
                                                {typeof p.author_avatar === 'string' && p.author_avatar.startsWith('http') ? (
                                                    <img src={p.author_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.author_name} />
                                                ) : (
                                                    p.author_avatar
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.9rem' }}>{p.author_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500', color: '#475569' }}>
                                            {p.main_category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>
                                        {p.created_on ? new Date(p.created_on).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <Link href={`/@${p.author_username}`} style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: '500', marginRight: '16px', textDecoration: 'none' }}>
                                            View
                                        </Link>
                                        <Link href={`/manage/properties/${p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`} style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: '700', marginRight: '16px', textDecoration: 'none' }}>
                                            Manage
                                        </Link>
                                        <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
