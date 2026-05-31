"use client";

import { useEffect } from "react";
import { errorToPayload, logClientError } from "@/lib/client-error-logger";

export function ClientErrorReporter() {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            logClientError({
                source: "app",
                page: window.location.href,
                message: event.message || "Unhandled browser error",
                stack: event.error?.stack,
                log: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            });
        };

        const handleRejection = (event: PromiseRejectionEvent) => {
            const payload = errorToPayload(event.reason);
            logClientError({
                ...payload,
                source: "app",
                page: window.location.href,
                log: { type: "unhandledrejection" }
            });
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleRejection);

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
        };
    }, []);

    return null;
}
