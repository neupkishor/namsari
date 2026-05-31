'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import { updateUserCoverImage } from '@/actions/profile-client';
import { buildUploaderUrl, resolveUploadedFileUrl } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';

interface ProfileCoverUploadButtonProps {
    userId: number;
}

export default function ProfileCoverUploadButton({ userId }: ProfileCoverUploadButtonProps) {
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        setCompressing(true);

        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true };
            const compressedBlob = await imageCompression(originalFile, options);
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            const res = await fetch(buildUploaderUrl('users'), {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                const fileUrl = resolveUploadedFileUrl(data.path, data.url);
                await updateUserCoverImage(userId, fileUrl);
                router.refresh();
            } else {
                logUploadError(new Error(data.message || 'Upload failed'), {
                    fileName: originalFile.name,
                    uploadType: 'users',
                    imageType: 'cover',
                    userId,
                    response: data
                });
                alert('Upload failed: ' + (data.message || 'unknown'));
            }
        } catch (error) {
            console.error(error);
            logUploadError(error, {
                fileName: originalFile.name,
                uploadType: 'users',
                imageType: 'cover',
                userId
            });
            alert('Failed to upload cover image');
        } finally {
            setCompressing(false);
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <label style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: uploading || compressing ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: uploading || compressing ? 0.7 : 1,
        }}>
            <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleUpload}
                disabled={uploading || compressing}
                accept="image/*"
            />
            <span>📷</span>
            <span>{compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Edit Cover'}</span>
        </label>
    );
}
