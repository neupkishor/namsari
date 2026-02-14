import React from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export default function HomeMobileLayout({ children, user }: { children: React.ReactNode, user: any }) {
    return (
        <>
            <div className="layout-container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
                 {children}
            </div>
            <BottomNavigation user={user} />
        </>
    );
}
