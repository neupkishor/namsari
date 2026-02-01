import React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function SupportPage() {
    const session = await getSession();
    let user = null;
    if (session?.id) {
        user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    }

    return (
        <main style={{ background: 'white', minHeight: '100vh' }}>
            <SiteHeader user={user} />
            <div className="layout-container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', color: 'var(--color-primary)' }}>
                    How can we help?
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '40px' }}>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏘️</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Buying & Renting</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Learn how to search for properties, contact agents, and make offers on Namsari.
                        </p>
                    </div>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📝</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Selling & Hosting</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Discover how to list your assets, manage enquiries, and boost your visibility.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '80px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px' }}>Still have questions?</h2>
                    <p style={{ color: '#64748b', marginBottom: '32px' }}>Our support team is available 24/7 to assist you with your real estate journey.</p>
                    <a href="mailto:support@namsari.com" style={{
                        padding: '16px 32px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '16px',
                        fontWeight: '700',
                        textDecoration: 'none'
                    }}>
                        Contact Support
                    </a>
                </div>
            </div>
        </main>
    );
}
