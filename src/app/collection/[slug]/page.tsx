import React from 'react';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function CollectionPublicPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const session = await getSession();
    const currentUserId = session ? parseInt(session.id) : null;

    const collection = await prisma.collection.findFirst({
        where: { slug: slug },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profile_picture: true
                }
            },
            properties: {
                include: {
                    property: {
                        include: {
                            location: true,
                            pricing: true,
                            images: { take: 1, orderBy: { id: 'asc' } },
                            types: true
                        }
                    }
                },
                orderBy: { added_at: 'desc' }
            }
        }
    });

    if (!collection) return notFound();

    // Access Control: If private, only owner can view
    if (!collection.is_public) {
        if (currentUserId !== collection.user_id) {
            return notFound(); // Or redirect to login if not logged in
        }
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
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header Section */}
            <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '60px 0' }}>
                <div className="layout-container">
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: '#eff6ff',
                            color: '#3b82f6',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Curated Collection
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', marginBottom: '16px', lineHeight: '1.2' }}>
                            {collection.name}
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
                            {collection.description || `A collection of ${collection.properties.length} hand-picked properties.`}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
                                {collection.user.profile_picture ? (
                                    <img src={collection.user.profile_picture} alt={collection.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#94a3b8' }}>
                                        {collection.user.name[0]}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Curated By</div>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{collection.user.name}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <div className="layout-container" style={{ marginTop: '40px' }}>
                {collection.properties.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No properties in this collection yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {collection.properties.map(({ property }) => (
                            <Link
                                key={property.id}
                                href={`/property/${property.slug || property.id}`}
                                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                            >
                                <div className="card" style={{
                                    padding: '0',
                                    overflow: 'hidden',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ height: '220px', background: '#f1f5f9', position: 'relative' }}>
                                        {property.images[0] ? (
                                            <img src={property.images[0].url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>No Image</div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            backdropFilter: 'blur(4px)'
                                        }}>
                                            {property.types && property.types.length > 0 ? property.types[0].name : 'Property'}
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', lineHeight: '1.4' }}>
                                            {property.title}
                                        </h3>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                                            {property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified'}
                                        </div>

                                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.1rem' }}>
                                                {property.pricing ? formatPrice(property.pricing.price) : 'N/A'}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>View Details →</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
