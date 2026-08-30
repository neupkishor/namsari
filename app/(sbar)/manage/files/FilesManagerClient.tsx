'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMedia } from '@/actions/media';
import { getMedia, uploadFileWithIntent } from '@/lib/uploader';

type MediaItem = {
    id: number;
    path: string;
    originalName: string;
    uploadFor: string;
};

type FilesManagerClientProps = {
    media: MediaItem[];
    searchQuery?: string;
};

export function FilesManagerClient({ media }: FilesManagerClientProps) {
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const [selectedUploadFiles, setSelectedUploadFiles] = React.useState<File[]>([]);
    const [uploadLabel, setUploadLabel] = React.useState('');
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const runAction = (action: () => Promise<void>) => {
        setMessage('');
        startTransition(async () => {
            try {
                await action();
                router.refresh();
            } catch (error) {
                setMessage(error instanceof Error ? error.message : 'File operation failed');
            }
        });
    };

    async function submitUploadFiles(files: File[]) {
        if (!files.length) return;
        setUploading(true);
        setMessage('');
        setStatus('Preparing upload...');
        setProgress(0);
        try {
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                setUploadLabel(f.name);
                await uploadFileWithIntent({
                    type: 'files',
                    file: f,
                    originalFile: f,
                    onStatusChange: nextStatus => setStatus(nextStatus === 'preparing' ? 'Preparing upload...' : 'Uploading files...'),
                    onProgress: nextProgress => {
                        const overall = Math.min(100, Math.round(((i + (nextProgress / 100)) / files.length) * 100));
                        setProgress(overall);
                    },
                });
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }
            router.refresh();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            setShowUploadModal(false);
            setSelectedUploadFiles([]);
            setUploadLabel('');
            setStatus('');
            setProgress(0);
        }
    }

    return (
        <section style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <button onClick={() => setShowUploadModal(true)} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 800 }}>Upload files</button>
                <div style={{ marginLeft: 'auto' }}>
                    <input placeholder="Search uploaded files..." defaultValue={undefined} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const q = (e.target as HTMLInputElement).value;
                            const params = new URLSearchParams(window.location.search);
                            if (q) params.set('q', q); else params.delete('q');
                            window.location.search = params.toString();
                        }
                    }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 280 }} />
                </div>
            </div>

            {showUploadModal && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 60 }}>
                    <div style={{ background: 'white', padding: 20, borderRadius: 10, minWidth: 460, maxWidth: '92vw', boxShadow: '0 10px 30px rgba(2,6,23,0.4)' }}>
                        <h3 style={{ marginTop: 0 }}>Upload files</h3>
                        <p style={{ marginTop: -4, marginBottom: 12, color: '#64748b', fontSize: '0.9rem' }}>Select one or more files. They will upload one by one and the progress bar will reflect the total upload.</p>
                        <input
                            id="uploadFilesInput"
                            type="file"
                            multiple
                            onChange={event => setSelectedUploadFiles(Array.from(event.target.files || []))}
                            style={{ width: '100%', marginBottom: 12 }}
                        />

                        <div style={{ border: '1px dashed #cbd5e1', borderRadius: 10, background: '#f8fafc', padding: 12, marginBottom: 12 }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                                {selectedUploadFiles.length > 0 ? `${selectedUploadFiles.length} file${selectedUploadFiles.length === 1 ? '' : 's'} selected` : 'No files selected'}
                            </div>
                            {selectedUploadFiles.length > 0 ? (
                                <div style={{ display: 'grid', gap: 8, maxHeight: 220, overflow: 'auto' }}>
                                    {selectedUploadFiles.map(file => (
                                        <div key={`${file.name}-${file.size}-${file.lastModified}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{Math.max(1, Math.round(file.size / 1024))} KB</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedUploadFiles(prev => prev.filter(item => !(item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)))}
                                                style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', borderRadius: 8, padding: '6px 10px', fontWeight: 700 }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Choose files to see them listed here.</div>
                            )}
                        </div>

                        {uploading && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                                    <span>{status || 'Uploading files...'}</span>
                                    <span>{progress ? `${progress}%` : ''}</span>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress || 12}%`, background: 'var(--color-primary)', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                                </div>
                                <div style={{ marginTop: 6, color: '#64748b', fontSize: '0.82rem' }}>{uploadLabel || 'Preparing...'}</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => { setShowUploadModal(false); setSelectedUploadFiles([]); }} style={{ padding: '8px 12px' }} disabled={uploading}>Cancel</button>
                            <button
                                onClick={async () => {
                                    await submitUploadFiles(selectedUploadFiles);
                                }}
                                disabled={uploading || selectedUploadFiles.length === 0}
                                style={{ padding: '8px 12px', background: 'var(--color-primary)', color: 'white', borderRadius: 6, opacity: uploading || selectedUploadFiles.length === 0 ? 0.65 : 1 }}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>File manager</h2>
                        <p style={{ color: '#64748b', fontSize: '0.86rem' }}>
                            Files are served from <strong>https://namsari.com/media/</strong>.
                        </p>
                    </div>

                </div>

                {message && (
                    <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '0.86rem', fontWeight: 700 }}>
                        {message}
                    </div>
                )}
                {media.length > 0 && (
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {media.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 6px', borderBottom: '1px solid #e6eef6' }}>
                                <img src={getMedia(item.path)} alt={item.originalName} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.originalName}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.86rem' }}>{item.originalName}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.path}</div>
                                </div>
                                <div style={{ width: 160, color: '#475569' }}><strong>{item.uploadFor}</strong></div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <a href={getMedia(item.path)} target="_blank" rel="noreferrer" style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '8px', padding: '8px 10px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>View</a>
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
                {media.length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No uploaded files matched this view.</div>
                )}
            </div>
        </section>
    );
}
