'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';

import { bottomNavItems, sidebarMenuGroups } from './menu-config';

export function BottomNavigation({ user }: { user?: any }) {
    const [pathname, setPathname] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);

    // Close menu when path changes
    useEffect(() => {
        setShowMobileMenu(false);
    }, [pathname]);

    const items = bottomNavItems(user);
    const menuGroups = sidebarMenuGroups(user);

    return (
        <>
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div style={{
                    position: 'fixed',
                    top: 'var(--header-height)',
                    left: 0,
                    right: 0,
                    bottom: '70px', // Above bottom nav
                    backgroundColor: 'white',
                    zIndex: 999,
                    overflowY: 'auto',
                    padding: '24px 16px 40px',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <style jsx>{`
                        @keyframes slideUp {
                            from { transform: translateY(100%); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `}</style>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {menuGroups.map((group, groupIdx) => (
                            <div key={groupIdx}>
                                {group.title && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px',
                                        paddingLeft: '16px'
                                    }}>
                                        {group.title}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {group.items.map((item, idx) => (
                                        <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '500',
                                                color: 'var(--color-primary)',
                                                fontSize: '1rem',
                                                backgroundColor: pathname === item.href ? '#f0f9ff' : 'transparent'
                                            }}>
                                                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{ margin: '0 16px', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

                        {/* Logout Option */}
                        {user && (
                            <div
                                onClick={() => logoutAction()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: '#ef4444',
                                    fontWeight: '600'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>🚪</span>
                                <span>Logout</span>
                            </div>
                        )}
                        
                        <div style={{ padding: '0 16px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Namsari Estate &copy; 2026<br /> Designed by <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer">Neup.Marketing</a>
                        </div>
                    </div>
                </div>
            )}

            <div className="bottom-nav-container" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#ffffff', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-around', padding: '10px 0 24px',
                zIndex: 1000, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
            }}>
                {items.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={(e) => {
                            if (item.href === '#menu') {
                                e.preventDefault();
                                setShowMobileMenu(!showMobileMenu);
                            }
                        }}
                        style={{ flex: 1, cursor: 'pointer' }}
                    >
                        {item.href !== '#menu' ? (
                            <Link href={item.href} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                textDecoration: 'none', color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                width: '100%'
                            }}>
                                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>{item.label}</span>
                            </Link>
                        ) : (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                color: showMobileMenu ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                width: '100%'
                            }}>
                                <span style={{ fontSize: '1.4rem' }}>{showMobileMenu ? '✖' : item.icon}</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>{showMobileMenu ? 'Close' : item.label}</span>
                            </div>
                        )}
                    </div>
                ))}

                <style jsx>{`
                    .bottom-nav-container {
                        display: flex;
                    }
                    @media (min-width: 1025px) {
                        .bottom-nav-container {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        </>
    );
}
