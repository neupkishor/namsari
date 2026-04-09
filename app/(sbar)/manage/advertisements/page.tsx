import { getAds } from '@/actions/ads';
import { getSession } from '@/lib/auth';
import CreateAdForm from '@/components/ads/CreateAdForm';
import AdActions from '@/components/ads/AdActions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdsPage() {
    const session = await getSession();
    if (!session) redirect('/auth/login');

    const isAdmin = session.type === 'admin';
    const ads = await getAds();

    return (
        <div className="layout-container" style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    Advertisement Manager
                </h1>
                {isAdmin && (
                    <Link href="/manage/advertisements/rate" className="btn-secondary">
                        Manage Rates
                    </Link>
                )}
            </div>

            <CreateAdForm />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                    {isAdmin ? 'All Advertisements' : 'Your Advertisements'}
                </h2>

                {ads.length === 0 ? (
                    <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No advertisements found. Create one to get started!
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {ads.map((ad) => {
                            let cardLink = `/manage/advertisements/${ad.id}`; // Default for users
                            
                            if (isAdmin) {
                                if (ad.status === 'pending') {
                                    cardLink = `/manage/advertisements/requests/${ad.id}`;
                                } else {
                                    cardLink = `/manage/advertisements/administer/${ad.id}`;
                                }
                            }

                            return (
                                <div key={ad.id} className="card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <Link href={cardLink} style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'block' }}>
                                        <img src={ad.image} alt={ad.title || 'Ad'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Link>
                                    
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <Link href={cardLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
                                                        {ad.title || 'Untitled Ad'}
                                                    </h3>
                                                </Link>
                                                <a href={ad.link || '#'} target="_blank" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    {ad.link}
                                                </a>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ 
                                                    padding: '4px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.85rem', 
                                                    fontWeight: '600',
                                                    background: ad.status === 'active' ? '#dcfce7' : ad.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                                    color: ad.status === 'active' ? '#166534' : ad.status === 'rejected' ? '#991b1b' : '#854d0e',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {ad.status}
                                                </span>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                                    {new Date(ad.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {ad.rejectionReason && (
                                            <div style={{ marginTop: '12px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
                                                <strong>Rejected:</strong> {ad.rejectionReason}
                                            </div>
                                        )}

                                        <div style={{ marginTop: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#64748b' }}>
                                                <span>👁️ <strong>{ad.views}</strong> Views</span>
                                                <span>🖱️ <strong>{ad.clicks}</strong> Clicks</span>
                                            </div>
                                            
                                            <div style={{ marginLeft: 'auto' }}>
                                            {isAdmin ? (
                                                <Link 
                                                    href={cardLink} 
                                                    className="btn-secondary" 
                                                    style={{ 
                                                        padding: '8px 16px', 
                                                        fontSize: '0.9rem', 
                                                        textDecoration: 'none',
                                                        background: ad.status === 'pending' ? '#2563eb' : undefined,
                                                        color: ad.status === 'pending' ? 'white' : undefined,
                                                        border: ad.status === 'pending' ? 'none' : undefined
                                                    }}
                                                >
                                                    {ad.status === 'pending' ? 'Review Request' : 'Administer'}
                                                </Link>
                                            ) : (
                                                <Link href={`/manage/advertisements/${ad.id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                                    View Report
                                                </Link>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
