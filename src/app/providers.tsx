'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Suspense } from 'react';

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {children}
            <Suspense fallback={null}>
                <ProgressBar
                    height="4px"
                    color="#2563eb"
                    options={{ showSpinner: false }}
                    shallowRouting
                />
            </Suspense>
        </>
    );
};

export default Providers;
