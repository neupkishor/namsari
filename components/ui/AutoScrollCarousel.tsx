'use client';

import React, { useRef, useEffect, useState } from 'react';

interface AutoScrollCarouselProps {
    children: React.ReactNode;
    className?: string;
    itemWidth?: string; // e.g., "280px", "100%", "calc(50% - 10px)"
    gap?: string; // e.g., "20px"
    desktopItemCount?: number; // How many items to show on desktop (>=1024px)
    tabletItemCount?: number; // How many items to show on tablet (>=640px)
    mobileItemCount?: number; // How many items to show on mobile (<640px)
}

export const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({ 
    children, 
    className, 
    itemWidth = "85%", 
    gap = "16px",
    desktopItemCount,
    tabletItemCount,
    mobileItemCount
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    
    useEffect(() => {
        if (isHovering) return;

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
                        
                        let scrollAmount = firstChild.offsetWidth + gapVal;
                        let visibleCount = 1;

                        if (window.innerWidth >= 1024 && desktopItemCount) {
                            visibleCount = desktopItemCount;
                        } else if (window.innerWidth >= 640 && tabletItemCount) {
                            visibleCount = tabletItemCount;
                        } else if (mobileItemCount) {
                            visibleCount = mobileItemCount;
                        }

                        // Scroll by visibleCount - 1 (keep 1 old item visible) or just 1?
                        // "show 3 new with old one" implies sliding by N-1.
                        // If visibleCount is 1, scroll by 1.
                        const itemsToScroll = Math.max(1, visibleCount - 1);
                        scrollAmount = itemsToScroll * (firstChild.offsetWidth + gapVal);
                        
                        // Check if scrolling this amount would go past end.
                        if (scrollLeft + clientWidth + scrollAmount > scrollWidth) {
                            // If so, just scroll to end
                            scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
                            return;
                        }

                        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }
            }
        }, 5000);
        
        return () => clearInterval(interval);
    }, [gap, isHovering, desktopItemCount, tabletItemCount, mobileItemCount]);

    return (
        <div 
            ref={scrollRef}
            className={`auto-scroll-carousel ${className || ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
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
                ${desktopItemCount ? `
                @media (min-width: 1024px) {
                    .carousel-item {
                        flex: 0 0 calc((100% - ${(desktopItemCount - 1)} * ${gap}) / ${desktopItemCount}) !important;
                    }
                }
                ` : ''}
                ${tabletItemCount ? `
                @media (min-width: 640px) and (max-width: 1023px) {
                    .carousel-item {
                        flex: 0 0 calc((100% - ${(tabletItemCount - 1)} * ${gap}) / ${tabletItemCount}) !important;
                    }
                }
                ` : ''}
                ${mobileItemCount ? `
                @media (max-width: 639px) {
                    .carousel-item {
                        flex: 0 0 calc((100% - ${(mobileItemCount - 1)} * ${gap}) / ${mobileItemCount}) !important;
                    }
                }
                ` : ''}
            `}</style>
            {React.Children.map(children, (child) => (
                <div className="carousel-item" style={{ flex: `0 0 ${itemWidth}`, scrollSnapAlign: 'start', minWidth: 0 }}>
                    {child}
                </div>
            ))}
        </div>
    );
};
