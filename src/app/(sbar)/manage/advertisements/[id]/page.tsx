import { getAdDetails, getAdAnalytics } from '@/actions/ads';
import { notFound } from 'next/navigation';
import DateFilter from '@/components/ads/DateFilter';

export default async function AdReportPage({ params, searchParams }: any) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const id = parseInt(resolvedParams.id);
    const days = parseInt(resolvedSearchParams.days || '30');

    if (isNaN(id)) return notFound();

    const ad = await getAdDetails(id);
    if (!ad) return notFound();

    const stats = await getAdAnalytics(id, days);

    return (
        <div className="layout-container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        Ad Performance Report
                    </h1>
                    <DateFilter />
                </div>
                
                <div className="card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                        <img src={ad.image} alt={ad.title || 'Ad'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{ad.title}</h2>
                        <a href={ad.link || '#'} target="_blank" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>{ad.link}</a>
                        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                            Status: <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{ad.status}</span> • Position: {ad.position}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        {stats.totalViews}
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Total Views</div>
                </div>
                
                <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        {stats.uniqueCustomers}
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Unique Customers</div>
                </div>

                <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        {stats.averageViews}
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Avg. Views per User</div>
                </div>

                <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#16a34a' }}>
                        {stats.ctr}%
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Click Through Rate</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
                        Device Breakdown
                    </h3>
                    {Object.keys(stats.devices).length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No data available yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.entries(stats.devices).map(([device, count]) => (
                                <div key={device} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{device}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, marginLeft: '16px' }}>
                                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${(count / stats.totalViews) * 100}%`, 
                                                height: '100%', 
                                                background: 'var(--color-primary)' 
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', color: '#64748b', minWidth: '40px', textAlign: 'right' }}>
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
                        Click Performance
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b' }}>Total Clicks</span>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{stats.totalClicks}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b' }}>Unique Clickers</span>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{stats.uniqueClicks}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Engagement Rate</span>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#16a34a' }}>
                                {stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
