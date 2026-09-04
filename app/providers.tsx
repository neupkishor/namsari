'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ClientErrorReporter } from '@/components/ClientErrorReporter';

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <ClientErrorReporter />
            {children}
            <Suspense fallback={null}>
                <ProgressBar
                    height="3px"
                    color="#820000"
                    options={{
                        showSpinner: false,
                        minimum: 0.08,
                        speed: 420,
                        trickleSpeed: 520,
                        easing: 'ease',
                        trickle: true,
                    }}
                />
            </Suspense>
        </SessionProvider>
    );
};

export default Providers;
