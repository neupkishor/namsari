'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { deleteSupportArticle } from './actions';

export default function SupportListClient({ initialArticles }: { initialArticles: any[] }) {
    const [articles, setArticles] = useState(initialArticles);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this support article?')) return;

        try {
            await deleteSupportArticle(id);
            setArticles(articles.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete support article');
        }
    };

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>ARTICLE TITLE</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>CATEGORY</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>STATUS</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>UPDATED</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No support articles found. Start by creating one.
                            </td>
                        </tr>
                    ) : (
                        articles.map((article) => (
                            <tr key={article.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '16px 24px' }}>
                                    <Link href={`/manage/support/${article.id}`} style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                        {article.title}
                                    </Link>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        /{article.slug}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                                        background: '#f1f5f9', color: '#475569'
                                    }}>
                                        {article.category}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                                        background: article.status === 'published' ? '#dcfce7' : '#fee2e2',
                                        color: article.status === 'published' ? '#166534' : '#991b1b'
                                    }}>
                                        {article.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    {new Date(article.updated_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <Link href={`/manage/support/${article.id}`} style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Edit</Link>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', padding: '0' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <style jsx>{`
                .table-row-hover:hover {
                    background: #f8fafc;
                }
            `}</style>
        </div>
    );
}
