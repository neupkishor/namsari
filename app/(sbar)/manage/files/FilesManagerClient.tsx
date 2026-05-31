'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMediaFolder, deleteMedia, moveMedia, renameMedia, deleteMediaFolder } from '@/actions/media';
import { ensurePhpAuthCookie, uploadFileWithIntent } from '@/lib/uploader';

type FolderOption = {
    id: number;
    name: string;
    fullPath: string;
    parentId: number | null;
};

type MediaItem = {
    id: number;
    fileName: string;
    originalName: string;
    folderId: number | null;
};

type FilesManagerClientProps = {
    currentFolderId: number | null;
    currentFolderPath: string;
    folders: FolderOption[];
    media: MediaItem[];
    searchQuery?: string;
};

function folderUploadPath(fullPath: string) {
    return fullPath.replace(/^files\/?/, '');
}

export function FilesManagerClient({ currentFolderId, currentFolderPath, folders, media }: FilesManagerClientProps) {
    const [showCreateFolder, setShowCreateFolder] = React.useState(false);
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const [folderPage, setFolderPage] = React.useState(1);
    const foldersPerPage = 10;
    const visibleFolders = folders.slice(0, folderPage * foldersPerPage);
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');
        setStatus('Preparing upload...');
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            const data = await uploadFileWithIntent({
                type: 'files',
                file,
                originalFile: file,
                folderId: currentFolderId,
                folderPath: folderUploadPath(currentFolderPath),
                formData,
                onStatusChange: nextStatus => setStatus(nextStatus === 'preparing' ? 'Preparing upload...' : 'Uploading file...'),
                onProgress: setProgress,
            });

            if (!data?.success) {
                throw new Error(data?.message || data?.error || 'Upload failed');
            }

            router.refresh();
        } catch (uploadError) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload file';
            setMessage(errorMessage);
        } finally {
            setUploading(false);
            setStatus('');
            setProgress(0);
            event.target.value = '';
        }
    };

    const runAction = (action: () => Promise<void>) => {
        setMessage('');
        startTransition(async () => {
            try {
                await ensurePhpAuthCookie();
                await action();
                router.refresh();
            } catch (error) {
                setMessage(error instanceof Error ? error.message : 'File operation failed');
            }
        });
    };

    async function submitCreateFolder(name: string) {
        await ensurePhpAuthCookie();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('parentId', String(currentFolderId || ''));
        await createMediaFolder(formData);
        router.refresh();
    }

    async function submitUploadFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        setUploading(true);
        setMessage('');
        try {
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                await uploadFileWithIntent({
                    type: 'files',
                    file: f,
                    originalFile: f,
                    folderId: currentFolderId,
                    folderPath: folderUploadPath(currentFolderPath),
                    onStatusChange: () => {},
                    onProgress: () => {},
                });
            }
            router.refresh();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            setShowUploadModal(false);
        }
    }

    return (
        <section style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <button onClick={() => setShowCreateFolder(true)} style={{ padding: '10px 14px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', fontWeight: 800 }}>Create folder</button>
                <button onClick={() => setShowUploadModal(true)} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 800 }}>Upload files</button>
                <div style={{ marginLeft: 'auto' }}>
                    <input placeholder="Search files in this folder or inside..." defaultValue={undefined} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const q = (e.target as HTMLInputElement).value;
                            const params = new URLSearchParams(window.location.search);
                            if (q) params.set('q', q); else params.delete('q');
                            window.location.search = params.toString();
                        }
                    }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 280 }} />
                </div>
            </div>
            {showCreateFolder && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 360 }}>
                        <h3 style={{ marginTop: 0 }}>Create folder</h3>
                        <input id="newFolderName" placeholder="Folder name" style={{ width: '100%', padding: '8px 10px', marginBottom: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowCreateFolder(false)} style={{ padding: '8px 12px' }}>Cancel</button>
                            <button onClick={async () => {
                                const input = document.getElementById('newFolderName') as HTMLInputElement | null;
                                if (!input || !input.value.trim()) return alert('Folder name is required');
                                await submitCreateFolder(input.value.trim());
                                setShowCreateFolder(false);
                            }} style={{ padding: '8px 12px', background: 'var(--color-primary)', color: 'white', borderRadius: 6 }}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 420 }}>
                        <h3 style={{ marginTop: 0 }}>Upload files</h3>
                        <input id="uploadFilesInput" type="file" multiple style={{ width: '100%', marginBottom: 8 }} />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowUploadModal(false)} style={{ padding: '8px 12px' }}>Cancel</button>
                            <button onClick={async () => {
                                const input = document.getElementById('uploadFilesInput') as HTMLInputElement | null;
                                await submitUploadFiles(input?.files || null);
                            }} style={{ padding: '8px 12px', background: 'var(--color-primary)', color: 'white', borderRadius: 6 }}>Upload</button>
                        </div>
                    </div>
                </div>
            )}
            <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>File manager</h2>
                        <p style={{ color: '#64748b', fontSize: '0.86rem' }}>
                            Current folder: <strong>{currentFolderPath}</strong>
                        </p>
                    </div>

                    <label style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, background: 'var(--color-primary)', color: 'white', borderRadius: '8px', padding: '10px 14px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {uploading ? (progress ? `${progress}%` : status || 'Uploading...') : 'Upload here'}
                        <input type="file" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Create folder and upload actions are handled via popups above */}

                {uploading && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                            <span>{status || 'Uploading file...'}</span>
                            <span>{progress ? `${progress}%` : ''}</span>
                        </div>
                        <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress || 12}%`, background: 'var(--color-primary)', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                        </div>
                    </div>
                )}

                {message && (
                    <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '0.86rem', fontWeight: 700 }}>
                        {message}
                    </div>
                )}
                {visibleFolders.length > 0 && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 6 }}>
                        {visibleFolders.map(folder => (
                            <div key={folder.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ width: 56, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6 }}>📁</div>
                                    <div>
                                        <a href={`/manage/files?folder=${folder.id}`} style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none' }}>{folder.name}</a>
                                        <div style={{ color: '#94a3b8', fontSize: '0.86rem' }}>{folder.fullPath}</div>
                                    </div>
                                </div>
                                <div>
                                    <button onClick={() => {
                                        if (!confirm(`Delete folder ${folder.name}? This only deletes empty folders.`)) return;
                                        runAction(async () => deleteMediaFolder(folder.id));
                                    }} style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', borderRadius: '8px', padding: '8px 10px', fontWeight: 800 }}>Delete</button>
                                </div>
                            </div>
                        ))}

                        {folders.length > visibleFolders.length && (
                            <div style={{ padding: 10, textAlign: 'center' }}>
                                <button onClick={() => setFolderPage(p => p + 1)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}>Show more folders</button>
                            </div>
                        )}
                    </div>
                )}
                {media.length > 0 && (
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {media.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 6px', borderBottom: '1px solid #e6eef6' }}>
                                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.originalName}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.86rem' }}>{item.fileName}</div>
                                </div>
                                <div style={{ width: 160, color: '#475569' }}><strong>{item.uploadType}</strong></div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" disabled={isPending} onClick={() => runAction(async () => moveMedia(item.id, null))} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '8px', padding: '8px 10px', fontWeight: 700 }}>Move</button>
                                    <button type="button" disabled={isPending} onClick={() => {
                                        if (confirm(`Delete ${item.originalName}?`)) {
                                            runAction(async () => deleteMedia(item.id));
                                        }
                                    }} style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', borderRadius: '8px', padding: '8px 10px', fontWeight: 700 }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
