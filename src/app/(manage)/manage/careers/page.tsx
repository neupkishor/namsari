import Link from 'next/link';
import { getJobListings } from './actions';
import JobListClient from './JobListClient';

export default async function CareersPage() {
    const jobs = await getJobListings();

    return (
        <div style={{ maxWidth: '1200px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Careers Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage your job openings and view applicants.</p>
                </div>
                <Link
                    href="/manage/careers/create"
                    className="btn-corporate"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> Post New Job
                </Link>
            </header>

            <JobListClient initialJobs={jobs} />
        </div>
    );
}
