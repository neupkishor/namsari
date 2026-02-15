'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';

import { sidebarMenuGroups, managementMenuGroups } from './menu-config';

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
    const pathname = usePathname();
    const [isDesktop, setIsDesktop] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Custom Scrollbar Logic
    const scrollRef = useRef<HTMLDivElement>(null);
    const [thumbHeight, setThumbHeight] = useState(0);
    const [thumbTop, setThumbTop] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        
        if (scrollHeight <= clientHeight) {
            setThumbHeight(0);
            return;
        }

        const minThumbHeight = 30;
        const height = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbHeight);
        setThumbHeight(height);
        
        const availableScrollSpace = scrollHeight - clientHeight;
        const availableThumbSpace = clientHeight - height;
        
        // Prevent division by zero
        const scrollRatio = availableScrollSpace > 0 ? scrollTop / availableScrollSpace : 0;
        const top = scrollRatio * availableThumbSpace;
        
        setThumbTop(top);
        setIsScrolling(true);

        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 1000);
    }, []);

    useEffect(() => {
        setMounted(true);
        const checkScreen = () => {
            setIsDesktop(window.innerWidth >= 1025);
            // Recalculate scrollbar on resize
            handleScroll();
        };
        
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, [handleScroll]);

    // Update scrollbar when content might change (e.g. route change)
    useEffect(() => {
        // Small delay to allow layout to settle
        const timer = setTimeout(handleScroll, 100);
        return () => clearTimeout(timer);
    }, [pathname, handleScroll, user]);

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

    const isManagePage = pathname?.startsWith('/manage');
    const menuGroups = isManagePage ? managementMenuGroups(user) : sidebarMenuGroups(user);

    const isActive = (href: string) => {
        if (href === '/' || href === '/manage') return pathname === href;
        if (href === '/manage/requirements') return pathname?.startsWith(href);
        return pathname?.startsWith(href);
    };

    const isScrollbarVisible = (isScrolling || isHovering) && thumbHeight > 0;

    return (
        <div className="desktop-sidebar-wrapper" style={{ width: '280px', flexShrink: 0, height: '100%' }}>
            <aside 
                className="feed-sidebar-desktop" 
                style={{
                    width: '280px',
                    flexShrink: 0,
                    position: 'fixed',
                    top: '0px',
                    bottom: '0px',
                    height: '100vh',
                    overflow: 'hidden', // Hide native scrollbar on container
                    borderRight: '1px solid #f1f5f9',
                    // Moved padding to inner container
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    style={{
                        height: '100%',
                        overflowY: 'auto',
                        paddingRight: '12px',
                        paddingTop: 'calc(var(--header-height) + 24px)',
                        paddingBottom: '120px',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                    }}
                    className="sidebar-scroll-viewport"
                >
                    <style jsx>{`
                        .feed-sidebar-desktop {
                            display: none;
                        }
                        @media (min-width: 1025px) {
                            .feed-sidebar-desktop {
                                display: block;
                            }
                        }
                        /* Hide Webkit scrollbar */
                        .sidebar-scroll-viewport::-webkit-scrollbar {
                            display: none;
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
                                    {group.items.map((item, idx) => {
                                        const active = isActive(item.href);
                                        return (
                                            <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: active ? '600' : '500',
                                                    color: active ? 'var(--color-primary)' : '#64748b',
                                                    backgroundColor: active ? '#eff6ff' : 'transparent',
                                                    transition: 'all 0.2s',
                                                    fontSize: '0.95rem'
                                                }} 
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = active ? '#eff6ff' : '#f1f5f9'} 
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = active ? '#eff6ff' : 'transparent'}
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
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

                        <div style={{ padding: '0 16px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Namsari Estate &copy; 2026<br /> Designed by <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer">Neup.Marketing</a>
                        </div>
                    </div>
                </div>

                {/* Custom Scrollbar Thumb */}
                <div 
                    style={{
                        position: 'absolute',
                        right: '4px',
                        top: 0,
                        width: '5px',
                        height: `${thumbHeight}px`,
                        transform: `translateY(${thumbTop}px)`,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        opacity: isScrollbarVisible ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        pointerEvents: 'none', // Pass through clicks
                        zIndex: 50
                    }}
                />
            </aside>
        </div>
    );
}
