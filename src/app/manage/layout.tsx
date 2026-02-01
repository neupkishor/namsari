import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SidebarContent from './SidebarContent';

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
                        <SidebarContent />

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
