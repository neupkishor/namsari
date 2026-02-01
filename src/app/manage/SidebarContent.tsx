'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarContent() {
    const pathname = usePathname();

    const links = [
        { href: '/manage', label: 'Manage', exact: true },
        { href: '/manage/properties', label: 'Properties' },
        { href: '/manage/requirements', label: 'Requirements' },
        { href: '/manage/featured', label: 'Featured' },
        { href: '/manage/users', label: 'User Management' },
        { href: '/manage/agencies', label: 'Agencies' },
        { href: '/manage/newsletter', label: 'Newsletter' },
        { href: '/manage/collections', label: 'Collections' },
    ];

    const isActive = (href: string, exact: boolean = false) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href) && (pathname.length === href.length || pathname[href.length] === '/');
    };

    return (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`sidebar-link ${isActive(link.href, link.exact) ? 'active' : ''}`}
                >
                    {link.label}
                </Link>
            ))}
            <a href="#" className="sidebar-link">Financials</a>

            <div style={{ margin: '20px 24px 8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Root
            </div>
            <Link
                href="/manage/banks"
                className={`sidebar-link ${isActive('/manage/banks') ? 'active' : ''}`}
            >
                Banks
            </Link>
            <Link
                href="/manage/about"
                className={`sidebar-link ${isActive('/manage/about') ? 'active' : ''}`}
            >
                About
            </Link>
            <Link
                href="/manage/careers"
                className={`sidebar-link ${isActive('/manage/careers') ? 'active' : ''}`}
            >
                Careers
            </Link>
            <Link
                href="/manage/support"
                className={`sidebar-link ${isActive('/manage/support') ? 'active' : ''}`}
            >
                Support
            </Link>
            <Link
                href="/manage/blog"
                className={`sidebar-link ${isActive('/manage/blog') ? 'active' : ''}`}
            >
                Blog
            </Link>

            <div style={{ margin: '20px 24px 8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Settings
            </div>
            <Link
                href="/manage/settings"
                className={`sidebar-link ${isActive('/manage/settings') ? 'active' : ''}`}
            >
                Settings
            </Link>
            <a href="#" className="sidebar-link">API Configuration</a>
            <a href="#" className="sidebar-link">System Logs</a>
        </nav>
    );
}
