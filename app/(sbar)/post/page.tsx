'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

type Step = 'root' | 'property' | 'requirement';

type IconProps = { className?: string };

function HomeIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <path d="M3 10.8L12 3l9 7.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 9.5V20h13V9.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 20v-5.5h4V20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SearchIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.9" />
            <path d="M16 16l4.2 4.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
    );
}

function SaleIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <path d="M12 3v18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            <path d="M16.5 7.5c0-1.9-2-3.2-4.5-3.2s-4.5 1.2-4.5 3.2 1.6 2.9 4.5 3.6 4.5 1.7 4.5 3.7-2 3.2-4.5 3.2-4.5-1.3-4.5-3.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function KeyIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <circle cx="8.2" cy="12.2" r="3.8" stroke="currentColor" strokeWidth="1.9" />
            <path d="M11.6 12.2H20v2.2h-2.2v2.2h-2.2v2.2h-2.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BuildingIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <path d="M4.5 20V8.5L12 4l7.5 4.5V20H4.5z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
            <path d="M9 11h1.8v1.8H9V11zm4.2 0H15v1.8h-1.8V11zM9 14.8h1.8v1.8H9v-1.8zm4.2 0H15v1.8h-1.8v-1.8z" fill="currentColor" />
        </svg>
    );
}

function RentIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <path d="M3.5 11.2L12 4l8.5 7.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.2 10.4V20h13.6v-9.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.2 20v-4.7h5.6V20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconBox({ children }: { children: React.ReactNode }) {
    return (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/[0.07] text-[color:var(--color-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {children}
        </span>
    );
}

function OptionCard({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-[20px] border border-[color:var(--color-primary)]/12 bg-white px-5 py-4 transition-all duration-200 hover:border-[color:var(--color-primary)]/35 hover:bg-[color:var(--color-primary)]/[0.02] hover:shadow-sm"
        >
            <IconBox>{icon}</IconBox>
            <span className="text-[15px] font-bold text-slate-900 transition-colors group-hover:text-[color:var(--color-primary)]">{label}</span>
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
    const [pendingStep, setPendingStep] = useState<Exclude<Step, 'root'> | null>(null);

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
                            onClick={() => setPendingStep('property')}
                            className={`flex flex-col gap-3 rounded-[20px] border bg-white p-5 text-left transition-all hover:border-[color:var(--color-primary)]/35 hover:bg-[color:var(--color-primary)]/[0.02] hover:shadow-sm ${pendingStep === 'property' ? 'border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/20' : 'border-[color:var(--color-primary)]/12'}`}
                        >
                            <IconBox>
                                <HomeIcon />
                            </IconBox>
                            <span className="text-[14px] font-bold text-slate-900">Post Property</span>
                        </button>
                        <button
                            onClick={() => setPendingStep('requirement')}
                            className={`flex flex-col gap-3 rounded-[20px] border bg-white p-5 text-left transition-all hover:border-[color:var(--color-primary)]/35 hover:bg-[color:var(--color-primary)]/[0.02] hover:shadow-sm ${pendingStep === 'requirement' ? 'border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/20' : 'border-[color:var(--color-primary)]/12'}`}
                        >
                            <IconBox>
                                <SearchIcon />
                            </IconBox>
                            <span className="text-[14px] font-bold text-slate-900">Post Requirement</span>
                        </button>
                    </div>
                    <button
                        type="button"
                        disabled={!pendingStep}
                        onClick={() => pendingStep && goToStep(pendingStep)}
                        className="w-full rounded-2xl bg-[color:var(--color-primary)] px-5 py-3.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Continue to Details
                    </button>
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
                        <OptionCard icon={<SaleIcon />} label="To Sale" href="/sell?purpose=sale" />
                        <OptionCard icon={<KeyIcon />} label="To Give on Rent" href="/sell?purpose=rent" />
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
                        <OptionCard icon={<BuildingIcon />} label="To Buy" href="/requirements?purpose=sale" />
                        <OptionCard icon={<RentIcon />} label="To Take on Rent" href="/requirements?purpose=rent" />
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
                    <OptionCard icon={<SaleIcon />} label="To Sale" href="/sell?purpose=sale" />
                    <OptionCard icon={<KeyIcon />} label="To Give on Rent" href="/sell?purpose=rent" />
                </div>
                <div className="space-y-3">
                    <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Post Requirement</div>
                    <OptionCard icon={<BuildingIcon />} label="To Buy" href="/requirements?purpose=sale" />
                    <OptionCard icon={<RentIcon />} label="To Take on Rent" href="/requirements?purpose=rent" />
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
