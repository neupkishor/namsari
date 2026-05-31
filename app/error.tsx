"use client";

import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        fetch("/api/errors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                digest: error.digest,
                source: "app",
                page: window.location.href,
                occurredAt: new Date().toISOString()
            })
        }).catch(() => {});
    }, [error]);

    return (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f8fafc" }}>
            <div style={{ maxWidth: "520px", width: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "28px", textAlign: "center" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px", color: "#0f172a" }}>Something went wrong</h1>
                <p style={{ color: "#64748b", marginBottom: "20px" }}>The issue has been logged for review.</p>
                <button
                    type="button"
                    onClick={reset}
                    style={{ border: "none", borderRadius: "8px", background: "var(--color-primary)", color: "white", padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}
                >
                    Try again
                </button>
            </div>
        </main>
    );
}
