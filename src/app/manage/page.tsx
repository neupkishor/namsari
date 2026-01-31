import React from 'react';

export default function ManageDashboard() {
    return (
        <>
            <header style={{ marginBottom: '32px' }}>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Executive Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Welcome back, administrator. Here is the operational overview for your complexes.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Total Assets</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: '600' }}>1,284</span>
                        <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>+12%</span>
                    </div>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Active Complexes</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: '600' }}>42</span>
                        <span style={{ color: 'var(--color-gold)', fontSize: '0.875rem', fontWeight: '500' }}>Stable</span>
                    </div>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Operational Revenue</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: '600' }}>$2.4M</span>
                        <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>+8.4%</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Sector Performance</h3>
                    <button className="btn-corporate" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Download Report</button>
                </div>
                <div style={{ padding: '24px' }}>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 0' }}>
                        {[60, 85, 45, 90, 70, 55, 100].map((h: number, i: number) => (
                            <div key={i} style={{ flex: 1, background: i === 6 ? 'var(--color-gold)' : 'var(--color-primary)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Recent Asset Updates</h3>
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Asset Name</th>
                                <th style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Status</th>
                                <th style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Occupancy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'The Sterling Heights', status: 'Active', eff: '98%' },
                                { name: 'Wellness Estate A', status: 'Pending', eff: '0%' },
                                { name: 'Financial District Penthouse', status: 'Active', eff: '100%' }
                            ].map((row, i: number) => (
                                <tr key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '16px 0', fontWeight: '500' }}>{row.name}</td>
                                    <td style={{ padding: '16px 0' }}>
                                        <span style={{ background: row.status === 'Active' ? '#ecfdf5' : '#fff7ed', color: row.status === 'Active' ? '#059669' : '#ea580c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 0' }}>{row.eff}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
