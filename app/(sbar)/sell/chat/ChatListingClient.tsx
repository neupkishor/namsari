"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getDefaultPropertyPriceRate, type PropertyPriceRate } from '@/lib/pricing';

type ChatMessage = {
    role: 'assistant' | 'user';
    content: string;
};

type ChatDraft = {
    district: string;
    cityVillage: string;
    province: string;
    purpose: 'sale' | 'rent' | '';
    type: string;
    title: string;
    price: string;
    unit: string;
    totalUnit: string;
};

type PriceVariant = {
    rate: PropertyPriceRate;
    price: string;
    unit: string;
    totalUnit: string;
};

const TYPE_OPTIONS = [
    'house',
    'bungalow',
    'villa',
    'multiplex',
    'apartment',
    'penthouse',
    'land',
    'commercial space',
];

const PURPOSE_OPTIONS: Array<'sale' | 'rent'> = ['sale', 'rent'];

function isUnitRequired(rate: PropertyPriceRate) {
    return rate !== 'total';
}

function needsTotalUnit(rate: PropertyPriceRate) {
    return rate === 'perUnit' || rate === 'perUnitPerMonth';
}

function toNumber(value: string) {
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

function describeRate(rate: PropertyPriceRate) {
    switch (rate) {
        case 'total':
            return 'flat / total';
        case 'perUnit':
            return 'per unit';
        case 'perMonth':
            return 'per month';
        case 'perUnitPerMonth':
            return 'per unit per month';
    }
}

export default function ChatListingClient({ currentUser }: { currentUser: any }) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Tell me the district first. I will build the listing with you step by step.',
        },
    ]);
    const [input, setInput] = useState('');
    const [step, setStep] = useState<'district' | 'cityVillage' | 'province' | 'purpose' | 'type' | 'title' | 'price' | 'unit' | 'totalUnit' | 'review' | 'done'>('district');
    const [draft, setDraft] = useState<ChatDraft>({
        district: '',
        cityVillage: '',
        province: '',
        purpose: '',
        type: '',
        title: '',
        price: '',
        unit: '',
        totalUnit: '',
    });
    const [primaryRate, setPrimaryRate] = useState<PropertyPriceRate>('total');
    const [detailedPrices, setDetailedPrices] = useState<PriceVariant[]>([]);
    const [detailDraft, setDetailDraft] = useState<PriceVariant>({
        rate: 'total',
        price: '',
        unit: '',
        totalUnit: '',
    });
    const [showDetailComposer, setShowDetailComposer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdId, setCreatedId] = useState<number | null>(null);

    const defaultRate = useMemo(() => {
        if (!draft.type || !draft.purpose) return 'total' as PropertyPriceRate;
        return getDefaultPropertyPriceRate([draft.type], [draft.purpose]);
    }, [draft.type, draft.purpose]);

    const assistantPrompt = useMemo(() => {
        if (step === 'district') return 'What district is the property in?';
        if (step === 'cityVillage') return 'What city or municipality should I use?';
        if (step === 'province') return 'Which province does this property belong to?';
        if (step === 'purpose') return 'Is this listing for sale or rent?';
        if (step === 'type') return 'What kind of property is it?';
        if (step === 'title') return 'What title should I publish?';
        if (step === 'price') return `What is the primary price amount? Default listing style: ${describeRate(defaultRate)}.`;
        if (step === 'unit') return `Which unit should I use for the ${describeRate(primaryRate)} price?`;
        if (step === 'totalUnit') return `How many total units should I use for the ${describeRate(primaryRate)} price?`;
        if (step === 'review') return 'The main listing details are ready. You can add more pricing formats or publish the property now.';
        if (step === 'done') return 'Property created successfully.';
        return '';
    }, [defaultRate, primaryRate, step]);

    const pushAssistant = (content: string) => setMessages((prev) => [...prev, { role: 'assistant', content }]);
    const pushUser = (content: string) => setMessages((prev) => [...prev, { role: 'user', content }]);

    const advance = (nextStep: typeof step, assistantMessage?: string) => {
        setStep(nextStep);
        if (assistantMessage) pushAssistant(assistantMessage);
    };

    const commitMainPrice = () => {
        const rate = defaultRate;
        setPrimaryRate(rate);

        if (isUnitRequired(rate) && !draft.unit.trim()) {
            advance('unit', 'This price format needs a unit. Please type it in.');
            return;
        }

        if (needsTotalUnit(rate) && !draft.totalUnit.trim()) {
            advance('totalUnit', 'How many total units should I use for this listing?');
            return;
        }

        advance('review', 'Main pricing captured. You can add an extra pricing format below if needed.');
    };

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        pushUser(trimmed);
        setInput('');

        if (step === 'district') {
            setDraft((prev) => ({ ...prev, district: trimmed }));
            return advance('cityVillage', 'Got it. What city or municipality is it in?');
        }

        if (step === 'cityVillage') {
            setDraft((prev) => ({ ...prev, cityVillage: trimmed }));
            return advance('province', 'Which province should I use?');
        }

        if (step === 'province') {
            setDraft((prev) => ({ ...prev, province: trimmed }));
            return advance('purpose', 'Is this property for sale or rent?');
        }

        if (step === 'purpose') {
            const value = trimmed.toLowerCase().includes('rent') ? 'rent' : 'sale';
            setDraft((prev) => ({ ...prev, purpose: value }));
            return advance('type', 'What type of property is it?');
        }

        if (step === 'type') {
            setDraft((prev) => ({ ...prev, type: trimmed }));
            return advance('title', 'What title should I publish for this property?');
        }

        if (step === 'title') {
            setDraft((prev) => ({ ...prev, title: trimmed }));
            return advance('price', `What is the primary price amount? Default rate: ${describeRate(getDefaultPropertyPriceRate([draft.type || trimmed], [draft.purpose || 'sale']))}.`);
        }

        if (step === 'price') {
            setDraft((prev) => ({ ...prev, price: trimmed }));
            return commitMainPrice();
        }

        if (step === 'unit') {
            setDraft((prev) => ({ ...prev, unit: trimmed }));
            if (needsTotalUnit(primaryRate)) {
                return advance('totalUnit', 'How many total units should I use?');
            }
            return advance('review', 'Main pricing captured. You can add an extra pricing format below if needed.');
        }

        if (step === 'totalUnit') {
            setDraft((prev) => ({ ...prev, totalUnit: trimmed }));
            return advance('review', 'Main pricing captured. You can add an extra pricing format below if needed.');
        }
    };

    const addDetailPrice = () => {
        const rate = detailDraft.rate;
        if (!detailDraft.price.trim()) return;
        if (isUnitRequired(rate) && !detailDraft.unit.trim()) return;
        if (needsTotalUnit(rate) && !detailDraft.totalUnit.trim()) return;

        setDetailedPrices((prev) => [...prev, { ...detailDraft }]);
        setDetailDraft({ rate: 'total', price: '', unit: '', totalUnit: '' });
        setShowDetailComposer(false);
        pushAssistant('Added another pricing format. You can add one more or create the listing now.');
    };

    const submitProperty = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/properties/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: draft.title,
                    types: [draft.type],
                    purposes: [draft.purpose],
                    location: {
                        province: draft.province,
                        district: draft.district,
                        cityVillage: draft.cityVillage,
                        country: 'Nepal',
                    },
                    price: {
                        price: toNumber(draft.price),
                        rate: primaryRate,
                        unit: draft.unit || undefined,
                        totalUnit: draft.totalUnit ? toNumber(draft.totalUnit) : undefined,
                    },
                    detailedPrice: detailedPrices.map((entry) => ({
                        price: toNumber(entry.price),
                        rate: entry.rate,
                        unit: entry.unit || undefined,
                        totalUnit: entry.totalUnit ? toNumber(entry.totalUnit) : undefined,
                    })),
                    natures: draft.type.toLowerCase().includes('commercial') ? ['commercial'] : ['residential'],
                    images: [],
                    amenities: [],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Failed to create property');
            }

            setCreatedId(data.property?.id || null);
            setStep('done');
            pushAssistant('Property created successfully.');
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Failed to create property');
        } finally {
            setSubmitting(false);
        }
    };

    const canPublish = step === 'review' || step === 'done';
    const primaryRateLabel = describeRate(primaryRate);

    return (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_48%,#334155_100%)] px-6 py-5 text-white">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Sell Chat</div>
                    <h1 className="mt-2 text-3xl font-black">Property listing assistant</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">Answer the prompts in order. I will build the listing and send the API request when everything is ready.</p>
                </div>

                <div className="space-y-4 px-4 py-5 sm:px-6">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === 'assistant' ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-white'}`}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
                    {step !== 'review' && step !== 'done' && (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {step === 'purpose' && PURPOSE_OPTIONS.map((option) => (
                                <button key={option} type="button" onClick={() => {
                                    pushUser(option);
                                    setDraft((prev) => ({ ...prev, purpose: option }));
                                    advance('type', 'What type of property is it?');
                                }} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold capitalize text-slate-700 transition hover:border-slate-900 hover:bg-slate-50">{option}</button>
                            ))}
                            {step === 'type' && TYPE_OPTIONS.map((option) => (
                                <button key={option} type="button" onClick={() => {
                                    pushUser(option);
                                    setDraft((prev) => ({ ...prev, type: option }));
                                    advance('title', 'What title should I publish for this property?');
                                }} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold capitalize text-slate-700 transition hover:border-slate-900 hover:bg-slate-50">{option}</button>
                            ))}
                            {step !== 'purpose' && step !== 'type' && (
                                <>
                                    <input
                                        value={input}
                                        onChange={(event) => setInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder={assistantPrompt}
                                        className="min-h-12 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                                    />
                                    <button type="button" onClick={handleSend} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Send</button>
                                </>
                            )}
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div><span className="font-semibold">District:</span> {draft.district}</div>
                                    <div><span className="font-semibold">City:</span> {draft.cityVillage}</div>
                                    <div><span className="font-semibold">Province:</span> {draft.province}</div>
                                    <div><span className="font-semibold">Type:</span> {draft.type}</div>
                                    <div><span className="font-semibold">Purpose:</span> {draft.purpose}</div>
                                    <div><span className="font-semibold">Primary rate:</span> {primaryRateLabel}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button type="button" onClick={() => setShowDetailComposer((prev) => !prev)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50">
                                    {showDetailComposer ? 'Close price builder' : 'Add another pricing format'}
                                </button>
                                <button type="button" disabled={submitting || !draft.title.trim()} onClick={submitProperty} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
                                    {submitting ? 'Creating...' : 'Create property'}
                                </button>
                            </div>

                            {showDetailComposer && (
                                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="mb-3 text-sm font-semibold text-slate-900">Additional price format</div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <label className="space-y-2 text-sm">
                                            <span className="font-medium text-slate-700">Rate</span>
                                            <select value={detailDraft.rate} onChange={(event) => setDetailDraft((prev) => ({ ...prev, rate: event.target.value as PropertyPriceRate }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900">
                                                <option value="total">total</option>
                                                <option value="perUnit">perUnit</option>
                                                <option value="perMonth">perMonth</option>
                                                <option value="perUnitPerMonth">perUnitPerMonth</option>
                                            </select>
                                        </label>
                                        <label className="space-y-2 text-sm">
                                            <span className="font-medium text-slate-700">Price</span>
                                            <input value={detailDraft.price} onChange={(event) => setDetailDraft((prev) => ({ ...prev, price: event.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
                                        </label>
                                        {isUnitRequired(detailDraft.rate) && (
                                            <label className="space-y-2 text-sm">
                                                <span className="font-medium text-slate-700">Unit</span>
                                                <input value={detailDraft.unit} onChange={(event) => setDetailDraft((prev) => ({ ...prev, unit: event.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
                                            </label>
                                        )}
                                        {needsTotalUnit(detailDraft.rate) && (
                                            <label className="space-y-2 text-sm">
                                                <span className="font-medium text-slate-700">Total unit</span>
                                                <input value={detailDraft.totalUnit} onChange={(event) => setDetailDraft((prev) => ({ ...prev, totalUnit: event.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button type="button" onClick={addDetailPrice} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Add format</button>
                                    </div>
                                </div>
                            )}

                            {detailedPrices.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold text-slate-900">Saved extra pricing formats</div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {detailedPrices.map((price, index) => (
                                            <div key={`${price.rate}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                                                <div className="font-semibold text-slate-900">{price.rate}</div>
                                                <div>Price: {price.price}</div>
                                                {price.unit ? <div>Unit: {price.unit}</div> : null}
                                                {price.totalUnit ? <div>Total unit: {price.totalUnit}</div> : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                            {createdId ? (
                                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                                    Listing created successfully. <Link href={`/manage/properties/${createdId}`} className="font-semibold underline">Open property</Link>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {step === 'done' && createdId && (
                        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                            Listing created successfully. <Link href={`/manage/properties/${createdId}`} className="font-semibold underline">Open property</Link>
                        </div>
                    )}
                </div>
            </section>

            <aside className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Active user</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{currentUser?.name || currentUser?.username || 'Logged in user'}</div>
                    <div className="text-sm text-slate-500">I will use your session to create the property through the API.</div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">Draft summary</div>
                    <dl className="mt-3 space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between gap-3"><dt>Location</dt><dd className="text-right font-medium">{draft.district || '—'} / {draft.cityVillage || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Purpose</dt><dd className="font-medium capitalize">{draft.purpose || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Type</dt><dd className="font-medium capitalize">{draft.type || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Primary rate</dt><dd className="font-medium">{primaryRateLabel}</dd></div>
                    </dl>
                </div>

                <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                    The assistant starts with location, then walks through the rest of the listing. Once the main details are complete, you can add extra price formats before publishing.
                </div>
            </aside>
        </div>
    );
}
