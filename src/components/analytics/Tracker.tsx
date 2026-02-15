'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackVisit } from '@/actions/analytics';

export function Tracker() {
    const pathname = usePathname();
    
    useEffect(() => {
        // Generate or retrieve session ID from sessionStorage (cleared when browser closes)
        let sessionId = sessionStorage.getItem('namsari_session_id');
        
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('namsari_session_id', sessionId);
        }

        // Track the visit
        if (pathname) {
            trackVisit(sessionId, pathname);
        }
    }, [pathname]);

    return null;
}
