'use client';

import React, { useState } from 'react';
import JobFormClient from '../JobFormClient';
import { updateApplicationStatus } from '../actions';

export default function JobDetailClient({ job }: { job: any }) {
    const [activeTab, setActiveTab] = useState<'edit' | 'applicants'>('applicants');
    const [applications, setApplications] = useState(job.applications);
    const [expandedApp, setExpandedApp] = useState<number | null>(null);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await updateApplicationStatus(id, newStatus);
            setApplications(applications.map((app: any) =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const toggleAppExpand = (id: number) => {
        setExpandedApp(expandedApp === id ? null : id);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '32px' }}>
                <button
                    onClick={() => setActiveTab('applicants')}
                    style={{
                        padding: '12px 4px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'applicants' ? '2px solid var(--color-gold)' : '2px solid transparent',
                        color: activeTab === 'applicants' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Applicants ({applications.length})
                </button>
                <button
                    onClick={() => setActiveTab('edit')}
                    style={{
                        padding: '12px 4px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'edit' ? '2px solid var(--color-gold)' : '2px solid transparent',
                        color: activeTab === 'edit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Edit Job Details & Form Steps
                </button>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'edit' ? (
                    <JobFormClient initialData={job} isEdit={true} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {applications.length === 0 ? (
                            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No applications received yet for this position.
                            </div>
                        ) : (
                            applications.map((app: any) => {
                                const moreInfo = JSON.parse(app.answers || '[]');
                                return (
                                    <div key={app.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                                <div
                                                    onClick={() => toggleAppExpand(app.id)}
                                                    style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', color: 'var(--color-gold)', cursor: 'pointer' }}
                                                >
                                                    {app.full_name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px', cursor: 'pointer' }} onClick={() => toggleAppExpand(app.id)}>
                                                        {app.full_name} {expandedApp === app.id ? '↑' : '↓'}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                        <span>📧 {app.email}</span>
                                                        <span>📱 {app.phone}</span>
                                                        <span>📅 {new Date(app.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                {app.resume_url && (
                                                    <a
                                                        href={app.resume_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px', border: '1px solid var(--color-border)',
                                                            color: 'var(--color-primary)', textDecoration: 'none',
                                                            fontSize: '0.9rem', fontWeight: '600', background: 'white'
                                                        }}
                                                    >
                                                        📄 View Resume
                                                    </a>
                                                )}

                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                                    style={{
                                                        padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                                                        background: 'white', fontSize: '0.9rem', fontWeight: '600'
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewed">Reviewed</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="hired">Hired</option>
                                                </select>
                                            </div>
                                        </div>

                                        {expandedApp === app.id && (
                                            <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', background: '#f8fafc' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '16px', textTransform: 'uppercase' }}>More Information</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                                    {moreInfo.length > 0 ? moreInfo.map((info: any, idx: number) => {
                                                        const question = Object.keys(info)[0];
                                                        const answer = info[question];
                                                        return (
                                                            <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{question}</div>
                                                                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-primary)', whiteSpace: 'pre-wrap' }}>{answer || 'No answer provided'}</div>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No additional information submitted.</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
