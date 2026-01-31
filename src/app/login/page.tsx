import React from 'react';
import Link from 'next/link';
import { loginAction } from '../actions/auth';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma';

export default async function LoginPage() {
    const session = await getSession();
    if (session) {
        // Verify if user actually exists in the new DB
        const user = await prisma.user.findUnique({
            where: { id: Number(session.id) }
        });

        if (user) {
            redirect('/');
        } else {
            // Session is valid but user not found (stale cookie from previous db)
            // We allow them to login. Ideally we'd clear the cookie here but strict mode prevents it in render.
            // The login action will overwrite it anyway.
        }
    }

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="layout-container" style={{ maxWidth: '440px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginTop: '24px' }}>Welcome Back</h1>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>Log in to manage your real estate assets.</p>
                </div>

                <form action={loginAction} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.85rem' }}>Username</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            required
                        />
                    </div>

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
        </main>
    );
}
