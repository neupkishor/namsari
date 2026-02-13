import React from 'react';
import prisma from '@/lib/prisma';
import EditUserClient from './EditUserClient';
import { notFound } from 'next/navigation';

export default async function EditUserPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const user = await prisma.user.findFirst({
        where: { username: username }
    });

    if (!user) {
        notFound();
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Edit User Profile</h1>
                <p style={{ color: '#64748b' }}>Update account details for @{user.username}</p>
            </header>

            <EditUserClient user={user} />
        </div>
    );
}
