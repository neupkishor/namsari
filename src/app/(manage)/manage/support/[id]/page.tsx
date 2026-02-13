import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupportArticle } from '../actions';
import SupportFormClient from '../SupportFormClient';

export default async function EditSupportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let article = null;
    try {
        article = await getSupportArticle(Number(id));
    } catch (e) {
        console.error("Failed to fetch article", e);
    }

    if (!article) return notFound();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Edit Support Article</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Update support article content and metadata.</p>
            </header>

            <SupportFormClient initialData={article} isEdit={true} />
        </div>
    );
}
