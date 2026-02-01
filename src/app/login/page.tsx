import React from 'react';
import Link from 'next/link';
import { loginAction } from '../actions/auth';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma';
import { Input } from '@/components/ui';

import { SiteHeader } from '@/components/SiteHeader';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const session = await getSession();
    if (session) {
        const user = await prisma.user.findUnique({
            where: { id: Number(session.id) }
        });

        if (user) {
            redirect('/');
        }
    }

    // In Next.js 15, searchParams is a promise
    const { error } = await searchParams;

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SiteHeader />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="layout-container" style={{ maxWidth: '440px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Link href="/" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                            Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginTop: '24px' }}>Welcome Back</h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Log in to manage your real estate assets.</p>
                    </div>

                    <form action={loginAction} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {error && (
                            <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '16px', border: '1px solid #fecaca' }}>
                                {decodeURIComponent(error)}
                            </div>
                        )}

                        <Input
                            label="Username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />

                        <button
                            type="submit"
                            style={{
                                marginTop: '8px',
                                padding: '14px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                fontWeight: '700',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Log In
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '8px' }}>
                            Don't have an account? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Create one</Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}
