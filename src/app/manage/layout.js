import React from 'react';
import Link from 'next/link';

export default function ManageLayout({ children }) {
    return (
        <div className="manage-root" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            {/* Full-width Header */}
            <header className="full-width-header">
                <div className="layout-container header-content">
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                            Namsari<span style={{ color: 'var(--color-gold)', marginLeft: '1px' }}>.</span>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: '400', fontSize: '0.9rem', marginLeft: '8px', borderLeft: '1px solid var(--color-border)', paddingLeft: '8px' }}>Management</span>
                        </span>
                    </Link>

                    <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid var(--color-border)' }} />
                    </nav>
                </div>
            </header>

            {/* Main Content Area inside the Centered Container */}
            <div className="layout-container">
                <div className="main-layout-wrapper">
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <a href="/manage" className="sidebar-link active">Dashboard</a>
                            <a href="#" className="sidebar-link">Complexes</a>
                            <a href="#" className="sidebar-link">Residential</a>
                            <a href="#" className="sidebar-link">User Management</a>
                            <a href="#" className="sidebar-link">Financials</a>
                            <div style={{ margin: '20px 24px 8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Settings
                            </div>
                            <Link href="/manage/settings" className="sidebar-link">General Settings</Link>
                            <a href="#" className="sidebar-link">API Configuration</a>
                            <a href="#" className="sidebar-link">System Logs</a>
                        </nav>

                        <div style={{ marginTop: 'auto', padding: '24px' }}>
                            <div className="card" style={{ padding: '16px', background: 'var(--color-primary)', color: 'white', fontSize: '0.85rem' }}>
                                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Support Plan</p>
                                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Enterprise Platinum</p>
                                <button style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    Contact Manager
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Body */}
                    <main className="main-body">
                        {children}
                    </main>
                </div>
            </div>

            {/* Footer also following the container rules */}
            <footer style={{ borderTop: '1px solid var(--color-border)', padding: '24px 0', marginTop: 'auto' }}>
                <div className="layout-container" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <span>&copy; 2026 Namsari / Neup Group Standard Layout</span>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
