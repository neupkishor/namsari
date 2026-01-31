import React from 'react';
import Link from 'next/link';
import styles from './ui/form.module.css';

interface CreatePostCardProps {
    user: any;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ user }) => {
    if (!user) {
        return (
            <div className="card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>🏘️</div>
                <div>
                    <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Ready to list your property?</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Join the premier real estate network to reach verified buyers.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/register" style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
                        Get Started
                    </Link>
                    <Link href="/login" style={{ color: 'var(--color-primary)', padding: '10px 16px', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '16px', borderRadius: '12px', marginBottom: '24px', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                    {(user.name || 'U')[0]}
                </div>
                <Link href="/sell" style={{ flex: 1, textDecoration: 'none' }}>
                    <div style={{
                        background: '#f0f2f5',
                        padding: '12px 16px',
                        borderRadius: '24px',
                        color: '#65676b',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        border: '1px solid transparent'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#e4e6eb'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#f0f2f5'}
                    >
                        What property are you listing today, {user.name.split(' ')[0]}?
                    </div>
                </Link>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <PostAction
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>}
                    label="Photo/Video"
                    href="/sell"
                />
                <PostAction
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
                    label="Location"
                    href="/sell"
                />
                <PostAction
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>}
                    label="Status/Type"
                    href="/sell"
                />
            </div>
        </div>
    );
};

interface PostActionProps {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const PostAction: React.FC<PostActionProps> = ({ icon, label, href }) => (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s' }}
        className="post-action-hover"
    >
        <style>{`
      .post-action-hover:hover {
        background-color: #f0f2f5;
      }
    `}</style>
        {icon}
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#65676b' }}>{label}</span>
    </Link>
);
