'use client';

import React, { useRef, useEffect, useState } from 'react';

interface AutoScrollCarouselProps {
    children: React.ReactNode;
    className?: string;
    itemWidth?: string; // e.g., "280px", "100%", "calc(50% - 10px)"
    gap?: string; // e.g., "20px"
    padding?: string; // e.g., "12px 8px 16px"
    desktopItemCount?: number; // How many items to show on desktop (>=1024px)
    tabletItemCount?: number; // How many items to show on tablet (>=640px)
    mobileItemCount?: number; // How many items to show on mobile (<640px)
}

export const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({ 
    children, 
    className, 
    itemWidth = "85%", 
    gap = "16px",
    padding = "12px 8px 16px",
    desktopItemCount,
    tabletItemCount,
    mobileItemCount
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(1200);
    const [isDragging, setIsDragging] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const activePointerId = useRef<number | null>(null);
    const dragStartX = useRef(0);
    const dragStartScrollLeft = useRef(0);

    useEffect(() => {
        const updateViewport = () => setViewportWidth(window.innerWidth);
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    const snapToNearestItem = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const items = Array.from(container.querySelectorAll<HTMLElement>('.carousel-item'));
        if (items.length === 0) return;

        const currentLeft = container.scrollLeft;
        let nearestLeft = items[0].offsetLeft;
        let smallestDistance = Math.abs(nearestLeft - currentLeft);

        for (const item of items) {
            const distance = Math.abs(item.offsetLeft - currentLeft);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                nearestLeft = item.offsetLeft;
            }
        }

        container.scrollTo({ left: nearestLeft, behavior: 'smooth' });
    };

    const stopDragging = () => {
        activePointerId.current = null;
        setIsDragging(false);
        setIsInteracting(false);
    };

    const activeItemCount = viewportWidth >= 1024
        ? desktopItemCount
        : viewportWidth >= 640
            ? tabletItemCount
            : mobileItemCount;
    const hasResponsiveItemCount = Boolean(activeItemCount && activeItemCount > 0);
    const resolvedItemWidth = hasResponsiveItemCount
        ? `calc((100% - ${(activeItemCount! - 1)} * ${gap}) / ${activeItemCount})`
        : itemWidth;
    const effectiveContainerGap = hasResponsiveItemCount ? '0px' : gap;
    
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
                        const gapVal = hasResponsiveItemCount ? 0 : (parseInt(gap) || 16);
                        
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
    }, [gap, hasResponsiveItemCount, isHovering, desktopItemCount, tabletItemCount, mobileItemCount]);

    return (
        <div 
            ref={scrollRef}
            className={`auto-scroll-carousel ${className || ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseDown={(e) => {
                if (!scrollRef.current) return;
                e.preventDefault();
            }}
            onPointerDown={(e) => {
                if (!scrollRef.current) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                activePointerId.current = e.pointerId;
                setIsDragging(true);
                setIsInteracting(true);
                dragStartX.current = e.clientX;
                dragStartScrollLeft.current = scrollRef.current.scrollLeft;
                scrollRef.current.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
                if (!scrollRef.current) return;
                if (!isDragging || activePointerId.current !== e.pointerId) return;
                e.preventDefault();
                const deltaX = e.clientX - dragStartX.current;
                scrollRef.current.scrollLeft = dragStartScrollLeft.current - deltaX;
            }}
            onPointerUp={(e) => {
                if (!scrollRef.current) return;
                if (activePointerId.current === e.pointerId) {
                    scrollRef.current.releasePointerCapture(e.pointerId);
                    snapToNearestItem();
                    stopDragging();
                }
            }}
            onPointerCancel={(e) => {
                if (!scrollRef.current) return;
                if (activePointerId.current === e.pointerId) {
                    scrollRef.current.releasePointerCapture(e.pointerId);
                    snapToNearestItem();
                    stopDragging();
                }
            }}
            onMouseLeave={() => {
                setIsHovering(false);
                stopDragging();
            }}
            style={{
                display: 'flex',
                gap: effectiveContainerGap,
                overflowX: 'auto',
                overflowY: 'visible',
                scrollSnapType: isDragging ? 'none' : 'x mandatory',
                scrollBehavior: isDragging ? 'auto' : 'smooth',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
                padding,
                width: '100%',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: isDragging ? 'none' : 'auto',
                WebkitUserSelect: isDragging ? 'none' : 'auto',
                touchAction: 'pan-y',
                transition: 'filter 180ms ease',
                filter: isInteracting ? 'drop-shadow(0 6px 10px rgba(15,23,42,0.08))' : 'none'
            }}
        >
            <style jsx>{`
                .auto-scroll-carousel::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {React.Children.map(children, (child) => {
                const useInlineBasis = resolvedItemWidth && resolvedItemWidth !== 'auto';
                return (
                    <div
                        className="carousel-item"
                        style={{
                            flex: useInlineBasis ? `0 0 ${resolvedItemWidth}` : undefined,
                            maxWidth: useInlineBasis ? resolvedItemWidth : undefined,
                            scrollSnapAlign: 'start',
                            minWidth: 0,
                            padding: '8px 6px',
                            boxSizing: 'border-box',
                            overflow: 'visible'
                        }}
                    >
                        <div style={{ overflow: 'visible' }}>{child}</div>
                    </div>
                );
            })}
        </div>
    );
};
