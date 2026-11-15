"use client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f8fafc" }}>
            <div style={{ maxWidth: "520px", width: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "28px", textAlign: "center" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px", color: "#0f172a" }}>Something went wrong</h1>
                <p style={{ color: "#64748b", marginBottom: "20px" }}>Please try again.</p>
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
