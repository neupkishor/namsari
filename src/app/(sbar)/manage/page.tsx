import React from 'react';
import { getDashboardStats } from '@/actions/dashboard';
import {
    PropertyStats,
    RequirementStats,
    FeaturedStats,
    CollectionStats,
    AdStats,
    NewsletterStats,
    UserStats,
    WebmasterStats,
    ContentStats,
    CareerStats,
    BankStats
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

    const { stats, user } = data;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Welcome back, <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{user.name || user.username}</span>. 
                    Here's what's happening today.
                </p>
            </header>

            {/* Top Row: Key Metrics */}
            <PropertyStats stats={stats.properties} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {stats.requirements && <RequirementStats stats={stats.requirements} />}
                {stats.featured && <FeaturedStats stats={stats.featured} />}
                {stats.collections && <CollectionStats stats={stats.collections} />}
                {stats.advertisements && <AdStats stats={stats.advertisements} />}
            </div>

            {/* Middle Section: Complex Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {stats.webmaster && <WebmasterStats stats={stats.webmaster} />}
                {stats.users && <UserStats stats={stats.users} />}
            </div>

            {/* Content & Growth */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {stats.newsletter && <NewsletterStats stats={stats.newsletter} />}
                
                {stats.career && <CareerStats stats={stats.career} />}

                {stats.support && (
                    <ContentStats 
                        title="Support Articles" 
                        stats={stats.support} 
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                    />
                )}
                
                {stats.blog && (
                    <ContentStats 
                        title="Blog Posts" 
                        stats={stats.blog} 
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>}
                    />
                )}
            </div>

            {/* Bank Stats Row */}
            {stats.banks && <BankStats stats={stats.banks} />}
        </div>
    );
}
