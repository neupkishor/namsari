'use client';

import React, { useState } from 'react';
import { toggleFeatured } from './actions';
import { useRouter } from 'next/navigation';

export default function FeaturedManagementClient({ properties }: { properties: any[] }) {
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

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Property</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            {p.images && p.images[0] && <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.location}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {p.is_featured ? (
                                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                                            Featured
                                        </span>
                                    ) : (
                                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                                            Standard
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <button
                                        onClick={() => handleToggle(p.id)}
                                        disabled={loadingId === p.id}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: p.is_featured ? '#fee2e2' : 'var(--color-primary)',
                                            color: p.is_featured ? '#ef4444' : 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            opacity: loadingId === p.id ? 0.5 : 1
                                        }}
                                    >
                                        {loadingId === p.id ? 'Updating...' : p.is_featured ? 'Remove Featured' : 'Mark as Featured'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
