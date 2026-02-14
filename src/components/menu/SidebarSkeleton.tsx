import React from 'react';

export function SidebarSkeleton() {
    return (
        <aside className="feed-sidebar-desktop" style={{
            width: '280px',
            flexShrink: 0,
            position: 'sticky',
            top: 'var(--header-height)',
            height: 'calc(100vh - var(--header-height))',
            overflowY: 'auto',
            paddingRight: '12px',
            paddingTop: '24px',
            paddingBottom: '120px',
            borderRight: '1px solid #f1f5f9'
        }}>
            <style jsx>{`
                .feed-sidebar-desktop {
                    display: none;
                }
                @media (min-width: 1025px) {
                    .feed-sidebar-desktop {
                        display: block;
                    }
                }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton" style={{ height: '48px', width: '100%', borderRadius: '8px' }}></div>
                ))}
                
                <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />
                
                {[1, 2, 3, 4].map(i => (
                    <div key={`sec-${i}`} className="skeleton" style={{ height: '40px', width: '80%', borderRadius: '8px' }}></div>
                ))}
            </div>
        </aside>
    );
}
