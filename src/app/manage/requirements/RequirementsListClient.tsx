"use client";

import { FormGrid, FormCard } from '@/components/form';
import { PaginationControl } from '@/components/ui';

interface Requirement {
    id: number;
    mode: string;
    content?: string;
    propertyTypes?: string;
    purposes?: string;
    natures?: string;
    facings?: string;
    district?: string;
    cityVillage?: string;
    area?: string;
    roadAccess?: string;
    minPrice?: number;
    maxPrice?: number;
    pricingUnit?: string;
    remarks?: string;
    created_at: string;
    user?: {
        name: string;
        username: string;
    };
    updated_at: string;
}

export default function RequirementsListClient({ requirements, totalPages }: { requirements: Requirement[], totalPages: number }) {

    return (
        <div style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>User Requirements</h1>
                <p style={{ color: '#64748b' }}>Manage and view property demands submitted by users across the platform.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {requirements.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                        <p style={{ color: '#64748b' }}>No requirements posted yet.</p>
                    </div>
                ) : (
                    requirements.map((req) => (
                        <FormCard key={req.id} padding="24px" background="white" border="1px solid #e2e8f0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', background: req.mode === 'simple' ? '#f1f5f9' : '#f0f9ff', color: req.mode === 'simple' ? '#475569' : '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                                            {req.mode} mode
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            Posted on {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
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
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{req.propertyTypes || 'Any'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Purpose</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{req.purposes || 'Any'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Nature</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{req.natures || 'Any'}</div>
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
                                            <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                                                {req.area ? `${req.area}, ` : ''}{req.cityVillage ? `${req.cityVillage}, ` : ''}{req.district || 'Anywhere'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Facing</div>
                                            <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{req.facings || 'Any'}</div>
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
