'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

type Step = 'root' | 'property' | 'requirement';

function OptionCard({ emoji, label, href }: { emoji: string; label: string; href: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 rounded-[20px] border border-[color:var(--color-primary)]/12 bg-white px-5 py-4 transition-all duration-200 hover:border-[color:var(--color-primary)]/35 hover:shadow-sm"
        >
            <span className="text-2xl leading-none">{emoji}</span>
            <span className="text-[15px] font-bold text-slate-900">{label}</span>
        </Link>
    );
}

function MobilePost() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const typeParam = searchParams.get('type');

    const initialStep: Step =
        typeParam === 'property' ? 'property' :
        typeParam === 'requirement' ? 'requirement' :
        'root';

    const [step, setStep] = useState<Step>(initialStep);

    const goToStep = (s: Step) => {
        router.replace(s === 'root' ? '/post' : `/post?type=${s === 'property' ? 'property' : 'requirement'}`, { scroll: false });
        setStep(s);
    };

    return (
        <div className="lg:hidden space-y-6 pt-2">
            {step === 'root' && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">What would you like to post?</h1>
                        <p className="text-sm text-slate-500">Choose a category to continue.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => goToStep('property')}
                            className="flex flex-col gap-3 rounded-[20px] border border-[color:var(--color-primary)]/12 bg-white p-5 text-left transition-all hover:border-[color:var(--color-primary)]/35 hover:shadow-sm"
                        >
                            <span className="text-3xl">🏠</span>
                            <span className="text-[14px] font-bold text-slate-900">Post Property</span>
                        </button>
                        <button
                            onClick={() => goToStep('requirement')}
                            className="flex flex-col gap-3 rounded-[20px] border border-[color:var(--color-primary)]/12 bg-white p-5 text-left transition-all hover:border-[color:var(--color-primary)]/35 hover:shadow-sm"
                        >
                            <span className="text-3xl">🔍</span>
                            <span className="text-[14px] font-bold text-slate-900">Post Requirement</span>
                        </button>
                    </div>
                </div>
            )}

            {step === 'property' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => goToStep('root')} className="text-slate-400 hover:text-slate-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Post Property</h1>
                            <p className="text-sm text-slate-500">What are you listing it for?</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <OptionCard emoji="💰" label="To Sale" href="/sell?purpose=sale" />
                        <OptionCard emoji="🔑" label="To Give on Rent" href="/sell?purpose=rent" />
                    </div>
                </div>
            )}

            {step === 'requirement' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => goToStep('root')} className="text-slate-400 hover:text-slate-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Post Requirement</h1>
                            <p className="text-sm text-slate-500">What are you looking for?</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <OptionCard emoji="🏗️" label="To Buy" href="/requirements?purpose=sale" />
                        <OptionCard emoji="🏡" label="To Take on Rent" href="/requirements?purpose=rent" />
                    </div>
                </div>
            )}
        </div>
    );
}

function DesktopPost() {
    return (
        <div className="hidden lg:block space-y-8">
            <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Post Property or Requirement</h1>
                <p className="text-sm text-slate-500">List your property for sale or rent, or post what you&apos;re looking for.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Post Property</div>
                    <OptionCard emoji="💰" label="To Sale" href="/sell?purpose=sale" />
                    <OptionCard emoji="🔑" label="To Give on Rent" href="/sell?purpose=rent" />
                </div>
                <div className="space-y-3">
                    <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Post Requirement</div>
                    <OptionCard emoji="🏗️" label="To Buy" href="/requirements?purpose=sale" />
                    <OptionCard emoji="🏡" label="To Take on Rent" href="/requirements?purpose=rent" />
                </div>
            </div>
        </div>
    );
}

export default function PostPage() {
    return (
        <>
            <MobilePost />
            <DesktopPost />
        </>
    );
}
