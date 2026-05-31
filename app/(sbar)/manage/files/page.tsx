import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { PaginationControl } from "@/components/ui";
import { FilesManagerClient } from "./FilesManagerClient";

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

export default async function ManageFilesPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string; folder?: string; q?: string }> }) {
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

    const { page: pageParam, type, folder: folderParam, q: qParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 48;
    const skip = (page - 1) * limit;
    const q = qParam ? String(qParam).trim() : '';
    const currentFolderId = folderParam ? Number(folderParam) : null;
    const currentFolder = currentFolderId
        ? await prisma.mediaFolder.findUnique({ where: { id: currentFolderId } })
        : null;
    // Determine folder IDs to include in file search: current folder and its descendants
    const allFoldersRaw = await prisma.mediaFolder.findMany({ select: { id: true, fullPath: true } });
    const currentFolderFullPath = currentFolder?.fullPath || 'files';
    const descendantFolderIds = allFoldersRaw
        .filter(f => f.fullPath === currentFolderFullPath || f.fullPath.startsWith(`${currentFolderFullPath}/`))
        .map(f => f.id);

    const mediaWhere: any = {
        ...(type ? { uploadType: type } : {}),
        ...(currentFolder ? { folderId: { in: descendantFolderIds.length ? descendantFolderIds : [currentFolder.id] } } : { folderId: null }),
        ...(q ? { OR: [ { fileName: { contains: q, mode: 'insensitive' } }, { originalName: { contains: q, mode: 'insensitive' } } ] } : {}),
    };

    const [media, totalCount, uploadTypes, allFolders, childFolders] = await Promise.all([
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
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.media.count({ where: mediaWhere }),
        prisma.media.findMany({
            distinct: ["uploadType"],
            orderBy: { uploadType: "asc" },
            select: { uploadType: true },
        }),
        prisma.mediaFolder.findMany({
            orderBy: [{ fullPath: "asc" }],
            select: { id: true, name: true, fullPath: true, parentId: true },
        }),
        prisma.mediaFolder.findMany({
            where: { parentId: currentFolder?.id || null },
            orderBy: { name: "asc" },
            select: { id: true, name: true, fullPath: true, parentId: true },
        }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const parentFolder = currentFolder?.parentId ? allFolders.find(folder => folder.id === currentFolder.parentId) : null;

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

            <FilesManagerClient
                currentFolderId={currentFolder?.id || null}
                currentFolderPath={currentFolder?.fullPath || "files"}
                folders={childFolders}
                media={media.map(item => ({
                    id: item.id,
                    fileName: item.fileName,
                    originalName: item.originalName,
                    folderId: item.folderId,
                    uploadType: item.uploadType,
                }))}
            />

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px", color: "#64748b", fontSize: "0.9rem" }}>
                <Link href="/manage/files" style={{ color: "var(--color-primary)", fontWeight: 800, textDecoration: "none" }}>files</Link>
                {currentFolder && (
                    <>
                        <span>/</span>
                        <span style={{ fontWeight: 800, color: "#0f172a" }}>{currentFolder.name}</span>
                    </>
                )}
                {parentFolder && (
                    <Link href={`/manage/files?folder=${parentFolder.id}`} style={{ marginLeft: "auto", color: "#64748b", fontWeight: 700, textDecoration: "none" }}>Up one folder</Link>
                )}
                {currentFolder && !parentFolder && (
                    <Link href="/manage/files" style={{ marginLeft: "auto", color: "#64748b", fontWeight: 700, textDecoration: "none" }}>Back to root</Link>
                )}
            </div>

            {/* Folders are rendered inside the client component (folders prop) */}

            {/* Media listing moved into the client component (FilesManagerClient) */}

            {totalPages > 1 && (
                <div style={{ marginTop: "24px" }}>
                    <PaginationControl totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}
