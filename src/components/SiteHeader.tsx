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
                <nav style={{ display: 'flex', gap: '8px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
                    <Link
                        href="/explore"
                        className={`header-link ${pathname === '/explore' ? 'active' : ''}`}
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-inner)'
                            , color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'all 0.2s'
                        }}
                    >
                        Explore
                    </Link>
                    <Link
                        href="/sell"
                        className={`header-link ${pathname === '/sell' ? 'active' : ''}`}
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-inner)'
                            , color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s'
                        }}
                    >
                        Sell
                    </Link>

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
                            href="/manage"
                            className="header-link"
                            style={{
                                padding: '8px 16px', borderRadius: 'var(--radius-inner)'
                                , color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{user.name[0]}</div>
                            )}
                            {user.name}
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
