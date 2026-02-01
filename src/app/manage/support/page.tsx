import React from 'react';
import Link from 'next/link';
import { getSupportArticles } from './actions';
import SupportListClient from './SupportListClient';

export default async function SupportManagementPage() {
    let articles = [];
    try {
        articles = await getSupportArticles();
    } catch (e) {
        console.error("Failed to fetch support articles", e);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Support Knowledge Base</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage help articles and documentation for users.</p>
                </div>
                <Link href="/manage/support/create" className="btn-corporate" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>+</span> Create New Article
                </Link>
            </header>

            <SupportListClient initialArticles={articles} />
        </div>
    );
}
