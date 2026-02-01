'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { registerAction } from '../actions/auth';
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
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [accountType, setAccountType] = useState('owner');

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow a-z, A-Z, 0-9, _, . only
        // Just filter out invalid characters immediately for better UX
        const val = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '');
        setUsername(val);
    };

    useEffect(() => {
        const checkUsername = async () => {
            if (username.length === 0) {
                setIsAvailable(null);
                return;
            }

            if (username.length < 3) {
                // We keep null here so it shows the "Must be at least 3 chars" message from render logic
                // But we could also explicitly set error state if we changed logic.
                // The render logic handles < 3 check.
                setIsAvailable(null);
                return;
            }

            // Client-side regex check (redundant if input is filtered, but good for safety)
            const regex = /^[a-zA-Z0-9_.]+$/;
            if (!regex.test(username)) {
                setIsAvailable(false);
                return;
            }

            setIsChecking(true);
            try {
                const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
                const data = await res.json();
                setIsAvailable(data.available);
            } catch (error) {
                console.error('Username check failed', error);
                setIsAvailable(false);
            } finally {
                setIsChecking(false);
            }
        };

        const timeoutId = setTimeout(checkUsername, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [username]);

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="layout-container" style={{ maxWidth: '480px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Link href="/" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                            Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginTop: '24px' }}>Create Your Account</h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Join the premier real estate network.</p>
                    </div>

                    <form action={registerAction} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                            <Input
                                label="Username"
                                name="username"
                                type="text"
                                placeholder="Pick a unique handle"
                                required
                                value={username}
                                onChange={handleUsernameChange}
                            />
                            {username.length > 0 && (
                                <div style={{ fontSize: '0.85rem', marginTop: '2px', minHeight: '20px' }}>
                                    {isChecking ? (
                                        <span style={{ color: '#64748b' }}>Checking availability...</span>
                                    ) : isAvailable === true ? (
                                        <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Username is available</span>
                                    ) : isAvailable === false ? (
                                        <span style={{ color: '#ef4444', fontWeight: '600' }}>✕ Username is taken</span>
                                    ) : username.length < 3 ? (
                                        <span style={{ color: '#64748b' }}>Must be at least 3 characters</span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <Input
                            label="Full Name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            required
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

                        <div style={{ margin: '12px 0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>Account Type</label>
                            <input type="hidden" name="account_type" value={accountType} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[
                                    { value: 'owner', label: 'Owner' },
                                    { value: 'agent', label: 'Agent' },
                                    { value: 'agency', label: 'Agency' }
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setAccountType(type.value)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: accountType === type.value ? '2px solid var(--color-primary)' : '1px solid #cbd5e1',
                                            background: accountType === type.value ? '#eff6ff' : 'white',
                                            color: accountType === type.value ? 'var(--color-primary)' : '#64748b',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {accountType === type.value && (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                                        )}
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <SubmitButton disabled={isAvailable !== true} />

                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '16px' }}>
                            Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Log In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}
