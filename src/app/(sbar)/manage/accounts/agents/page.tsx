import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { PaginationControl } from '@/components/ui';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function ManageAgentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    const isAdmin = user.type === 'admin' || user.role?.name?.toLowerCase().includes('admin');
    const isAgency = user.type === 'agency';

    if (!isAdmin && !isAgency) {
        redirect('/manage');
    }

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {
        type: 'agent'
    };

    if (isAgency) {
        where.agency_id = user.id;
    }

    const [users, totalCount] = await Promise.all([
        prisma.account.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: limit
        }),
        prisma.account.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Agent Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Directory of registered real estate agents.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                        Export CSV
                    </button>
                    <button style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                        Add Agent
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {users.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        No agents found in the registry.
                    </div>
                ) : (
                    users.map((u: any) => (
                        <Link
                            key={u.id}
                            href={`/manage/accounts/${u.username}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', overflow: 'hidden', flexShrink: 0 }}>
                                    {u.profile_picture ? (
                                        <img src={u.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={u.name} />
                                    ) : (
                                        (u.name || 'A')[0].toUpperCase()
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.95rem', color: '#64748b' }}>@{u.username}</div>
                                </div>
                                <div>
                                    <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                                        Agent
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
