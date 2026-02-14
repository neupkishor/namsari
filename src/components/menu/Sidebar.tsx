'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';
import { SidebarSkeleton } from './SidebarSkeleton';

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
            <div className="desktop-sidebar-wrapper" style={{ width: '280px', flexShrink: 0 }}>
                <SidebarSkeleton />
            </div>
        );
    }

    const sidebarItems = [
        { label: 'Profile', icon: '👤', href: user ? `/@${user.username}` : '/login' },
        { label: 'Houses', icon: '🏠', href: '/find/houses' },
        { label: 'Commercial Buildings', icon: '🏢', href: '/find/commercial-buildings' },
        { label: 'Agencies', icon: '🧑‍💼', href: '/agencies' },
        { label: 'Favourites', icon: '❤️', href: user ? `/@${user.username}/saved` : '/login' },
        { label: 'Market Trends', icon: '📈', href: '/market' },
        { label: 'Blogs/Guide', icon: '📰', href: '/blog' },
        { label: 'Utilities', icon: '🛠️', href: '/utility' },
        { label: 'Unit Converter', icon: '🔄', href: '/utility/unit-converter' },
        { label: 'Date Converter', icon: '📅', href: '/utility/date-converter' },
        { label: 'EMI Calculator', icon: '💰', href: '/utility/emi-calculator' },
        ...(user ? [{ label: 'Manage About', icon: '📝', href: '/manage/about' }] : []),
    ];

    const secondaryItems = [
        { label: 'About Us', icon: 'ℹ️', href: '/about' },
        { label: 'Careers', icon: '💼', href: '/careers' },
        { label: 'Terms', icon: '📝', href: '/terms' },
        { label: 'Privacy', icon: '🛡️', href: '/terms/privacy' },
        { label: 'Help Center', icon: '❓', href: '/support' },
        { label: 'Settings', icon: '⚙️', href: '/manage/settings' },
    ];

    return (
        <div className="desktop-sidebar-wrapper" style={{ width: '280px', flexShrink: 0 }}>
            <aside className="feed-sidebar-desktop" style={{
                width: '280px',
                flexShrink: 0,
                position: 'sticky',
                top: 'var(--header-height)',
                height: 'calc(100vh - var(--header-height))',
                overflowY: 'auto',
                paddingRight: '12px',
                paddingTop: '24px',
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
