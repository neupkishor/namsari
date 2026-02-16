import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { switchProfileAction } from '@/actions/auth';
import { toggleAgencyVerification } from '@/actions/agencies';

export default async function UserDetailsPage({ params }: { params: Promise<{ username: string }> }) {
    const session = await getSession();
    const { username } = await params;

    const user = await prisma.user.findFirst({
        where: { username: username },
        include: {
            listedProperties: {
                take: 5,
                orderBy: { created_on: 'desc' }
            }
        }
    });

    if (!user) {
        notFound();
    }

    const currentUserId = session?.id ? parseInt(session.id) : null;
    
    // Check permissions
    let canSwitch = false;
    let isAdmin = false;

    if (currentUserId) {
        const currentUser = await prisma.user.findUnique({ where: { id: currentUserId }, include: { role: true } });
        isAdmin = (currentUser?.type === 'admin' || currentUser?.role?.name?.toLowerCase().includes('admin')) || false;

        if (user.type === 'agency') {
            const permission = await prisma.userPermission.findUnique({
                where: {
                    ownerId_actorId: {
                        ownerId: user.id,
                        actorId: currentUserId
                    }
                }
            });
            if (permission || isAdmin) {
                canSwitch = true;
            }
        }
    }

    let moreInfo: any = {};
    try {
        moreInfo = JSON.parse(user.moreInfo || '{}');
    } catch (e) {}

    const isVerified: boolean = moreInfo.is_verified || false;
    const isActive = user.status === 'active';

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Link href="/manage/accounts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Back to Accounts
                </Link>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ height: '120px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)' }}></div>
                <div style={{ padding: '0 32px 32px', marginTop: '-60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', background: 'white', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {user.profile_picture ? (
                                <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.name} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: '#cbd5e1' }}>
                                    {(user.name || 'U')[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', paddingBottom: '12px' }}>
                            <Link href={`/manage/accounts/${user.username}/edit`} style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>{user.name}</h1>
                            {isVerified && (
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>Verified</span>
                            )}
                        </div>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '24px' }}>@{user.username}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Account Type</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', textTransform: 'capitalize' }}>{user.type || 'User'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#22c55e' : '#ef4444' }}></span>
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: isActive ? '#15803d' : '#b91c1c' }}>{isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Contact</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#334155' }}>{user.contact_number || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#334155' }}>{user.email || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {canSwitch && (
                                <form action={async () => {
                                    'use server';
                                    await switchProfileAction(user.id);
                                }}>
                                    <button 
                                        type="submit" 
                                        style={{ 
                                            width: '100%',
                                            padding: '14px',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontWeight: '700',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <span>🔄</span> Switch to this Account
                                    </button>
                                </form>
                            )}

                            {isAdmin && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <form action={async () => {
                                        'use server';
                                        await toggleAgencyVerification(user.id, isVerified);
                                    }}>
                                        <button 
                                            type="submit" 
                                            style={{ 
                                                width: '100%',
                                                padding: '12px',
                                                background: isVerified ? '#f1f5f9' : '#e0f2fe',
                                                color: isVerified ? '#64748b' : '#0284c7',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isVerified ? 'Remove Verification' : 'Verify Account'}
                                        </button>
                                    </form>

                                    <form action={async () => {
                                        'use server';
                                        const newStatus = isActive ? 'inactive' : 'active';
                                        await prisma.user.update({
                                            where: { id: user.id },
                                            data: { status: newStatus }
                                        });
                                    }}>
                                        <button 
                                            type="submit" 
                                            style={{ 
                                                width: '100%',
                                                padding: '12px',
                                                background: isActive ? '#fee2e2' : '#dcfce7',
                                                color: isActive ? '#ef4444' : '#166534',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isActive ? 'Deactivate Account' : 'Activate Account'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '20px' }}>Recent Properties</h2>
                {user.listedProperties.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {user.listedProperties.map((property: any) => (
                            <div key={property.id} style={{ display: 'flex', gap: '16px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f1f5f9', flexShrink: 0 }}>
                                    {/* Placeholder for property image */}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '4px' }}>{property.title}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Status: {property.status}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Posted on {new Date(property.created_on).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>No properties listed by this user.</p>
                )}
            </div>
        </div>
    );
}
