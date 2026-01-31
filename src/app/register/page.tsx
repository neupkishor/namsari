import React from 'react';
import Link from 'next/link';
import { registerAction } from '../actions/auth';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
    const session = await getSession();
    if (session) {
        redirect('/');
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

                <form action={registerAction} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.85rem' }}>Username</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="Pick a unique handle"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.85rem' }}>Full Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.85rem' }}>Contact Number</label>
                        <input
                            name="contact_number"
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.85rem' }}>Account Type</label>
                        <select
                            name="account_type"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                            required
                        >
                            <option value="owner">Property Owner</option>
                            <option value="agent">Professional Agent</option>
                            <option value="agency">Real Estate Agency</option>
                        </select>
                    </div>

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
