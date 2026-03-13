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
        <section className="w-full py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-200/60 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-[9px] font-bold tracking-widest uppercase w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Marketplace Dashboard
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            Welcome back, <span className="text-blue-600 italic">{user?.name?.split(' ')[0] || 'User'}</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium max-w-md hidden sm:block">
                        Manage your real estate portfolio with absolute precision and market-leading insights.
                    </p>
                </div>
                
                {/* Carousel Wrapper */}
                <div className="w-full overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    <div className="flex gap-4 md:gap-6 w-max">
                        {actions.map((action, idx) => (
                            <div key={idx} className="w-[85vw] sm:w-[320px] md:w-[380px] snap-center">
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
            <div className={`h-full bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 relative overflow-hidden`}>
                <div className={`w-12 h-12 rounded-2xl ${bgMap[accentColor]} flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorMap[accentColor].split(' ').pop()}`}>
                    {icon}
                </div>
                
                <div className="space-y-2 mb-6">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {subtitle}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>
                
                <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest">
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
