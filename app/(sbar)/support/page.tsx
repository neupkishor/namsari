import React from 'react';
import Link from 'next/link';
import { getSupportArticles } from '@/actions/support';

export default async function SupportPage() {
    let articles: any[] = [];
    try {
        articles = await getSupportArticles('published');
    } catch (e) {
        console.error("Failed to fetch support articles", e);
    }

    return (
        <main style={{ minHeight: '100%', background: '#f8fafc' }}>
            <div className="mx-auto w-full max-w-[1000px] px-0.5 pt-3 sm:px-6 lg:px-8" style={{ paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px', color: 'var(--color-primary)' }}>
                        How can we help you?
                    </h1>
                    <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder="Search for articles..."
                            style={{
                                width: '100%', padding: '16px 24px', borderRadius: '50px',
                                border: '1px solid #e2e8f0', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
                    {articles.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px' }}>
                            No support articles found.
                        </div>
                    ) : (
                        articles.map((article: any) => (
                            <Link
                                href={`/support/${article.slug}`}
                                key={article.id}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="card support-card" style={{
                                    padding: '32px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}>
                                    <div style={{ fontSize: '2.5rem' }}>{article.emoji || '📄'}</div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        width: 'fit-content'
                                    }}>
                                        {article.category}
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', lineHeight: '1.4' }}>
                                        {article.title}
                                    </h3>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <div style={{ marginTop: '80px', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Still need help?</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Our support team is just a click away.</p>
                    <a href="mailto:support@namsari.com" className="btn-corporate">Contact Support</a>
                </div>
            </div>
        </main>
    );
}
