import Link from 'next/link';

interface SectionTitleFeedProps {
    title: string;
    description: string;
    ctaText?: string;
    ctaHref?: string;
}

export function SectionTitleFeed({
    title,
    description,
    ctaText,
    ctaHref,
}: SectionTitleFeedProps) {
    const showCta = Boolean(ctaText && ctaHref);

    return (
        <div className="mb-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {title}
                </h2>
                <p className="text-sm text-slate-500">
                    {description}
                </p>
            </div>
            {showCta && (
                <Link
                    href={ctaHref!}
                    className="inline-flex rounded-full border border-[color:var(--color-primary)]/10 bg-[color:var(--color-primary)]/5 px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-[color:var(--color-primary)]/10"
                >
                    {ctaText}
                </Link>
            )}
        </div>
    );
}
