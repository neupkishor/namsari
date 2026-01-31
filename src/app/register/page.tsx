import React from 'react';
import Link from 'next/link';
import { registerAction } from '../actions/auth';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma';
import { Input, Select } from '@/components/ui';

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
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="layout-container" style={{ maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginTop: '24px' }}>Create Your Account</h1>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>Join the premier real estate network.</p>
                </div>

                <form action={registerAction} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Input
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="Pick a unique handle"
                        required
                    />

                    <Input
                        label="Full Name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        required
                    />

                    <Input
                        label="Contact Number"
                        name="contact_number"
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        required
                    />

                    <Select
                        label="Account Type"
                        name="account_type"
                        required
                        options={[
                            { label: 'Property Owner', value: 'owner' },
                            { label: 'Professional Agent', value: 'agent' },
                            { label: 'Real Estate Agency', value: 'agency' },
                        ]}
                    />

                    <button
                        type="submit"
                        style={{
                            marginTop: '12px',
                            padding: '14px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: '700',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Sign Up
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '16px' }}>
                        Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Log In</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
