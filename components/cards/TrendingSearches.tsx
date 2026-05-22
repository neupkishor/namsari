import React from 'react';
import Link from 'next/link';

export function TrendingSearches({ searches, className }: { searches: string[], className?: string }) {
    if (!searches || searches.length === 0) {
        return null;
    }

    return (
        <section
            className={`w-full p-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group ${className || ''}`}
        >
            {/* Header Unit */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-black text-text-main mb-1.5 flex items-center gap-2 group-hover:text-primary transition-colors">
                        <span className="w-1.5 h-6 bg-primary rounded-full block" />
                        Trending Searches
                    </h2>
                    <p className="text-text-muted text-[13px] font-medium leading-none">
                        Most frequent market queries.
                    </p>
                </div>
                <Link 
                    href="/search" 
                    className="text-[12px] font-bold text-primary hover:underline px-3 py-1.5 bg-primary/5 rounded-full transition-colors"
                >
                    View All
                </Link>
            </div>

            {/* Tags Grid */}
            <div className="flex flex-wrap gap-2.5">
                {searches.map((term, i) => (
                    <Link
                        key={i}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="text-text-main/80 no-underline text-[13px] py-2.5 px-4 bg-white border border-border rounded-xl flex items-center gap-2.5 font-bold hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm transition-all duration-200 group/tag"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/tag:bg-primary transition-colors" />
                        {term}
                    </Link>
                ))}
            </div>
        </section>
    );
}
