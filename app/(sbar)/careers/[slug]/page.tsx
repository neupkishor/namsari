import { notFound, redirect } from 'next/navigation';
import { getJobListingBySlug } from '@/actions/careers';
import JobApplicationForm from './JobApplicationForm';
import { cookies } from 'next/headers';

export default async function PublicJobPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ step?: string, session?: string }>
}) {
    const { slug } = await params;
    const { step = '0', session: querySession } = await searchParams;
    const job = await getJobListingBySlug(slug);

    if (!job || job.status !== 'open') return notFound();

    const cookieStore = await cookies();
    let session = querySession || cookieStore.get('job_application_session')?.value;

    if (!session) {
        session = Math.random().toString(36).substring(2, 15);
        cookieStore.set('job_application_session', session, { path: '/' });
        redirect(`/careers/${slug}?step=0&session=${session}`);
    }

    const steps = JSON.parse(job.application_steps || '[]');
    const currentStepIndex = parseInt(step);

    return (
        <main style={{ minHeight: '100%', background: '#f8fafc' }}>
            <div className="mx-auto w-full max-w-[800px] px-0.5 pt-3 sm:px-6 lg:px-8" style={{ paddingBottom: '100px' }}>
                <header style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span style={{
                        padding: '6px 16px', borderRadius: '40px', background: 'var(--color-gold)', color: 'white',
                        fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                        {job.department}
                    </span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '16px', color: 'var(--color-primary)' }}>{job.title}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginTop: '12px' }}>
                        {job.location} • {job.type}
                    </p>
                </header>

                <JobApplicationForm
                    job={job}
                    steps={steps}
                    currentStepIndex={currentStepIndex}
                    session={session}
                    slug={slug}
                />
            </div>
        </main>
    );
}
