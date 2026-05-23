'use client';

import { useSyncExternalStore } from 'react';

type PopupStore = {
    activeSources: Set<string>;
    scrollLockSources: Set<string>;
    listeners: Set<() => void>;
};

declare global {
    interface Window {
        __namsariPopupStore?: PopupStore;
    }
}

function getStore(): PopupStore {
    if (typeof window === 'undefined') {
        return { activeSources: new Set(), scrollLockSources: new Set(), listeners: new Set() };
    }

    if (!window.__namsariPopupStore) {
        window.__namsariPopupStore = {
            activeSources: new Set<string>(),
            scrollLockSources: new Set<string>(),
            listeners: new Set<() => void>(),
        };
    }

    return window.__namsariPopupStore;
}

function notify() {
    const store = getStore();
    store.listeners.forEach((listener) => listener());
}

function syncBodyScrollLock() {
    if (typeof document === 'undefined') return;
    const store = getStore();
    document.body.style.overflow = store.scrollLockSources.size > 0 ? 'hidden' : '';
}

export function setPopupActive(source: string, isActive: boolean) {
    if (typeof window === 'undefined') return;

    const store = getStore();
    if (isActive) {
        store.activeSources.add(source);
    } else {
        store.activeSources.delete(source);
    }
    notify();
}

export function setBackgroundScrollLocked(source: string, isLocked: boolean) {
    if (typeof window === 'undefined') return;

    const store = getStore();
    if (isLocked) {
        store.scrollLockSources.add(source);
    } else {
        store.scrollLockSources.delete(source);
    }
    syncBodyScrollLock();
}

function subscribe(listener: () => void) {
    if (typeof window === 'undefined') return () => {};

    const store = getStore();
    store.listeners.add(listener);
    return () => {
        store.listeners.delete(listener);
    };
}

function getSnapshot() {
    if (typeof window === 'undefined') return false;
    return getStore().activeSources.size > 0;
}

export function usePopupActive() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
