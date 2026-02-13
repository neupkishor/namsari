import Link from 'next/link';
import JobFormClient from '../JobFormClient';

export default function CreateJobPage() {
    return (
        <div style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '32px' }}>
                <Link href="/manage/careers" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    ← Back to Careers
                </Link>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '8px' }}>Post a New Job</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Fill in the details for the new job opening.</p>
            </header>

            <JobFormClient />
        </div>
    );
}
