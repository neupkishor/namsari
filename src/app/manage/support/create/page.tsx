import React from 'react';
import Link from 'next/link';
import SupportFormClient from '../SupportFormClient';

export default function CreateSupportPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <Link href="/manage/support" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    ← Back to Knowledge Base
                </Link>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Create New Article</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Draft a new help article for your users.</p>
            </header>

            <SupportFormClient isEdit={false} />
        </div>
    );
}
