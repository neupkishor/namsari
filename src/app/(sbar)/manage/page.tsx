import React from 'react';
import { getDashboardStats } from '@/actions/dashboard';
import { switchProfileAction } from '@/actions/auth';
import {
    PropertyStats,
    RequirementStats,
    FeaturedStats,
    CollectionStats,
    AdStats,
    NewsletterStats,
    UserStats,
    WebmasterStats,
    BankStats,
    AgentStats
} from '@/components/dashboard/DashboardWidgets';

export default async function ManageDashboard() {
    const data = await getDashboardStats();
    
    if (!data) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Please log in to view the dashboard.
            </div>
        );
    }

    const { user, userStats, agenciesStats, adminStats } = data;
    const isOperatingAsAgency = user.operatingId !== null && user.operatingId !== undefined;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Welcome back, <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{user.name || user.username}</span>.
                        {isOperatingAsAgency && (
                            <span style={{ marginLeft: '8px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                                Operating as Agency
                            </span>
                        )}
                    </p>
                </div>
                {isOperatingAsAgency && (
                    <form action={async () => {
                        'use server';
                        await switchProfileAction(null);
                    }}>
                        <button 
                            type="submit" 
                            style={{ 
                                background: 'white', 
                                border: '1px solid #cbd5e1', 
                                padding: '8px 16px', 
                                borderRadius: '6px', 
                                fontWeight: '600', 
                                color: '#475569', 
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Switch to Personal Profile
                        </button>
                    </form>
                )}
            </header>

            {/* If operating as agency, ONLY show that agency's stats */}
            {isOperatingAsAgency ? (
                agenciesStats.map((item: any) => {
                    if (item.agency.id !== user.operatingId) return null;
                    
                    return (
                        <section key={item.agency.id} style={{ marginBottom: '48px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden' }}>
                                    {item.agency.profile_picture ? (
                                        <img src={item.agency.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.agency.name} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b' }}>{item.agency.name[0]}</div>
                                    )}
                                 </div>
                                 <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary)' }}>{item.agency.name}</h2>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Agency Overview (@{item.agency.username})</p>
                                 </div>
                                 
                                 <div style={{ marginLeft: 'auto' }}>
                                    <span style={{ padding: '8px 16px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Active</span>
                                 </div>
                            </div>

                            <PropertyStats stats={item.stats.properties} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                <AgentStats count={item.agentCount} />
                                {item.stats.requirements && <RequirementStats stats={item.stats.requirements} />}
                                {item.stats.featured && <FeaturedStats stats={item.stats.featured} />}
                                {item.stats.collections && <CollectionStats stats={item.stats.collections} />}
                                {item.stats.advertisements && <AdStats stats={item.stats.advertisements} />}
                            </div>
                        </section>
                    );
                })
            ) : (
                <>
                    {/* 1. User's View - Only when NOT operating as agency */}
                    <section style={{ marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Overview</h2>
                        <PropertyStats stats={userStats.properties} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            {userStats.requirements && <RequirementStats stats={userStats.requirements} />}
                            {userStats.featured && <FeaturedStats stats={userStats.featured} />}
                            {userStats.collections && <CollectionStats stats={userStats.collections} />}
                        </div>
                    </section>

                    {/* 3. Admin View - Only when NOT operating as agency */}
                    {adminStats && (
                        <section style={{ marginBottom: '48px' }}>
                            <header style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>Admin Overview</h2>
                                <p style={{ color: '#64748b' }}>Global platform statistics and management.</p>
                            </header>

                            <PropertyStats stats={adminStats.properties} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                {adminStats.requirements && <RequirementStats stats={adminStats.requirements} />}
                                {adminStats.featured && <FeaturedStats stats={adminStats.featured} />}
                                {adminStats.collections && <CollectionStats stats={adminStats.collections} />}
                                {adminStats.advertisements && <AdStats stats={adminStats.advertisements} />}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                {adminStats.webmaster && <WebmasterStats stats={adminStats.webmaster} />}
                                {adminStats.users && <UserStats stats={adminStats.users} />}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                {adminStats.newsletter && <NewsletterStats stats={adminStats.newsletter} />}
                            </div>

                            {adminStats.banks && <BankStats stats={adminStats.banks} />}
                        </section>
                    )}
                </>
            )}

            <div style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
                For more information, visit the <a href="/support" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Help Center</a>.
            </div>
        </div>
    );
}
