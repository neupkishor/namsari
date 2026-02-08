'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileTabs({ username, isOwner }: { username: string, isOwner: boolean }) {
    const pathname = usePathname();
    const baseUrl = `/@${username}`;

    const isActive = (path: string) => {
        if (path === baseUrl) {
            return pathname === baseUrl || pathname === `${baseUrl}/`;
        }
        return pathname?.startsWith(path);
    };

    const tabs = [
        { label: 'Posts', href: baseUrl },
        { label: 'About', href: `${baseUrl}/about` },
        { label: 'Reviews', href: `${baseUrl}/reviews` },
    ];

    if (isOwner) {
        tabs.push({ label: 'Saved', href: `${baseUrl}/saved` });
    }

    return (
        <div className="profile-nav">
            {tabs.map(tab => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    style={{
                        paddingBottom: '16px',
                        borderBottom: isActive(tab.href) ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: isActive(tab.href) ? 'var(--color-primary)' : '#64748b',
                        fontWeight: isActive(tab.href) ? '700' : '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        textDecoration: 'none'
                    }}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
