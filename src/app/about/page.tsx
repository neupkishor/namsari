import React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function AboutPage() {
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
                    About Namsari
                </h1>
                <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#475569', marginBottom: '40px' }}>
                    Namsari is Nepal's premier institutional real estate marketplace, dedicated to streamlining the discovery and acquisition of high-value residential and commercial assets.
                </p>

                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>Our Mission</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#64748b' }}>
                        We believe that real estate transactions should be transparent, efficient, and data-driven. Our platform connects serious buyers with vetted sellers and premium agencies, ensuring that every asset on our registry meets the highest standards of quality and legitimacy.
                    </p>
                </section>

                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>The Institutional Standard</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#64748b' }}>
                        Unlike traditional listing sites, Namsari focuses on the "Institutional Standard." This means we prioritize organized data, professional photography, and direct communication channels. Whether you are looking for a luxury penthouse in Kathmandu or a sprawling commercial complex in Lalitpur, Namsari provides the tools you need to make informed decisions.
                    </p>
                </section>

                <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>A Neup Group Standard</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                        Namsari is a flagship product of the Neup Group, a technology and investment collective focused on modernizing the digital infrastructure of South Asia.
                    </p>
                </div>
            </div>
        </main>
    );
}
