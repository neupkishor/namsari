import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { deleteErrorLog } from "@/actions/errors";
import { PaginationControl } from "@/components/ui";
import { DeleteAllErrorLogsButton } from "./DeleteAllErrorLogsButton";

export default async function ErrorLogsPage({ searchParams }: { searchParams: Promise<{ page?: string; source?: string }> }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/login");
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true }
    });

    const isAdmin = fullUser?.type === "admin" || fullUser?.role?.role?.toLowerCase().includes("admin");
    if (!isAdmin || user.operatingId) {
        redirect("/manage");
    }

    const { page: pageParam, source } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const where = source ? { source } : {};

    const [errors, totalCount, sources] = await Promise.all([
        prisma.errorLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { occurred_at: "desc" },
            skip,
            take: limit
        }),
        prisma.errorLog.count({ where }),
        prisma.errorLog.findMany({
            distinct: ["source"],
            orderBy: { source: "asc" },
            select: { source: true }
        })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div style={{ padding: "24px" }}>
            <header style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "8px", fontWeight: "bold" }}>Error Logs</h1>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        Application, API, and page errors captured for admin review.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <DeleteAllErrorLogsButton disabled={totalCount === 0} />
                    <Link href="/manage/errors" style={{ textDecoration: "none", color: !source ? "white" : "var(--color-primary)", background: !source ? "var(--color-primary)" : "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", fontWeight: 700 }}>
                        All
                    </Link>
                    {sources.map(item => (
                        <Link key={item.source} href={`/manage/errors?source=${encodeURIComponent(item.source)}`} style={{ textDecoration: "none", color: source === item.source ? "white" : "var(--color-primary)", background: source === item.source ? "var(--color-primary)" : "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", fontWeight: 700 }}>
                            {item.source}
                        </Link>
                    ))}
                </div>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                {errors.length === 0 ? (
                    <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        No errors recorded.
                    </div>
                ) : (
                    errors.map((errorLog) => (
                        <article key={errorLog.id} style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                                        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, background: "#fee2e2", color: "#b91c1c", textTransform: "capitalize" }}>
                                            {errorLog.source}
                                        </span>
                                        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                                            {new Date(errorLog.occurred_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: "1rem", color: "#0f172a", lineHeight: 1.5, margin: 0, wordBreak: "break-word" }}>
                                        {errorLog.message}
                                    </h2>
                                </div>

                                <form action={deleteErrorLog.bind(null, errorLog.id)}>
                                    <button type="submit" style={{ border: "1px solid #fecaca", background: "#fff1f2", color: "#be123c", borderRadius: "8px", padding: "8px 12px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                                        Delete
                                    </button>
                                </form>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", fontSize: "0.85rem", color: "#475569" }}>
                                <div>
                                    <strong style={{ color: "#0f172a" }}>Page:</strong> {errorLog.page || "Unknown"}
                                </div>
                                <div>
                                    <strong style={{ color: "#0f172a" }}>User:</strong>{" "}
                                    {errorLog.user ? (
                                        <Link href={`/manage/accounts/${errorLog.user.username}`} style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}>
                                            {errorLog.user.name || errorLog.user.email || `#${errorLog.user.id}`}
                                        </Link>
                                    ) : (
                                        "Guest or unknown"
                                    )}
                                </div>
                            </div>

                            {errorLog.stack && (
                                <details>
                                    <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.85rem" }}>Stack trace</summary>
                                    <pre style={{ marginTop: "10px", padding: "12px", borderRadius: "8px", background: "#0f172a", color: "#e2e8f0", overflowX: "auto", fontSize: "0.75rem", lineHeight: 1.5 }}>
                                        {errorLog.stack}
                                    </pre>
                                </details>
                            )}

                            {errorLog.log && (
                                <details>
                                    <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.85rem" }}>Raw log</summary>
                                    <pre style={{ marginTop: "10px", padding: "12px", borderRadius: "8px", background: "#f8fafc", color: "#334155", overflowX: "auto", fontSize: "0.75rem", lineHeight: 1.5 }}>
                                        {JSON.stringify(errorLog.log, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </article>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
