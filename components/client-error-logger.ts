"use client";

type ClientErrorPayload = {
    message: string;
    source?: string;
    page?: string;
    stack?: string;
    log?: unknown;
};

export function logClientError(payload: ClientErrorPayload) {
    fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            source: payload.source || "app",
            page: payload.page || window.location.href,
            message: payload.message,
            stack: payload.stack,
            log: payload.log,
            occurredAt: new Date().toISOString()
        })
    }).catch(() => {});
}

export function errorToPayload(error: unknown) {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack
        };
    }

    return {
        message: typeof error === "string" ? error : "Unknown error",
        stack: undefined
    };
}

export function logUploadError(error: unknown, context: Record<string, unknown> = {}) {
    const payload = errorToPayload(error);

    logClientError({
        ...payload,
        source: "upload",
        log: context
    });
}
