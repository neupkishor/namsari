'use client';

import React, { useState, useTransition } from 'react';
import { createAdvertisement, toggleAdvertisementStatus, deleteAdvertisement } from '@/actions/advertisements';
import imageCompression from 'browser-image-compression';
import { resolveUploadedFileUrl, uploadFileWithIntent } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';

export default function AdvertisementManager({ initialAds }: { initialAds: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [image, setImage] = useState('');
    const [takesTo, setTakesTo] = useState('');
    const [postedBy, setPostedBy] = useState('');
    const [showsOnTop, setShowsOnTop] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setUploadStatus('Processing image...');
            setUploadProgress(0);
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('platform', 'namsari');

            const data = await uploadFileWithIntent({
                type: 'ads',
                file: compressedFile,
                originalFile: file,
                formData,
                onStatusChange: status => setUploadStatus(status === 'preparing' ? 'Preparing secure upload...' : 'Uploading image...'),
                onProgress: setUploadProgress,
            });

            if (data.success) {
                const fileUrl = resolveUploadedFileUrl(data.path || data.file, data.url);
                setImage(fileUrl);
            } else {
                logUploadError(new Error(data.message || 'Upload failed'), {
                    fileName: file.name,
                    uploadType: 'ads',
                    response: data
                });
                alert('Upload failed: ' + (data.message || 'unknown'));
            }
        } catch (err) {
            console.error(err);
            logUploadError(err, {
                fileName: file.name,
                uploadType: 'ads'
            });
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            setUploadStatus('');
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('image', image);
        formData.append('takes_to', takesTo);
        formData.append('posted_by', postedBy);
        formData.append('shows_on_top', String(showsOnTop));

        startTransition(async () => {
            const res = await createAdvertisement(formData);
            if (res.error) {
                alert(res.error);
                return;
            }

            setImage('');
            setTakesTo('');
            setPostedBy('');
            setShowsOnTop(false);
            setShowForm(false);
        });
    };

    const handleToggle = (id: number) => {
        startTransition(async () => {
            await toggleAdvertisementStatus(id);
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this advertisement?')) return;

        startTransition(async () => {
            await deleteAdvertisement(id);
        });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Advertisements</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage sponsored content and banners.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancel' : 'Add Advertisement'}
                </button>
            </header>

            {showForm && (
                <div className="card" style={{ marginBottom: '32px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Ad Image</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {image ? (
                                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        Preview
                                    </div>
                                )}

                                <label
                                    style={{
                                        background: uploading ? '#f1f5f9' : 'white',
                                        border: '1px solid #e2e8f0',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    {uploading ? `${uploadStatus || 'Uploading image...'} ${uploadProgress ? `${uploadProgress}%` : ''}` : 'Upload Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                </label>
                                {uploading && (
                                    <div style={{ width: '160px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${uploadProgress || 12}%`, background: 'var(--color-primary)', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Takes To (Redirect URL)</label>
                            <input
                                type="url"
                                value={takesTo}
                                onChange={(e) => setTakesTo(e.target.value)}
                                className="form-control"
                                placeholder="https://example.com/promo"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Posted By (Advertiser Name)</label>
                            <input
                                type="text"
                                value={postedBy}
                                onChange={(e) => setPostedBy(e.target.value)}
                                className="form-control"
                                placeholder="e.g. Coca Cola"
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="showsOnTop"
                                checked={showsOnTop}
                                onChange={(e) => setShowsOnTop(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label htmlFor="showsOnTop" style={{ fontWeight: '600', cursor: 'pointer' }}>Show on Top (Carousel)</label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '-8px', marginLeft: '26px' }}>
                            If checked, this ad will appear in the top carousel and the feed. Otherwise, it will only be injected into the feed.
                        </p>

                        <button
                            type="submit"
                            disabled={isPending || uploading || !image}
                            className="btn-primary"
                            style={{ width: 'fit-content', marginTop: '8px' }}
                        >
                            {isPending ? 'Creating...' : 'Create Advertisement'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {initialAds.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        No advertisements found.
                    </div>
                ) : (
                    initialAds.map((ad) => (
                        <div key={ad.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f8fafc' }}>
                                <img src={ad.image} alt="Ad preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span
                                        style={{
                                            background: (ad.position === 'banner_top' || ad.shows_on_top) ? '#dbeafe' : '#f1f5f9',
                                            color: (ad.position === 'banner_top' || ad.shows_on_top) ? '#1e40af' : '#475569',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {(ad.position === 'banner_top' || ad.shows_on_top) ? 'Top Carousel' : 'Feed'}
                                    </span>
                                    <span
                                        style={{
                                            background: (ad.status === 'active' || ad.is_active) ? '#dcfce7' : '#fee2e2',
                                            color: (ad.status === 'active' || ad.is_active) ? '#166534' : '#991b1b',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {(ad.status === 'active' || ad.is_active) ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
                                    {ad.title || ad.posted_by || 'Unknown Advertiser'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', wordBreak: 'break-all', marginTop: '2px' }}>
                                    Link: <a href={ad.link || ad.takes_to} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{ad.link || ad.takes_to || 'None'}</a>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                                    Created on {new Date(ad.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleToggle(ad.id)}
                                    disabled={isPending}
                                    style={{ background: 'none', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }}
                                    title={(ad.status === 'active' || ad.is_active) ? 'Deactivate' : 'Activate'}
                                >
                                    {(ad.status === 'active' || ad.is_active) ? '⏸️' : '▶️'}
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    disabled={isPending}
                                    style={{ background: 'none', border: '1px solid #fee2e2', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
