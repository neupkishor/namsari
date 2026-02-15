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
        <>
            <div className="layout-container" style={{
                display: 'flex',
                gap: '40px',
                paddingTop: '24px',
                paddingBottom: '120px',
                alignItems: 'flex-start',
                minHeight: 'calc(100vh - var(--header-height))',
                maxWidth: 'var(--container-max)',
                margin: '0 auto',
                marginTop: 'calc(var(--header-height) + 24px)',
                paddingLeft: '24px',
                paddingRight: '24px',
                width: '100%',
                position: 'relative'
            }}>

                <div className="desktop-only">
                    <Sidebar user={user} loading={loading} />
                </div>

                <main style={{
                    flex: 1,
                    width: '100%',
                    paddingLeft: '32px'
                }}>
                    {children}
                </main>
            </div>

            <style jsx global>{`
            @media (max-width: 1024px) {
                main {
                    padding-left: 0 !important;
                }
                .layout-container {
                    padding: 0 8px !important;
                }
                .desktop-only {
                    display: none !important;
                }
            }
            @media (min-width: 1025px) {
                .mobile-only {
                    display: none !important;
                }
            }
        `}</style>
        </>
    );
}
