import React from 'react';

export default async function UtilityLayout({ children }: { children: React.ReactNode }) {
    return (
        <main
            style={{
                minHeight: '100%',
                background: 'transparent'
            }}
        >
            <div className="mx-auto w-full max-w-[1400px] px-0.5 pt-3 sm:px-6 lg:px-8" style={{ paddingBottom: '80px' }}>
                {children}
            </div>
        </main>
    );
}
