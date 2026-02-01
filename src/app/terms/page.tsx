import React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function TermsPage() {
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
                    Terms of Service
                </h1>
                <p style={{ color: '#64748b', marginBottom: '40px' }}>Last Updated: February 1, 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            By accessing or using the Namsari platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>2. User Responsibilities</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information when listing properties or creating a profile.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>3. Marketplace Integrity</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            Namsari reserves the right to remove any listing that is found to be fraudulent, misleading, or in violation of local real estate regulations. We do not guarantee the accuracy of information provided by third-party sellers.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>4. Limitation of Liability</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            Namsari and the Neup Group are not liable for any direct, indirect, or incidental damages arising from your use of the platform or any real estate transactions facilitated through it.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
