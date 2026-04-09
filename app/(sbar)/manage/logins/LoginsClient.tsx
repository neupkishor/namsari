'use client';

import React from 'react';
import { revokeSessionAction } from '@/actions/auth';

interface LoginsClientProps {
    sessions: any[];
}

export default function LoginsClient({ sessions }: LoginsClientProps) {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Active Logins</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                Manage your active sessions across different devices.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map((session) => (
                    <div key={session.id} style={{ 
                        background: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '20px'
                    }}>
                        <div>
                            <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {session.isCurrent ? (
                                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Current Session</span>
                                ) : (
                                    <span style={{ color: '#64748b' }}>Device</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                                Last active: {new Date(session.lastActive).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                                Created: {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        
                        {!session.isCurrent && (
                            <button
                                onClick={() => revokeSessionAction(session.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    background: '#fee2e2',
                                    color: '#ef4444',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Revoke
                            </button>
                        )}
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No active sessions found.
                    </div>
                )}
            </div>
        </div>
    );
}