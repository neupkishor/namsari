'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadFileWithIntent } from '@/lib/uploader';

export function FilesUploadClient() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
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
                formData,
                onStatusChange: nextStatus => setStatus(nextStatus === 'preparing' ? 'Preparing upload...' : 'Uploading file...'),
                onProgress: setProgress,
            });

            if (!data?.success) {
                throw new Error(data?.message || data?.error || 'Upload failed');
            }

            router.refresh();
        } catch (uploadError) {
            const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload file';
            setError(message);
        } finally {
            setUploading(false);
            setStatus('');
            setProgress(0);
            event.target.value = '';
        }
    };

    return (
        <section style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Upload file</h2>
                    <p style={{ color: '#64748b', fontSize: '0.86rem' }}>Admin upload without client-side compression.</p>
                </div>

                <label style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, background: 'var(--color-primary)', color: 'white', borderRadius: '8px', padding: '10px 14px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {uploading ? (progress ? `${progress}%` : status || 'Uploading...') : 'Choose file'}
                    <input type="file" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
            </div>

            {uploading && (
                <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        <span>{status || 'Uploading file...'}</span>
                        <span>{progress ? `${progress}%` : ''}</span>
                    </div>
                    <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress || 12}%`, background: 'var(--color-primary)', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                    </div>
                </div>
            )}

            {error && (
                <div style={{ marginTop: '12px', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '0.86rem', fontWeight: 700 }}>
                    {error}
                </div>
            )}
        </section>
    );
}
