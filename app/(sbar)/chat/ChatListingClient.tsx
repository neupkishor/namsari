"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { getDefaultPropertyPriceRate, type PropertyPriceRate } from '@/lib/pricing';
import { logUploadError } from '@/lib/client-error-logger';
import { resolveUploadedFileUrl, uploadFileWithIntent } from '@/lib/uploader';

type ChatMessage = {
    role: 'assistant' | 'user';
    content: string;
    createdAt: string;
};

type ChatDraft = {
    mode?: 'create' | 'edit';
    editPropertyId?: number;
    duplicatePropertyConfirmationId?: number;
    duplicatePropertyDifferentiator?: string;
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

type StoredChatState = {
    messages?: ChatMessage[];
    draft?: ChatDraft;
    attachedImages?: Array<{ url: string; imageOf: string; filename: string }>;
    createdId?: number | null;
    createdPath?: string | null;
    updatedPath?: string | null;
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

const PROPERTY_MUTATION_ERROR_MESSAGES: Record<string, string> = {
    property_image_required: 'Please upload at least one property photo before I create the listing.',
    missing_required_listing_information: 'I still need the required listing details before I can create it. Please share the property type, purpose, district, and city or village.',
    login_required: 'Please log in before creating or updating a property listing.',
    user_not_found: 'I could not find your user account. Please log in again and try once more.',
    property_id_required: 'Please tell me which property you want to update.',
    property_not_found: 'I could not find that property. Please check the property and try again.',
    unauthorized: 'You do not have permission to do that.',
    duplicate_property_confirmation_required: 'This property looks very similar to one you have already listed. Please tell me what is different, or confirm that you want to create another listing with the same details.',
};

function normalizeApiErrorKey(value: unknown) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function humanizeApiError(value: unknown) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (!raw.includes('_')) return raw;

    return raw
        .split('_')
        .filter(Boolean)
        .join(' ');
}

function propertyMutationFailureMessage(action: 'create' | 'update', data: any, response: Response) {
    if (typeof data?.assistantMessage === 'string' && data.assistantMessage.trim()) {
        return data.assistantMessage.trim();
    }

    const rawError = data?.error || data?.code || data?.message;
    const errorKey = normalizeApiErrorKey(rawError);
    const mappedMessage = PROPERTY_MUTATION_ERROR_MESSAGES[errorKey];

    if (mappedMessage) return mappedMessage;

    const fallback = action === 'update'
        ? 'I could not update the property from the current details.'
        : 'I could not create the property from the current details.';
    const readableError = humanizeApiError(rawError);

    if (readableError) {
        return `${fallback} ${readableError}`;
    }

    return response.ok ? fallback : `${fallback} Please try again.`;
}

async function readJsonResponse(response: Response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function uploadedFileNameFromUrl(url: string, fallback: string) {
    return url.split('/').filter(Boolean).pop() || fallback;
}

function mergeDraftImages(draft: ChatDraft, images: Array<{ url: string; imageOf: string; filename: string }>): ChatDraft {
    if (images.length === 0) return draft;

    const imageByUrl = new Map<string, { url: string; imageOf: string; filename: string }>();
    [...(draft.images || []), ...images].forEach((image) => {
        if (image.url) imageByUrl.set(image.url, image);
    });

    return {
        ...draft,
        images: Array.from(imageByUrl.values()),
    };
}

function chatSessionStorageKey(userId: unknown) {
    return `namsari_property_chat_${String(userId || 'guest')}`;
}

function isStoredMessage(value: unknown): value is ChatMessage {
    const message = value as ChatMessage;
    return Boolean(
        message &&
        (message.role === 'assistant' || message.role === 'user') &&
        typeof message.content === 'string' &&
        typeof message.createdAt === 'string'
    );
}

function readStoredChatState(key: string): StoredChatState | null {
    try {
        const raw = window.sessionStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as StoredChatState;
        return {
            ...parsed,
            messages: Array.isArray(parsed.messages) ? parsed.messages.filter(isStoredMessage) : undefined,
            draft: parsed.draft && typeof parsed.draft === 'object' ? parsed.draft : undefined,
            attachedImages: Array.isArray(parsed.attachedImages) ? parsed.attachedImages : undefined,
            createdId: typeof parsed.createdId === 'number' ? parsed.createdId : null,
            createdPath: typeof parsed.createdPath === 'string' ? parsed.createdPath : null,
            updatedPath: typeof parsed.updatedPath === 'string' ? parsed.updatedPath : null,
        };
    } catch {
        return null;
    }
}

function writeStoredChatState(key: string, state: StoredChatState) {
    try {
        window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
        // Ignore storage errors so chat still works in private or restricted browser sessions.
    }
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
    const [uploadingImages, setUploadingImages] = useState(false);
    const [attachedImages, setAttachedImages] = useState<Array<{ url: string; imageOf: string; filename: string }>>([]);
    const [imageUploadProgress, setImageUploadProgress] = useState<{ fileName: string; progress: number; status: 'compressing' | 'preparing' | 'uploading' } | null>(null);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [recordingLimitNotice, setRecordingLimitNotice] = useState(false);
    const discardRecordingRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartedAtRef = useRef<number>(0);
    const recordingTimerRef = useRef<number | null>(null);
    const [storageHydrated, setStorageHydrated] = useState(false);
    const storageKey = useMemo(() => chatSessionStorageKey(currentUser?.id), [currentUser?.id]);

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
        const stored = readStoredChatState(storageKey);

        if (stored) {
            if (stored.messages?.length) setMessages(stored.messages);
            if (stored.draft) setDraft(stored.draft);
            if (stored.attachedImages) setAttachedImages(stored.attachedImages);
            setCreatedId(stored.createdId ?? null);
            setCreatedPath(stored.createdPath ?? null);
            setUpdatedPath(stored.updatedPath ?? null);
        }

        setStorageHydrated(true);
    }, [storageKey]);

    useEffect(() => {
        if (!storageHydrated) return;

        writeStoredChatState(storageKey, {
            messages,
            draft,
            attachedImages,
            createdId,
            createdPath,
            updatedPath,
        });
    }, [attachedImages, createdId, createdPath, draft, messages, storageHydrated, storageKey, updatedPath]);

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

            const data = await readJsonResponse(response);
            if (!response.ok || data?.success === false) {
                appendAssistant(propertyMutationFailureMessage('create', data, response));
                return;
            }

            if (!data?.property) {
                appendAssistant('I could not create the property because the creation response did not include the new listing.');
                return;
            }

            setUpdatedPath(null);
            setCreatedId(data.property?.id || null);
            setCreatedPath(propertyManagePath(data.property || {}));
            setAttachedImages([]);
            setDraft((previous) => ({ ...previous, images: undefined }));
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

            const data = await readJsonResponse(response);
            if (!response.ok || data?.success === false) {
                appendAssistant(propertyMutationFailureMessage('update', data, response));
                return;
            }

            if (!data?.property) {
                appendAssistant('I could not update the property because the update response did not include the listing.');
                return;
            }

            setCreatedId(null);
            setCreatedPath(null);
            setUpdatedPath(propertyManagePath(data.property || {}));
            setAttachedImages([]);
            setDraft((previous) => ({ ...previous, images: undefined }));
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
        if (!content || loading || creating || uploadingImages) return;

        setInput('');
        appendUser(content);

        const conversation: ChatMessage[] = [...messages, { role: 'user', content, createdAt: new Date().toISOString() }];
        const nextDraft = mergeDraftImages(draft, attachedImages);
        await askAssistant(conversation, nextDraft);
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
        if (loading || creating || uploadingImages || recording) return;
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
                    const nextDraft = mergeDraftImages(draft, attachedImages);
                    await askAssistant(conversation, nextDraft, {
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

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0 || loading || creating || uploadingImages) return;

        setUploadingImages(true);
        setError(null);

        try {
            const uploaded: Array<{ url: string; imageOf: string; filename: string }> = [];

            for (const originalFile of files) {
                setImageUploadProgress({ fileName: originalFile.name, progress: 0, status: 'compressing' });
                const compressedBlob = await imageCompression(originalFile, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });
                const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type || originalFile.type });

                const formData = new FormData();
                formData.append('file', file);
                formData.append('platform', 'namsari');

                const data = await uploadFileWithIntent({
                    type: 'properties',
                    file,
                    originalFile,
                    formData,
                    onStatusChange: (status) => {
                        setImageUploadProgress((previous) => previous ? { ...previous, status, progress: status === 'preparing' ? 0 : previous.progress } : previous);
                    },
                    onProgress: (progress) => {
                        setImageUploadProgress((previous) => previous ? { ...previous, progress, status: 'uploading' } : previous);
                    },
                });

                const fileUrl = resolveUploadedFileUrl(data.path || data.file, data.url);
                uploaded.push({
                    url: fileUrl,
                    imageOf: 'property',
                    filename: data?.name || uploadedFileNameFromUrl(fileUrl, originalFile.name),
                });
            }

            setAttachedImages((previous) => [...previous, ...uploaded]);
            setDraft((previous) => mergeDraftImages(previous, uploaded));
            appendAssistant(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} attached. Tell me which property to add them to, or continue the listing details.`);
        } catch (uploadError) {
            logUploadError(uploadError, {
                uploadType: 'properties',
                source: 'chat',
            });
            setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image');
        } finally {
            event.target.value = '';
            setUploadingImages(false);
            setImageUploadProgress(null);
        }
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
                            <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === 'assistant' ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-white'}`}>
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
                            disabled={loading || creating || uploadingImages}
                        />
                        <button type="button" onClick={() => void handleSend()} disabled={loading || creating || uploadingImages || !input.trim()} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                            Send
                        </button>
                        <label className={`flex min-h-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-50 ${loading || creating || uploadingImages ? 'pointer-events-none opacity-60' : ''}`}>
                            Photos
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(event) => void handleImageUpload(event)}
                                disabled={loading || creating || uploadingImages}
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => recording ? stopRecording() : void startRecording()}
                            disabled={loading || creating || uploadingImages}
                            title={recording ? `Stop recording (${recordingSeconds}s)` : 'Record voice note'}
                            aria-label={recording ? `Stop recording, ${recordingSeconds} seconds` : 'Record voice note'}
                            className={`flex min-h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${recording ? 'bg-red-600 text-white hover:bg-red-500' : 'border border-slate-300 text-slate-800 hover:border-slate-900 hover:bg-slate-50'}`}
                        >
                            <MicrophoneIcon active={recording} />
                        </button>
                    </div>

                    {(attachedImages.length > 0 || imageUploadProgress) && (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {imageUploadProgress ? (
                                <div className="font-medium">
                                    {imageUploadProgress.status === 'compressing' ? 'Preparing' : 'Uploading'} {imageUploadProgress.fileName}
                                    {imageUploadProgress.status === 'uploading' ? ` (${imageUploadProgress.progress}%)` : ''}
                                </div>
                            ) : null}
                            {attachedImages.length > 0 ? (
                                <div className="mt-1 font-medium">
                                    {attachedImages.length} photo{attachedImages.length === 1 ? '' : 's'} ready to add.
                                </div>
                            ) : null}
                        </div>
                    )}

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
