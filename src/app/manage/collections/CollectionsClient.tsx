'use client';

import React, { useState } from 'react';
import { createCollection, deleteCollection } from './actions';
import { useRouter } from 'next/navigation';

export function CollectionsClient({ initialCollections, userId }: { initialCollections: any[], userId: number }) {
    const [isCreating, setIsCreating] = useState(false);
    const [collectionType, setCollectionType] = useState('user_generated');
    const [rules, setRules] = useState({
        category: '',
        nature: '',
        purpose: '',
        minPrice: '',
        maxPrice: '',
        priceUnit: 'total'
    });
    const router = useRouter();

    return (
        <div className="layout-container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>My Collections</h1>
                    <p style={{ color: '#64748b' }}>Curate and organize your favorite properties.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> Create Collection
                </button>
            </div>

            {/* Create Modal overlay */}
            {isCreating && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '24px' }}>New Collection</h2>
                        <form action={async (formData) => {
                            await createCollection(formData);
                            setIsCreating(false);
                            router.refresh();
                        }}>
                            <input type="hidden" name="user_id" value={userId} />
                            <input type="hidden" name="type" value={collectionType} />
                            <input type="hidden" name="moreInfo" value={JSON.stringify(rules)} />

                            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setCollectionType('user_generated')}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        background: collectionType === 'user_generated' ? 'white' : 'transparent',
                                        color: collectionType === 'user_generated' ? '#3b82f6' : '#64748b',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: collectionType === 'user_generated' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Manual
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCollectionType('system_generated')}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        background: collectionType === 'system_generated' ? 'white' : 'transparent',
                                        color: collectionType === 'system_generated' ? '#3b82f6' : '#64748b',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: collectionType === 'system_generated' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Smart Rules
                                </button>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder={collectionType === 'system_generated' ? "e.g. Budget Homes in Kathmandu" : "e.g. Dream Homes, Summer Rentals"}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Description (Optional)</label>
                                <textarea
                                    name="description"
                                    placeholder="What is this collection about?"
                                    rows={3}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
                                />
                            </div>

                            {collectionType === 'system_generated' && (
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Auto-Add Properties Matching:</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <select
                                            value={rules.category} onChange={e => setRules({ ...rules, category: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}>
                                            <option value="">Any Category</option>
                                            <option value="House">House</option>
                                            <option value="Land">Land</option>
                                            <option value="Apartment">Apartment</option>
                                        </select>
                                        <select
                                            value={rules.nature} onChange={e => setRules({ ...rules, nature: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}>
                                            <option value="">Any Nature</option>
                                            <option value="residential">Residential</option>
                                            <option value="commercial">Commercial</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <select
                                            value={rules.purpose} onChange={e => setRules({ ...rules, purpose: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}>
                                            <option value="">Any Purpose</option>
                                            <option value="sale">For Sale</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Price Range</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            <input
                                                type="number" placeholder="Min"
                                                value={rules.minPrice} onChange={e => setRules({ ...rules, minPrice: e.target.value })}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                                            />
                                            <input
                                                type="number" placeholder="Max"
                                                value={rules.maxPrice} onChange={e => setRules({ ...rules, maxPrice: e.target.value })}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                                            />
                                            <select
                                                value={rules.priceUnit} onChange={e => setRules({ ...rules, priceUnit: e.target.value })}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}>
                                                <option value="total">Total Price</option>
                                                <option value="per_aana">Per Aana</option>
                                                <option value="per_sqft">Per SqFt</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" name="is_public" id="is_public" defaultChecked />
                                <label htmlFor="is_public" style={{ color: '#475569' }}>Publicly visible</label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', padding: '12px 20px' }}>Cancel</button>
                                <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Grid List */}
            {initialCollections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No collections yet.</p>
                    <p>Start saving properties to organize your research.</p>
                </div>
            ) : (
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
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{col.name}</h3>
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
                                <button
                                    onClick={() => alert("View Collection functionality coming soon!")}
                                    style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    View Items
                                </button>
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
            )}
        </div>
    );
}
