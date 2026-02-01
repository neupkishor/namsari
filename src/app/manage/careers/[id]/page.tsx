import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobListing } from '../actions';
import JobDetailClient from './JobDetailClient';

export default async function JobEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const job = await getJobListing(parseInt(id));

    if (!job) return notFound();

    return (
        <div style={{ maxWidth: '1200px' }}>
            <header style={{ marginBottom: '32px' }}>
                <Link href="/manage/careers" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    ← Back to Job Listings
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '8px' }}>{job.title}</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Manage this job listing and its {job.applications.length} applicants.</p>
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: '8px', background: job.status === 'open' ? '#dcfce7' : '#fee2e2', color: job.status === 'open' ? '#166534' : '#991b1b', fontWeight: '700', fontSize: '0.9rem' }}>
                        {job.status.toUpperCase()}
                    </div>
                </div>
            </header>

            <JobDetailClient job={job} />
        </div>
    );
}
