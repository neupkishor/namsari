import React from 'react';

export default function HomeDesktopLayout({ children, user }: { children: React.ReactNode, user: any }) {
    return (
        <div className="layout-container" style={{ display: 'flex', gap: '40px', paddingTop: '40px', paddingBottom: '120px', alignItems: 'flex-start' }}>
            <div className="feed-main-content" style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                minWidth: 0
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '680px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--card-gap)'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
