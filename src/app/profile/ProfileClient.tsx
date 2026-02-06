'use client';

import React, { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';

interface UserProfile {
    id: number;
    name: string;
    username: string;
    profile_picture?: string | null;
    bio?: string | null;
    created_on: string;
    contact_number?: string | null;
    account_type?: string | null;
    _count: {
        listedProperties: number;
        collections: number;
        requirements: number;
    };
}

interface ProfileClientProps {
    user: UserProfile;
    currentUser: UserProfile; // The logged in user (same as user if viewing own profile)
}

export default function ProfileClient({ user, currentUser }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutAction();
        } catch (error) {
            console.error('Logout failed', error);
            setIsLoggingOut(false);
        }
    };

    const StatCard = ({ label, value, icon, color }: any) => (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', lineHeight: '1' }}>{value}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>{label}</div>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
            <SiteHeader user={currentUser} />

            <div className="layout-container" style={{ paddingTop: '40px' }}>
                {/* Profile Header */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ height: '160px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', position: 'relative' }}>
                        {/* We could add a cover photo here later */}
                    </div>

                    <div style={{ padding: '0 32px 32px 32px', marginTop: '-60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                            <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'white', padding: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '600', color: '#64748b' }}>
                                        {user.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div style={{ paddingBottom: '12px' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '4px' }}>{user.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '1rem' }}>
                                    <span>@{user.username}</span>
                                    <span>•</span>
                                    <span>Joined {new Date(user.created_on).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ paddingBottom: '16px', display: 'flex', gap: '12px' }}>
                            <Link href="/profile/edit" style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                                Edit Profile
                            </Link>
                            <Link href="/manage" style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', fontWeight: '600', textDecoration: 'none', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center' }}>
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', opacity: isLoggingOut ? 0.7 : 1
                                }}
                            >
                                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '0 32px 32px 32px', maxWidth: '800px' }}>
                        {user.bio ? (
                            <p style={{ color: '#475569', lineHeight: '1.6' }}>{user.bio}</p>
                        ) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No bio added yet.</p>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
                    <StatCard
                        label="Listed Properties"
                        value={user._count.listedProperties}
                        icon="🏠"
                        color="#2563eb"
                    />
                    <StatCard
                        label="Active Requirements"
                        value={user._count.requirements}
                        icon="📋"
                        color="#059669"
                    />
                    <StatCard
                        label="Collections"
                        value={user._count.collections}
                        icon="🔖"
                        color="#d97706"
                    />
                </div>

                {/* Content Tabs */}
                <div style={{ marginTop: '32px' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '32px' }}>
                        {['overview', 'listings', 'collections', 'requirements'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 0',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    color: activeTab === tab ? 'var(--color-primary)' : '#64748b',
                                    fontWeight: activeTab === tab ? '700' : '600',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '32px 0' }}>
                        {activeTab === 'overview' && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', filter: 'grayscale(1)', opacity: 0.5 }}>📊</div>
                                <p>Activity overview coming soon.</p>
                            </div>
                        )}
                        {activeTab === 'listings' && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', filter: 'grayscale(1)', opacity: 0.5 }}>🏠</div>
                                <p>You have {user._count.listedProperties} listed properties.</p>
                                <Link href="/manage/properties" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>
                                    Manage Listings &rarr;
                                </Link>
                            </div>
                        )}
                        {activeTab === 'collections' && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', filter: 'grayscale(1)', opacity: 0.5 }}>🔖</div>
                                <p>You have {user._count.collections} collections.</p>
                                <Link href="/manage/collections" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>
                                    View Collections &rarr;
                                </Link>
                            </div>
                        )}
                        {activeTab === 'requirements' && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', filter: 'grayscale(1)', opacity: 0.5 }}>📋</div>
                                <p>You have {user._count.requirements} active requirements.</p>
                                <Link href="/manage/requirements" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>
                                    Manage Requirements &rarr;
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
