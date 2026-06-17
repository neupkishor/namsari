'use client';

import React from 'react';
import Link from 'next/link';

const INTERNAL_PROPERTY_NAV_KEY = 'namsari:internal-property-nav';

export function markInternalPropertyNavigation() {
    try {
        sessionStorage.setItem(INTERNAL_PROPERTY_NAV_KEY, '1');
    } catch {
        // Ignore storage failures and fall back to the direct-load path.
    }
}

export function consumeInternalPropertyNavigation() {
    try {
        if (sessionStorage.getItem(INTERNAL_PROPERTY_NAV_KEY) === '1') {
            sessionStorage.removeItem(INTERNAL_PROPERTY_NAV_KEY);
            return true;
        }
    } catch {
        // Ignore storage failures and render the direct-load state.
    }

    return false;
}

type InternalPropertyLinkProps = React.ComponentProps<typeof Link>;

export function InternalPropertyLink({ onClick, ...props }: InternalPropertyLinkProps) {
    return (
        <Link
            {...props}
            onClick={(event) => {
                markInternalPropertyNavigation();
                onClick?.(event);
            }}
        />
    );
}
