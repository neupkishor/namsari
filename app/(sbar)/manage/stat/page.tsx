import { getCachedListingStats, refreshAndCacheListingStats } from '@/actions/listing-stats';

export default async function ManageStatPage() {
    const { stats, updatedAt } = await getCachedListingStats();

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(10,107,255,0.10),transparent_40%),linear-gradient(180deg,#f8fbff_0%,#f3f7ff_100%)] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="rounded-3xl border border-[color:var(--color-primary)]/15 bg-white/95 p-4 shadow-[0_20px_60px_rgba(10,107,255,0.08)] sm:p-6">
                    <div className="inline-flex rounded-full bg-[color:var(--color-primary)]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--color-primary)]">
                        System Cache
                    </div>
                    <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Listing Statistics Cache</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Recompute listing totals and save them to the system cache used by the homepage categories section.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                        Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : 'Never'}
                    </p>

                    <form
                        action={async () => {
                            'use server';
                            await refreshAndCacheListingStats();
                        }}
                        className="mt-4"
                    >
                        <button
                            type="submit"
                            className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(10,107,255,0.28)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
                        >
                            Run Count And Save
                        </button>
                    </form>
                </header>

                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-3xl border border-[color:var(--color-primary)]/12 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
                        <h2 className="text-sm font-black uppercase tracking-wider text-[color:var(--color-primary)]">For Sale</h2>
                        <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>House</span><strong className="text-[color:var(--color-primary)]">{stats.forSale.house}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Land</span><strong className="text-[color:var(--color-primary)]">{stats.forSale.land}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Building</span><strong className="text-[color:var(--color-primary)]">{stats.forSale.building}</strong></div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[color:var(--color-primary)]/12 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
                        <h2 className="text-sm font-black uppercase tracking-wider text-[color:var(--color-primary)]">For Rent</h2>
                        <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Flat</span><strong className="text-[color:var(--color-primary)]">{stats.forRent.flat}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>House</span><strong className="text-[color:var(--color-primary)]">{stats.forRent.house}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Apartment</span><strong className="text-[color:var(--color-primary)]">{stats.forRent.apartment}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Total rent</span><strong className="text-[color:var(--color-primary)]">{stats.forRent.totalRent}</strong></div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[color:var(--color-primary)]/12 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
                        <h2 className="text-sm font-black uppercase tracking-wider text-[color:var(--color-primary)]">Requirements</h2>
                        <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Total requirements</span><strong className="text-[color:var(--color-primary)]">{stats.requirements.total}</strong></div>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-[color:var(--color-primary)]/12 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:p-6">
                    <h2 className="text-sm font-black uppercase tracking-wider text-[color:var(--color-primary)]">Type / Purpose Matrix</h2>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-slate-600">
                                    <th className="px-2 py-2 font-bold">Type</th>
                                    <th className="px-2 py-2 font-bold">Sale</th>
                                    <th className="px-2 py-2 font-bold">Rent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(stats.byTypePurpose).map(([type, counts]) => (
                                    <tr key={type} className="border-b border-slate-100 text-slate-700">
                                        <td className="px-2 py-2 capitalize font-semibold">{type}</td>
                                        <td className="px-2 py-2 font-semibold text-[color:var(--color-primary)]">{counts.sale}</td>
                                        <td className="px-2 py-2 font-semibold text-[color:var(--color-primary)]">{counts.rent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
