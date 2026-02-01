import React from 'react';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { removePropertyFromCollectionWithSlug } from '../actions';

export default async function CollectionManagePage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const session = await getSession();
    if (!session) redirect('/login');
    const userId = parseInt(session.id);

    const collection = await prisma.collection.findFirst({
        where: {
            slug: slug,
            user_id: userId
        },
        include: {
            properties: {
                include: {
                    property: {
                        include: {
                            location: true,
                            pricing: true,
                            images: {
                                take: 1,
                                orderBy: { id: 'asc' }
                            },
                            types: true,
                            listedBy: true
                        }
                    }
                },
                orderBy: { added_at: 'desc' }
            }
        }
    });

    if (!collection) {
        notFound();
    }

    // Helper to format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(price).replace('NPR', 'NRs.');
    };

    return (
        <div className="layout-container" style={{ padding: '40px 0' }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Link href="/manage/collections" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                        ← Back to Collections
                    </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                            {collection.name}
                        </h1>
                        {collection.description && (
                            <p style={{ color: '#64748b', maxWidth: '600px', lineHeight: '1.6' }}>
                                {collection.description}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                            <span style={{
                                background: collection.is_public ? '#dcfce7' : '#f1f5f9',
                                color: collection.is_public ? '#166534' : '#64748b',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}>
                                {collection.is_public ? 'Public Collection' : 'Private Collection'}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                {collection.properties.length} Properties
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link
                            href={`/collection/${collection.slug}`}
                            target="_blank"
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                fontWeight: '600',
                                textDecoration: 'none',
                                background: 'white'
                            }}
                        >
                            View as Visitor
                        </Link>
                    </div>
                </div>
            </div>

            {/* Properties List */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {collection.properties.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏠</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>This collection is empty.</p>
                        <p>Browse properties and add them to this collection.</p>
                        <Link href="/explore" style={{ display: 'inline-block', marginTop: '16px', color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
                            Explore Properties
                        </Link>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price & Location</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Added On</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collection.properties.map(({ property, added_at }) => (
                                <tr key={property.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                                                {property.images[0] ? (
                                                    <img src={property.images[0].url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>No Image</div>
                                                )}
                                            </div>
                                            <div>
                                                <Link href={`/property/${property.slug || property.id}`} style={{ fontWeight: '600', color: '#1e293b', textDecoration: 'none', display: 'block', fontSize: '1rem' }}>
                                                    {property.title}
                                                </Link>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                                    ID: #{property.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>
                                            {property.pricing ? formatPrice(property.pricing.price) : 'Price on Request'}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                            {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>
                                            {property.types && property.types.length > 0 ? property.types[0].name : 'Property'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>
                                        {new Date(added_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <form action={async () => {
                                            'use server';
                                            await removePropertyFromCollectionWithSlug(collection.id, property.id, slug);
                                        }}>
                                            <button
                                                type="submit"
                                                style={{ color: '#ef4444', background: 'transparent', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Remove
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
