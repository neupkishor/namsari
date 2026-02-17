import { getAdDetails } from '@/actions/ads';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdApprovalActions from '@/components/ads/AdApprovalActions';
import Link from 'next/link';

export default async function AdRequestPage({ params }: any) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const session = await getSession();

    if (!session || session.type !== 'admin') {
        redirect('/manage/advertisements');
    }

    if (isNaN(id)) return notFound();

    const ad = await getAdDetails(id);
    if (!ad) return notFound();

    return (
        <div className="layout-container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <Link href="/manage/advertisements" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '16px', textDecoration: 'none', fontWeight: '500' }}>
                    ← Back to Advertisements
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    Review Advertisement Request
                </h1>
            </div>

            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <div style={{ width: '300px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                        <img src={ad.image} alt={ad.title || 'Ad'} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                                {ad.title || 'Untitled Ad'}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                    padding: '4px 12px', 
                                    borderRadius: '20px', 
                                    fontSize: '0.85rem', 
                                    fontWeight: '600',
                                    background: '#fef9c3',
                                    color: '#854d0e',
                                    textTransform: 'uppercase'
                                }}>
                                    {ad.status}
                                </span>
                                <span style={{ color: '#94a3b8' }}>•</span>
                                <span style={{ color: '#64748b', fontWeight: '500' }}>Position: {ad.position}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Target URL</label>
                                <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                                    {ad.link || 'No link provided'}
                                </a>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Budget</label>
                                <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                                    ${ad.budget || 0}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Duration</label>
                                <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                                    {ad.durationDays || 0} Days
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Submitted By</label>
                                <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                                    {ad.user?.name || 'Unknown User'} ({ad.user?.email || 'No Email'})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {ad.status === 'pending' && (
                    <AdApprovalActions adId={ad.id} />
                )}
            </div>
        </div>
    );
}