'use client';

import React from 'react';
import Link from 'next/link';

interface LoginPromptCardProps {
    title?: string;
    description?: string;
    redirectUrl?: string;
}

export const LoginPromptCard: React.FC<LoginPromptCardProps> = ({ 
    title = "Please login to continue", 
    description = "You can do this or that only on logging in to the account kind of thing.",
    redirectUrl = "/auth/login"
}) => {
    return (
        <div style={{
            maxWidth: '480px',
            margin: '80px auto',
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            backgroundColor: 'white',
            border: '1px solid #f1f5f9'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#f1f5f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '8px'
            }}>
                🔒
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    color: '#1e293b',
                    margin: 0
                }}>
                    {title}
                </h2>
                <p style={{ 
                    color: '#64748b', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    margin: 0
                }}>
                    {description}
                </p>
            </div>

            <Link href={redirectUrl} style={{ width: '100%', textDecoration: 'none' }}>
                <button 
                    style={{
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                    Log In
                </button>
            </Link>
            
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Don't have an account?{' '}
                <Link href="/auth/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                    Sign up
                </Link>
            </div>
        </div>
    );
};

export default LoginPromptCard;
