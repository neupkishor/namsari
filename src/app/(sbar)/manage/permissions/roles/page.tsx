import React from 'react';
import Link from 'next/link';
import { getRoles } from '@/actions/permissions';
import RolesClient from './RolesClient';

export default async function RolesPage() {
    const { data: roles } = await getRoles();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
            <Link href="/manage/permissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '24px', fontWeight: '500' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                Back to User Permissions
            </Link>

            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Manage Roles</h1>
                <p style={{ color: '#64748b' }}>Create and manage roles to define system access.</p>
            </header>

            <RolesClient roles={roles || []} />
        </div>
    );
}
