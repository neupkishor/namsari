import Link from 'next/link';
import { getSession } from '@/services/auth/session';
import { redirect } from 'next/navigation';

import prisma from '@neup/core/database/prisma';
import { Header } from '@/components/menu/Header';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
    const session = await getSession();
    if (session) {
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
            
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="layout-container" style={{ maxWidth: '440px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Link href="/" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                            Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary-light)', marginTop: '24px' }}>Welcome Back</h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Log in to manage your real estate assets.</p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </main>
    );
}
