import React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function CareersPage() {
    const session = await getSession();
    let user = null;
    if (session?.id) {
        user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    }

    const positions = [
        { title: 'Senior Full Stack Engineer', location: 'Remote / Kathmandu', department: 'Engineering' },
        { title: 'Real Estate Data Analyst', location: 'Kathmandu', department: 'Operations' },
        { title: 'Community Growth Manager', location: 'Remote', department: 'Marketing' }
    ];

    return (
        <main style={{ background: 'white', minHeight: '100vh' }}>
            <SiteHeader user={user} />
            <div className="layout-container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '900px' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary)' }}>
                        Build the future of Real Estate.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        Join a team of engineers, designers, and real estate experts working to modernize the property market in Nepal.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>Open Roles</h2>
                    {positions.map((pos, i) => (
                        <div key={i} className="card" style={{
                            padding: '32px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'border-color 0.2s'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{pos.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{pos.department} • {pos.location}</p>
                            </div>
                            <button style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '80px', padding: '60px', background: 'var(--color-primary)', borderRadius: '32px', color: 'white', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '16px' }}>Don't see a fit?</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '32px', opacity: 0.9 }}>
                        We are always looking for talented individuals who are passionate about urban development and technology.
                    </p>
                    <a href="mailto:careers@namsari.com" style={{
                        display: 'inline-block',
                        background: 'white',
                        color: 'var(--color-primary)',
                        padding: '16px 32px',
                        borderRadius: '16px',
                        fontWeight: '700',
                        textDecoration: 'none'
                    }}>
                        Send us your CV
                    </a>
                </div>
            </div>
        </main>
    );
}
