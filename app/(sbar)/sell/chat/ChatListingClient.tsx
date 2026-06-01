"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getDefaultPropertyPriceRate, type PropertyPriceRate } from '@/lib/pricing';

type ChatMessage = {
    role: 'assistant' | 'user';
    content: string;
    createdAt: string;
};

type ChatDraft = {
    title?: string;
    types?: string[];
    purposes?: string[];
    natures?: string[];
    location?: {
        country?: string;
        province?: string;
        district?: string;
        cityVillage?: string;
        area?: string;
        ward?: string;
        landmark?: string;
        distanceFrom?: string;
        latitude?: number;
        longitude?: number;
    };
    price?: {
        price?: number;
        rate?: PropertyPriceRate;
        unit?: string;
        totalUnit?: number;
        totalPrice?: number;
    };
    detailedPrice?: Array<{
        price?: number;
        rate?: PropertyPriceRate;
        unit?: string;
        totalUnit?: number;
        totalPrice?: number;
    }>;
    remarks?: string;
    roadType?: string;
    roadSize?: string;
    facingDirection?: string;
    isPrivate?: boolean;
    amenities?: Array<{ type: string; name?: string; distance?: string }>;
    images?: Array<{ url: string; imageOf: string; filename: string }>;
    features?: Record<string, unknown>;
    openHouse?: Record<string, unknown>;
};

type ChatContextSummary = {
    propertyCount: number;
    requirementCount: number;
    recentProperties: Array<{
        id: number;
        title: string;
        status: string;
        location?: {
            district?: string | null;
            cityVillage?: string | null;
        } | null;
    }>;
    recentRequirements: Array<{
        id: number;
        content?: string | null;
        propertyTypes?: string | null;
        purposes?: string | null;
        district?: string | null;
        cityVillage?: string | null;
        status: string;
    }>;
};

const COMMON_TYPES = [
    'house',
    'bungalow',
    'villa',
    'multiplex',
    'apartment',
    'penthouse',
    'land',
    'commercial space',
];

function localPriceRateFromDraft(draft: ChatDraft): PropertyPriceRate {
    return getDefaultPropertyPriceRate(draft.types || [], draft.purposes || []);
}

function formatMessageText(text: string) {
    return text.trim();
}

function propertyManagePath(property: { id?: number; slug?: string | null; title?: string | null }) {
    if (!property.id) return '/manage/properties';
    const slug = property.slug || String(property.title || 'property')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return `/manage/properties/${slug}-${property.id}`;
}

export default function ChatListingClient({
    currentUser,
    initialAssistantMessage,
    initialDraft,
    contextSummary,
}: {
    currentUser: any;
    initialAssistantMessage: string;
    initialDraft: ChatDraft;
    contextSummary: ChatContextSummary;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: initialAssistantMessage, createdAt: new Date().toISOString() },
    ]);
    const [input, setInput] = useState('');
    const [draft, setDraft] = useState<ChatDraft>(initialDraft || {});
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [createdPath, setCreatedPath] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const defaultRate = useMemo(() => localPriceRateFromDraft(draft), [draft]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading, creating]);

    const appendAssistant = (content: string) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: formatMessageText(content), createdAt: new Date().toISOString() }]);
    };

    const appendUser = (content: string) => {
        setMessages((prev) => [...prev, { role: 'user', content: formatMessageText(content), createdAt: new Date().toISOString() }]);
    };

    const submitCreatePayload = async (payload: any) => {
        setCreating(true);
        setError(null);

        try {
            const response = await fetch('/api/properties/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to create property');
            }

            setCreatedId(data.property?.id || null);
            setCreatedPath(propertyManagePath(data.property || {}));
            appendAssistant(`Property created successfully${data.property?.id ? ` as #${data.property.id}` : ''}.`);
        } finally {
            setCreating(false);
        }
    };

    const askAssistant = async (conversation: ChatMessage[], nextDraft: ChatDraft) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/sell/chat/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: conversation.map(({ role, content }) => ({ role, content })),
                    draft: nextDraft,
                    defaultRate,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to process chat');
            }

            setDraft(data.draft || nextDraft);
            appendAssistant(data.assistantMessage);

            if (data.readyToCreate && data.createPayload) {
                await submitCreatePayload(data.createPayload);
            }
        } catch (chatError) {
            setError(chatError instanceof Error ? chatError.message : 'Failed to process chat');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        const content = input.trim();
        if (!content || loading || creating) return;

        setInput('');
        appendUser(content);

        const conversation: ChatMessage[] = [...messages, { role: 'user', content, createdAt: new Date().toISOString() }];
        await askAssistant(conversation, draft);
    };

    const quickType = (value: string) => {
        setInput(value);
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_48%,#334155_100%)] px-6 py-5 text-white">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Sell Chat</div>
                    <h1 className="mt-2 text-3xl font-black">Property listing assistant</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">Chat naturally. Genkit extracts the details, asks for what is missing, and creates the listing when the JSON is complete.</p>
                </div>

                <div ref={scrollRef} className="space-y-4 px-4 py-5 sm:px-6 overflow-y-auto max-h-[65vh]">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}-${message.createdAt}`} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === 'assistant' ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-white'}`}>
                                {message.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Thinking...</div>
                        </div>
                    )}

                    {creating && (
                        <div className="flex justify-start">
                            <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Creating property from the completed JSON...</div>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                        {COMMON_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => quickType(type)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold capitalize text-slate-700 transition hover:border-slate-900 hover:bg-slate-50"
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void handleSend();
                                }
                            }}
                            placeholder="Tell me the property details in any order"
                            className="min-h-12 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                            disabled={loading || creating}
                        />
                        <button type="button" onClick={() => void handleSend()} disabled={loading || creating || !input.trim()} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                            Send
                        </button>
                    </div>

                    {error && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    {createdId ? (
                        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                            Listing created successfully. <Link href={createdPath || '/manage/properties'} className="font-semibold underline">Open property</Link>
                        </div>
                    ) : null}
                </div>
            </section>

            <aside className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Active user</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{currentUser?.name || currentUser?.username || 'Logged in user'}</div>
                    <div className="text-sm text-slate-500">The assistant can reference your account, properties, and requirements while creating this listing.</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="text-2xl font-black text-slate-900">{contextSummary.propertyCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Properties</div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="text-2xl font-black text-slate-900">{contextSummary.requirementCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Requirements</div>
                    </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">Draft summary</div>
                    <dl className="mt-3 space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between gap-3"><dt>District</dt><dd className="text-right font-medium">{draft.location?.district || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>City</dt><dd className="text-right font-medium">{draft.location?.cityVillage || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Province</dt><dd className="text-right font-medium">{draft.location?.province || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Purpose</dt><dd className="font-medium capitalize">{draft.purposes?.[0] || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Type</dt><dd className="font-medium capitalize">{draft.types?.[0] || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Primary rate</dt><dd className="font-medium capitalize">{draft.price?.rate || defaultRate}</dd></div>
                    </dl>
                </div>

                {(contextSummary.recentProperties.length > 0 || contextSummary.recentRequirements.length > 0) && (
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">Assistant context</div>
                        {contextSummary.recentProperties.length > 0 && (
                            <div className="mt-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent properties</div>
                                <div className="mt-2 space-y-2">
                                    {contextSummary.recentProperties.map((property) => (
                                        <div key={property.id} className="text-sm text-slate-700">
                                            <div className="font-semibold text-slate-900">{property.title}</div>
                                            <div className="text-xs text-slate-500">
                                                {[property.location?.cityVillage, property.location?.district, property.status].filter(Boolean).join(' · ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {contextSummary.recentRequirements.length > 0 && (
                            <div className="mt-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent requirements</div>
                                <div className="mt-2 space-y-2">
                                    {contextSummary.recentRequirements.map((requirement) => (
                                        <div key={requirement.id} className="text-sm text-slate-700">
                                            <div className="font-semibold text-slate-900">{requirement.content || requirement.propertyTypes || 'Requirement'}</div>
                                            <div className="text-xs text-slate-500">
                                                {[requirement.cityVillage, requirement.district, requirement.purposes, requirement.status].filter(Boolean).join(' · ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                    Ask however you want, for example: “3 ropani land in Pokhara for sale, 25 lakhs per aana, add a rental reference too.” The assistant will normalize the transcript into JSON.
                </div>
            </aside>
        </div>
    );
}
