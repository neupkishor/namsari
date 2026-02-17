'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function HeaderProfile({ user }: { user: any }) {
    const isLoggedIn = !!user;
    
    // Initial State
    const [overlayOpacity, setOverlayOpacity] = useState(0);
    const [imageSrc, setImageSrc] = useState('/assets/users/notloggedin.png');
    
    // Determine target profile picture
    const profilePictureSrc =
        typeof user?.profile_picture === 'string' ? user.profile_picture.trim() : '';
    const hasValidProfileImage =
        profilePictureSrc.length > 0 &&
        (profilePictureSrc.startsWith('http://') ||
            profilePictureSrc.startsWith('https://') ||
            profilePictureSrc.startsWith('/') ||
            profilePictureSrc.startsWith('data:image/'));
            
    const targetImage = isLoggedIn && hasValidProfileImage ? profilePictureSrc : '/assets/users/notloggedin.png';

    useEffect(() => {
        const startAnimation = async () => {
            // Stay for 800ms
            await new Promise(r => setTimeout(r, 800));
            
            // Overlay opacity to 1 (500ms transition)
            setOverlayOpacity(1);
            await new Promise(r => setTimeout(r, 500));
            
            // Overlay stays for 800ms
            await new Promise(r => setTimeout(r, 800));
            
            // Swap image
            if (isLoggedIn) {
                setImageSrc(targetImage);
            }
            
            // Overlay opacity to 0 (500ms transition)
            setOverlayOpacity(0);
        };

        startAnimation();
    }, [isLoggedIn, targetImage]);

    return (
        <Link
            href={isLoggedIn ? `/@${user.username}` : '/auth/login'}
            className="header-profile-link"
            style={{ textDecoration: 'none', width: '100%', height: '100%', display: 'block' }}
        >
            <div className="icon-container">
                {/* Element 2: User Image (Bottom Layer) */}
                <img 
                    src={imageSrc} 
                    alt="Profile" 
                    className="element-2"
                />

                {/* Element 1: Overlay (Top Layer) */}
                <img 
                    src="/assets/users/overlay.png" 
                    alt="Overlay" 
                    className="element-1"
                    style={{ opacity: overlayOpacity }}
                />
            </div>
            
            <style jsx>{`
                .icon-container {
                    width: 100%;
                    height: 100%;
                    background-color: #e2e8f0;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    border-radius: 50%; /* Inherit shape from parent usually, but good to enforce if container is circle */
                }

                .element-1 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 2;
                    transition: opacity 500ms ease;
                }

                .element-2 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 1;
                    /* No transition needed for swap as it happens behind overlay */
                }
            `}</style>
        </Link>
    );
}