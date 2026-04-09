'use client';

import React from 'react';
import Link from 'next/link';

interface QuickActionsCardProps {
    user: any;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ user }) => {
    const actions = [
        {
            title: "Post Property",
            subtitle: "LIST PREMIUM ASSET",
            description: "Maximize your asset value with our elite network and premium listing tools.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            ),
            href: "/sell",
            ctaText: "GET STARTED",
            accentColor: "blue" as const,
        },
        {
            title: "Post Requirement",
            subtitle: "REQUEST ACQUISITION",
            description: "Tell us what you need and let the market come to you with curated matches.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            href: "/manage/collections",
            ctaText: "REQUEST NOW",
            accentColor: "indigo" as const,
        },
        {
            title: "Find Property",
            subtitle: "EXPLORE REGISTRY",
            description: "Discover exclusive investment opportunities in the global marketplace.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            href: "/explore",
            ctaText: "EXPLORE NOW",
            accentColor: "slate" as const,
        }
    ];

    return (
        <section className="w-full py-6 px-3 sm:px-5 lg:px-6 bg-slate-50/60 rounded-[1.75rem] border border-slate-200/70 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-52 h-52 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-52 h-52 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-[9px] font-bold tracking-widest uppercase w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Marketplace Dashboard
                        </div>
                        <h2 className="text-2xl sm:text-[1.65rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                            Welcome back, <span className="text-blue-600 italic">{user?.name?.split(' ')[0] || 'User'}</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md">
                        Manage your real estate portfolio with absolute precision and market-leading insights.
                    </p>
                </div>
                
                {/* Carousel Wrapper */}
                <div className="w-full overflow-x-auto pb-3 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
                    <div className="flex gap-3 md:gap-4 w-max">
                        {actions.map((action, idx) => (
                            <div key={idx} className="w-[84vw] sm:w-[280px] md:w-[300px] snap-center">
                                <ActionCard {...action} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

interface ActionCardProps {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    ctaText: string;
    accentColor: 'blue' | 'indigo' | 'slate';
}

const ActionCard: React.FC<ActionCardProps> = ({ title, subtitle, description, icon, href, ctaText, accentColor }) => {
    const colorMap = {
        blue: 'hover:border-blue-500/30 group-hover:bg-blue-600 text-blue-600',
        indigo: 'hover:border-indigo-500/30 group-hover:bg-indigo-600 text-indigo-600',
        slate: 'hover:border-slate-500/30 group-hover:bg-slate-800 text-slate-800'
    };

    const bgMap = {
        blue: 'bg-blue-50',
        indigo: 'bg-indigo-50',
        slate: 'bg-slate-100'
    };

    return (
        <Link href={href} className="group block h-full">
            <div className={`h-full bg-white border border-slate-200 rounded-3xl p-5 flex flex-col transition-all duration-400 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 relative overflow-hidden`}>
                <div className={`w-10 h-10 rounded-xl ${bgMap[accentColor]} flex items-center justify-center mb-4 transition-all duration-400 group-hover:scale-105 ${colorMap[accentColor].split(' ').pop()}`}>
                    {icon}
                </div>
                
                <div className="space-y-2 mb-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.16em]">
                        {subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>
                
                <div className="mt-auto pt-3 flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-[0.14em]">
                    <span className="relative overflow-hidden group-hover:pr-6 transition-all duration-300">
                        {ctaText}
                        <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
};
