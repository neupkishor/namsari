'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { bottomNavItems } from './menu-config';

export function BottomNavigation({ user }: { user?: any }) {
    const [pathname, setPathname] = useState('');

    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);

    const items = bottomNavItems(user);

    return (
        <div className="bottom-nav-container" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#ffffff', borderTop: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-around', padding: '10px 0 24px',
            zIndex: 1000, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
        }}>
            {items.map((item, idx) => (
                <Link key={idx} href={item.href} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    textDecoration: 'none', color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-muted)', flex: 1
                }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>{item.label}</span>
                </Link>
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
    );
}
