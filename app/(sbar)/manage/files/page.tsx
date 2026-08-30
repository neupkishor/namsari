import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { PaginationControl } from "@/components/ui";
import { FilesManagerClient } from "./FilesManagerClient";

export default async function ManageFilesPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string; q?: string }> }) {
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

    const { page: pageParam, type, q: qParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 48;
    const skip = (page - 1) * limit;
    const q = qParam ? String(qParam).trim() : '';

    const mediaWhere: any = {
        ...(type ? { uploadFor: type } : {}),
        ...(q ? { originalName: { contains: q, mode: 'insensitive' } } : {}),
    };

    const [media, totalCount, uploadTypes] = await Promise.all([
        prisma.media.findMany({
            where: mediaWhere,
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
            orderBy: { uploadedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.media.count({ where: mediaWhere }),
        prisma.media.findMany({
            distinct: ["uploadFor"],
            orderBy: { uploadFor: "asc" },
            select: { uploadFor: true },
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
                            key={item.uploadFor}
                            href={`/manage/files?type=${encodeURIComponent(item.uploadFor)}`}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: type === item.uploadFor ? "1px solid var(--color-primary)" : "1px solid #e2e8f0", color: type === item.uploadFor ? "var(--color-primary)" : "#475569", textDecoration: "none", fontWeight: 700, textTransform: "capitalize" }}
                        >
                            {item.uploadFor}
                        </Link>
                    ))}
                </div>
            </header>

            <FilesManagerClient
                media={media.map(item => ({
                    id: item.id,
                    path: item.path,
                    originalName: item.originalName,
                    uploadFor: item.uploadFor,
                }))}
            />

            {totalPages > 1 && (
                <div style={{ marginTop: "24px" }}>
                    <PaginationControl totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}
