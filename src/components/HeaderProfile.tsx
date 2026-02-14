'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function HeaderProfile({ user }: { user: any }) {
    const [stage, setStage] = useState(1);
    const [animationStarted, setAnimationStarted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const isLoggedIn = !!user;
    const hasProfileImage = !!user?.profile_picture;
    const canShowRealProfile = isLoggedIn && hasProfileImage;

    // Detect desktop (client only)
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 769);
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Animation logic
    useEffect(() => {
        if (!isLoggedIn || animationStarted) return;

        setAnimationStarted(true);

        // Stage 2 – Tick
        setTimeout(() => setStage(2), 100);

        // Stage 3 – Reveal avatar only if exists
        if (hasProfileImage) {
            setTimeout(() => setStage(3), 800);
        }

        // Stage 4 – Desktop only
        if (isDesktop) {
            setTimeout(() => setStage(4), 1600);
        }
    }, [isLoggedIn, hasProfileImage, isDesktop, animationStarted]);

    // ---------------- NOT LOGGED IN ----------------
    if (!isLoggedIn) {
        return (
            <>
                <Link
                    href="/login"
                    className="header-link desktop-only"
                    style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-inner)',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    Sign In
                </Link>

                <Link
                    href="/login"
                    className="mobile-only-icon"
                    style={{ textDecoration: 'none', color: 'var(--color-text-main)' }}
                >
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                </Link>

                <Link
                    href="/register"
                    className="desktop-only"
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: 'var(--radius-inner)',
                        textDecoration: 'none'
                    }}
                >
                    Register
                </Link>
            </>
        );
    }

    // ---------------- LOGGED IN ----------------
    return (
        <Link
            href={`/@${user.username}`}
            className={`header-profile-link stage-${stage}`}
            style={{ textDecoration: 'none' }}
        >
            <div className="profile-container">
                <div className="avatar-wrapper">
                    {/* Default Icon (Only hides if real avatar exists and stage > 1) */}
                    <div
                        className={`default-icon ${
                            stage > 1 && canShowRealProfile ? 'hidden' : ''
                        }`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>

                    {/* Green Tick */}
                    <div className="green-overlay">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    {/* Real Avatar */}
                    {canShowRealProfile && (
                        <div className="real-profile">
                            <img
                                src={user.profile_picture}
                                alt={user.name}
                                className="profile-image"
                            />
                        </div>
                    )}
                </div>

                {/* Name (Stage 4 Desktop Only via CSS) */}
                <span className="profile-name">{user.name}</span>
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
                    background: #900000;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }

                .default-icon.hidden {
                    opacity: 0;
                    transform: scale(0.8);
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
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 2;
                }

                .real-profile {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0;
                    transform: scale(0.9);
                    transition: all 0.4s ease;
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

                /* DESKTOP */
                @media (min-width: 769px) {
                    .stage-2 .green-overlay {
                        opacity: 1;
                        transform: scale(1);
                    }

                    .stage-3 .green-overlay,
                    .stage-4 .green-overlay {
                        opacity: 0;
                        transform: scale(1.1);
                    }

                    .stage-3 .real-profile,
                    .stage-4 .real-profile {
                        opacity: 1;
                        transform: scale(1);
                    }

                    .stage-4 .profile-container {
                        width: auto;
                        padding-right: 16px;
                        gap: 8px;
                        justify-content: flex-start;
                        border-radius: 24px;
                        background: #e2e8f0;
                    }

                    .stage-4 .profile-name {
                        max-width: 150px;
                        opacity: 1;
                    }
                }

                /* MOBILE */
                @media (max-width: 768px) {
                    .stage-2 .green-overlay {
                        opacity: 1;
                        transform: scale(1);
                    }

                    .stage-3 .green-overlay,
                    .stage-4 .green-overlay {
                        opacity: 0;
                        transform: scale(1.1);
                    }

                    .stage-3 .real-profile,
                    .stage-4 .real-profile {
                        opacity: 1;
                        transform: scale(1);
                    }

                    .profile-name {
                        display: none;
                    }
                }
            `}</style>
        </Link>
    );
}
