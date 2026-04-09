'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            {children}
            <Suspense fallback={null}>
                <ProgressBar
                    height="4px"
                    color="#2563eb"
                    options={{ showSpinner: false }}
                    shallowRouting
                />
            </Suspense>
        </SessionProvider>
    );
};

export default Providers;
