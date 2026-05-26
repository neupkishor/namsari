import React from 'react';
import Link from 'next/link';
import { getUsersWithRoles } from '@/actions/permissions';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function PermissionsPage() {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    if (user.type !== 'admin' && !user.role?.role?.toLowerCase().includes('admin')) {
        redirect('/manage');
    }

    const { data: users } = await getUsersWithRoles();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>User Permissions</h1>
                    <p style={{ color: '#64748b' }}>Manage access levels and roles for all users.</p>
                </div>
                <Link href="/manage/permissions/roles" style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>Manage Roles</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                </Link>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>User</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user: any) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '600' }}>
                                                    {user.name?.[0] || user.username[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#334155' }}>{user.name || user.username}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {user.type || 'User'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {user.role ? (
                                        <span style={{
                                            padding: '4px 12px',
                                            background: '#f0f9ff',
                                            color: '#0369a1',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {user.role.role}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No Role</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <Link href={`/manage/permissions/${user.id}`} style={{
                                        color: 'var(--color-primary)',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem'
                                    }}>
                                        Edit Permission
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!users || users.length === 0) && (
                            <tr>
                                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
