'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export function HeaderProfile({ user }: { user: any }) {
    const [stage, setStage] = useState(1);
    const [animationStarted, setAnimationStarted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const animationStartAtRef = useRef<number | null>(null);
    const timeoutsRef = useRef<{ stage2?: number; stage3?: number; stage4?: number }>({});

    const isLoggedIn = !!user;
    
    // Determine profile picture validity
    const profilePictureSrc =
        typeof user?.profile_picture === 'string' ? user.profile_picture.trim() : '';
    const hasValidProfileImage =
        profilePictureSrc.length > 0 &&
        (profilePictureSrc.startsWith('http://') ||
            profilePictureSrc.startsWith('https://') ||
            profilePictureSrc.startsWith('/') ||
            profilePictureSrc.startsWith('data:image/'));
    const canShowRealProfile = isLoggedIn && hasValidProfileImage && !imageFailed;

    // Determine display name
    const displayName = (() => {
        if (!isLoggedIn) return 'Guest';
        const raw = typeof user?.name === 'string' ? user.name.trim() : '';
        if (!raw) return user?.username || 'User';
        return raw.split(/\s+/)[0] || raw;
    })();

    // Detect desktop (client only)
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 769);
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Animation logic - Start animation on mount
    useEffect(() => {
        if (animationStarted) return;

        setAnimationStarted(true);
        setStage(1);
        animationStartAtRef.current = Date.now();
    }, [animationStarted]);

    // Schedule stages
    useEffect(() => {
        if (!animationStarted || !animationStartAtRef.current) return;

        const elapsed = Date.now() - animationStartAtRef.current;
        const schedule = (key: 'stage2' | 'stage3' | 'stage4', targetStage: number, msFromStart: number, enabled: boolean) => {
            const existing = timeoutsRef.current[key];
            if (existing) window.clearTimeout(existing);
            delete timeoutsRef.current[key];

            if (!enabled || stage >= targetStage) return;

            const remaining = Math.max(0, msFromStart - elapsed);
            timeoutsRef.current[key] = window.setTimeout(() => {
                setStage((prev) => (prev < targetStage ? targetStage : prev));
            }, remaining);
        };

        schedule('stage2', 2, 100, true);
        schedule('stage3', 3, 800, true);
        // Stage 4 is just for desktop expansion
        schedule('stage4', 4, 1600, isDesktop);

        return () => {
             // Cleanup handled via refs, but good practice
        };
    }, [animationStarted, isDesktop, stage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
             if (timeoutsRef.current.stage2) window.clearTimeout(timeoutsRef.current.stage2);
             if (timeoutsRef.current.stage3) window.clearTimeout(timeoutsRef.current.stage3);
             if (timeoutsRef.current.stage4) window.clearTimeout(timeoutsRef.current.stage4);
        };
    }, []);


    // --- RENDER LOGIC BASED ON STAGE ---
    
    // 1. Icon Selection
    const renderIcon = () => {
        // Stage 1 & 2: Always Default Neutral Icon
        if (stage < 3) {
            return (
                <div className="default-icon neutral">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            );
        }

        // Stage 3+: Final Icon
        if (!isLoggedIn) {
            // Guest Icon
            return (
                 <div className="default-icon guest">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                        <circle cx="19" cy="5" r="3" fill="#900000" stroke="none"></circle>
                        <text x="19" y="8" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold">?</text>
                    </svg>
                </div>
            );
        }

        if (canShowRealProfile) {
            // Real User Image
            return (
                 <div className="real-profile">
                    <img
                        src={profilePictureSrc}
                        alt={displayName}
                        className="profile-image"
                        onError={() => setImageFailed(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                </div>
            );
        }

        // Default User Icon (Logged in but no pic)
        return (
            <div className="default-icon user">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        );
    };

    return (
        <Link
            href={isLoggedIn ? `/@${user.username}` : '/auth/login'}
            className={`header-profile-link stage-${stage} ${!isLoggedIn ? 'logged-out' : ''}`}
            style={{ textDecoration: 'none' }}
        >
            <div className="profile-container">
                <div className="avatar-wrapper">
                    {/* Render the Icon Logic */}
                    {renderIcon()}

                    {/* Green Tick Overlay (Stage 2 Only) */}
                    <div className={`green-overlay ${stage === 2 ? 'visible' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>

                {/* Name (Stage 3+ Desktop Only) */}
                {stage >= 3 && (
                     <span className="profile-name">{displayName}</span>
                )}
            </div>

            <style jsx>{`
                .header-profile-link {
                    display: block;
                    transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
                }
                .header-profile-link:active {
                    transform: scale(0.96);
                }

                .profile-container {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    min-width: 40px;
                    height: 40px;
                    justify-content: center;
                    overflow: hidden;
                    background: #e2e8f0; /* Default background */
                }

                .avatar-wrapper {
                    position: relative;
                    width: 32px;
                    height: 32px;
                    flex-shrink: 0;
                }

                .default-icon {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    animation: fadeIn 0.3s ease;
                }
                
                .default-icon.neutral {
                     background: #900000;
                }
                
                .default-icon.user {
                     background: #900000;
                }

                .default-icon.guest {
                    background: #cbd5e1;
                    color: #64748b;
                }

                .green-overlay {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0;
                    transform: scale(0.5);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 2;
                }
                
                .green-overlay.visible {
                    opacity: 1;
                    transform: scale(1);
                }

                .real-profile {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    animation: fadeIn 0.5s ease;
                    z-index: 1;
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .profile-name {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: black;
                    max-width: 0;
                    overflow: hidden;
                    white-space: nowrap;
                    opacity: 0;
                    transition: all 0.5s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* DESKTOP STYLES */
                @media (min-width: 769px) {
                    .stage-4 .profile-container {
                        width: auto;
                        padding-right: 16px;
                        gap: 8px;
                        justify-content: flex-start;
                        border-radius: 24px;
                    }

                    .stage-4 .profile-name {
                        max-width: 150px;
                        opacity: 1;
                    }
                }

                /* MOBILE STYLES */
                @media (max-width: 768px) {
                    .profile-name {
                        display: none !important;
                    }
                    
                    .stage-4 .profile-container {
                        /* Keep circle on mobile */
                        width: 40px; 
                        padding: 4px;
                        gap: 0;
                    }
                }
            `}</style>
        </Link>
    );
}