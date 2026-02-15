'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderProfile } from '../HeaderProfile';

export function Header({ user, fullWidth: propFullWidth, children }: { user?: any, fullWidth?: boolean, children?: React.ReactNode }) {
    const pathname = usePathname();
    const fullWidth = propFullWidth;

    return (
        <header className="header-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: 'var(--header-height)',
            background: '#ffffff',
            borderBottom: '1px solid transparent',
            boxShadow: 'var(--shadow-heavy)',
            zIndex: 1000
        }}>
            <div className={fullWidth ? "" : "layout-container"} style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: fullWidth ? '0 40px' : '0 24px',
                maxWidth: fullWidth ? 'none' : 'var(--container-max)',
                margin: '0 auto',
                gap: '16px'
            }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                    Namsari<span style={{ color: 'var(--color-gold)', marginLeft: '1px' }}>.</span>
                </Link>

                {/* Search Bar */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '600px', margin: '0 16px' }}>
                    {/* Desktop Search */}
                    <div className="desktop-search" style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                        <input
                            type="text"
                            placeholder="Search properties..."
                            style={{
                                width: '100%',
                                padding: '10px 16px 10px 42px',
                                borderRadius: '24px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-main)',
                                fontFamily: 'inherit'
                            }}
                        />
                        <svg
                            width="18"
                            height="18"
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

                {/* User Actions */}
                <div style={{ display: 'flex', gap: '8px', fontWeight: '600', fontSize: '0.9rem', alignItems: 'center' }}>
                    {/* Mobile Search Icon */}
                    <div className="mobile-search-icon" style={{ marginRight: '8px', cursor: 'pointer' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-main)' }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <HeaderProfile user={user} />
                </div>
            </div>
            {children}

            <style jsx>{`
                .desktop-only {
                    display: block;
                }
                .mobile-only-icon {
                    display: none;
                }
                .mobile-search-icon {
                    display: none;
                }
                .desktop-search {
                    display: block;
                }

                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only-icon {
                        display: block;
                    }
                    .mobile-search-icon {
                        display: block !important;
                    }
                    .desktop-search {
                        display: none !important;
                    }
                    .layout-container {
                        padding: 0 16px !important;
                    }
                }
            `}</style>
        </header>
    );
}
