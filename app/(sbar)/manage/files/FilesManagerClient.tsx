'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMediaFolder, deleteMedia, moveMedia, renameMedia } from '@/actions/media';
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
};

function folderUploadPath(fullPath: string) {
    return fullPath.replace(/^files\/?/, '');
}

export function FilesManagerClient({ currentFolderId, currentFolderPath, folders, media }: FilesManagerClientProps) {
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

    return (
        <section style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', marginBottom: '24px' }}>
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

                <form
                    action={async formData => {
                        runAction(async () => createMediaFolder(formData));
                    }}
                    style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                >
                    <input type="hidden" name="parentId" value={currentFolderId || ''} />
                    <input name="name" placeholder="New folder name" style={{ minWidth: '220px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px' }} />
                    <button type="submit" disabled={isPending} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '8px', padding: '10px 14px', fontWeight: 800, cursor: isPending ? 'not-allowed' : 'pointer' }}>
                        Create folder
                    </button>
                </form>

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

                {media.length > 0 && (
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {media.map(item => (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 180px auto auto', gap: '8px', alignItems: 'center' }}>
                                <input
                                    aria-label={`Rename ${item.originalName}`}
                                    defaultValue={item.fileName}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            runAction(async () => renameMedia(item.id, event.currentTarget.value));
                                        }
                                    }}
                                    style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 10px', minWidth: 0 }}
                                />
                                <select
                                    aria-label={`Move ${item.originalName}`}
                                    defaultValue={item.folderId || ''}
                                    onChange={event => {
                                        const nextFolderId = event.target.value ? Number(event.target.value) : null;
                                        runAction(async () => moveMedia(item.id, nextFolderId));
                                    }}
                                    style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 10px', minWidth: 0 }}
                                >
                                    <option value="">files</option>
                                    {folders.map(folder => (
                                        <option key={folder.id} value={folder.id}>{folder.fullPath}</option>
                                    ))}
                                </select>
                                <button type="button" disabled={isPending} onClick={event => {
                                    const row = event.currentTarget.parentElement;
                                    const input = row?.querySelector('input');
                                    runAction(async () => renameMedia(item.id, input?.value || item.fileName));
                                }} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '8px', padding: '9px 10px', fontWeight: 800, cursor: isPending ? 'not-allowed' : 'pointer' }}>
                                    Rename
                                </button>
                                <button type="button" disabled={isPending} onClick={() => {
                                    if (confirm(`Delete ${item.originalName}?`)) {
                                        runAction(async () => deleteMedia(item.id));
                                    }
                                }} style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', borderRadius: '8px', padding: '9px 10px', fontWeight: 800, cursor: isPending ? 'not-allowed' : 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
