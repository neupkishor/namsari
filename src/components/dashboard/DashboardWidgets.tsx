import React from 'react';
import StatCard from './StatCard';

export function PropertyStats({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>Property Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard 
                    title="My Properties" 
                    value={stats.my} 
                    subtitle="Listed by you"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                    color="#0ea5e9"
                />
                
                {stats.agency > 0 && (
                    <StatCard 
                        title="Agency Properties" 
                        value={stats.agency} 
                        subtitle="Total agency listings"
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>}
                        color="#6366f1"
                    />
                )}

                {stats.all > 0 && (
                    <StatCard 
                        title="All Properties" 
                        value={stats.all} 
                        subtitle="Total platform listings"
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>}
                        color="#f43f5e"
                    />
                )}

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Recent Activity (Primary View)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Today</span>
                        <span style={{ fontWeight: '700', color: '#0ea5e9' }}>{stats.last1}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>This Week</span>
                        <span style={{ fontWeight: '700', color: '#0ea5e9' }}>{stats.last7}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>This Month</span>
                        <span style={{ fontWeight: '700', color: '#0ea5e9' }}>{stats.last30}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function RequirementStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <StatCard 
            title="Active Requirements" 
            value={stats.total} 
            subtitle="Posted by users/agents"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
            color="#f59e0b"
        />
    );
}

export function FeaturedStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <StatCard 
            title="Featured Properties" 
            value={stats.total} 
            subtitle="Currently promoted"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
            color="#eab308"
        />
    );
}

export function CollectionStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <StatCard 
            title="Total Collections" 
            value={stats.total} 
            subtitle="Curated lists"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
            color="#10b981"
        />
    );
}

export function AdStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <StatCard 
            title="Active Advertisements" 
            value={stats.total} 
            subtitle={`${stats.totalViews} total views`}
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>}
            color="#ec4899"
        />
    );
}

export function NewsletterStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Newsletter Growth</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>{stats.total}</span>
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>Subscribers</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '700', color: '#334155' }}>+{stats.last1}</div>
                    <div style={{ color: '#94a3b8' }}>Today</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '700', color: '#334155' }}>+{stats.last7}</div>
                    <div style={{ color: '#94a3b8' }}>7 Days</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '700', color: '#334155' }}>+{stats.last30}</div>
                    <div style={{ color: '#94a3b8' }}>30 Days</div>
                </div>
            </div>
        </div>
    );
}

export function UserStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <div style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>User Demographics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <StatCard 
                    title="Total Users" 
                    value={stats.total} 
                    trend={`+${stats.last30}`} 
                    subtitle="Last 30 days"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                    color="#6366f1"
                />
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Account Types</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Agencies</span>
                        <span style={{ fontWeight: '700', color: '#334155' }}>{stats.agency}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Independent Agents</span>
                        <span style={{ fontWeight: '700', color: '#334155' }}>{stats.agent}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Agency Agents</span>
                        <span style={{ fontWeight: '700', color: '#334155' }}>{stats.agencyAgent}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Banks</span>
                        <span style={{ fontWeight: '700', color: '#334155' }}>{stats.bank}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WebmasterStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <div style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>Traffic Analysis</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard 
                    title="Total Visits" 
                    value={stats.totalVisits} 
                    trend={`+${stats.visits30}`} 
                    subtitle="Last 30 days"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
                    color="#f43f5e"
                />
                 <StatCard 
                    title="Unique Visitors (30d)" 
                    value={stats.uniqueVisitors30} 
                    subtitle="Distinct sessions"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                    color="#f43f5e"
                />
            </div>
        </div>
    );
}

export function ContentStats({ stats, title, icon }: { stats: any, title: string, icon: React.ReactNode }) {
    if (!stats) return null;
    return (
        <StatCard 
            title={title} 
            value={stats.total} 
            trend={`+${stats.publishedLast10}`} 
            subtitle="Last 10 days"
            icon={icon}
            color="#8b5cf6"
        />
    );
}

export function CareerStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Careers</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Active Jobs</span>
                <span style={{ fontWeight: '700', color: '#334155' }}>{stats.active} / {stats.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Total Applicants</span>
                <span style={{ fontWeight: '700', color: '#0ea5e9' }}>{stats.applicants}</span>
            </div>
        </div>
    );
}

export function BankStats({ stats }: { stats: any[] }) {
    if (!stats || stats.length === 0) return null;
    return (
        <div style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>Bank Interest Rates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {stats.map((bank: any, idx: number) => (
                    <div key={idx} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{bank.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Current Rate</span>
                            <span style={{ fontWeight: '700', color: '#0ea5e9', fontSize: '1.1rem' }}>{bank.currentRate}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
