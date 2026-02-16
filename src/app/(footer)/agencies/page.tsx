import prisma from '@/lib/prisma';
import { Header } from '@/components/menu/Header';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function AgenciesPage() {
    const session = await getSession();
    const currentUserId = session ? parseInt(session.id) : null;
    const currentUser = currentUserId ? await prisma.account.findUnique({ where: { id: currentUserId } }) : null;

    // Fetch all users with account_type = 'agency'
    const agencies = await prisma.account.findMany({
        where: {
            type: 'agency',
            status: 'active'
        },
        orderBy: {
            created_on: 'desc'
        },
        include: {
            _count: {
                select: { listedProperties: true }
            }
        }
    });

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Header user={currentUser} />

            <div className="layout-container" style={{ padding: '100px 24px 80px' }}>
                <div style={{ marginBottom: '40px', maxWidth: '600px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                        Partner Agencies
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                        Connect with top real estate professionals.
                    </p>
                </div>

                {agencies.length === 0 ? (
                    <div style={{ padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>No Agencies Found</h3>
                        <p style={{ color: '#64748b' }}>We are currently onboarding new partners. Please check back later.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                        {agencies.map((agency: any) => (
                            <Link
                                href={`/@${agency.username}`}
                                key={agency.id}
                                className="agency-card"
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'block'
                                }}
                            >
                                <div style={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    height: '100%',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            background: '#f1f5f9',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {agency.profile_picture ? (
                                                <img src={agency.profile_picture} alt={agency.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                                    {(agency.name || 'A')[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>{agency.name}</h3>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>@{agency.username}</div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '24px',
                                        paddingBottom: '16px',
                                        marginBottom: '16px',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{agency._count.listedProperties}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '6px' }}>Listings</span>
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{new Date(agency.created_on).getFullYear()}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '6px' }}>Joined</span>
                                        </div>
                                    </div>

                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        marginBottom: '0',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {agency.bio || 'Professional real estate agency.'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .agency-card:hover > div {
                    border-color: var(--color-primary);
                    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }
            `}} />
        </main>
    );
}
