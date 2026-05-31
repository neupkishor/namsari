'use client';

import { useState, useEffect } from 'react';
import { createAd, getAdRates } from '@/actions/ads';
import imageCompression from 'browser-image-compression';
import { buildUploaderUrl, resolveUploadedFileUrl } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';

export default function CreateAdForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    
    // New Fields
    const [budget, setBudget] = useState('');
    const [duration, setDuration] = useState('');
    // Position field removed as all ads are global
    
    // Rates
    const [rates, setRates] = useState<any[]>([]);
    
    // Calculations
    const [estimatedViews, setEstimatedViews] = useState(0);
    const [viewsPerDay, setViewsPerDay] = useState(0);

    useEffect(() => {
        async function fetchRates() {
            try {
                const data = await getAdRates();
                setRates(data);
            } catch (err) {
                console.error("Failed to fetch rates", err);
            }
        }
        if (isOpen) fetchRates();
    }, [isOpen]);

    useEffect(() => {
        calculateEstimates();
    }, [budget, duration, rates]);

    function calculateEstimates() {
        // Since all ads are global, we use a single standard rate
        const rate = rates[0]?.price || 0;
        const budgetVal = parseFloat(budget) || 0;
        const durationVal = parseInt(duration) || 0;

        if (rate > 0 && budgetVal > 0) {
            // CPM Calculation: (Budget / Rate) * 1000
            const totalViews = Math.floor((budgetVal / rate) * 1000);
            setEstimatedViews(totalViews);

            if (durationVal > 0) {
                setViewsPerDay(Math.floor(totalViews / durationVal));
            } else {
                setViewsPerDay(0);
            }
        } else {
            setEstimatedViews(0);
            setViewsPerDay(0);
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('platform', 'namsari');

            const res = await fetch(buildUploaderUrl('ads'), {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                const fileUrl = resolveUploadedFileUrl(data.path || data.file, data.url);
                setImageUrl(fileUrl);
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
        }
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            // Add calculated fields to formData if needed by backend, 
            // or backend can parse standard fields.
            // We need to ensure backend handles budget/duration.
            // The createAd action expects FormData.
            
            await createAd(formData);
            setIsOpen(false);
            setImageUrl('');
            setBudget('');
            setDuration('');
            // In a real app, you might want to show a success message or toast
        } catch (error) {
            alert('Failed to create ad');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)} 
                className="btn-primary"
                style={{ marginBottom: '24px' }}
            >
                + Create New Ad
            </button>
        );
    }

    return (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>Create New Advertisement</h3>
            <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ad Title</label>
                    <input name="title" className="form-control" required placeholder="e.g. Summer Sale" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ad Image</label>
                    
                    {imageUrl ? (
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '8px' }}>
                                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setImageUrl('')}
                                className="btn-secondary"
                                style={{ fontSize: '0.85rem', padding: '4px 12px' }}
                            >
                                Remove & Upload Different Image
                            </button>
                        </div>
                    ) : (
                        <div style={{ border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                id="ad-image-upload"
                                disabled={uploading}
                            />
                            <label htmlFor="ad-image-upload" style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'block' }}>
                                {uploading ? (
                                    <span style={{ color: 'var(--color-primary)' }}>Uploading...</span>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🖼️</div>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Click to upload image</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Supports JPG, PNG, WEBP</div>
                                    </>
                                )}
                            </label>
                        </div>
                    )}
                    <input type="hidden" name="image" value={imageUrl} required />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Destination Link</label>
                    <input name="link" className="form-control" placeholder="https://yourwebsite.com" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Budget (NPR)</label>
                        <input 
                            name="budget" 
                            type="number" 
                            className="form-control" 
                            required 
                            placeholder="2000" 
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Duration (Days)</label>
                        <input 
                            name="duration" 
                            type="number" 
                            className="form-control" 
                            required 
                            placeholder="10" 
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                {/* Estimate Card */}
                <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0369a1', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Estimated Reach
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>
                                ~{estimatedViews.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>Total Views</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0369a1' }}>
                                ~{viewsPerDay.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>Views per Day</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button 
                        type="button" 
                        onClick={() => setIsOpen(false)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading || uploading || !imageUrl}
                        style={{ opacity: (loading || uploading || !imageUrl) ? 0.7 : 1 }}
                    >
                        {loading ? 'Submitting...' : 'Submit for Approval'}
                    </button>
                </div>
            </form>
        </div>
    );
}
