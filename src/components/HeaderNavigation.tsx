'use client';

import React from 'react';
import Link from 'next/link';

function DesktopHeader({ user, fullWidth, isActive }: { user?: any, fullWidth?: boolean, isActive: boolean }) {
    if (!isActive) return null;
    return (
        <div className={fullWidth ? "" : "layout-container"} style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: fullWidth ? '0 40px' : '0 24px',
            maxWidth: fullWidth ? 'none' : 'var(--container-max)',
            margin: '0 auto'
        }}>
            <Link href="/" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                Namsari<span style={{ color: 'var(--color-gold)', marginLeft: '1px' }}>.</span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="desktop-search" style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '600px', margin: '0 24px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                    <input
                        type="text"
                        placeholder="Search properties..."
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 42px',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            color: 'var(--color-text-main)',
                            fontFamily: 'inherit'
                        }}
                    />
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8'
                        }}
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
            </div>

            {/* Desktop Navigation */}
            <HeaderDesktopNavigation user={user} />
        </div>
    );
}

function MobileHeader({ user, isActive }: { user?: any, isActive: boolean }) {
    if (!isActive) return null;
    return (
        <div className="layout-container" style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            gap: '16px'
        }}>
             <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-primary)', textDecoration: 'none', lineHeight: '1', flexShrink: 0 }}>
                N<span style={{ color: 'var(--color-gold)' }}>.</span>
            </Link>

            <div style={{ flex: 1, position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search..."
                    style={{
                        width: '100%',
                        padding: '8px 16px 8px 36px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '0.9rem',
                        outline: 'none',
                        color: 'var(--color-text-main)'
                    }}
                />
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                    }}
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>

            <HeaderMobileNavigation user={user} />
        </div>
    );
}

export function HeaderNavigation({ user, fullWidth, children }: { user?: any, fullWidth?: boolean, children?: React.ReactNode }) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <header className="header-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: 'var(--header-height)',
            background: '#ffffff',
            borderBottom: '1px solid transparent',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            zIndex: 1000
        }}>
            <div className="desktop-header-wrapper">
                <DesktopHeader user={user} fullWidth={fullWidth} isActive={!isMobile} />
            </div>
             <div className="mobile-header-wrapper">
                <MobileHeader user={user} isActive={isMobile} />
            </div>
            {children}

            <style jsx>{`
                .desktop-header-wrapper {
                    display: ${!isMobile ? 'block' : 'none'};
                    height: 100%;
                }
                .mobile-header-wrapper {
                    display: ${isMobile ? 'block' : 'none'};
                    height: 100%;
                }

                @media (max-width: 1024px) {
                    .desktop-header-wrapper {
                        display: none !important;
                    }
                    .mobile-header-wrapper {
                        display: block !important;
                    }
                }
            `}</style>
        </header>
    );
}

export function HeaderDesktopNavigation({ user }: { user?: any }) {
    return (
        <nav className="desktop-nav" style={{ display: 'flex', gap: '8px', fontWeight: '600', fontSize: '0.9rem', alignItems: 'center' }}>
            {!user ? (
                <>
                    <Link
                        href="/login"
                        className="header-link"
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-inner)'
                            , color: 'var(--color-primary)', textDecoration: 'none', transition: 'all 0.2s'
                        }}
                    >
                        Sign In
                    </Link>
                    <Link href="/register" style={{
                        background: 'var(--color-primary)', color: 'white', padding: '8px 20px', borderRadius: 'var(--radius-inner)'
                        , textDecoration: 'none'
                    }}>
                        Register
                    </Link>
                </>
            ) : (
                <Link
                    href={`/@${user.username}`}
                    className="header-link"
                    style={{
                        padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0'
                        , color: 'var(--color-text-main)', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{user.name?.[0] || 'U'}</div>
                    )}
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                </Link>
            )}
        </nav>
    );
}

export function HeaderMobileNavigation({ user }: { user?: any }) {
    return (
        <nav className="mobile-nav" style={{ display: 'flex', alignItems: 'center' }}>
            <Link
                href={user ? `/@${user.username}` : "/login"}
                style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
                {user?.profile_picture ? (
                    <img src={user.profile_picture} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: '700' }}>
                        {user?.name?.[0] || 'U'}
                    </div>
                )}
            </Link>
        </nav>
    );
}
