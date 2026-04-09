import { getAdDetails, getAdAnalytics } from '@/actions/ads';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminAdControls from '@/components/ads/AdminAdControls';
import Link from 'next/link';

export default async function AdminAdPage({ params }: any) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const session = await getSession();

    if (!session || session.type !== 'admin') {
        redirect('/manage/advertisements');
    }

    if (isNaN(id)) return notFound();

    const ad = await getAdDetails(id);
    if (!ad) return notFound();

    const stats = await getAdAnalytics(id, 30); // 30 days default

    return (
        <div className="layout-container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <Link href="/manage/advertisements" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '16px', textDecoration: 'none', fontWeight: '500' }}>
                    ← Back to Advertisements
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        Administer Advertisement
                    </h1>
                    <span style={{ 
                        padding: '6px 16px', 
                        borderRadius: '20px', 
                        fontSize: '0.9rem', 
                        fontWeight: '600',
                        background: ad.status === 'active' ? '#dcfce7' : ad.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                        color: ad.status === 'active' ? '#166534' : ad.status === 'rejected' ? '#991b1b' : '#854d0e',
                        textTransform: 'uppercase'
                    }}>
                        {ad.status}
                    </span>
                </div>
            </div>

            <div className="card" style={{ padding: '24px', display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                    <img src={ad.image} alt={ad.title || 'Ad'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{ad.title}</h2>
                    <a href={ad.link || '#'} target="_blank" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>{ad.link}</a>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                        Created: {new Date(ad.created_at).toLocaleDateString()} • By: {ad.user?.name}
                    </div>
                </div>
            </div>

            {/* Quick Stats for Admin */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalViews}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Views</div>
                </div>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalClicks}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Clicks</div>
                </div>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.ctr}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CTR</div>
                </div>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>${ad.budget}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Budget</div>
                </div>
            </div>

            {/* Admin Controls */}
            <AdminAdControls ad={ad} />
        </div>
    );
}