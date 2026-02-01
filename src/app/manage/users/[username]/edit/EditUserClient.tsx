'use client';

import React, { useState } from 'react';
import { updateUser } from './actions';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';

interface EditUserClientProps {
    user: any;
}

export default function EditUserClient({ user }: EditUserClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    // State for image previews
    const [profilePic, setProfilePic] = useState(user.profile_picture || '');
    const [coverImg, setCoverImg] = useState(user.cover_image || '');
    const [status, setStatus] = useState(user.status || 'active');

    const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
        try {
            if (type === 'profile') setUploadingProfile(true);
            else setUploadingCover(true);

            const options = { maxSizeMB: 0.5, maxWidthOrHeight: type === 'profile' ? 400 : 1200, useWebWorker: true };
            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('platform', 'namsari');

            const res = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                if (type === 'profile') setProfilePic(data.url);
                else setCoverImg(data.url);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            if (type === 'profile') setUploadingProfile(false);
            else setUploadingCover(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        if (profilePic) formData.append('profile_picture', profilePic);
        if (coverImg) formData.append('cover_image', coverImg);

        const res = await updateUser(user.username, formData);
        setLoading(false);

        if (res.success) {
            router.push(`/manage/users/${user.username}`);
            router.refresh();
        } else {
            alert(res.message);
        }
    };

    return (
        <form action={handleSubmit} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Cover Image Section */}
            <div style={{ position: 'relative', height: '160px', background: '#f1f5f9' }}>
                {coverImg ? (
                    <img src={coverImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 'bold' }}>
                        No Cover Image
                    </div>
                )}
                <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                    <input
                        type="file"
                        id="cover-upload"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                    />
                    <label htmlFor="cover-upload" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                        {uploadingCover ? 'Uploading...' : 'Change Cover'}
                    </label>
                </div>
            </div>

            <div style={{ padding: '0 32px 32px', marginTop: '-40px' }}>
                {/* Profile Picture Section */}
                <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {profilePic ? (
                            <img src={profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#cbd5e1', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                {(user.name?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px' }}>
                        <input
                            type="file"
                            id="profile-upload"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                        />
                        <label htmlFor="profile-upload" style={{ background: 'var(--color-primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {uploadingProfile ? '...' : '✎'}
                        </label>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>Account Name</label>
                        <input name="name" defaultValue={user.name} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>Email Address</label>
                        <input name="email" type="email" defaultValue={user.email || ''} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="No email set" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>Phone Number</label>
                        <input name="contact_number" defaultValue={user.contact_number || ''} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="No phone set" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--color-text-primary, #1e293b)', fontSize: '0.9rem' }}>Account Status</label>
                        <input type="hidden" name="status" value={status} />
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {['active', 'warned', 'suspended', 'banned'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    style={{
                                        flex: '1 0 200px', // Allow wrapping
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: status === s ? '2px solid var(--color-primary)' : '1px solid #cbd5e1',
                                        background: status === s ? '#eff6ff' : 'white',
                                        color: status === s ? 'var(--color-primary)' : '#64748b',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {status === s && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                                    )}
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>New Password</label>
                        <input name="password" type="password" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Leave blank to keep current" />
                    </div>
                </div>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button type="button" onClick={() => router.back()} disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
    );
}
