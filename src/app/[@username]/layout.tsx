import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ProfileImageUpload from './ProfileImageUpload';
import { SiteHeader } from '@/components/SiteHeader';
import ProfileTabs from './ProfileTabs';
import ProfileSidebar from './ProfileSidebar';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfileLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    const session = await getSession();
    const currentUserId = session ? parseInt(session.id) : null;
    const currentUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    const isOwner = session?.id === user.id.toString();

    // Fetch stats for sidebar
    const listingsCount = await prisma.property.count({
        where: { listedById: user.id }
    });

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <SiteHeader user={currentUser} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-header-container {
                    padding: 0 24px;
                    margin-top: -80px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 24px;
                    position: relative;
                    z-index: 10;
                }
                .profile-info-section {
                    display: flex;
                    align-items: flex-end;
                    gap: 24px;
                }
                .profile-actions {
                    padding-bottom: 16px;
                    display: flex;
                    gap: 12px;
                }
                .profile-nav {
                    display: flex;
                    gap: 32px;
                    padding: 24px 24px 0;
                    overflow-x: auto;
                }
                .profile-main-grid {
                    margin-top: 24px;
                    display: grid;
                    grid-template-columns: minmax(0, 360px) minmax(0,1fr);
                    gap: 24px;
                    padding-bottom: 80px;
                }
                .profile-property-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 32px;
                }
                
                @media (max-width: 768px) {
                    .profile-header-container {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        margin-top: -60px;
                    }
                    .profile-info-section {
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                    }
                    .profile-info-details {
                       display: flex;
                       flex-direction: column;
                       align-items: center;
                    }
                    .profile-actions {
                        width: 100%;
                        justify-content: center;
                    }
                    .profile-nav {
                        justify-content: space-between;
                        gap: 16px;
                    }
                    .profile-main-grid {
                        grid-template-columns: 1fr;
                    }
                    .profile-property-grid {
                        grid-template-columns: 1fr;
                    }
                    .profile-image-wrapper {
                        margin: 0 auto;
                    }
                }
            `}} />

            {/* Profile Cover & Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container">
                    <div style={{ height: '240px', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)', borderRadius: '0 0 16px 16px', position: 'relative' }}>
                        {isOwner && (
                            <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                                <button style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                    Edit Cover
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-header-container">
                        <div className="profile-info-section">
                            <div className="profile-image-wrapper">
                                <ProfileImageUpload
                                    userId={user.id}
                                    currentImage={(user as any).profile_picture}
                                    userName={user.name}
                                    isOwner={isOwner}
                                />
                            </div>
                            <div className="profile-info-details" style={{ paddingBottom: '16px' }}>
                                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '4px', color: 'var(--color-primary-light)' }}>{user.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>@{user.username}</span>
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                    <span style={{
                                        background: user.account_type === 'agency' ? '#f0f7ff' : '#f8fafc',
                                        color: user.account_type === 'agency' ? '#0284c7' : '#475569',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.025em'
                                    }}>
                                        {user.account_type || 'General User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-actions">
                            {!isOwner && (
                                <>
                                    <button style={{ padding: '12px 24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(15, 23, 42, 0.39)' }}>
                                        Follow
                                    </button>
                                    <button style={{ padding: '12px 24px', background: '#f1f5f9', color: 'var(--color-primary-light)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                        Message
                                    </button>
                                </>
                            )}
                            {isOwner && (
                                <button style={{ padding: '12px 24px', background: '#f1f5f9', color: 'var(--color-primary-light)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    <ProfileTabs username={user.username} isOwner={isOwner} accountType={user.account_type} />
                </div>
            </div>

            <div className="layout-container profile-main-grid">
                {/* Persistent Sidebar */}
                <ProfileSidebar user={user} listingsCount={listingsCount} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
