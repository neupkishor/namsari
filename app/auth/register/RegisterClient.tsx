'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth';
import { Input } from '@/components/ui';
import { useFormStatus } from 'react-dom';

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={disabled || pending}
            style={{
                marginTop: '12px',
                padding: '14px',
                background: disabled || pending ? '#cbd5e1' : 'var(--color-primary)',
                color: 'white',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: disabled || pending ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'background 0.2s'
            }}
        >
            {pending ? 'Creating Account...' : 'Sign Up'}
        </button>
    );
}

export default function RegisterClient() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="layout-container" style={{ maxWidth: '480px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Link href="/" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                            Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary-light)', marginTop: '24px' }}>Create Your Account</h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Join the premier real estate network.</p>
                    </div>

                    <form action={registerAction} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input type="hidden" name="account_type" value="user" />

                        <Input
                            label="Full Name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            required
                        />

                        <Input
                            label="Contact Number"
                            name="contact_number"
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            required
                        />

                        <SubmitButton disabled={false} />

                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '16px' }}>
                            Already have an account? <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Log In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}
