import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { SiteHeader } from '@/components/SiteHeader';
import RegisterClient from './RegisterClient';

export default async function RegisterPage() {
    const session = await getSession();
    if (session) {
        // Verify if user actually exists in the new DB
        const user = await prisma.user.findUnique({
            where: { id: Number(session.id) }
        });

        if (user) {
            redirect('/');
        }
    }

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SiteHeader />
            <RegisterClient />
        </main>
    );
}
