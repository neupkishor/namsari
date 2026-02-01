import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSupportArticleBySlug } from '@/app/manage/support/actions';

export default async function SupportArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch user for header
    const session = await getSession();
    let user = null;
    if (session?.id) {
        user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    }

    // Fetch article
    let article = null;
    try {
        article = await getSupportArticleBySlug(slug);
    } catch (e) {
        console.error("Failed to fetch article", e);
    }

    if (!article || article.status !== 'published') return notFound();

    return (
        <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <SiteHeader user={user} />

            <div className="layout-container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '800px' }}>
                <Link href="/support" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: '600', marginBottom: '32px' }}>
                    ← Back to Help Center
                </Link>

                <article className="card" style={{ padding: '48px' }}>
                    <header style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '32px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{article.emoji || '📄'}</div>
                        <span style={{
                            display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
                            background: '#f1f5f9', color: '#475569', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px'
                        }}>
                            {article.category}
                        </span>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', lineHeight: '1.2' }}>
                            {article.title}
                        </h1>
                        <div style={{ marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            Last updated: {new Date(article.updated_at).toLocaleDateString()}
                        </div>
                    </header>

                    <div
                        className="prose"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#334155' }}
                    />
                </article>

                <div style={{ marginTop: '80px', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Still need help?</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Our support team is just a click away.</p>
                    <a href="mailto:support@namsari.com" className="btn-corporate">Contact Support</a>
                </div>
            </div>

        </main>
    );
}
