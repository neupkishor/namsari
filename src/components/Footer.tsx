"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();

    // Check if we should hide footer
    // Hidden on Manage pages, Explore (usually map-heavy), and potentially Homepage feed (handled by condition)
    const [isForceHidden, setIsForceHidden] = React.useState(false);

    React.useEffect(() => {
        const checkHidden = () => {
            setIsForceHidden(document.body.classList.contains('footer-hidden'));
        };
        checkHidden();

        // Listen for changes
        const observer = new MutationObserver(checkHidden);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const isManagePage = pathname?.startsWith('/manage');
    const isExplorePage = pathname === '/explore';

    // We also need to hide it on the homepage if it's in "Social Feed" mode.
    // However, the Footer is usually rendered at the bottom of the scroll.
    // On the Feed, scrolling is often infinite, so footer might never be seen or might conflict.
    // But since view_mode is at the app level, we might need to pass a prop or hide it specifically.

    if (isManagePage || isExplorePage || isForceHidden) return null;

    return (
        <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '100px 0 40px', marginTop: 'auto' }}>
            <div className="layout-container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '64px', marginBottom: '80px' }}>
                    {/* Brand Column */}
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '28px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            NAMSARI<span style={{ width: '8px', height: '8px', background: '#b8960c', borderRadius: '50%' }}></span>
                        </div>
                        <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '1rem', marginBottom: '32px', maxWidth: '320px' }}>
                            Defining the new standard of real estate in Nepal through transparency, premium curation, and cutting-edge technology.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <SocialIcon icon="fb" />
                            <SocialIcon icon="ig" />
                            <SocialIcon icon="tw" />
                            <SocialIcon icon="yt" />
                        </div>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '32px', letterSpacing: '0.05em' }}>PLATFORM</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <FooterLink href="/explore">Browse Properties</FooterLink>
                            <FooterLink href="/agencies">Partner Agencies</FooterLink>
                            <FooterLink href="/pricing">Listing Plans</FooterLink>
                            <FooterLink href="/post">Post Property</FooterLink>
                            <FooterLink href="/membership">Platinum Club</FooterLink>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '32px', letterSpacing: '0.05em' }}>RESOURCES</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <FooterLink href="/blog">Market Reports</FooterLink>
                            <FooterLink href="/guide">Buying Guide</FooterLink>
                            <FooterLink href="/contact">Concierge Support</FooterLink>
                            <FooterLink href="/faq">Help Center</FooterLink>
                            <FooterLink href="/privacy">Privacy Policy</FooterLink>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '32px', letterSpacing: '0.05em' }}>NEWSLETTER</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
                            Join 5,000+ investors receiving monthly market insights.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="email"
                                placeholder="Email address"
                                style={{
                                    flex: 1,
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <button style={{
                                background: '#b8960c',
                                color: 'white',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}>
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        &copy; {new Date().getFullYear()} Namsari. All rights reserved. Nepal's No. 1 Property Portal.
                    </div>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <Link href="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Terms</Link>
                        <Link href="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</Link>
                        <Link href="/security" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Security</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'all 0.2s',
            width: 'fit-content'
        }}>
            {children}
        </Link>
    );
}

function SocialIcon({ icon }: { icon: string }) {
    const icons: Record<string, string> = {
        fb: 'FACEBOOK',
        ig: 'INSTAGRAM',
        tw: 'TWITTER',
        yt: 'YOUTUBE'
    };
    return (
        <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '0.65rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '1px solid #334155'
        }}>
            {icon.toUpperCase()}
        </div>
    );
}
