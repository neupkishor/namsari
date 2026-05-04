'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export function FloatingActionButton() {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const stopScrollTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Clear inactivity timer on any scroll
            if (stopScrollTimer.current) {
                clearTimeout(stopScrollTimer.current);
            }

            // Basic threshold to avoid jitter
            const scrollDiff = currentScrollY - lastScrollY.current;
            if (Math.abs(scrollDiff) > 10) {
                if (scrollDiff > 0 && currentScrollY > 100) {
                    // SCROLLING DOWN - Hide
                    setIsVisible(false);
                } else if (scrollDiff < 0) {
                    // SCROLLING UP - Show
                    setIsVisible(true);
                }
                lastScrollY.current = currentScrollY;
            }

            // ALWAYS start inactivity timer on scroll, even if it's small
            stopScrollTimer.current = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (stopScrollTimer.current) clearTimeout(stopScrollTimer.current);
        };
    }, []);

    return (
        <Link
            href="/post"
            className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl flex items-center justify-center no-underline transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-110 hover:-translate-y-1 active:scale-95 lg:hidden z-[1001] group ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'
            }`}
        >
            <div className="flex flex-col items-center justify-center">
                <span className="text-2xl transform group-hover:rotate-12 transition-transform duration-500">➕</span>
            </div>
        </Link>
    );
}
