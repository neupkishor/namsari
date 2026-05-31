import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { PaginationControl } from "@/components/ui";
import { FilesUploadClient } from "./FilesUploadClient";

function formatBytes(bytes?: number | null) {
    if (!bytes || bytes <= 0) return "n/a";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default async function ManageFilesPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string }> }) {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/auth/login");
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
    });

    const isAdmin = fullUser?.type === "admin" || fullUser?.role?.role?.toLowerCase().includes("admin");
    if (!isAdmin || user.operatingId) {
        redirect("/manage");
    }

    const { page: pageParam, type } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 48;
    const skip = (page - 1) * limit;
    const where = type ? { uploadType: type } : {};

    const [media, totalCount, uploadTypes] = await Promise.all([
        prisma.media.findMany({
            where,
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        type: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.media.count({ where }),
        prisma.media.findMany({
            distinct: ["uploadType"],
            orderBy: { uploadType: "asc" },
            select: { uploadType: true },
        }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div style={{ padding: "24px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "8px", fontWeight: "bold" }}>Files</h1>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        Uploaded media with storage details, compression size, and uploader ownership.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Link href="/manage/files" style={{ padding: "8px 12px", borderRadius: "8px", border: !type ? "1px solid var(--color-primary)" : "1px solid #e2e8f0", color: !type ? "var(--color-primary)" : "#475569", textDecoration: "none", fontWeight: 700 }}>
                        All
                    </Link>
                    {uploadTypes.map(item => (
                        <Link
                            key={item.uploadType}
                            href={`/manage/files?type=${encodeURIComponent(item.uploadType)}`}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: type === item.uploadType ? "1px solid var(--color-primary)" : "1px solid #e2e8f0", color: type === item.uploadType ? "var(--color-primary)" : "#475569", textDecoration: "none", fontWeight: 700, textTransform: "capitalize" }}
                        >
                            {item.uploadType}
                        </Link>
                    ))}
                </div>
            </header>

            <FilesUploadClient />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                {media.map(item => (
                    <article key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "white" }}>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ display: "block", height: "170px", background: "#f8fafc" }}>
                            {item.mime?.startsWith("image/") ? (
                                <img src={item.url} alt={item.originalName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 800 }}>
                                    {item.mime || "File"}
                                </div>
                            )}
                        </a>

                        <div style={{ padding: "14px", display: "grid", gap: "10px" }}>
                            <div>
                                <div title={item.originalName} style={{ fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.originalName}
                                </div>
                                <div title={item.fileName} style={{ color: "#64748b", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.fileName}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.82rem", color: "#334155" }}>
                                <div><strong>Original:</strong> {formatBytes(item.originalSize)}</div>
                                <div><strong>Compressed:</strong> {formatBytes(item.compressedSize)}</div>
                                <div><strong>Stored:</strong> {formatBytes(item.storedSize)}</div>
                                <div><strong>Type:</strong> {item.uploadType}</div>
                            </div>

                            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", fontSize: "0.82rem", color: "#475569" }}>
                                Uploaded by{" "}
                                <strong>{item.uploader.name || item.uploader.username || item.uploader.email || `User ${item.uploader.id}`}</strong>
                                <span style={{ color: "#94a3b8" }}> · {item.uploader.type}</span>
                                <div style={{ color: "#94a3b8", marginTop: "4px" }}>
                                    {item.createdAt.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {media.length === 0 && (
                <div style={{ border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "40px", textAlign: "center", color: "#64748b", background: "#f8fafc" }}>
                    No uploaded files found.
                </div>
            )}

            {totalPages > 1 && (
                <div style={{ marginTop: "24px" }}>
                    <PaginationControl totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}
