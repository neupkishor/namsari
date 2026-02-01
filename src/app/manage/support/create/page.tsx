import React from 'react';
import Link from 'next/link';
import SupportFormClient from '../SupportFormClient';

export default function CreateSupportPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Support Article</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Draft a new support article for your users.</p>
            </header>

            <SupportFormClient isEdit={false} />
        </div>
    );
}
