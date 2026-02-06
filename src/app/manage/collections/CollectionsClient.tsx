'use client';

import React, { useState } from 'react';
import { createCollection, deleteCollection } from './actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { PaginationControl } from '@/components/ui';

export function CollectionsClient({ initialCollections, userId, totalPages }: { initialCollections: any[], userId: number, totalPages: number }) {
    const [isCreating, setIsCreating] = useState(false);
    // ... rest of state code ...

    return (
        <div className="layout-container" style={{ padding: '40px 0' }}>
            {/* ... rest of JSX ... */}

            {/* Grid List */}
            {initialCollections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No collections yet.</p>
                    <p>Start saving properties to organize your research.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {initialCollections.map(col => (
                            <div key={col.id} className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* Preview Grid */}
                                <div style={{ height: '200px', background: '#f1f5f9', display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center', justifyContent: 'center' }}>
                                    {col.properties.length > 0 ? (
                                        <img src={col.properties[0].images[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3rem', textAlign: 'center', color: '#cbd5e1' }}>🏠</span>
                                    )}
                                </div>

                                <div style={{ padding: '24px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>{col.name}</h3>
                                        <span style={{ fontSize: '0.75rem', background: col.is_public ? '#dcfce7' : '#f1f5f9', color: col.is_public ? '#166534' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                                            {col.is_public ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                                        {col.description || 'No description provided.'}
                                    </p>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                                        {col.properties.length} Properties
                                    </div>
                                </div>

                                <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Link
                                        href={`/manage/collections/${col.slug}`}
                                        style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
                                    >
                                        View Items
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this collection?')) {
                                                await deleteCollection(col.id);
                                            }
                                        }}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <PaginationControl totalPages={totalPages} />
                </>
            )}
        </div>
    );
}
