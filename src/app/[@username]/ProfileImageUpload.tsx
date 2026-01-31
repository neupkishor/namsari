'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { updateUserProfilePicture } from './actions';
import { useRouter } from 'next/navigation';

interface ProfileImageUploadProps {
    userId: number;
    currentImage?: string | null;
    userName: string;
    isOwner: boolean;
}

export default function ProfileImageUpload({ userId, currentImage, userName, isOwner }: ProfileImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        setCompressing(true);
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
            const compressedBlob = await imageCompression(originalFile, options);
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            const res = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                await updateUserProfilePicture(userId, data.url);
                router.refresh();
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setCompressing(false);
            setUploading(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '168px', height: '168px' }}>
            <div style={{
                width: '168px',
                height: '168px',
                borderRadius: '50%',
                border: '6px solid white',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '4rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {currentImage ? (
                    <img src={currentImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={userName} />
                ) : (
                    (userName || 'U')[0]
                )}

                {(uploading || compressing) && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        padding: '10px'
                    }}>
                        {compressing ? '⌛...' : '⬆️...'}
                    </div>
                )}
            </div>

            {isOwner && (
                <label style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    fontSize: '1.2rem'
                }}>
                    <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading || compressing} accept="image/*" />
                    📷
                </label>
            )}
        </div>
    );
}
