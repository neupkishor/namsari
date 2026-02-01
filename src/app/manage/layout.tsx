import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    const currentUser = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;

    return (
        <div className="manage-root" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            {/* Full-width Header */}
            <SiteHeader user={currentUser} />

            {/* Main Content Area inside the Centered Container */}
            <div className="layout-container">
                <div className="main-layout-wrapper">
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Link href="/manage" className="sidebar-link active">Manage</Link>
                            <Link href="/manage/properties" className="sidebar-link">Properties</Link>
                            <Link href="/manage/requirements" className="sidebar-link">Requirements</Link>
                            <Link href="/manage/featured" className="sidebar-link">Featured</Link>
                            <Link href="/manage/users" className="sidebar-link">User Management</Link>
                            <Link href="/manage/agencies" className="sidebar-link">Agencies</Link>
                            <Link href="/manage/newsletter" className="sidebar-link">Newsletter</Link>
                            <Link href="/manage/collections" className="sidebar-link">Collections</Link>
                            <a href="#" className="sidebar-link">Financials</a>
                            <div style={{ margin: '20px 24px 8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Settings
                            </div>
                            <Link href="/manage/settings" className="sidebar-link">Settings</Link>
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

                        {/* Footer moved inside main scrolling area */}
                        <footer style={{ borderTop: '1px solid var(--color-border)', padding: '24px 0', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                <span>&copy; 2026 Namsari / Neup Group Standard Layout</span>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <a href="#">Privacy</a>
                                    <a href="#">Terms</a>
                                </div>
                            </div>
                        </footer>
                    </main>
                </div>
            </div>
        </div>
    );
}
