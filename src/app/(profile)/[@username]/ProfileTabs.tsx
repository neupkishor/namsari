'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileTabs({ username, isOwner, accountType }: { username: string, isOwner: boolean, accountType: string | null }) {
    const pathname = usePathname();
    const baseUrl = `/@${username}`;

    const isActive = (href: string) => {
        if (href === baseUrl) {
            return pathname === baseUrl || pathname === `${baseUrl}/`;
        }
        return pathname?.startsWith(href);
    };

    const tabs = [
        { label: 'Overview', href: baseUrl },
        { label: 'Properties', href: `${baseUrl}/properties` },
        { label: 'Reviews', href: `${baseUrl}/reviews` },
        { label: 'About', href: `${baseUrl}/about` },
    ];

    if (accountType === 'agency') {
        // Insert Agents after Properties
        const propertiesIndex = tabs.findIndex(t => t.label === 'Properties');
        if (propertiesIndex !== -1) {
             tabs.splice(propertiesIndex + 1, 0, { label: 'Agents', href: `${baseUrl}/agents` });
        }
    }

    if (isOwner) {
        tabs.push({ label: 'Saved', href: `${baseUrl}/saved` });
    }

    return (
        <div className="profile-nav" style={{ display: 'flex', gap: '32px', padding: '0 24px', overflowX: 'auto', overflowY: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
            {tabs.map(tab => {
                const active = isActive(tab.href);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        style={{
                            padding: '16px 4px',
                            borderBottom: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: active ? 'var(--color-primary)' : '#64748b',
                            fontWeight: active ? '700' : '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            marginBottom: '-1px'
                        }}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
