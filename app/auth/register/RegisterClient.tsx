'use client';

import React, { useState, useEffect } from 'react';
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
    const [accountType, setAccountType] = useState('user');

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
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            {['user', 'agency', 'bank'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAccountType(type)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: `1px solid ${accountType === type ? 'var(--color-primary)' : '#e2e8f0'}`,
                                        background: accountType === type ? '#fef2f2' : 'white',
                                        color: accountType === type ? 'var(--color-primary)' : '#64748b',
                                        fontWeight: '600',
                                        textTransform: 'capitalize',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <input type="hidden" name="account_type" value={accountType} />

                        <Input
                            label={accountType === 'agency' ? "Agency Name" : accountType === 'bank' ? "Bank Name" : "Full Name"}
                            name="name"
                            type="text"
                            placeholder={accountType === 'agency' ? "Enter agency name" : accountType === 'bank' ? "Enter bank name" : "Enter your name"}
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

                        {accountType === 'user' && (
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                required
                            />
                        )}

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
