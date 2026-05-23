'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderProfile } from '../HeaderProfile';
import { MobileMenu } from './MobileMenu';
import { usePopupActive } from '@/lib/ui/popup-visibility';

export function Header({ user, fullWidth: propFullWidth, children }: { user?: any, fullWidth?: boolean, children?: React.ReactNode }) {
    const pathname = usePathname();
    const isPopupActive = usePopupActive();
    const fullWidth = propFullWidth;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (pathname?.startsWith('/properties/') && isPopupActive) {
        return null;
    }

    return (
        <>
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

                    {/* User Actions */}
                    <div style={{ display: 'flex', gap: '8px', fontWeight: '600', fontSize: '0.9rem', alignItems: 'center', marginLeft: 'auto' }}>
                        {/* User Icon */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: '#e2e8f0', 
                            padding: '4px',
                            overflow: 'hidden'
                        }}>
                            <HeaderProfile user={user} />
                        </div>

                        {/* Burger Menu — mobile only */}
                        <button
                            className="burger-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={mobileMenuOpen ? 'true' : 'false'}
                            style={{
                                display: 'none', // shown via CSS below
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'var(--color-text-main)',
                                padding: 0,
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
                {children}

                <style jsx>{`
                    @media (max-width: 768px) {
                        .layout-container {
                            padding: 0 16px !important;
                        }
                        .burger-menu-btn {
                            display: flex !important;
                        }
                    }
                `}</style>
            </header>

            <MobileMenu
                user={user}
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />
        </>
    );
}
