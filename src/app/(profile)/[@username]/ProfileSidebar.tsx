'use client';

import { usePathname } from 'next/navigation';
import { User } from '@prisma/client';

import Link from 'next/link';

export default function ProfileSidebar({ user, listingsCount, rating = 0, reviewCount = 0 }: { user: User, listingsCount: number, rating?: number, reviewCount?: number }) {
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
            `}} />
            <aside className={`profile-sidebar ${isHiddenOnMobile ? 'mobile-hidden-sidebar' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary-light)' }}>
                        {user.type === 'bank' ? 'Contact Details' : 'Introduction'}
                    </h3>
                    <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
                        {user.bio || (user.type === 'bank' 
                            ? `${user.name} offers a range of banking services including home loans and property financing.`
                            : `Professional ${user.type === 'agency' ? 'real estate agency' : 'real estate agent'} dedicated to providing the best property services in the region.`
                        )}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '1.2rem' }}>📧</div>
                            <a href={`mailto:${user.email || `${user.username}@namsari.com`}`} style={{ fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: '500', wordBreak: 'break-all', textDecoration: 'none', cursor: 'pointer' }}>
                                {user.email || `${user.username}@namsari.com`}
                            </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '1.2rem' }}>📱</div>
                            <a href={`tel:${user.contact_number || ''}`} style={{ fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: '500', textDecoration: 'none', cursor: 'pointer' }}>
                                {user.contact_number || '+977-XXXXXXXXXX'}
                            </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '1.2rem' }}>📍</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: '500' }}>Kathmandu, Nepal</div>
                        </div>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                            onClick={() => {
                                navigator.clipboard.writeText(`https://namsari.com/@${user.username}`);
                                alert('Profile link copied to clipboard!');
                            }}
                            title="Click to copy link"
                        >
                            <div style={{ fontSize: '1.2rem' }}>🔗</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: '600', wordBreak: 'break-all' }}>
                                namsari.com/@{user.username}
                            </div>
                        </div>
                    </div>
                </div>

                {user.type !== 'bank' && (
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary-light)' }}>Performance</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{listingsCount}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Listings</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                                    {rating > 0 ? rating.toFixed(1) : '-'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Rating</div>
                            </div>
                        </div>
                        
                        <Link href={`/@${user.username}/reviews`} style={{ 
                            display: 'block', 
                            textAlign: 'center', 
                            marginTop: '16px', 
                            padding: '10px', 
                            background: 'white', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '8px', 
                            color: 'var(--color-text-muted)', 
                            fontWeight: '600', 
                            fontSize: '0.9rem',
                            textDecoration: 'none'
                        }}>
                            Write a Review
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
