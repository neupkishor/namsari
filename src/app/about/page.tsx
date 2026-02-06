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

    let content = null;
    if ((prisma as any).aboutContent) {
        try {
            content = await (prisma as any).aboutContent.findFirst({
                where: { id: 1 }
            });
        } catch (e) {
            console.error("Failed to fetch about content:", e);
        }
    }

    const displayData = {
        title: content?.title || 'About Namsari',
        description: content?.description || "Namsari is Nepal's premier institutional real estate marketplace, dedicated to streamlining the discovery and acquisition of high-value residential and commercial assets.",
        mission: content?.mission || "We believe that real estate transactions should be transparent, efficient, and data-driven. Our platform connects serious buyers with vetted sellers and premium agencies, ensuring that every asset on our registry meets the highest standards of quality and legitimacy.",
        standard: content?.standard || "Unlike traditional listing sites, Namsari focuses on the \"Institutional Standard.\" This means we prioritize organized data, professional photography, and direct communication channels. Whether you are looking for a luxury penthouse in Kathmandu or a sprawling commercial complex in Lalitpur, Namsari provides the tools you need to make informed decisions.",
        group_info: content?.group_info || "Namsari is a flagship product of the Neup Group, a technology and investment collective focused on modernizing the digital infrastructure of South Asia."
    };

    return (
        <main style={{ background: 'white', minHeight: '100vh' }}>
            <SiteHeader user={user} />
            <div className="layout-container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '40px', color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>
                    {displayData.title}
                </h1>

                {content?.content ? (
                    <article
                        className="about-article"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                        style={{
                            fontSize: '1.15rem',
                            lineHeight: '1.8',
                            color: '#334155'
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                        <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#475569' }}>
                            {displayData.description}
                        </p>

                        <section>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-primary-light)' }}>Our Mission</h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#64748b' }}>
                                {displayData.mission}
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-primary-light)' }}>The Institutional Standard</h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#64748b' }}>
                                {displayData.standard}
                            </p>
                        </section>

                        <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>A Neup Group Standard</h3>
                            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                                {displayData.group_info}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .about-article h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 48px 0 20px;
                    color: var(--color-primary);
                }
                .about-article p {
                    margin-bottom: 24px;
                }
                .about-article ul, .about-article ol {
                    margin-bottom: 24px;
                    padding-left: 24px;
                }
                .about-article li {
                    margin-bottom: 8px;
                }
                .about-article strong {
                    color: var(--color-primary);
                }
            `}} />
        </main>
    );
}
