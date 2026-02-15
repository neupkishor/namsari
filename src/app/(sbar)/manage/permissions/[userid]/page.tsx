import React from 'react';
import Link from 'next/link';
import { getUserPermissions, getRoles } from '@/actions/permissions';
import UserPermissionClient from './UserPermissionClient';
import { notFound } from 'next/navigation';

export default async function EditUserPermissionPage({ params }: { params: Promise<{ userid: string }> }) {
    const { userid } = await params;
    const userId = parseInt(userid, 10);
    
    if (isNaN(userId)) {
        notFound();
    }

    const { data: user } = await getUserPermissions(userId);
    const { data: roles } = await getRoles();

    if (!user) {
        notFound();
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
            <Link href="/manage/permissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '24px', fontWeight: '500' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                Back to Permissions
            </Link>

            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Edit User Permission</h1>
                <p style={{ color: '#64748b' }}>Assign roles and manage access for this user.</p>
            </header>

            <UserPermissionClient user={user} roles={roles || []} />
        </div>
    );
}
