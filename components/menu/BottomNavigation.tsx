'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { bottomNavItems, sidebarMenuGroups, managementMenuGroups } from './menu-config';
import { MenuIcon } from './MenuIcon';
import { setPopupActive, usePopupActive } from '@/lib/ui/popup-visibility';

const EXPLORE_VIEW_HOLD_MS = 1000;
const EXPLORE_VIEW_FEEDBACK_MS = 200;

function getExploreViewCookie(): 'map' | 'list' | null {
    if (typeof document === 'undefined') return null;

    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith('explore_view='))
        ?.split('=')[1];

    return cookie === 'map' || cookie === 'list' ? cookie : null;
}

function setExploreViewCookie(view: 'map' | 'list') {
    if (typeof document === 'undefined') return;
    document.cookie = `explore_view=${view}; path=/; max-age=31536000; samesite=lax`;
}

export function BottomNavigation({ user }: { user?: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isExplorePage = pathname === '/explore';
    const isMapView = isExplorePage && searchParams?.get('view') === 'map';
    const savedExploreView = useSyncExternalStore(
        () => () => {},
        getExploreViewCookie,
        () => null
    );
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const isPopupActive = usePopupActive();
    const [pressedExploreHref, setPressedExploreHref] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const exploreHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const exploreFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const exploreFeedbackShown = useRef(false);
    const exploreHoldReady = useRef(false);

    // Dynamic Visibility Logic
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const stopScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            // Don't hide if mobile menu is open
            if (showMobileMenu) {
                setIsVisible(true);
                return;
            }

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
    }, [showMobileMenu]);

    // Ensure visible when menu is toggled
    useEffect(() => {
        if (showMobileMenu) {
            setIsVisible(true);
        }
    }, [showMobileMenu]);

    // Close menu when path changes
    useEffect(() => {
        setShowMobileMenu(false);
    }, [pathname]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMobileMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('click', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [showMobileMenu]);

    useEffect(() => {
        setPopupActive('bottom-app-menu', showMobileMenu);
        return () => setPopupActive('bottom-app-menu', false);
    }, [showMobileMenu]);

    const items = bottomNavItems(user);
    const isManagePage = pathname?.startsWith('/manage');
    const menuGroups = isManagePage ? managementMenuGroups(user) : sidebarMenuGroups(user);

    const clearExploreHold = () => {
        if (exploreHoldTimer.current) {
            clearTimeout(exploreHoldTimer.current);
            exploreHoldTimer.current = null;
        }
        if (exploreFeedbackTimer.current) {
            clearTimeout(exploreFeedbackTimer.current);
            exploreFeedbackTimer.current = null;
        }
        if (exploreFeedbackShown.current && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('explore-view-hold-feedback', { detail: { active: false } }));
            exploreFeedbackShown.current = false;
        }
        exploreHoldReady.current = false;
        setPressedExploreHref(null);
    };

    const preventContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
    };

    const preventDragStart = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
    };

    const beginExploreHold = (href: string) => {
        if (!isExplorePage) return;
        clearExploreHold();
        setPressedExploreHref(href);
        exploreFeedbackTimer.current = setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('explore-view-hold-feedback', { detail: { active: true } }));
                exploreFeedbackShown.current = true;
            }
        }, EXPLORE_VIEW_FEEDBACK_MS);
        exploreHoldTimer.current = setTimeout(() => {
            exploreHoldReady.current = true;
        }, EXPLORE_VIEW_HOLD_MS);
    };

    const releaseExploreHold = (href: string) => {
        if (!isExplorePage) {
            clearExploreHold();
            return;
        }
        const shouldToggle = exploreHoldReady.current;
        clearExploreHold();

        if (!shouldToggle) return;

        setExploreViewCookie(isMapView ? 'list' : 'map');
        router.push(href, { scroll: false });
    };

    useEffect(() => {
        return () => {
            if (exploreHoldTimer.current) {
                clearTimeout(exploreHoldTimer.current);
            }
            if (exploreFeedbackTimer.current) {
                clearTimeout(exploreFeedbackTimer.current);
            }
            if (exploreFeedbackShown.current && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('explore-view-hold-feedback', { detail: { active: false } }));
            }
        };
    }, []);

    if (isPopupActive && !showMobileMenu) {
        return null;
    }

    return (
        <>
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] animate-in fade-in duration-300">
                    <div 
                        ref={menuRef} 
                        onContextMenu={preventContextMenu}
                        onDragStart={preventDragStart}
                        className="bottom-nav-guard absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] max-h-[85vh] overflow-y-auto px-6 pt-10 pb-24 shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out"
                    >
                        {/* Pull Bar */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />

                        <div className="flex flex-col gap-8">
                            {menuGroups.map((group, groupIdx) => (
                                <div key={groupIdx} className="flex flex-col gap-4">
                                    {group.title && (
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                                            {group.title}
                                        </h3>
                                    )}
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.items.map((item, idx) => {
                                            const active = pathname === item.href;
                                            return (
                                                <Link 
                                                    key={idx} 
                                                    href={item.href} 
                                                    onClick={() => setShowMobileMenu(false)} 
                                                    onContextMenu={preventContextMenu}
                                                    onDragStart={preventDragStart}
                                                className={`bottom-nav-guard flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-[15px] transition-all no-underline ${
                                                        active 
                                                            ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
                                                            : 'text-slate-600 hover:bg-slate-50 active:scale-95'
                                                    }`}
                                                >
                                                    <span className="text-xl">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Logout Option */}
                            {user && (
                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            logoutAction();
                                            setShowMobileMenu(false);
                                        }}
                                        onContextMenu={preventContextMenu}
                                        onDragStart={preventDragStart}
                                        className="bottom-nav-guard flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] text-red-500 font-bold hover:bg-red-50 active:scale-95 w-full text-left transition-all"
                                    >
                                                <MenuIcon icon="/icons/info.svg" label="Logout" className="text-xl" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                            
                            <div className="px-5 py-6 mt-2 rounded-3xl bg-slate-50 border border-slate-100">
                                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                                    Namsari &copy; 2026<br /> 
                                    <span className="opacity-60">Designed by </span>
                                    <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold">
                                        NEUPGROUP
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom App Bar */}
            <nav 
                onContextMenu={preventContextMenu}
                onDragStart={preventDragStart}
                className={`bottom-nav-guard fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[460px] h-[68px] bg-white border border-[#e5e7eb] shadow-[0_10px_30px_rgba(15,23,42,0.12)] rounded-2xl z-[1001] flex items-center justify-between px-3 lg:hidden transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'
            }`}
            >
                {items.map((item, idx) => {
                    const isExploreAction = isExplorePage && item.href === '/explore';
                    const isExploreItem = item.href === '/explore';
                    const itemHref = isExploreAction
                        ? (() => {
                            const params = new URLSearchParams(searchParams?.toString() || '');
                            if (isMapView) {
                                params.delete('view');
                            } else {
                                params.set('view', 'map');
                            }
                            return params.toString() ? `/explore?${params.toString()}` : '/explore';
                        })()
                        : item.href;
                    const itemIcon = isExploreAction
                        ? (isMapView ? '/icons/land-location.svg' : '/icons/land-layer-location.svg')
                        : isExploreItem && savedExploreView === 'map'
                            ? '/icons/land-location.svg'
                            : item.icon;
                    const isHoldingExplore = isExploreAction && pressedExploreHref === itemHref;
                    const active = pathname === item.href || (item.href === '#menu' && showMobileMenu);

                    return (
                        <button 
                            key={idx}
                            onClick={() => {
                                if (itemHref === '#menu') {
                                    setShowMobileMenu(!showMobileMenu);
                                } else if (isExploreAction) {
                                    clearExploreHold();
                                } else if (item.label === 'Post') {
                                    // Always open the posting chooser at its root, even after
                                    // the user has navigated deeper into a posting flow.
                                    router.replace('/post', { scroll: false });
                                } else {
                                    router.push(itemHref, { scroll: false });
                                }
                            }}
                            onMouseDown={() => {
                                if (isExploreAction) beginExploreHold(itemHref);
                            }}
                            onMouseUp={() => {
                                if (isExploreAction) releaseExploreHold(itemHref);
                            }}
                            onMouseLeave={() => {
                                if (isExploreAction) clearExploreHold();
                            }}
                            onTouchStart={() => {
                                if (isExploreAction) beginExploreHold(itemHref);
                            }}
                            onTouchEnd={() => {
                                if (isExploreAction) releaseExploreHold(itemHref);
                            }}
                            onTouchCancel={() => {
                                if (isExploreAction) clearExploreHold();
                            }}
                            onContextMenu={preventContextMenu}
                            onDragStart={preventDragStart}
                            className={`bottom-nav-guard group relative flex flex-col items-center justify-center gap-1 min-w-[56px] h-[52px] px-2 rounded-xl transition-[background-color,transform] duration-200 ease-out hover:bg-[color:var(--color-primary)]/8 active:scale-95 ${
                                active ? 'bg-[color:var(--color-primary)]/8' : 'bg-transparent'
                            }`}
                        >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-[background-color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 ${
                                active 
                                    ? 'scale-105 bg-[color:var(--color-primary)]/18' 
                                    : 'bg-[color:var(--color-primary)]/6'
                            }`}>
                                <span key={`${item.label}-${itemIcon}`} className="footer-icon-swap inline-flex text-[20px]">
                                    <MenuIcon icon={itemIcon} label={item.label} active={active} className="text-[20px]" />
                                </span>
                            </div>
                            {isExploreAction && isHoldingExplore && (
                                <div className="absolute top-1 left-1/2 h-0.5 w-10 -translate-x-1/2 overflow-hidden rounded-full bg-slate-200">
                                    <div className="footer-hold-progress h-full bg-blue-600 rounded-full" />
                                </div>
                            )}
                            <span className={`text-[10px] tracking-tight transition-colors duration-200 ${
                                active ? 'font-bold text-[color:var(--color-primary)] opacity-100' : 'font-semibold text-slate-500 opacity-100'
                            } group-hover:text-[color:var(--color-primary)]`}>
                                {item.label}
                            </span>
                            {active && (
                                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[color:var(--color-primary)]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            <style jsx>{`
                @keyframes footerIconSwap {
                    0% {
                        opacity: 0;
                        transform: scale(0.72) rotate(-12deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                .footer-icon-swap {
                    animation: footerIconSwap 260ms ease;
                }

                .bottom-nav-guard {
                    user-select: none;
                    -webkit-user-select: none;
                    -webkit-touch-callout: none;
                    -webkit-tap-highlight-color: transparent;
                }

                @keyframes footerHoldProgress {
                    0% {
                        transform: scaleX(0);
                    }
                    100% {
                        transform: scaleX(1);
                    }
                }

                .footer-hold-progress {
                    transform-origin: left center;
                    animation: footerHoldProgress ${EXPLORE_VIEW_HOLD_MS}ms linear forwards;
                }
            `}</style>
        </>
    );
}
