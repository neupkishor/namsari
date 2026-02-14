import React from 'react';
import Link from 'next/link';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileTabs from '@/app/(profile)/[@username]/ProfileTabs';

interface ProfileHeaderProps {
    user: any;
    isOwner: boolean;
}

export default function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
    return (
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

                        {isOwner && (
                            <Link href={`/@${user.username}/edit`}>
                                <button style={{ padding: '12px 24px', background: '#f1f5f9', color: 'var(--color-primary-light)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                    Edit Profile
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                <ProfileTabs username={user.username} isOwner={isOwner} accountType={user.account_type} />
            </div>
            
             <style dangerouslySetInnerHTML={{
                __html: `
                .profile-header-container {
                    padding: 0 24px;
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
                    .profile-image-wrapper {
                        margin: 0 auto;
                    }
                }
            `}} />
        </div>
    );
}
