import React from 'react';
// import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    actionLink?: string | null;
    isRead: boolean;
    created_at: string;
}

export default function NotificationsList({ notifications }: { notifications: Notification[] }) {
    if (notifications.length === 0) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔕</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>No Notifications</h3>
                <p>You're all caught up! Check back later for updates.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map((notif) => (
                <div 
                    key={notif.id}
                    style={{ 
                        background: notif.isRead ? 'white' : '#f0f9ff', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        borderLeft: notif.isRead ? '1px solid #e2e8f0' : '4px solid #0284c7',
                        display: 'flex',
                        gap: '16px',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }}>
                        {notif.type === 'invite' ? '📩' : 
                         notif.type === 'exclusive_request' ? '🔒' : 
                         notif.type === 'system' ? '📢' : 'ℹ️'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{notif.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: notif.actionLink ? '12px' : '0' }}>
                            {notif.message}
                        </p>
                        
                        {notif.actionLink && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <a 
                                    href={notif.actionLink} 
                                    style={{ 
                                        display: 'inline-block', 
                                        padding: '8px 16px', 
                                        background: 'var(--color-primary)', 
                                        color: 'white', 
                                        borderRadius: '6px', 
                                        textDecoration: 'none', 
                                        fontSize: '0.9rem', 
                                        fontWeight: '600' 
                                    }}
                                >
                                    View Details
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
