'use client';

import React, { useEffect, useState } from 'react';
import { FormCard } from '@/components/form';

interface Subscriber {
    id: number;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export default function NewsletterClient() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const res = await fetch('/api/newsletter');
                const data = await res.json();
                setSubscribers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch subscribers', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribers();
    }, []);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading subscribers...</div>;
    }

    return (
        <div style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Newsletter Subscribers</h1>
                <p style={{ color: '#64748b' }}>Manage your email subscription list.</p>
            </header>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontWeight: '600', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email Address</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Subscribed On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>No subscribers yet.</td>
                            </tr>
                        ) : (
                            subscribers.map((sub) => (
                                <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: '500' }}>{sub.email}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            background: sub.isActive ? '#dcfce7' : '#fee2e2',
                                            color: sub.isActive ? '#166534' : '#991b1b',
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                                        }}>
                                            {sub.isActive ? 'Active' : 'Unsubscribed'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>
                Total Subscribers: <strong>{subscribers.length}</strong>
            </div>
        </div>
    );
}
