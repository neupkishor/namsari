import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfileAboutPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    return (
        <div className="card" style={{ padding: '32px' }}>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>About {user.name}</h2>

            <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#334155', marginBottom: '32px' }}>
                {user.bio ? (
                    user.bio.split('\n').map((paragraph, idx) => (
                        <p key={idx} style={{ marginBottom: '16px' }}>{paragraph}</p>
                    ))
                ) : (
                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                        This user hasn't written a bio yet.
                    </p>
                )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Joined</div>
                    <div style={{ fontWeight: '500' }}>{new Date(user.created_on).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Account Type</div>
                    <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>{user.account_type || 'General'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontWeight: '500', color: user.status === 'active' ? '#16a34a' : '#ca8a04', textTransform: 'capitalize' }}>{user.status}</div>
                </div>
            </div>
        </div>
    );
}
