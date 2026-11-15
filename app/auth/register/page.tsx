import React from 'react';
import { getSession } from '@/services/auth/session';
import { redirect } from 'next/navigation';
import prisma from '@neup/core/database/prisma';
import { Header } from '@/components/menu/Header';
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
            <Header />
            <RegisterClient />
        </main>
    );
}
