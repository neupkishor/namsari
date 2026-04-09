import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { PaginationControl } from '@/components/ui';
import Link from 'next/link';

export default async function ActivityLogPage({ searchParams }: { searchParams: Promise<{ page?: string; user_id?: string }> }) {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    const { page: pageParam, user_id: userIdParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    const isAdmin = user.type === 'admin';
    
    // Construct Where Clause
    let whereClause: any = {};

    if (isAdmin) {
        if (userIdParam) {
            whereClause.account_id = Number(userIdParam);
        }
    } else {
        // Regular users can only see their own logs
        whereClause.account_id = user.id;
    }

    // Fetch user details if filtering by user_id
    let filteredUser = null;
    if (isAdmin && userIdParam) {
        filteredUser = await prisma.user.findUnique({
            where: { id: Number(userIdParam) },
            select: { username: true }
        });
    }

    const [logs, totalCount] = await Promise.all([
        prisma.activityLog.findMany({
            where: whereClause,
            orderBy: { activity_on: 'desc' },
            skip,
            take: limit
        }),
        prisma.activityLog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 'bold' }}>Activity Log</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {userIdParam ? (
                            <>
                                Showing activities for
                                {filteredUser ? (
                                    <Link 
                                        href={`/manage/accounts/${filteredUser.username}`}
                                        style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}
                                        title="View User Account"
                                    >
                                        #{filteredUser.username}
                                    </Link>
                                ) : (
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>
                                        User #{userIdParam}
                                    </span>
                                )}
                            </>
                        ) : 'Recent activities and interactions.'}
                    </p>
                </div>
                
                {userIdParam && (
                    <Link 
                        href="/manage/activity" 
                        style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--color-primary)', 
                            fontWeight: '600',
                            textDecoration: 'none',
                            background: '#e0f2fe',
                            padding: '6px 12px',
                            borderRadius: '6px'
                        }}
                    >
                        Clear Filter
                    </Link>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {logs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        No activities recorded.
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log.id} style={{ 
                            background: 'white', 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0', 
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ 
                                        display: 'inline-block',
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '600',
                                        background: '#e0f2fe', 
                                        color: '#0369a1',
                                        textTransform: 'capitalize'
                                    }}>
                                        {log.activity_type.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        {new Date(log.activity_on).toLocaleString()}
                                    </span>
                                </div>
                                
                                {isAdmin && (
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {log.account_id ? (
                                            <>
                                                <span style={{ fontWeight: '500' }}>User</span>
                                                <Link 
                                                    href={`/manage/activity?user_id=${log.account_id}`}
                                                    style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}
                                                    title={`Filter by User #${log.account_id}`}
                                                >
                                                    #{log.account_id}
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontWeight: '500' }}>Guest</span>
                                                <span 
                                                    title={log.temp_account_id}
                                                    style={{ 
                                                        color: '#64748b', 
                                                        fontFamily: 'monospace', 
                                                        background: '#f1f5f9', 
                                                        padding: '2px 4px', 
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    #{log.temp_account_id === 'anonymous' ? 'Anonymous' : log.temp_account_id.substring(0, 8) + '...'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.5' }}>
                                {log.description}
                            </div>

                            {/* Technical Details Footer */}
                            {(log.ip_address || log.device_type || log.user_agent) && (
                                <div style={{ 
                                    marginTop: '4px', 
                                    paddingTop: '12px', 
                                    borderTop: '1px solid #f8fafc',
                                    fontSize: '0.75rem', 
                                    color: '#94a3b8',
                                    display: 'flex',
                                    gap: '16px',
                                    flexWrap: 'wrap'
                                }}>
                                    {log.ip_address && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>🌐</span> {log.ip_address}
                                        </div>
                                    )}
                                    {log.device_type && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                                            <span>📱</span> {log.device_type}
                                        </div>
                                    )}
                                    {log.user_agent && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_agent}>
                                            <span>🖥️</span> {log.user_agent}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
