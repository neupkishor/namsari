'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { deleteJobListing } from './actions';

export default function JobListClient({ initialJobs }: { initialJobs: any[] }) {
    const [jobs, setJobs] = useState(initialJobs);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this job listing? All associated applications will also be deleted.')) return;

        try {
            await deleteJobListing(id);
            setJobs(jobs.filter(j => j.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete job listing');
        }
    };

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>JOB TITLE</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>DEPARTMENT</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>TYPE</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>APPLICANTS</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>STATUS</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No job listings found. Start by posting a new job.
                            </td>
                        </tr>
                    ) : (
                        jobs.map((job) => (
                            <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '16px 24px' }}>
                                    <Link href={`/manage/careers/${job.id}`} style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                        {job.title}
                                    </Link>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {job.location}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{job.department}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: '#f1f5f9',
                                        color: '#475569'
                                    }}>
                                        {job.type}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        fontWeight: '700',
                                        color: job._count.applications > 0 ? 'var(--color-gold)' : 'inherit'
                                    }}>
                                        {job._count.applications}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: job.status === 'open' ? '#dcfce7' : '#fee2e2',
                                        color: job.status === 'open' ? '#166534' : '#991b1b'
                                    }}>
                                        {job.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <a href={`/careers/${job.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>View Public</a>
                                        <Link href={`/manage/careers/${job.id}`} style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Edit</Link>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', padding: '0' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <style jsx>{`
                .table-row-hover:hover {
                    background: #f8fafc;
                }
            `}</style>
        </div>
    );
}
