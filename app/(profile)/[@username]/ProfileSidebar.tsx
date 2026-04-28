'use client';

import { usePathname } from 'next/navigation';
import { User } from '@prisma/client';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';

export default function ProfileSidebar({ user, listingsCount, rating = 0, reviewCount = 0, isOwner = false }: { user: User, listingsCount: number, rating?: number, reviewCount?: number, isOwner?: boolean }) {
    const pathname = usePathname();

    const isHiddenOnMobile = pathname?.endsWith('/saved') || pathname?.endsWith('/reviews');

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .mobile-hidden-sidebar {
                        display: none !important;
                    }
                }

                .profile-sidebar-section {
                    padding: 28px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                }

                .profile-sidebar-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .profile-sidebar-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    color: #475569;
                    font-size: 0.95rem;
                    line-height: 1.6;
                }

                .profile-sidebar-icon {
                    width: 24px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.05rem;
                    margin-top: 2px;
                }

                .profile-sidebar-label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 2px;
                }

                .profile-sidebar-value {
                    color: #475569;
                    font-weight: 500;
                    word-break: break-word;
                }

                .profile-sidebar-link {
                    color: var(--color-primary-light);
                    text-decoration: none;
                }

                .profile-performance-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                    padding-top: 4px;
                }

                .profile-performance-item {
                    text-align: left;
                }

                .profile-performance-value {
                    font-size: 1.85rem;
                    line-height: 1;
                    font-weight: 800;
                    color: var(--color-primary);
                    margin-bottom: 6px;
                }

                .profile-performance-label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #64748b;
                }

                @media (max-width: 1024px) {
                    .profile-performance-grid {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }
                }
            `}} />
            <aside className={`profile-sidebar ${isHiddenOnMobile ? 'mobile-hidden-sidebar' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card profile-sidebar-section">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary-light)' }}>
                        General Information
                    </h3>
                    <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
                        {user.bio || (user.type === 'bank' 
                            ? `${user.name} offers a range of banking services including home loans and property financing.`
                            : `Professional ${user.type === 'agency' ? 'real estate agency' : 'real estate agent'} dedicated to providing the best property services in the region.`
                        )}
                    </p>

                    <div className="profile-sidebar-list">
                        <div className="profile-sidebar-row">
                            <div className="profile-sidebar-icon">📧</div>
                            <div>
                                <div className="profile-sidebar-label">Email</div>
                                <a href={`mailto:${user.email || `${user.username}@namsari.com`}`} className="profile-sidebar-value profile-sidebar-link">
                                    {user.email || `${user.username}@namsari.com`}
                                </a>
                            </div>
                        </div>
                        <div className="profile-sidebar-row">
                            <div className="profile-sidebar-icon">📱</div>
                            <div>
                                <div className="profile-sidebar-label">Phone</div>
                                <a href={`tel:${user.contact_number || ''}`} className="profile-sidebar-value profile-sidebar-link">
                                    {user.contact_number || '+977-XXXXXXXXXX'}
                                </a>
                            </div>
                        </div>
                        <div className="profile-sidebar-row">
                            <div className="profile-sidebar-icon">📍</div>
                            <div>
                                <div className="profile-sidebar-label">Location</div>
                                <div className="profile-sidebar-value">Kathmandu, Nepal</div>
                            </div>
                        </div>
                        <div
                            className="profile-sidebar-row"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                navigator.clipboard.writeText(`https://namsari.com/@${user.username}`);
                                alert('Profile link copied to clipboard!');
                            }}
                            title="Click to copy link"
                        >
                            <div className="profile-sidebar-icon">🔗</div>
                            <div>
                                <div className="profile-sidebar-label">Profile Link</div>
                                <div className="profile-sidebar-value profile-sidebar-link">
                                    namsari.com/@{user.username}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {user.type !== 'bank' && (
                    <div className="card profile-sidebar-section">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary-light)' }}>Performance</h3>
                        <div className="profile-performance-grid">
                            <div className="profile-performance-item">
                                <div className="profile-performance-value">{listingsCount}</div>
                                <div className="profile-performance-label">Listings</div>
                            </div>
                            <div className="profile-performance-item">
                                <div className="profile-performance-value">{reviewCount}</div>
                                <div className="profile-performance-label">Reviews</div>
                            </div>
                            <div className="profile-performance-item">
                                <div className="profile-performance-value">{rating > 0 ? rating.toFixed(1) : '-'}</div>
                                <div className="profile-performance-label">Rating</div>
                            </div>
                        </div>
                        
                        <Link href={`/@${user.username}/reviews`} style={{ 
                            display: 'block', 
                            textAlign: 'center',
                            marginTop: '20px',
                            padding: '12px 16px',
                            background: '#f8fafc',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            color: 'var(--color-text-muted)',
                            fontWeight: '600', 
                            fontSize: '0.9rem',
                            textDecoration: 'none'
                        }}>
                            Write a Review
                        </Link>
                    </div>
                )}

                {isOwner && (
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'white',
                                border: '1px solid #fecaca',
                                borderRadius: '12px',
                                color: '#ef4444',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <span>🚪</span> Log Out
                        </button>
                    </form>
                )}
            </aside>
        </>
    );
}
