'use client';

import React from 'react';
import Link from 'next/link';

interface AgencyCardProps {
    agency: {
        id: number | string;
        name: string;
        username: string;
        logo: string;
        properties: number;
        verified?: boolean;
    };
    variant?: 'classic' | 'feed';
}

export const AgencyCard: React.FC<AgencyCardProps> = ({ agency, variant = 'classic' }) => {
    const profileUrl = `/@${agency.username}`;

    if (variant === 'feed') {
        return (
            <div
                className="card"
                style={{
                    minWidth: '160px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                {/* Close/Dismiss dummy button for the "suggestion" feel */}
                <button style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    lineHeight: 1
                }}>×</button>

                <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        margin: '0 auto',
                        border: '2px solid #f1f5f9',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <img src={agency.logo} alt={agency.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </Link>

                <div style={{ width: '100%' }}>
                    <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                        <div style={{
                            fontSize: '0.95rem',
                            fontWeight: '750',
                            color: 'var(--color-primary)',
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {agency.name}
                            {agency.verified && <span style={{ color: '#3b82f6', marginLeft: '4px' }}>✓</span>}
                        </div>
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                        {agency.properties} Properties
                    </div>
                </div>

                <button style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    Follow
                </button>
            </div>
        );
    }

    // Classic Grid Variant
    return (
        <div className="card" style={{
            padding: '32px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
        }}>
            <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto 20px',
                    border: '4px solid #f8fafc',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <img src={agency.logo} alt={agency.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </Link>

            <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                <h4 style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    color: 'var(--color-primary)',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    {agency.name}
                    {agency.verified && <span style={{ color: '#3b82f6' }} title="Verified">✓</span>}
                </h4>
            </Link>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>@{agency.username}</p>

            <div style={{
                background: '#f8fafc',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '0.9rem',
                color: 'var(--color-primary)',
                fontWeight: '700',
                border: '1px solid #e2e8f0'
            }}>
                {agency.properties} Properties Listed
            </div>
        </div>
    );
};
