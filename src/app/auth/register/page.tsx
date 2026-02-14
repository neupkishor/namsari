import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { HeaderContainer } from '@/components/HeaderNavigation';
import RegisterClient from '@/app/auth/register/RegisterClient';

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
        <main className="min-h-screen bg-gray-50">
            <HeaderContainer />
            <RegisterClient />
        </main>
    );
}
