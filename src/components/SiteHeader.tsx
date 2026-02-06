'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader({ user, fullWidth }: { user?: any, fullWidth?: boolean }) {
    const pathname = usePathname();

    return (
        <header className="full-width-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
            <div className={fullWidth ? "" : "layout-container"} style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: fullWidth ? '0 40px' : '0 24px',
                maxWidth: fullWidth ? 'none' : 'var(--container-max)',
                margin: '0 auto'
            }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    Namsari<span style={{ color: 'var(--color-gold)', marginLeft: '1px' }}>.</span>
                </Link>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '600px', margin: '0 24px' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                        <input
                            type="text"
                            placeholder="Search for properties, locations..."
                            style={{
                                width: '100%',
                                padding: '10px 16px 10px 44px',
                                borderRadius: '24px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-main)',
                                fontFamily: 'inherit'
                            }}
                        />
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                <nav style={{ display: 'flex', gap: '8px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>

                    {!user ? (
                        <>
                            <Link
                                href="/login"
                                className="header-link"
                                style={{
                                    padding: '8px 16px', borderRadius: 'var(--radius-inner)'
                                    , color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s'
                                }}
                            >
                                Sign In
                            </Link>
                            <Link href="/register" style={{
                                background: 'var(--color-primary)', color: 'white', padding: '8px 20px', borderRadius: 'var(--radius-inner)'
                                , textDecoration: 'none', fontWeight: '600'
                            }}>
                                Register
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/profile"
                            className="header-link"
                            style={{
                                padding: '8px 16px', borderRadius: 'var(--radius-inner)'
                                , color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{user.name?.[0] || 'U'}</div>
                            )}
                            {user.name}
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
