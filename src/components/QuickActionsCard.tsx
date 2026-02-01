'use client';

import React from 'react';
import Link from 'next/link';

interface QuickActionsCardProps {
    user: any;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ user }) => {
    return (
        <div
            className="card"
            style={{
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'inherit',
                border: '1px solid var(--color-border)' // Explicitly use shared border color
            }}
        >
            {/* Subtle Gradient Backdrop */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.05) 0%, transparent 60%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '28px' }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em'
                    }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Guest'}
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: '400' }}>
                        Manage your real estate interests with precision.
                    </p>
                </div>

                {/* Quick Action Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <ActionTile
                        title="Post Property"
                        description="List Premium Asset"
                        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>}
                        href="/sell"
                        color="var(--color-gold)"
                        bgColor="rgba(212, 175, 55, 0.08)"
                    />
                    <ActionTile
                        title="Find Property"
                        description="Explore Registry"
                        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                        href="/explore"
                        color="var(--color-primary)"
                        bgColor="rgba(15, 23, 42, 0.05)"
                    />
                    <ActionTile
                        title="Post Requirement"
                        description="Request Acquisition"
                        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                        href="/manage/collections"
                        color="#10b981"
                        bgColor="rgba(16, 185, 129, 0.08)"
                    />
                </div>
            </div>
        </div>
    );
};

interface ActionTileProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    bgColor: string;
}

const ActionTile: React.FC<ActionTileProps> = ({ title, description, icon, href, color, bgColor }) => (
    <Link href={href} style={{ textDecoration: 'none' }}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '24px 16px',
            borderRadius: 'var(--radius-inner)',
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            textAlign: 'center'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = color === 'var(--color-primary)' ? 'var(--color-gold)' : color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '10px',
                background: bgColor,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginBottom: '4px'
            }}>
                {icon}
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '1rem', marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>{description}</div>
            </div>
        </div>
    </Link>
);
