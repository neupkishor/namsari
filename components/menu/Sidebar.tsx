'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';

import { sidebarMenuGroups, managementMenuGroups } from './menu-config';
import { MenuIcon } from './MenuIcon';

export function SidebarSkeleton() {
    return (
        <aside className="w-[var(--sidebar-width)] shrink-0 hidden lg:block h-full min-h-0 overflow-hidden border-r border-border bg-white pt-6 pr-6 pb-6 pl-0">
            <div className="flex flex-col gap-6">
                {[1, 2, 3].map(group => (
                    <div key={group} className="flex flex-col gap-2">
                        <div className="h-3 w-16 bg-surface animate-pulse rounded mb-2"></div>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-full bg-surface animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ))}
            </div>
        </aside>
    );
}

export function Sidebar({ user, loading }: { user: any, loading?: boolean }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    
    if (loading) {
        return <SidebarSkeleton />;
    }

    const isManagePage = pathname?.startsWith('/manage');
    const menuGroups = isManagePage ? managementMenuGroups(user) : sidebarMenuGroups(user);
    const allItems = menuGroups.flatMap(g => g.items);

    const isActive = (href: string) => {
        if (!pathname) return false;
        if (pathname === href) return true;
        if (href === '/' || href === '/manage') return false;

        if (pathname.startsWith(href)) {
             const betterMatch = allItems.find(otherItem => 
                otherItem.href !== href && 
                otherItem.href.length > href.length &&
                pathname.startsWith(otherItem.href)
            );
            if (betterMatch) return false;
            return true;
        }
        return false;
    };

    return (
        <aside className="w-[var(--sidebar-width)] shrink-0 hidden lg:flex flex-col h-full min-h-0 overflow-hidden border-r border-border bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-6 pr-6 pb-24 pl-0">
                <div className="flex flex-col gap-8">
                    {menuGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="flex flex-col gap-2">
                            {group.title && (
                                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest pr-3 pl-0 mb-1">
                                    {group.title}
                                </h3>
                            )}
                            <nav className="flex flex-col gap-1">
                                {group.items.map((item, idx) => {
                                    const active = isActive(item.href);
                                    
                                    if (item.label === 'LogOut') {
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => logoutAction()}
                                                className="group flex items-center gap-3 pr-3 pl-2 py-2.5 rounded-lg text-[14px] text-red-600 font-semibold transition-all duration-200 hover:bg-red-50 hover:translate-x-1 w-full text-left"
                                            >
                                                <MenuIcon icon={item.icon} label={item.label} className="text-xl opacity-80" />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link 
                                            key={idx} 
                                            href={item.href} 
                                            className={`group relative flex items-center gap-3 pr-3 pl-2 py-2.5 rounded-lg transition-all duration-200 text-[14px] no-underline ${
                                                active 
                                                ? 'font-bold text-primary bg-primary/5 shadow-sm' 
                                                : 'font-medium text-text-muted hover:bg-surface hover:text-primary hover:translate-x-1'
                                            }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-all duration-200 ${
                                                    active ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-60 group-hover:scale-100'
                                                }`}
                                            />
                                            <MenuIcon icon={item.icon} label={item.label} active={active} className={`text-xl transition-colors ${active ? 'text-primary' : 'text-text-muted group-hover:text-primary opacity-70'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-border">
                        <p className="pr-3 pl-0 text-[10px] text-text-muted leading-relaxed">
                            Namsari Estate &copy; 2026<br /> 
                            <span className="opacity-70">Designed by </span>
                            <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                                Neup.Marketing
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
