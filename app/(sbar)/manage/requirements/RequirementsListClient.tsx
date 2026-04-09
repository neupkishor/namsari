"use client";

import { useState } from 'react';
import { FormGrid, FormCard } from '@/components/form';
import { PaginationControl } from '@/components/ui';

interface Requirement {
    id: number;
    mode: string;
    content: string | null;
    propertyTypes: string | null;
    purposes: string | null;
    natures: string | null;
    facings: string | null;
    district: string | null;
    cityVillage: string | null;
    area: string | null;
    roadAccess: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    pricingUnit: string | null;
    remarks: string | null;
    is_public: boolean;
    userId: number; // Added userId
    created_at: string;
    user: {
        name: string;
        username: string;
    } | null;
    updated_at: string;
}

export default function RequirementsListClient({ 
    requirements, 
    totalPages,
    title = "User Requirements",
    description = "Manage and view property demands submitted by users across the platform.",
    currentUserId
}: { 
    requirements: Requirement[], 
    totalPages: number,
    title?: string,
    description?: string,
    currentUserId?: number
}) {
    const [filter, setFilter] = useState<'all' | 'my' | 'private'>('all');

    // Check availability
    const hasMyRequirements = currentUserId && requirements.some(req => req.userId === currentUserId);
    const hasPrivateRequirements = requirements.some(req => !req.is_public);

    // Apply Filter
    const filteredRequirements = requirements.filter(req => {
        if (filter === 'my') return req.userId === currentUserId;
        if (filter === 'private') return !req.is_public;
        return true;
    });

    return (
        <div style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>{title}</h1>
                <p style={{ color: '#64748b' }}>{description}</p>
            </header>

            {/* Filter Tabs */}
            {(hasMyRequirements || hasPrivateRequirements) && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <button 
                        onClick={() => setFilter('all')}
                        style={{ 
                            padding: '8px 16px', 
                            borderRadius: '20px', 
                            border: 'none', 
                            background: filter === 'all' ? 'var(--color-primary)' : '#f1f5f9', 
                            color: filter === 'all' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        All
                    </button>
                    
                    {hasMyRequirements && (
                        <button 
                            onClick={() => setFilter('my')}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '20px', 
                                border: 'none', 
                                background: filter === 'my' ? 'var(--color-primary)' : '#f1f5f9', 
                                color: filter === 'my' ? 'white' : '#64748b',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            My Requirements
                        </button>
                    )}
                    
                    {hasPrivateRequirements && (
                        <button 
                            onClick={() => setFilter('private')}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '20px', 
                                border: 'none', 
                                background: filter === 'private' ? 'var(--color-primary)' : '#f1f5f9', 
                                color: filter === 'private' ? 'white' : '#64748b',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Private
                        </button>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {filteredRequirements.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                        <p style={{ color: '#64748b' }}>No requirements found.</p>
                    </div>
                ) : (
                    filteredRequirements.map((req) => (
                        <FormCard key={req.id} padding="24px" background="white" border="1px solid #e2e8f0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            {/* ... same card content ... */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', background: req.mode === 'simple' ? '#f1f5f9' : '#f0f9ff', color: req.mode === 'simple' ? '#475569' : '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                                            {req.mode} mode
                                        </span>
                                        {!req.is_public && (
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', background: '#fef2f2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                🔒 Private
                                            </span>
                                        )}
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            Posted on {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>
                                        {req.user ? req.user.name : 'Unsigned User'}
                                        {req.user && <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.9rem', marginLeft: '8px' }}>@{req.user.username}</span>}
                                    </h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View Details</button>
                                </div>
                            </div>

                            {req.mode === 'simple' ? (
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{req.content}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <FormGrid cols={4} gap="16px">
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Type</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary-light)' }}>{req.propertyTypes || 'Any'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Purpose</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary-light)' }}>{req.purposes || 'Any'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Nature</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary-light)' }}>{req.natures || 'Any'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Budget</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                                                {req.minPrice && req.maxPrice ? `NRs. ${req.minPrice.toLocaleString()} - ${req.maxPrice.toLocaleString()}` : (req.maxPrice ? `Up to ${req.maxPrice.toLocaleString()}` : (req.minPrice ? `From ${req.minPrice.toLocaleString()}` : 'Negotiable'))}
                                            </div>
                                        </div>
                                    </FormGrid>

                                    <FormGrid cols={2} gap="16px">
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Location</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-primary-light)' }}>
                                                {req.area ? `${req.area}, ` : ''}{req.cityVillage ? `${req.cityVillage}, ` : ''}{req.district || 'Anywhere'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Facing</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-primary-light)' }}>{req.facings || 'Any'}</div>
                                        </div>
                                    </FormGrid>

                                    {req.remarks && (
                                        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Remarks</div>
                                            <div style={{ fontSize: '0.9rem', color: '#475569' }}>{req.remarks}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </FormCard>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
