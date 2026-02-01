import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getJobListings } from '@/app/manage/careers/actions';

export default async function CareersPage() {
    const session = await getSession();
    let user = null;
    if (session?.id) {
        user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    }

    // Fetch real jobs from the database
    let positions = [];
    try {
        positions = await getJobListings();
    } catch (e) {
        console.error("Failed to fetch jobs", e);
    }

    // Filter only open positions for public view
    const openPositions = positions.filter((p: any) => p.status === 'open');

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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>Open Roles ({openPositions.length})</h2>
                    {openPositions.length === 0 ? (
                        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                            We don't have any open roles at the moment. Please check back later!
                        </div>
                    ) : (
                        openPositions.map((pos: any) => (
                            <Link
                                href={`/careers/${pos.slug}`}
                                key={pos.id}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="card job-card" style={{
                                    padding: '32px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-primary)' }}>{pos.title}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{pos.department} • {pos.location} • {pos.type}</p>
                                    </div>
                                    <div style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        padding: '10px 24px',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        color: 'var(--color-gold)',
                                        fontSize: '0.9rem'
                                    }}>
                                        Apply Now →
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
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
