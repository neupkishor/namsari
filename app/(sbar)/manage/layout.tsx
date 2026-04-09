import React from 'react';
import ScrollToTop from '@/components/ScrollToTop';

export default function ManageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100%' }}>
            <ScrollToTop />
            {children}
        </div>
    );
}
