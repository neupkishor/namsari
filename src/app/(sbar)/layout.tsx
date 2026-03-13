'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/menu/Sidebar';
import { getCurrentUser } from '@/actions/auth';

export default function HomepageLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
        
        async function fetchUser() {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start min-h-[calc(100vh-var(--header-height))] max-w-[var(--container-max)] mx-auto mt-[var(--header-height)] px-4 lg:px-8 w-full relative bg-surface">
            <div className="hidden lg:block sticky top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-[var(--sidebar-width)] flex-shrink-0">
                <Sidebar user={user} loading={loading} />
            </div>

            <main className="flex-1 w-full py-6 lg:py-8 min-w-0">
                {children}
            </main>
        </div>
    );
}
