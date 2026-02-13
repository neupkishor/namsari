'use client';

import React, { useState } from 'react';
import { toggleFeatured } from './actions';
import { useRouter } from 'next/navigation';

import { PaginationControl } from '@/components/ui';

export default function FeaturedManagementClient({ properties, totalPages }: { properties: any[], totalPages: number }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleToggle = async (id: number) => {
        setLoadingId(id);
        try {
            await toggleFeatured(id);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Failed to update featured status');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Featured Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Select properties to highlight on the homepage "Featured Projects" section.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {properties.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        No properties found.
                    </div>
                ) : (
                    properties.map((p) => (
                        <div key={p.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '180px', background: '#f1f5f9', position: 'relative' }}>
                                {p.images && p.images[0] ? (
                                    <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.title} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏠</div>
                                )}
                                {p.isFeatured && (
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(5, 150, 105, 0.9)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        ★ FEATURED
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '4px', lineHeight: '1.4' }}>{p.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>📍 {p.location}</p>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>#{p.id}</span>
                                    <span style={{ fontWeight: '500', color: p.isFeatured ? '#059669' : '#64748b' }}>
                                        {p.isFeatured ? 'Active on Home' : 'Standard Listing'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                <button
                                    onClick={() => handleToggle(p.id)}
                                    disabled={loadingId === p.id}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: p.isFeatured ? 'white' : 'var(--color-primary)',
                                        color: p.isFeatured ? '#ef4444' : 'white',
                                        border: p.isFeatured ? '1px solid #fecaca' : 'none',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        opacity: loadingId === p.id ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {loadingId === p.id ? 'Updating...' : p.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
