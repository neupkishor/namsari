'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { sidebarMenuGroups } from './menu-config';
import { MenuIcon } from './MenuIcon';

interface MobileMenuProps {
    user?: any;
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ user, isOpen, onClose }: MobileMenuProps) {
    const pathname = usePathname();

    // Close on route change
    useEffect(() => {
        onClose();
    }, [pathname]);

    // Prevent body scroll + apply blur when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isOpen]);

    const menuGroups = sidebarMenuGroups(user);
    const allItems = menuGroups.flatMap(g => g.items);

    const isActive = (href: string) => {
        if (!pathname) return false;
        if (pathname === href) return true;
        if (href === '/') return false;
        if (pathname.startsWith(href)) {
            const betterMatch = allItems.find(
                other => other.href !== href && other.href.length > href.length && pathname.startsWith(other.href)
            );
            if (betterMatch) return false;
            return true;
        }
        return false;
    };

    return (
        <div data-mobile-menu-portal="">
            {/* Click-catcher behind the drawer (closes menu when tapping outside) */}
            {isOpen && (
                <div
                    onClick={onClose}
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1150,
                        cursor: 'pointer',
                    }}
                />
            )}

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 'min(320px, 85vw)',
                    background: '#ffffff',
                    zIndex: 1200,
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
                    overflowY: 'auto',
                }}
            >
                {/* Drawer Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        Namsari<span style={{ color: 'var(--color-gold)', marginLeft: '1px' }}>.</span>
                    </span>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            background: '#f1f5f9',
                            cursor: 'pointer',
                            color: 'var(--color-text-main)',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Menu Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        {menuGroups.map((group, groupIdx) => (
                            <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {group.title && (
                                    <p style={{
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        color: 'var(--color-text-muted, #94a3b8)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        marginBottom: '6px',
                                        paddingLeft: '8px',
                                    }}>
                                        {group.title}
                                    </p>
                                )}
                                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {group.items.map((item, idx) => {
                                        const active = isActive(item.href);

                                        if (item.label === 'LogOut') {
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => { logoutAction(); onClose(); }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '10px 12px',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#ef4444',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                        <MenuIcon icon={item.icon} label={item.label} className="text-[18px]" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={item.href}
                                                onClick={onClose}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '10px 12px',
                                                    borderRadius: '10px',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                    fontWeight: active ? '700' : '500',
                                                    color: active ? 'var(--color-primary)' : 'var(--color-text-muted, #64748b)',
                                                    background: active ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent',
                                                    transition: 'background 0.15s, color 0.15s',
                                                }}
                                            >
                                                    <MenuIcon icon={item.icon} label={item.label} active={active} className="text-[18px]" />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' }}>
                            Namsari Estate &copy; 2026<br />
                            <span style={{ opacity: 0.7 }}>Designed by </span>
                            <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                                Neup.Marketing
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
