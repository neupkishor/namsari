'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';

import { sidebarMainItems, sidebarSecondaryItems } from './menu-config';

export function SidebarSkeleton() {
    return (
        <aside className="feed-sidebar-desktop" style={{
            width: '280px',
            flexShrink: 0,
            position: 'fixed',
            top: '0px',
            bottom: '0px',
            height: '100vh',
            overflowY: 'auto',
            paddingRight: '12px',
            paddingTop: 'calc(var(--header-height) + 24px)',
            paddingBottom: '120px',
            borderRight: '1px solid #f1f5f9'
        }}>
            <style jsx>{`
                .feed-sidebar-desktop {
                    display: none;
                }
                @media (min-width: 1025px) {
                    .feed-sidebar-desktop {
                        display: block;
                    }
                }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton" style={{ height: '48px', width: '100%', borderRadius: '8px' }}></div>
                ))}
                
                <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />
                
                {[1, 2, 3, 4].map(i => (
                    <div key={`sec-${i}`} className="skeleton" style={{ height: '40px', width: '80%', borderRadius: '8px' }}></div>
                ))}
            </div>
        </aside>
    );
}

export function Sidebar({ user, loading }: { user: any, loading?: boolean }) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkScreen = () => {
            setIsDesktop(window.innerWidth >= 1025);
        };
        
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Don't render anything until mounted and we know the screen size
    if (!mounted) return null;
    
    // Strictly don't render on mobile
    if (!isDesktop) return null;

    if (loading) {
        return (
            <div className="desktop-sidebar-wrapper" style={{ width: '280px', flexShrink: 0, height: '100%' }}>
                <SidebarSkeleton />
            </div>
        );
    }

    const sidebarItems = sidebarMainItems(user);
    const secondaryItems = sidebarSecondaryItems;

    return (
        <div className="desktop-sidebar-wrapper" style={{ width: '280px', flexShrink: 0, height: '100%' }}>
            <aside className="feed-sidebar-desktop" style={{
                width: '280px',
                flexShrink: 0,
                position: 'fixed',
                top: '0px',
                bottom: '0px',
                height: '100vh',
                overflowY: 'auto',
                paddingRight: '12px',
                paddingTop: 'calc(var(--header-height) + 24px)',
                paddingBottom: '120px',
                borderRight: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sidebarItems.map((item, idx) => (
                        <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: idx === 0 ? '700' : '500',
                                color: 'var(--color-primary)',
                                transition: 'background 0.2s'
                            }} onMouseOver={(e) => e.currentTarget.style.background = '#e4e6eb'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    ))}

                    <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

                    {secondaryItems.map((item, idx) => (
                        <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-muted)',
                                transition: 'background 0.2s'
                            }} onMouseOver={(e) => e.currentTarget.style.background = '#f0f2f5'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    ))}

                    <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

                    {/* Logout Option */}
                    {user && (
                        <div
                            onClick={() => logoutAction()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: '#ef4444',
                                fontWeight: '600',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ fontSize: '1.1rem' }}>🚪</span>
                            <span>Logout</span>
                        </div>
                    )}

                    <div style={{ padding: '20px 16px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Namsari Estate &copy; 2026<br /> Designed by <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer">Neup.Marketing</a>
                    </div>
                </div>
            </aside>
        </div>
    );
}
