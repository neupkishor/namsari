'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { updateUserProfilePicture } from '@/actions/profile-client';
import { useRouter } from 'next/navigation';
import { resolveUploadedFileUrl, uploadFileWithIntent } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';

interface ProfileImageUploadProps {
    userId: number;
    currentImage?: string | null;
    userName: string;
    isOwner: boolean;
    shape?: string;
}

export default function ProfileImageUploadClient({ userId, currentImage, userName, isOwner, shape = '50%' }: ProfileImageUploadProps) {
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
            const data = await uploadFileWithIntent({ type: 'users', file, formData });

            if (data.success) {
                const fileUrl = resolveUploadedFileUrl(data.path || data.file, data.url);
                await updateUserProfilePicture(userId, fileUrl);
                router.refresh();
            } else {
                logUploadError(new Error(data.message || 'Upload failed'), {
                    fileName: originalFile.name,
                    uploadType: 'users',
                    imageType: 'profile',
                    userId,
                    response: data
                });
                alert('Upload failed: ' + (data.message || 'unknown'));
            }
        } catch (err) {
            console.error(err);
            logUploadError(err, {
                fileName: originalFile.name,
                uploadType: 'users',
                imageType: 'profile',
                userId
            });
            alert('Failed to upload image');
        } finally {
            setCompressing(false);
            setUploading(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{
                width: '100%',
                height: '100%',
                borderRadius: shape,
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '4rem',
                fontWeight: 'bold',
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
                    right: '-6px',
                    bottom: '-6px',
                    background: 'white',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    fontSize: '1.2rem',
                    zIndex: 2
                }}>
                    <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading || compressing} accept="image/*" />
                    📷
                </label>
            )}
        </div>
    );
}
