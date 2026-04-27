'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Step = 'root' | 'property' | 'requirement';

const OPTIONS = {
    property: [
        { emoji: '💰', label: 'To Sale', href: '/sell?purpose=sale' },
        { emoji: '🔑', label: 'To Give on Rent', href: '/sell?purpose=rent' },
    ],
    requirement: [
        { emoji: '🏗️', label: 'To Buy', href: '/requirements/new?purpose=sale' },
        { emoji: '🏡', label: 'To Take on Rent', href: '/requirements/new?purpose=rent' },
    ],
};

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

// Mobile: step-by-step
function MobilePost() {
    const [step, setStep] = useState<Step>('root');

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
                            onClick={() => setStep('property')}
                            className="flex flex-col gap-3 rounded-[20px] border border-[color:var(--color-primary)]/12 bg-white p-5 text-left transition-all hover:border-[color:var(--color-primary)]/35 hover:shadow-sm"
                        >
                            <span className="text-3xl">🏠</span>
                            <span className="text-[14px] font-bold text-slate-900">Post Property</span>
                        </button>
                        <button
                            onClick={() => setStep('requirement')}
                            className="flex flex-col gap-3 rounded-[20px] border border-[color:var(--color-primary)]/12 bg-white p-5 text-left transition-all hover:border-[color:var(--color-primary)]/35 hover:shadow-sm"
                        >
                            <span className="text-3xl">🔍</span>
                            <span className="text-[14px] font-bold text-slate-900">Post Requirement</span>
                        </button>
                    </div>
                </div>
            )}

            {(step === 'property' || step === 'requirement') && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('root')} className="text-slate-400 hover:text-slate-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                {step === 'property' ? 'Post Property' : 'Post Requirement'}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {step === 'property' ? 'What are you listing it for?' : 'What are you looking for?'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {OPTIONS[step].map(opt => (
                            <OptionCard key={opt.href} {...opt} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Desktop: all options visible at once
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
                    {OPTIONS.property.map(opt => (
                        <OptionCard key={opt.href} {...opt} />
                    ))}
                </div>
                <div className="space-y-3">
                    <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Post Requirement</div>
                    {OPTIONS.requirement.map(opt => (
                        <OptionCard key={opt.href} {...opt} />
                    ))}
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
