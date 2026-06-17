'use client';

import { consumeInternalPropertyNavigation } from '@/components/navigation/InternalPropertyLink';

function PropertyPageSkeleton() {
    return (
        <main className="min-h-screen bg-white pb-24 pt-[var(--header-height,72px)]">
            <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    <div className="h-9 w-2/3 max-w-[680px] rounded-full bg-slate-100 animate-pulse" />
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="h-7 w-24 rounded-full bg-slate-100 animate-pulse" />
                        <div className="h-4 w-40 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-[28px] bg-slate-100 animate-pulse">
                            <div className="aspect-[4/3] w-full bg-slate-100" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-[88px] rounded-[24px] bg-slate-100 animate-pulse" />
                            ))}
                        </div>

                        <div className="space-y-3 rounded-[28px] bg-slate-50 p-5">
                            <div className="h-5 w-40 rounded-full bg-slate-100 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
                                <div className="h-4 w-11/12 rounded-full bg-slate-100 animate-pulse" />
                                <div className="h-4 w-4/5 rounded-full bg-slate-100 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
                            <div className="h-5 w-28 rounded-full bg-slate-100 animate-pulse" />
                            <div className="mt-4 space-y-3">
                                <div className="h-4 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                                <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
                                <div className="h-4 w-5/6 rounded-full bg-slate-100 animate-pulse" />
                            </div>
                        </div>

                        <div className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
                            <div className="h-5 w-40 rounded-full bg-slate-100 animate-pulse" />
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-16 rounded-[18px] bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default function Loading() {
    if (!consumeInternalPropertyNavigation()) return null;
    return <PropertyPageSkeleton />;
}
