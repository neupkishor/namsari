import React from 'react';
import { initMapper } from '@/mapper';
import Link from 'next/link';

export default async function ManageUsersPage() {
    const mapper = initMapper();

    // Fetch all users
    const users = await mapper.use('users').get();

    return (
        <div>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>User Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Directory of all registered agents, agencies, and owners.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                        Export CSV
                    </button>
                    <button style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                        Invite User
                    </button>
                </div>
            </header>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Identity</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Type</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No users found in the registry.
                                </td>
                            </tr>
                        ) : (
                            users.map((u: any) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {(u.name || 'U')[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{u.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ color: '#475569' }}>{u.contact_number || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            background: u.account_type === 'agency' ? '#fef3c7' : '#ecfdf5',
                                            color: u.account_type === 'agency' ? '#d97706' : '#059669',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            textTransform: 'capitalize'
                                        }}>
                                            {u.account_type || 'User'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                            Active
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <Link href={`/@${u.username}`} style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: '500', marginRight: '16px', textDecoration: 'none' }}>
                                            Profile
                                        </Link>
                                        <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
