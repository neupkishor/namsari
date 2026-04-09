import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfileAgentsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const agency = await prisma.user.findUnique({
        where: { username: decoded },
        include: {
            agents: {
                include: {
                    _count: {
                        select: { listedProperties: true }
                    }
                }
            }
        }
    });

    if (!agency) return notFound();

    const agents = agency.agents;

    if (agents.length === 0) {
        return (
            <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No agents found</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                    This agency doesn't have any agents listed yet.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {agents.map((agent: any) => (
                <Link href={`/@${agent.username}`} key={agent.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card" style={{ padding: '24px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div 
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                overflow: 'hidden', 
                                margin: '0 auto 16px',
                                backgroundColor: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem'
                            }}
                        >
                            {agent.profile_picture ? (
                                <img 
                                    src={agent.profile_picture} 
                                    alt={agent.name || 'Agent'} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                <span>{(agent.name || 'U')[0]}</span>
                            )}
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '4px' }}>{agent.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>@{agent.username}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.875rem', color: '#64748b' }}>
                            <span>🏠 {agent._count.listedProperties} Properties</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
