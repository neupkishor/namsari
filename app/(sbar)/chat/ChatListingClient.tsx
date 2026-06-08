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
    mode?: 'create' | 'edit';
    editPropertyId?: number;
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
    status?: string;
    soldStatus?: string;
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

function MicrophoneIcon({ active = false }: { active?: boolean }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <path d="M12 19v3" />
            <path d="M8 22h8" />
            {active ? <circle cx="18" cy="6" r="3" fill="currentColor" stroke="none" /> : null}
        </svg>
    );
}

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
    const [submittingAction, setSubmittingAction] = useState<'create' | 'update' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [createdPath, setCreatedPath] = useState<string | null>(null);
    const [updatedPath, setUpdatedPath] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [recordingLimitNotice, setRecordingLimitNotice] = useState(false);
    const discardRecordingRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartedAtRef = useRef<number>(0);
    const recordingTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

    const defaultRate = useMemo(() => localPriceRateFromDraft(draft), [draft]);
    const understoodItems = useMemo(() => {
        const location = [draft.location?.area, draft.location?.cityVillage, draft.location?.district].filter(Boolean).join(', ');
        const features = draft.features || {};
        const featureSummary = [
            typeof features.bedrooms === 'number' ? `${features.bedrooms} bed` : '',
            typeof features.bathrooms === 'number' ? `${features.bathrooms} bath` : '',
            typeof features.builtUpArea === 'number' ? `${features.builtUpArea} ${features.builtUpAreaUnit || ''}`.trim() : '',
        ].filter(Boolean).join(' · ');

        return [
            { label: 'Location', value: location },
            { label: 'Purpose', value: draft.purposes?.join(', ') },
            { label: 'Property', value: draft.types?.join(', ') },
            { label: 'Price', value: typeof draft.price?.price === 'number' ? `${draft.price.price}${draft.price.unit ? ` / ${draft.price.unit}` : ''}` : '' },
            { label: 'Rate', value: draft.price?.rate || defaultRate },
            { label: 'Road', value: [draft.roadSize, draft.roadType].filter(Boolean).join(' ') },
            { label: 'Facing', value: draft.facingDirection },
            { label: 'Features', value: featureSummary },
        ].filter((item) => item.value);
    }, [defaultRate, draft]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading, creating]);

    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
            mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const appendAssistant = (content: string) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: formatMessageText(content), createdAt: new Date().toISOString() }]);
    };

    const appendUser = (content: string) => {
        setMessages((prev) => [...prev, { role: 'user', content: formatMessageText(content), createdAt: new Date().toISOString() }]);
    };

    const submitCreatePayload = async (payload: any) => {
        setCreating(true);
        setSubmittingAction('create');
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

            setUpdatedPath(null);
            setCreatedId(data.property?.id || null);
            setCreatedPath(propertyManagePath(data.property || {}));
            appendAssistant(`Property created successfully${data.property?.id ? ` as #${data.property.id}` : ''}.`);
        } finally {
            setCreating(false);
            setSubmittingAction(null);
        }
    };

    const submitUpdatePayload = async (payload: any) => {
        setCreating(true);
        setSubmittingAction('update');
        setError(null);

        try {
            const response = await fetch('/api/properties/chat', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to update property');
            }

            setCreatedId(null);
            setCreatedPath(null);
            setUpdatedPath(propertyManagePath(data.property || {}));
            appendAssistant(`Property #${data.property?.id || payload.propertyId} updated successfully.`);
        } finally {
            setCreating(false);
            setSubmittingAction(null);
        }
    };

    const askAssistant = async (conversation: ChatMessage[], nextDraft: ChatDraft, audio?: { dataUrl: string; mimeType: string; durationSeconds: number }) => {
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
                    audio,
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

            if (data.readyToUpdate && data.updatePayload) {
                await submitUpdatePayload(data.updatePayload);
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

    const stopRecordingTimer = () => {
        if (recordingTimerRef.current) {
            window.clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    };

    const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read audio recording'));
        reader.readAsDataURL(blob);
    });

    const startRecording = async () => {
        if (loading || creating || recording) return;
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            recordingStartedAtRef.current = Date.now();
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            recorder.onstop = async () => {
                stopRecordingTimer();
                setRecording(false);
                stream.getTracks().forEach((track) => track.stop());

                const durationSeconds = Math.min(60, Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)));
                const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
                audioChunksRef.current = [];

                if (discardRecordingRef.current) {
                    discardRecordingRef.current = false;
                    setRecordingLimitNotice(true);
                    return;
                }

                if (blob.size === 0) {
                    setError('No audio was recorded.');
                    return;
                }

                try {
                    const dataUrl = await blobToDataUrl(blob);
                    const userContent = `Voice note (${durationSeconds}s)`;
                    appendUser(userContent);
                    const conversation: ChatMessage[] = [...messages, { role: 'user', content: userContent, createdAt: new Date().toISOString() }];
                    await askAssistant(conversation, draft, {
                        dataUrl,
                        mimeType: blob.type || 'audio/webm',
                        durationSeconds,
                    });
                } catch (recordingError) {
                    setError(recordingError instanceof Error ? recordingError.message : 'Failed to send audio recording');
                }
            };

            recorder.start();
            setRecording(true);
            setRecordingSeconds(0);
            recordingTimerRef.current = window.setInterval(() => {
                const elapsed = Math.round((Date.now() - recordingStartedAtRef.current) / 1000);
                setRecordingSeconds(Math.min(60, elapsed));
                if (elapsed >= 60 && mediaRecorderRef.current?.state === 'recording') {
                    discardRecordingRef.current = true;
                    mediaRecorderRef.current.stop();
                }
            }, 500);
        } catch {
            setError('Microphone access is needed to send an audio note.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const quickType = (value: string) => {
        setInput(value);
    };

    return (
        <div className="-mx-4 -my-6 flex min-h-[calc(100vh-var(--header-height))] flex-col bg-slate-50 lg:-mx-5 xl:-mx-6">
            <div className="sticky top-[var(--header-height)] z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
                <div className="mx-auto flex max-w-6xl flex-col gap-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Property Chat</div>
                            <h1 className="text-xl font-black text-slate-950 sm:text-2xl">Property assistant</h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSummaryOpen((value) => !value)}
                            className="self-start rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 md:self-auto"
                        >
                            {summaryOpen ? 'Hide context' : 'Show context'}
                        </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="text-sm font-bold text-slate-900">Understood so far</div>
                            <div className="text-xs font-semibold text-slate-500">{understoodItems.length} fields</div>
                        </div>
                        {understoodItems.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {understoodItems.map((item) => (
                                    <div key={item.label} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                                        <span className="font-semibold text-slate-950">{item.label}:</span> {item.value}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">Waiting for property details.</div>
                        )}
                    </div>

                    {summaryOpen && (
                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account</div>
                                <div className="mt-1 text-sm font-bold text-slate-900">{currentUser?.name || currentUser?.username || 'Logged in user'}</div>
                                <div className="mt-2 flex gap-2 text-xs text-slate-600">
                                    <span className="rounded-full bg-slate-100 px-2 py-1">{contextSummary.propertyCount} properties</span>
                                    <span className="rounded-full bg-slate-100 px-2 py-1">{contextSummary.requirementCount} requirements</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Draft</div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                                    <span>District: <b>{draft.location?.district || '-'}</b></span>
                                    <span>City: <b>{draft.location?.cityVillage || '-'}</b></span>
                                    <span>Purpose: <b>{draft.purposes?.[0] || '-'}</b></span>
                                    <span>Type: <b>{draft.types?.[0] || '-'}</b></span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent context</div>
                                <div className="mt-2 space-y-1 text-xs text-slate-600">
                                    {[...contextSummary.recentProperties.slice(0, 1), ...contextSummary.recentRequirements.slice(0, 1)].length > 0
                                        ? (
                                            <>
                                                {contextSummary.recentProperties.slice(0, 1).map((property) => (
                                                    <div key={`property-${property.id}`} className="truncate">Property: {property.title}</div>
                                                ))}
                                                {contextSummary.recentRequirements.slice(0, 1).map((requirement) => (
                                                    <div key={`requirement-${requirement.id}`} className="truncate">Requirement: {requirement.content || requirement.propertyTypes || 'Requirement'}</div>
                                                ))}
                                            </>
                                        )
                                        : <div>No recent context yet.</div>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <section className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-5 sm:px-6">
                <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}-${message.createdAt}`} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === 'assistant' ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-white'}`}>
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
                            <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                {submittingAction === 'update' ? 'Updating property...' : 'Creating property from the completed JSON...'}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
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
                            placeholder="Share everything you have in mind about the property"
                            className="min-h-12 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                            disabled={loading || creating}
                        />
                        <button type="button" onClick={() => void handleSend()} disabled={loading || creating || !input.trim()} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                            Send
                        </button>
                        <button
                            type="button"
                            onClick={() => recording ? stopRecording() : void startRecording()}
                            disabled={loading || creating}
                            title={recording ? `Stop recording (${recordingSeconds}s)` : 'Record voice note'}
                            aria-label={recording ? `Stop recording, ${recordingSeconds} seconds` : 'Record voice note'}
                            className={`flex min-h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${recording ? 'bg-red-600 text-white hover:bg-red-500' : 'border border-slate-300 text-slate-800 hover:border-slate-900 hover:bg-slate-50'}`}
                        >
                            <MicrophoneIcon active={recording} />
                        </button>
                    </div>

                    {error && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    {recordingLimitNotice && (
                        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                            Please try to share your message in concise manner.
                        </div>
                    )}

                    {createdId ? (
                        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                            Listing created successfully. <Link href={createdPath || '/manage/properties'} className="font-semibold underline">Open property</Link>
                        </div>
                    ) : null}

                    {updatedPath ? (
                        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                            Listing updated successfully. <Link href={updatedPath} className="font-semibold underline">Open property</Link>
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
