import React from 'react';
import Link from 'next/link';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileTabs from '@/app/(profile)/[@username]/ProfileTabs';
import ProfileCoverUploadButton from './ProfileCoverUploadButton';

interface ProfileHeaderProps {
    user: any;
    isOwner: boolean;
}

export default function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
    let moreInfo: any = {};
    try {
        moreInfo = JSON.parse(user.moreInfo || '{}');
    } catch (e) {}

    const coverImage = moreInfo.cover_image || user.cover_image;
    const isAgencyOrBank = user.type === 'agency' || user.type === 'bank';
    const profileShape = isAgencyOrBank ? '12px' : '50%'; // Square-ish for organizations, circle for people

    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0 0 24px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div className="layout-container">
                {/* Cover Image */}
                <div style={{ 
                    height: '280px', 
                    background: coverImage ? `url(${coverImage}) center/cover no-repeat` : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                    borderRadius: '0 0 24px 24px', 
                    position: 'relative' 
                }}>
                    {isOwner && (
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                            <ProfileCoverUploadButton userId={user.id} />
                        </div>
                    )}
                </div>

                <div className="profile-header-container">
                    <div className="profile-info-section">
                        {/* Profile Image */}
                        <div className="profile-image-wrapper" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                             <div style={{ 
                                 padding: '6px', 
                                 background: 'white', 
                                 borderRadius: isAgencyOrBank ? '16px' : '50%',
                                 border: '1px solid #e2e8f0'
                             }}>
                                <div style={{ borderRadius: profileShape, width: '160px', height: '160px', position: 'relative', overflow: 'visible' }}>
                                    <ProfileImageUpload
                                        userId={user.id}
                                        currentImage={(user as any).profile_picture}
                                        userName={user.name}
                                        isOwner={isOwner}
                                        shape={profileShape}
                                    />
                                </div>
                             </div>
                        </div>
                        
                        <div className="profile-info-details" style={{ paddingBottom: '24px', paddingTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{user.name}</h1>
                                {moreInfo.is_verified && (
                                    <span
                                        title="Verified"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#1877f2',
                                            color: '#ffffff',
                                            clipPath: 'polygon(50% 0%, 61% 8%, 75% 3%, 81% 16%, 94% 19%, 89% 33%, 100% 43%, 91% 54%, 98% 68%, 85% 73%, 87% 87%, 73% 88%, 69% 100%, 55% 94%, 43% 100%, 34% 89%, 20% 91%, 17% 77%, 4% 71%, 10% 57%, 0% 46%, 10% 36%, 6% 22%, 20% 19%, 23% 6%, 37% 10%)',
                                            boxShadow: '0 1px 2px rgba(24,119,242,0.35)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M6 12.5l4 4L18 8.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '500' }}>@{user.username}</span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                <span style={{
                                    textTransform: 'uppercase',
                                    fontWeight: '700',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.05em',
                                    color: user.type === 'agency' ? '#0ea5e9' : user.type === 'bank' ? '#16a34a' : '#64748b'
                                }}>
                                    {user.type === 'agency' ? 'Real Estate Agency' : user.type === 'bank' ? 'Bank & Mortgage' : 'Real Estate Agent'}
                                </span>
                                {user.contact_number && (
                                    <>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>📞</span> {user.contact_number}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions" style={{ paddingBottom: '24px', paddingTop: '12px' }}>
                        {isOwner ? (
                            <Link
                                href={`/@${user.username}/edit`}
                                style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                            >
                                <span>⚙️</span> Manage Profile
                            </Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{ padding: '10px 24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    Contact {user.type === 'bank' ? 'Lender' : user.type === 'agency' ? 'Agency' : 'Agent'}
                                </button>
                                {user.type === 'bank' && (
                                     <button style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                        Loan Calculator
                                     </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <ProfileTabs username={user.username} isOwner={isOwner} accountType={user.type} />
            </div>
            
             <style dangerouslySetInnerHTML={{
                __html: `
                .profile-header-container {
                    padding: 0 24px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
                .profile-info-section {
                    display: flex;
                    align-items: flex-start;
                    gap: 24px;
                }
                .profile-image-wrapper {
                    flex-shrink: 0;
                }
                
                @media (max-width: 768px) {
                    .profile-header-container {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    .profile-info-section {
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                        gap: 12px;
                    }
                    .profile-info-details {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding-top: 0 !important;
                    }
                    .profile-actions {
                        width: 100%;
                        justify-content: center;
                        padding-top: 16px !important;
                    }
                }
            `}} />
        </div>
    );
}
