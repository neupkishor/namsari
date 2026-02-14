import React from 'react';
import ProfileImageUploadClient from './ProfileImageUploadClient';

interface ProfileImageUploadProps {
    userId: number;
    currentImage?: string | null;
    userName: string;
    isOwner: boolean;
}

export default function ProfileImageUpload(props: ProfileImageUploadProps) {
    return (
        <ProfileImageUploadClient {...props} />
    );
}
