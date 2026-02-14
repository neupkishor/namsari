'use client';

import React, { useRef, useEffect } from 'react';

interface AutoScrollCarouselProps {
    children: React.ReactNode;
    className?: string;
    itemWidth?: string; // e.g., "280px", "100%", "calc(50% - 10px)"
    gap?: string; // e.g., "20px"
}

export const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({ 
    children, 
    className, 
    itemWidth = "85%", 
    gap = "16px" 
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                
                // If we can't scroll further (tolerance of 5px)
                if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll by one item width roughly (estimating based on first child)
                    const firstChild = scrollRef.current.firstElementChild as HTMLElement;
                    if (firstChild) {
                         // Parse gap if it's in px, otherwise assume 16
                        const gapVal = parseInt(gap) || 16;
                        const scrollAmount = firstChild.offsetWidth + gapVal;
                        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }
            }
        }, 5000);
        
        return () => clearInterval(interval);
    }, [gap]);

    return (
        <div 
            ref={scrollRef}
            className={`auto-scroll-carousel ${className || ''}`}
            style={{
                display: 'flex',
                gap: gap,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
                paddingBottom: '4px', // Space for shadow if needed
                width: '100%'
            }}
        >
            <style jsx>{`
                .auto-scroll-carousel::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {React.Children.map(children, (child) => (
                <div style={{ flex: `0 0 ${itemWidth}`, scrollSnapAlign: 'start', minWidth: 0 }}>
                    {child}
                </div>
            ))}
        </div>
    );
};
